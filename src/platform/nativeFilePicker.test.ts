import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  native: true,
  pickFiles: vi.fn(),
  pickImages: vi.fn(),
  readFile: vi.fn(),
}));

vi.mock('./nativeRuntime', () => ({
  isNativeRuntime: () => mocks.native,
}));

vi.mock('@capawesome/capacitor-file-picker', () => ({
  FilePicker: {
    pickFiles: mocks.pickFiles,
    pickImages: mocks.pickImages,
  },
}));

vi.mock('@capacitor/filesystem', () => ({
  Filesystem: {
    readFile: mocks.readFile,
  },
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    convertFileSrc: (path: string) => path,
  },
}));

import { isFilePickCanceled, pickPortfolioDocument, pickProfileImage } from './nativeFilePicker';

describe('nativeFilePicker', () => {
  beforeEach(() => {
    mocks.native = true;
    mocks.pickFiles.mockReset();
    mocks.pickImages.mockReset();
    mocks.readFile.mockReset();
  });

  it('treats cancel and dismiss errors as a canceled pick', () => {
    expect(isFilePickCanceled(new Error('pickFiles canceled.'))).toBe(true);
    expect(isFilePickCanceled(new Error('User dismissed the picker'))).toBe(true);
    expect(isFilePickCanceled(new Error('Could not read that file'))).toBe(false);
  });

  it('returns null when the document picker is canceled', async () => {
    mocks.pickFiles.mockRejectedValue(new Error('pickFiles canceled.'));
    await expect(pickPortfolioDocument()).resolves.toBeNull();
  });

  it('converts a native document path into a File', async () => {
    mocks.pickFiles.mockResolvedValue({
      files: [
        {
          name: 'resume.pdf',
          mimeType: 'application/pdf',
          path: 'file:///cache/resume.pdf',
          size: 4,
        },
      ],
    });
    mocks.readFile.mockResolvedValue({ data: btoa('%PDF') });

    const file = await pickPortfolioDocument();
    expect(file).toBeInstanceOf(File);
    expect(file?.name).toBe('resume.pdf');
    expect(file?.type).toBe('application/pdf');
  });

  it('rejects unsupported images after the gallery returns', async () => {
    mocks.pickImages.mockResolvedValue({
      files: [
        {
          name: 'clip.mp4',
          mimeType: 'video/mp4',
          blob: new Blob(['video'], { type: 'video/mp4' }),
          size: 12,
        },
      ],
    });

    await expect(pickProfileImage()).rejects.toThrow(
      'Please choose a JPG, PNG, WEBP, or GIF image.'
    );
  });

  it('does not open a native picker on web', async () => {
    mocks.native = false;
    await expect(pickPortfolioDocument()).resolves.toBeNull();
    await expect(pickProfileImage()).resolves.toBeNull();
    expect(mocks.pickFiles).not.toHaveBeenCalled();
    expect(mocks.pickImages).not.toHaveBeenCalled();
  });
});
