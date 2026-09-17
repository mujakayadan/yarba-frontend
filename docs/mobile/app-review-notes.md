# App Store and Google Play review notes

Draft for [#34](https://github.com/mujakayadan/yarba-frontend/issues/34). Paste into App Store Connect / Play Console only after the integrations marked **Shipped** match the build under review. Do not claim native Google/Apple sign-in until #22 lands.

Yarba is a career-document app: users import a portfolio, generate and edit resumes and cover letters, export PDFs, and optionally publish a public site. It is not a thin website wrapper. The Capacitor shell (`com.yarba.app`) loads a local web bundle (`https` scheme), not a remote Safari/Chrome tab.

## Demo account

Provide a reviewer account with a completed portfolio and at least one resume. Update this section before submission.

- Email:
- Password:
- Notes: Settings → Data & privacy includes in-app account deletion (`DELETE` confirmation; password accounts also send `current_password`).

## Native integrations

| Integration                                              | Status            | Issue | What to look for                                                                                                                                                   |
| -------------------------------------------------------- | ----------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Native HTTP to the Yarba API                             | Shipped           | #21   | Authenticated API calls use Capacitor HTTP, not WebView CORS                                                                                                       |
| Branded launch, icons, system bars, portrait, safe areas | Shipped           | #29   | Coral splash with the Yarba mark; header sits under the status bar; footer clears the home indicator                                                               |
| On-screen keyboard inset                                 | Shipped           | #28   | Focused fields stay above the keyboard on long forms                                                                                                               |
| Native Google sign-in and Sign in with Apple             | Not in this build | #22   | Blocked on Apple Developer enrollment and Firebase cutover                                                                                                         |
| Secure native session storage                            | Shipped           | #23   | JWT lives in Keychain / Keystore; leftover WebView `auth_token` is migrated once                                                                                   |
| PDF preview, export, and system share sheet              | Shipped           | #24   | Resume and cover-letter PDFs preview in-app; Share PDF opens the system sheet                                                                                      |
| Document and profile-image picking                       | Shipped           | #25   | Onboarding and profile uploads open the system document/photo picker; no camera permission                                                                         |
| System browser, OAuth callbacks, and deep links          | Shipped           | #26   | Job, site, and support links leave the WebView; `mailto:` opens Mail; `com.yarba.app://` restores in-app routes. Native Google/Apple token exchange is still #22   |
| Lifecycle, connectivity, and splash until ready          | Shipped           | #27   | Resume refreshes the session; airplane mode shows Connection required; splash hides after the first usable React frame                                             |
| Account deletion and privacy disclosures                 | Shipped           | #30   | Settings → Data & privacy → Request account deletion. Type `DELETE`. Password accounts also enter the current password. 7-day grace period can be cancelled in-app |

v1 must ship the five App Review 4.2 integrations (#22–#26) before store submit. #29 is the branded shell those plugins sit in.

## How to exercise the current shell

1. Cold-start the app and confirm the splash is the coral Yarba mark, not a blank or Capacitor placeholder. Splash should fade once the login or dashboard is actually on screen.
2. Sign in, open Dashboard / Resumes / a long editor, and Settings → Data & privacy.
3. Confirm the status-bar clock remains readable over the gradient header, and that the home indicator does not cover footer legal links.
4. Rotate the device: phones stay portrait.
5. Background the app, then return: an expired session should restore or sign out without a stuck spinner.
6. Toggle airplane mode on a signed-in session: protected pages show Connection required with Try again. Reconnect and continue.
7. Open Settings → Data & privacy (or Account & security → Delete account). Request deletion, type DELETE, and confirm the scheduled date. Cancel during the grace period if needed.

iOS Simulator verification still needs a Mac (#32).
