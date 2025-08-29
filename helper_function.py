from rapidfuzz import fuzz, process

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


def find_closest_product(product_name, wishlist):
    """
    Finds the closest matching product name from wishlist using fuzzy matching.
    Returns the matched product dict or None.
    """
    if not wishlist:
        return None

    products = [item["product"] for item in wishlist]
    # Get best match with similarity score
    match, score, idx = process.extractOne(
        product_name.lower(),
        [p.lower() for p in products],
        scorer=fuzz.ratio
    )
    if score >= 70:  # threshold can be tuned
        return wishlist[idx]
    return None