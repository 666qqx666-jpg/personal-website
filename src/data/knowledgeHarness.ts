export const harnessVisualIds = [
  'problem-map',
  'knowledge-production-gates',
  'v1-routing-runtime',
  'v2-shadow-runtime',
  'evaluation-activation-gate',
  'v15-profile-runtime',
  'workflow-impact',
] as const;

export type HarnessVisualId = (typeof harnessVisualIds)[number];
export type NarrativeTone = 'problem' | 'thinking' | 'decision' | 'result' | 'status';
export type HarnessSectionId = 's2' | 's3' | 's4' | 's5' | 's6' | 's7' | 's8';

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
    id: 's2', chapter: '02 · 企业问题', heading: '知识存在，不等于 Agent 能正确使用', visualId: 'problem-map',
    narrative: [
      { label: '问题', body: '规范、项目经验和业务材料分散，来源权威并不一致。', tone: 'problem' },
      { label: '后果', body: '全量加载造成上下文膨胀；冲突与过期材料会静默进入回答；规则写死在 Skill 中又让知识与流程耦合。', tone: 'thinking' },
      { label: '判断', body: '先治理什么能进入任务、由谁裁决、如何失败，再谈检索能力。', tone: 'decision' },
    ],
  },
  {
    id: 's3', chapter: '03 · 知识产生', heading: '先捕获候选，再决定什么值得成为知识', visualId: 'knowledge-production-gates',
    narrative: [
      { label: '触发', body: '即时捕获不是每个对话都触发：只有可能改变未来跨任务行为，并有用户原话或可定位证据时才登记候选。', tone: 'thinking' },
      { label: '边界', body: '它不是会话结束 Hook；纯 Agent 推断、当前 TODO、项目进度和一次性 Bug 不进入候选队列。', tone: 'problem' },
      { label: '双门', body: '候选可以先去重或追加证据，显式沉淀、复现或周度复盘再触发五问裁决，决定是否进入正式知识。', tone: 'decision' },
    ],
  },
  {
    id: 's4', chapter: '04 · V1 起点', heading: 'V1：用人工索引建立第一个稳定基线', visualId: 'v1-routing-runtime',
    narrative: [
      { label: '优势', body: '小语料阶段，人工权威索引用较低复杂度稳定完成任务路由。', tone: 'result' },
      { label: '预算', body: 'V1 最多返回 5 个文件，没有 Token 硬上限。', tone: 'status' },
      { label: '问题', body: '文件长度不一会造成上下文波动；知识、角色和跨项目材料增加后，维护与覆盖成本开始上升。', tone: 'problem' },
    ],
  },
  {
    id: 's5', chapter: '05 · V2 Shadow', heading: 'V2：为规模化问题设计影子实验', visualId: 'v2-shadow-runtime',
    narrative: [
      { label: '假设', body: '更强的检索、排序和可观察性可以为未来规模化留出能力，但不直接接管生产流量。', tone: 'thinking' },
      { label: '职责', body: 'V2 将查找与审查组装分开，并用 RetrievalTrace 记录候选、排序、门禁和选择结果。', tone: 'decision' },
      { label: '预算', body: 'Context-Pack 最终字符串使用 6,000 Token 硬上限；五区预算由右侧结构图给出。', tone: 'status' },
    ],
  },
  {
    id: 's6', chapter: '06 · 人工评测', heading: '更少上下文，没有带来更高工作价值', visualId: 'evaluation-activation-gate',
    narrative: [
      { label: '证据', body: '20 组同题盲评中，V1 18，V2 16；安全门与规模门通过，但 activation=false。', tone: 'result' },
      { label: '判断', body: '更完整的工程能力和更少上下文，不能自动成为切流理由。', tone: 'decision' },
      { label: '状态', body: 'V2 保持 Shadow，production_enabled=false，不进入 canary；该评测也不证明 V1.5 的结果。', tone: 'status' },
    ],
  },
  {
    id: 's7', chapter: '07 · V1.5 收敛', heading: 'V1.5：把有效性与可扩展性收敛在一起', visualId: 'v15-profile-runtime',
    narrative: [
      { label: '设计', body: 'Profile 先判断任务、角色与知识边界，再用两阶段完成候选查找和审查组装。', tone: 'decision' },
      { label: '继承', body: '保留 V1 的人工权威索引与小语料有效性，吸收 V2 的 RetrievalTrace 和可替换检索接口。', tone: 'thinking' },
      { label: '预算门', body: '当前收敛设计保留 6,000 Token 安全硬上限，待同题评测证明工作价值不降低，且中位数、P90 均低于 V2 后，再决定是否下调。', tone: 'status' },
    ],
  },
  {
    id: 's8', chapter: '08 · 真实结果', heading: '从知识治理进入真实产品交付', visualId: 'workflow-impact',
    narrative: [
      { label: '接入', body: 'PRD Writer 与独立 Reviewer 使用同一知识事实基线。', tone: 'result' },
      { label: '覆盖', body: '产品部门全员覆盖，渗透率 100%；历史文档缺失的产品优化需求除外。', tone: 'result' },
      { label: '结果', body: '规则、案例和项目记忆可以独立维护、按任务加载并版本化演进。', tone: 'decision' },
    ],
  },
] as const satisfies readonly HarnessSection[];

export const timelineLabels = ['封面', '问题', '产生', 'V1', 'V2', '评测', 'V1.5', '结果'] as const;
