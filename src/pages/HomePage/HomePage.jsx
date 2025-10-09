import { useState, useRef } from "react";
import Webcam from "react-webcam";
import CapturedImage from "../../components/CapturedImage/CapturedImage";
import Button from "../../components/Button/Button";

import styles from "./HomePage.module.css";

const HomePage = () => {
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const webcamRef = useRef(null);

    // Настройки камеры: задняя камера на смартфонах
    // const videoConstraints = {
    //     facingMode: { ideal: "environment" },
    // };

    const videoConstraints = {
        facingMode: "environment",
    };

    const handleStartCamera = () => {
        setCapturedImage(null);
        setIsCameraOn(true);
        // setIsLoading(true);///////////////////////
    };

    const handleStopCamera = () => {
        const video = webcamRef.current?.video;
        const tracks = video?.srcObject?.getTracks();
        tracks?.forEach((track) => track.stop());
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

            {!isCameraOn && !capturedImage && (     // Camera off
                <>
                    <div className={styles.wrapBtn}>
                        <Button onClick={handleStartCamera}>Turn on the camera</Button>
                    </div>
                </>
            )}

            {isCameraOn && isLoading && (
                <div className={styles.loadingText}>
                    <p>Starting camera...</p>
                </div>
            )}

            {isCameraOn && (     // Camera on
                <>
                    <div className={styles.webcamWrap}>
                        <Webcam
                            ref={webcamRef}
                            audio={false}
                            screenshotFormat="image/png"
                            videoConstraints={videoConstraints}
                            onUserMedia={() => setIsLoading(true)}         // камера включилась/////////////
                            onUserMediaError={() => setIsLoading(false)}
                            width={window.innerWidth}
                            height={window.innerHeight * 0.8} // под 80vh
                        />
                    </div>
                    <div className={styles.wrapBtn}>
                        <Button onClick={handleCapture}>Scan pH strip</Button>
                        <Button onClick={handleStopCamera}>Home</Button>
                    </div>
                </>
            )}

            {capturedImage && (<CapturedImage
                src={capturedImage}
                handleStartCamera={handleStartCamera}
                handleReset={handleReset}
            />
            )}
        </>
    )
}

export default HomePage;