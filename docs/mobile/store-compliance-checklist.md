# Mobile store compliance checklist

Baseline recorded **9 September 2026** against current Apple and Google requirements.
Owner: Muja Kayadan. Re-check official sources before the first store submission.

**Account status:** no Apple Developer Program and no Google Play Console account yet.
Local Android work can proceed without them. iOS simulator builds need a Mac.
Store listing, signing identities, TestFlight, Play testing, and Sign in with Apple
capability stay blocked until those accounts exist.

## Sign in with Apple

| Item                                                                 | Status         | Notes                                                                                                                                           |
| -------------------------------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Required if Google (or other third-party) login ships in the iOS app | Pass / planned | [App Store Review Guideline 4.8](https://developer.apple.com/app-store/review/guidelines/#login-services)                                       |
| Backend already verifies Apple ID tokens                             | Pass           | Audience reserved as `com.yarba.app` (same as the Capacitor `appId`)                                                                            |
| Web/native OAuth flags exist                                         | Pass           | `VITE_NATIVE_OAUTH`, `VITE_APPLE_SERVICE_ID`, `VITE_APPLE_REDIRECT_URI`                                                                         |
| Apple Developer capability and Services ID                           | Fail           | Needs the $99/year Apple Developer Program. Do not start frontend #22 until the account exists                                                  |
| Implementation approach                                              | Planned        | Use native Sign in with Apple on iOS and the existing backend `/auth/oauth/apple` path. Keep Firebase on until password-user migration finishes |

## Account deletion contract

Apple [5.1.1(v)](https://developer.apple.com/app-store/review/guidelines/#data-collection-and-storage) and Google Play require an in-app account-deletion path, not only a website.

| Surface | Contract                                                                                                                                                                |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UI      | Settings → Data & privacy (`DataPrivacySettings`). Confirm by typing `DELETE`. Password accounts also send `current_password`.                                          |
| Create  | `POST /api/v1/account/deletion` body `{ confirmation: "DELETE", current_password?: string }`                                                                            |
| Status  | `GET /api/v1/account/deletion` → `not_requested` / `pending` / `processing` / `completed` / `cancelled`, plus `scheduled_for` and `can_cancel`                          |
| Cancel  | `DELETE /api/v1/account/deletion` during the grace period (7 days)                                                                                                      |
| Effect  | Public site, documents, profile, applications, chats, tokens, and stored files are removed after the grace period. Legal-hold records may be retained or pseudonymized. |

Mobile #30 is mostly a reachability/UX issue: the same settings route must remain usable inside the Capacitor shell. No new backend endpoint is required.

## Data inventory → store disclosures

Map each collected category before filling Apple privacy labels and Google Data safety.

| Data                                                                        | Collected                    | Purpose               | Linked to identity | Source                      |
| --------------------------------------------------------------------------- | ---------------------------- | --------------------- | ------------------ | --------------------------- |
| Account name, email, username, auth provider                                | Yes                          | Auth, account         | Yes                | Firebase and/or native auth |
| Profile, employment, education, skills, projects, images, signatures        | Yes                          | Product features      | Yes                | User-entered                |
| Resumes, cover letters, job text, uploads, generated PDFs                   | Yes                          | Generation and export | Yes                | User-entered + AI           |
| Application preferences, optional demographics, encrypted apply credentials | Yes                          | Autofill / apply      | Yes                | User-entered                |
| Public-site content, visitor chat, abuse reports                            | Yes                          | Hosting and safety    | Mixed              | Publisher + visitors        |
| IP, device/browser, logs, session tokens                                    | Yes                          | Security, rate limits | Yes                | Automatic                   |
| Optional product analytics (Vercel Analytics)                               | Yes, opt-in                  | Product usage         | No sale / no ads   | Settings preference         |
| Firebase Analytics                                                          | No unless separately enabled | —                     | —                  | Not used by default         |

Yarba does not sell personal information or use it for cross-context advertising. Public portfolio content is public.

## Toolchain and SDK baseline

| Requirement                        | Target                                            | Official source                                                                                                                                           |
| ---------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Capacitor                          | 8.x                                               | [Capacitor 8 upgrade](https://capacitorjs.com/docs/updating/8-0)                                                                                          |
| Node                               | 22+ for Capacitor CLI; this repo stays on Node 24 | Capacitor 8 + `package.json` engines                                                                                                                      |
| Android `minSdk`                   | 24                                                | Capacitor 8                                                                                                                                               |
| Android `compileSdk` / `targetSdk` | 36 (Android 16)                                   | [Play target API policy](https://support.google.com/googleplay/android-developer/answer/11926878) — required for new apps and updates from 31 August 2026 |
| Android Studio                     | Otter 2025.2.1+                                   | Capacitor 8 environment setup                                                                                                                             |
| JDK                                | 21 (recommended)                                  | Capacitor 8 / AGP                                                                                                                                         |
| 16 KB page size                    | Required for API 35+ Play uploads                 | Play Console help                                                                                                                                         |
| iOS deployment target              | 16.0                                              | Capacitor 8.5+                                                                                                                                            |
| Xcode                              | 26+ for Capacitor 8                               | Capacitor 8 upgrade                                                                                                                                       |
| CocoaPods / SPM                    | As generated by `npx cap add ios`                 | Run on macOS                                                                                                                                              |
| Java / Android Studio on Windows   | Sufficient for emulator work                      | This development machine is Windows                                                                                                                       |

## Store-review native integration gate

A thin website wrapper fails [App Store Guideline 4.2](https://developer.apple.com/app-store/review/guidelines/#minimum-functionality). v1 must ship at least these five integrations (tracked as child issues of #18):

1. Native Google sign-in and Sign in with Apple (#22) — blocked on Firebase cutover and Apple Developer enrollment
2. Secure native session storage (#23)
3. Native PDF preview, export, and share sheet (#24)
4. Document and profile-image picking (#25)
5. System browser, OAuth callbacks, and deep links (#26)

Also required before submit, but not counted in the five: branded splash/safe areas (#29; draft review notes in `docs/mobile/app-review-notes.md`), in-app deletion reachability (#30), and a written billing decision (#31).

## Supported-device matrix (v1)

| Platform | OS                                  | Devices                                     | Notes                                                      |
| -------- | ----------------------------------- | ------------------------------------------- | ---------------------------------------------------------- |
| Android  | 8.0 (API 26) through 16 (API 36)    | Phone, 360–430 CSS px                       | Emulator: Pixel 8 / medium phone. Tablets are best-effort. |
| iOS      | 16.0+                               | iPhone SE (3rd gen) through current Pro Max | iPad is not a v1 target. Needs a Mac to run.               |
| Web      | Current Chromium / Safari / Firefox | Desktop + same phone widths                 | Production remains Vercel                                  |

Release QA (#32) should cover login, onboarding, resume generate/edit, PDF preview/share, settings export/delete, and logout on one Android emulator and one iOS simulator.

## Release-requirement scorecard

| Requirement                                        | Result | Owner                                                                                          |
| -------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------- |
| Versioned legal pages and acceptance               | Pass   | Frontend #45 / backend #46 software (counsel review still external)                            |
| In-app account deletion API + Settings UI          | Pass   | Existing `/account/deletion`                                                                   |
| Public abuse report                                | Pass   | `/report`                                                                                      |
| Privacy / Data safety inventory drafted            | Pass   | This document                                                                                  |
| Sign in with Apple approach documented             | Pass   | This document                                                                                  |
| Apple Developer Program enrolled                   | Fail   | Operator — enroll before #22/#33/#34                                                           |
| Google Play Console enrolled                       | Fail   | Operator — $25; personal accounts also need a 12-tester / 14-day closed test before production |
| Capacitor iOS + Android projects                   | Pass   | #20                                                                                            |
| Native auth (Google + Apple) against Yarba backend | Fail   | #22; keep Firebase until migration completes                                                   |
| Secure native token storage                        | Pass   | #23 — Keychain / Keystore; iOS Simulator still needs a Mac                                     |
| Native PDF share                                   | Pass   | #24 — Android share sheet; iOS Simulator still needs a Mac                                     |
| Native file/image picking                          | Pass   | #25 — system document and photo pickers; no camera permission; iOS Simulator still needs a Mac |
| Deep links + system browser                        | Fail   | #26                                                                                            |
| App-like shell (splash, icons, safe areas)         | Pass   | #29 — Android emulator verified; iOS Simulator still needs a Mac                               |
| Billing decision recorded                          | Fail   | #31 — decide before adding payments                                                            |
| Signed TestFlight / Play testing builds            | Fail   | #33 — needs store accounts                                                                     |
| Store listings and review notes                    | Fail   | #34                                                                                            |

## External links

- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Play target API levels](https://support.google.com/googleplay/android-developer/answer/11926878)
- [Play Data safety](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Apple privacy nutrition labels](https://developer.apple.com/app-store/app-privacy-details/)
- [Capacitor environment setup](https://capacitorjs.com/docs/getting-started/environment-setup)
