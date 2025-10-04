import { useState, useRef } from "react";
import Webcam from "react-webcam";

import styles from "./App.module.css"

function App() {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  const webcamRef = useRef(null);
  // const WebcamComponent = () => <Webcam />;
  const handleStartCamera = () => {
    setIsCameraOn(true);
    setCapturedImage(null); // сброс предыдущего фото
  }

  const handleStopCamera = () => {
    if (webcamRef.current) {
      const tracks = webcamRef.current.video.srcObject?.getTracks();
      tracks?.forEach((track) => track.stop());
    }
    setIsCameraOn(false);
  };

  // Настройки камеры: задняя камера на смартфонах
  // const videoConstraints = {
  //   facingMode: { exact: "environment" }, // или просто "environment"
  // };

  const handleCapture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      handleStopCamera(); // остановка камеры после снимка (по желанию)
    }
  };

  return (
    <>
      <div className={styles.wrapGreeting}>
        <p className={styles.greeting}>Hello App!!!</p>
      </div>

      <div className={styles.wrapBtn}>
        {!isCameraOn && !capturedImage && (
          // {!isCameraOn && (
          <button onClick={handleStartCamera} className={styles.btn}>
            Start Camera
          </button>
        )}
        {isCameraOn && (
          <>
            <button onClick={handleCapture} className={styles.btn}>
              Scan pH strip
            </button>
            <button onClick={handleStopCamera} className={styles.btn}>
              Stop Camera
            </button>
          </>
        )}
      </div>

      {isCameraOn && (
        <div className={styles.webcamWrap}>
          <Webcam ref={webcamRef} audio={false} screenshotFormat="image/png" />
        </div>
      )}
      {/* {showWebcam && (
        <div>
          <Webcam />
        </div>
      )} */}
      {/* ----------------------- */}

      {capturedImage && (
        <>
          <div className={styles.capturedWrap}>
            <p>Captured Image:</p>
            <img src={capturedImage} alt="pH strip" className={styles.capturedImg} />
            <button onClick={handleStartCamera} className={styles.btn}>
              Retake
            </button>
          </div>
        </>

      )}





    </>
  )
}

export default App
