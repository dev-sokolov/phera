export const checkBlur = (canvas) => {
    const ctx = canvas.getContext('2d', { willReadFrequently: true }); 
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    const gray = new Uint8Array(canvas.width * canvas.height);
    for (let i = 0; i < data.length; i += 4) {
        gray[i / 4] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }
    
    let laplacianSum = 0;
    const width = canvas.width;
    const height = canvas.height;
    
    const startY = Math.floor(height * 0.25);
    const endY = Math.floor(height * 0.75);
    const startX = Math.floor(width * 0.25);
    const endX = Math.floor(width * 0.75);
    
    for (let y = startY; y < endY - 1; y++) {
        for (let x = startX; x < endX - 1; x++) {
            const idx = y * width + x;
            const laplacian = Math.abs(
                4 * gray[idx] -
                gray[idx - 1] - gray[idx + 1] -
                gray[idx - width] - gray[idx + width]
            );
            laplacianSum += laplacian * laplacian;
        }
    }
    
    const pixels = (endY - startY) * (endX - startX);
    const variance = laplacianSum / pixels;
    
    return {
        variance,
        isBlurry: variance < 100,
        quality: variance > 200 ? 'excellent' : variance > 100 ? 'good' : 'poor'
    };
};

export const checkExposure = (canvas) => {
    const ctx = canvas.getContext('2d', { willReadFrequently: true }); 
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    let overexposedPixels = 0;
    let underexposedPixels = 0;
    const totalPixels = canvas.width * canvas.height;
    
    for (let i = 0; i < data.length; i += 16) { 
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        
        if (brightness > 240) overexposedPixels++;
        if (brightness < 20) underexposedPixels++;
    }
    
    const sampledPixels = totalPixels / 4;
    const overexposedPercent = (overexposedPixels / sampledPixels) * 100;
    const underexposedPercent = (underexposedPixels / sampledPixels) * 100;
    
    return {
        overexposedPercent,
        underexposedPercent,
        hasGlare: overexposedPercent > 10,
        tooDark: underexposedPercent > 30,
        quality: overexposedPercent < 5 && underexposedPercent < 20 ? 'good' : 'poor'
    };
};

export const checkImageQuality = (canvas) => {
    const blurCheck = checkBlur(canvas);
    const exposureCheck = checkExposure(canvas);
    
    const isGoodQuality = 
        !blurCheck.isBlurry && 
        !exposureCheck.hasGlare && 
        !exposureCheck.tooDark;
    
    return {
        isGoodQuality,
        blur: blurCheck,
        exposure: exposureCheck,
        overallQuality: isGoodQuality ? 'excellent' : 'poor',
        issues: [
            blurCheck.isBlurry && 'Image is blurry',
            exposureCheck.hasGlare && 'Too much glare detected',
            exposureCheck.tooDark && 'Image is too dark'
        ].filter(Boolean)
    };
};