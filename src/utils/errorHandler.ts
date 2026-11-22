import { ApiRequestError } from './apiErrors';

export const getAuthErrorMessage = (error: unknown): string => {
  if (error instanceof ApiRequestError) {
    return error.message;
  }

  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  return 'An error occurred';
};
