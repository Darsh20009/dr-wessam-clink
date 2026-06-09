---
name: Dr Wessam Staff, Comments & Messages
description: Employee role support, reception desk, comments system, internal messaging, print invoice utility added.
---

## Employee Role
- `User.role` now accepts `['doctor', 'patient', 'employee']`
- `User.employeeRole` field: `receptionist | assistant | accountant | other`
- Employees created by doctor via `POST /api/employees` (doctor-only)
- Employee login uses same `/api/auth/login` endpoint (finds by phone, any role)
- After login, role==='employee' redirects to `/reception` (in Login.jsx)

## New Routes
- `/api/comments` — GET ?patientId, POST, POST /:id/reply, DELETE /:id
- `/api/employees` — GET, POST, PATCH /:id, DELETE /:id (CRUD for employee Users)
- `/api/messages` — GET /conversations, GET ?with=userId, POST, POST /read

## New Pages
- `ReceptionDesk.jsx` — search patient by phone, view data, create session, print receipt. Accessible at /doctor/reception (doctor) and /reception (employee)
- `Employees.jsx` — doctor manages staff list (add/edit/remove, show login credentials)
- `InternalMessages.jsx` — internal chat with 4-second polling, read receipts (✓✓ blue)

## PatientFile.jsx Updates
- Added 'comments' tab — doctor sees patient comments, can reply, can delete
- Added print button in header → calls `printInvoice()` utility
- Comments state + fetch added to `fetchData()` alongside patient + sessions

## PatientPortal.jsx Updates
- Added 'ملاحظات' tab (id='comments') — patient sees doctor notes, can add own comment
- Comments fetched after main data load using patientId

## Print Invoice Utility
- `client/src/utils/printInvoice.js` exports: `printInvoice`, `printSessionReceipt`, `printThermalReceipt`
- Two modes: `type='full'` (A4 with signature area) and `type='thermal'` (72mm receipt)
- Opens new window → writes HTML → calls window.print() after 600ms

## Wave Animation Fix
- Removed `animate` prop from first WaveDivider in Landing.jsx hero section (line ~919)
- The `animate` prop caused a loading-bar-like sliding animation

**Why:** These features enable the clinic receptionist staff to independently manage walk-in patients and communicate internally, without needing full doctor-level access.
