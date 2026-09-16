import { beforeEach, describe, expect, it } from 'vitest';
import type { ParsedPortfolioData } from '../types/portfolio';
import {
  MAX_ONBOARDING_DRAFT_BYTES,
  PARSED_PORTFOLIO_DRAFT_KEY,
  clearParsedPortfolioDraft,
  readParsedPortfolioDraft,
  resetOnboardingDraftForTests,
  storeParsedPortfolioDraft,
} from './onboardingDraft';

const draft = {
  career_summary: {
    job_titles: ['Engineer'],
    default_job_title: 'Engineer',
    years_of_experience: '3',
    default_summary: 'Builds things',
  },
  skills: [],
  work_experience: [],
  education: [],
  projects: [],
  awards: [],
  publications: [],
  certifications: [],
} satisfies ParsedPortfolioData;

describe('onboardingDraft', () => {
  beforeEach(() => {
    resetOnboardingDraftForTests();
    localStorage.clear();
  });

  it('persists a small parsed portfolio for the review step', () => {
    storeParsedPortfolioDraft(draft);
    expect(localStorage.getItem(PARSED_PORTFOLIO_DRAFT_KEY)).toContain('Engineer');
    expect(readParsedPortfolioDraft()?.career_summary.default_job_title).toBe('Engineer');

    clearParsedPortfolioDraft();
    expect(localStorage.getItem(PARSED_PORTFOLIO_DRAFT_KEY)).toBeNull();
    expect(readParsedPortfolioDraft()).toBeNull();
  });

  it('keeps oversized drafts in memory only', () => {
    const oversized: ParsedPortfolioData = {
      ...draft,
      career_summary: {
        ...draft.career_summary,
        default_summary: 'x'.repeat(MAX_ONBOARDING_DRAFT_BYTES),
      },
    };

    storeParsedPortfolioDraft(oversized);
    expect(localStorage.getItem(PARSED_PORTFOLIO_DRAFT_KEY)).toBeNull();
    expect(readParsedPortfolioDraft()?.career_summary.default_job_title).toBe('Engineer');
  });
});
