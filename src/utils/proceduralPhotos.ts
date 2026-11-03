import { PortfolioPhoto } from './portfolioLogic';

const OFFLINE_CACHE_NAME = 'srinath-portfolio-offline-v5';
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
 * Creates an elegant editorial SVG placeholder in The Vintage Romance luxury palette
 * (#3E2020 Dark Espresso, #EAE0D5 Warm Beige, #F5F0E6 Soft Cream, #C85A43 Muted Rust)
 * when photographs are awaiting upload.
 */
export function createLuxuryPlaceholderSvg(photo: PortfolioPhoto, width = 720, height = 540): string {
  const w = Math.max(240, width);
  const h = Math.max(180, height);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <linearGradient id="pbg-${photo.index}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#3E2020"/>
        <stop offset="100%" stop-color="#241312"/>
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#pbg-${photo.index})"/>
    <rect x="12" y="12" width="${w - 24}" height="${h - 24}" fill="none" stroke="#EAE0D5" stroke-opacity="0.35" stroke-width="1.5" rx="10"/>
    <circle cx="${w / 2}" cy="${h / 2 - 20}" r="26" fill="#C85A43" fill-opacity="0.22" stroke="#C85A43" stroke-width="1.5"/>
    <text x="${w / 2}" y="${h / 2 - 13}" font-family="Georgia, serif" font-size="15" fill="#F5F0E6" text-anchor="middle" font-weight="bold">${photo.aspectRatio}</text>
    <text x="${w / 2}" y="${h / 2 + 24}" font-family="Georgia, serif" font-size="15" fill="#F5F0E6" text-anchor="middle" font-weight="500">${photo.title}</text>
    <text x="${w / 2}" y="${h / 2 + 45}" font-family="monospace" font-size="10" fill="#EAE0D5" fill-opacity="0.75" text-anchor="middle" letter-spacing="1.5">FRAME #${photo.index} · AWAITING UPLOAD</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Returns the photograph URL or an elegant luxury placeholder when awaiting upload.
 */
export function renderPhotoDataUrl(photo: PortfolioPhoto, width = 720, height = 540): string {
  if (photo.customDataUrl) {
    return photo.customDataUrl;
  }
  // If custom photograph is not yet uploaded, return the elegant luxury SVG frame
  return createLuxuryPlaceholderSvg(photo, width, height);
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
 * Renders an editorial canvas of Srinath's photograph matching its exact
 * native aspect ratio (1:1, 3:4, 4:3, 9:16, 16:9) for the 3D Photo Globe tiles.
 */
export async function renderEditedGlobeTileCanvas(
  photo: PortfolioPhoto,
  customWidth?: number,
  customHeight?: number
): Promise<HTMLCanvasElement> {
  let targetWidth = customWidth || 512;
  let targetHeight = customHeight || 512;

  if (!customWidth || !customHeight) {
    switch (photo.aspectRatio) {
      case '1:1':
        targetWidth = 512;
        targetHeight = 512;
        break;
      case '3:4':
        targetWidth = 480;
        targetHeight = 640;
        break;
      case '4:3':
        targetWidth = 640;
        targetHeight = 480;
        break;
      case '9:16':
        targetWidth = 360;
        targetHeight = 640;
        break;
      case '16:9':
        targetWidth = 640;
        targetHeight = 360;
        break;
      default:
        targetWidth = 512;
        targetHeight = 512;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  try {
    const targetSource = photo.customDataUrl || createLuxuryPlaceholderSvg(photo, targetWidth, targetHeight);
    const img = await loadCachedImageElement(targetSource);
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
    const fy = Math.max(0, Math.min(1, photo.focalY ?? 0.5));

    const maxSx = Math.max(0, srcW - sWidth);
    const maxSy = Math.max(0, srcH - sHeight);
    const sx = Math.min(maxSx, Math.max(0, maxSx * fx));
    const sy = Math.min(maxSy, Math.max(0, maxSy * fy));

    // Deep espresso base
    ctx.fillStyle = '#3E2020';
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    ctx.save();
    if (photo.filterStyle) {
      ctx.filter = photo.filterStyle;
    }
    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);
    ctx.restore();

    // Warm beige hairline border around each globe tile
    ctx.strokeStyle = '#EAE0D5';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(1.5, 1.5, targetWidth - 3, targetHeight - 3);
  } catch {
    ctx.fillStyle = '#3E2020';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
    ctx.strokeStyle = '#EAE0D5';
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, targetWidth - 4, targetHeight - 4);
  }

  return canvas;
}

/**
 * Silent background pre-cache of all uploaded photographs for instant offline & swipe navigation.
 */
export async function warmCacheSilently(photos: PortfolioPhoto[]): Promise<void> {
  if (typeof window === 'undefined') return;
  const uniqueUrls = Array.from(new Set(photos.map((p) => p.customDataUrl || p.imageUrl)));

  for (const url of uniqueUrls.slice(0, 30)) {
    try {
      await loadCachedImageElement(url);
    } catch {
      // Continue silently
    }
  }
}
