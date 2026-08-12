import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WebsiteThemeSelector } from './WebsiteThemeSelector';

describe('WebsiteThemeSelector', () => {
  it('exposes themes as accessible selections', () => {
    const onChange = vi.fn();

    render(<WebsiteThemeSelector selectedTheme="modern" onChange={onChange} />);

    const modernTheme = screen.getByRole('button', { name: /modern portfolio theme preview/i });
    const neonTheme = screen.getByRole('button', { name: /neon portfolio theme preview/i });

    expect(modernTheme).toHaveAttribute('aria-pressed', 'true');
    expect(neonTheme).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(neonTheme);
    expect(onChange).toHaveBeenCalledWith('neon');
  });
});
