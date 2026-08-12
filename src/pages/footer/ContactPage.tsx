import React from 'react';
import EmailIcon from '@mui/icons-material/Email';
import { Box, Button, Container, Divider, Paper, Typography } from '@mui/material';

const CONTACT_EMAIL = 'mujakayadan@outlook.com';

const ContactPage: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Contact YARBA
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
          Send questions, feedback, or support requests directly to the developer.
        </Typography>
        <Divider />
      </Box>

      <Paper elevation={1} sx={{ p: { xs: 3, md: 5 }, textAlign: 'center' }}>
        <EmailIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h5" component="h2" gutterBottom>
          Email us
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Include the email address associated with your account when you need product support.
        </Typography>
        <Button
          component="a"
          href={`mailto:${CONTACT_EMAIL}`}
          variant="contained"
          startIcon={<EmailIcon />}
        >
          {CONTACT_EMAIL}
        </Button>
      </Paper>
    </Container>
  );
};

export default ContactPage;
