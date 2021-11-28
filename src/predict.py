from flask import Flask
from mtcnn.mtcnn import MTCNN
from keras_vggface.vggface import VGGFace
from keras_vggface.utils import preprocess_input
from keras_vggface.utils import decode_predictions
import PIL
from urllib import request
import numpy as np
import cv2

# app = Flask(__name__)


def get_img(url):
    # Open the link and save the image to res
    res = request.urlopen(url)
    # Read the res object and convert it to an array
    img = np.asarray(bytearray(res.read()), dtype='uint8')
    # Add the color variable
    img = cv2.imdecode(img, cv2.IMREAD_COLOR)
    return img


def find_face(img, detector=None):
    # Initialize mtcnn detector
    detector = MTCNN() if detector is None else detector
    # set face extraction parameters
    target_size = (224, 224)  # output image size
    border_rel = 0  # increase or decrease zoom on image
    # detect faces in the image
    detections = detector.detect_faces(img)
    x1, y1, width, height = detections[0]['box']
    dw = round(width * border_rel)
    dh = round(height * border_rel)
    x2, y2 = x1 + width + dw, y1 + height + dh
    face = img[y1:y2, x1:x2]
    # resize pixels to the model size
    face = PIL.Image.fromarray(face)
    face = face.resize((224, 224))
    face = np.asarray(face)
    return face


def preprocess_face(face):
    # convert to float32
    face_pp = face.astype('float32')
    face_pp = np.expand_dims(face_pp, axis=0)
    face_pp = preprocess_input(face_pp, version=2)
    return face_pp


def predict(face_pp, model=None):
    model = VGGFace(model='senet50') if model is None else model
    return model.predict(face_pp)


def extract_and_display_results(prediction, img):
    # convert predictions into names & probabilities
    results = decode_predictions(prediction)
    # Display results
#   cv2.imshow('ImageWindow', img)
#   cv2.waitKey()
    for result in results[0]:
        print(f'{result[0]}: {round(result[1]*100, 2)}')
    return results


def predict_from_image_url(url, face_detector=None, model=None):
    img = get_img(url)
    return predict_from_img(img, face_detector=face_detector, model=model)


def predict_from_img(img, face_detector=None, model=None):
    face = find_face(img, detector=face_detector)
    face_pp = preprocess_face(face)
    prediction = predict(face_pp, model=model)
    return extract_and_display_results(prediction, img)


# URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Channing_Tatum_by_Gage_Skidmore_3.jpg/330px-Channing_Tatum_by_Gage_Skidmore_3.jpg"
detector = MTCNN()
model = VGGFace(model='resnet50')
