import api from './api';
import { LEGAL_VERSION } from '../content/legalDocuments';
import type {
  LegalAcceptanceRequest,
  LegalAcceptanceStatus,
  LegalAcceptanceSurface,
} from '../types/models';

export const buildLegalAcceptance = (
  acceptanceSurface: LegalAcceptanceSurface
): LegalAcceptanceRequest => ({
  terms_version: LEGAL_VERSION,
  acceptable_use_version: LEGAL_VERSION,
  privacy_version: LEGAL_VERSION,
  ai_data_use_version: LEGAL_VERSION,
  terms_accepted: true,
  acceptable_use_accepted: true,
  privacy_acknowledged: true,
  ai_data_use_acknowledged: true,
  minimum_age_confirmed: true,
  acceptance_surface: acceptanceSurface,
});

export const getLegalAcceptanceStatus = async (): Promise<LegalAcceptanceStatus> => {
  const response = await api.get<LegalAcceptanceStatus>('/legal/acceptances/me');
  return response.data;
};

export const acceptCurrentLegalDocuments = async (): Promise<LegalAcceptanceStatus> => {
  const response = await api.post<LegalAcceptanceStatus>(
    '/legal/acceptances',
    buildLegalAcceptance('settings_reacceptance')
  );
  return response.data;
};
