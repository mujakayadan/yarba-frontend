import type { ParsedPortfolioData } from '../types/portfolio';

export const PARSED_PORTFOLIO_DRAFT_KEY = 'parsedPortfolioData';
export const MAX_ONBOARDING_DRAFT_BYTES = 256 * 1024;

let memoryDraft: string | null = null;

const byteLength = (value: string): number => new TextEncoder().encode(value).length;

export const storeParsedPortfolioDraft = (data: ParsedPortfolioData): void => {
  const json = JSON.stringify(data);
  memoryDraft = json;

  if (byteLength(json) > MAX_ONBOARDING_DRAFT_BYTES) {
    localStorage.removeItem(PARSED_PORTFOLIO_DRAFT_KEY);
    return;
  }

  localStorage.setItem(PARSED_PORTFOLIO_DRAFT_KEY, json);
};

export const readParsedPortfolioDraft = (): ParsedPortfolioData | null => {
  const raw = memoryDraft ?? localStorage.getItem(PARSED_PORTFOLIO_DRAFT_KEY);
  if (!raw) {
    return null;
  }

  return JSON.parse(raw) as ParsedPortfolioData;
};

export const clearParsedPortfolioDraft = (): void => {
  memoryDraft = null;
  localStorage.removeItem(PARSED_PORTFOLIO_DRAFT_KEY);
};

export const resetOnboardingDraftForTests = (): void => {
  memoryDraft = null;
};
