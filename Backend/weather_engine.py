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
            
    # Combine advice into a single string (just using the most critical ones if multiple, or joining them)
    # The prompt expects a single `farmingAdvice` string per response, so we will join them.
    final_advice = " ".join(advice_list)
    
    return final_advice, alerts
