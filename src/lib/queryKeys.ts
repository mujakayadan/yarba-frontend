export const profileKeys = {
  all: ['profile'] as const,
  me: (userId?: string) => [...profileKeys.all, 'me', userId] as const,
};

export const portfolioKeys = {
  all: ['portfolio'] as const,
  user: () => [...portfolioKeys.all, 'user'] as const,
  detail: (id: string) => [...portfolioKeys.all, 'detail', id] as const,
};

export type ResumeListParams = {
  skip?: number;
  limit?: number;
  search_term?: string;
  template_id?: string;
  sort_by?: string;
};

export const resumeKeys = {
  all: ['resumes'] as const,
  list: (params: ResumeListParams = {}) => [...resumeKeys.all, 'list', params] as const,
  detail: (id: string) => [...resumeKeys.all, 'detail', id] as const,
  selection: (sortBy?: string) =>
    [...resumeKeys.all, 'selection', sortBy ?? 'updated_desc'] as const,
};

export type CoverLetterListParams = {
  skip?: number;
  limit?: number;
  template_id?: string;
  resume_id?: string;
  sort_by?: string;
};

export const coverLetterKeys = {
  all: ['coverLetters'] as const,
  list: (params: CoverLetterListParams = {}) => [...coverLetterKeys.all, 'list', params] as const,
  detail: (id: string) => [...coverLetterKeys.all, 'detail', id] as const,
};

export const templateKeys = {
  all: ['templates'] as const,
  coverLetters: () => [...templateKeys.all, 'coverLetters'] as const,
  resumes: () => [...templateKeys.all, 'resumes'] as const,
  preambles: () => [...templateKeys.all, 'preambles'] as const,
};

export const websiteKeys = {
  all: ['website'] as const,
  portfolio: () => [...websiteKeys.all, 'portfolio'] as const,
};

export type ApplicationListParams = {
  skip?: number;
  limit?: number;
  status?: string;
};

export const applicationKeys = {
  all: ['applications'] as const,
  list: (params: ApplicationListParams = {}) => [...applicationKeys.all, 'list', params] as const,
  detail: (id: string) => [...applicationKeys.all, 'detail', id] as const,
};

export const agentTokenKeys = {
  all: ['agentTokens'] as const,
  list: () => [...agentTokenKeys.all, 'list'] as const,
};

export const applicationPreferencesKeys = {
  all: ['applicationPreferences'] as const,
  me: () => [...applicationPreferencesKeys.all, 'me'] as const,
  demographics: () => [...applicationPreferencesKeys.all, 'demographics'] as const,
  applyCredentials: () => [...applicationPreferencesKeys.all, 'applyCredentials'] as const,
};
