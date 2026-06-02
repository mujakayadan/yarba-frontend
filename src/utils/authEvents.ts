export const AUTH_UNAUTHORIZED_EVENT = 'yarba:auth-unauthorized';

export const emitUnauthorized = (): void => {
  window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT));
};
