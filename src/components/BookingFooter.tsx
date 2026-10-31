import React, { useState } from 'react';
import { Phone, MessageCircle, Mail, Settings2, CheckCircle2, Send, Calendar } from 'lucide-react';
import {
  BookingContactConfig,
  buildTelUrl,
  buildWhatsAppUrl,
  buildMailtoUrl,
  validateBookingInquiry,
} from '../utils/portfolioLogic';

interface BookingFooterProps {
  contactConfig: BookingContactConfig;
  onUpdateContactConfig: (newConfig: BookingContactConfig) => void;
}

export const BookingFooter: React.FC<BookingFooterProps> = ({
  contactConfig,
  onUpdateContactConfig,
}) => {
  const [editingContacts, setEditingContacts] = useState(false);
  const [draftConfig, setDraftConfig] = useState<BookingContactConfig>(contactConfig);

  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submittedBookings, setSubmittedBookings] = useState<
    Array<{
      id: string;
      clientName: string;
      clientContact: string;
      eventDate: string;
      notes: string;
    }>
  >([]);

  const telHref = buildTelUrl(contactConfig.phone);
  const whatsappHref = buildWhatsAppUrl(contactConfig.whatsapp);
  const mailtoHref = buildMailtoUrl(
    contactConfig.email,
    undefined,
    clientName || undefined,
    notes || undefined
  );

  const handleSaveContactSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateContactConfig(draftConfig);
    setEditingContacts(false);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateBookingInquiry({
      clientName,
      eventDate,
      eventType: clientContact || 'Shoot Inquiry',
      notes,
    });
    if (!validation.valid) {
      setFormError(validation.error || 'Please complete your name and preferred date.');
      return;
    }
    setFormError(null);
    setSubmittedBookings((prev) => [
      {
        id: `bk-${Date.now()}`,
        clientName: clientName.trim(),
        clientContact: clientContact.trim(),
        eventDate,
        notes: notes.trim(),
      },
      ...prev,
    ]);
    setClientName('');
    setClientContact('');
    setEventDate('');
    setNotes('');
  };

  return (
    <footer
      id="booking-contact"
      aria-label="Booking and Direct Contact Details"
      className="relative z-10 border-t border-[#c8a97e]/30 bg-[#14110f]/95 pt-12 pb-16 text-[#ebe0cc]"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Action Buttons: "Inquire & Book" + "Contact shortcut" */}
        <div className="max-w-md mx-auto mb-10 space-y-3 text-center">
          <a
            href="#booking-form-anchor"
            className="w-full min-h-[46px] px-6 py-2.5 rounded-full border border-[#c8a97e]/75 bg-[#1c1613] hover:bg-[#d48c29] hover:text-[#14110f] hover:border-[#d48c29] text-sm font-medium text-[#ebe0cc] tracking-wide transition-all flex items-center justify-center shadow-md"
          >
            Inquire &amp; Book
          </a>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full min-h-[46px] px-6 py-2.5 rounded-full border border-[#c8a97e]/50 bg-[#181310] hover:border-[#d48c29] text-sm font-medium text-[#ebe0cc] tracking-wide transition-all flex items-center justify-center"
          >
            Contact shortcut
          </a>
        </div>

        {/* Top Row: Direct One-Tap Call, WhatsApp & Email Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-[#c8a97e]/20">
          <div>
            <div className="text-xs font-semibold text-[#d48c29] tracking-widest uppercase">
              Direct Booking &amp; Commission Concierge
            </div>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-semibold text-[#ebe0cc] tracking-tight">
              Book {contactConfig.photographerName} for Your Story
            </h2>
            <p className="mt-2 text-sm text-[#b8a68e] max-w-2xl">
              Connect directly via voice call, WhatsApp chat, or studio email.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setDraftConfig(contactConfig);
              setEditingContacts((prev) => !prev);
            }}
            className="min-h-[42px] px-4 py-2 rounded-full bg-[#1c1613] border border-[#c8a97e]/40 text-xs font-medium text-[#ebe0cc] hover:border-[#d48c29] flex items-center gap-2 self-start md:self-auto whitespace-nowrap"
          >
            <Settings2 className="w-4 h-4 text-[#d48c29]" />
            <span>{editingContacts ? 'Close Contact Editor' : 'Customize Phone / WhatsApp / Email'}</span>
          </button>
        </div>

        {/* Optional Contact Number Customizer Drawer */}
        {editingContacts && (
          <form
            onSubmit={handleSaveContactSettings}
            className="mt-6 p-5 rounded-2xl bg-[#1c1613] border border-[#d48c29]/50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div>
              <label htmlFor="cfg-phone" className="block text-xs font-medium text-[#c8a97e]">
                Direct Call Phone Number
              </label>
              <input
                id="cfg-phone"
                type="text"
                value={draftConfig.phone}
                onChange={(e) => setDraftConfig({ ...draftConfig, phone: e.target.value })}
                className="mt-1 w-full min-h-[42px] rounded-lg bg-[#14110f] border border-[#c8a97e]/35 px-3 py-1.5 text-sm text-[#ebe0cc]"
              />
            </div>
            <div>
              <label htmlFor="cfg-wa" className="block text-xs font-medium text-[#c8a97e]">
                WhatsApp Number (with country code)
              </label>
              <input
                id="cfg-wa"
                type="text"
                value={draftConfig.whatsapp}
                onChange={(e) => setDraftConfig({ ...draftConfig, whatsapp: e.target.value })}
                className="mt-1 w-full min-h-[42px] rounded-lg bg-[#14110f] border border-[#c8a97e]/35 px-3 py-1.5 text-sm text-[#ebe0cc]"
              />
            </div>
            <div>
              <label htmlFor="cfg-email" className="block text-xs font-medium text-[#c8a97e]">
                Booking Email Address
              </label>
              <input
                id="cfg-email"
                type="email"
                value={draftConfig.email}
                onChange={(e) => setDraftConfig({ ...draftConfig, email: e.target.value })}
                className="mt-1 w-full min-h-[42px] rounded-lg bg-[#14110f] border border-[#c8a97e]/35 px-3 py-1.5 text-sm text-[#ebe0cc]"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full min-h-[42px] rounded-lg bg-[#d48c29] text-[#14110f] font-semibold text-xs hover:bg-[#f59e0b] transition-colors"
              >
                Save Contact Details
              </button>
            </div>
          </form>
        )}

        {/* 3 Primary One-Tap Contact Channels (Call, WhatsApp, Email) */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Direct Phone Call */}
          <a
            href={telHref}
            data-testid="booking-call-link"
            className="min-h-[112px] p-6 rounded-2xl bg-[#1a1411] border border-[#c8a97e]/30 hover:border-[#d48c29] shadow-lg transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#d48c29] tracking-wider">DIRECT VOICE CALL</span>
              <Phone className="w-5 h-5 text-[#d48c29] group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-4">
              <div className="text-xl font-bold text-[#ebe0cc] font-mono-tabular">{contactConfig.phone}</div>
              <div className="text-xs text-[#b8a68e] mt-1">Tap to Call Srinath Directly on Mobile</div>
            </div>
          </a>

          {/* 2. Direct WhatsApp Chat */}
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="booking-whatsapp-link"
            className="min-h-[112px] p-6 rounded-2xl bg-[#1a1411] border border-[#c8a97e]/30 hover:border-[#f59e0b] shadow-lg transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#f59e0b] tracking-wider">INSTANT WHATSAPP CHAT</span>
              <MessageCircle className="w-5 h-5 text-[#f59e0b] group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-4">
              <div className="text-xl font-bold text-[#ebe0cc] font-mono-tabular">+{contactConfig.whatsapp}</div>
              <div className="text-xs text-[#b8a68e] mt-1">Tap to Open WhatsApp Chat</div>
            </div>
          </a>

          {/* 3. Direct Email Dispatch */}
          <a
            href={mailtoHref}
            data-testid="booking-email-link"
            className="min-h-[112px] p-6 rounded-2xl bg-[#1a1411] border border-[#c8a97e]/30 hover:border-[#c8a97e] shadow-lg transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#c8a97e] tracking-wider">STUDIO EMAIL INQUIRY</span>
              <Mail className="w-5 h-5 text-[#c8a97e] group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-4">
              <div className="text-lg font-bold text-[#ebe0cc] truncate">{contactConfig.email}</div>
              <div className="text-xs text-[#b8a68e] mt-1">Tap to Send Detailed Shoot Brief via Email</div>
            </div>
          </a>
        </div>

        {/* Simplified Shoot Reservation Form (No Photography Specification Dropdown) */}
        <div
          id="booking-form-anchor"
          className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-8 border-t border-[#c8a97e]/20"
        >
          <div className="lg:col-span-7">
            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#ebe0cc]">
              Reserve a Shoot Date
            </h3>
            <p className="text-xs sm:text-sm text-[#d6c7b2] mt-1">
              If you want to book a shoot with me, just fill your details and send me a hi.
            </p>

            <form onSubmit={handleBookingSubmit} className="mt-5 space-y-4" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="booking-client-name" className="block text-xs font-medium text-[#c8a97e]">
                    Your Name
                  </label>
                  <input
                    id="booking-client-name"
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Rohan & Ananya"
                    className="mt-1.5 w-full min-h-[44px] rounded-xl bg-[#1c1613] border border-[#c8a97e]/35 px-3.5 py-2 text-sm text-[#ebe0cc] placeholder-[#786856] focus:border-[#d48c29] focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="booking-client-contact" className="block text-xs font-medium text-[#c8a97e]">
                    Email or Phone Number
                  </label>
                  <input
                    id="booking-client-contact"
                    type="text"
                    value={clientContact}
                    onChange={(e) => setClientContact(e.target.value)}
                    placeholder="e.g. +91 98480 00000 or you@email.com"
                    className="mt-1.5 w-full min-h-[44px] rounded-xl bg-[#1c1613] border border-[#c8a97e]/35 px-3.5 py-2 text-sm text-[#ebe0cc] placeholder-[#786856] focus:border-[#d48c29] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="booking-event-date" className="block text-xs font-medium text-[#c8a97e]">
                    Event Date / Time
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      id="booking-event-date"
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full min-h-[44px] rounded-xl bg-[#1c1613] border border-[#c8a97e]/35 px-3.5 py-2 text-sm text-[#ebe0cc] focus:border-[#d48c29] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="booking-notes" className="block text-xs font-medium text-[#c8a97e]">
                    Venue / Story Notes
                  </label>
                  <input
                    id="booking-notes"
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. 3-day wedding in Mylapore, morning muhurtham"
                    className="mt-1.5 w-full min-h-[44px] rounded-xl bg-[#1c1613] border border-[#c8a97e]/35 px-3.5 py-2 text-sm text-[#ebe0cc] placeholder-[#786856] focus:border-[#d48c29] focus:outline-none"
                  />
                </div>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="text-xs font-medium text-[#fca5a5] bg-[#7c1d1d]/40 border border-[#7c1d1d] px-3.5 py-2.5 rounded-xl"
                >
                  {formError}
                </div>
              )}

              <button
                type="submit"
                className="min-h-[48px] px-6 py-3 rounded-full bg-[#d48c29] text-[#14110f] font-semibold text-sm hover:bg-[#f59e0b] transition-colors flex items-center gap-2 shadow-md"
              >
                <Send className="w-4 h-4" />
                <span>Log Shoot Inquiry</span>
              </button>
            </form>
          </div>

          {/* Right Column: Commission Dispatch Log */}
          <div className="lg:col-span-5 rounded-2xl bg-[#1a1411] border border-[#c8a97e]/30 p-6 shadow-lg">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#d48c29]">
              <Calendar className="w-4 h-4" />
              <span>COMMISSION DISPATCH LOG</span>
            </div>

            {submittedBookings.length === 0 ? (
              <div className="mt-4 text-xs text-[#b8a68e] space-y-2 leading-relaxed">
                <p>No shoot inquiries logged in this session yet.</p>
                <p>
                  Tap <strong className="text-[#ebe0cc]">Call</strong>,{' '}
                  <strong className="text-[#ebe0cc]">WhatsApp</strong>, or{' '}
                  <strong className="text-[#ebe0cc]">Email</strong> above for instant direct communication with Srinath, or fill your details on the left and send a hi.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {submittedBookings.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-[#14110f] border border-[#d48c29]/45 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[#f59e0b] font-semibold">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Inquiry Logged for {item.clientName}</span>
                      </span>
                      <span className="font-mono-tabular">{item.eventDate}</span>
                    </div>
                    <div className="text-[#ebe0cc]">
                      {item.clientContact ? <span>Contact: <strong>{item.clientContact}</strong> · </span> : null}
                      {item.notes ? <span>{item.notes}</span> : <span>Hi Srinath, I would love to book a shoot!</span>}
                    </div>
                    <div className="pt-1 flex items-center gap-3">
                      <a
                        href={buildWhatsAppUrl(
                          contactConfig.whatsapp,
                          undefined,
                          `Hi Srinath! I am ${item.clientName}${item.clientContact ? ` (${item.clientContact})` : ''} inquiring for ${item.eventDate}. ${item.notes}`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#d48c29] hover:underline font-semibold"
                      >
                        Send via WhatsApp →
                      </a>
                      <a
                        href={buildMailtoUrl(
                          contactConfig.email,
                          undefined,
                          item.clientName,
                          `Date: ${item.eventDate}${item.clientContact ? ` | Contact: ${item.clientContact}` : ''} | Notes: ${item.notes}`
                        )}
                        className="text-[#c8a97e] hover:underline font-semibold"
                      >
                        Send via Email →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
