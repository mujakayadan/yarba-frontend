import api from './api';
import { storeToken } from '../utils/auth';
import { RegisterRequest, LoginRequest, LoginResponse, User } from '../types/models';
import axios from 'axios';
import type { User as FirebaseUser } from 'firebase/auth';
import { getFirebaseAuth } from '../firebaseConfig';
import { createDebugger } from '../utils/debug';

const debug = createDebugger('Auth');

let tokenExchangeInProgress = false;
let lastTokenExchangeError: Error | null = null;
let lastTokenExchangeTime = 0;
const TOKEN_RETRY_DELAY = 30000;

export const getCurrentFirebaseUser = async (): Promise<FirebaseUser | null> => {
  const { onAuthStateChanged } = await import('firebase/auth');
  const auth = await getFirebaseAuth();

  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      debug.log('Current Firebase user:', user ? `${user.email} (${user.uid})` : 'None');
      resolve(user);
    });
  });
};

export const getFirebaseIdToken = async (): Promise<string | null> => {
  const auth = await getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) {
    debug.warn('No current Firebase user found when getting ID token');
    return null;
  }

  try {
    debug.log('Getting Firebase ID token');
    const token = await user.getIdToken(true);
    debug.log('Successfully retrieved Firebase ID token');
    return token;
  } catch (error) {
    debug.error('Error getting ID token:', error);
    return null;
  }
};

export const exchangeFirebaseTokenForJWT = async (): Promise<LoginResponse | null> => {
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
    const response = await api.post<LoginResponse>('/auth/login', { id_token: idToken });
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

export const registerWithEmail = async (data: RegisterRequest): Promise<LoginResponse> => {
  try {
    debug.log('Sending registration details to backend for:', data.email);
    const { email, password } = data;
    const response = await api.post<LoginResponse>('/auth/register', { email, password });
    debug.log('Backend registration successful for:', data.email);

    if (response.data.access_token) {
      storeToken(response.data.access_token);
      return response.data;
    }

    debug.error('Backend registration did not return an access token.');
    throw new Error('Registration completed but failed to log in automatically.');
  } catch (error) {
    debug.error('Backend registration error:', error);
    if (axios.isAxiosError(error) && error.response) {
      const errorDetail = error.response.data?.detail || error.message;
      throw new Error(errorDetail || 'Registration failed due to a server error.');
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
    debug.log('Attempting Firebase login with email:', email);
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    const auth = await getFirebaseAuth();
    await signInWithEmailAndPassword(auth, email, password);
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

export const loginWithGoogle = async (): Promise<LoginResponse> => {
  try {
    debug.log('Starting Google sign-in process');
    const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
    const auth = await getFirebaseAuth();

    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');

    const result = await signInWithPopup(auth, provider);
    const firebaseUser = result.user;
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

    const tokenResponse = await exchangeFirebaseTokenForJWT();

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
  try {
    debug.log('Signing out user');
    const { signOut } = await import('firebase/auth');
    const auth = await getFirebaseAuth();
    await signOut(auth);
    storeToken('');
    debug.log('Sign out successful');
  } catch (error) {
    debug.error('Logout error:', error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<User>('/auth/me');
  return response.data;
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const { EmailAuthProvider, reauthenticateWithCredential, updatePassword } =
    await import('firebase/auth');
  const auth = await getFirebaseAuth();
  const user = auth.currentUser;

  if (!user || !user.email) {
    debug.error('No current Firebase user found when changing password');
    throw new Error('You must be logged in to change your password');
  }

  try {
    debug.log('Reauthenticating user before password change');
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    debug.log('Updating password');
    await updatePassword(user, newPassword);
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
