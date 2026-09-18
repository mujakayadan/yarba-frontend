# Mobile release runbook

For [#33](https://github.com/mujakayadan/yarba-frontend/issues/33). Signed Play / TestFlight uploads wait on store accounts. Until then, use the manual **Mobile release** workflow for an installable Android debug APK.

## Version policy

Keep these three in lockstep. Testers should be able to name the git commit that produced a build.

| Field                         | Where                                                                    | Current                                          |
| ----------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------ |
| Marketing version             | `package.json` `version`, Android `versionName`, iOS `MARKETING_VERSION` | `0.1.0`                                          |
| Android `versionCode`         | `android/app/build.gradle`                                               | `1` — increment by 1 for every Play upload       |
| iOS `CURRENT_PROJECT_VERSION` | `ios/App/App.xcodeproj/project.pbxproj`                                  | `1` — increment by 1 for every TestFlight upload |

Do not reuse a `versionCode` / `CURRENT_PROJECT_VERSION`. Marketing version follows semver for user-visible releases.

## CI (manual)

1. GitHub → Actions → **Mobile release** → Run workflow on `main` (or the release branch).
2. Quality job must pass lint, format, `npm run build`, and `npm test`. Failure stops the Android job.
3. Artifact `yarba-android-debug` is a debug APK (`app-debug.apk`), signed with the Android debug key. It is for internal testers, not Play.

The APK bakes whatever `VITE_*` the runner has (same as `ci.yml`). For a device build against staging/production, copy `.env.native-staging.local` / `.env.native-production.local` locally and use `npm run cap:sync:staging` or `cap:sync:production` instead of relying on CI env until those values exist as GitHub Variables.

## Local recovery (CI unavailable)

```bash
npm ci
npm run cap:sync
```

- Android: Android Studio → Run, or `npx cap run android` with an emulator/device.
- iOS: Mac only — `npx cap run ios`.

Debug APK from a machine with JDK 21 and the Android SDK:

```bash
npm run cap:sync
cd android
./gradlew assembleDebug
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`.

## Signed Play / TestFlight (blocked)

Do not commit keystores, `android/local.properties`, or Apple certificates.

When Play Console and Apple Developer exist, add **repository secrets** (never files in git):

- Android: keystore bytes + passwords + key alias, then `bundleRelease` / Play upload
- iOS: App Store Connect API key, signing certificate, provisioning profile, macOS runner, then archive + TestFlight

Production promotion stays a separate manual step after those secrets work. Rollback is “halt the Play/TestFlight release and ship the previous `versionCode` / `CURRENT_PROJECT_VERSION`.”

## Leftover

- Signed AAB and TestFlight upload
- GitHub Environment protection / required reviewers for production
- Native env Variables on the workflow (`VITE_API_URL` and Firebase web config)
