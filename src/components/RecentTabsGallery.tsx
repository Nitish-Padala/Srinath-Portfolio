import React, { useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Camera, Grid, Maximize2 } from 'lucide-react';
import {
  PortfolioPhoto,
  PhotoAspectRatio,
  ASPECT_RATIO_CATEGORIES,
  getPhotosByRatio,
  getSlidingWindow,
} from '../utils/portfolioLogic';
import { renderPhotoDataUrl } from '../utils/proceduralPhotos';

interface RecentTabsGalleryProps {
  allPhotos: PortfolioPhoto[];
  onOpenFullscreen: (photo: PortfolioPhoto) => void;
}

interface InteractiveSingleStackProps {
  photos: PortfolioPhoto[];
  aspectRatio: PhotoAspectRatio;
  sectionLabel: string;
  testIdPrefix: string;
  onOpenFullscreen: (photo: PortfolioPhoto) => void;
}

/**
 * Aspect-Ratio Card:
 * Renders photograph in its exact native aspect ratio without artificial cropping or distortion.
 */
const AspectRatioCard: React.FC<{
  photo: PortfolioPhoto;
  aspectRatio: PhotoAspectRatio;
  testId?: string;
  onOpenFullscreen: (photo: PortfolioPhoto) => void;
}> = ({ photo, aspectRatio, testId, onOpenFullscreen }) => {
  const cssAspectClass = useMemo(() => {
    switch (aspectRatio) {
      case '1:1':
        return 'aspect-square';
      case '3:4':
        return 'aspect-[3/4]';
      case '4:3':
        return 'aspect-[4/3]';
      case '9:16':
        return 'aspect-[9/16]';
      case '16:9':
        return 'aspect-[16/9]';
      default:
        return 'aspect-square';
    }
  }, [aspectRatio]);

  return (
    <button
      type="button"
      data-testid={testId}
      onClick={() => onOpenFullscreen(photo)}
      aria-label={`Open ${photo.title} in full screen`}
      className="group text-left focus:outline-none cursor-pointer w-full"
    >
      <div
        className={`relative w-full ${cssAspectClass} rounded-2xl overflow-hidden border border-[#c8a97e]/35 bg-[#120e0c] shadow-xl group-hover:border-[#d48c29] transition-all`}
      >
        <img
          src={renderPhotoDataUrl(photo, 900, 900)}
          alt={photo.title}
          loading="lazy"
          style={{
            filter: photo.filterStyle,
            objectPosition: photo.objectPosition || 'center',
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#14110f]/85 via-transparent to-transparent opacity-80" />
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-[#14110f]/80 p-1.5 rounded-full border border-[#c8a97e]/40 text-[#f59e0b]">
          <Maximize2 className="w-3.5 h-3.5" />
        </div>
        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-baseline justify-between gap-2">
          <div className="text-xs sm:text-sm font-serif font-medium text-[#ebe0cc] truncate group-hover:text-[#f59e0b] transition-colors">
            {photo.title}
          </div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-[#c8a97e]/70 shrink-0 px-1.5 py-0.5 rounded bg-[#1c1613]/80 border border-[#c8a97e]/30">
            {photo.aspectRatio}
          </span>
        </div>
      </div>
    </button>
  );
};

/**
 * Interactive 1-image-at-a-time cascading 3D stack viewer for an aspect ratio category.
 */
const InteractiveSingleStack: React.FC<InteractiveSingleStackProps> = ({
  photos,
  aspectRatio,
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
      className="relative w-full h-[400px] sm:h-[490px] rounded-2xl bg-[#1a1411]/95 border border-[#c8a97e]/30 shadow-2xl overflow-hidden select-none perspective-1200 flex items-center justify-center"
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
        const dataUrl = renderPhotoDataUrl(photo, 1000, 800);
        const translateX = isFront ? swipeOffset : -offset * 72;
        const translateY = offset * -14;
        const scale = 1 - offset * 0.05;
        const rotateY = isFront ? swipeOffset * -0.06 : -12 - offset * 2.2;
        const opacity = 1 - offset * 0.15;

        return (
          <div
            key={`${photo.id}-stack-${offset}`}
            style={{
              transform: `translate3d(${translateX}px, ${translateY}px, ${-offset * 50}px) scale(${scale}) rotateY(${rotateY}deg)`,
              opacity,
              zIndex: 20 - offset,
            }}
            className={`absolute w-[88%] sm:w-[74%] lg:w-[65%] max-w-2xl h-[330px] sm:h-[410px] rounded-xl overflow-hidden border bg-[#14110f] shadow-2xl transition-all duration-300 ease-out flex flex-col ${
              isFront ? 'border-[#d48c29]/90' : 'border-[#c8a97e]/25'
            }`}
          >
            {/* Top Box Bar: Photo Name & Aspect Ratio */}
            <div className="h-9 px-4 bg-[#1c1613] border-b border-[#c8a97e]/25 flex items-center justify-between shrink-0">
              <span className="font-serif font-medium text-xs sm:text-sm text-[#ebe0cc] truncate tracking-wide">
                {photo.title}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#d48c29] px-2 py-0.5 rounded bg-[#120e0c] border border-[#c8a97e]/30">
                {aspectRatio} · {cardIdx + 1}/{total}
              </span>
            </div>

            {/* Photograph Surface in Native Proportions */}
            <div className="relative flex-1 w-full bg-[#0f0c0a] flex items-center justify-center p-2">
              <img
                src={dataUrl}
                alt={photo.title}
                loading={isFront ? 'eager' : 'lazy'}
                style={{
                  filter: photo.filterStyle,
                }}
                className="max-h-full max-w-full object-contain rounded-lg shadow-inner"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#14110f]/40 via-transparent to-transparent pointer-events-none" />
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

      {/* Left Arrow Button: Moves to Previous Stack Frame */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handlePrev();
        }}
        aria-label={`Previous photo in ${sectionLabel}`}
        data-testid={testIdPrefix === 'stack-zone' ? 'stack-zone-left' : `${testIdPrefix}-left`}
        className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-30 min-h-[44px] min-w-[44px] rounded-full bg-[#14110f]/85 border border-[#c8a97e]/45 text-[#ebe0cc] hover:bg-[#d48c29] hover:text-[#14110f] transition-colors flex items-center justify-center shadow-lg cursor-pointer focus:outline-none"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Right Arrow Button: Moves to Next Stack Frame */}
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
  // Active selected Aspect Ratio category ('all' or '1:1' | '3:4' | '4:3' | '9:16' | '16:9')
  const [selectedRatio, setSelectedRatio] = useState<PhotoAspectRatio | 'all'>('all');

  // Category sliding indices (tracks current 3-card window index for each ratio)
  const [categoryIndices, setCategoryIndices] = useState<Record<PhotoAspectRatio, number>>({
    '1:1': 0,
    '3:4': 0,
    '4:3': 0,
    '9:16': 0,
    '16:9': 0,
  });

  // Group photos by their 5 distinct aspect ratios
  const photosByRatio = useMemo(() => {
    return {
      '1:1': getPhotosByRatio(allPhotos, '1:1'),
      '3:4': getPhotosByRatio(allPhotos, '3:4'),
      '4:3': getPhotosByRatio(allPhotos, '4:3'),
      '9:16': getPhotosByRatio(allPhotos, '9:16'),
      '16:9': getPhotosByRatio(allPhotos, '16:9'),
    };
  }, [allPhotos]);

  // Featured Hero Photograph (uses photo-01 from 1:1 collection)
  const heroPhoto = useMemo(() => {
    return photosByRatio['1:1'][0] || allPhotos[0];
  }, [photosByRatio, allPhotos]);

  const handleNextWindow = (ratio: PhotoAspectRatio) => {
    const list = photosByRatio[ratio];
    if (list.length === 0) return;
    setCategoryIndices((prev) => ({
      ...prev,
      [ratio]: (prev[ratio] + 1) % list.length,
    }));
  };

  const handlePrevWindow = (ratio: PhotoAspectRatio) => {
    const list = photosByRatio[ratio];
    if (list.length === 0) return;
    setCategoryIndices((prev) => ({
      ...prev,
      [ratio]: (prev[ratio] - 1 + list.length) % list.length,
    }));
  };

  const activeCategories = useMemo(() => {
    if (selectedRatio === 'all') {
      return ASPECT_RATIO_CATEGORIES;
    }
    return ASPECT_RATIO_CATEGORIES.filter((c) => c.id === selectedRatio);
  }, [selectedRatio]);

  return (
    <section
      id="mood-gallery"
      aria-label="Srinath Photography Portfolio"
      className="relative z-10 py-6 sm:py-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12"
    >
      {/* 1. HERO BANNER: "Capturing Every Ritual, Every Emotion." */}
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
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-mono tracking-widest uppercase bg-[#d48c29]/20 text-[#f59e0b] border border-[#d48c29]/40 mb-3">
                Master Portfolio · 150 Frames
              </span>
              <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-[#ebe0cc] leading-[1.12] tracking-tight">
                Capturing Every Ritual, Every Emotion.
              </h1>
            </div>
          </div>
        </div>
      )}

      {/* 2. ASPECT RATIO NAVIGATION BAR */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Grid className="w-5 h-5 text-[#d48c29]" />
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#ebe0cc]">
              Native Aspect Ratio Collections
            </h2>
          </div>
          <span className="text-xs font-mono text-[#c8a97e]/80">
            5 Ratios · 30 Dedicated Frames Each
          </span>
        </div>

        {/* Tab Pills for switching or viewing all */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedRatio('all')}
            className={`min-h-[38px] px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all cursor-pointer whitespace-nowrap ${
              selectedRatio === 'all'
                ? 'bg-[#d48c29] text-[#14110f] font-semibold shadow-md'
                : 'bg-[#1c1613] text-[#ebe0cc] border border-[#c8a97e]/40 hover:border-[#d48c29]'
            }`}
          >
            All Categories (150)
          </button>
          {ASPECT_RATIO_CATEGORIES.map((cat) => {
            const isActive = selectedRatio === cat.id;
            return (
              <button
                key={`tab-${cat.id}`}
                type="button"
                onClick={() => setSelectedRatio(cat.id)}
                className={`min-h-[38px] px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#d48c29] text-[#14110f] font-semibold shadow-md'
                    : 'bg-[#1c1613] text-[#ebe0cc] border border-[#c8a97e]/40 hover:border-[#d48c29]'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isActive ? 'bg-[#14110f]/30 text-[#14110f]' : 'bg-[#14110f] text-[#c8a97e]'
                  }`}
                >
                  {cat.id}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. CATEGORY SECTIONS (3-Photo Sliding Strip + Cascading 3D Stack for Each Aspect Ratio) */}
      <div className="space-y-16">
        {activeCategories.map((category) => {
          const ratio = category.id;
          const photos = photosByRatio[ratio] || [];
          const curIndex = categoryIndices[ratio] || 0;
          const trio = getSlidingWindow(photos, curIndex, 3);
          const total = photos.length;

          return (
            <div
              key={`category-section-${ratio}`}
              data-testid={`category-section-${ratio.replace(':', '-')}`}
              className="space-y-6 pt-8 border-t border-[#c8a97e]/20"
            >
              {/* Category Header */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-[#d48c29] ring-2 ring-[#c8a97e]/40" />
                  <div>
                    <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#ebe0cc]">
                      {category.label}
                    </h3>
                    <p className="text-xs text-[#c8a97e]/80 font-sans">
                      {category.subLabel} · Original {ratio} Proportions
                    </p>
                  </div>
                </div>

                {/* Left/Right Sliding Window Navigation */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[#c8a97e]/80 hidden sm:inline">
                    Frame {curIndex + 1}–{((curIndex + 2) % total) + 1} of {total}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePrevWindow(ratio)}
                      aria-label={`Previous photos in ${category.label}`}
                      className="w-9 h-9 rounded-full border border-[#c8a97e]/40 bg-[#1c1613] text-[#ebe0cc] hover:border-[#d48c29] hover:text-[#f59e0b] flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNextWindow(ratio)}
                      aria-label={`Next photos in ${category.label}`}
                      className="w-9 h-9 rounded-full border border-[#c8a97e]/40 bg-[#1c1613] text-[#ebe0cc] hover:border-[#d48c29] hover:text-[#f59e0b] flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 3-Photo Showcase in Exact Native Aspect Ratio (Shifts 1-by-1) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 items-start">
                {trio.map((photo, slotIdx) => (
                  <AspectRatioCard
                    key={`${photo.id}-slot-${slotIdx}`}
                    photo={photo}
                    aspectRatio={ratio}
                    testId={`photo-card-${ratio.replace(':', '-')}-${slotIdx}`}
                    onOpenFullscreen={onOpenFullscreen}
                  />
                ))}
              </div>

              {/* Interactive Single-Frame 3D Stack for this category */}
              <div className="pt-2">
                <InteractiveSingleStack
                  photos={photos}
                  aspectRatio={ratio}
                  sectionLabel={category.label}
                  testIdPrefix={`stack-${ratio.replace(':', '-')}`}
                  onOpenFullscreen={onOpenFullscreen}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};