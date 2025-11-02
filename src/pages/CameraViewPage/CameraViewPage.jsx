import { useRef, useEffect, useState } from "react";
import Lottie from "lottie-react";
import Webcam from "react-webcam";
import styles from "./CameraViewPage.module.css";
import clickSoundFile from "../../assets/sounds/camera-click.mp3";
import notificationSound from "../../assets/sounds/notification.mp3";
import scanning from "../../assets/lottie/scanning.json";
import scanning_2 from "../../assets/lottie/scanning_2.json";
import scanning_3 from "../../assets/lottie/scanning_3.json";
import scanning_4 from "../../assets/lottie/scanning_4.json";
import processing from "../../assets/lottie/processing.json";
import processing_2 from "../../assets/lottie/processing_2.json";
import processing_3 from "../../assets/lottie/processing_3.json";
import processing_4 from "../../assets/lottie/processing_4.json";
import processing_5 from "../../assets/lottie/processing_5.json";
import processing_6 from "../../assets/lottie/processing_6.json";
import cross from "../../assets/icons/cross.png";

const CameraViewPage = ({ onCapture, onExit }) => {
    const webcamRef = useRef(null);
    const [isReady, setIsReady] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const stopCamera = () => {
        const video = webcamRef.current?.video;
        const tracks = video?.srcObject?.getTracks();
        tracks?.forEach((track) => track.stop());
    };

    const playClickSound = () => {
        const audio = new Audio(notificationSound);
        audio.play().catch(() => { });
    };

    const handleCapture = () => {
        setIsProcessing(true);

        setTimeout(() => {
            playClickSound();
        }, 1000)

        setTimeout(() => {
            const imageSrc = webcamRef.current?.getScreenshot();
            stopCamera();
            if (imageSrc) onCapture(imageSrc);
        }, 2300);
    };

    const handleUserMedia = () => {
        setTimeout(() => setIsReady(true), 150);
    };

    useEffect(() => stopCamera, []);

    return (
        <div className={styles.cameraContainer}>
            {!isReady && <div className={styles.darkBackground}></div>}
            <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/png"
                videoConstraints={{ facingMode: "environment" }}
                className={`${styles.webcamVideo} ${isReady ? styles.show : ""}`}
                onUserMedia={handleUserMedia}
                playsInline
            />
            <div className={styles.topControls}>
                <button
                    className={styles.exitBtn}
                    onClick={() => {
                        stopCamera();
                        onExit();
                    }}
                    aria-label="Exit to home"
                >
                    X
                </button>
            </div>

            <div className={styles.overlay}>
                <div className={styles.viewfinder}>
                    <div className={styles["bottom-left"]}></div>
                    <div className={styles["bottom-right"]}></div>
                </div>
            </div>
            <div className={styles.wrapBtn}>
                <button
                    className={styles.scanBtn}
                    onClick={handleCapture}
                    style={{ opacity: isProcessing ? 0 : 1 }}
                ></button>

                <Lottie
                    key={isProcessing ? "processing" : "idle"}
                    animationData={processing_6}
                    loop={false}
                    style={{
                        width: "80px",
                        height: "80px",
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        opacity: isProcessing ? 1 : 0,
                        pointerEvents: "none",
                        filter: "brightness(0) invert(1)",
                    }}
                />
            </div>
        </div>
    );
};

export default CameraViewPage;

// --------------------------------------!!!!!!!!!!!!!!!!!!---------------------




