import { describe, expect, it } from 'vitest';
import { resolveNativeApiUrl } from './env';

describe('resolveNativeApiUrl', () => {
  it('rewrites localhost to the Android emulator loopback', () => {
    expect(resolveNativeApiUrl('http://localhost:8000/api/v1', 'android', true)).toBe(
      'http://10.0.2.2:8000/api/v1'
    );
  });

  it('leaves browser and iOS URLs unchanged', () => {
    expect(resolveNativeApiUrl('http://localhost:8000/api/v1', 'web', false)).toBe(
      'http://localhost:8000/api/v1'
    );
    expect(resolveNativeApiUrl('http://localhost:8000/api/v1', 'ios', true)).toBe(
      'http://localhost:8000/api/v1'
    );
  });

  it('leaves hosted HTTPS APIs unchanged on Android', () => {
    expect(resolveNativeApiUrl('https://api.yarba.app/api/v1', 'android', true)).toBe(
      'https://api.yarba.app/api/v1'
    );
  });
});
