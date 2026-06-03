import React, { useState, useEffect, useMemo } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CardActions,
  CircularProgress,
  Divider,
  Stack,
  Alert
} from '@mui/material';
import { 
  Description as ResumeIcon, 
  Mail as CoverLetterIcon,
  Add as AddIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getResumeById } from '../services/resumeService';
import { Resume, CoverLetter } from '../types/models';
import { useUserProfile } from '../hooks/useUserProfile';
import { useUserPortfolio } from '../hooks/usePortfolio';
import { useResumes } from '../hooks/useResumes';
import { useCoverLetters } from '../hooks/useCoverLetters';

// Define a unified type for recent items
interface RecentItem {
  id: string;
  title: string;
  type: 'resume' | 'cover-letter';
  date: string;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [resumeTitles, setResumeTitles] = useState<Record<string, string>>({});

  const { data: profile } = useUserProfile();
  const { data: portfolio, isError: portfolioError } = useUserPortfolio();
  const {
    data: resumesData,
    isLoading: resumesLoading,
    isError: resumesError,
  } = useResumes({ skip: 0, limit: 10, sort_by: 'updated_desc' });
  const {
    data: coverLettersData,
    isLoading: coverLettersLoading,
    isError: coverLettersError,
  } = useCoverLetters({ skip: 0, limit: 3, sort_by: 'updated_desc' });

  const loading = resumesLoading || coverLettersLoading;

  useEffect(() => {
    if (resumesError || coverLettersError) {
      setError('Failed to load dashboard data. Please try again later.');
    }
  }, [resumesError, coverLettersError]);

  useEffect(() => {
    const items = coverLettersData?.items ?? [];
    const resumeIds = Array.from(new Set(items.map((cl) => cl.resume_id)));
    const fromList: Record<string, string> = {};
    resumesData?.items.forEach((r) => {
      fromList[r.id] = r.title;
    });

    const missingIds = resumeIds.filter((id) => !fromList[id]);
    if (missingIds.length === 0) {
      setResumeTitles(fromList);
      return;
    }

    const loadMissing = async () => {
      const map = { ...fromList };
      await Promise.all(
        missingIds.map(async (resumeId) => {
          try {
            const resume = await getResumeById(resumeId);
            map[resumeId] = resume.title;
          } catch {
            // resume may have been deleted
          }
        })
      );
      setResumeTitles(map);
    };
    loadMissing();
  }, [coverLettersData?.items, resumesData?.items]);

  const resumeCount = resumesData?.total ?? 0;
  const coverLetterCount = coverLettersData?.items.length ?? 0;

  const portfolioComplete = useMemo(() => {
    if (portfolioError || !portfolio) {
      return false;
    }
    const hasCareerSummary = Boolean(portfolio.career_summary?.default_summary);
    const hasSkills = portfolio.skills && portfolio.skills.length > 0;
    return Boolean(hasCareerSummary && hasSkills);
  }, [portfolio, portfolioError]);

  const recentItems = useMemo(() => {
    const validResumes: RecentItem[] = (resumesData?.items ?? []).map((resume: Resume) => ({
      id: resume.id,
      title: resume.title,
      type: 'resume' as const,
      date: resume.updated_at || resume.created_at,
    }));

    const validCoverLetters: RecentItem[] = (coverLettersData?.items ?? [])
      .filter((cl: CoverLetter) => resumeTitles[cl.resume_id] !== undefined)
      .map((cl: CoverLetter) => ({
        id: cl.id,
        title: resumeTitles[cl.resume_id],
        type: 'cover-letter' as const,
        date: cl.updated_at || cl.created_at,
      }));

    return [...validResumes, ...validCoverLetters]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);
  }, [resumesData?.items, coverLettersData?.items, resumeTitles]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleCreateResume = (event: React.MouseEvent) => {
    event.stopPropagation();
    navigate('/resumes/new');
  };

  const handleCreateCoverLetter = (event: React.MouseEvent) => {
    event.stopPropagation();
    navigate('/cover-letters/new');
  };

  const handleViewResumes = () => {
    navigate('/resumes');
  };

  const handleViewCoverLetters = () => {
    navigate('/cover-letters');
  };

  const handleEditPortfolio = () => {
    navigate('/portfolio');
  };

  return (
    <Box sx={{ p: 3, pl: 2, pt: 2 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        mb: 5,
        mt: 2 
      }}>
        <Typography 
          variant="h4" 
          sx={{ 
            textAlign: 'center',
            fontWeight: 'normal'
          }}
        >
          <Box component="span" sx={{ color: 'primary.main' }}>Welcome,</Box>
          <Box 
            component="span" 
            sx={{ 
              color: '#E05B49', 
              ml: 1, 
              fontWeight: 'bold' 
            }}
          >
            {profile?.personal_information?.full_name || user?.username?.replace(/_[0-9]+$/, '').replace(/_/g, ' ') || 'User'}!
          </Box>
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Document Summary */}
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={3} 
        sx={{ mb: 6 }}
        alignItems="stretch"
      >
        {/* Resume Card */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 2, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            flexGrow: 1,
            width: { xs: '100%', sm: '33%' },
            cursor: 'pointer'
          }}
          onClick={handleViewResumes}
        >
          <ResumeIcon fontSize="large" color="primary" sx={{ mb: 1 }} />
          {loading ? (
            <CircularProgress size={30} sx={{ my: 1 }} />
          ) : (
            <Typography variant="h5">{resumeCount}</Typography>
          )}
          <Typography variant="subtitle1">Resumes</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ mt: 2 }}
            onClick={handleCreateResume}
            disabled={loading}
          >
            Create Resume
          </Button>
        </Paper>

        {/* Cover Letter Card */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 2, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            flexGrow: 1,
            width: { xs: '100%', sm: '33%' },
            cursor: 'pointer'
          }}
          onClick={handleViewCoverLetters}
        >
          <CoverLetterIcon fontSize="large" color="primary" sx={{ mb: 1 }} />
          {loading ? (
            <CircularProgress size={30} sx={{ my: 1 }} />
          ) : (
            <Typography variant="h5">{coverLetterCount}</Typography>
          )}
          <Typography variant="subtitle1">Cover Letters</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ mt: 2 }}
            onClick={handleCreateCoverLetter}
            disabled={loading}
          >
            Create Cover Letter
          </Button>
        </Paper>

        {/* Portfolio Card */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 2, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            flexGrow: 1,
            width: { xs: '100%', sm: '33%' },
            bgcolor: portfolioComplete ? 'success.50' : 'warning.50'
          }}
        >
          <PersonIcon 
            fontSize="large" 
            color={loading ? "disabled" : (portfolioComplete ? "success" : "warning")} 
            sx={{ mb: 1 }} 
          />
          {loading ? (
            <CircularProgress size={30} sx={{ my: 1 }} />
          ) : (
            <Typography variant="h5">
              {portfolioComplete ? 'Complete' : 'Incomplete'}
            </Typography>
          )}
          <Typography variant="subtitle1">Portfolio Status</Typography>
          <Button
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={handleEditPortfolio}
            disabled={loading}
          >
            {portfolioComplete ? 'View Portfolio' : 'Complete Portfolio'}
          </Button>
        </Paper>
      </Stack>

      {/* Recent Activity */}
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Recent Activity
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: 'repeat(2, 1fr)', 
              md: 'repeat(3, 1fr)' 
            },
            gap: 2,
            mb: 2
          }}>
            {recentItems.map((item) => (
              <Card key={item.id} sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" component="div" noWrap>
                    {item.title}
                  </Typography>
                  <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    {item.type === 'resume' ? 'Resume' : 'Cover Letter'}
                  </Typography>
                  <Typography variant="body2">
                    Last modified: {formatDate(item.date)}
                  </Typography>
                </CardContent>
                <Divider />
                <CardActions>
                  <Button size="small" onClick={() => navigate(`/${item.type}s/${item.id}`)}>
                    View
                  </Button>
                  <Button size="small" onClick={() => navigate(`/${item.type}s/${item.id}/edit`)}>
                    Edit
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
          
          {recentItems.length === 0 && (
            <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
              No recent activity. Create your first document!
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default DashboardPage; 