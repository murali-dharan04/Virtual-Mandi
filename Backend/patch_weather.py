import sys

with open('app.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

output = []
in_weather_block = False

# New block to insert
new_block = '''# -------------------- WEATHER API --------------------
from weather_engine import generate_weather_insights

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
        
        resp = requests.get(current_url, timeout=8)
        if resp.status_code != 200:
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

'''

for i, line in enumerate(lines):
    if "# -------------------- WEATHER API --------------------" in line:
        in_weather_block = True
        output.append(new_block)
        continue
    
    if in_weather_block:
        if "@app.route(\"/api/notifications\"" in line:
            in_weather_block = False
            output.append(line)
        continue
        
    output.append(line)

with open('app.py', 'w', encoding='utf-8') as f:
    f.writelines(output)
print('Done replacing.')
