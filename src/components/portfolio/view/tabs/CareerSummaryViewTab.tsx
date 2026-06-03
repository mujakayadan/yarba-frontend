import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import type { PortfolioViewTabProps } from '../../../../types/portfolioView';

export const CareerSummaryViewTab: React.FC<PortfolioViewTabProps> = ({ portfolio }) => (
  <>
    {/* Job Title chip and experience in a single sentence, with other job titles above and below */}
    {portfolio.career_summary &&
    portfolio.career_summary.years_of_experience &&
    (portfolio.career_summary.default_job_title ||
      portfolio.career_summary.job_titles?.length > 0) &&
    portfolio.career_summary.default_summary ? (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 2,
          pl: 4,
          position: 'relative',
        }}
      >
        {/* Calculate dynamic chip width based on longest job title */}
        {(() => {
          // Collect all job titles including the default one
          const allTitles = [...(portfolio.career_summary.job_titles || [])];
          if (
            portfolio.career_summary.default_job_title &&
            !allTitles.includes(portfolio.career_summary.default_job_title)
          ) {
            allTitles.push(portfolio.career_summary.default_job_title);
          }

          // Calculate approximate width (7px per character + 16px padding)
          const chipWidth =
            allTitles.length > 0
              ? Math.max(...allTitles.map((title) => title.length)) * 7 + 16
              : 100; // fallback width

          // Get default title and other titles
          const defaultTitle =
            portfolio.career_summary.default_job_title ||
            (portfolio.career_summary.job_titles && portfolio.career_summary.job_titles.length > 0
              ? portfolio.career_summary.job_titles[0]
              : '');

          const otherTitles = (portfolio.career_summary.job_titles || []).filter(
            (title) => title !== defaultTitle
          );

          // Split other titles into two groups
          const firstHalf = otherTitles.slice(0, Math.ceil(otherTitles.length / 2));
          const secondHalf = otherTitles.slice(Math.ceil(otherTitles.length / 2));

          return (
            <>
              {/* First half of other job titles */}
              {firstHalf.length > 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {firstHalf.map((title, index) => (
                    <Chip
                      key={index}
                      label={title}
                      color="primary"
                      size="small"
                      sx={{ width: chipWidth }}
                    />
                  ))}
                </Box>
              )}

              {/* The default job title chip with "A" to the left */}
              <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                <Typography
                  variant="body1"
                  sx={{
                    position: 'absolute',
                    right: '100%',
                    mr: 1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  A
                </Typography>
                <Chip
                  label={defaultTitle}
                  size="small"
                  sx={{
                    bgcolor: portfolio.career_summary?.default_job_title
                      ? '#E05B49'
                      : 'primary.main',
                    color: 'white',
                    width: chipWidth,
                  }}
                />
                <Typography variant="body1" sx={{ ml: 1 }}>
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
                    {portfolio.career_summary?.years_of_experience}
                  </Box>{' '}
                  years of experience {portfolio.career_summary?.default_summary}
                </Typography>
              </Box>

              {/* Second half of other job titles */}
              {secondHalf.length > 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {secondHalf.map((title, index) => (
                    <Chip
                      key={index}
                      label={title}
                      color="primary"
                      size="small"
                      sx={{ width: chipWidth }}
                    />
                  ))}
                </Box>
              )}
            </>
          );
        })()}
      </Box>
    ) : (
      <Typography variant="body2" color="text.secondary">
        {portfolio.career_summary?.default_summary || 'No professional summary provided yet.'}
      </Typography>
    )}
  </>
);
