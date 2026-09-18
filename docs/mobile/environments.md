# Native staging and production environments

Yarba native builds bake `VITE_*` values at `vite build` time. There is no runtime fetch of env. Do not commit secrets; copy the example files to gitignored `.local` files.

## Modes

| Mode               | Vite command                                               | Local file                     | Typical API                                                          |
| ------------------ | ---------------------------------------------------------- | ------------------------------ | -------------------------------------------------------------------- |
| Local emulator     | `npm run cap:sync` (`vite build`, default production mode) | `.env.local`                   | `http://localhost:8000/api/v1` (Android rewrites host to `10.0.2.2`) |
| Staging device     | `npm run cap:sync:staging`                                 | `.env.native-staging.local`    | Public HTTPS staging API                                             |
| Production / store | `npm run cap:sync:production`                              | `.env.native-production.local` | Public HTTPS production API                                          |

Copy `.env.native-staging.example` → `.env.native-staging.local` and `.env.native-production.example` → `.env.native-production.local`. Mode-specific `.local` files override `.env.local`, so a localhost web URL does not leak into a staging or production native bundle.

`.env.[mode].local` values still come from the machine that ran the build. CI/store signing (#33) should inject the same keys as secrets, not from a developer laptop.

## Ownership

| Concern                                                           | Owner          | Where                                                                                                                                           |
| ----------------------------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| API, CloudFront, Firebase web config, OAuth flags                 | Frontend build | `VITE_*` via `src/config/env.ts`                                                                                                                |
| Capacitor HTTP (skips WebView CORS)                               | Frontend       | `capacitor.config.ts` `plugins.CapacitorHttp`                                                                                                   |
| WebView CORS if Capacitor HTTP is ever disabled                   | Backend        | `API_CORS_ORIGINS` must include `https://localhost` and `capacitor://localhost` — [yarba-backend](https://github.com/mujakayadan/yarba-backend) |
| iOS/Android Firebase apps, bundle ID `com.yarba.app`, URL schemes | Operator       | Firebase Console. Do this before [#22](https://github.com/mujakayadan/yarba-frontend/issues/22)                                                 |
| TLS for API and CloudFront                                        | Backend / CDN  | Native WebViews must load HTTPS images and JSON with valid certificates                                                                         |

No backend CORS change is required while Capacitor HTTP stays enabled.

## Firebase Console (operator)

Create native apps that match Capacitor `appId` `com.yarba.app`:

- Android package name `com.yarba.app`
- iOS bundle ID `com.yarba.app`
- Authorized domains / redirect URIs for Google and Apple when #22 starts
- SHA-1 / SHA-256 of the Play signing cert for Google sign-in on Android

Keep using the existing Firebase **web** app config in `VITE_FIREBASE_*` until Firebase is removed. **Web** Google sign-in uses backend-native OAuth when `VITE_NATIVE_AUTH=true` and `VITE_GOOGLE_CLIENT_ID` matches `OAUTH_GOOGLE_WEB_AUDIENCES`. Capacitor still uses Firebase Google until [#22](https://github.com/mujakayadan/yarba-frontend/issues/22); do not set `VITE_NATIVE_OAUTH=true` on native bundles yet.

## Analytics

Vercel Analytics does not load when `Capacitor.isNativePlatform()` is true. Firebase JS Analytics is also skipped on native so store builds do not initialize a web-only measurement pipeline.

## Evidence still required

- iOS Simulator or device API + image load (#32 / a Mac)
- Firebase native app records in the Console (operator)
- Authenticated Android already uses Capacitor HTTP against the baked `VITE_API_URL`
