# Store listing copy

Draft for [#34](https://github.com/mujakayadan/yarba-frontend/issues/34). **v1 is free.** Do not mention in-app purchases or “buy on the website.”

Google Play answers (individual account, Data safety, IARC): [play-console-answers.md](./play-console-answers.md). Review notes: [app-review-notes.md](./app-review-notes.md).

**Do not claim Sign in with Apple or native Google sign-in until [#22](https://github.com/mujakayadan/yarba-frontend/issues/22).**

## Identity

| Field             | Value                                                                           |
| ----------------- | ------------------------------------------------------------------------------- |
| Name              | Yarba                                                                           |
| Bundle / package  | `com.yarba.app`                                                                 |
| Price             | Free                                                                            |
| Play account      | Individual / personal (no company)                                              |
| Developer contact | `admin@yarba.app`                                                               |
| Support URL       | https://yarba.app/support                                                       |
| Privacy URL       | https://yarba.app/privacy                                                       |
| Terms URL         | https://yarba.app/terms                                                         |
| Marketing site    | https://yarba.app (web app currently also at https://yarba-frontend.vercel.app) |

## App Store

- **Subtitle (30):** `AI resumes and portfolios`
- **Category:** Productivity (secondary: Business)
- **Age:** 13+ (Terms: users under majority need a parent/guardian)
- **Promotional text:** leave blank until a release-specific note is needed
- **Keywords (100 chars, comma-separated):** `resume,cover letter,cv,portfolio,career,pdf,job application`

**Description**

Yarba helps you build a career portfolio and turn it into tailored resumes and cover letters.

Import your experience, generate documents with AI, edit them, and export PDFs. Optionally publish a public portfolio site on a yarba.app subdomain.

What you can do:

- Import or enter work, education, skills, and projects
- Generate and edit resumes and cover letters from a job posting
- Preview and share PDFs with the system share sheet
- Publish a public portfolio website
- Delete your account in Settings → Data & privacy

Yarba is free. There are no in-app purchases. You review generated text before you use it.

Account deletion: Settings → Data & privacy. Type DELETE to confirm. Password accounts also enter the current password. You can cancel during the 7-day grace period.

## Google Play

- **Short description (80):** `Build AI-tailored resumes, cover letters, and a public portfolio.`
- **Category:** Productivity
- **Tags:** resume, career, productivity
- **Price:** Free

**Full description**

Yarba is a career-document app. You keep one portfolio and generate resumes and cover letters tailored to a job.

- Import a resume or fill in your experience
- Generate, edit, and export PDFs
- Share PDFs with the Android share sheet
- Publish a public site at a yarba.app subdomain
- Delete your account in the app (Settings → Data & privacy)

This build is free. There are no in-app purchases.

The app uses the internet to reach the Yarba API. It does not use the camera. Document and photo picking uses the system picker.

## Content rating / Data safety

Filled answers: [play-console-answers.md](./play-console-answers.md). Inventory: [store-compliance-checklist.md](./store-compliance-checklist.md).

- User-generated public portfolios exist; abuse reports go to `/report`
- No ads, no sale of personal information, no IAP
- Optional Vercel Analytics is **web-only** and does not load in the native app
- Android permission: `INTERNET` only
- Account deletion is in-app

## Screenshots (operator)

Capture the **production** UI on a phone, not a desktop browser window.

Need at least: login, dashboard or resume list (cards), resume PDF preview, Settings → Data & privacy. Play phone screenshots at the Console’s current required sizes. iPhone shots wait on a Mac. iPad is not a v1 target.

## Leftover (operator)

- Enroll Play Console as an individual and paste [play-console-answers.md](./play-console-answers.md)
- Upload feature graphic, 512 icon, and phone screenshots
- Reviewer demo account (fill [app-review-notes.md](./app-review-notes.md))
- Closed test: 12 testers / 14 days, then production
- App Store Connect / TestFlight — separate, needs Apple Developer
- Crash reporter — not in v1; do not add an SDK without updating privacy copy
