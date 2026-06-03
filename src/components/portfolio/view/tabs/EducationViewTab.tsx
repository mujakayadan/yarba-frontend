import React from 'react';
import { Box, Typography, Chip, Paper } from '@mui/material';
import type { PortfolioViewTabProps } from '../../../../types/portfolioView';

export const EducationViewTab: React.FC<PortfolioViewTabProps> = ({ sorted }) => {
  const { sortedEducation } = sorted;

  return (
    <>
      {sortedEducation.map((edu, index) => (
        <Paper key={index} elevation={1} sx={{ p: 3, mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              mb: 1,
            }}
          >
            <Box>
              <Typography variant="h6">
                {edu.degree_type || ''} {edu.degree}
              </Typography>
              <Typography variant="subtitle1">{edu.institution || edu.university_name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {edu.time ||
                  (edu.start_date &&
                    `${edu.start_date}${edu.end_date ? ` - ${edu.end_date}` : ''}${edu.current ? ' - Present' : ''}`)}{' '}
                | {edu.field_of_study || ''}
                {edu.location && ` | ${edu.location}`}
              </Typography>
            </Box>
            {edu.GPA && (
              <Chip
                label={`GPA: ${edu.GPA}`}
                size="small"
                color="primary"
                sx={{ alignSelf: { xs: 'flex-start', sm: 'flex-start' }, mt: { xs: 1, sm: 0 } }}
              />
            )}
          </Box>

          {edu.description && (
            <Typography variant="body1" sx={{ mt: 2 }}>
              {edu.description}
            </Typography>
          )}

          {edu.transcript && edu.transcript.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Transcript/Courses:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {edu.transcript.map((course, courseIndex) => (
                  <Chip key={courseIndex} label={course} size="small" />
                ))}
              </Box>
            </Box>
          )}

          {!edu.transcript && edu.courses && edu.courses.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Relevant Courses:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {edu.courses.map((course, courseIndex) => (
                  <Chip key={courseIndex} label={course} size="small" />
                ))}
              </Box>
            </Box>
          )}
        </Paper>
      ))}
      {sortedEducation.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No education details added yet
        </Typography>
      )}
    </>
  );
};
