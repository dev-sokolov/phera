import { useState, useRef } from "react";
import Webcam from "react-webcam";

import styles from "./HomePage.module.css";

const HomePage = () => {
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);

    const webcamRef = useRef(null);

    // Настройки камеры: задняя камера на смартфонах

    const videoConstraints = {
        facingMode: { ideal: "environment" },
    };

    const handleStartCamera = async () => {
        try {
            setIsCameraOn(true);
            setCapturedImage(null);  // сброс предыдущего фото
        } catch (err) {
            console.error("Error starting camera:", err);
        }
    };

    const handleStopCamera = () => {
        if (webcamRef.current) {
            const tracks = webcamRef.current.video.srcObject?.getTracks();
            tracks?.forEach((track) => track.stop());
        }
        setIsCameraOn(false);
    };

    const handleCapture = () => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            setCapturedImage(imageSrc);
            handleStopCamera();
        }
    };

    const handleReset = () => {
        if (webcamRef.current) {
            const tracks = webcamRef.current.video.srcObject?.getTracks();
            tracks?.forEach((track) => track.stop());
        }
        setCapturedImage(null);
        setIsCameraOn(false);
    };

    return (
        <>
            <div className={styles.wrapGreeting}>
                <p className={styles.greeting}>Welcome page</p>
            </div>

            <div className={styles.wrapBtn}>
                {!isCameraOn && !capturedImage && (
                    <button onClick={handleStartCamera} className={styles.btn}>
                        Turn on the camera
                    </button>
                )}
                {isCameraOn && (
                    <>
                        <button onClick={handleCapture} className={styles.btn}>
                            Scan pH strip
                        </button>
                        <button onClick={handleStopCamera} className={styles.btn}>
                            Home
                        </button>
                    </>
                )}
            </div>

            {isCameraOn && (
                <div className={styles.webcamWrap}>
                    <Webcam
                        ref={webcamRef}
                        audio={false}
                        screenshotFormat="image/png"
                        videoConstraints={videoConstraints}
                        width={window.innerWidth}
                        height={window.innerHeight * 0.8} // под 80vh
                    />
                </div>
            )}

            {capturedImage && (
                <>
                    <div className={styles.capturedWrap}>
                        <p>Captured Image:</p>
                        <img src={capturedImage} alt="pH strip" className={styles.capturedImg} />
                        <button onClick={handleStartCamera} className={styles.btn}>
                            Retake
                        </button>
                        <button onClick={handleReset} className={styles.btn}>
                            Home
                        </button>
                    </div>
                </>
            )}
        </>
    )
}

export default HomePage;