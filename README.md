# CampusConnect

India's student-to-student college guidance platform. Prospective students connect with **verified** current students for authentic information on admissions, scholarships, placements, hostel life, fees, campus life, academics and more — plus a referral/commission system for verified student ambassadors.

> ⚠️ **Project status: Phase 1 foundation + Phase 2 verification pipeline.** This repository contains a working, production-style foundation (monorepo, auth, RBAC, core data models, REST API, real-time chat scaffold, premium responsive UI) plus the **student-ambassador verification pipeline** (college-email OTP → ID upload → OCR extraction & matching → admin review, with fraud detection). It is **not** the full feature set from the original brief yet — see [Roadmap](#roadmap). The architecture is deliberately modular so the remaining phases can be layered in.

## Tech Stack

**Frontend** — Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, shadcn-style UI primitives, Framer Motion, React Hook Form, Zod, next-themes (dark mode).

**Backend** — Node.js, Express, TypeScript, MongoDB + Mongoose, JWT auth (access + refresh), Socket.io, Helmet, CORS, rate limiting, mongo-sanitize, hpp.

**Infra** — Docker + docker-compose (MongoDB + backend + frontend).

## Monorepo Structure

```
campusconnect/
├── frontend/                 # Next.js 15 app
│   └── src/
│       ├── app/              # App Router pages (landing, colleges, ambassadors, scholarships, community, auth, blog…)
│       ├── components/       # UI primitives + feature components
│       ├── context/          # Providers (theme)
│       ├── hooks/            # React hooks
│       ├── lib/              # utils, sample fallback data
│       ├── services/         # API clients (axios + server fetch)
│       └── types/            # Shared TS types
├── backend/                  # Express API
│   └── src/
│       ├── config/           # env, db
│       ├── controllers/      # Route handlers
│       ├── middleware/       # auth, validation, errors, rate limiting
│       ├── models/           # Mongoose schemas
│       ├── routes/           # API routes (v1)
│       ├── services/         # Business logic (auth, otp)
│       ├── socket/           # Socket.io real-time chat
│       ├── utils/            # helpers, seed script
│       └── validators/       # Zod schemas
├── docker-compose.yml
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 22+
- A MongoDB instance (local, or MongoDB Atlas). For local dev you can use Docker (below).
- **Tesseract OCR** — required for the verification pipeline's ID extraction when running the backend outside Docker. Install with `sudo apt-get install -y tesseract-ocr` (Debian/Ubuntu), `brew install tesseract` (macOS), or set `OCR_ENABLED=false` to skip extraction. The Docker image installs it automatically.

### 1. Backend

```bash
cd backend
cp .env.example .env          # edit secrets / Mongo URI as needed
npm install
npm run seed                  # optional: load sample colleges, scholarships, ambassador, admin
npm run dev                   # http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local    # point NEXT_PUBLIC_API_URL at the backend
npm install
npm run dev                   # http://localhost:3000
```

> The frontend renders graceful **fallback sample data** when the backend/DB is unavailable, so the UI is fully browsable even before you start the API.

### Run everything with Docker

```bash
docker compose up --build
# frontend → http://localhost:3000
# backend  → http://localhost:5000
# mongo    → localhost:27017
```

### Seeded credentials (after `npm run seed`)
- **Admin:** `admin@campusconnect.in` / `Admin@12345`
- **Ambassador:** `aarav@iitb.ac.in` / `Ambassador@123`

## API (v1)

Base URL: `http://localhost:5000/api/v1`

| Area | Endpoints |
|------|-----------|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`, `POST /auth/otp/request`, `POST /auth/otp/verify` |
| Colleges | `GET /colleges`, `GET /colleges/compare`, `GET /colleges/:slug`, `POST/PATCH/DELETE` (admin) |
| Scholarships | `GET /scholarships`, `GET /scholarships/:slug`, `POST/PATCH/DELETE` (admin) |
| Ambassadors | `GET /ambassadors`, `GET /ambassadors/top`, `GET /ambassadors/:id` |
| Reviews | `GET /reviews/college/:collegeId`, `POST /reviews` |
| Community | `GET /community`, `GET /community/:id`, `POST /community`, `POST /community/:id/like` |
| Referrals | `GET /referrals/track/:code`, `GET /referrals/analytics/me`, `PATCH /referrals/:id/approve` (admin) |
| Verification | `GET /verification/me`, `POST /verification/email/request`, `POST /verification/email/confirm`, `POST /verification/id` (multipart: `front`/`back`/`selfie`), `GET /verification/files?key=…` (owner/admin) |
| Admin | `GET /admin/stats`, `GET /admin/verifications?decision=…`, `PATCH /admin/verifications/:id` (`approve`/`reject`/`reupload`) |
| Health | `GET /health` |

Real-time chat runs over **Socket.io** (JWT-authenticated) with presence, typing indicators, read receipts and message persistence.

## Student verification pipeline (Phase 2)

Only verified college students can become ambassadors. The flow (UI at `/verify`, admin review at `/admin`):

1. **College email** — the user submits an email whose domain matches `COLLEGE_EMAIL_DOMAINS` (default `.ac.in,.edu.in,.edu,.ac.uk`). A 6-digit OTP is issued (logged in dev, emailed in prod). Duplicate verified college emails are rejected.
2. **ID upload** — front (required), back and selfie images are uploaded (`multipart/form-data`). Files are stored via a pluggable **storage driver** (`local` disk by default) and streamed back only to the owner or an admin through `GET /verification/files?key=…` — never publicly.
3. **OCR + matching** — the **Tesseract** CLI extracts text from the ID front; label heuristics parse name, college, enrollment no., course, branch and expiry. A token-overlap similarity scores the ID against the user's profile. If confidence ≥ `OCR_MIN_CONFIDENCE` with no mismatches, the record is **AI-verified**; otherwise it goes to manual review.
4. **Fraud detection** — flags `name_mismatch`, `college_mismatch`, `duplicate_enrollment`, `duplicate_id_number`, `expired_id`, and `ocr_low_extraction`. Any flag forces admin review.
5. **Admin review** — approve (promotes the user to `ambassador`, sets `verified`, and generates a unique referral code), reject, or request re-upload — with an optional note shown to the applicant.

**Storage drivers.** `STORAGE_DRIVER=local` (default) writes to `UPLOAD_DIR` on disk. An `s3` driver is the intended production target: swap the driver in `services/storage.service.ts` to put objects in S3 and return presigned URLs — the rest of the pipeline is unchanged. AWS keys are already stubbed in `.env.example`.

## Security
JWT access/refresh tokens, bcrypt password hashing, Helmet, CORS allow-list, global + auth rate limiting, Mongo injection sanitization, HTTP param pollution protection, Zod request validation, httpOnly refresh cookie. Uploaded ID documents are access-controlled (owner/admin only) and validated by MIME type and size.

## Roadmap

Phase 1 delivered the foundation; **Phase 2 (this update) delivers the student-ambassador verification pipeline** (see above). Remaining phases from the product brief:

- **S3 storage driver** — move uploaded IDs from local disk to AWS S3 with presigned URLs.
- **Real-time chat UI** — wire the Socket.io backend to a full chat interface (file/image upload, emoji, push notifications).
- **Referral & payments** — UPI/Razorpay/Stripe withdrawals, transaction history, commission rules.
- **Dashboards** — student, ambassador and admin dashboards with analytics.
- **AI modules** — recommendations, comparisons, admission checklist, career guidance, chat assistant.
- **Google OAuth**, gamification, blog CMS, PWA, comprehensive tests, and deployment hardening (Vercel + AWS EC2/S3).

## Compliance note
Ambassador opinions are personal and do not imply official affiliation with any institution unless explicitly configured by an administrator. Referral terms, privacy policy and payout rules are designed to be admin-configurable.
