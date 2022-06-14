from mtcnn.mtcnn import MTCNN
from keras_vggface.vggface import VGGFace
from keras_vggface.utils import preprocess_input
from keras_vggface.utils import decode_predictions
import numpy as np
import PIL

detector = MTCNN()
model = VGGFace(model='senet50')


def get_face(image):
    # set face extraction parameters
    border_rel = 0  # increase or decrease zoom on image
    # detect faces in the image
    detections = detector.detect_faces(image)
    x1, y1, width, height = detections[0]['box']
    dw = round(width * border_rel)
    dh = round(height * border_rel)
    x2, y2 = x1 + width + dw, y1 + height + dh
    face = image[y1:y2, x1:x2]
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


def predict_celeb(image):
    face = get_face(image)
    face_pp = preprocess_face(face)
    results = model.predict(face_pp)
    return decode_predictions(results)
