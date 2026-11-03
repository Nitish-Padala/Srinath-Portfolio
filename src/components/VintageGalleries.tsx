import React, { useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Sparkles, Layers } from 'lucide-react';
import { PortfolioPhoto, getPhotosByRatio } from '../utils/portfolioLogic';
import { renderPhotoDataUrl } from '../utils/proceduralPhotos';

interface VintageGalleriesProps {
  allPhotos: PortfolioPhoto[];
  onOpenFullscreen: (photo: PortfolioPhoto) => void;
}

export const VintageGalleries: React.FC<VintageGalleriesProps> = ({
  allPhotos,
  onOpenFullscreen,
}) => {
  const photos16x9 = useMemo(() => getPhotosByRatio(allPhotos, '16:9'), [allPhotos]);
  const photos1x1 = useMemo(() => getPhotosByRatio(allPhotos, '1:1'), [allPhotos]);
  const photos3x4 = useMemo(() => getPhotosByRatio(allPhotos, '3:4'), [allPhotos]);
  const photos4x3 = useMemo(() => getPhotosByRatio(allPhotos, '4:3'), [allPhotos]);
  const photos9x16 = useMemo(() => getPhotosByRatio(allPhotos, '9:16'), [allPhotos]);

  // 16:9 Carousel state
  const [carousel16x9Index, setCarousel16x9Index] = useState(0);
  const total16x9 = photos16x9.length;
  const current16x9 = photos16x9[carousel16x9Index] || photos16x9[0];

  const handle16x9Next = () => {
    if (total16x9 === 0) return;
    setCarousel16x9Index((prev) => (prev + 1) % total16x9);
  };
  const handle16x9Prev = () => {
    if (total16x9 === 0) return;
    setCarousel16x9Index((prev) => (prev - 1 + total16x9) % total16x9);
  };

  // 9:16 Apple Recent Apps 3D Coverflow State
  const [coverflowIndex, setCoverflowIndex] = useState(0);
  const total9x16 = photos9x16.length;
  const touchStartXRef = useRef<number | null>(null);

  const handleCoverflowNext = () => {
    if (total9x16 === 0) return;
    setCoverflowIndex((prev) => (prev + 1) % total9x16);
  };
  const handleCoverflowPrev = () => {
    if (total9x16 === 0) return;
    setCoverflowIndex((prev) => (prev - 1 + total9x16) % total9x16);
  };

  const handleCoverflowTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleCoverflowTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    touchStartXRef.current = null;
    if (deltaX < -35) {
      handleCoverflowNext();
    } else if (deltaX > 35) {
      handleCoverflowPrev();
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* ============================================================== */}
      {/* 1. 16:9 CINEMATIC HORIZONTAL SWIPE CAROUSEL                    */}
      {/* ============================================================== */}
      <section id="gallery-16-9" aria-label="16:9 Cinematic Carousel" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#F5F0E6]">
              Cinematic Horizon Carousel
            </h2>
            <p className="text-xs text-[#C8A97E]/80 font-serif italic mt-0.5">
              16:9 panoramic widescreen wedding &amp; landscape narratives
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handle16x9Prev}
              aria-label="Previous 16:9 frame"
              className="w-10 h-10 rounded-full border border-[#C8A97E]/40 bg-[#3E2020]/40 text-[#F5F0E6] hover:bg-[#C85A43] hover:border-[#C85A43] flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handle16x9Next}
              aria-label="Next 16:9 frame"
              className="w-10 h-10 rounded-full border border-[#C8A97E]/40 bg-[#3E2020]/40 text-[#F5F0E6] hover:bg-[#C85A43] hover:border-[#C85A43] flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {current16x9 && (
          <div
            role="button"
            tabIndex={0}
            onClick={() => onOpenFullscreen(current16x9)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpenFullscreen(current16x9);
              }
            }}
            aria-label={`Open ${current16x9.title} in full screen`}
            className="group relative w-full aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden border border-[#C8A97E]/30 bg-[#18110E] shadow-2xl cursor-pointer focus:outline-none"
          >
            <img
              src={renderPhotoDataUrl(current16x9, 1400, 780)}
              alt={current16x9.title}
              style={{
                filter: current16x9.filterStyle || 'brightness(1.04) contrast(1.08) saturate(1.12)',
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#18110E]/85 via-transparent to-transparent pointer-events-none" />

            <div className="absolute bottom-4 sm:bottom-6 left-5 sm:left-8 right-5 sm:right-8 flex items-baseline justify-between">
              <span className="font-serif text-lg sm:text-2xl font-medium text-[#F5F0E6] truncate group-hover:text-[#C85A43] transition-colors">
                {current16x9.title}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-xs font-mono text-[#C8A97E]/80">
                <span>View Full Frame</span>
                <Maximize2 className="w-3.5 h-3.5 ml-1" />
              </span>
            </div>
          </div>
        )}
      </section>

      {/* ============================================================== */}
      {/* 2. 1:1 SEAMLESS SQUARE MOSAIC                                  */}
      {/* ============================================================== */}
      <section id="gallery-1-1" aria-label="1:1 Square Mosaic" className="space-y-6">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#F5F0E6]">
            Fine Art &amp; Symmetrical Studios
          </h2>
          <p className="text-xs text-[#C8A97E]/80 font-serif italic mt-0.5">
            1:1 seamless square mosaic of sacred rituals and floral geometry
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          {photos1x1.slice(0, 8).map((photo) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => onOpenFullscreen(photo)}
              aria-label={`Open ${photo.title} in full screen`}
              className="group relative aspect-square rounded-xl overflow-hidden border border-[#C8A97E]/30 bg-[#18110E] shadow-md hover:border-[#C85A43] transition-all cursor-pointer text-left focus:outline-none"
            >
              <img
                src={renderPhotoDataUrl(photo, 700, 700)}
                alt={photo.title}
                loading="lazy"
                style={{
                  filter: photo.filterStyle || 'brightness(1.04) contrast(1.08) saturate(1.12)',
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#18110E]/80 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-2.5 left-3 right-3">
                <span className="font-serif text-xs sm:text-sm font-medium text-[#F5F0E6] truncate block group-hover:text-[#C85A43] transition-colors">
                  {photo.title}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. 3:4 & 4:3 STAGGERED MASONRY LAYOUT                          */}
      {/* ============================================================== */}
      <section id="gallery-masonry" aria-label="Staggered Masonry" className="space-y-6">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#F5F0E6]">
            Bridal Portraits &amp; Documentary Frames
          </h2>
          <p className="text-xs text-[#C8A97E]/80 font-serif italic mt-0.5">
            3:4 vertical portraits and 4:3 classic documentary frames in editorial masonry
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 items-start">
          {/* Column 1: Vertical 3:4 card */}
          {photos3x4[0] && (
            <button
              type="button"
              onClick={() => onOpenFullscreen(photos3x4[0])}
              className="group relative w-full aspect-[3/4] rounded-2xl overflow-hidden border border-[#C8A97E]/30 bg-[#18110E] shadow-lg hover:border-[#C85A43] transition-all cursor-pointer text-left focus:outline-none"
            >
              <img
                src={renderPhotoDataUrl(photos3x4[0], 800, 1060)}
                alt={photos3x4[0].title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#18110E]/85 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <span className="font-serif text-sm font-medium text-[#F5F0E6] truncate block">
                  {photos3x4[0].title}
                </span>
              </div>
            </button>
          )}

          {/* Column 2: Stacked 4:3 cards */}
          <div className="space-y-3 sm:space-y-4">
            {photos4x3.slice(0, 2).map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => onOpenFullscreen(photo)}
                className="group relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-[#C8A97E]/30 bg-[#18110E] shadow-lg hover:border-[#C85A43] transition-all cursor-pointer text-left focus:outline-none block"
              >
                <img
                  src={renderPhotoDataUrl(photo, 800, 600)}
                  alt={photo.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#18110E]/85 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <span className="font-serif text-sm font-medium text-[#F5F0E6] truncate block">
                    {photo.title}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Column 3: Another vertical 3:4 card */}
          {photos3x4[1] && (
            <button
              type="button"
              onClick={() => onOpenFullscreen(photos3x4[1])}
              className="group relative w-full aspect-[3/4] rounded-2xl overflow-hidden border border-[#C8A97E]/30 bg-[#18110E] shadow-lg hover:border-[#C85A43] transition-all cursor-pointer text-left focus:outline-none hidden lg:block"
            >
              <img
                src={renderPhotoDataUrl(photos3x4[1], 800, 1060)}
                alt={photos3x4[1].title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#18110E]/85 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <span className="font-serif text-sm font-medium text-[#F5F0E6] truncate block">
                  {photos3x4[1].title}
                </span>
              </div>
            </button>
          )}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. 9:16 'APPLE RECENT APPS'-INSPIRED 3D COVERFLOW SWIPER       */}
      {/* ============================================================== */}
      <section
        id="gallery-9-16"
        aria-label="9:16 Apple Recent Apps Carousel"
        className="rounded-[32px] p-6 sm:p-10 bg-[#EAE0D5] text-[#3E2020] shadow-2xl border border-[#C8A97E]/40 space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-mono tracking-widest uppercase bg-[#C85A43]/15 text-[#C85A43] font-semibold mb-2">
              9:16 'Apple Recent Apps' Swiper
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-semibold text-[#3E2020] tracking-tight">
              3D-Perspective Coverflow Carousel
            </h2>
            <p className="text-xs text-[#3E2020]/75 font-serif italic mt-1">
              Swipe horizontally or click arrows to cycle through vertical cinematic stories
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCoverflowPrev}
              aria-label="Previous story in 3D coverflow"
              className="w-10 h-10 rounded-full border border-[#3E2020]/30 bg-white/70 text-[#3E2020] hover:bg-[#C85A43] hover:text-white hover:border-[#C85A43] flex items-center justify-center transition-all cursor-pointer shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleCoverflowNext}
              aria-label="Next story in 3D coverflow"
              className="w-10 h-10 rounded-full border border-[#3E2020]/30 bg-white/70 text-[#3E2020] hover:bg-[#C85A43] hover:text-white hover:border-[#C85A43] flex items-center justify-center transition-all cursor-pointer shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3D Coverflow Viewport */}
        <div
          className="relative w-full h-[460px] sm:h-[520px] rounded-2xl overflow-hidden flex items-center justify-center select-none perspective-1400"
          onTouchStart={handleCoverflowTouchStart}
          onTouchEnd={handleCoverflowTouchEnd}
        >
          {/* Render 5 cascading cards in 3D depth */}
          {[-2, -1, 0, 1, 2].map((offset) => {
            const cardIdx = (coverflowIndex + offset + total9x16) % total9x16;
            const photo = photos9x16[cardIdx];
            if (!photo) return null;

            const isCenter = offset === 0;
            // Precise 3D Coverflow positioning
            const translateX = offset * 110;
            const translateZ = -Math.abs(offset) * 80;
            const rotateY = offset * -22;
            const scale = 1 - Math.abs(offset) * 0.12;
            const opacity = 1 - Math.abs(offset) * 0.25;
            const zIndex = 20 - Math.abs(offset);

            return (
              <div
                key={`coverflow-card-${photo.id}-${offset}`}
                style={{
                  transform: `translate3d(${translateX}px, 0px, ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                  opacity,
                  zIndex,
                  transition: 'transform 420ms cubic-bezier(0.16, 1, 0.3, 1), opacity 420ms ease-out',
                }}
                className={`absolute w-[220px] sm:w-[260px] aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl bg-[#18110E] border-2 cursor-pointer transition-shadow ${
                  isCenter
                    ? 'border-[#C85A43] shadow-[0_20px_40px_rgba(62,32,32,0.35)]'
                    : 'border-white/50 opacity-80'
                }`}
                onClick={() => {
                  if (isCenter) {
                    onOpenFullscreen(photo);
                  } else {
                    setCoverflowIndex(cardIdx);
                  }
                }}
              >
                <img
                  src={renderPhotoDataUrl(photo, 600, 1060)}
                  alt={photo.title}
                  loading={isCenter ? 'eager' : 'lazy'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#18110E]/90 via-transparent to-transparent pointer-events-none" />

                <div className="absolute bottom-3 left-3 right-3 text-left">
                  <span className="font-serif text-sm font-medium text-[#F5F0E6] truncate block">
                    {photo.title}
                  </span>
                  {isCenter && (
                    <span className="text-[10px] font-mono text-[#C8A97E] uppercase tracking-wider block mt-0.5">
                      Tap to Expand
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
