import Grid from '../../../mui/Grid';
import React from 'react';
import { Typography, Divider, Paper, Box, Button, TextField, IconButton } from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import type { PortfolioEditForm } from '../../../hooks/usePortfolioEditForm';

interface WorkExperienceEditTabProps {
  form: PortfolioEditForm;
}

export const WorkExperienceEditTab: React.FC<WorkExperienceEditTabProps> = ({ form }) => {
  const { workExperience, setWorkExperience, newResponsibility, setNewResponsibility } = form;

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Work Experience
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {workExperience.map((exp, expIndex) => (
        <Paper key={expIndex} variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              {exp.job_title} at {exp.company}
            </Typography>

            <Button
              size="small"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => {
                setWorkExperience(workExperience.filter((_, index) => index !== expIndex));
              }}
            >
              Remove
            </Button>
          </Box>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Job Title"
                value={exp.job_title}
                onChange={(e) => {
                  const updatedExperience = [...workExperience];
                  updatedExperience[expIndex].job_title = e.target.value;
                  setWorkExperience(updatedExperience);
                }}
                variant="outlined"
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company"
                value={exp.company}
                onChange={(e) => {
                  const updatedExperience = [...workExperience];
                  updatedExperience[expIndex].company = e.target.value;
                  setWorkExperience(updatedExperience);
                }}
                variant="outlined"
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                value={exp.location}
                onChange={(e) => {
                  const updatedExperience = [...workExperience];
                  updatedExperience[expIndex].location = e.target.value;
                  setWorkExperience(updatedExperience);
                }}
                variant="outlined"
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Time Period"
                value={exp.time}
                onChange={(e) => {
                  const updatedExperience = [...workExperience];
                  updatedExperience[expIndex].time = e.target.value;
                  setWorkExperience(updatedExperience);
                }}
                variant="outlined"
                size="small"
                placeholder="e.g., 01/2023 - Present"
              />
            </Grid>
          </Grid>

          <Typography variant="subtitle2" gutterBottom>
            Responsibilities
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
            {exp.responsibilities.map((responsibility, respIndex) => (
              <Box key={respIndex} sx={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                  fullWidth
                  value={responsibility}
                  onChange={(e) => {
                    const updatedExperience = [...workExperience];
                    updatedExperience[expIndex].responsibilities[respIndex] = e.target.value;
                    setWorkExperience(updatedExperience);
                  }}
                  variant="outlined"
                  size="small"
                  sx={{ mr: 1 }}
                />
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => {
                    const updatedExperience = [...workExperience];
                    updatedExperience[expIndex].responsibilities = updatedExperience[
                      expIndex
                    ].responsibilities.filter((_, idx) => idx !== respIndex);
                    setWorkExperience(updatedExperience);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}

            {exp.responsibilities.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No responsibilities added yet
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              label="New Responsibility"
              value={newResponsibility[expIndex] || ''}
              onChange={(e) =>
                setNewResponsibility((prev) => ({ ...prev, [expIndex]: e.target.value }))
              }
              variant="outlined"
              size="small"
              sx={{ flexGrow: 1, mr: 2 }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const value = (newResponsibility[expIndex] || '').trim();
                  if (value) {
                    const updatedExperience = [...workExperience];
                    updatedExperience[expIndex].responsibilities.push(value);
                    setWorkExperience(updatedExperience);
                    setNewResponsibility((prev) => ({ ...prev, [expIndex]: '' }));
                  }
                }
              }}
            />

            <Button
              variant="outlined"
              onClick={() => {
                const value = (newResponsibility[expIndex] || '').trim();
                if (value) {
                  const updatedExperience = [...workExperience];
                  updatedExperience[expIndex].responsibilities.push(value);
                  setWorkExperience(updatedExperience);
                  setNewResponsibility((prev) => ({ ...prev, [expIndex]: '' }));
                }
              }}
              disabled={!(newResponsibility[expIndex] || '').trim()}
            >
              Add
            </Button>
          </Box>
        </Paper>
      ))}

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={() => {
          setWorkExperience([
            ...workExperience,
            {
              job_title: '',
              company: '',
              location: '',
              time: '',
              responsibilities: [],
            },
          ]);
        }}
        sx={{ mt: 2 }}
      >
        Add Work Experience
      </Button>
    </>
  );
};
