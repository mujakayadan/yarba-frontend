import React, { ReactNode, useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { ensurePdfWorkerConfigured } from '../../utils/pdfConfig';

interface PdfPreviewDialogProps {
  open: boolean;
  title: string;
  pdfUrl: string | null;
  pageNumber: number;
  numPages: number | null;
  onClose: () => void;
  onDocumentLoadSuccess: (payload: { numPages: number }) => void;
  onPrevious: () => void;
  onNext: () => void;
  onLoadError?: (error: Error) => void;
  pageWidth?: number;
  footerActions?: ReactNode;
}

type ReactPdfModule = typeof import('react-pdf');

export const PdfPreviewDialog: React.FC<PdfPreviewDialogProps> = ({
  open,
  title,
  pdfUrl,
  pageNumber,
  numPages,
  onClose,
  onDocumentLoadSuccess,
  onPrevious,
  onNext,
  onLoadError,
  pageWidth = Math.min(window.innerWidth * 0.8, 800),
  footerActions,
}) => {
  const [reactPdf, setReactPdf] = useState<ReactPdfModule | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    const loadPdfPreview = async () => {
      try {
        await ensurePdfWorkerConfigured();
        const module = await import('react-pdf');
        if (!cancelled) {
          setReactPdf(module);
        }
      } catch {
        // Pdf viewer failed to load; spinner remains visible.
      }
    };

    void loadPdfPreview();

    return () => {
      cancelled = true;
    };
  }, [open]);

  const Document = reactPdf?.Document;
  const Page = reactPdf?.Page;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">{title}</Typography>
        <IconButton onClick={onClose} size="small" aria-label="Close PDF preview">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        {pdfUrl && Document && Page ? (
          <Box sx={{ border: '1px solid black', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onLoadError}
              loading={<CircularProgress />}
              error={<Typography color="error">Failed to load PDF</Typography>}
            >
              <Page
                pageNumber={pageNumber}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                width={pageWidth}
              />
            </Document>
          </Box>
        ) : (
          <CircularProgress />
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', px: 3, py: 2 }}>
        <Typography variant="body2">
          {numPages ? `Page ${pageNumber} of ${numPages}` : 'Loading pages...'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button onClick={onPrevious} disabled={pageNumber <= 1 || !numPages} variant="outlined" size="small">
            Previous
          </Button>
          <Button
            onClick={onNext}
            disabled={!numPages || pageNumber >= numPages}
            variant="outlined"
            size="small"
          >
            Next
          </Button>
          {footerActions}
        </Box>
      </DialogActions>
    </Dialog>
  );
};
