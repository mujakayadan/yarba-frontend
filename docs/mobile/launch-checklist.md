# Launch checklist

Operational path for [#34](https://github.com/mujakayadan/yarba-frontend/issues/34). Owner: Muja Kayadan.

Listing copy: [store-listing-copy.md](./store-listing-copy.md). Play Console paste pack: [play-console-answers.md](./play-console-answers.md). Review notes: [app-review-notes.md](./app-review-notes.md). Signing: [release-runbook.md](./release-runbook.md). QA: [qa-matrix.md](./qa-matrix.md).

Ship **Google Play first** as an individual. Apple can wait.

## Android first

- [ ] Google Play Console enrolled as **Individual** ($25)
- [ ] App record `com.yarba.app`; paste [play-console-answers.md](./play-console-answers.md)
- [ ] Listing describes Google sign-in via Credential Manager and does **not** claim Sign in with Apple
- [ ] Data safety matches the Play answers (no native analytics, no ads, deletion in-app)
- [ ] Feature graphic 1024×500, icon 512×512, phone screenshots of the production UI
- [ ] Support, Privacy, and Terms URLs load
- [ ] Reviewer account filled in [app-review-notes.md](./app-review-notes.md)
- [ ] Signed AAB uploaded to **closed testing** ([#33](https://github.com/mujakayadan/yarba-frontend/issues/33))
- [ ] 12 testers opted in for 14 days
- [ ] Then apply for production

## Before iOS submit (later)

- [ ] Apple Developer Program enrolled
- [ ] iOS Sign in with Apple implemented against `/auth/oauth/apple`, **or** listing copy still says it is not in the build
- [ ] iOS API proof on a Mac
- [ ] [#32](https://github.com/mujakayadan/yarba-frontend/issues/32) iOS Simulator, VoiceOver
- [ ] TestFlight build

## Beta

- [ ] Internal testers walk [qa-matrix.md](./qa-matrix.md) critical flows on one Android device and one iPhone
- [ ] P0 defects fixed; P1 waivers named
- [ ] No crash reporter in v1 — watch Play / App Store crash reports and GitHub issues after launch

## Submit

- [ ] Version `0.1.0` / `versionCode` and `CURRENT_PROJECT_VERSION` match the uploaded binary ([release-runbook.md](./release-runbook.md))
- [ ] Listing says free, no IAP
- [ ] Notes for review match shipped integrations only

## Monitor and hotfix

- **Launch owner:** Muja Kayadan
- **Window:** first 72 hours after each store goes live — check crash reports, `admin@yarba.app`, and `/report`
- **Hotfix:** increment `versionCode` / `CURRENT_PROJECT_VERSION`, ship through the signed pipeline, or halt the store release and restore the previous binary (see release-runbook rollback)
- **Web:** Vercel rollback is independent of the store binaries
