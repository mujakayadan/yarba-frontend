# Mobile billing decision

Recorded for [#31](https://github.com/mujakayadan/yarba-frontend/issues/31) against the v1 store-launch build.

## Decision

**v1 is free.** The iOS and Android apps do not sell digital goods. There is no StoreKit, Google Play Billing, web checkout, credit pack, or subscription SKU in this codebase.

Apple and Google still require that any later paid digital unlock (AI credits, templates, hosting tiers, subscriptions) use in-app purchase, not an external pay link. That work is a **new epic**, not v1.

## Inventory

| Entitlement                             | How it is offered in v1              | Paid? |
| --------------------------------------- | ------------------------------------ | ----- |
| Account, profile, portfolio             | Included with sign-in                | No    |
| Resume and cover-letter generation/edit | Included                             | No    |
| PDF preview, download, native share     | Included                             | No    |
| Public `{subdomain}.yarba.app` site     | Included when the user publishes     | No    |
| Job applications and agent tokens       | Included                             | No    |
| Data export and account deletion        | Included (Settings → Data & privacy) | No    |

The frontend `User` type and live settings UI have no plan, credit, or `subscription_expires` field. `docs/data_models.md` still mentions `subscription_expires` as a leftover sketch; it is not wired in `src/types/models.ts`.

## Store copy

- List the apps as free.
- Do not add “Buy on the website”, “Subscribe”, or pricing links in the Capacitor shell.
- Terms of Service mention “nonpayment” and “amount you paid” as standard termination and liability language. That is not an in-app purchase path and must not be turned into a store CTA.

## Implementation

No StoreKit or Play Billing for v1. `package.json` has no payments SDK.

If product later charges for AI, templates, or hosting, open a separate epic covering product IDs, entitlement sync, restore purchases, and store listing updates before shipping the paid surface.
