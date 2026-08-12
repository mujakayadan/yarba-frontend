# Security

## Reporting a vulnerability

If you discover a security issue, report it privately to
**admin@yarba.app** rather than opening a public GitHub issue. Include
the affected page, reproduction steps, impact, and any relevant browser details.
We aim to acknowledge reports within three business days.

## Supported versions

Security fixes are applied to the active development branch and latest
production deployment. Older releases are not maintained separately.

## Scope

In scope:

- This repository and the deployed YARBA web application
- Authentication flows, token handling, and unauthorized data exposure
- Cross-site scripting, unsafe redirects, and sensitive build configuration

Out of scope:

- Third-party services such as Firebase, Vercel, and the backend API
- Social engineering and physical attacks
- Denial-of-service testing against production without prior agreement

## Environment variables

This app reads configuration from `VITE_*` environment variables at build time.

**Never commit:**

- `.env.local`
- `.env.development`
- `.env.production`
- Any file containing real API keys, tokens, or production URLs

Use `.env.example` as a template. Copy it to `.env.local` and fill in your own values.

## Firebase web config

Firebase client API keys are embedded in the frontend bundle by design. They identify your Firebase project but are not server-side secrets. Protect your project with:

- Firebase **Authorized domains** (Authentication settings)
- **Security rules** for Firestore, Storage, and other services
- Backend validation of Firebase ID tokens
- [Firebase App Check](https://firebase.google.com/docs/app-check) for production

For local development and contributions, use a dedicated Firebase project separate from production when possible.

## Production deployment

Set all `VITE_*` variables in your hosting provider (e.g. Vercel project settings). Do not hardcode production URLs or credentials in source files.

## Safe disclosure

Use a local or staging environment when possible. Do not access another user's
data, degrade service availability, or publicly disclose a finding before a fix
can be coordinated.
