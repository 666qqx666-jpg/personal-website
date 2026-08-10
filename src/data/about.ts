import { deepFreeze, resumeFacts } from './resume/facts';
import type { DeepReadonly, ResumeProject, ResumeProjectId } from './resume/types';

export interface AboutMetric {
  value: string;
  label: string;
  note?: string;
}

export interface AboutOverview {
  id: 'business' | 'ai';
  eyebrow: string;
  title: string;
  description: string;
  metrics: readonly AboutMetric[];
}

export interface AboutProjectView {
  project: DeepReadonly<ResumeProject>;
  responsibilityLabel: '本人职责' | '具体实现';
  href: string;
  linkLabel: string;
  external: boolean;
}

export interface AboutProjectGroup {
  id: 'ai-practice' | 'commercial';
  eyebrow: string;
  title: string;
  description: string;
  projects: readonly AboutProjectView[];
}

const projectById = new Map(resumeFacts.projects.map((project) => [project.id, project]));

const getProject = (id: ResumeProjectId) => {
  const project = projectById.get(id);
  if (!project) throw new Error(`Unknown about project: ${id}`);
  return project;
};

const view = (
  id: ResumeProjectId,
  href: string,
  linkLabel = '查看完整项目故事',
  external = false,
  responsibilityLabel: AboutProjectView['responsibilityLabel'] = '本人职责',
): AboutProjectView => ({ project: getProject(id), href, linkLabel, external, responsibilityLabel });

export const aboutData = deepFreeze({
  kicker: 'AI PRODUCT MANAGER · HANGZHOU',
  headline: '把复杂业务系统，做成可落地的 AI 产品',
  location: '杭州',
  capabilities: ['Agent 工作流', '复杂业务建模', 'RAG / Context', '数据与技术协作'],
  overviews: [
    {
      id: 'business',
      eyebrow: '商业产品基本盘',
      title: '复杂业务系统的 4 年积累',
      description: 'CRM、权限、数据、交易与营销',
      metrics: [
        { value: '4 年', label: '企业服务产品经验' },
        { value: '5 类', label: '核心产品域' },
        { value: '15,000', label: '销售线索系统上线门店' },
        { value: '876 万', label: '客户主体下会员记录', note: '不是独立自然人数' },
      ],
    },
    {
      id: 'ai',
      eyebrow: 'AI 产品实践',
      title: '企业 Agent 工作流已进入真实交付',
      description: '交付工作流与企业知识平台协同',
      metrics: [
        { value: '100%', label: '产品部门工作流覆盖' },
        { value: '约 2 周', label: 'PRD 达到可交付状态' },
        { value: '50%', label: 'PRD 审查时长节省' },
        { value: '2 层', label: '交付工作流 + 知识平台' },
      ],
    },
  ] satisfies AboutOverview[],
  projectGroups: [
    {
      id: 'ai-practice',
      eyebrow: '01 · AI 产品实践',
      title: 'AI 能力如何进入真实工作',
      description: '从企业产品交付工作流，到企业知识与上下文平台。',
      projects: [
        view('ai', 'ai/skill-desk/', '查看产品交付工作流'),
        view('knowledge', 'ai/knowledge-harness/'),
        view(
          'site',
          'https://github.com/666qqx666-jpg/personal-website',
          '查看网站源码',
          true,
          '具体实现',
        ),
      ],
    },
    {
      id: 'commercial',
      eyebrow: '02 · 商业项目经历',
      title: '项目经历',
      description: '针对大型企业的定制开发。',
      projects: [
        view('sales', 'projects/sales-lead-slm/'),
        view('permissions', 'projects/enterprise-permissions/'),
        view('analytics', 'projects/group-business-analytics/'),
        view('membership', 'projects/membership-operations/'),
        view('parking', 'projects/smart-parking/'),
      ],
    },
  ] satisfies AboutProjectGroup[],
});
