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
import { SpringBreezeBackground3D } from './components/SpringBreezeBackground3D';
import { RecentTabsGallery } from './components/RecentTabsGallery';
import { OrbGlobeGallery3D } from './components/OrbGlobeGallery3D';
import { BookingFooter } from './components/BookingFooter';

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
  const [contactConfig, setContactConfig] = useState<BookingContactConfig>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem('srinath_contact_config');
        if (raw) return JSON.parse(raw);
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

  const handleUpdateContactConfig = (newCfg: BookingContactConfig) => {
    setContactConfig(newCfg);
    try {
      window.localStorage.setItem('srinath_contact_config', JSON.stringify(newCfg));
    } catch {
      // Ignore storage error
    }
  };

  const swipeVisual = computeSwipeVisualTransform(
    dismissDirection === 'up' ? -420 : dismissDirection === 'down' ? 420 : swipeDeltaY
  );

  return (
    <div
      className="min-h-screen bg-[#14110f] text-[#ebe0cc] flex flex-col relative"
      data-state={fullscreenPhoto ? 'fullscreen-photo' : 'recent-tabs'}
      data-last-haptic={lastHapticEvent}
    >
      {/* Option 5 Dark Charcoal, Saffron Gold & Mandala Ember 3D Atmosphere */}
      <SpringBreezeBackground3D />

      {/* Top Sticky Header: ONLY "Srinath" and "Inquire & Book" in Option 5 Palette */}
      <header className="sticky top-0 z-30 h-16 px-4 sm:px-6 lg:px-8 bg-[#14110f]/95 border-b border-[#c8a97e]/30 backdrop-blur-md flex items-center justify-between">
        <a
          href="#"
          className="font-serif text-2xl sm:text-3xl font-semibold tracking-wide text-[#ebe0cc] hover:text-[#d48c29] transition-colors whitespace-nowrap shrink-0"
        >
          Srinath
        </a>

        <a
          href="#booking-contact"
          className="min-h-[38px] px-5 py-1.5 text-xs font-medium tracking-wider text-[#ebe0cc] bg-[#1c1613] border border-[#c8a97e]/65 rounded-full hover:bg-[#d48c29] hover:text-[#14110f] hover:border-[#d48c29] transition-all flex items-center whitespace-nowrap shrink-0 shadow-sm"
        >
          Inquire &amp; Book
        </a>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10">
        {/* 1. Option 5 Storyteller's Cinematic Grid + 4 Mood Story Rows (108 Images Total) */}
        <RecentTabsGallery
          allPhotos={allPhotos}
          onOpenFullscreen={(photo) => setFullscreenPhoto(photo)}
        />

        {/* 2. 108-Photo Tightly Packed Low-Key 3D Photo Globe */}
        <OrbGlobeGallery3D
          photos={allPhotos}
          onSelectPhotoFullscreen={(photo) => setFullscreenPhoto(photo)}
        />
      </main>

      {/* 3. Direct Booking & Commission Concierge Section */}
      <BookingFooter
        contactConfig={contactConfig}
        onUpdateContactConfig={handleUpdateContactConfig}
      />

      {/* FULL-SCREEN PHOTO VIEWER OVERLAY (Click Anywhere or Swipe Up/Down to Close) */}
      {fullscreenPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={fullscreenPhoto.title}
          data-testid="fullscreen-photo-overlay"
          data-swipe-threshold={swipeVisual.thresholdReached ? 'reached' : 'idle'}
          style={{
            backgroundColor: `rgba(16, 13, 11, ${swipeVisual.backdropOpacity})`,
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
          {/* Top Bar: Photo Name Only */}
          <div className="max-w-4xl w-full mx-auto flex flex-col items-center gap-1.5 pointer-events-none">
            <div
              className={`w-12 h-1.5 rounded-full transition-colors ${
                swipeVisual.thresholdReached ? 'bg-[#f59e0b]' : 'bg-[#c8a97e]/40'
              }`}
            />
            <div className="text-xs sm:text-sm font-serif text-[#ebe0cc]/90">
              <span>{fullscreenPhoto.title}</span>
            </div>
          </div>

          {/* Center Full-Resolution Uncropped Photograph in Exact Original Size */}
          <div
            data-testid="fullscreen-photo-card"
            style={{
              transform: `translate3d(0px, ${swipeVisual.translateY}px, 0px) scale(${swipeVisual.scale})`,
              opacity: dismissDirection ? 0 : 1,
              transition: isDraggingFullscreen
                ? 'none'
                : 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1), opacity 160ms ease-out',
            }}
            className="my-auto max-w-5xl w-full mx-auto overflow-hidden rounded-2xl border border-[#c8a97e]/45 shadow-2xl bg-[#120e0c] pointer-events-none flex items-center justify-center p-2 sm:p-4"
          >
            <img
              src={renderPhotoDataUrl(fullscreenPhoto, 1280, 860)}
              alt={fullscreenPhoto.title}
              draggable={false}
              style={{
                filter: fullscreenPhoto.filterStyle,
              }}
              className="w-auto h-auto max-h-[82vh] max-w-full object-contain mx-auto rounded-lg"
            />
          </div>

          <div className="h-4 pointer-events-none" />
        </div>
      )}
    </div>
  );
}
