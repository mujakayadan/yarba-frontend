# Troubleshooting Guide

Common issues when running the Yarba frontend locally or against a deployed backend.

## Quick checks

1. **Node.js 24+** — see `engines` in `package.json`.
2. **Environment file** — copy `.env.example` to `.env.local` and fill in values. See [SECURITY.md](./SECURITY.md).
3. **Backend running** — `VITE_API_URL` must point at a live Yarba backend (default `http://localhost:8000/api/v1`).
4. **Dev server** — `npm run dev` or `npm start` (both run Vite on port 3000).
5. **Browser console** — open DevTools (F12) → Console for runtime errors and debug output.

After changing `.env.local`, restart the dev server. Vite reads `VITE_*` variables at startup.

## Environment variables

| Variable              | Purpose                                                              |
| --------------------- | -------------------------------------------------------------------- |
| `VITE_API_URL`        | Backend REST base URL                                                |
| `VITE_DEBUG`          | Set to `true` to enable namespaced console logs via `createDebugger` |
| `VITE_FIREBASE_*`     | Firebase web app config from the Firebase Console                    |
| `VITE_CLOUDFRONT_URL` | CDN base for uploaded assets (optional locally)                      |

If API calls fail immediately with network errors, confirm `VITE_API_URL` is set and the backend responds at that URL.

## Authentication & Firebase

### Unauthorized domain (`auth/unauthorized-domain`)

1. Open [Firebase Console](https://console.firebase.google.com/) → your project.
2. Go to **Authentication → Settings → Authorized domains**.
3. Add every origin you use: `localhost`, production domain (e.g. `www.yarba.app`), and preview URLs (e.g. `*.vercel.app`).

See [SECURITY.md](./SECURITY.md) for Firebase setup guidance.

### Login or token exchange fails

Firebase login succeeds only after the backend exchanges the Firebase ID token for a Yarba JWT (`POST /auth/login`).

Token exchange is handled in `src/services/authService.ts`:

- Duplicate in-flight requests are skipped.
- After a failure, retries are blocked for **30 seconds** to avoid hammering the backend.

If login fails, check the browser console for:

- `[FirebaseAuth]` — form submit and Firebase errors
- `[Auth]` / `[AuthContext]` — login flow and session state
- `[API]` — request URL, status, and response body

Common causes:

- Backend not running or wrong `VITE_API_URL`
- Firebase config mismatch between `.env.local` and your Firebase project
- Backend rejecting the ID token (check backend logs)

### Session cleared unexpectedly (401)

The Axios interceptor in `src/services/api.ts` clears the stored JWT on **401** and emits an auth event. `AuthContext` listens for this and resets session state — you may be redirected to `/login`.

## API & CORS errors

**CORS policy errors** mean the backend is not allowing requests from your frontend origin.

1. Ensure backend CORS includes your frontend URL (scheme + host + port).
2. Match `http` vs `https` exactly.
3. Include subdomains if you use them (e.g. `www` vs apex).

| Status                        | Typical cause                                                           |
| ----------------------------- | ----------------------------------------------------------------------- |
| **401 Unauthorized**          | Missing, expired, or invalid JWT — backend did not accept the token     |
| **403 Forbidden**             | Authenticated but not permitted for this resource                       |
| **404 Not Found**             | Wrong path or resource does not exist for this user                     |
| **422 Unprocessable Content** | Request body failed backend validation — inspect payload in Network tab |
| **429 Too Many Requests**     | Rate limited — wait and retry                                           |

## Debug mode

Enable verbose, namespaced logs:

```bash
# In .env.local
VITE_DEBUG=true
```

Then run `npm run dev` and filter the browser console by namespace:

| Namespace      | Area                                  |
| -------------- | ------------------------------------- |
| `FirebaseAuth` | Login / register UI                   |
| `AuthContext`  | Session bootstrap and auth state      |
| `Auth`         | Token exchange and auth service calls |
| `AuthUtils`    | Token storage helpers                 |
| `API`          | All Axios requests and responses      |
| `Firebase`     | Firebase initialization               |

For token exchange details, look for `[Auth]` groups around JWT exchange and any cooldown messages after failures.

## Build & type errors

`npm run build` runs `tsc --noEmit` before the Vite production bundle. TypeScript errors block the build — fix reported file/line issues locally.

Useful commands:

```bash
npm run lint          # ESLint
npm run format:check  # Prettier
npm test              # Vitest
npm run preview       # Serve production build locally
```

## PDF preview issues

Resume and cover letter previews use `react-pdf`. Worker setup is centralized in `src/utils/pdfConfig.ts` (`ensurePdfWorkerConfigured`). If PDFs fail to render:

1. Hard-refresh the page.
2. Check the console for worker or network errors loading the PDF file.
3. Confirm the PDF URL is reachable (auth/CDN/CORS on the file host).
