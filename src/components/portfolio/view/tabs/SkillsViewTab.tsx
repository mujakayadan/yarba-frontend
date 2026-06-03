import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import type { PortfolioViewTabProps } from '../../../../types/portfolioView';

export const SkillsViewTab: React.FC<PortfolioViewTabProps> = ({ portfolio }) => (
  <>
    {portfolio.skills && portfolio.skills.length > 0 ? (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {portfolio.skills.map((skillCategory, index) => {
          // Create a deterministic color based on index
          const colorIndex = index % 5;
          const colors = ['primary', 'secondary', 'success', 'info', 'warning'];
          const color = colors[colorIndex] as
            | 'primary'
            | 'secondary'
            | 'success'
            | 'info'
            | 'warning';

          // Get skills directly from the skills property since that's what the API returns
          const skillsArray: string[] = skillCategory.skills || [];

          return (
            <Box key={index}>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  color: `${color}.main`,
                  fontWeight: 'bold',
                  pb: 0.5,
                  borderBottom: 1,
                  borderColor: `${color}.light`,
                  display: 'inline-block',
                }}
              >
                {skillCategory.category}
              </Typography>

              {skillsArray.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, ml: 1 }}>
                  {skillsArray.map((skill, skillIndex) => (
                    <Chip
                      key={skillIndex}
                      label={skill}
                      color={color}
                      variant="outlined"
                      size="medium"
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary" sx={{ ml: 1 }}>
                  No skills found in this category
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>
    ) : (
      <Typography variant="body2" color="text.secondary">
        No skills added yet
      </Typography>
    )}
  </>
);
