import os
import bcrypt
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    print("Error: MONGO_URI is not set in .env")
    exit(1)

client = MongoClient(MONGO_URI)
db = client.get_database()

users_to_seed = [
    {
        "name": "Local Grower",
        "email": "farmer@harvest.com",
        "password": "password123",
        "role": "farmer",
        "location": "Nashik, Maharashtra",
        "phone": "9876543210",
        "whatsapp_number": "9876543210",
        "district": "Nashik",
        "state": "Maharashtra"
    },
    {
        "name": "Grocer Buyer",
        "email": "buyer@mandi.com",
        "password": "password123",
        "role": "buyer",
        "location": "Mumbai, Maharashtra",
        "buyer_type": "retailer"
    }
]

for user_data in users_to_seed:
    email = user_data["email"]
    # Check if user already exists
    existing = db.Users.find_one({"email": email})
    if existing:
        print(f"User {email} already exists. Updating password...")
        hashed_password = bcrypt.hashpw(user_data["password"].encode("utf-8"), bcrypt.gensalt())
        db.Users.update_one(
            {"_id": existing["_id"]},
            {"$set": {"password": hashed_password}}
        )
    else:
        print(f"Registering new user: {email} ({user_data['role']})...")
        hashed_password = bcrypt.hashpw(user_data["password"].encode("utf-8"), bcrypt.gensalt())
        user_doc = {
            "name": user_data["name"],
            "email": email,
            "password": hashed_password,
            "role": user_data["role"],
            "location": user_data["location"],
            "whatsapp_number": user_data.get("whatsapp_number", ""),
            "district": user_data.get("district", ""),
            "state": user_data.get("state", ""),
            "phone": user_data.get("phone", ""),
            "buyer_type": user_data.get("buyer_type"),
            "created_at": "2026-05-17T12:00:00Z"
        }
        user_id = db.Users.insert_one(user_doc).inserted_id
        
        # Create profile and wallet
        if user_data["role"] == "farmer":
            db.FarmerProfiles.insert_one({
                "user_id": user_id, 
                "listings": [], 
                "location": user_data["location"],
                "whatsapp_number": user_data.get("whatsapp_number", ""),
                "district": user_data.get("district", ""),
                "state": user_data.get("state", "")
            })
        else:
            db.BuyerProfiles.insert_one({"user_id": user_id, "location": user_data["location"]})
            
        db.Wallet.insert_one({"user_id": user_id, "balance": 10000}) # Grant 10,000 INR balance for demo

print("Seed process completed successfully!")
