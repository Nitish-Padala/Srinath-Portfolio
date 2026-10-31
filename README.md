# Srinath — 3D Emotion & Visual Photography Portfolio

A high-performance, mobile-first 3D interactive photography portfolio for **Srinath** featuring:
- **3D Fibonacci Photo Globe**: 108 curated, low-key cinema-graded photographs with 80% default zoom on page load, 200% smooth zoom, and antipodal distribution (zero adjacent or nearby repeats).
- **Recent-Tabs Card Stacks**: Tactile mobile card decks with swipe gestures and haptic feedback.
- **Categorized Galleries**:
  - *Solitary & Lifestyle Narratives* (1:1 ratio square frames)
  - *Portraits & Intimate Kinship* (1:1 ratio square frames)
  - *Twilight & Horizon Alchemy* (curated golden hour & twilight compositions)
  - *Portrait Series* (sliding trio window, shifts 1-by-1 on navigation)
  - *Landscape Series* (single-frame focus)
- **Full-Screen Viewer**: Immersive swipe-to-dismiss gestures (swipe up/down) with tactile haptic feedback.
- **Direct Concierge**: One-tap WhatsApp, Direct Call, Email inquiries, and commission requests.

---

## Free Online Deployment Options

### Option 1: GitHub Pages (100% Free Forever)
1. Push this repository to your GitHub profile (`main` branch).
2. On GitHub, go to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, choose **GitHub Actions**.
4. The included `.github/workflows/deploy.yml` workflow will automatically build and publish your site at:
   ```text
   https://<your-github-username>.github.io/<repository-name>/
   ```

### Option 2: Vercel / Netlify / Cloudflare Pages (100% Free, 1-Click)
1. Sign in to [Vercel](https://vercel.com) or [Netlify](https://netlify.com) using your GitHub account.
2. Click **Add New Project** and select this repository.
3. Keep default settings (`Framework: Vite`, `Build Command: vite build`, `Output Directory: dist`).
4. Click **Deploy**. Your portfolio will be live instantly with a free permanent URL (e.g. `https://srinath-portfolio.vercel.app`) and free SSL.

---

## Local Development

**Prerequisites:** [Bun](https://bun.sh) or [Node.js](https://nodejs.org) (v18+)

1. Install dependencies:
   ```bash
   bun install
   # or: npm install
   ```
2. Start the development server:
   ```bash
   bun run dev
   # or: npm run dev
   ```
3. Open `http://localhost:3000` in your browser.

4. Run tests:
   ```bash
   bun test
   ```
