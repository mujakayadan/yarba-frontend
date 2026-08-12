import Grid from '../mui/Grid';
import React, { Suspense, lazy } from 'react';
import { Container, Typography, Box, Button, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/system';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import BuildIcon from '@mui/icons-material/Build';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import MainLayout from '../components/layout/MainLayout';

const AnimatedBackground = lazy(() =>
  import('animated-backgrounds').then((module) => ({
    default: module.AnimatedBackground as React.ComponentType<{ animationName: string }>,
  }))
);

const FeaturePaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(5px)',
}));

const MainPage: React.FC = () => {
  const features = [
    {
      icon: <AutoFixHighIcon fontSize="large" color="primary" sx={{ mb: 2, fontSize: '3rem' }} />,
      title: 'AI-Powered Resume Builder',
      description:
        'Craft compelling, professional resumes in minutes with our intelligent assistant. Beat the ATS and impress recruiters.',
    },
    {
      icon: <BuildIcon fontSize="large" color="primary" sx={{ mb: 2, fontSize: '3rem' }} />,
      title: 'Dynamic Cover Letters',
      description:
        'Generate personalized cover letters tailored to each job application. Make a lasting first impression effortlessly.',
    },
    {
      icon: <FindInPageIcon fontSize="large" color="primary" sx={{ mb: 2, fontSize: '3rem' }} />,
      title: 'Portfolio Showcase',
      description:
        'Display your projects and achievements in a beautifully designed portfolio. Let your work speak for itself.',
    },
  ];

  return (
    <MainLayout hideDrawer={true}>
      <Suspense fallback={null}>
        <AnimatedBackground animationName="fallingFoodFiesta" />
      </Suspense>
      <Box sx={{ overflowX: 'hidden' }}>
        <Container
          disableGutters
          sx={(theme) => ({
            maxWidth: '85% !important',
            p: 0,
            backgroundColor: 'rgba(200, 200, 200, 0.9)',
            borderRadius: '12px',
            my: 2,
            mx: 'auto',
            overflow: 'hidden',
          })}
        >
          <Grid container spacing={0}>
            <Grid
              container
              item
              xs={12}
              md={12}
              sx={{
                py: { xs: 4, md: 4 },
                pl: { md: 4 },
                pr: { md: 4 },
                order: { xs: 2, md: 2 },
                mb: { xs: 0, md: 0 },
                flexDirection: 'column',
              }}
            >
              <Grid item>
                <Box
                  sx={{
                    textAlign: { xs: 'center', md: 'left' },
                    p: { xs: 2, md: 0 },
                  }}
                >
                  <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    sx={(theme) => ({
                      fontWeight: 700,
                      fontSize: { xs: '2rem', sm: '2.5rem', md: '2.8rem' },
                      letterSpacing: '0.5px',
                      mb: 2,
                      textAlign: { xs: 'center', md: 'left' },
                      color: theme.palette.primary.dark,
                      '& .firstLetter': {
                        color: 'accent.main',
                      },
                    })}
                  >
                    {'YET ANOTHER RESUME BUILDER APP'.split(' ').map((word, index) => (
                      <React.Fragment key={index}>
                        <span className="firstLetter">{word.charAt(0)}</span>
                        {word.slice(1)}
                        {index < 4 ? ' ' : ''}
                      </React.Fragment>
                    ))}
                  </Typography>
                  <Typography
                    variant="h6"
                    paragraph
                    sx={(theme) => ({
                      mb: 3,
                      fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
                      color: theme.palette.text.primary,
                      fontWeight: 500,
                      lineHeight: 1.5,
                      textAlign: { xs: 'center', md: 'left' },
                    })}
                  >
                    We Do Not Generate Fake Resumes, We Choose From Your Portfolio.
                  </Typography>
                </Box>
              </Grid>

              {/* Buttons below text only */}
              <Grid item sx={{ mt: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: { xs: 'center', md: 'flex-start' },
                    gap: 2,
                    flexWrap: 'wrap',
                    p: { xs: 2, md: 0 },
                  }}
                >
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="contained"
                    color="primary"
                    size="large"
                    sx={{ boxShadow: 3, '&:hover': { boxShadow: 5 } }}
                  >
                    Create Your Account
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/login"
                    variant="outlined"
                    color="secondary"
                    size="large"
                  >
                    Already have an account?
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Container>

        {/* "How YARBA Works" Section - Replicated Hero Layout */}
        <Container
          disableGutters
          sx={(theme) => ({
            maxWidth: '85% !important',
            p: 0,
            backgroundColor: 'rgba(200, 200, 200, 0.9)',
            borderRadius: '12px',
            my: 2,
            mx: 'auto',
            overflow: 'hidden',
          })}
        >
          <Grid container spacing={0} alignItems="stretch">
            <Grid
              item
              xs={12}
              md={12}
              sx={{
                py: { xs: 4, md: 4 },
                pl: { md: 4 },
                pr: { md: 4 },
                order: { xs: 2, md: 2 },
              }}
            >
              <Box
                sx={{
                  textAlign: { xs: 'center', md: 'left' },
                }}
              >
                <Typography
                  variant="h3"
                  component="h2"
                  gutterBottom
                  sx={(theme) => ({
                    fontWeight: 700,
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '2.8rem' },
                    letterSpacing: '0.5px',
                    color: theme.palette.primary.dark,
                    mb: 2,
                    textAlign: { xs: 'center', md: 'left' },
                  })}
                >
                  How YARBA Works
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 4,
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    color: 'text.primary',
                    fontWeight: 500,
                    lineHeight: 1.6,
                    textAlign: { xs: 'center', md: 'left' },
                  }}
                >
                  No one has only few skills, each job requires different skills that you have. You
                  did not do only few bullet points in your job. You upload your portfolio, we
                  choose the most relevant skills, experiences, projects to build your resume.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>

        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            textAlign="center"
            sx={{ mb: 6, fontWeight: 600 }}
          >
            Why Choose YARBA?
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <FeaturePaper elevation={6}>
                  {feature.icon}
                  <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2">{feature.description}</Typography>
                </FeaturePaper>
              </Grid>
            ))}
          </Grid>
        </Container>

        <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h3" component="h2" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            Ready to Elevate Your Career?
          </Typography>
          <Typography variant="h6" color="primary" paragraph sx={{ mb: 4 }}>
            Create tailored application materials from your experience and the job you want.
          </Typography>
          <Button
            component={RouterLink}
            to="/register"
            variant="contained"
            color="primary"
            size="large"
            sx={{ py: 1.5, px: 5, fontSize: '1.2rem' }}
          >
            Create Your Account
          </Button>
        </Container>
      </Box>
    </MainLayout>
  );
};

export default MainPage;
