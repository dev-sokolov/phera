// import { useRef, useState, useEffect, useCallback } from "react";
// import Webcam from "react-webcam";
// import { addImage } from "../../shared/api/images-api.js";
// import styles from "./CameraViewPage.module.css";
// import alertCircle from "../../assets/icons/alertCircle.svg";

// const CameraViewPage = ({ onCapture, onExit }) => {
//     const webcamRef = useRef(null);
//     const [isReady, setIsReady] = useState(false);
//     const [isProcessing, setIsProcessing] = useState(false);
//     const [hasFourMarkers, setHasFourMarkers] = useState(false);

//     // setHasFourMarkers(prev => prev !== (squares.length >= 4) ? (squares.length >= 4) : prev);

//     const stopCamera = () => {
//         const video = webcamRef.current?.video;
//         if (!video?.srcObject) return;

//         video.srcObject.getTracks().forEach(track => track.stop());
//     };

//     const handleCapture = async () => {
//         if (!webcamRef.current || !hasFourMarkers || isProcessing) return;

//         setIsProcessing(true);

//         try {
//             // 1. Screenshot capture
//             const screenshot = webcamRef.current.getScreenshot({
//                 width: 1920,
//                 height: 1080,
//             });
//             if (!screenshot) throw new Error("Failed to capture image");

//             // 2. Converting a screenshot to Blob
//             const blob = await fetch(screenshot).then(r => r.blob());

//             const formData = new FormData();
//             formData.append("image", blob, "capture.png");

//             // 3. Sending to the backend
//             const result = await addImage(formData);
//             if (!result || result.error) throw new Error("Backend error");

//             // 4. Completing the camera operation and transferring the result
//             stopCamera();
//             onCapture(result);

//         } catch (error) {
//             console.error("Capture/Upload failed:", error);
//             alert("Failed to process image. Please try again.");
//         } finally {
//             setIsProcessing(false);
//         }
//     };

//     // const handleUserMedia = () => setTimeout(() => setIsReady(true), 200);

//     const handleUserMedia = () => {
//         const video = webcamRef.current.video;
//         video.onloadedmetadata = () => setIsReady(true);
//     };

//     // useEffect(() => {
//     //     if (!isReady) return;
//     //     const video = webcamRef.current?.video;
//     //     if (!video) return;

//     //     let cleanup;
//     //     const checkReady = setInterval(() => {
//     //         if (video.videoWidth > 0 && video.videoHeight > 0) {
//     //             clearInterval(checkReady);
//     //             cleanup = startDetection(video);
//     //         }
//     //     }, 300);

//     //     return () => {
//     //         clearInterval(checkReady);
//     //         cleanup?.();
//     //     };
//     // }, [isReady]);

//     useEffect(() => {
//         if (!isReady) return;
//         const video = webcamRef.current?.video;
//         if (!video) return;

//         const cleanup = startDetection(video);
//         return cleanup;
//     }, [isReady]);


//     if (!window.cv || !cv.Mat) {
//         // console.error("OpenCV is not loaded yet");
//         return <div>Loading OpenCV...</div>;
//     }

//     // const canvas = document.createElement("canvas");
//     const canvasRef = useRef(null);
//     // if (!canvasRef.current) {
//     //     canvasRef.current = document.createElement("canvas");
//     // }

//     useEffect(() => {
//         if (!canvasRef.current) {
//             canvasRef.current = document.createElement("canvas");
//         }
//     }, []);

//     const startDetection = useCallback((video) => {
//         let isStopped = false;

//         const canvas = canvasRef.current;
//         const ctx = canvas.getContext("2d", { willReadFrequently: true });

//         const src = new cv.Mat(video.videoHeight, video.videoWidth, cv.CV_8UC4);
//         const gray = new cv.Mat();
//         const thresh = new cv.Mat();
//         const contours = new cv.MatVector();
//         const hierarchy = new cv.Mat();

//         const detect = () => {
//             if (isStopped) return;

//             if (video.videoWidth === 0 || video.videoHeight === 0) {
//                 requestAnimationFrame(detect);
//                 return;
//             }

//             try {
//                 canvas.width = video.videoWidth;
//                 canvas.height = video.videoHeight;

//                 ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
//                 const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//                 src.data.set(imgData.data);

//                 // OpenCV pipeline
//                 cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
//                 cv.GaussianBlur(gray, gray, new cv.Size(5, 5), 0);
//                 cv.adaptiveThreshold(
//                     gray,
//                     thresh,
//                     255,
//                     cv.ADAPTIVE_THRESH_GAUSSIAN_C,
//                     cv.THRESH_BINARY_INV,
//                     15,
//                     4
//                 );

//                 cv.findContours(
//                     thresh,
//                     contours,
//                     hierarchy,
//                     cv.RETR_EXTERNAL,
//                     cv.CHAIN_APPROX_SIMPLE
//                 );

//                 let squareCount = 0;

//                 for (let i = 0; i < contours.size(); i++) {
//                     const cnt = contours.get(i);
//                     const approx = new cv.Mat();

//                     cv.approxPolyDP(cnt, approx, 0.02 * cv.arcLength(cnt, true), true);

//                     if (approx.rows === 4 && cv.contourArea(approx) > 1000) {
//                         const rect = cv.boundingRect(approx);
//                         const aspect = rect.width / rect.height;
//                         if (aspect > 0.6 && aspect < 1.4) {
//                             squareCount++;
//                         }
//                     }

//                     approx.delete();
//                 }

//                 // Обновляем состояние (throttled: только если изменилось)
//                 setHasFourMarkers(prev => {
//                     const next = squareCount >= 4;
//                     return prev !== next ? next : prev;
//                 });

//             } catch (err) {
//                 console.warn("OpenCV detection error:", err);
//             }

//             requestAnimationFrame(detect);
//         };

//         requestAnimationFrame(detect);

//         // Cleanup
//         return () => {
//             isStopped = true;
//             src.delete();
//             gray.delete();
//             thresh.delete();
//             contours.delete();
//             hierarchy.delete();
//         };
//     }, [canvasRef, setHasFourMarkers]);

//     useEffect(() => {
//         return () => stopCamera();
//     }, []);

//     const prev = useRef(false);
//     useEffect(() => {
//         if (hasFourMarkers && !prev.current && navigator.vibrate) {
//             navigator.vibrate(100);
//         }
//         prev.current = hasFourMarkers;
//     }, [hasFourMarkers]);

//     const handleExit = useCallback(() => {
//         stopCamera();
//         onExit();
//     }, [onExit]);

//     const buttonText = isProcessing ? "Capturing..." : "Simulate auto-capture";

//     return (
//         <div className={styles.cameraContainer}>
//             <div className={`${styles.overlayBackground} ${hasFourMarkers ? styles.focused : ""}`}></div>
//             <Webcam
//                 ref={webcamRef}
//                 audio={false}
//                 screenshotFormat="image/png"
//                 videoConstraints={{ facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } }}
//                 className={`${styles.webcamVideo} ${isReady ? styles.show : ""}`}
//                 onUserMedia={handleUserMedia}
//                 onUserMediaError={(error) => {
//                     console.error("Camera error:", error);
//                     alert("Unable to start camera. Please check permissions.");
//                     onExit();
//                 }}
//                 playsInline
//             />

//             <div className={styles.topControls}>
//                 <button
//                     className={styles.exitBtn}
//                     onClick={handleExit}
//                     aria-label="Exit to home"
//                 >
//                     X
//                 </button>
//             </div>

//             {/* Focus frame */}
//             <div className={`${styles.viewfinder} ${hasFourMarkers ? styles.detected : ""}`}>
//                 <div className={styles["bottom-left"]}></div>
//                 <div className={styles["bottom-right"]}></div>
//             </div>

//             <div className={styles.hintMessage}>
//                 <div className={styles.hintMessageImg}><img src={alertCircle} alt="AlertCircle" /></div>
//                 <div>
//                     <p className={styles.hintMessageTitle}>Align the test card in the frame</p>
//                 </div>
//             </div>

//             <div className={styles.wrapBtn}>
//                 <button
//                     className={`${styles.scanBtn} ${hasFourMarkers ? styles.detected : ""}`}
//                     onClick={handleCapture}
//                     disabled={!hasFourMarkers || isProcessing}
//                     style={{
//                         opacity: hasFourMarkers ? 1 : 0.5,
//                         cursor: (!hasFourMarkers || isProcessing) ? 'not-allowed' : 'pointer'
//                     }}
//                 >{buttonText}</button>
//             </div>
//         </div>
//     );
// };

// export default CameraViewPage;


// -------------------------------------------------------------------------


// import { useRef, useState, useEffect, useCallback, useMemo } from "react";
// import Webcam from "react-webcam";
// import { addImage } from "../../shared/api/images-api.js";
// import styles from "./CameraViewPage.module.css";
// import alertCircle from "../../assets/icons/alertCircle.svg";

// const CameraViewPage = ({ onCapture, onExit }) => {
//     const webcamRef = useRef(null);
//     const canvasRef = useRef(null);

//     const [isReady, setIsReady] = useState(false);
//     const [isProcessing, setIsProcessing] = useState(false);
//     const [hasFourMarkers, setHasFourMarkers] = useState(false);

//     // стабильные constraints
//     const videoConstraints = useMemo(
//         () => ({
//             facingMode: "environment",
//             width: { ideal: 1920 },
//             height: { ideal: 1080 },
//         }),
//         []
//     );

//     /**
//      * Остановка камеры
//      */
//     const stopCamera = () => {
//         const video = webcamRef.current?.video;
//         if (!video?.srcObject) return;
//         video.srcObject.getTracks().forEach(track => track.stop());
//     };

//     /**
//      * Когда камера готова (поток разрешён)
//      */
//     const handleUserMedia = () => {
//         const video = webcamRef.current.video;

//         const onMeta = () => {
//             setIsReady(true);
//             video.removeEventListener("loadedmetadata", onMeta);
//         };

//         video.addEventListener("loadedmetadata", onMeta);
//     };

//     /**
//      * Детекция маркеров через requestAnimationFrame
//      */
//     const startDetection = useCallback((video) => {
//         let stopped = false;

//         const canvas = canvasRef.current;
//         const ctx = canvas.getContext("2d", { willReadFrequently: true });

//         // OpenCV матрицы
//         const src = new cv.Mat(video.videoHeight, video.videoWidth, cv.CV_8UC4);
//         const gray = new cv.Mat();
//         const thresh = new cv.Mat();
//         const contours = new cv.MatVector();
//         const hierarchy = new cv.Mat();

//         const detect = () => {
//             if (stopped) return;

//             if (video.videoWidth === 0 || video.videoHeight === 0) {
//                 requestAnimationFrame(detect);
//                 return;
//             }

//             try {
//                 canvas.width = video.videoWidth;
//                 canvas.height = video.videoHeight;

//                 ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
//                 const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//                 src.data.set(imgData.data);

//                 cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
//                 cv.GaussianBlur(gray, gray, new cv.Size(5, 5), 0);
//                 cv.adaptiveThreshold(
//                     gray, thresh, 255,
//                     cv.ADAPTIVE_THRESH_GAUSSIAN_C,
//                     cv.THRESH_BINARY_INV,
//                     15,
//                     4
//                 );

//                 cv.findContours(
//                     thresh,
//                     contours,
//                     hierarchy,
//                     cv.RETR_EXTERNAL,
//                     cv.CHAIN_APPROX_SIMPLE
//                 );

//                 let count = 0;

//                 for (let i = 0; i < contours.size(); i++) {
//                     const cnt = contours.get(i);
//                     const approx = new cv.Mat();

//                     cv.approxPolyDP(cnt, approx, 0.02 * cv.arcLength(cnt, true), true);

//                     if (approx.rows === 4 && cv.contourArea(approx) > 1000) {
//                         const rect = cv.boundingRect(approx);
//                         const aspect = rect.width / rect.height;

//                         if (aspect > 0.6 && aspect < 1.4) count++;
//                     }

//                     approx.delete();
//                 }

//                 // обновляем только при изменении
//                 setHasFourMarkers(prev => {
//                     const next = count >= 4;
//                     return prev !== next ? next : prev;
//                 });

//             } catch (err) {
//                 console.warn("OpenCV error:", err);
//             }

//             requestAnimationFrame(detect);
//         };

//         requestAnimationFrame(detect);

//         return () => {
//             stopped = true;
//             src.delete();
//             gray.delete();
//             thresh.delete();
//             contours.delete();
//             hierarchy.delete();
//         };
//     }, []);

//     /**
//      * Создать canvas один раз
//      */
//     useEffect(() => {
//         if (!canvasRef.current) {
//             canvasRef.current = document.createElement("canvas");
//         }
//     }, []);

//     /**
//      * Запуск детекции, когда поток готов
//      */
//     useEffect(() => {
//         if (!isReady) return;

//         const video = webcamRef.current?.video;
//         if (!video) return;

//         const cleanup = startDetection(video);
//         return cleanup;
//     }, [isReady, startDetection]);

//     /**
//      * Остановка камеры при демонтировании
//      */
//     useEffect(() => stopCamera, []);

//     /**
//      * Вибрация при появлении маркеров
//      */
//     useEffect(() => {
//         if (hasFourMarkers && navigator.vibrate) {
//             navigator.vibrate(80);
//         }
//     }, [hasFourMarkers]);

//     /**
//      * Обработка снимка
//      */
//     const handleCapture = async () => {
//         if (!webcamRef.current || !hasFourMarkers || isProcessing) return;
//         setIsProcessing(true);

//         try {
//             const screenshot = webcamRef.current.getScreenshot({
//                 width: 1920,
//                 height: 1080,
//             });
//             if (!screenshot) throw new Error("Screenshot failed");

//             const blob = await fetch(screenshot).then(r => r.blob());

//             const formData = new FormData();
//             formData.append("image", blob, "capture.png");

//             const res = await addImage(formData);
//             if (!res || res.error) throw new Error("Backend error");

//             stopCamera();
//             onCapture(res);

//         } catch (e) {
//             console.error(e);
//             alert("Failed to process image. Try again.");
//         } finally {
//             setIsProcessing(false);
//         }
//     };

//     const handleExit = () => {
//         stopCamera();
//         onExit();
//     };

//     const buttonText = isProcessing ? "Capturing..." : "Simulate auto-capture";

//     if (!window.cv || !cv.Mat) {
//         return <div>Loading OpenCV...</div>;
//     }

//     return (
//         <div className={styles.cameraContainer}>
//             <div className={`${styles.overlayBackground} ${hasFourMarkers ? styles.focused : ""}`}></div>

//             <Webcam
//                 ref={webcamRef}
//                 audio={false}
//                 screenshotFormat="image/png"
//                 videoConstraints={videoConstraints}
//                 className={`${styles.webcamVideo} ${isReady ? styles.show : ""}`}
//                 onUserMedia={handleUserMedia}
//                 onUserMediaError={(error) => {
//                     console.error("Camera error:", error);
//                     alert("Unable to start camera. Check permissions.");
//                     onExit();
//                 }}
//                 playsInline
//             />

//             <div className={styles.topControls}>
//                 <button className={styles.exitBtn} onClick={handleExit} aria-label="Exit">X</button>
//             </div>

//             <div className={`${styles.viewfinder} ${hasFourMarkers ? styles.detected : ""}`}>
//                 <div className={styles["bottom-left"]}></div>
//                 <div className={styles["bottom-right"]}></div>
//             </div>

//             <div className={styles.hintMessage}>
//                 <div className={styles.hintMessageImg}><img src={alertCircle} alt="alert" /></div>
//                 <p className={styles.hintMessageTitle}>Align the test card in the frame</p>
//             </div>

//             <div className={styles.wrapBtn}>
//                 <button
//                     className={`${styles.scanBtn} ${hasFourMarkers ? styles.detected : ""}`}
//                     onClick={handleCapture}
//                     disabled={!hasFourMarkers || isProcessing}
//                 >
//                     {buttonText}
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default CameraViewPage;

// ------------------------------------------------------------------


import { useRef, useEffect, useMemo } from "react";
import Webcam from "react-webcam";
import styles from "./CameraViewPage.module.css";
import alertCircle from "../../assets/icons/alertCircle.svg";

import { useCameraReady } from "../../hooks/useCameraReady";
import { useMarkerDetection } from "../../hooks/useMarkerDetection";
import { useCapture } from "../../hooks/useCapture";

const CameraViewPage = ({ onCapture, onExit }) => {
    const webcamRef = useRef(null);

    const isReady = useCameraReady(webcamRef);
    const { hasFourMarkers, startDetection } = useMarkerDetection(webcamRef);
    const { isProcessing, capture } = useCapture(webcamRef, onCapture);

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
                <p className={styles.hintMessageTitle}>Align the test card in the frame</p>
            </div>

            <div className={styles.wrapBtn}>
                <button
                    className={`${styles.scanBtn} ${hasFourMarkers ? styles.detected : ""}`}
                    onClick={() => capture(hasFourMarkers)}
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

