# Myndly — Future Plan

This file tracks Myndly's future direction and work order. Cloud/auth technical details live in `ROADMAP.md`.

---

## What you're building

A **personal productivity app** — reminders, daily study plan, todo, calendar, focus mode, notes.

**Current philosophy:** offline-first. Data lives in the device/browser's `localStorage` + IndexedDB.

---

## Future — three tiers

### 1. Now (what exists / in progress)

| Part | Description |
|------|-------------|
| **Web + PWA** | Installable on phone, runs offline |
| **macOS Electron** | Desktop app (`npm start`, `npm run dist:mac`) |
| **Daily Study Plan** | No separate panel — lives inside reminder |
| **Notifications** | Local alerts; 7 AM digest (email partial, `formsubmit.co`) |
| **UI** | English; mobile layout fixed; delete-confirm modal |

**Main limit:** data does not survive a device or browser switch. No auto-sync via Google/Gmail.

---

### 2. Next big step — one Google account, same data everywhere

| Feature | Work |
|---------|------|
| **Google Sign-In** | Log in with Gmail account (data is not stored in inbox) |
| **Cloud sync** | Reminders, todos, study plans in Supabase |
| **Multi-device** | Mac Electron + phone + browser — same data |
| **Server email** | Resend — reminder email even when browser is closed |
| **Scheduled jobs** | Netlify Scheduled Functions — check and send on time |

**Stack (free-tier idea):** Supabase + Resend + Netlify — full details in `ROADMAP.md`.

**Electron + Google sync:** Electron is just a shell around the web app. Real sync = **Google Login + cloud DB**; once that's added, Mac, web, and Android all share the same logic. Syncing directly into the Gmail inbox is usually not the path.

---

### 3. Mobile app

| Platform | Method | Status |
|----------|--------|--------|
| **Android (first)** | Capacitor — same HTML/JS/APK | Planned |
| **iOS (later)** | Same Capacitor project | After Android |
| **Play Store** | Signed AAB, Play Developer (~$25 one-time) | After build |

**Alternative (faster, less native):** TWA — wraps the hosted PWA URL into a Play Store listing. Capacitor is better when you want files bundled in the APK and native notifications later.

No need to rewrite in Flutter/React Native — the current codebase is the foundation.

---

## Partially done — to complete later

| Feature | Now | Future |
|---------|-----|--------|
| **Repeat** (Daily/Weekly/Monthly) | UI + badge mostly | Real recurring notifications |
| **Study plan** | Works inside reminders | Cloud sync + more reporting |
| **Email digest** | Browser/form-based | Resend + server |
| **Data sync** | Local only | Google + Supabase |

---

## Long-term vision

```
[ Now ]
  PWA Web ──┐
  Electron Mac ──┼──► Local storage (separate per device)

[ Future ]
  PWA + Electron + Android + iOS
           │
           ▼
    Google Sign-In
           │
           ▼
    Supabase (cloud)
           │
           ├──► Same reminder / todo / study plan on every device
           └──► Resend (background email)
```

**One-liner:** today, a strong offline tool for one device → tomorrow, a Google-synced, multi-platform (Mac + Android + web) productivity app, Android on Play Store, iOS later, with background email.

---

## Recommended work order

1. **Android (Capacitor)** — run as a real app on phone, test UI/notifications
2. **Google Login + Supabase** — sync (Electron + Android + web all benefit at once)
3. **Resend + scheduled email** — reminders even when browser is closed
4. **Repeat notifications** — fix true recurring behavior
5. **Play Store** — publish (privacy policy URL, etc.)

---

## Preferences & constraints (kept in mind)

- **Plan and explain first** — when only advice is asked, don't write code/scaffold
- Git **commit/push done manually** by user
- App UI stays in **English**
- Priority dropdown in Upcoming is fine; **full Edit reminder panel** was not requested
- Delete button has **confirm popup** — done

---

## Needed later for Play Store / release

- Google Play Developer account
- Signed AAB (Android Studio)
- Privacy policy URL (usually required even when data is local)
- `@capacitor/local-notifications` for reliable Android notifications (second step)

---

## Related files

| File | Topic |
|------|-------|
| `ROADMAP.md` | Cloud, Auth, Email — tech stack and feature list |
| `README.md` | Running the app, PWA, Electron, GitHub Pages |
| `package.json` | Electron macOS build |

---

*Last updated: per conversation — Myndly future vision*
