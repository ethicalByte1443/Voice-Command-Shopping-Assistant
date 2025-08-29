from fastapi import FastAPI, UploadFile, File
import assemblyai as aai
import tempfile
import os
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import json
import requests
from helper_function import validate_llm_response, find_closest_product
import datetime
from db import user_collection
from db import store_collection
from sentence_transformers import SentenceTransformer
import faiss
from rapidfuzz import fuzz, process

# =================== ML EMBEDDINGS ===================
embedder = SentenceTransformer("all-MiniLM-L6-v2")

def build_store_index():
    store_products = list(store_collection.find({}, {"_id": 0, "product": 1, "category": 1, "price": 1}))
    if not store_products:
        return None, []

    product_texts = [p["product"] for p in store_products]
    vectors = embedder.encode(product_texts, convert_to_numpy=True)

    dim = vectors.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(vectors)

    return index, store_products

faiss_index, store_products = build_store_index()


# ======================= GROQ API ======================
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
def process_command(user_text: str):
    """
    Takes a shopping voice command as text and returns structured JSON
    with product, quantity, category, action, status.
    """

    prompt = f"""
You are AI working as a store assistant. 
Parse the following user command into a JSON object with these exact fields:
If u  find the command irrelevent and found no information from that so just put a error message in all the key of json


- product: name of the item (string)
- quantity: number (default = 1 if not mentioned)
- category: guess item category (e.g., dairy, fruit, drinks, snacks, grains)
- action: one of ["add", "remove", "delete"]
- status: always "ai_generated"

User command: "{user_text}"

Return only valid JSON, no explanation.
"""

    try:
        response = requests.post(
            GROQ_API_URL,
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "llama-3.3-70b-versatile",  # ✅ Groq recommended model
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.2
            }
        )

        result = response.json()

        if "choices" not in result or not result["choices"]:
            return {"error": "Unexpected response from Groq", "raw": result}

        content = result["choices"][0]["message"]["content"].strip()

        # Extract JSON portion only
        json_start = content.find("{")
        json_end = content.rfind("}") + 1
        if json_start != -1 and json_end != -1:
            return json.loads(content[json_start:json_end])

        return {"error": "Could not parse JSON", "raw": content}

    except Exception as e:
        return {"error": str(e)}
    


# ======================= ASSEMBLY AI ===================
# Load API Key (replace with your key or use dotenv)
ASSEMBLYAI_API_KEY = os.getenv("ASSEMBLYAI_API_KEY")

aai.settings.api_key = ASSEMBLYAI_API_KEY




# ===================== APP START =======================
app = FastAPI()

# Enable CORS for frontend testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/recognise_text_to_llm")
async def recognise_text_to_llm(file: UploadFile = File(...)):
    try:
        print("/recognise_text_to_llm initiated")
        # Save audio temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_file:
            temp_file.write(await file.read())
            temp_path = temp_file.name

        # AssemblyAI transcription (English only)
        transcriber = aai.Transcriber()
        transcript = transcriber.transcribe(
            temp_path,
            config=aai.TranscriptionConfig(language_code="en")
        )

        if transcript.status == aai.TranscriptStatus.error:
            return {"error": transcript.error}

        print(transcript.text)
        llm_response = process_command(transcript.text)
        print(llm_response)
        if validate_llm_response(llm_response):
            # ✅ send to frontend for confirmation
            return {
                "recognized_text": transcript.text,
                "llm_response": llm_response
            }
        else:
            return {"error": "Invalid AI response"}

    except Exception as e:
        return {"error": str(e)}
    



def update_wishlist(username: str, llm_response: dict):
    try:
        if not validate_llm_response(llm_response):
            return {"error": "Invalid LLM response"}

        llm_response["timestamp"] = datetime.datetime.utcnow().isoformat()
        action = llm_response["action"].lower()

        # ======================= ADD =======================
        if action == "add":
            # 🔎 Step 1: Check product in store
            store_item = store_collection.find_one(
                {"product": {"$regex": f"^{llm_response['product']}$", "$options": "i"}}
            )

            if not store_item:
                return {"error": f"No item '{llm_response['product']}' found in store"}

            store_quantity = store_item.get("quantity", 0)
            requested_quantity = int(llm_response.get("quantity", 1))

            # 🔎 Step 2: Validate stock
            if requested_quantity > store_quantity:
                return {
                    "error": f"Only {store_quantity} × {store_item['product']} available in store"
                }

            # ✅ Step 3: Add to wishlist + history
            user_collection.update_one(
                {"username": username},
                {
                    "$push": {
                        "wishlist": {
                            "product": store_item["product"],  # consistent name
                            "quantity": requested_quantity,
                            "category": store_item.get("category", llm_response["category"]),
                            "action": "add",
                            "status": llm_response["status"],
                            "timestamp": llm_response["timestamp"]
                        }
                    },
                    "$push": {"historylist": llm_response}
                },
                upsert=True
            )

            return {"message": "Product added to wishlist", "data": llm_response}

        # =================== REMOVE / DELETE ==================
        elif action in ["remove", "delete"]:
            user = user_collection.find_one({"username": username})
            if not user or "wishlist" not in user:
                return {"error": "No wishlist found"}

            wishlist = user.get("wishlist", [])
            closest = find_closest_product(llm_response["product"], wishlist)

            if not closest:
                return {"error": f"No matching product found for '{llm_response['product']}'"}

            # ✅ Remove matched product and add to history
            user_collection.update_one(
                {"username": username},
                {
                    "$pull": {"wishlist": {"product": closest["product"]}},
                    "$push": {"historylist": llm_response}
                }
            )
            return {
                "message": f"Product '{closest['product']}' removed from wishlist",
                "data": llm_response
            }

        # =================== UNKNOWN ==================
        else:
            return {"error": f"Unsupported action: {llm_response['action']}"}

    except Exception as e:
        return {"error": str(e)}

    

@app.post("/update_wishlist/{username}")
async def update_wishlist_route(username: str, llm_response: dict):
    """
    Confirmed action from frontend → update MongoDB wishlist/history.
    """
    result = update_wishlist(username, llm_response)
    return result


@app.get("/wishlist/{username}")
async def get_wishlist(username: str):
    try:
        user = user_collection.find_one({"username": username}, {"_id": 0, "wishlist": 1})
        if not user:
            return {"wishlist": []}  # empty if user not found
        return {"wishlist": user.get("wishlist", [])}
    except Exception as e:
        return {"error": str(e)}


@app.get("/recommendations/{username}")
def get_recommendations(username: str):
    user = user_collection.find_one({"username": username}, {"wishlist": 1})
    if not user or "wishlist" not in user:
        return {"recommendations": [], "note": "No wishlist found"}

    wishlist = user["wishlist"]
    if not wishlist:
        return {"recommendations": [], "note": "Wishlist empty"}

    wishlist_products = [item["product"] for item in wishlist]
    wishlist_text = " ".join(wishlist_products)

    query_vector = embedder.encode([wishlist_text], convert_to_numpy=True)

    distances, indices = faiss_index.search(query_vector, k=10)

    recs = []
    for idx in indices[0]:
        candidate = store_products[idx]
        if candidate["product"] not in wishlist_products:
            recs.append(candidate)

    return {"recommendations": recs[:5]}
