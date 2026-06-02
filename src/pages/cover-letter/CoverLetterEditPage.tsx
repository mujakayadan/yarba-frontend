import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  AutoFixHigh as GenerateIcon,
  Save as SaveIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import {
  generateCoverLetterContent,
  getCoverLetterById,
  updateCoverLetter,
} from '../../services/coverLetterService';
import { getResumeById } from '../../services/resumeService';
import { CoverLetter } from '../../types/models';
import { Toast } from '../../components/common';

const contentToEditableText = (content: CoverLetter['content']): string => {
  if (typeof content === 'string') {
    return content;
  }
  if (content == null) {
    return '';
  }
  return JSON.stringify(content, null, 2);
};

const CoverLetterEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [initialCoverLetter, setInitialCoverLetter] = useState<CoverLetter | null>(null);
  const [resumeTitle, setResumeTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');

  useEffect(() => {
    const fetchCoverLetter = async () => {
      if (!id) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const coverLetter = await getCoverLetterById(id);
        setInitialCoverLetter(coverLetter);
        setContent(contentToEditableText(coverLetter.content));

        try {
          const resume = await getResumeById(coverLetter.resume_id);
          setResumeTitle(resume.title);
        } catch {
          setResumeTitle('');
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load cover letter';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchCoverLetter();
  }, [id]);

  const pageTitle = resumeTitle || initialCoverLetter?.id.slice(0, 8) || 'Cover Letter';

  const hasChanges = useMemo(() => {
    if (!initialCoverLetter) {
      return false;
    }
    return content !== contentToEditableText(initialCoverLetter.content);
  }, [content, initialCoverLetter]);

  const showToast = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setToastMessage(message);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  const handleBack = () => {
    navigate('/cover-letters');
  };

  const handleView = () => {
    if (id) {
      navigate(`/cover-letters/${id}`);
    }
  };

  const handleGenerate = async (regenerate: boolean) => {
    if (!id) {
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const updated = await generateCoverLetterContent(id, regenerate);
      setInitialCoverLetter(updated);
      setContent(contentToEditableText(updated.content));
      showToast(regenerate ? 'Cover letter regenerated' : 'Cover letter content generated', 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate cover letter content';
      setError(message);
      showToast(message, 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!id) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const updated = await updateCoverLetter(id, { content });
      setInitialCoverLetter(updated);
      setContent(contentToEditableText(updated.content));
      showToast('Cover letter updated successfully', 'success');
      navigate(`/cover-letters/${id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update cover letter';
      setError(message);
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!initialCoverLetter) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Cover letter not found.
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Back to Cover Letters
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h5">Edit Cover Letter</Typography>
          <Stack direction="row" spacing={1}>
            <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
              Back
            </Button>
            <Button startIcon={<VisibilityIcon />} onClick={handleView} variant="outlined">
              View
            </Button>
          </Stack>
        </Stack>

        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          {pageTitle}
        </Typography>

        <Divider sx={{ mb: 3 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={generating ? <CircularProgress size={16} /> : <GenerateIcon />}
            onClick={() => handleGenerate(false)}
            disabled={generating || saving || Boolean(content.trim())}
          >
            Generate Content
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={generating ? <CircularProgress size={16} /> : <GenerateIcon />}
            onClick={() => handleGenerate(true)}
            disabled={generating || saving}
          >
            Regenerate Content
          </Button>
        </Stack>

        <TextField
          label="Cover Letter Content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          multiline
          minRows={16}
          fullWidth
          placeholder="Write or generate your cover letter content here..."
        />

        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
          <Button variant="outlined" onClick={handleView} disabled={saving || generating}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
            onClick={handleSave}
            disabled={saving || generating || !hasChanges}
          >
            Save Changes
          </Button>
        </Stack>
      </Paper>

      <Toast
        open={toastOpen}
        message={toastMessage}
        severity={toastSeverity}
        onClose={() => setToastOpen(false)}
      />
    </Box>
  );
};

export default CoverLetterEditPage;
