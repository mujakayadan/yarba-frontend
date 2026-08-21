import React from 'react';
import { Checkbox, FormControl, FormControlLabel, FormHelperText, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { LEGAL_VERSION } from '../../content/legalDocuments';

interface LegalAgreementFieldsProps {
  checked: boolean;
  disabled?: boolean;
  error?: boolean;
  onChange: (checked: boolean) => void;
}

const LegalAgreementFields: React.FC<LegalAgreementFieldsProps> = ({
  checked,
  disabled = false,
  error = false,
  onChange,
}) => (
  <FormControl required error={error} disabled={disabled} component="fieldset" variant="standard">
    <FormControlLabel
      control={
        <Checkbox
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          name="legalAgreement"
        />
      }
      label={
        <>
          I confirm I am at least 13, agree to the{' '}
          <Link component={RouterLink} to="/terms" target="_blank" rel="noopener">
            Terms
          </Link>{' '}
          and{' '}
          <Link component={RouterLink} to="/acceptable-use" target="_blank" rel="noopener">
            Acceptable Use Policy
          </Link>
          , and acknowledge the{' '}
          <Link component={RouterLink} to="/privacy" target="_blank" rel="noopener">
            Privacy Policy
          </Link>{' '}
          and{' '}
          <Link component={RouterLink} to="/ai-data-use" target="_blank" rel="noopener">
            AI Data Use Notice
          </Link>
          .
        </>
      }
    />
    <FormHelperText>
      {error
        ? 'You must confirm these terms before continuing.'
        : `Policy version ${LEGAL_VERSION}`}
    </FormHelperText>
  </FormControl>
);

export default LegalAgreementFields;
