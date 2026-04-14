/**
 * @file filters.ts
 * @description Image filter functions
 */
/**
 * Apply brightness filter
 */
export function applyBrightness(imageData, value) {
    const data = imageData.data;
    const brightness = Math.round(value * 2.55); // Convert 0-100 to 0-255
    for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.max(0, Math.min(255, (data[i] ?? 0) + brightness));
        data[i + 1] = Math.max(0, Math.min(255, (data[i + 1] ?? 0) + brightness));
        data[i + 2] = Math.max(0, Math.min(255, (data[i + 2] ?? 0) + brightness));
    }
    return imageData;
}
/**
 * Apply contrast filter
 */
export function applyContrast(imageData, value) {
    const data = imageData.data;
    const contrast = (value + 100) / 100; // Convert -100 to 100 range to 0 to 2
    const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));
    for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.max(0, Math.min(255, factor * ((data[i] ?? 0) - 128) + 128));
        data[i + 1] = Math.max(0, Math.min(255, factor * ((data[i + 1] ?? 0) - 128) + 128));
        data[i + 2] = Math.max(0, Math.min(255, factor * ((data[i + 2] ?? 0) - 128) + 128));
    }
    return imageData;
}
/**
 * Apply saturation filter
 */
export function applySaturation(imageData, value) {
    const data = imageData.data;
    const saturation = value / 100; // Convert 0-100 to 0-1
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i] ?? 0;
        const g = data[i + 1] ?? 0;
        const b = data[i + 2] ?? 0;
        // Calculate grayscale value
        const gray = 0.2989 * r + 0.587 * g + 0.114 * b;
        // Apply saturation
        data[i] = Math.max(0, Math.min(255, gray + saturation * (r - gray)));
        data[i + 1] = Math.max(0, Math.min(255, gray + saturation * (g - gray)));
        data[i + 2] = Math.max(0, Math.min(255, gray + saturation * (b - gray)));
    }
    return imageData;
}
/**
 * Apply hue rotation filter
 */
export function applyHue(imageData, value) {
    const data = imageData.data;
    const angle = (value * Math.PI) / 180;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    // Rotation matrix
    const matrix = [
        cosA + (1 - cosA) / 3,
        (1 / 3) * (1 - cosA) - Math.sqrt(1 / 3) * sinA,
        (1 / 3) * (1 - cosA) + Math.sqrt(1 / 3) * sinA,
        (1 / 3) * (1 - cosA) + Math.sqrt(1 / 3) * sinA,
        cosA + (1 / 3) * (1 - cosA),
        (1 / 3) * (1 - cosA) - Math.sqrt(1 / 3) * sinA,
        (1 / 3) * (1 - cosA) - Math.sqrt(1 / 3) * sinA,
        (1 / 3) * (1 - cosA) + Math.sqrt(1 / 3) * sinA,
        cosA + (1 / 3) * (1 - cosA),
    ];
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i] ?? 0;
        const g = data[i + 1] ?? 0;
        const b = data[i + 2] ?? 0;
        data[i] = Math.max(0, Math.min(255, r * (matrix[0] ?? 0) + g * (matrix[1] ?? 0) + b * (matrix[2] ?? 0)));
        data[i + 1] = Math.max(0, Math.min(255, r * (matrix[3] ?? 0) + g * (matrix[4] ?? 0) + b * (matrix[5] ?? 0)));
        data[i + 2] = Math.max(0, Math.min(255, r * (matrix[6] ?? 0) + g * (matrix[7] ?? 0) + b * (matrix[8] ?? 0)));
    }
    return imageData;
}
/**
 * Apply blur filter (simple box blur)
 */
export function applyBlur(imageData, radius) {
    if (radius <= 0)
        return imageData;
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const output = new Uint8ClampedArray(data);
    const rad = Math.round(radius);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0, count = 0;
            for (let dy = -rad; dy <= rad; dy++) {
                for (let dx = -rad; dx <= rad; dx++) {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                        const idx = (ny * width + nx) * 4;
                        r += data[idx] ?? 0;
                        g += data[idx + 1] ?? 0;
                        b += data[idx + 2] ?? 0;
                        count++;
                    }
                }
            }
            const idx = (y * width + x) * 4;
            output[idx] = r / count;
            output[idx + 1] = g / count;
            output[idx + 2] = b / count;
        }
    }
    for (let i = 0; i < data.length; i++) {
        const val = output[i];
        if (val !== undefined) {
            data[i] = val;
        }
    }
    return imageData;
}
/**
 * Apply sharpen filter
 */
export function applySharpen(imageData, amount) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const output = new Uint8ClampedArray(data);
    // Sharpen kernel
    const weight = amount / 100;
    const kernel = [
        0, -weight, 0,
        -weight, 1 + 4 * weight, -weight,
        0, -weight, 0
    ];
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            for (let c = 0; c < 3; c++) {
                let sum = 0;
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const idx = ((y + ky) * width + (x + kx)) * 4 + c;
                        const kernelIdx = (ky + 1) * 3 + (kx + 1);
                        sum += (data[idx] ?? 0) * (kernel[kernelIdx] ?? 0);
                    }
                }
                const idx = (y * width + x) * 4 + c;
                output[idx] = Math.max(0, Math.min(255, sum));
            }
        }
    }
    for (let i = 0; i < data.length; i++) {
        const val = output[i];
        if (val !== undefined) {
            data[i] = val;
        }
    }
    return imageData;
}
/**
 * Apply grayscale filter
 */
export function applyGrayscale(imageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const gray = 0.2989 * (data[i] ?? 0) + 0.587 * (data[i + 1] ?? 0) + 0.114 * (data[i + 2] ?? 0);
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
    }
    return imageData;
}
/**
 * Apply all adjustments from settings
 */
export function applyAdjustments(imageData, settings) {
    let result = imageData;
    if (settings.brightness !== undefined && settings.brightness !== 0) {
        result = applyBrightness(result, settings.brightness);
    }
    if (settings.contrast !== undefined && settings.contrast !== 0) {
        result = applyContrast(result, settings.contrast);
    }
    if (settings.saturation !== undefined && settings.saturation !== 100) {
        result = applySaturation(result, settings.saturation);
    }
    if (settings.hue !== undefined && settings.hue !== 0) {
        result = applyHue(result, settings.hue);
    }
    if (settings.blur !== undefined && settings.blur > 0) {
        result = applyBlur(result, settings.blur);
    }
    if (settings.sharpen !== undefined && settings.sharpen > 0) {
        result = applySharpen(result, settings.sharpen);
    }
    return result;
}
//# sourceMappingURL=filters.js.map