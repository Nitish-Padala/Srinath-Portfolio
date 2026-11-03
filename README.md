# Srinath Photography — The Vintage Romance

> **Live Website:** [https://nitish-padala.github.io/Srinath-Portfolio/](https://nitish-padala.github.io/Srinath-Portfolio/)

A luxury mobile-first editorial wedding and visual storytelling portfolio for **Srinath**, meticulously crafted following the **"MOBILE-FIRST PORTFOLIO DESIGN SPECIFICATION & ASSETS: THE VINTAGE ROMANCE"** blueprint.

---

## 🎨 Design System & Palette

- **Soft Cream (`#F5F0E6`)**: Primary high-contrast luxury serif typography (`Playfair Display`).
- **Warm Beige (`#EAE0D5`)**: Lens specs, camera HUD guides, and secondary narrative details.
- **Muted Rust (`#C85A43`)**: Accent highlights, Call CTA button, and active dot indicators.
- **Dark Espresso Brown (`#3E2020`)**: Device framing, VIP inquiry button, and deep luxury shadows.
- **Espresso Foundation (`#18110E`)**: High-contrast dark photography backdrop.

---

## ✨ Features & Architecture

### 1. Cover & Branding System (`GlobalHeader.tsx`)
- High-elegance Playfair Display header with mobile screen pull indicator.
- Off-canvas luxury slide-out drawer featuring numbered chapters (`01 The Showcase` through `07 Viewfinder & VIP Booking`).
- One-tap VIP inquiry direct action button.

### 2. Auto-Swiping Hero & Lens Metadata (`AutoSwipingHero.tsx`)
- 5-second gentle cross-fade auto-play carousel inside a mobile device frame.
- Real-world metadata pill: `Mylapore, Chennai | 50mm f/1.2`.
- Cinematic typography: *"Capturing Every Ritual, Every Emotion"*.
- Interactive bottom dot pagination and 1-tap uncropped full-screen view.

### 3. Ratio-Specific Editorial Galleries (`VintageGalleries.tsx`)
- **16:9 Cinematic Horizon**: Horizontal swipe carousel featuring panoramic ritual ceremonies.
- **1:1 Square Mosaic**: Seamless grid with zero distortion and hairline borders.
- **3:4 & 4:3 Staggered Editorial Masonry**: Asymmetric magazine-style layout pairing intimate portraits with courtyard architecture.
- **9:16 Apple Recent Apps 3D Swiper**: Multi-layered card deck with 3D perspective transforms (`perspective: 1400px`), smooth touch swiping, and active card elevation.

### 4. The 3D Photo Globe (`OrbGlobeGallery3D.tsx`)
- **90% Mobile Screen Proportions**: Circular framing (`w-[90vw] max-w-[540px] aspect-square`).
- **Strict 360° Rotation (No-Zoom / No-Pan)**: `controls.enableZoom = false` and `controls.enablePan = false`. Eliminates mobile scroll hijacking while providing seamless touch rotation.
- **Optical Center Reticle**: Dynamic live center-photo title pill tracking the photograph facing the lens.
- **1-Tap Direct Opening**: Instant raycasting without requiring a long-press.

### 5. Viewfinder Bio & VIP Contact Hub (`ViewfinderBioContact.tsx`)
- **Realistic Camera Viewfinder HUD**: Rule-of-Thirds grid, pulsing autofocus brackets `[   ]`, real-time shooting parameters (`ISO 400`, `1/250s`, `f/1.4`, `RAW + L`), battery gauge, and rec dot.
- **Functional Shutter Button**: Interactive shutter button with haptic feedback and screen flash recoil.
- **Tinder-Style Polaroid Stack**: Layered physical polaroids with handwritten captions (*"Kalyanam Moments"*, *"Thanjavur Palace"*).
- **VIP Contact Actions**: Direct WhatsApp button (`#25D366`), Direct Call button (`#C85A43`), and Date Reservation form with Dark Espresso pill submit button (`#3E2020`).

### 6. Full-Screen Uncropped Modal
- Exact original aspect ratio display (`object-contain`).
- Touch swipe-up / swipe-down gesture dismissal with haptic snap-back.

---

## 🚀 Live Deployment

The site is automatically deployed via GitHub Actions on every push to `main`:

- **Live URL:** [https://nitish-padala.github.io/Srinath-Portfolio/](https://nitish-padala.github.io/Srinath-Portfolio/)

> **Tip:** If you previously visited the website on your phone or desktop and see an older version, please perform a quick hard-refresh (`Ctrl + F5` on Windows, `Cmd + Shift + R` on Mac, or clear browser cache in mobile Chrome/Safari) to purge any old service worker caches.

---

## 🛠️ Local Development

```bash
# Install dependencies
bun install   # or: npm install

# Run verification tests
bun test

# Run local development server
bun run dev   # or: npm run dev

# Build production bundle
bun run build:static
```
