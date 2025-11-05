// import { useRef, useEffect, useState } from "react";
// import Lottie from "lottie-react";
// import Webcam from "react-webcam";
// import styles from "./CameraViewPage.module.css";
// import notificationSound from "../../assets/sounds/notification.mp3";
// import processing_6 from "../../assets/lottie/processing_6.json";

// const CameraViewPage = ({ onCapture, onExit }) => {
//     const webcamRef = useRef(null);
//     const frameRef = useRef(null); // ref для cropFrame
//     const [isReady, setIsReady] = useState(false);
//     const [isProcessing, setIsProcessing] = useState(false);

//     const stopCamera = () => {
//         const video = webcamRef.current?.video;
//         const tracks = video?.srcObject?.getTracks();
//         tracks?.forEach((track) => track.stop());
//     };

//     const playClickSound = () => {
//         const audio = new Audio(notificationSound);
//         audio.play().catch(() => { });
//     };

//     // -----------------------------------------------------------+- изначально !!!
//     const handleCapture = () => {
//         setIsProcessing(true);
//         setTimeout(() => playClickSound(), 1000);

//         setTimeout(() => {
//             const video = webcamRef.current?.video;
//             if (!video) return;

//             // 1️⃣ Снимаем кадр с максимальным разрешением
//             const canvas = document.createElement("canvas");
//             canvas.width = video.videoWidth;
//             canvas.height = video.videoHeight;
//             const ctx = canvas.getContext("2d");
//             ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

//             const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

//             // 2️⃣ Загружаем в OpenCV
//             const src = cv.matFromImageData(imgData);
//             const gray = new cv.Mat();
//             const thresh = new cv.Mat();

//             cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
//             cv.GaussianBlur(gray, gray, new cv.Size(5, 5), 0);
//             cv.adaptiveThreshold(
//                 gray,
//                 thresh,
//                 255,
//                 cv.ADAPTIVE_THRESH_GAUSSIAN_C,
//                 cv.THRESH_BINARY_INV,
//                 11,
//                 2
//             );

//             // 3️⃣ Находим контуры
//             const contours = new cv.MatVector();
//             const hierarchy = new cv.Mat();
//             cv.findContours(thresh, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

//             const squares = [];
//             for (let i = 0; i < contours.size(); i++) {
//                 const cnt = contours.get(i);
//                 const approx = new cv.Mat();
//                 cv.approxPolyDP(cnt, approx, 0.02 * cv.arcLength(cnt, true), true);

//                 if (approx.rows === 4 && cv.contourArea(approx) > 200) {
//                     const rect = cv.boundingRect(approx);
//                     const aspect = rect.width / rect.height;
//                     if (aspect > 0.8 && aspect < 1.2) squares.push(rect);
//                 }

//                 cnt.delete();
//                 approx.delete();
//             }

//             if (squares.length === 4) {
//                 squares.sort((a, b) => a.y - b.y || a.x - b.x);
//                 const topLeft = squares[0];
//                 const topRight = squares[1];
//                 const bottomLeft = squares[2];
//                 const bottomRight = squares[3];

//                 // ✅ вычисляем реальные размеры по маркерам
//                 const topWidth = Math.hypot(
//                     (topRight.x + topRight.width / 2) - (topLeft.x + topLeft.width / 2),
//                     (topRight.y + topRight.height / 2) - (topLeft.y + topLeft.height / 2)
//                 );
//                 const bottomWidth = Math.hypot(
//                     (bottomRight.x + bottomRight.width / 2) - (bottomLeft.x + bottomLeft.width / 2),
//                     (bottomRight.y + bottomRight.height / 2) - (bottomLeft.y + bottomLeft.height / 2)
//                 );
//                 const leftHeight = Math.hypot(
//                     (bottomLeft.x + bottomLeft.width / 2) - (topLeft.x + topLeft.width / 2),
//                     (bottomLeft.y + bottomLeft.height / 2) - (topLeft.y + topLeft.height / 2)
//                 );
//                 const rightHeight = Math.hypot(
//                     (bottomRight.x + bottomRight.width / 2) - (topRight.x + topRight.width / 2),
//                     (bottomRight.y + bottomRight.height / 2) - (topRight.y + topRight.height / 2)
//                 );

//                 // усредняем ширину и высоту
//                 const width = Math.round((topWidth + bottomWidth) / 2);
//                 const height = Math.round((leftHeight + rightHeight) / 2);

//                 // 4️⃣ точки для преобразования
//                 const srcPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
//                     topLeft.x + topLeft.width / 2, topLeft.y + topLeft.height / 2,
//                     topRight.x + topRight.width / 2, topRight.y + topRight.height / 2,
//                     bottomRight.x + bottomRight.width / 2, bottomRight.y + bottomRight.height / 2,
//                     bottomLeft.x + bottomLeft.width / 2, bottomLeft.y + bottomLeft.height / 2
//                 ]);

//                 const dstPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
//                     0, 0,
//                     width, 0,
//                     width, height,
//                     0, height
//                 ]);

//                 // 5️⃣ Преобразование перспективы
//                 const M = cv.getPerspectiveTransform(srcPts, dstPts);
//                 const warped = new cv.Mat();
//                 cv.warpPerspective(src, warped, M, new cv.Size(width, height));

//                 // ✂️ Можно взять центральную часть, где находится шкала
//                 // const cropY = Math.round(height * 0.25);
//                 // const cropHeight = Math.round(height * 0.5);
//                 const cropY = Math.round(height * 0.1);
//                 const cropHeight = Math.round(height * 0.6);
//                 const cropX = Math.round(width * 0.19);
//                 const cropWidth = Math.round(width * 0.6);
//                 const cropped = warped.roi(new cv.Rect(cropX, cropY, cropWidth, cropHeight));

//                 // 6️⃣ Конвертируем в Base64
//                 const outputCanvas = document.createElement("canvas");
//                 outputCanvas.width = cropWidth;
//                 outputCanvas.height = cropHeight;
//                 cv.imshow(outputCanvas, cropped);
//                 const croppedImage = outputCanvas.toDataURL("image/png");

//                 stopCamera();
//                 onCapture(croppedImage);

//                 // очистка
//                 cropped.delete();
//                 warped.delete();
//                 M.delete();
//                 srcPts.delete();
//                 dstPts.delete();
//             } else {
//                 console.warn("⚠️ Не удалось найти 4 маркера. Используем fallback.");
//                 const fallback = canvas.toDataURL("image/png");
//                 onCapture(fallback);
//             }

//             // 🧹 Очистка
//             src.delete();
//             gray.delete();
//             thresh.delete();
//             contours.delete();
//             hierarchy.delete();

//             stopCamera();
//             setIsProcessing(false);
//         }, 2300);
//     };

//     // ---------------------------------------------

//     const handleUserMedia = () => {
//         // camera ready
//         setTimeout(() => setIsReady(true), 150);
//     };

//     // const handleUserMedia = () => {
//     //     const video = webcamRef.current?.video;
//     //     if (video) {
//     //         console.log("🎥 Actual camera size:", video.videoWidth, video.videoHeight);
//     //     }
//     //     setTimeout(() => setIsReady(true), 300);
//     // };

//     useEffect(() => {
//         return () => stopCamera();
//     }, []);

//     return (
//         <div className={styles.cameraContainer}>
//             {!isReady && <div className={styles.darkBackground}></div>}
//             <Webcam
//                 ref={webcamRef}
//                 audio={false}
//                 screenshotFormat="image/png"
//                 videoConstraints={{
//                     facingMode: "environment",
//                     width: { ideal: 1920 }, 
//                     height: { ideal: 1080 },
//                 }}
//                 className={`${styles.webcamVideo} ${isReady ? styles.show : ""}`}
//                 onUserMedia={handleUserMedia}
//                 playsInline
//             />
//             <canvas id="debugCanvas" width="400" height="300" style={{ position: "absolute", bottom: 10, left: 10, border: "1px solid red" }}></canvas>
//             <div className={styles.topControls}>
//                 <button
//                     className={styles.exitBtn}
//                     onClick={() => {
//                         stopCamera();
//                         onExit();
//                     }}
//                     aria-label="Exit to home"
//                 >
//                     X
//                 </button>
//             </div>

//             <div className={styles.overlay}>
//                 <div className={styles.viewfinder}>
//                     <div className={styles["bottom-left"]}></div>
//                     <div className={styles["bottom-right"]}></div>

//                     {/* Привязываем ref к cropFrame */}
//                     <div ref={frameRef} className={styles.cropFrame}></div>
//                 </div>
//             </div>

//             <div className={styles.wrapBtn}>
//                 <button
//                     className={styles.scanBtn}
//                     onClick={handleCapture}
//                     style={{ opacity: isProcessing ? 0 : 1 }}
//                 ></button>

//                 <Lottie
//                     key={isProcessing ? "processing" : "idle"}
//                     animationData={processing_6}
//                     loop={false}
//                     style={{
//                         width: "80px",
//                         height: "80px",
//                         position: "absolute",
//                         top: "50%",
//                         left: "50%",
//                         transform: "translate(-50%, -50%)",
//                         opacity: isProcessing ? 1 : 0,
//                         pointerEvents: "none",
//                         filter: "brightness(0) invert(1)",
//                     }}
//                 />
//             </div>
//         </div>
//     );
// };

// export default CameraViewPage;

// --------------------------------------------------------------------------------


import { useRef, useEffect, useState } from "react";
import Lottie from "lottie-react";
import Webcam from "react-webcam";
import styles from "./CameraViewPage.module.css";
import notificationSound from "../../assets/sounds/notification.mp3";
import processing_6 from "../../assets/lottie/processing_6.json";

const CameraViewPage = ({ onCapture, onExit }) => {
    const webcamRef = useRef(null);
    const frameRef = useRef(null); // ref для cropFrame
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

    // -----------------------------------------------------------+- изначально !!!
    // const handleCapture = () => {
    //     setIsProcessing(true);
    //     setTimeout(() => playClickSound(), 1000);

    //     setTimeout(() => {
    //         const video = webcamRef.current?.video;
    //         if (!video) return;

    //         // 1️⃣ Снимаем кадр с максимальным разрешением
    //         const canvas = document.createElement("canvas");
    //         canvas.width = video.videoWidth;
    //         canvas.height = video.videoHeight;
    //         const ctx = canvas.getContext("2d");
    //         ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    //         const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    //         // 2️⃣ Загружаем в OpenCV
    //         const src = cv.matFromImageData(imgData);
    //         const gray = new cv.Mat();
    //         const thresh = new cv.Mat();

    //         cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
    //         cv.GaussianBlur(gray, gray, new cv.Size(5, 5), 0);
    //         cv.adaptiveThreshold(
    //             gray,
    //             thresh,
    //             255,
    //             cv.ADAPTIVE_THRESH_GAUSSIAN_C,
    //             cv.THRESH_BINARY_INV,
    //             // 11,
    //             // 2
    //             15,
    //             4
    //         );

    //         // 3️⃣ Находим контуры
    //         const contours = new cv.MatVector();
    //         const hierarchy = new cv.Mat();
    //         cv.findContours(thresh, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    //         const squares = [];
    //         for (let i = 0; i < contours.size(); i++) {
    //             const cnt = contours.get(i);
    //             const approx = new cv.Mat();
    //             cv.approxPolyDP(cnt, approx, 0.02 * cv.arcLength(cnt, true), true);

    //             // if (approx.rows === 4 && cv.contourArea(approx) > 200) {
    //             if (approx.rows === 4 && cv.contourArea(approx) > 1000) {
    //                 const rect = cv.boundingRect(approx);
    //                 const aspect = rect.width / rect.height;
    //                 // if (aspect > 0.8 && aspect < 1.2) squares.push(rect);
    //                 if (aspect > 0.6 && aspect < 1.4) squares.push(rect);
    //             }

    //             cnt.delete();
    //             approx.delete();
    //         }

    //         if (squares.length === 4) {
    //             squares.sort((a, b) => a.y - b.y || a.x - b.x);
    //             const topLeft = squares[0];
    //             const topRight = squares[1];
    //             const bottomLeft = squares[2];
    //             const bottomRight = squares[3];

    //             // ✅ вычисляем реальные размеры по маркерам
    //             const topWidth = Math.hypot(
    //                 (topRight.x + topRight.width / 2) - (topLeft.x + topLeft.width / 2),
    //                 (topRight.y + topRight.height / 2) - (topLeft.y + topLeft.height / 2)
    //             );
    //             const bottomWidth = Math.hypot(
    //                 (bottomRight.x + bottomRight.width / 2) - (bottomLeft.x + bottomLeft.width / 2),
    //                 (bottomRight.y + bottomRight.height / 2) - (bottomLeft.y + bottomLeft.height / 2)
    //             );
    //             const leftHeight = Math.hypot(
    //                 (bottomLeft.x + bottomLeft.width / 2) - (topLeft.x + topLeft.width / 2),
    //                 (bottomLeft.y + bottomLeft.height / 2) - (topLeft.y + topLeft.height / 2)
    //             );
    //             const rightHeight = Math.hypot(
    //                 (bottomRight.x + bottomRight.width / 2) - (topRight.x + topRight.width / 2),
    //                 (bottomRight.y + bottomRight.height / 2) - (topRight.y + topRight.height / 2)
    //             );

    //             // усредняем ширину и высоту
    //             const width = Math.round((topWidth + bottomWidth) / 2);
    //             const height = Math.round((leftHeight + rightHeight) / 2);

    //             // 4️⃣ точки для преобразования
    //             const srcPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
    //                 topLeft.x + topLeft.width / 2, topLeft.y + topLeft.height / 2,
    //                 topRight.x + topRight.width / 2, topRight.y + topRight.height / 2,
    //                 bottomRight.x + bottomRight.width / 2, bottomRight.y + bottomRight.height / 2,
    //                 bottomLeft.x + bottomLeft.width / 2, bottomLeft.y + bottomLeft.height / 2
    //             ]);

    //             const dstPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
    //                 0, 0,
    //                 width, 0,
    //                 width, height,
    //                 0, height
    //             ]);

    //             // 5️⃣ Преобразование перспективы
    //             const M = cv.getPerspectiveTransform(srcPts, dstPts);
    //             const warped = new cv.Mat();
    //             cv.warpPerspective(src, warped, M, new cv.Size(width, height));

    //             // ✂️ Можно взять центральную часть, где находится шкала
    //             // const cropY = Math.round(height * 0.25);
    //             // const cropHeight = Math.round(height * 0.5);
    //             const cropY = Math.round(height * 0.1);
    //             const cropHeight = Math.round(height * 0.6);
    //             const cropX = Math.round(width * 0.19);
    //             const cropWidth = Math.round(width * 0.6);
    //             const cropped = warped.roi(new cv.Rect(cropX, cropY, cropWidth, cropHeight));

    //             // 6️⃣ Конвертируем в Base64
    //             const outputCanvas = document.createElement("canvas");
    //             outputCanvas.width = cropWidth;
    //             outputCanvas.height = cropHeight;
    //             cv.imshow(outputCanvas, cropped);
    //             const croppedImage = outputCanvas.toDataURL("image/png");

    //             stopCamera();
    //             onCapture(croppedImage);

    //             // очистка
    //             cropped.delete();
    //             warped.delete();
    //             M.delete();
    //             srcPts.delete();
    //             dstPts.delete();
    //         } else {
    //             // console.warn("⚠️ Не удалось найти 4 маркера. Используем fallback.");
    //             // const fallback = canvas.toDataURL("image/png");
    //             // onCapture(fallback);

    //             console.warn("⚠️ Не удалось найти 4 маркера. Оставляем камеру включённой.");
    //             // setErrorMessage("Не удалось определить область. Попробуйте ещё раз.");
    //             // setIsProcessing(false); // остановим анимацию
    //         }

    //         // 🧹 Очистка
    //         src.delete();
    //         gray.delete();
    //         thresh.delete();
    //         contours.delete();
    //         hierarchy.delete();

    //         // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    //         // stopCamera();
    //         // setIsProcessing(false);
    //     }, 2300);
    // };

    // -----------------------------------------------!!!РАБОТАЕТ!!!!!!!

    // const handleCapture = () => {
    //     setIsProcessing(true);
    //     setTimeout(() => playClickSound(), 1000);

    //     setTimeout(() => {
    //         const video = webcamRef.current?.video;
    //         if (!video) return;

    //         // 1️⃣ Снимаем кадр с камеры
    //         const canvas = document.createElement("canvas");
    //         canvas.width = video.videoWidth;
    //         canvas.height = video.videoHeight;
    //         const ctx = canvas.getContext("2d");
    //         ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    //         const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    //         // 2️⃣ Обрабатываем OpenCV
    //         const src = cv.matFromImageData(imgData);
    //         const gray = new cv.Mat();
    //         const thresh = new cv.Mat();

    //         cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
    //         cv.GaussianBlur(gray, gray, new cv.Size(5, 5), 0);
    //         cv.adaptiveThreshold(
    //             gray,
    //             thresh,
    //             255,
    //             cv.ADAPTIVE_THRESH_GAUSSIAN_C,
    //             cv.THRESH_BINARY_INV,
    //             15,
    //             4
    //         );

    //         // 3️⃣ Контуры
    //         const contours = new cv.MatVector();
    //         const hierarchy = new cv.Mat();
    //         cv.findContours(thresh, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    //         const squares = [];
    //         for (let i = 0; i < contours.size(); i++) {
    //             const cnt = contours.get(i);
    //             const approx = new cv.Mat();
    //             cv.approxPolyDP(cnt, approx, 0.02 * cv.arcLength(cnt, true), true);

    //             if (approx.rows === 4 && cv.contourArea(approx) > 1000) {
    //                 const rect = cv.boundingRect(approx);
    //                 const aspect = rect.width / rect.height;

    //                 if (aspect > 0.6 && aspect < 1.4) {
    //                     squares.push({
    //                         rect,
    //                         area: cv.contourArea(approx),
    //                         center: {
    //                             x: rect.x + rect.width / 2,
    //                             y: rect.y + rect.height / 2,
    //                         },
    //                     });
    //                 }
    //             }

    //             cnt.delete();
    //             approx.delete();
    //         }

    //         // 4️⃣ Проверяем, что нашли 4 маркера
    //         if (squares.length >= 4) {
    //             // Берем 4 самых крупных
    //             squares.sort((a, b) => b.area - a.area);
    //             const selected = squares.slice(0, 4);

    //             // Сортируем по координатам
    //             selected.sort((a, b) => a.center.y - b.center.y);
    //             const top = selected.slice(0, 2).sort((a, b) => a.center.x - b.center.x);
    //             const bottom = selected.slice(2, 4).sort((a, b) => a.center.x - b.center.x);

    //             const topLeft = top[0];
    //             const topRight = top[1];
    //             const bottomLeft = bottom[0];
    //             const bottomRight = bottom[1];

    //             // Проверка геометрии
    //             const widthTop = Math.hypot(topRight.center.x - topLeft.center.x, topRight.center.y - topLeft.center.y);
    //             const widthBottom = Math.hypot(bottomRight.center.x - bottomLeft.center.x, bottomRight.center.y - bottomLeft.center.y);
    //             const heightLeft = Math.hypot(bottomLeft.center.x - topLeft.center.x, bottomLeft.center.y - topLeft.center.y);
    //             const heightRight = Math.hypot(bottomRight.center.x - topRight.center.x, bottomRight.center.y - topRight.center.y);

    //             const width = Math.round((widthTop + widthBottom) / 2);
    //             const height = Math.round((heightLeft + heightRight) / 2);

    //             // Если маркеры явно не формируют прямоугольник
    //             if (width < 50 || height < 50 || width / height > 3 || height / width > 3) {
    //                 console.warn("⚠️ Геометрия неверна — маркеры расположены неправильно.");
    //                 alert("Не удалось корректно определить область. Попробуйте ещё раз.");
    //                 setIsProcessing(false);
    //                 return;
    //             }

    //             // 5️⃣ Матрица преобразования
    //             const srcPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
    //                 topLeft.center.x, topLeft.center.y,
    //                 topRight.center.x, topRight.center.y,
    //                 bottomRight.center.x, bottomRight.center.y,
    //                 bottomLeft.center.x, bottomLeft.center.y
    //             ]);

    //             const dstPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
    //                 0, 0,
    //                 width, 0,
    //                 width, height,
    //                 0, height
    //             ]);

    //             const M = cv.getPerspectiveTransform(srcPts, dstPts);
    //             const warped = new cv.Mat();
    //             cv.warpPerspective(src, warped, M, new cv.Size(width, height));

    //             // ✂️ Обрезаем
    //             const cropX = Math.round(width * 0.19);
    //             const cropY = Math.round(height * 0.1);
    //             const cropWidth = Math.round(width * 0.6);
    //             const cropHeight = Math.round(height * 0.6);

    //             const cropped = warped.roi(new cv.Rect(cropX, cropY, cropWidth, cropHeight));
    //             const outputCanvas = document.createElement("canvas");
    //             outputCanvas.width = cropWidth;
    //             outputCanvas.height = cropHeight;
    //             cv.imshow(outputCanvas, cropped);
    //             const croppedImage = outputCanvas.toDataURL("image/png");

    //             stopCamera();
    //             onCapture(croppedImage);

    //             cropped.delete();
    //             warped.delete();
    //             M.delete();
    //             srcPts.delete();
    //             dstPts.delete();
    //         } else {
    //             console.warn("⚠️ Не удалось найти 4 маркера.");
    //             alert("Не удалось определить область. Попробуйте ещё раз.");
    //             setIsProcessing(false);
    //             return;
    //         }

    //         // 🧹 Очистка
    //         src.delete();
    //         gray.delete();
    //         thresh.delete();
    //         contours.delete();
    //         hierarchy.delete();

    //         setIsProcessing(false);
    //     }, 2300);
    // };

    // ---------------------------------------------

    const handleCapture = () => {
        setIsProcessing(true);
        setTimeout(() => playClickSound(), 1000);

        setTimeout(() => {
            const video = webcamRef.current?.video;
            if (!video) return;

            // 1️⃣ Снимаем кадр с камеры
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            // 2️⃣ Обрабатываем OpenCV
            const src = cv.matFromImageData(imgData);
            const gray = new cv.Mat();
            const thresh = new cv.Mat();

            cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
            cv.GaussianBlur(gray, gray, new cv.Size(5, 5), 0);
            cv.adaptiveThreshold(
                gray,
                thresh,
                255,
                cv.ADAPTIVE_THRESH_GAUSSIAN_C,
                cv.THRESH_BINARY_INV,
                15,
                4
            );

            // 3️⃣ Контуры
            const contours = new cv.MatVector();
            const hierarchy = new cv.Mat();
            cv.findContours(thresh, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

            const squares = [];
            for (let i = 0; i < contours.size(); i++) {
                const cnt = contours.get(i);
                const approx = new cv.Mat();
                cv.approxPolyDP(cnt, approx, 0.02 * cv.arcLength(cnt, true), true);

                if (approx.rows === 4 && cv.contourArea(approx) > 1000) {
                    const rect = cv.boundingRect(approx);
                    const aspect = rect.width / rect.height;

                    if (aspect > 0.6 && aspect < 1.4) {
                        squares.push({
                            rect,
                            area: cv.contourArea(approx),
                            center: {
                                x: rect.x + rect.width / 2,
                                y: rect.y + rect.height / 2,
                            },
                        });
                    }
                }

                cnt.delete();
                approx.delete();
            }

            // 4️⃣ Проверяем, что нашли 4 маркера
            if (squares.length >= 4) {
                // Берем 4 самых крупных
                squares.sort((a, b) => b.area - a.area);
                const selected = squares.slice(0, 4);

                // Сортируем по координатам
                selected.sort((a, b) => a.center.y - b.center.y);
                const top = selected.slice(0, 2).sort((a, b) => a.center.x - b.center.x);
                const bottom = selected.slice(2, 4).sort((a, b) => a.center.x - b.center.x);

                const topLeft = top[0];
                const topRight = top[1];
                const bottomLeft = bottom[0];
                const bottomRight = bottom[1];

                // Проверка геометрии
                const widthTop = Math.hypot(topRight.center.x - topLeft.center.x, topRight.center.y - topLeft.center.y);
                const widthBottom = Math.hypot(bottomRight.center.x - bottomLeft.center.x, bottomRight.center.y - bottomLeft.center.y);
                const heightLeft = Math.hypot(bottomLeft.center.x - topLeft.center.x, bottomLeft.center.y - topLeft.center.y);
                const heightRight = Math.hypot(bottomRight.center.x - topRight.center.x, bottomRight.center.y - topRight.center.y);

                const width = Math.round((widthTop + widthBottom) / 2);
                const height = Math.round((heightLeft + heightRight) / 2);

                // Если маркеры явно не формируют прямоугольник
                if (width < 50 || height < 50 || width / height > 3 || height / width > 3) {
                    console.warn("⚠️ Геометрия неверна — маркеры расположены неправильно.");
                    // alert("Не удалось корректно определить область. Попробуйте ещё раз.");

                    setIsProcessing(false);
                    return;
                }

                // 5️⃣ Матрица преобразования
                const srcPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
                    topLeft.center.x, topLeft.center.y,
                    topRight.center.x, topRight.center.y,
                    bottomRight.center.x, bottomRight.center.y,
                    bottomLeft.center.x, bottomLeft.center.y
                ]);

                const dstPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
                    0, 0,
                    width, 0,
                    width, height,
                    0, height
                ]);

                const M = cv.getPerspectiveTransform(srcPts, dstPts);
                const warped = new cv.Mat();
                cv.warpPerspective(src, warped, M, new cv.Size(width, height));

                // ✂️ Обрезаем
                const cropX = Math.round(width * 0.19);
                const cropY = Math.round(height * 0.1);
                const cropWidth = Math.round(width * 0.6);
                const cropHeight = Math.round(height * 0.6);

                const cropped = warped.roi(new cv.Rect(cropX, cropY, cropWidth, cropHeight));
                const outputCanvas = document.createElement("canvas");
                outputCanvas.width = cropWidth;
                outputCanvas.height = cropHeight;
                cv.imshow(outputCanvas, cropped);
                const croppedImage = outputCanvas.toDataURL("image/png");

                stopCamera();
                onCapture(croppedImage);

                cropped.delete();
                warped.delete();
                M.delete();
                srcPts.delete();
                dstPts.delete();
            } else {
                console.warn("⚠️ Не удалось найти 4 маркера.");
                // alert("Не удалось определить область. Попробуйте ещё раз.");
                setIsProcessing(false);
                return;
            }

            // 🧹 Очистка
            src.delete();
            gray.delete();
            thresh.delete();
            contours.delete();
            hierarchy.delete();

            setIsProcessing(false);
        }, 2300);
    };

    const handleUserMedia = () => {
        // camera ready
        setTimeout(() => setIsReady(true), 150);
    };

    // const handleUserMedia = () => {
    //     const video = webcamRef.current?.video;
    //     if (video) {
    //         console.log("🎥 Actual camera size:", video.videoWidth, video.videoHeight);
    //     }
    //     setTimeout(() => setIsReady(true), 300);
    // };

    useEffect(() => {
        return () => stopCamera();
    }, []);

    return (
        <div className={styles.cameraContainer}>
            {!isReady && <div className={styles.darkBackground}></div>}
            <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/png"
                videoConstraints={{
                    facingMode: "environment",
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                }}
                className={`${styles.webcamVideo} ${isReady ? styles.show : ""}`}
                onUserMedia={handleUserMedia}
                playsInline
            />
            <canvas id="debugCanvas" width="400" height="300" style={{ position: "absolute", bottom: 10, left: 10, border: "1px solid red" }}></canvas>
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

                    {/* Привязываем ref к cropFrame */}
                    <div ref={frameRef} className={styles.cropFrame}></div>
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
