import React, { useState } from 'react';
import { Menu, X, Phone, MessageCircle, ArrowRight } from 'lucide-react';

interface GlobalHeaderProps {
  phone?: string;
  whatsapp?: string;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  phone = '+919848052310',
  whatsapp = '919848052310',
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: 'The Showcase', href: '#hero-section', number: '01' },
    { label: '16:9 Cinematic Horizon', href: '#gallery-16-9', number: '02' },
    { label: '1:1 Square Mosaic', href: '#gallery-1-1', number: '03' },
    { label: '3:4 & 4:3 Staggered Masonry', href: '#gallery-masonry', number: '04' },
    { label: '9:16 Apple Recent Apps', href: '#gallery-9-16', number: '05' },
    { label: '3D Photo Globe', href: '#orb-section', number: '06' },
    { label: 'Viewfinder & VIP Booking', href: '#vip-contact', number: '07' },
  ];

  const handleLinkClick = () => {
    setMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#18110E]/90 backdrop-blur-md border-b border-[#C8A97E]/25 transition-all">
        {/* Subtle mobile screen pull indicator */}
        <div className="w-10 h-1 rounded-full bg-[#C8A97E]/30 mx-auto mt-1.5 sm:hidden" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo / Brand Name in Luxury Serif */}
          <a
            href="#hero-section"
            className="group flex flex-col"
            aria-label="Srinath Photography Home"
          >
            <span className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-[#F5F0E6] group-hover:text-[#C85A43] transition-colors">
              Srinath Photography
            </span>
          </a>

          {/* Right Action & Hamburger Menu */}
          <div className="flex items-center gap-3">
            <a
              href="#vip-contact"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase bg-[#C85A43] text-[#F5F0E6] hover:bg-[#b04b36] transition-colors shadow-sm"
            >
              <span>VIP Inquiry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>

            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={menuOpen}
              className="w-10 h-10 rounded-full border border-[#C8A97E]/35 bg-[#3E2020]/60 hover:bg-[#3E2020] text-[#F5F0E6] flex items-center justify-center transition-colors cursor-pointer"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Slide-over Luxury Navigation Drawer */}
      {menuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="w-full max-w-sm sm:max-w-md h-full bg-[#18110E] border-l border-[#C8A97E]/30 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top drawer header */}
            <div className="flex items-center justify-between pb-6 border-b border-[#C8A97E]/20">
              <span className="font-serif text-xl text-[#F5F0E6] tracking-wide">
                The Vintage Romance
              </span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close Menu"
                className="w-9 h-9 rounded-full border border-[#C8A97E]/40 text-[#F5F0E6] hover:bg-[#3E2020] flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation links */}
            <nav className="py-6 space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.number}
                  href={link.href}
                  onClick={handleLinkClick}
                  className="group flex items-baseline justify-between py-2 border-b border-[#C8A97E]/10 hover:border-[#C85A43] transition-colors"
                >
                  <span className="font-serif text-lg sm:text-xl text-[#EAE0D5] group-hover:text-[#C85A43] transition-colors">
                    {link.label}
                  </span>
                  <span className="font-mono text-xs text-[#C8A97E]/60 group-hover:text-[#C85A43] transition-colors">
                    {link.number}
                  </span>
                </a>
              ))}
            </nav>

            {/* Bottom Quick Contact Bar */}
            <div className="pt-6 border-t border-[#C8A97E]/20 space-y-3">
              <div className="text-xs text-[#C8A97E]/80 uppercase tracking-widest font-mono">
                Direct Concierge
              </div>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://wa.me/${whatsapp}?text=Hello%20Srinath%20Photography`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 rounded-full bg-[#25D366] text-white text-xs font-semibold hover:opacity-95 transition-opacity"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={`tel:${phone}`}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-full bg-[#C85A43] text-white text-xs font-semibold hover:opacity-95 transition-opacity"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Direct</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
