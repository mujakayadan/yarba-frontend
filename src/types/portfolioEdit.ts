export interface SkillCategoryForm {
  category: string;
  skills: string[];
}

export interface CareerSummaryFormState {
  job_titles: string[];
  years_of_experience: string;
  default_summary: string;
  default_job_title?: string;
}

export interface WorkExperienceFormItem {
  job_title: string;
  company: string;
  location: string;
  time: string;
  responsibilities: string[];
}

export interface EducationFormItem {
  degree_type: string;
  degree: string;
  university_name: string;
  time: string;
  location: string;
  GPA: string;
  transcript: string[];
}

export interface ProjectFormItem {
  name: string;
  bullet_points: string[];
  date: string;
  link?: string;
}

export interface AwardFormItem {
  name: string;
  explanation: string;
}

export interface PublicationFormItem {
  name: string;
  publisher: string;
  link: string;
  time: string;
}

export interface CertificationFormItem {
  name: string;
  issuer: string;
  date: string;
  url?: string;
  description?: string;
}

export interface PortfolioEditFormState {
  skills: SkillCategoryForm[];
  careerSummary: CareerSummaryFormState;
  workExperience: WorkExperienceFormItem[];
  education: EducationFormItem[];
  projects: ProjectFormItem[];
  awards: AwardFormItem[];
  publications: PublicationFormItem[];
  certifications: CertificationFormItem[];
}
