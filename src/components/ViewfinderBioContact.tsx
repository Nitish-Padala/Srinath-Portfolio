import React, { useState } from 'react';
import {
  Camera,
  Battery,
  Disc,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageCircle,
  Calendar,
  Send,
  Sparkles,
} from 'lucide-react';
import {
  BookingContactConfig,
  PortfolioPhoto,
  buildTelUrl,
  buildWhatsAppUrl,
  validateBookingInquiry,
} from '../utils/portfolioLogic';
import { renderPhotoDataUrl } from '../utils/proceduralPhotos';

interface ViewfinderBioContactProps {
  photos: PortfolioPhoto[];
  contactConfig: BookingContactConfig;
  onOpenFullscreen: (photo: PortfolioPhoto) => void;
}

export const ViewfinderBioContact: React.FC<ViewfinderBioContactProps> = ({
  photos,
  contactConfig,
  onOpenFullscreen,
}) => {
  // Viewfinder camera states
  const [shutterFlashing, setShutterFlashing] = useState(false);
  const [activeMode, setActiveMode] = useState<'PHOTO' | 'PORTRAIT' | 'PRO'>('PORTRAIT');
  const [viewfinderPhotoIndex, setViewfinderPhotoIndex] = useState(0);

  // Polaroid stack state (Tinder-style)
  const [polaroidIndex, setPolaroidIndex] = useState(0);
  const polaroidPhotos = photos.slice(0, 12);
  const totalPolaroids = polaroidPhotos.length;

  // Booking form state
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const viewfinderPhoto = photos[viewfinderPhotoIndex % photos.length] || photos[0];

  const handleShutterClick = () => {
    setShutterFlashing(true);
    // Cycle to next photograph in viewfinder
    window.setTimeout(() => {
      setViewfinderPhotoIndex((prev) => (prev + 1) % photos.length);
      setShutterFlashing(false);
    }, 180);
  };

  const handleNextPolaroid = () => {
    if (totalPolaroids === 0) return;
    setPolaroidIndex((prev) => (prev + 1) % totalPolaroids);
  };

  const handlePrevPolaroid = () => {
    if (totalPolaroids === 0) return;
    setPolaroidIndex((prev) => (prev - 1 + totalPolaroids) % totalPolaroids);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateBookingInquiry({
      clientName,
      eventDate,
      eventType: clientContact || 'Wedding Shoot',
      notes,
    });
    if (!validation.valid) {
      setFormError(validation.error || 'Please fill in required fields.');
      return;
    }
    setFormError(null);
    setSubmitted(true);
  };

  const currentPolaroid = polaroidPhotos[polaroidIndex % totalPolaroids] || photos[0];

  return (
    <section
      id="vip-contact"
      aria-label="Viewfinder Bio and VIP Contact Hub"
      className="relative z-10 py-12 sm:py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12"
    >
      {/* Section Title */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="inline-block px-3 py-1 rounded-full text-[11px] font-mono tracking-widest uppercase bg-[#C85A43]/15 text-[#C85A43] font-semibold">
          Section 5 · Page 5 Blueprint
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl font-semibold text-[#F5F0E6]">
          Viewfinder Bio &amp; VIP Contact Hub
        </h2>
        <p className="text-xs sm:text-sm text-[#C8A97E]/80 font-serif italic">
          Authentic camera interface overlay · Tinder-style polaroids · Direct concierge booking
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* ============================================================== */}
        {/* 1. CAMERA VIEW-FINDER ANIMATION OVERLAY                        */}
        {/* ============================================================== */}
        <div className="relative rounded-[32px] p-2 sm:p-3 bg-gradient-to-b from-[#3E2020] via-[#241312] to-[#18110E] border border-[#C8A97E]/30 shadow-2xl">
          <div className="relative h-[560px] sm:h-[620px] rounded-[24px] overflow-hidden bg-black flex flex-col justify-between">
            {/* Camera Viewfinder Screen Content */}
            <div className="absolute inset-0 z-0">
              <img
                src={renderPhotoDataUrl(viewfinderPhoto, 900, 1200)}
                alt={viewfinderPhoto.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/25 pointer-events-none" />
            </div>

            {/* Viewfinder Rule-of-Thirds Grid */}
            <div className="absolute inset-0 z-10 viewfinder-grid pointer-events-none" />

            {/* Shutter flash animation overlay */}
            {shutterFlashing && (
              <div className="absolute inset-0 z-30 bg-white animate-out fade-out duration-200 pointer-events-none" />
            )}

            {/* Top Camera HUD Bar */}
            <div className="relative z-20 px-4 py-3 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between text-[11px] font-mono text-[#F5F0E6] select-none">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="tracking-widest uppercase">REC</span>
                <span className="text-[#C8A97E] border-l border-white/20 pl-2">RAW+FINE</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px]">ISO 400</span>
                <span>f/1.4</span>
                <span>1/250s</span>
                <Battery className="w-4 h-4 text-emerald-400" />
              </div>
            </div>

            {/* Center Pulsing Autofocus Brackets [   ] */}
            <div className="relative z-20 flex-1 flex items-center justify-center pointer-events-none">
              <div className="relative w-36 h-36 border border-emerald-400/50 rounded-lg flex items-center justify-center animate-pulse">
                {/* 4 Corner tick marks */}
                <span className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-emerald-400" />
                <span className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-emerald-400" />
                <span className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-emerald-400" />
                <span className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-emerald-400" />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
            </div>

            {/* Bottom Camera Controls & Shutter Bar */}
            <div className="relative z-20 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col gap-3">
              {/* Camera Modes Dial */}
              <div className="flex items-center justify-center gap-6 text-[11px] font-mono tracking-widest text-[#EAE0D5]/70">
                {(['PHOTO', 'PORTRAIT', 'PRO'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setActiveMode(mode)}
                    className={`cursor-pointer transition-colors ${
                      activeMode === mode
                        ? 'text-[#F5F0E6] font-bold border-b border-[#C85A43] pb-0.5'
                        : 'hover:text-[#F5F0E6]'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {/* Shutter Button Row */}
              <div className="flex items-center justify-between px-4">
                {/* Corner Thumbnail Preview */}
                <button
                  type="button"
                  onClick={() => onOpenFullscreen(viewfinderPhoto)}
                  aria-label="Inspect active viewfinder photo"
                  className="w-11 h-11 rounded-lg overflow-hidden border border-[#C8A97E]/60 bg-black cursor-pointer shadow-md"
                >
                  <img
                    src={renderPhotoDataUrl(viewfinderPhoto, 120, 120)}
                    alt="Active thumbnail"
                    className="w-full h-full object-cover"
                  />
                </button>

                {/* Main Shutter Release Button */}
                <button
                  type="button"
                  onClick={handleShutterClick}
                  aria-label="Trigger camera shutter click"
                  className="w-16 h-16 rounded-full border-4 border-white/80 bg-white/20 p-1 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                >
                  <div className="w-full h-full rounded-full bg-white shadow-inner" />
                </button>

                {/* Info Spec indicator */}
                <div className="text-right text-[10px] font-mono text-[#C8A97E]/80">
                  <div>50mm f/1.2</div>
                  <div className="text-[#EAE0D5]/60">Srinath Eye-AF</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. TIERED VIP CONTACT HUB & SWIPEABLE POLAROIDS                 */}
        {/* ============================================================== */}
        <div className="space-y-6">
          {/* 'Tinder-style' Swipeable Polaroids Deck */}
          <div className="rounded-[28px] p-6 bg-[#EAE0D5] text-[#3E2020] border border-[#C8A97E]/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#C85A43] font-semibold block">
                  Candid Memories
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#3E2020]">
                  'Tinder-Style' Swipeable Polaroids
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevPolaroid}
                  aria-label="Previous polaroid"
                  className="w-8 h-8 rounded-full border border-[#3E2020]/30 bg-white/70 hover:bg-[#C85A43] hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextPolaroid}
                  aria-label="Next polaroid"
                  className="w-8 h-8 rounded-full border border-[#3E2020]/30 bg-white/70 hover:bg-[#C85A43] hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Physical-style Polaroid Frame */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => onOpenFullscreen(currentPolaroid)}
              className="relative max-w-xs mx-auto p-3.5 pb-5 bg-white rounded-xl shadow-xl border border-black/10 transform rotate-1 hover:rotate-0 transition-transform duration-300 cursor-pointer"
            >
              {/* Tape sticker simulation */}
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-16 h-5 bg-[#C8A97E]/30 rounded-sm transform -rotate-2" />

              <div className="aspect-[4/5] rounded-md overflow-hidden bg-neutral-900 mb-3">
                <img
                  src={renderPhotoDataUrl(currentPolaroid, 600, 750)}
                  alt={currentPolaroid.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="text-center font-serif text-sm font-medium text-[#3E2020] truncate">
                {currentPolaroid.title}
              </div>
              <div className="text-center font-mono text-[10px] text-neutral-500 mt-0.5">
                Frame {polaroidIndex + 1} of {totalPolaroids}
              </div>
            </div>
          </div>

          {/* Direct VIP Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <a
              href={`https://wa.me/${contactConfig.whatsapp}?text=Hello%20Srinath%2C%20I%20would%20like%20to%20inquire%20about%20a%20photography%20shoot.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-full bg-[#25D366] text-white font-semibold text-sm hover:opacity-95 transition-opacity shadow-lg"
            >
              <MessageCircle className="w-5 h-5" />
              <span>WhatsApp</span>
            </a>

            <a
              href={buildTelUrl(contactConfig.phone)}
              className="flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-full bg-[#C85A43] text-white font-semibold text-sm hover:bg-[#b04b36] transition-colors shadow-lg"
            >
              <Phone className="w-5 h-5" />
              <span>Direct Call</span>
            </a>
          </div>

          {/* Luxury Request Form */}
          <div className="rounded-[28px] p-6 sm:p-8 bg-[#EAE0D5] text-[#3E2020] border border-[#C8A97E]/40 shadow-xl space-y-4">
            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#3E2020]">
              Request VIP Commission
            </h3>

            {submitted ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-semibold">Inquiry Dispatched</div>
                  <div className="text-xs">Srinath will contact you personally within 24 hours.</div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-3">
                {formError && (
                  <div className="p-2.5 rounded-lg bg-red-100 text-red-700 text-xs font-mono">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-[#3E2020]/75 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Your Full Name"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#3E2020]/20 text-[#3E2020] text-sm placeholder:text-neutral-400 focus:outline-none focus:border-[#C85A43]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-[#3E2020]/75 mb-1">
                      Contact / Email *
                    </label>
                    <input
                      type="text"
                      required
                      value={clientContact}
                      onChange={(e) => setClientContact(e.target.value)}
                      placeholder="Email or Phone Number"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#3E2020]/20 text-[#3E2020] text-sm placeholder:text-neutral-400 focus:outline-none focus:border-[#C85A43]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#3E2020]/75 mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#3E2020]/20 text-[#3E2020] text-sm focus:outline-none focus:border-[#C85A43]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#3E2020]/75 mb-1">
                    Vision &amp; Details
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Wedding dates, city, venue, rituals planned..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#3E2020]/20 text-[#3E2020] text-sm placeholder:text-neutral-400 focus:outline-none focus:border-[#C85A43]"
                  />
                </div>

                {/* Dark Espresso Brown Submit Pill Button */}
                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-full bg-[#3E2020] text-[#F5F0E6] font-semibold text-sm hover:bg-[#2A1614] transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 text-[#C8A97E]" />
                  <span>Submit Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
