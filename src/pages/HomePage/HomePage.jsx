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
    const videoConstraints = {
        facingMode: { ideal: "environment" },
    };

    const handleStartCamera = async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1.5 сек "загрузка"
            setCapturedImage(null);  // сброс предыдущего фото
            setIsCameraOn(true);
        } catch (err) {
            console.error("Error starting camera:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStopCamera = () => {
        // if (webcamRef.current) {
        //     const tracks = webcamRef.current.video.srcObject?.getTracks();
        //     tracks?.forEach((track) => track.stop());
        // }
        // setIsCameraOn(false);
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

            {isLoading && <p className={styles.loadingText}>Starting camera...</p>}

            {isCameraOn && (     // Camera on
                <>
                    <div className={styles.webcamWrap}>
                        <Webcam
                            ref={webcamRef}
                            audio={false}
                            screenshotFormat="image/png"
                            videoConstraints={videoConstraints}
                            onUserMedia={() => setIsLoading(false)}         // камера включилась
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