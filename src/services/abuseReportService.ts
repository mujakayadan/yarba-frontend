import api from './api';
import type { AbuseReportRequest, AbuseReportResponse } from '../types/models';

export const submitAbuseReport = async (
  request: AbuseReportRequest
): Promise<AbuseReportResponse> => {
  const response = await api.post<AbuseReportResponse>('/public/portfolio/reports', request);
  return response.data;
};
