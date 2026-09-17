import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  loading: true,
  hide: vi.fn(),
  subscribeResume: vi.fn(),
  online: true,
  invalidateQueries: vi.fn(),
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    get loading() {
      return mocks.loading;
    },
  }),
}));

vi.mock('./nativeShell', () => ({
  hideNativeSplash: mocks.hide,
}));

vi.mock('./appLifecycle', () => ({
  subscribeToAppResume: mocks.subscribeResume,
}));

vi.mock('./networkStatus', () => ({
  isCurrentlyOnline: () => mocks.online,
}));

vi.mock('../providers/QueryProvider', () => ({
  queryClient: {
    invalidateQueries: mocks.invalidateQueries,
  },
}));

import { NativeLifecycle } from './NativeLifecycle';

describe('NativeLifecycle', () => {
  let onResume: (() => void) | undefined;

  beforeEach(() => {
    mocks.loading = true;
    mocks.online = true;
    onResume = undefined;
    mocks.hide.mockReset();
    mocks.invalidateQueries.mockReset();
    mocks.subscribeResume.mockReset().mockImplementation((callback: () => void) => {
      onResume = callback;
      return () => undefined;
    });
  });

  it('keeps the splash visible while auth is still loading', () => {
    render(<NativeLifecycle />);
    expect(mocks.hide).not.toHaveBeenCalled();
  });

  it('hides splash after auth is ready and refreshes queries on resume', () => {
    const { rerender } = render(<NativeLifecycle />);
    mocks.loading = false;
    rerender(<NativeLifecycle />);

    expect(mocks.hide).toHaveBeenCalledTimes(1);

    onResume?.();
    expect(mocks.invalidateQueries).toHaveBeenCalledTimes(1);
  });

  it('does not refetch queries on resume while offline', () => {
    mocks.loading = false;
    mocks.online = false;
    render(<NativeLifecycle />);

    onResume?.();
    expect(mocks.invalidateQueries).not.toHaveBeenCalled();
  });
});
