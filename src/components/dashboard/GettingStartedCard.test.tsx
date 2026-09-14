import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GettingStartedCard, type GettingStartedItem } from './GettingStartedCard';

const items: GettingStartedItem[] = [
  {
    label: 'Complete your portfolio',
    description: 'Add skills and experience.',
    complete: true,
    action: 'Open portfolio',
    path: '/portfolio',
  },
  {
    label: 'Create a cover letter',
    description: 'Use an existing resume to generate a matching letter.',
    complete: false,
    action: 'Create cover letter',
    path: '/cover-letters/new',
  },
];

describe('GettingStartedCard', () => {
  it('stays collapsed and highlights the next incomplete step', () => {
    const onNavigate = vi.fn();
    render(<GettingStartedCard items={items} onNavigate={onNavigate} />);

    expect(screen.getByRole('heading', { name: 'Get started' })).toBeInTheDocument();
    expect(screen.getByText('1 of 2 complete')).toBeInTheDocument();
    expect(
      screen.getByText('Use an existing resume to generate a matching letter.')
    ).toBeInTheDocument();
    expect(screen.queryByText('Complete your portfolio')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Create cover letter' }));
    expect(onNavigate).toHaveBeenCalledWith('/cover-letters/new');
  });

  it('expands to the compact step list', async () => {
    render(<GettingStartedCard items={items} onNavigate={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Expand setup steps' }));

    expect(screen.getByText('Complete your portfolio')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Review Complete your portfolio' })
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.queryByText('Use an existing resume to generate a matching letter.')
      ).not.toBeInTheDocument();
    });
  });
});
