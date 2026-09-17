import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  styled,
  Divider,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { CloudUpload as CloudUploadIcon, InsertDriveFile as FileIcon } from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { pickPortfolioDocument } from '../../../platform/nativeFilePicker';
import { isNativeRuntime } from '../../../platform/nativeRuntime';
import { parsePortfolioDocument } from '../../../services/portfolioService';
import { extractApiErrorMessage } from '../../../utils/apiErrors';
import { storeParsedPortfolioDraft } from '../../../utils/onboardingDraft';
import { validateDocumentFile } from '../../../utils/uploadFiles';
import {
  SetupStepHeader,
  setupActionBarSx,
  setupPageContainerSx,
} from '../../../components/user/setup/SetupStepHeader';

// Styled components for file upload area
const UploadBox = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'background-color 0.3s',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const HiddenInput = styled('input')({
  display: 'none',
});

const PortfolioUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { updateUserSetupProgress } = useAuth();
  const theme = useTheme();
  const isNarrowViewport = useMediaQuery(theme.breakpoints.down('md'));
  const isCompactUpload = isNativeRuntime() || isNarrowViewport;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [picking, setPicking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isBusy = uploading || picking;

  const applySelectedFile = (file: File | null) => {
    if (!file) {
      return;
    }
    const validationError = validateDocumentFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
    setError(null);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    applySelectedFile(event.target.files?.[0] ?? null);
    event.target.value = '';
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    applySelectedFile(event.dataTransfer.files?.[0] ?? null);
  };

  const handleChooseFile = async () => {
    if (!isNativeRuntime()) {
      return;
    }
    setPicking(true);
    setError(null);
    try {
      applySelectedFile(await pickPortfolioDocument());
    } catch (err: unknown) {
      setError(extractApiErrorMessage(err, 'Could not open that file. Please try again.'));
      setSelectedFile(null);
    } finally {
      setPicking(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setError(null);

      const parsedData = await parsePortfolioDocument(selectedFile);

      storeParsedPortfolioDraft(parsedData);

      // Proceed to portfolio review page
      await updateUserSetupProgress({ current_setup_step: 6 });
      navigate('/user/setup/portfolio-review');
    } catch (err: unknown) {
      setError(extractApiErrorMessage(err, 'We could not read that document. Please try again.'));
      setUploading(false);
    }
  };

  const handleSkip = async () => {
    try {
      setUploading(true);
      await updateUserSetupProgress({ setup_completed: true });
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(extractApiErrorMessage(err, 'Failed to proceed to the dashboard.'));
    } finally {
      setUploading(false);
    }
  };

  const handleBack = async () => {
    try {
      await updateUserSetupProgress({ current_setup_step: 1 });
      navigate('/user/setup/personal-info');
    } catch {
      navigate('/user/setup/personal-info');
    }
  };

  return (
    <Container component="main" maxWidth={false} sx={setupPageContainerSx}>
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
          title="Build your portfolio"
          description="Upload an existing resume or CV and Yarba will extract your experience, skills, and projects. This step is optional—you can build or import a portfolio later."
        />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ my: 4 }}>
          {isNativeRuntime() ? (
            <UploadBox
              role="button"
              tabIndex={0}
              aria-label="Choose a PDF or DOCX file"
              onClick={() => {
                if (!isBusy) {
                  void handleChooseFile();
                }
              }}
              onKeyDown={(event) => {
                if (isBusy) {
                  return;
                }
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  void handleChooseFile();
                }
              }}
            >
              {picking ? (
                <CircularProgress sx={{ mb: 1 }} />
              ) : (
                <CloudUploadIcon fontSize="large" color="primary" sx={{ mb: 1 }} />
              )}
              <Typography variant="h6" gutterBottom>
                {picking ? 'Opening your files…' : 'Tap to choose a PDF or DOCX'}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                }}
              >
                Accepted formats: PDF, DOCX. Maximum size 10 MB.
              </Typography>
              <Button variant="contained" disabled={isBusy} sx={{ mt: 2, minHeight: 44 }}>
                {picking ? 'Opening…' : 'Choose file'}
              </Button>
            </UploadBox>
          ) : (
            <>
              <HiddenInput
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                id="file-upload"
                type="file"
                onChange={handleFileSelect}
                disabled={isBusy}
              />
              <label htmlFor="file-upload">
                <UploadBox
                  onDragOver={isCompactUpload ? undefined : handleDragOver}
                  onDrop={isCompactUpload ? undefined : handleDrop}
                >
                  <CloudUploadIcon fontSize="large" color="primary" sx={{ mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    {isCompactUpload
                      ? 'Tap to choose a PDF or DOCX'
                      : 'Drag and drop or click to upload'}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                    }}
                  >
                    Accepted formats: PDF, DOCX. Maximum size 10 MB.
                  </Typography>
                  <Button
                    variant="contained"
                    component="span"
                    disabled={isBusy}
                    sx={{ mt: 2, minHeight: 44 }}
                  >
                    Choose file
                  </Button>
                </UploadBox>
              </label>
            </>
          )}
        </Box>

        {selectedFile && (
          <Box sx={{ mb: 4, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FileIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body1" sx={{ flexGrow: 1 }}>
                {selectedFile.name}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                }}
              >
                {(selectedFile.size / 1024).toFixed(0)} KB
              </Typography>
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        <Box sx={setupActionBarSx}>
          <Button variant="outlined" onClick={handleBack} disabled={isBusy}>
            Back
          </Button>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 1.5,
            }}
          >
            <Button variant="outlined" onClick={handleSkip} disabled={isBusy}>
              Skip for now
            </Button>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={!selectedFile || isBusy}
              startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {uploading ? 'Reading document…' : 'Upload & Continue'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default PortfolioUploadPage;
