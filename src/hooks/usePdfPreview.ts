import { useCallback, useEffect, useState } from 'react';

const revokeIfBlobUrl = (url: string | null) => {
  if (url?.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};

export const usePdfPreview = () => {
  const [open, setOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      revokeIfBlobUrl(pdfUrl);
    };
  }, [pdfUrl]);

  const openPreviewFromUrl = useCallback((url: string) => {
    setPdfUrl(url);
    setPageNumber(1);
    setNumPages(null);
    setOpen(true);
  }, []);

  const openPreviewFromBlob = useCallback((blob: Blob) => {
    const url = URL.createObjectURL(blob);
    setPdfUrl(url);
    setPageNumber(1);
    setNumPages(null);
    setOpen(true);
  }, []);

  const closePreview = useCallback(() => {
    setOpen(false);
    setPageNumber(1);
    setNumPages(null);
    setPdfUrl((currentUrl) => {
      revokeIfBlobUrl(currentUrl);
      return null;
    });
  }, []);

  const onDocumentLoadSuccess = useCallback(({ numPages: totalPages }: { numPages: number }) => {
    setNumPages(totalPages);
    setPageNumber(1);
  }, []);

  const previousPage = useCallback(() => {
    setPageNumber((current) => Math.max(1, current - 1));
  }, []);

  const nextPage = useCallback(() => {
    setPageNumber((current) => (numPages ? Math.min(numPages, current + 1) : current + 1));
  }, [numPages]);

  return {
    open,
    pdfUrl,
    pageNumber,
    numPages,
    openPreviewFromUrl,
    openPreviewFromBlob,
    closePreview,
    onDocumentLoadSuccess,
    previousPage,
    nextPage,
  };
};
