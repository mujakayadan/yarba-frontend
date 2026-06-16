import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import api from '../services/api';
import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle as loginWithGoogleService,
  logout,
  getCurrentFirebaseUser,
} from '../services/authService';
import { createDebugger } from '../utils/debug';
import { UpdateSetupProgressRequest, User, UserSetupProgressResponse } from '../types/models';
import { AUTH_UNAUTHORIZED_EVENT } from '../utils/authEvents';
import { clearAuthenticatedUserCache } from '../lib/clearUserQueryCache';

const debug = createDebugger('AuthContext');

// Define user setup steps explicitly
export enum UserSetupStep {
  NONE = 0,
  PERSONAL_INFO = 1,
  PROMPT_PREFERENCES = 2,
  SYSTEM_PREFERENCES = 3,
  LIFE_STORY = 4,
  PORTFOLIO_UPLOAD = 5,
  PORTFOLIO_REVIEW = 6,
  COMPLETE = 7,
}

// Map setup steps to routes for navigation
export const setupStepToRoute: Record<UserSetupStep, string | null> = {
  [UserSetupStep.NONE]: null,
  [UserSetupStep.PERSONAL_INFO]: '/user/setup/personal-info',
  [UserSetupStep.PROMPT_PREFERENCES]: '/user/setup/prompt-preferences',
  [UserSetupStep.SYSTEM_PREFERENCES]: '/user/setup/system-preferences',
  [UserSetupStep.LIFE_STORY]: '/user/setup/life-story',
  [UserSetupStep.PORTFOLIO_UPLOAD]: '/user/setup/portfolio-upload',
  [UserSetupStep.PORTFOLIO_REVIEW]: '/user/setup/portfolio-review',
  [UserSetupStep.COMPLETE]: null,
};

// Define the shape of our auth context state with more accurate typing
export interface AuthContextState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  isOfflineMode: boolean;
  setupStep: UserSetupStep;
  setupRoute: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<{ setupRoute: string }>;
  signInWithGoogleFlow: () => Promise<{ isNewUser?: boolean; setupRoute?: string }>;
  signOut: () => Promise<void>;
  setError: (error: string | null) => void;
  updateProfile: (profileData: Record<string, unknown>) => Promise<void>;
  updateUserSetupProgress: (data: UpdateSetupProgressRequest) => Promise<void>;
  getRedirectPathForUser: () => string;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextState>({
  user: null,
  firebaseUser: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  isOfflineMode: false,
  setupStep: UserSetupStep.NONE,
  setupRoute: null,
  login: async () => {},
  register: async () => ({ setupRoute: '' }),
  signInWithGoogleFlow: async () => ({ isNewUser: false }),
  signOut: async () => {},
  setError: () => {},
  updateProfile: async () => {},
  updateUserSetupProgress: async () => {},
  getRedirectPathForUser: () => '/dashboard',
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component that wraps app and provides auth context
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [setupStep, setSetupStep] = useState<UserSetupStep>(UserSetupStep.NONE);
  const [setupRoute, setSetupRoute] = useState<string | null>(null);

  // Function to detect if we're offline
  const checkNetworkConnectivity = () => {
    const isOffline = !navigator.onLine;
    debug.log(`Network connectivity check: ${isOffline ? 'OFFLINE' : 'ONLINE'}`);
    setIsOfflineMode(isOffline);
    return isOffline;
  };

  // Utility function to determine the correct route based on user state
  const getRedirectPathForUser = () => {
    if (!isAuthenticated) {
      return '/login';
    }

    if (setupRoute) {
      return setupRoute;
    }

    return '/dashboard';
  };

  // Update setupStep and setupRoute based on user data
  const updateSetupState = (currentSetupStep: number | null | undefined) => {
    debug.log('Updating setup state based on current_setup_step:', currentSetupStep);

    if (typeof currentSetupStep !== 'number') {
      setSetupStep(UserSetupStep.COMPLETE);
      setSetupRoute(null);
      return;
    }

    const step = currentSetupStep as UserSetupStep;
    setSetupStep(step);

    // Map the step number to a route
    const route = setupStepToRoute[step];
    if (route) {
      debug.log(`Setting setup route to ${route} for step ${step}`);
      setSetupRoute(route);
    } else if (step === UserSetupStep.COMPLETE || step === UserSetupStep.NONE) {
      debug.log('User setup is complete or not required');
      setSetupRoute(null);
    } else {
      debug.log('Unknown setup step:', step);
      setSetupRoute(null);
    }
  };

  // Function to fetch current user data from backend
  const fetchCurrentUser = async () => {
    debug.log('Fetching current user data from backend');
    const token = localStorage.getItem('auth_token');

    if (!token) {
      debug.warn('No auth token found in localStorage');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Check if we're offline before making API calls
      if (checkNetworkConnectivity()) {
        debug.warn('Device appears to be offline, skipping API call');
        setLoading(false);
        return;
      }

      const response = await api.get('/auth/me');
      debug.log('User data successfully fetched from /auth/me', response.data);

      setUser(response.data);
      setIsAuthenticated(true);
      updateSetupState(response.data.current_setup_step);
      setLoading(false);
    } catch (err: any) {
      debug.error('Error fetching user data:', err);
      // Clear token if it's invalid
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        debug.warn('Token is invalid, clearing authentication');
        localStorage.removeItem('auth_token');
        setIsAuthenticated(false);
        setUser(null);
      }
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    debug.log('Setting up auth bootstrap');

    // Set up online/offline event listeners
    const handleOnline = () => {
      debug.log('Device is now ONLINE');
      setIsOfflineMode(false);
    };

    const handleOffline = () => {
      debug.log('Device is now OFFLINE');
      setIsOfflineMode(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleUnauthorized = () => {
      debug.warn('Unauthorized API response received');
      clearAuthenticatedUserCache();
      localStorage.removeItem('auth_token');
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
    };
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);

    const initializeAuth = async () => {
      try {
        const isOffline = checkNetworkConnectivity();
        if (isOffline) {
          debug.warn('Device is offline, skipping auth bootstrap');
          setLoading(false);
          return;
        }

        const token = localStorage.getItem('auth_token');
        if (token) {
          debug.log('Restoring session from stored auth token');
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          await fetchCurrentUser();
          return;
        }

        debug.log('No stored auth token, skipping Firebase bootstrap');
        setLoading(false);
        setIsAuthenticated(false);
      } catch (err: unknown) {
        debug.error('Error initializing auth:', err);
        setError(err instanceof Error ? err.message : 'Error during authentication');
        setLoading(false);
      }
    };

    void initializeAuth();

    // Clean up event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      debug.log('Starting login process for:', email);
      setLoading(true);
      setError(null);
      clearAuthenticatedUserCache();

      // Check if we're offline first
      if (checkNetworkConnectivity()) {
        const errorMsg = 'Cannot login while offline. Please check your internet connection.';
        debug.error(errorMsg);
        setError(errorMsg);
        setLoading(false);
        throw new Error(errorMsg);
      }

      const result = await loginWithEmail(email, password);
      const fbUser = await getCurrentFirebaseUser();
      setFirebaseUser(fbUser);
      debug.log('Firebase login successful');
      setIsAuthenticated(true);

      if (result.user) {
        setUser(result.user);
        updateSetupState(result.current_setup_step);
      }

      return;
    } catch (err: any) {
      debug.error('Login error:', err);
      setError(err.message);
      setLoading(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (email: string, password: string): Promise<{ setupRoute: string }> => {
    try {
      debug.log('Starting registration process for:', email);
      setLoading(true);
      setError(null);
      clearAuthenticatedUserCache();

      // Check if we're offline first
      if (checkNetworkConnectivity()) {
        const errorMsg = 'Cannot register while offline. Please check your internet connection.';
        debug.error(errorMsg);
        setError(errorMsg);
        setLoading(false);
        throw new Error(errorMsg);
      }

      const result = await registerWithEmail({ email, password });

      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const { getFirebaseAuth } = await import('../firebaseConfig');
      const auth = await getFirebaseAuth();
      await signInWithEmailAndPassword(auth, email, password);

      const fbUser = await getCurrentFirebaseUser();
      setFirebaseUser(fbUser);
      debug.log(
        result.registration_resumed
          ? 'Registration resumed for existing Firebase account'
          : 'Registration successful'
      );
      setIsAuthenticated(true);

      if (result.user) {
        setUser({ ...result.user, current_setup_step: result.current_setup_step });
      }

      updateSetupState(result.current_setup_step);

      const step = result.current_setup_step;
      const routeFromStep =
        typeof step === 'number' ? setupStepToRoute[step as UserSetupStep] : null;

      return { setupRoute: routeFromStep || '/dashboard' };
    } catch (err: any) {
      debug.error('Registration error:', err);
      setError(err.message);
      setLoading(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google flow
  const signInWithGoogleFlow = async (): Promise<{ isNewUser?: boolean; setupRoute?: string }> => {
    try {
      debug.log('Starting Google sign-in flow');
      setLoading(true);
      setError(null);
      clearAuthenticatedUserCache();

      if (checkNetworkConnectivity()) {
        const errorMsg =
          'Cannot sign in with Google while offline. Please check your internet connection.';
        debug.error(errorMsg);
        setError(errorMsg);
        setLoading(false);
        throw new Error(errorMsg);
      }

      const result = await loginWithGoogleService();
      debug.log('Google sign-in flow completed with result:', result);

      const fbUser = await getCurrentFirebaseUser();
      setFirebaseUser(fbUser);
      setIsAuthenticated(true);

      if (result.user) {
        setUser({ ...result.user, current_setup_step: result.current_setup_step });
        updateSetupState(result.current_setup_step);
      }

      return {
        isNewUser: result.is_new_user,
        setupRoute: setupRoute || '/dashboard',
      };
    } catch (err: any) {
      debug.error('Google sign-in error:', err);
      setError(err.message);
      setLoading(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      debug.log('Starting sign out process');
      setLoading(true);

      await logout();

      clearAuthenticatedUserCache();
      // Clean up local state
      localStorage.removeItem('auth_token');
      delete api.defaults.headers.common['Authorization'];

      setUser(null);
      setFirebaseUser(null);
      setIsAuthenticated(false);
      setSetupStep(UserSetupStep.NONE);
      setSetupRoute(null);

      debug.log('Sign out successful');
    } catch (err: any) {
      debug.error('Sign out error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (profileData: Record<string, unknown>) => {
    try {
      debug.log('Updating user profile');
      setLoading(true);

      if (checkNetworkConnectivity()) {
        throw new Error('Cannot update profile while offline');
      }

      const response = await api.put('/profiles/me', profileData);
      debug.log('Profile updated successfully', response.data);

      // Update local user state
      await fetchCurrentUser();
    } catch (err: any) {
      debug.error('Profile update error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update user setup progress
  const updateUserSetupProgress = async (data: UpdateSetupProgressRequest): Promise<void> => {
    try {
      debug.log('Updating user setup progress:', data);
      setLoading(true);

      if (checkNetworkConnectivity()) {
        throw new Error('Cannot update setup progress while offline');
      }

      // Using the correct endpoint with PUT method
      const response = await api.put<UserSetupProgressResponse>(
        '/auth/users/me/setup-progress',
        data
      );
      debug.log('Setup progress updated successfully', response.data);

      // Update local state with new step
      updateSetupState(response.data.current_setup_step);

      // Refresh user data
      await fetchCurrentUser();
    } catch (err: any) {
      debug.error('Setup progress update error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Provide the auth context value
  const value: AuthContextState = {
    user,
    firebaseUser,
    isAuthenticated,
    loading,
    error,
    isOfflineMode,
    setupStep,
    setupRoute,
    login,
    register,
    signInWithGoogleFlow,
    signOut,
    setError,
    updateProfile,
    updateUserSetupProgress,
    getRedirectPathForUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
