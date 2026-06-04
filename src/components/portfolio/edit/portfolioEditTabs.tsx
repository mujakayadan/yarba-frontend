import { lazy, type ComponentType } from 'react';
import type { PortfolioEditForm } from '../../../hooks/usePortfolioEditForm';
import { PORTFOLIO_VIEW_TAB_ITEMS, type PortfolioViewTabItem } from '../view/portfolioViewTabs';

export interface PortfolioEditTabConfig extends PortfolioViewTabItem {
  Tab: ComponentType<{ form: PortfolioEditForm }>;
}

const lazyTab = (
  loader: () => Promise<{ [key: string]: ComponentType<{ form: PortfolioEditForm }> }>,
  name: string
) => lazy(() => loader().then((module) => ({ default: module[name] })));

export const PORTFOLIO_EDIT_TABS: readonly PortfolioEditTabConfig[] = [
  {
    label: PORTFOLIO_VIEW_TAB_ITEMS[0].label,
    icon: PORTFOLIO_VIEW_TAB_ITEMS[0].icon,
    Tab: lazyTab(() => import('./CareerSummaryEditTab'), 'CareerSummaryEditTab'),
  },
  {
    label: PORTFOLIO_VIEW_TAB_ITEMS[1].label,
    icon: PORTFOLIO_VIEW_TAB_ITEMS[1].icon,
    Tab: lazyTab(() => import('./SkillsEditTab'), 'SkillsEditTab'),
  },
  {
    label: PORTFOLIO_VIEW_TAB_ITEMS[2].label,
    icon: PORTFOLIO_VIEW_TAB_ITEMS[2].icon,
    Tab: lazyTab(() => import('./WorkExperienceEditTab'), 'WorkExperienceEditTab'),
  },
  {
    label: PORTFOLIO_VIEW_TAB_ITEMS[3].label,
    icon: PORTFOLIO_VIEW_TAB_ITEMS[3].icon,
    Tab: lazyTab(() => import('./EducationEditTab'), 'EducationEditTab'),
  },
  {
    label: PORTFOLIO_VIEW_TAB_ITEMS[4].label,
    icon: PORTFOLIO_VIEW_TAB_ITEMS[4].icon,
    Tab: lazyTab(() => import('./ProjectsEditTab'), 'ProjectsEditTab'),
  },
  {
    label: PORTFOLIO_VIEW_TAB_ITEMS[5].label,
    icon: PORTFOLIO_VIEW_TAB_ITEMS[5].icon,
    Tab: lazyTab(() => import('./CertificationsEditTab'), 'CertificationsEditTab'),
  },
  {
    label: PORTFOLIO_VIEW_TAB_ITEMS[6].label,
    icon: PORTFOLIO_VIEW_TAB_ITEMS[6].icon,
    Tab: lazyTab(() => import('./AwardsEditTab'), 'AwardsEditTab'),
  },
  {
    label: PORTFOLIO_VIEW_TAB_ITEMS[7].label,
    icon: PORTFOLIO_VIEW_TAB_ITEMS[7].icon,
    Tab: lazyTab(() => import('./PublicationsEditTab'), 'PublicationsEditTab'),
  },
];
