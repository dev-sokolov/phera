import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import Button from "../../components/Button/Button";
import Main from "../../components/Main/Main";

import styles from "./HomePage.module.css";

const HomePage = () => {
    const [isCameraOn, setIsCameraOn] = useState(false);

    const webcamRef = useRef(null);
    const navigate = useNavigate();

    const handleStartCamera = () => {
        setIsCameraOn(true);
    };

    const stopCamera = () => {
        const video = webcamRef.current?.video;
        const tracks = video?.srcObject?.getTracks();
        tracks?.forEach((track) => track.stop());
    }

    const handleStopCamera = () => {
        stopCamera();
        setIsCameraOn(false);
    };

    const handleCapture = () => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            stopCamera();

            navigate("/result", { state: { capturedImage: imageSrc } });
        }
    };

    //clearing the camera after moving to another page
    useEffect(() => {
        return () => {
            stopCamera();
        }
    }, []);

    return (
        <>
            {!isCameraOn && (     // Camera off        
                <div className={styles.wrapHomePage}>
                  <Main handleStartCamera={handleStartCamera}/>
                    <footer className={styles.footer}>
                        <p>pHera • Empowering vaginal health through accessible testing</p>
                    </footer>
                </div>
            )}

            {isCameraOn && (     // Camera on
                <div className={styles.wrapCamera}>
                    <div className={styles.webcam}>
                        <Webcam
                            ref={webcamRef}
                            audio={false}
                            screenshotFormat="image/png"
                            imageSmoothing={false}
                            videoConstraints={{ facingMode: "environment" }}
                            width={window.innerWidth}
                            height={window.innerHeight * 0.5} // for 50vh
                            playsInline
                        />
                    </div>
                    <div className={styles.wrapBtn}>
                        <button className={styles.btn} onClick={handleCapture}>Scan pH strip</button>
                        <button className={styles.btn} onClick={handleStopCamera}>Home</button>
                    </div>
                </div>
            )}
        </>
    )
}

export default HomePage;