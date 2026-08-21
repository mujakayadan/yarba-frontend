import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { submitAbuseReport } from '../../services/abuseReportService';
import type { AbuseReportCategory, AbuseReportResponse } from '../../types/models';
import { extractApiErrorMessage } from '../../utils/apiErrors';

const CATEGORY_OPTIONS: readonly { value: AbuseReportCategory; label: string }[] = [
  { value: 'illegal_content', label: 'Illegal content or activity' },
  { value: 'sexual_content', label: 'Pornography or sexually explicit content' },
  { value: 'minor_safety', label: 'Child safety or exploitation' },
  {
    value: 'non_consensual_intimate_image',
    label: 'Non-consensual intimate image or sexual deepfake',
  },
  { value: 'copyright', label: 'Copyright infringement' },
  { value: 'impersonation', label: 'Impersonation or fraud' },
  { value: 'harassment', label: 'Harassment, threat, or doxxing' },
  { value: 'privacy', label: 'Privacy violation' },
  { value: 'malware_or_phishing', label: 'Malware, phishing, or credential theft' },
  { value: 'other', label: 'Other policy violation' },
];

const SUBDOMAIN_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

const normalizeSubdomain = (value: string): string => {
  const trimmed = value.trim().toLowerCase();
  try {
    const hostname = new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`).hostname;
    return hostname.endsWith('.yarba.app') ? hostname.slice(0, -'.yarba.app'.length) : trimmed;
  } catch {
    return trimmed.replace(/\.yarba\.app$/, '');
  }
};

const ReportAbusePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [subdomain, setSubdomain] = useState(() =>
    normalizeSubdomain(searchParams.get('subdomain') ?? '')
  );
  const [reportedUrl, setReportedUrl] = useState(searchParams.get('url') ?? '');
  const [category, setCategory] = useState<AbuseReportCategory>('illegal_content');
  const [description, setDescription] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [result, setResult] = useState<AbuseReportResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedSubdomain = normalizeSubdomain(subdomain);
    setFieldError(null);
    setSubmissionError(null);

    if (!SUBDOMAIN_PATTERN.test(normalizedSubdomain)) {
      setFieldError('Enter a valid yarba.app subdomain.');
      return;
    }
    if (description.trim().length < 20) {
      setFieldError('Describe the specific content and location using at least 20 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await submitAbuseReport({
        subdomain: normalizedSubdomain,
        reported_url: reportedUrl.trim() || undefined,
        category,
        description: description.trim(),
        reporter_email: reporterEmail.trim() || undefined,
        company_website: companyWebsite || undefined,
      });
      setResult(response);
    } catch (error: unknown) {
      setSubmissionError(
        extractApiErrorMessage(error, 'We could not submit this report. Please try again.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, md: 6 } }}>
      <Typography component="h1" variant="h3" gutterBottom>
        Report abuse
      </Typography>
      <Typography color="text.secondary" paragraph>
        Report a public yarba.app portfolio that may violate the law or Yarba’s{' '}
        <Link component={RouterLink} to="/acceptable-use">
          Acceptable Use Policy
        </Link>
        . You do not need an account.
      </Typography>

      {result ? (
        <Alert severity="success">
          Report {result.report_id} was received. {result.message}
          {result.response_due_at
            ? ` The initial response deadline is ${new Date(result.response_due_at).toLocaleString()}.`
            : ''}
        </Alert>
      ) : (
        <Paper component="form" variant="outlined" onSubmit={handleSubmit} sx={{ p: 3 }}>
          {category === 'non_consensual_intimate_image' || category === 'minor_safety' ? (
            <Alert severity="warning" sx={{ mb: 3 }}>
              Do not upload or repeat exploitative imagery here. Identify the exact URL and provide
              only the information needed to locate it. Contact emergency services if someone is in
              immediate danger.
            </Alert>
          ) : null}
          {category === 'copyright' ? (
            <Alert severity="info" sx={{ mb: 3 }}>
              A copyright notice must include the statements listed in the{' '}
              <Link component={RouterLink} to="/copyright">
                Copyright Policy
              </Link>
              .
            </Alert>
          ) : null}
          {fieldError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {fieldError}
            </Alert>
          ) : null}
          {submissionError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submissionError}
            </Alert>
          ) : null}

          <Box sx={{ display: 'grid', gap: 2.5 }}>
            <TextField
              required
              label="Yarba subdomain"
              placeholder="example or example.yarba.app"
              value={subdomain}
              onChange={(event) => setSubdomain(event.target.value)}
              disabled={isSubmitting}
            />
            <TextField
              label="Exact URL"
              type="url"
              value={reportedUrl}
              onChange={(event) => setReportedUrl(event.target.value)}
              disabled={isSubmitting}
              helperText="Include the page or asset URL when possible."
            />
            <FormControl required>
              <InputLabel id="report-category-label">Reason</InputLabel>
              <Select
                labelId="report-category-label"
                label="Reason"
                value={category}
                onChange={(event) => setCategory(event.target.value as AbuseReportCategory)}
                disabled={isSubmitting}
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              required
              multiline
              minRows={5}
              label="What happened?"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={isSubmitting}
              helperText="Identify the content, where it appears, and why it violates the policy."
            />
            <TextField
              label="Your email"
              type="email"
              value={reporterEmail}
              onChange={(event) => setReporterEmail(event.target.value)}
              disabled={isSubmitting}
              helperText="Optional, unless we need to verify a legal request or contact you."
            />
            <TextField
              aria-hidden="true"
              inputProps={{ tabIndex: -1 }}
              autoComplete="off"
              label="Company website"
              value={companyWebsite}
              onChange={(event) => setCompanyWebsite(event.target.value)}
              sx={{
                position: 'absolute',
                left: '-10000px',
                width: 1,
                height: 1,
                overflow: 'hidden',
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : undefined}
            >
              Submit report
            </Button>
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default ReportAbusePage;
