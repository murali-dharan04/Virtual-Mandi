import os
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = r"D:\Virtual-Mandi-main\silver-tape-489018-p6-5a3224373280.json"

from google.cloud import vision

def detect_food(image_path):
    client = vision.ImageAnnotatorClient()

    with open(image_path, "rb") as image_file:
        content = image_file.read()

    image = vision.Image(content=content)

    response = client.label_detection(image=image)

    results = []
    for label in response.label_annotations:
        results.append({
            "name": label.description,
            "confidence": round(label.score * 100, 2)
        })

    return results