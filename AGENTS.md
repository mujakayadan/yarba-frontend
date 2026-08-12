# Agent guide (YARBA frontend)

## Stack

- React 19, TypeScript, Vite, Material UI, Firebase, Vitest
- Node.js 24 and npm

## Commands

```bash
npm install
npm run dev
npm run lint
npm run format:check
npm run build
npm test
```

## Conventions

- Keep API calls in `src/services/`; do not call Axios directly from components.
- Use TanStack Query hooks for server state and invalidate shared query keys after mutations.
- Use `VITE_*` variables through `src/config/env.ts`; never hardcode credentials or production configuration.
- Use `src/mui/Grid.tsx` instead of importing MUI Grid directly.
- Add focused Vitest coverage for changed behavior.
- Follow the detailed coding guidance in [`.cursorrules`](.cursorrules).

## Related backend

The FastAPI service, migrations, and browser auto-apply CLI live in
[yarba-backend](https://github.com/mujakayadan/yarba-backend).
