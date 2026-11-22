import api from './api';
import { flushAuthStorage, removeToken, storeToken } from '../utils/auth';
import type {
  AuthActionResponse,
  ChangePasswordRequest,
  ConfirmVerificationRequest,
  ForgotPasswordRequest,
  LoginResponse,
  PasswordAuthResponse,
  PasswordCredentialsRequest,
  RegisterRequest,
  RequestVerificationRequest,
  ResetPasswordRequest,
  User,
} from '../types/models';
import {
  AUTH_ERROR_MESSAGES,
  ApiRequestError,
  extractApiErrorBody,
  normalizeAuthRequestError,
  resolveAuthErrorMessage,
} from '../utils/apiErrors';
import axios from 'axios';
import { createDebugger } from '../utils/debug';
import { requestNativeSessionRefresh } from './nativeAuthSession';

const debug = createDebugger('Auth');

export const passwordRegister = async (
  data: PasswordCredentialsRequest
): Promise<PasswordAuthResponse> => {
  const response = await api.post<PasswordAuthResponse>('/auth/password/register', data);
  storeToken(response.data.access_token);
  return response.data;
};

export const passwordLogin = async (
  data: PasswordCredentialsRequest
): Promise<PasswordAuthResponse> => {
  try {
    const response = await api.post<PasswordAuthResponse>('/auth/password/login', data);
    storeToken(response.data.access_token);
    return response.data;
  } catch (error: unknown) {
    throw normalizeAuthRequestError(
      error,
      'Login failed. Please check your credentials and try again.'
    );
  }
};

export const refreshPasswordSession = async (): Promise<PasswordAuthResponse> =>
  requestNativeSessionRefresh();

export const forgotPassword = async (email: string): Promise<void> => {
  const request: ForgotPasswordRequest = { email };
  await api.post<AuthActionResponse>('/auth/password/forgot-password', request);
};

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  const request: ResetPasswordRequest = { token, new_password: newPassword };
  try {
    await api.post<AuthActionResponse>('/auth/password/reset-password', request);
  } catch (error: unknown) {
    throw normalizeAuthRequestError(error, AUTH_ERROR_MESSAGES.invalid_or_expired_action_token);
  }
};

export const requestEmailVerification = async (email: string): Promise<void> => {
  const request: RequestVerificationRequest = { email };
  await api.post<AuthActionResponse>('/auth/password/request-verification', request);
};

export const confirmEmailVerification = async (token: string): Promise<void> => {
  const request: ConfirmVerificationRequest = { token };
  await api.post<AuthActionResponse>('/auth/password/confirm-verification', request);
};

export const logoutAllPasswordSessions = async (): Promise<void> => {
  await api.post<AuthActionResponse>('/auth/password/logout-all');
};

export const deactivatePasswordAccount = async (): Promise<void> => {
  await api.post<AuthActionResponse>('/auth/password/deactivate');
};

export const registerWithEmail = async (data: RegisterRequest): Promise<LoginResponse> => {
  try {
    debug.log('Sending registration details to backend for:', data.email);
    const { email, password, legal_acceptance } = data;
    return await passwordRegister({ email, password, legal_acceptance });
  } catch (error) {
    debug.error('Backend registration error:', error);
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const body = extractApiErrorBody(error.response.data);
        const { message, errorCode } = resolveAuthErrorMessage(
          body,
          'Registration failed due to a server error.'
        );
        throw new ApiRequestError(message, {
          errorCode,
          status: error.response.status,
        });
      }
      throw new ApiRequestError(
        'Unable to reach the server. Please check your connection and try again.',
        { errorCode: 'network_error' }
      );
    }
    throw error;
  }
};

export const loginWithEmail = async (email: string, password: string): Promise<LoginResponse> => {
  debug.log('Attempting password login with email:', email);
  return passwordLogin({ email, password });
};

export const logout = async (): Promise<void> => {
  debug.log('Signing out user');
  try {
    await api.post<AuthActionResponse>('/auth/password/logout');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown logout error';
    debug.warn('Logout request failed:', message);
  } finally {
    removeToken();
    await flushAuthStorage();
  }
  debug.log('Sign out successful');
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<User>('/auth/me');
  return response.data;
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const request: ChangePasswordRequest = {
    current_password: currentPassword,
    new_password: newPassword,
  };
  await api.post<AuthActionResponse>('/auth/password/change-password', request);
};
