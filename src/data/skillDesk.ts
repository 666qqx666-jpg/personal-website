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
  variant?: 'absorbed';
  absorbedLabel?: string;
  absorbedNote?: string;
}

export interface SkillLabItem {
  slug: string;
  name: string;
  title: string;
  category: string;
  statusLabel: string;
  summary: string;
  validationTrigger: string;
  signals: string[];
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

export interface PrdSkillSection {
  id: string;
  label: string;
  chapter: string;
  heading: string;
  insight: string;
  points: string[];
  visualTitle: string;
  visualItems: string[];
}

export interface CompetitiveAnalysisSection {
  id: string;
  label: string;
  chapter: string;
  heading: string;
  insight: string;
  points: string[];
  visualTitle: string;
  visualItems: string[];
}

export interface RequirementDiscoverySection {
  id: string;
  label: string;
  chapter: string;
  heading: string;
  insight: string;
  points: string[];
  visualTitle: string;
  visualItems: string[];
}

export interface QuotationSection {
  id: string;
  label: string;
  chapter: string;
  heading: string;
  insight: string;
  points: string[];
  visualTitle: string;
  visualItems: string[];
}

export interface MemoryLoaderSection {
  id: string;
  label: string;
  chapter: string;
  heading: string;
  insight: string;
  points: string[];
  visualTitle: string;
  visualItems: string[];
}

export const deskTabs = ['全部', '阅读与沉淀', '复盘', 'PRD / Spec', '研究与分析', '交付与报价', '记忆控制', '产品化候选'];

export const skillDeskItems: SkillDeskItem[] = [
  {
    slug: 'reading-dialogue',
    name: 'reading-dialogue',
    title: '深度阅读对话',
    problem: '读完长文后，触动、质疑、迁移灵感和可能的需求构思容易散掉。',
    category: '阅读与沉淀',
    useCases: ['划线轻量交流', '主题深挖刹车', '观点知识卡', '需求构思候选池'],
    outputs: ['阅读对话笔记', '观点知识卡', '需求构思候选', '入库门禁'],
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
    slug: 'requirement-discovery',
    name: 'requirement-discovery',
    title: '需求头脑风暴',
    problem: '需求还没想清楚时，AI 很容易直接深度追问到方案设计；这个 skill 用来在 PRD 前先刹车。',
    category: 'PRD / Spec',
    useCases: ['需求来源判断', '角色影响拆分', '证据缺口', 'V0 收敛'],
    outputs: ['需求来源', '关键角色', '核心需求框架', 'Handoff 建议'],
    maturity: 'stable',
    maturityLabel: '稳定使用',
    productization: 'team-template',
    productizationLabel: '团队模板',
    href: '/ai/skill-desk/requirement-discovery/',
  },
  {
    slug: 'prd-skill',
    name: 'prd-writer / prd-review',
    title: 'PRD Skill',
    problem: '最初想让 AI 代替写需求文档，后来发现真正要产品化的是“写作、审查、封口、交付”的完整链路。',
    category: 'PRD / Spec',
    useCases: ['PRD 写作', 'PRD 冷启动审查', '双 agent 协作', 'spec-readiness'],
    outputs: ['PRD 正文', '关键决策记录', '审查报告', '封口清单'],
    maturity: 'stable',
    maturityLabel: '稳定使用',
    productization: 'enterprise-candidate',
    productizationLabel: '企业候选',
    href: '/ai/skill-desk/prd-skill/',
  },
  {
    slug: 'competitive-analysis',
    name: 'competitive-analysis',
    title: '竞品分析',
    problem: '竞品分析不能退化成资料汇编，而要回答看谁、看什么、学什么、避开什么，以及哪些能进 PRD。',
    category: '研究与分析',
    useCases: ['竞品选择', '模块选择', '偷师清单', 'PRD 输入'],
    outputs: ['竞品报告', '关键差异', '反向避坑', 'PRD 可用度'],
    maturity: 'stable',
    maturityLabel: '稳定使用',
    productization: 'team-template',
    productizationLabel: '团队模板',
    href: '/ai/skill-desk/competitive-analysis/',
  },
  {
    slug: 'quotation',
    name: 'quotation',
    title: '报价书生成',
    problem: '报价书不是把需求细拆成人天，而是把需求边界、交付风险和客户能理解的模块粒度组织成可沟通报价。',
    category: '交付与报价',
    useCases: ['需求提取', '工时估算', '客户可读模块', '飞书报价单'],
    outputs: ['报价预览', '模块拆分', '角色工时', '飞书报价书'],
    maturity: 'stable',
    maturityLabel: '稳定使用',
    productization: 'team-template',
    productizationLabel: '团队模板',
    href: '/ai/skill-desk/quotation/',
  },
  {
    slug: 'memory-loader',
    name: 'memory-loader / knowledge-context-pack',
    title: '记忆控制层',
    problem: '当 skill、知识卡和 agent 都变多以后，真正重要的不是让 AI 记得更多，而是让它知道此刻该读什么。',
    category: '记忆控制',
    useCases: ['按需加载 skill', '共享记忆入口', '索引路由', '上下文包'],
    outputs: ['context-pack', '加载理由', '未加载说明', '风险提示'],
    maturity: 'stable',
    maturityLabel: '稳定使用',
    productization: 'enterprise-candidate',
    productizationLabel: '企业候选',
    href: '/ai/skill-desk/memory-loader/',
  },
  {
    slug: 'digest',
    name: 'digest',
    title: 'Digest 方法组件',
    problem: '它不再作为独立 Skill Desk 展示；已经融入「周度复盘反思」，成为方法论抽取、候选拆分和入库裁决的内置环节。',
    category: '阅读与沉淀',
    useCases: ['方法论抽取', '候选拆分', '入库裁决', '周总结收口'],
    outputs: ['候选知识点', '方法论片段', '入库去向', '索引维护'],
    maturity: 'iterating',
    maturityLabel: '方法组件',
    productization: 'personal',
    productizationLabel: '已融入周报',
    href: '/ai/skill-desk/weekly-retro/#s3',
    variant: 'absorbed',
    absorbedLabel: '已融入周度复盘反思',
    absorbedNote: '不是独立 Skill Desk；点击查看它如何成为 weekly-retro 的前置能力。',
  },
];

export const skillLabItems: SkillLabItem[] = [
  {
    slug: 'prototype-design-workflow',
    name: 'prototype-design-workflow',
    title: '原型设计工作流',
    category: 'Lab / 待验证 skill',
    statusLabel: '待实战验证',
    summary: '已从过往原型经验中抽象出模式判断与门禁，但尚未经过完整真实项目打磨；暂不单独做详情页。',
    validationTrigger: '下一次基于 PRD、旧页面、截图或竞品参考做原型时，记录实际偏差、返工点和新增规则，再决定是否升级为 Skill Desk。',
    signals: ['模式判断', '三表门禁', '真实页面基线', '等待项目验证'],
  },
  {
    slug: 'multi-agent-collaboration',
    name: 'multi-agent-collaboration',
    title: '多 Agent 协作协议',
    category: 'Lab / 待验证 skill',
    statusLabel: '待实战验证',
    summary: '已抽象出 Mode Gate、手动任务包和 Judge 裁决模板，但还需要真实 PRD 写审或双观点分析样例验证协作成本与裁决质量。',
    validationTrigger: '下一次需要 Claude / Codex 分工写审 PRD、或让两个 agent 分别给产品与技术观点时，记录任务包是否减少来回复制、审查是否更冷启动、Judge 是否能稳定裁决。',
    signals: ['Mode Gate', '手动任务包', 'Judge 裁决', '等待样例验证'],
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
  ['s8', '分流'],
  ['s9', '门禁'],
  ['s10', '资产'],
] as const;

export const weeklyRetroTimeline = [
  ['s1', '入口'],
  ['s2', '起点'],
  ['s3', 'Digest'],
  ['s4', '提示词'],
  ['s5', '发现'],
  ['s6', 'Skill化'],
  ['s7', '单Agent'],
  ['s8', '多Agent'],
  ['s9', '周报'],
  ['s10', '收口'],
  ['s11', '变好'],
] as const;

export const prdSkillTimeline = [
  ['s1', '入口'],
  ['s2', '愿景'],
  ['s3', '模板'],
  ['s4', '返工'],
  ['s5', '工作流'],
  ['s6', '同框'],
  ['s7', '拆分'],
  ['s8', '双Agent'],
  ['s9', '关卡'],
  ['s10', '门禁'],
  ['s11', '交付'],
] as const;

export const competitiveAnalysisTimeline = [
  ['s1', '入口'],
  ['s2', '起点'],
  ['s3', '误区'],
  ['s4', '视角'],
  ['s5', '输入'],
  ['s6', '模块'],
  ['s7', '事实'],
  ['s8', '路径'],
  ['s9', '动作'],
  ['s10', '判断'],
] as const;

export const requirementDiscoveryTimeline = [
  ['s1', '入口'],
  ['s2', '失速'],
  ['s3', '反思'],
  ['s4', '档位'],
  ['s5', '来源'],
  ['s6', '角色'],
  ['s7', '证据'],
  ['s8', 'V0'],
  ['s9', '交接'],
  ['s10', '判断'],
] as const;

export const quotationTimeline = [
  ['s1', '入口'],
  ['s2', '愿景'],
  ['s3', '细拆'],
  ['s4', '事故'],
  ['s5', '反思'],
  ['s6', '边界'],
  ['s7', '模块'],
  ['s8', '估工'],
  ['s9', '飞书'],
  ['s10', '共识'],
] as const;

export const memoryLoaderTimeline = [
  ['s1', '入口'],
  ['s2', '塞入'],
  ['s3', '爆炸'],
  ['s4', '隐藏'],
  ['s5', '共享'],
  ['s6', '卡片'],
  ['s7', '索引'],
  ['s8', '包'],
  ['s9', '关系'],
  ['s10', '控制'],
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
    insight: '第一版思路是围绕划线、批注和触动点连续追问，让读者从"这句重要"说到"它为什么对我重要"；复盘后发现，第一轮更应该保护划线现场。',
    points: ['先问为什么划这句。', '再问这句话带来什么感触、收获或工作联想。', '默认只把模糊感受压成最小记录，不急着推进产品设计。'],
    visualTitle: '追问分叉',
    visualItems: ['划线', '为什么触动', '感触与收获', '工作联想'],
  },
  {
    id: 's4',
    label: '04 · 事故现场',
    chapter: 'Failure Case',
    heading: '事故现场：《置身钉内》里的失控',
    insight: '多轮深聊很有价值，但没有边界时会从阅读讨论滑到产品共创。',
    points: ['话题从阅读感受进入企业 AI 和责任流。', '继续推进后出现 AI 提醒小助手、V0、owner、风险池和指标。', '《置身钉内》现在只作为封档案例和事故现场，不再继续占用材料主线。'],
    visualTitle: '讨论偏航',
    visualItems: ['阅读交流', '主题深挖', '产品共创', '流程设计'],
  },
  {
    id: 's5',
    label: '05 · 关键反思',
    chapter: 'Reflection',
    heading: '关键反思：深度不是无限展开',
    insight: '真正的深度不是一直追问，而是知道此刻处在什么档位，并在到点时停靠确认；默认不推进到产品设计。',
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
    points: ['划线交流档默认问为什么划线、有什么感触、联想到什么经验。', '主题深挖档必须由用户明确要求继续深挖。', '只有明确切档后，才进入需求发现或产品文档工作流。'],
    visualTitle: '三档状态机',
    visualItems: ['划线交流档', '主题深挖档', '需求构思档'],
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
    heading: '实现三：三分流收口',
    insight: '阅读结束后先分流到阅读笔记、观点知识卡和需求构思候选池，不把漂亮总结直接写进正式知识域。',
    points: ['普通感悟留在阅读笔记。', '可复用判断进入观点知识卡，等待入库门禁。', '需求构思候选池不是灵感池，只收明确问题 / 场景 + 产品或需求雏形。'],
    visualTitle: '三路收口',
    visualItems: ['阅读笔记', '观点知识卡', '需求构思候选池', '暂不沉淀'],
  },
  {
    id: 's9',
    label: '09 · 实现四',
    chapter: 'Control 04',
    heading: '实现四：入库门禁与卡片裁决',
    insight: '观点知识卡要判断新增、追加、合并、暂缓、丢弃或留原文层；需求构思成熟后再交给需求发现或产品文档工作流。',
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
    points: ['当前形态是 V2 重点修正的个人深度阅读 workflow。', '团队复用潜力高，适合读书会、行业研究和产品复盘。', '开源潜力中高，可抽象成 Markdown-first pipeline、CLI、模板和裁决表。'],
    visualTitle: '产品化判断',
    visualItems: ['个人 workflow', '团队模板', '开源潜力', '企业级潜力'],
  },
];

export const weeklyRetroSections: WeeklyRetroSection[] = [
  {
    id: 's2',
    label: '02 · 起点',
    chapter: 'Original Question',
    heading: '起点：我想让 AI 使用方式持续变好',
    insight: '一开始的问题不是“写一份周报”，而是我发现很多 AI 对话里藏着可复用的知识点和方法论。如果这些东西能被抽出来，后续 AI 协作就会越来越顺。',
    points: ['我关心的不是 AI 是否能生成内容，而是它能不能把每次对话里的经验留下来。', '最早承接这个想法的是 digest：主动总结对话、抽知识点、沉淀到知识库。', '真正目标是让 AI 使用方式持续改善，而不是让知识继续散在聊天里。'],
    visualTitle: '问题转向',
    visualItems: ['高价值对话', '知识点', '方法论', 'AI 变好用'],
  },
  {
    id: 's3',
    label: '03 · 早期 digest',
    chapter: 'Active Digest',
    heading: '早期 digest：主动沉淀对话里的知识点',
    insight: 'digest 最早解决的是“哪些对话值得总结沉淀”。它会把对话里的知识点、方法论片段和入库去向抽出来，再判断要不要进入知识库。',
    points: ['第一版依赖主动触发：我想起来说“沉淀一下”，它才会工作。', '它的有效部分是抽离方法论、拆候选、判断去向。', '它的问题也很明显：越忙、越有价值的对话，越可能因为没有主动触发而错过。'],
    visualTitle: '主动沉淀',
    visualItems: ['触发 digest', '总结对话', '抽知识点', '判断去向'],
  },
  {
    id: 's4',
    label: '04 · 固定提示词',
    chapter: 'Weekly Prompt',
    heading: '优化成周复盘：从主动触发改成周期审查',
    insight: 'digest 太依赖主动触发，于是下一步变成固定的周复盘 prompt：不再等我想起来沉淀，而是定期审查一周 Claude 使用情况、产物和协作方式。',
    points: ['分析范围明确到缓存文件、会话记录、技能目录和项目产物。', '输出要按项目说明做了什么、花了多久、哪里效率低。', '最后必须给出“我的 Claude 使用优化建议”，重点看提问、拆解、目标定义和思维逻辑。'],
    visualTitle: '固定审查维度',
    visualItems: ['缓存', '会话', '产物', '时间', '提示词'],
  },
  {
    id: 's5',
    label: '05 · 第一层发现',
    chapter: 'First Finding',
    heading: '第一层发现：低效不只在 AI，也在我的协作方式',
    insight: '固定 prompt 的价值在于，它逼我承认一个事实：AI 不好用，有时不是模型不行，而是我的问题定义、约束表达和任务拆分不够清楚。',
    points: ['有些重复劳动来自任务目标没有一开始说清。', '有些返工来自约束不完整，AI 只能边做边猜。', '有些“AI 不懂我”，其实是我没有给出验收口径。'],
    visualTitle: '协作问题',
    visualItems: ['提问不清', '约束缺失', '目标漂移', '验收不明'],
  },
  {
    id: 's6',
    label: '06 · Skill 化',
    chapter: 'Skillization',
    heading: 'Skill 化：把一次性复盘变成稳定流程',
    insight: '固定 prompt 有用，但它每次都要复制、调整和重新解释。下一步就是把它收进 methodology / retro，让复盘变成稳定触发的 skill。',
    points: ['周报不再只靠手写 prompt，而是有固定的证据收集、项目分析和优化建议结构。', '报告开始沉淀为每周记录，成为后续方法论变化的原始材料。', '复盘对象从“这周做了什么”扩展到“这周我是怎么和 AI 协作的”。'],
    visualTitle: '从 prompt 到 skill',
    visualItems: ['固定提示词', '流程封装', '周报记录', '方法候选'],
  },
  {
    id: 's7',
    label: '07 · 单 Agent 局限',
    chapter: 'Single Agent Limit',
    heading: '单 agent 的局限：让一个 AI 审查全部，会有视角偏差',
    insight: '当复盘从 prompt 变成 skill 后，新的问题出现了：如果只让一个 agent 审查所有东西，它会把自己的可见范围、偏好和盲区带进最终报告。',
    points: ['Claude 更容易解释自己看得到的会话，却看不到 Codex 的工具调用细节。', 'Codex 更擅长落盘证据和命令验证，却可能低估对话过程中的意图变化。', '单一审计者会让报告看起来完整，但不一定可信。'],
    visualTitle: '单视角偏差',
    visualItems: ['可见范围', '工具偏好', '证据盲区', '解释偏差'],
  },
  {
    id: 's8',
    label: '08 · 多 Agent 插曲',
    chapter: 'Multi-Agent Check',
    heading: '多 agent 插曲：Claude / Codex 自评、互审、裁判综合',
    insight: '于是中间出现了一个小插曲：复盘不再交给单个 agent，而是让 Claude 和 Codex 分别自评，再互相审查，最后由裁判综合。',
    points: ['Claude 只复盘 Claude 证据，Codex 只复盘 Codex 证据。', '交叉审查专门挑对方的覆盖不足、重复计数和证据边界。', '裁判综合不重新发散，只基于证据、自评和互审做判断。'],
    visualTitle: '视角校验',
    visualItems: ['Claude 自评', 'Codex 自评', '互相挑错', '裁判综合'],
  },
  {
    id: 's9',
    label: '09 · 新的问题',
    chapter: 'New Problem',
    heading: '新的问题：报告更完整了，但人还没真正反思',
    insight: '多 agent 让报告更扎实，但也让报告更像审计材料。信息变多以后，用户仍然可能只看结论，不进入真正的自我修正。digest 的方法在这里重新出现：把报告里的内容拆成候选，再判断去向。',
    points: ['完整报告解决了事实可信度，却没有自动解决反思发生。', '系统问题、普通感受、方法变化混在一起，仍然需要分流。', '如果没有收口机制，复盘又会变成一份“很完整但离我很远”的文档。'],
    visualTitle: '完整但未发生',
    visualItems: ['证据更强', '报告更长', '反思未发生', '候选混杂'],
  },
  {
    id: 's10',
    label: '10 · 复盘后干什么',
    chapter: 'After Retro',
    heading: '复盘后干什么：线头更新、卡片生成和索引维护',
    insight: '追问不是终点。真正的收口发生在追问之后：把普通反思写回周报，把系统问题更新到线头看板，把可复用经验变成能力层规则或正式知识卡，并补上索引。',
    points: ['普通反思写回周报补充区，保留当周上下文和用户原话。', '系统问题先进入候选草稿或线头看板，写清再触发条件和当前状态。', '确认可复用后，再生成能力层规则或正式知识域卡片，并同步 README、材料索引、拆卡索引或裁决记录。'],
    visualTitle: '复盘后收口链',
    visualItems: ['反思写回', '线头更新', '能力层规则', '正式知识卡', '索引维护'],
  },
  {
    id: 's11',
    label: '11 · 收束',
    chapter: 'Make AI Better',
    heading: '最终价值：让 AI 使用方式持续变好',
    insight: 'weekly-retro 的价值不是替我写周报，而是持续审查我如何使用 AI：问题是否清楚、目标是否准确、约束是否完整、任务拆解是否合理。',
    points: ['当前形态是个人 AI 使用复盘 workflow。', '团队复用潜力在于把“怎么和 AI 协作”变成可讨论、可训练、可改进的 SOP。', '企业级潜力在于把 AI 使用证据、协作审查和组织方法库打通。'],
    visualTitle: '产品化判断',
    visualItems: ['个人复盘', '团队 SOP', 'AI 使用训练', '企业方法库'],
  },
];

export const prdSkillSections: PrdSkillSection[] = [
  {
    id: 's2',
    label: '02 · 起点愿景',
    chapter: 'Original Ambition',
    heading: '起点愿景：让 AI 代替写需求文档的活',
    insight: 'prd-skill 最早的愿景很直接：把产品经理最耗时的 PRD 写作交给 AI，让它根据背景和模板产出一份像样的需求文档。',
    points: ['最开始的目标不是做一套复杂流程，而是让 AI 接住“写 PRD”这件事。', '输入主要是需求背景、已有想法和一个 PRD 模板。', '期待输出是一份结构完整、可以继续评审的需求文档。'],
    visualTitle: '最初期待',
    visualItems: ['需求背景', 'PRD 模板', 'AI 代写', '文档初稿'],
  },
  {
    id: 's3',
    label: '03 · 模板阶段',
    chapter: 'Template First',
    heading: '第一版：给模板，让 AI 按结构写',
    insight: '第一版方法是把模板交给 AI，让它照着章节补内容。这个阶段能解决“空白页恐惧”，但解决不了需求本身是否清楚。',
    points: ['模板能保证章节齐全，却不能保证业务规则闭环。', 'AI 会把模糊背景写得很顺，但顺不等于可开发。', '很多待确认项会被包装成看似确定的正文。'],
    visualTitle: '模板能做什么',
    visualItems: ['章节完整', '表达顺畅', '结构统一', '语义未封口'],
  },
  {
    id: 's4',
    label: '04 · 返工问题',
    chapter: 'Rewrite Loop',
    heading: '问题暴露：PRD 写出来了，但要反反复复修改',
    insight: '真正的低效不是 AI 不会写，而是它会把没问清的问题写成一份看似完整的文档，后面再被状态、枚举、边界和口径不断打回。',
    points: ['用户、场景、边界不清时，AI 会默认补全。', '业务规则没有唯一真相时，交互、验收和功能点会互相漂移。', '模糊词没有关闭时，开发和测试仍然不知道该怎么落地。'],
    visualTitle: '返工来源',
    visualItems: ['角色不清', '范围漂移', '枚举未关', '口径打架'],
  },
  {
    id: 's5',
    label: '05 · 工作流化',
    chapter: 'Workflow Mode',
    heading: '工作流化：把 prd-write 和 prd-review 放进一条链',
    insight: '下一阶段不再只让 AI 填模板，而是把写作和审查串成工作流：先写 PRD，再检查结构、业务规则、待确认项和 spec-readiness。',
    points: ['prd-write 负责把需求组织成文档，而不是一次性定稿。', 'prd-review 负责找边界、状态、失败路径和验收风险。', '一条链路开始形成：写作、审查、修订、再交付。'],
    visualTitle: '单工作流',
    visualItems: ['写作', '审查', '修订', '交付'],
  },
  {
    id: 's6',
    label: '06 · 同框局限',
    chapter: 'Same Chat Limit',
    heading: '新问题：同一个对话框里审查，仍然会漏',
    insight: '实际体验里，同一个对话框先写再审，审查者会继承写作者的假设。它知道刚才为什么这么写，于是更容易替文档解释，而不是站在冷启动评审视角挑问题。',
    points: ['同一上下文会把口头解释当成已写入事实。', 'AI 容易默认“前面聊过”，但开发、测试和下一个 agent 并没有这些隐含背景。', '审查报告看起来有检查动作，但 spec-readiness 仍可能留下洞。'],
    visualTitle: '同框偏差',
    visualItems: ['继承假设', '默认理解', '替文档解释', '冷启动不足'],
  },
  {
    id: 's7',
    label: '07 · 双 Skill',
    chapter: 'Role Split',
    heading: '角色拆分：prd-writer 和 prd-review 抽成两个 skill',
    insight: '后续把 PRD 写作和 PRD 审查拆成两个 skill。写作者负责组织材料、关闭模糊词、形成正文；审查者负责冷启动读取文档，按评审标准找风险。',
    points: ['prd-writer 不再假装自己能完成独立审查。', 'prd-review 不继承写作对话里的隐含前提。', '两个 skill 的输入、输出和验收标准开始分开。'],
    visualTitle: '角色边界',
    visualItems: ['Writer 成稿', 'Review 冷审', '输入隔离', '标准分层'],
  },
  {
    id: 's8',
    label: '08 · 双 Agent',
    chapter: 'Two Agents',
    heading: '再进一步：不同 agent 充当不同角色',
    insight: '当两个 skill 还不足以消除视角偏差时，就让不同 agent 扮演不同角色：一个负责生成和修订，一个负责冷启动审查，必要时再交叉确认。',
    points: ['写作 agent 更关注材料组织、术语统一和正文完整。', '审查 agent 更关注状态组合、失败路径、枚举关闭和口径单一源。', '多 agent 的价值不是热闹，而是让 PRD 经得起不同上下文的读取。'],
    visualTitle: '双 Agent 校验',
    visualItems: ['写作角色', '审查角色', '冷启动读取', '交叉确认'],
  },
  {
    id: 's9',
    label: '09 · 强制关卡',
    chapter: 'Quality Gates',
    heading: '强制关卡：模糊词、唯一真相和 spec-readiness',
    insight: 'prd-skill 的核心不是“写得像 PRD”，而是让文档过关：模糊词要关闭，业务规则要成为唯一真相，spec-readiness 不能被漂亮结构稀释。',
    points: ['“等、相关、默认、按需、合理”这类词必须关闭或挂账。', '业务规则负责定义真相，交互设计和验收标准只能引用，不重复发明口径。', 'spec-readiness 只判断开发和测试能不能不靠作者解释继续推进。'],
    visualTitle: '封口关卡',
    visualItems: ['模糊词扫描', '业务规则唯一真相', '冷启动审查', 'spec-readiness'],
  },
  {
    id: 's10',
    label: '10 · 实现门禁',
    chapter: 'Plan Gate',
    heading: '实现门禁：没过审，就不进入 writing-plans',
    insight: 'writing-plans 不是这个 Skill Desk 的独立主角，而是 prd-skill 拆分后的实现护栏：如果 prd-review 发现 Blocker，就不能把未封口的 spec 强行拆成实施计划。',
    points: ['prd-review 输出的不只是建议，而是能否进入执行的信号。', '有 Blocker 时，下一步是回到 PRD / spec 补规则、边界、验收和状态组合，不是继续拆任务。', 'writing-plans 的价值在这里被限定为实现门禁：防止漂亮文档里的洞被带进开发阶段。'],
    visualTitle: '执行前挡板',
    visualItems: ['prd-review', 'Blocker', '补 spec', 'writing-plans', '实施计划'],
  },
  {
    id: 's11',
    label: '11 · 收束',
    chapter: 'From Draft To Delivery',
    heading: '最终价值：不是写得更快，而是交付更稳',
    insight: 'prd-skill 的价值不是让 AI 写一篇漂亮文档，而是把“我有一个需求”推进成团队可以评审、开发可以拆、测试可以验、后续可以复盘的交付资产。',
    points: ['当前形态是个人 PRD 生产与审查 workflow。', '团队复用潜力在于把需求写作、冷启动审查、spec-readiness 和实现门禁变成 SOP。', '企业级潜力在于把 PRD、审查报告、决策记录、实施计划和知识库沉淀打通。'],
    visualTitle: '产品化判断',
    visualItems: ['个人 workflow', '团队 SOP', '审查分工', '计划门禁', '企业知识流'],
  },
];

export const competitiveAnalysisSections: CompetitiveAnalysisSection[] = [
  {
    id: 's2',
    label: '02 · 起点',
    chapter: 'Original Need',
    heading: '起点：我不是想要一份资料汇编',
    insight: 'competitive-analysis 最早要解决的不是“让 AI 搜集竞品资料”，而是让竞品分析服务当前产品判断：该看谁、看什么、学什么、避开什么。',
    points: ['竞品分析如果没有当前产品问题，就很容易变成公司百科和功能清单。', '真正有用的是知道竞品观察如何影响我们的功能取舍、路径设计和 PRD 输入。', '这页要展示的是竞品分析 skill 的产品负责人视角，而不是普通调研报告。'],
    visualTitle: '分析目标',
    visualItems: ['看谁', '看什么', '学什么', '避开什么', '进 PRD'],
  },
  {
    id: 's3',
    label: '03 · 常见误区',
    chapter: 'Failure Mode',
    heading: '常见误区：AI 很容易堆功能、堆截图、堆表格',
    insight: 'AI 生成竞品报告时最容易看起来很完整：品牌介绍、功能对比、页面截图、优缺点点评都齐了，但看完仍然不知道当前产品下一步该怎么做。',
    points: ['逐个竞品平均复述，会掩盖真正关键的差异。', '只做 UI 点评，会忽略用户路径和业务链路。', '只有“启示”但没有动作等级，后续无法进入 PRD 或验证计划。'],
    visualTitle: '资料汇编陷阱',
    visualItems: ['公司介绍', '功能清单', 'UI 点评', '启示空泛'],
  },
  {
    id: 's4',
    label: '04 · 产品负责人视角',
    chapter: 'PM Lens',
    heading: '关键反思：竞品分析要从当前产品问题出发',
    insight: '产品负责人视角不会先问“竞品有哪些”，而是先问“我现在要做哪个产品决策”。竞品只是证据来源，不是报告主角。',
    points: ['先写清本次分析服务的产品问题、决策用途和边界。', '竞品选择要包含直接竞品、强标杆、替代方案或标杆参考。', '竞品数量以 3-5 个为宜，宁可少而深。'],
    visualTitle: 'PM 视角三问',
    visualItems: ['当前问题', '决策用途', '分析边界', '竞品角色'],
  },
  {
    id: 's5',
    label: '05 · 输入收口',
    chapter: 'Input Framing',
    heading: '输入收口：目标产品、行业、目的和竞品列表',
    insight: '这个 skill 的第一步不是直接写报告，而是解析目标产品、行业领域、分析目的、指定竞品和已有材料；如果竞品列表缺失，先推荐候选并说明理由。',
    points: ['分析目的会影响输出结构：PRD 输入、机会判断、定价、功能、汇报并不一样。', '竞品选择要写明“为什么看它”和“本次重点看什么”。', '启动前需要让用户确认竞品、模块和分析目的。'],
    visualTitle: '启动参数',
    visualItems: ['目标产品', '行业领域', '分析目的', '竞品列表', '已有材料'],
  },
  {
    id: 's6',
    label: '06 · 模块选择',
    chapter: 'Module Picker',
    heading: '模块选择：不同产品不能套同一份报告模板',
    insight: 'competitive-analysis 的亮点之一是按行业和目的选择分析模块。C 端、B 端 SaaS、开发者工具、平台型产品、PRD 输入，都不应该套同一个报告结构。',
    points: ['C 端产品可看五要素、核心指标、视觉设计和用户路径。', 'B 端 SaaS 更适合定价策略、流程与权限、模式拆解。', 'PRD 输入要重点看功能深潜、偷师清单和 PRD 可用度。'],
    visualTitle: '可插拔模块',
    visualItems: ['模式拆解', '五要素', '核心指标', '定价策略', '技术架构', '生态平台'],
  },
  {
    id: 's7',
    label: '07 · 事实边界',
    chapter: 'Evidence Boundary',
    heading: '事实边界：当前竞品事实必须重新调研',
    insight: '正式知识域只提供分析框架和历史方法，不提供当前市场事实。竞品价格、功能状态、市场动作和页面变化必须来自实时调研或用户材料。',
    points: ['历史框架可以帮助分析，但不能替代当前事实。', '价格、套餐、功能入口、上线状态这类信息必须重新查证。', '如果事实不完整，报告要标注证据缺口，而不是用推测补齐。'],
    visualTitle: '证据分层',
    visualItems: ['框架来自知识库', '事实来自调研', '材料来自用户', '缺口要标注'],
  },
  {
    id: 's8',
    label: '08 · 横向路径',
    chapter: 'Path Comparison',
    heading: '横向路径：按用户路径和业务链路拆，不按竞品逐个讲',
    insight: 'PM 视角的主干是横向拆解：进入、理解、查找、决策、转化、履约、复购。每个环节比较竞品差异，再形成产品判断。',
    points: ['不要写成竞品 A、竞品 B、竞品 C 的平均介绍。', '每个路径环节都要回答用户问题、我们现状、竞品做法、关键差异和产品判断。', '横向结构能直接服务页面结构、流程优化和需求拆分。'],
    visualTitle: '路径拆解',
    visualItems: ['进入', '理解', '查找', '决策', '转化', '履约', '复购'],
  },
  {
    id: 's9',
    label: '09 · 产品动作',
    chapter: 'Action Output',
    heading: '产品动作：偷师清单、反向避坑和 PRD 可用度',
    insight: '每个关键观察都必须落到动作等级：可直接写需求、需验证、需技术评估、暂不做，或者反向避坑。否则竞品分析只是“看过了”。',
    points: ['偷师清单说明机会点、来源竞品、用户价值、业务价值和下一步。', '反向避坑说明竞品做了但我们为什么不能照抄。', 'PRD 可用度把外部观察转成需求候选、验证问题或暂不做决策。'],
    visualTitle: '动作等级',
    visualItems: ['直接偷师', '需验证', '需技术评估', '暂不做', '反向避坑'],
  },
  {
    id: 's10',
    label: '10 · 收束',
    chapter: 'From Research To Decision',
    heading: '最终价值：从竞品资料到产品判断',
    insight: 'competitive-analysis 的价值不是生成一份厚报告，而是把外部观察转成当前产品能使用的判断：哪些能学、哪些不能抄、哪些进入 PRD、哪些继续验证。',
    points: ['当前形态是产品负责人视角的竞品分析 workflow。', '团队复用潜力在于把竞品报告变成可评审的产品决策输入。', '它可以接住 requirement-discovery 的机会问题，也可以把结论交给 prd-skill 成文。'],
    visualTitle: '产品化判断',
    visualItems: ['外部观察', '机会判断', 'PRD 输入', '团队模板'],
  },
];

export const requirementDiscoverySections: RequirementDiscoverySection[] = [
  {
    id: 's2',
    label: '02 · 失速现场',
    chapter: 'Failure Mode',
    heading: '失速现场：需求还没想清楚，AI 已经开始设计方案',
    insight: 'requirement-discovery 的起点不是“让 AI 多问几个问题”，而是处理一个常见失速：用户只带着模糊方向来，AI 却迅速进入深度追问、功能拆解、PRD 草稿和方案设计。',
    points: ['AI 很擅长继续往下做，但需求不清时，越深入越可能深入错方向。', '看似专业的深度提问，会把用户带进还不该讨论的细节。', '真正要先做的是判断需求是否成立，而不是马上把方案做完整。'],
    visualTitle: '失速链路',
    visualItems: ['模糊想法', '深度追问', '功能拆解', '方案设计'],
  },
  {
    id: 's3',
    label: '03 · 关键反思',
    chapter: 'Core Reflection',
    heading: '关键反思：PRD 前阶段需要的是需求发现，不是方案共创',
    insight: '这个 skill 的核心是刹车。它要求 agent 先判断自己处在 PRD 前阶段，先识别需求来源、角色、证据和 V0 边界，而不是急着证明自己会设计方案。',
    points: ['需求发现阶段要先问背景压力和需求来源，不问功能优先级。', '如果用户还没有核心需求框架，就不要输出完整 PRD、完整原型或完整 V0 功能清单。', '这和 reading-dialogue 的产品共创档刹车相呼应：一个防阅读跑偏，一个防需求跑偏。'],
    visualTitle: '先刹车',
    visualItems: ['需求发现', '需求澄清', '方案设计', 'PRD 写作'],
  },
  {
    id: 's4',
    label: '04 · 档位识别',
    chapter: 'Mode Detection',
    heading: '档位识别：先确认现在到底处在哪个阶段',
    insight: 'requirement-discovery 先把对话档位分清：需求发现、需求澄清、方案设计、PRD 写作。只有前一档足够清楚，才能进入后一档。',
    points: ['需求发现：判断问题是否真实、来源是什么、谁受影响。', '需求澄清：把用户、场景、问题、影响和目标压成核心需求框架。', '方案设计和 PRD 写作必须等需求成形后再交给后续 skill。'],
    visualTitle: '四档状态',
    visualItems: ['发现', '澄清', '设计', '成文'],
  },
  {
    id: 's5',
    label: '05 · 需求来源',
    chapter: 'Demand Source',
    heading: '第一层判断：需求到底从哪里来',
    insight: '它先判断需求来源：组织叙事、真实用户痛点、风险治理、技术包装，还是流程债。来源不同，后续验证方式和是否该做也不同。',
    points: ['组织叙事容易把战略目标包装成功能需求。', '技术包装容易先选 AI，再反过来找场景。', '流程债和风险治理往往不是缺功能，而是责任、异常和兜底没有显性化。'],
    visualTitle: '需求来源地图',
    visualItems: ['组织叙事', '真实痛点', '风险治理', '技术包装', '流程债'],
  },
  {
    id: 's6',
    label: '06 · 角色影响',
    chapter: 'Actor Chain',
    heading: '第二层判断：谁提出、谁使用、谁承担后果',
    insight: 'To B 和组织场景不能只问“用户是谁”。它要拆开决策者、买单者、操作者、日常用户和风险承担者，否则方案会默认所有人目标一致。',
    points: ['提出需求的人不一定每天使用。', '日常用户觉得方便，不代表风险承担者接受。', '如果 AI 判断会影响责任归属，就必须先知道谁为误判、漏判、投诉和事故负责。'],
    visualTitle: '角色链',
    visualItems: ['推动者', '决策者', '操作者', '日常用户', '风险承担者'],
  },
  {
    id: 's7',
    label: '07 · 证据缺口',
    chapter: 'Evidence Gaps',
    heading: '第三层判断：哪些只是感觉，哪些必须先核实',
    insight: '需求发现要把“感觉像需求”转成可验证事实：当前流程、数据证据、角色链路、替代方案、约束条件和成功指标。',
    points: ['频次、耗时、损失、投诉、工单和人工成本比抽象痛点更能判断真假。', '现有替代方案能说明用户到底愿意为问题付出多少成本。', '证据不足时，下一步是调研或补材料，不是让 AI 补完方案。'],
    visualTitle: '证据清单',
    visualItems: ['流程', '数据', '角色', '替代方案', '约束', '指标'],
  },
  {
    id: 's8',
    label: '08 · V0 收敛',
    chapter: 'V0 Scoping',
    heading: '第四层判断：先验证什么，而不是一次做完整方案',
    insight: '核心需求成形后，才进入 V0 收敛。它不是把所有想法做小，而是选择最能验证核心需求、风险可控、边界清楚的第一步。',
    points: ['底座优先：先做人、身份、权限、认证接口和治理规则。', '场景试点优先：先选一个高频、高痛、可控场景打穿。', '风险治理优先：先处理损失、异常、追责、审计和兜底。'],
    visualTitle: 'V0 三选项',
    visualItems: ['底座优先', '场景试点', '风险治理', '试点边界'],
  },
  {
    id: 's9',
    label: '09 · Handoff',
    chapter: 'Handoff',
    heading: 'Handoff：需求成形后，再交给对应 skill',
    insight: 'requirement-discovery 不负责把所有事情做完。它的收口是判断下一步该交给谁：PRD Skill、competitive-analysis、原型/spec，还是继续补事实。',
    points: ['要写 PRD 时，再交给 prd-skill。', '需要外部对照时，再交给 competitive-analysis。', '仍缺证据时，先停在需求发现，不自动切到方案设计。'],
    visualTitle: '交接路由',
    visualItems: ['继续发现', '竞品分析', 'PRD Skill', '原型 / Spec', '写计划'],
  },
  {
    id: 's10',
    label: '10 · 收束',
    chapter: 'From Idea To Demand',
    heading: '最终价值：让 AI 先判断该不该设计',
    insight: 'requirement-discovery 的价值不是让 AI 少做，而是让 AI 在正确阶段做正确的事。它把模糊想法压成可判断的需求，再决定是否进入竞品、PRD、原型或计划。',
    points: ['当前形态是 PRD 前需求发现 workflow。', '团队复用潜力在于把“先别急着写方案”变成稳定协作协议。', '它和 competitive-analysis、prd-skill 形成完整链路：先判需求，再看竞品，再成文交付。'],
    visualTitle: '产品化判断',
    visualItems: ['模糊想法', '真需求判断', 'V0 边界', '后续交接'],
  },
];

export const quotationSections: QuotationSection[] = [
  {
    id: 's2',
    label: '02 · 起点愿景',
    chapter: 'Original Ambition',
    heading: '起点愿景：让 AI 代替报价书制作',
    insight: 'quotation 最早想接住的是一件很实用的事：从当前对话或需求材料里提取客户、项目、模块和功能点，自动估算工时，再生成一份标准飞书报价书。',
    points: ['输入不是一份干净表格，而是一段需求讨论、一个 PRD 或一组功能想法。', '输出要包含模块、功能、产品 / UI / 前端 / 后端 / 测试工时，以及总价。', '最初的期待是减少手工复制模板、填单元格、算公式和调样式的重复劳动。'],
    visualTitle: '最初自动化',
    visualItems: ['需求对话', '功能提取', '角色工时', '飞书报价书'],
  },
  {
    id: 's3',
    label: '03 · 第一版',
    chapter: 'First Version',
    heading: '第一版：AI 很自然会按研发任务细拆',
    insight: '第一版的问题不在于不会估工，而在于它太像研发拆任务：功能拆得越细，看起来越专业，但客户读起来越像工程清单。',
    points: ['AI 会把接口、页面、状态、联调、测试拆成很多小项。', '细颗粒度方便研发排期，却不一定适合作为客户报价。', '报价书如果充满内部任务语言，就很难解释“客户买到的能力是什么”。'],
    visualTitle: '细拆惯性',
    visualItems: ['接口项', '页面项', '联调项', '测试项', '客户困惑'],
  },
  {
    id: 's4',
    label: '04 · 事故现场',
    chapter: 'Failure Case',
    heading: '事故现场：充电桩报价拆得太细',
    insight: '真实转折发生在充电桩交易闭环项目。第一版报价按研发口径细拆，你指出“模块拆分不对”，希望一个模块下 3-5 个功能，用客户能理解的粗粒度表达。',
    points: ['项目本身已经收口为独立交易闭环，而不是找桩平台或设备运维平台。', '第一版报价把研发拆解暴露给客户，模块感不强。', '调整后变成少数几个大模块，每个模块下保留 3-5 个可沟通功能点。'],
    visualTitle: '真实修正',
    visualItems: ['交易闭环', '拆得太细', '客户可读', '5 个大模块'],
  },
  {
    id: 's5',
    label: '05 · 关键反思',
    chapter: 'Core Reflection',
    heading: '关键反思：报价是客户沟通，不是研发排期',
    insight: '报价书的第一读者不是开发团队，而是客户和商务决策者。它需要让对方看懂范围、价值和价格，而不是展示我们内部会如何施工。',
    points: ['研发拆解追求可执行，客户报价追求可理解。', '报价模块应该围绕客户购买的能力，而不是工程实现步骤。', '真正的专业不是拆得越细越好，而是知道什么时候要合并表达。'],
    visualTitle: '两种口径',
    visualItems: ['研发任务', '客户报价', '可执行', '可沟通'],
  },
  {
    id: 's6',
    label: '06 · 报价门禁',
    chapter: 'Boundary Gate',
    heading: '报价前先封需求边界和交付风险',
    insight: 'quotation 不应该在需求还散的时候直接给金额。它要先确认范围、一期边界、交付方式、联调成本、验收风险和隐藏工作量，否则报价会显得快，但后面一定会返工。',
    points: ['需求边界没封口时，先回到需求发现或 PRD，而不是马上出价。', '涉及支付、履约、退款、对账、权限和外部系统时，必须把隐藏工作量显性化。', '如果出现上线、联调、数据迁移、验收或延期风险，要引入项目复盘口径校准。'],
    visualTitle: '报价前检查',
    visualItems: ['范围', '一期边界', '联调', '验收', '风险'],
  },
  {
    id: 's7',
    label: '07 · 模块重组',
    chapter: 'Module Framing',
    heading: '模块重组：从细功能变成客户可读模块',
    insight: '后来的稳定做法是先把细功能聚合成客户能识别的大模块，再在每个模块下保留少量功能点。这样报价书既不空泛，也不会变成研发排期表。',
    points: ['模块数量要克制，让客户一眼看出项目由哪几块组成。', '每个模块下保留 3-5 个功能点，说明能力范围和交付边界。', '模块名称尽量使用业务语言，而不是接口、表、字段或内部实现名。'],
    visualTitle: '报价结构',
    visualItems: ['大模块', '3-5 功能点', '业务语言', '边界清楚'],
  },
  {
    id: 's8',
    label: '08 · 工时估算',
    chapter: 'Effort Model',
    heading: '工时估算：把隐藏工作量摊到角色上',
    insight: '估工不只是给每个功能套一个人天。quotation 会按产品、UI、前端、后端、测试拆角色，同时让联调、异常、对账、验收和数据处理这类隐性成本浮出水面。',
    points: ['简单查询、中等联调、复杂模块和数据迁移要用不同估算基线。', '产品和测试不是尾巴，复杂业务里的需求澄清、验收设计和联调验证都要计入。', '估工预览先给用户确认，允许调整、打折或重新组织模块后再生成正式表格。'],
    visualTitle: '五角色估工',
    visualItems: ['产品', 'UI', '前端', '后端', '测试', '隐性成本'],
  },
  {
    id: 's9',
    label: '09 · 飞书交付',
    chapter: 'Sheet Delivery',
    heading: '飞书交付：先预览确认，再生成报价书',
    insight: '正式生成不是第一步，而是最后一步。先用 Markdown 预览确认模块、功能、工时和金额，再复制飞书模板、写入数据、合并同模块单元格、处理公式、列宽和样式。',
    points: ['预览阶段解决内容问题，飞书阶段解决格式和交付问题。', '同模块功能要合并模块列，让客户按模块阅读而不是逐行扫任务。', '表格生成后返回链接和摘要：模块数、总工时、合计金额和优惠价。'],
    visualTitle: '交付链路',
    visualItems: ['报价预览', '用户确认', '模板复制', '合并单元格', '链接摘要'],
  },
  {
    id: 's10',
    label: '10 · 收束',
    chapter: 'From Quote To Consensus',
    heading: '最终价值：报价书变成需求共识工具',
    insight: 'quotation 的价值不是省下几分钟填表，而是把模糊需求压成客户能理解、团队能交付、金额能解释的报价结构。',
    points: ['当前形态是个人报价生成 workflow。', '团队复用潜力在于统一售前、产品、研发和商务之间的报价口径。', '产品化方向可以是团队报价 SOP、项目交付估算助手或飞书报价生成器。'],
    visualTitle: '产品化判断',
    visualItems: ['客户共识', '交付估算', '团队 SOP', '飞书生成器'],
  },
];

export const memoryLoaderSections: MemoryLoaderSection[] = [
  {
    id: 's2',
    label: '02 · 原始做法',
    chapter: 'Knowledge In Skill',
    heading: '第一阶段：所有知识和上下文都塞进 skill',
    insight: '最开始为了让 AI 更懂任务，最直接的办法是把背景、规则、模板和经验都写进 skill。它短期有效，但长期会把 skill 变成难维护的知识容器。',
    points: ['skill 既要负责触发和执行，又要携带大量知识。', '经验越沉淀，单个 skill 越重，修改成本越高。', '知识被写死在执行入口里，不利于长期治理和跨场景复用。'],
    visualTitle: '早期结构',
    visualItems: ['SKILL.md', '规则', '模板', '案例', '上下文'],
  },
  {
    id: 's3',
    label: '03 · 新问题',
    chapter: 'Context Explosion',
    heading: '新问题：skill 越多，沉淀越勤，上下文越爆炸',
    insight: 'Personal Knowledge Harness 解决了记忆分散，但也带来新的控制问题：当 skill、知识卡和原文材料都在增长时，AI 如果一股脑读取，反而会被上下文淹没。',
    points: ['上下文不是越多越好，弱相关材料会稀释当前任务主线。', '旧经验如果没有边界，容易把已经过期的口径带进新任务。', '记忆系统必须有控制层，否则“沉淀越勤”会变成“召回越乱”。'],
    visualTitle: '增长压力',
    visualItems: ['skill 增长', '卡片增长', '原文增长', '上下文污染'],
  },
  {
    id: 's4',
    label: '04 · 隐藏 Skill',
    chapter: 'Hidden Loader',
    heading: '第一道控制：隐藏 skill，按需加载能力入口',
    insight: '当 skill 变多后，第一件事不是让所有 skill 常驻，而是做一个隐藏的 loader：只有用户点名或任务匹配时，才去真实目录里发现和加载对应 skill。',
    points: ['活跃 skill 清单不再被当成本机完整能力清单。', '低频 skill 按需发现，避免每次对话都带上全部说明。', '这一步先控制的是“能力入口”，不是知识卡片。'],
    visualTitle: '入口分流',
    visualItems: ['用户意图', 'skill-loader', '真实路径', '按需加载'],
  },
  {
    id: 's5',
    label: '05 · 共享插曲',
    chapter: 'Shared Skills',
    heading: '中间插曲：各 agent 的 skill 目录不能各自为政',
    insight: '隐藏 skill 解决了按需加载，但你又发现 Claude、Codex、OpenClaw 各自有 skill 目录，同一套自建能力没法稳定共享。于是共享 skill 目录成为第二层控制。',
    points: ['自研高频 skill 的真值源收敛到共享目录。', '各 agent 入口通过共享源暴露，避免同名 skill 多处漂移。', '这一步解决的是“能力是否一致”，不是“知识该读多少”。'],
    visualTitle: '三端入口',
    visualItems: ['Claude', 'Codex', 'OpenClaw', '.agents/skills'],
  },
  {
    id: 's6',
    label: '06 · 知识库膨胀',
    chapter: 'Card Growth',
    heading: '第三个问题：同一领域有很多卡，但任务不需要全部读',
    insight: 'skill 共享后，知识开始进入 Obsidian 三层体系。比如产品文档领域会沉淀模板、审查经验、spec-readiness、门禁规则，但一次 PRD 任务并不需要把所有卡片都塞进上下文。',
    points: ['领域变清楚，不代表每次都全量加载这个领域。', '同一任务域下也要区分当前问题类型、阶段和证据需求。', '知识卡片要服务任务判断，而不是证明知识库很完整。'],
    visualTitle: '领域内选择',
    visualItems: ['需求文档', 'PRD 模板', '审查经验', '门禁规则', '只取少量'],
  },
  {
    id: 's7',
    label: '07 · 索引机制',
    chapter: 'Index As Router',
    heading: '引入索引：README 和 00 索引不是目录，而是路由器',
    insight: '下一步是把索引机制做成控制层：先判断任务属于哪个领域，再按问题类型选择少量卡片。索引不再只是列文件，而是告诉 agent 何时加载什么、不要加载什么。',
    points: ['根 README 负责领域选择，任务域 README 负责问题路由。', '索引要写加载条件，而不是堆“当前有哪些卡”。', '当索引变成目录时，就会重新制造上下文爆炸。'],
    visualTitle: '路由层级',
    visualItems: ['根入口', '领域', '任务域', '问题类型', '候选卡'],
  },
  {
    id: 's8',
    label: '08 · Context Pack',
    chapter: 'Context Pack',
    heading: '最终形成：memory-loader 输出最小充分上下文包',
    insight: 'memory-loader / knowledge-context-pack 的价值不是替代 PRD、竞品、报价或复盘，而是在这些产出型 skill 前面先生成最小充分上下文包。',
    points: ['先解析当前任务，再决定主域、辅助域和候选上下文。', '最终只加载 2-5 张正式卡、1-3 条能力层规则和少量必要原文证据。', '同时说明未加载什么和原因，让“不读”也成为可审查的决策。'],
    visualTitle: '输出合同',
    visualItems: ['当前任务', '路由依据', '最终加载', '未加载', '风险'],
  },
  {
    id: 's9',
    label: '09 · 与其他 Skill',
    chapter: 'Control Before Output',
    heading: '和其他 skill 的关系：它在产出前先控制记忆',
    insight: '这个 skill 不直接写 PRD、不做竞品、不出报价、不做阅读追问。它站在这些工作流前面，帮它们决定该带哪些知识进入任务。',
    points: ['prd-skill 需要它加载需求文档规则，而不是全量产品知识。', 'competitive-analysis 需要它区分分析框架和实时事实。', 'weekly-retro 和 reading-dialogue 需要它控制沉淀、候选和入库门禁。'],
    visualTitle: '前置控制',
    visualItems: ['PRD', '竞品', '报价', '复盘', '阅读'],
  },
  {
    id: 's10',
    label: '10 · 收束',
    chapter: 'Memory Control Layer',
    heading: '最终价值：给 AI 记忆加控制层',
    insight: 'memory-loader 的价值不是让 AI 记住更多，而是让 AI 在正确时间读取正确记忆。它把 Personal Knowledge Harness 从“有很多知识”推进到“知识能被稳定调用”。',
    points: ['当前形态是个人 AI 记忆控制 workflow。', '团队复用潜力在于把知识库、skill 和多 agent 入口变成可治理的加载协议。', '产品化方向可以是组织级 AI 记忆路由器、上下文包生成器或知识库召回控制台。'],
    visualTitle: '产品化判断',
    visualItems: ['记忆路由', '上下文预算', '多 agent 共用', '组织控制台'],
  },
];
