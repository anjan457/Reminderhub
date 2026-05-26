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

1. Push to `main` (workflow `.github/workflows/pages.yml` deploys automatically)
2. Repo **Settings** → **Pages** → **Build and deployment** → Source: **GitHub Actions**
3. After the first workflow run (1–3 min), open: `https://anjan457.github.io/Reminderhub/`

If you see **404**: Pages is not enabled yet — complete step 2 above, then check **Actions** tab for a green deploy.

## Tech

Static HTML, CSS, JS — `localStorage` + IndexedDB + Service Worker. No build step.

## License

MIT
