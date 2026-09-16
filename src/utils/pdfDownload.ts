import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { isNativeRuntime } from '../platform/nativeRuntime';

export const PDF_CACHE_DIR = 'yarba-pdfs';

export type PdfUrlResponse = { pdf_url: string };
export type PdfGenerateResult = Blob | PdfUrlResponse;

export const isPdfUrlResponse = (value: unknown): value is PdfUrlResponse =>
  typeof value === 'object' &&
  value !== null &&
  'pdf_url' in value &&
  typeof (value as PdfUrlResponse).pdf_url === 'string' &&
  (value as PdfUrlResponse).pdf_url.length > 0;

export const sanitizePdfFilename = (filename: string): string => {
  const trimmed = filename.trim() || 'document.pdf';
  const withExt = trimmed.toLowerCase().endsWith('.pdf') ? trimmed : `${trimmed}.pdf`;
  return [...withExt]
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code < 32 || '<>:"/\\|?*'.includes(char)) {
        return '_';
      }
      return char;
    })
    .join('')
    .slice(0, 120);
};

export const pdfExportActionLabel = (short = false): string => {
  if (isNativeRuntime()) {
    return short ? 'Share' : 'Share PDF';
  }
  return short ? 'Download' : 'Download PDF';
};

export const isShareCanceled = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false;
  }
  const message = error.message.toLowerCase();
  return message.includes('cancel') || message.includes('dismiss');
};

export const resolvePdfBlob = async (
  generated: PdfGenerateResult,
  download: () => Promise<Blob>
): Promise<Blob> => {
  if (generated instanceof Blob) {
    if (generated.size === 0) {
      throw new Error('The PDF was empty. Please try generating it again.');
    }
    return generated;
  }

  if (isPdfUrlResponse(generated)) {
    const blob = await download();
    if (!(blob instanceof Blob) || blob.size === 0) {
      throw new Error('The PDF was empty. Please try generating it again.');
    }
    return blob;
  }

  throw new Error('Unexpected PDF response. Please try generating it again.');
};

const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Could not encode the PDF for sharing.'));
        return;
      }
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () =>
      reject(reader.error ?? new Error('Could not encode the PDF for sharing.'));
    reader.readAsDataURL(blob);
  });

export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function exportPdfBlob(blob: Blob, filename: string): Promise<void> {
  if (!(blob instanceof Blob) || blob.size === 0) {
    throw new Error('The PDF was empty. Please try generating it again.');
  }

  const safeName = sanitizePdfFilename(filename);

  if (!isNativeRuntime()) {
    triggerBlobDownload(blob, safeName);
    return;
  }

  const base64 = await blobToBase64(blob);
  const written = await Filesystem.writeFile({
    path: `${PDF_CACHE_DIR}/${safeName}`,
    data: base64,
    directory: Directory.Cache,
    recursive: true,
  });

  try {
    await Share.share({
      title: safeName,
      files: [written.uri],
      dialogTitle: 'Share PDF',
    });
  } catch (error) {
    if (isShareCanceled(error)) {
      return;
    }
    throw error;
  }
}
