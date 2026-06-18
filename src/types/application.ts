export type GenderIdentity = 'decline_to_answer' | 'male' | 'female' | 'nonbinary';

export type VeteranStatus = 'decline_to_answer' | 'not_a_veteran' | 'veteran';

export type DisabilityStatus = 'decline_to_answer' | 'no' | 'yes';

export interface WorkEligibility {
  authorized_to_work: boolean | null;
  requires_sponsorship: boolean | null;
  over_18: boolean | null;
  willing_to_relocate: boolean | null;
}

export interface LogisticsPreferences {
  desired_salary: string | null;
  earliest_start_date: string | null;
  notice_period: string | null;
  referral_source: string | null;
}

export interface DemographicConsent {
  consented: boolean;
  consented_at: string | null;
}

export interface Demographics {
  gender: GenderIdentity;
  race_ethnicity: string[];
  veteran_status: VeteranStatus;
  disability_status: DisabilityStatus;
}

export interface ApplicationPreferences {
  work_eligibility: WorkEligibility;
  logistics: LogisticsPreferences;
  demographic_consent: DemographicConsent;
}

export interface ApplyCredentialsStatus {
  configured: boolean;
}

export interface JobApplication {
  id: string;
  job_url: string | null;
  company_name: string | null;
  job_title: string | null;
  platform: string | null;
  resume_id: string | null;
  cover_letter_id: string | null;
  status: string;
  submitted_at: string | null;
  error_message: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PaginatedJobApplications {
  items: JobApplication[];
  total: number;
}

export type AgentTokenScope =
  | 'jobs:extract'
  | 'resumes:read'
  | 'resumes:write'
  | 'cover_letters:read'
  | 'cover_letters:write'
  | 'profiles:read'
  | 'applications:read'
  | 'applications:write'
  | 'applications:demographics:read'
  | 'applications:credentials:read';

export interface AgentTokenInfo {
  id: string;
  label: string;
  scopes: AgentTokenScope[];
  is_active: boolean;
  expires_at: string | null;
  last_used_at: string | null;
  created_at: string;
}

export interface AgentTokenCreated extends AgentTokenInfo {
  raw_token: string;
}

export interface AgentTokenCreateRequest {
  label: string;
  scopes: AgentTokenScope[];
  expires_in_days?: number | null;
}

export const AGENT_TOKEN_SCOPES: readonly {
  value: AgentTokenScope;
  label: string;
  description: string;
}[] = [
  {
    value: 'applications:read',
    label: 'Read applications',
    description: 'List and view job application records',
  },
  {
    value: 'applications:write',
    label: 'Write applications',
    description: 'Create, update, and prepare applications',
  },
  {
    value: 'applications:demographics:read',
    label: 'Read demographics',
    description: 'Access encrypted EEO data for autofill (requires your consent)',
  },
  {
    value: 'applications:credentials:read',
    label: 'Read apply credentials',
    description: 'Access your stored careers-site password for automated account sign-in',
  },
  {
    value: 'jobs:extract',
    label: 'Extract jobs',
    description: 'Parse job descriptions from URLs',
  },
  {
    value: 'resumes:read',
    label: 'Read resumes',
    description: 'View resume content and PDFs',
  },
  {
    value: 'resumes:write',
    label: 'Write resumes',
    description: 'Create and update tailored resumes',
  },
  {
    value: 'cover_letters:read',
    label: 'Read cover letters',
    description: 'View cover letter content',
  },
  {
    value: 'cover_letters:write',
    label: 'Write cover letters',
    description: 'Create and update cover letters',
  },
  {
    value: 'profiles:read',
    label: 'Read profile',
    description: 'Access personal information for autofill',
  },
] as const;

export const DEFAULT_AGENT_TOKEN_SCOPES: AgentTokenScope[] = [
  'applications:read',
  'applications:write',
  'jobs:extract',
  'resumes:read',
  'profiles:read',
];
