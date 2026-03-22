# Architecture Document — WYC V0
**Status:** Draft v0.1  
**Last Updated:** 2026-03-22  
**Progression:** Brief ✅ → PRD ✅ → **Arch (this doc)** → Epics/Stories

---

## 1. Guiding Constraints

These constraints come directly from the PRD and must not be violated:

1. **No runtime server** — deployable as a 100% static site (`next export`)
2. **No user accounts** — no auth, no database per-user state
3. **Content updatable without code deploy** — content must exist outside compiled JS
4. **Mobile-first** — must be beautiful and functional at 375px
5. **Privacy-first** — no external tracking, no cookies, only `localStorage`

---

## 2. Technology Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Next.js 16 (App Router) | Static export support, file-based routing, TypeScript first |
| Styling | Tailwind CSS v4 | Utility-first, great for responsive mobile design, minimal bundle |
| Language | TypeScript | Type-safety for content schemas and component props |
| Hosting | Vercel (static) | Free tier, fast CDN, easy custom domain, deploys on push |
| Content | JSON files in a **separate public GitHub repo**, fetched at runtime | No redeploy needed to update content; browser-editable; free; no API keys |
| Audio | External URL (linked from content JSON) | No self-hosting setup; creator hosts audio anywhere and drops the URL into the content file |
| Analytics | None (V0) | Vercel dashboard for basic page views only |

### Why file-based JSON in a separate content repo?
- **No redeploy to update content** — the main app repo is never touched when affirmations change
- No API key management or quota concerns (public repo, raw URLs are open)
- Editable via GitHub web UI by a non-technical creator (or any text editor with a browser)
- Content and code have independent lifecycles — content is closer to a DB than source code
- Simple migration path to a CMS later

**Recommended V0 setup:** Create a second public GitHub repo (e.g. `wyc-content`) containing `affirmations.json`, `welcomes.json`, and `config.json`. The main app fetches from stable `raw.githubusercontent.com` URLs at runtime. A GitHub Gist is a simpler alternative if a full repo feels like overhead.

---

## 3. Static Export Configuration

```ts
// next.config.ts
const nextConfig = {
  output: "export",         // generates /out — pure static
  images: { unoptimized: true }, // required for static export
};
```

All routes must be statically determinable at build time. No dynamic route segments that depend on runtime data.

---

## 4. Project Structure

```
wyc/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx              # Root layout: fonts, metadata, PWA meta tags
│   ├── page.tsx                # Entry point → orchestrates first-visit vs daily welcome
│   ├── affirmations/
│   │   └── page.tsx            # Affirmation viewer flow
│   └── support/
│       └── page.tsx            # Support / about screen
│
├── components/
│   ├── WelcomeScreen.tsx       # First-visit welcome + audio
│   ├── DailyWelcome.tsx        # Daily message + audio + enter CTA
│   ├── AffirmationCard.tsx     # Single affirmation display
│   ├── AffirmationFlow.tsx     # Shuffle logic, timer, advance state
│   ├── PresenceTimer.tsx       # Visual countdown / progress bar
│   ├── AudioPlayer.tsx         # Minimal play/skip audio control
│   └── SupportScreen.tsx       # Creator note + donation link
│
├── lib/
│   ├── content.ts              # Fetch + parse content JSON files
│   ├── shuffle.ts              # Fisher-Yates shuffle utility
│   ├── firstVisit.ts           # localStorage first-visit detection
│   └── types.ts                # Shared TypeScript interfaces (from PRD schema)
│
├── public/
│   ├── content/                # LOCAL DEV ONLY — mirrors the external content repo
│   │   ├── affirmations.json   #   (not deployed; overridden by NEXT_PUBLIC_CONTENT_BASE_URL in prod)
│   │   ├── welcomes.json
│   │   └── config.json
│   ├── images/                 # Optional static images (app chrome, fallbacks)
│   ├── icons/                  # PWA icons (192x192, 512x512)
│   └── manifest.json           # Web App Manifest
│
│  [external] wyc-content repo  # Separate public GitHub repo — actual live content
│   ├── affirmations.json       #   raw.githubusercontent.com/.../affirmations.json
│   ├── welcomes.json
│   └── config.json             #   audio files referenced by URL in JSON (hosted anywhere)
│
└── docs/
    ├── PRD.md
    ├── ARCH.md                 # This file
    └── EPICS.md
```

---

## 5. Data Flow

### Content Loading
```
Runtime (client-side, on first render)
  └─ NEXT_PUBLIC_CONTENT_BASE_URL env var resolves to external content repo base URL
  └─ Browser fetches {base}/affirmations.json
  └─ Browser fetches {base}/welcomes.json
  └─ Browser fetches {base}/config.json
        └─ lib/content.ts parses and validates
        └─ Falls back to /content/*.json (local dev fallback)
```

Content lives in a **separate public GitHub repo**. The app fetches from `raw.githubusercontent.com` URLs at runtime on the client. Files are tiny and browser-cached after the first load.

Setting `NEXT_PUBLIC_CONTENT_BASE_URL` in Vercel environment variables is the only config needed. Local development falls back to `public/content/` (a local mirror of the content repo, not committed to production).

> **Audio files** are referenced by URL inside the JSON (e.g. `"audioUrl": "https://..."`) — the app never needs to host the audio itself. The creator uploads audio wherever is convenient and pastes the URL into the content file.

### First Visit Detection
```
app/page.tsx mounts
  └─ lib/firstVisit.ts: read localStorage["wyc_visited"]
        ├─ null → show WelcomeScreen, then write flag
        └─ set  → skip to DailyWelcome
```

### Affirmation Session
```
AffirmationFlow mounts
  └─ fetch affirmations.json
  └─ filter active: true
  └─ lib/shuffle.ts: Fisher-Yates shuffle → session array (not persisted)
  └─ render AffirmationCard[0]
        └─ PresenceTimer runs
              └─ onComplete → enable advance
                    └─ user advances → next card or SupportScreen
```

### Welcome Message Resolution
```
lib/content.ts: getActiveWelcome(date)
  └─ filter welcomes where effectiveDateStart ≤ today ≤ effectiveDateEnd
  └─ return first match, or fallback default
```

---

## 6. Component Responsibilities

### `app/page.tsx`
- Only responsibility: check first-visit flag, render `<WelcomeScreen>` or `<DailyWelcome>` accordingly
- No business logic

### `AffirmationFlow`
- Owns session state: current index, shuffled array, timer state
- Passes single affirmation to `AffirmationCard` as props
- Handles advance and completion

### `PresenceTimer`
- Props: `durationMs`, `onComplete`
- Renders visual progress indicator
- Fires `onComplete` when elapsed; does NOT block user if they tap early (soft timer)

### `AudioPlayer`
- Props: `src`, `autoplay?: false`
- Minimal: play/pause button, no seek bar
- Graceful no-op if `src` is undefined

---

## 7. Content File Format

### `public/content/affirmations.json`
```json
{
  "version": 1,
  "affirmations": [
    {
      "id": "aff-001",
      "text": "You are exactly where you need to be.",
      "attribution": null,
      "imageUrl": null,
      "active": true
    }
  ]
}
```

### `public/content/welcomes.json`
```json
{
  "version": 1,
  "welcomes": [
    {
      "id": "wlc-001",
      "text": "Take a breath. You're here.",
      "audioUrl": null,
      "effectiveDateStart": "2026-01-01",
      "effectiveDateEnd": "2026-12-31"
    }
  ],
  "fallback": {
    "text": "Welcome. Take a moment for yourself."
  }
}
```

### `public/content/config.json`
```json
{
  "version": 1,
  "appName": "WYC",
  "timerDurationMs": 7000,
  "donationUrl": "https://ko-fi.com/YOUR_HANDLE",
  "supportNote": "This project is made with love..."
}
```

---

## 8. PWA Manifest

```json
// public/manifest.json
{
  "name": "WYC",
  "short_name": "WYC",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a1a2e",
  "theme_color": "#1a1a2e",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

Referenced in `app/layout.tsx` via Next.js metadata API.

---

## 9. Routing

| Route | Renders | Notes |
|-------|---------|-------|
| `/` | WelcomeScreen or DailyWelcome | Controlled by first-visit flag |
| `/affirmations` | AffirmationFlow | Core experience |
| `/support` | SupportScreen | Also shown post-completion |

All routes are statically exported. No dynamic segments. Navigation uses `next/navigation` `useRouter` for client-side transitions.

---

## 10. Deployment

```
git push → Vercel auto-deploy
  └─ next build → /out (static files)
  └─ Vercel CDN serves /out
  └─ Content files in public/ served as-is
```

**Content update workflow (zero redeploy):**
1. Go to the `wyc-content` GitHub repo
2. Edit `affirmations.json`, `welcomes.json`, or `config.json` directly in the browser
3. Commit directly to `main`
4. The main app fetches the updated file on the next user session — no Vercel redeploy needed

The main `wyc` repo is only touched when app code or design changes. Content and code are fully decoupled.

---

## 11. Deferred Architecture Decisions

| Topic | V0 Decision | Future Path |
|-------|-------------|-------------|
| Content source | JSON in separate public GitHub repo, fetched at runtime | Headless CMS (Contentful, Sanity) or Google Sheets API |
| Analytics | None | Plausible / Fathom (privacy-first) |
| Audio hosting | `public/audio/` or external URL | Cloudinary or S3 with signed URLs |
| Cross-device first-visit | localStorage only | Fingerprint + lightweight backend |
| Image optimization | `unoptimized: true` | Cloudinary or next/image with a compatible CDN |
