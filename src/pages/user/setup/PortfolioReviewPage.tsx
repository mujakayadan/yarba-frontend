import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import CodeIcon from '@mui/icons-material/Code';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useAuth } from '../../../contexts/AuthContext';
import { sortByDateDesc } from '../../../utils/dateSort';
import type { ParsedPortfolioData } from '../../../types/portfolio';
import { createPortfolioFromParsedData } from '../../../services/portfolioService';
import { extractApiErrorMessage } from '../../../utils/apiErrors';
import { SetupStepHeader } from '../../../components/user/setup/SetupStepHeader';

const PortfolioReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { updateUserSetupProgress } = useAuth();
  const [parsedData, setParsedData] = useState<ParsedPortfolioData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Retrieve parsed data from localStorage
    const data = localStorage.getItem('parsedPortfolioData');
    if (data) {
      try {
        const parsed = JSON.parse(data) as ParsedPortfolioData;
        setParsedData(parsed);
      } catch {
        setError('Unable to load parsed data. Please try uploading your document again.');
      }
    } else {
      setError('No parsed data found. Please upload your document first.');
    }
    setLoading(false);
  }, []);

  const handleSavePortfolio = async () => {
    if (!parsedData) return;

    try {
      setSaving(true);
      setError(null);

      await createPortfolioFromParsedData(parsedData);

      // Clean up localStorage
      localStorage.removeItem('parsedPortfolioData');

      // Complete the setup
      await updateUserSetupProgress({ setup_completed: true });
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(extractApiErrorMessage(err, 'Failed to save portfolio.'));
      setSaving(false);
    }
  };

  const handleBack = async () => {
    try {
      await updateUserSetupProgress({ current_setup_step: 5 });
      navigate('/user/setup/portfolio-upload');
    } catch {
      navigate('/user/setup/portfolio-upload');
    }
  };

  if (loading) {
    return (
      <Container component="main" maxWidth="sm" sx={{ textAlign: 'center', mt: 8 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading parsed portfolio data...</Typography>
      </Container>
    );
  }

  if (!parsedData) {
    return (
      <Container component="main" maxWidth="sm" sx={{ p: 3, mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom align="center">
            Portfolio Data Not Found
          </Typography>
          <Alert severity="error" sx={{ my: 2 }}>
            {error || 'No parsed data found. Please upload your document first.'}
          </Alert>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button variant="contained" onClick={() => navigate('/user/setup/portfolio-upload')}>
              Return to Upload
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container
      component="main"
      maxWidth={false}
      sx={{
        mt: 8,
        mb: 8,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          width: '100%',
          maxWidth: '900px',
          boxSizing: 'border-box',
        }}
      >
        <SetupStepHeader
          activeStep={1}
          title="Review your portfolio"
          description="Check the information Yarba extracted before completing setup. You can edit every section later from Portfolio."
        />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Divider sx={{ mb: 4 }} />

        {/* Career Summary */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Career Summary</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {parsedData.career_summary ? (
              <Box>
                {parsedData.career_summary.default_job_title && (
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{
                      fontWeight: 'bold',
                    }}
                  >
                    {parsedData.career_summary.default_job_title}
                    {parsedData.career_summary.years_of_experience &&
                      ` (${parsedData.career_summary.years_of_experience} Experience)`}
                  </Typography>
                )}
                {parsedData.career_summary.default_summary && (
                  <Typography
                    variant="body1"
                    sx={{
                      marginBottom: '16px',
                    }}
                  >
                    {parsedData.career_summary.default_summary}
                  </Typography>
                )}
                {parsedData.career_summary.job_titles &&
                  parsedData.career_summary.job_titles.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Job Titles:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {parsedData.career_summary.job_titles.map((title, index) => (
                          <Chip key={index} label={title} size="small" />
                        ))}
                      </Box>
                    </Box>
                  )}
              </Box>
            ) : (
              <Typography
                sx={{
                  color: 'text.secondary',
                }}
              >
                No career summary information found.
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>

        {/* Skills */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Skills</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {parsedData.skills && parsedData.skills.length > 0 ? (
              <Box>
                {parsedData.skills.map((skillGroup, index) => (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      sx={{
                        fontWeight: 'bold',
                      }}
                    >
                      {skillGroup.category}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {skillGroup.skills.map((skill, skillIndex) => (
                        <Chip key={skillIndex} label={skill} size="small" />
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography
                sx={{
                  color: 'text.secondary',
                }}
              >
                No skills information found.
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>

        {/* Work Experience */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WorkIcon sx={{ mr: 1 }} /> Work Experience
              </Box>
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {parsedData.work_experience && parsedData.work_experience.length > 0 ? (
              <Box>
                {sortByDateDesc(parsedData.work_experience).map((job, index) => (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 'bold',
                      }}
                    >
                      {job.job_title} at {job.company}
                    </Typography>
                    <Typography
                      variant="body2"
                      gutterBottom
                      sx={{
                        color: 'text.secondary',
                      }}
                    >
                      {job.location && `${job.location} • `}
                      {job.time}
                    </Typography>
                    <List dense disablePadding>
                      {job.responsibilities.map((resp, respIndex) => (
                        <ListItem key={respIndex} sx={{ pl: 0 }}>
                          <ListItemText
                            primary={resp}
                            slotProps={{
                              primary: { variant: 'body2' },
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography
                sx={{
                  color: 'text.secondary',
                }}
              >
                No work experience information found.
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>

        {/* Education */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SchoolIcon sx={{ mr: 1 }} /> Education
              </Box>
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {parsedData.education && parsedData.education.length > 0 ? (
              <Box>
                {sortByDateDesc(parsedData.education).map((edu, index) => (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 'bold',
                      }}
                    >
                      {edu.degree_type ? `${edu.degree_type} in ` : ''}
                      {edu.degree}
                    </Typography>
                    <Typography variant="body1">{edu.university_name}</Typography>
                    <Typography
                      variant="body2"
                      gutterBottom
                      sx={{
                        color: 'text.secondary',
                      }}
                    >
                      {edu.location && `${edu.location} • `}
                      {edu.time}
                      {edu.GPA && ` • GPA: ${edu.GPA}`}
                    </Typography>
                    {edu.transcript && edu.transcript.length > 0 && (
                      <List dense disablePadding sx={{ mt: 1 }}>
                        {edu.transcript.map((course, courseIndex) => (
                          <ListItem key={courseIndex} sx={{ pl: 0 }}>
                            <ListItemText
                              primary={course}
                              slotProps={{
                                primary: { variant: 'body2' },
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography
                sx={{
                  color: 'text.secondary',
                }}
              >
                No education information found.
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>

        {/* Projects */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CodeIcon sx={{ mr: 1 }} /> Projects
              </Box>
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {parsedData.projects && parsedData.projects.length > 0 ? (
              <Box>
                {sortByDateDesc(parsedData.projects).map((project, index) => (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 'bold',
                      }}
                    >
                      {project.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      gutterBottom
                      sx={{
                        color: 'text.secondary',
                      }}
                    >
                      {project.date}
                      {project.link && (
                        <Box component="span" sx={{ ml: 1 }}>
                          •{' '}
                          <a href={project.link} target="_blank" rel="noreferrer">
                            View Project
                          </a>
                        </Box>
                      )}
                    </Typography>
                    <List dense disablePadding>
                      {project.bullet_points.map((point, pointIndex) => (
                        <ListItem key={pointIndex} sx={{ pl: 0 }}>
                          <ListItemText
                            primary={point}
                            slotProps={{
                              primary: { variant: 'body2' },
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography
                sx={{
                  color: 'text.secondary',
                }}
              >
                No projects information found.
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>

        {/* Awards */}
        {parsedData.awards && parsedData.awards.length > 0 && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EmojiEventsIcon sx={{ mr: 1 }} /> Awards
                </Box>
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                {parsedData.awards.map((award, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 'bold',
                      }}
                    >
                      {award.name}
                    </Typography>
                    {award.explanation && (
                      <Typography variant="body2">{award.explanation}</Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        )}

        <Divider sx={{ my: 4 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button variant="outlined" onClick={handleBack} disabled={saving}>
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleSavePortfolio}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {saving ? 'Saving...' : 'Complete Setup'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default PortfolioReviewPage;
