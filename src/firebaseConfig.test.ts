import { describe, expect, it } from 'vitest';
import { shouldEnableFirebaseAnalytics } from './firebaseConfig';

describe('shouldEnableFirebaseAnalytics', () => {
  it('enables only when the JS SDK is supported on web', () => {
    expect(shouldEnableFirebaseAnalytics(true, false)).toBe(true);
    expect(shouldEnableFirebaseAnalytics(false, false)).toBe(false);
  });

  it('stays off in native builds even when the SDK reports support', () => {
    expect(shouldEnableFirebaseAnalytics(true, true)).toBe(false);
  });
});
