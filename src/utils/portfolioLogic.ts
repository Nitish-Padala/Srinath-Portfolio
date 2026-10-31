export type EmotionMoodId = 'all' | 'euphoria' | 'warmth' | 'serenity' | 'electric';

export type ActiveGalleryView = 'recent-tabs' | 'orb-globe';

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
  imageUrl: string;
  filterStyle: string;
  objectPosition: string;
  focalX?: number;
  focalY: number;
  cropZoom?: number;
  customDataUrl?: string;
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

/**
 * Option 5 ("The Storyteller's Cinematic Grid") Color Palette:
 * - Burnt Crimson: #8b1e1e
 * - Saffron Gold: #d48c29
 * - Marigold: #f59e0b
 * - Charcoal: #14110f
 * - Champagne: #ebe0cc
 */
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

export const SRINATH_QUICKSHARE_IMAGES = Array.from(
  { length: 40 },
  (_, i) => `/assets/quickshare/pro-${String(i + 1).padStart(2, '0')}.jpg`
);

export const SRINATH_CAMERA_ARCHIVE_IMAGES = Array.from(
  { length: 23 },
  (_, i) => `/assets/cinema/cam-${String(i + 1).padStart(2, '0')}.jpg`
);

// Retain alias for tests and backward compatibility
export const SRINATH_UPLOADED_IMAGES = SRINATH_QUICKSHARE_IMAGES;

interface CuratedPhotoSpec {
  title: string;
  caption: string;
  exifSpec: string;
  imageUrl: string;
  aspect: 'portrait' | 'landscape' | 'square';
  filterStyle: string;
  objectPosition: string;
  focalX?: number;
  focalY: number;
  cropZoom?: number;
}

/**
 * Low-key cinema filter style: keeps highlights controlled, rich contrast,
 * and warm saffron/champagne harmony so zero images look over-bright.
 */
const CINEMA_GRADE_WARM = 'brightness(0.92) contrast(1.08) saturate(1.06)';
const CINEMA_GRADE_DEEP = 'brightness(0.88) contrast(1.12) saturate(1.05)';
const CINEMA_GRADE_SILK = 'brightness(0.94) contrast(1.07) saturate(1.08)';

const BASE_PHOTOS_BY_MOOD: Record<Exclude<EmotionMoodId, 'all'>, CuratedPhotoSpec[]> = {
  euphoria: [
    {
      title: 'Sacred Garlands & Vows',
      caption: 'Pre-wedding & Garland Exchange',
      exifSpec: '',
      imageUrl: '/assets/quickshare/pro-39.jpg',
      aspect: 'portrait',
      filterStyle: CINEMA_GRADE_DEEP,
      objectPosition: 'center 35%',
      focalY: 0.35,
    },
    {
      title: 'Golden Devi Chiaroscuro',
      caption: 'Temple Sculptural Light',
      exifSpec: '',
      imageUrl: '/assets/quickshare/pro-12.jpg',
      aspect: 'portrait',
      filterStyle: CINEMA_GRADE_DEEP,
      objectPosition: 'center 32%',
      focalY: 0.32,
    },
    {
      title: 'Sacred Gaze of Devi',
      caption: 'Sanctum Lamp Illumination',
      exifSpec: '',
      imageUrl: '/assets/quickshare/pro-15.jpg',
      aspect: 'portrait',
      filterStyle: CINEMA_GRADE_DEEP,
      objectPosition: 'center 38%',
      focalY: 0.38,
    },
    {
      title: 'Victoria Dome & Maidan',
      caption: 'Heritage Monumental Frame',
      exifSpec: '',
      imageUrl: '/assets/quickshare/pro-01.jpg',
      aspect: 'landscape',
      filterStyle: CINEMA_GRADE_DEEP,
      objectPosition: 'center 48%',
      focalY: 0.48,
    },
    {
      title: 'Sunbeams Over the Dome',
      caption: 'Crepuscular Light & Architecture',
      exifSpec: '',
      imageUrl: '/assets/quickshare/pro-22.jpg',
      aspect: 'portrait',
      filterStyle: CINEMA_GRADE_DEEP,
      objectPosition: 'center 42%',
      focalY: 0.42,
    },
    {
      title: 'Moonlight Between Pillars',
      caption: 'Classical Colonnade Nocturne',
      exifSpec: '',
      imageUrl: '/assets/quickshare/pro-30.jpg',
      aspect: 'portrait',
      filterStyle: CINEMA_GRADE_WARM,
      objectPosition: 'center 45%',
      focalY: 0.45,
    },
    {
      title: 'Celestial Cloud Rays',
      caption: 'Golden Hour Sky Drama',
      exifSpec: '',
      imageUrl: '/assets/quickshare/pro-14.jpg',
      aspect: 'portrait',
      filterStyle: CINEMA_GRADE_DEEP,
      objectPosition: 'center 45%',
      focalY: 0.45,
    },
    {
      title: 'Prayer Flags in the Clouds',
      caption: 'Himalayan Sacred Ridge',
      exifSpec: '',
      imageUrl: '/assets/quickshare/pro-25.jpg',
      aspect: 'portrait',
      filterStyle: CINEMA_GRADE_DEEP,
      objectPosition: 'center 46%',
      focalY: 0.46,
    },
    {
      title: 'Hooghly Bridge at Dawn',
      caption: 'Golden River Crossing',
      exifSpec: '',
      imageUrl: '/assets/quickshare/pro-19.jpg',
      aspect: 'landscape',
      filterStyle: CINEMA_GRADE_WARM,
      objectPosition: 'center 52%',
      focalY: 0.52,
    },
    {
      title: 'Floral Mandap Tenderness',
      caption: 'Intimate Bridal Embrace',
      exifSpec: '',
      imageUrl: '/assets/cinema/cam-19.jpg',
      aspect: 'landscape',
      filterStyle: CINEMA_GRADE_WARM,
      objectPosition: 'center 35%',
      focalY: 0.35,
    },
    {
      title: 'Royal Bridal Adornment',
      caption: 'Kanjeevaram & Gold Jewels',
      exifSpec: '',
      imageUrl: '/assets/cinema/cam-16.jpg',
      aspect: 'portrait',
      filterStyle: CINEMA_GRADE_SILK,
      objectPosition: 'center 28%',
      focalY: 0.28,
    },
    {
      title: 'Golden Chiaroscuro Gaze',
      caption: 'Low-Key Candlelight Portrait',
      exifSpec: '',
      imageUrl: '/assets/cinema/cam-13.jpg',
      aspect: 'portrait',
      filterStyle: CINEMA_GRADE_SILK,
      objectPosition: 'center 28%',
      focalY: 0.28,
    },
    {
      title: 'Midnight Light Trails',
      caption: 'Long-Exposure Street Motion',
      exifSpec: '',
      imageUrl: '/assets/cinema/cam-03.jpg',
      aspect: 'landscape',
      filterStyle: CINEMA_GRADE_SILK,
      objectPosition: 'center 45%',
      focalY: 0.45,
    },
  ],
  warmth: [
    {
      title: 'Sacred Archway Blessing',
      caption: 'Family Kinship in Temple Red',
      exifSpec: '',
      imageUrl: '/assets/cinema/cam-01.jpg',
      aspect: 'portrait',
      filterStyle: CINEMA_GRADE_WARM,
      objectPosition: 'center 55%',
      focalY: 0.55,
    },
    {
      title: 'Colonnade Embrace',
      caption: 'Natural Light Courtyard Candid',
      exifSpec: '',
      imageUrl: '/assets/cinema/cam-02.jpg',
      aspect: 'landscape',
      filterStyle: CINEMA_GRADE_WARM,
      objectPosition: 'center 38%',
      focalY: 0.38,
    },
    {
      title: 'Floral Mandap Embrace',
      caption: 'Intimate Bridal Embrace',
      exifSpec: '',
      imageUrl: '/assets/cinema/cam-18.jpg',
      aspect: 'landscape',
      filterStyle: CINEMA_GRADE_WARM,
      objectPosition: 'center 35%',
      focalY: 0.35,
    },
    {
      title: 'Temple Corridor Lullaby',
      caption: 'Mother & Child Among Pillars',
      exifSpec: '',
      imageUrl: '/assets/cinema/cam-22.jpg',
      aspect: 'portrait',
      filterStyle: CINEMA_GRADE_WARM,
      objectPosition: 'center 62%',
      focalY: 0.62,
    },
    {
      title: 'Amber Chiaroscuro Gaze',
      caption: 'Warm Low-Key Portrait',
      exifSpec: '',
      imageUrl: '/assets/cinema/cam-12.jpg',
      aspect: 'portrait',
      filterStyle: CINEMA_GRADE_WARM,
      objectPosition: 'center 32%',
      focalY: 0.32,
    },
    {
      title: 'Hill Town Brotherhood',
      caption: 'Friendship on the Mountain Road',
      exifSpec: '35mm f/1.4 · 1/640s · ISO 160',
      imageUrl: '/assets/quickshare/pro-08.jpg',
      aspect: 'portrait',
      filterStyle: CINEMA_GRADE_DEEP,
      objectPosition: 'center 45%',
      focalY: 0.45,
    },
    {
      title: 'Misty Hill Station Wait',
      caption: 'Travelers in the Cloud Valley',
      exifSpec: '35mm f/1.4 · 1/500s · ISO 200',
      imageUrl: '/assets/quickshare/pro-16.jpg',
      aspect: 'portrait',
      filterStyle: CINEMA_GRADE_DEEP,
      objectPosition: 'center 48%',
      focalY: 0.48,
    },
    {
      title: 'Maternal Instinct in the Hills',
      caption: 'Gentle Wildlife Kinship',
      exifSpec: '85mm f/1.4 · 1/640s · ISO 200',
      imageUrl: '/assets/quickshare/pro-31.jpg',
      aspect: 'portrait',
      filterStyle: CINEMA_GRADE_DEEP,
      objectPosition: 'center 46%',
      focalY: 0.46,
    },
    {
      title: 'Whiskers & Amber Eyes',
      caption: 'Intimate Portrait Study',
      exifSpec: '50mm f/1.2 · 1/400s · ISO 250',
      imageUrl: '/assets/quickshare/pro-23.jpg',
      aspect: 'portrait',
      filterStyle: CINEMA_GRADE_DEEP,
      objectPosition: 'center 40%',
      focalY: 0.4,
    },
    {
      title: 'Little Explorer on the Tracks',
      caption: 'Misty Railway Companion',
      exifSpec: '50mm f/1.2 · 1/500s · ISO 200',
      imageUrl: '/assets/quickshare/pro-32.jpg',
      aspect: 'portrait',
      filterStyle: CINEMA_GRADE_DEEP,
      objectPosition: 'center 52%',
      focalY: 0.52,
    },
    {
      title: 'Nightfall at the Corner Café',
      caption: 'Amber Tungsten Street Story',
      exifSpec: '35mm f/1.4 · 1/160s · ISO 640',
      imageUrl: '/assets/quickshare/pro-34.jpg',
      aspect: 'portrait',
      filterStyle: CINEMA_GRADE_WARM,
      objectPosition: 'center 50%',
      focalY: 0.5,
    },
    {
      title: 'Artisan Bowl & Morning Egg',
      caption: 'Tabletop Culinary Craft',
      exifSpec: '50mm f/1.2 · 1/250s · ISO 320',
      imageUrl: '/assets/quickshare/pro-37.jpg',
      aspect: 'portrait',
      filterStyle: CINEMA_GRADE_DEEP,
      objectPosition: 'center 50%',
      focalY: 0.5,
    },
    {
      title: 'Midnight Creative Studio',
      caption: 'Warm Desk Lamp Sanctuary',
      exifSpec: '35mm f/1.4 · 1/125s · ISO 800',
      imageUrl: '/assets/quickshare/pro-17.jpg',
      aspect: 'portrait',
      filterStyle: CINEMA_GRADE_WARM,
      objectPosition: 'center 48%',
      focalY: 0.48,
    },
  ],
  serenity: [
    {
      title: 'Amber Chiaroscuro Gaze',
      caption: 'Low-Key Candlelight Portrait',
      exifSpec: '50mm f/1.2 · 1/160s · ISO 640',
      imageUrl: '/assets/cinema/cam-06.jpg',
      aspect: 'portrait',
      filterStyle: CINEMA_GRADE_WARM,
      objectPosition: 'center 28%',
      focalY: 0.28,
    },
    {
      title: 'Golden Hour Reverie',
      caption: 'Warm Rim-Lit Solo Study',
      exifSpec: '50mm f/1.2 · 1/200s · ISO 500',
      imageUrl: '/assets/cinema/cam-07.jpg',
      aspect: 'portrait',
      filterStyle: CINEMA_GRADE_WARM,
      objectPosition: 'center 30%',
      focalY: 0.3,
    },
    {
      title: 'Sculpted in Shadow',
      caption: 'Intimate Evening Portraiture',
      exifSpec: '50mm f/1.2 · 1/160s · ISO 640',
      imageUrl: '/assets/cinema/cam-10.jpg',
      aspect: 'portrait',
      filterStyle: CINEMA_GRADE_WARM,
      objectPosition: 'center 28%',
      focalY: 0.28,
    },
    {
      title: 'Frangipani & Gold Bangles',
      caption: 'Delicate Floral Detail',
      exifSpec: '50mm f/1.2 · 1/250s · ISO 400',
      imageUrl: '/assets/cinema/cam-09.jpg',
      aspect: 'portrait',
      filterStyle: CINEMA_GRADE_WARM,
      objectPosition: 'center 52%',
      focalY: 0.52,
    },
    {
      title: 'Ghat Pillars & River Boat',
      caption: 'Framed Through Heritage Columns',
      exifSpec: '50mm f/1.2 · 1/800s · ISO 160',
      imageUrl: '/assets/cinema/cam-05.jpg',
      aspect: 'portrait',
      filterStyle: CINEMA_GRADE_DEEP,
      objectPosition: 'center 64%',
      focalY: 0.64,
    },
    {
      title: 'Emerald Hillside Mist',
      caption: 'Quiet Mountain Morning',
      exifSpec: '35mm f/1.4 · 1/800s · ISO 160',
      imageUrl: '/assets/quickshare/pro-21.jpg',
      aspect: 'portrait',
      filterStyle: CINEMA_GRADE_DEEP,
      objectPosition: 'center 48%',
      focalY: 0.48,
    },
    {
      title: 'Cloud-Kissed Green Slopes',
      caption: 'Monsoon Tea Valley',
      exifSpec: '35mm f/1.4 · 1/1000s · ISO 125',
      imageUrl: '/assets/quickshare/pro-40.jpg',
      aspect: 'portrait',
      filterStyle: CINEMA_GRADE_DEEP,
      objectPosition: 'center 48%',
      focalY: 0.48,
    },
    {
      title: 'Cathedral of Pines',
      caption: 'Forest Canopy Geometry',
      exifSpec: '24mm f/1.4 · 1/640s · ISO 200',
      imageUrl: '/assets/quickshare/pro-20.jpg',
      aspect: 'portrait',
      filterStyle: CINEMA_GRADE_DEEP,
      objectPosition: 'center 45%',
      focalY: 0.45,
    },
    {
      title: 'Whispering Forest Canopy',
      caption: 'Tall Pines in Autumn Light',
      exifSpec: '24mm f/1.4 · 1/500s · ISO 200',
      imageUrl: '/assets/quickshare/pro-28.jpg',
      aspect: 'portrait',
      filterStyle: CINEMA_GRADE_DEEP,
      objectPosition: 'center 45%',
      focalY: 0.45,
    },
    {
      title: 'Tea Garden Daydream',
      caption: 'Pause Above the Terraces',
      exifSpec: '35mm f/1.4 · 1/800s · ISO 160',
      imageUrl: '/assets/quickshare/pro-24.jpg',
      aspect: 'portrait',
      filterStyle: CINEMA_GRADE_DEEP,
      objectPosition: 'center 54%',
      focalY: 0.54,
    },
    {
      title: 'Lakeside Red Sneakers',
      caption: 'Still Waters & Mist',
      exifSpec: '35mm f/1.4 · 1/640s · ISO 160',
      imageUrl: '/assets/quickshare/pro-33.jpg',
      aspect: 'portrait',
      filterStyle: CINEMA_GRADE_DEEP,
      objectPosition: 'center 55%',
      focalY: 0.55,
    },
    {
      title: 'Mountain Parapet Pause',
      caption: 'Valley Overlook Study',
      exifSpec: '35mm f/1.4 · 1/800s · ISO 160',
      imageUrl: '/assets/quickshare/pro-11.jpg',
      aspect: 'portrait',
      filterStyle: CINEMA_GRADE_DEEP,
      objectPosition: 'center 48%',
      focalY: 0.48,
    },
    {
      title: 'Indigo Twilight & Crescent',
      caption: 'Evening Star & Crescent Moon',
      exifSpec: '50mm f/1.2 · 1/125s · ISO 640',
      imageUrl: '/assets/quickshare/pro-38.jpg',
      aspect: 'landscape',
      filterStyle: CINEMA_GRADE_WARM,
      objectPosition: 'center 46%',
      focalY: 0.46,
    },
    {
      title: 'Harbor Silhouette at Dusk',
      caption: 'Tranquil River Reflections',
      exifSpec: '50mm f/1.2 · 1/320s · ISO 250',
      imageUrl: '/assets/quickshare/pro-26.jpg',
      aspect: 'portrait',
      filterStyle: CINEMA_GRADE_DEEP,
      objectPosition: 'center 52%',
      focalY: 0.52,
    },
  ],
  electric: [
    {
      title: 'Arms Open to the Sky',
      caption: 'Silhouette Against Dramatic Clouds',
      exifSpec: '',
      imageUrl: '/assets/quickshare/pro-05.jpg',
      aspect: 'landscape',
      filterStyle: CINEMA_GRADE_DEEP,
      objectPosition: 'center 42%',
      focalY: 0.42,
    },
    {
      title: 'Golden Coastline Horizon',
      caption: 'Molten Sunset Over Ocean Rocks',
      exifSpec: '',
      imageUrl: '/assets/quickshare/pro-29.jpg',
      aspect: 'portrait',
      filterStyle: CINEMA_GRADE_DEEP,
      objectPosition: 'center 50%',
      focalY: 0.5,
    },
    {
      title: 'Molten Horizon Sunset',
      caption: 'Amber Sun Through Dusk Clouds',
      exifSpec: '',
      imageUrl: '/assets/quickshare/pro-07.jpg',
      aspect: 'portrait',
      filterStyle: CINEMA_GRADE_DEEP,
      objectPosition: 'center 52%',
      focalY: 0.52,
    },
    {
      title: 'Ember Horizon Dusk',
      caption: 'Skyline Under Fiery Clouds',
      exifSpec: '',
      imageUrl: '/assets/quickshare/pro-36.jpg',
      aspect: 'landscape',
      filterStyle: CINEMA_GRADE_WARM,
      objectPosition: 'center 50%',
      focalY: 0.5,
    },
    {
      title: 'Mist Over Mountain Lights',
      caption: 'Nocturne Fog in the Valley',
      exifSpec: '',
      imageUrl: '/assets/quickshare/pro-18.jpg',
      aspect: 'portrait',
      filterStyle: CINEMA_GRADE_WARM,
      objectPosition: 'center 55%',
      focalY: 0.55,
    },
    {
      title: 'Through the Glass Portal',
      caption: 'Optical Refraction Study',
      exifSpec: '',
      imageUrl: '/assets/quickshare/pro-35.jpg',
      aspect: 'portrait',
      filterStyle: CINEMA_GRADE_DEEP,
      objectPosition: 'center 52%',
      focalY: 0.52,
    },
    {
      title: 'Midnight Light Trails',
      caption: 'Long-Exposure Street Motion',
      exifSpec: '',
      imageUrl: '/assets/cinema/cam-04.jpg',
      aspect: 'landscape',
      filterStyle: CINEMA_GRADE_WARM,
      objectPosition: 'center 50%',
      focalY: 0.5,
    },
    {
      title: 'Illuminated Heritage Night',
      caption: 'Palace Lights After Dark',
      exifSpec: '',
      imageUrl: '/assets/cinema/cam-08.jpg',
      aspect: 'portrait',
      filterStyle: CINEMA_GRADE_WARM,
      objectPosition: 'center 48%',
      focalY: 0.48,
    },
    {
      title: 'Golden Hour Reverie',
      caption: 'Warm Rim-Lit Solo Study',
      exifSpec: '',
      imageUrl: '/assets/cinema/cam-11.jpg',
      aspect: 'portrait',
      filterStyle: CINEMA_GRADE_WARM,
      objectPosition: 'center 30%',
      focalY: 0.3,
    },
    {
      title: 'Frangipani & Gold Bangles',
      caption: 'Delicate Floral Detail',
      exifSpec: '',
      imageUrl: '/assets/cinema/cam-14.jpg',
      aspect: 'portrait',
      filterStyle: CINEMA_GRADE_WARM,
      objectPosition: 'center 55%',
      focalY: 0.55,
    },
    {
      title: 'Heritage Window Glance',
      caption: 'Candid Laughter by the Arch',
      exifSpec: '',
      imageUrl: '/assets/cinema/cam-15.jpg',
      aspect: 'landscape',
      filterStyle: CINEMA_GRADE_WARM,
      objectPosition: 'center 45%',
      focalY: 0.45,
    },
    {
      title: 'Twilight Riverfront Silhouette',
      caption: 'Hooghly Dusk Horizon',
      exifSpec: '',
      imageUrl: '/assets/cinema/cam-17.jpg',
      aspect: 'landscape',
      filterStyle: CINEMA_GRADE_WARM,
      objectPosition: 'center 42%',
      focalY: 0.42,
    },
    {
      title: 'Pastel River Dusk',
      caption: 'Ferry Crossing at Sunset',
      exifSpec: '',
      imageUrl: '/assets/cinema/cam-20.jpg',
      aspect: 'portrait',
      filterStyle: CINEMA_GRADE_DEEP,
      objectPosition: 'center 62%',
      focalY: 0.62,
    },
    {
      title: 'Canopy Sunset Crossing',
      caption: 'Golden Silhouette on the Water',
      exifSpec: '',
      imageUrl: '/assets/cinema/cam-21.jpg',
      aspect: 'landscape',
      filterStyle: CINEMA_GRADE_DEEP,
      objectPosition: 'center 68%',
      focalY: 0.68,
    },
    {
      title: 'Sacred Aarti Flame',
      caption: 'Fire & Devotion in the Night',
      exifSpec: '',
      imageUrl: '/assets/cinema/cam-23.jpg',
      aspect: 'landscape',
      filterStyle: CINEMA_GRADE_WARM,
      objectPosition: 'center 52%',
      focalY: 0.52,
    },
  ],
};

const PALETTES_BY_MOOD: Record<Exclude<EmotionMoodId, 'all'>, Array<[string, string, string]>> = {
  euphoria: [
    ['#14110f', '#d48c29', '#ebe0cc'],
    ['#1c1613', '#8b1e1e', '#f5ebd9'],
    ['#221a15', '#f59e0b', '#ebe0cc'],
  ],
  warmth: [
    ['#14110f', '#f59e0b', '#ebe0cc'],
    ['#1c1613', '#d48c29', '#f5ebd9'],
    ['#241a16', '#8b1e1e', '#ebe0cc'],
  ],
  serenity: [
    ['#14110f', '#c8a97e', '#ebe0cc'],
    ['#1b1613', '#d48c29', '#f5ebd9'],
    ['#201915', '#8b1e1e', '#ebe0cc'],
  ],
  electric: [
    ['#14110f', '#8b1e1e', '#ebe0cc'],
    ['#1c1613', '#f59e0b', '#f5ebd9'],
    ['#221915', '#d48c29', '#ebe0cc'],
  ],
};

/**
 * Generates the complete 108-photograph catalog for the 3D Globe:
 * - Interleaves all 54 unique photographs across moods so adjacent globe tiles are thoroughly shuffled.
 * - Repeats each unique photograph at most 2 times (54 × 2 = 108 total tiles; zero images repeated 3+ times).
 * - Uses 2-opt antipodal sphere matching on the Fibonacci sphere so the 2 copies of any photograph
 *   are placed on opposite hemispheres (minimum chord distance >= 1.85 on unit sphere, > 6 tiles apart),
 *   guaranteeing zero side-by-side or nearby duplicates anywhere on the 3D Globe.
 */
export function generateInitial108Photos(): PortfolioPhoto[] {
  const moods: Array<Exclude<EmotionMoodId, 'all'>> = ['euphoria', 'warmth', 'serenity', 'electric'];

  // Collect all unique specs interleaved across moods so neighboring tiles are well-shuffled
  const uniqueEntries: Array<{
    spec: CuratedPhotoSpec;
    moodId: Exclude<EmotionMoodId, 'all'>;
    photographySpec: string;
    palette: [string, string, string];
  }> = [];
  const seenUrls = new Set<string>();

  const maxLen = Math.max(...moods.map((m) => BASE_PHOTOS_BY_MOOD[m].length));
  for (let step = 0; step < maxLen; step++) {
    for (const moodId of moods) {
      const specs = BASE_PHOTOS_BY_MOOD[moodId];
      if (step < specs.length) {
        const spec = specs[step];
        if (!seenUrls.has(spec.imageUrl)) {
          seenUrls.add(spec.imageUrl);
          const category = EMOTION_CATEGORIES.find((c) => c.id === moodId)!;
          const palettes = PALETTES_BY_MOOD[moodId];
          uniqueEntries.push({
            spec,
            moodId,
            photographySpec: category.photographySpec,
            palette: palettes[step % palettes.length],
          });
        }
      }
    }
  }

  const totalSlots = 108;
  const uniqueCount = uniqueEntries.length; // 54 unique photographs (54 × 2 = 108)
  const goldenRatio = (1 + Math.sqrt(5)) / 2;

  // Precompute unit-sphere coordinates for all 108 Fibonacci sphere slots
  const unitNodes = Array.from({ length: totalSlots }, (_, i) => {
    const yNorm = 1 - (i / (totalSlots - 1)) * 2;
    const clampedY = Math.max(-0.95, Math.min(0.95, yNorm * 0.93));
    const ringRadius = Math.sqrt(Math.max(0, 1 - clampedY * clampedY));
    const theta = (2 * Math.PI * i) / goldenRatio;
    return {
      nx: Math.cos(theta) * ringRadius,
      ny: clampedY,
      nz: Math.sin(theta) * ringRadius,
    };
  });

  const chordDist = (aIdx: number, bIdx: number): number => {
    const a = unitNodes[aIdx];
    const b = unitNodes[bIdx];
    return Math.hypot(a.nx - b.nx, a.ny - b.ny, a.nz - b.nz);
  };

  // Place Copy 1 of each unique photo in slots 0 .. uniqueCount-1
  const secondCopyCount = totalSlots - uniqueCount;
  const matchSlot = Array.from({ length: secondCopyCount }, (_, i) => uniqueCount + i);

  // 2-opt optimization to maximize the minimum 3D distance between Copy 1 (slot i) and Copy 2 (slot matchSlot[i])
  let improved = true;
  while (improved) {
    improved = false;
    for (let a = 0; a < secondCopyCount; a++) {
      for (let b = a + 1; b < secondCopyCount; b++) {
        const curMin = Math.min(chordDist(a, matchSlot[a]), chordDist(b, matchSlot[b]));
        const swapMin = Math.min(chordDist(a, matchSlot[b]), chordDist(b, matchSlot[a]));
        if (swapMin > curMin + 1e-6) {
          const tmp = matchSlot[a];
          matchSlot[a] = matchSlot[b];
          matchSlot[b] = tmp;
          improved = true;
        }
      }
    }
  }

  const assignedEntries = new Array<(typeof uniqueEntries)[number]>(totalSlots);
  for (let i = 0; i < uniqueCount; i++) {
    assignedEntries[i] = uniqueEntries[i];
  }
  for (let i = 0; i < secondCopyCount; i++) {
    assignedEntries[matchSlot[i]] = uniqueEntries[i];
  }

  return assignedEntries.map((entry, idx) => {
    const globalIdx = idx + 1;
    // Assign balanced moodId across the 4 categories while keeping each photo's authentic spec
    const balancedMood = moods[idx % 4];
    const category = EMOTION_CATEGORIES.find((c) => c.id === balancedMood)!;
    return {
      id: `srinath-photo-${String(globalIdx).padStart(3, '0')}`,
      index: globalIdx,
      title: entry.spec.title,
      caption: entry.spec.caption,
      exifSpec: '',
      moodId: balancedMood,
      photographySpec: category.photographySpec,
      palette: entry.palette,
      aspect: entry.spec.aspect,
      imageUrl: entry.spec.imageUrl,
      filterStyle: entry.spec.filterStyle,
      objectPosition: entry.spec.objectPosition,
      focalX: 0.5,
      focalY: entry.spec.focalY,
      cropZoom: 1.0,
    };
  });
}

// Keep aliases for backward compatibility across imports & tests
export const generateInitial40Photos = generateInitial108Photos;
export const generateInitial50Photos = generateInitial108Photos;

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
 * Partitions Srinath's unique photographs into non-overlapping gallery sections with ZERO repeated images:
 * - Hero Banner (1 photo)
 * - Solitary & Lifestyle Narratives (4 photos, 1:1 ratio)
 * - Portraits & Intimate Kinship (2 photos, 1:1 ratio)
 * - Twilight & Horizon Alchemy (6 showcase photos + 5 stack photos, excluding blurry/badly-cropped pro-04, pro-09, pro-13)
 * - Portrait Series (33 unique portrait-orientation photos, shown 3 at a time, moving one by one on click)
 * - Landscape Series (8 unique landscape-orientation photos, shown 1 at a time, changing on click)
 */
export function getUniqueGallerySections(allPhotos: PortfolioPhoto[]): UniqueGallerySections {
  const byUrl = new Map<string, PortfolioPhoto>();
  for (const photo of allPhotos) {
    if (!byUrl.has(photo.imageUrl)) {
      byUrl.set(photo.imageUrl, photo);
    }
  }

  const pick = (urls: string[]): PortfolioPhoto[] =>
    urls.map((u) => byUrl.get(u)).filter((p): p is PortfolioPhoto => Boolean(p));

  const heroUrl = '/assets/cinema/cam-18.jpg';
  const solitaryUrls = [
    '/assets/cinema/cam-16.jpg',
    '/assets/cinema/cam-11.jpg',
    '/assets/cinema/cam-12.jpg',
    '/assets/cinema/cam-14.jpg',
  ];
  const kinshipUrls = ['/assets/cinema/cam-02.jpg', '/assets/cinema/cam-01.jpg'];

  // Twilight & Horizon Alchemy — crisp images only (no Close Study repeats, no pro-04, pro-09, pro-10, pro-13)
  const twilightShowcaseUrls = [
    '/assets/quickshare/pro-29.jpg',
    '/assets/quickshare/pro-07.jpg',
    '/assets/quickshare/pro-18.jpg',
    '/assets/quickshare/pro-35.jpg',
    '/assets/cinema/cam-08.jpg',
  ];
  const twilightStackUrls = [
    '/assets/quickshare/pro-05.jpg',
    '/assets/quickshare/pro-36.jpg',
    '/assets/cinema/cam-04.jpg',
    '/assets/cinema/cam-17.jpg',
    '/assets/cinema/cam-20.jpg',
  ];

  // All remaining unique Portrait photographs (30 photos, zero overlap with above sections)
  const portraitArchiveUrls = [
    '/assets/quickshare/pro-39.jpg',
    '/assets/quickshare/pro-12.jpg',
    '/assets/quickshare/pro-15.jpg',
    '/assets/quickshare/pro-22.jpg',
    '/assets/quickshare/pro-30.jpg',
    '/assets/quickshare/pro-14.jpg',
    '/assets/quickshare/pro-25.jpg',
    '/assets/cinema/cam-13.jpg',
    '/assets/cinema/cam-19.jpg',
    '/assets/cinema/cam-22.jpg',
    '/assets/quickshare/pro-08.jpg',
    '/assets/quickshare/pro-16.jpg',
    '/assets/quickshare/pro-31.jpg',
    '/assets/quickshare/pro-23.jpg',
    '/assets/quickshare/pro-32.jpg',
    '/assets/quickshare/pro-34.jpg',
    '/assets/quickshare/pro-37.jpg',
    '/assets/quickshare/pro-17.jpg',
    '/assets/cinema/cam-07.jpg',
    '/assets/cinema/cam-10.jpg',
    '/assets/cinema/cam-09.jpg',
    '/assets/cinema/cam-05.jpg',
    '/assets/quickshare/pro-21.jpg',
    '/assets/quickshare/pro-40.jpg',
    '/assets/quickshare/pro-20.jpg',
    '/assets/quickshare/pro-28.jpg',
    '/assets/quickshare/pro-24.jpg',
    '/assets/quickshare/pro-33.jpg',
    '/assets/quickshare/pro-11.jpg',
    '/assets/quickshare/pro-26.jpg',
  ];

  // All remaining unique Landscape photographs (8 photos, zero overlap with above sections)
  const landscapeArchiveUrls = [
    '/assets/quickshare/pro-01.jpg',
    '/assets/quickshare/pro-19.jpg',
    '/assets/quickshare/pro-38.jpg',
    '/assets/cinema/cam-03.jpg',
    '/assets/cinema/cam-06.jpg',
    '/assets/cinema/cam-15.jpg',
    '/assets/cinema/cam-21.jpg',
    '/assets/cinema/cam-23.jpg',
  ];

  return {
    heroPhoto: byUrl.get(heroUrl) || allPhotos[0],
    solitaryPhotos: pick(solitaryUrls),
    kinshipPhotos: pick(kinshipUrls),
    twilightShowcasePhotos: pick(twilightShowcaseUrls),
    twilightStackPhotos: pick(twilightStackUrls),
    portraitArchivePhotos: pick(portraitArchiveUrls),
    landscapeArchivePhotos: pick(landscapeArchiveUrls),
  };
}

/**
 * Returns a 3-image sliding window for Portrait photographs so clicking Next/Prev
 * moves all 3 portrait images one by one through the archive.
 */
export function getPortraitTrioWindow(photos: PortfolioPhoto[], startIndex: number): PortfolioPhoto[] {
  const total = photos.length;
  if (total === 0) return [];
  const count = Math.min(3, total);
  const result: PortfolioPhoto[] = [];
  for (let offset = 0; offset < count; offset++) {
    const idx = (((startIndex + offset) % total) + total) % total;
    result.push(photos[idx]);
  }
  return result;
}

/**
 * Filters the portfolio photos by mood row.
 */
export function filterPhotosByMood(photos: PortfolioPhoto[], mood: EmotionMoodId): PortfolioPhoto[] {
  if (mood === 'all') return photos;
  return photos.filter((photo) => photo.moodId === mood);
}

/**
 * Handles the Phone "Recent Tabs" card stack & Fullscreen state transitions.
 */
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

/**
 * Computes evenly distributed 3D spherical coordinates (Fibonacci Sphere)
 * for all 108 photos on the 3D Orb / Globe Gallery with tight mosaic packing.
 */
export function computeOrbPositions(photos: PortfolioPhoto[], radius = 6.0): OrbNodePosition[] {
  const n = photos.length;
  if (n === 0) return [];
  const goldenRatio = (1 + Math.sqrt(5)) / 2;

  return photos.map((photo, i) => {
    const yNorm = n === 1 ? 0 : 1 - (i / (n - 1)) * 2;
    const clampedY = Math.max(-0.95, Math.min(0.95, yNorm * 0.93));
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
    };
  });
}

export function buildTelUrl(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, '');
  return `tel:${cleaned || '+919848052310'}`;
}

export function buildWhatsAppUrl(whatsapp: string, moodTitle?: string, eventNote?: string): string {
  const digits = whatsapp.replace(/\D/g, '') || '919848052310';
  const message = eventNote
    ? `Hi Srinath! I explored your Kalyanam & Portraits Portfolio (${moodTitle || 'Selected Works'}). ${eventNote}`
    : `Hi Srinath! I loved exploring your Kalyanam & Portraits Photography Portfolio and would love to inquire & book a shoot.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function buildMailtoUrl(email: string, moodTitle?: string, clientName?: string, eventDetails?: string): string {
  const targetEmail = email.trim() || 'srinath.frames@studio.in';
  const subject = `Photography Booking Inquiry for Srinath — ${moodTitle || 'Kalyanam & Portraits'}`;
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
