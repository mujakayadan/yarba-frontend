import api from './api';
import type {
  AppleOAuthExchangeRequest,
  GoogleOAuthExchangeRequest,
  OAuthNonceResponse,
  OAuthProvider,
  PasswordAuthResponse,
} from '../types/models';
import { storeToken } from '../utils/auth';
import { normalizeAuthRequestError } from '../utils/apiErrors';

const OAUTH_ERROR_MESSAGE = 'Unable to complete provider sign-in. Please try again.';

export const issueOAuthNonce = async (provider: OAuthProvider): Promise<OAuthNonceResponse> => {
  try {
    const response = await api.post<OAuthNonceResponse>(`/auth/oauth/nonce/${provider}`);
    return response.data;
  } catch (error: unknown) {
    throw normalizeAuthRequestError(error, OAUTH_ERROR_MESSAGE);
  }
};

export const exchangeGoogleIdToken = async (idToken: string): Promise<PasswordAuthResponse> => {
  const request: GoogleOAuthExchangeRequest = { id_token: idToken };
  try {
    const response = await api.post<PasswordAuthResponse>('/auth/oauth/google', request);
    storeToken(response.data.access_token);
    return response.data;
  } catch (error: unknown) {
    throw normalizeAuthRequestError(error, OAUTH_ERROR_MESSAGE);
  }
};

export const exchangeAppleIdToken = async (
  idToken: string,
  displayName?: string
): Promise<PasswordAuthResponse> => {
  const request: AppleOAuthExchangeRequest = {
    id_token: idToken,
    ...(displayName ? { display_name: displayName } : {}),
  };
  try {
    const response = await api.post<PasswordAuthResponse>('/auth/oauth/apple', request);
    storeToken(response.data.access_token);
    return response.data;
  } catch (error: unknown) {
    throw normalizeAuthRequestError(error, OAUTH_ERROR_MESSAGE);
  }
};
