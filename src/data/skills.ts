export interface SkillGroup {
  group: string;
  items: string[];
}

export const skillGroups: SkillGroup[] = [
  { group: '产品能力', items: ['需求分析', '竞品分析', 'PRD 撰写', '数据驱动', '用户研究', '项目管理'] },
  { group: 'AI 工具栈', items: ['Claude / Claude Code', 'Prompt 工程', 'RAG', 'Agent 工作流', 'Cursor', 'Astro'] },
  { group: '协作', items: ['飞书', 'Figma', 'Axure', 'SQL'] },
];
