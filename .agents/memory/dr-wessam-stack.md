---
name: Dr Wessam Clinic Stack
description: Architecture, login credentials, and key decisions for the clinic management system
---

## Architecture
- `client/` — React + Vite on port 5000 (host 0.0.0.0, allowedHosts: all)
- `server/` — Express.js on port 3001 (no host binding, listens on all interfaces)
- Database: MongoDB Atlas (MONGODB_URI env var)

## Workflows
- "Start application" → `cd client && npm run dev` (webview, port 5000)
- "Backend API" → `cd server && node index.js` (console, port 3001)

## Doctor Credentials (seeded)
- Phone: `01000000000`
- Password: `doctor123`

## Key Decisions
- Server must NOT specify 'localhost' host in app.listen() — Replit port checker needs all-interface binding
- Frontend proxies /api and /uploads to http://localhost:3001 via vite.config.js
- Patient login flow: first time → setup-password endpoint, then normal login

**Why:** Replit workflow checker couldn't detect port 3001 when server was bound to localhost only.
