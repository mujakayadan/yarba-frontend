import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  submit: vi.fn(),
}));

vi.mock('../../services/abuseReportService', () => ({
  submitAbuseReport: mocks.submit,
}));

import ReportAbusePage from './ReportAbusePage';

describe('ReportAbusePage', () => {
  it('submits a report without requiring an account', async () => {
    const user = userEvent.setup();
    mocks.submit.mockResolvedValue({
      report_id: 'report-123',
      status: 'received',
      message: 'We will review it.',
    });

    render(
      <MemoryRouter initialEntries={['/report?subdomain=unsafe&url=https://unsafe.yarba.app/']}>
        <ReportAbusePage />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('combobox', { name: 'Reason' }));
    await user.click(screen.getByRole('option', { name: /pornography/i }));
    await user.type(
      screen.getByRole('textbox', { name: /what happened/i }),
      'The public home page contains prohibited explicit content.'
    );
    await user.type(screen.getByRole('textbox', { name: 'Your email' }), 'reporter@example.com');
    await user.click(screen.getByRole('button', { name: 'Submit report' }));

    await waitFor(() =>
      expect(mocks.submit).toHaveBeenCalledWith({
        subdomain: 'unsafe',
        reported_url: 'https://unsafe.yarba.app/',
        category: 'sexual_content',
        description: 'The public home page contains prohibited explicit content.',
        reporter_email: 'reporter@example.com',
        company_website: undefined,
      })
    );
    expect(await screen.findByText(/report report-123 was received/i)).toBeInTheDocument();
  });
});
