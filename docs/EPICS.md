# Epics & Stories — WYC V0
**Status:** Draft v0.1  
**Last Updated:** 2026-03-22  
**Progression:** Brief ✅ → PRD ✅ → Arch ✅ → **Epics/Stories (this doc)**

---

## Story Format

```
As a [persona], I want [action] so that [outcome].

Acceptance Criteria:
- [ ] ...

Definition of Done:
- [ ] Component renders without errors
- [ ] Mobile viewport (375px) looks correct
- [ ] TypeScript compiles clean
```

---

## Epic 1 — Foundation & Content System

*Get the skeleton running with content loading, routing, and the data layer. Everything else depends on this.*

---

### Story 1.1 — Create the content repository
**As a** creator, **I want** a separate, dedicated place to manage content **so that** I can update affirmations and welcome messages without touching the codebase.

**Acceptance Criteria:**
- [ ] A new **public** GitHub repo (e.g. `wyc-content`) is created
- [ ] Repo contains `affirmations.json`, `welcomes.json`, and `config.json` at root
- [ ] All files match the schemas defined in ARCH.md §7
- [ ] ≥ 3 sample affirmations with content that reflects the intended tone
- [ ] 1 active welcome message with a date range covering today + a fallback entry
- [ ] `config.json` has placeholder `donationUrl`, real `timerDurationMs`, and `supportNote`
- [ ] Raw file URLs (`raw.githubusercontent.com/...`) are confirmed accessible in a browser

**Notes:** Seed data should reflect the intended tone (calm, grounding). See PRD §2 persona.

---

### Story 1.2 — Content loading library
**As a** developer, **I want** typed content-loading functions **so that** components can consume content without duplicating fetch/parse logic.

**Acceptance Criteria:**
- [ ] `lib/types.ts` exports `Affirmation`, `WelcomeMessage`, `SiteConfig` interfaces
- [ ] `lib/content.ts` reads `NEXT_PUBLIC_CONTENT_BASE_URL` env var for the content base URL
- [ ] Falls back to `/content/` (local `public/` folder) when env var is not set (dev convenience)
- [ ] `lib/content.ts` exports `fetchAffirmations(): Promise<Affirmation[]>`
- [ ] `lib/content.ts` exports `fetchWelcome(date: Date): Promise<WelcomeMessage>`
- [ ] `lib/content.ts` exports `fetchConfig(): Promise<SiteConfig>`
- [ ] `getActiveWelcome` returns fallback if no date-range match
- [ ] All functions handle fetch failure gracefully (return fallback / empty array, never crash)

### Story 1.3a — Local content dev mirror
**As a** developer, **I want** local JSON files that mirror the content repo **so that** the app works in dev without needing the external URL.

**Acceptance Criteria:**
- [ ] `public/content/affirmations.json`, `welcomes.json`, `config.json` exist in the main repo
- [ ] These files are listed in `.gitignore` (they are dev-only; the content repo is the source of truth)
- [ ] A comment in README explains: "copy content files from `wyc-content` repo into `public/content/` for local dev"

---

### Story 1.3 — Routing structure
**As a** user, **I want** distinct screens for each phase of the experience **so that** navigation feels intentional.

**Acceptance Criteria:**
- [ ] `/` route exists (`app/page.tsx`)
- [ ] `/affirmations` route exists (`app/affirmations/page.tsx`)
- [ ] `/support` route exists (`app/support/page.tsx`)
- [ ] All routes are client-rendered (no server components that would break static export)
- [ ] `next build` completes without errors

---

### Story 1.4 — Shuffle utility
**As a** developer, **I want** a reliable shuffle function **so that** affirmations appear in a non-repeating random order each session.

**Acceptance Criteria:**
- [ ] `lib/shuffle.ts` exports `shuffleArray<T>(arr: T[]): T[]`
- [ ] Implementation uses Fisher-Yates algorithm
- [ ] Original array is not mutated
- [ ] Result contains all original elements (no drops, no duplicates)

---

## Epic 2 — First Visit & Welcome Screen

*The entry ritual. Sets the emotional tone from the first second.*

---

### Story 2.1 — First-visit detection
**As a** user, **I want** the welcome screen to appear only on my first visit **so that** repeat visits go straight to the daily content.

**Acceptance Criteria:**
- [ ] `lib/firstVisit.ts` exports `isFirstVisit(): boolean`
- [ ] `lib/firstVisit.ts` exports `markVisited(): void`
- [ ] Uses `localStorage` key `wyc_visited`
- [ ] Returns `true` when key is absent; `false` when present
- [ ] `markVisited()` sets the key
- [ ] SSR-safe (no `window` access during server render — guard with `typeof window !== 'undefined'`)

---

### Story 2.2 — Welcome screen component
**As a** first-time user, **I want** to see a warm, calming landing screen **so that** I know immediately what this experience is about.

**Acceptance Criteria:**
- [ ] `components/WelcomeScreen.tsx` renders with a welcoming message and CTA button
- [ ] Component accepts `onEnter: () => void` prop
- [ ] CTA calls `onEnter` and triggers `markVisited()`
- [ ] Layout is full-screen, centered, mobile-first
- [ ] Calm visual aesthetic (see design notes below)

**Design Notes:** Dark or muted background, large readable text, generous whitespace. No clutter.

---

### Story 2.3 — Audio player component
**As a** user, **I want** to optionally listen to an intro audio message **so that** I can engage more deeply if I choose.

**Acceptance Criteria:**
- [ ] `components/AudioPlayer.tsx` accepts `src: string | undefined`
- [ ] Renders play/pause toggle only (no seek bar, no time display)
- [ ] Does NOT autoplay (respects browser autoplay policies)
- [ ] If `src` is undefined/null, component renders nothing
- [ ] Accessible: button has `aria-label`

---

### Story 2.4 — Wire first-visit routing in `app/page.tsx`
**As a** user, **I want** the right screen to appear on load **so that** my experience is appropriate to whether I'm new or returning.

**Acceptance Criteria:**
- [ ] On first visit: render `<WelcomeScreen>` → on enter, transition to `<DailyWelcome>`
- [ ] On repeat visit: render `<DailyWelcome>` directly
- [ ] Both transitions happen client-side (no page reload)
- [ ] `WelcomeScreen` → `DailyWelcome` transition is smooth (fade or slide)

---

## Epic 3 — Daily Welcome

*The daily ritual entry point. Seen every visit (after first-visit screen is cleared).*

---

### Story 3.1 — Daily welcome component
**As a** returning user, **I want** to see the current welcome message **so that** each visit begins with an intentional moment.

**Acceptance Criteria:**
- [ ] `components/DailyWelcome.tsx` fetches and displays the active welcome message
- [ ] Shows `WelcomeMessage.text`
- [ ] Renders `<AudioPlayer src={welcome.audioUrl} />` (hidden if no audio)
- [ ] Shows a "Begin" CTA that navigates to `/affirmations`
- [ ] Displays fallback message if no active welcome found
- [ ] Loading state shown while content fetches

---

## Epic 4 — Affirmation Viewer (Core Experience)

*The heart of WYC. Must feel calm, unhurried, and beautiful.*

---

### Story 4.1 — Affirmation card component
**As a** user, **I want** to read one affirmation at a time in a focused, full-screen view **so that** I can be fully present with the message.

**Acceptance Criteria:**
- [ ] `components/AffirmationCard.tsx` accepts `affirmation: Affirmation` as prop
- [ ] Renders `text` prominently (large, readable serif or clean sans typeface)
- [ ] Renders `attribution` in smaller, secondary style if present
- [ ] Renders `imageUrl` as a background or inset image if present
- [ ] Full-screen layout, centered content, no distracting chrome
- [ ] Card is visually distinct / beautiful on 375px mobile

---

### Story 4.2 — Presence timer component
**As a** user, **I want** a gentle visual timer **so that** I'm encouraged to pause before moving on without feeling forced.

**Acceptance Criteria:**
- [ ] `components/PresenceTimer.tsx` accepts `durationMs: number` and `onComplete: () => void`
- [ ] Renders a visual progress indicator (progress bar or circular arc)
- [ ] Starts automatically on mount
- [ ] Calls `onComplete` when elapsed
- [ ] Timer is a soft nudge — user CAN advance before it completes (advance button is not disabled)
- [ ] Progress animates smoothly (CSS transition, not JS polling)

---

### Story 4.3 — Affirmation flow orchestrator
**As a** user, **I want** to move through a session of affirmations **so that** I experience the full intended sequence.

**Acceptance Criteria:**
- [ ] `components/AffirmationFlow.tsx` fetches affirmations, filters `active: true`, shuffles
- [ ] Renders current `<AffirmationCard>` and `<PresenceTimer>`
- [ ] Shows advance button; pressing it moves to next card
- [ ] After last card, calls `onComplete` prop (to trigger navigation to support screen)
- [ ] Session shuffle is computed once on mount (stable for the session)
- [ ] Shows loading/error state if fetch fails

---

### Story 4.4 — Wire affirmations page
**As a** user, **I want** `/affirmations` to run the full session flow end-to-end.

**Acceptance Criteria:**
- [ ] `app/affirmations/page.tsx` renders `<AffirmationFlow>`
- [ ] On `onComplete`, router navigates to `/support`
- [ ] Persistent nav (if any) visible but unobtrusive

---

## Epic 5 — Support / Donation Screen

*Light touch. No pressure. Genuine.*

---

### Story 5.1 — Support screen component
**As a** user who has completed a session, **I want** to easily find a way to support the creator **so that** I can contribute if I feel moved.

**Acceptance Criteria:**
- [ ] `components/SupportScreen.tsx` renders creator note from `config.supportNote`
- [ ] Renders a button/link: "Support this project ❤️" that opens `config.donationUrl` in a new tab
- [ ] Link uses `rel="noopener noreferrer"` for security
- [ ] Optional: "Start again" link back to `/` or `/affirmations`
- [ ] Tone is warm, not aggressive

---

### Story 5.2 — Wire support page
**As a** user, **I want** `/support` to be directly accessible (not just post-completion) **so that** I can share the link or return to it.

**Acceptance Criteria:**
- [ ] `app/support/page.tsx` renders `<SupportScreen>`
- [ ] Page loads cleanly with config data
- [ ] Accessible via nav link from any screen

---

## Epic 6 — PWA & Polish

*Make it feel like a real app. Get it on the home screen.*

---

### Story 6.1 — Web App Manifest
**As a** mobile user, **I want** to add this to my home screen **so that** it launches like an app without going through a browser.

**Acceptance Criteria:**
- [ ] `public/manifest.json` exists with `name`, `short_name`, `start_url`, `display: standalone`, `theme_color`, `background_color`
- [ ] Two icon sizes: 192x192 and 512x512
- [ ] Manifest linked in `app/layout.tsx` via Next.js metadata or `<link>` tag

---

### Story 6.2 — App metadata & SEO basics
**As a** creator sharing the link, **I want** the page to render a clean preview **so that** link shares look intentional.

**Acceptance Criteria:**
- [ ] `app/layout.tsx` sets `<title>`, `meta description`
- [ ] Open Graph tags: `og:title`, `og:description`, `og:image`
- [ ] `theme-color` meta tag matches manifest
- [ ] Viewport meta tag set correctly for mobile

---

### Story 6.3 — Navigation shell
**As a** user on any screen, **I want** to reach the support screen without completing the full flow **so that** I can support the project at any time.

**Acceptance Criteria:**
- [ ] Persistent but minimal nav exists (e.g., top-right icon or bottom bar)
- [ ] Nav links: Home (`/`), Support (`/support`)
- [ ] Nav does not distract from the affirmation full-screen experience (dismiss or overlay-friendly)

---

### Story 6.4 — Visual design pass
**As a** user, **I want** the app to feel calm and beautiful **so that** the aesthetic itself contributes to the experience.

**Acceptance Criteria:**
- [ ] Consistent color palette (dark, muted, or earthy tones — not harsh whites)
- [ ] Typography is legible and emotionally appropriate (e.g., a calm serif or humanist sans)
- [ ] Transitions between screens are smooth (no jarring hard cuts)
- [ ] No unintended layout shifts on mobile

---

## Suggested Build Order

```
Epic 1 (Foundation)       → unblocks everything
  ↓
Epic 2 + Epic 3           → entry flows (can be built in parallel)
  ↓
Epic 4                    → core experience
  ↓
Epic 5                    → completion + support
  ↓
Epic 6                    → polish + PWA (can start during Epic 4/5)
```

---

## Backlog (Post-V0)

These are captured but explicitly out of scope:

| Item | Notes |
|------|-------|
| User accounts + login | Needs backend |
| Favorites / saved messages | Needs persistence layer |
| Push notifications | Needs service worker + backend |
| Content admin UI | Needs auth + CMS layer |
| Cross-device first-visit | Needs fingerprinting or account |
| Paid / gated content | Needs payment backend |
| Advanced analytics | Plausible or Fathom recommended when needed |
| Offline-first service worker | Can add after V0 with Workbox |
