export const DOCUMENT_MAX_BYTES = 10 * 1024 * 1024;
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

const DOCUMENT_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
]);

const fileExtension = (name: string): string => {
  const dot = name.lastIndexOf('.');
  return dot >= 0 ? name.slice(dot).toLowerCase() : '';
};

export const isDocumentFile = (file: Pick<File, 'name' | 'type'>): boolean => {
  const extension = fileExtension(file.name);
  return DOCUMENT_MIME_TYPES.has(file.type) || extension === '.pdf' || extension === '.docx';
};

export const isImageFile = (file: Pick<File, 'name' | 'type'>): boolean => {
  const extension = fileExtension(file.name);
  return (
    file.type.startsWith('image/') ||
    IMAGE_MIME_TYPES.has(file.type) ||
    ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic', '.heif'].includes(extension)
  );
};

export const validateDocumentFile = (file: Pick<File, 'name' | 'type' | 'size'>): string | null => {
  if (!isDocumentFile(file)) {
    return 'Please choose a PDF or DOCX file.';
  }
  if (file.size <= 0) {
    return 'That file is empty. Please choose another one.';
  }
  if (file.size > DOCUMENT_MAX_BYTES) {
    return 'That file is larger than 10 MB. Please choose a smaller PDF or DOCX.';
  }
  return null;
};

export const validateImageFile = (file: Pick<File, 'name' | 'type' | 'size'>): string | null => {
  if (!isImageFile(file)) {
    return 'Please choose a JPG, PNG, WEBP, or GIF image.';
  }
  if (file.size <= 0) {
    return 'That image is empty. Please choose another one.';
  }
  if (file.size > IMAGE_MAX_BYTES) {
    return 'That image is larger than 5 MB. Please choose a smaller photo.';
  }
  return null;
};
