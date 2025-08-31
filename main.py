from fastapi import FastAPI, UploadFile, File
import assemblyai as aai
import tempfile
import os
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from helper_function import validate_llm_response
from db import user_collection
from db import store_collection
from sentence_transformers import SentenceTransformer
import faiss
from rapidfuzz import fuzz, process
import numpy as np
from helper_function import update_wishlist, normalize_user_text
from prompt import process_command



# ===================== LOAD CREDENTIALS =======================
load_dotenv()


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





# ======================= ASSEMBLY AI ===================

ASSEMBLYAI_API_KEY = os.getenv("ASSEMBLYAI_API_KEY")
aai.settings.api_key = ASSEMBLYAI_API_KEY



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

        print("Original transcript:", transcript.text)

        # ✅ NLP step: normalize/understand varied user phrasing
        normalized_text = normalize_user_text(transcript.text)
        print("Normalized text:", normalized_text)

        # Process through your existing LLM logic
        llm_response = process_command(normalized_text)
        print("LLM response:", llm_response)

        if validate_llm_response(llm_response):
            # ✅ send to frontend for confirmation
            return {
                "recognized_text": transcript.text,
                "normalized_text": normalized_text,
                "llm_response": llm_response
            }
        else:
            return {"error": "Invalid AI response"}

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


# =================================================================================================
store_products = list(store_collection.find({}, {"_id": 0}))

# Encode all store product names
store_embeddings = embedder.encode([p["product"] for p in store_products], convert_to_numpy=True)

# Create FAISS index
d = store_embeddings.shape[1]  # embedding dimension
faiss_index = faiss.IndexFlatL2(d)
faiss_index.add(np.array(store_embeddings))
# ================================================================================================


@app.get("/recommendations/{username}")
def get_recommendations(username: str):
    user = user_collection.find_one({"username": username}, {"wishlist": 1})
    if not user or "wishlist" not in user:
        return {"recommendations": [], "note": "No wishlist found"}

    wishlist = user["wishlist"]
    if not wishlist:
        return {"recommendations": [], "note": "Wishlist empty"}

    wishlist_products = [item["product"].lower() for item in wishlist]
    wishlist_categories = {item.get("category", "").lower() for item in wishlist}

    # Embed wishlist items
    wishlist_vectors = embedder.encode(wishlist_products, convert_to_numpy=True)

    rec_candidates = {}

    for vec in wishlist_vectors:
        distances, indices = faiss_index.search(vec.reshape(1, -1), k=20)  # fetch more candidates
        for idx, dist in zip(indices[0], distances[0]):
            if idx == -1:
                continue

            candidate = store_products[idx]

            # Skip if already in wishlist
            if candidate["product"].lower() in wishlist_products:
                continue

            # Skip out of stock
            if candidate.get("quantity", 0) <= 0:
                continue

            score = float(dist)

            # Boost same category
            if candidate.get("category", "").lower() in wishlist_categories:
                score *= 0.8
            else:
                score *= 1.2

            prod_key = candidate["product"].lower()
            if prod_key not in rec_candidates or score < rec_candidates[prod_key]["score"]:
                rec_candidates[prod_key] = {"item": candidate, "score": score}

    # Sort by score
    recs = sorted(rec_candidates.values(), key=lambda x: x["score"])
    sorted_items = [r["item"] for r in recs]

    # Hybrid strategy
    final_recs = []

    # Top 2 from same category
    for r in sorted_items:
        if r["category"].lower() in wishlist_categories:
            final_recs.append(r)
        if len(final_recs) >= 2:
            break

    # Top 2 from related categories
    for r in sorted_items:
        if r not in final_recs and r["category"].lower() not in wishlist_categories:
            final_recs.append(r)
        if len(final_recs) >= 4:
            break

    # 1 surprise item
    for r in sorted_items:
        if r not in final_recs:
            final_recs.append(r)
            break

    # 🔧 Fill up to 10 if fewer than 10
    for r in sorted_items:
        if r not in final_recs:
            final_recs.append(r)
        if len(final_recs) >= 10:
            break

    # Fallback
    if not final_recs:
        final_recs = store_products[:10]

    return {"recommendations": final_recs[:10]}


