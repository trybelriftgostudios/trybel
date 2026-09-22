# Trybel — Verified College-Native Mobile & Backend Platform

Trybel is a verified college-only social and collaboration app built with **React Native (Expo)** on the frontend and a **Node.js (Fastify / TypeScript)** backend with strict multi-tenant college-scoping security.

> **"College-first by default. Intentionally open when it creates value."**

---

## 🏛️ Key Capabilities & Behavioral Rules

1. **Email Domain Verification & Scoping**:
   - Students join only after validating an active college email domain (e.g. `@stpeters.edu`).
   - Every read and write enforces server-side college-scoping.
2. **Study Partner Finder**:
   - **Strictly college-only**. No cross-college discovery or matching exists.
3. **Hackathon Team Formation**:
   - **Dual visibility toggle** (`College only` vs `Open to other colleges`).
   - Cross-college applicants display verified campus badges to the team owner before acceptance.
4. **Clubs & Events**:
   - **Independent dual toggles**: (1) Visibility (`College` vs `Everyone`) and (2) Registration eligibility (`College-only` vs `Cross-college`).
   - Post-event feedback forms are private to registered attendees and verified club organizers.
5. **Scoped Chat & Moderation Pipeline**:
   - Scoped threads only (DMs, team threads, event threads, study-match threads, announcement channels).
   - Automated content screening with immediate quarantine (`hold_for_review`) for high-risk flags ($S \ge 0.85$).
6. **Friends & Photo Sharing**:
   - Private `photo_audiences` join table.
   - Non-public private S3 bucket with **15-minute expiring signed URLs**.
   - Unfriending immediately revokes photo access.
7. **Per-College Chatbot**:
   - Partitioned knowledge base `WHERE college_id = :college_id`.
   - Inline source attribution (*"Source: Academic Calendar (St. Peter's Engineering College)"*).
8. **Trust, Safety & Audit Logs**:
   - In-app reporting on profiles, messages, events, and teams.
   - Immutable audit trail in `admin_activity_logs` for all moderator/admin actions.

---

## 📱 18 App Screens

1. **Splash Screen** — Logo, tagline *"Your People. Your Campus."*, CTA.
2. **Onboarding Carousel** — 5 feature highlight cards with pagination dots.
3. **College Verification** — Domain validation, magic link / OTP, secondary OAuth.
4. **Home Feed** — *For You*, *College*, *Following* tabs, quick actions, feed with dual-scoping tags.
5. **Discover** — Search bar, category filter chips, Suggested For You, Explore tiles, Trending section.
6. **Study Partner Finder** — Hard-restricted to college network, subject/skill inputs, mode selector, suggested matches.
7. **Hackathon Teams** — Teams & My Teams, search, filter pills, team cards, Create Team modal with dual visibility toggle.
8. **Clubs & Events** — Events & Clubs tabs, independent visibility & registration toggles, Register CTA, private post-event feedback.
9. **Chat** — Scoped threads list (*All / Friends / Groups*), thread modal with live composer & moderation screening.
10. **Friends & Photos** — Request accept/decline, suggested friends, friend-only photo grid with signed expiring links.
11. **Challenges** — Active & My Challenges tabs, daily campus puzzle format with interactive quiz modal.
12. **Profile** — Verified badge, affiliation, stats counters, About, skills/interests tags, Edit Profile modal.
13. **College Chatbot** — Dedicated *St. Peter's AI*, quick suggestions, inline source citations, calendar/map action cards.
14. **Notifications** — Category tabs (*All / Mentions / Team / Events*), deep-link navigation.
15. **Settings & Privacy** — Campus privacy scoping explanations, notification preferences, theme lock, Log Out.
16. **Report User** — Radio reason selector, details input, confidential submission to safety queue.
17. **Admin/Moderator Panel** — Safety queue, action modal with mandatory audit reason, club verification toggle, immutable audit log stream.
18. **Menu / More** — Profile shortcut tile, quick access links, Log Out CTA.

---

## 🛠️ Project Structure

```
trybel/
├── backend/
│   ├── src/
│   │   ├── db/                 # DB adapter, persistence & two-college seed data
│   │   ├── middleware/         # JWT auth & collegeScopePlugin
│   │   ├── modules/            # Auth, study partners, teams, clubs, events, chat, friends, bot, reports, admin
│   │   ├── services/           # MediaStorage presigned URLs, ModerationService
│   │   ├── types/              # Domain TypeScript types
│   │   └── server.ts           # Fastify + Socket.io server
│   ├── tests/
│   │   └── auth-scope.test.ts  # 21-test multi-tenant authorization security test suite
│   ├── package.json
│   └── tsconfig.json
│
└── mobile/
    ├── App.tsx                 # Root router coordinating all 18 screens
    ├── src/
    │   ├── components/         # AudienceBadge, BottomNavBar, etc.
    │   ├── screens/            # 18 screen components
    │   ├── services/           # Typed API client with LAN IP / Web support
    │   └── theme/              # Dark mode design system
    ├── package.json
    └── app.json
```

---

## 🚀 Running Locally

### 1. Backend Server
```bash
cd backend
npm install
npm run build
npm start
# API available at http://localhost:4000
```

### Run Backend Authorization Tests
```bash
cd backend
npm test
```

### 2. Expo Mobile App
```bash
cd mobile
npm install
npm run web       # Launch in browser via React Native Web (http://localhost:8081)
npm run android   # Launch on Android emulator or device
npm run ios       # Launch on iOS simulator or device
```
