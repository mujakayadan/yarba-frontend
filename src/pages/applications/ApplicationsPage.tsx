import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Pagination,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Link as LinkIcon } from '@mui/icons-material';
import { ViewPageHeader } from '../../components/common/ViewPageHeader';
import { PageLoadingState } from '../../components/common/PageState';
import { useApplications } from '../../hooks/useApplications';
import type { JobApplication } from '../../types/application';
import { Link as RouterLink } from 'react-router-dom';

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'preview_ready', label: 'Preview ready' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'failed', label: 'Failed' },
];

const formatDate = (value: string | null) => {
  if (!value) {
    return '—';
  }
  return new Date(value).toLocaleString();
};

const statusColor = (
  status: string
): 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' => {
  switch (status) {
    case 'submitted':
      return 'success';
    case 'preview_ready':
      return 'info';
    case 'failed':
      return 'error';
    case 'draft':
      return 'default';
    default:
      return 'warning';
  }
};

const formatStatus = (status: string) =>
  status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

const ApplicationsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const listParams = useMemo(
    () => ({
      skip: (page - 1) * PAGE_SIZE,
      limit: PAGE_SIZE,
      status: statusFilter || undefined,
    }),
    [page, statusFilter]
  );

  const { data, isLoading, isFetching, isError } = useApplications(listParams);
  const applications = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleStatusChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
    setPage(1);
  };

  if (isLoading) {
    return <PageLoadingState />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <ViewPageHeader
        title="Applications"
        description="Track job applications prepared and submitted through Yarba automation agents."
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="application-status-filter">Status</InputLabel>
          <Select
            labelId="application-status-filter"
            value={statusFilter}
            label="Status"
            onChange={handleStatusChange}
          >
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value || 'all'} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load applications. Please try again.
        </Alert>
      )}

      <Paper elevation={1}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Company</TableCell>
                <TableCell>Job title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Updated</TableCell>
                <TableCell align="right">Link</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">
                      No applications yet. Agents will create records when they prepare or submit
                      applications.
                    </Typography>
                    <Button
                      component={RouterLink}
                      to="/user/agent-tokens"
                      variant="outlined"
                      sx={{ mt: 2 }}
                    >
                      Set up agent access
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((application: JobApplication) => (
                  <TableRow key={application.id} hover>
                    <TableCell>{application.company_name || '—'}</TableCell>
                    <TableCell>{application.job_title || '—'}</TableCell>
                    <TableCell>
                      <Chip
                        label={formatStatus(application.status)}
                        size="small"
                        color={statusColor(application.status)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{formatDate(application.created_at)}</TableCell>
                    <TableCell>{formatDate(application.updated_at)}</TableCell>
                    <TableCell align="right">
                      {application.job_url ? (
                        <Link
                          href={application.job_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
                        >
                          <LinkIcon fontSize="small" />
                          Open
                        </Link>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {isFetching && !isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
            <CircularProgress size={20} />
          </Box>
        )}
      </Paper>

      {total > PAGE_SIZE && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
};

export default ApplicationsPage;
