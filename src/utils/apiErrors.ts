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

export const resolveAuthErrorMessage = (
  body: ApiErrorResponse | null,
  fallback: string
): { message: string; errorCode?: string } => {
  const errorCode = body?.error_code;
  if (errorCode && AUTH_ERROR_MESSAGES[errorCode]) {
    return { message: AUTH_ERROR_MESSAGES[errorCode], errorCode };
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
  const error = err as { response?: { data?: ApiErrorResponse }; message?: string };
  const body = extractApiErrorBody(error.response?.data);

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
