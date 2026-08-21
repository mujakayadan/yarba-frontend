import Grid from '../../../mui/Grid';
import React from 'react';
import { Typography, Divider, Paper, Box, Button, TextField } from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import type { PortfolioEditForm } from '../../../hooks/usePortfolioEditForm';

interface AwardsEditTabProps {
  form: PortfolioEditForm;
}

export const AwardsEditTab: React.FC<AwardsEditTabProps> = ({ form }) => {
  const { awards, setAwards } = form;

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Awards
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {awards.map((award, awardIndex) => (
        <Paper key={awardIndex} variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 'bold',
              }}
            >
              {award.name || 'Untitled Award'}
            </Typography>

            <Button
              size="small"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => {
                setAwards(awards.filter((_, index) => index !== awardIndex));
              }}
            >
              Remove
            </Button>
          </Box>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Award Name"
                value={award.name}
                onChange={(e) => {
                  const updatedAwards = [...awards];
                  updatedAwards[awardIndex].name = e.target.value;
                  setAwards(updatedAwards);
                }}
                variant="outlined"
                size="small"
                placeholder="e.g., Best Project Award"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Explanation"
                value={award.explanation}
                onChange={(e) => {
                  const updatedAwards = [...awards];
                  updatedAwards[awardIndex].explanation = e.target.value;
                  setAwards(updatedAwards);
                }}
                variant="outlined"
                size="small"
                placeholder="e.g., Awarded for innovative approach to AI research"
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </Paper>
      ))}

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={() => {
          setAwards([
            ...awards,
            {
              name: '',
              explanation: '',
            },
          ]);
        }}
        sx={{ mt: 2 }}
      >
        Add Award
      </Button>
    </>
  );
};
