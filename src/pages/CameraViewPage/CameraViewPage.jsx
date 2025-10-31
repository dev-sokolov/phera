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
// import scanning_55 from "../../assets/lottie/scanning_55.lottie";
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
        playClickSound();
        setIsProcessing(true);

        setTimeout(() => {
            const imageSrc = webcamRef.current?.getScreenshot();
            stopCamera();
            if (imageSrc) onCapture(imageSrc);
        }, 1500);
    };

    //     const handleCapture = async () => {
    //   const audio = new Audio(notificationSound);
    //   try {
    //     await audio.play(); // дождаться старта звука
    //   } catch {
    //     // если пользователь не разрешил звук — просто продолжаем
    //   }

    //   // Немного подождём (например, 200–300 мс), чтобы звук "прозвучал"
    //   await new Promise((r) => setTimeout(r, 650));

    //   // теперь показываем спиннер
    //   setIsProcessing(true);

    //   // через 1.5 секунды делаем снимок
    //   setTimeout(() => {
    //     const imageSrc = webcamRef.current?.getScreenshot();
    //     stopCamera();
    //     if (imageSrc) onCapture(imageSrc);
    //   }, 1500);
    // };

    const handleUserMedia = () => {
        setTimeout(() => setIsReady(true), 150);
    };

    // -------------------------------------

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
                    {/* <img src={cross} alt="cross" /> */}
                    {/* ⬅ */}
                    X
                </button>
            </div>

            <div className={styles.overlay}>
                <div className={styles.viewfinder}>
                    <div className={styles["bottom-left"]}></div>
                    <div className={styles["bottom-right"]}></div>
                </div>

            </div>
            {isProcessing && (
                // <div className={styles.spinnerOverlay}>
                //     <div className={styles.spinner}></div>
                //     <p>Analyzing pH strip...</p>
                // </div>   
                // <div className={styles.lottieOverlay}>
                //     <Lottie animationData={scanning_3} loop={true} />
                // </div>
                <div className={styles.lottieOverlay}>
                    <Lottie
                        animationData={processing}
                        loop={true}
                        // loop={false}
                        speed={0.6}
                        // style={{ width: "80vw", height: "50vh" }}
                        style={{ width: "60px", height: "60px" }}
                    />
                    <p className={styles.scanText}>Analyzing pH strip...</p>
                </div>
            )}

            <div className={styles.wrapBtn}>
                {!isProcessing && (
                    <>
                        {/* <button className={styles.btn} onClick={handleCapture}>
                            Scan pH strip
                        </button> */}
                        <button className={styles.scanBtn} onClick={handleCapture}>

                        </button>

                        {/* <button
                            className={styles.btn}
                            onClick={() => {
                                stopCamera();
                                onExit();
                            }}
                        >
                            Home
                        </button> */}
                    </>
                )}
            </div>
        </div>
    );
};

export default CameraViewPage;