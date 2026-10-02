# MICROSTOCK MOTION EXPORTER
> **"Turn Canvas Motion Code into Microstock-Ready Video Assets"**

A browser-based, client-side creative coding studio designed to execute HTML5 Canvas 2D animations, preview them at 60 FPS in real-time, configure video parameters (HD/4K, FPS, duration, transparent background), and render frame-by-frame deterministic video files (.webm) with SEO metadata ready for Shutterstock and Adobe Stock.

---

## 🌟 Key Features

1. **Sandboxed Code Execution**
   - Pure client-side execution shadowing dangerous browser globals (`window`, `document`, `fetch`, `localStorage`, `eval`, etc.).
   - Standard syntax validation and clear error reporting.
   - Core API: `function draw(ctx, time, width, height)` where `time` is in **seconds**.

2. **Deterministic Frame-by-Frame Rendering**
   - Video export is rendered discretely (`time = frameIndex / fps`), preventing realtime frame drops or performance-dependent lag.
   - Live render metrics: frame progress counter, percentage, elapsed time, and dynamic ETA.

3. **Microstock Market Presets & Guidance**
   - Presets for **Shutterstock**, **Adobe Stock**, and **Generic Microstock**.
   - Suggested durations (3s–10s seamless loops), standard resolutions (1080p, 4K UHD, 1080x1080 square, 9:16 vertical), and frame rates (24, 25, 30, 60 fps).
   - Transparent alpha channel background support with checkerboard live preview.
   - 4K high memory warning protection.

4. **Microstock Metadata Generator (Offline)**
   - Rule-based engine generating commercial titles, search descriptions, and up to 50 deduplicated SEO tags.
   - Tag chip management (add, remove, count tracker).
   - One-click export to `.txt` and `.json`.

5. **Project Management & Offline-First**
   - Save & Load project files (`.json`).
   - Drag & drop `.json` files anywhere on the workspace.
   - Auto-save to `localStorage` with a session recovery prompt.
   - 100% client-side with zero external API key requirements.

6. **9 Built-in Production Animation Examples**
   - Sample Test: Magic Wand & Floating Papers
   - Floating Stars & Nebula Glow
   - Magic Wand & Sparkle Trails
   - Loading Circle (HUD Preloader)
   - Abstract Organic Blob
   - Minimal Geometric Loop
   - Constellation Particle Network
   - Festive Confetti Celebration
   - Floating Glass UI Cards

---

## 🚀 How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open in browser:
# http://localhost:3000
```

---

## 🌐 Deploy to Netlify

This application is completely static and client-side (no backend, no database, no serverless functions required).

### Method 1: Netlify CLI
```bash
npm run build
npx netlify deploy --prod --dir=dist
```

### Method 2: Netlify Web Dashboard (Drag & Drop or Git)
1. Run `npm run build` locally.
2. In Netlify, create a new site from your Git repository:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
3. Click **Deploy Site**.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + Enter` / `⌘ + Enter` | Run animation from code editor |
| `Ctrl + Shift + Enter` / `⌘ + ⇧ + Enter` | Open Render & Export dialog |
| `Ctrl + S` / `⌘ + S` | Save current project as JSON |
| `Space` | Toggle Play / Pause (when outside code editor) |
| `Tab` | Indent with 2 spaces in code editor |
| `Escape` | Stop playback / Cancel render / Close modal |
| `Drag & Drop` | Drop `.json` file anywhere to load project |

---

## 📋 Recommended Browsers & Codec Details

- **Recommended Browsers**: Google Chrome (v99+), Microsoft Edge (v99+), Brave, Firefox (v110+).
- **Video Format**: High-bitrate WebM (`video/webm;codecs=vp9` with alpha channel support, or `video/webm;codecs=vp8`).
- **Marketplace Conversion**: If a microstock agency specifically mandates `.mp4` (H.264 / ProRes), convert the exported WebM locally using HandBrake or FFmpeg:
  ```bash
  ffmpeg -i motion-asset.webm -c:v libx264 -pix_fmt yuv420p -crf 18 output.mp4
  ```

---

## 📝 Animation Function Contract

```javascript
function draw(ctx, time, width, height) {
    // ctx: CanvasRenderingContext2D
    // time: Current time in SECONDS (e.g., 1.25s)
    // width: Canvas width in pixels
    // height: Canvas height in pixels
}
```
