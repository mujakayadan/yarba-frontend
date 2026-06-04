import { lazy, type ComponentType } from 'react';
import {
  Summarize as SummarizeIcon,
  Category as CategoryIcon,
  WorkHistory as WorkHistoryIcon,
  School as EducationIcon,
  Code as ProjectsIcon,
  EmojiEvents as AwardsIcon,
  MenuBook as PublicationsIcon,
  Badge as CertificationsIcon,
} from '@mui/icons-material';
import type { PortfolioViewTabProps } from '../../../types/portfolioView';

export interface PortfolioViewTabItem {
  label: string;
  icon: ComponentType;
}

export interface PortfolioViewTabConfig extends PortfolioViewTabItem {
  Tab: ComponentType<PortfolioViewTabProps>;
}

const lazyTab = (
  loader: () => Promise<{ [key: string]: ComponentType<PortfolioViewTabProps> }>,
  name: string
) => lazy(() => loader().then((module) => ({ default: module[name] })));

export const PORTFOLIO_VIEW_TAB_ITEMS: readonly PortfolioViewTabItem[] = [
  { label: 'Summary', icon: SummarizeIcon },
  { label: 'Skills', icon: CategoryIcon },
  { label: 'Work Experience', icon: WorkHistoryIcon },
  { label: 'Education', icon: EducationIcon },
  { label: 'Projects', icon: ProjectsIcon },
  { label: 'Certifications', icon: CertificationsIcon },
  { label: 'Awards', icon: AwardsIcon },
  { label: 'Publications', icon: PublicationsIcon },
];

export const PORTFOLIO_VIEW_TABS: readonly PortfolioViewTabConfig[] = [
  {
    label: PORTFOLIO_VIEW_TAB_ITEMS[0].label,
    icon: PORTFOLIO_VIEW_TAB_ITEMS[0].icon,
    Tab: lazyTab(() => import('./tabs/CareerSummaryViewTab'), 'CareerSummaryViewTab'),
  },
  {
    label: PORTFOLIO_VIEW_TAB_ITEMS[1].label,
    icon: PORTFOLIO_VIEW_TAB_ITEMS[1].icon,
    Tab: lazyTab(() => import('./tabs/SkillsViewTab'), 'SkillsViewTab'),
  },
  {
    label: PORTFOLIO_VIEW_TAB_ITEMS[2].label,
    icon: PORTFOLIO_VIEW_TAB_ITEMS[2].icon,
    Tab: lazyTab(() => import('./tabs/WorkExperienceViewTab'), 'WorkExperienceViewTab'),
  },
  {
    label: PORTFOLIO_VIEW_TAB_ITEMS[3].label,
    icon: PORTFOLIO_VIEW_TAB_ITEMS[3].icon,
    Tab: lazyTab(() => import('./tabs/EducationViewTab'), 'EducationViewTab'),
  },
  {
    label: PORTFOLIO_VIEW_TAB_ITEMS[4].label,
    icon: PORTFOLIO_VIEW_TAB_ITEMS[4].icon,
    Tab: lazyTab(() => import('./tabs/ProjectsViewTab'), 'ProjectsViewTab'),
  },
  {
    label: PORTFOLIO_VIEW_TAB_ITEMS[5].label,
    icon: PORTFOLIO_VIEW_TAB_ITEMS[5].icon,
    Tab: lazyTab(() => import('./tabs/CertificationsViewTab'), 'CertificationsViewTab'),
  },
  {
    label: PORTFOLIO_VIEW_TAB_ITEMS[6].label,
    icon: PORTFOLIO_VIEW_TAB_ITEMS[6].icon,
    Tab: lazyTab(() => import('./tabs/AwardsViewTab'), 'AwardsViewTab'),
  },
  {
    label: PORTFOLIO_VIEW_TAB_ITEMS[7].label,
    icon: PORTFOLIO_VIEW_TAB_ITEMS[7].icon,
    Tab: lazyTab(() => import('./tabs/PublicationsViewTab'), 'PublicationsViewTab'),
  },
];
