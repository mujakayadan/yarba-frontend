# Capacitor local workflow

Yarba packages the existing Vite/React app with Capacitor 8. The web app on Vercel is unchanged. Native projects live in `android/` and `ios/` and use app ID `com.yarba.app`.

## Prerequisites

### All platforms

- Node.js 24 and npm 8+
- A built web bundle: `npm run build` writes to `build/` (`capacitor.config.ts` `webDir`)

### Android (Windows or macOS)

- [Android Studio Otter 2025.2.1+](https://developer.android.com/studio)
- Android SDK Platform 36
- JDK 21 (Android Studio’s bundled JDK is enough)
- An emulator (Pixel 8 / API 36) or a USB-debuggable device

### iOS (macOS only)

- Xcode 26+
- CocoaPods (`sudo gem install cocoapods`) if the project uses Pods
- An iOS 16+ simulator or device
- Apple Developer Program is **not** required to run the simulator. It **is** required for device signing, Sign in with Apple, TestFlight, and App Store submit.

## Commands

| Command               | Description                                               |
| --------------------- | --------------------------------------------------------- |
| `npm run build`       | Type-check and compile web assets into `build/`           |
| `npm run cap:sync`    | Copy `build/` into the native projects and update plugins |
| `npm run cap:android` | Build, sync, and open Android Studio                      |
| `npm run cap:ios`     | Build, sync, and open Xcode (macOS)                       |
| `npx cap run android` | Sync and launch on a running emulator/device              |
| `npx cap run ios`     | Sync and launch on a simulator (macOS)                    |

Typical Android loop on Windows:

```bash
npm run build
npx cap sync android
npx cap run android
```

`BrowserRouter` routes are served from Capacitor’s local HTTPS web server (`https` scheme on Android). After a native reload or cold start, a nested path such as `/login` or `/settings` must resolve to `index.html` through that server — do not switch to `HashRouter` unless a reproduction shows it is required.

## Configuration

- `capacitor.config.ts` — app ID, display name, `webDir`
- Web env still uses `VITE_*` via `src/config/env.ts`. Native builds bake the env from the machine that ran `npm run build`.
- Do not commit signing keystores, `android/local.properties`, or Apple certificates.
- Backend CORS for Capacitor origins is frontend #21 / a backend follow-up. Local Android may use `https://localhost` as the WebView origin.

## Out of scope here

Native plugins (secure storage, share, filesystem, social login), store listing, and signed release builds are later issues under [#18](https://github.com/mujakayadan/yarba-frontend/issues/18).
