import { AxiosError } from 'axios';
import { describe, expect, it } from 'vitest';
import {
  AUTH_ERROR_MESSAGES,
  ApiRequestError,
  extractApiErrorMessage,
  normalizeAuthRequestError,
} from './apiErrors';

describe('oauth auth error mapping', () => {
  it('maps account linking failures to a recovery message', () => {
    const axiosError = new AxiosError('Conflict', 'ERR_BAD_REQUEST', undefined, undefined, {
      data: {
        error_code: 'account_linking_required',
        message: 'Account linking is required',
      },
      status: 409,
      statusText: 'Conflict',
      headers: {},
      config: {} as never,
    });
    const error = normalizeAuthRequestError(
      axiosError,
      'Unable to complete provider sign-in. Please try again.'
    );

    expect(error).toBeInstanceOf(ApiRequestError);
    expect(error.message).toBe(AUTH_ERROR_MESSAGES.account_linking_required);
    expect(extractApiErrorMessage(error, 'fallback')).toBe(
      AUTH_ERROR_MESSAGES.account_linking_required
    );
  });
});
