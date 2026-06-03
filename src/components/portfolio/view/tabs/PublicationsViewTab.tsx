import Grid from '../../../../mui/Grid';
import React from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';
import type { PortfolioViewTabProps } from '../../../../types/portfolioView';

export const PublicationsViewTab: React.FC<PortfolioViewTabProps> = ({ sorted }) => {
  const { sortedPublications } = sorted;

  return (
    <>
      {sortedPublications.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {sortedPublications.map((pub, index) => (
            <Paper key={index} elevation={1} sx={{ p: 3, mb: 1 }}>
              <Grid container spacing={2}>
                {/* Publication Title/Name */}
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Title
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {pub.name || pub.title || 'Untitled Publication'}
                    </Typography>
                  </Box>
                  <Divider />
                </Grid>

                {/* Publisher */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ my: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Publisher
                    </Typography>
                    <Typography variant="body1">{pub.publisher || 'Not specified'}</Typography>
                  </Box>
                </Grid>

                {/* Date/Time */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ my: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Published Date
                    </Typography>
                    <Typography variant="body1">
                      {pub.time || pub.date || 'Not specified'}
                    </Typography>
                  </Box>
                </Grid>

                {/* Authors if available */}
                {pub.authors && pub.authors.length > 0 && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Authors
                      </Typography>
                      <Typography variant="body1">{pub.authors.join(', ')}</Typography>
                    </Box>
                  </Grid>
                )}

                {/* Description if available */}
                {pub.description && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Description
                      </Typography>
                      <Typography variant="body1">{pub.description}</Typography>
                    </Box>
                  </Grid>
                )}

                {/* Link/URL if available */}
                {(pub.link || pub.url) &&
                  (() => {
                    const url = pub.link || pub.url;
                    if (!url) return null;

                    return (
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Link
                          </Typography>
                          <Typography
                            variant="body2"
                            component="a"
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              wordBreak: 'break-all',
                              color: 'primary.main',
                              textDecoration: 'underline',
                            }}
                          >
                            {url}
                          </Typography>
                        </Box>
                      </Grid>
                    );
                  })()}
              </Grid>
            </Paper>
          ))}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No publications added yet
        </Typography>
      )}
    </>
  );
};
