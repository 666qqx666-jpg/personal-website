export interface SkillGroup {
  group: string;
  items: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    group: '产品能力',
    items: ['需求分析', 'CRM / SaaS', '复杂业务建模', '权限与流程设计', '数据产品', 'PRD / Spec', 'Axure 原型', '项目推动'],
  },
  { group: '技术背景', items: ['Java', 'SpringMVC', '阿里云大数据数仓', 'SQL'] },
  { group: 'AI 产品实践', items: ['Agent 工作流', 'RAG / 上下文治理', 'Claude', 'Codex', 'OpenClaw', 'Obsidian'] },
  { group: '认证', items: ['NPDP', 'PMP', '信息系统项目管理师'] },
];
