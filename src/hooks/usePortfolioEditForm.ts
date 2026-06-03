import { useCallback, useEffect, useState } from 'react';
import { useDeferredTabs } from './useDeferredTabs';
import { useNavigate } from 'react-router-dom';
import { Portfolio } from '../types/models';
import {
  AwardFormItem,
  CareerSummaryFormState,
  CertificationFormItem,
  EducationFormItem,
  ProjectFormItem,
  PublicationFormItem,
  SkillCategoryForm,
  WorkExperienceFormItem,
} from '../types/portfolioEdit';
import { extractApiErrorMessage, mapPortfolioToEditForm } from '../utils/portfolioEditMappers';
import { usePortfolioById } from './usePortfolio';
import { usePortfolioMutations } from './usePortfolioMutations';

export const usePortfolioEditForm = (id: string | undefined) => {
  const navigate = useNavigate();
  const { tabValue, renderedTab, isTabPending, handleTabChange } = useDeferredTabs(0);
  const { data: portfolio, isLoading, isError, error: queryError } = usePortfolioById(id);
  const mutations = usePortfolioMutations(id);

  const [formSeeded, setFormSeeded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [skills, setSkills] = useState<SkillCategoryForm[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const [skillDialogOpen, setSkillDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

  const [careerSummary, setCareerSummary] = useState<CareerSummaryFormState>({
    job_titles: [],
    years_of_experience: '',
    default_summary: '',
  });
  const [newJobTitle, setNewJobTitle] = useState('');
  const [jobTitleDialogOpen, setJobTitleDialogOpen] = useState(false);

  const [workExperience, setWorkExperience] = useState<WorkExperienceFormItem[]>([]);
  const [newResponsibility, setNewResponsibility] = useState<Record<number, string>>({});

  const [education, setEducation] = useState<EducationFormItem[]>([]);
  const [newCourse, setNewCourse] = useState('');

  const [projects, setProjects] = useState<ProjectFormItem[]>([]);
  const [newBulletPoint, setNewBulletPoint] = useState('');

  const [awards, setAwards] = useState<AwardFormItem[]>([]);
  const [publications, setPublications] = useState<PublicationFormItem[]>([]);
  const [certifications, setCertifications] = useState<CertificationFormItem[]>([]);

  const applyFormState = useCallback((portfolioData: Portfolio) => {
    const form = mapPortfolioToEditForm(portfolioData);
    setSkills(form.skills);
    setCareerSummary(form.careerSummary);
    setWorkExperience(form.workExperience);
    setEducation(form.education);
    setProjects(form.projects);
    setAwards(form.awards);
    setPublications(form.publications);
    setCertifications(form.certifications);
  }, []);

  useEffect(() => {
    if (portfolio && !formSeeded) {
      applyFormState(portfolio);
      setFormSeeded(true);
    }
  }, [portfolio, formSeeded, applyFormState]);

  useEffect(() => {
    if (isError && queryError) {
      setError(
        extractApiErrorMessage(queryError, 'Failed to load portfolio. Please try again later.')
      );
    }
  }, [isError, queryError]);

  const handleAddSkill = () => {
    if (!newSkill.trim()) {
      return;
    }

    setSkills((prevSkills) => {
      const updatedSkills = [...prevSkills];
      const category = updatedSkills[selectedCategoryIndex];
      if (category && !category.skills.includes(newSkill.trim())) {
        category.skills = [...category.skills, newSkill.trim()];
      }
      return updatedSkills;
    });

    setNewSkill('');
  };

  const handleDeleteSkill = (categoryIndex: number, skillIndex: number) => {
    setSkills((prevSkills) => {
      const updatedSkills = [...prevSkills];
      const category = updatedSkills[categoryIndex];
      if (category) {
        category.skills = category.skills.filter((_, index) => index !== skillIndex);
      }
      return updatedSkills;
    });
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      return;
    }

    setSkills((prev) => [...prev, { category: newCategory.trim(), skills: [] }]);
    setNewCategory('');
  };

  const handleDeleteCategory = (categoryIndex: number) => {
    setSkills((prev) => prev.filter((_, index) => index !== categoryIndex));
    setSelectedCategoryIndex((current) => {
      if (current >= categoryIndex && current > 0) {
        return current - 1;
      }
      return current;
    });
  };

  const handleDeleteJobTitle = (index: number) => {
    const updatedTitles = [...careerSummary.job_titles];
    const titleToRemove = updatedTitles[index];
    updatedTitles.splice(index, 1);

    setCareerSummary({
      ...careerSummary,
      job_titles: updatedTitles,
      default_job_title:
        careerSummary.default_job_title === titleToRemove
          ? updatedTitles.length > 0
            ? updatedTitles[0]
            : undefined
          : careerSummary.default_job_title,
    });
  };

  const handleSave = async () => {
    if (!id || !portfolio) {
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      let updated: Portfolio | undefined;

      switch (tabValue) {
        case 0:
          updated = await mutations.updateCareerSummaryMutation.mutateAsync(careerSummary);
          setSuccess('Career summary updated successfully!');
          break;
        case 1: {
          const formattedSkills = skills
            .filter((category) => category.skills.length > 0)
            .map((category) => ({
              category: category.category,
              skills: [...category.skills],
            }));
          updated = await mutations.updateSkillsMutation.mutateAsync(formattedSkills);
          setSuccess('Skills updated successfully!');
          break;
        }
        case 2:
          updated = await mutations.updateWorkExperienceMutation.mutateAsync(workExperience);
          setSuccess('Work experience updated successfully!');
          break;
        case 3:
          updated = await mutations.updateEducationMutation.mutateAsync(education);
          setSuccess('Education updated successfully!');
          break;
        case 4: {
          const projectsToSave = projects.map((project) => ({
            ...project,
            link: project.link === '' ? undefined : project.link,
          }));
          updated = await mutations.updateProjectsMutation.mutateAsync(projectsToSave);
          setSuccess('Projects updated successfully!');
          break;
        }
        case 5:
          updated = await mutations.updateAwardsMutation.mutateAsync(awards);
          setSuccess('Awards updated successfully!');
          break;
        case 6:
          updated = await mutations.updatePublicationsMutation.mutateAsync(publications);
          setSuccess('Publications updated successfully!');
          break;
        case 7:
          updated = await mutations.updateCertificationsMutation.mutateAsync(certifications);
          setSuccess('Certifications updated successfully!');
          break;
        default:
          break;
      }

      if (updated) {
        applyFormState(updated);
      }
    } catch (err: unknown) {
      console.error('Failed to update portfolio:', err);
      setError(extractApiErrorMessage(err, 'Failed to update portfolio. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (portfolio?._id) {
      navigate(`/portfolio/${portfolio._id}`);
    } else if (id) {
      navigate(`/portfolio/${id}`);
    } else {
      navigate('/portfolio');
    }
  };

  return {
    tabValue,
    renderedTab,
    isTabPending,
    portfolio: portfolio ?? null,
    loading: isLoading,
    saving,
    error,
    success,
    skills,
    setSkills,
    newSkill,
    setNewSkill,
    newCategory,
    setNewCategory,
    selectedCategoryIndex,
    setSelectedCategoryIndex,
    skillDialogOpen,
    setSkillDialogOpen,
    categoryDialogOpen,
    setCategoryDialogOpen,
    careerSummary,
    setCareerSummary,
    newJobTitle,
    setNewJobTitle,
    jobTitleDialogOpen,
    setJobTitleDialogOpen,
    workExperience,
    setWorkExperience,
    newResponsibility,
    setNewResponsibility,
    education,
    setEducation,
    newCourse,
    setNewCourse,
    projects,
    setProjects,
    newBulletPoint,
    setNewBulletPoint,
    awards,
    setAwards,
    publications,
    setPublications,
    certifications,
    setCertifications,
    handleTabChange,
    handleAddSkill,
    handleDeleteSkill,
    handleAddCategory,
    handleDeleteCategory,
    handleDeleteJobTitle,
    handleSave,
    handleCancel,
  };
};

export type PortfolioEditForm = ReturnType<typeof usePortfolioEditForm>;
