import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Grid from './Grid';

describe('Grid', () => {
  it('maps GridLegacy item and breakpoint props onto MUI 9 size', () => {
    render(
      <Grid container>
        <Grid item xs={12} md={6}>
          Resume
        </Grid>
      </Grid>
    );

    expect(screen.getByText('Resume')).toBeInTheDocument();
  });
});
