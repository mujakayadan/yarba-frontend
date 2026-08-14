import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { AxiosError } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  nativeAuth: true,
  refresh: vi.fn(),
  removeToken: vi.fn(),
  emitUnauthorized: vi.fn(),
  getToken: vi.fn(() => 'expired-token'),
}));

vi.mock('../config/env', () => ({
  env: {
    apiUrl: 'http://localhost/api/v1',
    get nativeAuth() {
      return mocks.nativeAuth;
    },
  },
  isDev: false,
}));

vi.mock('./nativeAuthSession', () => ({
  requestNativeSessionRefresh: mocks.refresh,
}));

vi.mock('../utils/auth', () => ({
  getToken: mocks.getToken,
  removeToken: mocks.removeToken,
}));

vi.mock('../utils/authEvents', () => ({
  emitUnauthorized: mocks.emitUnauthorized,
}));

import api from './api';

const successResponse = (config: InternalAxiosRequestConfig): AxiosResponse => ({
  data: { ok: true },
  status: 200,
  statusText: 'OK',
  headers: {},
  config,
});

const unauthorizedError = (config: InternalAxiosRequestConfig): AxiosError =>
  new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, undefined, {
    data: { detail: 'Unauthorized' },
    status: 401,
    statusText: 'Unauthorized',
    headers: {},
    config,
  });

describe('native auth response interceptor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.nativeAuth = true;
  });

  it('refreshes, stores through the refresh service, and retries a request once', async () => {
    mocks.refresh.mockResolvedValue({ access_token: 'new-token' });
    const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => {
      if (
        (config as InternalAxiosRequestConfig & { _nativeAuthRetry?: boolean })._nativeAuthRetry
      ) {
        return successResponse(config);
      }
      throw unauthorizedError(config);
    });
    api.defaults.adapter = adapter;

    const response = await api.get('/profiles/me');

    expect(response.data).toEqual({ ok: true });
    expect(mocks.refresh).toHaveBeenCalledTimes(1);
    expect(adapter).toHaveBeenCalledTimes(2);
    expect(mocks.removeToken).not.toHaveBeenCalled();
  });

  it('shares one in-flight refresh across concurrent 401 responses', async () => {
    let resolveRefresh: (() => void) | undefined;
    mocks.refresh.mockReturnValue(
      new Promise((resolve) => {
        resolveRefresh = () => resolve({ access_token: 'new-token' });
      })
    );
    api.defaults.adapter = vi.fn(async (config: InternalAxiosRequestConfig) => {
      if (
        (config as InternalAxiosRequestConfig & { _nativeAuthRetry?: boolean })._nativeAuthRetry
      ) {
        return successResponse(config);
      }
      throw unauthorizedError(config);
    });

    const firstRequest = api.get('/profiles/me');
    const secondRequest = api.get('/resumes');
    await vi.waitFor(() => expect(mocks.refresh).toHaveBeenCalledTimes(1));
    resolveRefresh?.();

    await expect(Promise.all([firstRequest, secondRequest])).resolves.toHaveLength(2);
    expect(mocks.refresh).toHaveBeenCalledTimes(1);
  });

  it('clears authentication and emits unauthorized once when shared refresh fails', async () => {
    mocks.refresh.mockRejectedValue(new Error('Refresh failed'));
    api.defaults.adapter = vi.fn(async (config: InternalAxiosRequestConfig) => {
      throw unauthorizedError(config);
    });

    const results = await Promise.allSettled([
      api.get('/profiles/me'),
      api.get('/resumes'),
      api.get('/cover-letters'),
    ]);

    expect(results.every((result) => result.status === 'rejected')).toBe(true);
    expect(mocks.refresh).toHaveBeenCalledTimes(1);
    expect(mocks.removeToken).toHaveBeenCalledTimes(1);
    expect(mocks.emitUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('does not refresh excluded password endpoints', async () => {
    api.defaults.adapter = vi.fn(async (config: InternalAxiosRequestConfig) => {
      throw unauthorizedError(config);
    });

    await expect(
      api.post('/auth/password/login', {
        email: 'user@example.com',
        password: 'wrong',
      })
    ).rejects.toBeInstanceOf(AxiosError);
    expect(mocks.refresh).not.toHaveBeenCalled();
    expect(mocks.removeToken).not.toHaveBeenCalled();
  });

  it('does not retry consumed OAuth nonce exchanges', async () => {
    api.defaults.adapter = vi.fn(async (config: InternalAxiosRequestConfig) => {
      throw unauthorizedError(config);
    });

    await expect(
      api.post('/auth/oauth/google', { id_token: 'provider-token' })
    ).rejects.toBeInstanceOf(AxiosError);

    expect(mocks.refresh).not.toHaveBeenCalled();
    expect(mocks.removeToken).not.toHaveBeenCalled();
  });

  it('preserves immediate 401 clearing in legacy Firebase mode', async () => {
    mocks.nativeAuth = false;
    api.defaults.adapter = vi.fn(async (config: InternalAxiosRequestConfig) => {
      throw unauthorizedError(config);
    });

    await expect(api.get('/profiles/me')).rejects.toBeInstanceOf(AxiosError);

    expect(mocks.refresh).not.toHaveBeenCalled();
    expect(mocks.removeToken).toHaveBeenCalledTimes(1);
    expect(mocks.emitUnauthorized).toHaveBeenCalledTimes(1);
  });
});
