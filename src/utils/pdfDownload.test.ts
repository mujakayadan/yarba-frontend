import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  native: false,
  writeFile: vi.fn(async () => ({ uri: 'file:///cache/resume.pdf' })),
  share: vi.fn(async () => ({ activityType: 'test' })),
}));

vi.mock('../platform/nativeRuntime', () => ({
  isNativeRuntime: () => mocks.native,
  getNativePlatform: () => (mocks.native ? 'android' : 'web'),
}));

vi.mock('@capacitor/filesystem', () => ({
  Directory: { Cache: 'CACHE' },
  Filesystem: {
    writeFile: mocks.writeFile,
  },
}));

vi.mock('@capacitor/share', () => ({
  Share: {
    share: mocks.share,
  },
}));

import {
  exportPdfBlob,
  isPdfUrlResponse,
  isShareCanceled,
  pdfExportActionLabel,
  resolvePdfBlob,
  sanitizePdfFilename,
} from './pdfDownload';

describe('pdfDownload', () => {
  beforeEach(() => {
    mocks.native = false;
    mocks.writeFile.mockClear();
    mocks.share.mockClear();
    mocks.writeFile.mockResolvedValue({ uri: 'file:///cache/resume.pdf' });
    mocks.share.mockResolvedValue({ activityType: 'test' });
    document.body.innerHTML = '';
  });

  it('sanitizes filenames for native filesystems', () => {
    expect(sanitizePdfFilename('My Resume: v1')).toBe('My Resume_ v1.pdf');
    expect(sanitizePdfFilename('cover/letter')).toBe('cover_letter.pdf');
  });

  it('uses Download labels on web and Share labels on native', () => {
    expect(pdfExportActionLabel()).toBe('Download PDF');
    mocks.native = true;
    expect(pdfExportActionLabel()).toBe('Share PDF');
    expect(pdfExportActionLabel(true)).toBe('Share');
  });

  it('resolves a generated blob without a second download', async () => {
    const blob = new Blob(['%PDF'], { type: 'application/pdf' });
    const download = vi.fn(async () => new Blob());
    await expect(resolvePdfBlob(blob, download)).resolves.toBe(blob);
    expect(download).not.toHaveBeenCalled();
  });

  it('downloads through the API when generation returns a URL', async () => {
    const blob = new Blob(['%PDF-1.4'], { type: 'application/pdf' });
    const download = vi.fn(async () => blob);
    await expect(
      resolvePdfBlob({ pdf_url: 'https://cdn.example/file.pdf' }, download)
    ).resolves.toBe(blob);
    expect(isPdfUrlResponse({ pdf_url: 'https://cdn.example/file.pdf' })).toBe(true);
    expect(download).toHaveBeenCalledTimes(1);
  });

  it('downloads with an anchor on web', async () => {
    const click = vi.fn();
    const originalCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreate(tag);
      if (tag === 'a') {
        el.click = click;
      }
      return el;
    });

    await exportPdfBlob(new Blob(['%PDF'], { type: 'application/pdf' }), 'Resume.pdf');
    expect(click).toHaveBeenCalledTimes(1);
    expect(mocks.share).not.toHaveBeenCalled();
  });

  it('writes to cache and opens the share sheet on native', async () => {
    mocks.native = true;
    const blob = new Blob(['%PDF-1.4'], { type: 'application/pdf' });
    await exportPdfBlob(blob, 'Resume.pdf');

    expect(mocks.writeFile).toHaveBeenCalledWith(
      expect.objectContaining({
        path: 'yarba-pdfs/Resume.pdf',
        directory: 'CACHE',
        recursive: true,
      })
    );
    expect(mocks.share).toHaveBeenCalledWith({
      title: 'Resume.pdf',
      files: ['file:///cache/resume.pdf'],
      dialogTitle: 'Share PDF',
    });
  });

  it('ignores a canceled native share sheet', async () => {
    mocks.native = true;
    mocks.share.mockRejectedValue(new Error('Share canceled'));
    await expect(
      exportPdfBlob(new Blob(['%PDF'], { type: 'application/pdf' }), 'Resume.pdf')
    ).resolves.toBeUndefined();
    expect(isShareCanceled(new Error('Share canceled'))).toBe(true);
  });
});
