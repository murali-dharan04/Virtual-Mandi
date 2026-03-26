from flask import Flask, jsonify, request
from flask_pymongo import PyMongo
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
from flask_cors import CORS, cross_origin
from flask_socketio import SocketIO
from dotenv import load_dotenv
import os
import bcrypt
from bson import ObjectId
from datetime import timedelta, datetime
import time
import cloudinary
import cloudinary.uploader
from werkzeug.utils import secure_filename
import requests

def log_to_file(message):
    log_path = os.path.join(os.path.dirname(__file__), "backend.log")
    with open(log_path, "a") as f:
        f.write(f"[{datetime.now()}] {message}\n")

# -------------------- LOAD ENV --------------------
load_dotenv()
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = r"d:\Virtual-Mandi-main\silver-tape-489018-p6-5a3224373280.json"

app = Flask(__name__)
CORS(app, supports_credentials=True, origins="*")
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")

# -------------------- CONFIG --------------------
app.config["MONGO_URI"] = os.getenv("MONGO_URI")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=5)  # Hackathon demo
app.config["PROPAGATE_EXCEPTIONS"] = True
app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024  # 5MB max file size

# -------------------- CLOUDINARY CONFIG --------------------
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

# -------------------- INIT EXTENSIONS --------------------
mongo = PyMongo(app)
jwt = JWTManager(app)

# Create TTL index for OTPs (expiring after 5 minutes)
with app.app_context():
    try:
        mongo.db.OTPs.create_index("created_at", expireAfterSeconds=300)
    except:
        pass

# -------------------- STORE FOR ONDC MOCKS --------------------
# This will store ONDC responses in-memory for the demo.
# In a real app, this would be in MongoDB.
ondc_responses = {}

# -------------------- JWT ERROR HANDLERS --------------------
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({"error": "Token has expired. Please login again."}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({"error": "Invalid token."}), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({"error": "Authorization token required."}), 401

# -------------------- BASIC ROUTES --------------------
@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Virtual Mandi Backend Running Successfully!"})

@app.route("/api/ping", methods=["GET"])
def ping():
    return jsonify({"message": "pong"})

@app.route("/api/test-db", methods=["GET"])
def test_db():
    try:
        # Ping the database to check connectivity
        mongo.db.command("ping")
        return jsonify({
            "status": "success",
            "message": "MongoDB Connected Successfully!",
            "database": mongo.db.name
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"MongoDB Connection Failed: {str(e)}"
        }), 500


# -------------------- AUTH ROUTES --------------------
@app.route("/api/auth/register", methods=["POST"])
def register():
    print(f"DEBUG: Register request received from {request.remote_addr}")
    try:
        data = request.get_json(force=True)
        print(f"DEBUG: Register data: {data}")
        log_to_file(f"Registering user with data: {data}")
        if not data:
            return jsonify({"error": "No data provided"}), 400

        name = data.get("name")
        email = data.get("email")
        password = data.get("password")
        role = data.get("role")  # "farmer" or "buyer"
        location = data.get("location", "")
        buyer_type = data.get("type", "retailer") # Match frontend key 'type'

        if not all([name, email, password, role]):
            missing = [k for k in ['name', 'email', 'password', 'role'] if not data.get(k)]
            log_to_file(f"Validation failed. Missing: {missing}")
            return jsonify({"error": "All fields are required"}), 400
        if role not in ["farmer", "buyer"]:
            log_to_file(f"Invalid role: {role}")
            return jsonify({"error": "Role must be farmer or buyer"}), 400

        if mongo.db.Users.find_one({"email": email}):
            log_to_file(f"User already exists: {email}")
            return jsonify({"error": "This email is already registered. Please sign in or use a different email."}), 400

        hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
        
        # New PRD fields
        whatsapp_number = data.get("whatsapp_number", "")
        district = data.get("district", "")
        state = data.get("state", "")
        lat = data.get("lat")
        lon = data.get("lon")

        user_doc = {
            "name": name,
            "email": email,
            "password": hashed_password,
            "role": role,
            "location": location,
            "whatsapp_number": whatsapp_number,
            "district": district,
            "state": state,
            "lat": lat,
            "lon": lon,
            "phone": data.get("mobile", data.get("phone", "")), # Support both keys
            "buyer_type": buyer_type if role == "buyer" else None,
            "created_at": datetime.utcnow()
        }

        user_id = mongo.db.Users.insert_one(user_doc).inserted_id

        # Create profile and wallet
        if role == "farmer":
            mongo.db.FarmerProfiles.insert_one({
                "user_id": user_id, 
                "listings": [], 
                "location": location,
                "whatsapp_number": whatsapp_number,
                "district": district,
                "state": state,
                "lat": lat,
                "lon": lon
            })
        else:
            mongo.db.BuyerProfiles.insert_one({"user_id": user_id, "location": location})

        mongo.db.Wallet.insert_one({"user_id": user_id, "balance": 0})
        access_token = create_access_token(identity=str(user_id))
        user_data = {
            "id": str(user_id),
            "name": name,
            "email": email,
            "role": role,
            "location": location
        }

        log_to_file(f"User {email} registered successfully with ID {user_id}")
        return jsonify({
            "message": "User registered successfully!",
            "user_id": str(user_id),
            "access_token": access_token,
            "user": user_data
        }), 201
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        log_to_file(f"Registration ERROR: {str(e)}\n{tb}")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500


@app.route("/api/auth/login", methods=["POST"])
def login():
    print("LOG: Login attempt started")
    try:
        data = request.get_json(force=True)
        print(f"LOG: Data: {data}")
        email = data.get("email")
        password = data.get("password")
        role = data.get("role")
        
        print(f"LOG: Finding user {email}")
        user = mongo.db.Users.find_one({"email": email})
        if not user:
            print("LOG: User not found")
            return jsonify({"error": "User not found"}), 404
            
        print("LOG: Checking password")
        if not bcrypt.checkpw(password.encode("utf-8"), user["password"]):
            print("LOG: Invalid password")
            return jsonify({"error": "Invalid password"}), 401
            
        access_token = create_access_token(identity=str(user["_id"]))

        if role and user["role"] != role:
            app_name = "Seller Dashboard" if user["role"] == "farmer" else "Buyer App"
            return jsonify({"error": f"Account mismatch. This is a {user['role']} account. Please use the {app_name}."}), 403

        user_data = {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "location": user.get("location", "")
        }
        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "role": user["role"],
            "user": user_data
        }), 200
    except Exception as e:
        import traceback
        print(f"LOGIN ERROR: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

# -------------------- OTP & PASSWORD RESET --------------------

@app.route("/api/auth/send-otp", methods=["POST"])
def send_otp():
    """Generates and 'sends' a 6-digit OTP for login"""
    data = request.get_json()
    phone = data.get("phone")
    method = data.get("method", "whatsapp") # "sms" or "whatsapp"

    if not phone:
        return jsonify({"error": "Phone number required"}), 400

    # Generate 6-digit OTP (Hardcoded for demo)
    import random
    otp_code = "000000"
    
    # Store in DB
    mongo.db.OTPs.update_one(
        {"phone": phone},
        {"$set": {"code": otp_code, "created_at": datetime.utcnow(), "method": method}},
        upsert=True
    )

    # In a real app, we'd call Twilio/WA API here.
    # For demo, we log it and return success.
    log_to_file(f"OTP for {phone} ({method}): {otp_code}")
    print(f"DEBUG: OTP for {phone} is {otp_code}")

    return jsonify({
        "success": True, 
        "message": f"OTP sent via {method}",
        "demo_otp": otp_code # Providing for easier testing during hackathon
    })

@app.route("/api/auth/verify-otp", methods=["POST"])
def verify_otp():
    """Verifies OTP and issues JWT"""
    data = request.get_json()
    phone = data.get("phone")
    otp_code = data.get("otp")

    if not phone or not otp_code:
        return jsonify({"error": "Phone and OTP required"}), 400

    if otp_code != "000000":
        otp_record = mongo.db.OTPs.find_one({"phone": phone, "code": otp_code})
        
        if not otp_record:
            return jsonify({"error": "Invalid or expired OTP"}), 400
            
        # Clean up OTP after use
        mongo.db.OTPs.delete_one({"_id": otp_record["_id"]})

    # Success - Find user or create temporary session
    user = mongo.db.Users.find_one({"$or": [{"phone": phone}, {"whatsapp_number": phone}]})

    if not user:
        # For demo, if user doesn't exist, we can't fully login but we return a guest-token or error
        return jsonify({"error": "No account found with this number. Please register first."}), 404

    access_token = create_access_token(identity=str(user["_id"]))
    
    user_data = {
        "id": str(user["_id"]),
        "name": user["name"],
        "role": user["role"],
        "phone": phone
    }

    return jsonify({
        "success": True,
        "access_token": access_token,
        "user": user_data
    })

@app.route("/api/auth/forgot-password", methods=["POST"])
def forgot_password():
    """Stub for password reset link generation"""
    data = request.get_json()
    email = data.get("email")
    if not email:
        return jsonify({"error": "Email required"}), 400
    
    # Simulation
    log_to_file(f"Password reset requested for: {email}")
    return jsonify({"success": True, "message": "Reset instructions sent to your email."})

# -------------------- PROFILE --------------------
@app.route("/api/auth/profile", methods=["GET"])
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    user = mongo.db.Users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "location": user.get("location", "Delhi")
    }), 200

# -------------------- SELLER ROUTES --------------------
# Cloudinary Image Upload
@app.route("/api/seller/upload-image", methods=["POST"])
@jwt_required()
def upload_image():
    """Upload product image to Cloudinary"""
    user_id = get_jwt_identity()
    
    user = mongo.db.Users.find_one({"_id": ObjectId(user_id)})
    if not user or user["role"] != "farmer":
        return jsonify({"error": "Unauthorized"}), 403

    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    # Validate file type
    allowed_extensions = {'png', 'jpg', 'jpeg'}
    filename = secure_filename(file.filename)
    file_ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    
    if file_ext not in allowed_extensions:
        return jsonify({"error": "Invalid file type. Only JPG, JPEG, PNG allowed"}), 400
    
    try:
        # Initial attempt
        upload_result = cloudinary.uploader.upload(
            file,
            folder="virtual-mandi-products",
            resource_type="image",
            transformation=[
                {'width': 800, 'height': 800, 'crop': 'limit'},
                {'quality': 'auto:good'}
            ]
        )
        
        image_url = upload_result.get('secure_url')
        log_to_file(f"Image uploaded: {image_url}")
        
        return jsonify({
            "success": True,
            "image_url": image_url
        }), 200
        
    except Exception as e:
        error_msg = str(e)
        log_to_file(f"Cloudinary error: {error_msg}")
        
        # Mitigation for "Stale request" clock sync issues
        if "Stale request" in error_msg:
            try:
                log_to_file("Attempting upload retry with synchronized timestamp (monkeypatching time.time)...")
                
                # Reset file pointer for retry
                file.seek(0)
                
                # Monkeypatch time.time temporarily to force a +1 hour offset
                import time
                real_time = time.time
                time.time = lambda: real_time() + 3600
                
                try:
                    upload_result = cloudinary.uploader.upload(
                        file,
                        folder="virtual-mandi-products",
                        resource_type="image",
                        transformation=[
                            {'width': 800, 'height': 800, 'crop': 'limit'},
                            {'quality': 'auto:good'}
                        ]
                    )
                    image_url = upload_result.get('secure_url')
                    return jsonify({"success": True, "image_url": image_url, "note": "Clock drift corrected via monkeypatch"}), 200
                finally:
                    # Always restore the real time function
                    time.time = real_time
                    
            except Exception as retry_e:
                log_to_file(f"Retry failed: {str(retry_e)}")
                return jsonify({"error": f"Upload failed: Clock sync error. Please check your system time. {str(retry_e)}"}), 500

        return jsonify({"error": f"Upload failed: {error_msg}"}), 500

@app.route("/api/seller/listing", methods=["POST"])
@jwt_required()
def add_listing():
    user_id = get_jwt_identity()
    
    user = mongo.db.Users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404

    if user["role"] != "farmer":
        return jsonify({"error": "Only farmers can add listings"}), 403

    data = request.get_json()
    
    # Support both app.py original and Seller App field names (camelCase and snake_case)
    crop_name = data.get("cropName") or data.get("crop_name") or data.get("name")
    category = data.get("category") or data.get("quality_grade") or "Other"
    quantity = data.get("quantity")
    price_per_unit = data.get("pricePerUnit") or data.get("price_per_unit")
    location = data.get("location")
    harvest_date = data.get("harvestDate") or data.get("harvest_date")
    quality_grade = data.get("qualityGrade") or data.get("quality_grade")
    image_url = data.get("imageUrl") or data.get("image_url")
    unit = data.get("unit") or "kg"

    missing_fields = []
    if not crop_name: missing_fields.append("crop_name")
    if not quantity: missing_fields.append("quantity")
    if not price_per_unit: missing_fields.append("price_per_unit")
    if not location: missing_fields.append("location")

    if missing_fields:
        return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

    try:
        listing = {
            "seller_id": ObjectId(user_id),
            "name": crop_name,
            "quantity": int(quantity),
            "price_per_unit": float(price_per_unit),
            "location": location,
            "harvest_date": harvest_date,
            "quality_grade": quality_grade,
            "category": category,
            "image_url": image_url,
            "unit": unit,
            "images": data.get("images", []) # Store multiple images
        }

        listing_id = mongo.db.Listings.insert_one(listing).inserted_id
        
        # Ensure FarmerProfile exists before push
        profile = mongo.db.FarmerProfiles.find_one({"user_id": ObjectId(user_id)})
        if not profile:
            mongo.db.FarmerProfiles.insert_one({"user_id": ObjectId(user_id), "listings": [listing_id]})
        else:
            mongo.db.FarmerProfiles.update_one(
                {"user_id": ObjectId(user_id)},
                {"$push": {"listings": listing_id}}
            )

        # Trigger notification for all buyers (New Produce Available)
        buyer_query = {"role": "buyer"}
        all_buyers = mongo.db.Users.find(buyer_query)
        notification_base = {
            "type": "new_listing",
            "title": "New Produce Available",
            "message": f"Farmer has listed new {crop_name}. Check it out!",
            "read": False,
            "created_at": datetime.utcnow()
        }
        for buyer_user in all_buyers:
            notif = notification_base.copy()
            notif["user_id"] = buyer_user["_id"]
            mongo.db.Notifications.insert_one(notif)

        # Emit real-time event to all connected clients
        socketio.emit("listing_created", {
            "id": str(listing_id),
            "cropName": crop_name,
            "category": category,
            "quantity": int(quantity),
            "pricePerUnit": float(price_per_unit),
            "location": location,
            "qualityGrade": quality_grade,
            "unit": unit,
            "imageUrl": image_url,
            "farmerName": user.get("name", "Local Farmer"),
            "farmerPhone": user.get("phone", ""),
            "whatsappNumber": user.get("whatsapp_number", ""),
        })

        return jsonify({"message": "Listing added successfully!", "listing_id": str(listing_id)}), 201
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@app.route("/api/seller/listings", methods=["GET"])
@jwt_required()
def get_seller_listings():
    user_id = get_jwt_identity()
    listings = []
    # Fetch all listings for this seller
    for l in mongo.db.Listings.find({"seller_id": ObjectId(user_id)}):
        listings.append({
            "id": str(l["_id"]),
            "cropName": l.get("name") or l.get("crop_name"),
            "quantity": l.get("quantity"),
            "pricePerUnit": l.get("price_per_unit"),
            "location": l.get("location"),
            "harvestDate": l.get("harvest_date"),
            "qualityGrade": l.get("quality_grade"),
            "category": l.get("category", "Other"),
            "imageUrl": l.get("image_url"),
            "unit": l.get("unit") or "kg"
        })
    return jsonify(listings), 200

@app.route("/api/seller/listing/<id>", methods=["GET"])
@jwt_required()
def get_listing_by_id(id):
    user_id = get_jwt_identity()
    listing = mongo.db.Listings.find_one({"_id": ObjectId(id), "seller_id": ObjectId(user_id)})
    if not listing:
        return jsonify({"error": "Listing not found or unauthorized"}), 404
    
    return jsonify({
        "id": str(listing["_id"]),
        "cropName": listing["name"],
        "quantity": listing["quantity"],
        "pricePerUnit": listing["price_per_unit"],
        "location": listing["location"],
        "harvestDate": listing.get("harvest_date"),
        "qualityGrade": listing.get("quality_grade"),
        "category": listing.get("category", "Other"),
        "unit": listing.get("unit", "kg"),
        "imageUrl": listing.get("image_url"),
        "images": listing.get("images", [])
    }), 200

@app.route("/api/listing/<id>", methods=["GET"])
def get_public_listing_by_id(id):
    listing = mongo.db.Listings.find_one({"_id": ObjectId(id)})
    if not listing:
        return jsonify({"error": "Listing not found"}), 404
    
    return jsonify({
        "id": str(listing["_id"]),
        "cropName": listing["name"],
        "quantity": listing["quantity"],
        "pricePerUnit": listing["price_per_unit"],
        "location": listing["location"],
        "harvestDate": listing.get("harvest_date"),
        "qualityGrade": listing.get("quality_grade"),
        "category": listing.get("category", "Other"),
        "unit": listing.get("unit", "kg"),
        "imageUrl": listing.get("image_url"),
        "images": listing.get("images", []),
        "views": listing.get("views", 0),
        "farmerName": mongo.db.Users.find_one({"_id": listing["seller_id"]}).get("name", "Local Farmer") if "seller_id" in listing else "Local Farmer",
        "farmerPhone": mongo.db.Users.find_one({"_id": listing["seller_id"]}).get("phone", "") if "seller_id" in listing else "",
        "whatsappNumber": mongo.db.Users.find_one({"_id": listing["seller_id"]}).get("whatsapp_number", "") if "seller_id" in listing else ""
    }), 200

@app.route("/api/listing/<id>/view", methods=["POST"])
def increment_listing_view(id):
    """Increments the view count for a listing."""
    try:
        mongo.db.Listings.update_one(
            {"_id": ObjectId(id)},
            {"$inc": {"views": 1}}
        )
        # Emit a real-time update so all buyers see the new view count
        listing = mongo.db.Listings.find_one({"_id": ObjectId(id)})
        if listing:
            socketio.emit("listing_viewed", {
                "id": id,
                "views": listing.get("views", 0)
            })
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/seller/profile/update", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    update_fields = {}
    if "name" in data: update_fields["name"] = data["name"]
    if "phone" in data: update_fields["phone"] = data["phone"]
    if "whatsapp_number" in data: update_fields["whatsapp_number"] = data["whatsapp_number"]
    if "location" in data: update_fields["location"] = data["location"]
    if "district" in data: update_fields["district"] = data["district"]
    if "state" in data: update_fields["state"] = data["state"]

    if not update_fields:
        return jsonify({"message": "No fields to update"}), 400

    mongo.db.Users.update_one({"_id": ObjectId(user_id)}, {"$set": update_fields})
    
    # Sync to FarmerProfile if it exists
    if mongo.db.Users.find_one({"_id": ObjectId(user_id)})["role"] == "farmer":
        mongo.db.FarmerProfiles.update_one(
            {"user_id": ObjectId(user_id)},
            {"$set": {k: v for k, v in update_fields.items() if k != "name"}}
        )

    return jsonify({"message": "Profile updated successfully"}), 200

@app.route("/api/seller/listing/<id>", methods=["PUT"])
@jwt_required()
def update_listing(id):
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Check ownership
    existing = mongo.db.Listings.find_one({"_id": ObjectId(id), "seller_id": ObjectId(user_id)})
    if not existing:
        return jsonify({"error": "Listing not found or unauthorized"}), 404
        
    update_data = {
        "name": data.get("crop_name") or data.get("cropName") or existing["name"],
        "quantity": int(data.get("quantity", existing["quantity"])),
        "price_per_unit": float(data.get("price_per_unit") or data.get("pricePerUnit") or existing["price_per_unit"]),
        "location": data.get("location", existing["location"]),
        "harvest_date": data.get("harvest_date") or data.get("harvestDate") or existing.get("harvest_date"),
        "quality_grade": data.get("quality_grade") or data.get("qualityGrade") or existing.get("quality_grade"),
        "category": data.get("category", existing.get("category", "Other")),
        "unit": data.get("unit", existing.get("unit", "kg")),
        "image_url": data.get("imageUrl") or data.get("image_url") or existing.get("image_url"),
        "images": data.get("images", existing.get("images", []))
    }
    
    mongo.db.Listings.update_one({"_id": ObjectId(id)}, {"$set": update_data})

    socketio.emit("listing_updated", {
        "id": id,
        "cropName": update_data["name"],
        "category": update_data.get("category"),
        "quantity": update_data["quantity"],
        "pricePerUnit": update_data["price_per_unit"],
        "location": update_data["location"],
        "qualityGrade": update_data.get("quality_grade"),
        "unit": update_data.get("unit", "kg"),
        "imageUrl": update_data.get("image_url"),
        "views": existing.get("views", 0),
        "farmerPhone": mongo.db.Users.find_one({"_id": ObjectId(user_id)}).get("phone", ""),
        "whatsappNumber": mongo.db.Users.find_one({"_id": ObjectId(user_id)}).get("whatsapp_number", ""),
    })

    return jsonify({"message": "Listing updated successfully"}), 200

@app.route("/api/seller/listing/<id>", methods=["DELETE"])
@jwt_required()
def delete_listing(id):
    user_id = get_jwt_identity()
    
    # Check ownership and delete
    result = mongo.db.Listings.delete_one({"_id": ObjectId(id), "seller_id": ObjectId(user_id)})
    
    if result.deleted_count == 0:
        return jsonify({"error": "Listing not found or unauthorized"}), 404
        
    # Also remove from FarmerProfile if it exists
    mongo.db.FarmerProfiles.update_one(
        {"user_id": ObjectId(user_id)},
        {"$pull": {"listings": ObjectId(id)}}
    )

    # Emit real-time event
    socketio.emit("listing_deleted", {"id": id})

    return jsonify({"message": "Listing deleted successfully"}), 200

@app.route("/api/seller/orders", methods=["GET"])
@jwt_required()
def get_seller_orders():
    user_id = get_jwt_identity()
    orders = []
    # Fetch orders where seller_id is either an ObjectId or a string (for robustness)
    query = {"$or": [
        {"seller_id": ObjectId(user_id)},
        {"seller_id": user_id}
    ]}
    for o in mongo.db.Orders.find(query).sort("_id", -1):
        orders.append({
            "id": str(o["_id"]),
            "_id": str(o["_id"]),
            "order_id": o.get("order_id_str"),
            "crop_name": o["crop_name"],
            "buyer_name": o.get("buyer_name", "Anonymous"),
            "quantity": o["quantity"],
            "unit": o.get("unit", "kg"),
            "total_price": o["total_price"],
            "status": o["status"],
            "created_at": o.get("created_at")
        })
    return jsonify(orders), 200

@app.route("/api/seller/order/<id>", methods=["GET"])
@jwt_required()
def get_order_by_id(id):
    order = mongo.db.Orders.find_one({"_id": ObjectId(id)})
    if not order:
        return jsonify({"error": "Order not found"}), 404
        
    return jsonify({
        "id": str(order["_id"]),
        "order_id": order.get("order_id_str"),
        "status": order["status"],
        "crop_name": order["crop_name"],
        "buyer_name": order["buyer_name"],
        "quantity": order["quantity"],
        "unit": order["unit"],
        "total_price": order["total_price"],
        "created_at": order["created_at"]
    }), 200

@app.route("/api/seller/order/<id>/update", methods=["PUT"])
@jwt_required()
def update_order_status(id):
    data = request.get_json()
    status = data.get("status")
    
    result = mongo.db.Orders.update_one(
        {"_id": ObjectId(id)},
        {"$set": {"status": status}}
    )
    
    if result.matched_count == 0:
        return jsonify({"error": "Order not found"}), 404
        
    # Trigger notification for buyer if order is accepted
    if status.lower() == "accepted":
        order = mongo.db.Orders.find_one({"_id": ObjectId(id)})
        if order:
            mongo.db.Notifications.insert_one({
                "user_id": order["buyer_id"],
                "type": "order_accepted",
                "title": "Order Accepted!",
                "message": f"Your order for {order['crop_name']} has been accepted by the farmer.",
                "read": False,
                "created_at": datetime.utcnow()
            })
            
            # Emit real-time notification to buyer
            socketio.emit("order_status_updated", {
                "order_id": str(id),
                "status": "accepted",
                "buyer_id": str(order["buyer_id"]),
                "crop_name": order["crop_name"]
            }, room=str(order["buyer_id"]))

    if status.lower() == "rejected":
        order = mongo.db.Orders.find_one({"_id": ObjectId(id)})
        if order:
            # Inventory Tracking: Restore Stock on Reject
            log_to_file(f"Restoring {int(order.get('quantity', 0))} for listing {str(order.get('listing_id'))}")
            res = mongo.db.Listings.update_one(
                {"_id": ObjectId(str(order["listing_id"]))},
                {"$inc": {"quantity": int(order.get("quantity", 0))}}
            )
            log_to_file(f"Restore result matched: {res.matched_count} modified: {res.modified_count}")
            
            mongo.db.Notifications.insert_one({
                "user_id": order["buyer_id"],
                "type": "order_rejected",
                "title": "Order Rejected",
                "message": f"Your order for {order['crop_name']} was rejected by the farmer.",
                "read": False,
                "created_at": datetime.utcnow()
            })
            
            # Emit real-time notification to buyer
            socketio.emit("order_status_updated", {
                "order_id": str(id),
                "status": "rejected",
                "buyer_id": str(order["buyer_id"]),
                "crop_name": order["crop_name"]
            }, room=str(order["buyer_id"]))
        
    return jsonify({"message": f"Order {id} updated to {status}"}), 200

@app.route("/api/seller/dashboard-stats", methods=["GET"])
@jwt_required()
def get_dashboard_stats():
    user_id = get_jwt_identity()
    query = {"$or": [
        {"seller_id": ObjectId(user_id)},
        {"seller_id": user_id}
    ]}
    total_listings = mongo.db.Listings.count_documents(query)
    total_orders = mongo.db.Orders.count_documents(query)
    
    pending_query = {"$or": [
        {"seller_id": ObjectId(user_id), "status": "Pending"},
        {"seller_id": user_id, "status": "Pending"}
    ]}
    pending_orders = mongo.db.Orders.count_documents(pending_query)
    
    # Calculate revenue
    revenue_query = {"$or": [
        {"seller_id": ObjectId(user_id), "status": "Delivered"},
        {"seller_id": user_id, "status": "Delivered"}
    ]}
    revenue_cursor = mongo.db.Orders.find(revenue_query)
    revenue = sum(o.get("total_price", 0) for o in revenue_cursor)

    return jsonify({
        "activeListings": total_listings,
        "totalOrders": total_orders,
        "revenue": revenue,
        "pendingOrders": pending_orders
    }), 200

@app.route("/api/buyer/orders", methods=["GET"])
@jwt_required()
def get_buyer_orders():
    user_id = get_jwt_identity()
    orders = []
    # Fetch orders for this buyer
    for o in mongo.db.Orders.find({"buyer_id": ObjectId(user_id)}).sort("created_at", -1):
        orders.append({
            "id": str(o["_id"]),
            "order_id": o.get("order_id_str"),
            "cropName": o["crop_name"],
            "farmerName": mongo.db.Users.find_one({"_id": o["seller_id"]})["name"],
            "quantity": o["quantity"],
            "unit": o.get("unit", "kg"),
            "totalPrice": o["total_price"],
            "status": o["status"], # Pending, Accepted, Rejected
            "paymentStatus": "paid", # Mock for now
            "placedAt": o["created_at"]
        })
    return jsonify(orders), 200

@app.route("/api/transactions", methods=["GET"])
@jwt_required()
def get_buyer_transactions():
    user_id = get_jwt_identity()
    transactions = []
    # Fetch orders for this buyer to serve as transactions
    for o in mongo.db.Orders.find({"buyer_id": ObjectId(user_id)}).sort("created_at", -1):
        transactions.append({
            "id": str(o["_id"]),
            "order_id": o.get("order_id_str"),
            "amount": o["total_price"],
            "status": o["status"],
            "date": o["created_at"],
            "description": f"Payment for {o['quantity']} {o.get('unit', 'kg')} of {o['crop_name']}",
            "type": "debit"
        })
    return jsonify(transactions), 200

# -------------------- BUYER ONDC MOCK ROUTES --------------------
@app.route("/api/bpp/search", methods=["POST"])
@jwt_required(optional=True)
def bpp_search():
    try:
        data = request.get_json()
        context = data.get("context", {})
        transaction_id = context.get("transaction_id")
        
        message = data.get("message", {})
        intent = message.get("intent", {})
        item = intent.get("item", {})
        descriptor = item.get("descriptor", {})
        item_name = str(descriptor.get("name") or "").lower()

        # Find matching listings
        listings = []
        query = {}
        if item_name:
            query["name"] = {"$regex": item_name, "$options": "i"}
        
        found_docs = list(mongo.db.Listings.find(query))

        for l in found_docs:
            try:
                # Safe lookup for farmer name
                farmer_name = "Local Farmer"
                seller_id = l.get("seller_id")
                if seller_id:
                    farmer = mongo.db.Users.find_one({"_id": seller_id})
                    if farmer:
                        farmer_name = farmer.get("name", "Local Farmer")
                
                listings.append({
                    "id": str(l.get("_id")),
                    "descriptor": {"name": l.get("name", "Unknown Crop")},
                    "price": {"value": str(l.get("price_per_unit", 0)), "currency": "INR"},
                    "quantity": {"available": {"count": l.get("quantity", 0)}},
                    "location": l.get("location", "Unknown"),
                    "quality_grade": l.get("quality_grade", "A"),
                    "category": l.get("category", "Other"),
                    "farmer_name": farmer_name,
                    "farmer_phone": farmer.get("phone", "") if farmer else "",
                    "whatsapp_number": farmer.get("whatsapp_number", "") if farmer else "",
                    "unit": l.get("unit", "kg"),
                    "image_url": l.get("image_url") or "/placeholder.svg",
                    "distance": l.get("distance", 2.5),
                    "delivery_estimate": l.get("delivery_estimate", "Tomorrow")
                })
            except Exception as e:
                print(f"Error processing listing {l.get('_id')}: {str(e)}")

        # Store mock response
        ondc_responses[transaction_id] = [
            {
                "context": {"action": "on_search", "transaction_id": transaction_id},
                "message": {
                    "catalog": {
                        "bpp/providers": [
                            {"items": listings}
                        ]
                    }
                }
            }
        ]
        return jsonify({"message": "Search initiated"}), 200
    except Exception as e:
        print(f"Critical error in bpp_search: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/suggestions", methods=["GET"])
def get_suggestions():
    q = request.args.get("q", "").lower()
    if not q:
        return jsonify([]), 200
        
    # Find unique names matching the query
    suggestions = mongo.db.Listings.distinct("name", {"name": {"$regex": f"^{q}", "$options": "i"}})
    # Limit to top 5 suggestions
    return jsonify(suggestions[:5]), 200

@app.route("/api/mandi/<commodity>", methods=["GET"])
def get_mandi_prices(commodity):
    # Mock Agmarknet API response
    # In real app: requests.get(f"https://api.agmarknet.gov.in/price?commodity={commodity}")
    
    
    # Real Agmarknet API Integration
    try:
        api_key = os.getenv("DATA_GOV_API_KEY")
        # Updated Resource ID per user request: 9ef84268-d588-465a-a308-a864a43d0070
        url = f"https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key={api_key}&format=json&filters[commodity]={commodity}"
        
        response = requests.get(url)
        data = response.json()
        
        real_prices = []
        if "records" in data:
            for record in data["records"]:
                real_prices.append({
                    "market": f"{record.get('market', 'Unknown')} ({record.get('district', '')})",
                    "state": record.get("state", "India"),
                    "price": float(record.get("modal_price", 0)) / 100 # Convert quintal to kg
                })
        
        if real_prices:
            return jsonify({"mandi_prices": real_prices[:10]}), 200 # Return top 10 results
            
    except Exception as e:
        print(f"API Error: {e}")
        # Fallback to mock data if API fails
        pass

    # Fallback Mock Data (if API fails or returns no data)
    import random
    base_price = 20 # Default
    if "tomato" in commodity.lower(): base_price = 18
    if "potato" in commodity.lower(): base_price = 12
    if "onion" in commodity.lower(): base_price = 25
    if "rice" in commodity.lower(): base_price = 45
    if "apple" in commodity.lower(): base_price = 65
    if "wheat" in commodity.lower(): base_price = 22
    if "banana" in commodity.lower(): base_price = 30
    if "kiwi" in commodity.lower(): base_price = 450
    if "orange" in commodity.lower(): base_price = 80 # Realistic market price for Orange
    
    prices = [
        {"market": "Karnal Mandi", "state": "Haryana", "price": base_price + random.randint(-2, 2)},
        {"market": "Azadpur Mandi", "state": "Delhi", "price": base_price + random.randint(1, 4)},
        {"market": "Pune APMC", "state": "Maharashtra", "price": base_price + random.randint(-1, 3)},
        {"market": "Kolar Mandi", "state": "Karnataka", "price": base_price + random.randint(0, 5)}
    ]
    
    return jsonify({"mandi_prices": prices}), 200

# -------------------- MARKET PRICES API --------------------

MARKET_DATA = {
    "tn": [
        {"crop": "Tomato", "market": "Koyambedu, Chennai", "price": 48, "min_price": 42, "max_price": 54, "unit": "kg", "trend": "+4%"},
        {"crop": "Rice (Ponni)", "market": "Erode, TN", "price": 62, "min_price": 58, "max_price": 66, "unit": "kg", "trend": "-1%"},
        {"crop": "Onion", "market": "Madurai, TN", "price": 35, "min_price": 30, "max_price": 40, "unit": "kg", "trend": "+0.5%"},
        {"crop": "Banana (Nendran)", "market": "Trichy, TN", "price": 45, "min_price": 40, "max_price": 50, "unit": "kg", "trend": "+3%"},
        {"crop": "Tapioca", "market": "Salem, TN", "price": 18, "min_price": 15, "max_price": 22, "unit": "kg", "trend": "Stable"},
        {"crop": "Sugarcane", "market": "Vellore, TN", "price": 35, "min_price": 32, "max_price": 38, "unit": "100kg", "trend": "+1%"},
        {"crop": "Groundnut", "market": "Tirunelveli, TN", "price": 85, "min_price": 80, "max_price": 90, "unit": "kg", "trend": "+2%"},
    ],
    "mh": [
        {"crop": "Onion", "market": "Lasalgaon, Nashik", "price": 28, "min_price": 24, "max_price": 32, "unit": "kg", "trend": "-2%"},
        {"crop": "Grapes", "market": "Sangli, MH", "price": 70, "min_price": 65, "max_price": 75, "unit": "kg", "trend": "+5%"},
        {"crop": "Soybean", "market": "Latur, MH", "price": 48, "min_price": 45, "max_price": 52, "unit": "kg", "trend": "Stable"},
        {"crop": "Cotton", "market": "Akola, MH", "price": 65, "min_price": 60, "max_price": 70, "unit": "kg", "trend": "-1%"},
        {"crop": "Tomato", "market": "Vashi, Mumbai", "price": 52, "min_price": 48, "max_price": 58, "unit": "kg", "trend": "+6%"},
        {"crop": "Pomegranate", "market": "Solapur, MH", "price": 90, "min_price": 85, "max_price": 95, "unit": "kg", "trend": "+3%"},
    ],
    "up": [
        {"crop": "Wheat", "market": "Lucknow, UP", "price": 22, "min_price": 20, "max_price": 24, "unit": "kg", "trend": "+1%"},
        {"crop": "Potato", "market": "Agra, UP", "price": 12, "min_price": 10, "max_price": 14, "unit": "kg", "trend": "Stable"},
        {"crop": "Mustard", "market": "Mathura, UP", "price": 55, "min_price": 52, "max_price": 58, "unit": "kg", "trend": "+2%"},
        {"crop": "Sugarcane", "market": "Meerut, UP", "price": 38, "min_price": 35, "max_price": 42, "unit": "100kg", "trend": "+1.5%"},
        {"crop": "Mango (Dasheri)", "market": "Malihabad, UP", "price": 65, "min_price": 60, "max_price": 75, "unit": "kg", "trend": "+4%"},
    ],
    "pb": [
        {"crop": "Wheat", "market": "Khanna, Punjab", "price": 24, "min_price": 22, "max_price": 26, "unit": "kg", "trend": "+1%"},
        {"crop": "Rice (Basmati)", "market": "Amritsar, PB", "price": 80, "min_price": 75, "max_price": 85, "unit": "kg", "trend": "+3%"},
        {"crop": "Maize", "market": "Ludhiana, PB", "price": 20, "min_price": 18, "max_price": 22, "unit": "kg", "trend": "Stable"},
        {"crop": "Potato", "market": "Jalandhar, PB", "price": 14, "min_price": 12, "max_price": 16, "unit": "kg", "trend": "-1%"},
        {"crop": "Kinnow", "market": "Hoshiarpur, PB", "price": 35, "min_price": 30, "max_price": 40, "unit": "kg", "trend": "+2%"},
    ],
    "dl": [
        {"crop": "Tomato", "market": "Azadpur, Delhi", "price": 48, "min_price": 44, "max_price": 52, "unit": "kg", "trend": "+4%"},
        {"crop": "Potato", "market": "Azadpur, Delhi", "price": 15, "min_price": 13, "max_price": 17, "unit": "kg", "trend": "Stable"},
        {"crop": "Onion", "market": "Azadpur, Delhi", "price": 32, "min_price": 28, "max_price": 36, "unit": "kg", "trend": "+2%"},
        {"crop": "Apple", "market": "Azadpur, Delhi", "price": 90, "min_price": 85, "max_price": 110, "unit": "kg", "trend": "+5%"},
        {"crop": "Carrot", "market": "Azadpur, Delhi", "price": 38, "min_price": 35, "max_price": 42, "unit": "kg", "trend": "+1%"},
    ],
}

@app.route("/api/market-prices", methods=["GET"])
def get_market_prices():
    """Return live simulated market prices for a given state."""
    state_code = request.args.get("state", "dl").lower().strip()
    print(f"DEBUG: Market prices requested for state: {state_code}")
    
    # State mapping for Data.gov.in API
    state_mapping = {
        "dl": "Delhi",
        "mh": "Maharashtra",
        "tn": "Tamil Nadu",
        "up": "Uttar Pradesh",
        "pb": "Punjab"
    }
    state_name = state_mapping.get(state_code, "Delhi")
    
    # Try real API first
    try:
        api_key = os.getenv("DATA_GOV_API_KEY")
        if not api_key:
             raise Exception("Missing DATA_GOV_API_KEY")
             
        # Resource ID: 9ef84268-d588-465a-a308-a864a43d0070 (Agmarknet)
        # Try specific state filter first
        url = f"https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key={api_key}&format=json&filters[state]={state_name}&limit=50"
        
        print(f"DEBUG: Fetching Market data for {state_name}: {url}")
        response = requests.get(url, timeout=20)
        formatted_data = []
        
        if response.status_code == 200:
            data = response.json()
            records = data.get("records", [])
            print(f"DEBUG: OGD API returned {len(records)} records for {state_name}")
            
            if not records:
                # Try fetching recent records overall if state filter returned nothing
                print(f"DEBUG: No records for {state_name}, trying recent overall...")
                fallback_url = f"https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key={api_key}&format=json&limit=50"
                response = requests.get(fallback_url, timeout=20)
                if response.status_code == 200:
                    records = response.json().get("records", [])
                    print(f"DEBUG: Fetched {len(records)} recent records overall")

            if records:
                import random
                trends = ["+2%", "-1.5%", "+0.5%", "-2%", "Stable", "+3%", "+1.2%", "-0.8%"]
                
                for record in records:
                    # If we did an overall fetch, filter manually if possible or just use them
                    rec_state = record.get("state", "").lower()
                    if state_name.lower() in rec_state or not state_name:
                        formatted_data.append({
                            "crop": record.get("commodity", "Unknown"),
                            "variety": record.get("variety", "Standard"),
                            "grade": record.get("grade", "FAQ"),
                            "market": f"{record.get('market', 'Unknown')} ({record.get('district', '')})",
                            "price": float(record.get("modal_price", 0)) / 100,
                            "min_price": float(record.get("min_price", 0)) / 100,
                            "max_price": float(record.get("max_price", 0)) / 100,
                            "unit": "kg",
                            "trend": random.choice(trends),
                            "date": record.get("arrival_date", "")
                        })
                
                if formatted_data:
                    print(f"DEBUG: Returning {len(formatted_data)} refined records")
                    return jsonify({"data": formatted_data, "state": state_code}), 200
        else:
            print(f"DEBUG: OGD API returned status {response.status_code}: {response.text}")
            
    except Exception as e:
        log_to_file(f"Market API Error: {e}")
        print(f"DEBUG: Market API Error: {e}")

    # Fallback to static MARKET_DATA if API fails or returns no data
    print(f"DEBUG: Using static fallback data for {state_code}")
    data = MARKET_DATA.get(state_code, MARKET_DATA["dl"])
    return jsonify({"data": data, "state": state_code}), 200

# -------------------- WEATHER ENGINE LOGIC --------------------
def generate_weather_insights(temp, humidity, rain, wind_speed, condition, crop=None):
    """
    Analyzes weather data and generates smart farming advice and alerts.
    """
    alerts = []
    advice_list = []
    
    # Evaluate extreme conditions
    is_heavy_rain = rain > 10
    is_extreme_heat = temp > 35
    is_high_humidity = humidity > 80
    is_cold = temp < 15
    is_storm = wind_speed > 40 or condition.lower() == "storm"
    
    # 1. Generate Alerts
    if is_extreme_heat:
        alerts.append("High Temperature Alert")
    if is_heavy_rain:
        alerts.append("Heavy Rain Alert")
    if is_cold:
        alerts.append("Cold Wave Alert")
    if is_storm:
        alerts.append("Storm Alert")
        
    # 2. General Farming Advice
    if is_heavy_rain:
        advice_list.append("Heavy rain expected. Harvest crops early and protect stored grains.")
    elif is_extreme_heat:
        advice_list.append("Extreme heat detected. Irrigate crops during early morning or evening.")
    elif is_cold:
        advice_list.append("Cold weather detected. Protect sensitive crops.")
    elif is_high_humidity:
        advice_list.append("High humidity may increase fungal disease risk. Monitor crops carefully.")
    else:
        advice_list.append("Weather conditions are favorable for normal farming activities.")
        
    # 3. Crop-Specific Advice
    if crop:
        crop_lower = crop.lower()
        if "tomato" in crop_lower and is_heavy_rain:
            advice_list.append("Heavy rain may damage tomato crops. Consider harvesting early.")
        if "onion" in crop_lower and is_heavy_rain:
            advice_list.append("Onions are prone to rotting in heavy rain. Ensure proper field drainage.")
        if "potato" in crop_lower and is_high_humidity:
            advice_list.append("High humidity increases potato blight risk. Monitor foliage closely and apply preventative sprays if necessary.")
        if "banana" in crop_lower and wind_speed > 30:
            advice_list.append("High winds may damage banana trees. Provide mechanical support if possible.")
        if "rice" in crop_lower and is_extreme_heat:
            advice_list.append("Extreme heat can affect rice flowering. Maintain adequate water levels in paddies.")
            
    # Combine advice into a single string
    final_advice = " ".join(advice_list)
    
    return final_advice, alerts

# Weather data cache (15-minute refresh)
weather_cache = {}

@app.route("/api/weather/current", methods=["GET"])
def get_weather_current():
    """Get weather data and generate smart farming advice"""
    lat = request.args.get("lat")
    lon = request.args.get("lon")
    city = request.args.get("location") or request.args.get("city", "")
    crop_name = request.args.get("crop", "").lower()

    if not (lat and lon) and not city:
        try:
            from flask_jwt_extended import decode_token
            auth_header = request.headers.get("Authorization")
            if auth_header and "Bearer " in auth_header:
                token = auth_header.split(" ")[1]
                decoded = decode_token(token)
                user_id = decoded["sub"]
                user = mongo.db.Users.find_one({"_id": ObjectId(user_id)})
                if user and user.get("lat") and user.get("lon"):
                    lat = str(user["lat"])
                    lon = str(user["lon"])
                elif user and user.get("district"):
                    city = user["district"]
        except:
            pass

    cache_key = f"{lat}_{lon}_{city}_{crop_name}"
    if cache_key in weather_cache:
        cached_data, cached_time = weather_cache[cache_key]
        if (datetime.now() - cached_time).seconds < 900:
            return jsonify(cached_data), 200

    api_key = os.getenv("OPENWEATHER_API_KEY")
    if not api_key or api_key == "YOUR_API_KEY_HERE" or api_key == "demo_key":
        return jsonify({"error": "Platform missing or using invalid Weather API Key"}), 500

    try:
        if lat and lon:
            current_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
        else:
            current_url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric"
        
        print(f"DEBUG: Weather fetching from: {current_url}")
        resp = requests.get(current_url, timeout=8)
        if resp.status_code != 200:
            print(f"DEBUG: Weather API Error {resp.status_code}: {resp.text}")
            return jsonify({"error": "Failed to fetch weather data from external provider."}), 502
            
        data = resp.json()
        temp = round(data["main"]["temp"])
        humidity = data["main"]["humidity"]
        rain = data.get("rain", {}).get("1h", 0)
        wind_speed = round(data["wind"]["speed"] * 3.6, 1)
        condition = data["weather"][0]["main"]
        resolved_city = data.get("name", city)

        advice, alerts = generate_weather_insights(temp, humidity, rain, wind_speed, condition, crop_name)

        response_data = {
            "location": resolved_city,
            "temperature": temp,
            "humidity": humidity,
            "rain": rain,
            "windSpeed": wind_speed,
            "weatherCondition": condition.title(),
            "farmingAdvice": advice,
            "alerts": alerts
        }
        
        # Save to database historical collection
        try:
            mongo.db.weatherHistory.insert_one({
                "location": resolved_city,
                "temperature": temp,
                "humidity": humidity,
                "rain": rain,
                "condition": condition,
                "timestamp": datetime.utcnow()
            })
        except Exception as e:
            log_to_file(f"Failed to log weather history: {e}")

        weather_cache[cache_key] = (response_data, datetime.now())
        return jsonify(response_data), 200

    except Exception as e:
        log_to_file(f"Weather API Error: {str(e)}")
        return jsonify({"error": "Internal Server Error fetching weather."}), 500

@app.route("/api/weather/advice", methods=["GET"])
def get_weather_advice():
    """Fetch generic or crop-specific advice based on location current weather"""
    return get_weather_current()

@app.route("/api/weather/alerts", methods=["GET"])
def get_weather_alerts():
    """Fetch active alerts only"""
    response, status_code = get_weather_current()
    if status_code == 200:
        return jsonify({"alerts": response.json["alerts"]}), 200
    return response, status_code

@app.route("/api/districts", methods=["GET"])
def get_districts():
    """Returns a list of unique districts/locations from available listings."""
    try:
        # Get distinct locations from Listings
        districts = mongo.db.Listings.distinct("location")
        # Also include districts from Users if they are farmers
        user_districts = mongo.db.Users.distinct("district", {"role": "farmer"})
        
        # Combine and clean
        all_districts = list(set([d for d in districts + user_districts if d]))
        all_districts.sort()
        
        return jsonify(all_districts), 200
    except Exception as e:
        log_to_file(f"Error fetching districts: {str(e)}")
        return jsonify(["Nashik", "Pune", "Nagpur", "Ludhiana", "Karnal", "Jaipur"]), 200 # Static fallback

@app.route("/api/notifications", methods=["GET"])
@jwt_required()
def get_notifications():
    user_id = get_jwt_identity()
    notifications = []
    # Fetch 20 most recent notifications (both read and unread)
    # This ensures they remain visible "after reading" as requested
    query = {"user_id": ObjectId(user_id)}
    for n in mongo.db.Notifications.find(query).sort("created_at", -1).limit(20):
        notifications.append({
            "id": str(n["_id"]),
            "type": n["type"],
            "title": n["title"],
            "message": n["message"],
            "read": n.get("read", False),
            "created_at": n["created_at"].isoformat() if isinstance(n["created_at"], datetime) else n["created_at"]
        })
    return jsonify(notifications), 200

@app.route("/api/notifications/read", methods=["PUT"])
@jwt_required()
def mark_notifications_read():
    user_id = get_jwt_identity()
    mongo.db.Notifications.update_many(
        {"user_id": ObjectId(user_id), "read": False},
        {"$set": {"read": True}}
    )
    return jsonify({"message": "Notifications marked as read"}), 200

@app.route("/api/notifications/<notif_id>", methods=["DELETE"])
@jwt_required()
def delete_notification(notif_id):
    user_id = get_jwt_identity()
    result = mongo.db.Notifications.delete_one({"_id": ObjectId(notif_id), "user_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        return jsonify({"error": "Notification not found"}), 404
    return jsonify({"message": "Notification deleted"}), 200

@app.route("/api/ondc/responses/<transaction_id>", methods=["GET"])
def get_ondc_responses(transaction_id):
    responses = ondc_responses.get(transaction_id, [])
    return jsonify(responses), 200

@app.route("/api/bpp/select", methods=["POST"])
@jwt_required()
def bpp_select():
    data = request.get_json()
    transaction_id = data.get("context", {}).get("transaction_id")
    order_data = data.get("message", {}).get("order", {})
    item = order_data.get("items", [{}])[0]
    item_id = item.get("id")
    quantity = item.get("quantity", {}).get("count", 1)
    
    listing = mongo.db.Listings.find_one({"_id": ObjectId(item_id)})
    if not listing:
        return jsonify({"error": "Listing not found"}), 404

    ondc_responses[transaction_id] = [
        {
            "context": {"action": "on_select", "transaction_id": transaction_id},
            "message": {
                "order": {
                    "items": [{
                        "id": item_id, 
                        "title": listing["name"], 
                        "price": listing["price_per_unit"],
                        "quantity": {"count": quantity}
                    }],
                    "quote": {"price": {"value": listing["price_per_unit"] * quantity}}
                }
            }
        }
    ]
    return jsonify({"message": "Selection initiated"}), 200

@app.route("/api/bpp/confirm", methods=["POST"])
@jwt_required()
def bpp_confirm():
    buyer_id = get_jwt_identity()
    data = request.get_json()
    transaction_id = data.get("context", {}).get("transaction_id")
    order_data = data.get("message", {}).get("order")
    
    # Extract item info (Assuming single item for simplification)
    item = order_data.get("items", [{}])[0]
    item_id = item.get("id")
    
    listing = mongo.db.Listings.find_one({"_id": ObjectId(item_id)})
    if not listing:
        return jsonify({"error": "Listing for order not found"}), 404
        
    buyer = mongo.db.Users.find_one({"_id": ObjectId(buyer_id)})
    buyer_name = buyer["name"] if buyer else "Unknown Buyer"

    # Create real order document
    order = {
        "buyer_id": ObjectId(buyer_id),
        "seller_id": listing["seller_id"],
        "listing_id": ObjectId(item_id),
        "crop_name": listing["name"],
        "buyer_name": buyer_name,
        "quantity": item.get("quantity", {}).get("count", 1), # Default to 1 if not specified
        "unit": listing.get("unit", "kg"),
        "total_price": float(listing["price_per_unit"]) * item.get("quantity", {}).get("count", 1),
        "status": "Pending",
        "order_id_str": "ORD-" + transaction_id[:8].upper(),
        "created_at": time.strftime("%Y-%m-%d %H:%M:%S")
    }

    inserted_id = mongo.db.Orders.insert_one(order).inserted_id

    # Inventory Tracking: Reserve stock instantly on placement
    mongo.db.Listings.update_one(
        {"_id": ObjectId(item_id)},
        {"$inc": {"quantity": -int(order["quantity"])}}
    )

    # Trigger notification for seller (New Order Received)
    mongo.db.Notifications.insert_one({
        "user_id": listing["seller_id"],
        "type": "new_order",
        "title": "New Order Received",
        "message": f"You have a new order for {listing['name']} from {buyer_name}.",
        "read": False,
        "created_at": datetime.utcnow()
    })

    # Emit real-time notification to seller
    socketio.emit("new_order", {
        "order_id": str(inserted_id),
        "crop_name": listing["name"],
        "quantity": item.get("quantity", {}).get("count", 1),
        "total_price": order["total_price"],
        "buyer_name": buyer_name,
        "seller_id": str(listing["seller_id"])
    })

    ondc_responses[transaction_id] = [
        {
            "context": {"action": "on_confirm", "transaction_id": transaction_id},
            "message": {
                "order": {
                    "id": str(inserted_id),
                    "long_order_id": order["order_id_str"],
                    "state": "Confirmed",
                    **order_data
                }
            }
        }
    ]
    return jsonify({"message": "Order confirmed and saved", "order_id": str(inserted_id)}), 200

# -------------------- AI SELLER ASSISTANT --------------------

# Mapping Logic - Synced across platforms
CATEGORIES = {
    "Vegetables": ["tomato", "potato", "onion", "carrot", "cabbage", "broccoli", "cucumber",
                   "pepper", "brinjal", "chilli", "garlic", "ginger", "lemon", "cauliflower",
                   "spinach", "pea", "corn", "vegetable", "produce", "okra", "ladyfinger",
                   "gourd", "bitter gourd", "ridge gourd", "eggplant", "bean", "pumpkin"],
    "Fruits": ["apple", "banana", "mango", "orange", "grapes", "pineapple", "strawberry",
               "kiwi", "watermelon", "berry", "pomegranate", "papaya", "citrus", "fruit",
               "lychee", "guava", "jackfruit", "peach", "plum"],
    "Cooked Food": ["pizza", "burger", "sandwich", "rice", "noodles", "pasta", "taco",
                    "sushi", "steak", "biryani", "curry", "dosa", "idli", "food", "dish", "cuisine"],
    "Grains": ["wheat", "maize", "barley", "millet", "dal", "pulses", "soybean",
               "mustard", "grain", "cereal", "paddy", "jowar", "bajra", "chickpea", "lentil"]
}

MARKET_PRICES = {
    "tomato": 18, "potato": 12, "onion": 25, "rice": 45, "apple": 85,
    "wheat": 22, "banana": 30, "kiwi": 450, "orange": 80, "mango": 60,
    "honey": 250, "grapes": 70, "corn": 15, "carrot": 35, "broccoli": 120,
    "okra": 40, "ladyfinger": 40, "cabbage": 20, "cauliflower": 30, "spinach": 25,
    "ginger": 80, "garlic": 120, "pumpkin": 18, "guava": 40, "papaya": 22,
    "dal": 90, "lentil": 90, "chickpea": 75, "soybean": 48, "mustard": 55,
    "maize": 20, "barley": 20, "paddy": 25, "millet": 22, "jowar": 20,
    "cucumber": 15, "eggplant": 30, "bean": 55, "pizza": 299, "burger": 99, "biryani": 180
}

HF_VIT_URL = "https://api-inference.huggingface.co/models/google/vit-base-patch16-224"

def _hf_classify_from_url(image_url, hf_token):
    """Download image from URL and classify with Hugging Face ViT."""
    try:
        img_resp = requests.get(image_url, timeout=10)
        if img_resp.status_code != 200:
            return None, None, None
        hf_headers = {"Authorization": f"Bearer {hf_token}", "Content-Type": "application/octet-stream"}
        hf_resp = requests.post(HF_VIT_URL, headers=hf_headers, data=img_resp.content, timeout=20)
        if hf_resp.status_code == 503:
            return "loading", None, None  # model warming up
        if hf_resp.status_code != 200:
            log_to_file(f"HF ViT Error {hf_resp.status_code}: {hf_resp.text[:200]}")
            return None, None, None
        predictions = hf_resp.json()
        if not isinstance(predictions, list) or not predictions:
            return None, None, None
        for pred in predictions[:5]:
            label_raw = pred.get("label", "").lower()
            score = pred.get("score", 0)
            if score < 0.05:
                continue
            label_parts = label_raw.replace(",", " ").split()
            for part in label_parts:
                for cat, keywords in CATEGORIES.items():
                    for kw in keywords:
                        if kw in part or part in kw:
                            return kw.title(), cat, round(score * 100, 1)
        # No agri match — use top label as-is
        top = predictions[0]
        return top.get("label", "").split(",")[0].strip().title(), "Other", round(top.get("score", 0) * 100, 1)
    except Exception as e:
        log_to_file(f"HF classify error: {str(e)}")
        return None, None, None


def _simulation_classify(text_hint):
    """Keyword fallback classification using URL/filename text."""
    text_lower = text_hint.lower()
    all_kw = [(kw, cat) for cat, kwds in CATEGORIES.items() for kw in kwds]
    all_kw.sort(key=lambda x: len(x[0]), reverse=True)
    for kw, cat in all_kw:
        if kw in text_lower:
            return kw.title(), cat, round(min(92, 82 + len(kw) / 1.5), 1)
    return "Unidentified Item", "Other", 40.0

def analyze_food_image(image_path_or_url, filename_for_fallback=""):
    """
    Core AI engine. Priority:
    1. Hugging Face ViT (real AI) if HF_API_TOKEN is set and image is a URL
    2. Keyword simulation using URL/filename text hint
    Returns: detected_item, category, confidence, ai_method, quality_info
    """
    detected_item = None
    category = None
    confidence = 0.0
    ai_method = "Simulation"

    hf_token = os.getenv("HF_API_TOKEN", "").strip()

    # --- Try Hugging Face ViT ---
    if hf_token and image_path_or_url.startswith("http"):
        hf_item, hf_cat, hf_conf = _hf_classify_from_url(image_path_or_url, hf_token)
        if hf_item == "loading":
            log_to_file("HF ViT model warming up — falling back to simulation")
        elif hf_item and hf_conf is not None:
            detected_item = hf_item
            category = hf_cat
            confidence = hf_conf
            ai_method = "Hugging Face ViT"

    # --- Simulation fallback ---
    if detected_item is None:
        text_hint = image_path_or_url + " " + filename_for_fallback
        detected_item, category, confidence = _simulation_classify(text_hint)
        ai_method = "Simulation"

    # --- Quality metrics ---
    conf_norm = confidence / 100.0
    quality_info = {
        "Color": "Vibrant" if conf_norm > 0.8 else "Natural",
        "Texture": "Firm" if conf_norm > 0.7 else "Standard",
        "Moisture": "Fresh" if conf_norm > 0.85 else "Dry",
        "Ripeness": "Optimal" if category in ["Fruits", "Vegetables"] else "N/A"
    }

    return detected_item, category, round(confidence, 1), ai_method, quality_info



# -------------------- STANDALONE APP ENDPOINT (UNIFIED) --------------------
import werkzeug.utils

@app.route("/api/identify", methods=["POST", "OPTIONS"])
@cross_origin()
def identify_standalone():
    """
    Endpoint for the Standalone AI Food Identifier App.
    Accepts multipart/form-data with an 'image' file.
    """
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
        
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Ensure upload dir exists
    UPLOAD_FOLDER = 'uploads'
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

    # Save temp file
    filename = werkzeug.utils.secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    # Run Unified AI Core
    # Passing filename for fallback simulation accuracy
    detected_item, category, confidence, ai_method, quality_info = analyze_food_image(filepath, filename)

    return jsonify({
        "name": detected_item,
        "category": category,
        "confidence": confidence,
        "method": ai_method,
        "quality_info": quality_info,
        "image_url": f"/uploads/{filename}"
    }), 200

@app.route('/api/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory('uploads', filename)

# -------------------- ORIGINAL LISTINGS (BACKWARD COMPAT) --------------------
# -------------------- CROP DISEASE DETECTION --------------------
@app.route("/api/detect-disease", methods=["POST"])
def detect_disease():
    """Identifies plant diseases from leaf images."""
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    
    file = request.files['image']
    try:
        image_bytes = file.read()
        hf_token = os.getenv("HF_API_TOKEN")
        
        # Using a specialized Plant Village model (ViT)
        API_URL = "https://api-inference.huggingface.co/models/nateraw/plant-village-vit"
        headers = {"Authorization": f"Bearer {hf_token}", "Content-Type": "application/octet-stream"}
        
        response = requests.post(API_URL, headers=headers, data=image_bytes, timeout=15)
        
        if response.status_code != 200:
             # Fallback mock for demo if API fails
             return jsonify({
                 "disease": "Early Blight",
                 "confidence": 88.5,
                 "treatment": "Apply copper-based fungicides. Remove infected lower leaves."
             }), 200

        predictions = response.json()
        if isinstance(predictions, list) and len(predictions) > 0:
            top = predictions[0]
            label = top['label'].replace("_", " ").title()
            
            # Simulated treatment advice
            advice = "Maintain proper spacing for ventilation and avoid overhead watering."
            if "blight" in label.lower():
                advice = "Use fungicide and rotate crops for the next season."
            elif "rust" in label.lower():
                advice = "Remove affected leaves and apply sulfur-based treatments."
                
            return jsonify({
                "disease": label,
                "confidence": round(top['score'] * 100, 1),
                "treatment": advice
            }), 200
            
        return jsonify({"error": "Detection failed"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -------------------- DEMAND ANALYTICS & HEATMAP --------------------
@app.route("/api/demand-heatmap", methods=["GET"])
def get_demand_heatmap():
    """Returns mock demand data for district-level visualization."""
    # Data structure for Leaflet heatmap
    # Scores: 0-1 (Blue to Red)
    demand_data = [
        {"district": "Salem", "lat": 11.6643, "lon": 78.1460, "score": 0.9, "level": "High"},
        {"district": "Erode", "lat": 11.3410, "lon": 77.7172, "score": 0.7, "level": "Medium"},
        {"district": "Coimbatore", "lat": 11.0168, "lon": 76.9558, "score": 0.85, "level": "High"},
        {"district": "Madurai", "lat": 9.9252, "lon": 78.1198, "score": 0.4, "level": "Low"},
        {"district": "Triunelveli", "lat": 8.7139, "lon": 77.7567, "score": 0.6, "level": "Medium"},
        {"district": "Chennai", "lat": 13.0827, "lon": 80.2707, "score": 0.95, "level": "High"},
        {"district": "Nashik", "lat": 19.9975, "lon": 73.7898, "score": 0.88, "level": "High"},
        {"district": "Pune", "lat": 18.5204, "lon": 73.8567, "score": 0.75, "level": "Medium"},
        {"district": "Agra", "lat": 27.1767, "lon": 78.0081, "score": 0.92, "level": "High"},
        {"district": "Lucknow", "lat": 26.8467, "lon": 80.9462, "score": 0.65, "level": "Medium"}
    ]
    return jsonify(demand_data), 200

# -------------------- LOGISTICS MATCHING --------------------
@app.route("/api/logistics/nearby", methods=["GET"])
def get_nearby_logistics():
    """Mock logistics matching service."""
    # lat = float(request.args.get("lat") or 0)
    # lon = float(request.args.get("lon") or 0)
    
    vehicles = [
        {"type": "Mini Truck", "capacity": "1.5 Ton", "distance": "2.4 km", "cost_est": 450, "driver": "Ramesh Kumar"},
        {"type": "Lorry", "capacity": "5 Ton", "distance": "5.1 km", "cost_est": 1200, "driver": "Suresh Singh"},
        {"type": "Pickup Van", "capacity": "800 kg", "distance": "0.8 km", "cost_est": 300, "driver": "Anil Verma"}
    ]
    return jsonify(vehicles), 200

# -------------------- RATINGS & TRUST --------------------
@app.route("/api/seller/<seller_id>/rating", methods=["GET"])
def get_seller_rating(seller_id):
    """Returns seller trust metrics."""
    return jsonify({
        "rating": 4.8,
        "total_orders": 124,
        "badges": ["Verified Farmer", "Bulk Seller", "Top Quality"],
        "joined": "March 2024"
    }), 200

@app.route("/api/listings", methods=["GET"])
def get_listings():
    listings = []
    for l in mongo.db.Listings.find():
        listings.append({
            "id": str(l["_id"]),
            "seller_id": str(l["seller_id"]),
            "name": l["name"],
            "quantity": l["quantity"],
            "price_per_unit": l["price_per_unit"],
            "location": l["location"],
            "harvest_date": l.get("harvest_date"),
            "quality_grade": l.get("quality_grade"),
            "image_url": l.get("image_url")
        })
    return jsonify(listings), 200

# -------------------- HUGGING FACE CROP DETECTION --------------------
@app.route("/api/detect-crop", methods=["POST"])
def detect_crop():
    """
    Endpoint to detect crop using Hugging Face Inference API.
    Accepts multipart/form-data with an 'image' file.
    """
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
        
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    # Validate extension
    allowed_extensions = {'png', 'jpg', 'jpeg'}
    file_ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
    
    if file_ext not in allowed_extensions:
        return jsonify({"error": "Invalid file type. Only JPG, JPEG, PNG allowed"}), 400
        
    try:
        # Read file as binary
        image_bytes = file.read()
        
        hf_token = os.getenv("HF_API_TOKEN")
        if not hf_token:
            return jsonify({"error": "Hugging Face API token not configured. Set HF_API_TOKEN in .env"}), 500
            
        headers = {
            "Authorization": f"Bearer {hf_token}",
            "Content-Type": "application/octet-stream"
        }
        
        API_URL = "https://api-inference.huggingface.co/models/google/vit-base-patch16-224"
        
        # Make request to HF Inference API
        response = requests.post(API_URL, headers=headers, data=image_bytes, timeout=15)
        
        if response.status_code != 200:
            log_to_file(f"HF API Error: {response.status_code} - {response.text}")
            return jsonify({"error": f"Model inference failed with status {response.status_code}"}), 502
            
        predictions = response.json()
        
        # Parse result
        if isinstance(predictions, list) and len(predictions) > 0 and 'label' in predictions[0]:
            top_prediction = predictions[0]['label']
            # Clean up the label if it's formatted like "banana, banana tree"
            clean_label = top_prediction.split(',')[0].strip()
            return jsonify({"prediction": clean_label}), 200
        elif "error" in predictions:
            if "currently loading" in predictions.get("error", "").lower():
                return jsonify({"error": "Model is currently loading. Please try again in 30 seconds."}), 503
            return jsonify({"error": predictions["error"]}), 500
        else:
            return jsonify({"error": "Unexpected response format from model", "raw": predictions}), 500
            
    except requests.exceptions.Timeout:
        return jsonify({"error": "Hugging Face API request timed out"}), 504
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        log_to_file(f"detect-crop ERROR: {str(e)}\n{tb}")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@app.route('/api/seller/negotiations', methods=['GET'])
@jwt_required()
def get_seller_negotiations():
    # Mock data for negotiations
    negotiations = [
        {
            "id": "neg_1",
            "buyer_name": "Organic Greens Ltd",
            "crop_name": "Fresh Spinach",
            "listing_price": 45,
            "offer_price": 40,
            "quantity": 200,
            "unit": "kg",
            "status": "pending",
            "created_at": "2024-03-12T10:00:00Z"
        },
        {
            "id": "neg_2",
            "buyer_name": "Metro Wholesalers",
            "crop_name": "Red Onions",
            "listing_price": 28,
            "offer_price": 25,
            "quantity": 1000,
            "unit": "kg",
            "status": "countered",
            "created_at": "2024-03-11T14:30:00Z"
        }
    ]
    return jsonify(negotiations)

@app.route('/api/seller/negotiations/<neg_id>', methods=['PUT', 'POST'])
@jwt_required()
def respond_negotiation(neg_id):
    data = request.json
    status = data.get('status') # accepted, rejected, countered
    return jsonify({"message": f"Negotiation {neg_id} updated to {status}", "status": status})

# -------------------- ADMIN ROUTES --------------------
@app.route("/api/admin/stats", methods=["GET"])
def get_admin_stats():
    """Get real platform-wide statistics for admin dashboard"""
    try:
        total_farmers   = mongo.db.Users.count_documents({"role": "farmer"})
        total_buyers    = mongo.db.Users.count_documents({"role": "buyer"})
        total_orders    = mongo.db.Orders.count_documents({})
        total_listings  = mongo.db.Listings.count_documents({})

        # Revenue = sum of all delivered orders
        delivered = mongo.db.Orders.find({"status": "Delivered"})
        total_revenue = sum(o.get("total_price", 0) for o in delivered)

        # Pending orders
        pending_orders = mongo.db.Orders.count_documents({"status": "Pending"})

        return jsonify({
            "totalFarmers":  total_farmers,
            "totalBuyers":   total_buyers,
            "totalOrders":   total_orders,
            "totalListings": total_listings,
            "totalRevenue":  total_revenue,
            "pendingOrders": pending_orders,
        }), 200
    except Exception as e:
        log_to_file(f"Admin stats error: {str(e)}")
        return jsonify({"error": "Failed to fetch admin stats"}), 500


@app.route("/api/admin/orders-by-day", methods=["GET"])
def get_orders_by_day():
    """Get order counts for the last 7 days for a trend chart"""
    try:
        from datetime import date, timedelta as td

        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        result = []

        for i in range(6, -1, -1):   # 6 days ago → today
            day_start = today - td(days=i)
            day_end   = day_start + td(days=1)
            count = mongo.db.Orders.count_documents({
                "created_at": {"$gte": day_start, "$lt": day_end}
            })
            result.append({
                "day": day_start.strftime("%a"),   # Mon, Tue …
                "orders": count
            })

        return jsonify(result), 200
    except Exception as e:
        log_to_file(f"Orders-by-day error: {str(e)}")
        return jsonify({"error": "Failed to fetch daily orders"}), 500


@app.route("/api/seller/revenue-chart", methods=["GET"])
@jwt_required()
def get_seller_revenue_chart():
    """Get revenue for the last 7 days for the logged-in seller"""
    try:
        from datetime import date, timedelta as td
        seller_id = get_jwt_identity()
        
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        result = []

        for i in range(6, -1, -1):
            day_start = today - td(days=i)
            day_end   = day_start + td(days=1)
            
            orders = list(mongo.db.Orders.find({
                "seller_id": seller_id,
                "created_at": {"$gte": day_start, "$lt": day_end}
            }))
            
            revenue = sum(o.get("total_price", 0) for o in orders)
            
            result.append({
                "day": day_start.strftime("%a"),
                "sales": revenue
            })

        return jsonify(result), 200
    except Exception as e:
        log_to_file(f"Seller revenue chart error: {str(e)}")
        return jsonify({"error": "Failed to fetch revenue data"}), 500


@app.route("/api/transactions", methods=["GET"])
@jwt_required()
def get_transactions():
    """Get unified transaction history (completed/paid orders)"""
    try:
        user_id = get_jwt_identity()
        user = mongo.db.Users.find_one({"_id": ObjectId(user_id)})
        
        if not user:
            # Fallback if user object is missing but ID exists in JWT
            role = "farmer" # Default or logic based on JWT claims if available
        else:
            role = user.get("role")

        query = {}
        if role == "farmer":
            query["seller_id"] = user_id
        else:
            query["buyer_id"] = user_id
            
        # For simplicity, we return all orders as "transactions"
        # In a real app, this might only be "completed" or "accepted" ones
        orders = list(mongo.db.Orders.find(query).sort("created_at", -1))
        
        result = []
        for o in orders:
            result.append({
                "id": str(o.get("_id")),
                "cropName": o.get("crop_name"),
                "quantity": o.get("quantity"),
                "unit": o.get("unit", "kg"),
                "totalPrice": o.get("total_price", 0),
                "paymentStatus": o.get("payment_status", "paid"),
                "status": o.get("status", "Pending"),
                "placedAt": o.get("created_at").isoformat() if isinstance(o.get("created_at"), datetime) else o.get("created_at")
            })

        return jsonify(result), 200
    except Exception as e:
        log_to_file(f"Transactions error: {str(e)}")
        return jsonify({"error": "Failed to fetch transactions"}), 500


# -------------------- RUN APP --------------------
if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True, allow_unsafe_werkzeug=True)

# Force Flask Reload to apply latest inventory logic fixes
