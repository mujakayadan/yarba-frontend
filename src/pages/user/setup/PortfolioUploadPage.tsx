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
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, InsertDriveFile as FileIcon } from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { parsePortfolioDocument } from '../../../services/portfolioService';
import { extractApiErrorMessage } from '../../../utils/apiErrors';
import { SetupStepHeader } from '../../../components/user/setup/SetupStepHeader';

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      // Check if file is PDF or DOCX
      const fileType = file.type;
      if (
        fileType === 'application/pdf' ||
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('Please upload a PDF or DOCX file.');
        setSelectedFile(null);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      const file = event.dataTransfer.files[0];
      // Check if file is PDF or DOCX
      const fileType = file.type;
      if (
        fileType === 'application/pdf' ||
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('Please upload a PDF or DOCX file.');
        setSelectedFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setError(null);

      const parsedData = await parsePortfolioDocument(selectedFile);

      // Store parsed data in localStorage for the review page
      localStorage.setItem('parsedPortfolioData', JSON.stringify(parsedData));

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
          title="Build your portfolio"
          description="Upload an existing resume or CV and Yarba will extract your experience, skills, and projects. This step is optional—you can build or import a portfolio later."
        />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ my: 4 }}>
          <HiddenInput
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            id="file-upload"
            type="file"
            onChange={handleFileSelect}
          />
          <label htmlFor="file-upload">
            <UploadBox onDragOver={handleDragOver} onDrop={handleDrop}>
              <CloudUploadIcon fontSize="large" color="primary" sx={{ mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                Drag & Drop or Click to Upload
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Accepted formats: PDF, DOCX
              </Typography>
              <Button variant="contained" component="span" sx={{ mt: 2 }}>
                Browse Files
              </Button>
            </UploadBox>
          </label>
        </Box>

        {selectedFile && (
          <Box sx={{ mb: 4, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FileIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body1" sx={{ flexGrow: 1 }}>
                {selectedFile.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {(selectedFile.size / 1024).toFixed(0)} KB
              </Typography>
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button variant="outlined" onClick={handleBack} disabled={uploading}>
            Back
          </Button>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" onClick={handleSkip} disabled={uploading}>
              Skip for now
            </Button>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {uploading ? 'Uploading...' : 'Upload & Continue'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default PortfolioUploadPage;
