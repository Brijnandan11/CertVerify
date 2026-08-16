# CertVerify

Digital certificate verification platform. Organizations issue tamper-evident certificates with a unique ID, SHA-256 hash, and embedded QR code; anyone can verify a certificate's authenticity — VALID, REVOKED, EXPIRED, or NOT FOUND — without logging in.

## Tech Stack

**Backend** — Node.js, Express, TypeScript, PostgreSQL (raw SQL via `pg`), Zod, JWT, Pino, pdfkit, qrcode
**Frontend** — React, TypeScript, Vite, Tailwind CSS

## How It Works

1. An organization registers and creates an admin user via `/register`, then logs in via `/login`.
2. An admin creates a certificate through the wizard — the backend generates a unique `CERT-YYYY-XXXXXXXX` id, computes a SHA-256 hash of the certificate data, and embeds a QR code pointing at `/verify/:certificateId`.
3. The certificate can be downloaded as a PDF (A4 landscape, embedded QR).
4. Anyone can open `/verify/:certificateId` — no auth required — and see the certificate's status: VALID, REVOKED, EXPIRED, or NOT FOUND.
5. In production, the backend serves the built frontend, so the API and UI run behind a single URL.

## Config

Set environment variables in `backend/.env` (copy from `backend/.env.example`):

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string. If the password contains `@`, encode it as `%40`. |
| `JWT_*` secrets | Access/refresh token signing secrets |
| `PUBLIC_APP_URL` | Public URL the app is served at (used in QR codes / links) |
| `CORS_ORIGIN` | Allowed origin for API requests |
| `VITE_API_BASE_URL` | (frontend only) API base URL, e.g. `http://localhost:4000/api/v1` — used when frontend and backend run on separate ports |

## Run Modes

| Mode | Description |
|---|---|
| Single link (production build) | Backend serves the built frontend — one URL for everything |
| Docker | `docker compose up --build` — same single-URL setup, containerized |
| Local dev | Hot reload, two ports — frontend proxies `/api` to the backend |

## CLI Examples

```bash
# Single link — build once, serve everything from one URL
cp backend/.env.example backend/.env
# edit backend/.env — set JWT secrets + DATABASE_URL
cd frontend && npm install && npm run build
cd ../backend && npm install && npm run build && npm start
# → http://localhost:4000  (frontend + API)

# Docker — also a single link
docker compose up --build
# → http://localhost:4000  (API at /api/v1, Postgres on 5439)

# Local dev — hot reload, two ports
cp backend/.env.example backend/.env
# edit backend/.env — set JWT secrets
docker compose up -d postgres
cd backend && npm install && npm run dev   # migrations run automatically
# in a second terminal
cd frontend && npm install && npm run dev
# → backend: http://localhost:4000 (API only)
# → frontend: http://localhost:5173 (proxies /api to backend)
```

## Core Flow

| Step | Route |
|---|---|
| Register org + admin user | `/register` |
| Login | `/login` |
| Create certificate (wizard) | generates `CERT-YYYY-XXXXXXXX` id, SHA-256 hash, QR → `/verify/:certificateId` |
| Download certificate PDF | A4 landscape, embedded QR |
| Public verification | `/verify/:certificateId` — no auth — VALID / REVOKED / EXPIRED / NOT FOUND |

## Deploy to Render

The root `Dockerfile` (same build as `backend/Dockerfile`) serves both the API and the built frontend, so one web service is enough.

1. Connect the repo to Render and use [`render.yaml`](/home/brij/certverify/render.yaml) as the blueprint.
2. Render creates:
   - one Web Service named `devinx`
   - one PostgreSQL database named `devinx-db`
3. Deploy — the container serves the API and frontend at the same URL.
4. Configuring manually instead of using the blueprint:

| Setting | Value |
|---|---|
| Root Directory | `/` |
| Dockerfile Path | `Dockerfile` |
| `DATABASE_URL` | from Render Postgres |
| `PUBLIC_APP_URL` / `CORS_ORIGIN` | match the service URL, or rely on `RENDER_EXTERNAL_URL` |

## Development

| Command | Description |
|---|---|
| `cd backend && npm run dev` | Run backend with hot reload (migrations run automatically) |
| `cd frontend && npm run dev` | Run frontend dev server on port 5173 |
| `cd backend && npm run build && npm start` | Build and run backend for production |
| `cd frontend && npm run build` | Build frontend for production (served by backend) |
| `cd backend && npm test` | Run backend tests |
| `docker compose up --build` | Build and run the full stack in Docker |
| `docker compose up -d postgres` | Run only Postgres, for local dev against the host backend |

## License

Distributed under the MIT License. See `LICENSE` for details.
