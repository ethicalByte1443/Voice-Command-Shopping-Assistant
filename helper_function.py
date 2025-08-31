from rapidfuzz import fuzz, process
from db import user_collection, store_collection
import datetime
from difflib import get_close_matches
import re
# helper_functions.py

def validate_llm_response(llm_response: dict) -> bool:
    """
    Validate LLM shopping assistant response.
    Ensures required keys exist and no error field is present.
    Returns True if valid, False otherwise.
    """

    required_keys = ["product", "quantity", "category", "action", "status"]

    # If API returned error
    if not isinstance(llm_response, dict):
        return False

    if "error" in llm_response:
        return False

    # Check all required keys
    for key in required_keys:
        if key not in llm_response:
            return False

    # Extra check: quantity should be integer-like
    try:
        int(llm_response["quantity"])
    except (ValueError, TypeError):
        return False

    return True


def find_closest_product(query: str, items: list, key: str = "product"):
    """Find the closest matching product by fuzzy string match."""
    product_names = [item[key] for item in items if key in item]
    matches = get_close_matches(query.lower(), [p.lower() for p in product_names], n=1, cutoff=0.6)
    if matches:
        for item in items:
            if item[key].lower() == matches[0]:
                return item
    return None


def update_wishlist(username: str, llm_response: dict): 
    try:
        if not validate_llm_response(llm_response):
            return {"error": "Invalid LLM response"}

        llm_response["timestamp"] = datetime.datetime.utcnow().isoformat()
        action = llm_response["action"].lower()

        # ======================= ADD =======================
        if action == "add":
            # 🔎 Step 1: Try fuzzy search in store collection
            store_products = list(store_collection.find({}, {"_id": 0, "product": 1, "category": 1, "quantity": 1}))
            store_item = find_closest_product(llm_response["product"], store_products, key="product")

            if not store_item:
                return {"error": f"No similar item found in store for '{llm_response['product']}'"}

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
                            "product": store_item["product"],  # use official name
                            "quantity": requested_quantity,
                            "category": store_item.get("category", llm_response.get("category", "unknown")),
                            "action": "add",
                            "status": llm_response["status"],
                            "timestamp": llm_response["timestamp"]
                        }
                    }
                },
                upsert=True
            )

            return {"message": f"Product '{store_item['product']}' added to wishlist", "data": llm_response}

        # =================== REMOVE / DELETE ==================
        elif action in ["remove", "delete"]:
            user = user_collection.find_one({"username": username})
            if not user or "wishlist" not in user:
                return {"error": "No wishlist found"}

            wishlist = user.get("wishlist", [])
            closest = find_closest_product(llm_response["product"], wishlist)

            if not closest:
                return {"error": f"No matching product found in wishlist for '{llm_response['product']}'"}

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
    

# --- New helper: Normalize text for flexible user phrases ---
def normalize_user_text(text: str) -> str:

    """
    Basic NLP normalization: lowercasing, intent recognition,
    and mapping different phrasings to a standard format.
    """
    text = text.lower().strip()

    # Simple replacements for shopping list intent
    patterns = [
        (r"(i want to buy|add|put|include)\s+(.*)", r"add \2 to list"),
        (r"(remove|delete|take out)\s+(.*)", r"remove \2 from list"),
        (r"(show|display|what's in|list items)", r"show my list"),
    ]

    for pattern, replacement in patterns:
        if re.search(pattern, text):
            return re.sub(pattern, replacement, text)

    # fallback: return as is
    return text


