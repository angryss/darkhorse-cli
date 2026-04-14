/**
 * @file canvas.ts
 * @description Canvas utility functions for image manipulation
 */
/**
 * Load image from source
 */
export async function loadImageFromSource(source) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image'));
        if (source.type === 'url' && typeof source.value === 'string') {
            img.src = source.value;
        }
        else if (source.type === 'file' && source.value instanceof File) {
            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target?.result;
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(source.value);
        }
        else if (source.type === 'blob' && source.value instanceof Blob) {
            img.src = URL.createObjectURL(source.value);
        }
        else {
            reject(new Error('Invalid image source'));
        }
    });
}
/**
 * Create canvas from image
 */
export function createCanvasFromImage(img) {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.drawImage(img, 0, 0);
    }
    return canvas;
}
/**
 * Rotate canvas
 */
export function rotateCanvas(canvas, degrees) {
    const newCanvas = document.createElement('canvas');
    const radians = (degrees * Math.PI) / 180;
    // Swap dimensions for 90/270 degree rotations
    if (degrees === 90 || degrees === 270 || degrees === -90 || degrees === -270) {
        newCanvas.width = canvas.height;
        newCanvas.height = canvas.width;
    }
    else {
        newCanvas.width = canvas.width;
        newCanvas.height = canvas.height;
    }
    const ctx = newCanvas.getContext('2d');
    if (ctx) {
        ctx.translate(newCanvas.width / 2, newCanvas.height / 2);
        ctx.rotate(radians);
        ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
    }
    return newCanvas;
}
/**
 * Flip canvas
 */
export function flipCanvas(canvas, horizontal) {
    const newCanvas = document.createElement('canvas');
    newCanvas.width = canvas.width;
    newCanvas.height = canvas.height;
    const ctx = newCanvas.getContext('2d');
    if (ctx) {
        ctx.save();
        if (horizontal) {
            ctx.scale(-1, 1);
            ctx.drawImage(canvas, -canvas.width, 0);
        }
        else {
            ctx.scale(1, -1);
            ctx.drawImage(canvas, 0, -canvas.height);
        }
        ctx.restore();
    }
    return newCanvas;
}
/**
 * Crop canvas
 */
export function cropCanvas(canvas, region) {
    const newCanvas = document.createElement('canvas');
    newCanvas.width = region.width;
    newCanvas.height = region.height;
    const ctx = newCanvas.getContext('2d');
    if (ctx) {
        ctx.drawImage(canvas, region.x, region.y, region.width, region.height, 0, 0, region.width, region.height);
    }
    return newCanvas;
}
/**
 * Resize canvas
 */
export function resizeCanvas(canvas, width, height) {
    const newCanvas = document.createElement('canvas');
    newCanvas.width = width;
    newCanvas.height = height;
    const ctx = newCanvas.getContext('2d');
    if (ctx) {
        ctx.drawImage(canvas, 0, 0, width, height);
    }
    return newCanvas;
}
/**
 * Get canvas data URL
 */
export function getCanvasDataUrl(canvas, format = 'image/png', quality = 0.92) {
    return canvas.toDataURL(format, quality);
}
/**
 * Get canvas blob
 */
export async function getCanvasBlob(canvas, format = 'image/png', quality = 0.92) {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob);
            }
            else {
                reject(new Error('Failed to create blob'));
            }
        }, format, quality);
    });
}
/**
 * Clone canvas
 */
export function cloneCanvas(canvas) {
    const newCanvas = document.createElement('canvas');
    newCanvas.width = canvas.width;
    newCanvas.height = canvas.height;
    const ctx = newCanvas.getContext('2d');
    if (ctx) {
        ctx.drawImage(canvas, 0, 0);
    }
    return newCanvas;
}
/**
 * Get image data from canvas
 */
export function getImageData(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx)
        return null;
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
}
/**
 * Put image data to canvas
 */
export function putImageData(canvas, imageData) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.putImageData(imageData, 0, 0);
    }
}
/**
 * Clear canvas
 */
export function clearCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}
//# sourceMappingURL=canvas.js.map