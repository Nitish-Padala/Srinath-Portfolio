import { PortfolioPhoto } from './portfolioLogic';

const OFFLINE_CACHE_NAME = 'srinath-portfolio-offline-v4';
const loadedImageElementCache = new Map<string, Promise<HTMLImageElement>>();

/**
 * Resolves static asset URLs relative to the deployment base URL (works seamlessly
 * on GitHub Pages subpaths e.g. /<repo>/, Vercel root /, or local dev).
 */
export function resolveAssetUrl(url: string): string {
  if (!url || url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const cleanUrl = url.replace(/^\/+/, '');
  const baseUrl =
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || './';
  if (baseUrl === './') {
    return `./${cleanUrl}`;
  }
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${cleanBase}/${cleanUrl}`;
}

/**
 * Returns the real photograph URL for Srinath's portfolio cards and fullscreen viewer.
 */
export function renderPhotoDataUrl(photo: PortfolioPhoto, _width = 720, _height = 540): string {
  if (photo.customDataUrl) {
    return photo.customDataUrl;
  }
  return resolveAssetUrl(photo.imageUrl);
}

/**
 * Loads an HTMLImageElement once per URL and caches the promise for fast reuse across 3D Globe tiles.
 */
export function loadCachedImageElement(url: string): Promise<HTMLImageElement> {
  const resolvedUrl = resolveAssetUrl(url);
  const existing = loadedImageElementCache.get(resolvedUrl);
  if (existing) return existing;

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = resolvedUrl;
  });

  loadedImageElementCache.set(resolvedUrl, promise);
  return promise;
}

/**
 * Renders a low-key darkroom-toned, aspect-cropped (`object-fit: cover` around `photo.focalX` & `photo.focalY`
 * with `photo.cropZoom` support) canvas of Srinath's real photograph for tightly packed 3D Photo Globe tiles.
 */
export async function renderEditedGlobeTileCanvas(
  photo: PortfolioPhoto,
  targetWidth = 520,
  targetHeight = 400
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  try {
    const img = await loadCachedImageElement(photo.customDataUrl || photo.imageUrl);
    const srcW = img.naturalWidth || img.width || targetWidth;
    const srcH = img.naturalHeight || img.height || targetHeight;

    const targetAspect = targetWidth / targetHeight;
    const srcAspect = srcW / srcH;

    let baseW = srcW;
    let baseH = srcH;

    if (srcAspect > targetAspect) {
      baseW = srcH * targetAspect;
    } else {
      baseH = srcW / targetAspect;
    }

    const zoom = Math.max(1, photo.cropZoom ?? 1);
    const sWidth = baseW / zoom;
    const sHeight = baseH / zoom;

    const fx = Math.max(0, Math.min(1, photo.focalX ?? 0.5));
    const fy = Math.max(0, Math.min(1, photo.focalY ?? 0.35));

    const maxSx = Math.max(0, srcW - sWidth);
    const maxSy = Math.max(0, srcH - sHeight);
    const sx = Math.min(maxSx, Math.max(0, maxSx * fx));
    const sy = Math.min(maxSy, Math.max(0, maxSy * fy));

    // Deep charcoal base
    ctx.fillStyle = '#14110f';
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    ctx.save();
    if (photo.filterStyle) {
      ctx.filter = photo.filterStyle;
    }
    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);
    ctx.restore();

    // Subtle low-key warm darkroom glaze so no highlight looks over-bright on the 3D Globe
    ctx.fillStyle = 'rgba(20, 15, 11, 0.14)';
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // Warm saffron-gold & charcoal optical radial vignette
    const vig = ctx.createRadialGradient(
      targetWidth / 2,
      targetHeight / 2,
      targetWidth * 0.28,
      targetWidth / 2,
      targetHeight / 2,
      targetWidth * 0.72
    );
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(0.7, 'rgba(20, 16, 13, 0.16)');
    vig.addColorStop(1, 'rgba(14, 11, 9, 0.48)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // Crisp Option 5 Champagne-Gold museum border around every tile
    ctx.strokeStyle = 'rgba(200, 169, 126, 0.62)';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, targetWidth - 4, targetHeight - 4);
  } catch {
    ctx.fillStyle = photo.palette[0] || '#1c1613';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
    ctx.strokeStyle = '#c8a97e';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, targetWidth - 4, targetHeight - 4);
  }

  return canvas;
}

/**
 * Silent background pre-cache of all real uploaded photographs for instant offline & swipe navigation.
 */
export async function warmCacheSilently(photos: PortfolioPhoto[]): Promise<void> {
  if (typeof window === 'undefined') return;
  const uniqueUrls = Array.from(new Set(photos.map((p) => p.customDataUrl || p.imageUrl)));

  let cacheHandle: Cache | null = null;
  if ('caches' in window) {
    try {
      cacheHandle = await window.caches.open(OFFLINE_CACHE_NAME);
    } catch {
      cacheHandle = null;
    }
  }

  for (const url of uniqueUrls) {
    loadCachedImageElement(url).catch(() => {});
    if (cacheHandle && url.startsWith('/')) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          await cacheHandle.put(url, res.clone());
        }
      } catch {
        // Ignore offline/quota errors
      }
    }
  }
}

export type StudioGradePreset = 'golden-hour' | 'leica-chiaroscuro' | 'editorial-vibrant';

/**
 * Applies a Low-Key Cinema Darkroom LUT (controlled highlight roll-off, rich shadow depth,
 * Saffron Gold & Burnt Crimson split-toning, and Charcoal optical vignette) on an HTML5 Canvas.
 */
export async function applyStudioDarkroomRetouchDataUrl(
  photo: PortfolioPhoto,
  preset: StudioGradePreset = 'golden-hour'
): Promise<string> {
  const img = await loadCachedImageElement(photo.imageUrl);
  const width = img.naturalWidth || img.width || 1280;
  const height = img.naturalHeight || img.height || 960;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return photo.imageUrl;

  ctx.drawImage(img, 0, 0, width, height);
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Low-key gamma >= 1.12 so highlights never blow out
  const gamma = preset === 'leica-chiaroscuro' ? 1.22 : preset === 'golden-hour' ? 1.14 : 1.16;
  const contrastStrength = preset === 'leica-chiaroscuro' ? 0.22 : 0.16;
  const saturationBoost = preset === 'editorial-vibrant' ? 1.18 : preset === 'leica-chiaroscuro' ? 1.06 : 1.14;

  const lut = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    const x = i / 255;
    let curved = Math.pow(x, gamma);
    curved = curved - (contrastStrength * Math.sin(2 * Math.PI * curved)) / (2 * Math.PI);
    // Soft highlight roll-off at 0.88 so whites stay warm champagne
    if (curved > 0.72) {
      curved = 0.72 + (curved - 0.72) * 0.55;
    }
    lut[i] = Math.max(8, Math.min(218, Math.round(curved * 255)));
  }

  for (let i = 0; i < data.length; i += 4) {
    let r = lut[data[i]];
    let g = lut[data[i + 1]];
    let b = lut[data[i + 2]];

    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    r = luma + (r - luma) * saturationBoost;
    g = luma + (g - luma) * saturationBoost;
    b = luma + (b - luma) * saturationBoost;

    const midWeight = Math.sin((luma / 255) * Math.PI);
    if (preset === 'golden-hour') {
      r += 10 * midWeight;
      g += 4 * midWeight;
      b -= 6 * midWeight;
    } else if (preset === 'leica-chiaroscuro') {
      r += 6 * midWeight;
      g += 2 * midWeight;
      b -= 4 * midWeight;
    } else {
      r += 8 * midWeight;
      g += 3 * midWeight;
      b -= 5 * midWeight;
    }

    data[i] = Math.max(0, Math.min(220, Math.round(r)));
    data[i + 1] = Math.max(0, Math.min(214, Math.round(g)));
    data[i + 2] = Math.max(0, Math.min(204, Math.round(b)));
  }

  ctx.putImageData(imgData, 0, 0);

  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.hypot(cx, cy);
  const vig = ctx.createRadialGradient(cx, cy, maxR * 0.42, cx, cy, maxR);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, preset === 'leica-chiaroscuro' ? 'rgba(18,14,11,0.48)' : 'rgba(20,16,13,0.38)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, width, height);

  return canvas.toDataURL('image/jpeg', 0.92);
}
