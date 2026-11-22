import { describe, expect, it } from 'vitest';
import { resolveNativeApiUrl, shouldUseProviderOAuth } from './env';

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

describe('shouldUseProviderOAuth', () => {
  const googleClientId = 'web-client.apps.googleusercontent.com';

  it('uses Google when the web client ID is set on web or native', () => {
    expect(
      shouldUseProviderOAuth({
        nativeRuntime: false,
        googleClientId,
      })
    ).toBe(true);
    expect(
      shouldUseProviderOAuth({
        nativeRuntime: true,
        googleClientId,
      })
    ).toBe(true);
  });

  it('uses Apple on the web when Apple env is set and Google is not', () => {
    expect(
      shouldUseProviderOAuth({
        nativeRuntime: false,
        appleServiceId: 'com.example.yarba.web',
        appleRedirectUri: 'https://www.yarba.app/login',
      })
    ).toBe(true);
  });

  it('hides provider buttons on native when only Apple is configured', () => {
    expect(
      shouldUseProviderOAuth({
        nativeRuntime: true,
        appleServiceId: 'com.example.yarba.web',
        appleRedirectUri: 'https://www.yarba.app/login',
      })
    ).toBe(false);
  });

  it('stays off when neither Google nor Apple is configured', () => {
    expect(shouldUseProviderOAuth({ nativeRuntime: false })).toBe(false);
    expect(shouldUseProviderOAuth({ nativeRuntime: true })).toBe(false);
  });
});
