import React from 'react';
import { Box, Typography, TextField, Divider, Stack } from '@mui/material';
import type { ProfileEditTabProps } from '../../../types/profileEdit';

export const PersonalInfoEditTab: React.FC<ProfileEditTabProps> = ({
  personalInfo,
  onPersonalInfoChange,
}) => (
  <>
    <Typography variant="subtitle1" gutterBottom>
      Basic Information
    </Typography>
    <Divider sx={{ mb: 3 }} />

    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
      <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 4px)' } }}>
        <TextField
          fullWidth
          label="Full Name"
          name="full_name"
          value={personalInfo.full_name}
          onChange={onPersonalInfoChange}
          margin="normal"
          required
        />
      </Box>
      <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 4px)' } }}>
        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={personalInfo.email}
          onChange={onPersonalInfoChange}
          margin="normal"
          required
        />
      </Box>
    </Stack>

    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
      <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 4px)' } }}>
        <TextField
          fullWidth
          label="Phone"
          name="phone"
          value={personalInfo.phone}
          onChange={onPersonalInfoChange}
          margin="normal"
        />
      </Box>
      <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 4px)' } }}>
        <TextField
          fullWidth
          label="Address"
          name="address"
          value={personalInfo.address}
          onChange={onPersonalInfoChange}
          margin="normal"
        />
      </Box>
    </Stack>

    <Typography variant="subtitle1" gutterBottom sx={{ mt: 4 }}>
      Professional Links
    </Typography>
    <Divider sx={{ mb: 3 }} />

    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
      <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 4px)' } }}>
        <TextField
          fullWidth
          label="LinkedIn"
          name="linkedin"
          value={personalInfo.linkedin}
          onChange={onPersonalInfoChange}
          margin="normal"
          placeholder="https://linkedin.com/in/username"
        />
      </Box>
      <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 4px)' } }}>
        <TextField
          fullWidth
          label="GitHub"
          name="github"
          value={personalInfo.github}
          onChange={onPersonalInfoChange}
          margin="normal"
          placeholder="https://github.com/username"
        />
      </Box>
    </Stack>

    <Stack direction="row" spacing={1} flexWrap="wrap">
      <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 4px)' } }}>
        <TextField
          fullWidth
          label="Personal Website"
          name="website"
          value={personalInfo.website}
          onChange={onPersonalInfoChange}
          margin="normal"
          placeholder="https://example.com"
        />
      </Box>
    </Stack>
  </>
);
