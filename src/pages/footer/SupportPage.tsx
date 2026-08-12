import React from 'react';
import EmailIcon from '@mui/icons-material/Email';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const SUPPORT_EMAIL = 'mujakayadan@outlook.com';

const SupportPage: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Support
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
          Find an answer or contact the developer for help.
        </Typography>
        <Divider />
      </Box>

      <Stack spacing={3}>
        <Card>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <QuestionAnswerIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
            <Typography variant="h5" component="h2" gutterBottom>
              Frequently asked questions
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Review answers about creating, editing, and downloading your application materials.
            </Typography>
            <Button component={RouterLink} to="/faq" variant="outlined">
              View FAQs
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <EmailIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
            <Typography variant="h5" component="h2" gutterBottom>
              Email support
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Describe the issue and include the email address associated with your account.
            </Typography>
            <Button
              component="a"
              href={`mailto:${SUPPORT_EMAIL}`}
              variant="contained"
              startIcon={<EmailIcon />}
            >
              Email Support
            </Button>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
};

export default SupportPage;
