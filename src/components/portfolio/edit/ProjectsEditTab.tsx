import Grid from '../../../mui/Grid';
import React from 'react';
import { Typography, Divider, Paper, Box, Button, TextField, IconButton } from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import type { PortfolioEditForm } from '../../../hooks/usePortfolioEditForm';

interface ProjectsEditTabProps {
  form: PortfolioEditForm;
}

export const ProjectsEditTab: React.FC<ProjectsEditTabProps> = ({ form }) => {
  const { projects, setProjects, newBulletPoint, setNewBulletPoint } = form;

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Projects
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {projects.map((project, projectIndex) => (
        <Paper key={projectIndex} variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 'bold',
              }}
            >
              {project.name || 'Untitled Project'}
            </Typography>

            <Button
              size="small"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => {
                setProjects(projects.filter((_, index) => index !== projectIndex));
              }}
            >
              Remove
            </Button>
          </Box>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Project Name"
                value={project.name}
                onChange={(e) => {
                  const updatedProjects = [...projects];
                  updatedProjects[projectIndex].name = e.target.value;
                  setProjects(updatedProjects);
                }}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Date"
                value={project.date}
                onChange={(e) => {
                  const updatedProjects = [...projects];
                  updatedProjects[projectIndex].date = e.target.value;
                  setProjects(updatedProjects);
                }}
                variant="outlined"
                size="small"
                placeholder="e.g., 2023"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Link"
                value={project.link || ''}
                onChange={(e) => {
                  const updatedProjects = [...projects];
                  updatedProjects[projectIndex].link = e.target.value;
                  setProjects(updatedProjects);
                }}
                variant="outlined"
                size="small"
                placeholder="e.g., https://github.com/user/project"
              />
            </Grid>
          </Grid>

          <Typography variant="subtitle2" gutterBottom>
            Project Details
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
            {project.bullet_points.map((point, pointIndex) => (
              <Box key={pointIndex} sx={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                  fullWidth
                  value={point}
                  onChange={(e) => {
                    const updatedProjects = [...projects];
                    updatedProjects[projectIndex].bullet_points[pointIndex] = e.target.value;
                    setProjects(updatedProjects);
                  }}
                  variant="outlined"
                  size="small"
                  sx={{ mr: 1 }}
                />
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => {
                    const updatedProjects = [...projects];
                    updatedProjects[projectIndex].bullet_points = updatedProjects[
                      projectIndex
                    ].bullet_points.filter((_, idx) => idx !== pointIndex);
                    setProjects(updatedProjects);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}

            {project.bullet_points.length === 0 && (
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                }}
              >
                No project details added yet
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              label="New Detail"
              value={newBulletPoint}
              onChange={(e) => setNewBulletPoint(e.target.value)}
              variant="outlined"
              size="small"
              sx={{ flexGrow: 1, mr: 2 }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (newBulletPoint.trim()) {
                    const updatedProjects = [...projects];
                    updatedProjects[projectIndex].bullet_points.push(newBulletPoint.trim());
                    setProjects(updatedProjects);
                    setNewBulletPoint('');
                  }
                }
              }}
            />

            <Button
              variant="outlined"
              onClick={() => {
                if (newBulletPoint.trim()) {
                  const updatedProjects = [...projects];
                  updatedProjects[projectIndex].bullet_points.push(newBulletPoint.trim());
                  setProjects(updatedProjects);
                  setNewBulletPoint('');
                }
              }}
              disabled={!newBulletPoint.trim()}
            >
              Add Detail
            </Button>
          </Box>
        </Paper>
      ))}

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={() => {
          setProjects([
            ...projects,
            {
              name: '',
              bullet_points: [],
              date: '',
              link: '',
            },
          ]);
        }}
        sx={{ mt: 2 }}
      >
        Add Project
      </Button>
    </>
  );
};
