import React, { useState, useCallback } from 'react';
import { parsePortfolioDocument } from '../../services/portfolioService';
import { ParsedPortfolioData } from '../../types/portfolio';
import { ParsedPortfolioDisplay } from '../../components/portfolio/parsed_data_display';
import { Button, Box, CircularProgress, Alert, Paper, Typography, Stack } from '@mui/material';
import { pickPortfolioDocument } from '../../platform/nativeFilePicker';
import { isNativeRuntime } from '../../platform/nativeRuntime';
import { extractApiErrorMessage } from '../../utils/apiErrors';
import { validateDocumentFile } from '../../utils/uploadFiles';

const UploadPortfolioPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedPortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
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
    setParsedData(null);
    setError(null);
    setIsConfirmed(false);
  };

  const handleNativePick = async () => {
    setError(null);
    try {
      const file = await pickPortfolioDocument();
      if (!file) {
        return;
      }
      setSelectedFile(file);
      setParsedData(null);
      setIsConfirmed(false);
    } catch (err: unknown) {
      setError(extractApiErrorMessage(err, 'Could not open that file. Please try again.'));
    }
  };

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!selectedFile) {
        setError('Please select a file to upload.');
        return;
      }

      setIsLoading(true);
      setError(null);
      setParsedData(null);
      setIsConfirmed(false);

      try {
        const data = await parsePortfolioDocument(selectedFile);
        setParsedData(data);
      } catch (err: unknown) {
        setError(extractApiErrorMessage(err, 'Failed to parse document. Please try again.'));
      } finally {
        setIsLoading(false);
      }
    },
    [selectedFile]
  );

  const handleConfirm = () => {
    setIsConfirmed(true);
    console.log('Data confirmed by user:', parsedData);
    alert('Data confirmed! (Next steps would be implemented here)');
  };

  const handleReUpload = () => {
    setSelectedFile(null);
    setParsedData(null);
    setError(null);
    setIsConfirmed(false);
    const fileInput = document.getElementById('portfolio-file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, m: { xs: 1, sm: 2 } }} elevation={3}>
      <Typography variant="h4" component="h1" gutterBottom>
        Upload & Parse Portfolio
      </Typography>

      {!parsedData && (
        <form onSubmit={handleSubmit}>
          <Typography
            sx={{
              marginBottom: '16px',
            }}
          >
            Upload a PDF or DOCX file up to 10 MB. We will parse it and you can review the extracted
            information.
          </Typography>
          <Box sx={{ mb: 2 }}>
            {isNativeRuntime() ? (
              <Button
                variant="outlined"
                onClick={() => void handleNativePick()}
                disabled={isLoading}
              >
                Choose file
              </Button>
            ) : (
              <input
                id="portfolio-file-input"
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
                disabled={isLoading}
                style={{ display: 'block', marginBottom: '10px' }}
              />
            )}
            {selectedFile ? (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {selectedFile.name}
              </Typography>
            ) : null}
          </Box>
          <Button type="submit" variant="contained" disabled={isLoading || !selectedFile}>
            {isLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Parse Document'}
          </Button>
        </form>
      )}

      {isLoading && !parsedData && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 3 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Parsing your document...</Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {parsedData && !isConfirmed && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Review Parsed Information
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            Please review the information extracted from your document. If it looks correct, confirm
            it. Otherwise, you can re-upload the document or a different one.
          </Alert>

          <ParsedPortfolioDisplay portfolioData={parsedData} />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleConfirm}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Confirm Information is Correct
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleReUpload}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Re-upload / Discard
            </Button>
          </Stack>
        </Box>
      )}

      {isConfirmed && parsedData && (
        <Box sx={{ mt: 3 }}>
          <Alert severity="success">
            Thank you for confirming! The data is now ready for the next step (e.g., creating or
            updating your portfolio).
          </Alert>
          <ParsedPortfolioDisplay portfolioData={parsedData} />
        </Box>
      )}
    </Paper>
  );
};

export default UploadPortfolioPage;
