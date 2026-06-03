# Yarba Frontend

Frontend for **Yarba** — an AI-powered resume, cover letter, and portfolio platform.

## Related repositories

| Repo | URL |
|------|-----|
| Frontend (this repo) | [github.com/mucahitkayadan/yarba-frontend](https://github.com/mucahitkayadan/yarba-frontend) |
| Backend | [github.com/mucahitkayadan/yarba-backend](https://github.com/mucahitkayadan/yarba-backend) |

```bash
# Frontend
git clone https://github.com/mucahitkayadan/yarba-frontend.git

# Backend
git clone https://github.com/mucahitkayadan/yarba-backend.git
```

## Prerequisites

- Node.js 24+
- npm 8+
- [Yarba backend](https://github.com/mucahitkayadan/yarba-backend) running locally or deployed
- A Firebase project with Authentication enabled

## Setup

```bash
git clone https://github.com/mucahitkayadan/yarba-frontend.git
cd yarba-frontend
npm install
cp .env.example .env.local
```

Edit `.env.local` with your backend URL (e.g. `http://localhost:8000/api/v1`) and Firebase web app config from the Firebase Console. See the [backend README](https://github.com/mucahitkayadan/yarba-backend) for API setup.

See [SECURITY.md](./SECURITY.md) for guidance on credentials and Firebase setup.

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` / `npm run dev` | Vite dev server (port 3000) |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview production build locally |
| `npm test` | Run Vitest tests |
| `npm run lint` | ESLint |

## Stack

- React 19 + TypeScript 5
- Vite 8
- Material UI 7 (legacy Grid via `src/mui/Grid.tsx`)
- React Router 7
- TanStack Query 5
- Firebase 12
- Axios
- Vitest + Testing Library

## Deployment

Configured for Vercel. Set all `VITE_*` environment variables in the Vercel project settings. Production builds run strict TypeScript checking.

## Development tools

The Firebase debug page at `/firebase-test` is available only in development mode (`npm run dev`).

## License

MIT — see [LICENSE](./LICENSE).
