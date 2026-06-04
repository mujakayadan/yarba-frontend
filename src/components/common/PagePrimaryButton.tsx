import React from 'react';
import { Button, type ButtonProps } from '@mui/material';

/** Keeps view/edit primary actions (e.g. Edit Profile, Save Changes) the same width. */
export const PAGE_PRIMARY_ACTION_MIN_WIDTH = 168;

export const PagePrimaryButton: React.FC<ButtonProps> = ({ sx, ...props }) => (
  <Button
    variant="contained"
    color="primary"
    sx={{ minWidth: PAGE_PRIMARY_ACTION_MIN_WIDTH, ...sx }}
    {...props}
  />
);
