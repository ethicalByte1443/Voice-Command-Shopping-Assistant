from db import store_collection

# products = [
#     # Dairy
#     {"product": "Paneer", "category": "dairy", "price": 150, "quantity": 70},
#     {"product": "Cream", "category": "dairy", "price": 90, "quantity": 50},
#     {"product": "Ghee", "category": "dairy", "price": 500, "quantity": 40},
#     {"product": "Condensed Milk", "category": "dairy", "price": 60, "quantity": 100},
#     {"product": "Kefir", "category": "dairy", "price": 110, "quantity": 60},

#     # Fruits
#     {"product": "Pineapple", "category": "fruit", "price": 120, "quantity": 90},
#     {"product": "Grapes", "category": "fruit", "price": 140, "quantity": 100},
#     {"product": "Papaya", "category": "fruit", "price": 80, "quantity": 70},
#     {"product": "Guava", "category": "fruit", "price": 60, "quantity": 130},
#     {"product": "Strawberry", "category": "fruit", "price": 200, "quantity": 50},

#     # Drinks
#     {"product": "Green Tea", "category": "drinks", "price": 150, "quantity": 60},
#     {"product": "Coffee", "category": "drinks", "price": 250, "quantity": 80},
#     {"product": "Lemonade", "category": "drinks", "price": 70, "quantity": 120},
#     {"product": "Iced Tea", "category": "drinks", "price": 100, "quantity": 90},
#     {"product": "Coconut Water", "category": "drinks", "price": 50, "quantity": 200},

#     # Snacks
#     {"product": "Nachos", "category": "snacks", "price": 60, "quantity": 100},
#     {"product": "Candy", "category": "snacks", "price": 20, "quantity": 250},
#     {"product": "Trail Mix", "category": "snacks", "price": 150, "quantity": 80},
#     {"product": "Granola Bar", "category": "snacks", "price": 100, "quantity": 90},
#     {"product": "Pretzels", "category": "snacks", "price": 70, "quantity": 110},

#     # Grains
#     {"product": "Corn Flour", "category": "grains", "price": 65, "quantity": 200},
#     {"product": "Millets", "category": "grains", "price": 80, "quantity": 150},
#     {"product": "Quinoa", "category": "grains", "price": 180, "quantity": 100},
#     {"product": "Sorghum", "category": "grains", "price": 70, "quantity": 120},
#     {"product": "Buckwheat", "category": "grains", "price": 150, "quantity": 90},

#     # Medical
#     {"product": "Paracetamol", "category": "medical", "price": 30, "quantity": 500},
#     {"product": "Ibuprofen", "category": "medical", "price": 50, "quantity": 400},
#     {"product": "Cough Syrup", "category": "medical", "price": 120, "quantity": 200},
#     {"product": "Antiseptic Cream", "category": "medical", "price": 80, "quantity": 150},
#     {"product": "Bandages", "category": "medical", "price": 40, "quantity": 600},
#     {"product": "Hand Sanitizer", "category": "medical", "price": 60, "quantity": 300},
#     {"product": "Vitamin C Tablets", "category": "medical", "price": 200, "quantity": 250},
#     {"product": "First Aid Kit", "category": "medical", "price": 500, "quantity": 70},

#     # Kitchen Items
#     {"product": "Non-stick Pan", "category": "kitchen", "price": 800, "quantity": 40},
#     {"product": "Pressure Cooker", "category": "kitchen", "price": 1500, "quantity": 30},
#     {"product": "Knife Set", "category": "kitchen", "price": 600, "quantity": 50},
#     {"product": "Chopping Board", "category": "kitchen", "price": 250, "quantity": 80},
#     {"product": "Mixer Grinder", "category": "kitchen", "price": 2000, "quantity": 25},
#     {"product": "Spatula Set", "category": "kitchen", "price": 300, "quantity": 100},
#     {"product": "Water Bottle", "category": "kitchen", "price": 150, "quantity": 200},
#     {"product": "Lunch Box", "category": "kitchen", "price": 400, "quantity": 120},
# ]
products = [
    # Dairy
    {"product": "Milk", "category": "dairy", "price": 40, "quantity": 100},
    {"product": "Cheese", "category": "dairy", "price": 120, "quantity": 50},
    {"product": "Yogurt", "category": "dairy", "price": 50, "quantity": 80},
    {"product": "Butter", "category": "dairy", "price": 80, "quantity": 60},

    # Fruits
    {"product": "Apple", "category": "fruit", "price": 100, "quantity": 200},
    {"product": "Banana", "category": "fruit", "price": 40, "quantity": 300},
    {"product": "Orange", "category": "fruit", "price": 80, "quantity": 180},
    {"product": "Mango", "category": "fruit", "price": 150, "quantity": 120},

    # Drinks
    {"product": "Cola", "category": "drinks", "price": 60, "quantity": 90},
    {"product": "Orange Juice", "category": "drinks", "price": 90, "quantity": 70},
    {"product": "Mineral Water", "category": "drinks", "price": 20, "quantity": 500},
    {"product": "Energy Drink", "category": "drinks", "price": 120, "quantity": 40},

    # Snacks
    {"product": "Potato Chips", "category": "snacks", "price": 30, "quantity": 150},
    {"product": "Chocolate Bar", "category": "snacks", "price": 50, "quantity": 200},
    {"product": "Cookies", "category": "snacks", "price": 70, "quantity": 100},
    {"product": "Popcorn", "category": "snacks", "price": 40, "quantity": 130},

    # Grains
    {"product": "Rice", "category": "grains", "price": 60, "quantity": 400},
    {"product": "Wheat Flour", "category": "grains", "price": 55, "quantity": 350},
    {"product": "Oats", "category": "grains", "price": 90, "quantity": 200},
    {"product": "Barley", "category": "grains", "price": 75, "quantity": 160},
]


for product in products:
    if not store_collection.find_one({"product": product["product"]}):
        store_collection.insert_one(product)
        print(f"✅ Inserted {product['product']}")
    else:
        print(f"⚠️ Skipped {product['product']} (already exists)")

