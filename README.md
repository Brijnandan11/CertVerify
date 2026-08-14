# CertVerify — Digital Certificate Verification Platform

## Stack
Backend: Node.js, Express, TypeScript, PostgreSQL (raw SQL via `pg`), Zod, JWT, Pino, pdfkit, qrcode.
Frontend: React, TypeScript, Vite, Tailwind CSS.

## Single link (easiest)

The backend serves the built frontend, so **one URL runs the whole app**:

```bash
cp backend/.env.example backend/.env
# edit backend/.env — set JWT secrets + DATABASE_URL

cd frontend && npm install && npm run build
cd ../backend && npm install && npm run build && npm start
```

Open **http://localhost:4000** — frontend and API both work there.

If your Postgres password contains `@`, encode it as `%40` in `DATABASE_URL`.

## Full docker path (also a single link)

```bash
docker compose up --build
```

Open **http://localhost:4000** — the backend container serves both the API
(`/api/v1`) and the built frontend. Postgres runs on port `5439`.

## Local dev (hot reload, two ports)

```bash
cp backend/.env.example backend/.env
# edit backend/.env — set JWT secrets

docker compose up -d postgres
cd backend && npm install && npm run dev   # migrations run automatically on start
# in a second terminal
cd frontend && npm install && npm run dev
```

Backend: http://localhost:4000 (API only)
Frontend: http://localhost:5173 (proxies `/api` to the backend)

If your backend is running elsewhere, set `VITE_API_BASE_URL` in `frontend/.env`
to that server's `/api/v1` URL.

## Core flow
1. Register org + admin user → `/register`
2. Login → `/login`
3. Create certificate (wizard) → generates unique `CERT-YYYY-XXXXXXXX` id, SHA-256 hash, QR pointing at `/verify/:certificateId`
4. Download PDF (A4 landscape, embedded QR)
5. Anyone opens `/verify/:certificateId` → public, no auth, shows VALID / REVOKED / EXPIRED / NOT FOUND

## Deploy to Render (single service)

The root `Dockerfile` (same build as `backend/Dockerfile`) serves both the API and
the built frontend, so one web service is enough:

1. Connect the repo to Render and use [render.yaml](/home/brij/certverify/render.yaml) as the blueprint.
2. Render will create:
   - one Web Service named `devinx`
   - one PostgreSQL database named `devinx-db`
3. Deploy. The backend container serves both the API and the built frontend at the same URL.
4. If you configure it manually instead of using the blueprint, make sure:
   - Root Directory is `/`
   - Dockerfile Path is `Dockerfile`
   - `DATABASE_URL` comes from Render Postgres
   - `PUBLIC_APP_URL` and `CORS_ORIGIN` match the service URL, or let the app use `RENDER_EXTERNAL_URL`

## Tests
```bash
cd backend && npm test
```
