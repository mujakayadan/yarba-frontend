import React from 'react';
import { Box, Step, StepLabel, Stepper, Typography } from '@mui/material';

const SETUP_STEPS = ['Your essentials', 'Build your portfolio'];

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
    <Typography component="h1" variant="h4" gutterBottom>
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
