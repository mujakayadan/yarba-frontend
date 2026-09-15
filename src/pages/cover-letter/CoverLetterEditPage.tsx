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
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  AutoFixHigh as GenerateIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { generateCoverLetterContent, updateCoverLetter } from '../../services/coverLetterService';
import { CoverLetter } from '../../types/models';
import { useToast } from '../../contexts/ToastContext';
import { useCoverLetter } from '../../hooks/useCoverLetter';
import { useResume } from '../../hooks/useResume';
import { coverLetterKeys } from '../../lib/queryKeys';
import { queryClient } from '../../providers/QueryProvider';
import { EditPageActionBar } from '../../components/common/EditPageActionBar';
import { ViewPageHeader } from '../../components/common/ViewPageHeader';

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
  const { showSuccess, showError } = useToast();

  const { data: initialCoverLetter, isLoading, isError } = useCoverLetter(id);
  const { data: resume } = useResume(initialCoverLetter?.resume_id);

  const [content, setContent] = useState('');
  const [formSeeded, setFormSeeded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
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

    try {
      const updated = await generateCoverLetterContent(id, regenerate);
      if (id) {
        queryClient.setQueryData(coverLetterKeys.detail(id), updated);
      }
      setContent(contentToEditableText(updated.content));
      showSuccess(regenerate ? 'Cover letter regenerated' : 'Cover letter content generated');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to generate cover letter content';
      showError(message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!id) {
      return;
    }

    setSaving(true);

    try {
      await updateMutation.mutateAsync(content);
      showSuccess('Cover letter updated successfully');
      navigate(`/cover-letters/${id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update cover letter';
      showError(message);
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
      <Box sx={{ p: 3, px: { xs: 2.5, sm: 3 } }}>
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
    <Box
      sx={{
        width: '100%',
        px: { xs: 2.5, sm: 3 },
        pt: { xs: 2, sm: 3 },
        pb: { xs: 4, sm: 4 },
      }}
    >
      <Paper elevation={1} sx={{ p: { xs: 2, sm: 3 } }}>
        <ViewPageHeader title={pageTitle} />
        <EditPageActionBar
          backLabel="Back to Cover Letters"
          onBack={handleBack}
          onSave={handleSave}
          saving={saving}
          saveDisabled={!hasChanges}
          secondaryActions={
            <Button variant="outlined" startIcon={<VisibilityIcon />} onClick={handleView}>
              View
            </Button>
          }
        />

        <Divider sx={{ mb: 2 }} />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<GenerateIcon />}
            onClick={() => handleGenerate(false)}
            disabled={generating}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Generate
          </Button>
          <Button
            variant="outlined"
            startIcon={<GenerateIcon />}
            onClick={() => handleGenerate(true)}
            disabled={generating}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
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
      </Paper>
    </Box>
  );
};

export default CoverLetterEditPage;
