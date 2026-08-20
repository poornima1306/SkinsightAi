/**
 * Utility to generate a realistic Grad-CAM / Attention Map overlay from any image.
 * Uses canvas image processing and Gaussian heat kernels with Jet/Turbo thermal colormap.
 */

// Jet colormap RGB interpolation
function getJetColor(val: number): [number, number, number] {
  // val is 0.0 to 1.0
  const v = Math.max(0, Math.min(1, val));
  let r = 0;
  let g = 0;
  let b = 0;

  if (v < 0.125) {
    r = 0;
    g = 0;
    b = 0.5 + 4 * v;
  } else if (v < 0.375) {
    r = 0;
    g = 4 * (v - 0.125);
    b = 1;
  } else if (v < 0.625) {
    r = 4 * (v - 0.375);
    g = 1;
    b = 1 - 4 * (v - 0.375);
  } else if (v < 0.875) {
    r = 1;
    g = 1 - 4 * (v - 0.625);
    b = 0;
  } else {
    r = 1 - 2 * (v - 0.875);
    g = 0;
    b = 0;
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

export function generateGradCamHeatmap(
  imageElement: HTMLImageElement,
  options?: {
    customCenter?: { x: number; y: number };
    intensity?: number;
    spread?: number;
  }
): Promise<{ heatmapUrl: string; blendedUrl: string }> {
  return new Promise((resolve) => {
    const width = Math.min(imageElement.naturalWidth || 400, 512);
    const height = Math.min(imageElement.naturalHeight || 400, 512);

    // 1. Offscreen canvas for original resized
    const srcCanvas = document.createElement('canvas');
    srcCanvas.width = width;
    srcCanvas.height = height;
    const srcCtx = srcCanvas.getContext('2d');
    if (!srcCtx) {
      resolve({ heatmapUrl: imageElement.src, blendedUrl: imageElement.src });
      return;
    }
    srcCtx.drawImage(imageElement, 0, 0, width, height);

    // Get image data to find the darkest/most contrasty central region (typical for skin lesions)
    const imgData = srcCtx.getImageData(0, 0, width, height);
    const data = imgData.data;

    let weightedX = 0;
    let weightedY = 0;
    let totalWeight = 0;

    // Scan for lesion center (darker / high color delta from peripheral skin)
    const marginX = Math.floor(width * 0.15);
    const marginY = Math.floor(height * 0.15);

    for (let y = marginY; y < height - marginY; y += 4) {
      for (let x = marginX; x < width - marginX; x += 4) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        // Lesions are darker or have strong color variance
        const weight = Math.max(0, 255 - brightness);
        weightedX += x * weight;
        weightedY += y * weight;
        totalWeight += weight;
      }
    }

    const centerX = totalWeight > 0 ? weightedX / totalWeight : width / 2;
    const centerY = totalWeight > 0 ? weightedY / totalWeight : height / 2;

    const targetCenterX = options?.customCenter?.x ? options.customCenter.x * width : centerX;
    const targetCenterY = options?.customCenter?.y ? options.customCenter.y * height : centerY;

    const radius = Math.min(width, height) * (options?.spread || 0.32);

    // 2. Heatmap Canvas
    const heatCanvas = document.createElement('canvas');
    heatCanvas.width = width;
    heatCanvas.height = height;
    const heatCtx = heatCanvas.getContext('2d');
    if (!heatCtx) {
      resolve({ heatmapUrl: imageElement.src, blendedUrl: imageElement.src });
      return;
    }

    const heatImgData = heatCtx.createImageData(width, height);
    const heatData = heatImgData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Multi-lobe activation to simulate CNN feature map attention
        const d1 = Math.hypot(x - targetCenterX, y - targetCenterY);
        const d2 = Math.hypot(x - (targetCenterX + radius * 0.25), y - (targetCenterY - radius * 0.2));
        const d3 = Math.hypot(x - (targetCenterX - radius * 0.2), y - (targetCenterY + radius * 0.3));

        const g1 = Math.exp(-(d1 * d1) / (2 * radius * radius));
        const g2 = 0.55 * Math.exp(-(d2 * d2) / (2 * (radius * 0.65) * (radius * 0.65)));
        const g3 = 0.4 * Math.exp(-(d3 * d3) / (2 * (radius * 0.5) * (radius * 0.5)));

        const activation = Math.min(1, (g1 + g2 + g3) * (options?.intensity || 1.05));
        const [r, g, b] = getJetColor(activation);

        const pIdx = (y * width + x) * 4;
        heatData[pIdx] = r;
        heatData[pIdx + 1] = g;
        heatData[pIdx + 2] = b;
        heatData[pIdx + 3] = 255;
      }
    }
    heatCtx.putImageData(heatImgData, 0, 0);
    const heatmapUrl = heatCanvas.toDataURL('image/png');

    // 3. Blended Overlay Canvas (60% heatmap alpha over grayscale or source image)
    const blendCanvas = document.createElement('canvas');
    blendCanvas.width = width;
    blendCanvas.height = height;
    const blendCtx = blendCanvas.getContext('2d');
    if (!blendCtx) {
      resolve({ heatmapUrl, blendedUrl: heatmapUrl });
      return;
    }

    // Draw source
    blendCtx.drawImage(srcCanvas, 0, 0);
    // Draw heatmap with screen/alpha blend
    blendCtx.globalAlpha = 0.58;
    blendCtx.drawImage(heatCanvas, 0, 0);
    blendCtx.globalAlpha = 1.0;

    const blendedUrl = blendCanvas.toDataURL('image/png');

    resolve({ heatmapUrl, blendedUrl });
  });
}
