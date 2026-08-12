import { describe, expect, it } from 'vitest';
import { sortByDateDesc } from './dateSort';
import { getWorkExperienceDateErrors, parseWorkExperiencePeriod } from './workExperienceDates';
import type { WorkExperienceFormItem } from '../types/portfolioEdit';

const makeExperience = (
  overrides: Partial<WorkExperienceFormItem> = {}
): WorkExperienceFormItem => ({
  job_title: 'Engineer',
  company: 'Example',
  location: '',
  start_date: '2024-01',
  end_date: '2024-12',
  current: false,
  responsibilities: [],
  ...overrides,
});

describe('work experience dates', () => {
  it('converts existing short-year periods to month input values', () => {
    expect(parseWorkExperiencePeriod('08/25 - 08/26')).toEqual({
      startDate: '2025-08',
      endDate: '2026-08',
      current: false,
    });
  });

  it('recognizes an existing current role', () => {
    expect(parseWorkExperiencePeriod('Mar 2024 - Present')).toEqual({
      startDate: '2024-03',
      endDate: '',
      current: true,
    });
  });

  it('requires a coherent completed-job range', () => {
    expect(
      getWorkExperienceDateErrors(
        makeExperience({
          start_date: '2025-04',
          end_date: '2025-03',
        })
      )
    ).toEqual({ endDate: 'End month cannot be before the start month' });
  });

  it('allows a current role without an end month', () => {
    expect(
      getWorkExperienceDateErrors(
        makeExperience({
          end_date: '',
          current: true,
        })
      )
    ).toEqual({});
  });

  it('sorts legacy periods from newest to oldest', () => {
    const sorted = sortByDateDesc([
      { time: '03/2024 - 03/2025', name: 'older' },
      { time: '08/25 - 08/26', name: 'newer' },
      { time: '2019 - 2020', name: 'oldest' },
    ]);

    expect(sorted.map((item) => item.name)).toEqual(['newer', 'older', 'oldest']);
  });
});
