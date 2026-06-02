import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./firebaseConfig', () => ({
  getFirebaseAuth: vi.fn(async () => ({ tenantId: null, currentUser: null, app: { options: {} } })),
  getFirebaseApp: vi.fn(async () => ({})),
  getFirebaseAnalytics: vi.fn(async () => null),
}));

vi.mock('./services/authService', () => ({
  loginWithEmail: vi.fn(),
  registerWithEmail: vi.fn(),
  loginWithGoogle: vi.fn(),
  logout: vi.fn(),
  exchangeFirebaseTokenForJWT: vi.fn(),
  getCurrentFirebaseUser: vi.fn(async () => null),
}));

vi.mock('@vercel/analytics/react', () => ({
  Analytics: () => null,
}));

vi.mock('./routes/AppRoutes', () => ({
  default: () => <div>Yarba application shell</div>,
}));

import App from './App';

describe('App', () => {
  it('renders the application shell', () => {
    render(<App />);
    expect(screen.getByText('Yarba application shell')).toBeInTheDocument();
  });
});
