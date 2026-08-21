import React from 'react';
import { Box, Typography, Chip, Divider } from '@mui/material';
import type { PortfolioViewTabProps } from '../../../../types/portfolioView';

export const WorkExperienceViewTab: React.FC<PortfolioViewTabProps> = ({ sorted }) => {
  const { sortedWorkExperience } = sorted;

  return (
    <>
      {sortedWorkExperience.map((job, index) => (
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
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'bold',
                  color: 'primary.main',
                }}
              >
                {job.job_title || job.position || 'Untitled Position'}
              </Typography>
              <Typography variant="subtitle1">{job.company}</Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                }}
              >
                {job.location}
              </Typography>
            </Box>
            <Chip
              label={
                job.time ||
                (job.start_date &&
                  `${job.start_date}${job.end_date ? ` - ${job.end_date}` : ''}${job.current ? ' - Present' : ''}`)
              }
              size="small"
              color="secondary"
              sx={{ alignSelf: { xs: 'flex-start', sm: 'flex-start' }, mt: { xs: 1, sm: 0 } }}
            />
          </Box>

          {job.description && (
            <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
              {job.description}
            </Typography>
          )}

          {job.responsibilities && job.responsibilities.length > 0 && (
            <>
              <Divider sx={{ my: 1.5 }} />
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 'bold',
                  mb: 1.5,
                }}
              >
                Key Responsibilities:
              </Typography>
              <Box component="ol" sx={{ m: 0, pl: 3 }}>
                {job.responsibilities.map((responsibility, responsibilityIndex) => (
                  <Box component="li" key={responsibilityIndex} sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                      {responsibility}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </>
          )}

          {job.achievements && job.achievements.length > 0 && (
            <>
              <Divider sx={{ my: 1.5 }} />
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 'bold',
                  mb: 1.5,
                }}
              >
                Key Achievements:
              </Typography>
              <Box component="ol" sx={{ m: 0, pl: 3 }}>
                {job.achievements.map((achievement, achievementIndex) => (
                  <Box component="li" key={achievementIndex} sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                      {achievement}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </>
          )}
        </Box>
      ))}
      {sortedWorkExperience.length === 0 && (
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
          }}
        >
          No work experience added yet
        </Typography>
      )}
    </>
  );
};
