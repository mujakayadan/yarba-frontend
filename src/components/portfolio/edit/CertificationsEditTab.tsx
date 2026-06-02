import Grid from '../../../mui/Grid';
import React from 'react';
import { Typography, Divider, Paper, Box, Button, TextField } from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import type { PortfolioEditForm } from '../../../hooks/usePortfolioEditForm';

interface CertificationsEditTabProps {
  form: PortfolioEditForm;
}

export const CertificationsEditTab: React.FC<CertificationsEditTabProps> = ({ form }) => {
  const { certifications, setCertifications } = form;

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Certifications
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {certifications.map((certification, certIndex) => (
        <Paper key={certIndex} variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {certification.name || 'Untitled Certification'}
            </Typography>

            <Button
              size="small"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => {
                setCertifications(certifications.filter((_, index) => index !== certIndex));
              }}
            >
              Remove
            </Button>
          </Box>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Certification Name"
                value={certification.name}
                onChange={(e) => {
                  const updatedCertifications = [...certifications];
                  updatedCertifications[certIndex].name = e.target.value;
                  setCertifications(updatedCertifications);
                }}
                variant="outlined"
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Issuer"
                value={certification.issuer}
                onChange={(e) => {
                  const updatedCertifications = [...certifications];
                  updatedCertifications[certIndex].issuer = e.target.value;
                  setCertifications(updatedCertifications);
                }}
                variant="outlined"
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                value={certification.date}
                onChange={(e) => {
                  const updatedCertifications = [...certifications];
                  updatedCertifications[certIndex].date = e.target.value;
                  setCertifications(updatedCertifications);
                }}
                variant="outlined"
                size="small"
                placeholder="e.g., Jan, 2023"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="URL"
                value={certification.url || ''}
                onChange={(e) => {
                  const updatedCertifications = [...certifications];
                  updatedCertifications[certIndex].url = e.target.value;
                  setCertifications(updatedCertifications);
                }}
                variant="outlined"
                size="small"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={certification.description || ''}
                onChange={(e) => {
                  const updatedCertifications = [...certifications];
                  updatedCertifications[certIndex].description = e.target.value;
                  setCertifications(updatedCertifications);
                }}
                variant="outlined"
                size="small"
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </Paper>
      ))}

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={() => {
          setCertifications([
            ...certifications,
            {
              name: '',
              issuer: '',
              date: '',
              url: '',
              description: '',
            },
          ]);
        }}
        sx={{ mt: 2 }}
      >
        Add Certification
      </Button>
    </>
  );
};
