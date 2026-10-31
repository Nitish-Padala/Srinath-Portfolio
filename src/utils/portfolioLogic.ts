export type EmotionMoodId = 'all' | 'euphoria' | 'warmth' | 'serenity' | 'electric';

export type ActiveGalleryView = 'recent-tabs' | 'orb-globe';

export type PhotoAspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

export interface AspectRatioCategory {
  id: PhotoAspectRatio;
  folder: string;
  label: string;
  subLabel: string;
  description: string;
  cssAspect: string;
  widthRatio: number;
  heightRatio: number;
  tileW: number;
  tileH: number;
}

export const ASPECT_RATIO_CATEGORIES: AspectRatioCategory[] = [
  {
    id: '1:1',
    folder: 'ratio-1-1',
    label: '1:1 Square Format',
    subLabel: 'Fine-Art & Symmetrical Studies',
    description: 'Central compositions, floral details, and sacred geometry in square balance.',
    cssAspect: 'aspect-square',
    widthRatio: 1,
    heightRatio: 1,
    tileW: 1.98,
    tileH: 1.98,
  },
  {
    id: '3:4',
    folder: 'ratio-3-4',
    label: '3:4 Vertical Portrait',
    subLabel: 'Bridal & Candid Portraiture',
    description: 'Classic medium format portraits capturing raw human expression and kinship.',
    cssAspect: 'aspect-[3/4]',
    widthRatio: 3,
    heightRatio: 4,
    tileW: 1.72,
    tileH: 2.29,
  },
  {
    id: '4:3',
    folder: 'ratio-4-3',
    label: '4:3 Classic Landscape',
    subLabel: 'Heritage & Environmental Frames',
    description: 'Architectural arches, courtyards, and riverside vistas in 4:3 classical framing.',
    cssAspect: 'aspect-[4/3]',
    widthRatio: 4,
    heightRatio: 3,
    tileW: 2.29,
    tileH: 1.72,
  },
  {
    id: '9:16',
    folder: 'ratio-9-16',
    label: '9:16 Cinematic Story',
    subLabel: 'Tall Mobile & Vertical Editorial',
    description: 'Full-height mobile perspectives, grand temple colonnades, and vertical motion.',
    cssAspect: 'aspect-[9/16]',
    widthRatio: 9,
    heightRatio: 16,
    tileW: 1.49,
    tileH: 2.65,
  },
  {
    id: '16:9',
    folder: 'ratio-16-9',
    label: '16:9 Horizon Panorama',
    subLabel: 'Widescreen Dusk & Panoramic Rituals',
    description: 'Expansive horizons, molten sunsets, twilight waters, and grand procession views.',
    cssAspect: 'aspect-[16/9]',
    widthRatio: 16,
    heightRatio: 9,
    tileW: 2.65,
    tileH: 1.49,
  },
];

export interface EmotionCategory {
  id: Exclude<EmotionMoodId, 'all'>;
  moodTitle: string;
  shortTabLabel: string;
  photographySpec: string;
  accentHex: string;
  secondaryHex: string;
}

export interface PortfolioPhoto {
  id: string;
  index: number;
  title: string;
  caption: string;
  exifSpec: string;
  moodId: Exclude<EmotionMoodId, 'all'>;
  photographySpec: string;
  palette: [string, string, string];
  aspect: 'portrait' | 'landscape' | 'square';
  aspectRatio: PhotoAspectRatio;
  ratioFolder: string;
  imageUrl: string;
  filterStyle: string;
  objectPosition: string;
  focalX?: number;
  focalY: number;
  cropZoom?: number;
  customDataUrl?: string;
  widthRatio: number;
  heightRatio: number;
  tileW: number;
  tileH: number;
}

export interface OrbNodePosition {
  photoId: string;
  index: number;
  x: number;
  y: number;
  z: number;
  nx: number;
  ny: number;
  nz: number;
  phi: number;
  theta: number;
  tileW: number;
  tileH: number;
}

export interface StackInteractionState {
  activeIndex: number;
  isFullscreen: boolean;
  returnView: ActiveGalleryView;
}

export interface BookingContactConfig {
  photographerName: string;
  phone: string;
  whatsapp: string;
  email: string;
  studioCity: string;
}

export const DEFAULT_CONTACT_CONFIG: BookingContactConfig = {
  photographerName: 'Srinath',
  phone: '+91 98480 52310',
  whatsapp: '919848052310',
  email: 'srinath.frames@studio.in',
  studioCity: 'Chennai, Hyderabad & Pan-India Commissions',
};

export const EMOTION_CATEGORIES: EmotionCategory[] = [
  {
    id: 'euphoria',
    moodTitle: 'Wedding Festivities & Sacred Union',
    shortTabLabel: 'Wedding Festivities',
    photographySpec: 'Kalyanam & Sacred Rituals',
    accentHex: '#d48c29',
    secondaryHex: '#8b1e1e',
  },
  {
    id: 'warmth',
    moodTitle: 'Portraits & Intimate Kinship',
    shortTabLabel: 'Portraits & Intimate',
    photographySpec: 'Natural Light Candids & Bonds',
    accentHex: '#f59e0b',
    secondaryHex: '#d48c29',
  },
  {
    id: 'serenity',
    moodTitle: 'Solitary & Lifestyle Narratives',
    shortTabLabel: 'Solitary & Lifestyle',
    photographySpec: 'Personal Portraiture & Quiet Stories',
    accentHex: '#c8a97e',
    secondaryHex: '#8b1e1e',
  },
  {
    id: 'electric',
    moodTitle: 'Twilight & Horizon Alchemy',
    shortTabLabel: 'Twilight & Horizon',
    photographySpec: 'Chiaroscuro Dusk & Processions',
    accentHex: '#8b1e1e',
    secondaryHex: '#f59e0b',
  },
];

const CINEMA_GRADE_WARM = 'brightness(0.92) contrast(1.08) saturate(1.06)';
const CINEMA_GRADE_DEEP = 'brightness(0.88) contrast(1.12) saturate(1.05)';
const CINEMA_GRADE_SILK = 'brightness(0.94) contrast(1.07) saturate(1.08)';

const TITLES_BY_RATIO: Record<PhotoAspectRatio, string[]> = {
  '1:1': [
    'Sacred Garlands & Vows',
    'Golden Devi Chiaroscuro',
    'Sanctum Lamp Illumination',
    'Moonlight Between Pillars',
    'Colonnade Symmetry',
    'Floral Mandala Tenderness',
    'Ritual Sindoor Moment',
    'Temple Stone Archway',
    'Velvet Night Moon',
    'Whispering Pines Study',
    'Frangipani & Gold Bangles',
    'Artisan Clay Vessel Study',
    'Sacred Fire Reflection',
    'Kalyanam Floral Garland',
    'Ancient Pillar Carving',
    'Golden Hour Profile Reverie',
    'Heritage Mirror Glance',
    'Temple Bell & Incense',
    'Intimate Bridal Gaze',
    'Solitary Courtyard Shadows',
    'Kanjeevaram Saree Motif',
    'Sacred Aarti Embers',
    'Monsoon Lotus Puddle',
    'Carved Wood Sanctuary',
    'Gilded Archway Light',
    'Saffron Silk Silhouette',
    'Dusk Lamp in Courtyard',
    'Quiet Prayer Hands',
    'Evening Temple Echo',
    'Golden Sanctum Blessing',
  ],
  '3:4': [
    'Royal Bridal Adornment',
    'Kanjeevaram Gold Silk',
    'Sacred Archway Blessing',
    'Temple Corridor Lullaby',
    'Amber Chiaroscuro Gaze',
    'Hill Town Brotherhood',
    'Maternal Kinship in Hills',
    'Little Explorer on Tracks',
    'Whiskers in Warm Dusk',
    'Classical Saree Grace',
    'Misty Hill Station Wait',
    'Nightfall at Corner Café',
    'Artisan Tabletop Craft',
    'Midnight Creative Sanctuary',
    'Sculpted in Warm Shadow',
    'Heritage Window Candid',
    'Temple Corridor Reverie',
    'Traditional Kalyanam Glance',
    'Quiet Forest Companion',
    'Mountain Parapet Pause',
    'Lakeside Red Reflection',
    'Tea Garden Daydream',
    'Cathedral of Tall Pines',
    'Cloud-Kissed Hill Gaze',
    'Emerald Hillside Solitude',
    'Ghat Steps at Sunrise',
    'Harbor Silhouette Dusk',
    'Golden Bridal Veil',
    'Intimate Laughter in Arch',
    'Royal Mandap Portrait',
  ],
  '4:3': [
    'Victoria Dome & Maidan',
    'Hooghly Bridge at Dawn',
    'Colonnade Courtyard Embrace',
    'Ghat Riverfront Pillars',
    'Midnight Street Light Trails',
    'Sacred Mandap Panorama',
    'Tea Valley Terraces',
    'Cathedral of Ancient Pines',
    'Harbor River Reflection',
    'Heritage Colonnade Walkway',
    'Morning Mist Over Maidan',
    'Temple Courtyard Procession',
    'Golden River Crossing',
    'Vintage Tramway at Dusk',
    'Old Town Rooftop Horizon',
    'Sacred Gathering Under Arch',
    'Riverside Ghat at Nightfall',
    'Courtyard Shadows & Pillars',
    'Himalayan Valley Overlook',
    'Stone Colonnade Corridor',
    'Sunbeams Through Heritage Arch',
    'Monsoon River Ferry',
    'Historic Palace Façade',
    'Evening Lamps Along River',
    'Traditional Wedding Feast',
    'Forest Stream in Autumn',
    'Temple Tank Reflections',
    'Dusk Over Heritage City',
    'Twilight Ghat Lamps',
    'Sacred Mandap Grand View',
  ],
  '9:16': [
    'Bridal Procession Grandeur',
    'Sacred Aarti Illumination',
    'Temple Pillar Grace',
    'Misty Valley Silhouette',
    'Canopy Sunset Crossing',
    'Celestial Cloud Rays',
    'Prayer Flags in Clouds',
    'Emerald Mountain Mist',
    'Waterfall Reverie in Hills',
    'Monastic Mountain Horizon',
    'Tall Colonnade Walk',
    'Evening Lamp in High Arch',
    'Bridal Silk Cascade',
    'Royal Temple Steps',
    'Vertical Forest Canopy',
    'Sunlight Through Tall Trees',
    'Sacred Dhoti & Silk Stole',
    'Golden Hour Tall Silhouette',
    'Night Sky & Crescent Pillar',
    'Towering Heritage Arch',
    'Mountain Ridge in Mist',
    'Temple Tower at Sunset',
    'Bridal Adornment in Mirror',
    'Monsoon Cloud Cascade',
    'Sacred Fire Offering Flame',
    'High Pass Prayer Flags',
    'Corridor of Heritage Pillars',
    'Twilight Valley Glow',
    'Ghat High Arch Sanctuary',
    'Golden Temple Gopuram',
  ],
  '16:9': [
    'Golden Coastline Horizon',
    'Molten Horizon Sunset',
    'Ember Horizon Dusk',
    'Arms Open to the Sky',
    'Floral Mandap Tenderness',
    'Twilight Riverfront Silhouette',
    'Heritage Window Glance',
    'Sacred Aarti Flame',
    'Lakefront Twilight Glow',
    'Skyline Nocturne Glow',
    'Hooghly River Dusk Vista',
    'Ocean Rocks at Sunset',
    'Monsoon Horizon Clouds',
    'Misty Valley Night Lights',
    'Procession Along Riverbank',
    'Grand Mandap Wide Scene',
    'Golden Hour Sea Horizon',
    'Evening Campfire Embers',
    'Dusk Across Tea Hills',
    'Heritage Palace Panorama',
    'Sun Sinking Behind Temple',
    'River Ferry at Twilight',
    'Candlelit Ghat Panorama',
    'Himalayan Ridge Sunset',
    'Quiet Lake at Dusk',
    'Fiery Sky Over Maidan',
    'Long Exposure City Highway',
    'Sacred Kalyanam Stage Panorama',
    'Ocean Horizon Gold Wash',
    'Royal Mandap Grand Embrace',
  ],
};

const PALETTES: Array<[string, string, string]> = [
  ['#14110f', '#d48c29', '#ebe0cc'],
  ['#1c1613', '#8b1e1e', '#f5ebd9'],
  ['#221a15', '#f59e0b', '#ebe0cc'],
  ['#181310', '#c8a97e', '#f5ebd9'],
];

/**
 * Generates all 150 authentic photographs across the 5 special aspect ratio categories:
 * - 1:1 (30 photos)
 * - 3:4 (30 photos)
 * - 4:3 (30 photos)
 * - 9:16 (30 photos)
 * - 16:9 (30 photos)
 * Total: exactly 150 photos.
 */
export function generateInitial150Photos(): PortfolioPhoto[] {
  const photos: PortfolioPhoto[] = [];
  const ratios: PhotoAspectRatio[] = ['1:1', '3:4', '4:3', '9:16', '16:9'];
  const moods: Array<Exclude<EmotionMoodId, 'all'>> = ['euphoria', 'warmth', 'serenity', 'electric'];

  let globalIndex = 0;

  for (const ratioId of ratios) {
    const cat = ASPECT_RATIO_CATEGORIES.find((c) => c.id === ratioId)!;
    const titles = TITLES_BY_RATIO[ratioId];

    for (let i = 0; i < 30; i++) {
      globalIndex++;
      const moodId = moods[(globalIndex - 1) % moods.length];
      const emotion = EMOTION_CATEGORIES.find((e) => e.id === moodId)!;
      const palette = PALETTES[(globalIndex - 1) % PALETTES.length];
      const title = titles[i] || `${cat.label} #${i + 1}`;
      const photoNum = String(i + 1).padStart(2, '0');
      const imageUrl = `/photos/${cat.folder}/photo-${photoNum}.jpg`;

      const aspectType: 'portrait' | 'landscape' | 'square' =
        cat.widthRatio === cat.heightRatio
          ? 'square'
          : cat.widthRatio > cat.heightRatio
          ? 'landscape'
          : 'portrait';

      const filterStyle =
        i % 3 === 0 ? CINEMA_GRADE_DEEP : i % 3 === 1 ? CINEMA_GRADE_WARM : CINEMA_GRADE_SILK;

      photos.push({
        id: `srinath-photo-${String(globalIndex).padStart(3, '0')}`,
        index: globalIndex,
        title,
        caption: `${cat.label} · ${emotion.moodTitle}`,
        exifSpec: '',
        moodId,
        photographySpec: emotion.photographySpec,
        palette,
        aspect: aspectType,
        aspectRatio: ratioId,
        ratioFolder: cat.folder,
        imageUrl,
        filterStyle,
        objectPosition: 'center center',
        focalX: 0.5,
        focalY: 0.5,
        cropZoom: 1.0,
        widthRatio: cat.widthRatio,
        heightRatio: cat.heightRatio,
        tileW: cat.tileW,
        tileH: cat.tileH,
      });
    }
  }

  return photos;
}

// Retain alias for backward compatibility
export const generateInitial108Photos = generateInitial150Photos;
export const generateInitial40Photos = generateInitial150Photos;
export const generateInitial50Photos = generateInitial150Photos;

export const SRINATH_QUICKSHARE_IMAGES = Array.from(
  { length: 30 },
  (_, i) => `/photos/ratio-1-1/photo-${String(i + 1).padStart(2, '0')}.jpg`
);

export const SRINATH_UPLOADED_IMAGES = SRINATH_QUICKSHARE_IMAGES;

/**
 * Reorders the 150 photos so that aspect ratios are interleaved on the 3D Fibonacci sphere
 * (e.g. 1:1 -> 3:4 -> 4:3 -> 9:16 -> 16:9), creating a seamless organic mosaic with NO repeated neighbors.
 */
export function getInterleavedGlobePhotos(allPhotos: PortfolioPhoto[]): PortfolioPhoto[] {
  const byRatio: Record<PhotoAspectRatio, PortfolioPhoto[]> = {
    '1:1': allPhotos.filter((p) => p.aspectRatio === '1:1'),
    '3:4': allPhotos.filter((p) => p.aspectRatio === '3:4'),
    '4:3': allPhotos.filter((p) => p.aspectRatio === '4:3'),
    '9:16': allPhotos.filter((p) => p.aspectRatio === '9:16'),
    '16:9': allPhotos.filter((p) => p.aspectRatio === '16:9'),
  };

  const ratios: PhotoAspectRatio[] = ['1:1', '3:4', '4:3', '9:16', '16:9'];
  const interleaved: PortfolioPhoto[] = [];

  for (let i = 0; i < 30; i++) {
    for (const r of ratios) {
      if (byRatio[r][i]) {
        interleaved.push(byRatio[r][i]);
      }
    }
  }

  return interleaved.length === allPhotos.length ? interleaved : allPhotos;
}

/**
 * Computes evenly distributed 3D spherical coordinates (Fibonacci Sphere)
 * for all 150 photos with custom aspect-ratio tile dimensions and tight gap-free packing.
 */
export function computeOrbPositions(photos: PortfolioPhoto[], radius = 6.4): OrbNodePosition[] {
  const n = photos.length;
  if (n === 0) return [];
  const goldenRatio = (1 + Math.sqrt(5)) / 2;

  return photos.map((photo, i) => {
    const yNorm = n === 1 ? 0 : 1 - (i / (n - 1)) * 2;
    const clampedY = Math.max(-0.96, Math.min(0.96, yNorm * 0.94));
    const ringRadius = Math.sqrt(Math.max(0, 1 - clampedY * clampedY));
    const theta = (2 * Math.PI * i) / goldenRatio;

    const nx = Math.cos(theta) * ringRadius;
    const ny = clampedY;
    const nz = Math.sin(theta) * ringRadius;

    return {
      photoId: photo.id,
      index: i,
      x: nx * radius,
      y: ny * radius,
      z: nz * radius,
      nx,
      ny,
      nz,
      phi: Math.acos(clampedY),
      theta,
      tileW: photo.tileW || 1.9,
      tileH: photo.tileH || 1.9,
    };
  });
}

/**
 * Returns photos filtered by their aspect ratio category (30 photos each).
 */
export function getPhotosByRatio(photos: PortfolioPhoto[], ratio: PhotoAspectRatio): PortfolioPhoto[] {
  return photos.filter((p) => p.aspectRatio === ratio);
}

/**
 * Sliding window of items for pagination and carousel cards.
 */
export function getSlidingWindow(photos: PortfolioPhoto[], startIndex: number, count = 3): PortfolioPhoto[] {
  const total = photos.length;
  if (total === 0) return [];
  const safeCount = Math.min(count, total);
  const result: PortfolioPhoto[] = [];
  for (let offset = 0; offset < safeCount; offset++) {
    const idx = (((startIndex + offset) % total) + total) % total;
    result.push(photos[idx]);
  }
  return result;
}

// Backward compatibility helper
export const getPortraitTrioWindow = (photos: PortfolioPhoto[], startIndex: number) =>
  getSlidingWindow(photos, startIndex, 3);

export interface UniqueGallerySections {
  heroPhoto: PortfolioPhoto;
  solitaryPhotos: PortfolioPhoto[];
  kinshipPhotos: PortfolioPhoto[];
  twilightShowcasePhotos: PortfolioPhoto[];
  twilightStackPhotos: PortfolioPhoto[];
  portraitArchivePhotos: PortfolioPhoto[];
  landscapeArchivePhotos: PortfolioPhoto[];
}

/**
 * Backward compatibility helper for legacy gallery section tests.
 */
export function getUniqueGallerySections(allPhotos: PortfolioPhoto[]): UniqueGallerySections {
  const sq = allPhotos.filter((p) => p.aspectRatio === '1:1');
  const p34 = allPhotos.filter((p) => p.aspectRatio === '3:4');
  const l43 = allPhotos.filter((p) => p.aspectRatio === '4:3');
  const p916 = allPhotos.filter((p) => p.aspectRatio === '9:16');
  const l169 = allPhotos.filter((p) => p.aspectRatio === '16:9');

  return {
    heroPhoto: l169[0] || allPhotos[0],
    solitaryPhotos: sq.slice(0, 4),
    kinshipPhotos: p34.slice(0, 2),
    twilightShowcasePhotos: l169.slice(1, 6),
    twilightStackPhotos: l43.slice(0, 5),
    portraitArchivePhotos: [...p34.slice(2), ...p916].slice(0, 30),
    landscapeArchivePhotos: l43.slice(5, 13),
  };
}

export function filterPhotosByMood(photos: PortfolioPhoto[], mood: EmotionMoodId): PortfolioPhoto[] {
  if (mood === 'all') return photos;
  return photos.filter((photo) => photo.moodId === mood);
}

export function handleStackZoneInteraction(
  state: StackInteractionState,
  zone: 'left' | 'middle' | 'right' | 'backdrop',
  totalItems: number
): StackInteractionState {
  if (totalItems <= 0) {
    return { ...state, activeIndex: 0, isFullscreen: false };
  }

  if (state.isFullscreen) {
    return {
      ...state,
      isFullscreen: false,
    };
  }

  if (zone === 'left') {
    return {
      ...state,
      activeIndex: (state.activeIndex + 1) % totalItems,
      isFullscreen: false,
    };
  }

  if (zone === 'right') {
    return {
      ...state,
      activeIndex: (state.activeIndex - 1 + totalItems) % totalItems,
      isFullscreen: false,
    };
  }

  if (zone === 'middle') {
    return {
      ...state,
      isFullscreen: true,
    };
  }

  return state;
}

export function buildTelUrl(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, '');
  return `tel:${cleaned || '+919848052310'}`;
}

export function buildWhatsAppUrl(whatsapp: string, moodTitle?: string, eventNote?: string): string {
  const digits = whatsapp.replace(/\D/g, '') || '919848052310';
  const message = eventNote
    ? `Hi Srinath! I explored your Photography Portfolio (${moodTitle || 'Selected Works'}). ${eventNote}`
    : `Hi Srinath! I loved exploring your Photography Portfolio and would love to inquire & book a shoot.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function buildMailtoUrl(email: string, moodTitle?: string, clientName?: string, eventDetails?: string): string {
  const targetEmail = email.trim() || 'srinath.frames@studio.in';
  const subject = `Photography Booking Inquiry for Srinath — ${moodTitle || 'Portfolio Work'}`;
  const body = [
    `Hi Srinath,`,
    ``,
    `I explored your Photography Portfolio and connected with your work.`,
    clientName ? `Name: ${clientName}` : null,
    eventDetails ? `Shoot Details: ${eventDetails}` : `I would love to check your availability and booking packages.`,
    ``,
    `Best regards`,
  ]
    .filter((line) => line !== null)
    .join('\n');

  return `mailto:${targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export interface BookingFormInput {
  clientName: string;
  eventDate: string;
  eventType: string;
  notes: string;
}

export function validateBookingInquiry(input: BookingFormInput): { valid: boolean; error?: string } {
  if (!input.clientName || input.clientName.trim().length < 2) {
    return { valid: false, error: 'Please enter your name (at least 2 characters).' };
  }
  if (!input.eventDate || input.eventDate.trim().length === 0) {
    return { valid: false, error: 'Please select a preferred shoot or event date.' };
  }
  if (!input.eventType || input.eventType.trim().length === 0) {
    return { valid: false, error: 'Please select a shoot specification (e.g. Wedding Festivities, Portraits).' };
  }
  return { valid: true };
}

export interface FullscreenSwipeEvaluation {
  shouldDismiss: boolean;
  direction: 'up' | 'down' | 'none';
  reason: 'swipe-distance' | 'swipe-velocity' | 'tap' | 'snap-back';
}

export interface FullscreenSwipeVisual {
  translateY: number;
  scale: number;
  backdropOpacity: number;
  thresholdReached: boolean;
}

export const SWIPE_DISMISS_DISTANCE_PX = 85;
export const SWIPE_DISMISS_MIN_FLICK_PX = 35;
export const SWIPE_DISMISS_VELOCITY_PX_PER_MS = 0.45;

export function evaluateFullscreenSwipeGesture(
  deltaY: number,
  deltaX = 0,
  elapsedMs = 250
): FullscreenSwipeEvaluation {
  const absY = Math.abs(deltaY);
  const absX = Math.abs(deltaX);
  const totalDist = Math.hypot(deltaX, deltaY);

  if (totalDist < 12) {
    return {
      shouldDismiss: true,
      direction: 'none',
      reason: 'tap',
    };
  }

  const direction: 'up' | 'down' = deltaY < 0 ? 'up' : 'down';
  const isPrimarilyVertical = absY >= absX * 0.75;

  if (!isPrimarilyVertical) {
    return {
      shouldDismiss: false,
      direction: 'none',
      reason: 'snap-back',
    };
  }

  if (absY >= SWIPE_DISMISS_DISTANCE_PX) {
    return {
      shouldDismiss: true,
      direction,
      reason: 'swipe-distance',
    };
  }

  const safeElapsed = Math.max(elapsedMs, 1);
  const velocityY = absY / safeElapsed;
  if (absY >= SWIPE_DISMISS_MIN_FLICK_PX && velocityY >= SWIPE_DISMISS_VELOCITY_PX_PER_MS) {
    return {
      shouldDismiss: true,
      direction,
      reason: 'swipe-velocity',
    };
  }

  return {
    shouldDismiss: false,
    direction,
    reason: 'snap-back',
  };
}

export function computeSwipeVisualTransform(deltaY: number): FullscreenSwipeVisual {
  const absY = Math.abs(deltaY);
  const clampedY = Math.max(-360, Math.min(360, deltaY));
  const scale = Number(Math.max(0.76, 1 - absY / 850).toFixed(4));
  const backdropOpacity = Number(Math.max(0.25, 0.95 - absY / 400).toFixed(3));
  const thresholdReached = absY >= SWIPE_DISMISS_DISTANCE_PX;

  return {
    translateY: clampedY,
    scale,
    backdropOpacity,
    thresholdReached,
  };
}

export type HapticFeedbackType = 'threshold-tick' | 'swipe-dismiss' | 'tap-dismiss' | 'snap-back';

export const HAPTIC_PATTERNS: Record<HapticFeedbackType, number | number[]> = {
  'threshold-tick': 10,
  'swipe-dismiss': [14, 24, 10],
  'tap-dismiss': 8,
  'snap-back': 6,
};

export function shouldTriggerThresholdHaptic(previousDeltaY: number, nextDeltaY: number): boolean {
  const wasReached = Math.abs(previousDeltaY) >= SWIPE_DISMISS_DISTANCE_PX;
  const isNowReached = Math.abs(nextDeltaY) >= SWIPE_DISMISS_DISTANCE_PX;
  return !wasReached && isNowReached;
}

export function triggerHapticFeedback(
  type: HapticFeedbackType,
  vibrateImpl?: (pattern: number | number[]) => boolean
): boolean {
  const pattern = HAPTIC_PATTERNS[type];
  try {
    if (vibrateImpl) {
      return Boolean(vibrateImpl(pattern));
    }
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      return Boolean(navigator.vibrate(pattern));
    }
  } catch {
    // Ignore environments where navigator.vibrate is restricted
  }
  return false;
}
