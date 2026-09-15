import React from 'react';
import { Box, Step, StepLabel, Stepper, Typography } from '@mui/material';

const SETUP_STEPS = ['Your essentials', 'Build your portfolio'];

export const setupPageContainerSx = {
  mt: { xs: 2, sm: 8 },
  mb: { xs: 3, sm: 8 },
  px: { xs: 2.5, sm: 3 },
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
} as const;

export const setupActionBarSx = {
  display: 'flex',
  flexDirection: { xs: 'column', sm: 'row' },
  justifyContent: 'space-between',
  alignItems: { xs: 'stretch', sm: 'center' },
  gap: 1.5,
  mt: 3,
  '& .MuiButton-root': { width: { xs: '100%', sm: 'auto' } },
} as const;

interface SetupStepHeaderProps {
  activeStep: 0 | 1;
  title: string;
  description: string;
}

export const SetupStepHeader: React.FC<SetupStepHeaderProps> = ({
  activeStep,
  title,
  description,
}) => (
  <Box sx={{ mb: 4 }}>
    <Typography
      variant="overline"
      sx={{
        color: 'text.secondary',
      }}
    >
      Step {activeStep + 1} of {SETUP_STEPS.length}
    </Typography>
    <Typography
      component="h1"
      variant="h4"
      gutterBottom
      sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}
    >
      {title}
    </Typography>
    <Typography
      sx={{
        color: 'text.secondary',
        mb: 3,
        maxWidth: 680,
      }}
    >
      {description}
    </Typography>
    <Stepper activeStep={activeStep} alternativeLabel>
      {SETUP_STEPS.map((label) => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  </Box>
);
