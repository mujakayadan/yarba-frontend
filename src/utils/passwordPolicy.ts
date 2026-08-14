export const NATIVE_PASSWORD_POLICY_MESSAGE =
  'Password must be 8-64 characters and contain at least one uppercase letter, one lowercase letter, and one number';

const NATIVE_PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d.@$!%*?&#]{8,64}$/;

export const validateNativePassword = (password: string): string | null =>
  NATIVE_PASSWORD_PATTERN.test(password) ? null : NATIVE_PASSWORD_POLICY_MESSAGE;
