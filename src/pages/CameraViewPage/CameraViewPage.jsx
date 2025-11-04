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

    // const handleCapture = () => {
    //     setIsProcessing(true);

    //     // 🔊 звук через 1 секунду
    //     setTimeout(() => playClickSound(), 1000);

    //     // ⏳ задержка под анимацию (2.3 сек)
    //     setTimeout(() => {
    //         const video = webcamRef.current?.video;
    //         if (!video) return;

    //         // 1️⃣ Захват кадра из видео (в полном разрешении)
    //         const canvas = document.createElement("canvas");
    //         canvas.width = video.videoWidth;
    //         canvas.height = video.videoHeight;
    //         const ctx = canvas.getContext("2d");
    //         ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    //         const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    //         // 2️⃣ Загружаем изображение в OpenCV
    //         const src = cv.matFromImageData(imgData);
    //         const gray = new cv.Mat();
    //         const thresh = new cv.Mat();

    //         // 3️⃣ Преобразуем в ч/б и делаем бинаризацию
    //         cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
    //         cv.GaussianBlur(gray, gray, new cv.Size(5, 5), 0);
    //         cv.adaptiveThreshold(
    //             gray,
    //             thresh,
    //             255,
    //             cv.ADAPTIVE_THRESH_GAUSSIAN_C,
    //             cv.THRESH_BINARY_INV,
    //             11,
    //             2
    //         );

    //         // 4️⃣ Находим контуры
    //         const contours = new cv.MatVector();
    //         const hierarchy = new cv.Mat();
    //         cv.findContours(thresh, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    //         const squares = [];

    //         // 5️⃣ Фильтруем контуры, похожие на маркеры (почти квадратные, с подходящей площадью)
    //         for (let i = 0; i < contours.size(); i++) {
    //             const cnt = contours.get(i);
    //             const approx = new cv.Mat();
    //             cv.approxPolyDP(cnt, approx, 0.02 * cv.arcLength(cnt, true), true);

    //             if (approx.rows === 4 && cv.contourArea(approx) > 200) {
    //                 const rect = cv.boundingRect(approx);
    //                 const aspect = rect.width / rect.height;
    //                 if (aspect > 0.8 && aspect < 1.2) {
    //                     squares.push(rect);
    //                 }
    //             }

    //             cnt.delete();
    //             approx.delete();
    //         }

    //         // 🧪 Отладка — визуализируем найденные контуры на копии изображения
    //         const debugImg = src.clone();
    //         cv.drawContours(debugImg, contours, -1, new cv.Scalar(255, 0, 0, 255), 2);
    //         cv.imshow("debugCanvas", debugImg);
    //         debugImg.delete();

    //         // 6️⃣ Проверяем, нашли ли 4 маркера
    //         if (squares.length === 4) {
    //             console.log("✅ Найдены 4 маркера:", squares);

    //             // сортируем по положению — чтобы выровнять правильно
    //             squares.sort((a, b) => a.y - b.y || a.x - b.x);

    //             const topLeft = squares[0];
    //             const topRight = squares[1];
    //             const bottomLeft = squares[2];
    //             const bottomRight = squares[3];

    //             // Центры квадратов
    //             const srcPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
    //                 topLeft.x + topLeft.width / 2, topLeft.y + topLeft.height / 2,
    //                 topRight.x + topRight.width / 2, topRight.y + topRight.height / 2,
    //                 bottomRight.x + bottomRight.width / 2, bottomRight.y + bottomRight.height / 2,
    //                 bottomLeft.x + bottomLeft.width / 2, bottomLeft.y + bottomLeft.height / 2
    //             ]);

    //             // Целевая выровненная область
    //             const width = 800;
    //             const height = 1000;
    //             const dstPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
    //                 0, 0,
    //                 width, 0,
    //                 width, height,
    //                 0, height
    //             ]);

    //             // 7️⃣ Преобразование перспективы
    //             const M = cv.getPerspectiveTransform(srcPts, dstPts);
    //             const warped = new cv.Mat();
    //             cv.warpPerspective(src, warped, M, new cv.Size(width, height));

    //             // 8️⃣ Получаем результат как base64
    //             const outputCanvas = document.createElement("canvas");
    //             outputCanvas.width = width;
    //             outputCanvas.height = height;
    //             cv.imshow(outputCanvas, warped);
    //             const croppedImage = outputCanvas.toDataURL("image/png");

    //             // 🛑 Останавливаем камеру и передаём результат
    //             stopCamera();
    //             onCapture(croppedImage);

    //             // Очистка
    //             warped.delete();
    //             M.delete();
    //             srcPts.delete();
    //             dstPts.delete();
    //         } else {
    //             console.warn("⚠️ Не удалось найти 4 маркера. Используем fallback.");
    //             const fallback = canvas.toDataURL("image/png");
    //             onCapture(fallback);
    //         }

    //         // 🧹 Очистка памяти
    //         src.delete();
    //         gray.delete();
    //         thresh.delete();
    //         contours.delete();
    //         hierarchy.delete();

    //         stopCamera();
    //         setIsProcessing(false);
    //     }, 2300);
    // };

    // -----------------------------------------------------------+-
    const handleCapture = () => {
        setIsProcessing(true);
        setTimeout(() => playClickSound(), 1000);

        setTimeout(() => {
            const video = webcamRef.current?.video;
            if (!video) return;

            // 1️⃣ Снимаем кадр с максимальным разрешением
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            // 2️⃣ Загружаем в OpenCV
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
                11,
                2
            );

            // 3️⃣ Находим контуры
            const contours = new cv.MatVector();
            const hierarchy = new cv.Mat();
            cv.findContours(thresh, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

            const squares = [];
            for (let i = 0; i < contours.size(); i++) {
                const cnt = contours.get(i);
                const approx = new cv.Mat();
                cv.approxPolyDP(cnt, approx, 0.02 * cv.arcLength(cnt, true), true);

                if (approx.rows === 4 && cv.contourArea(approx) > 200) {
                    const rect = cv.boundingRect(approx);
                    const aspect = rect.width / rect.height;
                    if (aspect > 0.8 && aspect < 1.2) squares.push(rect);
                }

                cnt.delete();
                approx.delete();
            }

            if (squares.length === 4) {
                squares.sort((a, b) => a.y - b.y || a.x - b.x);
                const topLeft = squares[0];
                const topRight = squares[1];
                const bottomLeft = squares[2];
                const bottomRight = squares[3];

                // ✅ вычисляем реальные размеры по маркерам
                const topWidth = Math.hypot(
                    (topRight.x + topRight.width / 2) - (topLeft.x + topLeft.width / 2),
                    (topRight.y + topRight.height / 2) - (topLeft.y + topLeft.height / 2)
                );
                const bottomWidth = Math.hypot(
                    (bottomRight.x + bottomRight.width / 2) - (bottomLeft.x + bottomLeft.width / 2),
                    (bottomRight.y + bottomRight.height / 2) - (bottomLeft.y + bottomLeft.height / 2)
                );
                const leftHeight = Math.hypot(
                    (bottomLeft.x + bottomLeft.width / 2) - (topLeft.x + topLeft.width / 2),
                    (bottomLeft.y + bottomLeft.height / 2) - (topLeft.y + topLeft.height / 2)
                );
                const rightHeight = Math.hypot(
                    (bottomRight.x + bottomRight.width / 2) - (topRight.x + topRight.width / 2),
                    (bottomRight.y + bottomRight.height / 2) - (topRight.y + topRight.height / 2)
                );

                // усредняем ширину и высоту
                const width = Math.round((topWidth + bottomWidth) / 2);
                const height = Math.round((leftHeight + rightHeight) / 2);

                // 4️⃣ точки для преобразования
                const srcPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
                    topLeft.x + topLeft.width / 2, topLeft.y + topLeft.height / 2,
                    topRight.x + topRight.width / 2, topRight.y + topRight.height / 2,
                    bottomRight.x + bottomRight.width / 2, bottomRight.y + bottomRight.height / 2,
                    bottomLeft.x + bottomLeft.width / 2, bottomLeft.y + bottomLeft.height / 2
                ]);

                const dstPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
                    0, 0,
                    width, 0,
                    width, height,
                    0, height
                ]);

                // 5️⃣ Преобразование перспективы
                const M = cv.getPerspectiveTransform(srcPts, dstPts);
                const warped = new cv.Mat();
                cv.warpPerspective(src, warped, M, new cv.Size(width, height));

                // ✂️ Можно взять центральную часть, где находится шкала
                // const cropY = Math.round(height * 0.25);
                // const cropHeight = Math.round(height * 0.5);
                const cropY = Math.round(height * 0.1);
                const cropHeight = Math.round(height * 0.6);
                const cropX = Math.round(width * 0.19);
                const cropWidth = Math.round(width * 0.6);
                const cropped = warped.roi(new cv.Rect(cropX, cropY, cropWidth, cropHeight));

                // 6️⃣ Конвертируем в Base64
                const outputCanvas = document.createElement("canvas");
                outputCanvas.width = cropWidth;
                outputCanvas.height = cropHeight;
                cv.imshow(outputCanvas, cropped);
                const croppedImage = outputCanvas.toDataURL("image/png");

                stopCamera();
                onCapture(croppedImage);

                // очистка
                cropped.delete();
                warped.delete();
                M.delete();
                srcPts.delete();
                dstPts.delete();
            } else {
                console.warn("⚠️ Не удалось найти 4 маркера. Используем fallback.");
                const fallback = canvas.toDataURL("image/png");
                onCapture(fallback);
            }

            // 🧹 Очистка
            src.delete();
            gray.delete();
            thresh.delete();
            contours.delete();
            hierarchy.delete();

            stopCamera();
            setIsProcessing(false);
        }, 2300);
    };

    // ---------------------------------------------

    // const handleCapture = () => {
    //     setIsProcessing(true);
    //     setTimeout(() => playClickSound(), 1000);

    //     setTimeout(() => {
    //         const video = webcamRef.current?.video;
    //         const frame = frameRef.current;
    //         if (!video || !frame) return;

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
    //             11,
    //             2
    //         );

    //         // 3️⃣ Находим контуры маркеров
    //         const contours = new cv.MatVector();
    //         const hierarchy = new cv.Mat();
    //         cv.findContours(thresh, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    //         const squares = [];
    //         for (let i = 0; i < contours.size(); i++) {
    //             const cnt = contours.get(i);
    //             const approx = new cv.Mat();
    //             cv.approxPolyDP(cnt, approx, 0.02 * cv.arcLength(cnt, true), true);

    //             if (approx.rows === 4 && cv.contourArea(approx) > 200) {
    //                 const rect = cv.boundingRect(approx);
    //                 const aspect = rect.width / rect.height;
    //                 if (aspect > 0.8 && aspect < 1.2) squares.push(rect);
    //             }

    //             cnt.delete();
    //             approx.delete();
    //         }

    //         let croppedImage;

    //         if (squares.length === 4) {
    //             // ✅ Если нашли маркеры — делаем выравнивание
    //             squares.sort((a, b) => a.y - b.y || a.x - b.x);
    //             const topLeft = squares[0];
    //             const topRight = squares[1];
    //             const bottomLeft = squares[2];
    //             const bottomRight = squares[3];

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

    //             const width = Math.round((topWidth + bottomWidth) / 2);
    //             const height = Math.round((leftHeight + rightHeight) / 2);

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

    //             const M = cv.getPerspectiveTransform(srcPts, dstPts);
    //             const warped = new cv.Mat();
    //             cv.warpPerspective(src, warped, M, new cv.Size(width, height));

    //             // 🔹 Используем реальную рамку cropFrame для обрезки
    //             const frameRect = frame.getBoundingClientRect();
    //             const videoRect = video.getBoundingClientRect();

    //             const relX = (frameRect.left - videoRect.left) / videoRect.width;
    //             const relY = (frameRect.top - videoRect.top) / videoRect.height;
    //             const relW = frameRect.width / videoRect.width;
    //             const relH = frameRect.height / videoRect.height;

    //             const cropX = Math.round(width * relX);
    //             const cropY = Math.round(height * relY);
    //             const cropWidth = Math.round(width * relW);
    //             const cropHeight = Math.round(height * relH);

    //             const cropped = warped.roi(new cv.Rect(cropX, cropY, cropWidth, cropHeight));

    //             const outputCanvas = document.createElement("canvas");
    //             outputCanvas.width = cropWidth;
    //             outputCanvas.height = cropHeight;
    //             cv.imshow(outputCanvas, cropped);
    //             croppedImage = outputCanvas.toDataURL("image/png");

    //             // очистка
    //             cropped.delete();
    //             warped.delete();
    //             M.delete();
    //             srcPts.delete();
    //             dstPts.delete();

    //         } else {
    //             console.warn("⚠️ Не удалось найти 4 маркера. Используем fallback.");
    //             croppedImage = canvas.toDataURL("image/png");
    //         }

    //         // 🧹 Очистка памяти
    //         src.delete();
    //         gray.delete();
    //         thresh.delete();
    //         contours.delete();
    //         hierarchy.delete();

    //         stopCamera();
    //         setIsProcessing(false);
    //         onCapture(croppedImage);

    //     }, 2300);
    // };

    // ---------------------------------------------------


    // const handleCapture = () => {
    //     setIsProcessing(true);
    //     setTimeout(() => playClickSound(), 1000);

    //     setTimeout(() => {
    //         const video = webcamRef.current?.video;
    //         if (!video) return;

    //         // 1️⃣ Захват кадра
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
    //             11,
    //             2
    //         );

    //         // 3️⃣ Ограничиваем область поиска рамкой
    //         const frameRect = frameRef.current.getBoundingClientRect();
    //         const videoRect = video.getBoundingClientRect();
    //         const scaleX = video.videoWidth / videoRect.width;
    //         const scaleY = video.videoHeight / videoRect.height;

    //         const roiX = Math.round((frameRect.left - videoRect.left) * scaleX);
    //         const roiY = Math.round((frameRect.top - videoRect.top) * scaleY);
    //         const roiWidth = Math.round(frameRect.width * scaleX);
    //         const roiHeight = Math.round(frameRect.height * scaleY);

    //         const roi = thresh.roi(new cv.Rect(roiX, roiY, roiWidth, roiHeight));

    //         // 4️⃣ Находим контуры только внутри ROI
    //         const contours = new cv.MatVector();
    //         const hierarchy = new cv.Mat();
    //         cv.findContours(roi, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    //         const squares = [];
    //         for (let i = 0; i < contours.size(); i++) {
    //             const cnt = contours.get(i);
    //             const approx = new cv.Mat();
    //             cv.approxPolyDP(cnt, approx, 0.02 * cv.arcLength(cnt, true), true);

    //             if (approx.rows === 4 && cv.contourArea(approx) > 200) {
    //                 const rect = cv.boundingRect(approx);
    //                 rect.x += roiX; // поправка на координаты ROI
    //                 rect.y += roiY;

    //                 const aspect = rect.width / rect.height;
    //                 if (aspect > 0.8 && aspect < 1.2) squares.push(rect);
    //             }

    //             cnt.delete();
    //             approx.delete();
    //         }

    //         roi.delete();
    //         gray.delete();
    //         thresh.delete();

    //         if (squares.length === 4) {
    //             squares.sort((a, b) => a.y - b.y || a.x - b.x);
    //             const [topLeft, topRight, bottomLeft, bottomRight] = squares;

    //             // Вычисляем ширину и высоту
    //             const topWidth = Math.hypot((topRight.x + topRight.width / 2) - (topLeft.x + topLeft.width / 2),
    //                 (topRight.y + topRight.height / 2) - (topLeft.y + topLeft.height / 2));
    //             const bottomWidth = Math.hypot((bottomRight.x + bottomRight.width / 2) - (bottomLeft.x + bottomLeft.width / 2),
    //                 (bottomRight.y + bottomRight.height / 2) - (bottomLeft.y + bottomLeft.height / 2));
    //             const leftHeight = Math.hypot((bottomLeft.x + bottomLeft.width / 2) - (topLeft.x + topLeft.width / 2),
    //                 (bottomLeft.y + bottomLeft.height / 2) - (topLeft.y + topLeft.height / 2));
    //             const rightHeight = Math.hypot((bottomRight.x + bottomRight.width / 2) - (topRight.x + topRight.width / 2),
    //                 (bottomRight.y + bottomRight.height / 2) - (topRight.y + topRight.height / 2));

    //             const width = Math.round((topWidth + bottomWidth) / 2);
    //             const height = Math.round((leftHeight + rightHeight) / 2);

    //             // Точки для преобразования
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

    //             // Преобразование перспективы
    //             const M = cv.getPerspectiveTransform(srcPts, dstPts);
    //             const warped = new cv.Mat();
    //             cv.warpPerspective(src, warped, M, new cv.Size(width, height));

    //             // Кроп центральной части
    //             const cropY = Math.round(height * 0.1);
    //             const cropHeight = Math.round(height * 0.6);
    //             const cropX = Math.round(width * 0.19);
    //             const cropWidth = Math.round(width * 0.6);
    //             const cropped = warped.roi(new cv.Rect(cropX, cropY, cropWidth, cropHeight));

    //             // Base64 результат
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
    //             console.warn("⚠️ Не удалось найти 4 маркера. Используем fallback.");
    //             const fallback = canvas.toDataURL("image/png");
    //             onCapture(fallback);
    //         }

    //         src.delete();
    //         contours.delete();
    //         hierarchy.delete();
    //         stopCamera();
    //         setIsProcessing(false);

    //     }, 2300);
    // };

    // --------------------------------------------------------------???

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

    //         // 2️⃣ Получаем размеры видео на экране (CSS)
    //         const videoRect = video.getBoundingClientRect();
    //         const frameRect = frameRef.current.getBoundingClientRect();

    //         // 3️⃣ Вычисляем коэффициенты масштабирования
    //         const scaleX = video.videoWidth / videoRect.width;
    //         const scaleY = video.videoHeight / videoRect.height;

    //         // 4️⃣ Вычисляем координаты рамки в координатах видео
    //         const roiX = Math.round((frameRect.left - videoRect.left) * scaleX);
    //         const roiY = Math.round((frameRect.top - videoRect.top) * scaleY);
    //         const roiWidth = Math.round(frameRect.width * scaleX);
    //         const roiHeight = Math.round(frameRect.height * scaleY);

    //         console.log("ROI coords:", roiX, roiY, roiWidth, roiHeight, "Video size:", video.videoWidth, video.videoHeight);

    //         // 5️⃣ Загружаем в OpenCV
    //         const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    //         const src = cv.matFromImageData(imgData);

    //         // 6️⃣ Обрезаем по ROI
    //         const cropped = src.roi(new cv.Rect(roiX, roiY, roiWidth, roiHeight));

    //         // 7️⃣ Преобразуем в Base64
    //         const outputCanvas = document.createElement("canvas");
    //         outputCanvas.width = roiWidth;
    //         outputCanvas.height = roiHeight;
    //         cv.imshow(outputCanvas, cropped);
    //         const croppedImage = outputCanvas.toDataURL("image/png");

    //         stopCamera();
    //         onCapture(croppedImage);

    //         // 8️⃣ Очистка
    //         cropped.delete();
    //         src.delete();
    //         setIsProcessing(false);
    //     }, 2300);
    // };

    // --------------------------------------------------------

    // const handleCapture = () => {
    //     setIsProcessing(true);

    //     // 🔊 звук через 1 секунду
    //     setTimeout(() => playClickSound(), 1000);

    //     // ⏳ задержка под анимацию
    //     setTimeout(() => {
    //         const video = webcamRef.current?.video;
    //         if (!video) return;

    //         // 1️⃣ Захват кадра
    //         const canvas = document.createElement("canvas");
    //         canvas.width = video.videoWidth;
    //         canvas.height = video.videoHeight;
    //         const ctx = canvas.getContext("2d");
    //         ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    //         const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    //         // 2️⃣ Загружаем в OpenCV
    //         const src = cv.matFromImageData(imgData);
    //         const gray = new cv.Mat();
    //         cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
    //         cv.GaussianBlur(gray, gray, new cv.Size(5, 5), 0);
    //         const thresh = new cv.Mat();
    //         cv.adaptiveThreshold(gray, thresh, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 11, 2);

    //         // 3️⃣ Находим контуры и фильтруем квадраты
    //         const contours = new cv.MatVector();
    //         const hierarchy = new cv.Mat();
    //         cv.findContours(thresh, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    //         const squares = [];
    //         for (let i = 0; i < contours.size(); i++) {
    //             const cnt = contours.get(i);
    //             const approx = new cv.Mat();
    //             cv.approxPolyDP(cnt, approx, 0.02 * cv.arcLength(cnt, true), true);

    //             if (approx.rows === 4 && cv.contourArea(approx) > 200) {
    //                 const rect = cv.boundingRect(approx);
    //                 const aspect = rect.width / rect.height;
    //                 if (aspect > 0.8 && aspect < 1.2) squares.push(rect);
    //             }

    //             cnt.delete();
    //             approx.delete();
    //         }

    //         if (squares.length === 4) {
    //             // 4️⃣ Выравниваем по маркерам
    //             squares.sort((a, b) => a.y - b.y || a.x - b.x);
    //             const [topLeft, topRight, bottomLeft, bottomRight] = squares;

    //             const srcPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
    //                 topLeft.x + topLeft.width / 2, topLeft.y + topLeft.height / 2,
    //                 topRight.x + topRight.width / 2, topRight.y + topRight.height / 2,
    //                 bottomRight.x + bottomRight.width / 2, bottomRight.y + bottomRight.height / 2,
    //                 bottomLeft.x + bottomLeft.width / 2, bottomLeft.y + bottomLeft.height / 2
    //             ]);

    //             const width = 800;   // фиксированная ширина
    //             const height = 1000; // фиксированная высота
    //             const dstPts = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, width, 0, width, height, 0, height]);

    //             const M = cv.getPerspectiveTransform(srcPts, dstPts);
    //             const warped = new cv.Mat();
    //             cv.warpPerspective(src, warped, M, new cv.Size(width, height));

    //             // 5️⃣ Берём центральную полоску (по вертикали)
    //             const cropY = Math.round(height * 0.25);
    //             const cropHeight = Math.round(height * 0.5);
    //             const cropX = 0;
    //             const cropWidth = width;
    //             const cropped = warped.roi(new cv.Rect(cropX, cropY, cropWidth, cropHeight));

    //             // 6️⃣ Конвертируем в Base64
    //             const outputCanvas = document.createElement("canvas");
    //             outputCanvas.width = cropWidth;
    //             outputCanvas.height = cropHeight;
    //             cv.imshow(outputCanvas, cropped);
    //             const croppedImage = outputCanvas.toDataURL("image/png");

    //             // 7️⃣ Очистка
    //             cropped.delete();
    //             warped.delete();
    //             M.delete();
    //             srcPts.delete();
    //             dstPts.delete();

    //             stopCamera();
    //             onCapture(croppedImage);
    //         } else {
    //             // fallback: весь кадр
    //             console.warn("⚠️ Не удалось найти 4 маркера. Используем fallback.");
    //             onCapture(canvas.toDataURL("image/png"));
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

    const handleUserMedia = () => {
        // camera ready
        setTimeout(() => setIsReady(true), 150);
    };

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
                    width: { ideal: 1920 }, // можно попросить более высокое разрешение
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




