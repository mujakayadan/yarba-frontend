# Launch checklist

Operational path for [#34](https://github.com/mujakayadan/yarba-frontend/issues/34). Owner: Muja Kayadan.

Listing copy: [store-listing-copy.md](./store-listing-copy.md). Review notes: [app-review-notes.md](./app-review-notes.md). Signing: [release-runbook.md](./release-runbook.md). QA: [qa-matrix.md](./qa-matrix.md).

## Before first submit

- [ ] Apple Developer Program enrolled
- [ ] Google Play Console enrolled (personal accounts: 12 testers / 14-day closed test before production)
- [ ] App records use `com.yarba.app`
- [ ] [#22](https://github.com/mujakayadan/yarba-frontend/issues/22) native Google + Sign in with Apple, **or** listing copy still says they are not in the build
- [ ] [#21](https://github.com/mujakayadan/yarba-frontend/issues/21) Firebase iOS/Android apps + iOS API proof
- [ ] [#32](https://github.com/mujakayadan/yarba-frontend/issues/32) iOS Simulator, TalkBack, VoiceOver
- [ ] [#33](https://github.com/mujakayadan/yarba-frontend/issues/33) signed AAB + TestFlight
- [ ] Privacy / Data safety forms match the inventory
- [ ] Screenshots are the production UI
- [ ] Reviewer account filled in app-review-notes.md and can complete the exercise steps
- [ ] Support, Privacy, and Terms URLs load

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
