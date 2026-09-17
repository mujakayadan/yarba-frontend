import { Capacitor } from '@capacitor/core';
import { FilePicker, type PickedFile } from '@capawesome/capacitor-file-picker';
import { Filesystem } from '@capacitor/filesystem';
import { isNativeRuntime } from './nativeRuntime';
import { validateDocumentFile, validateImageFile } from '../utils/uploadFiles';

export class FilePickCanceledError extends Error {
  constructor() {
    super('File pick canceled');
    this.name = 'FilePickCanceledError';
  }
}

export const isFilePickCanceled = (error: unknown): boolean => {
  if (error instanceof FilePickCanceledError) {
    return true;
  }
  if (!(error instanceof Error)) {
    return false;
  }
  const message = error.message.toLowerCase();
  return message.includes('cancel') || message.includes('dismiss');
};

const base64ToFile = (base64: string, name: string, type: string): File => {
  const binary = atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new File([buffer], name, { type });
};

const toBrowserFile = async (picked: PickedFile): Promise<File> => {
  const type = picked.mimeType || 'application/octet-stream';

  if (picked.blob) {
    return new File([picked.blob], picked.name, { type: picked.blob.type || type });
  }

  if (picked.path) {
    try {
      const result = await Filesystem.readFile({ path: picked.path });
      if (typeof result.data === 'string' && result.data.length > 0) {
        return base64ToFile(result.data, picked.name, type);
      }
    } catch {
      if (Capacitor.convertFileSrc) {
        const response = await fetch(Capacitor.convertFileSrc(picked.path));
        if (response.ok) {
          const blob = await response.blob();
          return new File([blob], picked.name, { type: blob.type || type });
        }
      }
    }
  }

  throw new Error('Could not read that file. Please choose another one.');
};

const firstPickedFile = (files: PickedFile[]): PickedFile | null => files[0] ?? null;

export const pickPortfolioDocument = async (): Promise<File | null> => {
  if (!isNativeRuntime()) {
    return null;
  }

  try {
    const result = await FilePicker.pickFiles({
      types: [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
      limit: 1,
    });
    const picked = firstPickedFile(result.files);
    if (!picked) {
      return null;
    }
    const file = await toBrowserFile(picked);
    const error = validateDocumentFile(file);
    if (error) {
      throw new Error(error);
    }
    return file;
  } catch (error) {
    if (isFilePickCanceled(error)) {
      return null;
    }
    throw error;
  }
};

export const pickProfileImage = async (): Promise<File | null> => {
  if (!isNativeRuntime()) {
    return null;
  }

  try {
    const result = await FilePicker.pickImages({
      limit: 1,
      skipTranscoding: false,
    });
    const picked = firstPickedFile(result.files);
    if (!picked) {
      return null;
    }
    const file = await toBrowserFile(picked);
    const error = validateImageFile(file);
    if (error) {
      throw new Error(error);
    }
    return file;
  } catch (error) {
    if (isFilePickCanceled(error)) {
      return null;
    }
    throw error;
  }
};
