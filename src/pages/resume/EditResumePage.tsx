import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
  Alert,
  Divider,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Chip
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon, Visibility as VisibilityIcon, ExpandMore as ExpandMoreIcon, Add as AddIcon, Delete as DeleteIcon, KeyboardArrowDown as KeyboardArrowDownIcon, KeyboardArrowUp as KeyboardArrowUpIcon } from '@mui/icons-material';
import { getResumeById, updateResume } from '../../services/resumeService';
import { Resume } from '../../types/models';
import { Toast } from '../../components/common';

// Helpers placed outside the component to avoid initialization order issues
const getEmptyResumeContentSkeleton = () => ({
  personal_information: {},
  career_summary: {},
  skills: [],
  work_experience: [],
  education: [],
  projects: [],
  awards: [],
  publications: [],
  certifications: [],
});

const normalizeResumeContent = (raw: any) => {
  const base = getEmptyResumeContentSkeleton();
  if (!raw || typeof raw !== 'object') return base;
  const out: any = { ...base, ...raw };
  if (raw.skills) {
    if (Array.isArray(raw.skills)) {
      out.skills = raw.skills;
    } else if (typeof raw.skills === 'object' && Array.isArray(raw.skills.skills)) {
      out.skills = raw.skills.skills;
    } else {
      out.skills = [];
    }
  }
  return out;
};

const EditResumePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [initialResume, setInitialResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState<string>('');
  const [jobTitle, setJobTitle] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  // Removed templateId editing per request
  const [jobDescription, setJobDescription] = useState<string>('');
  const [jobDescriptionUrl, setJobDescriptionUrl] = useState<string>('');
  // Removed portfolioId editing per request
  const [content, setContent] = useState<any | null>(null);
  const [jobDescriptionExpanded, setJobDescriptionExpanded] = useState<boolean>(false);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const resume = await getResumeById(id);
        setInitialResume(resume);
        setTitle(resume.title || '');
        setJobTitle(resume.job_title || '');
        setCompanyName(resume.company_name || '');
        // Template ID is not user-editable here
        setJobDescription(resume.job_description || '');
        setJobDescriptionUrl(resume.job_description_url || '');
        // Portfolio ID is not user-editable here
        setContent(normalizeResumeContent(resume.content));
      } catch (e: any) {
        setError(e.message || 'Failed to load resume');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleBack = () => {
    navigate('/resumes');
  };

  const handleView = () => {
    if (!id) return;
    navigate(`/resumes/${id}`);
  };

  // Portfolio selection removed from editing on this page per request

  const hasChanges = useMemo(() => {
    if (!initialResume) return false;
    const initialNormalized = normalizeResumeContent(initialResume.content);
    return (
      title !== (initialResume.title || '') ||
      jobTitle !== (initialResume.job_title || '') ||
      companyName !== (initialResume.company_name || '') ||
      jobDescription !== (initialResume.job_description || '') ||
      jobDescriptionUrl !== (initialResume.job_description_url || '') ||
      JSON.stringify(content) !== JSON.stringify(initialNormalized)
    );
  }, [companyName, content, initialResume, jobDescription, jobDescriptionUrl, jobTitle, title]);

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    setError(null);
    try {
      const payload: Partial<Resume> = {
        title,
        job_title: jobTitle,
        company_name: companyName,
        job_description: jobDescription,
        job_description_url: jobDescriptionUrl || undefined,
        content: content ?? getEmptyResumeContentSkeleton(),
      };
      const updated = await updateResume(id, payload);
      setInitialResume(updated);
      setContent(normalizeResumeContent(updated.content));
      setToastMessage('Resume updated successfully');
      setToastSeverity('success');
      setToastOpen(true);
      // Navigate back to view page after successful save
      navigate(`/resumes/${id}`);
    } catch (e: any) {
      setError(e.response?.data?.detail || e.message || 'Failed to update resume');
      setToastMessage(e.response?.data?.detail || e.message || 'Failed to update resume');
      setToastSeverity('error');
      setToastOpen(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Back to Resumes
        </Button>
      </Container>
    );
  }

  if (!initialResume) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">Resume not found</Alert>
        <Button startIcon={<ArrowBackIcon />} sx={{ mt: 2 }} onClick={handleBack}>
          Back to Resumes
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="h5">Edit Resume</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={handleBack} size="small">
              Back
            </Button>
            <Button variant="outlined" startIcon={<VisibilityIcon />} onClick={handleView} size="small">
              View
            </Button>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
              onClick={handleSave}
              disabled={saving || !hasChanges}
              size="small"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Stack>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Title"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Job Title"
              fullWidth
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Company Name"
              fullWidth
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </Grid>

          {/* Template ID and Portfolio ID fields removed per request */}

          <Grid item xs={12}>
            <TextField
              label="Job Description URL"
              fullWidth
              value={jobDescriptionUrl}
              onChange={(e) => setJobDescriptionUrl(e.target.value)}
              placeholder="https://example.com/job-posting"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
              Job Description
            </Typography>
            <Box
              sx={{
                position: 'relative',
                maxHeight: jobDescriptionExpanded ? 'none' : '120px',
                overflow: jobDescriptionExpanded ? 'visible' : 'hidden',
                pr: jobDescriptionExpanded ? 0 : '20px',
                '&:after': {
                  content: '""',
                  position: jobDescriptionExpanded ? 'static' : 'absolute',
                  bottom: 0,
                  right: 0,
                  left: 0,
                  height: jobDescriptionExpanded ? 0 : '30px',
                  background: jobDescriptionExpanded ? 'none' : 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,1))'
                }
              }}
            >
              <TextField
                fullWidth
                multiline
                minRows={3}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste or edit the job description here"
                sx={{ '& textarea': { overflow: jobDescriptionExpanded ? 'auto' : 'hidden' } }}
              />
            </Box>
            <Button
              size="small"
              sx={{ mt: 0.5 }}
              onClick={() => setJobDescriptionExpanded((prev) => !prev)}
              endIcon={jobDescriptionExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            >
              {jobDescriptionExpanded ? 'Show less' : 'View full description'}
            </Button>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {content && (
          <Box>
            {/* Career Summary */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">Career Summary</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Job Title" fullWidth value={content.career_summary?.job_title || ''} onChange={(e) => setContent({ ...content, career_summary: { ...content.career_summary, job_title: e.target.value } })} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="Summary" fullWidth multiline minRows={3} value={content.career_summary?.default_summary || ''} onChange={(e) => setContent({ ...content, career_summary: { ...content.career_summary, default_summary: e.target.value } })} />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Personal Information */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">Personal Information</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Full Name" fullWidth value={content.personal_information?.full_name || ''} onChange={(e) => setContent({ ...content, personal_information: { ...content.personal_information, full_name: e.target.value } })} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Email" fullWidth value={content.personal_information?.email || ''} onChange={(e) => setContent({ ...content, personal_information: { ...content.personal_information, email: e.target.value } })} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Phone" fullWidth value={content.personal_information?.phone || ''} onChange={(e) => setContent({ ...content, personal_information: { ...content.personal_information, phone: e.target.value } })} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Address" fullWidth value={content.personal_information?.address || ''} onChange={(e) => setContent({ ...content, personal_information: { ...content.personal_information, address: e.target.value } })} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="LinkedIn URL" fullWidth value={content.personal_information?.linkedin || ''} onChange={(e) => setContent({ ...content, personal_information: { ...content.personal_information, linkedin: e.target.value } })} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="GitHub URL" fullWidth value={content.personal_information?.github || ''} onChange={(e) => setContent({ ...content, personal_information: { ...content.personal_information, github: e.target.value } })} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="Website" fullWidth value={content.personal_information?.website || ''} onChange={(e) => setContent({ ...content, personal_information: { ...content.personal_information, website: e.target.value } })} />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Skills */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">Skills</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {(content.skills || []).map((cat: any, idx: number) => (
                    <Paper key={idx} variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <TextField
                          label="Category"
                          value={cat.category || ''}
                          onChange={(e) => {
                            const next = [...content.skills];
                            next[idx] = { ...next[idx], category: e.target.value };
                            setContent({ ...content, skills: next });
                          }}
                        />
                        <IconButton color="error" onClick={() => {
                          const next = [...content.skills];
                          next.splice(idx, 1);
                          setContent({ ...content, skills: next });
                        }}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {(cat.skills || []).map((s: string, sIdx: number) => (
                          <Chip
                            key={sIdx}
                            label={s}
                            onDelete={() => {
                              const next = [...content.skills];
                              const skillsArr = [...(next[idx].skills || [])];
                              skillsArr.splice(sIdx, 1);
                              next[idx] = { ...next[idx], skills: skillsArr };
                              setContent({ ...content, skills: next });
                            }}
                          />
                        ))}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <TextField
                          size="small"
                          label="Add skill"
                          onKeyDown={(e) => {
                            const input = e.target as HTMLInputElement;
                            if (e.key === 'Enter' && input.value.trim()) {
                              const next = [...content.skills];
                              const skillsArr = [...(next[idx].skills || [])];
                              skillsArr.push(input.value.trim());
                              next[idx] = { ...next[idx], skills: skillsArr };
                              setContent({ ...content, skills: next });
                              input.value = '';
                            }
                          }}
                        />
                      </Box>
                    </Paper>
                  ))}
                  <Button startIcon={<AddIcon />} onClick={() => setContent({ ...content, skills: [...(content.skills || []), { category: '', skills: [] }] })}>
                    Add Category
                  </Button>
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Work Experience */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">Work Experience</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {(content.work_experience || []).map((job: any, idx: number) => (
                    <Paper key={idx} variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2">Position #{idx + 1}</Typography>
                        <IconButton color="error" onClick={() => {
                          const next = [...content.work_experience];
                          next.splice(idx, 1);
                          setContent({ ...content, work_experience: next });
                        }}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                          <TextField label="Job Title" fullWidth value={job.job_title || job.position || ''} onChange={(e) => {
                            const next = [...content.work_experience];
                            next[idx] = { ...next[idx], job_title: e.target.value };
                            setContent({ ...content, work_experience: next });
                          }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField label="Company" fullWidth value={job.company || ''} onChange={(e) => {
                            const next = [...content.work_experience];
                            next[idx] = { ...next[idx], company: e.target.value };
                            setContent({ ...content, work_experience: next });
                          }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField label="Location" fullWidth value={job.location || ''} onChange={(e) => {
                            const next = [...content.work_experience];
                            next[idx] = { ...next[idx], location: e.target.value };
                            setContent({ ...content, work_experience: next });
                          }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField label="Time or Date Range" fullWidth value={job.time || ''} onChange={(e) => {
                            const next = [...content.work_experience];
                            next[idx] = { ...next[idx], time: e.target.value };
                            setContent({ ...content, work_experience: next });
                          }} helperText="Example: 2022–Present" />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField label="Description" fullWidth multiline minRows={2} value={job.description || ''} onChange={(e) => {
                            const next = [...content.work_experience];
                            next[idx] = { ...next[idx], description: e.target.value };
                            setContent({ ...content, work_experience: next });
                          }} />
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2" sx={{ mb: 1 }}>Achievements/Responsibilities</Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {(job.achievements || job.responsibilities || []).map((p: string, pIdx: number) => (
                              <Chip key={pIdx} label={p} onDelete={() => {
                                const next = [...content.work_experience];
                                const arr = [...(next[idx].achievements || next[idx].responsibilities || [])];
                                arr.splice(pIdx, 1);
                                next[idx] = { ...next[idx], achievements: arr };
                                setContent({ ...content, work_experience: next });
                              }} />
                            ))}
                          </Box>
                          <TextField size="small" label="Add bullet" fullWidth sx={{ mt: 1 }} onKeyDown={(e) => {
                            const input = e.target as HTMLInputElement;
                            if (e.key === 'Enter' && input.value.trim()) {
                              const next = [...content.work_experience];
                              const arr = [...(next[idx].achievements || next[idx].responsibilities || [])];
                              arr.push(input.value.trim());
                              next[idx] = { ...next[idx], achievements: arr };
                              setContent({ ...content, work_experience: next });
                              input.value = '';
                            }
                          }} />
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                  <Button startIcon={<AddIcon />} onClick={() => setContent({ ...content, work_experience: [...(content.work_experience || []), { job_title: '', company: '', location: '', time: '', achievements: [] }] })}>
                    Add Experience
                  </Button>
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Education */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">Education</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {(content.education || []).map((edu: any, idx: number) => (
                    <Paper key={idx} variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2">Education #{idx + 1}</Typography>
                        <IconButton color="error" onClick={() => {
                          const next = [...content.education];
                          next.splice(idx, 1);
                          setContent({ ...content, education: next });
                        }}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                          <TextField label="Degree" fullWidth value={edu.degree || ''} onChange={(e) => {
                            const next = [...content.education];
                            next[idx] = { ...next[idx], degree: e.target.value };
                            setContent({ ...content, education: next });
                          }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField label="Degree Type" fullWidth value={edu.degree_type || ''} onChange={(e) => {
                            const next = [...content.education];
                            next[idx] = { ...next[idx], degree_type: e.target.value };
                            setContent({ ...content, education: next });
                          }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField label="Institution" fullWidth value={edu.institution || edu.university_name || ''} onChange={(e) => {
                            const next = [...content.education];
                            next[idx] = { ...next[idx], institution: e.target.value };
                            setContent({ ...content, education: next });
                          }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField label="Location" fullWidth value={edu.location || ''} onChange={(e) => {
                            const next = [...content.education];
                            next[idx] = { ...next[idx], location: e.target.value };
                            setContent({ ...content, education: next });
                          }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField label="Time" fullWidth value={edu.time || ''} onChange={(e) => {
                            const next = [...content.education];
                            next[idx] = { ...next[idx], time: e.target.value };
                            setContent({ ...content, education: next });
                          }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField label="GPA" fullWidth value={edu.GPA || ''} onChange={(e) => {
                            const next = [...content.education];
                            next[idx] = { ...next[idx], GPA: e.target.value };
                            setContent({ ...content, education: next });
                          }} />
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2" sx={{ mb: 1 }}>Courses</Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {(edu.courses || edu.transcript || []).map((c: string, cIdx: number) => (
                              <Chip key={cIdx} label={c} onDelete={() => {
                                const next = [...content.education];
                                const arr = [...(next[idx].courses || next[idx].transcript || [])];
                                arr.splice(cIdx, 1);
                                next[idx] = { ...next[idx], courses: arr };
                                setContent({ ...content, education: next });
                              }} />
                            ))}
                          </Box>
                          <TextField size="small" label="Add course" fullWidth sx={{ mt: 1 }} onKeyDown={(e) => {
                            const input = e.target as HTMLInputElement;
                            if (e.key === 'Enter' && input.value.trim()) {
                              const next = [...content.education];
                              const arr = [...(next[idx].courses || next[idx].transcript || [])];
                              arr.push(input.value.trim());
                              next[idx] = { ...next[idx], courses: arr };
                              setContent({ ...content, education: next });
                              input.value = '';
                            }
                          }} />
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                  <Button startIcon={<AddIcon />} onClick={() => setContent({ ...content, education: [...(content.education || []), { degree_type: '', degree: '', institution: '', time: '', GPA: '', courses: [] }] })}>
                    Add Education
                  </Button>
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Projects */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">Projects</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {(content.projects || []).map((proj: any, idx: number) => (
                    <Paper key={idx} variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2">Project #{idx + 1}</Typography>
                        <IconButton color="error" onClick={() => {
                          const next = [...content.projects];
                          next.splice(idx, 1);
                          setContent({ ...content, projects: next });
                        }}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                          <TextField label="Name" fullWidth value={proj.name || ''} onChange={(e) => {
                            const next = [...content.projects];
                            next[idx] = { ...next[idx], name: e.target.value };
                            setContent({ ...content, projects: next });
                          }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField label="Link" fullWidth value={proj.link || proj.url || ''} onChange={(e) => {
                            const next = [...content.projects];
                            next[idx] = { ...next[idx], link: e.target.value };
                            setContent({ ...content, projects: next });
                          }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField label="Date" fullWidth value={proj.date || ''} onChange={(e) => {
                            const next = [...content.projects];
                            next[idx] = { ...next[idx], date: e.target.value };
                            setContent({ ...content, projects: next });
                          }} />
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2" sx={{ mb: 1 }}>Bullet Points</Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {(proj.bullet_points || []).map((bp: string, bIdx: number) => (
                              <Chip key={bIdx} label={bp} onDelete={() => {
                                const next = [...content.projects];
                                const arr = [...(next[idx].bullet_points || [])];
                                arr.splice(bIdx, 1);
                                next[idx] = { ...next[idx], bullet_points: arr };
                                setContent({ ...content, projects: next });
                              }} />
                            ))}
                          </Box>
                          <TextField size="small" label="Add bullet" fullWidth sx={{ mt: 1 }} onKeyDown={(e) => {
                            const input = e.target as HTMLInputElement;
                            if (e.key === 'Enter' && input.value.trim()) {
                              const next = [...content.projects];
                              const arr = [...(next[idx].bullet_points || [])];
                              arr.push(input.value.trim());
                              next[idx] = { ...next[idx], bullet_points: arr };
                              setContent({ ...content, projects: next });
                              input.value = '';
                            }
                          }} />
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                  <Button startIcon={<AddIcon />} onClick={() => setContent({ ...content, projects: [...(content.projects || []), { name: '', link: '', date: '', bullet_points: [] }] })}>
                    Add Project
                  </Button>
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Awards */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">Awards</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {(content.awards || []).map((aw: any, idx: number) => (
                    <Paper key={idx} variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2">Award #{idx + 1}</Typography>
                        <IconButton color="error" onClick={() => {
                          const next = [...content.awards];
                          next.splice(idx, 1);
                          setContent({ ...content, awards: next });
                        }}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                          <TextField label="Title" fullWidth value={aw.title || aw.name || ''} onChange={(e) => {
                            const next = [...content.awards];
                            next[idx] = { ...next[idx], title: e.target.value };
                            setContent({ ...content, awards: next });
                          }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField label="Issuer" fullWidth value={aw.issuer || ''} onChange={(e) => {
                            const next = [...content.awards];
                            next[idx] = { ...next[idx], issuer: e.target.value };
                            setContent({ ...content, awards: next });
                          }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField label="Date" fullWidth value={aw.date || ''} onChange={(e) => {
                            const next = [...content.awards];
                            next[idx] = { ...next[idx], date: e.target.value };
                            setContent({ ...content, awards: next });
                          }} />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField label="Description" fullWidth multiline minRows={2} value={aw.description || aw.explanation || ''} onChange={(e) => {
                            const next = [...content.awards];
                            next[idx] = { ...next[idx], description: e.target.value };
                            setContent({ ...content, awards: next });
                          }} />
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                  <Button startIcon={<AddIcon />} onClick={() => setContent({ ...content, awards: [...(content.awards || []), { title: '', issuer: '', date: '', description: '' }] })}>
                    Add Award
                  </Button>
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Publications */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">Publications</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {(content.publications || []).map((pub: any, idx: number) => (
                    <Paper key={idx} variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2">Publication #{idx + 1}</Typography>
                        <IconButton color="error" onClick={() => {
                          const next = [...content.publications];
                          next.splice(idx, 1);
                          setContent({ ...content, publications: next });
                        }}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                          <TextField label="Title" fullWidth value={pub.title || pub.name || ''} onChange={(e) => {
                            const next = [...content.publications];
                            next[idx] = { ...next[idx], title: e.target.value };
                            setContent({ ...content, publications: next });
                          }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField label="Publisher" fullWidth value={pub.publisher || ''} onChange={(e) => {
                            const next = [...content.publications];
                            next[idx] = { ...next[idx], publisher: e.target.value };
                            setContent({ ...content, publications: next });
                          }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField label="Date" fullWidth value={pub.date || pub.time || ''} onChange={(e) => {
                            const next = [...content.publications];
                            next[idx] = { ...next[idx], date: e.target.value };
                            setContent({ ...content, publications: next });
                          }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField label="URL" fullWidth value={pub.url || pub.link || ''} onChange={(e) => {
                            const next = [...content.publications];
                            next[idx] = { ...next[idx], url: e.target.value };
                            setContent({ ...content, publications: next });
                          }} />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField label="Description" fullWidth multiline minRows={2} value={pub.description || ''} onChange={(e) => {
                            const next = [...content.publications];
                            next[idx] = { ...next[idx], description: e.target.value };
                            setContent({ ...content, publications: next });
                          }} />
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                  <Button startIcon={<AddIcon />} onClick={() => setContent({ ...content, publications: [...(content.publications || []), { title: '', publisher: '', date: '', url: '', description: '' }] })}>
                    Add Publication
                  </Button>
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Certifications */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">Certifications</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {(content.certifications || []).map((cert: any, idx: number) => (
                    <Paper key={idx} variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2">Certification #{idx + 1}</Typography>
                        <IconButton color="error" onClick={() => {
                          const next = [...content.certifications];
                          next.splice(idx, 1);
                          setContent({ ...content, certifications: next });
                        }}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                          <TextField label="Name" fullWidth value={cert.name || ''} onChange={(e) => {
                            const next = [...content.certifications];
                            next[idx] = { ...next[idx], name: e.target.value };
                            setContent({ ...content, certifications: next });
                          }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField label="Issuer" fullWidth value={cert.issuer || ''} onChange={(e) => {
                            const next = [...content.certifications];
                            next[idx] = { ...next[idx], issuer: e.target.value };
                            setContent({ ...content, certifications: next });
                          }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField label="Date" fullWidth value={cert.date || ''} onChange={(e) => {
                            const next = [...content.certifications];
                            next[idx] = { ...next[idx], date: e.target.value };
                            setContent({ ...content, certifications: next });
                          }} />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField label="Description" fullWidth multiline minRows={2} value={cert.description || ''} onChange={(e) => {
                            const next = [...content.certifications];
                            next[idx] = { ...next[idx], description: e.target.value };
                            setContent({ ...content, certifications: next });
                          }} />
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                  <Button startIcon={<AddIcon />} onClick={() => setContent({ ...content, certifications: [...(content.certifications || []), { name: '', issuer: '', date: '', description: '' }] })}>
                    Add Certification
                  </Button>
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Box>
        )}
      </Paper>

      <Toast
        open={toastOpen}
        message={toastMessage}
        severity={toastSeverity}
        onClose={() => setToastOpen(false)}
      />
    </Container>
  );
};

export default EditResumePage;
