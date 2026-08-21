import Grid from '../../../../mui/Grid';
import React from 'react';
import { Typography, Paper, Button } from '@mui/material';
import type { PortfolioViewTabProps } from '../../../../types/portfolioView';

export const CertificationsViewTab: React.FC<PortfolioViewTabProps> = ({ sorted }) => {
  const { sortedCertifications } = sorted;

  return (
    <Grid container spacing={3}>
      {sortedCertifications.map((cert, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom>
              {cert.name}
            </Typography>
            <Typography variant="body2">Issuer: {cert.issuer}</Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
              }}
            >
              Date: {cert.date}
            </Typography>
            {cert.description && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {cert.description}
              </Typography>
            )}
            {cert.url && (
              <Button
                variant="text"
                size="small"
                sx={{ mt: 1 }}
                href={cert.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Certificate
              </Button>
            )}
          </Paper>
        </Grid>
      ))}
      {sortedCertifications.length === 0 && (
        <Grid item xs={12}>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
            }}
          >
            No certifications added yet
          </Typography>
        </Grid>
      )}
    </Grid>
  );
};
