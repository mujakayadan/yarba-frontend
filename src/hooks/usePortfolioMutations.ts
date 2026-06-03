import { useMutation } from '@tanstack/react-query';
import { portfolioKeys } from '../lib/queryKeys';
import { queryClient } from '../providers/QueryProvider';
import {
  updateAwards,
  updateCareerSummary,
  updateCertifications,
  updateEducation,
  updateProjects,
  updatePublications,
  updateSkills,
  updateWorkExperience,
} from '../services/portfolioService';

const invalidatePortfolio = (portfolioId: string) => {
  queryClient.invalidateQueries({ queryKey: portfolioKeys.detail(portfolioId) });
  queryClient.invalidateQueries({ queryKey: portfolioKeys.user() });
};

export const usePortfolioMutations = (portfolioId: string | undefined) => {
  const updateCareerSummaryMutation = useMutation({
    mutationFn: (data: Parameters<typeof updateCareerSummary>[1]) =>
      updateCareerSummary(portfolioId!, data),
    onSuccess: () => portfolioId && invalidatePortfolio(portfolioId),
  });

  const updateSkillsMutation = useMutation({
    mutationFn: (data: Parameters<typeof updateSkills>[1]) => updateSkills(portfolioId!, data),
    onSuccess: () => portfolioId && invalidatePortfolio(portfolioId),
  });

  const updateWorkExperienceMutation = useMutation({
    mutationFn: (data: Parameters<typeof updateWorkExperience>[1]) =>
      updateWorkExperience(portfolioId!, data),
    onSuccess: () => portfolioId && invalidatePortfolio(portfolioId),
  });

  const updateEducationMutation = useMutation({
    mutationFn: (data: Parameters<typeof updateEducation>[1]) =>
      updateEducation(portfolioId!, data),
    onSuccess: () => portfolioId && invalidatePortfolio(portfolioId),
  });

  const updateProjectsMutation = useMutation({
    mutationFn: (data: Parameters<typeof updateProjects>[1]) =>
      updateProjects(portfolioId!, data),
    onSuccess: () => portfolioId && invalidatePortfolio(portfolioId),
  });

  const updateAwardsMutation = useMutation({
    mutationFn: (data: Parameters<typeof updateAwards>[1]) => updateAwards(portfolioId!, data),
    onSuccess: () => portfolioId && invalidatePortfolio(portfolioId),
  });

  const updatePublicationsMutation = useMutation({
    mutationFn: (data: Parameters<typeof updatePublications>[1]) =>
      updatePublications(portfolioId!, data),
    onSuccess: () => portfolioId && invalidatePortfolio(portfolioId),
  });

  const updateCertificationsMutation = useMutation({
    mutationFn: (data: Parameters<typeof updateCertifications>[1]) =>
      updateCertifications(portfolioId!, data),
    onSuccess: () => portfolioId && invalidatePortfolio(portfolioId),
  });

  return {
    updateCareerSummaryMutation,
    updateSkillsMutation,
    updateWorkExperienceMutation,
    updateEducationMutation,
    updateProjectsMutation,
    updateAwardsMutation,
    updatePublicationsMutation,
    updateCertificationsMutation,
  };
};
