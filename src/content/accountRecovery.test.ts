import { describe, expect, it } from 'vitest';
import { buildAccessSupportMailto, buildAccessSupportReference } from './accountRecovery';

describe('account recovery support reference', () => {
  it('builds a date-only escalation id without account data', () => {
    expect(buildAccessSupportReference(new Date('2026-09-18T16:20:00Z'))).toBe(
      'YARBA-ACCESS-20260918'
    );
  });

  it('puts the reference in the support email subject', () => {
    expect(buildAccessSupportMailto('YARBA-ACCESS-20260918')).toBe(
      'mailto:admin@yarba.app?subject=YARBA-ACCESS-20260918'
    );
  });
});
