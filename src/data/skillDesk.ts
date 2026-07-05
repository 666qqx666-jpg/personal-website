export type SkillMaturity = 'stable' | 'iterating' | 'roadmap';
export type Productization = 'personal' | 'team-template' | 'open-source-candidate' | 'enterprise-candidate';

export interface SkillDeskItem {
  slug: string;
  name: string;
  title: string;
  problem: string;
  category: string;
  useCases: string[];
  outputs: string[];
  maturity: SkillMaturity;
  maturityLabel: string;
  productization: Productization;
  productizationLabel: string;
  href?: string;
}

export interface ReadingDialogueSection {
  id: string;
  label: string;
  chapter: string;
  heading: string;
  insight: string;
  points: string[];
  visualTitle: string;
  visualItems: string[];
}

export const deskTabs = ['全部', '阅读与沉淀', '复盘', 'PRD / Spec', '研究与分析', '产品化候选'];

export const skillDeskItems: SkillDeskItem[] = [
  {
    slug: 'reading-dialogue',
    name: 'reading-dialogue',
    title: '深度阅读对话',
    problem: '读完长文后，触动、质疑和迁移灵感容易散掉。',
    category: '阅读与沉淀',
    useCases: ['划线交流', '主题深挖', '候选卡片池', '知识入库'],
    outputs: ['阅读对话笔记', '候选卡片', '入库门禁', '裁决记录'],
    maturity: 'stable',
    maturityLabel: '稳定使用',
    productization: 'open-source-candidate',
    productizationLabel: '开源候选',
    href: '/ai/skill-desk/reading-dialogue/',
  },
  {
    slug: 'weekly-retro',
    name: 'methodology / weekly-retro',
    title: '周度复盘反思',
    problem: '静态周报离人太远，需要报告后自动进入一题一题的反思对话。',
    category: '复盘',
    useCases: ['周报后反思', '系统候选草稿', '复盘补充区'],
    outputs: ['反思入口', '普通小结', '系统候选', '写回补充区'],
    maturity: 'iterating',
    maturityLabel: '迭代中',
    productization: 'team-template',
    productizationLabel: '团队模板',
  },
  {
    slug: 'prd-writer',
    name: 'prd-writer',
    title: 'PRD 写作',
    problem: '模糊需求需要先关闭用户、价值、边界和模糊词，再进入开发链路。',
    category: 'PRD / Spec',
    useCases: ['需求澄清', 'PRD 成稿', '模糊词扫描'],
    outputs: ['PRD 草稿', '待确认清单', 'spec-readiness 信号'],
    maturity: 'stable',
    maturityLabel: '稳定使用',
    productization: 'team-template',
    productizationLabel: '团队模板',
  },
  {
    slug: 'prd-review',
    name: 'prd-review',
    title: 'PRD 审查',
    problem: '结构漂亮的 PRD 仍可能缺状态组合、失败路径、枚举关闭和单一真相。',
    category: 'PRD / Spec',
    useCases: ['spec-readiness', '边界条件', '状态组合', '验收矩阵'],
    outputs: ['审查等级', 'Blocker 清单', '回填建议'],
    maturity: 'stable',
    maturityLabel: '稳定使用',
    productization: 'enterprise-candidate',
    productizationLabel: '企业候选',
  },
  {
    slug: 'competitive-analysis',
    name: 'competitive-analysis',
    title: '竞品分析',
    problem: '竞品报告不能只堆功能，需要从产品负责人视角判断机会和取舍。',
    category: '研究与分析',
    useCases: ['竞品选择', '差异化机会', '报告结构'],
    outputs: ['竞品报告', '机会判断', '需求转化建议'],
    maturity: 'stable',
    maturityLabel: '稳定使用',
    productization: 'team-template',
    productizationLabel: '团队模板',
  },
  {
    slug: 'digest',
    name: 'digest',
    title: '对话沉淀',
    problem: '有价值的对话如果不裁决去向，会污染正式知识域或丢在聊天里。',
    category: '阅读与沉淀',
    useCases: ['对话整理', '经验沉淀', '三层知识库写回'],
    outputs: ['原文层材料', '正式知识卡', '能力层候选'],
    maturity: 'iterating',
    maturityLabel: '迭代中',
    productization: 'personal',
    productizationLabel: '个人工作流',
  },
];

export const productLanes = [
  { title: '个人 workflow', copy: '先服务作者自己的高频工作，保留真实失败和修正痕迹。' },
  { title: '团队内部 SOP', copy: '沉淀成团队可复用的输入、输出、检查清单和评审节奏。' },
  { title: 'GitHub 开源项目', copy: '抽象成 Markdown-first 模板、CLI、示例材料和裁决表。' },
  { title: '企业级工具', copy: '补权限、多人协作、引用溯源、审核流和组织级指标。' },
];

export const readingTimeline = [
  ['s1', '入口'],
  ['s2', '问题'],
  ['s3', '直觉'],
  ['s4', '事故'],
  ['s5', '反思'],
  ['s6', '档位'],
  ['s7', '刹车'],
  ['s8', '候选'],
  ['s9', '门禁'],
  ['s10', '资产'],
] as const;

export const readingDialogueSections: ReadingDialogueSection[] = [
  {
    id: 's2',
    label: '02 · 原始问题',
    chapter: 'Original Problem',
    heading: '原始问题：读完以后，想法会散掉',
    insight: '摘录保存了原文，但没有保存我为什么被击中、我想反驳什么、我能迁移到哪里。',
    points: ['划线只能证明这句话被看见。', '批注如果太短，未来任务仍然不知道它为什么重要。', '真正损耗的是阅读当下生成的判断和行动灵感。'],
    visualTitle: '摘录 vs 判断',
    visualItems: ['原文摘录', '触动原因', '质疑与反例', '迁移场景'],
  },
  {
    id: 's3',
    label: '03 · 第一版直觉',
    chapter: 'First Instinct',
    heading: '第一版直觉：多轮追问越深越好',
    insight: '第一版思路是围绕划线、批注和触动点连续追问，让读者从"这句重要"说到"它为什么对我重要"。',
    points: ['先问为什么划这句。', '再问认同、反感、意外还是联想到工作。', '把模糊感受压成可以记录的最小判断。'],
    visualTitle: '追问分叉',
    visualItems: ['划线', '为什么触动', '前提与反例', '行动灵感'],
  },
  {
    id: 's4',
    label: '04 · 事故现场',
    chapter: 'Failure Case',
    heading: '事故现场：《置身钉内》里的失控',
    insight: '多轮深聊很有价值，但没有边界时会从阅读讨论滑到产品共创。',
    points: ['话题从阅读感受进入企业 AI 和责任流。', '继续推进后出现 AI 提醒小助手、V0、owner、风险池和指标。', '这暴露了一个问题：深度阅读 skill 需要知道什么时候已经切档。'],
    visualTitle: '讨论偏航',
    visualItems: ['阅读交流', '主题深挖', '产品共创', '流程设计'],
  },
  {
    id: 's5',
    label: '05 · 关键反思',
    chapter: 'Reflection',
    heading: '关键反思：深度不是无限展开',
    insight: '真正的深度不是一直追问，而是知道此刻处在什么档位，并在到点时停靠确认。',
    points: ['阅读交流要保护用户自己的触动。', '主题深挖要围绕一个问题逐步收口。', '产品共创必须显式提醒，不能悄悄接管阅读任务。'],
    visualTitle: '刹车系统',
    visualItems: ['识别档位', '限制轮次', '停靠确认', '再决定沉淀'],
  },
  {
    id: 's6',
    label: '06 · 实现一',
    chapter: 'Control 01',
    heading: '实现一：三档模式',
    insight: 'reading-dialogue 被拆成划线交流档、主题深挖档和产品共创档。',
    points: ['划线交流档围绕具体划线和批注聊为什么触动。', '主题深挖档围绕一个主题连续追问。', '产品共创档一旦出现页面、V0、指标或流程，就必须提醒用户正在切档。'],
    visualTitle: '三档状态机',
    visualItems: ['划线交流档', '主题深挖档', '产品共创档'],
  },
  {
    id: 's7',
    label: '07 · 实现二',
    chapter: 'Control 02',
    heading: '实现二：追问刹车',
    insight: '单条划线最多两轮，主题深挖默认最多五轮。达到上限后先停靠确认。',
    points: ['追问不是越多越好。', '用户跳过时不纠缠。', '到点后问：继续深挖，还是先沉淀这一段。'],
    visualTitle: '轮次计数器',
    visualItems: ['划线 1/2', '划线 2/2', '主题 1/5', '主题 5/5 停靠'],
  },
  {
    id: 's8',
    label: '08 · 实现三',
    chapter: 'Control 03',
    heading: '实现三：候选池，不直接制卡',
    insight: '阅读结束后先生成阅读对话笔记和候选卡片池，不把漂亮总结直接写进正式知识域。',
    points: ['用户原话、AI 推断、共创结论分开记录。', '不满足门槛的内容留在阅读笔记或原文层。', '正式卡片必须先确认观点、原因、边界、路由和来源。'],
    visualTitle: '三栏归因',
    visualItems: ['用户原话', 'AI 推断', '共创结论', '暂不沉淀'],
  },
  {
    id: 's9',
    label: '09 · 实现四',
    chapter: 'Control 04',
    heading: '实现四：入库门禁与卡片裁决',
    insight: '候选要判断新增、追加、合并、暂缓、丢弃或留原文层。正式入库后还要维护索引。',
    points: ['新增不是默认动作，合并和追加优先。', '能力层只承接会影响 agent 行为的规则。', '正式入库后同步 README、材料索引、拆卡索引和裁决记录。'],
    visualTitle: '六路裁决',
    visualItems: ['新增', '追加', '合并', '暂缓', '丢弃', '留原文层'],
  },
  {
    id: 's10',
    label: '10 · 收束',
    chapter: 'From Reading To Assets',
    heading: '收束：读书变成长期判断力',
    insight: '这个 skill 的价值不是替我读书，而是陪我把触动变成判断，把判断变成未来任务可调用的知识资产。',
    points: ['当前形态是个人深度阅读 workflow。', '团队复用潜力高，适合读书会、行业研究和产品复盘。', '开源潜力中高，可抽象成 Markdown-first pipeline、CLI、模板和裁决表。'],
    visualTitle: '产品化判断',
    visualItems: ['个人 workflow', '团队模板', '开源潜力', '企业级潜力'],
  },
];
