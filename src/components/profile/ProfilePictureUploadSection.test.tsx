import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  native: false,
  pickProfileImage: vi.fn(),
  onUpload: vi.fn(),
  onError: vi.fn(),
}));

vi.mock('../../config/env', () => ({
  env: { cloudfrontUrl: 'https://cdn.example/' },
}));

vi.mock('../../platform/nativeRuntime', () => ({
  isNativeRuntime: () => mocks.native,
}));

vi.mock('../../platform/nativeFilePicker', () => ({
  pickProfileImage: mocks.pickProfileImage,
}));

import { ProfilePictureUploadSection } from './ProfilePictureUploadSection';

describe('ProfilePictureUploadSection', () => {
  beforeEach(() => {
    mocks.native = false;
    mocks.pickProfileImage.mockReset();
    mocks.onUpload.mockReset();
    mocks.onError.mockReset();
  });

  it('keeps the hidden file input on web', () => {
    render(
      <ProfilePictureUploadSection
        imageVersion={1}
        onUpload={mocks.onUpload}
        onRemove={vi.fn()}
        onError={mocks.onError}
      />
    );

    expect(document.querySelector('input[type="file"]')).toBeInTheDocument();
  });

  it('opens the native photo picker instead of the file input', async () => {
    mocks.native = true;
    mocks.pickProfileImage.mockResolvedValue(
      new File(['avatar'], 'avatar.png', { type: 'image/png' })
    );
    const user = userEvent.setup();

    render(
      <ProfilePictureUploadSection
        imageVersion={1}
        onUpload={mocks.onUpload}
        onRemove={vi.fn()}
        onError={mocks.onError}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Upload Picture' }));

    expect(mocks.pickProfileImage).toHaveBeenCalledTimes(1);
    expect(mocks.onUpload).toHaveBeenCalledTimes(1);
    expect(mocks.onUpload.mock.calls[0][0].name).toBe('avatar.png');
  });
});
