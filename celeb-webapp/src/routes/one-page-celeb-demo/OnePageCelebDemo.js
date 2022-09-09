import React, {useEffect, useState, useRef} from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as tf from '@tensorflow/tfjs';
import Webcam from "react-webcam";
import './OnePageCelebDemo.css';

function OnePageCelebDemo() {
  const webcamRef = useRef(null);
  const [videoWidth] = useState(640);
  const [videoHeight] = useState(480);
  const [model, setModel] = useState();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

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
      document.addEventListener("keydown", keyFunction, false);
    });
  }, []);

  useEffect(() => {
    document.getElementById("cameraOutput").onloadeddata = function() {
      predictObject();
    };
  }, [model]);

  function keyFunction(event){
    if (event.key === "0") {
        predictCeleb();
    }
  }

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
    setLoading(true);
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
    })
    .then(response => response.json())
    .then(predictions => {
      console.log(predictions);
      setResults(predictions);     
    })
    .finally(() => setLoading(false));
  }

  function getColorClass(percentage){
    if(percentage < 33) return 'progress-bar-red';
    else if(percentage < 66) return 'progress-bar-orange';
    return 'progress-bar-green';
  }

  return (
    <section>
      <section className='title-bar'>
        <img className='logo' alt="logo Aigency" src="/aigency.png" />
        <h1 className='title'><a href="/">celebrity matcher</a></h1>
      </section>
      <section className='main-content'>
        <section className='results-content'>
          {results?.map(result => (
            <div className='card result' style={{'background-image': `url(${result.image})`}} key={result.name}>
              {/* <img className='img-celeb' alt='predicted celeb' src={result.image} /> */}

              <div className='progress-bar'>
                <div className={getColorClass(result.confidence)} style={{width: result.confidence + '%' }}>
                  <div className='progress-bar-text'>{result.confidence}%</div>
                </div>
              </div>
              <h3 className='result-name'>{result.name}</h3>
            </div>
          ))}
        </section>
        <section className='right-main-content'>
          <div className='frame-wrapper'>
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
          <div className='horizontal-flex'>
            <button className='card' type="button" variant={"contained"} onClick={() => { predictCeleb(); }}>
              <img className='image-button' src='/midjr.png'/>
            </button>
            <div className='loader'style={{ visibility: loading ? "visible" : "hidden" }}>Loading...</div>
          </div>
        </section>
      </section>
    </section>
  );
}

export default OnePageCelebDemo;
