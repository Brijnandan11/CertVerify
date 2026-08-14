# CertVerify — Digital Certificate Verification Platform

## Stack
Backend: Node.js, Express, TypeScript, PostgreSQL (raw SQL via `pg`), Zod, JWT, Pino, pdfkit, qrcode.
Frontend: React, TypeScript, Vite, Tailwind CSS.

## Setup

```bash
cp backend/.env.example backend/.env
# edit backend/.env — set JWT secrets

docker compose up -d postgres
cd backend && npm install && npm run migrate && npm run dev
# in a second terminal
cd frontend && npm install && npm run dev
```

Backend: http://localhost:4000
Frontend: http://localhost:5173

## Full docker path

```bash
docker compose up --build
```

## Core flow
1. Register org + admin user → `/register`
2. Login → `/login`
3. Create certificate (wizard) → generates unique `CERT-YYYY-XXXXXXXX` id, SHA-256 hash, QR pointing at `/verify/:certificateId`
4. Download PDF (A4 landscape, embedded QR)
5. Anyone opens `/verify/:certificateId` → public, no auth, shows VALID / REVOKED / EXPIRED / NOT FOUND

## Tests
```bash
cd backend && npm test
```
