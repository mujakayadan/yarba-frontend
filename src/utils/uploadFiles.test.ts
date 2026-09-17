import { describe, expect, it } from 'vitest';
import {
  DOCUMENT_MAX_BYTES,
  IMAGE_MAX_BYTES,
  isDocumentFile,
  isImageFile,
  validateDocumentFile,
  validateImageFile,
} from './uploadFiles';

describe('uploadFiles', () => {
  it('accepts PDF and DOCX documents by mime or extension', () => {
    expect(isDocumentFile({ name: 'resume.pdf', type: 'application/pdf' })).toBe(true);
    expect(
      isDocumentFile({
        name: 'cv.docx',
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })
    ).toBe(true);
    expect(isDocumentFile({ name: 'notes.pdf', type: '' })).toBe(true);
    expect(isDocumentFile({ name: 'photo.png', type: 'image/png' })).toBe(false);
  });

  it('rejects empty, oversized, and unsupported documents', () => {
    expect(validateDocumentFile({ name: 'resume.pdf', type: 'application/pdf', size: 1200 })).toBe(
      null
    );
    expect(validateDocumentFile({ name: 'notes.txt', type: 'text/plain', size: 12 })).toBe(
      'Please choose a PDF or DOCX file.'
    );
    expect(validateDocumentFile({ name: 'empty.pdf', type: 'application/pdf', size: 0 })).toBe(
      'That file is empty. Please choose another one.'
    );
    expect(
      validateDocumentFile({
        name: 'huge.pdf',
        type: 'application/pdf',
        size: DOCUMENT_MAX_BYTES + 1,
      })
    ).toBe('That file is larger than 10 MB. Please choose a smaller PDF or DOCX.');
  });

  it('accepts common image types and enforces the 5 MB cap', () => {
    expect(isImageFile({ name: 'avatar.jpg', type: 'image/jpeg' })).toBe(true);
    expect(isImageFile({ name: 'avatar.PNG', type: '' })).toBe(true);
    expect(validateImageFile({ name: 'avatar.jpg', type: 'image/jpeg', size: 2048 })).toBe(null);
    expect(validateImageFile({ name: 'resume.pdf', type: 'application/pdf', size: 2048 })).toBe(
      'Please choose a JPG, PNG, WEBP, or GIF image.'
    );
    expect(
      validateImageFile({
        name: 'huge.png',
        type: 'image/png',
        size: IMAGE_MAX_BYTES + 1,
      })
    ).toBe('That image is larger than 5 MB. Please choose a smaller photo.');
  });
});
