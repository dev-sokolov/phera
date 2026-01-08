import { useState, useCallback, useRef } from "react";

export const useMarkerDetection = (webcamRef, onQualityCheck) => {
    const [hasFourMarkers, setHasFourMarkers] = useState(false);
    const canvasRef = useRef(null);
    const qualityCheckCounterRef = useRef(0);

    const startDetection = useCallback(() => {
        if (!webcamRef.current) return;
        const video = webcamRef.current.video;
        if (!video) return;

        if (!canvasRef.current) canvasRef.current = document.createElement("canvas");
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        let stopped = false;
        let lastProcessTime = 0;
        const PROCESS_INTERVAL = 250;

        const detect = (timestamp) => {
            if (stopped) return;

            if (video.videoWidth === 0 || video.videoHeight === 0) {
                requestAnimationFrame(detect);
                return;
            }

            if (timestamp - lastProcessTime < PROCESS_INTERVAL) {
                requestAnimationFrame(detect);
                return;
            }
            lastProcessTime = timestamp;

            try {
                const processWidth = Math.floor(video.videoWidth / 2);
                const processHeight = Math.floor(video.videoHeight / 2);
                
                canvas.width = processWidth;
                canvas.height = processHeight;

                ctx.drawImage(video, 0, 0, processWidth, processHeight);
                
                // Проверка качества каждые 3 кадра
                qualityCheckCounterRef.current++;
                if (qualityCheckCounterRef.current % 3 === 0 && onQualityCheck) {
                    onQualityCheck(canvas);
                }
                
                const imgData = ctx.getImageData(0, 0, processWidth, processHeight);
                
                const src = new cv.Mat(processHeight, processWidth, cv.CV_8UC4);
                src.data.set(imgData.data);
                
                const gray = new cv.Mat();
                const thresh = new cv.Mat();
                const contours = new cv.MatVector();
                const hierarchy = new cv.Mat();

                cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
                cv.GaussianBlur(gray, gray, new cv.Size(5, 5), 0);
                cv.adaptiveThreshold(
                    gray, thresh, 255,
                    cv.ADAPTIVE_THRESH_GAUSSIAN_C,
                    cv.THRESH_BINARY_INV,
                    15, 4
                );

                cv.findContours(thresh, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

                let count = 0;
                
                for (let i = 0; i < contours.size(); i++) {
                    const cnt = contours.get(i);
                    const approx = new cv.Mat();
                    
                    cv.approxPolyDP(cnt, approx, 0.02 * cv.arcLength(cnt, true), true);

                    if (approx.rows === 4 && cv.contourArea(approx) > 250) {
                        const rect = cv.boundingRect(approx);
                        const aspect = rect.width / rect.height;
                        
                        if (aspect > 0.6 && aspect < 1.4) {
                            count++;
                        }
                    }
                    approx.delete();
                }

                src.delete();
                gray.delete();
                thresh.delete();
                contours.delete();
                hierarchy.delete();

                setHasFourMarkers(prev => {
                    const next = count >= 4;
                    return prev !== next ? next : prev;
                });
            } catch (err) {
                console.warn("OpenCV error:", err);
            }

            requestAnimationFrame(detect);
        };

        requestAnimationFrame(detect);

        return () => {
            stopped = true;
        };
    }, [webcamRef, onQualityCheck]);

    return { hasFourMarkers, startDetection };
};

export default useMarkerDetection;