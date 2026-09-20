import axios from 'axios';
import { ACCOUNT_RECOVERY_TEXT } from '../content/accountRecovery';
import type { ApiErrorResponse } from '../types/models';

type ValidationErrorDetail = {
  type?: string;
  loc?: (string | number)[];
  msg?: string;
  input?: unknown;
};

export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  email_already_registered: 'An account with this email already exists. Please sign in instead.',
  invalid_credentials: 'Incorrect password for this account. Please try again.',
  account_exists_use_login:
    'An account with this email already exists. Sign in with Google or your social provider.',
  firebase_registration_failed: 'Registration failed. Please try again later.',
  account_linking_required: ACCOUNT_RECOVERY_TEXT.linkingRequired,
  invalid_or_expired_action_token: ACCOUNT_RECOVERY_TEXT.resetExpired,
  invalid_oauth_nonce: 'Google sign-in expired. Please try again.',
  invalid_provider_token: 'Google sign-in could not be verified. Please try again.',
  oauth_not_configured: 'Google sign-in is unavailable right now. Use email instead.',
  legal_acceptance_required: 'Please confirm the legal terms before creating an account.',
  provider_profile_incomplete:
    'Google did not share a verified email. Allow email access and try again.',
};

export class ApiRequestError extends Error {
  errorCode?: string;
  status?: number;

  constructor(message: string, options?: { errorCode?: string; status?: number }) {
    super(message);
    this.name = 'ApiRequestError';
    this.errorCode = options?.errorCode;
    this.status = options?.status;
  }
}

export const extractApiErrorBody = (data: unknown): ApiErrorResponse | null => {
  if (data && typeof data === 'object') {
    return data as ApiErrorResponse;
  }
  return null;
};

const INVALID_ACTION_TOKEN_MESSAGE = /invalid or expired action token/i;

export const isInvalidActionTokenMessage = (message: string | undefined): boolean =>
  Boolean(message && INVALID_ACTION_TOKEN_MESSAGE.test(message));

export const resolveAuthErrorMessage = (
  body: ApiErrorResponse | null,
  fallback: string
): { message: string; errorCode?: string } => {
  const errorCode = body?.error_code;
  if (errorCode && AUTH_ERROR_MESSAGES[errorCode]) {
    return { message: AUTH_ERROR_MESSAGES[errorCode], errorCode };
  }

  if (isInvalidActionTokenMessage(body?.message)) {
    return {
      message: AUTH_ERROR_MESSAGES.invalid_or_expired_action_token,
      errorCode: errorCode ?? 'invalid_or_expired_action_token',
    };
  }

  const detailMessage = formatValidationDetail(body?.detail);
  if (detailMessage) {
    return { message: detailMessage, errorCode };
  }

  if (body?.message) {
    return { message: body.message, errorCode };
  }

  return { message: fallback, errorCode };
};

export const normalizeAuthRequestError = (error: unknown, fallback: string): Error => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const body = extractApiErrorBody(error.response.data);
      const { message, errorCode } = resolveAuthErrorMessage(body, fallback);
      return new ApiRequestError(message, {
        errorCode,
        status: error.response.status,
      });
    }
    return new ApiRequestError(
      'Unable to reach the server. Please check your connection and try again.',
      { errorCode: 'network_error' }
    );
  }

  return error instanceof Error ? error : new Error(fallback);
};

const formatValidationDetail = (detail: unknown): string | null => {
  if (typeof detail === 'string') {
    return detail;
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (typeof item === 'string') {
          return item;
        }

        if (item && typeof item === 'object' && 'msg' in item) {
          const validationError = item as ValidationErrorDetail;
          const location = validationError.loc?.length ? validationError.loc.join('.') : '';
          return location
            ? `${location}: ${validationError.msg}`
            : String(validationError.msg ?? 'Validation error');
        }

        return null;
      })
      .filter((message): message is string => Boolean(message));

    if (messages.length > 0) {
      return messages.join('; ');
    }
  }

  if (detail && typeof detail === 'object') {
    try {
      return JSON.stringify(detail);
    } catch {
      return null;
    }
  }

  return null;
};

export const extractApiErrorMessage = (err: unknown, fallback: string): string => {
  if (err instanceof ApiRequestError) {
    return err.message || fallback;
  }

  const error = err as { response?: { data?: ApiErrorResponse }; message?: string };
  const body = extractApiErrorBody(error.response?.data);
  const mappedCode = body?.error_code;
  if (mappedCode && AUTH_ERROR_MESSAGES[mappedCode]) {
    return AUTH_ERROR_MESSAGES[mappedCode];
  }
  if (isInvalidActionTokenMessage(body?.message) || isInvalidActionTokenMessage(error.message)) {
    return AUTH_ERROR_MESSAGES.invalid_or_expired_action_token;
  }

  if (body?.message) {
    return body.message;
  }

  const detailMessage = formatValidationDetail(body?.detail);
  if (detailMessage) {
    return detailMessage;
  }

  if (error.message) {
    return error.message;
  }

  return fallback;
};
