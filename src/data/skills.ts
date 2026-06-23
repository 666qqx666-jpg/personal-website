export interface SkillGroup {
  group: string;
  items: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    group: '产品能力',
    items: ['需求分析', 'CRM / SaaS', '会员运营', '数据分析', '系统架构设计', 'PRD 撰写', 'Axure 原型', '项目管理'],
  },
  { group: '技术背景', items: ['Java', 'SpringMVC', '阿里云大数据数仓', 'SQL'] },
  { group: 'AI 探索', items: ['Claude / Claude Code', 'Prompt 工程', 'RAG', 'Agent 工作流', 'Cursor'] },
  { group: '认证', items: ['NPDP', 'PMP', '信息系统项目管理师'] },
];
