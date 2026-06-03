import { PortfolioViewSortedData, ViewPortfolio } from '../types/portfolioView';
import { sortByDateDesc } from './dateSort';

export function getPortfolioViewSortedData(portfolio: ViewPortfolio): PortfolioViewSortedData {
  return {
    sortedWorkExperience: sortByDateDesc(portfolio.work_experience ?? []),
    sortedEducation: sortByDateDesc(portfolio.education ?? []),
    sortedProjects: sortByDateDesc(portfolio.projects ?? []),
    sortedCertifications: sortByDateDesc(portfolio.certifications ?? []),
    sortedAwards: sortByDateDesc(portfolio.awards ?? []),
    sortedPublications: sortByDateDesc(portfolio.publications ?? []),
  };
}
