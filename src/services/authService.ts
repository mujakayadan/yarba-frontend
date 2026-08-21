import api from './api';
import { removeToken, storeToken } from '../utils/auth';
import type {
  AuthActionResponse,
  ChangePasswordRequest,
  ConfirmVerificationRequest,
  ForgotPasswordRequest,
  LegalAcceptanceRequest,
  LoginRequest,
  LoginResponse,
  PasswordAuthResponse,
  PasswordCredentialsRequest,
  RegisterRequest,
  RequestVerificationRequest,
  ResetPasswordRequest,
  User,
} from '../types/models';
import {
  ApiRequestError,
  extractApiErrorBody,
  normalizeAuthRequestError,
  resolveAuthErrorMessage,
} from '../utils/apiErrors';
import axios from 'axios';
import type { User as FirebaseUser } from 'firebase/auth';
import { env } from '../config/env';
import { createDebugger } from '../utils/debug';
import {
  changeFirebasePassword,
  getFirebaseToken,
  getFirebaseUser,
  sendFirebasePasswordReset,
  signInWithFirebaseEmail,
  signInWithFirebaseGoogle,
  signOutFirebase,
} from './firebaseAuthAdapter';
import { requestNativeSessionRefresh } from './nativeAuthSession';

const debug = createDebugger('Auth');

let tokenExchangeInProgress = false;
let lastTokenExchangeError: Error | null = null;
let lastTokenExchangeTime = 0;
const TOKEN_RETRY_DELAY = 30000;

export const getCurrentFirebaseUser = async (): Promise<FirebaseUser | null> => {
  const user = await getFirebaseUser();
  debug.log('Current Firebase user:', user ? `${user.email} (${user.uid})` : 'None');
  return user;
};

export const getFirebaseIdToken = async (): Promise<string | null> => {
  try {
    debug.log('Getting Firebase ID token');
    const token = await getFirebaseToken();
    if (!token) {
      debug.warn('No current Firebase user found when getting ID token');
      return null;
    }
    debug.log('Successfully retrieved Firebase ID token');
    return token;
  } catch (error) {
    debug.error('Error getting ID token:', error);
    return null;
  }
};

export const exchangeFirebaseTokenForJWT = async (
  legalAcceptance?: LegalAcceptanceRequest
): Promise<LoginResponse | null> => {
  if (tokenExchangeInProgress) {
    debug.warn('Token exchange already in progress, skipping duplicate request');
    if (lastTokenExchangeError) {
      throw lastTokenExchangeError;
    }
    return null;
  }

  const now = Date.now();
  if (lastTokenExchangeError && now - lastTokenExchangeTime < TOKEN_RETRY_DELAY) {
    const timeRemaining = Math.round((TOKEN_RETRY_DELAY - (now - lastTokenExchangeTime)) / 1000);
    debug.warn(
      `Token exchange recently failed, waiting before retry (${timeRemaining}s remaining)`
    );
    throw lastTokenExchangeError;
  }

  const idToken = await getFirebaseIdToken();
  if (!idToken) {
    debug.error('No Firebase ID token available');
    return null;
  }

  tokenExchangeInProgress = true;
  lastTokenExchangeTime = now;

  try {
    debug.log('Sending Firebase token to backend for JWT exchange');
    const response = await api.post<LoginResponse>('/auth/login', {
      id_token: idToken,
      ...(legalAcceptance ? { legal_acceptance: legalAcceptance } : {}),
    });
    debug.log('JWT exchange successful');

    tokenExchangeInProgress = false;
    lastTokenExchangeError = null;
    return response.data;
  } catch (error: unknown) {
    debug.error('Error exchanging Firebase token:', error);

    lastTokenExchangeError =
      error instanceof Error
        ? error
        : new Error(
            error instanceof Object && 'message' in error ? String(error.message) : 'Unknown error'
          );

    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Backend error: ${error.response.data?.detail || error.message}`);
    }
    throw error;
  } finally {
    tokenExchangeInProgress = false;
  }
};

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
  if (!env.nativeAuth) {
    await sendFirebasePasswordReset(email);
    return;
  }

  const request: ForgotPasswordRequest = { email };
  await api.post<AuthActionResponse>('/auth/password/forgot-password', request);
};

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  const request: ResetPasswordRequest = { token, new_password: newPassword };
  await api.post<AuthActionResponse>('/auth/password/reset-password', request);
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
    if (env.nativeAuth) {
      return await passwordRegister({ email, password, legal_acceptance });
    }

    const response = await api.post<LoginResponse>('/auth/register', data);
    debug.log('Backend registration successful for:', data.email);

    if (response.data.access_token) {
      storeToken(response.data.access_token);
      return response.data;
    }

    debug.error('Backend registration did not return an access token.');
    throw new Error('Registration completed but failed to log in automatically.');
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

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  try {
    const formData = new URLSearchParams();
    formData.append('username', data.username);
    formData.append('password', data.password);

    const response = await api.post<LoginResponse>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (response.data.access_token) {
      storeToken(response.data.access_token);
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error;
    }
    throw new Error(error instanceof Error ? error.message : 'Login failed');
  }
};

export const loginWithEmail = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    if (env.nativeAuth) {
      debug.log('Attempting native password login with email:', email);
      return await passwordLogin({ email, password });
    }

    debug.log('Attempting Firebase login with email:', email);
    await signInWithFirebaseEmail(email, password);
    debug.log('Firebase login successful');

    const tokenResponse = await exchangeFirebaseTokenForJWT();

    if (tokenResponse?.access_token) {
      storeToken(tokenResponse.access_token);
      return tokenResponse;
    }

    throw new Error('Failed to get access token');
  } catch (error) {
    debug.error('Firebase login error:', error);
    throw error;
  }
};

export const completeFirebaseEmailRegistration = async (
  email: string,
  password: string
): Promise<void> => {
  await signInWithFirebaseEmail(email, password);
};

export const loginWithGoogle = async (
  legalAcceptance?: LegalAcceptanceRequest
): Promise<LoginResponse> => {
  try {
    debug.log('Starting Google sign-in process');
    const firebaseUser = await signInWithFirebaseGoogle();
    debug.log('Google sign-in successful with Firebase user:', firebaseUser.email);

    let isNewUser = false;
    if (firebaseUser.metadata.creationTime && firebaseUser.metadata.lastSignInTime) {
      const creationTimestamp = new Date(firebaseUser.metadata.creationTime).getTime();
      const lastSignInTimestamp = new Date(firebaseUser.metadata.lastSignInTime).getTime();
      if (Math.abs(lastSignInTimestamp - creationTimestamp) < 5000) {
        isNewUser = true;
        debug.log('Detected new user from Google Sign-In based on timestamps.');
      }
    }

    const tokenResponse = await exchangeFirebaseTokenForJWT(legalAcceptance);

    if (tokenResponse?.access_token) {
      storeToken(tokenResponse.access_token);
      return { ...tokenResponse, isNewUser };
    }

    throw new Error('Failed to get access token from backend');
  } catch (error) {
    debug.error('Google sign-in error:', error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  debug.log('Signing out user');
  if (env.nativeAuth) {
    try {
      const backendLogout = Promise.resolve().then(() =>
        api.post<AuthActionResponse>('/auth/password/logout')
      );
      const firebaseLogout = Promise.resolve().then(() => signOutFirebase());
      const cleanupResults = await Promise.allSettled([backendLogout, firebaseLogout]);
      for (const result of cleanupResults) {
        if (result.status === 'rejected') {
          const message =
            result.reason instanceof Error ? result.reason.message : 'Unknown cleanup error';
          debug.warn('Native transition logout cleanup failed:', message);
        }
      }
    } finally {
      removeToken();
    }
  } else {
    try {
      await signOutFirebase();
      removeToken();
    } catch (error) {
      debug.error('Logout error:', error);
      throw error;
    }
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
  if (env.nativeAuth) {
    const request: ChangePasswordRequest = {
      current_password: currentPassword,
      new_password: newPassword,
    };
    await api.post<AuthActionResponse>('/auth/password/change-password', request);
    return;
  }

  try {
    debug.log('Reauthenticating user before password change');
    await changeFirebasePassword(currentPassword, newPassword);
    debug.log('Password update successful');
  } catch (error: unknown) {
    debug.error('Error changing password:', error);

    if (typeof error === 'object' && error !== null && 'code' in error) {
      if (error.code === 'auth/wrong-password') {
        throw new Error('Current password is incorrect');
      }
      if (error.code === 'auth/weak-password') {
        throw new Error('New password is too weak. It should be at least 6 characters');
      }
    }
    throw error;
  }
};

export const verifyFirebaseToken = async (): Promise<unknown> => {
  const idToken = await getFirebaseIdToken();
  if (!idToken) throw new Error('No Firebase ID token available');

  try {
    debug.log('Verifying Firebase token');
    const response = await api.post('/auth/firebase/verify-token', { id_token: idToken });
    debug.log('Token verification successful');
    return response.data;
  } catch (error) {
    debug.error('Error verifying Firebase token:', error);
    throw error;
  }
};
