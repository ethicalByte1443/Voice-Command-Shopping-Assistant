from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = "wishlistDB"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

# Collections
user_collection = db["users"]
store_collection = db["store"]
