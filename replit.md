# عيادة د. وسام يوسف - Clinic Management System

## Overview
A full-stack dental clinic management system for Dr. Wessam Youssef's orthodontic clinic. Includes a doctor dashboard, patient portal, appointment management, medical records, financial system, and a public landing page.

## Tech Stack
- **Frontend**: React + Vite (port 5000)
- **Backend**: Express.js + Node.js (port 3001)
- **Database**: MongoDB Atlas
- **Language**: Arabic (RTL)

## Architecture
- `client/` — React + Vite frontend
- `server/` — Express.js API backend

## Running the App
- Frontend workflow: `cd client && npm run dev` (port 5000)
- Backend workflow: `cd server && node index.js` (port 3001)

## Required Secrets
Set these in Replit Secrets before starting the server:
- `MONGODB_URI` — MongoDB Atlas connection string
- `JWT_SECRET` — secret string for signing auth tokens
- `SESSION_SECRET` — secret string for session signing
- `VAPID_PRIVATE_KEY` — (optional) for web push notifications

## Doctor Login
- Phone: `01156798324`
- Password: `doctor123`

## Clinic Contact
- Phone/WhatsApp: `+20 115 679 8324`

## Key Features
- Doctor dashboard with statistics and charts
- Full patient file management (medical data, images, x-rays)
- Treatment sessions with notes and payment tracking
- Appointment scheduling (day/week/month views)
- Financial management and payment tracking
- Patient portal (login by phone)
- Arabic RTL professional medical design
- MongoDB Atlas integration

## User Preferences
- Arabic language interface (RTL)
- Medical blue color scheme
- Clean, professional design
