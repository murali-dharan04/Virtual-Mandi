import os
import requests
import json
from dotenv import load_dotenv

load_dotenv(dotenv_path='d:/Virtual-Mandi-main/Backend/.env')

def test_market_api():
    api_key = os.getenv("DATA_GOV_API_KEY")
    state = "Tamil Nadu"
    # Resource ID: 9ef84268-d588-465a-a308-a864a43d0070
    url = f"https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key={api_key}&format=json&filters[state]={state}&limit=5"
    
    print(f"URL: {url}")
    try:
        response = requests.get(url)
        if response.status_code == 200:
            print("Response success!")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_market_api()
