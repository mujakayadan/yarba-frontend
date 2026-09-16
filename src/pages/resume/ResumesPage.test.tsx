import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getResumePdf: vi.fn(),
}));

vi.mock('@tanstack/react-query', () => ({
  useMutation: () => ({ mutateAsync: vi.fn() }),
}));

vi.mock('../../hooks/useResumes', () => ({
  useResumes: () => ({
    data: {
      items: [
        {
          id: 'resume-1',
          title: 'First resume',
          job_title: 'First role',
          company_name: 'First company',
          portfolio_id: 'portfolio-1',
          updated_at: '2026-09-15T12:00:00Z',
        },
        {
          id: 'resume-2',
          title: 'Second resume',
          job_title: 'Second role',
          company_name: 'Second company',
          portfolio_id: 'portfolio-1',
          updated_at: '2026-09-14T12:00:00Z',
        },
      ],
      total: 2,
    },
    isLoading: false,
    isFetching: false,
  }),
}));

vi.mock('../../hooks/usePortfolio', () => ({
  useUserPortfolio: () => ({ data: null, isLoading: false }),
}));

vi.mock('../../hooks/usePdfPreview', () => ({
  usePdfPreview: () => ({
    open: false,
    pdfUrl: null,
    pageNumber: 1,
    numPages: null,
    openPreviewFromBlob: vi.fn(),
    closePreview: vi.fn(),
    onDocumentLoadSuccess: vi.fn(),
    previousPage: vi.fn(),
    nextPage: vi.fn(),
  }),
}));

vi.mock('../../contexts/ToastContext', () => ({
  useToast: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
  }),
}));

vi.mock('../../providers/QueryProvider', () => ({
  queryClient: { invalidateQueries: vi.fn() },
}));

vi.mock('../../services/resumeService', () => ({
  deleteResume: vi.fn(),
  downloadResumePdf: vi.fn(),
  getResumePdf: mocks.getResumePdf,
  updateResume: vi.fn(),
}));

import ResumesPage from './ResumesPage';

describe('ResumesPage PDF loading state', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getResumePdf.mockReturnValue(new Promise(() => undefined));
  });

  it('shows the loading animation only on the selected resume', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ResumesPage />
      </MemoryRouter>
    );

    const firstCard = screen
      .getByRole('heading', { name: 'First role' })
      .closest<HTMLElement>('.MuiPaper-root');
    const secondCard = screen
      .getByRole('heading', { name: 'Second role' })
      .closest<HTMLElement>('.MuiPaper-root');

    if (!firstCard || !secondCard) {
      throw new Error('Expected both resume cards to render');
    }

    await user.click(within(firstCard).getByRole('button', { name: 'See PDF' }));

    await waitFor(() => {
      expect(within(firstCard).getByRole('button', { name: 'Loading...' })).toBeDisabled();
    });
    expect(within(firstCard).getByRole('progressbar')).toBeInTheDocument();
    expect(within(secondCard).getByRole('button', { name: 'See PDF' })).toBeDisabled();
    expect(within(secondCard).queryByRole('progressbar')).not.toBeInTheDocument();
  });
});
