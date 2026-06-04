import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Stack,
  Switch,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  FormHelperText,
} from '@mui/material';
import type { ProfileEditTabProps } from '../../../types/profileEdit';
import { APPEARANCE_MODE_LABELS, type AppearanceMode } from '../../../theme/appearance';
import { EditSectionHeader } from './EditSectionHeader';

const FeatureToggle: React.FC<{
  name: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: ProfileEditTabProps['onSwitchChange'];
}> = ({ name, label, description, checked, onChange }) => (
  <Box sx={{ mb: 1.5 }}>
    <FormControlLabel
      control={<Switch checked={checked} onChange={onChange} name={name} />}
      label={label}
    />
    <FormHelperText sx={{ ml: 4.5, mt: -0.5 }}>{description}</FormHelperText>
  </Box>
);

export const PreferencesEditTab: React.FC<ProfileEditTabProps> = ({
  preferences,
  onPreferenceChange,
  onNumberInputChange,
  onSwitchChange,
}) => (
  <>
    <Typography variant="body2" color="text.secondary" paragraph>
      These settings control how AI generates and tailors your resumes and cover letters from your
      portfolio. Adjust the limits below to match the roles you apply for.
    </Typography>

    <EditSectionHeader
      first
      title="Career Summary"
      description="Controls the length of the professional summary at the top of tailored resumes."
    />

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
          helperText="Shortest summary the AI should write"
          inputProps={{ min: 0, max: 100 }}
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
          helperText="Longest summary the AI should write"
          inputProps={{ min: 0, max: 500 }}
        />
      </Box>
    </Stack>

    <EditSectionHeader
      title="Work Experience"
      description="Limits how many jobs and bullet points the AI includes when tailoring work history for a specific role."
    />

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
          helperText="Most recent roles to include on a tailored resume"
          inputProps={{ min: 0, max: 10 }}
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
          helperText="Achievements listed under each job entry"
          inputProps={{ min: 0, max: 10 }}
        />
      </Box>
    </Stack>

    <EditSectionHeader
      title="Projects"
      description="Sets how many projects and details appear when generating resume content."
    />

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
          helperText="Number of projects to highlight on a tailored resume"
          inputProps={{ min: 0, max: 10 }}
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
          helperText="Details listed under each project"
          inputProps={{ min: 0, max: 10 }}
        />
      </Box>
    </Stack>

    <EditSectionHeader
      title="Skills"
      description="Guides how the AI organizes your skills into categories and trims the list to fit the page."
    />

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
          helperText="Skill groups such as Languages or Frameworks"
          inputProps={{ min: 0, max: 10 }}
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
          helperText="Floor for skills kept in each category"
          inputProps={{ min: 0, max: 10 }}
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
          helperText="Ceiling for skills listed in each category"
          inputProps={{ min: 0, max: 20 }}
        />
      </Box>
    </Stack>

    <EditSectionHeader
      title="Education"
      description="Caps education entries and relevant coursework included in generated documents."
    />

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
          helperText="Degrees or programs to include"
          inputProps={{ min: 0, max: 5 }}
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
          helperText="Relevant courses listed per education entry"
          inputProps={{ min: 0, max: 10 }}
        />
      </Box>
    </Stack>

    <EditSectionHeader
      title="Cover Letter"
      description="Shapes the structure and reading level of AI-written cover letters."
    />

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
          helperText="Body paragraphs in the generated letter"
          inputProps={{ min: 0, max: 10 }}
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
          helperText="Reading level for the letter (e.g. 18 = simpler, 25 = professional)"
          inputProps={{ min: 0, max: 100 }}
        />
      </Box>
    </Stack>

    <EditSectionHeader
      title="Other Sections"
      description="Limits for awards and publications when those sections are included in a resume."
    />

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
          helperText="Awards to include on a tailored resume"
          inputProps={{ min: 0, max: 10 }}
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
          helperText="Publications to include on a tailored resume"
          inputProps={{ min: 0, max: 10 }}
        />
      </Box>
    </Stack>

    <EditSectionHeader
      title="Feature Preferences"
      description="Toggles for app behavior. Some options affect resume and cover letter generation."
    />

    <FormGroup>
      <FeatureToggle
        name="feature_check_clearance"
        label="Check Clearance"
        description="Scan job descriptions for security clearance requirements before generating a resume."
        checked={preferences.feature_check_clearance}
        onChange={onSwitchChange}
      />
      <FeatureToggle
        name="feature_auto_save"
        label="Auto Save"
        description="Automatically save your work as you edit resumes and cover letters."
        checked={preferences.feature_auto_save}
        onChange={onSwitchChange}
      />
    </FormGroup>

    <FormControl fullWidth sx={{ mb: 3 }}>
      <InputLabel id="theme-mode-label">Appearance</InputLabel>
      <Select
        labelId="theme-mode-label"
        name="theme_mode"
        value={preferences.theme_mode}
        label="Appearance"
        onChange={onPreferenceChange}
      >
        {(Object.keys(APPEARANCE_MODE_LABELS) as AppearanceMode[]).map((mode) => (
          <MenuItem key={mode} value={mode}>
            {APPEARANCE_MODE_LABELS[mode]}
          </MenuItem>
        ))}
      </Select>
      <FormHelperText>
        Default uses the classic gradient sidebar. Light uses a minimal sidebar. Dark uses a dark
        palette.
      </FormHelperText>
    </FormControl>

    <EditSectionHeader
      title="Default Templates"
      description="Pre-selected LaTeX templates when creating new resumes or cover letters."
    />

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
        <FormHelperText>Layout and styling for newly created resumes</FormHelperText>
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
        <FormHelperText>Layout and styling for newly created cover letters</FormHelperText>
      </FormControl>
    </Stack>
  </>
);
