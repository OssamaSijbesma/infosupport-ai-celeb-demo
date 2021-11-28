
import cv2
from flask import Flask, render_template, Response, g, request
import numpy as np
from camera import VideoCamera
from predict import predict_from_img
from google_images import get_celebrity_image_url
import base64

app = Flask(__name__)
video_stream = VideoCamera()


@app.route('/')
def index():
    g.show_results = False
    return render_template('index.html')


@app.route('/video_feed')
def video_feed():
    return Response(gen(video_stream),
                    mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/predict')
def predict():
    data = []
    try:
        frame = video_stream.get_raw_frame()
        img = np.asarray(bytearray(frame), dtype='uint8')
        img = cv2.imdecode(img, cv2.IMREAD_COLOR)
        predictions = predict_from_img(frame)[0]
        predictions = predictions[0:3]

        for pred in predictions:
            name, conf = pred
            name = name.split(" ")[-1].strip("'").replace('_', ' ')
            img_url = get_celebrity_image_url(name)
            data.append(
                {
                    'name': name,
                    'ref_pic': False,
                    'conf': round(conf*100, 1),
                    'img_src': img_url
                }
            )
    except Exception as e:
        g.exception = True
        g.message = e

    return render_template('result.html', data=data)


def gen(camera):
    while True:
        frame = camera.get_frame()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')


if __name__ == '__main__':
    app.run(host='127.0.0.1', debug=True, port="5000")
