from db import store_collection

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

if store_collection.count_documents({}) == 0:
    store_collection.insert_many(products)
    print("✅ Store seeded with demo products!")
else:
    print("⚠️ Store already has data, skipping seeding.")
