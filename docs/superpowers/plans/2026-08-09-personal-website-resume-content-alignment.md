# 个人网站简历与项目内容一致性升级 Implementation Plan

> **Execution governance:** Before implementation, run the shared `adaptive-orchestration` preflight. A plan records a recommended profile but does not dispatch agents or authorize execution by itself.

**Goal:** 用新版两页 PDF 替换网站主简历下载文件，并以完整版 Markdown 为事实母稿，统一 About、网页版简历、Enterprise Knowledge Harness、Skill Desk、销售线索及其关联入口的公开内容。

**Architecture:** `docs/resume/完整版-简历.md` 继续作为网站事实母稿，`src/data/resume/facts.ts` 负责 About 与网页版简历的公共事实，详情页保留各自的深度叙事。企业产品交付 Agent Harness 由 Skill Desk 承接应用层，Enterprise Knowledge Harness 继续使用 `/ai/knowledge-harness/` 承接知识基础层；新版 PDF 仅作为字节级下载产物，不参与网页事实合并。

**Tech Stack:** Astro 5、TypeScript、Playwright、GSAP、静态 PDF、SHA-256、Git

**Recommended execution profile:** O2；公共事实/PDF、AI 与 Skill、商业项目三个工作流可分区推进，但共享数据和最终回归必须由根执行者统一收口。

**Parallelizable workstreams:** A：公共事实、About、网页版简历和 PDF；B：AI 列表、Enterprise Knowledge Harness 与 Skill Desk；C：销售线索和其他商业项目审计。Task 1、Task 9 必须串行，Task 2–4 完成公共事实接口后再并行推进 B/C。

**Shared-write conflicts:** `src/data/resume/facts.ts`、`src/data/about.ts`、`e2e/resume-data.spec.ts`、`e2e/about.spec.ts` 和最终 Git 暂存区只允许一个写入者；`src/data/skillDesk.ts` 与 `e2e/skill-desk.spec.ts` 必须由同一工作流顺序修改。

**Stage evidence checkpoint:** `resume-content-alignment-final`；要求新版 PDF SHA-256 为 `7ac1cd36e29c67379846c7dc7015e1176bae9c4ace1ee1d58d93a942454a6418`，`npm run check`、计划列出的定向 Playwright 测试、`npm run build`、全量 `npm run test:e2e` 和全站旧口径扫描全部通过。

**Recovery entry:** `/Users/qqx/my_code_cursor/personal-website/tmp/implementation-checkpoints/resume-content-alignment.md`；实施前由 Task 1 创建。若该文件不存在，从本计划 Task 1 恢复。

**Authorization boundary:** 用户回复“开始实施”后，授权完成本计划全部 Task；允许修改 `public/resume.pdf`、本计划列出的 `src/` 与 `e2e/` 文件、创建运行时 checkpoint，并仅暂存和提交这些目标文件。允许读取完整版简历、已确认 Spec、新版 PDF 和现有项目页，运行 Astro/Playwright/PDF/Hash/Git 验证；不包含部署、推送或外部系统写入。

**Out of scope:** 不修改 `docs/resume/完整版-简历.md`、任何 DOCX、`public/resume-b2b-saas.pdf`、`scripts/export-resumes.mjs`、`scripts/resume_docx/`、`tests/resume_docx/`、Obsidian Vault、现有简历生成流程和用户其他未提交文件；不新增 Agent Harness 独立详情页，不重做网站视觉系统，不部署或推送远端。

**Potential decision boundaries:** 只有当实施时完整版简历或新版 PDF 再次变化，或现有详情页出现无法同时满足“保留深度内容”与“服从事实母稿”的新事实冲突，并且保留与删除会产生不同公开叙事后果时，才超出授权；测试失败、文案换行、选择器变化、构建错误和移动端溢出均在授权范围内修复。

---

## 计划依据与上下文包

**Approved Spec:** `/Users/qqx/my_code_cursor/personal-website/docs/superpowers/specs/2026-08-09-personal-website-resume-content-alignment-design.md`

**Plan:** `/Users/qqx/my_code_cursor/personal-website/docs/superpowers/plans/2026-08-09-personal-website-resume-content-alignment.md`

**当前材料：** 已确认 Spec、`docs/resume/完整版-简历.md`、新版 `/Users/qqx/Desktop/个人/钱麒祥-AI产品经理.pdf`、当前 Astro 页面、公共数据和 E2E。

**路由依据：** 真实任务上下文加载规则、个人知识库 RAG 式上下文治理规则、正式知识域及工作/需求文档/技术分析/项目复盘索引。

**最终加载：**

- `PRD审查经验`：用于锁定 Writer/冷启动 Reviewer 隔离和 `spec-readiness` 表达。
- `PRD进入原型前交互封口清单`：用于锁定真实页面基线、原型结束同步门和“不静默覆盖 PRD”。
- `上下文设计追求最小充分而非信息最多`：用于锁定 Enterprise Knowledge Harness 的索引、权威顺序、预算和冲突降级表达。

**未加载：** 结构化层级匹配卡与本任务无关；旧 wiki、新市场事实、原文层正文和其他知识领域未加载。现有 Spec、当前代码和三张正式卡已经足够。

**主要风险：** 工作区有用户未提交的简历生成改动，实施必须逐文件暂存；公共事实改为两个 AI 项目后，About 卡片数量和网页版一页排版可能变化；Knowledge Harness 与销售线索是大段静态页面，必须先以内容断言锁定事实，再修改页面。

## Spec-readiness：PASS

- **状态组合：** PDF 只负责下载，完整版 Markdown 只负责网页事实；Agent Harness、Knowledge Harness、原型工作包和销售线索商业化状态均有明确归属。静态网站不存在未定义运行态。
- **失败与并发：** PDF 复制失败或 Hash 不一致时阻止提交；公共数据单写入；构建、内容断言和 E2E 任一失败都阻止最终封板。
- **枚举闭合：** 目标入口、修改文件、禁止旧口径、两个 AI 项目、六段交付链、七个平台和商业结果均已列明。权限、经营分析、会员页审计结论为无需改正文；停车页只统一 `118.33` 为母稿的 `118.3` 万元。
- **唯一真值源：** 网页事实唯一继承完整版 Markdown；PDF 仅按用户最新文件字节替换；About 与网页版简历共用 `resumeFacts`，Skill 和详情页通过 E2E 锁定对应事实。

## 文件结构

| 文件 | 责任 |
| --- | --- |
| `src/data/resume/types.ts` | 增加第二个 AI 项目 ID。 |
| `src/data/resume/facts.ts` | 公共工作经历、两个 AI 项目、销售线索和保留项目事实。 |
| `src/data/resume/variants.ts` | 网页版 master/AI/B2B 项目选择与顺序。 |
| `src/data/profile.ts` | 首页与全站职业摘要。 |
| `src/data/about.ts` | About 指标、项目分组和详情入口。 |
| `src/pages/ai/index.astro` | AI 入口卡片。 |
| `src/pages/ai/knowledge-harness.astro` | Enterprise Knowledge Harness 十段 Deck。 |
| `src/pages/ai/claude-code-architecture.astro` | 方法页到企业 Harness 的桥接文案。 |
| `src/data/skillDesk.ts` | Agent Harness 交付链和对应 Skill 状态/内容。 |
| `src/pages/ai/skill-desk/index.astro` | 渲染交付链、Skill 卡和基础层关系。 |
| `src/pages/projects/index.astro` | 销售线索统一名称。 |
| `src/pages/projects/sales-lead-slm.astro` | 从 0 到 1、七平台、责任闭环与商业化演进叙事。 |
| `src/pages/projects/smart-parking.astro` | 停车金额口径统一。 |
| `public/resume.pdf` | 新版主简历下载文件。 |
| `e2e/*.spec.ts` | 公共事实、PDF、AI/Skill、销售线索和商业项目回归门禁。 |

### Task 1: 冻结输入、写入恢复入口

**Files:**

- Read: `/Users/qqx/my_code_cursor/personal-website/docs/superpowers/specs/2026-08-09-personal-website-resume-content-alignment-design.md`
- Read: `/Users/qqx/my_code_cursor/personal-website/docs/resume/完整版-简历.md`
- Read: `/Users/qqx/Desktop/个人/钱麒祥-AI产品经理.pdf`
- Create: `/Users/qqx/my_code_cursor/personal-website/tmp/implementation-checkpoints/resume-content-alignment.md`

- [ ] **Step 1: 核对工作区和输入 Hash**

Run:

```bash
git -C /Users/qqx/my_code_cursor/personal-website status --short
shasum -a 256 \
  /Users/qqx/my_code_cursor/personal-website/docs/resume/完整版-简历.md \
  /Users/qqx/my_code_cursor/personal-website/docs/superpowers/specs/2026-08-09-personal-website-resume-content-alignment-design.md \
  /Users/qqx/Desktop/个人/钱麒祥-AI产品经理.pdf \
  /Users/qqx/my_code_cursor/personal-website/public/resume.pdf
```

Expected: 完整版简历 Hash 为 `e8a76761389051354e9d5ee9d1bae9927329a71987b97260efbe0e8a20ccd90c`；Spec Hash 为 `e768c2cdf6c242de6aa0b7c341df6c2407a2480c58cdaddd6f913801341ba438`；新版 PDF 为 `7ac1cd36...a6418`；当前网站 PDF 为旧 Hash `b3bef097...fc8d3`。若前两项变化，停止实施并按 Potential decision boundaries 处理；旧网站 PDF 不同是预期状态。

- [ ] **Step 2: 创建运行时恢复记录**

使用 `apply_patch` 创建：

```markdown
# Resume content alignment checkpoint

- authorization_status: active
- runtime_state: running
- profile: O2
- phase: Task 1
- completed: []
- last_valid_test: input hashes verified
- changed_files: []
- unverified_changes: []
- next_step: Task 2 Step 1
- user_reply_required: false
- forbidden_resume: false
```

Expected: 恢复文件存在，但不加入 Git 暂存区。

- [ ] **Step 3: 记录现有公共基线**

Run:

```bash
npm run check
npx playwright test e2e/resume-data.spec.ts e2e/about.spec.ts e2e/resume.spec.ts e2e/resume-pdf.spec.ts
```

Expected: 当前代码在修改前通过；若失败，记录原始失败到 checkpoint，区分基线问题和本轮回归后再继续。

### Task 2: 用失败测试锁定两个 AI 项目和公共事实

**Files:**

- Modify: `/Users/qqx/my_code_cursor/personal-website/e2e/resume-data.spec.ts`
- Modify: `/Users/qqx/my_code_cursor/personal-website/e2e/resume.spec.ts`
- Modify: `/Users/qqx/my_code_cursor/personal-website/e2e/about.spec.ts`

- [ ] **Step 1: 更新公共项目与变体断言**

在 `e2e/resume-data.spec.ts` 将 `projectPeriods` 和项目数量改为：

```ts
const projectPeriods = {
  permissions: '2022.06–2023.12｜分两期建设',
  membership: '2022.09–2024.07',
  analytics: '2022.12–2024.05',
  parking: '2024.07–2026.03',
  sales: '2025.04–至今',
  ai: '2026.04–至今',
  knowledge: '2026.04–至今',
  site: '2026.06–至今',
};

expect(resumeFacts.projects).toHaveLength(8);
```

用以下精确断言替换旧 AI 个人验证断言：

```ts
test('AI facts separate delivery workflows from the enterprise knowledge platform', () => {
  const agent = resumeFacts.projects.find(({ id }) => id === 'ai');
  const knowledge = resumeFacts.projects.find(({ id }) => id === 'knowledge');
  expect(agent?.name).toBe('企业产品交付 Agent Harness');
  expect(agent?.state).toBe('内部复用｜持续完善工作包');
  expect(JSON.stringify(agent)).toContain('Writer 与冷启动 Reviewer');
  expect(JSON.stringify(agent)).toContain('近 1 个月缩短至约 2 周');
  expect(JSON.stringify(agent)).toContain('PRD 审查环节节省 50% 时长');
  expect(knowledge?.name).toBe('Enterprise Knowledge Harness｜企业知识与上下文平台');
  expect(knowledge?.state).toBe('企业复用｜持续演进');
  expect(JSON.stringify(knowledge)).toContain('材料快照—内容切分—证据片段—候选知识卡—人工裁决—正式知识');
  expect(JSON.stringify(knowledge)).toContain('渗透率 100%');
});
```

变体顺序断言改为：

```ts
expect([master.leadProject?.id, ...master.projects.map(({ id }) => id)]).toEqual([
  'ai', 'knowledge', 'sales', 'permissions', 'analytics', 'membership', 'parking',
]);
expect([ai.leadProject?.id, ...ai.projects.map(({ id }) => id)]).toEqual([
  'ai', 'knowledge', 'sales',
]);
expect(b2b.projects.map(({ id }) => id)).toEqual(['sales', 'permissions', 'analytics']);
expect(b2b.shortProject?.id).toBe('ai');
```

- [ ] **Step 2: 更新 About 项目顺序、链接和敏感边界断言**

在 `e2e/about.spec.ts` 使用：

```ts
const expectedProjectOrder = [
  'ai',
  'knowledge',
  'site',
  'sales',
  'permissions',
  'analytics',
  'membership',
  'parking',
];
```

增加：

```ts
await expect(page.locator('[data-project-id="ai"] a'))
  .toHaveAttribute('href', `${basePath}ai/skill-desk/`);
await expect(page.locator('[data-project-id="knowledge"] a'))
  .toHaveAttribute('href', `${basePath}ai/knowledge-harness/`);
await expect(page.locator('[data-project-id="ai"]')).toContainText('近 1 个月缩短至约 2 周');
await expect(page.locator('[data-project-id="knowledge"]')).toContainText('渗透率 100%');
expect(mainText).not.toMatch(/个人稳定自用|尚未推广给团队/);
```

移动端和无 JavaScript 卡片数量均改为 `8`。

同时把 `e2e/resume-data.spec.ts` 中“完整版 Markdown 包含个人网站项目”的旧断言替换为当前母稿断言：

```ts
test('complete resume markdown contains the approved public facts', () => {
  const markdown = readFileSync('docs/resume/完整版-简历.md', 'utf8');
  expect(markdown).toMatch(/^# 钱麒祥$/m);
  expect(markdown).toContain('### 企业产品交付 Agent Harness');
  expect(markdown).toContain('### Enterprise Knowledge Harness｜企业知识与上下文平台');
  expect(markdown).toContain('### 全渠道销售线索管理系统');
  expect(markdown).toContain('近 1 个月缩短至约 2 周');
  expect(markdown).toContain('PRD审查环节节省50%时长');
  expect(markdown).toContain('2018.09–2022.06');
  expect(markdown).not.toContain('### 个人网站｜qqx.life');
  expect(markdown).not.toContain('### Personal Knowledge Harness｜个人 AI 产品工作台');
});
```

- [ ] **Step 3: 更新网页版简历顺序断言**

在 `e2e/resume.spec.ts` 使用：

```ts
// master
['ai', 'knowledge', 'sales', 'permissions', 'analytics', 'membership', 'parking']

// ai
['ai', 'knowledge', 'sales']

// b2b
['sales', 'permissions', 'analytics', 'ai']
```

并将 AI 页的内容断言改为：

```ts
await expect(page.getByText(/近 1 个月缩短至约 2 周/)).toBeVisible();
await expect(page.getByRole('heading', { name: 'Enterprise Knowledge Harness｜企业知识与上下文平台' })).toBeVisible();
```

- [ ] **Step 4: 运行测试确认它们因旧数据失败**

Run:

```bash
npx playwright test e2e/resume-data.spec.ts e2e/about.spec.ts e2e/resume.spec.ts
```

Expected: FAIL，原因包含缺少 `knowledge`、旧 AI 名称、旧项目顺序或 About 卡片数量仍为 7；不得通过放宽断言解决。

### Task 3: 实现公共事实、About 和网页版简历

**Files:**

- Modify: `/Users/qqx/my_code_cursor/personal-website/src/data/resume/types.ts`
- Modify: `/Users/qqx/my_code_cursor/personal-website/src/data/resume/facts.ts`
- Modify: `/Users/qqx/my_code_cursor/personal-website/src/data/resume/variants.ts`
- Modify: `/Users/qqx/my_code_cursor/personal-website/src/data/profile.ts`
- Modify: `/Users/qqx/my_code_cursor/personal-website/src/data/about.ts`

- [ ] **Step 1: 增加第二个 AI 项目 ID**

在 `ResumeProjectId` 中加入：

```ts
  | 'knowledge'
```

- [ ] **Step 2: 更新工作经历和两个 AI 项目事实**

将浙江影能最后一条 highlight 改为：

```ts
'自 2026 年起探索产品 Agent 在真实产品工作中的应用，已搭建并应用 PRD 工作流，完成报价单与原型 Skill 的规划和验证，持续将需求分析、方案设计和交付过程沉淀为可复用工作流。'
```

用两个项目对象替换旧 `id: 'ai'` 对象：

```ts
{
  id: 'ai',
  name: '企业产品交付 Agent Harness',
  role: '产品设计与架构负责人',
  period: '2026.04–至今',
  state: '内部复用｜持续完善工作包',
  responsibilities: [
    '负责需求抽象、工作流架构、企业知识接入、质量门禁，以及 PRD、原型和报价工作包建设，并在真实产品任务中持续验证。',
  ],
  copy: {
    master: {
      background: '早期 PRD、报价和原型能力分别沉淀在独立 Skill 中，模板、规则与经验直接写在 Skill 正文里；随着迭代增加，Skill 不断膨胀，写作与审查又会继承相同假设，存量项目还需要反复寻找历史代码、文档和决策。',
      actions: [
        '重构 PRD Skill，按需求发现、PRD 写作和独立审查等任务类型组装最小上下文。',
        '将 PRD 生产拆分为 Writer 与冷启动 Reviewer 两个隔离工作流，关键问题未关闭时阻止进入后续交付。',
        '增加项目依赖门控，并建设基于封口 PRD、真实页面基线和结束同步门的原型工作流。',
        '根据需求蓝图、功能边界和交付范围生成结构化报价单。',
      ],
      results: [
        '企业知识库与 PRD 写作、独立审查工作流覆盖产品部门所有同事，渗透率 100%。',
        'PRD 从写作到通过独立审查、达到可交付状态的周期由近 1 个月缩短至约 2 周，PRD 审查环节节省 50% 时长。',
        'PRD、原型与报价能力形成可复用工作包，连接需求澄清、方案设计、质量审查和商务交付。',
      ],
    },
    compact: {
      background: 'PRD、原型和报价 Skill 各自携带知识且缺少隔离审查，需要重构为企业产品交付工作流。',
      actions: [
        '拆分 PRD Writer 与冷启动 Reviewer，增加项目依赖、原型同步和结构化报价门控。',
        '由企业知识库按任务提供规则、经验和项目记忆。',
      ],
      results: [
        '覆盖产品部门所有同事，渗透率 100%；PRD 可交付周期由近 1 个月缩短至约 2 周。',
        'PRD 审查环节节省 50% 时长；原型和报价不扩写未经验证的团队效率数字。',
      ],
    },
  },
  tags: ['企业 Agent', 'PRD Writer / Reviewer', '项目依赖门控', '原型与报价'],
},
{
  id: 'knowledge',
  name: 'Enterprise Knowledge Harness｜企业知识与上下文平台',
  role: '产品设计与架构负责人',
  period: '2026.04–至今',
  state: '企业复用｜持续演进',
  responsibilities: [
    '负责整体架构、历史材料迁移、候选知识治理、上下文组装和版本演进机制设计，并将能力接入真实产品工作流。',
  ],
  copy: {
    master: {
      background: '企业规范、历史项目经验和业务文档分散在不同系统中；全量加载会造成上下文膨胀、来源冲突和成本增加，而把规则长期写在 Skill 中又会让工作流与企业知识耦合，难以独立升级。',
      actions: [
        '将知识系统拆分为原始材料、正式知识、企业能力包和 Agent 工作流。',
        '建立“材料快照—内容切分—证据片段—候选知识卡—人工裁决—正式知识”的生产链路。',
        '建立领域、任务和项目记忆索引，并按相关性、权威性、时效性和上下文预算组装最小充分上下文。',
        '使用灰度发布、版本校验和生产级回滚管理知识包与 Skill。',
      ],
      results: [
        '企业知识库已与 PRD Writer、独立 Reviewer 工作流连接，覆盖产品部门所有同事，渗透率 100%。',
        '除历史文档缺失的产品优化需求外，其他需求均可覆盖；规则、案例与项目记忆可以独立维护、按任务加载和版本化演进。',
      ],
    },
    compact: {
      background: '企业知识分散且全量加载会引发膨胀与冲突，需要可治理、可组装、可回滚的上下文平台。',
      actions: [
        '建立知识生产链、三级索引和最小充分上下文组装。',
        '将知识与固定 Skill 正文解耦，并引入版本校验和回滚。',
      ],
      results: [
        '接入 PRD Writer 与独立 Reviewer，覆盖产品部门所有同事，渗透率 100%。',
        '规则、案例和项目记忆可独立维护、按任务加载和版本化演进。',
      ],
    },
  },
  tags: ['企业知识库', 'Context Engineering', 'RAG', '版本发布与回滚'],
},
```

- [ ] **Step 3: 替换销售线索公共事实中的旧贡献边界**

保留现有结果数字，使用以下职责和行动：

```ts
name: '全渠道销售线索管理系统',
responsibilities: [
  '从 0 到 1 负责整套销售线索系统建设，主导抖音、快手、美团、小红书、高德、微信和支付宝七个平台接入，以及采集整合、任务生命周期、智能分发、公海池、自动回收和商业化演进的设计。',
],
actions: [
  '统一七个平台的线索来源、门店和状态口径，将采集数据接入销售线索任务生命周期。',
  '设计资格筛选、候选门店排序和智能分发机制。',
  '结合场景保护期、阶段扩圈、公海池认领和超时回收，形成可解释、可配置、可回收的责任闭环。',
  '完成品牌治理下的门店采购模式设计，并兼容既有智能分发、任务和回收生命周期。',
],
```

compact copy 不再出现清洗层已排期或付费认领规划中。

- [ ] **Step 4: 更新变体、Profile 和 About**

`variants.ts` 使用：

```ts
// master
leadProjectId: 'ai',
projectIds: ['knowledge', 'sales', 'permissions', 'analytics', 'membership', 'parking'],

// ai
leadProjectId: 'ai',
projectIds: ['knowledge', 'sales'],

// b2b 保持商业项目，短证明仍为 Agent Harness
projectIds: ['sales', 'permissions', 'analytics'],
shortProjectId: 'ai',
```

Profile 使用：

```ts
summary: '4 年以上 B2B 企业服务产品经验，覆盖 CRM、权限、经营分析、交易与会员营销；已将企业 Agent 工作流、RAG 与上下文治理用于真实产品交付。',
typewriter: [
  '企业服务产品 → AI 产品经理',
  '复杂规则 / 权限 / 数据建模',
  '企业 Agent 工作流与知识平台',
],
```

About 的 AI 指标使用：

```ts
metrics: [
  { value: '100%', label: '产品部门工作流覆盖' },
  { value: '约 2 周', label: 'PRD 达到可交付状态' },
  { value: '50%', label: 'PRD 审查时长节省' },
  { value: '2 层', label: '交付工作流 + 知识平台' },
],
```

AI 项目组使用：

```ts
projects: [
  view('ai', 'ai/skill-desk/', '查看产品交付工作流'),
  view('knowledge', 'ai/knowledge-harness/'),
  view('site', 'https://github.com/666qqx666-jpg/personal-website', '查看网站源码', true, '具体实现'),
],
```

- [ ] **Step 5: 运行类型与公共页面测试**

Run:

```bash
npm run check
npx playwright test e2e/resume-data.spec.ts e2e/about.spec.ts e2e/resume.spec.ts
```

Expected: PASS；AI 单页若超过一张 A4，先压缩 compact copy，不删除 `knowledge` 或放宽一页断言。

- [ ] **Step 6: 提交公共事实阶段**

Run:

```bash
git add \
  src/data/resume/types.ts src/data/resume/facts.ts src/data/resume/variants.ts \
  src/data/profile.ts src/data/about.ts \
  e2e/resume-data.spec.ts e2e/about.spec.ts e2e/resume.spec.ts
git commit -m "feat: align public resume facts"
```

Expected: 只提交上述文件；更新 checkpoint 的 completed、changed_files、last_valid_test 和 next_step。

### Task 4: 原样替换新版 PDF

**Files:**

- Modify: `/Users/qqx/my_code_cursor/personal-website/e2e/resume-pdf.spec.ts`
- Modify: `/Users/qqx/my_code_cursor/personal-website/public/resume.pdf`

- [ ] **Step 1: 先更新 PDF 精确断言**

在 `e2e/resume-pdf.spec.ts` 使用：

```ts
expect(pdf.byteLength).toBe(1_004_081);
expect(createHash('sha256').update(pdf).digest('hex')).toBe(
  '7ac1cd36e29c67379846c7dc7015e1176bae9c4ace1ee1d58d93a942454a6418',
);
```

- [ ] **Step 2: 运行测试确认旧 PDF 失败**

Run:

```bash
npx playwright test e2e/resume-pdf.spec.ts -g "AI product manager resume PDF"
```

Expected: FAIL，显示旧字节数或旧 Hash。

- [ ] **Step 3: 字节复制新版 PDF**

Run:

```bash
cp /Users/qqx/Desktop/个人/钱麒祥-AI产品经理.pdf \
  /Users/qqx/my_code_cursor/personal-website/public/resume.pdf
shasum -a 256 \
  /Users/qqx/Desktop/个人/钱麒祥-AI产品经理.pdf \
  /Users/qqx/my_code_cursor/personal-website/public/resume.pdf
```

Expected: 两行均为 `7ac1cd36e29c67379846c7dc7015e1176bae9c4ace1ee1d58d93a942454a6418`。

- [ ] **Step 4: 验证 PDF 与下载测试**

Run:

```bash
npx playwright test e2e/resume-pdf.spec.ts e2e/about.spec.ts
```

Expected: PASS；B2B PDF 仍存在且未改变。

- [ ] **Step 5: 提交 PDF 阶段**

```bash
git add public/resume.pdf e2e/resume-pdf.spec.ts
git commit -m "feat: update AI product manager resume PDF"
```

### Task 5: 升级 Enterprise Knowledge Harness 与 AI 入口

**Files:**

- Modify: `/Users/qqx/my_code_cursor/personal-website/e2e/skill-desk.spec.ts`
- Modify: `/Users/qqx/my_code_cursor/personal-website/e2e/claude-code-architecture.spec.ts`
- Modify: `/Users/qqx/my_code_cursor/personal-website/src/pages/ai/index.astro`
- Modify: `/Users/qqx/my_code_cursor/personal-website/src/pages/ai/knowledge-harness.astro`
- Modify: `/Users/qqx/my_code_cursor/personal-website/src/pages/ai/claude-code-architecture.astro`

- [ ] **Step 1: 写 AI 入口和十段企业叙事失败测试**

在 `e2e/skill-desk.spec.ts` 的 AI listing 测试增加：

```ts
const harness = page.locator('.card', { hasText: 'Enterprise Knowledge Harness' });
await expect(harness).toBeVisible();
await expect(harness).toContainText('企业知识');
await expect(harness).toHaveAttribute('href', '/ai/knowledge-harness/');
```

在 `e2e/claude-code-architecture.spec.ts` 更新桥接文案并增加：

```ts
test('Enterprise Knowledge Harness tells the complete enterprise platform story', async ({ page }) => {
  await page.goto('/ai/knowledge-harness/');
  await expect(page.getByRole('heading', { name: 'Enterprise Knowledge Harness' })).toBeVisible();
  await expect(page.locator('main#deck section')).toHaveCount(10);
  await expect(page.locator('#s2')).toContainText('企业规范、历史项目经验和业务文档');
  await expect(page.locator('#s3')).toContainText('原始材料');
  await expect(page.locator('#s3')).toContainText('企业能力包');
  await expect(page.locator('#s4')).toContainText('候选知识卡');
  await expect(page.locator('#s5')).toContainText('领域索引');
  await expect(page.locator('#s6')).toContainText('最小充分上下文');
  await expect(page.locator('#s7')).toContainText('权威性');
  await expect(page.locator('#s8')).toContainText('降级或人工确认');
  await expect(page.locator('#s9')).toContainText('灰度发布');
  await expect(page.locator('#s10')).toContainText('渗透率 100%');
  expect(await page.locator('body').innerText()).not.toContain('Personal Knowledge Harness');
});
```

- [ ] **Step 2: 运行测试确认旧页面失败**

Run:

```bash
npx playwright test e2e/skill-desk.spec.ts -g "AI listing" e2e/claude-code-architecture.spec.ts
```

Expected: FAIL，原因是旧标题、旧桥接文案或企业十段内容缺失。

- [ ] **Step 3: 更新 AI 列表和方法页桥接**

AI 列表第一项改为：

```ts
{
  title: 'Enterprise Knowledge Harness',
  hook: '把企业材料变成可治理、可组装、可版本化的最小充分上下文，并接入真实产品工作流',
  tags: ['企业知识平台', 'Context Engineering', '内部复用'],
  href: `${base}ai/knowledge-harness/`,
},
```

Claude Code 方法页桥接改为：

```astro
<p>Enterprise Knowledge Harness 是这套 AI 产品架构方法在企业知识与产品工作流中的落地。</p>
<a class="bridge-link" href={`${base}ai/knowledge-harness/`}>查看 Enterprise Knowledge Harness</a>
```

- [ ] **Step 4: 将 Knowledge Harness 十段内容按以下结构替换**

保留 `DeckLayout`、十段 section、timeline、主题切换和现有响应式样式，逐段使用以下唯一文案结构：

```ts
const enterpriseSections = [
  ['s2', '02 · 企业问题', '企业知识分散，Agent 先遇到的不是检索问题',
    ['企业规范、历史项目经验和业务文档分散在不同系统。', '全量加载造成上下文膨胀、来源冲突和加载成本增加。', '规则长期写在 Skill 中会让工作流与企业知识耦合。']],
  ['s3', '03 · 分层架构', '把知识系统与 Agent 工作流拆开',
    ['原始材料继续作为动态事实真值源。', '正式知识承载经过裁决的复用单元。', '企业能力包提供组织规则和任务入口。', 'Agent 工作流只保留流程、角色和质量门禁。']],
  ['s4', '04 · 知识生产', '知识不是上传完成，而是经过证据链生产',
    ['材料快照', '内容切分', '证据片段', '候选知识卡', '人工裁决', '正式知识']],
  ['s5', '05 · 路由索引', '文件不会丢，真正会丢的是召回路径',
    ['领域索引决定进入哪个知识域。', '任务索引决定当前问题需要哪些规则。', '项目记忆索引负责历史代码、文档和项目决策。']],
  ['s6', '06 · 上下文组装', '每次只组装完成任务所需的最小充分上下文',
    ['按任务类型、项目范围和知识权威顺序加载。', 'context-pack 同时说明最终加载、未加载原因和风险。', '原文、正式知识和工作流记忆不混成同一真值。']],
  ['s7', '07 · 排序机制', '相关不等于应该进入上下文',
    ['综合相关性、权威性、时效性和上下文预算排序。', '优先保留当前事实和正式规则。', '弱相关材料不能因为关键词命中就挤占预算。']],
  ['s8', '08 · 失败边界', '冲突、过期和缺失必须有可观察行为',
    ['弱相关内容不加载。', '来源冲突时显式标记并按权威顺序处理。', '过期或缺失材料触发降级或人工确认。']],
  ['s9', '09 · 版本演进', '企业知识也需要可灰度、可校验、可回滚',
    ['灰度发布知识包与 Skill。', '切换前执行版本校验。', '生产异常时回滚到上一稳定版本，在不影响 V1 的前提下引入 V2 索引、组装和排序。']],
  ['s10', '10 · 真实结果', '知识平台已经进入真实产品交付',
    ['连接 PRD Writer 与独立 Reviewer。', '覆盖产品部门所有同事，渗透率 100%。', '除历史文档缺失的产品优化需求外，其他需求均可覆盖。', '规则、案例与项目记忆可以独立维护、按任务加载和版本化演进。']],
] as const;
```

在 frontmatter 定义上述数组，并用以下结构渲染 s2–s10；s10 仍由数组渲染，因此页面总数为封面加 9 段：

```astro
{enterpriseSections.map(([id, label, heading, points]) => (
  <section id={id}>
    <div class="chapter">{label}</div>
    <h2>{heading}</h2>
    <div class="split enterprise-split">
      <div class="ptd">
        {points.map((point, index) => (
          <div class="ptd-row">
            <span class:list={['pill', index === 0 ? 'p' : index === points.length - 1 ? 'd' : 't']}>
              {String(index + 1).padStart(2, '0')}
            </span>
            <p>{point}</p>
          </div>
        ))}
      </div>
      <div class="figure enterprise-map" aria-label={`${heading}结构图`}>
        {points.map((point, index) => (
          <article>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <p>{point}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
))}
```

timeline 使用同一组 ID，避免页面正文与导航分叉：

```ts
const timelineLabels = ['问题', '分层', '生产', '索引', '组装', '排序', '边界', '版本', '结果'] as const;
```

```astro
<nav class="timeline" id="tl" aria-label="Enterprise Knowledge Harness timeline">
  <a href="#s1" data-t="s1"><span class="dot"></span><span class="lbl">封面</span></a>
  {enterpriseSections.map(([id], index) => (
    <a href={`#${id}`} data-t={id}><span class="dot"></span><span class="lbl">{timelineLabels[index]}</span></a>
  ))}
</nav>
```

在原 style 中删除只服务旧 SVG 的选择器后加入：

```css
.enterprise-split { align-items: stretch; }
.enterprise-map {
  display: grid;
  align-content: center;
  gap: .75rem;
}
.enterprise-map article {
  display: grid;
  grid-template-columns: 2.5rem minmax(0, 1fr);
  gap: .75rem;
  align-items: center;
  border: 1px solid var(--glass-border);
  border-radius: .8rem;
  background: rgba(79, 140, 255, .08);
  padding: .8rem 1rem;
}
.enterprise-map article span { color: var(--c-cyan); font-weight: 800; }
.enterprise-map article p { color: var(--text-dim); line-height: 1.6; }
@media (max-width: 760px) {
  .enterprise-split { grid-template-columns: 1fr; gap: 1.25rem; }
  .enterprise-map { width: 100%; }
}
```

封面使用：

```astro
<h1>Enterprise Knowledge Harness</h1>
<p class="sub">企业知识与上下文平台——让多个 Agent 与产品经理基于同一事实工作</p>
```

timeline 标签固定为：`封面、问题、分层、生产、索引、组装、排序、边界、版本、结果`。页面不得保留个人知识库数量、个人三 Agent 记忆或“个人工作代理”结果。

- [ ] **Step 5: 运行 AI 页面测试与溢出检查**

Run:

```bash
npx playwright test e2e/skill-desk.spec.ts -g "AI listing" e2e/claude-code-architecture.spec.ts
```

Expected: PASS；Knowledge Harness 桌面和 390px 视口均无横向溢出。

- [ ] **Step 6: 提交 Enterprise Knowledge Harness 阶段**

```bash
git add \
  src/pages/ai/index.astro src/pages/ai/knowledge-harness.astro src/pages/ai/claude-code-architecture.astro \
  e2e/skill-desk.spec.ts e2e/claude-code-architecture.spec.ts
git commit -m "feat: upgrade enterprise knowledge harness"
```

### Task 6: 将 Agent Harness 内容放入对应 Skill 模块

**Files:**

- Modify: `/Users/qqx/my_code_cursor/personal-website/src/data/skillDesk.ts`
- Modify: `/Users/qqx/my_code_cursor/personal-website/src/pages/ai/skill-desk/index.astro`
- Modify: `/Users/qqx/my_code_cursor/personal-website/e2e/skill-desk.spec.ts`

- [ ] **Step 1: 写交付链和模块状态失败测试**

在 Skill Desk 首页测试增加：

```ts
const harness = page.locator('[data-agent-harness]');
await expect(harness).toBeVisible();
for (const label of ['需求发现', 'PRD Writer', '冷启动 Reviewer', '原型生成', 'PRD 同步', '结构化报价']) {
  await expect(harness).toContainText(label);
}
await expect(harness).toContainText('Enterprise Knowledge Harness');
await expect(page.locator('.skill-card')).toHaveCount(9);
await expect(page.locator('.skill-card', { hasText: '原型设计工作流' })).toContainText('已规划并验证');
await expect(page.locator('.skill-lab .lab-item')).toHaveCount(1);
await expect(page.locator('.harness-link')).toContainText('应用层');
```

对应详情断言增加：

```ts
await expect(page.locator('#s7')).toContainText('历史代码、文档和项目决策');
await expect(page.locator('#s11')).toContainText('渗透率 100%');
await expect(page.locator('#s11')).toContainText('近 1 个月缩短至约 2 周');
await expect(page.locator('#s11')).toContainText('节省 50% 时长');
await expect(page.locator('#s10')).toContainText('企业交付工作包');
await expect(page.locator('#s10')).toContainText('产品经理、项目经理和销售');
```

- [ ] **Step 2: 运行 Skill 测试确认失败**

Run:

```bash
npx playwright test e2e/skill-desk.spec.ts
```

Expected: FAIL，原因包含没有 Agent Harness 流程、原型仍在 Lab、详情页仍为个人/潜力状态。

- [ ] **Step 3: 增加 Agent Harness 交付链数据**

在 `skillDesk.ts` 导出：

```ts
export const agentHarnessStages = [
  { label: '需求发现', detail: '识别需求来源、角色、证据与存量项目依赖', href: '/ai/skill-desk/requirement-discovery/' },
  { label: 'PRD Writer', detail: '按企业模板、业务规则和项目记忆形成正文', href: '/ai/skill-desk/prd-skill/' },
  { label: '冷启动 Reviewer', detail: '隔离写作假设，关键问题未关闭时阻止后续交付', href: '/ai/skill-desk/prd-skill/' },
  { label: '原型生成', detail: '基于封口 PRD 与真实页面基线生成高保真原型' },
  { label: 'PRD 同步', detail: '原型结束后同步产品级变化，拒绝静默覆盖 PRD' },
  { label: '结构化报价', detail: '按需求蓝图、功能边界和交付范围生成报价单', href: '/ai/skill-desk/quotation/' },
] as const;

export const agentHarnessEvidence = [
  'PRD Writer 与独立 Reviewer 覆盖产品部门所有同事，渗透率 100%',
  'PRD 达到可交付状态的周期由近 1 个月缩短至约 2 周',
  'PRD 审查环节节省 50% 时长',
] as const;
```

- [ ] **Step 4: 将原型工作流移入正式 Skill 卡区**

从 `skillLabItems` 删除原型对象，在 `skillDeskItems` 报价卡之后加入：

```ts
{
  slug: 'prototype-design-workflow',
  name: 'prototype-design-workflow',
  title: '原型设计工作流',
  problem: '高保真原型需要继承封口 PRD 与真实页面基线，并把产品级变化同步回 PRD。',
  category: '交付与报价',
  useCases: ['真实页面基线', '高保真原型', '产品级变化裁决', 'PRD 同步门'],
  outputs: ['高保真原型', '原型裁决同步表', 'PRD 回写清单', 'prototype-sync'],
  maturity: 'iterating',
  maturityLabel: '已规划并验证',
  productization: 'enterprise-candidate',
  productizationLabel: '企业工作包',
},
```

多 Agent 协作协议仍留在 Lab，不修改其验证边界。

- [ ] **Step 5: 更新对应 Skill 的最终状态文本**

使用以下精确替换：

```ts
// requirement-discovery s7
heading: '第三层判断：证据和项目依赖是否足够',
points: [
  '核对当前流程、数据证据、角色链路、替代方案、约束条件和成功指标。',
  '涉及存量系统时，先识别历史代码、文档和项目决策依赖。',
  '再由 Enterprise Knowledge Harness 的项目记忆按任务加载，缺失时显式标记而不是让模型补全。',
],

// prd-skill s11
points: [
  'PRD Writer 与冷启动 Reviewer 已覆盖产品部门所有同事，渗透率 100%。',
  'PRD 从写作到通过独立审查、达到可交付状态的周期由近 1 个月缩短至约 2 周。',
  'PRD 审查环节节省 50% 时长；关键问题未关闭时阻止进入原型、报价或实施。',
],

// quotation s10
points: [
  '当前形态是企业产品交付 Agent Harness 中的结构化报价工作包。',
  '根据需求蓝图、功能边界和交付范围组织客户可读模块、角色工时与报价单。',
  '减少产品经理、项目经理和销售的人工拆分与反复核对，不扩写未经验证的效率比例。',
],

// memory-loader s3 / s10
insight: 'Enterprise Knowledge Harness 将工作流与企业知识解耦；当 Skill、知识卡和项目记忆增长时，memory-loader 负责避免全量加载。',
points: [
  '当前形态是 Enterprise Knowledge Harness 向产品工作流提供上下文的加载接口。',
  '按任务类型、项目范围、权威性、时效性和上下文预算生成最小充分上下文。',
  '它不替代 PRD、原型或报价，只负责让这些工作流读取正确的企业规则、经验和项目记忆。',
],
```

- [ ] **Step 6: 在 Skill Desk 首页渲染应用层**

从 `skillDesk.ts` 导入两个新数组，在卡片网格之前加入：

```astro
<section class="agent-harness reveal" data-agent-harness>
  <div class="harness-intro">
    <p class="eyebrow">Enterprise Product Delivery Agent Harness</p>
    <h2>把独立 Skill 连接成可交付工作流</h2>
    <p>Skill 负责流程、角色和质量门禁；Enterprise Knowledge Harness 按任务提供规则、经验与项目记忆。</p>
  </div>
  <div class="harness-stages">
    {agentHarnessStages.map((stage, index) => (
      <article>
        <span>{String(index + 1).padStart(2, '0')}</span>
        <h3>{stage.label}</h3>
        <p>{stage.detail}</p>
        {'href' in stage && stage.href && <a href={`${base}${stage.href.replace(/^\//, '')}`}>查看模块</a>}
      </article>
    ))}
  </div>
  <div class="harness-evidence">
    {agentHarnessEvidence.map((item) => <p>{item}</p>)}
  </div>
</section>
```

底部链接改为：

```astro
<a class="harness-link reveal" href={`${base}ai/knowledge-harness/`}>
  Skill Desk 是应用层；Enterprise Knowledge Harness 提供知识与上下文基础层
</a>
```

新增样式只复用现有 `--surface`、`--border`、`--accent`、`--shadow` 变量，移动端将 `.harness-stages` 改为单列，不引入新主题令牌。

使用以下完整样式：

```css
.agent-harness {
  display: grid;
  gap: 1.25rem;
  margin: 2.5rem 0 2rem;
  padding: clamp(1.25rem, 3vw, 2rem);
  border: 1px solid var(--border);
  border-radius: 1.25rem;
  background: var(--surface);
  box-shadow: var(--shadow);
}
.harness-intro { display: grid; gap: .65rem; max-width: 52rem; }
.harness-intro p:last-child { color: var(--muted); line-height: 1.75; }
.harness-stages {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: .75rem;
}
.harness-stages article {
  display: grid;
  align-content: start;
  gap: .45rem;
  min-width: 0;
  border: 1px solid var(--border);
  border-radius: .9rem;
  background: var(--bg-soft);
  padding: 1rem;
}
.harness-stages article > span { color: var(--accent); font-size: .75rem; font-weight: 800; }
.harness-stages article p { color: var(--muted); line-height: 1.65; }
.harness-stages article a { color: var(--accent); font-weight: 750; }
.harness-evidence { display: grid; gap: .5rem; }
.harness-evidence p {
  border-left: 3px solid var(--accent);
  background: var(--bg-soft);
  padding: .65rem .8rem;
  line-height: 1.6;
}
@media (max-width: 760px) {
  .harness-stages { grid-template-columns: 1fr; }
}
```

- [ ] **Step 7: 运行 Skill Desk 全量回归并提交**

Run:

```bash
npx playwright test e2e/skill-desk.spec.ts
```

Expected: PASS，9 张正式卡、1 个 Lab 项、8 个既有详情路由不变、桌面和移动端无溢出。

```bash
git add src/data/skillDesk.ts src/pages/ai/skill-desk/index.astro e2e/skill-desk.spec.ts
git commit -m "feat: map agent harness into skill desk"
```

### Task 7: 重写全渠道销售线索项目

**Files:**

- Modify: `/Users/qqx/my_code_cursor/personal-website/e2e/sales-lead-slm.spec.ts`
- Modify: `/Users/qqx/my_code_cursor/personal-website/src/pages/projects/index.astro`
- Modify: `/Users/qqx/my_code_cursor/personal-website/src/pages/projects/sales-lead-slm.astro`

- [ ] **Step 1: 将旧贡献边界测试改为新版事实测试**

更新 listing 标题，并用以下断言替换旧边界和未来状态断言：

```ts
await expect(page.locator('#s1')).toContainText('7 个平台');
await expect(page.locator('#s1')).toContainText('从 0 到 1');
await expect(page.locator('#s2')).toContainText('抖音、快手、美团、小红书、高德、微信和支付宝');
await expect(page.locator('#s2')).toContainText('整套销售线索系统建设');
await expect(page.locator('#s9 [data-status]')).toHaveText('模式设计完成');
await expect(page.locator('#s10 [data-status]')).toHaveText('兼容既有链路');
await expect(page.locator('#s11 [data-status]')).toHaveText('持续商业化演进');
await expect(page.locator('#s10')).toContainText('避免另建一套孤立购买系统');

const body = await page.locator('body').innerText();
expect(body).not.toMatch(/前任 PM|已排期|方案规划中|尚未进入详细 PRD/);
```

- [ ] **Step 2: 运行销售线索测试确认失败**

Run:

```bash
npx playwright test e2e/sales-lead-slm.spec.ts
```

Expected: FAIL，显示旧标题、5 类来源、旧贡献边界和旧未来状态。

- [ ] **Step 3: 更新入口、封面和职责**

项目列表与页面 title 统一为 `全渠道销售线索管理系统`。封面规模与职责使用：

```ts
const scale = [
  ['约 10 个', '付费品牌'],
  ['约 15,000 家', '上线门店'],
  ['7 个平台', '线索接入'],
];
```

```astro
<p class="lead">全渠道销售线索管理系统：从多平台接入到可回收的门店责任闭环</p>
<p class="role-line">我作为产品线负责人，从 0 到 1 负责整套销售线索系统建设，覆盖采集整合、任务生命周期、智能分发、公海池、自动回收和商业化演进。</p>
```

s2 的贡献边界改为：

```astro
<p class="boundary-note"><strong>本人职责：</strong>主导抖音、快手、美团、小红书、高德、微信和支付宝七个平台接入，统一线索来源、门店和状态口径，并将采集数据接入销售线索任务生命周期。</p>
```

- [ ] **Step 4: 将 s9–s11 改为商业化演进而非旧未来计划**

保留 section ID、data-scene 和 GSAP 容器，替换正文：

```astro
<section id="s9" data-scene="purchase-model" data-chapter="rebuild">
  <div class="scene-shell">
    <span class="status status-scheduled" data-status>模式设计完成</span>
    <h2>门店动力不足，不能只靠继续加重分发规则</h2>
    <ol class="responsibility-flow">
      <li data-motion="responsibility-node">品牌治理可参与采购的门店范围</li>
      <li data-motion="responsibility-node">门店获取可用于认领线索的采购资格</li>
      <li data-motion="responsibility-node">候选门店继续经过资格筛选和排序</li>
      <li data-motion="responsibility-node">认领后形成明确跟进责任</li>
    </ol>
  </div>
</section>

<section id="s10" data-scene="compatibility" data-chapter="rebuild">
  <div class="scene-shell">
    <span class="status status-planning" data-status>兼容既有链路</span>
    <h2>把付费认领放回智能分发、任务和回收生命周期</h2>
    <ol class="responsibility-flow">
      <li data-motion="responsibility-node">资格筛选与候选门店排序</li>
      <li data-motion="responsibility-node">保护期与阶段扩圈</li>
      <li data-motion="responsibility-node">公海池认领并建立任务</li>
      <li data-motion="responsibility-node">超时回收并再次分发</li>
    </ol>
    <p class="boundary-note">门店采购模式兼容既有智能分发、任务和回收生命周期，避免另建一套孤立购买系统。</p>
  </div>
</section>

<section id="s11" data-scene="validation" data-chapter="rebuild">
  <div class="scene-shell">
    <span class="status status-validation" data-status>持续商业化演进</span>
    <h2>商业化是否成立，仍要回到门店承接结果</h2>
    <div class="validation-grid">
      <article data-motion="responsibility-node"><strong>认领率</strong><p>具备资格的门店是否愿意主动承接。</p></article>
      <article data-motion="responsibility-node"><strong>首次跟进时效</strong><p>认领后是否更快进入有效联系。</p></article>
      <article data-motion="responsibility-node"><strong>超时回收率</strong><p>付费认领是否减少占单不跟进。</p></article>
      <article data-motion="responsibility-node"><strong>核销与成交</strong><p>门店责任改善是否继续反映到业务结果。</p></article>
      <article data-motion="responsibility-node"><strong>争议边界</strong><p>错误线索、重复线索和责任争议如何处理。</p></article>
    </div>
    <a class="back-projects" href={`${base}projects/`}>返回项目经历</a>
  </div>
</section>
```

- [ ] **Step 5: 运行销售线索动画与内容回归**

Run:

```bash
npx playwright test e2e/sales-lead-slm.spec.ts
```

Expected: PASS；仍为 11 scenes、5 个章节、桌面 2 个 pin、移动端 0 pin、无 JavaScript 可读且无浏览器错误。

- [ ] **Step 6: 提交销售线索阶段**

```bash
git add src/pages/projects/index.astro src/pages/projects/sales-lead-slm.astro e2e/sales-lead-slm.spec.ts
git commit -m "feat: align full-channel sales lead story"
```

### Task 8: 收口其余商业项目事实

**Files:**

- Modify: `/Users/qqx/my_code_cursor/personal-website/src/pages/projects/smart-parking.astro`
- Modify: `/Users/qqx/my_code_cursor/personal-website/e2e/smart-parking.spec.ts`
- Modify: `/Users/qqx/my_code_cursor/personal-website/e2e/group-business-analytics.spec.ts`

- [ ] **Step 1: 更新停车金额与项目列表断言**

将 `118.33` 统一为母稿的 `118.3`：

```ts
{ id: 'payable-amount', value: '约 118.3 万元', label: '月停车应付金额', status: 'verified', scope: '8 个停车 2.0 商场', timeBasis: '现有月均口径' }
```

对应测试使用 `约 118.3 万元`。`e2e/group-business-analytics.spec.ts` 和 `e2e/smart-parking.spec.ts` 中项目卡标题统一改为 `全渠道销售线索管理系统`。

- [ ] **Step 2: 增加商业项目母稿事实审计断言**

在现有对应测试中保持并确认：

```ts
// 权限
'约 25 个综合商场' / '约 30 个连锁品牌' / '约 3,000 名已创建成员' / '单客户 3 万多家门店'

// 经营分析
'四类' / '约 25 个综合商场' / '季度考核'

// 会员
'约 876 万条' / '不是独立自然人数' / '约 88.7%' / '不是拉新转化率'

// 停车
'35 个停车商场' / '8 个' / '27 个' / '约 7.57 万笔' / '约 118.3 万元'
```

权限、经营分析、会员正文已与母稿一致，不为制造 diff 修改这些页面。

- [ ] **Step 3: 运行四个商业项目回归**

Run:

```bash
npx playwright test \
  e2e/enterprise-permissions.spec.ts \
  e2e/group-business-analytics.spec.ts \
  e2e/membership-operations.spec.ts \
  e2e/smart-parking.spec.ts
```

Expected: PASS。

- [ ] **Step 4: 提交商业项目审计阶段**

```bash
git add src/pages/projects/smart-parking.astro e2e/smart-parking.spec.ts e2e/group-business-analytics.spec.ts
git commit -m "fix: align commercial project facts"
```

### Task 9: 全站一致性、PDF 视觉与最终回归

**Files:**

- Test: `/Users/qqx/my_code_cursor/personal-website/src/`
- Test: `/Users/qqx/my_code_cursor/personal-website/e2e/`
- Update: `/Users/qqx/my_code_cursor/personal-website/tmp/implementation-checkpoints/resume-content-alignment.md`

- [ ] **Step 1: 扫描所有公开旧口径**

Run:

```bash
if rg -n \
  'Personal Knowledge Harness|个人稳定自用|尚未推广给团队|前任 PM|前任产品负责人|全域销售线索管理系统|清洗层已排期|方案规划中|尚未进入详细 PRD|个人 AI Agent 工作台' \
  src e2e; then
  exit 1
fi
```

Expected: 无输出，退出码 0。Spec 中作为历史说明出现的旧词不纳入公开扫描。

- [ ] **Step 2: 运行结构、类型和构建检查**

Run:

```bash
git diff --check
npm run check
npm run build
```

Expected: 全部返回 0；Astro build 输出 22 个现有页面且无新增 Agent Harness 页面。

- [ ] **Step 3: 运行定向验收**

Run:

```bash
npx playwright test \
  e2e/resume-data.spec.ts e2e/resume.spec.ts e2e/resume-pdf.spec.ts e2e/about.spec.ts \
  e2e/skill-desk.spec.ts e2e/claude-code-architecture.spec.ts \
  e2e/sales-lead-slm.spec.ts e2e/enterprise-permissions.spec.ts \
  e2e/group-business-analytics.spec.ts e2e/membership-operations.spec.ts e2e/smart-parking.spec.ts
```

Expected: PASS。

- [ ] **Step 4: 运行全量 E2E**

Run:

```bash
npm run test:e2e
```

Expected: 16 个 E2E 文件全部通过；不得用 `.skip`、减少路由或删除原测试规避失败。

- [ ] **Step 5: 重新渲染最终 PDF 做视觉检查**

Run:

```bash
mkdir -p /Users/qqx/my_code_cursor/personal-website/tmp/pdfs/final-resume-download
pdftoppm -png -r 144 \
  /Users/qqx/my_code_cursor/personal-website/public/resume.pdf \
  /Users/qqx/my_code_cursor/personal-website/tmp/pdfs/final-resume-download/page
pdfinfo /Users/qqx/my_code_cursor/personal-website/public/resume.pdf
```

Expected: 2 页 A4；逐页检查无缺页、截断、重叠、黑块或不可读文字。最终再次执行 Hash：

```bash
shasum -a 256 \
  /Users/qqx/Desktop/个人/钱麒祥-AI产品经理.pdf \
  /Users/qqx/my_code_cursor/personal-website/public/resume.pdf
```

Expected: 两行完全相同，均为 `7ac1cd36e29c67379846c7dc7015e1176bae9c4ace1ee1d58d93a942454a6418`。

- [ ] **Step 6: 审阅最终文件边界和提交状态**

Run:

```bash
git status --short
git diff --stat HEAD~5..HEAD
git log -5 --oneline
```

Expected: 用户原有未提交文件仍保持原状态；本轮提交只覆盖计划列出的公共网站、PDF 和 E2E 文件；`public/resume-b2b-saas.pdf` 未改变。

- [ ] **Step 7: 封闭 checkpoint**

将恢复记录更新为：

```markdown
- authorization_status: completed
- runtime_state: completed
- phase: Task 9
- last_valid_test: full Playwright, Astro check/build, PDF visual and SHA-256 PASS
- unverified_changes: []
- next_step: none
- user_reply_required: false
- forbidden_resume: true
```

Expected: 所有任务完成后再发送最终交付答复；checkpoint 不加入 Git。
