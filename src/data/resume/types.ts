export type ResumeVariantId = 'master' | 'ai' | 'b2b';
export type ResumeMode = 'full' | 'compact';
export type ResumeProjectId =
  | 'ai'
  | 'sales'
  | 'permissions'
  | 'analytics'
  | 'membership'
  | 'parking'
  | 'site';

export type DeepReadonly<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends readonly (infer Item)[]
    ? readonly DeepReadonly<Item>[]
    : T extends object
      ? { readonly [Key in keyof T]: DeepReadonly<T[Key]> }
      : T;

export interface ResumeIdentity {
  readonly name: string;
  readonly email: string;
  readonly site: string;
  readonly links: readonly { readonly label: string; readonly href: string }[];
}

export interface Job {
  readonly company: string;
  readonly title: string;
  readonly period: string;
  readonly highlights: readonly string[];
}

export interface Education {
  readonly school: string;
  readonly major: string;
  readonly period: string;
}

export interface ResumeProjectCopy {
  readonly background: string;
  readonly actions: readonly string[];
  readonly results: readonly string[];
}

export interface ResumeProject {
  readonly id: ResumeProjectId;
  readonly name: string;
  readonly role: string;
  readonly period: string;
  readonly state: string;
  readonly responsibilities: readonly string[];
  readonly copy: {
    readonly master: ResumeProjectCopy;
    readonly compact: ResumeProjectCopy;
  };
  readonly tags: readonly string[];
}

export interface ResumeFacts {
  readonly identity: ResumeIdentity;
  readonly jobs: readonly Job[];
  readonly education: readonly Education[];
  readonly certifications: readonly string[];
  readonly tools: readonly string[];
  readonly projects: readonly ResumeProject[];
}

export interface ResumeVariantConfig {
  readonly id: ResumeVariantId;
  readonly label: string;
  readonly target: string;
  readonly summary: string;
  readonly capabilities: readonly string[];
  readonly mode: ResumeMode;
  readonly leadProjectId?: ResumeProjectId;
  readonly projectIds: readonly ResumeProjectId[];
  readonly shortProjectId?: ResumeProjectId;
  readonly showTags: boolean;
}

export interface ResumeDocument extends ResumeVariantConfig {
  readonly identity: ResumeIdentity;
  readonly jobs: readonly Job[];
  readonly education: readonly Education[];
  readonly certifications: readonly string[];
  readonly tools: readonly string[];
  readonly leadProject?: ResumeProject;
  readonly projects: readonly ResumeProject[];
  readonly shortProject?: ResumeProject;
}
