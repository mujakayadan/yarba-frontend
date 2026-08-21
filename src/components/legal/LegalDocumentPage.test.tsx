import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import LegalDocumentPage from './LegalDocumentPage';
import { LEGAL_VERSION } from '../../content/legalDocuments';

describe('LegalDocumentPage', () => {
  it('renders the versioned Terms and links related policies', () => {
    render(
      <MemoryRouter>
        <LegalDocumentPage documentKey="terms" />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Terms of Service' })).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`Version ${LEGAL_VERSION}`))).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /public portfolio websites/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Acceptable Use' })).toHaveAttribute(
      'href',
      '/acceptable-use'
    );
    expect(screen.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy');
  });

  it('renders the visitor privacy notice for public-site disclosures', () => {
    render(
      <MemoryRouter>
        <LegalDocumentPage documentKey="site-privacy" />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'Public Site Visitor Privacy Notice' })
    ).toBeInTheDocument();
    expect(screen.getByText(/retained for 90 days/i)).toBeInTheDocument();
  });
});
