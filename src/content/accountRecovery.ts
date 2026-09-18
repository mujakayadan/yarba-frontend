export const SUPPORT_EMAIL = 'admin@yarba.app';

export const ACCOUNT_RECOVERY_TEXT = {
  returningUserNotice:
    'If you used Yarba before and your password no longer works, request a new password. Google users can keep signing in with Google. Do not create a second account.',
  forgotNotice:
    'Returning users set a new password here. Your resumes and profile stay on the same account.',
  forgotDescription:
    'Enter the email on your existing Yarba account. We will send a one-time reset link if that address is eligible.',
  resetMissing:
    'This password reset link is invalid or incomplete. Request a new one from the email address on your account.',
  resetExpired:
    'This password reset link is invalid, used, or expired. Request a new one. The link in the reset email can only be used once.',
  linkingRequired:
    'This Google account is not linked to your existing Yarba login. Sign in with email instead, or request a new password if you have not set one. Do not create a second account.',
  requestNewPassword: 'Request a new password',
  supportHint: 'If you still cannot sign in, email support and include this reference:',
  faqQuestion: 'I used Yarba before and cannot sign in',
  faqAnswer:
    'Request a new password with the email on your existing account. If you previously signed in with Google, continue with Google. Do not create a second account. If you still cannot get in, email support and include the access reference shown on the sign-in or reset pages.',
  supportTitle: 'Account access',
  supportBody:
    'Set a new password for an existing account, or continue with Google if that is how you signed in before. Do not create a second account.',
} as const;

export const buildAccessSupportReference = (at: Date = new Date()): string => {
  const year = at.getUTCFullYear();
  const month = String(at.getUTCMonth() + 1).padStart(2, '0');
  const day = String(at.getUTCDate()).padStart(2, '0');
  return `YARBA-ACCESS-${year}${month}${day}`;
};

export const buildAccessSupportMailto = (
  reference: string = buildAccessSupportReference()
): string => `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(reference)}`;
