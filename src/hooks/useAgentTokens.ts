import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { agentTokenKeys } from '../lib/queryKeys';
import { createAgentToken, listAgentTokens, revokeAgentToken } from '../services/agentTokenService';
import type { AgentTokenCreateRequest } from '../types/application';

export const useAgentTokens = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: agentTokenKeys.list(),
    queryFn: listAgentTokens,
    enabled: !!user,
  });
};

export const useAgentTokenMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: AgentTokenCreateRequest) => createAgentToken(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentTokenKeys.all });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (tokenId: string) => revokeAgentToken(tokenId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentTokenKeys.all });
    },
  });

  return { createMutation, revokeMutation };
};
