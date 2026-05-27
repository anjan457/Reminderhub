# Myndly

Offline-first reminder & todo PWA — reminders, calendar, todos, focus mode, and local notifications.

## Features

- Upcoming reminders with pin order and categories
- Todo list with time-based alerts (5 min – 2 hours before)
- Calendar-linked daily tasks
- Dark mode and color themes
- Installable PWA (works offline after first load)
- Optional daily email digest for reminders (needs internet)

## Run locally

```bash
cd notify
npx serve .
```

Open the URL shown (e.g. `http://localhost:3000`) — **do not** open `index.html` directly (`file://` breaks install & service worker).

## Install as app

1. Serve over `http://localhost` or deploy to HTTPS
2. Menu **☰** → **Install app**
3. Or Chrome **⋮** → Install / Add to Home screen

## PWA update behavior

- Service worker cache is versioned and updates automatically.
- When a new version is available, the app prompts: **"New version available. Update now?"**
- Click **OK** to refresh and use latest files immediately.

## PWA release checklist

1. Deploy over HTTPS (or localhost in dev).
2. Hard refresh once after deploy (`Cmd+Shift+R`).
3. Verify app installs from browser menu.
4. Verify offline open works after first load.
5. Verify reminder/todo notification permissions are granted.

## macOS desktop app (MacBook)

1. Install dependencies:

```bash
npm install
```

2. Run as a desktop app:

```bash
npm start
```

3. Build macOS installer (`.dmg` + `.zip` in `dist/`):

```bash
npm run dist:mac
```

## GitHub Pages

1. **Settings** → **Pages** → Source: **Deploy from a branch** → `main` → `/ (root)` → Save
2. **Custom domain:** leave **empty** (do not type the github.io URL there)
3. Open: `https://anjan457.github.io/Reminderhub/` (wait 2–10 min after first setup)

## Recent updates (work log)

### PWA + installability

- Service worker cache versioning and instant update flow (`SKIP_WAITING` + reload) added.
- Manifest and app icon paths corrected to valid PNG assets for reliable install prompt.
- Offline shell caching and install prompt flow improved for Chrome/PWA usage.

### Notification + digest fixes

- Daily digest logic fixed: email now sends even when browser alerts are disabled.
- Notification history channel tagging improved (`email`, `browser`, `email+browser`, `digest`).
- Todo reminder permission + background sync flow refined through service worker state updates.

### Todo / Today panel improvements

- Duplicate add protection implemented for todos (guard + temporary add-button disable).
- Duplicate Today entries fixed (todo + linked planner mirror no longer shown twice).
- Today panel now separates `Today Tasks` and `Completed` sections.
- Added Today panel clear-completed action (with confirmation).
- Added floating Trash button above Today FAB; completed tasks move to Trash view.
- Todo filter chip label updated from `Completed` to `Trash`; default list emphasizes active items.

### Desktop app packaging

- Electron wrapper added (`electron/main.js`) for macOS desktop runtime.
- Build scripts added in `package.json` (`npm start`, `npm run dist:mac`).
- macOS artifacts (`.dmg`, `.zip`) generation documented and tested.

### Project hygiene + docs

- `dist/` added to `.gitignore` to avoid committing build artifacts.
- `ROADMAP.md` added for future cloud sync/auth/email plan.
- README expanded with PWA behavior, release checklist, macOS run/build instructions, and this work log.

## Tech

Static HTML, CSS, JS — `localStorage` + IndexedDB + Service Worker. No build step.

## License

MIT
