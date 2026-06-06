---
name: Dr Wessam Push+Passkey
description: Web Push (VAPID), WebSocket, and WebAuthn passkey system architecture and gotchas
---

## Push Notification Architecture (3 Layers)
1. **DB** — `Notification` model, always saved
2. **WebSocket** — `server/utils/fireNotify.js` → `registerWsClient()`, WS at `/ws?token=JWT`
3. **Web Push** — VAPID via `web-push` npm. Keys in env vars: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL

## Key Files
- `server/utils/fireNotify.js` — `fireNotify(userId, title, body, opts)` and `fireNotifyAdmins()`
- `server/routes/push.js` — subscribe/unsubscribe/vapid-key endpoints
- `client/public/sw.js` — service worker handles push events
- `client/src/hooks/usePushNotifications.js` — subscribe, unsubscribe, connectWs, disconnectWs

## WebAuthn / Passkey
- Uses `@simplewebauthn/server` (server) and `@simplewebauthn/browser` (client)
- RP_ID = Replit dev domain, set as env var (changes if domain changes)
- Challenge stored in Map with 5min TTL
- Credentials stored in `WebAuthnCredential` model

## Known Gotcha
- `FiFingerprint` does NOT exist in react-icons/fi — use `FiKey` instead
- WebSocket proxy in vite.config.js: `'/ws': { target: 'ws://localhost:3001', ws: true }`

## Vite Config WebSocket Proxy
```js
'/ws': { target: 'ws://localhost:3001', ws: true, changeOrigin: true }
```

**Why:** Replit proxies all traffic — without the WS proxy in vite config, WebSocket connections fail in development.
