# Capacitor local workflow

Yarba packages the existing Vite/React app with Capacitor 8. The web app on Vercel is unchanged. Native projects live in `android/` and `ios/` and use app ID `com.yarba.app`.

## Prerequisites

### All platforms

- Node.js 24 and npm 8+
- A built web bundle: `npm run build` writes to `build/` (`capacitor.config.ts` `webDir`)

### Android (Windows or macOS)

- [Android Studio Otter 2025.2.1+](https://developer.android.com/studio)
- Android SDK Platform 36
- JDK **21** for Gradle (Studio’s own JBR may be Java 25; that is too new for Capacitor 8 / Gradle 8.14)
- An emulator (Pixel-class phone / API 36) or a USB-debuggable device
- On Windows, Capacitor looks for Android Studio at `C:\Program Files\Android\Android Studio\bin\studio64.exe`. If `npm run cap:android` cannot launch it, set `CAPACITOR_ANDROID_STUDIO_PATH` to that file.
- Decline the AGP Upgrade Assistant if it offers Android Gradle Plugin 9. Capacitor 8 needs AGP **8.13** and Gradle **8.14.3**.

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

- `capacitor.config.ts` — app ID, display name, `webDir`. `CapacitorHttp` is enabled so native builds call the API through the Android/iOS stack and skip WebView CORS.
- Web env still uses `VITE_*` via `src/config/env.ts`. Native builds bake the env from the machine that ran `npm run build` (this repo’s production build uses the hosted API, not `localhost:8000`).
- On Android, `http://localhost` / `127.0.0.1` in `VITE_API_URL` is rewritten to `http://10.0.2.2` (the host machine from the emulator). That rewrite only applies when the baked URL is actually localhost.
- Capacitor’s WebView origin is `https://localhost`. If you disable `CapacitorHttp`, the API must allow that origin (`API_CORS_ORIGINS` should include `https://localhost` and `capacitor://localhost`).
- `index.html` uses `viewport-fit=cover` so notch and home-indicator insets (`env(safe-area-inset-*)`) apply to the header, drawer, and footer.
- The layout listens to `visualViewport` and sets `--keyboard-inset` so focused fields stay above the on-screen keyboard.
- Android console/network errors: `adb logcat --pid=$(adb shell pidof com.yarba.app)` and look for `Capacitor/Console`.
- Vercel Analytics does not load in native builds.
- Display type (`Dreaming Outloud`) is self-hosted in `public/fonts/` so the Android WebView does not fall back to generic `cursive`.
- Native launcher icons are generated from `public/logo.svg` (same mark as the header). Regenerate with `npx --yes --package=@resvg/resvg-js node scripts/generate-native-icons.mjs`.
- Do not commit signing keystores, `android/local.properties`, or Apple certificates.

## Out of scope here

Native plugins (secure storage, share, filesystem, social login), store listing, and signed release builds are later issues under [#18](https://github.com/mujakayadan/yarba-frontend/issues/18).
