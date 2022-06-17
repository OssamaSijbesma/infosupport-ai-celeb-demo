import React, {useEffect, useState, useRef} from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as tf from '@tensorflow/tfjs';
import Webcam from "react-webcam";
import './InfoSupport.css';

function InfoSupport() {
  const webcamRef = useRef(null);
  const [videoWidth] = useState(640);
  const [videoHeight] = useState(480);
  const [model, setModel] = useState();

  const videoConstraints = {
    height: 480,
    width: 640,
    maxWidth: "100vw",
    facingMode: "environment",
  };

  async function loadModel() {
    try {
      const model = await cocoSsd.load();
      setModel(model);
      console.log("setloadedModel");

    } catch (err) {
      console.log(err);
      console.log("failed load model");
    }
  }

  useEffect(() => {
    tf.ready().then(() => {
      loadModel();
    });
  }, []);

  useEffect(() => {
    document.getElementById("cameraOutput").onloadeddata = function() {
      predictObject();
    };
  }, [model]);

  async function predictObject() {
    const predictions = await model.detect(document.getElementById("cameraOutput"));

    var cnvs = document.getElementById("myCanvas");
    cnvs.width =  webcamRef.current.video.videoWidth;
    cnvs.height = webcamRef.current.video.videoHeight;

    var ctx = cnvs.getContext("2d");
    ctx.clearRect(
      0,
      0,
      webcamRef.current.video.videoWidth,
      webcamRef.current.video.videoHeight
    );

    if (predictions.length > 0) {
      // setPredictionData(predictions);
      for (let n = 0; n < predictions.length; n++) {
        // Check scores
        if (predictions[n].score > 0.7) {
          let bboxLeft = predictions[n].bbox[0];
          let bboxTop = predictions[n].bbox[1];
          let bboxWidth = predictions[n].bbox[2];
          let bboxHeight = predictions[n].bbox[3];

          ctx.beginPath();
          ctx.font = "18px Arial";
          ctx.fillStyle = "red";

          ctx.fillText(
            predictions[n].class +
              ": " +
              Math.round(parseFloat(predictions[n].score) * 100) +
              "%",
            bboxLeft,
            bboxTop - 10
          );

          ctx.rect(bboxLeft, bboxTop, bboxWidth, bboxHeight);
          ctx.strokeStyle = "#FF0000";
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      }
    }

    setTimeout(() => predictObject(), 500);
  }

  async function predictCeleb() {
    const image = webcamRef.current.getScreenshot();
    const imageBlob = await fetch(image).then(response => response.blob());
    const payload = new FormData();
    payload.append("file",  imageBlob);

    fetch('http://127.0.0.1:8000/predict', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      body: payload
    }).then(result => console.log(result));
  }

  return (
    <section>
        <h1><a href="/infosupport">Celebrity Matcher</a></h1>
        <div class="wrapper">
            <div class="frame-wrapper">
              <Webcam
                audio={false}
                id="cameraOutput"
                ref={webcamRef}
                screenshotQuality={1}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
              />
              <canvas
                id="myCanvas"
                width={videoWidth}
                height={videoHeight}
                style={{ backgroundColor: "transparent" }}
              />
            </div>
            <div class="sidebar">
                <img class="logo" alt="logo InfoSupport" src="https://www.infosupport.com/wp-content/uploads/Info-Support-30cm-300DPI-PNG.png" />
                <form>
                    <button type="button" variant={"contained"} onClick={() => { predictCeleb(); }}
                >Match <span role="img" aria-label="picture">📸</span></button>
                </form>
            </div>
        </div>
    </section>
  );
}

export default InfoSupport;
