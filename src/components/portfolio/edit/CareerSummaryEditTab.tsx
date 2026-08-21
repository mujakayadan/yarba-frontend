import Grid from '../../../mui/Grid';
import React from 'react';
import {
  Box,
  Typography,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  TextField,
  InputAdornment,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import type { PortfolioEditForm } from '../../../hooks/usePortfolioEditForm';

interface CareerSummaryEditTabProps {
  form: PortfolioEditForm;
}

export const CareerSummaryEditTab: React.FC<CareerSummaryEditTabProps> = ({ form }) => {
  const {
    careerSummary,
    setCareerSummary,
    handleDeleteJobTitle,
    jobTitleDialogOpen,
    setJobTitleDialogOpen,
    newJobTitle,
    setNewJobTitle,
  } = form;

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Career Summary
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{ p: 2, mb: 3, bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 1 }}
          >
            <Typography
              variant="subtitle2"
              gutterBottom
              sx={{
                color: 'text.secondary',
              }}
            >
              Preview:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, pl: 1 }}>
              <Typography variant="body1">A</Typography>
              <Chip
                label={
                  careerSummary.default_job_title ||
                  (careerSummary.job_titles.length > 0
                    ? careerSummary.job_titles[0]
                    : 'Your Job Title')
                }
                size="small"
                sx={{
                  bgcolor: careerSummary.default_job_title ? 'accent.main' : 'primary.main',
                  color: 'white',
                }}
              />
              <Typography variant="body1">
                with{' '}
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    fontWeight: 'bold',
                    bgcolor: 'rgba(25, 118, 210, 0.1)',
                    borderRadius: 1,
                    px: 1,
                    py: 0.3,
                    mx: 0.5,
                    border: '1px solid rgba(25, 118, 210, 0.3)',
                    color: 'primary.main',
                  }}
                >
                  {careerSummary.years_of_experience || '...'}
                </Box>{' '}
                years of experience {careerSummary.default_summary || '...'}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="default-job-title-label">Default Job Title</InputLabel>
            <Select
              labelId="default-job-title-label"
              id="default-job-title"
              value={careerSummary.default_job_title || ''}
              onChange={(e) =>
                setCareerSummary({
                  ...careerSummary,
                  default_job_title: e.target.value || undefined,
                })
              }
              label="Default Job Title"
              disabled={careerSummary.job_titles.length === 0}
            >
              <MenuItem value="">
                <em>None (Auto-generate from experience)</em>
              </MenuItem>
              {careerSummary.job_titles.map((title, index) => (
                <MenuItem key={index} value={title}>
                  {title}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Select a default job title to display in resumes</FormHelperText>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Years of Experience"
            value={careerSummary.years_of_experience}
            onChange={(e) =>
              setCareerSummary({
                ...careerSummary,
                years_of_experience: e.target.value,
              })
            }
            variant="outlined"
            placeholder="e.g., 5"
            margin="normal"
            slotProps={{
              input: {
                endAdornment: <InputAdornment position="end">years</InputAdornment>,
              },
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Professional Summary"
            value={careerSummary.default_summary}
            onChange={(e) =>
              setCareerSummary({
                ...careerSummary,
                default_summary: e.target.value,
              })
            }
            variant="outlined"
            placeholder="e.g., in software development, machine learning, and computer vision."
            margin="normal"
            multiline
            rows={3}
            helperText="Describe your experience and expertise without mentioning job title or years - those are automatically filled in"
          />
        </Grid>

        <Grid item xs={12} sx={{ mt: 1 }}>
          <Divider>
            <Chip label="Job Titles" size="small" />
          </Divider>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Available Job Titles
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {careerSummary.job_titles.map((title, index) => (
              <Chip
                key={index}
                label={title}
                color={title === careerSummary.default_job_title ? undefined : 'primary'}
                sx={{
                  bgcolor: title === careerSummary.default_job_title ? 'accent.main' : undefined,
                  color: title === careerSummary.default_job_title ? 'white' : undefined,
                }}
                onDelete={() => handleDeleteJobTitle(index)}
              />
            ))}
            <Chip
              icon={<AddIcon />}
              label="Add Job Title"
              onClick={() => setJobTitleDialogOpen(true)}
              color="default"
              variant="outlined"
              sx={{ borderStyle: 'dashed' }}
            />
            {careerSummary.job_titles.length === 0 && (
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                }}
              >
                No job titles added yet
              </Typography>
            )}
          </Box>

          <Dialog open={jobTitleDialogOpen} onClose={() => setJobTitleDialogOpen(false)}>
            <DialogTitle>Add New Job Title</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                id="jobTitle"
                label="Job Title"
                type="text"
                fullWidth
                variant="outlined"
                value={newJobTitle}
                onChange={(e) => setNewJobTitle(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newJobTitle.trim()) {
                    setCareerSummary({
                      ...careerSummary,
                      job_titles: [...careerSummary.job_titles, newJobTitle.trim()],
                    });
                    setNewJobTitle('');
                    setJobTitleDialogOpen(false);
                  }
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setJobTitleDialogOpen(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  if (newJobTitle.trim()) {
                    setCareerSummary({
                      ...careerSummary,
                      job_titles: [...careerSummary.job_titles, newJobTitle.trim()],
                    });
                    setNewJobTitle('');
                    setJobTitleDialogOpen(false);
                  }
                }}
                disabled={!newJobTitle.trim()}
              >
                Add
              </Button>
            </DialogActions>
          </Dialog>
        </Grid>
      </Grid>
    </>
  );
};
