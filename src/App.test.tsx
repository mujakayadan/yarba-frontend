import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./services/authService', () => ({
  loginWithEmail: vi.fn(),
  registerWithEmail: vi.fn(),
  logout: vi.fn(),
  refreshPasswordSession: vi.fn().mockRejectedValue(new Error('No refresh session')),
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
