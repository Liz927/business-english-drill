# Business English Drill

A small, English-first PWA for active professional English. Five daily questions, realistic project conversations, and a clear stopping point: **“Good. Go to work.”**

## Use on your phone

[Open Business English Drill](https://liz927.github.io/business-english-drill/)

In iPhone Safari, use **Share → Add to Home Screen**. Open the app online once before using it offline. Your computer does not need to stay on. The phone experience follows RAC Commute Coach: warm paper, comfortable reading type, large controls, a shallow bottom navigation, and a focused exercise screen. Secondary navigation hides during drills and when a mobile keyboard reduces the visible writing area.

The published app and generic exercise content are public. Practice responses, notes, and progress stay in your own browser and are not committed or uploaded.

## Run locally

Requires **Node.js 22.18+ or Node.js 24 LTS** and npm. From PowerShell:

```powershell
cd path\to\business-english-drill
npm.cmd install
npm.cmd run dev
```

Open the Local URL Vite prints (normally http://localhost:5173). On other shells, use `npm` instead of `npm.cmd`.

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npm.cmd run preview
```

The production preview normally runs at http://localhost:4173. **Service-worker offline caching runs in the production build, not the development server.** Open the production preview online first, allow the worker to install, then reload once before testing offline navigation.

## What is included

- 40 authored exercises: one Scenario → English, Tone Choice, Micro Output, and Rewrite in each of 10 modules.
- Daily sets of 5 distinct questions cover all four types, favor less recently practiced items, and vary categories. A session keeps its selected IDs once started. One completed daily session per local calendar date.
- Open responses require an attempt before revealing a model answer, shorter alternative, tone explanation, and useful phrase. They are **not automatically graded or exact-matched**. Tone Choice explains every option.
- Hidden Chinese meaning hints, available through “Need a hint?”; the button can be disabled in Settings.
- Self-ratings schedule the next review: Easy in 7 local calendar days, Hesitated in 3, Difficult tomorrow. Due reviews prioritize Difficult, then Hesitated, then Easy; each review contains at most 5 questions.
- Drafts, answer-reveal state, daily and review positions, saved phrases, notes, settings, and progress survive refresh. Use Continue on the home or Review screen after reloading. An unfinished daily set from a previous date is replaced when starting the new day’s drill.
- Phrase Bank with search across phrases, examples, and notes; category filtering; editable personal notes; saved dates; removal.
- Sessions completed, answers, phrase count, recent hesitation rate, strongest category, weak categories, and a short weekly observation. The strongest category requires at least 3 attempts and uses the last 10 answers per category. Hesitation uses the last 20 answers, counting both Hesitated and Difficult. Review attempts count as answers but do not count as new daily sessions.
- Responsive light, dark, and device-selected themes; keyboard focus, labeled controls, reduced-motion support, safe-area-aware mobile navigation, and large touch targets.
- Production manifest, PNG home-screen icons, maskable icon, SVG favicon, service worker, and cached app/content assets. Updates wait for the user’s action in Settings instead of interrupting writing.

## Data and privacy

React + TypeScript + Vite + `vite-plugin-pwa`, plain CSS, and localStorage. No backend, accounts, analytics, cloud database, paid APIs, or remote font dependencies. All scenarios use fictional, generic workplace entities.

Data is stored under **`business-english-drill:v1`**, scoped to the browser profile and origin. Different ports, domains, devices, and browser profiles have separate data. Clearing browser/site data or uninstalling a PWA may remove it. Avoid entering confidential project details in practice responses. Export data in Settings to retain a JSON record; this MVP does not include an import/restore interface or cross-device sync.

If stored data is malformed, the app preserves the existing copy and blocks overwriting it, with a visible recovery message. Export the stored copy before resetting. If storage becomes unavailable or full, a visible warning asks you to keep the page open and export current in-memory data. Reset requires confirmation.

The intended usage is one active app window on one device. Simultaneous editing in multiple windows is not synchronized.

## iPhone installation

1. Open the published link above, or serve `dist/` from an **HTTPS static host** reachable on the iPhone. No server-side code or environment secrets are required.
2. Open that HTTPS address in Safari, then choose **Share → Add to Home Screen**.
3. Launch the installed app online once so its assets can be cached. After installation, test a drill and reopen it offline.

`localhost` on your computer is not reachable as that same address on your phone. A plain HTTP LAN development URL can show the interface, but is not a secure production PWA installation/offline test. Use HTTPS for the iPhone.

### GitHub Pages

The included workflow runs tests and builds on pushes to `main` or `master`, then publishes `dist/` through GitHub Actions. It sets `VITE_BASE_PATH` to the repository path automatically. Vite assets, the manifest, icons, and service-worker navigation fallback share that base so this app does not interfere with RAC's service-worker scope. Enable **Settings → Pages → Source: GitHub Actions** in a new repository. See [Vite’s GitHub Pages guide](https://vite.dev/guide/static-deploy.html#github-pages).

To reproduce a project-site build locally:

```powershell
$env:VITE_BASE_PATH = '/business-english-drill/'
npm.cmd run build
npm.cmd run preview
# Open http://localhost:4173/business-english-drill/
Remove-Item Env:VITE_BASE_PATH
```

The default remains `/` for ordinary local development. Targeting Safari 15 syntax does not replace real-device testing.

Native iPhone Safari installation, standalone launch, and iOS storage retention require a real-device check. Desktop mobile-size emulation does not establish those results.

## Content and architecture

```text
src/
  App.tsx                  Navigation, local state, session actions, settings
  types.ts                 Content, attempts, reviews, and persistence schemas
  data/exercises.ts        Editable 40-question content bank
  components/
    Drill.tsx              Four exercise flows, reveal, save, self-rating
    PhraseBank.tsx         Search, filter, personal notes
    Progress.tsx           Useful, non-gamified practice metrics
    Icon.tsx               Small inline SVG icon set
  lib/
    schedule.ts            Calendar-day review and daily-set selection
    storage.ts             Versioned loading, validation, JSON export
    *.test.ts              Content and scheduling checks
  styles.css               Responsive theme and component styles
public/                    Offline-safe app icons
scripts/browser-check.cjs  Optional browser acceptance check
vite.config.ts             Vite and production PWA configuration
```

To add content, append a `q(...)` entry in `src/data/exercises.ts` using a unique stable ID. Each entry defines type, category, scenario, prompt, model/alternative answers, explanation, phrase, Chinese meaning hint, and tags. The helper sets a difficulty and expands phrases/options into the typed `Exercise` format. Tone questions require four options with individual explanations and a zero-based preferred answer. Add more phrases by extending the returned `phrases` array. Avoid changing an existing ID to represent a different question because review history uses IDs.

All 10 modules are available in Progress. They are deliberately not an additional unlimited drill-selection flow.

A feature-detected, read-only `get_drill_progress` WebMCP tool exposes aggregate counts in browsers implementing `document.modelContext`. It never exposes written answers. Unsupported browsers simply ignore it. Native WebMCP runtime validation is not included in the Edge acceptance check.

## Verification

`npm test` uses Node’s built-in test runner and type stripping; no unit-test framework is needed. Tests cover calendar boundaries, interval calculation, due-date inclusion, weak-item priority, stable/unique daily selection, all modules/types, and complete tone feedback.

The optional browser check uses Playwright with installed Microsoft Edge and isolated temporary browser profiles. It never touches the user’s regular browser data. It covers daily and review flows, drafts/reveals across reloads, hints, phrase search/filter/notes, metrics, theme persistence, JSON export, reset cancellation, production offline reload/write, manifest icons, narrow layouts, and storage failure states. It modifies due dates only inside its own temporary test profile to exercise overdue reviews.

To run it with a separate Playwright installation, start the production preview on port 4173, then:

```powershell
$env:PLAYWRIGHT_MODULE = 'C:\path\to\node_modules\playwright'
node scripts/browser-check.cjs
```

Optionally set `DRILL_TEST_URL` to another production preview URL. Screenshots go to ignored `test-results/`. Browser automation uses the available Node Playwright runtime because Python Playwright was not installed in the build environment.

PWA implementation reference: [vite-plugin-pwa guide](https://vite-pwa-org.netlify.app/guide/) and [prompted updates](https://vite-pwa-org.netlify.app/guide/prompt-for-update).
