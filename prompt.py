import os
import requests
from dotenv import load_dotenv
import json


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
