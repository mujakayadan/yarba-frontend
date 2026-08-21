import api from './api';
import type {
  AccountDeletionRequest,
  AccountDeletionStatus,
  AccountExportStatus,
} from '../types/models';

export const getAccountExportStatus = async (): Promise<AccountExportStatus> => {
  const response = await api.get<AccountExportStatus>('/account/exports/latest');
  return response.data;
};

export const requestAccountExport = async (): Promise<AccountExportStatus> => {
  const response = await api.post<AccountExportStatus>('/account/exports');
  return response.data;
};

export const getAccountDeletionStatus = async (): Promise<AccountDeletionStatus> => {
  const response = await api.get<AccountDeletionStatus>('/account/deletion');
  return response.data;
};

export const requestAccountDeletion = async (
  request: AccountDeletionRequest
): Promise<AccountDeletionStatus> => {
  const response = await api.post<AccountDeletionStatus>('/account/deletion', request);
  return response.data;
};

export const cancelAccountDeletion = async (): Promise<AccountDeletionStatus> => {
  const response = await api.delete<AccountDeletionStatus>('/account/deletion');
  return response.data;
};
