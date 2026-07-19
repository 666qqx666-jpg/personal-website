export type ResumeVariantId = 'master' | 'ai' | 'b2b';
export type ResumeMode = 'full' | 'compact';
export type ResumeProjectId = 'ai' | 'sales' | 'permissions' | 'analytics' | 'membership' | 'parking';

export interface ResumeIdentity {
  name: string;
  email: string;
  site: string;
  links: { label: string; href: string }[];
}

export interface Job {
  company: string;
  title: string;
  period: string;
  highlights: string[];
}

export interface Education {
  school: string;
  major: string;
  period: string;
}

export interface ResumeProjectCopy {
  background: string;
  actions: string[];
  results: string[];
}

export interface ResumeProject {
  id: ResumeProjectId;
  name: string;
  role: string;
  period: string;
  state: string;
  responsibilities: string[];
  copy: {
    master: ResumeProjectCopy;
    compact: ResumeProjectCopy;
  };
  tags: string[];
}

export interface ResumeFacts {
  identity: ResumeIdentity;
  jobs: Job[];
  education: Education[];
  certifications: string[];
  tools: string[];
  projects: ResumeProject[];
}

export interface ResumeVariantConfig {
  id: ResumeVariantId;
  label: string;
  target: string;
  summary: string;
  capabilities: string[];
  mode: ResumeMode;
  leadProjectId?: ResumeProjectId;
  projectIds: ResumeProjectId[];
  shortProjectId?: ResumeProjectId;
  showTags: boolean;
}

export interface ResumeDocument extends ResumeVariantConfig {
  identity: ResumeIdentity;
  jobs: Job[];
  education: Education[];
  certifications: string[];
  tools: string[];
  leadProject?: ResumeProject;
  projects: ResumeProject[];
  shortProject?: ResumeProject;
}
