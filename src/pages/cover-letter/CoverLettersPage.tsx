import React, { useState, useEffect, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
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
  Stack,
  Chip,
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
  Close as CloseIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  deleteCoverLetter,
  downloadCoverLetterPdf,
  getCoverLetterPdf,
} from '../../services/coverLetterService';
import { CoverLetter } from '../../types/models';
import { PdfPreviewDialog } from '../../components/common';
import { useToast } from '../../contexts/ToastContext';
import { usePdfPreview } from '../../hooks/usePdfPreview';
import { getResumeById } from '../../services/resumeService';
import { useCoverLetters } from '../../hooks/useCoverLetters';
import { coverLetterKeys } from '../../lib/queryKeys';
import { queryClient } from '../../providers/QueryProvider';
import { triggerBlobDownload } from '../../utils/pdfDownload';

// Define page size options
const PAGE_SIZE_OPTIONS = [10, 25, 50];
const DEFAULT_PAGE_SIZE = 10;

// Set up the worker for PDF.js
const CoverLettersPage: React.FC = () => {
  const navigate = useNavigate();
  const { showError } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCoverLetterId, setSelectedCoverLetterId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCoverLetter, setDeletingCoverLetter] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const pdfPreview = usePdfPreview();
  const [selectedCoverLetterName, setSelectedCoverLetterName] = useState<string>('');
  const [resumeTitles, setResumeTitles] = useState<Record<string, string>>({});

  const getCoverLetterTitle = (coverLetter: CoverLetter) => {
    const resumeTitle = resumeTitles[coverLetter.resume_id];
    if (resumeTitle) {
      return resumeTitle;
    }
    return `Cover Letter (${coverLetter.resume_id.substring(0, 8)})`;
  };

  const listParams = useMemo(
    () => ({
      skip: (page - 1) * pageSize,
      limit: pageSize,
      sort_by: 'updated_desc',
    }),
    [page, pageSize]
  );

  const { data: coverLettersData, isLoading, isFetching } = useCoverLetters(listParams);

  const coverLetters = useMemo(() => {
    const items = coverLettersData?.items ?? [];
    if (!searchTerm) {
      return items;
    }
    return items.filter((cl) =>
      getCoverLetterTitle(cl).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [coverLettersData?.items, searchTerm, resumeTitles]);

  const totalCoverLetters = coverLettersData?.total ?? 0;
  const loading = isLoading || isFetching;

  const deleteCoverLetterMutation = useMutation({
    mutationFn: deleteCoverLetter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coverLetterKeys.all });
    },
  });

  useEffect(() => {
    const fetchResumeTitles = async () => {
      const items = coverLettersData?.items ?? [];
      const resumeIds = items.map((cl) => cl.resume_id);
      const uniqueResumeIds = Array.from(new Set(resumeIds));

      const newResumeTitles: Record<string, string> = {};

      await Promise.all(
        uniqueResumeIds.map(async (resumeId) => {
          try {
            const resume = await getResumeById(resumeId);
            newResumeTitles[resumeId] = resume.title;
          } catch (error) {
            console.error(`Failed to fetch resume title for ID ${resumeId}:`, error);
            newResumeTitles[resumeId] = `Resume (${resumeId.substring(0, 8)})`;
          }
        })
      );

      setResumeTitles(newResumeTitles);
    };

    if ((coverLettersData?.items ?? []).length > 0) {
      fetchResumeTitles();
    }
  }, [coverLettersData?.items]);

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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, coverLetterId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedCoverLetterId(coverLetterId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCreateCoverLetter = () => {
    navigate('/cover-letters/new');
  };

  const handleViewCoverLetter = (coverLetterId: string) => {
    navigate(`/cover-letters/${coverLetterId}`);
    handleMenuClose();
  };

  const handleEditCoverLetter = (coverLetterId: string) => {
    navigate(`/cover-letters/${coverLetterId}/edit`);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCoverLetterId) return;

    setDeletingCoverLetter(true);
    try {
      await deleteCoverLetterMutation.mutateAsync(selectedCoverLetterId);

      const newTotalCount = totalCoverLetters - 1;
      const totalPages = Math.ceil(newTotalCount / pageSize);

      if (page > totalPages && totalPages > 0) {
        setPage(totalPages);
      }
    } catch (error: any) {
      console.error('Failed to delete cover letter:', error);
      // Display error message to the user
      let errorMsg = 'Failed to delete cover letter';
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
      setDeletingCoverLetter(false);
      setDeleteDialogOpen(false);
      handleMenuClose();
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    handleMenuClose();
  };

  const handleDuplicateCoverLetter = (coverLetterId: string) => {
    // Future implementation for duplicating cover letters
    handleMenuClose();
  };

  const handleDownloadPdf = async (coverLetterId: string) => {
    setGeneratingPdf(true);
    try {
      const blob = await downloadCoverLetterPdf(coverLetterId);
      const coverLetter = coverLetters.find((cl) => cl.id === coverLetterId);
      const filename = coverLetter
        ? `${getCoverLetterTitle(coverLetter)}.pdf`
        : `cover-letter-${coverLetterId}.pdf`;
      triggerBlobDownload(blob, filename);
    } catch (error: any) {
      console.error('Failed to download PDF:', error);
      let errorMsg = 'Failed to generate PDF';
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
      setGeneratingPdf(false);
      handleMenuClose();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleViewPdf = async (coverLetterId: string) => {
    setGeneratingPdf(true);
    try {
      const coverLetter = coverLetters.find((cl) => cl.id === coverLetterId);

      // Store cover letter name for the dialog title
      if (coverLetter) {
        setSelectedCoverLetterName(getCoverLetterTitle(coverLetter));
      }

      const pdfResponse = await getCoverLetterPdf(coverLetterId);

      // Fetch the PDF from the URL
      const response = await fetch(pdfResponse.pdf_url);
      const blob = await response.blob();
      pdfPreview.openPreviewFromBlob(blob);
      setSelectedCoverLetterId(coverLetterId);
    } catch (error: any) {
      console.error('Failed to generate PDF:', error);
      let errorMsg = 'Failed to generate PDF';
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
      setGeneratingPdf(false);
      handleMenuClose();
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'right',
          alignItems: 'center',
          flexWrap: 'wrap',
          mb: 4,
          gap: 2,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateCoverLetter}
          sx={{
            borderRadius: 2,
            py: 1,
            px: 2,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Create New Cover Letter
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search cover letters..."
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
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : coverLetters.length === 0 ? (
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 2,
            backgroundColor: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
            No cover letters found
          </Typography>
          {searchTerm ? (
            <Typography variant="body1" sx={{ mb: 3 }}>
              Try changing your search criteria or clear the search field.
            </Typography>
          ) : (
            <Typography variant="body1" sx={{ mb: 3 }}>
              Create your first cover letter to get started!
            </Typography>
          )}
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateCoverLetter}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Create New Cover Letter
          </Button>
        </Paper>
      ) : (
        <>
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              mb: 3,
            }}
          >
            <Table sx={{ minWidth: 650 }} aria-label="cover letters table">
              <TableHead sx={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      color: 'text.primary',
                      fontSize: '0.875rem',
                    }}
                  >
                    Title
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
                {coverLetters.map((coverLetter) => (
                  <TableRow
                    key={coverLetter.id}
                    hover
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      transition: 'background-color 0.2s ease',
                      '&:hover': { backgroundColor: 'rgba(0,0,0,0.01)' },
                    }}
                    onClick={() => handleViewCoverLetter(coverLetter.id)}
                  >
                    <TableCell component="th" scope="row" sx={{ cursor: 'pointer' }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 500,
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        {getCoverLetterTitle(coverLetter)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(coverLetter.updated_at)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                      <ButtonGroup size="small" variant="outlined">
                        <Tooltip title="View" placement="top" TransitionProps={{ timeout: 0 }}>
                          <Button onClick={() => handleViewCoverLetter(coverLetter.id)}>
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
                            onClick={() => handleViewPdf(coverLetter.id)}
                            disabled={generatingPdf}
                          >
                            {generatingPdf && !pdfPreview.open ? 'Loading...' : 'See PDF'}
                          </Button>
                        </Tooltip>
                        <Tooltip title="Delete" placement="top" TransitionProps={{ timeout: 0 }}>
                          <Button
                            onClick={() => {
                              setSelectedCoverLetterId(coverLetter.id);
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
                          <Button onClick={(e) => handleMenuOpen(e, coverLetter.id)}>
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
                {totalCoverLetters === 0
                  ? 'No results'
                  : `Showing ${(page - 1) * pageSize + 1} to ${Math.min(page * pageSize, totalCoverLetters)} of ${totalCoverLetters} cover letter${totalCoverLetters !== 1 ? 's' : ''}`}
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
              count={Math.max(1, Math.ceil(totalCoverLetters / pageSize))}
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

      {/* Menu for more options */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        keepMounted
        elevation={3}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem
          onClick={() => selectedCoverLetterId && handleViewCoverLetter(selectedCoverLetterId)}
        >
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          View
        </MenuItem>
        <MenuItem
          onClick={() => selectedCoverLetterId && handleEditCoverLetter(selectedCoverLetterId)}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => selectedCoverLetterId && handleDuplicateCoverLetter(selectedCoverLetterId)}
        >
          <ListItemIcon>
            <FileCopyIcon fontSize="small" />
          </ListItemIcon>
          Duplicate
        </MenuItem>
        <MenuItem onClick={() => selectedCoverLetterId && handleViewPdf(selectedCoverLetterId)}>
          <ListItemIcon>
            <PdfIcon fontSize="small" />
          </ListItemIcon>
          See PDF
        </MenuItem>
        <MenuItem onClick={() => selectedCoverLetterId && handleDownloadPdf(selectedCoverLetterId)}>
          <ListItemIcon>
            <PdfIcon fontSize="small" />
          </ListItemIcon>
          Download PDF
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this cover letter? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleDeleteCancel} color="primary" disabled={deletingCoverLetter}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            autoFocus
            disabled={deletingCoverLetter}
            startIcon={deletingCoverLetter && <CircularProgress size={20} color="inherit" />}
          >
            {deletingCoverLetter ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <PdfPreviewDialog
        open={pdfPreview.open}
        title={`${selectedCoverLetterName || 'Cover Letter'} PDF Preview`}
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
          pdfPreview.pdfUrl && selectedCoverLetterId ? (
            <Button
              variant="contained"
              startIcon={<PdfIcon />}
              onClick={() => handleDownloadPdf(selectedCoverLetterId)}
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

export default CoverLettersPage;
