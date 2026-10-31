import React, { useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import {
  PortfolioPhoto,
  getUniqueGallerySections,
  getPortraitTrioWindow,
} from '../utils/portfolioLogic';
import { renderPhotoDataUrl } from '../utils/proceduralPhotos';

interface RecentTabsGalleryProps {
  allPhotos: PortfolioPhoto[];
  onOpenFullscreen: (photo: PortfolioPhoto) => void;
}

interface InteractiveSingleStackProps {
  photos: PortfolioPhoto[];
  sectionLabel: string;
  testIdPrefix: string;
  onOpenFullscreen: (photo: PortfolioPhoto) => void;
}

/**
 * Interactive 1-image-at-a-time viewer with Left/Right navigation and full-image click-to-open.
 */
const InteractiveSingleStack: React.FC<InteractiveSingleStackProps> = ({
  photos,
  sectionLabel,
  testIdPrefix,
  onOpenFullscreen,
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [swipeOffset, setSwipeOffset] = useState<number>(0);
  const touchStartXRef = useRef<number | null>(null);
  const touchDeltaXRef = useRef<number>(0);

  const total = photos.length;
  const safeIndex = total > 0 ? ((activeIndex % total) + total) % total : 0;
  const currentPhoto = photos[safeIndex];

  const handleNext = () => {
    if (total <= 0) return;
    setActiveIndex((prev) => (prev + 1) % total);
  };

  const handlePrev = () => {
    if (total <= 0) return;
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartXRef.current = e.touches[0].clientX;
      touchDeltaXRef.current = 0;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current !== null && e.touches.length === 1) {
      const delta = e.touches[0].clientX - touchStartXRef.current;
      touchDeltaXRef.current = delta;
      setSwipeOffset(Math.max(-110, Math.min(110, delta * 0.45)));
    }
  };

  const handleTouchEnd = () => {
    const delta = touchDeltaXRef.current;
    touchStartXRef.current = null;
    touchDeltaXRef.current = 0;
    setSwipeOffset(0);

    if (delta < -40) {
      handleNext();
    } else if (delta > 40) {
      handlePrev();
    }
  };

  if (!currentPhoto) return null;

  return (
    <div
      className="relative w-full h-[380px] sm:h-[470px] rounded-2xl bg-[#1a1411]/95 border border-[#c8a97e]/30 shadow-2xl overflow-hidden select-none perspective-1200 flex items-center justify-center"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Cascading 3D Stack Cards */}
      {[4, 3, 2, 1, 0].map((offset) => {
        if (offset >= total) return null;
        const cardIdx = (safeIndex + offset) % total;
        const photo = photos[cardIdx];
        if (!photo) return null;

        const isFront = offset === 0;
        const dataUrl = renderPhotoDataUrl(photo, 900, 680);
        const translateX = isFront ? swipeOffset : -offset * 74;
        const translateY = offset * -16;
        const scale = 1 - offset * 0.055;
        const rotateY = isFront ? swipeOffset * -0.06 : -14 - offset * 2.4;
        const opacity = 1 - offset * 0.15;

        return (
          <div
            key={`${photo.id}-stack-${offset}`}
            style={{
              transform: `translate3d(${translateX}px, ${translateY}px, ${-offset * 55}px) scale(${scale}) rotateY(${rotateY}deg)`,
              opacity,
              zIndex: 20 - offset,
            }}
            className={`absolute w-[90%] sm:w-[78%] lg:w-[70%] max-w-3xl h-[320px] sm:h-[410px] rounded-xl overflow-hidden border bg-[#14110f] shadow-2xl transition-all duration-300 ease-out ${
              isFront ? 'border-[#d48c29]/80' : 'border-[#c8a97e]/25'
            }`}
          >
            {/* Top Box Bar: Photo Name Only */}
            <div className="h-9 px-4 bg-[#1c1613] border-b border-[#c8a97e]/25 flex items-center">
              <span className="font-serif font-medium text-xs sm:text-sm text-[#ebe0cc] truncate tracking-wide">
                {photo.title}
              </span>
            </div>

            {/* Photograph Surface */}
            <div className="relative w-full h-[calc(100%-2.25rem)] bg-[#0f0c0a]">
              <img
                src={dataUrl}
                alt={photo.title}
                loading={isFront ? 'eager' : 'lazy'}
                style={{
                  filter: photo.filterStyle,
                  objectPosition: photo.objectPosition || 'center',
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#14110f]/45 via-transparent to-[#14110f]/15 pointer-events-none" />
            </div>
          </div>
        );
      })}

      {/* Full Image Click Area: Clicking Anywhere on the Image Opens Full Screen */}
      <button
        type="button"
        onClick={() => onOpenFullscreen(currentPhoto)}
        aria-label={`Open ${currentPhoto.title} in full screen`}
        data-testid={testIdPrefix === 'stack-zone' ? 'stack-zone-middle' : `${testIdPrefix}-middle`}
        className="absolute inset-0 z-25 w-full h-full cursor-pointer focus:outline-none"
      />

      {/* Left Arrow Button: Moves to Next Stack Frame */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleNext();
        }}
        aria-label={`Next photo in ${sectionLabel}`}
        data-testid={testIdPrefix === 'stack-zone' ? 'stack-zone-left' : `${testIdPrefix}-left`}
        className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-30 min-h-[44px] min-w-[44px] rounded-full bg-[#14110f]/85 border border-[#c8a97e]/45 text-[#ebe0cc] hover:bg-[#d48c29] hover:text-[#14110f] transition-colors flex items-center justify-center shadow-lg cursor-pointer focus:outline-none"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Right Arrow Button: Moves to Next/Previous Frame */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleNext();
        }}
        aria-label={`Move to next photo in ${sectionLabel}`}
        data-testid={testIdPrefix === 'stack-zone' ? 'stack-zone-right' : `${testIdPrefix}-right`}
        className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 min-h-[44px] min-w-[44px] rounded-full bg-[#14110f]/85 border border-[#c8a97e]/45 text-[#ebe0cc] hover:bg-[#d48c29] hover:text-[#14110f] transition-colors flex items-center justify-center shadow-lg cursor-pointer focus:outline-none"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export const RecentTabsGallery: React.FC<RecentTabsGalleryProps> = ({
  allPhotos,
  onOpenFullscreen,
}) => {
  const {
    heroPhoto,
    solitaryPhotos,
    kinshipPhotos,
    twilightShowcasePhotos,
    twilightStackPhotos,
    portraitArchivePhotos,
    landscapeArchivePhotos,
  } = useMemo(() => getUniqueGallerySections(allPhotos), [allPhotos]);

  // Twilight & Horizon Alchemy 3-card row index (moves 1-by-1 so all 3 shift smoothly)
  const [twilightStartIndex, setTwilightStartIndex] = useState<number>(0);
  const twilightTrio = getPortraitTrioWindow(twilightShowcasePhotos, twilightStartIndex);

  // Portrait Photographs section: 3 images shown at a time, moving all 3 one-by-one on click
  const [portraitStartIndex, setPortraitStartIndex] = useState<number>(0);
  const portraitTrio = getPortraitTrioWindow(portraitArchivePhotos, portraitStartIndex);

  const handleTwilightPrev = () => {
    if (twilightShowcasePhotos.length === 0) return;
    setTwilightStartIndex(
      (prev) => (prev - 1 + twilightShowcasePhotos.length) % twilightShowcasePhotos.length
    );
  };

  const handleTwilightNext = () => {
    if (twilightShowcasePhotos.length === 0) return;
    setTwilightStartIndex((prev) => (prev + 1) % twilightShowcasePhotos.length);
  };

  const handlePortraitPrev = () => {
    if (portraitArchivePhotos.length === 0) return;
    setPortraitStartIndex(
      (prev) => (prev - 1 + portraitArchivePhotos.length) % portraitArchivePhotos.length
    );
  };

  const handlePortraitNext = () => {
    if (portraitArchivePhotos.length === 0) return;
    setPortraitStartIndex((prev) => (prev + 1) % portraitArchivePhotos.length);
  };

  return (
    <section
      id="mood-gallery"
      aria-label="Srinath Photography Portfolio"
      className="relative z-10 py-6 sm:py-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12"
    >
      {/* 1. HERO BANNER (Click Anywhere on the Image to Open Full Screen; No Bottom Filter Tabs; No "Click to open" Text) */}
      {heroPhoto && (
        <div
          role="button"
          tabIndex={0}
          aria-label={`Open ${heroPhoto.title} in full screen`}
          data-testid="hero-banner-photo"
          onClick={() => onOpenFullscreen(heroPhoto)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenFullscreen(heroPhoto);
            }
          }}
          className="group rounded-2xl overflow-hidden border border-[#c8a97e]/35 bg-[#181310] shadow-2xl cursor-pointer focus:outline-none hover:border-[#d48c29] transition-all"
        >
          <div className="relative h-[420px] sm:h-[480px] lg:h-[520px] w-full overflow-hidden">
            <img
              src={renderPhotoDataUrl(heroPhoto, 1400, 900)}
              alt={heroPhoto.title}
              style={{
                filter: 'brightness(0.90) contrast(1.10) saturate(1.06)',
                objectPosition: '50% 32%',
              }}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#14110f]/90 via-[#14110f]/45 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#14110f] via-[#14110f]/25 to-transparent" />

            <div className="absolute inset-x-0 bottom-8 sm:bottom-10 px-5 sm:px-10 max-w-2xl">
              <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-[#ebe0cc] leading-[1.12] tracking-tight">
                Capturing Every Ritual, Every Emotion.
              </h1>
            </div>
          </div>
        </div>
      )}

      {/* 2. SOLITARY & LIFESTYLE NARRATIVES (4 Unique Images in 1:1 Aspect Ratio) */}
      <div className="rounded-2xl border border-[#c8a97e]/30 bg-[#181310]/95 p-5 sm:p-8 space-y-5">
        <div className="flex items-center gap-2.5">
          <Camera className="w-5 h-5 text-[#d48c29]" />
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#ebe0cc]">
            Solitary &amp; Lifestyle Narratives
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          {solitaryPhotos.map((photo) => (
            <button
              key={`${photo.id}-solitary-1x1`}
              type="button"
              onClick={() => onOpenFullscreen(photo)}
              className="group relative w-full aspect-square rounded-2xl overflow-hidden border border-[#c8a97e]/35 bg-[#120e0c] text-left focus:outline-none shadow-xl hover:border-[#d48c29] transition-all cursor-pointer"
            >
              <img
                src={renderPhotoDataUrl(photo, 800, 800)}
                alt={photo.title}
                style={{
                  filter: photo.filterStyle,
                  objectPosition: photo.objectPosition || 'center',
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#14110f]/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="font-serif text-sm sm:text-base font-medium text-[#ebe0cc] truncate block group-hover:text-[#f59e0b] transition-colors">
                  {photo.title}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. PORTRAITS & INTIMATE KINSHIP (2 Unique Images in 1:1 Aspect Ratio) */}
      <div className="rounded-2xl border border-[#c8a97e]/30 bg-[#181310]/95 p-5 sm:p-8 space-y-5">
        <div className="flex items-center gap-2.5">
          <Camera className="w-5 h-5 text-[#f59e0b]" />
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#ebe0cc]">
            Portraits &amp; Intimate Kinship
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          {kinshipPhotos.map((photo) => (
            <button
              key={`${photo.id}-kinship-1x1`}
              type="button"
              onClick={() => onOpenFullscreen(photo)}
              className="group relative w-full aspect-square rounded-2xl overflow-hidden border border-[#c8a97e]/35 bg-[#120e0c] text-left focus:outline-none shadow-xl hover:border-[#d48c29] transition-all cursor-pointer"
            >
              <img
                src={renderPhotoDataUrl(photo, 800, 800)}
                alt={photo.title}
                style={{
                  filter: photo.filterStyle,
                  objectPosition: photo.objectPosition || 'center',
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#14110f]/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="font-serif text-sm sm:text-base font-medium text-[#ebe0cc] truncate block group-hover:text-[#f59e0b] transition-colors">
                  {photo.title}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 4. TWILIGHT & HORIZON ALCHEMY (1:1 Ratio Cards + Crisp Stack Viewer, Zero Close Study Repeats) */}
      <div
        className="space-y-6 pt-8 border-t border-[#c8a97e]/20"
        data-testid="mood-row-electric"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-[#c8a97e]/40"
              style={{ backgroundColor: '#8b1e1e' }}
            />
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#ebe0cc] tracking-wide">
              Twilight &amp; Horizon Alchemy
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTwilightPrev}
              aria-label="Previous photo in Twilight & Horizon Alchemy"
              className="w-9 h-9 rounded-full border border-[#c8a97e]/40 bg-[#1c1613] text-[#ebe0cc] hover:border-[#d48c29] hover:text-[#f59e0b] flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleTwilightNext}
              aria-label="Next photo in Twilight & Horizon Alchemy"
              className="w-9 h-9 rounded-full border border-[#c8a97e]/40 bg-[#1c1613] text-[#ebe0cc] hover:border-[#d48c29] hover:text-[#f59e0b] flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3-Card 1:1 Showcase Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {twilightTrio.map((photo) => {
            const url = renderPhotoDataUrl(photo, 800, 800);
            return (
              <button
                key={`${photo.id}-twilight-trio`}
                type="button"
                onClick={() => onOpenFullscreen(photo)}
                className="group text-left focus:outline-none cursor-pointer"
              >
                <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-[#c8a97e]/35 bg-[#120e0c] shadow-lg group-hover:border-[#d48c29] transition-all">
                  <img
                    src={url}
                    alt={photo.title}
                    loading="lazy"
                    style={{
                      filter: photo.filterStyle,
                      objectPosition: photo.objectPosition || 'center',
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#14110f]/75 via-transparent to-transparent opacity-70" />
                  <div className="absolute bottom-3 left-3.5 right-3.5">
                    <div className="text-xs sm:text-sm font-serif font-medium text-[#ebe0cc] truncate group-hover:text-[#f59e0b] transition-colors">
                      {photo.title}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Twilight & Horizon Interactive Single-Frame Stack (Arms Open to the Sky + Crisp Twilight Frames) */}
        <InteractiveSingleStack
          photos={twilightStackPhotos}
          sectionLabel="Twilight & Horizon Alchemy"
          testIdPrefix="stack-zone"
          onOpenFullscreen={onOpenFullscreen}
        />
      </div>

      {/* 5. PORTRAIT PHOTOGRAPHS SECTION (All 33 Remaining Portrait Images — 3 at a Time, Moving One by One on Click) */}
      <div
        className="space-y-6 pt-8 border-t border-[#c8a97e]/20"
        data-testid="portrait-archive-section"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-[#c8a97e]/40"
              style={{ backgroundColor: '#d48c29' }}
            />
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#ebe0cc] tracking-wide">
              Portrait Photographs
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePortraitPrev}
              data-testid="portrait-prev-btn"
              aria-label="Previous portrait photograph"
              className="w-9 h-9 rounded-full border border-[#c8a97e]/40 bg-[#1c1613] text-[#ebe0cc] hover:border-[#d48c29] hover:text-[#f59e0b] flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handlePortraitNext}
              data-testid="portrait-next-btn"
              aria-label="Next portrait photograph"
              className="w-9 h-9 rounded-full border border-[#c8a97e]/40 bg-[#1c1613] text-[#ebe0cc] hover:border-[#d48c29] hover:text-[#f59e0b] flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3 Portrait Images Shown at a Time — Clicking Right Moves All 3 One by One */}
        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {portraitTrio.map((photo, slotIdx) => {
              const url = renderPhotoDataUrl(photo, 800, 800);
              return (
                <button
                  key={`${photo.id}-portrait-slot-${slotIdx}`}
                  type="button"
                  data-testid={`portrait-card-${slotIdx}`}
                  onClick={() => onOpenFullscreen(photo)}
                  className="group text-left focus:outline-none cursor-pointer"
                >
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-[#c8a97e]/35 bg-[#120e0c] shadow-lg group-hover:border-[#d48c29] transition-all">
                    <img
                      src={url}
                      alt={photo.title}
                      loading="lazy"
                      style={{
                        filter: photo.filterStyle,
                        objectPosition: photo.objectPosition || 'center',
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#14110f]/75 via-transparent to-transparent opacity-70" />
                    <div className="absolute bottom-3 left-3.5 right-3.5">
                      <div className="text-xs sm:text-sm font-serif font-medium text-[#ebe0cc] truncate group-hover:text-[#f59e0b] transition-colors">
                        {photo.title}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Left / Right Side Overlay Buttons for Moving the 3 Portrait Images One by One */}
          <button
            type="button"
            onClick={handlePortraitPrev}
            aria-label="Move portrait trio left"
            className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 min-h-[42px] min-w-[42px] rounded-full bg-[#14110f]/85 border border-[#c8a97e]/45 text-[#ebe0cc] hover:bg-[#d48c29] hover:text-[#14110f] transition-colors items-center justify-center shadow-lg cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handlePortraitNext}
            aria-label="Move portrait trio right"
            className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 min-h-[42px] min-w-[42px] rounded-full bg-[#14110f]/85 border border-[#c8a97e]/45 text-[#ebe0cc] hover:bg-[#d48c29] hover:text-[#14110f] transition-colors items-center justify-center shadow-lg cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 6. LANDSCAPE PHOTOGRAPHS SECTION (All Remaining Landscape Images — 1 Image at a Time, Changing on Click) */}
      <div
        className="space-y-6 pt-8 border-t border-[#c8a97e]/20"
        data-testid="landscape-archive-section"
      >
        <div className="flex items-center gap-3">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-[#c8a97e]/40"
            style={{ backgroundColor: '#f59e0b' }}
          />
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#ebe0cc] tracking-wide">
            Landscape Photographs
          </h2>
        </div>

        <InteractiveSingleStack
          photos={landscapeArchivePhotos}
          sectionLabel="Landscape Photographs"
          testIdPrefix="landscape-stack"
          onOpenFullscreen={onOpenFullscreen}
        />
      </div>
    </section>
  );
};
