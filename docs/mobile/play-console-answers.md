# Google Play Console answers

Paste pack for a **personal / individual** Play account. No company or DUNS is required.

Use with [store-listing-copy.md](./store-listing-copy.md) and [app-review-notes.md](./app-review-notes.md). Do not upload a binary that claims native Google or Sign in with Apple until [#22](https://github.com/mujakayadan/yarba-frontend/issues/22).

Owner: Muja Kayadan. Contact: `admin@yarba.app`.

## 1. Enroll (operator)

1. Open [Google Play Console](https://play.google.com/console) and create an account.
2. Account type: **Individual** (personal). Pay the one-time $25.
3. Developer name on the store is your personal name. The **app** name stays **Yarba**.
4. Create app:

| Field            | Value                                                                    |
| ---------------- | ------------------------------------------------------------------------ |
| App name         | Yarba                                                                    |
| Package name     | `com.yarba.app`                                                          |
| Default language | English (United States)                                                  |
| App or game      | App                                                                      |
| Free or paid     | Free                                                                     |
| Declarations     | Accept Play policies, US export laws, and the privacy-policy requirement |

Type the package name exactly as `com.yarba.app`. It must match Android `applicationId` and Capacitor `appId`. Play locks it after the first AAB upload; do not invent a different id.

Personal accounts must finish a **closed test with 12 testers for 14 days** before production. Start that as soon as a signed AAB exists. Do not wait for an LLC.

## 2. Store listing

| Field                  | Value                                                               |
| ---------------------- | ------------------------------------------------------------------- |
| App name (30)          | `Yarba`                                                             |
| Package name           | `com.yarba.app`                                                     |
| Short description (80) | `Build AI-tailored resumes, cover letters, and a public portfolio.` |
| Category               | Productivity                                                        |
| Tags                   | resume, career, productivity                                        |
| Email                  | `admin@yarba.app`                                                   |
| Phone                  | leave blank                                                         |
| Website                | https://yarba.app                                                   |
| Privacy policy         | https://yarba.app/privacy                                           |
| Support                | https://yarba.app/support                                           |

**Full description** (same as listing copy):

Yarba is a career-document app. You keep one portfolio and generate resumes and cover letters tailored to a job.

- Import a resume or fill in your experience
- Generate, edit, and export PDFs
- Share PDFs with the Android share sheet
- Publish a public site at a yarba.app subdomain
- Delete your account in the app (Settings → Data & privacy)

This build is free. There are no in-app purchases.

The app uses the internet to reach the Yarba API. It does not use the camera. Document and photo picking uses the system picker.

Sign-in in this Android build uses email/password and Google through the in-app flow. It does not use Sign in with Apple.

## 3. Graphics

| Asset                   | Spec                              | Source                                                                               |
| ----------------------- | --------------------------------- | ------------------------------------------------------------------------------------ |
| High-res icon           | 512 × 512 PNG, 32-bit             | Export from `android/app/src/main/res/mipmap-*` / `npm run cap:icons`                |
| Feature graphic         | 1024 × 500 PNG                    | Operator — coral background + Yarba mark, no “coming soon”                           |
| Phone screenshots       | At least 2; 16:9 or 9:16 JPEG/PNG | Production UI on a phone: login, resume list, PDF preview, Settings → Data & privacy |
| 7-inch / 10-inch tablet | Optional                          | Skip for v1                                                                          |
| Promo video             | Optional                          | Skip                                                                                 |

Do not screenshot a desktop browser window.

## 4. App content declarations

| Question                          | Answer                                                                                                                                                                        |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Privacy policy                    | https://yarba.app/privacy                                                                                                                                                     |
| Ads                               | **No**                                                                                                                                                                        |
| App access                        | **All or some functionality is restricted** — sign-in required for core features. Put the demo account from [app-review-notes.md](./app-review-notes.md) in the instructions. |
| News app                          | **No**                                                                                                                                                                        |
| COVID-19 contact tracing / status | **No**                                                                                                                                                                        |
| Data safety                       | Complete section 5                                                                                                                                                            |
| Government apps                   | **No**                                                                                                                                                                        |
| Financial features                | **No**                                                                                                                                                                        |
| Health apps                       | **No**                                                                                                                                                                        |

## 5. Data safety

Overview:

| Question                                                              | Answer                                                                                                                                                                                         |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Does the app collect or share any of the required user data types?    | **Yes, it collects** required data types. **It does not share** data with third parties for their own purposes. Hosting, email, object storage, and Firebase Auth process data only for Yarba. |
| Is all user data collected by your app encrypted in transit?          | **Yes** (HTTPS to `api.yarba.app`)                                                                                                                                                             |
| Do you provide a way for users to request that their data is deleted? | **Yes** — Settings → Data & privacy, plus https://yarba.app/privacy                                                                                                                            |

Do **not** declare native analytics collection. Vercel Analytics is web-only and does not load in the Capacitor app. There is no crash SDK in v1.

Android permission in the binary: `INTERNET` only. No camera, location, contacts, SMS, or storage permission.

### Collected data types

For every **Yes** row: collected = Yes, shared = **No**, ephemeral = **No**, required unless marked optional. Encrypted in transit = Yes.

| Play type                                    | Collect? | Required or optional                                                                                | Purposes                                                                                          |
| -------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Name                                         | Yes      | Required for an account                                                                             | Account management, App functionality                                                             |
| Email address                                | Yes      | Required                                                                                            | Account management, App functionality, Developer communications (transactional reset/verify mail) |
| User IDs                                     | Yes      | Required                                                                                            | Account management, Fraud prevention, security, and compliance                                    |
| Address                                      | Yes      | Optional (profile)                                                                                  | App functionality                                                                                 |
| Phone number                                 | Yes      | Optional (profile)                                                                                  | App functionality                                                                                 |
| Race and ethnicity                           | Yes      | Optional (application demographics, with consent)                                                   | App functionality                                                                                 |
| Political or religious beliefs               | No       | —                                                                                                   | —                                                                                                 |
| Sexual orientation                           | No       | —                                                                                                   | —                                                                                                 |
| Other info                                   | Yes      | Optional (gender identity, veteran status, salary/eligibility prefs)                                | App functionality                                                                                 |
| Approximate / Precise location               | No       | —                                                                                                   | No GPS. Typed city/location on a resume is Other info / Address, not device location              |
| Financial info                               | No       | Encrypted apply credentials are stored for the user; do not declare payment history or credit score | —                                                                                                 |
| Health and fitness                           | No       | —                                                                                                   | —                                                                                                 |
| Photos                                       | Yes      | Optional (profile picture)                                                                          | App functionality                                                                                 |
| Videos                                       | No       | —                                                                                                   | —                                                                                                 |
| Audio                                        | No       | —                                                                                                   | —                                                                                                 |
| Files and docs                               | Yes      | Optional (resume/PDF/DOCX upload)                                                                   | App functionality                                                                                 |
| Calendar / Contacts                          | No       | —                                                                                                   | —                                                                                                 |
| SMS or MMS / Emails (messages)               | No       | Reset mail is sent by the server, not collected from the device                                     | —                                                                                                 |
| Other in-app messages                        | Yes      | Optional (public-site visitor chat when the publisher enables it)                                   | App functionality, Fraud prevention, security, and compliance                                     |
| App interactions                             | Yes      | Required (session and feature use needed to run the product)                                        | App functionality, Fraud prevention, security, and compliance                                     |
| In-app search history                        | No       | —                                                                                                   | —                                                                                                 |
| Installed apps                               | No       | —                                                                                                   | —                                                                                                 |
| Other user-generated content                 | Yes      | Optional (portfolio, resumes, cover letters, public site)                                           | App functionality                                                                                 |
| Web browsing history                         | No       | —                                                                                                   | —                                                                                                 |
| Crash logs / Diagnostics / Other performance | No       | No crash reporter in v1                                                                             | —                                                                                                 |
| Device or other IDs                          | Yes      | Required (session tokens; server IP/logs for security)                                              | Account management, Fraud prevention, security, and compliance                                    |

Advertising or marketing: **never** select this purpose.

Public portfolio text is public. That is publishing by the user, not “data sharing” with an advertiser.

## 6. Target audience and content

| Field          | Value                                        |
| -------------- | -------------------------------------------- |
| Target age     | **13 and older**. Not designed for children. |
| Store presence | Appeal to 13+ only                           |
| Ads            | None                                         |
| News           | No                                           |

## 7. IARC content rating

Answer the questionnaire. Do not pre-select a rating badge.

Typical honest answers for this build:

| Topic                                   | Answer                                                          |
| --------------------------------------- | --------------------------------------------------------------- |
| Violence, blood, weapons                | No                                                              |
| Sexual content or nudity (app-authored) | No                                                              |
| Language                                | No                                                              |
| Controlled substances, alcohol, tobacco | No                                                              |
| Gambling / simulated gambling           | No                                                              |
| Users can interact or share UGC         | **Yes** — public portfolios and optional site chat              |
| Users can communicate                   | **Yes** — visitor chat on a published site                      |
| Users share location                    | No                                                              |
| Unrestricted internet (general browser) | **No** — local Capacitor shell + Yarba API, not an open browser |
| Digital goods / IAP                     | No                                                              |

Expect a **Teen / PEGI 12-class** result because of UGC and communication, even though the product is a career tool. Yarba’s Acceptable Use Policy prohibits illegal and sexually explicit content; Play still rates the capability.

## 8. Pricing and distribution

| Field           | Value                          |
| --------------- | ------------------------------ |
| Price           | Free                           |
| In-app products | None                           |
| Countries       | All, unless you later restrict |
| Contains ads    | No                             |

## 9. Closed testing (required for personal accounts)

1. Release → Testing → Closed testing.
2. Upload a **signed AAB** (`versionName` `0.1.0`, increment `versionCode` per [release-runbook.md](./release-runbook.md)).
3. Add at least **12 testers** (Google accounts that opt in).
4. Keep the track live **14 days**, then apply for production.

Until the signing keystore exists, testers can still use the debug APK from the Mobile release workflow. That APK is **not** a Play upload.

## 10. Notes for review (Android)

Paste a short version into Play Console → App content → App access / notes:

Yarba is a career-document app (portfolio, AI resumes/cover letters, PDF export, optional public site). It is free, with no ads or IAP.

Sign in with the demo account in the review notes. Core flows: Dashboard, Resumes, PDF preview, Share, Settings → Data & privacy (account deletion).

This Android build does not include Sign in with Apple. Google sign-in uses the in-app web/Firebase path until native Play Google Sign-In ships.

Internet permission only. No camera. Files and photos use the system picker. Account deletion: Settings → Data & privacy, type DELETE, 7-day cancel window.
