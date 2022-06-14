from fastapi import FastAPI, File
from predictor import predict_celeb
from qwant import get_celeb_image
import numpy as np
import cv2

app = FastAPI()


@app.get("/")
async def root():
    return {"Status": "Working"}


@app.post("/predict")
async def predict(file: bytes = File()):
    data = []
    # request_object_content = await file.read()
    image_raw = np.asarray(bytearray(file), dtype='uint8')
    image = cv2.imdecode(image_raw, cv2.IMREAD_COLOR)
    results = predict_celeb(image)[0]

    for name, confidence in results[0:3]:
        name = name.split(" ")[-1].strip("'").replace('_', ' ')
        # name = name.encode('unicode_escape').decode('utf-16')
        print(name)
        celeb_image = get_celeb_image(name)
        data.append(
            {
                'name': name,
                'confidence': round(confidence*100, 1),
                'image': celeb_image
            }
        )
    return data
