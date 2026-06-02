# Security

## Reporting a vulnerability

If you discover a security issue, please report it privately to **mujakayadan@outlook.com** rather than opening a public GitHub issue.

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
