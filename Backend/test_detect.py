import requests

url = "http://localhost:5000/detect-crop"
img_data = requests.get("https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Red_Apple.jpg/265px-Red_Apple.jpg").content

files = {'image': ('apple.jpg', img_data, 'image/jpeg')}

try:
    response = requests.post(url, files=files)
    print("Status Code:", response.status_code)
    print("Response:", response.json())
except Exception as e:
    print("Error:", str(e))
