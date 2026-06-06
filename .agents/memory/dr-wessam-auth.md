---
name: Dr Wessam Auth Routes
description: Forgot password flow and new pages added to the clinic system
---

## Forgot Password Flow

Two-step backend flow (no email needed — patient contacts doctor on WhatsApp for their patient ID):

1. **POST /api/auth/verify-identity** — body: `{ patientId, phone }` → finds Patient by `_id + phone` match → returns `{ verified: true, name }`
2. **POST /api/auth/reset-password** — body: `{ patientId, phone, newPassword }` → re-verifies identity, updates/creates User with new password, returns JWT token

**Why:** Patients don't have email. They get their Patient ID (MongoDB ObjectId) from the doctor via WhatsApp. This approach verifies identity without email/SMS.

## New Routes (App.jsx)
- `/forgot-password` → `ForgotPassword.jsx`
- `/presentation` → `Presentation.jsx`  
- `/guide` → also maps to `Presentation.jsx` (alias)

## Login.jsx
Patient mode shows "🔑 نسيت كلمة المرور؟" link pointing to `/forgot-password`.

## SEO / PWA
- `client/index.html`: full OG tags, JSON-LD Dentist schema, Twitter Card, PWA meta, canonical URL
- `client/public/manifest.json`: PWA manifest with shortcuts for appointments + patient portal
