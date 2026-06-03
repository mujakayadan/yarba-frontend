import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
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
  updateCoverLetter,
} from '../../services/coverLetterService';
import { CoverLetter } from '../../types/models';
import { Toast } from '../../components/common';
import { useCoverLetter } from '../../hooks/useCoverLetter';
import { useResume } from '../../hooks/useResume';
import { coverLetterKeys } from '../../lib/queryKeys';
import { queryClient } from '../../providers/QueryProvider';

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

  const { data: initialCoverLetter, isLoading, isError } = useCoverLetter(id);
  const { data: resume } = useResume(initialCoverLetter?.resume_id);

  const [content, setContent] = useState('');
  const [formSeeded, setFormSeeded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');

  useEffect(() => {
    if (initialCoverLetter && !formSeeded) {
      setContent(contentToEditableText(initialCoverLetter.content));
      setFormSeeded(true);
    }
  }, [initialCoverLetter, formSeeded]);

  const updateMutation = useMutation({
    mutationFn: (newContent: string) => updateCoverLetter(id!, { content: newContent }),
    onSuccess: (updated) => {
      if (id) {
        queryClient.setQueryData(coverLetterKeys.detail(id), updated);
      }
      queryClient.invalidateQueries({ queryKey: coverLetterKeys.all });
    },
  });

  const pageTitle = resume?.title || initialCoverLetter?.id.slice(0, 8) || 'Cover Letter';

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
      if (id) {
        queryClient.setQueryData(coverLetterKeys.detail(id), updated);
      }
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
      await updateMutation.mutateAsync(content);
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

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !initialCoverLetter) {
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
      <Paper elevation={1} sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h5">{pageTitle}</Typography>
          <Stack direction="row" spacing={1}>
            <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
              Back
            </Button>
            <Button startIcon={<VisibilityIcon />} onClick={handleView}>
              View
            </Button>
          </Stack>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Divider sx={{ mb: 2 }} />

        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<GenerateIcon />}
            onClick={() => handleGenerate(false)}
            disabled={generating}
          >
            Generate
          </Button>
          <Button
            variant="outlined"
            startIcon={<GenerateIcon />}
            onClick={() => handleGenerate(true)}
            disabled={generating}
          >
            Regenerate
          </Button>
        </Stack>

        <TextField
          fullWidth
          multiline
          minRows={16}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          label="Cover Letter Content"
          variant="outlined"
        />

        <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 3 }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving || !hasChanges}
          >
            {saving ? <CircularProgress size={24} /> : 'Save Changes'}
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
