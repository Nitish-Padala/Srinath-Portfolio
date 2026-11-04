/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  BookingContactConfig,
  DEFAULT_CONTACT_CONFIG,
  HapticFeedbackType,
  PortfolioPhoto,
  computeSwipeVisualTransform,
  evaluateFullscreenSwipeGesture,
  generateInitial150Photos,
  shouldTriggerThresholdHaptic,
  triggerHapticFeedback,
} from './utils/portfolioLogic';
import {
  renderPhotoDataUrl,
  warmCacheSilently,
} from './utils/proceduralPhotos';
import { GlobalHeader } from './components/GlobalHeader';
import { AutoSwipingHero } from './components/AutoSwipingHero';
import { VintageGalleries } from './components/VintageGalleries';
import { OrbGlobeGallery3D } from './components/OrbGlobeGallery3D';
import { ViewfinderBioContact } from './components/ViewfinderBioContact';

export default function App() {
  const [allPhotos] = useState<PortfolioPhoto[]>(() => generateInitial150Photos());
  const [fullscreenPhoto, setFullscreenPhoto] = useState<PortfolioPhoto | null>(null);

  // Fullscreen Swipe-to-Dismiss gesture & haptic state
  const [swipeDeltaY, setSwipeDeltaY] = useState<number>(0);
  const [isDraggingFullscreen, setIsDraggingFullscreen] = useState<boolean>(false);
  const [dismissDirection, setDismissDirection] = useState<'up' | 'down' | null>(null);
  const [lastHapticEvent, setLastHapticEvent] = useState<HapticFeedbackType | 'none'>('none');
  const prevDeltaYRef = useRef<number>(0);
  const gestureStartRef = useRef<{ x: number; y: number; time: number; active: boolean }>({
    x: 0,
    y: 0,
    time: 0,
    active: false,
  });

  // Contact Config persisted in localStorage
  const [contactConfig] = useState<BookingContactConfig>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem('srinath_contact_config');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.phone && !parsed.phone.includes('98480')) {
            return parsed;
          }
        }
      } catch {
        // Ignore storage error
      }
    }
    return DEFAULT_CONTACT_CONFIG;
  });

  // Silent background cache warm-up for fast loading
  useEffect(() => {
    const id = window.setTimeout(() => {
      warmCacheSilently(allPhotos);
    }, 300);
    return () => window.clearTimeout(id);
  }, [allPhotos]);

  // Reset swipe state when fullscreenPhoto changes & bind Escape key
  useEffect(() => {
    setSwipeDeltaY(0);
    prevDeltaYRef.current = 0;
    setIsDraggingFullscreen(false);
    setDismissDirection(null);

    if (!fullscreenPhoto) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFullscreenPhoto(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullscreenPhoto]);

  const fireHaptic = (type: HapticFeedbackType) => {
    triggerHapticFeedback(type);
    setLastHapticEvent(type);
  };

  const handleExitFullscreen = (animatedDir?: 'up' | 'down') => {
    if (animatedDir) {
      setDismissDirection(animatedDir);
      setIsDraggingFullscreen(false);
      window.setTimeout(() => {
        setFullscreenPhoto(null);
        setDismissDirection(null);
        setSwipeDeltaY(0);
        prevDeltaYRef.current = 0;
      }, 160);
    } else {
      setFullscreenPhoto(null);
      setDismissDirection(null);
      setSwipeDeltaY(0);
      prevDeltaYRef.current = 0;
    }
  };

  // Touch & Pointer gesture handlers for Fullscreen Swipe-to-Dismiss (Up or Down) with Haptic Feedback
  const beginFullscreenGesture = (clientX: number, clientY: number) => {
    gestureStartRef.current = {
      x: clientX,
      y: clientY,
      time: performance.now(),
      active: true,
    };
    prevDeltaYRef.current = 0;
    setIsDraggingFullscreen(true);
  };

  const moveFullscreenGesture = (clientY: number) => {
    if (!gestureStartRef.current.active) return;
    const dy = clientY - gestureStartRef.current.y;
    if (shouldTriggerThresholdHaptic(prevDeltaYRef.current, dy)) {
      fireHaptic('threshold-tick');
    }
    prevDeltaYRef.current = dy;
    setSwipeDeltaY(dy);
  };

  const endFullscreenGesture = (clientX: number, clientY: number) => {
    if (!gestureStartRef.current.active) return;
    const dx = clientX - gestureStartRef.current.x;
    const dy = clientY - gestureStartRef.current.y;
    const elapsed = performance.now() - gestureStartRef.current.time;
    gestureStartRef.current.active = false;
    setIsDraggingFullscreen(false);

    const evaluation = evaluateFullscreenSwipeGesture(dy, dx, elapsed);
    if (evaluation.shouldDismiss) {
      if (evaluation.direction === 'up' || evaluation.direction === 'down') {
        fireHaptic('swipe-dismiss');
        handleExitFullscreen(evaluation.direction);
      } else {
        fireHaptic('tap-dismiss');
        handleExitFullscreen();
      }
    } else {
      if (Math.abs(dy) > 12) {
        fireHaptic('snap-back');
      }
      prevDeltaYRef.current = 0;
      setSwipeDeltaY(0);
    }
  };

  const swipeVisual = computeSwipeVisualTransform(
    dismissDirection === 'up' ? -420 : dismissDirection === 'down' ? 420 : swipeDeltaY
  );

  return (
    <div
      className="min-h-screen bg-[#F5F0E6] text-[#3E2020] flex flex-col relative font-sans selection:bg-[#C85A43] selection:text-[#F5F0E6]"
      data-state={fullscreenPhoto ? 'fullscreen-photo' : 'vintage-romance'}
      data-last-haptic={lastHapticEvent}
    >
      {/* 1. COVER & BRANDING HEADER (Blueprint Panel 1 & 2) */}
      <GlobalHeader
        phone={contactConfig.phone}
        whatsapp={contactConfig.whatsapp}
      />

      {/* MAIN REDESIGN BODY IN LUXURY SOFT CREAM PALETTE */}
      <main className="flex-1 relative z-10 space-y-12 sm:space-y-20 pb-16">
        {/* 2. AUTO-SWIPING HERO & GLOBAL HEADER (Blueprint Panel 2) */}
        <AutoSwipingHero
          photos={allPhotos}
          onOpenFullscreen={(photo) => setFullscreenPhoto(photo)}
        />

        {/* 3. RATIO-SPECIFIC GALLERIES & APPLE RECENT APPS 'SWIPER' (Blueprint Panel 3) */}
        <VintageGalleries
          allPhotos={allPhotos}
          onOpenFullscreen={(photo) => setFullscreenPhoto(photo)}
        />

        {/* 4. THE 3D PHOTO GLOBE (Blueprint Panel 4 - Strict 360° No-Zoom / No-Pan) */}
        <OrbGlobeGallery3D
          photos={allPhotos}
          onSelectPhotoFullscreen={(photo) => setFullscreenPhoto(photo)}
        />

        {/* 5. VIEWFINDER BIO & VIP CONTACT HUB (Blueprint Panel 5) */}
        <ViewfinderBioContact
          photos={allPhotos}
          contactConfig={contactConfig}
          onOpenFullscreen={(photo) => setFullscreenPhoto(photo)}
        />
      </main>

      {/* LUXURY EDITORIAL FOOTER */}
      <footer className="relative z-10 border-t border-[#EAE0D5] bg-[#EAE0D5]/50 py-10 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-2">
          <p className="font-serif text-xl sm:text-2xl text-[#3E2020] font-semibold tracking-wide">
            Srinath Photography
          </p>
          <div className="text-xs font-mono text-[#3E2020]/60 pt-1">
            &copy; {new Date().getFullYear()} Srinath Photography. All rights reserved.
          </div>
        </div>
      </footer>

      {/* FULL-SCREEN ORIGINAL UNTRUNCATED PHOTO VIEWER MODAL */}
      {fullscreenPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={fullscreenPhoto.title}
          data-testid="fullscreen-photo-overlay"
          data-swipe-threshold={swipeVisual.thresholdReached ? 'reached' : 'idle'}
          style={{
            backgroundColor: `rgba(62, 32, 32, ${swipeVisual.backdropOpacity * 0.95})`,
            touchAction: 'none',
          }}
          onPointerDown={(e) => beginFullscreenGesture(e.clientX, e.clientY)}
          onPointerMove={(e) => moveFullscreenGesture(e.clientY)}
          onPointerUp={(e) => endFullscreenGesture(e.clientX, e.clientY)}
          onPointerCancel={() => {
            gestureStartRef.current.active = false;
            setIsDraggingFullscreen(false);
            setSwipeDeltaY(0);
          }}
          onTouchStart={(e) => {
            if (e.touches.length === 1) {
              beginFullscreenGesture(e.touches[0].clientX, e.touches[0].clientY);
            }
          }}
          onTouchMove={(e) => {
            if (e.touches.length === 1) {
              moveFullscreenGesture(e.touches[0].clientY);
            }
          }}
          onTouchEnd={(e) => {
            if (e.changedTouches.length === 1) {
              endFullscreenGesture(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
            }
          }}
          onClick={() => {
            if (!isDraggingFullscreen && Math.abs(swipeDeltaY) < 12) {
              fireHaptic('tap-dismiss');
              handleExitFullscreen();
            }
          }}
          className="fixed inset-0 z-50 flex flex-col justify-between p-4 sm:p-8 cursor-pointer select-none overflow-hidden"
        >
          {/* Top Bar: Slide Dismiss Pill & Frame Info */}
          <div className="max-w-4xl w-full mx-auto flex flex-col items-center gap-1.5 pointer-events-none">
            <div
              className={`w-12 h-1.5 rounded-full transition-colors ${
                swipeVisual.thresholdReached ? 'bg-[#C85A43]' : 'bg-[#EAE0D5]/50'
              }`}
            />
            <div className="text-xs sm:text-sm font-serif text-[#F5F0E6] flex items-center gap-2">
              <span className="font-semibold">{fullscreenPhoto.title}</span>
              <span className="text-[#EAE0D5]/60">·</span>
              <span className="text-[11px] font-mono text-[#C85A43] uppercase tracking-wider font-bold">
                {fullscreenPhoto.aspectRatio}
              </span>
            </div>
          </div>

          {/* Center Full-Resolution Uncropped Photograph in Exact Original Aspect Ratio */}
          <div
            data-testid="fullscreen-photo-card"
            style={{
              transform: `translate3d(0px, ${swipeVisual.translateY}px, 0px) scale(${swipeVisual.scale})`,
              opacity: dismissDirection ? 0 : 1,
              transition: isDraggingFullscreen
                ? 'none'
                : 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1), opacity 160ms ease-out',
            }}
            className="my-auto max-w-5xl w-full mx-auto overflow-hidden rounded-2xl border border-[#EAE0D5]/30 shadow-2xl bg-[#18110E] pointer-events-none flex items-center justify-center p-2 sm:p-4"
          >
            <img
              src={renderPhotoDataUrl(fullscreenPhoto, 1280, 860)}
              alt={fullscreenPhoto.title}
              draggable={false}
              style={{
                filter: fullscreenPhoto.filterStyle,
              }}
              className="w-auto h-auto max-h-[82vh] max-w-full object-contain mx-auto rounded-lg shadow-lg"
            />
          </div>

          {/* Bottom Bar: Quick Hint */}
          <div className="text-center pointer-events-none">
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#EAE0D5]/70">
              Tap anywhere or swipe up/down to return
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
