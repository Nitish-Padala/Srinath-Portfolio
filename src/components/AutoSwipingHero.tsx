import React, { useEffect, useState } from 'react';
import { PortfolioPhoto } from '../utils/portfolioLogic';
import { renderPhotoDataUrl } from '../utils/proceduralPhotos';

interface AutoSwipingHeroProps {
  photos: PortfolioPhoto[];
  onOpenFullscreen: (photo: PortfolioPhoto) => void;
}

export const AutoSwipingHero: React.FC<AutoSwipingHeroProps> = ({
  photos,
  onOpenFullscreen,
}) => {
  // Use first 5 signature photographs for hero showcase
  const heroSlides = photos.slice(0, 5);
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-play interval: 5 seconds with cross-fade
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [heroSlides.length]);

  const currentPhoto = heroSlides[activeIndex] || photos[0];
  if (!currentPhoto) return null;

  // Metadata tags for the slides
  const slideMetadata = [
    'Mylapore, Chennai | 50mm f/1.2',
    'Kalyanam Mandap | 85mm f/1.4',
    'Thanjavur Palace | 35mm f/1.4',
    'Twilight Courtyard | 50mm f/1.2',
    'Sacred Vows | 85mm f/1.4',
  ];

  const currentMeta = slideMetadata[activeIndex % slideMetadata.length];

  return (
    <section
      id="hero-section"
      aria-label="Hero Showcase"
      className="relative z-10 py-6 sm:py-10 max-w-4xl mx-auto px-4 sm:px-6"
    >
      {/* Mobile-first high-fidelity device frame */}
      <div className="relative rounded-[32px] sm:rounded-[40px] p-2 sm:p-3 bg-gradient-to-b from-[#3E2020] via-[#2A1614] to-[#18110E] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] border border-[#C8A97E]/30">
        <div
          role="button"
          tabIndex={0}
          onClick={() => onOpenFullscreen(currentPhoto)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenFullscreen(currentPhoto);
            }
          }}
          aria-label={`Open ${currentPhoto.title} in full screen`}
          className="group relative h-[560px] sm:h-[640px] w-full rounded-[24px] sm:rounded-[32px] overflow-hidden bg-[#18110E] cursor-pointer focus:outline-none"
        >
          {/* Fading cross-play background slides */}
          {heroSlides.map((photo, idx) => {
            const isCurrent = idx === activeIndex;
            return (
              <div
                key={`hero-slide-${photo.id}`}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <img
                  src={renderPhotoDataUrl(photo, 1400, 1000)}
                  alt={photo.title}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  style={{
                    filter: photo.filterStyle || 'brightness(1.02) contrast(1.08) saturate(1.10)',
                    objectPosition: '50% 28%',
                  }}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                />
              </div>
            );
          })}

          {/* Luxury Vintage Romance Vignette & Gradients */}
          <div className="absolute inset-0 z-15 bg-gradient-to-t from-[#18110E] via-[#18110E]/30 to-transparent pointer-events-none" />
          <div className="absolute inset-0 z-15 bg-gradient-to-r from-[#18110E]/70 via-transparent to-transparent pointer-events-none" />

          {/* Large Cinematic Typography Overlay */}
          <div className="absolute inset-x-0 bottom-12 sm:bottom-14 z-20 px-6 sm:px-10 max-w-xl text-left pointer-events-none">
            {/* Metadata specification tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3E2020]/80 border border-[#C8A97E]/40 text-[#EAE0D5] text-[11px] sm:text-xs font-mono tracking-wider uppercase mb-3 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C85A43] animate-pulse" />
              <span>{currentMeta}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-semibold text-[#F5F0E6] leading-[1.10] tracking-tight">
              Capturing Every Ritual, Every Emotion
            </h1>
          </div>

          {/* Pagination indicator dots */}
          <div className="absolute bottom-4 sm:bottom-5 inset-x-0 z-20 flex items-center justify-center gap-2 pointer-events-auto">
            {heroSlides.map((slide, dotIdx) => {
              const isActive = dotIdx === activeIndex;
              return (
                <button
                  key={`dot-${slide.id}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex(dotIdx);
                  }}
                  aria-label={`Go to slide ${dotIdx + 1}`}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    isActive
                      ? 'w-6 h-2 bg-[#F5F0E6] shadow-sm'
                      : 'w-2 h-2 bg-[#EAE0D5]/40 hover:bg-[#EAE0D5]'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
