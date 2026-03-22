# PRD — WYC (Working Name) V0
**Status:** Draft v0.1  
**Last Updated:** 2026-03-22  
**Progression:** Brief ✅ → **PRD (this doc)** → Arch → Epics/Stories

---

## 1. Problem Statement

People move through their days disconnected from intentional thought. Affirmation and reflection tools either require too much commitment (journaling apps, meditation programs) or too little care (social media quotes, screensaver widgets). There is no calm, ritual-grade, zero-friction experience that meets someone at the moment they want grounding — on their phone, in a browser, right now.

WYC fills that gap in V0 as a minimal, beautiful, mobile-first web experience.

---

## 2. Target User

### Primary Persona — "The Intentional Pauser"
- Age 25–45, any gender
- Reached for their phone in a moment of stress, transition, or seeking calm
- Not looking to sign up for anything
- Wants to feel something real in under a minute
- Appreciates design and slower pacing
- Open to supporting indie projects if the experience moves them

### Out of Scope (V0)
- Power users who want personalization, history, or saved favorites
- Desktop-optimized layouts (the app is mobile-first but won't break on larger screens)
- Accessibility accommodations beyond mobile-first responsive layout and WCAG AA contrast *(expanded in V1)*

---

## 3. Goals & Success Metrics

| Goal | Signal | Target (V0 launch) |
|------|--------|-------------------|
| Deliver calming experience | Session completion rate (all affirmations viewed) | > 40% |
| Encourage presence | Average time-per-affirmation card | ≥ 8 seconds |
| Support conversion | Click-through on donation link | > 5% of sessions |
| Return visits | Repeat sessions from same device | Trackable (no target yet) |
| Content freshness | Creator can update content without code deploy | Must-have |

*Note: V0 has no built-in analytics. These metrics are aspirational targets — measurable once lightweight privacy-first analytics (e.g. Plausible) are added in a future version. For V0 launch, success is qualitative: does the experience feel right?*

---

## 4. User Flows

### 4.1 First Visit (Per Device)
```
Land on site
  └─ Show: Welcome Screen
        ├─ Play / skip intro audio
        └─ Enter → Daily Welcome
```

- "First visit" is detected via `localStorage` flag per device/browser
- Not a global uniqueness check — cross-device deduplication is deferred

### 4.2 Daily Welcome
```
Daily Welcome Screen
  ├─ Show: welcome message text
  ├─ Show: optional audio player
  └─ CTA: Begin / Enter
        └─ Enter → Affirmation Flow
```

- One active welcome message at a time (controlled by `effectiveDate` range in content)
- Same message shown to all users that day/week

### 4.3 Affirmation Flow (Core)
```
Affirmation Card (full-screen)
  ├─ Show: message text
  ├─ Show: optional image
  ├─ Show: optional attribution
  ├─ Timer: ~5–10s countdown (visual indicator, not a hard block)
  └─ Advance (tap / button, enabled after timer)
        ├─ Next card → repeat
        └─ End of sequence → Completion / Support Screen
```

- Messages served in shuffled, non-repeating order per session
- Shuffle seed is re-randomized per session (not stored)

### 4.4 Support / About
```
Support Screen (reachable from nav + end of flow)
  ├─ Short creator note
  └─ "Support this project ❤️" → external link (Ko-fi / PayPal / Stripe)
```

---

## 5. Functional Requirements

### FR-01 · Welcome Screen
- **FR-01a** Show a welcome screen on the user's first visit to the domain (per device/browser).
- **FR-01b** The welcome screen includes an optional audio clip with play/skip controls.
- **FR-01c** The welcome screen has a clear CTA to proceed into the daily welcome.
- **FR-01d** On subsequent visits, skip the welcome screen — user lands on the Daily Welcome.

### FR-02 · Daily Welcome
- **FR-02a** Display a single active welcome message determined by the current date against a configured `effectiveDate` range.
- **FR-02b** The welcome message supports text and an optional audio file.
- **FR-02c** If no active welcome message exists for the current date, show a default fallback message.

### FR-03 · Affirmation Viewer
- **FR-03a** Display one affirmation at a time in a full-screen card layout.
- **FR-03b** Each card shows message text, and optionally an image and attribution string.
- **FR-03c** A visual timer (progress bar or countdown) runs for a configurable duration (default 7 seconds) as a presence nudge. The advance button is always available — the timer encourages pausing, it doesn't gate progression.
- **FR-03d** User advances to the next card via tap or button press.
- **FR-03e** Messages appear in a shuffled, non-repeating sequence drawn from the active content pool.
- **FR-03f** Only affirmations with `active: true` are included in the pool.
- **FR-03g** After the last message, transition the user to the Support/Completion screen.

### FR-04 · Support Screen
- **FR-04a** The support/about screen is reachable from persistent navigation AND at the end of a completed affirmation sequence.
- **FR-04b** The screen shows a short creator note (plain text, configurable in content).
- **FR-04c** The screen links to an external donation platform (URL configurable, not hardcoded).

### FR-05 · Content Management
- **FR-05a** Content (affirmations, welcome messages, support text, donation URL) is manageable without code changes or redeployment.
- **FR-05b** V0 uses file-based content: JSON files in a server-accessible `/content/` folder, editable in-place without a build step.
- **FR-05c** The content schema is versioned to support future migration.

### FR-06 · PWA / Home Screen
- **FR-06a** Include a web app manifest enabling "Add to Home Screen" prompts on iOS/Android.
- **FR-06b** Configure a basic app icon and splash color.

---

## 6. Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-01 | Mobile-first layout | Designed for 375px–430px viewport; usable up to 1440px |
| NFR-02 | Performance | First Contentful Paint < 1.5s on 4G mobile |
| NFR-03 | Accessibility | WCAG 2.1 AA color contrast on all text; keyboard-navigable flow |
| NFR-04 | Offline tolerance | Core affirmation content available after first load (static bundle) |
| NFR-05 | Privacy | No user data collected; no third-party tracking pixels; no cookies beyond `localStorage` |
| NFR-06 | Hosting | Fully deployable as a static export (no Node.js server at runtime) |

---

## 7. Content Schema (V0)

### Affirmation
```ts
interface Affirmation {
  id: string;           // unique slug
  text: string;         // display text
  attribution?: string; // optional source/author
  imageUrl?: string;    // optional image (relative or absolute URL)
  category?: string;    // reserved, unused in V0
  active: boolean;      // controls inclusion in pool
}
```

### Welcome Message
```ts
interface WelcomeMessage {
  id: string;
  text: string;
  audioUrl?: string;    // optional hosted audio file
  effectiveDateStart: string; // ISO date "YYYY-MM-DD"
  effectiveDateEnd: string;   // ISO date "YYYY-MM-DD"
}
```

### Site Config
```ts
interface SiteConfig {
  donationUrl: string;
  supportNote: string;     // creator's message on support screen
  timerDurationMs: number; // default: 7000
  appName: string;
}
```

---

## 8. Out of Scope (V0)

- User accounts or authentication
- Server-side session management
- Cross-device "first visit" deduplication
- In-app content editor or admin UI
- Paid/gated content
- Push notifications or reminders
- Favorites, saved messages, or history
- App Store (iOS/Android) distribution
- Analytics beyond basic hosting-level page views

---

## 9. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| Q1 | What is the target domain? | Creator | Open |
| Q2 | Should "first visit" reset on browser data clear, or is that acceptable? | Creator | Acceptable for V0 |

**Resolved:**
- ~~Content backend~~ → File-based JSON in a server-accessible `/content/` folder, editable in-place
- ~~Timer hard vs soft~~ → Soft. Timer is a presence nudge; advance button is always available
- ~~Audio hosting~~ → External URLs referenced in content JSON. Creator hosts audio anywhere and pastes the URL

---

## 10. Definition of Done (V0)

- [ ] User can reach the site on a mobile browser
- [ ] First-visit welcome screen appears once per device
- [ ] Daily welcome message renders correctly
- [ ] Affirmation cards cycle with timer behavior
- [ ] Support / donation screen accessible
- [ ] Creator can update content (add/edit affirmations) without a code deploy
- [ ] Web app manifest in place for PWA-lite home screen install
- [ ] Deployed and accessible via public URL
