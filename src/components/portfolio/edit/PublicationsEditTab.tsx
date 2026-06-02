import Grid from '../../../mui/Grid';
import React from 'react';
import { Typography, Divider, Paper, Box, Button, TextField } from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import type { PortfolioEditForm } from '../../../hooks/usePortfolioEditForm';

interface PublicationsEditTabProps {
  form: PortfolioEditForm;
}

export const PublicationsEditTab: React.FC<PublicationsEditTabProps> = ({ form }) => {
  const { publications, setPublications } = form;

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Publications
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {publications.map((publication, pubIndex) => (
        <Paper key={pubIndex} variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {publication.name || 'Untitled Publication'}
            </Typography>

            <Button
              size="small"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => {
                setPublications(publications.filter((_, index) => index !== pubIndex));
              }}
            >
              Remove
            </Button>
          </Box>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Publication Title"
                value={publication.name}
                onChange={(e) => {
                  const updatedPublications = [...publications];
                  updatedPublications[pubIndex].name = e.target.value;
                  setPublications(updatedPublications);
                }}
                variant="outlined"
                size="small"
                placeholder="e.g., Research Paper Title"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Publisher"
                value={publication.publisher}
                onChange={(e) => {
                  const updatedPublications = [...publications];
                  updatedPublications[pubIndex].publisher = e.target.value;
                  setPublications(updatedPublications);
                }}
                variant="outlined"
                size="small"
                placeholder="e.g., Academic Journal"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date/Time"
                value={publication.time}
                onChange={(e) => {
                  const updatedPublications = [...publications];
                  updatedPublications[pubIndex].time = e.target.value;
                  setPublications(updatedPublications);
                }}
                variant="outlined"
                size="small"
                placeholder="e.g., Jan, 2023"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Link/URL"
                value={publication.link}
                onChange={(e) => {
                  const updatedPublications = [...publications];
                  updatedPublications[pubIndex].link = e.target.value;
                  setPublications(updatedPublications);
                }}
                variant="outlined"
                size="small"
                placeholder="e.g., https://example.com/paper"
              />
            </Grid>
          </Grid>
        </Paper>
      ))}

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={() => {
          setPublications([
            ...publications,
            {
              name: '',
              publisher: '',
              link: '',
              time: '',
            },
          ]);
        }}
        sx={{ mt: 2 }}
      >
        Add Publication
      </Button>
    </>
  );
};
