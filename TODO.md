# Yarba Frontend Modernization TODO

## Tier 1 — Build & toolchain
- [x] Migrate CRA → Vite; remove react-app-rewired, customize-cra, config-overrides
- [x] Remove duplicate Babel/webpack configs (babel.config.js, webpack.config.js, vercel-build.js)
- [x] Replace vercel-build.js hacks; enable strict production build
- [x] Upgrade TypeScript 5.x; tsconfig target ES2020 + bundler resolution
- [x] Migrate Jest → Vitest 4
- [x] Centralize env vars (`src/config/env.ts`, `VITE_*` prefix, `.env.example`)
- [x] Re-enable npm audit in `.npmrc`
- [x] Bump Node engines to >=18

## Tier 2 — Dependencies
- [x] React 18 → 19, @types/react 19
- [x] axios → 1.16.x (security patches)
- [x] react-router-dom → 7.x
- [x] MUI 6 → 7, @mui/x-data-grid 8
- [x] firebase → 12.x
- [x] react-pdf → 10.x with Vite worker config
- [x] Remove unused formik + yup
- [x] Add explicit lodash dependency
- [x] @tanstack/react-query
- [x] Run safe npm audit fix

## Tier 3 — Architecture
- [x] Nested routes + React.lazy code splitting (`src/routes/AppRoutes.tsx`)
- [x] ErrorBoundary component
- [x] API 401 handler via auth event (no full page reload)
- [x] TanStack Query provider + `useResumes` hook
- [x] Shared PDF.js worker utility (`src/utils/pdfConfig.ts`)
- [x] Type AuthContext `user` as `User` model
- [x] Extract `src/hooks/` folder
- [x] Shared PDF preview (`PdfPreviewDialog`, `usePdfPreview`)
- [x] Split PDF preview from list/view pages
- [x] Split `PortfolioEditPage` into hook + 8 tab components

## Tier 4 — Cleanup & docs
- [x] Fix App.test.tsx for Vitest
- [x] Dedupe dev scripts (`start` and `dev` both use Vite)
- [x] Update README, vercel.json, .cursorrules
- [x] Cover letter edit page (`CoverLetterEditPage.tsx`)
- [x] Coordinated upgrades: React 19, Router 7, MUI 7, Firebase 12

## Migration note

Rename environment variables in `.env.local` and Vercel:

| Old (CRA) | New (Vite) |
|-----------|------------|
| `REACT_APP_API_URL` | `VITE_API_URL` |
| `REACT_APP_DEBUG` | `VITE_DEBUG` |
| `REACT_APP_CLOUDFRONT_URL` | `VITE_CLOUDFRONT_URL` |
| `REACT_APP_FIREBASE_*` | `VITE_FIREBASE_*` |
