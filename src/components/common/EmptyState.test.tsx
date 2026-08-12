import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '@mui/material';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('explains the empty state and exposes its next action', () => {
    const onCreate = vi.fn();

    render(
      <EmptyState
        title="No resumes yet"
        description="Create a resume for a role to get started."
        primaryAction={<Button onClick={onCreate}>Create resume</Button>}
      />
    );

    expect(screen.getByRole('heading', { name: 'No resumes yet' })).toBeInTheDocument();
    expect(screen.getByText('Create a resume for a role to get started.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Create resume' }));
    expect(onCreate).toHaveBeenCalledOnce();
  });
});
