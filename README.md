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

## GitHub Pages

1. **Settings** → **Pages** → Source: **Deploy from a branch** → `main` → `/ (root)` → Save
2. **Custom domain:** leave **empty** (do not type the github.io URL there)
3. Open: `https://anjan457.github.io/Reminderhub/` (wait 2–10 min after first setup)

## Tech

Static HTML, CSS, JS — `localStorage` + IndexedDB + Service Worker. No build step.

## License

MIT
