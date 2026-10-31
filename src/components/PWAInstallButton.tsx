import React, { useState } from 'react';
import { Download, WifiOff, X } from 'lucide-react';
import { usePWAInstall, useOnlineStatus } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (isInstallable) {
            install();
          } else {
            setShowGuide(true);
          }
        }}
        className="min-h-[40px] px-3.5 py-2 text-xs font-medium text-zinc-200 bg-zinc-900 border border-zinc-700 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
        aria-label="Install Offline App"
      >
        <Download className="w-3.5 h-3.5 text-amber-400" />
        <span>{isIOS ? 'Install on iOS' : 'Install App'}</span>
      </button>

      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-install-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 id="pwa-install-title" className="text-lg font-semibold text-white">
                Install Srinath 3D Portfolio
              </h3>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-zinc-400 hover:text-white"
                aria-label="Close install guide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="mt-3 text-sm text-zinc-300 leading-relaxed">
              Install Srinath&apos;s portfolio on your home screen for instant offline access to all 50 mood-curated photographs and the 3D Orb Gallery:
            </p>
            <div className="mt-4 space-y-2 text-xs text-zinc-400 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
              <p>1. On Mobile Safari/Chrome: Tap the browser <strong>Share</strong> or <strong>Menu (⋮)</strong> button.</p>
              <p>2. Select <strong>Add to Home Screen</strong> or <strong>Install App</strong>.</p>
              <p>3. Use the <strong>Offline Instant Cache</strong> button in the gallery toolbar to pre-store all 50 high-res frames.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="mt-5 w-full min-h-[44px] rounded-xl bg-amber-500 text-black font-semibold text-sm hover:bg-amber-400 transition-colors"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-20 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-semibold text-black shadow-lg"
    >
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>Offline Mode Active — Serving Cached Portfolio Frames</span>
    </div>
  );
};
