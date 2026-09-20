import React from 'react';
import { Link, Typography } from '@mui/material';
import {
  ACCOUNT_RECOVERY_TEXT,
  SUPPORT_EMAIL,
  buildAccessSupportMailto,
  buildAccessSupportReference,
} from '../../content/accountRecovery';

interface AccountRecoveryHelpProps {
  includeForgotPassword?: boolean;
}

const AccountRecoveryHelp: React.FC<AccountRecoveryHelpProps> = ({
  includeForgotPassword = false,
}) => {
  const reference = buildAccessSupportReference();

  return (
    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
      {ACCOUNT_RECOVERY_TEXT.supportHint}{' '}
      <Typography component="span" sx={{ fontFamily: 'ui-monospace, monospace', fontWeight: 600 }}>
        {reference}
      </Typography>
      {'. '}
      <Link href={buildAccessSupportMailto(reference)}>{SUPPORT_EMAIL}</Link>
      {includeForgotPassword ? (
        <>
          {' · '}
          <Link href="/forgot-password">{ACCOUNT_RECOVERY_TEXT.requestNewPassword}</Link>
        </>
      ) : null}
    </Typography>
  );
};

export default AccountRecoveryHelp;
