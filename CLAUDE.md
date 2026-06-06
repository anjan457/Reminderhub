# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Myndly** — an offline-first PWA and macOS Electron app for reminders, todos, calendar, and focus mode. All data lives in browser `localStorage` + IndexedDB. No backend yet (cloud sync is a future roadmap item via Supabase).

## Running the app

**Web / PWA:**
```bash
npx serve .       # open http://localhost:3000
```

**macOS desktop (Electron):**
```bash
npm install
npm start          # run Electron window
npm run dist:mac   # build .dmg + .zip in dist/
```

No test suite — testing is manual only.

## Architecture

Single-page app with three main files:

| File | Role |
|---|---|
| `index.html` | App shell, all HTML panels and modals |
| `app.js` | All state, logic, and DOM interaction (~4 500 lines) |
| `styles.css` | CSS custom-property theming, animations (~3 800 lines) |
| `sw.js` | Service worker — offline cache, scheduled todo notifications |
| `sync-store.js` | Thin IndexedDB wrapper used by both app.js and sw.js |

## Data flow

State lives in `localStorage` (keys prefixed `rh_`). On every write, the app also mirrors state to IndexedDB so the service worker can read it when the browser tab is closed.

```
app.js state → localStorage → IndexedDB (sync-store.js) → sw.js (notifications)
```

## Key data models

```js
// Reminder
{ id, title, date, endDate, time, category, priority, note,
  pinOrder, completed, repeat, createdAt, targetISO, studyPlan? }

// Todo
{ id, title, completed, time, date, category, priority, note,
  notifyBefore, notificationSentFor, tags[], subtasks[] }

// DailyTask (calendar day entry)
{ id, title, date, time, category, priority, note, tags[], completed, linkedTodoId }
```

## Key utilities in app.js

- `readStorageArray()` / `readStorageString()` — safe localStorage reads
- `saveReminders()` / `saveTodos()` — persist + sync to IndexedDB
- `normalizeReminders()` / `normalizeTodos()` — sanitize/back-fill fields
- `createReminderObject()` / `createTodoObject()` — factory functions
- `applyTheme()` / `setTheme()` / `toggleDarkMode()` — theme management

## Theming

Four colour themes (default/indigo, blue, green, purple) plus dark mode. Themes are CSS custom-property sets applied on `<body>`. Theme state is stored in localStorage.

## Roadmap context

Cloud sync (Google Sign-In + Supabase), email notifications (Resend), and mobile (Capacitor) are planned but not started. All current code assumes offline-only local storage.
