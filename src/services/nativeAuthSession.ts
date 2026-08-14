import axios from 'axios';
import { env } from '../config/env';
import type { PasswordAuthResponse } from '../types/models';
import { storeToken } from '../utils/auth';

const nativeAuthClient = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const requestNativeSessionRefresh = async (): Promise<PasswordAuthResponse> => {
  const response = await nativeAuthClient.post<PasswordAuthResponse>('/auth/password/refresh');
  storeToken(response.data.access_token);
  return response.data;
};
