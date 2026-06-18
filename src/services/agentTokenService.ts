import api from './api';
import type {
  AgentTokenCreateRequest,
  AgentTokenCreated,
  AgentTokenInfo,
} from '../types/application';

export const listAgentTokens = async (): Promise<AgentTokenInfo[]> => {
  const response = await api.get('/auth/agent-tokens');
  return response.data;
};

export const createAgentToken = async (
  payload: AgentTokenCreateRequest
): Promise<AgentTokenCreated> => {
  const response = await api.post('/auth/agent-tokens', payload);
  return response.data;
};

export const revokeAgentToken = async (tokenId: string): Promise<void> => {
  await api.delete(`/auth/agent-tokens/${tokenId}`);
};
