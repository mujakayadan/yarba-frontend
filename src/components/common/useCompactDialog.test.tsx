import { ThemeProvider, createTheme } from '@mui/material/styles';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useCompactDialogProps } from './useCompactDialog';

describe('useCompactDialogProps', () => {
  it('keeps dialogs full-width and not full-screen at desktop width', () => {
    const theme = createTheme();
    const { result } = renderHook(() => useCompactDialogProps(), {
      wrapper: ({ children }) => <ThemeProvider theme={theme}>{children}</ThemeProvider>,
    });

    expect(result.current.fullWidth).toBe(true);
    expect(result.current.fullScreen).toBe(false);
  });
});
