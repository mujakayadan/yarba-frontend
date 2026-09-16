let workerConfigured = false;

export async function ensurePdfWorkerConfigured(): Promise<void> {
  if (workerConfigured) {
    return;
  }

  const [{ pdfjs }, { default: workerUrl }] = await Promise.all([
    import('react-pdf'),
    import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
  ]);

  pdfjs.GlobalWorkerOptions.workerSrc = new URL(workerUrl, window.location.href).toString();
  workerConfigured = true;
}
