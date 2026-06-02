import { Portfolio } from '../types/models';
import {
  AwardFormItem,
  CareerSummaryFormState,
  CertificationFormItem,
  EducationFormItem,
  PortfolioEditFormState,
  ProjectFormItem,
  PublicationFormItem,
  SkillCategoryForm,
  WorkExperienceFormItem,
} from '../types/portfolioEdit';
import { sortByDateDesc } from './dateSort';

export const defaultCareerSummary = (): CareerSummaryFormState => ({
  job_titles: [],
  years_of_experience: '',
  default_summary: '',
});

export const defaultPortfolioEditFormState = (): PortfolioEditFormState => ({
  skills: [
    { category: 'Technical Skills', skills: [] },
    { category: 'Soft Skills', skills: [] },
  ],
  careerSummary: defaultCareerSummary(),
  workExperience: [],
  education: [],
  projects: [],
  awards: [],
  publications: [],
  certifications: [],
});

export const mapPortfolioToEditForm = (portfolioData: Portfolio): PortfolioEditFormState => {
  const form = defaultPortfolioEditFormState();

  if (portfolioData.skills && portfolioData.skills.length > 0) {
    form.skills = portfolioData.skills.map((skill: SkillCategoryForm) => ({
      category: skill.category,
      skills: [...skill.skills],
    }));
  }

  if (portfolioData.career_summary) {
    form.careerSummary = {
      job_titles: portfolioData.career_summary.job_titles || [],
      years_of_experience: portfolioData.career_summary.years_of_experience || '',
      default_summary: portfolioData.career_summary.default_summary || '',
      default_job_title: portfolioData.career_summary.default_job_title || undefined,
    };
  }

  if (portfolioData.work_experience && portfolioData.work_experience.length > 0) {
    const mapped = portfolioData.work_experience.map((exp: Record<string, unknown>) => ({
      job_title: (exp.job_title as string) || (exp.position as string) || '',
      company: (exp.company as string) || '',
      location: (exp.location as string) || '',
      time:
        (exp.time as string) ||
        `${(exp.start_date as string) || ''} - ${exp.current ? 'Present' : (exp.end_date as string) || ''}`,
      responsibilities: (exp.responsibilities as string[]) || (exp.achievements as string[]) || [],
    }));
    form.workExperience = sortByDateDesc(mapped);
  }

  if (portfolioData.education && portfolioData.education.length > 0) {
    const mapped = portfolioData.education.map((edu: Record<string, unknown>) => ({
      degree_type: (edu.degree_type as string) || '',
      degree: (edu.degree as string) || '',
      university_name: (edu.university_name as string) || (edu.institution as string) || '',
      time:
        (edu.time as string) ||
        `${(edu.start_date as string) || ''} - ${edu.current ? 'Present' : (edu.end_date as string) || ''}`,
      location: (edu.location as string) || '',
      GPA: (edu.GPA as string) || '',
      transcript: (edu.transcript as string[]) || (edu.courses as string[]) || [],
    }));
    form.education = sortByDateDesc(mapped);
  }

  if (portfolioData.projects && portfolioData.projects.length > 0) {
    const mapped = portfolioData.projects.map((proj: Record<string, unknown>) => ({
      name: (proj.name as string) || '',
      bullet_points: (proj.bullet_points as string[]) || (proj.achievements as string[]) || [],
      date: (proj.date as string) || (proj.start_date as string) || '',
      link: (proj.link as string) || '',
    }));
    form.projects = sortByDateDesc(mapped);
  }

  if (portfolioData.awards && portfolioData.awards.length > 0) {
    form.awards = portfolioData.awards.map((award: Record<string, unknown>) => ({
      name: (award.name as string) || (award.title as string) || '',
      explanation: (award.explanation as string) || (award.description as string) || '',
    }));
  }

  if (portfolioData.publications && portfolioData.publications.length > 0) {
    const mapped = portfolioData.publications.map((pub: Record<string, unknown>) => ({
      name: (pub.name as string) || (pub.title as string) || '',
      publisher: (pub.publisher as string) || '',
      link: (pub.link as string) || (pub.url as string) || '',
      time: (pub.time as string) || (pub.date as string) || '',
    }));
    form.publications = sortByDateDesc(mapped);
  }

  if (portfolioData.certifications && portfolioData.certifications.length > 0) {
    form.certifications = sortByDateDesc(portfolioData.certifications as CertificationFormItem[]);
  }

  return form;
};

export const extractApiErrorMessage = (err: unknown, fallback: string): string => {
  const error = err as { response?: { data?: { detail?: unknown } }; message?: string };

  if (error.response?.data?.detail) {
    if (typeof error.response.data.detail === 'string') {
      return error.response.data.detail;
    }
    try {
      return JSON.stringify(error.response.data.detail);
    } catch {
      return 'An unexpected error occurred. The error detail could not be displayed.';
    }
  }

  if (error.message) {
    return error.message;
  }

  return fallback;
};
