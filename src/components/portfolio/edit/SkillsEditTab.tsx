import Grid from '../../../mui/Grid';
import React from 'react';
import {
  Typography,
  Divider,
  Paper,
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import type { PortfolioEditForm } from '../../../hooks/usePortfolioEditForm';

interface SkillsEditTabProps {
  form: PortfolioEditForm;
}

export const SkillsEditTab: React.FC<SkillsEditTabProps> = ({ form }) => {
  const {
    skills,
    handleDeleteCategory,
    handleDeleteSkill,
    setSelectedCategoryIndex,
    setSkillDialogOpen,
    skillDialogOpen,
    selectedCategoryIndex,
    newSkill,
    setNewSkill,
    handleAddSkill,
    categoryDialogOpen,
    setCategoryDialogOpen,
    newCategory,
    setNewCategory,
    handleAddCategory,
  } = form;

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Skills
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {skills.map((category, categoryIndex) => (
          <Grid item xs={12} key={categoryIndex}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="subtitle1">{category.category}</Typography>

                <Button
                  size="small"
                  color="error"
                  onClick={() => handleDeleteCategory(categoryIndex)}
                  disabled={skills.length <= 1}
                >
                  Remove Category
                </Button>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {category.skills.map((skill, skillIndex) => (
                  <Chip
                    key={skillIndex}
                    label={skill}
                    onDelete={() => handleDeleteSkill(categoryIndex, skillIndex)}
                    sx={{ m: 0.5 }}
                  />
                ))}
                <Chip
                  icon={<AddIcon />}
                  label="Add Skill"
                  onClick={() => {
                    setSelectedCategoryIndex(categoryIndex);
                    setSkillDialogOpen(true);
                  }}
                  color="default"
                  variant="outlined"
                  sx={{ borderStyle: 'dashed', m: 0.5 }}
                />
                {category.skills.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    No skills added yet
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog open={skillDialogOpen} onClose={() => setSkillDialogOpen(false)}>
        <DialogTitle>
          Add New Skill to {skills[selectedCategoryIndex]?.category || 'Category'}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
            <InputLabel id="skill-category-label">Category</InputLabel>
            <Select
              labelId="skill-category-label"
              value={selectedCategoryIndex}
              onChange={(e) => setSelectedCategoryIndex(Number(e.target.value))}
              label="Category"
            >
              {skills.map((category, index) => (
                <MenuItem key={index} value={index}>
                  {category.category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            autoFocus
            margin="dense"
            id="skillName"
            label="Skill"
            type="text"
            fullWidth
            variant="outlined"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && newSkill.trim()) {
                handleAddSkill();
                setSkillDialogOpen(false);
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSkillDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              handleAddSkill();
              setSkillDialogOpen(false);
            }}
            disabled={!newSkill.trim()}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={categoryDialogOpen} onClose={() => setCategoryDialogOpen(false)}>
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="categoryName"
            label="Category Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && newCategory.trim()) {
                handleAddCategory();
                setCategoryDialogOpen(false);
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              handleAddCategory();
              setCategoryDialogOpen(false);
            }}
            disabled={!newCategory.trim()}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Chip
          icon={<AddIcon />}
          label="Add New Category"
          onClick={() => setCategoryDialogOpen(true)}
          color="primary"
          variant="outlined"
          sx={{ borderStyle: 'dashed', cursor: 'pointer' }}
        />
      </Box>
    </>
  );
};
