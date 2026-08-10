export const harnessVisualIds = [
  'problem-map',
  'layered-architecture',
  'knowledge-pipeline',
  'routing-index-map',
  'context-assembly',
  'ranking-mechanism',
  'failure-boundary',
  'release-rollback',
  'workflow-impact',
] as const;

export type HarnessVisualId = (typeof harnessVisualIds)[number];
export const nextHarnessVisualIds = [
  'problem-map',
  'knowledge-production-gates',
  'v1-routing-runtime',
  'v2-shadow-runtime',
  'evaluation-activation-gate',
  'v15-profile-runtime',
  'workflow-impact',
] as const;
export type NextHarnessVisualId = (typeof nextHarnessVisualIds)[number];
export type NarrativeTone = 'problem' | 'thinking' | 'decision' | 'result' | 'status';
export type HarnessSectionId = 's2' | 's3' | 's4' | 's5' | 's6' | 's7' | 's8' | 's9' | 's10';

export type NarrativeBlock = {
  label: string;
  body: string;
  tone: NarrativeTone;
};

export type HarnessSection = {
  id: HarnessSectionId;
  chapter: string;
  heading: string;
  narrative: readonly NarrativeBlock[];
  visualId: HarnessVisualId;
};

export const harnessSections = [
  {
    id: 's2', chapter: '02 · 企业问题', heading: '企业知识分散，Agent 先遇到的不是检索问题', visualId: 'problem-map',
    narrative: [
      { label: '问题', body: '企业规范、历史项目经验和业务文档分散在不同系统，模型无法天然判断来源权威。', tone: 'problem' },
      { label: '影响', body: '全量加载会带来上下文膨胀、来源冲突与加载成本；规则写死在 Skill 中又会让知识和工作流耦合。', tone: 'thinking' },
      { label: '判断', body: '企业知识平台要治理知识如何生产、被谁裁决、何时进入任务，而不只是增加一个文档入口。', tone: 'decision' },
    ],
  },
  {
    id: 's3', chapter: '03 · 分层架构', heading: '让知识系统与 Agent 工作流各自演进', visualId: 'layered-architecture',
    narrative: [
      { label: '原则', body: '企业原始文档继续承担动态事实真值，正式知识只保存经过裁决的复用单元。', tone: 'thinking' },
      { label: '决策', body: '原始材料、正式知识和企业能力包构成当前稳定的三层知识架构，Agent 工作流作为上层消费者接入。', tone: 'decision' },
      { label: '边界', body: '企业知识与固定 Skill 解耦；通用 Skill 只保留流程、角色和质量门禁。', tone: 'status' },
    ],
  },
  {
    id: 's4', chapter: '04 · 知识生产', heading: '知识不是上传完成，而是经过证据链生产', visualId: 'knowledge-pipeline',
    narrative: [
      { label: '来源', body: '历史企业材料先形成可追溯快照，保留出处、时间与适用范围。', tone: 'thinking' },
      { label: '机制', body: '内容被切成证据片段并形成候选知识卡，再判断新增、追加、合并或保留原文。', tone: 'decision' },
      { label: '门禁', body: '未经人工裁决的候选不能升级为正式企业规则。', tone: 'status' },
    ],
  },
  {
    id: 's5', chapter: '05 · 路由索引', heading: '文件不会丢，真正会丢的是召回路径', visualId: 'routing-index-map',
    narrative: [
      { label: '问题', body: '仅靠目录或全文搜索，未来 Agent 会在同义表达、跨项目材料和过期规则之间漏召回或误召回。', tone: 'problem' },
      { label: '机制', body: '根索引与领域索引、任务索引和项目记忆索引已经用于 V1，根据任务类型、项目范围和知识权威顺序形成候选。', tone: 'decision' },
      { label: '升级', body: 'V2 增加可重建派生索引作为影子旁路，不替代当前人工维护索引。', tone: 'status' },
    ],
  },
  {
    id: 's6', chapter: '06 · 上下文组装', heading: '每次只交付完成任务所需的最小充分上下文', visualId: 'context-assembly',
    narrative: [
      { label: '当前', body: 'V1 稳定基线按任务路由、筛选候选并裁剪预算，context-pack 同时说明加载、未加载和风险。', tone: 'status' },
      { label: '升级', body: 'V2 在同一 memory-loader Runtime 内增加“查找”与“审查组装”两段职责，不是两个独立 Skill。', tone: 'thinking' },
      { label: '价值门', body: 'V2 已实现但暂未激活；技术门通过后仍需工作价值超过 V1 才能切流。', tone: 'decision' },
    ],
  },
  {
    id: 's7', chapter: '07 · 排序机制', heading: '相关不等于应该进入上下文', visualId: 'ranking-mechanism',
    narrative: [
      { label: '局限', body: 'V1 能稳定控制加载范围，但关键词命中仍不足以处理多角色覆盖、候选竞争和冲突材料。', tone: 'problem' },
      { label: '机制', body: 'V2 由 Query Planner 与 RoleRetriever 查找，再经 RRF、Reranker、去重、Selector、Quality Gate、Composer 与 Renderer 审查组装，并输出 RetrievalTrace。', tone: 'thinking' },
      { label: '预算', body: '更大的候选池不会直接进入模型，最终仍只保留满足角色覆盖的最小充分上下文。', tone: 'decision' },
    ],
  },
  {
    id: 's8', chapter: '08 · 失败边界', heading: '冲突、过期和缺失必须有可观察行为', visualId: 'failure-boundary',
    narrative: [
      { label: '异常', body: '弱相关、来源冲突、材料过期和关键证据缺失不能被统一当成“检索到了”。', tone: 'problem' },
      { label: '决策', body: 'V1 显式报告未加载与风险；V2 进一步用确定性 Quality Gate 输出 insufficient、冲突组或升级处理。', tone: 'decision' },
      { label: '接管', body: '高风险冲突不得由模型静默裁决，必须保留证据并交给人工确认。', tone: 'status' },
    ],
  },
  {
    id: 's9', chapter: '09 · 版本演进', heading: '技术门通过，不等于价值门通过', visualId: 'release-rollback',
    narrative: [
      { label: '稳定', body: 'V1 继续作为 stable 生产基线，不因 V2 工程完成而被替换。', tone: 'status' },
      { label: '影子', body: 'V2 已通过安全、规模和影子运行门，但最近有结论的工作价值仍低于 V1。', tone: 'thinking' },
      { label: '门禁', body: '只有新的代表性语料与盲评证明价值提升，才讨论 canary 与原子切换。', tone: 'decision' },
      { label: '回滚', body: '知识包与 Skill 保留 stable、版本校验、原子切换和生产级回滚能力。', tone: 'status' },
    ],
  },
  {
    id: 's10', chapter: '10 · 真实结果', heading: '知识平台已经进入真实产品交付', visualId: 'workflow-impact',
    narrative: [
      { label: '接入', body: '企业知识库已连接 PRD Writer 与独立 Reviewer，为写作和冷启动审查提供同一事实基线。', tone: 'result' },
      { label: '覆盖', body: '覆盖产品部门所有同事，渗透率 100%；除历史文档缺失的产品优化需求外，其他需求均可覆盖。', tone: 'result' },
      { label: '结果', body: '规则、案例与项目记忆已能独立维护、按任务加载并版本化演进。', tone: 'decision' },
    ],
  },
] as const satisfies readonly HarnessSection[];

export const timelineLabels = ['封面', '问题', '分层', '生产', '索引', '组装', '排序', '边界', '版本', '结果'] as const;
