import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  post: vi.fn(),
}));

vi.mock('./api', () => ({
  default: {
    post: mocks.post,
  },
}));

import { createPortfolioWebsite } from './websiteService';
import { LEGAL_VERSION } from '../content/legalDocuments';

describe('websiteService publication acknowledgement', () => {
  it('sends the current policy version and rights confirmation when publishing', async () => {
    mocks.post.mockResolvedValue({ data: { subdomain: 'example' } });
    const config = {
      theme: 'modern',
      primary_color: '#000000',
      secondary_color: '#ffffff',
      social_media_enabled: true,
      enabled_sections: ['about'],
      section_order: ['about'],
      contact_form_enabled: false,
    };

    await createPortfolioWebsite(config, 'example');

    expect(mocks.post).toHaveBeenCalledWith(
      '/portfolio-websites/create',
      {
        config,
        force_rebuild: false,
        publication_acknowledgement: {
          acceptable_use_version: LEGAL_VERSION,
          rights_confirmed: true,
        },
      },
      { params: { custom_subdomain: 'example' } }
    );
  });
});
