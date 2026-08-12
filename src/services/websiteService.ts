import api from './api';
import {
  PortfolioChatConversationDetailResponse,
  PortfolioChatConversationListResponse,
  PortfolioWebsiteConfig,
  PortfolioWebsiteResponse,
  SubdomainAvailabilityResponse,
  DeploymentStatus,
} from '../types/models'; // Assuming these types will be defined

const API_BASE_URL = '/portfolio-websites';

// Function to create a portfolio website
export const createPortfolioWebsite = async (
  config: PortfolioWebsiteConfig,
  customSubdomain?: string,
  forceRebuild: boolean = false
): Promise<PortfolioWebsiteResponse> => {
  const params = customSubdomain ? { custom_subdomain: customSubdomain } : {};
  const response = await api.post<PortfolioWebsiteResponse>(
    `${API_BASE_URL}/create`,
    { config, force_rebuild: forceRebuild },
    { params }
  );
  return response.data;
};

// Function to get the user's portfolio website
export const getPortfolioWebsite = async (): Promise<PortfolioWebsiteResponse | null> => {
  try {
    const response = await api.get<PortfolioWebsiteResponse>(`${API_BASE_URL}/`, {
      // Avoid stale browser cache after create/deploy (backend may cache empty responses).
      params: { _: Date.now() },
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    });
    return response.data ?? null;
  } catch (error: unknown) {
    if (
      error &&
      typeof error === 'object' &&
      'response' in error &&
      (error as { response?: { status?: number } }).response?.status === 404
    ) {
      return null;
    }
    throw error;
  }
};

// Function to update website configuration
export const updateWebsiteConfig = async (
  config: Partial<PortfolioWebsiteConfig>,
  forceRebuild: boolean = false
): Promise<PortfolioWebsiteResponse> => {
  const response = await api.put<PortfolioWebsiteResponse>(`${API_BASE_URL}/config`, {
    config,
    force_rebuild: forceRebuild,
  });
  return response.data;
};

// Function to deploy or redeploy the website
export const deployPortfolioWebsite = async (
  forceRebuild: boolean = false,
  cleanDeploy: boolean = false
): Promise<PortfolioWebsiteResponse> => {
  const params: Record<string, boolean> = {};
  if (forceRebuild) params.force_rebuild = true;
  if (cleanDeploy) params.clean_deploy = true;
  const response = await api.post<PortfolioWebsiteResponse>(`${API_BASE_URL}/deploy`, null, {
    params,
  });
  return response.data;
};

// Function to check subdomain availability
export const checkSubdomainAvailability = async (
  subdomain: string
): Promise<SubdomainAvailabilityResponse> => {
  const response = await api.get<SubdomainAvailabilityResponse>(
    `${API_BASE_URL}/subdomain/check/${subdomain}`
  );
  return response.data;
};

// Function to delete the portfolio website
export const deletePortfolioWebsite = async (): Promise<void> => {
  await api.delete(`${API_BASE_URL}/`);
};

// Function to get deployment status
export const getDeploymentStatus = async (): Promise<DeploymentStatus> => {
  const response = await api.get<DeploymentStatus>(`${API_BASE_URL}/deployment-status`);
  return response.data;
};

// Placeholder for Get Website Analytics if needed in the future
// export const getWebsiteAnalytics = async (): Promise<WebsiteAnalytics> => {
//   const response = await api.get<WebsiteAnalytics>(`${API_BASE_URL}/analytics`);
//   return response.data;
// };

export const listChatConversations = async (
  limit = 50,
  offset = 0
): Promise<PortfolioChatConversationListResponse> => {
  const response = await api.get<PortfolioChatConversationListResponse>(
    `${API_BASE_URL}/chat/conversations`,
    { params: { limit, offset } }
  );
  return response.data;
};

export const getChatConversation = async (
  conversationId: string
): Promise<PortfolioChatConversationDetailResponse> => {
  const response = await api.get<PortfolioChatConversationDetailResponse>(
    `${API_BASE_URL}/chat/conversations/${conversationId}`
  );
  return response.data;
};
