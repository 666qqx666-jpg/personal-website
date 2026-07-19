import { deepFreeze, resumeFacts } from './facts';
import type { DeepReadonly, ResumeDocument, ResumeProjectId, ResumeVariantConfig, ResumeVariantId } from './types';

export const resumeVariantIds = deepFreeze<ResumeVariantId[]>(['master', 'ai', 'b2b']);

const variants = deepFreeze<Record<ResumeVariantId, ResumeVariantConfig>>({
  master: {
    id: 'master',
    label: '完整版内容母稿',
    target: 'AI 产品经理 / B2B SaaS 产品经理',
    summary:
      '4 年企业服务产品经验，覆盖 CRM、权限、数据、交易与营销场景；具备计算机背景，并已将个人 AI Agent 工作台用于真实产品交付。',
    capabilities: ['AI Agent 工作流', '复杂业务建模', 'B2B / SaaS 产品规划', '数据与技术协作'],
    mode: 'full',
    leadProjectId: 'ai',
    projectIds: ['sales', 'permissions', 'analytics', 'membership', 'parking'],
    showTags: true,
  },
  ai: {
    id: 'ai',
    label: 'AI 产品经理一页版',
    target: 'AI 产品经理｜AI + 企业服务 / SaaS',
    summary:
      '4 年企业服务产品经验，能够处理复杂规则、权限、状态与数据模型；已将 Agent 工作流用于真实产品任务，并用商业项目证明落地与协作能力。',
    capabilities: ['Agent 工作流设计', '复杂业务建模', 'PRD / Spec 交付', '技术与数据协作'],
    mode: 'compact',
    leadProjectId: 'ai',
    projectIds: ['sales', 'permissions'],
    showTags: false,
  },
  b2b: {
    id: 'b2b',
    label: 'B2B / SaaS 产品经理一页版',
    target: 'B2B / SaaS 产品经理',
    summary:
      '4 年企业服务产品经验，主导或承接 CRM、权限、经营分析、交易与营销模块，擅长把复杂组织、业务规则和数据口径转化为可落地产品方案。',
    capabilities: ['B2B / SaaS 产品规划', '权限与流程建模', '数据产品设计', '跨团队交付'],
    mode: 'compact',
    projectIds: ['sales', 'permissions', 'analytics'],
    shortProjectId: 'ai',
    showTags: false,
  },
});

const projectById = new Map(resumeFacts.projects.map((project) => [project.id, project]));

function resolveProject(id: ResumeProjectId) {
  const project = projectById.get(id);
  if (!project) throw new Error(`Unknown resume project: ${id}`);
  return project;
}

export function getResumeDocument(id: ResumeVariantId): DeepReadonly<ResumeDocument> {
  const config = variants[id];
  return deepFreeze({
    ...config,
    identity: resumeFacts.identity,
    jobs: resumeFacts.jobs,
    education: resumeFacts.education,
    certifications: resumeFacts.certifications,
    tools: resumeFacts.tools,
    leadProject: config.leadProjectId ? resolveProject(config.leadProjectId) : undefined,
    projects: config.projectIds.map(resolveProject),
    shortProject: config.shortProjectId ? resolveProject(config.shortProjectId) : undefined,
  } satisfies ResumeDocument);
}
