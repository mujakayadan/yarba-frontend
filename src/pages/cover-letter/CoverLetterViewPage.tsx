import Grid from '../../mui/Grid';
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { env } from '../../config/env';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Divider, Button, CircularProgress, Chip, Stack, Alert, Breadcrumbs, Link as MuiLink, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton } from '@mui/material';
import {
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  PictureAsPdf as PdfIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { getCoverLetterPdf, deleteCoverLetter } from '../../services/coverLetterService';
import { CoverLetter } from '../../types/models';
import { PdfPreviewDialog } from '../../components/common/PdfPreviewDialog';
import { usePdfPreview } from '../../hooks/usePdfPreview';
import { useCoverLetter } from '../../hooks/useCoverLetter';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useResume } from '../../hooks/useResume';
import { coverLetterKeys } from '../../lib/queryKeys';
import { queryClient } from '../../providers/QueryProvider';

const CoverLetterViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    data: coverLetter,
    isLoading: loading,
    isError,
    error: coverLetterError,
  } = useCoverLetter(id);
  const {
    data: profileData,
    isLoading: profileLoading,
    isError: profileIsError,
    error: profileQueryError,
  } = useUserProfile();
  const { data: resumeData } = useResume(coverLetter?.resume_id);

  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCoverLetter, setDeletingCoverLetter] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const pdfPreview = usePdfPreview();

  const error =
    isError && coverLetterError
      ? coverLetterError instanceof Error
        ? coverLetterError.message
        : 'Failed to fetch cover letter details'
      : null;

  const profileError =
    profileIsError && profileQueryError
      ? profileQueryError instanceof Error
        ? profileQueryError.message
        : 'Failed to load profile data.'
      : null;

  const resumeTitle = resumeData?.title ?? '';
  const coverLetterTitle = coverLetter
    ? resumeTitle || `Cover Letter (${coverLetter.resume_id.substring(0, 8)})`
    : '';

  const deleteMutation = useMutation({
    mutationFn: deleteCoverLetter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coverLetterKeys.all });
    },
  });

  const handleEdit = () => {
    if (id) {
      navigate(`/cover-letters/${id}/edit`);
    }
  };

  const handleBack = () => {
    navigate('/cover-letters');
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!id) return;

    setDeletingCoverLetter(true);
    setDeleteError(null);
    try {
      await deleteMutation.mutateAsync(id);
      navigate('/cover-letters');
    } catch (err: unknown) {
      console.error('Failed to delete cover letter:', err);
      setDeleteError('Failed to delete cover letter. Please try again.');
      setDeleteDialogOpen(false);
    } finally {
      setDeletingCoverLetter(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleViewPdf = async () => {
    if (!id || !coverLetter) return;
    
    setGeneratingPdf(true);
    try {
      const pdfResponse = await getCoverLetterPdf(id);
      
      // Fetch the PDF from the URL
      const response = await fetch(pdfResponse.pdf_url);
      const blob = await response.blob();
      pdfPreview.openPreviewFromBlob(blob);
    } catch (err: any) {
      console.error('Failed to generate PDF:', err);
      setPdfError('Failed to generate PDF. Please try again.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!id || !coverLetter) return;

    setGeneratingPdf(true);
    try {
      const pdfResponse = await getCoverLetterPdf(id);
      const filename = coverLetterTitle ? `${coverLetterTitle}.pdf` : `cover-letter-${id}.pdf`;

      const link = document.createElement('a');
      link.href = pdfResponse.pdf_url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err: any) {
      console.error('Failed to download PDF:', err);
      setPdfError('Failed to download PDF. Please try again.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Back to Cover Letters
        </Button>
      </Box>
    );
  }

  if (!coverLetter) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Cover letter not found.</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Back to Cover Letters
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Navigation breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <MuiLink 
          underline="hover" 
          color="inherit" 
          onClick={handleBack}
          sx={{ cursor: 'pointer' }}
        >
          Cover Letters
        </MuiLink>
        <Typography color="text.primary">{coverLetterTitle}</Typography>
      </Breadcrumbs>
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        mb: 3,
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2
      }}>
        <Box sx={{ maxWidth: { xs: '100%', md: '60%' } }}>
          {/* Removed H4 title and Chips stack in previous step */}
          {/* Remove Last Updated Typography */}
          {/* 
          <Typography variant="body2" color="text.secondary">
            Last updated: {formatDate(coverLetter.updated_at)}
          </Typography>
          */}
        </Box>
        
        <Stack 
          direction="row" 
          spacing={1}
          sx={{ 
            flexWrap: 'wrap', 
            gap: 1,
            width: { xs: '100%', md: 'auto' },
            justifyContent: { xs: 'flex-start', md: 'flex-end' }
          }}
        >
          {/* Add Back button similar to ViewResumePage */}
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />} 
            onClick={handleBack}
            size="small"
          >
            Back
          </Button>
          <Button
            startIcon={<PdfIcon />}
            variant="outlined"
            onClick={handleViewPdf}
            disabled={generatingPdf}
          >
            View PDF
          </Button>
          <Button
            startIcon={<PdfIcon />}
            variant="contained"
            onClick={handleDownloadPdf}
            disabled={generatingPdf}
          >
            Download PDF
          </Button>
          <Button
            startIcon={<EditIcon />}
            onClick={handleEdit}
            variant="outlined"
          >
            Edit
          </Button>
          <Button
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            variant="outlined"
            color="error"
          >
            Delete
          </Button>
        </Stack>
      </Box>
      
      {/* Cover Letter Content */}
      <Box sx={{ width: '100%' }}>
        {/* Cover Letter Details */}
        <Paper elevation={0} sx={{ mb: 3, p: 2, backgroundColor: '#f9f9f9' }}>
          <Typography variant="h6" component="div" gutterBottom color="primary">
            Cover Letter Details
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle2" color="text.secondary">Template</Typography>
              <Typography variant="body2">{coverLetter.template_id}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle2" color="text.secondary">Created</Typography>
              <Typography variant="body2">{formatDate(coverLetter.created_at)}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle2" color="text.secondary">Updated</Typography>
              <Typography variant="body2">{formatDate(coverLetter.updated_at)}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle2" color="text.secondary">Resume ID</Typography>
              <Typography variant="body2">{coverLetter.resume_id}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle2" color="text.secondary">Has PDF</Typography> 
              {/* Reverted to check has_pdf */}
              <Typography variant="body2">{coverLetter.has_pdf ? 'Yes' : 'No'}</Typography>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Cover Letter Content */}
        <Paper elevation={0} sx={{ mb: 3, p: 2, backgroundColor: '#f9f9f9' }}>
          <Typography variant="h6" component="div" gutterBottom color="primary">
            Cover Letter Content
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          {/* Cover Letter Content - Re-applying visual structure */}
          {coverLetter.content && typeof coverLetter.content === 'string' ? (
            <Paper elevation={0} sx={{ 
              p: { xs: 3, sm: 5 }, 
              backgroundColor: '#fcfcfc',
              backgroundImage: 'linear-gradient(to bottom, #f9f9f9, #fcfcfc 15%)',
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              fontFamily: '"Georgia", serif',
              lineHeight: 1.6,
              maxWidth: '800px',
              margin: '0 auto',
              position: 'relative',
            }}>
              {/* Personal Information Header - Use profileData now */}
              {profileLoading ? (
                <Box sx={{ textAlign: 'center', my: 2}}><CircularProgress size={20} /></Box>
              ) : profileError ? (
                <Alert severity="warning" sx={{ mb: 2 }}>Error loading profile data: {profileError}</Alert>
              ) : profileData?.personal_information ? (
                <Box sx={{ mb: 4, textAlign: 'center', borderBottom: '1px solid #eee', pb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, mb: 1, color: '#333'}}>
                    {profileData.personal_information.full_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {profileData.personal_information.email && `${profileData.personal_information.email}`}
                    {profileData.personal_information.phone && ` | ${profileData.personal_information.phone}`}
                    {profileData.personal_information.website && (
                      <> | <MuiLink href={profileData.personal_information.website} target="_blank" rel="noopener noreferrer" color="inherit">Website</MuiLink></>
                    )}
                    {profileData.personal_information.linkedin && (
                      <> | <MuiLink href={profileData.personal_information.linkedin} target="_blank" rel="noopener noreferrer" color="inherit">LinkedIn</MuiLink></>
                    )}
                    {profileData.personal_information.github && (
                      <> | <MuiLink href={profileData.personal_information.github} target="_blank" rel="noopener noreferrer" color="inherit">GitHub</MuiLink></>
                    )}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ mb: 4, textAlign: 'center', borderBottom: '1px solid #eee', pb: 3 }}>
                   <Typography variant="body2" color="text.secondary">Personal information not available.</Typography>
                </Box>
              )}
              
              {/* Cover Letter Body */}
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 5, fontSize: '1.02rem', color: '#222', textAlign: 'justify' }}>
                {coverLetter.content}
              </Typography>
              
              {/* Closing and Signature */}
              <Box sx={{ mt: 6 }}>
                <Typography variant="body1" sx={{ mb: 4, fontStyle: 'normal', fontSize: '1.02rem' }}>
                  Sincerely,
                </Typography>
                {/* Signature Image */}
                <Box sx={{ height: 60, mb: 1 }}>
                  {profileData?.signature_key && (
                    <img 
                      // Prepend CloudFront URL and use signature_key
                      src={`${env.cloudfrontUrl}${profileData.signature_key}`}
                      alt="Signature" 
                      style={{ maxHeight: '60px', maxWidth: '200px' }} 
                    />
                  )}
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 500, borderTop: '1px solid #eaeaea', pt: 1, display: 'inline-block', fontSize: '1.02rem' }}>
                  {/* Get name from profileData state */}
                  {profileData?.personal_information?.full_name || ''}
                </Typography>
                {/* Date - MOVED HERE, aligned to the left under the name by default */}
                <Box sx={{ mt: 1 }}> 
                  <Typography sx={{ color: '#555', fontSize: '0.9rem' }}>
                    {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No content is available or content is not in the expected format. Generate or edit the cover letter to add content.
            </Typography>
          )}
        </Paper>
      </Box>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this cover letter? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary" disabled={deletingCoverLetter}>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" disabled={deletingCoverLetter}>
            {deletingCoverLetter ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <PdfPreviewDialog
        open={pdfPreview.open}
        title={coverLetterTitle}
        pdfUrl={pdfPreview.pdfUrl}
        pageNumber={pdfPreview.pageNumber}
        numPages={pdfPreview.numPages}
        onClose={pdfPreview.closePreview}
        onDocumentLoadSuccess={pdfPreview.onDocumentLoadSuccess}
        onPrevious={pdfPreview.previousPage}
        onNext={pdfPreview.nextPage}
        pageWidth={550}
        footerActions={
          <Button
            startIcon={<PdfIcon />}
            variant="contained"
            onClick={handleDownloadPdf}
            disabled={generatingPdf}
            size="small"
          >
            Download PDF
          </Button>
        }
      />
    </Box>
  );
};

export default CoverLetterViewPage; 