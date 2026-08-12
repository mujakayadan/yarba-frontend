import { WorkExperienceFormItem } from '../types/portfolioEdit';

const MONTH_VALUE_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const RANGE_SEPARATOR_PATTERN = /\s+(?:-|–|—|to)\s+/i;
const PRESENT_PATTERN = /\b(?:present|current|now)\b/i;

export interface WorkExperiencePeriod {
  startDate: string;
  endDate: string;
  current: boolean;
}

export interface WorkExperienceDateErrors {
  startDate?: string;
  endDate?: string;
}

export const currentMonthValue = (): string => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
};

const normalizeMonth = (value: string, rangeEnd = false): string => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (MONTH_VALUE_PATTERN.test(trimmed)) return trimmed;

  const numeric = trimmed.match(/^(\d{1,2})[/-](\d{2}|\d{4})$/);
  if (numeric) {
    const month = Number(numeric[1]);
    const shortYear = Number(numeric[2]);
    const year =
      numeric[2].length === 2 ? (shortYear <= 69 ? 2000 + shortYear : 1900 + shortYear) : shortYear;
    if (month >= 1 && month <= 12) {
      return `${year}-${String(month).padStart(2, '0')}`;
    }
  }

  if (/^\d{4}$/.test(trimmed)) {
    return `${trimmed}-${rangeEnd ? '12' : '01'}`;
  }

  const namedMonth = trimmed.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (namedMonth) {
    const parsed = Date.parse(`${namedMonth[1]} 1, ${namedMonth[2]}`);
    if (!Number.isNaN(parsed)) {
      const date = new Date(parsed);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
  }

  return '';
};

export const parseWorkExperiencePeriod = (time?: string): WorkExperiencePeriod => {
  if (!time?.trim()) {
    return { startDate: '', endDate: '', current: false };
  }

  const current = PRESENT_PATTERN.test(time);
  const [start = '', end = ''] = time.trim().split(RANGE_SEPARATOR_PATTERN, 2);
  return {
    startDate: normalizeMonth(start),
    endDate: current ? '' : normalizeMonth(end, true),
    current,
  };
};

export const getWorkExperienceDateErrors = (
  experience: WorkExperienceFormItem
): WorkExperienceDateErrors => {
  const maximum = currentMonthValue();
  const errors: WorkExperienceDateErrors = {};

  if (!experience.start_date) {
    errors.startDate = 'Start month is required';
  } else if (experience.start_date > maximum) {
    errors.startDate = 'Start month cannot be in the future';
  }

  if (!experience.current) {
    if (!experience.end_date) {
      errors.endDate = 'End month is required unless this is your current job';
    } else if (experience.end_date > maximum) {
      errors.endDate = 'End month cannot be in the future';
    } else if (experience.start_date && experience.end_date < experience.start_date) {
      errors.endDate = 'End month cannot be before the start month';
    }
  }

  return errors;
};

export const hasWorkExperienceDateErrors = (experience: WorkExperienceFormItem): boolean =>
  Object.keys(getWorkExperienceDateErrors(experience)).length > 0;
