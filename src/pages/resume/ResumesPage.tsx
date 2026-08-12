import React, { useState, useEffect, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Pagination,
  Divider,
  Paper,
  Tooltip,
  Alert,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ButtonGroup,
  ListItemIcon,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  FileCopy as FileCopyIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  deleteResume,
  downloadResumePdf,
  getResumePdf,
  updateResume,
} from '../../services/resumeService';
import { Portfolio } from '../../types/models';
import { PdfPreviewDialog } from '../../components/common';
import { useToast } from '../../contexts/ToastContext';
import { usePdfPreview } from '../../hooks/usePdfPreview';
import { useResumes } from '../../hooks/useResumes';
import { useUserPortfolio } from '../../hooks/usePortfolio';
import { resumeKeys } from '../../lib/queryKeys';
import { queryClient } from '../../providers/QueryProvider';
import { triggerBlobDownload } from '../../utils/pdfDownload';
import { ViewPageHeader } from '../../components/common/ViewPageHeader';
import { EmptyState } from '../../components/common/EmptyState';

// Type for the PDF response from the server
interface PdfResponse {
  pdf_url: string;
}

// Type guard to check if response is PdfResponse
const isPdfResponse = (response: any): response is PdfResponse => {
  return response && typeof response.pdf_url === 'string';
};

// Type guard to check if response is Blob
const isBlob = (response: any): response is Blob => {
  return response instanceof Blob;
};

// Set up the worker for PDF.js
// Define the API Resume interface
interface APIResume {
  id: string;
  title: string;
  template_id: string;
  user_id: string;
  profile_id: string;
  portfolio_id: string;
  job_title: string;
  company_name: string;
  job_description: string;
  content: {
    personal_information: {
      full_name: string;
      email: string;
      phone: string;
      address: string;
      linkedin: string;
      github: string;
      website: string;
    };
    career_summary: string;
    skills: string;
    work_experience: string;
    education: string;
    projects: string;
    awards: any[];
    publications: any[];
  };
  created_at: string;
  updated_at: string;
}

// Define page size options
const PAGE_SIZE_OPTIONS = [10, 25, 50];
const DEFAULT_PAGE_SIZE = 10;

const ResumesPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingResume, setDeletingResume] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [portfolioDialogOpen, setPortfolioDialogOpen] = useState(false);
  const [availablePortfolios, setAvailablePortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>('');
  const [updatingResume, setUpdatingResume] = useState(false);
  const pdfPreview = usePdfPreview();
  const [selectedResumeName, setSelectedResumeName] = useState<string>('');

  const listParams = useMemo(
    () => ({
      skip: (page - 1) * pageSize,
      limit: pageSize,
      search_term: debouncedSearchTerm || undefined,
      sort_by: 'updated_desc',
    }),
    [page, pageSize, debouncedSearchTerm]
  );

  const { data: resumesData, isLoading, isFetching } = useResumes(listParams);
  const resumes = (resumesData?.items ?? []) as unknown as APIResume[];
  const totalResumes = resumesData?.total ?? 0;
  const loading = isLoading || isFetching;

  const deleteResumeMutation = useMutation({
    mutationFn: deleteResume,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resumeKeys.all });
    },
  });

  const { data: userPortfolio, isLoading: loadingPortfolios } = useUserPortfolio();

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page when search changes
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo(0, 0); // Scroll to top when changing pages
  };

  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    const newPageSize = event.target.value as number;
    // Calculate what page we should be on to show same items when possible
    const firstItemIndex = (page - 1) * pageSize;
    const newPage = Math.floor(firstItemIndex / newPageSize) + 1;
    setPageSize(newPageSize);
    setPage(newPage);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, resumeId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedResumeId(resumeId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCreateResume = () => {
    navigate('/resumes/new');
  };

  const handleViewResume = (resumeId: string) => {
    navigate(`/resumes/${resumeId}`);
    handleMenuClose();
  };

  const handleEditResume = (resumeId: string) => {
    navigate(`/resumes/${resumeId}/edit`);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedResumeId) return;

    setDeletingResume(true);
    try {
      await deleteResumeMutation.mutateAsync(selectedResumeId);

      const newTotalCount = totalResumes - 1;
      const totalPages = Math.ceil(newTotalCount / pageSize);

      if (page > totalPages && totalPages > 0) {
        setPage(totalPages);
      }
    } catch (error: any) {
      console.error('Failed to delete resume:', error);
      // Display error message to the user
      let errorMsg = 'Failed to delete resume';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMsg = error.response.data;
        } else if (error.response.data.detail) {
          errorMsg = error.response.data.detail;
        }
      } else if (error.message) {
        errorMsg = error.message;
      }
      showError(errorMsg);
    } finally {
      setDeletingResume(false);
      setDeleteDialogOpen(false);
      handleMenuClose();
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    handleMenuClose();
  };

  const handleDuplicateResume = (resumeId: string) => {
    // This would need to call a backend API to duplicate the resume
    handleMenuClose();
  };

  const handleOpenPortfolioDialog = (resumeId: string) => {
    setSelectedResumeId(resumeId);
    setPortfolioDialogOpen(true);

    if (userPortfolio) {
      setAvailablePortfolios([userPortfolio]);
      setSelectedPortfolioId(userPortfolio._id);
    } else {
      setAvailablePortfolios([]);
      showError('Failed to load available portfolio');
    }
  };

  const handlePortfolioChange = (event: SelectChangeEvent) => {
    setSelectedPortfolioId(event.target.value);
  };

  const handleUpdateResumePortfolio = async () => {
    if (!selectedResumeId || !selectedPortfolioId) return;

    setUpdatingResume(true);
    try {
      await updateResume(selectedResumeId, { portfolio_id: selectedPortfolioId });

      queryClient.invalidateQueries({ queryKey: resumeKeys.all });

      showSuccess('Resume successfully updated with new portfolio');
    } catch (error) {
      console.error('Failed to update resume:', error);
      showError('Failed to update resume with new portfolio');
    } finally {
      setUpdatingResume(false);
      setPortfolioDialogOpen(false);
    }
  };

  const handleViewPdf = async (resumeId: string) => {
    setGeneratingPdf(true);
    try {
      // Log the resume details before requesting PDF
      const resume = resumes.find((r) => r.id === resumeId);

      // Check if portfolio_id exists and is valid
      if (!resume?.portfolio_id) {
        showError(
          'This resume has no associated portfolio. Please update the resume with a valid portfolio first.'
        );
        handleOpenPortfolioDialog(resumeId);
        return;
      }

      // Store resume name for the dialog title
      if (resume) {
        setSelectedResumeName(resume.title);
      }

      const response = await getResumePdf(resumeId);

      if (isPdfResponse(response)) {
        pdfPreview.openPreviewFromUrl(response.pdf_url);
      } else if (isBlob(response)) {
        pdfPreview.openPreviewFromBlob(response);
      } else {
        throw new Error('Unexpected response format from PDF service');
      }

      setSelectedResumeId(resumeId);
    } catch (error: any) {
      console.error('Failed to load PDF:', error);

      let errorMsg = 'Failed to load PDF';
      if (error.response?.data instanceof Blob) {
        try {
          const errorText = await error.response.data.text();
          errorMsg = errorText || errorMsg;
        } catch (blobError) {
          // If we can't read the blob as text, use the default message
        }
      } else if (error.message) {
        errorMsg = error.message;
      }

      showError(errorMsg);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleDownloadPdf = async (resumeId: string) => {
    setGeneratingPdf(true);
    try {
      // Log the resume details before requesting PDF
      const resume = resumes.find((r) => r.id === resumeId);

      // Check if portfolio_id exists and is valid
      if (!resume?.portfolio_id) {
        showError(
          'This resume has no associated portfolio. Please update the resume with a valid portfolio first.'
        );
        handleOpenPortfolioDialog(resumeId);
        return;
      }

      const blob = await downloadResumePdf(resumeId);
      const filename = resume ? `${resume.title}.pdf` : `resume-${resumeId}.pdf`;
      triggerBlobDownload(blob, filename);
    } catch (error: any) {
      console.error('Failed to download PDF:', error);
      // Extract and display the error message
      let errorMsg = 'Failed to download PDF';
      if (error.response?.data) {
        // If error response has data as blob, try to read it
        if (error.response.data instanceof Blob) {
          try {
            const errorText = await error.response.data.text();
            console.error('Blob error message:', errorText);

            // Check for portfolio not found error
            if (errorText.includes('Portfolio with ID') && errorText.includes('not found')) {
              errorMsg =
                'The portfolio associated with this resume could not be found. Please update the resume with a valid portfolio.';

              // Offer to attach a valid portfolio
              handleOpenPortfolioDialog(resumeId);
            } else {
              errorMsg = errorText;
            }
          } catch (blobError) {
            // If we can't read the blob, use error.message
            errorMsg = error.message || errorMsg;
          }
        } else {
          // Handle regular JSON error response
          const errorData = error.response.data;
          if (typeof errorData === 'string') {
            errorMsg = errorData;
          } else if (errorData.detail) {
            errorMsg = errorData.detail;
          } else if (error.message) {
            errorMsg = error.message;
          }
        }
      } else if (error.message) {
        errorMsg = error.message;
      }

      // Show specific message for common errors
      if (errorMsg.includes('Portfolio with ID') && errorMsg.includes('not found')) {
        errorMsg =
          'The portfolio associated with this resume could not be found. Please update the resume with a valid portfolio.';

        // Offer to attach a valid portfolio
        handleOpenPortfolioDialog(resumeId);
      }

      showError(errorMsg);
    } finally {
      setGeneratingPdf(false);
      handleMenuClose();
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format underscored text to capitalized format
  const formatUnderscoredText = (text: string | undefined | null): string => {
    if (!text) return '-';

    return text
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Extract job title from career summary
  const getJobTitle = (resume: APIResume) => {
    try {
      if (resume.job_title) return resume.job_title;

      if (resume.content?.career_summary) {
        const summary = JSON.parse(resume.content.career_summary);
        return summary.job_title || '';
      }
    } catch (e) {
      return '';
    }
    return '';
  };

  // Calculate pagination metadata
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalResumes);
  return (
    <Box sx={{ width: '100%', p: 3, pl: 2, pt: 2 }}>
      <ViewPageHeader
        title="Resumes"
        description="Create role-specific resumes from your portfolio, then edit, preview, and export them."
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateResume}
          >
            Create resume
          </Button>
        }
      />

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search resumes..."
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 0 }}
        />
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : resumes.length === 0 ? (
        <EmptyState
          title={searchTerm ? 'No matching resumes' : 'Create your first tailored resume'}
          description={
            searchTerm
              ? 'Try a different search term or clear the search field.'
              : 'Paste a job description and Yarba will tailor your portfolio to the role.'
          }
          primaryAction={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={searchTerm ? () => setSearchTerm('') : handleCreateResume}
            >
              {searchTerm ? 'Clear search' : 'Create resume'}
            </Button>
          }
        />
      ) : (
        <>
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table sx={{ minWidth: 650 }} aria-label="resumes table">
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      color: 'text.primary',
                      fontSize: '0.875rem',
                    }}
                  >
                    Company
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      color: 'text.primary',
                      fontSize: '0.875rem',
                    }}
                  >
                    Position
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      color: 'text.primary',
                      fontSize: '0.875rem',
                    }}
                  >
                    Last Updated
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      color: 'text.primary',
                      fontSize: '0.875rem',
                      textAlign: 'center',
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {resumes.map((resume) => (
                  <TableRow
                    key={resume.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        cursor: 'pointer',
                      },
                      height: '72px',
                    }}
                    onClick={() => handleViewResume(resume.id)}
                  >
                    <TableCell>{formatUnderscoredText(resume.company_name)}</TableCell>
                    <TableCell>{formatUnderscoredText(getJobTitle(resume))}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(resume.updated_at)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                      <ButtonGroup size="small" variant="outlined">
                        <Tooltip title="View" placement="top" TransitionProps={{ timeout: 0 }}>
                          <Button onClick={() => handleViewResume(resume.id)}>
                            <VisibilityIcon fontSize="small" />
                          </Button>
                        </Tooltip>
                        <Tooltip title="See PDF" placement="top" TransitionProps={{ timeout: 0 }}>
                          <Button
                            variant="outlined"
                            startIcon={
                              generatingPdf && !pdfPreview.open ? (
                                <CircularProgress size={16} />
                              ) : (
                                <PdfIcon />
                              )
                            }
                            onClick={() => handleViewPdf(resume.id)}
                            disabled={generatingPdf}
                          >
                            {generatingPdf && !pdfPreview.open ? 'Loading...' : 'See PDF'}
                          </Button>
                        </Tooltip>
                        <Tooltip title="Delete" placement="top" TransitionProps={{ timeout: 0 }}>
                          <Button
                            onClick={() => {
                              setSelectedResumeId(resume.id);
                              setDeleteDialogOpen(true);
                            }}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </Button>
                        </Tooltip>
                        <Tooltip
                          title="More options"
                          placement="top"
                          TransitionProps={{ timeout: 0 }}
                        >
                          <Button onClick={(e) => handleMenuOpen(e, resume.id)}>
                            <MoreVertIcon fontSize="small" />
                          </Button>
                        </Tooltip>
                      </ButtonGroup>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              flexWrap: 'wrap',
              gap: 2,
              mb: 4,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {totalResumes === 0
                  ? 'No results'
                  : `Showing ${startItem}-${endItem} of ${totalResumes} resume${totalResumes !== 1 ? 's' : ''}`}
              </Typography>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="page-size-select-label">Page Size</InputLabel>
                <Select
                  labelId="page-size-select-label"
                  id="page-size-select"
                  value={pageSize}
                  label="Page Size"
                  onChange={handlePageSizeChange}
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <MenuItem key={size} value={size}>
                      {size} per page
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Pagination
              count={Math.max(1, Math.ceil(totalResumes / pageSize))}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
              sx={{
                '& .MuiPaginationItem-root': {
                  fontSize: '1rem',
                },
              }}
            />
          </Box>
        </>
      )}

      {/* Resume Actions Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => selectedResumeId && handleViewResume(selectedResumeId)}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          </ListItemIcon>
          View
        </MenuItem>
        <MenuItem onClick={() => selectedResumeId && handleEditResume(selectedResumeId)}>
          <ListItemIcon>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
          </ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem onClick={() => selectedResumeId && handleViewPdf(selectedResumeId)}>
          <ListItemIcon>
            <PdfIcon fontSize="small" sx={{ mr: 1 }} />
          </ListItemIcon>
          See PDF
        </MenuItem>
        <MenuItem onClick={() => selectedResumeId && handleDownloadPdf(selectedResumeId)}>
          <ListItemIcon>
            <PdfIcon fontSize="small" sx={{ mr: 1 }} />
          </ListItemIcon>
          Download PDF
        </MenuItem>
        <MenuItem onClick={() => selectedResumeId && handleDuplicateResume(selectedResumeId)}>
          <ListItemIcon>
            <FileCopyIcon fontSize="small" sx={{ mr: 1 }} />
          </ListItemIcon>
          Duplicate
        </MenuItem>
        <MenuItem onClick={() => selectedResumeId && handleOpenPortfolioDialog(selectedResumeId)}>
          <ListItemIcon>
            <LinkIcon fontSize="small" sx={{ mr: 1 }} />
          </ListItemIcon>
          Attach Portfolio
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Resume</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this resume? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deletingResume}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            disabled={deletingResume}
            startIcon={deletingResume ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {deletingResume ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Portfolio Selection Dialog */}
      <Dialog
        open={portfolioDialogOpen}
        onClose={() => setPortfolioDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Attach Portfolio to Resume</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Select a portfolio to attach to this resume. This is required for PDF access.
          </DialogContentText>

          {loadingPortfolios ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : availablePortfolios.length === 0 ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              You don't have any portfolios. Please create a portfolio first.
            </Alert>
          ) : (
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel id="portfolio-select-label">Portfolio</InputLabel>
              <Select
                labelId="portfolio-select-label"
                value={selectedPortfolioId}
                onChange={handlePortfolioChange}
                label="Portfolio"
              >
                {availablePortfolios.map((portfolio) => {
                  // Make sure _id exists
                  if (!portfolio._id) return null;
                  return (
                    <MenuItem key={portfolio._id} value={portfolio._id}>
                      Portfolio {portfolio._id.substring(0, 8)}...
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPortfolioDialogOpen(false)} disabled={updatingResume}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateResumePortfolio}
            disabled={updatingResume || availablePortfolios.length === 0}
            variant="contained"
            color="primary"
            startIcon={updatingResume ? <CircularProgress size={16} /> : null}
          >
            {updatingResume ? 'Updating...' : 'Update Resume'}
          </Button>
        </DialogActions>
      </Dialog>

      <PdfPreviewDialog
        open={pdfPreview.open}
        title={`${selectedResumeName || 'Resume'} PDF Preview`}
        pdfUrl={pdfPreview.pdfUrl}
        pageNumber={pdfPreview.pageNumber}
        numPages={pdfPreview.numPages}
        onClose={pdfPreview.closePreview}
        onDocumentLoadSuccess={pdfPreview.onDocumentLoadSuccess}
        onPrevious={pdfPreview.previousPage}
        onNext={pdfPreview.nextPage}
        onLoadError={(error) => {
          showError(error.message);
        }}
        footerActions={
          pdfPreview.pdfUrl && selectedResumeId ? (
            <Button
              variant="contained"
              startIcon={<PdfIcon />}
              onClick={() => handleDownloadPdf(selectedResumeId)}
              size="small"
            >
              Download
            </Button>
          ) : undefined
        }
      />
    </Box>
  );
};

export default ResumesPage;
