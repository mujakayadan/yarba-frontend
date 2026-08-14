import { describe, expect, it } from 'vitest';
import { NATIVE_PASSWORD_POLICY_MESSAGE, validateNativePassword } from './passwordPolicy';

describe('validateNativePassword', () => {
  it.each(['Password1', 'Valid.Password1', 'Valid@$!%*?&#1'])(
    'accepts a backend-supported password: %s',
    (password) => {
      expect(validateNativePassword(password)).toBeNull();
    }
  );

  it.each([
    'Short1',
    `${'A'.repeat(63)}a1`,
    'lowercase1',
    'UPPERCASE1',
    'NoNumberPassword',
    'Invalid_Password1',
    'Invalid Password1',
  ])('returns the backend policy message for invalid input: %s', (password) => {
    expect(validateNativePassword(password)).toBe(NATIVE_PASSWORD_POLICY_MESSAGE);
  });
});
