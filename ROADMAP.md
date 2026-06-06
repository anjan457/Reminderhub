# Myndly — Roadmap

## Cloud + Auth + Email Notifications

### Goal
- Data will be saved in the cloud
- Same account will show the same data on any device
- Reminder emails even when the browser is closed

---

### Stack (all free tier)

| Service | Role |
|---------|------|
| **Supabase** | Database + Google Auth |
| **Resend** | Email notification |
| **Netlify** | Hosting + Serverless Functions |

---

### Features

1. **Google Login** — Sign in with Google via Supabase Auth
2. **Cloud Sync** — Save reminders and todos in Supabase database
3. **Multi-device** — Same Google account = same data everywhere
4. **Email Notifications** — Emails via Resend even when the browser is closed
5. **Scheduled Checks** — Netlify Scheduled Functions check every hour

---

### Current Limitation
All data is only in the browser's `localStorage` — changing browser or device loses the data.
