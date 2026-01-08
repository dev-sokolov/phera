import { useRef, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import styles from "./CameraViewPage.module.css";
import alertCircle from "../../assets/icons/alertCircle.svg";

import { useCameraReady } from "../../hooks/useCameraReady";
import { useMarkerDetection } from "../../hooks/useMarkerDetection";
import { checkImageQuality } from "../../hooks/imageQuality";
import { addImage } from "../../shared/api/images-api";

const CameraViewPage = ({ onExit }) => {
    const webcamRef = useRef(null);
    const navigate = useNavigate();
    const [qualityWarning, setQualityWarning] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const isReady = useCameraReady(webcamRef);
    
    const handleQualityCheck = (canvas) => {
        const qualityCheck = checkImageQuality(canvas);
        
        if (!qualityCheck.isGoodQuality) {
            setQualityWarning(qualityCheck.issues.join(', '));
        } else {
            setQualityWarning(null);
        }
    };
    
    const { hasFourMarkers, startDetection } = useMarkerDetection(webcamRef, handleQualityCheck);

    const videoConstraints = useMemo(() => ({
        facingMode: "environment",
        width: { ideal: 1920 },
        height: { ideal: 1080 },
    }), []);

    useEffect(() => {
        if (isReady) startDetection();
    }, [isReady, startDetection]);

    useEffect(() => () => {
        const video = webcamRef.current?.video;
        video?.srcObject?.getTracks().forEach(track => track.stop());
    }, []);

    useEffect(() => {
        if (hasFourMarkers && navigator.vibrate) navigator.vibrate(80);
    }, [hasFourMarkers]);

    const handleCapture = async () => {
        if (!webcamRef.current || !hasFourMarkers || isProcessing) return;
        setIsProcessing(true);

        try {
            const video = webcamRef.current.video;
            
            // Создаём уменьшенный canvas для быстрой проверки качества
            const checkCanvas = document.createElement('canvas');
            const scale = 0.25;
            checkCanvas.width = Math.floor(video.videoWidth * scale);
            checkCanvas.height = Math.floor(video.videoHeight * scale);
            const checkCtx = checkCanvas.getContext('2d', { willReadFrequently: true });
            checkCtx.drawImage(video, 0, 0, checkCanvas.width, checkCanvas.height);

            // Проверяем качество на уменьшенном изображении
            const qualityCheck = checkImageQuality(checkCanvas);
            
            console.log('📸 Quality check:', qualityCheck); // ← Логирование
            
            // Смягчаем критерии: предупреждаем, но не блокируем
            if (!qualityCheck.isGoodQuality) {
                console.warn('⚠️ Poor quality detected:', qualityCheck.issues);
                // Не блокируем отправку, только предупреждаем
            }

            // Делаем скриншот в полном разрешении
            const screenshot = webcamRef.current.getScreenshot({ width: 1920, height: 1080 });
            if (!screenshot) {
                console.error('❌ Screenshot failed');
                throw new Error("Screenshot failed");
            }

            console.log('✅ Screenshot created');

            const blob = await fetch(screenshot).then(r => r.blob());
            console.log('✅ Blob created, size:', blob.size);

            const formData = new FormData();
            formData.append("image", blob, "capture.png");

            console.log('📤 Sending to backend...');
            const res = await addImage(formData);
            console.log('✅ Backend response:', res);

            if (!res || res.error) {
                console.error('❌ Backend error:', res);
                throw new Error("Backend error");
            }

            // Переходим на страницу результата
            navigate("/result", { state: res });
            
        } catch (err) {
            console.error('❌ Capture error:', err);
            alert(`Failed to process image: ${err.message}\nPlease try again.`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleExit = () => {
        const video = webcamRef.current?.video;
        video?.srcObject?.getTracks().forEach(track => track.stop());
        onExit();
    };

    const buttonText = isProcessing ? "Capturing..." : "Simulate auto-capture";

    if (!window.cv || !cv.Mat) return <div>Loading OpenCV...</div>;

    return (
        <div className={styles.cameraContainer}>
            <div className={`${styles.overlayBackground} ${hasFourMarkers ? styles.focused : ""}`}></div>

            <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/png"
                videoConstraints={videoConstraints}
                className={`${styles.webcamVideo} ${isReady ? styles.show : ""}`}
                onUserMediaError={err => {
                    console.error("Camera error:", err);
                    alert("Unable to start camera. Check permissions.");
                    onExit();
                }}
                playsInline
            />

            <div className={styles.topControls}>
                <button className={styles.exitBtn} onClick={handleExit} aria-label="Exit">X</button>
            </div>

            <div className={`${styles.viewfinder} ${hasFourMarkers ? styles.detected : ""}`}>
                <div className={styles["bottom-left"]}></div>
                <div className={styles["bottom-right"]}></div>
            </div>

            <div className={styles.hintMessage}>
                <div className={styles.hintMessageImg}><img src={alertCircle} alt="alert" /></div>
                {qualityWarning ? (
                    <p className={styles.hintMessageTitle} style={{ color: '#ff6b6b' }}>
                        {qualityWarning}
                    </p>
                ) : (
                    <p className={styles.hintMessageTitle}>Align the test card in the frame</p>
                )}
            </div>

            <div className={styles.wrapBtn}>
                <button
                    className={`${styles.scanBtn} ${hasFourMarkers ? styles.detected : ""}`}
                    onClick={handleCapture}
                    disabled={!hasFourMarkers || isProcessing}
                    style={{
                        opacity: hasFourMarkers ? 1 : 0.5,
                        cursor: (!hasFourMarkers || isProcessing) ? 'not-allowed' : 'pointer'
                    }}
                >
                    {buttonText}
                </button>
            </div>
        </div>
    );
};

export default CameraViewPage;