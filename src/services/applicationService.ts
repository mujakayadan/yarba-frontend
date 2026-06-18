import api from './api';
import type { JobApplication, PaginatedJobApplications } from '../types/application';

export type ApplicationListParams = {
  skip?: number;
  limit?: number;
  status?: string;
};

export const listApplications = async (
  params: ApplicationListParams = {}
): Promise<PaginatedJobApplications> => {
  const { skip = 0, limit = 20, status } = params;
  const searchParams = new URLSearchParams({
    skip: String(skip),
    limit: String(limit),
  });
  if (status) {
    searchParams.set('status', status);
  }
  const response = await api.get(`/applications?${searchParams.toString()}`);
  return response.data;
};

export const getApplication = async (applicationId: string): Promise<JobApplication> => {
  const response = await api.get(`/applications/${applicationId}`);
  return response.data;
};
