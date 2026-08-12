import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SetupStepHeader } from './SetupStepHeader';

describe('SetupStepHeader', () => {
  it('orients users within the shortened setup flow', () => {
    render(
      <SetupStepHeader
        activeStep={1}
        title="Build your portfolio"
        description="Upload a resume or skip this optional step."
      />
    );

    expect(screen.getByText('Step 2 of 2')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Build your portfolio' })).toBeInTheDocument();
    expect(screen.getByText('Your essentials')).toBeInTheDocument();
    expect(screen.getAllByText('Build your portfolio')).toHaveLength(2);
  });
});
