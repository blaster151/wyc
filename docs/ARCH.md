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
| Content | JSON files in a server-accessible `/content/` folder, fetched at runtime via relative path | No redeploy needed; editable in-place on the server; no API keys; no build step |
| Audio | External URL (linked from content JSON) | Creator hosts audio anywhere and drops the URL into the content file |
| Analytics | None (V0) | Vercel dashboard for basic page views only |

### Why file-based JSON in a content folder?
- **No redeploy to update content** — edit files in-place on the server, changes are live immediately
- Content is not version-controlled — treated like a database, not source code
- No API key management or quota concerns
- No build step, no CMS, no backend — just files on a server
- Simple migration path to a CMS later

**V0 setup:** A `/content/` folder on the web server, sibling to the app's static files, containing `affirmations.json`, `welcomes.json`, and `config.json`. The app fetches them via relative paths (e.g. `/content/affirmations.json`). For local development, the same files live in `public/content/` (Next.js serves `public/` as the site root).

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
│   ├── content/                # Content JSON files (dev + production)
│   │   ├── affirmations.json   #   Editable in-place on the server
│   │   ├── welcomes.json       #   Fetched via relative path at runtime
│   │   └── config.json         #   Not baked into the JS bundle
│   ├── audio/                  # Optional self-hosted audio files
│   ├── images/                 # Optional affirmation images
│   ├── icons/                  # PWA icons (192x192, 512x512)
│   └── manifest.json           # Web App Manifest
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
Runtime (client-side, on page load)
  └─ Browser fetches /content/affirmations.json   (relative path)
  └─ Browser fetches /content/welcomes.json
  └─ Browser fetches /content/config.json
        └─ lib/content.ts parses and validates
```

Content JSON files live in a `/content/` folder on the web server, fetched by the browser at runtime via relative paths. The files are not compiled into the JS bundle — they're plain static assets the creator can edit in-place.

In local development, `public/content/` serves the same role (Next.js maps `public/` to the site root). Seed data is committed to the repo so `npm run dev` works out of the box.

> **Audio files** are referenced by URL inside the JSON (e.g. `"audioUrl": "https://..."` or a relative path like `"/audio/welcome.mp3"`). The creator uploads audio wherever is convenient and puts the URL into the content file.

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
1. Edit `affirmations.json`, `welcomes.json`, or `config.json` directly on the server
2. Changes are live on the next user session — no build, no deploy, no git push

Content and code have independent lifecycles. The app repo is only touched when code or design changes. Content is edited in-place like a database.

---

## 11. Deferred Architecture Decisions

| Topic | V0 Decision | Future Path |
|-------|-------------|-------------|
| Content source | JSON files on the server, editable in-place | Headless CMS (Contentful, Sanity) or Google Sheets API |
| Analytics | None | Plausible / Fathom (privacy-first) |
| Audio hosting | `public/audio/` or external URL | Cloudinary or S3 with signed URLs |
| Cross-device first-visit | localStorage only | Fingerprint + lightweight backend |
| Image optimization | `unoptimized: true` | Cloudinary or next/image with a compatible CDN |
