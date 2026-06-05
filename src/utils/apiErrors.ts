type ValidationErrorDetail = {
  type?: string;
  loc?: (string | number)[];
  msg?: string;
  input?: unknown;
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
  const error = err as { response?: { data?: { detail?: unknown } }; message?: string };

  const detailMessage = formatValidationDetail(error.response?.data?.detail);
  if (detailMessage) {
    return detailMessage;
  }

  if (error.message) {
    return error.message;
  }

  return fallback;
};
