# Myndly — Roadmap

## Cloud + Auth + Email Notifications

### Goal
- Data cloud এ save হবে
- Same account দিয়ে যেকোনো device এ same data দেখাবে
- Browser বন্ধ থাকলেও email এ reminder পাবে

---

### Stack (সব free tier)

| Service | কাজ |
|---------|-----|
| **Supabase** | Database + Google Auth |
| **Resend** | Email notification |
| **Netlify** | Hosting + Serverless Functions |

---

### Features

1. **Google Login** — Supabase Auth দিয়ে Google account এ sign in
2. **Cloud Sync** — Reminders ও Todos Supabase database এ save
3. **Multi-device** — same Google account = same data সব জায়গায়
4. **Email Notifications** — browser বন্ধ থাকলেও Resend দিয়ে email আসবে
5. **Scheduled Checks** — Netlify Scheduled Functions প্রতি ঘণ্টায় check করবে

---

### Current Limitation
এখন সব data শুধু browser এর `localStorage` এ — browser বা device বদলালে data থাকে না।
