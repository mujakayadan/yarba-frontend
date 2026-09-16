import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Close as CloseIcon } from '@mui/icons-material';
import { ensurePdfWorkerConfigured } from '../../utils/pdfConfig';
import { SAFE_AREA } from '../../theme/safeArea';

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
  pageWidth,
  footerActions,
}) => {
  const theme = useTheme();
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));
  const [reactPdf, setReactPdf] = useState<ReactPdfModule | null>(null);
  const [viewerError, setViewerError] = useState<string | null>(null);

  const computedWidth = useMemo(() => {
    if (pageWidth) {
      return pageWidth;
    }
    const inset = isPhone ? 32 : 96;
    return Math.min(Math.max(window.innerWidth - inset, 240), 800);
  }, [isPhone, pageWidth]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;
    setViewerError(null);

    const loadPdfPreview = async () => {
      try {
        await ensurePdfWorkerConfigured();
        const module = await import('react-pdf');
        if (!cancelled) {
          setReactPdf(module);
        }
      } catch {
        if (!cancelled) {
          setViewerError('PDF preview could not load. Try downloading the file instead.');
        }
      }
    };

    void loadPdfPreview();

    return () => {
      cancelled = true;
    };
  }, [open, pdfUrl]);

  const Document = reactPdf?.Document;
  const Page = reactPdf?.Page;

  const handleDocumentError = (error: Error) => {
    setViewerError('This PDF could not be displayed. Try sharing or downloading it instead.');
    onLoadError?.(error);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isPhone}
      maxWidth="lg"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            height: isPhone ? '100%' : '90vh',
            maxHeight: isPhone ? '100%' : '90vh',
            display: 'flex',
            flexDirection: 'column',
            pt: isPhone ? SAFE_AREA.top : 0,
            pb: isPhone ? SAFE_AREA.bottom : 0,
          },
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
        sx={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {viewerError ? (
          <Alert severity="error" sx={{ width: '100%' }}>
            {viewerError}
          </Alert>
        ) : pdfUrl && Document && Page ? (
          <Box sx={{ border: '1px solid black', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={handleDocumentError}
              loading={<CircularProgress />}
              error={<Typography color="error">Failed to load PDF</Typography>}
            >
              <Page
                pageNumber={pageNumber}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                width={computedWidth}
              />
            </Document>
          </Box>
        ) : (
          <CircularProgress />
        )}
      </DialogContent>

      <DialogActions
        sx={{ justifyContent: 'space-between', px: 3, py: 2, flexWrap: 'wrap', gap: 1 }}
      >
        <Typography variant="body2">
          {numPages ? `Page ${pageNumber} of ${numPages}` : 'Loading pages...'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            onClick={onPrevious}
            disabled={pageNumber <= 1 || !numPages}
            variant="outlined"
            size="small"
          >
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
