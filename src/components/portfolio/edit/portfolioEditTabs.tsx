import { lazy, type ComponentType } from 'react';
import type { PortfolioEditForm } from '../../../hooks/usePortfolioEditForm';

export interface PortfolioEditTabConfig {
  label: string;
  Tab: ComponentType<{ form: PortfolioEditForm }>;
}

const lazyTab = (loader: () => Promise<{ [key: string]: ComponentType<{ form: PortfolioEditForm }> }>, name: string) =>
  lazy(() => loader().then((module) => ({ default: module[name] })));

export const PORTFOLIO_EDIT_TABS: readonly PortfolioEditTabConfig[] = [
  {
    label: 'Career Summary',
    Tab: lazyTab(() => import('./CareerSummaryEditTab'), 'CareerSummaryEditTab'),
  },
  {
    label: 'Skills',
    Tab: lazyTab(() => import('./SkillsEditTab'), 'SkillsEditTab'),
  },
  {
    label: 'Work Experience',
    Tab: lazyTab(() => import('./WorkExperienceEditTab'), 'WorkExperienceEditTab'),
  },
  {
    label: 'Education',
    Tab: lazyTab(() => import('./EducationEditTab'), 'EducationEditTab'),
  },
  {
    label: 'Projects',
    Tab: lazyTab(() => import('./ProjectsEditTab'), 'ProjectsEditTab'),
  },
  {
    label: 'Awards',
    Tab: lazyTab(() => import('./AwardsEditTab'), 'AwardsEditTab'),
  },
  {
    label: 'Publications',
    Tab: lazyTab(() => import('./PublicationsEditTab'), 'PublicationsEditTab'),
  },
  {
    label: 'Certifications',
    Tab: lazyTab(() => import('./CertificationsEditTab'), 'CertificationsEditTab'),
  },
];
