import { useState } from "react";
import { addImage } from "../shared/api/images-api.js";

export const useCapture = (webcamRef, onCapture) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const capture = async (hasFourMarkers) => {
        if (!webcamRef.current || !hasFourMarkers || isProcessing) return;
        setIsProcessing(true);

        try {
            const screenshot = webcamRef.current.getScreenshot({ width: 1920, height: 1080 });
            if (!screenshot) throw new Error("Screenshot failed");

            const blob = await fetch(screenshot).then(r => r.blob());
            const formData = new FormData();
            formData.append("image", blob, "capture.png");

            const res = await addImage(formData);
            if (!res || res.error) throw new Error("Backend error");

            onCapture(res);
        } catch (err) {
            console.error(err);
            alert("Failed to process image. Try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    return { isProcessing, capture };
};

export default useCapture;