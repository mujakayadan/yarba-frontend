import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Divider,
  Stack,
  Switch,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import type { ProfileEditTabProps } from '../../../types/profileEdit';

export const PreferencesEditTab: React.FC<ProfileEditTabProps> = ({
  preferences,
  onPreferenceChange,
  onNumberInputChange,
  onSwitchChange,
}) => (
  <>
    <Typography variant="subtitle1" gutterBottom>
      Career Summary
    </Typography>
    <Divider sx={{ mb: 3 }} />

    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3 }}>
      <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 4px)' } }}>
        <TextField
          fullWidth
          type="number"
          label="Minimum Words"
          name="career_summary_min_words"
          value={preferences.career_summary_min_words}
          onChange={onNumberInputChange}
          margin="normal"
          inputProps={{
            min: 0,
            max: 100,
          }}
        />
      </Box>
      <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 4px)' } }}>
        <TextField
          fullWidth
          type="number"
          label="Maximum Words"
          name="career_summary_max_words"
          value={preferences.career_summary_max_words}
          onChange={onNumberInputChange}
          margin="normal"
          inputProps={{
            min: 0,
            max: 500,
          }}
        />
      </Box>
    </Stack>

    <Typography variant="subtitle1" gutterBottom sx={{ mt: 4 }}>
      Work Experience
    </Typography>
    <Divider sx={{ mb: 3 }} />

    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3 }}>
      <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 4px)' } }}>
        <TextField
          fullWidth
          type="number"
          label="Maximum Jobs"
          name="work_experience_max_jobs"
          value={preferences.work_experience_max_jobs}
          onChange={onNumberInputChange}
          margin="normal"
          inputProps={{
            min: 0,
            max: 10,
          }}
        />
      </Box>
      <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 4px)' } }}>
        <TextField
          fullWidth
          type="number"
          label="Bullet Points Per Job"
          name="work_experience_bullet_points_per_job"
          value={preferences.work_experience_bullet_points_per_job}
          onChange={onNumberInputChange}
          margin="normal"
          inputProps={{
            min: 0,
            max: 10,
          }}
        />
      </Box>
    </Stack>

    <Typography variant="subtitle1" gutterBottom sx={{ mt: 4 }}>
      Projects
    </Typography>
    <Divider sx={{ mb: 3 }} />

    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3 }}>
      <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 4px)' } }}>
        <TextField
          fullWidth
          type="number"
          label="Maximum Projects"
          name="project_max_projects"
          value={preferences.project_max_projects}
          onChange={onNumberInputChange}
          margin="normal"
          inputProps={{
            min: 0,
            max: 10,
          }}
        />
      </Box>
      <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 4px)' } }}>
        <TextField
          fullWidth
          type="number"
          label="Bullet Points Per Project"
          name="project_bullet_points_per_project"
          value={preferences.project_bullet_points_per_project}
          onChange={onNumberInputChange}
          margin="normal"
          inputProps={{
            min: 0,
            max: 10,
          }}
        />
      </Box>
    </Stack>

    <Typography variant="subtitle1" gutterBottom sx={{ mt: 4 }}>
      Skills
    </Typography>
    <Divider sx={{ mb: 3 }} />

    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
      <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 4px)' } }}>
        <TextField
          fullWidth
          type="number"
          label="Maximum Categories"
          name="skills_max_categories"
          value={preferences.skills_max_categories}
          onChange={onNumberInputChange}
          margin="normal"
          inputProps={{
            min: 0,
            max: 10,
          }}
        />
      </Box>
      <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 4px)' } }}>
        <TextField
          fullWidth
          type="number"
          label="Minimum Skills Per Category"
          name="skills_min_per_category"
          value={preferences.skills_min_per_category}
          onChange={onNumberInputChange}
          margin="normal"
          inputProps={{
            min: 0,
            max: 10,
          }}
        />
      </Box>
    </Stack>

    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3 }}>
      <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 4px)' } }}>
        <TextField
          fullWidth
          type="number"
          label="Maximum Skills Per Category"
          name="skills_max_per_category"
          value={preferences.skills_max_per_category}
          onChange={onNumberInputChange}
          margin="normal"
          inputProps={{
            min: 0,
            max: 20,
          }}
        />
      </Box>
    </Stack>

    <Typography variant="subtitle1" gutterBottom sx={{ mt: 4 }}>
      Education
    </Typography>
    <Divider sx={{ mb: 3 }} />

    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3 }}>
      <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 4px)' } }}>
        <TextField
          fullWidth
          type="number"
          label="Maximum Entries"
          name="education_max_entries"
          value={preferences.education_max_entries}
          onChange={onNumberInputChange}
          margin="normal"
          inputProps={{
            min: 0,
            max: 5,
          }}
        />
      </Box>
      <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 4px)' } }}>
        <TextField
          fullWidth
          type="number"
          label="Maximum Courses"
          name="education_max_courses"
          value={preferences.education_max_courses}
          onChange={onNumberInputChange}
          margin="normal"
          inputProps={{
            min: 0,
            max: 10,
          }}
        />
      </Box>
    </Stack>

    <Typography variant="subtitle1" gutterBottom sx={{ mt: 4 }}>
      Cover Letter
    </Typography>
    <Divider sx={{ mb: 3 }} />

    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3 }}>
      <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 4px)' } }}>
        <TextField
          fullWidth
          type="number"
          label="Number of Paragraphs"
          name="cover_letter_paragraphs"
          value={preferences.cover_letter_paragraphs}
          onChange={onNumberInputChange}
          margin="normal"
          inputProps={{
            min: 0,
            max: 10,
          }}
        />
      </Box>
      <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 4px)' } }}>
        <TextField
          fullWidth
          type="number"
          label="Target Age"
          name="cover_letter_target_age"
          value={preferences.cover_letter_target_age}
          onChange={onNumberInputChange}
          margin="normal"
          inputProps={{
            min: 0,
            max: 100,
          }}
        />
      </Box>
    </Stack>

    <Typography variant="subtitle1" gutterBottom sx={{ mt: 4 }}>
      Other Sections
    </Typography>
    <Divider sx={{ mb: 3 }} />

    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3 }}>
      <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 4px)' } }}>
        <TextField
          fullWidth
          type="number"
          label="Maximum Awards"
          name="awards_max_awards"
          value={preferences.awards_max_awards}
          onChange={onNumberInputChange}
          margin="normal"
          inputProps={{
            min: 0,
            max: 10,
          }}
        />
      </Box>
      <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 4px)' } }}>
        <TextField
          fullWidth
          type="number"
          label="Maximum Publications"
          name="publications_max_publications"
          value={preferences.publications_max_publications}
          onChange={onNumberInputChange}
          margin="normal"
          inputProps={{
            min: 0,
            max: 10,
          }}
        />
      </Box>
    </Stack>

    <Typography variant="subtitle1" gutterBottom sx={{ mt: 4 }}>
      Feature Preferences
    </Typography>
    <Divider sx={{ mb: 3 }} />

    <FormGroup>
      <FormControlLabel
        control={
          <Switch
            checked={preferences.feature_check_clearance}
            onChange={onSwitchChange}
            name="feature_check_clearance"
          />
        }
        label="Check Clearance"
      />
      <FormControlLabel
        control={
          <Switch
            checked={preferences.feature_auto_save}
            onChange={onSwitchChange}
            name="feature_auto_save"
          />
        }
        label="Auto Save"
      />
      <FormControlLabel
        control={
          <Switch
            checked={preferences.feature_dark_mode}
            onChange={onSwitchChange}
            name="feature_dark_mode"
          />
        }
        label="Dark Mode"
      />
    </FormGroup>

    <Typography variant="subtitle1" gutterBottom sx={{ mt: 4 }}>
      Default Templates
    </Typography>
    <Divider sx={{ mb: 3 }} />

    <Stack spacing={1} sx={{ mb: 3 }}>
      <FormControl fullWidth>
        <InputLabel>Default Resume Template</InputLabel>
        <Select
          name="default_resume_template_id"
          value={preferences.default_resume_template_id}
          label="Default Resume Template"
          onChange={onPreferenceChange}
        >
          <MenuItem value="classic">Classic</MenuItem>
          <MenuItem value="modern">Modern</MenuItem>
          <MenuItem value="professional">Professional</MenuItem>
          <MenuItem value="elegant">Elegant</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel>Default Cover Letter Template</InputLabel>
        <Select
          name="default_cover_letter_template_id"
          value={preferences.default_cover_letter_template_id}
          label="Default Cover Letter Template"
          onChange={onPreferenceChange}
        >
          <MenuItem value="standard">Standard</MenuItem>
          <MenuItem value="formal">Formal</MenuItem>
          <MenuItem value="creative">Creative</MenuItem>
          <MenuItem value="modern">Modern</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  </>
);
