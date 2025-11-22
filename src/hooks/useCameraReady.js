import { useState, useEffect } from "react";

export const useCameraReady = (webcamRef) => {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const video = webcamRef.current?.video;
        if (!video) return;

        const onMeta = () => {
            setIsReady(true);
            video.removeEventListener("loadedmetadata", onMeta);
        };

        video.addEventListener("loadedmetadata", onMeta);

        return () => video?.removeEventListener("loadedmetadata", onMeta);
    }, [webcamRef]);

    return isReady;
};

export default useCameraReady;