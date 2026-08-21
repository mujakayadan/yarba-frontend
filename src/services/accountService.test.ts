import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('./api', () => ({
  default: {
    get: mocks.get,
    post: mocks.post,
    delete: mocks.delete,
  },
}));

import {
  cancelAccountDeletion,
  getAccountDeletionStatus,
  getAccountExportStatus,
  requestAccountDeletion,
  requestAccountExport,
} from './accountService';

describe('accountService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses the account data-rights endpoints', async () => {
    mocks.get.mockResolvedValue({ data: { status: 'not_requested', can_cancel: false } });
    mocks.post.mockResolvedValue({ data: { status: 'pending', can_cancel: true } });
    mocks.delete.mockResolvedValue({ data: { status: 'cancelled', can_cancel: false } });

    await getAccountExportStatus();
    await requestAccountExport();
    await getAccountDeletionStatus();
    await requestAccountDeletion({ confirmation: 'DELETE', current_password: 'password' });
    await cancelAccountDeletion();

    expect(mocks.get).toHaveBeenNthCalledWith(1, '/account/exports/latest');
    expect(mocks.post).toHaveBeenNthCalledWith(1, '/account/exports');
    expect(mocks.get).toHaveBeenNthCalledWith(2, '/account/deletion');
    expect(mocks.post).toHaveBeenNthCalledWith(2, '/account/deletion', {
      confirmation: 'DELETE',
      current_password: 'password',
    });
    expect(mocks.delete).toHaveBeenCalledWith('/account/deletion');
  });
});
