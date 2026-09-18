# Mobile QA matrix

Evidence log for [#32](https://github.com/mujakayadan/yarba-frontend/issues/32). Update the **Result** column when a row is re-run. Do not mark iOS Pass without a Mac. Do not mark native Google/Apple Pass until [#22](https://github.com/mujakayadan/yarba-frontend/issues/22).

**Baseline:** 18 September 2026. Owner: Muja Kayadan.  
**Android device:** Pixel-class emulator, API 36 (prior native PRs). No emulator was attached when this matrix was written.  
**iOS device:** none (needs a Mac).  
**Web:** Chromium via Vitest / local Vite.

Statuses: **Pass**, **Fail**, **Blocked**, **Not run**.

## Release targets

| Measure            | Target                                                                                                              | Evidence                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Cold start         | Splash is the coral Yarba mark and hides after the first usable React frame, or at 8s (`NATIVE_SPLASH_FALLBACK_MS`) | Code + Android #27/#29. Re-time on a mid-range device before store submit. |
| Route transitions  | No unrecoverable blank screen; nested paths resolve through `index.html`                                            | Documented in `development.md`. Not instrumented.                          |
| Long editor scroll | Fields stay above the IME; no horizontal overflow on phone widths                                                   | Android/phone #28.                                                         |
| PDF                | Preview opens in-app; Share PDF opens the system sheet; no repeatable crash                                         | Android #24. Memory not profiled.                                          |
| Connectivity       | Airplane mode shows Connection required with Try again                                                              | Android #27.                                                               |

## Platform adapters (Vitest)

All required adapters have focused tests. Re-run with `npm test`.

| Adapter                            | Tests                                                                                             | Result |
| ---------------------------------- | ------------------------------------------------------------------------------------------------- | ------ |
| Secure storage (Keychain/Keystore) | `src/platform/secureStorage.test.ts`                                                              | Pass   |
| Network / lifecycle                | `src/platform/networkStatus.test.ts`, `appLifecycle.test.ts`, `NativeLifecycle.test.tsx`          | Pass   |
| Deep links + URL handlers          | `src/platform/nativeDeepLinks.test.ts`, `NativeUrlHandlers.test.tsx`, `src/utils/openUrl.test.ts` | Pass   |
| File / photo picking               | `src/platform/nativeFilePicker.test.ts`                                                           | Pass   |
| PDF export / share                 | `src/utils/pdfDownload.test.ts`                                                                   | Pass   |
| Splash / system bars               | `src/platform/nativeShell.test.ts`                                                                | Pass   |

## Critical flows

| Flow                                       | Android                     | iOS                              | Notes                                              |
| ------------------------------------------ | --------------------------- | -------------------------------- | -------------------------------------------------- |
| Cold start splash → login or dashboard     | Pass (#29/#27)              | Blocked (Mac)                    | Fallback hide at 8s.                               |
| Email/password sign-in                     | Not run on device this pass | Blocked (Mac)                    | Web login still the v1 path until #22.             |
| Native Google sign-in                      | Blocked (#22)               | Blocked (#22)                    |                                                    |
| Sign in with Apple                         | N/A on Android              | Blocked (#22 + Apple enrollment) |                                                    |
| Onboarding import / document pick          | Pass (#25)                  | Blocked (Mac)                    | No camera permission.                              |
| Profile image pick                         | Pass (#25)                  | Blocked (Mac)                    |                                                    |
| Resume list cards + generate/edit          | Pass phone layouts (#28)    | Blocked (Mac)                    | Full generate/edit not re-run on device this pass. |
| Resume PDF preview + Share PDF             | Pass (#24)                  | Blocked (Mac)                    |                                                    |
| Cover letter view + PDF                    | Pass (#24/#28)              | Blocked (Mac)                    |                                                    |
| Deep link `com.yarba.app://` restore       | Pass (#26)                  | Blocked (Mac)                    | OAuth token exchange still #22.                    |
| External https / mailto leave WebView      | Pass (#26)                  | Blocked (Mac)                    |                                                    |
| Background / resume session refresh        | Pass (#27)                  | Blocked (Mac)                    |                                                    |
| Airplane mode Connection required          | Pass (#27)                  | Blocked (Mac)                    |                                                    |
| Logout                                     | Not run on device this pass | Blocked (Mac)                    |                                                    |
| Account deletion Settings → Data & privacy | Pass UI (#30)               | Blocked (Mac)                    | Type `DELETE`; 7-day grace.                        |
| Phone stacked actions / 44px targets       | Pass (#28)                  | Blocked (Mac)                    |                                                    |
| Portrait lock                              | Pass (#29)                  | Blocked (Mac)                    |                                                    |
| Tablet layout                              | Not a v1 target             | iPad not a v1 target             | Best-effort only.                                  |

## Accessibility

| Check                         | TalkBack (Android) | VoiceOver (iOS) |
| ----------------------------- | ------------------ | --------------- |
| Auth (email/password, errors) | Not run            | Blocked (Mac)   |
| Drawer / primary navigation   | Not run            | Blocked (Mac)   |
| Forms and validation          | Not run            | Blocked (Mac)   |
| Dialogs (delete, PDF close)   | Not run            | Blocked (Mac)   |
| Destructive confirmations     | Not run            | Blocked (Mac)   |

Do not submit while these rows are **Not run** / **Blocked** unless a signed waiver is added below.

## Defects and waivers

| ID                             | Severity | Status  | Owner    | Notes                                                                          |
| ------------------------------ | -------- | ------- | -------- | ------------------------------------------------------------------------------ |
| iOS evidence                   | P1       | Open    | Operator | Needs a Mac. Not a product defect.                                             |
| TalkBack / VoiceOver           | P1       | Open    | Operator | Not executed.                                                                  |
| Native Google / Apple          | P1       | Blocked | #22      | Apple Developer + Firebase cutover.                                            |
| ReportAbusePage Vitest timeout | P3       | Open    | Frontend | Intermittent 5s timeout in CI-local runs; public web form, not a native crash. |
| #21 Firebase native apps       | P2       | Open    | Operator | Console iOS/Android apps for `com.yarba.app`.                                  |

No P0 native crash or blank-screen defect is on this list.

## How to re-run

Android:

```bash
npm run cap:sync
npx cap run android
```

Then walk [app-review-notes.md](./app-review-notes.md) steps 1–9 and update this file.

iOS (macOS):

```bash
npm run cap:sync
npx cap run ios
```
