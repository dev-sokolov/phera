import { useState, useEffect, useCallback, useRef } from "react";

export const useMarkerDetection = (webcamRef) => {
    const [hasFourMarkers, setHasFourMarkers] = useState(false);
    const canvasRef = useRef(null);

    const startDetection = useCallback(() => {
        if (!webcamRef.current) return;
        const video = webcamRef.current.video;
        if (!video) return;

        if (!canvasRef.current) canvasRef.current = document.createElement("canvas");
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        let stopped = false;

        const src = new cv.Mat(video.videoHeight, video.videoWidth, cv.CV_8UC4);
        const gray = new cv.Mat();
        const thresh = new cv.Mat();
        const contours = new cv.MatVector();
        const hierarchy = new cv.Mat();

        const detect = () => {
            if (stopped) return;

            if (video.videoWidth === 0 || video.videoHeight === 0) {
                requestAnimationFrame(detect);
                return;
            }

            try {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                src.data.set(imgData.data);

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

                    if (approx.rows === 4 && cv.contourArea(approx) > 1000) {
                        const rect = cv.boundingRect(approx);
                        const aspect = rect.width / rect.height;
                        if (aspect > 0.6 && aspect < 1.4) count++;
                    }
                    approx.delete();
                }

                setHasFourMarkers(prev => (prev !== (count >= 4) ? (count >= 4) : prev));
            } catch (err) {
                console.warn("OpenCV error:", err);
            }

            requestAnimationFrame(detect);
        };

        requestAnimationFrame(detect);

        return () => {
            stopped = true;
            src.delete();
            gray.delete();
            thresh.delete();
            contours.delete();
            hierarchy.delete();
        };
    }, [webcamRef]);

    return { hasFourMarkers, startDetection };
};

export default useMarkerDetection;