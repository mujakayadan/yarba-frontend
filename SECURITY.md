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

- Third-party services such as Google, Apple, Vercel, and the backend API
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

## OAuth client IDs

`VITE_GOOGLE_CLIENT_ID` is the Google **web** client ID. It is embedded in the frontend bundle and identifies the OAuth client; it is not a server secret. The same value is the Capgo `webClientId` for Capacitor Google (Credential Manager on Android).

Protect the project with:

- Authorized JavaScript origins and redirect URIs on the web client
- An Android OAuth client in Google Cloud Console for package `com.yarba.app` and the signing-certificate SHA-1 (not a `VITE_*` variable)
- Backend verification of Google and Apple ID tokens, including the nonce hash
- Apple Services ID and redirect URI only for web Apple JS

Use a development Google Cloud project separate from production when possible. Do not commit populated `.env.local` files.

## Production deployment

Set all `VITE_*` variables in your hosting provider (e.g. Vercel project settings). Do not hardcode production URLs or credentials in source files.

## Safe disclosure

Use a local or staging environment when possible. Do not access another user's
data, degrade service availability, or publicly disclose a finding before a fix
can be coordinated.
