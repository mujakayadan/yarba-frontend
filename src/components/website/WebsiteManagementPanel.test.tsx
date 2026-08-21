import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import WebsiteManagementPanel from './WebsiteManagementPanel';
import type { PortfolioWebsiteResponse } from '../../types/models';

const suspendedWebsite: PortfolioWebsiteResponse = {
  website_url: 'https://example.yarba.app',
  subdomain: 'example',
  moderation_status: 'suspended',
  moderation_message: 'Suspended after policy review.',
  deployment_status: {
    status: 'success',
    created_at: '2026-08-19T00:00:00Z',
  },
  config: {
    theme: 'modern',
    primary_color: '#000000',
    secondary_color: '#ffffff',
    social_media_enabled: true,
    enabled_sections: ['about'],
    section_order: ['about'],
    contact_form_enabled: false,
  },
  last_updated: '2026-08-19T00:00:00Z',
};

describe('WebsiteManagementPanel moderation restrictions', () => {
  it('fails closed and prevents redeployment of a suspended site', () => {
    render(
      <WebsiteManagementPanel
        website={suspendedWebsite}
        section="overview"
        isLoading={false}
        actionLoading={false}
        onSectionChange={vi.fn()}
        onConfirmAction={vi.fn()}
        onWebsiteUpdated={vi.fn()}
        onDeploymentStarted={vi.fn()}
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Suspended after policy review.');
    expect(screen.getByRole('button', { name: 'Redeploy website' })).toBeDisabled();
  });
});
