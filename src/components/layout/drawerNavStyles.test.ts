import { describe, expect, it } from 'vitest';
import { DISPLAY_FONT_FAMILY } from '../../theme/fonts';
import { getDrawerNavPrimaryTypographySx } from './drawerNavStyles';

describe('getDrawerNavPrimaryTypographySx', () => {
  it('uses the shared display face and shrinks long labels', () => {
    expect(getDrawerNavPrimaryTypographySx('Dashboard').fontFamily).toBe(DISPLAY_FONT_FAMILY);
    expect(getDrawerNavPrimaryTypographySx('Dashboard').fontSize).toBe('1rem');
    expect(getDrawerNavPrimaryTypographySx('Cover Letters').fontSize).toBe('0.85rem');
  });
});
