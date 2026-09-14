import { describe, expect, it } from 'vitest';
import { DISPLAY_FONT_FAMILY } from './fonts';

describe('DISPLAY_FONT_FAMILY', () => {
  it('requests the CDN family name before the Pro alias', () => {
    expect(DISPLAY_FONT_FAMILY.startsWith("'Dreaming Outloud'")).toBe(true);
    expect(DISPLAY_FONT_FAMILY).toContain('Dreaming Outloud Pro');
    expect(DISPLAY_FONT_FAMILY).not.toContain('cursive');
  });
});
