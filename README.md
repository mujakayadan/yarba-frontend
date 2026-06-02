# Yarba Frontend

Frontend for Yarba — an AI-powered resume, cover letter, and portfolio platform.

## Prerequisites

- Node.js 18+
- npm 8+

## Setup

```bash
git clone https://github.com/mucahitkayadan/yarba-frontend.git
cd yarba-frontend
npm install
```

Create `.env.local` in the project root:

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_CLOUDFRONT_URL=https://your-cloudfront-domain/
VITE_DEBUG=true
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
VITE_FIREBASE_APP_ID=your-firebase-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-firebase-measurement-id
```

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
- Vite 6
- Material UI 7 (legacy Grid via `src/mui/Grid.tsx`)
- React Router 7
- TanStack Query 5
- Firebase 12
- Axios
- Vitest + Testing Library

## Deployment

Configured for Vercel. Set `VITE_*` environment variables in the Vercel project settings. Production builds run strict TypeScript checking.

## Firebase test page

Available at `/firebase-test` when authenticated.
