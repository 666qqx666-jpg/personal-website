import { resumeFacts } from './resume/facts';

export interface ResumeDownload {
  readonly label: string;
  readonly href: string;
}

const primaryResume = {
  label: 'AI 产品经理版',
  href: 'resume.pdf',
} as const satisfies ResumeDownload;

export interface Profile {
  name: string;
  intent: string; // 求职意向（首页 hero）
  summary: string; // 一句话职业概要
  typewriter: string[]; // 打字机轮播短语
  email: string;
  links: { label: string; href: string }[];
  resumePdf: string; // PDF 路径（相对 BASE_URL）
  readonly resumeDownloads: readonly ResumeDownload[];
}

export const profile: Profile = {
  name: resumeFacts.identity.name,
  intent: '求职意向：AI 产品经理',
  summary:
    '4 年企业服务产品经验，覆盖 CRM、权限、数据、交易与营销场景；已将个人 AI Agent 工作台用于真实产品交付。',
  typewriter: [
    '企业服务产品 → AI 产品经理',
    '复杂规则 / 权限 / 数据建模',
    'Agent 工作流，真实业务自用',
  ],
  email: resumeFacts.identity.email,
  links: [
    { label: 'CSDN', href: 'https://blog.csdn.net/weixin_50178621' },
    { label: 'GitHub', href: 'https://github.com/666qqx666-jpg' },
  ],
  resumePdf: primaryResume.href,
  resumeDownloads: [
    primaryResume,
    { label: 'B2B / SaaS 版', href: 'resume-b2b-saas.pdf' },
  ],
};
