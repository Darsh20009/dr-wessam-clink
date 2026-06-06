---
name: Dr Wessam Features v2
description: New models, routes, and pages added in second development round
---

## New Server Models
- `server/models/Notification.js` — userId, patientId, title, message, type, isRead, isForDoctor
- `server/models/Wallet.js` — patientId, balance, totalDeposited, totalWithdrawn, transactions[]
- `server/models/SiteSettings.js` — single doc (key:'main'), all landing page content editable by doctor

## New Server Routes
- `GET/PUT /api/site` — site settings (GET is public, PUT requires doctorOnly)
- `GET/PUT /api/notifications` — notifications with unread count
- `GET/POST /api/wallet` — wallet CRUD, deposit, withdraw

## New Client Pages
- `Notifications.jsx` — doctor notification inbox with send/read/delete
- `Wallet.jsx` — patient wallets, deposit/withdraw modals, transaction history
- `SiteManager.jsx` — tabbed editor: hero, doctor info, services, reviews, FAQs, contact

## DoctorLayout Updates
- Added nav items: المحفظة, الإشعارات (with unread badge), إدارة الموقع
- Notification badge polling every 30 seconds

## Landing Page
- Now loads dynamic content from /api/site on mount (falls back to defaults)
- Added "عن الطبيب" section with bio, certificates, achievements
- Added floating WhatsApp button
- "حجز موعد" button links to WhatsApp

**Why:** User provided full feature spec (Pasted doc) wanting notifications, wallet, site management, and about-doctor section.
