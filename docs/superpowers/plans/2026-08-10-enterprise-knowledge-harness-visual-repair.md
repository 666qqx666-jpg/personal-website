# Enterprise Knowledge Harness 视觉修复实施计划

> **Execution governance:** Before implementation, run the shared `adaptive-orchestration` preflight. A plan records a recommended profile but does not dispatch agents or authorize execution by itself.

**Goal:** 在不改动简历事实母稿和全站 Deck 基础设施的前提下，修复 `/ai/knowledge-harness/` 左右同文的回归，恢复十段企业案例叙事、九张独立结构图以及准确的 V1/V2 状态表达。

**Architecture:** 以独立数据模块保存九段左侧叙事，以 `DiagramFrame` 统一图注、图例、响应式与无障碍契约，再由九个零叙事入参的 Astro 组件分别实现独立拓扑。页面只负责章节与视觉组件的显式一一映射；Playwright 同时锁定结构、事实、左右语义差异、移动端布局和截图基线。

**Tech Stack:** Astro 5、TypeScript、HTML/CSS/SVG、Playwright、现有 `DeckLayout.astro`。

**Recommended execution profile:** O2；九张结构图可在共享框架稳定后分为三个独立工作流制作，但页面组装、测试文件和最终事实审查必须保持单写者收敛。

**Parallelizable workstreams:** `ProblemMap / LayeredArchitecture / KnowledgePipeline`、`RoutingIndexMap / ContextAssembly / RankingMechanism`、`FailureBoundary / ReleaseRollback / WorkflowImpact` 三组视觉组件可在 Task 2 完成后并行；Task 1、Task 6–9 串行。

**Shared-write conflicts:** `src/pages/ai/knowledge-harness.astro`、`src/data/knowledgeHarness.ts`、`src/components/knowledge-harness/DiagramFrame.astro`、`e2e/knowledge-harness.spec.ts` 和截图基线必须由单一写者维护；各视觉工作流不得修改这些共享文件。

**Stage evidence checkpoint:** Task 7 后执行 `npm run check && npx playwright test e2e/knowledge-harness.spec.ts e2e/claude-code-architecture.spec.ts`，随后执行 `shasum -a 256 src/data/knowledgeHarness.ts src/pages/ai/knowledge-harness.astro e2e/knowledge-harness.spec.ts` 并把测试结果与哈希写入运行时状态；该检查点不请求用户批准。

**Recovery entry:** `/Users/qqx/my_code_cursor/personal-website/docs/superpowers/plans/2026-08-10-enterprise-knowledge-harness-visual-repair.md`；恢复时先读运行时状态，再从本文件第一个未完成 Task 继续。

**Plan runtime state file:** `/Users/qqx/my_code_cursor/personal-website/tmp/plan-runtime/enterprise-knowledge-harness-visual-repair.plan-runtime.json`

**Authorization boundary:** 允许在本地仓库新增或修改 Knowledge Harness 页面、专用数据模块、专用视觉组件、专用 Playwright 测试与截图基线，并对现有 Knowledge Harness 桥接断言做定向调整；允许运行 Astro/Playwright/Git 只读检查、生成本地截图基线和创建范围内本地提交。必须保留用户已有未提交改动，只能按任务列出的精确路径暂存。

**Out of scope:** 不修改 `docs/resume/完整版-简历.md`、任何简历 PDF/DOCX、About、Skill Desk、销售线索及其他项目页；不修改 `src/layouts/DeckLayout.astro`；不修改 memory-loader、Knowledge Context V1/V2、Obsidian Vault 或共享 Skill；不启用 V2，不部署、不推送远端、不创建 Pull Request。

**Potential decision boundaries:** 若权威来源对 V1/V2 当前状态或业务结果出现冲突，需要在“以当前主线状态覆盖网站表述”与“先修订事实母稿再实施”之间选择；若 390px 可读性只能通过修改全局 `DeckLayout` 达成，需要在“继续页面内专用布局”与“授权全站 Deck 兼容改造”之间选择；若人工截图审查发现九段故事本身需要改序，需要在“保持已确认十段结构”与“重新进入设计讨论”之间选择。

---

## 实施依据

- 已批准 Spec：`/Users/qqx/my_code_cursor/personal-website/docs/superpowers/specs/2026-08-10-enterprise-knowledge-harness-visual-repair-design.md`
- 本实施计划：`/Users/qqx/my_code_cursor/personal-website/docs/superpowers/plans/2026-08-10-enterprise-knowledge-harness-visual-repair.md`
- 事实母稿：`/Users/qqx/my_code_cursor/personal-website/docs/resume/完整版-简历.md`
- 动态状态补充：`/Users/qqx/Documents/Obsidian Vault/能力层/记忆维护/当前主线状态.md`
- V2 架构补充：`/Users/qqx/my_code_cursor/learn_for_product/docs/superpowers/specs/2026-07-26-knowledge-context-v2-deterministic-retrieval-composer-design.md`
- 旧构图参考：`git show ca23423:src/pages/ai/knowledge-harness.astro`

## 产品知识预检

本计划按实施计划、技术分析和交付风险路由，加载了以下最小上下文：

- `真实任务上下文加载规则` 与 `个人知识库RAG式上下文治理规则`：约束最小充分加载和事实优先级。
- `上下文设计追求最小充分而非信息最多`：约束 S6 的核心产品判断。
- `AI产品架构六层总览` 与 `RAG Pipeline 五阶段架构`：校准“检索、重排、组装、质量门禁”的职责边界。
- `个人网站 V1–V3 阶段复盘材料索引` 与 `Personal Knowledge Harness v0 实施复盘`：只用于识别旧页面演进证据，不作为当前企业事实来源。
- `没有胜仗的敏捷会变成消耗`：约束 S9 将技术门与价值激活门分开。

未加载财经、心理学、儿童教育、竞品分析及旧 `wiki/` 正文，因为当前 Spec、简历和动态状态已足够。主要风险是旧页面的个人 V1/V2 命名与当前 Knowledge Context V1/V2 命名同名但语义不同，实施时不得从旧 SVG 文案反推现状。

## Spec-readiness：PASS

- **状态组合：** 页面只公开 `stable`、`shadow`、`gate`、`verified` 四类视觉状态；V1 是稳定基线，V2 是工程已实现但暂未激活，技术门通过不等于价值门通过。
- **失败与并发：** 页面无运行时读写；组件缺失、映射错误、左右同文、状态冲突和截图变化分别由构建、E2E 或人工审图阻断，不存在竞态或重试语义。
- **枚举闭合：** 九个 `visualId`、五个叙事 tone、十个 section、三张移动端关键截图均为封闭集合；没有依赖开放式“按需”分支。
- **单一真值源：** 简历负责稳定事实，当前主线状态负责 V1/V2 动态状态，V2 Spec 只补充技术职责；页面数据只消费这些结论，不自创第二份业务定义。

## 文件结构

```text
src/data/knowledgeHarness.ts                         # 九段左侧叙事与封闭类型
src/components/knowledge-harness/DiagramFrame.astro # 共享视觉语法、图注、图例、无障碍
src/components/knowledge-harness/ProblemMap.astro
src/components/knowledge-harness/LayeredArchitecture.astro
src/components/knowledge-harness/KnowledgePipeline.astro
src/components/knowledge-harness/RoutingIndexMap.astro
src/components/knowledge-harness/ContextAssembly.astro
src/components/knowledge-harness/RankingMechanism.astro
src/components/knowledge-harness/FailureBoundary.astro
src/components/knowledge-harness/ReleaseRollback.astro
src/components/knowledge-harness/WorkflowImpact.astro
src/pages/ai/knowledge-harness.astro                 # 十段 Deck 与显式视觉映射
e2e/knowledge-harness.spec.ts                        # 结构、事实、语义、交互、响应式
e2e/knowledge-harness.visual.spec.ts                 # 12 张视觉回归基线
e2e/knowledge-harness.visual.spec.ts-snapshots/      # Playwright 生成并人工审查的 PNG
e2e/claude-code-architecture.spec.ts                 # 只保留跨页面桥接断言
```

### Task 1: 先锁定结构、事实与去重契约

**Files:**
- Create: `e2e/knowledge-harness.spec.ts`

- [ ] **Step 1: 写入会在旧页面上失败的结构与事实测试**

```ts
import { readFile } from 'node:fs/promises';
import { test, expect } from '@playwright/test';

const visualIds = [
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

const normalize = (value: string) => value.replace(/[\s，。；：、/·—–-]/g, '').toLowerCase();

test('Knowledge Harness binds ten sections to nine unique diagrams', async ({ page }) => {
  await page.goto('/ai/knowledge-harness/');
  await expect(page.getByRole('heading', { name: 'Enterprise Knowledge Harness' })).toBeVisible();
  await expect(page.locator('main#deck section')).toHaveCount(10);
  await expect(page.locator('[data-visual]')).toHaveCount(9);
  expect(await page.locator('[data-visual]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-visual'))))
    .toEqual([...visualIds]);
  await expect(page.locator('nav.timeline a[data-t]')).toHaveCount(10);
});

test('narrative copy and diagram labels are not the same payload', async ({ page }) => {
  await page.goto('/ai/knowledge-harness/');
  for (let index = 2; index <= 10; index += 1) {
    const section = page.locator(`#s${index}`);
    const left = normalize(await section.locator('.narrative-copy').innerText());
    const right = normalize(await section.locator('.diagram-labels').innerText());
    expect(left.length).toBeGreaterThan(20);
    expect(right.length).toBeGreaterThan(12);
    expect(right).not.toBe(left);
  }
});

test('public facts separate V1 stable operation from V2 shadow capability', async ({ page }) => {
  await page.goto('/ai/knowledge-harness/');
  const body = await page.locator('body').innerText();
  for (const required of [
    '企业知识与固定 Skill 解耦',
    '三层知识架构',
    '根索引',
    '领域索引',
    '任务索引',
    '项目记忆索引',
    'V1 稳定基线',
    'V2 已实现但暂未激活',
    'Query Planner',
    'RoleRetriever',
    'RRF',
    'Reranker',
    'Selector',
    'Quality Gate',
    'Composer',
    'Renderer',
    'RetrievalTrace',
    'PRD Writer',
    '独立 Reviewer',
    '渗透率 100%',
  ]) expect(body).toContain(required);
  for (const forbidden of [
    'Personal Knowledge Harness',
    '个人稳定自用',
    '两个独立 Skill 已上线',
    'V2 已正式替换 V1',
  ]) expect(body).not.toContain(forbidden);
});

test('page source does not pass narrative arrays into visual components', async () => {
  const source = await readFile(new URL('../src/pages/ai/knowledge-harness.astro', import.meta.url), 'utf8');
  expect(source).not.toMatch(/points\.map/);
  expect(source).not.toMatch(/<Visual[^>]+(?:narrative|points)=/);
  expect(source).toContain('visualById[section.visualId]');
});

test('diagrams expose captions, labels and non-color state legends', async ({ page }) => {
  await page.goto('/ai/knowledge-harness/');
  for (const visualId of visualIds) {
    const figure = page.locator(`[data-visual="${visualId}"]`);
    await expect(figure).toHaveAttribute('aria-label', /.+/);
    await expect(figure.locator('figcaption')).not.toBeEmpty();
    await expect(figure.locator('[data-legend]')).toContainText(/稳定|影子|门禁|已验证/);
  }
});

test('deck interactions and source bridge remain available', async ({ page }) => {
  await page.goto('/ai/knowledge-harness/#s2');
  await expect(page.locator('#s2 .source-link')).toHaveAttribute('href', '/ai/claude-code-architecture/');
  await page.locator('nav.timeline a[data-t="s6"]').click();
  await expect(page).toHaveURL(/#s6$/);
  await expect(page.locator('nav.timeline a[data-t="s6"]')).toHaveClass(/active/);
  await page.locator('#deck-theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', /light|dark/);
});

test('desktop and mobile layouts do not overflow horizontally', async ({ page }) => {
  for (const viewport of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/ai/knowledge-harness/#s6');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(overflow).toBe(false);
  }
});
```

- [ ] **Step 2: 运行 RED 测试并确认失败原因是旧页面没有独立视觉契约**

Run: `npx playwright test e2e/knowledge-harness.spec.ts`

Expected: FAIL；首个结构测试显示 `[data-visual]` 期望 9、实际 0，且 `.narrative-copy` / `.diagram-labels` 契约尚不存在。若失败来自服务无法启动，先运行 `npm run check` 修复环境问题，不修改断言。

- [ ] **Step 3: 提交只包含 RED 契约的检查点**

```bash
git add e2e/knowledge-harness.spec.ts
git commit -m "test: lock knowledge harness visual contract"
```

Expected: 提交成功；用户已有未提交文件仍保持未暂存。

### Task 2: 建立左侧叙事数据与共享图框

**Files:**
- Create: `src/data/knowledgeHarness.ts`
- Create: `src/components/knowledge-harness/DiagramFrame.astro`

- [ ] **Step 1: 创建封闭的叙事与视觉 ID 类型**

```ts
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
```

- [ ] **Step 2: 创建统一图框与共享视觉状态语法**

```astro
---
import type { HarnessVisualId } from '../../data/knowledgeHarness';

type LegendTone = 'stable' | 'shadow' | 'gate' | 'verified';
type LegendItem = { tone: LegendTone; label: string };
interface Props {
  visualId: HarnessVisualId;
  title: string;
  ariaLabel: string;
  caption: string;
  legend: readonly LegendItem[];
}
const { visualId, title, ariaLabel, caption, legend } = Astro.props;
---

<figure class="figure kh-frame" data-visual={visualId} aria-label={ariaLabel}>
  <div class="kh-title">{title}</div>
  <div class="diagram-labels"><slot /></div>
  <ul class="kh-legend" data-legend aria-label="状态图例">
    {legend.map((item) => <li class:list={['kh-legend-item', item.tone]}><i></i>{item.label}</li>)}
  </ul>
  <figcaption class="figcap">{caption}</figcaption>
</figure>

<style>
  .kh-frame { width: min(100%, 650px); padding: 1.2rem 1.25rem 1rem; }
  .kh-title { color: var(--text); font-size: .9rem; font-weight: 750; margin-bottom: .9rem; }
  .diagram-labels { min-height: 290px; display: grid; align-content: center; }
  .kh-legend { display: flex; flex-wrap: wrap; gap: .45rem .8rem; margin-top: .8rem; list-style: none; }
  .kh-legend-item { display: inline-flex; align-items: center; gap: .35rem; color: var(--text-dim); font-size: .68rem; }
  .kh-legend-item i { width: 1.25rem; height: 0; border-top: 2px solid var(--text-dim); }
  .kh-legend-item.shadow i { border-top-style: dashed; border-color: var(--c-cyan); }
  .kh-legend-item.gate i { border-top-style: dashed; border-color: #f59e0b; }
  .kh-legend-item.verified i { border-color: #34d399; }
  :global(.kh-node) { border: 1px solid var(--glass-border); border-radius: .65rem; padding: .62rem .72rem; color: var(--text); background: rgba(79,140,255,.08); text-align: center; font-size: .75rem; line-height: 1.4; }
  :global(.kh-node small) { display: block; color: var(--text-dim); font-size: .64rem; margin-top: .18rem; }
  :global(.kh-node.shadow) { border-style: dashed; border-color: var(--c-cyan); background: rgba(34,211,238,.07); }
  :global(.kh-node.gate) { border-style: dashed; border-color: #f59e0b; background: rgba(245,158,11,.08); }
  :global(.kh-node.verified) { border-color: #34d399; background: rgba(52,211,153,.08); }
  :global(.kh-node.orchestrator) { border-color: var(--c-violet); background: rgba(139,92,246,.1); }
  :global(.kh-arrow) { color: var(--text-dim); font-size: 1rem; text-align: center; align-self: center; }
  :global(.kh-lane-label) { color: var(--text-dim); font-size: .68rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
  @media (max-width: 760px) {
    .kh-frame { padding: 1rem; }
    .diagram-labels { min-height: 0; }
    .kh-title { margin-bottom: .75rem; }
  }
</style>
```

- [ ] **Step 3: 运行类型检查**

Run: `npm run check`

Expected: PASS，Astro 报告 0 errors、0 warnings、0 hints。

- [ ] **Step 4: 提交数据与共享框架**

```bash
git add src/data/knowledgeHarness.ts src/components/knowledge-harness/DiagramFrame.astro
git commit -m "feat: add knowledge harness narrative contract"
```

Expected: 提交成功且只包含数据模块与共享图框。

### Task 3: 实现问题、分层与生产链三种拓扑

**Files:**
- Create: `src/components/knowledge-harness/ProblemMap.astro`
- Create: `src/components/knowledge-harness/LayeredArchitecture.astro`
- Create: `src/components/knowledge-harness/KnowledgePipeline.astro`

- [ ] **Step 1: 创建“多来源汇入三类风险”的问题图**

```astro
---
import DiagramFrame from './DiagramFrame.astro';
const legend = [{ tone: 'gate', label: '需要治理的风险' }] as const;
---
<DiagramFrame visualId="problem-map" title="分散知识进入 Agent 前的系统风险" ariaLabel="企业规范、项目经验和业务文档汇入上下文膨胀、来源冲突与 Skill 耦合三类风险" caption="多来源不是问题；缺少权威、预算与解耦规则才会让 Agent 失控。" {legend}>
  <div class="problem-topology">
    <div class="sources">
      <div class="kh-node">企业规范</div>
      <div class="kh-node">历史项目经验</div>
      <div class="kh-node">业务文档</div>
    </div>
    <div class="converge"><span></span><b>未经治理的输入</b><span></span></div>
    <div class="risks">
      <div class="kh-node gate">上下文膨胀</div>
      <div class="kh-node gate">来源冲突</div>
      <div class="kh-node gate">Skill 耦合</div>
    </div>
  </div>
</DiagramFrame>
<style>
  .problem-topology { display: grid; gap: 1rem; }
  .sources, .risks { display: grid; grid-template-columns: repeat(3, 1fr); gap: .65rem; }
  .converge { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: .6rem; color: var(--text-dim); font-size: .67rem; }
  .converge span { height: 1px; background: linear-gradient(90deg, transparent, var(--c-violet), transparent); }
  @media (max-width: 520px) { .sources, .risks { grid-template-columns: 1fr; } }
</style>
```

- [ ] **Step 2: 创建“四层职责堆栈”的架构图**

```astro
---
import DiagramFrame from './DiagramFrame.astro';
const legend = [{ tone: 'stable', label: '当前稳定架构' }] as const;
---
<DiagramFrame visualId="layered-architecture" title="稳定三层知识架构与工作流消费者" ariaLabel="原始材料、正式知识和企业能力包构成三层知识架构，Agent 工作流作为上层消费者" caption="Agent 工作流消费三层知识能力，但不成为第四层知识真值。" {legend}>
  <div class="layer-stack">
    <div class="kh-node layer workflow"><b>Agent 工作流 · 消费层</b><small>流程 · 角色 · 质量门禁</small></div>
    <div class="connector">按任务调用</div>
    <div class="kh-node layer capability"><b>企业能力包</b><small>任务入口 · 组织规则 · 共享能力</small></div>
    <div class="connector">路由正式知识</div>
    <div class="kh-node layer knowledge"><b>正式知识</b><small>已裁决规则 · 案例 · 复用单元</small></div>
    <div class="connector">可追溯到证据</div>
    <div class="kh-node layer source"><b>原始材料</b><small>动态事实真值 · 文档 · 项目记录</small></div>
  </div>
</DiagramFrame>
<style>
  .layer-stack { width: min(100%, 480px); margin: 0 auto; display: grid; justify-items: stretch; }
  .layer { padding: .7rem 1rem; }
  .workflow { border-color: var(--c-violet); background: rgba(139,92,246,.11); }
  .capability { border-color: #34d399; background: rgba(52,211,153,.08); }
  .knowledge { border-color: var(--c-blue); }
  .source { border-color: var(--c-cyan); background: rgba(34,211,238,.06); }
  .connector { color: var(--text-dim); font-size: .63rem; text-align: center; padding: .23rem 0; }
  .connector::before, .connector::after { content: ''; display: inline-block; height: .55rem; border-left: 1px solid var(--text-dim); vertical-align: middle; margin: 0 .5rem; opacity: .55; }
</style>
```

- [ ] **Step 3: 创建“快照到正式知识”的生产流水线**

```astro
---
import DiagramFrame from './DiagramFrame.astro';
const legend = [
  { tone: 'stable', label: '确定性加工' },
  { tone: 'gate', label: '人工裁决门' },
  { tone: 'verified', label: '正式可复用' },
] as const;
const stages = ['材料快照', '内容切分', '证据片段', '候选知识卡'] as const;
---
<DiagramFrame visualId="knowledge-pipeline" title="带出处的知识生产链" ariaLabel="材料快照经过内容切分、证据片段和候选知识卡后，由人工裁决进入正式知识" caption="候选生成与正式准入分开，任何企业规则都能回到原始证据。" {legend}>
  <div class="pipeline">
    {stages.map((stage) => <><div class="kh-node">{stage}</div><div class="kh-arrow">→</div></>)}
    <div class="kh-node gate">人工裁决<small>新增 / 追加 / 合并 / 保留原文</small></div>
    <div class="kh-arrow">→</div>
    <div class="kh-node verified">正式知识</div>
  </div>
</DiagramFrame>
<style>
  .pipeline { display: flex; align-items: stretch; gap: .35rem; }
  .pipeline .kh-node { flex: 1 1 0; min-width: 0; display: grid; place-content: center; padding: .58rem .4rem; }
  @media (max-width: 650px) {
    .pipeline { display: grid; grid-template-columns: 1fr; }
    .pipeline .kh-arrow { transform: rotate(90deg); line-height: .8; }
  }
</style>
```

- [ ] **Step 4: 运行组件类型检查**

Run: `npm run check`

Expected: PASS，三个组件与 `DiagramFrame` 的 `visualId`、legend tone 均通过类型检查。

- [ ] **Step 5: 提交第一组视觉组件**

```bash
git add src/components/knowledge-harness/ProblemMap.astro src/components/knowledge-harness/LayeredArchitecture.astro src/components/knowledge-harness/KnowledgePipeline.astro
git commit -m "feat: add knowledge foundation diagrams"
```

Expected: 提交成功且只包含第一组三个视觉组件。

### Task 4: 实现索引、双泳道与排序机制三种拓扑

**Files:**
- Create: `src/components/knowledge-harness/RoutingIndexMap.astro`
- Create: `src/components/knowledge-harness/ContextAssembly.astro`
- Create: `src/components/knowledge-harness/RankingMechanism.astro`

- [ ] **Step 1: 创建“三级索引汇入候选池 + V2 影子旁路”的路由图**

```astro
---
import DiagramFrame from './DiagramFrame.astro';
const legend = [
  { tone: 'stable', label: 'V1 已使用索引' },
  { tone: 'shadow', label: 'V2 派生索引旁路' },
] as const;
---
<DiagramFrame visualId="routing-index-map" title="稳定索引与派生索引的召回边界" ariaLabel="领域索引、任务索引和项目记忆索引汇入任务候选池，V2 派生索引作为影子旁路" caption="三类人工维护索引已经在 V1 使用；V2 只新增可重建检索资产。" {legend}>
  <div class="route-map">
    <div class="route-inputs">
      <div class="kh-node">根 / 领域索引<small>进入哪个知识域</small></div>
      <div class="kh-node">任务索引<small>当前问题需要什么</small></div>
      <div class="kh-node">项目记忆索引<small>历史代码与决策</small></div>
    </div>
    <div class="route-lines" aria-hidden="true"><i></i><i></i><i></i></div>
    <div class="kh-node orchestrator pool">任务候选池</div>
    <div class="shadow-route"><span>V2 影子旁路</span><div class="kh-node shadow">可重建派生索引<small>原子快照 · Exact / Lexical / Metadata</small></div><b>⇢</b></div>
  </div>
</DiagramFrame>
<style>
  .route-map { display: grid; grid-template-columns: minmax(0, 1fr) 1.3rem minmax(140px, .65fr); gap: .65rem; align-items: center; }
  .route-inputs { display: grid; gap: .55rem; }
  .route-lines { display: grid; height: 80%; align-content: space-around; }
  .route-lines i { display: block; border-top: 1px solid var(--c-violet); }
  .pool { min-height: 7rem; display: grid; place-content: center; }
  .shadow-route { grid-column: 1 / -1; display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: .55rem; color: var(--c-cyan); font-size: .65rem; }
  @media (max-width: 520px) { .route-map { grid-template-columns: 1fr; } .route-lines { display: none; } .pool { min-height: 0; } .shadow-route { grid-column: 1; grid-template-columns: 1fr; } }
</style>
```

- [ ] **Step 2: 创建 V1 与 V2 同屏对照的双泳道组装图**

```astro
---
import DiagramFrame from './DiagramFrame.astro';
const legend = [
  { tone: 'stable', label: 'V1 稳定基线' },
  { tone: 'shadow', label: 'V2 已实现 / 暂未激活' },
  { tone: 'gate', label: '工作价值激活门' },
] as const;
---
<DiagramFrame visualId="context-assembly" title="同一 Runtime 的稳定路径与影子路径" ariaLabel="V1 任务路由到候选筛选和预算裁剪，V2 从 Query Planner、RoleRetriever 进入审查组装并经过价值激活门" caption="“找”与“审查组装”是 V2 Runtime 内的职责拆分，不是两个独立 Skill。" {legend}>
  <div class="swimlanes">
    <div class="kh-lane-label">V1 · production</div>
    <div class="lane stable-lane">
      <div class="kh-node">任务路由</div><div class="kh-arrow">→</div><div class="kh-node">候选筛选</div><div class="kh-arrow">→</div><div class="kh-node">预算裁剪</div><div class="kh-arrow">→</div><div class="kh-node verified">context-pack</div>
    </div>
    <div class="kh-lane-label">V2 · shadow</div>
    <div class="lane shadow-lane">
      <div class="kh-node shadow">Query Planner</div><div class="kh-arrow">→</div><div class="kh-node shadow">RoleRetriever<small>查找职责</small></div><div class="kh-arrow">→</div><div class="kh-node shadow">审查与组装</div><div class="kh-arrow">→</div><div class="kh-node gate">价值激活门</div>
    </div>
  </div>
</DiagramFrame>
<style>
  .swimlanes { display: grid; gap: .5rem; }
  .lane { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr; gap: .32rem; align-items: stretch; padding: .58rem; border-radius: .8rem; background: rgba(79,140,255,.045); }
  .shadow-lane { border: 1px dashed rgba(34,211,238,.42); background: rgba(34,211,238,.035); }
  .lane .kh-node { display: grid; place-content: center; padding: .52rem .35rem; }
  @media (max-width: 620px) { .lane { grid-template-columns: 1fr; } .lane .kh-arrow { transform: rotate(90deg); line-height: .7; } }
</style>
```

- [ ] **Step 3: 创建“角色召回到最小预算”的漏斗式排序图**

```astro
---
import DiagramFrame from './DiagramFrame.astro';
const legend = [
  { tone: 'shadow', label: 'V2 影子检索与排序' },
  { tone: 'gate', label: '确定性质量门' },
] as const;
---
<DiagramFrame visualId="ranking-mechanism" title="按角色召回、融合、重排与截断" ariaLabel="Query Planner 规划角色，RoleRetriever 通过 Exact、Lexical 和 Metadata 召回，再经 RRF、Reranker、去重、Selector 与 Quality Gate 形成最小上下文" caption="候选池可以更大，交付给模型的上下文仍受角色覆盖与预算约束。" {legend}>
  <div class="ranking">
    <div class="kh-node shadow planner">Query Planner<small>任务 · 约束 · 查询角色</small></div>
    <div class="kh-arrow">↓</div>
    <div class="retrieval">
      <div class="kh-node shadow">Exact</div><div class="kh-node shadow">Lexical</div><div class="kh-node shadow">Metadata</div>
    </div>
    <div class="kh-arrow">↓ RoleRetriever</div>
    <div class="funnel">
      <div class="kh-node shadow">角色内 RRF</div>
      <div class="kh-node shadow">Role-aware Reranker</div>
      <div class="kh-node shadow">去重与冲突分组</div>
      <div class="kh-node gate">Selector + Quality Gate</div>
      <div class="kh-node orchestrator">Composer / Renderer</div>
    </div>
    <div class="trace">RetrievalTrace · 记录候选、排序、门禁与选择结果</div>
    <div class="budget">最小充分上下文 · 最终预算</div>
  </div>
</DiagramFrame>
<style>
  .ranking { display: grid; justify-items: center; gap: .35rem; }
  .planner { width: 58%; }
  .retrieval { width: 88%; display: grid; grid-template-columns: repeat(3, 1fr); gap: .45rem; }
  .funnel { width: 96%; display: grid; grid-template-columns: repeat(5, 1fr); gap: .34rem; }
  .funnel > :nth-child(2) { margin-inline: .18rem; }
  .funnel > :nth-child(3) { margin-inline: .35rem; }
  .funnel > :nth-child(4) { margin-inline: .52rem; }
  .funnel > :nth-child(5) { margin-inline: .68rem; }
  .trace { color: var(--text-dim); font-size: .63rem; border-bottom: 1px dashed var(--c-cyan); padding: .25rem .8rem; }
  .budget { width: 48%; padding: .45rem; border-radius: 999px; background: rgba(139,92,246,.13); color: var(--text); text-align: center; font-size: .68rem; }
  @media (max-width: 600px) { .planner, .retrieval, .funnel, .budget { width: 100%; } .funnel { grid-template-columns: 1fr; } .funnel > * { margin-inline: 0 !important; } }
</style>
```

- [ ] **Step 4: 运行组件类型检查**

Run: `npm run check`

Expected: PASS；三个组件都只向 `DiagramFrame` 传视觉元数据，没有接收 `narrative` 或 `points`。

- [ ] **Step 5: 提交第二组视觉组件**

```bash
git add src/components/knowledge-harness/RoutingIndexMap.astro src/components/knowledge-harness/ContextAssembly.astro src/components/knowledge-harness/RankingMechanism.astro
git commit -m "feat: add knowledge retrieval diagrams"
```

Expected: 提交成功且只包含第二组三个视觉组件。

### Task 5: 实现失败边界、发布回滚与业务结果三种拓扑

**Files:**
- Create: `src/components/knowledge-harness/FailureBoundary.astro`
- Create: `src/components/knowledge-harness/ReleaseRollback.astro`
- Create: `src/components/knowledge-harness/WorkflowImpact.astro`

- [ ] **Step 1: 创建“异常输入映射确定行为”的边界矩阵**

```astro
---
import DiagramFrame from './DiagramFrame.astro';
const legend = [{ tone: 'gate', label: '显式失败与人工边界' }] as const;
const rows = [
  ['弱相关', '不加载'],
  ['来源冲突', '保留冲突组'],
  ['材料过期', '标记复核'],
  ['关键缺失', 'insufficient / escalation'],
] as const;
---
<DiagramFrame visualId="failure-boundary" title="四类异常，四种可观察结果" ariaLabel="弱相关映射不加载，来源冲突映射冲突组，材料过期映射复核，关键缺失映射 insufficient 或 escalation" caption="质量门不替用户裁决高风险事实；它负责阻止静默错误进入上下文。" {legend}>
  <div class="boundary-grid">
    <div class="grid-head">输入状态</div><div class="grid-head">系统行为</div>
    {rows.map(([input, output]) => <><div class="kh-node gate">{input}</div><div class="mapping">→</div><div class="kh-node">{output}</div></>)}
  </div>
</DiagramFrame>
<style>
  .boundary-grid { display: grid; grid-template-columns: 1fr auto 1.25fr; gap: .45rem; align-items: stretch; }
  .grid-head { color: var(--text-dim); font-size: .65rem; font-weight: 700; text-align: center; }
  .grid-head:first-child { grid-column: 1; }
  .grid-head:nth-child(2) { grid-column: 3; }
  .mapping { display: grid; place-content: center; color: #f59e0b; }
</style>
```

- [ ] **Step 2: 创建 stable、shadow、价值门和回滚闭环**

```astro
---
import DiagramFrame from './DiagramFrame.astro';
const legend = [
  { tone: 'stable', label: 'V1 stable' },
  { tone: 'shadow', label: 'V2 shadow / canary 候选' },
  { tone: 'gate', label: '价值激活门' },
] as const;
---
<DiagramFrame visualId="release-rollback" title="保护 V1 的版本演进闭环" ariaLabel="V1 stable 持续服务，V2 shadow 经过安全门、规模门、工作价值门后才可进入 canary 和原子切换，异常回滚到 stable" caption="当前停在 shadow：安全与规模门已通过，工作价值门尚未通过。" {legend}>
  <div class="release-flow">
    <div class="kh-node stable">V1 stable<small>当前生产基线</small></div>
    <div class="kh-node shadow">V2 shadow<small>安全门 ✓ · 规模门 ✓</small></div>
    <div class="kh-node gate">工作价值门<small>当前未通过</small></div>
    <div class="kh-node shadow muted">canary<small>未进入</small></div>
    <div class="kh-node orchestrator muted">原子切换</div>
    <div class="rollback">生产异常 ── 回滚上一 stable ──↩</div>
  </div>
</DiagramFrame>
<style>
  .release-flow { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: .48rem; align-items: stretch; position: relative; padding-bottom: 2.2rem; }
  .release-flow > .kh-node { display: grid; place-content: center; position: relative; }
  .release-flow > .kh-node:nth-child(-n+4)::after { content: '→'; position: absolute; right: -.48rem; top: 50%; transform: translateY(-50%); color: var(--text-dim); }
  .muted { opacity: .5; }
  .rollback { grid-column: 2 / 6; border-bottom: 1px dashed #f59e0b; color: #f59e0b; font-size: .66rem; text-align: center; padding-top: .55rem; }
  @media (max-width: 620px) { .release-flow { grid-template-columns: 1fr; } .release-flow > .kh-node:nth-child(-n+4)::after { content: ''; } .rollback { grid-column: 1; } }
</style>
```

- [ ] **Step 3: 创建“平台向双工作流供给并汇总团队结果”的影响图**

```astro
---
import DiagramFrame from './DiagramFrame.astro';
const legend = [{ tone: 'verified', label: '已验证接入与结果' }] as const;
---
<DiagramFrame visualId="workflow-impact" title="企业知识进入真实产品交付" ariaLabel="Enterprise Knowledge Harness 向 PRD Writer 和独立 Reviewer 提供规则、案例与项目记忆，覆盖产品部门所有同事并达到百分之百渗透率" caption="这里仅展示已验证的工作流接入和团队覆盖，不把 V2 技术门指标当业务结果。" {legend}>
  <div class="impact-map">
    <div class="knowledge-supply">
      <span>企业规则</span><span>历史案例</span><span>项目记忆</span>
    </div>
    <div class="kh-arrow">↓</div>
    <div class="kh-node orchestrator hub">Enterprise Knowledge Harness</div>
    <div class="branches" aria-hidden="true"><i></i><i></i></div>
    <div class="workflows">
      <div class="kh-node verified">PRD Writer</div>
      <div class="kh-node verified">独立 Reviewer</div>
    </div>
    <div class="result-strip"><b>产品部门全员覆盖 · 渗透率 100%</b><span>规则、案例与项目记忆独立维护并按任务加载</span></div>
  </div>
</DiagramFrame>
<style>
  .impact-map { display: grid; justify-items: center; gap: .4rem; }
  .knowledge-supply { display: flex; gap: .45rem; flex-wrap: wrap; justify-content: center; }
  .knowledge-supply span { padding: .32rem .6rem; border: 1px solid var(--glass-border); border-radius: 999px; color: var(--text-dim); font-size: .66rem; }
  .hub { width: 66%; }
  .branches { width: 52%; display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
  .branches i { height: 1rem; border-left: 1px solid #34d399; border-bottom: 1px solid #34d399; }
  .branches i:last-child { border-left: 0; border-right: 1px solid #34d399; }
  .workflows { width: 72%; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .result-strip { width: 88%; display: grid; gap: .2rem; border-top: 1px solid rgba(52,211,153,.45); padding-top: .65rem; text-align: center; color: #34d399; font-size: .72rem; }
  .result-strip span { color: var(--text-dim); font-size: .64rem; }
  @media (max-width: 520px) { .hub, .workflows, .result-strip { width: 100%; } }
</style>
```

- [ ] **Step 4: 运行组件类型检查**

Run: `npm run check`

Expected: PASS；三张图的图注均公开说明失败边界或结果边界。

- [ ] **Step 5: 提交第三组视觉组件**

```bash
git add src/components/knowledge-harness/FailureBoundary.astro src/components/knowledge-harness/ReleaseRollback.astro src/components/knowledge-harness/WorkflowImpact.astro
git commit -m "feat: add knowledge governance diagrams"
```

Expected: 提交成功且只包含第三组三个视觉组件。

### Task 6: 用显式映射重建十段页面并跑到 GREEN

**Files:**
- Modify: `src/pages/ai/knowledge-harness.astro`

- [ ] **Step 1: 用数据模块和九个独立视觉组件替换通用 `points` 双重渲染**

```astro
---
import DeckLayout from '../../layouts/DeckLayout.astro';
import ProblemMap from '../../components/knowledge-harness/ProblemMap.astro';
import LayeredArchitecture from '../../components/knowledge-harness/LayeredArchitecture.astro';
import KnowledgePipeline from '../../components/knowledge-harness/KnowledgePipeline.astro';
import RoutingIndexMap from '../../components/knowledge-harness/RoutingIndexMap.astro';
import ContextAssembly from '../../components/knowledge-harness/ContextAssembly.astro';
import RankingMechanism from '../../components/knowledge-harness/RankingMechanism.astro';
import FailureBoundary from '../../components/knowledge-harness/FailureBoundary.astro';
import ReleaseRollback from '../../components/knowledge-harness/ReleaseRollback.astro';
import WorkflowImpact from '../../components/knowledge-harness/WorkflowImpact.astro';
import { harnessSections, timelineLabels } from '../../data/knowledgeHarness';

const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
const visualById = {
  'problem-map': ProblemMap,
  'layered-architecture': LayeredArchitecture,
  'knowledge-pipeline': KnowledgePipeline,
  'routing-index-map': RoutingIndexMap,
  'context-assembly': ContextAssembly,
  'ranking-mechanism': RankingMechanism,
  'failure-boundary': FailureBoundary,
  'release-rollback': ReleaseRollback,
  'workflow-impact': WorkflowImpact,
} as const;
const toneClass = { problem: 'p', thinking: 't', decision: 'd', result: 'd', status: 't' } as const;
---
<DeckLayout title="Enterprise Knowledge Harness — QQ星" description="企业知识与上下文平台，为真实产品工作流提供最小充分上下文">
  <main id="deck">
    <section id="s1">
      <div class="chapter">AI 落地实战 · 企业知识基础层</div>
      <h1>Enterprise Knowledge Harness</h1>
      <p class="sub">企业知识与上下文平台——让多个 Agent 与产品经理基于同一事实工作</p>
      <p class="sub signal-line">知识生产 · 权威治理 · 最小上下文 · 版本发布与回滚</p>
      <p class="cover-meta">产品设计与架构负责人 · 2026.04–至今 · 企业复用 / 持续演进</p>
      <div class="scroll-hint">↓ 滚动进入平台</div>
    </section>

    {harnessSections.map((section) => {
      const Visual = visualById[section.visualId];
      return (
        <section id={section.id} data-section={section.id}>
          <div class="chapter">{section.chapter}</div>
          <h2>{section.heading}</h2>
          <div class="split enterprise-split">
            <div class="ptd narrative-copy">
              {section.narrative.map((block) => (
                <div class="ptd-row" data-tone={block.tone}>
                  <span class:list={['pill', toneClass[block.tone]]}>{block.label}</span>
                  <p>{block.body}</p>
                </div>
              ))}
              {section.id === 's2' && <a class="source-link" href={`${base}ai/claude-code-architecture/`}>源码方法论篇</a>}
            </div>
            <Visual />
          </div>
        </section>
      );
    })}
  </main>

  <nav class="timeline" id="tl" aria-label="Enterprise Knowledge Harness timeline">
    {timelineLabels.map((label, index) => {
      const id = `s${index + 1}`;
      return <a href={`#${id}`} data-t={id}><span class="dot"></span><span class="lbl">{label}</span></a>;
    })}
  </nav>

  <script is:inline>
    const links = document.querySelectorAll('#tl a[data-t]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) links.forEach((link) => link.classList.toggle('active', link.dataset.t === entry.target.id));
      });
    }, { root: document.getElementById('deck'), threshold: 0.55 });
    document.querySelectorAll('main#deck section').forEach((section) => observer.observe(section));
  </script>

  <style>
    .signal-line { margin-top: 1rem; font-size: .88rem; }
    .cover-meta { margin-top: 1.2rem; color: var(--text-dim); font-size: .76rem; text-align: center; }
    .enterprise-split { width: min(1180px, 100%); grid-template-columns: minmax(280px, .72fr) minmax(520px, 1.16fr); gap: clamp(2rem, 4vw, 4rem); align-items: center; }
    .narrative-copy { max-width: none; }
    .narrative-copy .ptd-row p { font-size: .94rem; line-height: 1.68; }
    .source-link { color: var(--text); text-decoration: none; border: 1px solid rgba(34,211,238,.38); background: rgba(34,211,238,.09); border-radius: 999px; padding: .48rem .85rem; font-size: .78rem; width: fit-content; }
    .source-link:focus-visible { outline: 2px solid var(--c-cyan); outline-offset: 3px; }
    @media (max-width: 980px) {
      .enterprise-split { grid-template-columns: minmax(240px, .72fr) minmax(430px, 1.1fr); gap: 1.5rem; }
    }
    @media (max-width: 860px) {
      .enterprise-split { grid-template-columns: minmax(0, 1fr); width: min(100%, 680px); gap: 1.2rem; }
      .narrative-copy { width: 100%; }
      .enterprise-split :global(.kh-frame) { width: 100%; }
    }
    @media (max-width: 520px) {
      h2 { font-size: 1.42rem; }
      .narrative-copy { gap: .68rem; }
      .narrative-copy .ptd-row p { font-size: .87rem; line-height: 1.58; }
      .cover-meta { max-width: 290px; line-height: 1.6; }
    }
  </style>
</DeckLayout>
```

- [ ] **Step 2: 修正所有图例，使每张图都用文字表达状态**

在对应组件的 `legend` 中使用以下确切标签：

```ts
// ProblemMap
[{ tone: 'gate', label: '门禁：需要治理的风险' }]
// LayeredArchitecture
[{ tone: 'stable', label: '当前稳定架构' }]
// KnowledgePipeline
[
  { tone: 'stable', label: '稳定：确定性加工' },
  { tone: 'gate', label: '门禁：人工裁决' },
  { tone: 'verified', label: '已验证：正式可复用' },
]
// RoutingIndexMap
[
  { tone: 'stable', label: 'V1 稳定索引' },
  { tone: 'shadow', label: 'V2 影子派生索引' },
]
// ContextAssembly
[
  { tone: 'stable', label: 'V1 稳定基线' },
  { tone: 'shadow', label: 'V2 影子：已实现 / 暂未激活' },
  { tone: 'gate', label: '门禁：工作价值激活' },
]
// RankingMechanism
[
  { tone: 'shadow', label: 'V2 影子检索与排序' },
  { tone: 'gate', label: '门禁：确定性质量检查' },
]
// FailureBoundary
[{ tone: 'gate', label: '门禁：显式失败与人工边界' }]
// ReleaseRollback
[
  { tone: 'stable', label: 'V1 稳定 stable' },
  { tone: 'shadow', label: 'V2 影子 shadow / canary 候选' },
  { tone: 'gate', label: '门禁：价值激活' },
]
// WorkflowImpact
[{ tone: 'verified', label: '已验证：工作流接入与团队结果' }]
```

- [ ] **Step 3: 运行 Astro 检查和专用 E2E，修正页面内实现直到契约转绿**

Run: `npm run check && npx playwright test e2e/knowledge-harness.spec.ts`

Expected: PASS；Astro 0 diagnostics，7 个 Knowledge Harness 测试全部通过。若失败来自单张图文字或窄屏布局，只允许修改该专用组件、`DiagramFrame.astro` 或本页局部样式，不修改 `DeckLayout.astro`，不放宽断言。

- [ ] **Step 4: 提交页面组装和图例修正**

```bash
git add src/pages/ai/knowledge-harness.astro src/components/knowledge-harness/ProblemMap.astro src/components/knowledge-harness/LayeredArchitecture.astro src/components/knowledge-harness/KnowledgePipeline.astro src/components/knowledge-harness/RoutingIndexMap.astro src/components/knowledge-harness/ContextAssembly.astro src/components/knowledge-harness/RankingMechanism.astro src/components/knowledge-harness/FailureBoundary.astro src/components/knowledge-harness/ReleaseRollback.astro src/components/knowledge-harness/WorkflowImpact.astro
git commit -m "fix: restore knowledge harness visual storytelling"
```

Expected: 提交成功；页面进入新组件架构，九个视觉组件只包含本轮图例文字修正。

### Task 7: 收拢旧测试并建立阶段证据检查点

**Files:**
- Modify: `e2e/claude-code-architecture.spec.ts`
- Test: `e2e/knowledge-harness.spec.ts`

- [ ] **Step 1: 删除旧文件中会重复维护企业故事正文的测试块**

对 `e2e/claude-code-architecture.spec.ts` 应用以下精确删除；跨页面来源链接测试继续保留：

```diff
-test('Enterprise Knowledge Harness tells the complete enterprise platform story', async ({ page }) => {
-  await page.goto('/ai/knowledge-harness/');
-  await expect(page.getByRole('heading', { name: 'Enterprise Knowledge Harness' })).toBeVisible();
-  await expect(page.locator('main#deck section')).toHaveCount(10);
-  await expect(page.locator('#s2')).toContainText('企业规范、历史项目经验和业务文档');
-  await expect(page.locator('#s3')).toContainText('原始材料');
-  await expect(page.locator('#s3')).toContainText('企业能力包');
-  await expect(page.locator('#s4')).toContainText('候选知识卡');
-  await expect(page.locator('#s5')).toContainText('领域索引');
-  await expect(page.locator('#s6')).toContainText('最小充分上下文');
-  await expect(page.locator('#s7')).toContainText('权威性');
-  await expect(page.locator('#s8')).toContainText('降级或人工确认');
-  await expect(page.locator('#s9')).toContainText('灰度发布');
-  await expect(page.locator('#s10')).toContainText('渗透率 100%');
-  expect(await page.locator('body').innerText()).not.toContain(['Personal', 'Knowledge Harness'].join(' '));
-});
```

- [ ] **Step 2: 运行阶段检查点测试**

Run: `npm run check && npx playwright test e2e/knowledge-harness.spec.ts e2e/claude-code-architecture.spec.ts`

Expected: PASS；专用契约与 Claude Code 方法论桥接同时通过。

- [ ] **Step 3: 生成阶段证据哈希并写入运行时状态**

Run: `shasum -a 256 src/data/knowledgeHarness.ts src/pages/ai/knowledge-harness.astro e2e/knowledge-harness.spec.ts && git rev-parse HEAD`

Expected: 输出 3 个 SHA-256 和当前提交 SHA；将完整输出写入 `/Users/qqx/my_code_cursor/personal-website/tmp/plan-runtime/enterprise-knowledge-harness-visual-repair.plan-runtime.json` 的阶段证据说明，不改变状态真实性。

- [ ] **Step 4: 提交测试归属调整**

```bash
git add e2e/claude-code-architecture.spec.ts
git commit -m "test: isolate knowledge harness coverage"
```

Expected: 提交成功且只调整旧测试的职责归属。

### Task 8: 建立并人工审查 12 张视觉回归基线

**Files:**
- Create: `e2e/knowledge-harness.visual.spec.ts`
- Create: `e2e/knowledge-harness.visual.spec.ts-snapshots/knowledge-harness-s2-desktop-darwin.png`
- Create: `e2e/knowledge-harness.visual.spec.ts-snapshots/knowledge-harness-s3-desktop-darwin.png`
- Create: `e2e/knowledge-harness.visual.spec.ts-snapshots/knowledge-harness-s4-desktop-darwin.png`
- Create: `e2e/knowledge-harness.visual.spec.ts-snapshots/knowledge-harness-s5-desktop-darwin.png`
- Create: `e2e/knowledge-harness.visual.spec.ts-snapshots/knowledge-harness-s6-desktop-darwin.png`
- Create: `e2e/knowledge-harness.visual.spec.ts-snapshots/knowledge-harness-s7-desktop-darwin.png`
- Create: `e2e/knowledge-harness.visual.spec.ts-snapshots/knowledge-harness-s8-desktop-darwin.png`
- Create: `e2e/knowledge-harness.visual.spec.ts-snapshots/knowledge-harness-s9-desktop-darwin.png`
- Create: `e2e/knowledge-harness.visual.spec.ts-snapshots/knowledge-harness-s10-desktop-darwin.png`
- Create: `e2e/knowledge-harness.visual.spec.ts-snapshots/knowledge-harness-s3-mobile-darwin.png`
- Create: `e2e/knowledge-harness.visual.spec.ts-snapshots/knowledge-harness-s6-mobile-darwin.png`
- Create: `e2e/knowledge-harness.visual.spec.ts-snapshots/knowledge-harness-s9-mobile-darwin.png`

- [ ] **Step 1: 写入桌面九页和移动三页的截图断言**

```ts
import { test, expect } from '@playwright/test';

const desktopSections = ['s2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10'] as const;
const mobileSections = ['s3', 's6', 's9'] as const;

async function prepare(page: import('@playwright/test').Page, id: string, viewport: { width: number; height: number }) {
  await page.setViewportSize(viewport);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
  await page.goto(`/ai/knowledge-harness/#${id}`);
  await page.addStyleTag({ content: 'astro-dev-toolbar { display: none !important; } *, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }' });
  const section = page.locator(`#${id}`);
  await section.scrollIntoViewIfNeeded();
  await expect(section).toBeVisible();
  return section;
}

for (const id of desktopSections) {
  test(`Knowledge Harness ${id} desktop visual`, async ({ page }) => {
    const section = await prepare(page, id, { width: 1280, height: 800 });
    await expect(section).toHaveScreenshot(`knowledge-harness-${id}-desktop.png`, { animations: 'disabled' });
  });
}

for (const id of mobileSections) {
  test(`Knowledge Harness ${id} mobile visual`, async ({ page }) => {
    const section = await prepare(page, id, { width: 390, height: 844 });
    await expect(section).toHaveScreenshot(`knowledge-harness-${id}-mobile.png`, { animations: 'disabled' });
  });
}
```

- [ ] **Step 2: 运行视觉测试并确认 RED 原因仅为基线缺失**

Run: `npx playwright test e2e/knowledge-harness.visual.spec.ts`

Expected: FAIL，报告 12 张 snapshot missing；不得出现页面错误、横向溢出或元素不可见。

- [ ] **Step 3: 生成基线并立即复跑**

Run: `npx playwright test e2e/knowledge-harness.visual.spec.ts --update-snapshots && npx playwright test e2e/knowledge-harness.visual.spec.ts`

Expected: 12 updated，随后 12 passed。若执行配置增加了 project name，允许文件后缀包含该 project name，但不得修改截图语义名称。

- [ ] **Step 4: 逐张打开 12 个 PNG 完成人工视觉审查**

Run: `find e2e/knowledge-harness.visual.spec.ts-snapshots -type f -name '*.png' -print | sort`

Expected: 恰好 12 个 PNG。使用本地图片查看工具逐张检查：S2–S10 拓扑彼此不同；左叙事与右图有明显层级差；标题、节点、图例、图注均未裁切；S3/S6/S9 在 390px 下按“叙事→完整结构图→图例→图注”排列；V1、V2、门禁和已验证状态不只靠颜色区分。任何一项不满足时，只修正对应专用组件或页面局部 CSS，重新生成受影响快照并再次逐张查看。

- [ ] **Step 5: 提交视觉测试和已审查基线**

```bash
git add e2e/knowledge-harness.visual.spec.ts e2e/knowledge-harness.visual.spec.ts-snapshots
git commit -m "test: add knowledge harness visual baselines"
```

Expected: 提交成功且包含 1 个视觉测试文件与 12 个已人工审查 PNG。

### Task 9: 完成范围回归、全量回归与事实扫描

**Files:**
- Verify: `src/pages/ai/knowledge-harness.astro`
- Verify: `src/data/knowledgeHarness.ts`
- Verify: `src/components/knowledge-harness/`
- Verify: `e2e/knowledge-harness.spec.ts`
- Verify: `e2e/knowledge-harness.visual.spec.ts`

- [ ] **Step 1: 运行 Astro 静态检查和生产构建**

Run: `npm run check && npm run build`

Expected: 两个命令均以 0 退出；Astro 0 diagnostics，生产构建包含 `/ai/knowledge-harness/index.html`。

- [ ] **Step 2: 运行 Knowledge Harness 及相邻页面定向回归**

Run: `npx playwright test e2e/knowledge-harness.spec.ts e2e/knowledge-harness.visual.spec.ts e2e/claude-code-architecture.spec.ts e2e/skill-desk.spec.ts e2e/deck-theme.spec.ts e2e/sections.spec.ts`

Expected: 全部通过；Knowledge Harness 12 张截图无像素差异，AI 列表、Skill Desk、主题和方法论桥接无回归。

- [ ] **Step 3: 运行全量 E2E**

Run: `npm run test:e2e`

Expected: 全量通过。若失败来自本计划范围外且基线也失败，记录原始失败证据并继续完成可执行的范围内检查；若只在新改动后出现，则回到最早失败的专用组件修复，不删除断言或自动接受截图。

- [ ] **Step 4: 扫描重复实现和错误公开口径**

```bash
! rg -n 'points\.map|<Visual.*(narrative|points)=' src/pages/ai/knowledge-harness.astro
! rg -n 'Personal Knowledge Harness|个人稳定自用|两个独立 Skill 已上线|V2 已正式替换 V1' src/pages/ai/knowledge-harness.astro src/data/knowledgeHarness.ts src/components/knowledge-harness
rg -n '三层知识架构|根索引|V1 稳定基线|V2 已实现但暂未激活|Query Planner|RoleRetriever|RRF|Reranker|Selector|Quality Gate|Composer|Renderer|RetrievalTrace|渗透率 100%' src/data/knowledgeHarness.ts src/components/knowledge-harness
```

Expected: 前两个命令无输出并返回成功；第三个命令为所有必需状态与职责找到清晰出处。

- [ ] **Step 5: 检查提交边界与工作树保护**

Run: `git diff --check && git status --short && git diff --name-only 306273f..HEAD`

Expected: `git diff --check` 无输出；`git status --short` 中用户原有未提交改动仍存在且没有被本计划提交；从设计 Spec 基线以来的已提交文件只包含本 Spec、实施计划以及本计划文件结构列出的 Knowledge Harness 专用路径。

- [ ] **Step 6: 写入合法终态前完成最终证据记录**

Run: `git log --oneline --decorate -10 && shasum -a 256 src/data/knowledgeHarness.ts src/pages/ai/knowledge-harness.astro e2e/knowledge-harness.spec.ts e2e/knowledge-harness.visual.spec.ts`

Expected: 可以看到测试契约、数据框架、三组视觉、页面修复、测试归属和视觉基线的范围内提交；将最终测试清单、四个 SHA-256、人工审图结论和剩余非本任务工作树状态写入运行时状态，再用 shared `plan_stop_gate.py set-state` 更新为与事实一致的合法终态。

## 计划自审结果

- **Spec coverage:** 十段故事、九张独立图、V1/V2 状态、Runtime 职责、左右去重、响应式、无障碍、视觉基线、桥接链接和工作树保护均有对应 Task；没有遗留需求空档。
- **Placeholder scan:** 已扫描并排除常见占位标记、泛化错误处理、无实现细节的测试要求和跨 Task 模糊引用。
- **Type consistency:** `HarnessVisualId` 的九个值、组件文件名、`visualById` 键、`data-visual` 断言完全一致；`NarrativeTone` 与 `toneClass` 一一闭合；V2 组件统一使用 Query Planner → RoleRetriever → RRF / Reranker → 去重与冲突 → Selector → Quality Gate → Composer / Renderer，并输出 RetrievalTrace。
- **Recovery gate:** Spec 与 Plan 使用绝对路径，授权、排除、潜在决策边界、运行时状态文件、阶段证据命令和恢复入口均已固定；执行不依赖本对话口头上下文。

## 完成验收清单

- [ ] 十个 section 与十个 timeline 锚点一一对应。
- [ ] S2–S10 恰好九个唯一 `data-visual`，九张图拓扑不同。
- [ ] `.narrative-copy` 与 `.diagram-labels` 不相同，页面源码不再复用 `points`。
- [ ] V1 已使用三类索引且是稳定基线；V2 工程已实现但暂未激活。
- [ ] Query Planner / RoleRetriever 属于查找职责，RRF / Reranker / Selector / Quality Gate / Composer / Renderer 属于审查组装链，并输出 RetrievalTrace。
- [ ] PRD Writer、独立 Reviewer、产品部门全员覆盖和渗透率 100% 与简历一致。
- [ ] 每张图有独立标题、`aria-label`、图注和文字状态图例。
- [ ] 1280×800 九张桌面图、390×844 三张关键移动图已人工查看。
- [ ] Astro check/build、定向 E2E、视觉回归、全量 E2E 和错误口径扫描全部通过。
- [ ] 用户原有未提交改动未被覆盖或暂存，`DeckLayout`、简历、其他项目页、知识库与 Skill 未修改。
