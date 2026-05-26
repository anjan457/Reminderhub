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

1. Push this repo to GitHub
2. **Settings** → **Pages** → Source: **Deploy from branch**
3. Branch: `main`, folder: `/ (root)`
4. Site URL: `https://<username>.github.io/<repo-name>/`

## Tech

Static HTML, CSS, JS — `localStorage` + IndexedDB + Service Worker. No build step.

## License

MIT
