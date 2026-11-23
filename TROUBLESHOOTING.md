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

| Variable                  | Purpose                                                              |
| ------------------------- | -------------------------------------------------------------------- |
| `VITE_API_URL`            | Backend REST base URL                                                |
| `VITE_DEBUG`              | Set to `true` to enable namespaced console logs via `createDebugger` |
| `VITE_GOOGLE_CLIENT_ID`   | Google web client ID for web GIS and Capacitor Google (Capgo)        |
| `VITE_APPLE_SERVICE_ID`   | Apple Services ID for web Apple JS                                   |
| `VITE_APPLE_REDIRECT_URI` | Apple redirect URI for web Apple JS                                  |
| `VITE_CLOUDFRONT_URL`     | CDN base for uploaded assets (optional locally)                      |

If API calls fail immediately with network errors, confirm `VITE_API_URL` is set and the backend responds at that URL.

## Authentication

### Google sign-in fails on Android

Capacitor Google uses Capgo Social Login (Credential Manager) with `VITE_GOOGLE_CLIENT_ID` as the web client ID. The app sends the raw nonce from `POST /auth/oauth/nonce/google`, then exchanges the ID token at `POST /auth/oauth/google`.

The Android OAuth client is not an environment variable. In Google Cloud Console, create an Android client for package `com.yarba.app` and the SHA-1 of the keystore that signed the build (debug SHA-1 for local installs, Play App Signing SHA-1 for store builds).

### Login fails

Email and password use `/auth/password/login` and `/auth/password/register`. Google and Apple exchange an ID token at `/auth/oauth/google` or `/auth/oauth/apple`.

If login fails, check the browser console for:

- `[AuthForm]` — form submit and validation errors
- `[Auth]` / `[AuthContext]` — login flow and session state
- `[API]` — request URL, status, and response body

Common causes:

- Backend not running or wrong `VITE_API_URL`
- `VITE_GOOGLE_CLIENT_ID` missing or not listed in backend `OAUTH_GOOGLE_WEB_AUDIENCES`
- Android build missing the Google Cloud Android OAuth client for `com.yarba.app` and the signing SHA-1
- Backend rejecting the ID token or nonce (check backend logs)

### Session cleared unexpectedly (401)

The Axios interceptor in `src/services/api.ts` tries `POST /auth/password/refresh` once on **401** (except login, register, refresh, and OAuth exchange calls). If refresh fails, it clears the stored JWT and emits an auth event. `AuthContext` listens for this and resets session state — you may be redirected to `/login`.

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

| Namespace     | Area                                  |
| ------------- | ------------------------------------- |
| `AuthForm`    | Login / register UI                   |
| `AuthContext` | Session bootstrap and auth state      |
| `Auth`        | Password and OAuth auth service calls |
| `AuthUtils`   | Token storage helpers                 |
| `API`         | All Axios requests and responses      |

For auth details, look for `[Auth]` groups around password login and OAuth token exchange.

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
