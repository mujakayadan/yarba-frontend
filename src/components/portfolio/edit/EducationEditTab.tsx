import Grid from '../../../mui/Grid';
import React from 'react';
import { Typography, Divider, Paper, Box, Button, TextField, Chip } from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import type { PortfolioEditForm } from '../../../hooks/usePortfolioEditForm';

interface EducationEditTabProps {
  form: PortfolioEditForm;
}

export const EducationEditTab: React.FC<EducationEditTabProps> = ({ form }) => {
  const { education, setEducation, newCourse, setNewCourse } = form;

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Education
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {education.map((edu, eduIndex) => (
        <Paper key={eduIndex} variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              {edu.degree_type} in {edu.degree} at {edu.university_name}
            </Typography>

            <Button
              size="small"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => {
                setEducation(education.filter((_, index) => index !== eduIndex));
              }}
            >
              Remove
            </Button>
          </Box>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Degree Type"
                value={edu.degree_type}
                onChange={(e) => {
                  const updatedEducation = [...education];
                  updatedEducation[eduIndex].degree_type = e.target.value;
                  setEducation(updatedEducation);
                }}
                variant="outlined"
                size="small"
                placeholder="e.g., Bachelor's Degree"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Degree"
                value={edu.degree}
                onChange={(e) => {
                  const updatedEducation = [...education];
                  updatedEducation[eduIndex].degree = e.target.value;
                  setEducation(updatedEducation);
                }}
                variant="outlined"
                size="small"
                placeholder="e.g., Computer Science"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="University/Institution"
                value={edu.university_name}
                onChange={(e) => {
                  const updatedEducation = [...education];
                  updatedEducation[eduIndex].university_name = e.target.value;
                  setEducation(updatedEducation);
                }}
                variant="outlined"
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Time Period"
                value={edu.time}
                onChange={(e) => {
                  const updatedEducation = [...education];
                  updatedEducation[eduIndex].time = e.target.value;
                  setEducation(updatedEducation);
                }}
                variant="outlined"
                size="small"
                placeholder="e.g., 2020 - 2024"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                value={edu.location}
                onChange={(e) => {
                  const updatedEducation = [...education];
                  updatedEducation[eduIndex].location = e.target.value;
                  setEducation(updatedEducation);
                }}
                variant="outlined"
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="GPA"
                value={edu.GPA}
                onChange={(e) => {
                  const updatedEducation = [...education];
                  updatedEducation[eduIndex].GPA = e.target.value;
                  setEducation(updatedEducation);
                }}
                variant="outlined"
                size="small"
                placeholder="e.g., 3.8"
              />
            </Grid>
          </Grid>

          <Typography variant="subtitle2" gutterBottom>
            Courses/Transcript
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {edu.transcript.map((course, courseIndex) => (
              <Chip
                key={courseIndex}
                label={course}
                onDelete={() => {
                  const updatedEducation = [...education];
                  updatedEducation[eduIndex].transcript = updatedEducation[
                    eduIndex
                  ].transcript.filter((_, idx) => idx !== courseIndex);
                  setEducation(updatedEducation);
                }}
                sx={{ m: 0.5 }}
              />
            ))}
            {edu.transcript.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No courses added yet
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              label="New Course"
              value={newCourse}
              onChange={(e) => setNewCourse(e.target.value)}
              variant="outlined"
              size="small"
              sx={{ flexGrow: 1, mr: 2 }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (newCourse.trim()) {
                    const updatedEducation = [...education];
                    updatedEducation[eduIndex].transcript.push(newCourse.trim());
                    setEducation(updatedEducation);
                    setNewCourse('');
                  }
                }
              }}
            />

            <Button
              variant="outlined"
              onClick={() => {
                if (newCourse.trim()) {
                  const updatedEducation = [...education];
                  updatedEducation[eduIndex].transcript.push(newCourse.trim());
                  setEducation(updatedEducation);
                  setNewCourse('');
                }
              }}
              disabled={!newCourse.trim()}
            >
              Add Course
            </Button>
          </Box>
        </Paper>
      ))}

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={() => {
          setEducation([
            ...education,
            {
              degree_type: '',
              degree: '',
              university_name: '',
              time: '',
              location: '',
              GPA: '',
              transcript: [],
            },
          ]);
        }}
        sx={{ mt: 2 }}
      >
        Add Education
      </Button>
    </>
  );
};
