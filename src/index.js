import React from "react";
import ReactDOM from "react-dom";

import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import "./styles.css";

class App extends React.Component {
  videoRef = React.createRef();
  canvasRef = React.createRef();
  photoRef = React.createRef();

  // default size snap er de ballen van 🤔
  dimensions = {
    width: 640,
    height: 480
  }

  componentDidMount() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const webCamPromise = navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: {
            facingMode: "user",
            width: this.dimensions.width,
            height: this.dimensions.height
          }
        })
        .then(stream => {
          window.stream = stream;
          this.videoRef.current.srcObject = stream;
          return new Promise((resolve, reject) => {
            this.videoRef.current.onloadedmetadata = () => {
              resolve();
            };
          });
        });
      const modelPromise = cocoSsd.load();
      Promise.all([modelPromise, webCamPromise])
        .then(values => {
          this.detectFrame(this.videoRef.current, values[0]);
        })
        .catch(error => {
          console.error(error);
        });
    }
  }

  detectFrame = (video, model) => {
    model.detect(video).then(predictions => {
      this.renderPredictions(predictions);
      requestAnimationFrame(() => {
        this.detectFrame(video, model);
      });
    });
  };

  renderPredictions = predictions => {
    const font = "16px sans-serif";
    const ctx = this.canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // Font options.
    ctx.font = font;
    ctx.textBaseline = "top";
    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      const width = prediction.bbox[2];
      const height = prediction.bbox[3];
      // Draw the bounding box.
      ctx.strokeStyle = "#00FFFF";
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, width, height);
      // Draw the label background.
      ctx.fillStyle = "#00FFFF";
      const textWidth = ctx.measureText(prediction.class).width;
      const textHeight = parseInt(font, 10); // base 10
      ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
    });

    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      // Draw the text last to ensure it's on top.
      ctx.fillStyle = "#000000";
      ctx.fillText(prediction.class, x, y);
    });
  };

  makePicture = () => {
    const ctx = this.photoRef.current.getContext("2d");
    ctx.drawImage(this.videoRef.current, 0, 0);
    let data = this.photoRef.current.toDataURL("image/png");
    console.log(data);
    console.log(data.replace(/^data:image\/(png|jpg);base64,/, ""));
    setTimeout( function() {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    }, 500);
  };

  render() {
    return (
      <section>
        <div className="wrapper">
          <div className="frame-wrapper">
            <video
              className="frame"
              autoPlay
              ref={this.videoRef}
              height={`${this.dimensions.height}px`}
              width={`${this.dimensions.width}px`}
            />
            <canvas
              className="frame"
              ref={this.canvasRef}
              height={`${this.dimensions.height}px`}
              width={`${this.dimensions.width}px`}
            />
            <canvas
              className="frame"
              ref={this.photoRef}
              height={`${this.dimensions.height}px`}
              width={`${this.dimensions.width}px`}
            />
          </div>
        <button onClick={this.makePicture}>Smile! <span role="img">📸</span></button>
        </div>
      </section>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
