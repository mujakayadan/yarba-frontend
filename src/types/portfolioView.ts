/** Portfolio shape used by the portfolio view page (API response). */
export interface ViewPortfolio {
  _id: string;
  user_id: string;
  profile_id: string;
  career_summary?: {
    job_titles: string[];
    years_of_experience: string;
    default_summary: string;
    default_job_title?: string;
  };
  skills?: Array<{
    category: string;
    items?: string[];
    skills?: string[];
  }>;
  work_experience?: {
    job_title?: string;
    company: string;
    position?: string;
    location?: string;
    time?: string;
    start_date?: string;
    end_date?: string;
    current?: boolean;
    description?: string;
    responsibilities?: string[];
    achievements?: string[];
  }[];
  education?: {
    institution?: string;
    university_name?: string;
    degree: string;
    degree_type?: string;
    field_of_study?: string;
    location?: string;
    time?: string;
    start_date?: string;
    end_date?: string;
    current?: boolean;
    description?: string;
    courses?: string[];
    GPA?: string;
    transcript?: string[];
  }[];
  projects?: {
    name: string;
    description?: string;
    bullet_points?: string[];
    date?: string;
    url?: string;
    link?: string;
    start_date?: string;
    end_date?: string;
    current?: boolean;
    technologies?: string[];
    achievements?: string[];
  }[];
  certifications?: {
    name: string;
    issuer: string;
    date: string;
    url?: string;
    description?: string;
  }[];
  awards?: {
    title?: string;
    name?: string;
    issuer?: string;
    date?: string;
    description?: string;
    explanation?: string;
  }[];
  publications?: {
    title?: string;
    name?: string;
    publisher?: string;
    date?: string;
    time?: string;
    url?: string;
    link?: string;
    description?: string;
    authors?: string[];
  }[];
  created_at?: string;
  updated_at?: string;
}

export interface PortfolioViewSortedData {
  sortedWorkExperience: NonNullable<ViewPortfolio['work_experience']>;
  sortedEducation: NonNullable<ViewPortfolio['education']>;
  sortedProjects: NonNullable<ViewPortfolio['projects']>;
  sortedCertifications: NonNullable<ViewPortfolio['certifications']>;
  sortedAwards: NonNullable<ViewPortfolio['awards']>;
  sortedPublications: NonNullable<ViewPortfolio['publications']>;
}

export interface PortfolioViewTabProps {
  portfolio: ViewPortfolio;
  sorted: PortfolioViewSortedData;
}
