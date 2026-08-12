import { describe, expect, it } from 'vitest';
import { PROFILE_EDIT_TABS } from './profileEditTabs';

describe('PROFILE_EDIT_TABS', () => {
  it('uses renderable components without fragile lazy module lookups', () => {
    expect(PROFILE_EDIT_TABS).toHaveLength(5);
    PROFILE_EDIT_TABS.forEach(({ Tab }) => {
      expect(typeof Tab).toBe('function');
    });
  });
});
