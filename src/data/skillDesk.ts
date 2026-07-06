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

export interface WeeklyRetroSection {
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
    problem: 'AI 要变得好用，不能只看它产出了什么，还要复盘我如何提问、拆解任务和定义目标。',
    category: '复盘',
    useCases: ['AI 使用复盘', '提示词审查', '任务拆解反思', '系统候选草稿'],
    outputs: ['周度复盘报告', '协作问题清单', '反思入口', '系统候选'],
    maturity: 'iterating',
    maturityLabel: '迭代中',
    productization: 'team-template',
    productizationLabel: '团队模板',
    href: '/ai/skill-desk/weekly-retro/',
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

export const weeklyRetroTimeline = [
  ['s1', '入口'],
  ['s2', '起点'],
  ['s3', '提示词'],
  ['s4', '发现'],
  ['s5', 'Skill化'],
  ['s6', '单Agent'],
  ['s7', '多Agent'],
  ['s8', '周报'],
  ['s9', '收口'],
  ['s10', '变好'],
] as const;

export const weeklyRetroOriginalPrompt = `请帮我审查 5.25-5.31 在 Claude 的实际使用情况，并输出一份周度复盘报告。

分析范围：
1. 检查这一周 Claude 产生的缓存文件、会话记录、技能目录和项目产物。
2. 统计这一周的总使用时长，并按主要项目估算投入时间和精力分布。
3. 按项目梳理我做过的事情、产出的文件、以及中间是否有重复劳动或低效步骤。
4. 审查几个主要项目中的用户提示词、对话推进过程和任务拆解方式，指出哪里提问不清楚、约束不完整、目标定义不准确。
5. 总结我这一周使用 Claude 时最常见的思维问题和协作问题，并给出可执行的优化建议。

输出要求：
1. 先给总览：总时长、主要项目、缓存和产物概况。
2. 再按项目分别分析：做了什么、花了多久、哪里效率低、提示词哪里可以改。
3. 最后给一个“我的 Claude 使用优化建议”，重点讲我的提问方式、任务拆解习惯、目标定义方式和思维逻辑如何提升。
4. 如果时间统计无法做到精确，请明确说明你的估算口径。`;

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

export const weeklyRetroSections: WeeklyRetroSection[] = [
  {
    id: 's2',
    label: '02 · 起点',
    chapter: 'Original Question',
    heading: '起点：我想知道，怎么让 AI 真的变得好用',
    insight: '最早的问题不是“帮我总结工作”，而是“帮我审查我这一周是怎么使用 Claude 的”。这已经把焦点从 AI 产出，转到了人与 AI 的协作方式。',
    points: ['我关心的不是 Claude 是否能生成内容，而是它有没有帮我更高效地推进事情。', '复盘对象包括缓存、会话记录、技能目录、项目产物和真实投入。', '核心目标是发现我的提问方式、任务拆解和目标定义哪里出了问题。'],
    visualTitle: '问题转向',
    visualItems: ['AI 产出', '我的提问', '任务拆解', '目标定义'],
  },
  {
    id: 's3',
    label: '03 · 固定提示词',
    chapter: 'Fixed Prompt',
    heading: '固定提示词：从会话、缓存和产物里找问题',
    insight: '第一版就是一段很长的固定 prompt：审查 5.25-5.31 的 Claude 使用情况，统计使用时长，按项目梳理产物、重复劳动和低效步骤。',
    points: ['分析范围明确到缓存文件、会话记录、技能目录和项目产物。', '输出要按项目说明做了什么、花了多久、哪里效率低。', '最后必须给出“我的 Claude 使用优化建议”，重点看提问、拆解、目标定义和思维逻辑。'],
    visualTitle: '固定审查维度',
    visualItems: ['缓存', '会话', '产物', '时间', '提示词'],
  },
  {
    id: 's4',
    label: '04 · 第一层发现',
    chapter: 'First Finding',
    heading: '第一层发现：低效不只在 AI，也在我的协作方式',
    insight: '固定 prompt 的价值在于，它逼我承认一个事实：AI 不好用，有时不是模型不行，而是我的问题定义、约束表达和任务拆分不够清楚。',
    points: ['有些重复劳动来自任务目标没有一开始说清。', '有些返工来自约束不完整，AI 只能边做边猜。', '有些“AI 不懂我”，其实是我没有给出验收口径。'],
    visualTitle: '协作问题',
    visualItems: ['提问不清', '约束缺失', '目标漂移', '验收不明'],
  },
  {
    id: 's5',
    label: '05 · Skill 化',
    chapter: 'Skillization',
    heading: 'Skill 化：把一次性复盘变成稳定流程',
    insight: '固定 prompt 有用，但它每次都要复制、调整和重新解释。下一步就是把它收进 methodology / retro，让复盘变成稳定触发的 skill。',
    points: ['周报不再只靠手写 prompt，而是有固定的证据收集、项目分析和优化建议结构。', '报告开始沉淀为每周记录，成为后续方法论变化的原始材料。', '复盘对象从“这周做了什么”扩展到“这周我是怎么和 AI 协作的”。'],
    visualTitle: '从 prompt 到 skill',
    visualItems: ['固定提示词', '流程封装', '周报记录', '方法候选'],
  },
  {
    id: 's6',
    label: '06 · 单 Agent 局限',
    chapter: 'Single Agent Limit',
    heading: '单 agent 的局限：让一个 AI 审查全部，会有视角偏差',
    insight: '当复盘从 prompt 变成 skill 后，新的问题出现了：如果只让一个 agent 审查所有东西，它会把自己的可见范围、偏好和盲区带进最终报告。',
    points: ['Claude 更容易解释自己看得到的会话，却看不到 Codex 的工具调用细节。', 'Codex 更擅长落盘证据和命令验证，却可能低估对话过程中的意图变化。', '单一审计者会让报告看起来完整，但不一定可信。'],
    visualTitle: '单视角偏差',
    visualItems: ['可见范围', '工具偏好', '证据盲区', '解释偏差'],
  },
  {
    id: 's7',
    label: '07 · 多 Agent 插曲',
    chapter: 'Multi-Agent Check',
    heading: '多 agent 插曲：Claude / Codex 自评、互审、裁判综合',
    insight: '于是中间出现了一个小插曲：复盘不再交给单个 agent，而是让 Claude 和 Codex 分别自评，再互相审查，最后由裁判综合。',
    points: ['Claude 只复盘 Claude 证据，Codex 只复盘 Codex 证据。', '交叉审查专门挑对方的覆盖不足、重复计数和证据边界。', '裁判综合不重新发散，只基于证据、自评和互审做判断。'],
    visualTitle: '视角校验',
    visualItems: ['Claude 自评', 'Codex 自评', '互相挑错', '裁判综合'],
  },
  {
    id: 's8',
    label: '08 · 新的问题',
    chapter: 'New Problem',
    heading: '新的问题：报告更完整了，但人还没真正反思',
    insight: '多 agent 让报告更扎实，但也让报告更像审计材料。信息变多以后，用户仍然可能只看结论，不进入真正的自我修正。',
    points: ['完整报告解决了事实可信度，却没有自动解决反思发生。', '系统问题、普通感受、方法变化混在一起，仍然需要分流。', '如果没有收口机制，复盘又会变成一份“很完整但离我很远”的文档。'],
    visualTitle: '完整但未发生',
    visualItems: ['证据更强', '报告更长', '反思未发生', '候选混杂'],
  },
  {
    id: 's9',
    label: '09 · 复盘后干什么',
    chapter: 'After Retro',
    heading: '复盘后干什么：线头更新、卡片生成和索引维护',
    insight: '追问不是终点。真正的收口发生在追问之后：把普通反思写回周报，把系统问题更新到线头看板，把可复用经验变成能力层规则或正式知识卡，并补上索引。',
    points: ['普通反思写回周报补充区，保留当周上下文和用户原话。', '系统问题先进入候选草稿或线头看板，写清再触发条件和当前状态。', '确认可复用后，再生成能力层规则或正式知识域卡片，并同步 README、材料索引、拆卡索引或裁决记录。'],
    visualTitle: '复盘后收口链',
    visualItems: ['反思写回', '线头更新', '能力层规则', '正式知识卡', '索引维护'],
  },
  {
    id: 's10',
    label: '10 · 收束',
    chapter: 'Make AI Better',
    heading: '最终价值：让 AI 使用方式持续变好',
    insight: 'weekly-retro 的价值不是替我写周报，而是持续审查我如何使用 AI：问题是否清楚、目标是否准确、约束是否完整、任务拆解是否合理。',
    points: ['当前形态是个人 AI 使用复盘 workflow。', '团队复用潜力在于把“怎么和 AI 协作”变成可讨论、可训练、可改进的 SOP。', '企业级潜力在于把 AI 使用证据、协作审查和组织方法库打通。'],
    visualTitle: '产品化判断',
    visualItems: ['个人复盘', '团队 SOP', 'AI 使用训练', '企业方法库'],
  },
];
