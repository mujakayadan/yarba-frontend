import Grid from '../../../../mui/Grid';
import React from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';
import type { PortfolioViewTabProps } from '../../../../types/portfolioView';

export const AwardsViewTab: React.FC<PortfolioViewTabProps> = ({ sorted }) => {
  const { sortedAwards } = sorted;

  return (
    <>
      {sortedAwards.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {sortedAwards.map((award, index) => (
            <Paper key={index} elevation={1} sx={{ p: 3, mb: 1 }}>
              <Grid container spacing={2}>
                {/* Award Name/Title */}
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Award Name
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {award.name || award.title || 'Untitled Award'}
                    </Typography>
                  </Box>
                  <Divider />
                </Grid>

                {/* Explanation (if available) */}
                {award.explanation && (
                  <Grid item xs={12}>
                    <Box sx={{ my: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Details
                      </Typography>
                      <Typography variant="body1">{award.explanation}</Typography>
                    </Box>
                    <Divider />
                  </Grid>
                )}

                {/* Legacy fields if explanation is not available */}
                {!award.explanation && (
                  <>
                    {award.issuer && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ my: 1 }}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Issuer
                          </Typography>
                          <Typography variant="body1">{award.issuer}</Typography>
                        </Box>
                      </Grid>
                    )}

                    {award.date && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ my: 1 }}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Date
                          </Typography>
                          <Typography variant="body1">{award.date}</Typography>
                        </Box>
                      </Grid>
                    )}

                    {award.description && (
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Description
                          </Typography>
                          <Typography variant="body1">{award.description}</Typography>
                        </Box>
                      </Grid>
                    )}
                  </>
                )}
              </Grid>
            </Paper>
          ))}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No awards added yet
        </Typography>
      )}
    </>
  );
};
