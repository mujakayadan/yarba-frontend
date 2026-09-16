import { describe, expect, it } from 'vitest';
import { brandedAppBarHeight, SAFE_AREA } from './safeArea';

describe('SAFE_AREA', () => {
  it('prefers Capacitor CSS variables over env() fallbacks', () => {
    expect(SAFE_AREA.top).toBe('var(--safe-area-inset-top, env(safe-area-inset-top, 0px))');
    expect(SAFE_AREA.bottom).toContain('--safe-area-inset-bottom');
    expect(brandedAppBarHeight.xs).toContain(SAFE_AREA.top);
  });
});
