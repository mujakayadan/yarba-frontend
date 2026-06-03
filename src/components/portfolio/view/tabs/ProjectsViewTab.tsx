import React from 'react';
import { Box, Typography, Chip, List, ListItem, IconButton } from '@mui/material';
import { Link as LinkIcon } from '@mui/icons-material';
import type { PortfolioViewTabProps } from '../../../../types/portfolioView';

export const ProjectsViewTab: React.FC<PortfolioViewTabProps> = ({ sorted }) => {
  const { sortedProjects } = sorted;

  return (
    <>
      {sortedProjects.map((project, index) => (
        <Box
          key={index}
          sx={{
            p: 3,
            mb: 3,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              mb: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography
                variant="h6"
                component="div"
                color="primary.main"
                sx={{ fontWeight: 'bold' }}
              >
                {project.name}
              </Typography>
              {/* Display Project Link */}
              {project.link && (
                <IconButton
                  size="small"
                  component="a"
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Link to ${project.name}`}
                  sx={{ ml: 1 }}
                >
                  <LinkIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
            {(project.date || project.start_date) && (
              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                {project.date || project.start_date}
              </Typography>
            )}
          </Box>

          {project.description && (
            <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-line' }}>
              {project.description}
            </Typography>
          )}

          {project.bullet_points && project.bullet_points.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Key Points:
              </Typography>
              <List dense sx={{ pl: 2 }}>
                {project.bullet_points.map((point, pointIndex) => (
                  <ListItem
                    key={pointIndex}
                    sx={{
                      display: 'list-item',
                      pl: 0,
                      py: 0.2,
                      listStyleType: 'disc',
                      listStylePosition: 'inside',
                    }}
                  >
                    <Typography component="span" variant="body2">
                      {point}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {project.technologies && project.technologies.length > 0 && (
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                Technologies:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {project.technologies.map((tech, techIndex) => (
                  <Chip
                    key={techIndex}
                    label={tech}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      ))}
      {sortedProjects.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No projects added yet
        </Typography>
      )}
    </>
  );
};
