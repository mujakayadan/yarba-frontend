import Grid from '../../mui/Grid';
import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Paper,
  Link,
  Chip,
  Stack,
} from '@mui/material';
import {
  Language as WebIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';

const AboutPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Hero Section */}
      <Box sx={{ mb: 8, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          About YARBA
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
          Your AI-powered resume and career advancement platform
        </Typography>
        <Divider sx={{ mb: 4 }} />
      </Box>

      {/* Company Overview */}
      <Paper elevation={1} sx={{ p: 4, mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Our Story
        </Typography>
        <Typography variant="body1" paragraph>
          YARBA was founded with a simple mission: to revolutionize how job seekers create resumes
          and cover letters using AI technology. We saw that the traditional resume creation process
          was time-consuming and often ineffective, with many qualified candidates being overlooked.
        </Typography>
        <Typography variant="body1" paragraph>
          Our platform combines cutting-edge AI with human expertise to help you create
          professional, tailored resumes and cover letters that get results.
        </Typography>
      </Paper>

      {/* Mission & Values */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Our Mission & Values
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  Innovation
                </Typography>
                <Typography variant="body2">
                  We're constantly pushing the boundaries of what's possible with AI in career
                  advancement.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  Accessibility
                </Typography>
                <Typography variant="body2">
                  We believe everyone deserves access to tools that help them showcase their best
                  professional self.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  Impact
                </Typography>
                <Typography variant="body2">
                  We measure our success by the careers we help launch and advance.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Team Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Meet the Developer
        </Typography>
        <Typography variant="body1" paragraph>
          Behind YARBA is a dedicated Software Engineer with extensive experience in machine
          learning and AI solutions.
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={6} lg={5}>
            <Card
              sx={{
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                height: '100%',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 20px rgba(0,0,0,0.15)',
                },
              }}
            >
              <CardMedia
                component="img"
                height="400"
                image="/muja-image.png"
                alt="Muja Kayadan"
                sx={{ objectFit: 'cover' }}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  (e.target as HTMLImageElement).src =
                    'https://via.placeholder.com/400x400?text=Muja+Kayadan';
                }}
              />
              <CardContent>
                <Typography variant="h4" component="h3" gutterBottom>
                  Muja Kayadan
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Founder & ML Engineer
                </Typography>

                <Stack direction="row" spacing={1} sx={{ my: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Chip label="Machine Learning" color="primary" size="small" />
                  <Chip label="LLMs" color="primary" size="small" />
                  <Chip label="RAG" color="primary" size="small" />
                  <Chip label="Computer Vision" color="primary" size="small" />
                  <Chip label="AI" color="primary" size="small" />
                  <Chip label="Software Engineering" color="primary" size="small" />
                </Stack>

                <Stack spacing={2} sx={{ mt: 3 }}>
                  <Link
                    href="https://www.mujakayadan.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: 'primary.main',
                      '&:hover': {
                        textDecoration: 'none',
                        color: 'secondary.main',
                      },
                    }}
                  >
                    <WebIcon sx={{ mr: 1 }} fontSize="small" />
                    mujakayadan.com
                  </Link>

                  <Link
                    href="https://www.linkedin.com/in/muja-kayadan/"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: 'primary.main',
                      '&:hover': {
                        textDecoration: 'none',
                        color: 'secondary.main',
                      },
                    }}
                  >
                    <LinkedInIcon sx={{ mr: 1 }} fontSize="small" />
                    linkedin.com/in/muja-kayadan
                  </Link>

                  <Link
                    href="https://github.com/mucahitkayadan"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: 'primary.main',
                      '&:hover': {
                        textDecoration: 'none',
                        color: 'secondary.main',
                      },
                    }}
                  >
                    <GitHubIcon sx={{ mr: 1 }} fontSize="small" />
                    github.com/mucahitkayadan
                  </Link>

                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                    <EmailIcon sx={{ mr: 1 }} fontSize="small" />
                    mujakayadan@outlook.com
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                    <PhoneIcon sx={{ mr: 1 }} fontSize="small" />
                    641-233-9607
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                    <LocationIcon sx={{ mr: 1 }} fontSize="small" />
                    San Francisco, CA
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Contact Section */}
      <Box>
        <Typography variant="h4" component="h2" gutterBottom>
          Get in Touch
        </Typography>
        <Typography variant="body1">
          Have questions or want to learn more about YARBA? Contact us at{' '}
          <strong>mujakayadan@outlook.com</strong>
        </Typography>
      </Box>
    </Container>
  );
};

export default AboutPage;
