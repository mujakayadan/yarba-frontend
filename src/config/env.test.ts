import { describe, expect, it } from 'vitest';
import { resolveNativeApiUrl, shouldUseNativeOAuth } from './env';

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

describe('shouldUseNativeOAuth', () => {
  const configured = {
    nativeAuth: true,
    nativeOAuth: false,
    googleClientId: 'web-client.apps.googleusercontent.com',
    appleServiceId: undefined as string | undefined,
    appleRedirectUri: undefined as string | undefined,
  };

  it('uses backend Google on web when native auth and the web client ID are set', () => {
    expect(shouldUseNativeOAuth({ ...configured, nativeRuntime: false })).toBe(true);
  });

  it('keeps Firebase Google on Capacitor until the mobile OAuth flag is on', () => {
    expect(shouldUseNativeOAuth({ ...configured, nativeRuntime: true })).toBe(false);
    expect(shouldUseNativeOAuth({ ...configured, nativeOAuth: true, nativeRuntime: true })).toBe(
      true
    );
  });

  it('stays on Firebase Google when the web client ID is missing', () => {
    expect(
      shouldUseNativeOAuth({
        ...configured,
        googleClientId: undefined,
        nativeRuntime: false,
      })
    ).toBe(false);
  });

  it('does not treat Apple placeholders as a web Google cutover', () => {
    expect(
      shouldUseNativeOAuth({
        nativeAuth: true,
        nativeOAuth: false,
        nativeRuntime: false,
        googleClientId: undefined,
        appleServiceId: 'com.example.yarba.web',
        appleRedirectUri: 'https://www.yarba.app/login',
      })
    ).toBe(false);
  });
});
