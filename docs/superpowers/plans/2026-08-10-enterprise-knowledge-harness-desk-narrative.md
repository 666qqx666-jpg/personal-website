# Enterprise Knowledge Harness Desk 叙事重构实施计划

> **Execution governance:** Before implementation, run the shared `adaptive-orchestration` preflight. A plan records a recommended profile but does not dispatch agents or authorize execution by itself.

**Goal:** 在不改动真实 Knowledge Context Runtime 和全站 Deck 基础设施的前提下，把 `/ai/knowledge-harness/` 从十章模块清单重构为“四幕八章”的企业知识产品故事，准确呈现知识产生双门、V1 基线、V2 Shadow 评测、V1.5 收敛设计和真实工作流结果。

**Architecture:** 继续使用 `DeckLayout`、`harnessSections` 数据驱动和 `DiagramFrame` 视觉契约。页面只负责封面、七个内容章节与 Visual ID 的显式映射；五个新图形组件分别承载知识产生、V1、V2、评测和 V1.5，`ProblemMap` 与 `WorkflowImpact` 定向调整。Playwright 锁定八章结构、七张图、事实/禁止表述、交互、响应式和视觉快照。

**Tech Stack:** Astro 5、TypeScript、HTML/CSS、Playwright、现有 `DeckLayout.astro` 与 `DiagramFrame.astro`。

**Recommended execution profile:** O2；共享契约完成后，五张新图可按 S3–S4、S5–S6、S7 三个独立组件边界推进，但数据、页面、功能测试、快照和最终事实审查必须由根执行者统一收口。执行开始时仍须重新运行 shared `adaptive-orchestration` 预检，以当次结果为准。

**Parallelizable workstreams:** Task 3 中 `KnowledgeProductionGates / V1RoutingRuntime`、`V2ShadowRuntime / EvaluationActivationGate`、`V15ProfileRuntime` 可并行制作；`ProblemMap / WorkflowImpact` 只在页面切换阶段由单一写者调整。Task 1、Task 2、Task 4–6 串行。

**Shared-write conflicts:** `src/data/knowledgeHarness.ts`、`src/pages/ai/knowledge-harness.astro`、`src/components/knowledge-harness/DiagramFrame.astro`、两份 Knowledge Harness Playwright 测试和快照目录属于共享写入面，必须保持单一写者；组件工作流不得修改这些文件。

**Stage evidence checkpoint:** `KNOWLEDGE_HARNESS_DESK_PASS`；Task 5 后要求 `npm run check`、定向功能测试、11 张新视觉快照和 `npm run build` 通过，人工复核 S3 双门、S6 18/16 层级、S7 Profile 两阶段与移动端密度，再记录核心文件 SHA-256。该检查点不代表 V1.5 已生产切流或完成评测。

**Recovery entry:** `/Users/qqx/my_code_cursor/personal-website/tmp/plan-runtime/enterprise-knowledge-harness-desk-narrative.plan-runtime.json`；恢复时先读运行时状态、`git status --short` 和本计划，从 `next_step` 指向的第一个未完成步骤继续，不重做已通过的视觉基线。

**Plan runtime state file:** `/Users/qqx/my_code_cursor/personal-website/tmp/plan-runtime/enterprise-knowledge-harness-desk-narrative.plan-runtime.json`

**Authorization boundary:** 本计划仅描述后续实施。获得实施授权后，可新增/修改 Knowledge Harness 专用数据、页面、组件、Playwright 测试和快照，可删除已确认无引用的旧 Knowledge Harness 图组件，可运行本地 Astro/Playwright/Git 检查并创建范围内本地提交。必须保留现有未提交改动，只按本计划精确路径暂存。

**Out of scope:** 不修改真实 `memory-loader`、V1/V2/V1.5 Runtime、`digest`、methodology 队列、Obsidian Vault、共享 Skill、Skill Desk、Claude Code Architecture、简历或其他项目页；不启用 V2、不执行 canary/切流、不部署、不推送远端、不创建 PR；不修改 `src/layouts/DeckLayout.astro`，除非页面级样式无法满足 390px 且用户另行授权。

**Potential decision boundaries:** 若事实源与已批准 Spec 对 V1/V2/V1.5 状态出现冲突，需要决定先修订 Spec 还是暂停页面事实更新；若 390px 可读性只能通过全站 `DeckLayout` 改造实现，需要决定保持页面级压缩还是扩大到全站兼容改造；若人工审图发现八章叙事本身需要改序，需要重新进入设计裁决，而不是在实现中静默改故事。

---

## 实施依据

- 已批准 Spec：`/Users/qqx/my_code_cursor/personal-website/docs/superpowers/specs/2026-08-10-enterprise-knowledge-harness-desk-narrative-design.md`
- 本实施计划：`/Users/qqx/my_code_cursor/personal-website/docs/superpowers/plans/2026-08-10-enterprise-knowledge-harness-desk-narrative.md`
- 当前页面：`/Users/qqx/my_code_cursor/personal-website/src/pages/ai/knowledge-harness.astro`
- 当前内容数据：`/Users/qqx/my_code_cursor/personal-website/src/data/knowledgeHarness.ts`
- V2 预算事实：`/Users/qqx/my_code_cursor/learn_for_product/docs/superpowers/specs/2026-07-19-source-agnostic-knowledge-base-evolution-design.md` 与 `/Users/qqx/.agents/skills/memory-loader/context_v2/renderer.py`
- V2 盲评事实：`/Users/qqx/my_code_cursor/learn_for_product/docs/superpowers/verification/knowledge-context-v2/runs/offline-20260726-deepseek-v4flash-retrieval-v2/offline-evaluation-report-v2.json`

## 产品知识预检

本次 context-pack：

- 当前任务：基于已批准 Spec 编写既有 Astro 案例页的实施计划。
- 路由依据：`真实任务上下文加载规则`、`个人知识库RAG式上下文治理规则`、正式知识域根索引、需求文档/技术分析/原型分析/项目复盘 README。
- 候选来源：已批准 Spec、当前页面/数据/组件/测试、AI 架构卡、上下文卡、高保真基线卡、项目价值门禁卡。
- 最终加载：`PRD审查经验`、`AI产品架构六层总览`、`上下文设计追求最小充分而非信息最多`、`高保真原型真实页面基线规则`、`没有胜仗的敏捷会变成消耗`。
- 未加载：旧 `wiki/`、原文层、竞品/财经/心理/教育等无关领域；当前 Spec 与代码证据已足够，继续加载只会增加重复上下文。
- 风险：V1.5 只能表达为“当前收敛设计 / 待同题评测”；视觉重构不得偷改 Deck 交互或把技术门指标包装成业务结果。

## Spec-readiness：PASS

- **状态组合：** 页面只需表达 V1 stable baseline、V2 shadow/未激活、评测 gate=false、V1.5 current convergence design/待同题评测、业务结果 verified；不存在未定义的中间状态。
- **失败与并发：** 页面本身无数据写入和并发业务状态。映射缺失由 Astro 类型检查阻断，事实漂移由内容测试阻断，视觉/溢出由 Playwright 与人工审图阻断。
- **枚举闭合：** 8 个 section、7 个 Visual ID、5 个 Narrative tone、8 个时间线标签、7 张桌面与 4 张移动快照均为封闭集合。
- **单一真值源：** 本 Spec 是页面叙事唯一新设计入口；V2 预算和盲评文件只提供事实证据，页面数据只消费已确认结论，不建立第二套版本规则。

## 文件结构

```text
src/data/knowledgeHarness.ts
src/pages/ai/knowledge-harness.astro
src/components/knowledge-harness/DiagramFrame.astro
src/components/knowledge-harness/ProblemMap.astro
src/components/knowledge-harness/KnowledgeProductionGates.astro
src/components/knowledge-harness/V1RoutingRuntime.astro
src/components/knowledge-harness/V2ShadowRuntime.astro
src/components/knowledge-harness/EvaluationActivationGate.astro
src/components/knowledge-harness/V15ProfileRuntime.astro
src/components/knowledge-harness/WorkflowImpact.astro
e2e/knowledge-harness.spec.ts
e2e/knowledge-harness.visual.spec.ts
e2e/knowledge-harness.visual.spec.ts-snapshots/
```

### Task 1：先把八章结构和事实边界写成 RED 契约

**Files:**
- Modify: `e2e/knowledge-harness.spec.ts`

- [ ] **Step 1：把 Visual ID 和章节数量改为最终契约**

```ts
const visualIds = [
  'problem-map',
  'knowledge-production-gates',
  'v1-routing-runtime',
  'v2-shadow-runtime',
  'evaluation-activation-gate',
  'v15-profile-runtime',
  'workflow-impact',
] as const;

test('Knowledge Harness binds eight sections to seven unique diagrams', async ({ page }) => {
  await page.goto('/ai/knowledge-harness/');
  await expect(page.getByRole('heading', { name: 'Enterprise Knowledge Harness' })).toBeVisible();
  await expect(page.locator('main#deck section')).toHaveCount(8);
  await expect(page.locator('[data-visual]')).toHaveCount(7);
  expect(await page.locator('[data-visual]').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-visual'))
  )).toEqual([...visualIds]);
  await expect(page.locator('nav.timeline a[data-t]')).toHaveCount(8);
  expect(await page.locator('nav.timeline a[data-t]').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('href'))
  )).toEqual(['#s1', '#s2', '#s3', '#s4', '#s5', '#s6', '#s7', '#s8']);
});
```

- [ ] **Step 2：把事实测试改为精确包含与禁止表述契约**

```ts
test('public facts explain candidate gates and V1 to V1.5 evolution without overclaiming', async ({ page }) => {
  await page.goto('/ai/knowledge-harness/');
  const body = await page.locator('body').innerText();
  for (const required of [
    '不是每个对话都触发', '不是会话结束 Hook', '候选', '正式知识',
    '最多 5 个文件', '没有 Token 硬上限', '6,000 Token',
    '300', '1,400', '800', '2,600', '900',
    '20 组', 'V1 18', 'V2 16', 'activation=false',
    'Profile', '两阶段', 'RetrievalTrace', '可替换检索接口',
    '工作价值不降低', '中位数', 'P90', '待同题评测',
    'PRD Writer', '独立 Reviewer', '渗透率 100%', '历史文档缺失',
  ]) expect(body).toContain(required);

  for (const forbidden of [
    'V2 已正式替换 V1', 'V1 有 6,000 Token 硬上限', 'V2 上限为 6,500 Token',
    'V1.5 硬上限为 3,500 Token', 'V1.5 已证明 Token 中位数和 P90 低于 V2',
    'V1.5 已完成生产切流', '每个对话结束都会自动生成知识卡',
    'digest 是全局会话结束 Hook', '两个独立 Skill 已上线负责查找和组装',
  ]) expect(body).not.toContain(forbidden);
});
```

- [ ] **Step 3：把左右职责、Figure、交互和溢出循环范围改为 S2–S8**

```ts
for (let index = 2; index <= 8; index += 1) {
  const section = page.locator(`#s${index}`);
  const left = normalize(await section.locator('.narrative-copy').innerText());
  const right = normalize(await section.locator('.diagram-labels').innerText());
  expect(left.length).toBeGreaterThan(20);
  expect(right.length).toBeGreaterThan(12);
  expect(right).not.toBe(left);
  await expect(section.locator('figure[data-visual]')).toHaveCount(1);
}
```

交互测试继续点击 `s6`，并增加所有时间线链接逐一点击后的 Hash 断言；溢出测试覆盖 1280×800 与 390×844 的 `s3`、`s5`、`s6`、`s7`。

- [ ] **Step 4：运行 RED 测试**

Run: `npx playwright test e2e/knowledge-harness.spec.ts`

Expected: FAIL；首个失败明确显示 section 期望 8、实际 10，或 Visual ID 仍是旧九图。若失败来自服务启动/依赖问题，先恢复环境，不修改新断言。

- [ ] **Step 5：只提交 RED 契约**

```bash
git add e2e/knowledge-harness.spec.ts
git commit -m "test: lock knowledge harness desk narrative"
```

Expected: 提交成功；`.gitignore`、简历和其他用户改动仍保持未暂存。

### Task 2：建立迁移期类型边界，让新组件可独立落地

**Files:**
- Modify: `src/data/knowledgeHarness.ts`
- Modify: `src/components/knowledge-harness/DiagramFrame.astro`

- [ ] **Step 1：在不切换旧页面的前提下声明新 Visual ID**

在 `knowledgeHarness.ts` 顶部新增迁移期集合，暂时保留现有 `HarnessVisualId` 供旧页面使用：

```ts
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
```

- [ ] **Step 2：让共享图框在迁移期接受旧/新两个封闭集合**

```ts
import type { HarnessVisualId, NextHarnessVisualId } from '../../data/knowledgeHarness';

interface Props {
  visualId: HarnessVisualId | NextHarnessVisualId;
  title: string;
  ariaLabel: string;
  caption: string;
  legend: readonly LegendItem[];
}
```

- [ ] **Step 3：验证生产代码仍可检查，功能契约仍保持 RED**

Run: `npm run check`

Expected: PASS，0 errors / 0 warnings / 0 hints。

Run: `npx playwright test e2e/knowledge-harness.spec.ts`

Expected: FAIL，原因仍是页面尚未切换到八章，不得出现 TypeScript/Astro 编译错误。

- [ ] **Step 4：提交迁移类型边界**

```bash
git add src/data/knowledgeHarness.ts src/components/knowledge-harness/DiagramFrame.astro
git commit -m "refactor: prepare knowledge harness visual migration"
```

### Task 3：实现五张新结构图，保持旧页面可运行

**Files:**
- Create: `src/components/knowledge-harness/KnowledgeProductionGates.astro`
- Create: `src/components/knowledge-harness/V1RoutingRuntime.astro`
- Create: `src/components/knowledge-harness/V2ShadowRuntime.astro`
- Create: `src/components/knowledge-harness/EvaluationActivationGate.astro`
- Create: `src/components/knowledge-harness/V15ProfileRuntime.astro`

- [ ] **Step 1：实现 S3 知识产生双门图**

组件必须包含三类触发入口、候选队列、复审入口、五问门禁、六种裁决和三层去向；主节点不直接复制左侧文案。

```astro
---
import DiagramFrame from './DiagramFrame.astro';
const legend = [
  { tone: 'stable', label: '候选：可追加证据' },
  { tone: 'gate', label: '门禁：正式入库五问' },
  { tone: 'verified', label: '已裁决：进入唯一知识层' },
] as const;
const triggers = ['任务内语义信号', '用户显式 digest', '复现 / 周度复盘'] as const;
const outcomes = ['新增', '追加', '合并', '暂缓', '丢弃', '留原文层'] as const;
---
<DiagramFrame visualId="knowledge-production-gates" title="候选捕获与正式入库是两道门" ariaLabel="三类触发先进入可去重和追加证据的候选队列，再由复审与入库五问决定六种去向" caption="即时捕获由 Agent 语义规则触发并由确定性脚本持久化；它不是宿主生命周期 Hook。" {legend}>
  <div class="production-gates">
    <div class="trigger-row">{triggers.map((item) => <div class="kh-node">{item}</div>)}</div>
    <div class="kh-arrow">↓</div>
    <div class="kh-node orchestrator">候选队列<small>去重 · 追加证据 · 不要求立即转正</small></div>
    <div class="kh-arrow">↓ 显式沉淀 / 复现 / 周度复盘</div>
    <div class="kh-node gate">入库五问<small>复用 · 判断改变 · 可路由 · 可承接 · 不污染</small></div>
    <div class="outcome-row">{outcomes.map((item) => <span>{item}</span>)}</div>
    <div class="destination-row"><div class="kh-node verified">原文层</div><div class="kh-node verified">正式知识域</div><div class="kh-node verified">能力层 / shared Skill</div></div>
  </div>
</DiagramFrame>
<style>
  .production-gates { display: grid; gap: .42rem; justify-items: stretch; }
  .trigger-row, .destination-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: .42rem; }
  .outcome-row { display: flex; flex-wrap: wrap; justify-content: center; gap: .32rem; }
  .outcome-row span { padding: .25rem .48rem; border: 1px solid var(--glass-border); border-radius: 999px; color: var(--text-dim); font-size: .61rem; }
  @media (max-width: 560px) { .trigger-row, .destination-row { grid-template-columns: 1fr; } }
</style>
```

- [ ] **Step 2：实现 S4 V1 单泳道运行图**

```astro
---
import DiagramFrame from './DiagramFrame.astro';
const legend = [{ tone: 'stable', label: 'V1：首个稳定基线' }] as const;
---
<DiagramFrame visualId="v1-routing-runtime" title="人工权威索引的稳定路径" ariaLabel="任务依次经过根领域索引、任务索引和项目记忆索引，最多选择五个文件后组成 Context-Pack" caption="V1 控制文件数量而不是 Token：最多 5 个文件，没有 Token 硬上限。" {legend}>
  <div class="v1-flow">
    <div class="kh-node orchestrator">Task</div><div class="kh-arrow">→</div>
    <div class="index-stack"><div class="kh-node">根 / 领域索引</div><div class="kh-node">任务索引</div><div class="kh-node">项目记忆索引</div></div>
    <div class="kh-arrow">→</div><div class="kh-node gate">最多 5 个文件<small>文件长度仍可能波动</small></div>
    <div class="kh-arrow">→</div><div class="kh-node verified">Context-Pack</div>
  </div>
</DiagramFrame>
<style>
  .v1-flow { display: grid; grid-template-columns: .7fr auto 1.25fr auto 1fr auto 1fr; gap: .42rem; align-items: center; }
  .index-stack { display: grid; gap: .32rem; }
  @media (max-width: 620px) { .v1-flow { grid-template-columns: 1fr; } .v1-flow > .kh-arrow { transform: rotate(90deg); } }
</style>
```

- [ ] **Step 3：实现 S5 V2 Shadow 与五区预算图**

```astro
---
import DiagramFrame from './DiagramFrame.astro';
const legend = [
  { tone: 'shadow', label: 'V2：Shadow 实验' },
  { tone: 'gate', label: '确定性选择与质量门' },
] as const;
const budgets = [['Envelope', '300'], ['Current Task', '1,400'], ['Control', '800'], ['Formal + Legacy', '2,600'], ['Evidence', '900']] as const;
---
<DiagramFrame visualId="v2-shadow-runtime" title="查找与审查组装的影子链路" ariaLabel="V2 由 Query Planner 和 RoleRetriever 查找，经 RRF 与重排后由 Selector、Quality Gate、Composer 和 Renderer 组装，并受六千 Token 五区预算约束" caption="最终字符串硬上限为 6,000 Token；RetrievalTrace 记录候选、排序、门禁与选择结果。" {legend}>
  <div class="v2-runtime">
    <div class="phase"><b>查找</b><div class="kh-node shadow">Query Planner</div><div class="kh-node shadow">RoleRetriever<small>Exact · Lexical · Metadata</small></div><div class="kh-node shadow">RRF · Reranker</div></div>
    <div class="kh-arrow">→</div>
    <div class="phase"><b>审查组装</b><div class="kh-node gate">去重 · 冲突分组</div><div class="kh-node gate">Selector · Quality Gate</div><div class="kh-node shadow">Composer · Renderer</div></div>
    <div class="trace">RetrievalTrace</div>
    <div class="budget-grid">{budgets.map(([name, value]) => <div><span>{name}</span><b>{value}</b></div>)}<div class="total"><span>硬上限</span><b>6,000 Token</b></div></div>
  </div>
</DiagramFrame>
<style>
  .v2-runtime { display: grid; grid-template-columns: 1fr auto 1fr; gap: .5rem; align-items: center; }
  .phase { display: grid; gap: .32rem; }
  .phase > b, .trace { color: var(--text-dim); font-size: .62rem; letter-spacing: .08em; }
  .trace { grid-column: 1 / -1; text-align: center; border-bottom: 1px dashed var(--c-cyan); padding: .2rem; }
  .budget-grid { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(6, 1fr); gap: .3rem; }
  .budget-grid div { display: grid; gap: .12rem; padding: .34rem; border: 1px solid var(--glass-border); border-radius: .5rem; text-align: center; }
  .budget-grid span { color: var(--text-dim); font-size: .52rem; } .budget-grid b { font-size: .64rem; }
  .budget-grid .total { border-color: #f59e0b; }
  @media (max-width: 620px) { .v2-runtime { grid-template-columns: 1fr; } .v2-runtime > .kh-arrow { transform: rotate(90deg); } .trace, .budget-grid { grid-column: 1; } .budget-grid { grid-template-columns: repeat(2, 1fr); } }
</style>
```

- [ ] **Step 4：实现 S6 人工评测与激活门图**

```astro
---
import DiagramFrame from './DiagramFrame.astro';
const legend = [
  { tone: 'stable', label: 'V1：stable baseline' },
  { tone: 'shadow', label: 'V2：shadow' },
  { tone: 'gate', label: '激活门：未通过' },
] as const;
---
<DiagramFrame visualId="evaluation-activation-gate" title="同题盲评决定是否切流" ariaLabel="二十组同题盲评中 V1 工作价值十八、V2 工作价值十六，因此激活门为 false，V2 保持 Shadow 而不进入 canary" caption="安全门与规模门通过，不等于工作价值门通过；该结果不能推出 V1.5 的 Token 或价值结论。" {legend}>
  <div class="evaluation">
    <div class="sample">20 组同题盲评</div>
    <div class="scores"><div class="score stable"><span>V1 工作价值</span><b>18</b></div><div class="score shadow"><span>V2 工作价值</span><b>16</b></div></div>
    <div class="kh-node gate">activation=false<small>production_enabled=false</small></div>
    <div class="decision-row"><div class="kh-node shadow">V2 保持 Shadow</div><div class="kh-node muted">canary 未进入</div></div>
  </div>
</DiagramFrame>
<style>
  .evaluation { display: grid; gap: .55rem; justify-items: center; }
  .sample { color: var(--text-dim); font-size: .68rem; }
  .scores, .decision-row { width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: .6rem; }
  .score { display: grid; justify-items: center; padding: .65rem; border: 1px solid var(--glass-border); border-radius: .75rem; }
  .score span { color: var(--text-dim); font-size: .64rem; } .score b { font-size: 2.2rem; line-height: 1.1; }
  .score.stable { border-color: #34d399; } .score.shadow { border: 1px dashed var(--c-cyan); }
  .muted { opacity: .48; }
</style>
```

- [ ] **Step 5：实现 S7 Profile 驱动两阶段 V1.5 图**

```astro
---
import DiagramFrame from './DiagramFrame.astro';
const legend = [
  { tone: 'stable', label: '保留：V1 有效性' },
  { tone: 'shadow', label: '吸收：V2 可扩展接口' },
  { tone: 'gate', label: '待同题评测：预算下调门' },
] as const;
const quality = [['弱相关', '不加载'], ['冲突', '保留冲突组'], ['过期', '标记复核'], ['关键缺失', 'insufficient / escalation']] as const;
---
<DiagramFrame visualId="v15-profile-runtime" title="Profile 驱动的两阶段 V1.5" ariaLabel="任务先由 Profile 判断角色和知识边界，再经过候选查找与审查冲突组装两阶段生成 Context-Pack，并在同题评测后才决定是否降低六千 Token 安全上限" caption="V1.5 是当前收敛设计，保留 6,000 Token 安全硬上限；3,500 不是硬门，生产切流与同口径结果均待验证。" {legend}>
  <div class="v15-runtime">
    <div class="main-flow"><div class="kh-node orchestrator">Task</div><div class="kh-arrow">→</div><div class="kh-node verified">Profile<small>任务 · 角色 · 知识边界</small></div><div class="kh-arrow">→</div><div class="kh-node shadow">阶段一：查找候选<small>可替换检索接口</small></div><div class="kh-arrow">→</div><div class="kh-node gate">阶段二：审查与组装<small>RetrievalTrace</small></div><div class="kh-arrow">→</div><div class="kh-node verified">Context-Pack</div></div>
    <div class="quality-grid">{quality.map(([input, output]) => <div><b>{input}</b><span>{output}</span></div>)}</div>
    <div class="budget-gate"><span>6,000 Token 安全硬上限</span><b>同题评测：工作价值不降低 · 中位数低于 V2 · P90 低于 V2</b><em>满足后再决定是否下调</em></div>
  </div>
</DiagramFrame>
<style>
  .v15-runtime { display: grid; gap: .5rem; }
  .main-flow { display: grid; grid-template-columns: .6fr auto .8fr auto 1fr auto 1fr auto .8fr; gap: .3rem; align-items: stretch; }
  .main-flow .kh-node { display: grid; place-content: center; padding: .45rem .3rem; }
  .quality-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: .32rem; }
  .quality-grid div { display: grid; gap: .1rem; padding: .35rem; border: 1px solid var(--glass-border); border-radius: .5rem; text-align: center; }
  .quality-grid b { font-size: .6rem; } .quality-grid span { color: var(--text-dim); font-size: .52rem; }
  .budget-gate { display: grid; gap: .14rem; padding: .45rem; border: 1px dashed #f59e0b; border-radius: .65rem; text-align: center; }
  .budget-gate span, .budget-gate em { color: var(--text-dim); font-size: .55rem; font-style: normal; } .budget-gate b { font-size: .62rem; }
  @media (max-width: 650px) { .main-flow { grid-template-columns: 1fr; } .main-flow > .kh-arrow { transform: rotate(90deg); } .quality-grid { grid-template-columns: repeat(2, 1fr); } }
</style>
```

- [ ] **Step 6：检查新组件编译，旧页面仍可访问**

Run: `npm run check`

Expected: PASS，0 errors / 0 warnings / 0 hints。

Run: `npx playwright test e2e/knowledge-harness.spec.ts`

Expected: 仍为结构 RED，但无 Astro 编译错误。

- [ ] **Step 7：提交五张新图**

```bash
git add src/components/knowledge-harness/KnowledgeProductionGates.astro \
  src/components/knowledge-harness/V1RoutingRuntime.astro \
  src/components/knowledge-harness/V2ShadowRuntime.astro \
  src/components/knowledge-harness/EvaluationActivationGate.astro \
  src/components/knowledge-harness/V15ProfileRuntime.astro
git commit -m "feat: add knowledge harness evolution diagrams"
```

### Task 4：切换为四幕八章并删除旧图形入口

**Files:**
- Modify: `src/data/knowledgeHarness.ts`
- Modify: `src/pages/ai/knowledge-harness.astro`
- Modify: `src/components/knowledge-harness/ProblemMap.astro`
- Modify: `src/components/knowledge-harness/WorkflowImpact.astro`
- Delete: `src/components/knowledge-harness/LayeredArchitecture.astro`
- Delete: `src/components/knowledge-harness/KnowledgePipeline.astro`
- Delete: `src/components/knowledge-harness/RoutingIndexMap.astro`
- Delete: `src/components/knowledge-harness/ContextAssembly.astro`
- Delete: `src/components/knowledge-harness/RankingMechanism.astro`
- Delete: `src/components/knowledge-harness/FailureBoundary.astro`
- Delete: `src/components/knowledge-harness/ReleaseRollback.astro`

- [ ] **Step 1：把数据类型收敛为最终七图和 S2–S8**

删除迁移期旧 Visual ID，最终类型必须是：

```ts
export const harnessVisualIds = [
  'problem-map', 'knowledge-production-gates', 'v1-routing-runtime',
  'v2-shadow-runtime', 'evaluation-activation-gate', 'v15-profile-runtime',
  'workflow-impact',
] as const;
export type HarnessVisualId = (typeof harnessVisualIds)[number];
export type HarnessSectionId = 's2' | 's3' | 's4' | 's5' | 's6' | 's7' | 's8';
```

`harnessSections` 使用以下最终章节/Visual 映射；Narrative 正文按批准 Spec 第 7 节录入，且必须保留这里列出的精确事实短语：

```ts
export const harnessSections = [
  { id: 's2', chapter: '02 · 企业问题', heading: '知识存在，不等于 Agent 能正确使用', visualId: 'problem-map', narrative: [
    { label: '问题', body: '规范、项目经验和业务材料分散，来源权威并不一致。', tone: 'problem' },
    { label: '后果', body: '全量加载造成上下文膨胀；冲突与过期材料会静默进入回答；规则写死在 Skill 中又让知识与流程耦合。', tone: 'thinking' },
    { label: '判断', body: '先治理什么能进入任务、由谁裁决、如何失败，再谈检索能力。', tone: 'decision' },
  ] },
  { id: 's3', chapter: '03 · 知识产生', heading: '先捕获候选，再决定什么值得成为知识', visualId: 'knowledge-production-gates', narrative: [
    { label: '触发', body: '即时捕获不是每个对话都触发：只有可能改变未来跨任务行为，并有用户原话或可定位证据时才登记候选。', tone: 'thinking' },
    { label: '边界', body: '它不是会话结束 Hook；纯 Agent 推断、当前 TODO、项目进度和一次性 Bug 不进入候选队列。', tone: 'problem' },
    { label: '双门', body: '候选可以先去重或追加证据，显式沉淀、复现或周度复盘再触发五问裁决，决定是否进入正式知识。', tone: 'decision' },
  ] },
  { id: 's4', chapter: '04 · V1 起点', heading: 'V1：用人工索引建立第一个稳定基线', visualId: 'v1-routing-runtime', narrative: [
    { label: '优势', body: '小语料阶段，人工权威索引用较低复杂度稳定完成任务路由。', tone: 'result' },
    { label: '预算', body: 'V1 最多返回 5 个文件，没有 Token 硬上限。', tone: 'status' },
    { label: '问题', body: '文件长度不一会造成上下文波动；知识、角色和跨项目材料增加后，维护与覆盖成本开始上升。', tone: 'problem' },
  ] },
  { id: 's5', chapter: '05 · V2 Shadow', heading: 'V2：为规模化问题设计影子实验', visualId: 'v2-shadow-runtime', narrative: [
    { label: '假设', body: '更强的检索、排序和可观察性可以为未来规模化留出能力，但不直接接管生产流量。', tone: 'thinking' },
    { label: '职责', body: 'V2 将查找与审查组装分开，并用 RetrievalTrace 记录候选、排序、门禁和选择结果。', tone: 'decision' },
    { label: '预算', body: 'Context-Pack 最终字符串使用 6,000 Token 硬上限；五区预算由右侧结构图给出。', tone: 'status' },
  ] },
  { id: 's6', chapter: '06 · 人工评测', heading: '更少上下文，没有带来更高工作价值', visualId: 'evaluation-activation-gate', narrative: [
    { label: '证据', body: '20 组同题盲评中，V1 18，V2 16；安全门与规模门通过，但 activation=false。', tone: 'result' },
    { label: '判断', body: '更完整的工程能力和更少上下文，不能自动成为切流理由。', tone: 'decision' },
    { label: '状态', body: 'V2 保持 Shadow，production_enabled=false，不进入 canary；该评测也不证明 V1.5 的结果。', tone: 'status' },
  ] },
  { id: 's7', chapter: '07 · V1.5 收敛', heading: 'V1.5：把有效性与可扩展性收敛在一起', visualId: 'v15-profile-runtime', narrative: [
    { label: '设计', body: 'Profile 先判断任务、角色与知识边界，再用两阶段完成候选查找和审查组装。', tone: 'decision' },
    { label: '继承', body: '保留 V1 的人工权威索引与小语料有效性，吸收 V2 的 RetrievalTrace 和可替换检索接口。', tone: 'thinking' },
    { label: '预算门', body: '当前收敛设计保留 6,000 Token 安全硬上限，待同题评测证明工作价值不降低，且中位数、P90 均低于 V2 后，再决定是否下调。', tone: 'status' },
  ] },
  { id: 's8', chapter: '08 · 真实结果', heading: '从知识治理进入真实产品交付', visualId: 'workflow-impact', narrative: [
    { label: '接入', body: 'PRD Writer 与独立 Reviewer 使用同一知识事实基线。', tone: 'result' },
    { label: '覆盖', body: '产品部门全员覆盖，渗透率 100%；历史文档缺失的产品优化需求除外。', tone: 'result' },
    { label: '结果', body: '规则、案例和项目记忆可以独立维护、按任务加载并版本化演进。', tone: 'decision' },
  ] },
] as const satisfies readonly HarnessSection[];

export const timelineLabels = ['封面', '问题', '产生', 'V1', 'V2', '评测', 'V1.5', '结果'] as const;
```

同时把 `DiagramFrame.astro` 恢复为只接受最终类型，删除迁移期 `NextHarnessVisualId`：

```ts
import type { HarnessVisualId } from '../../data/knowledgeHarness';

interface Props {
  visualId: HarnessVisualId;
  title: string;
  ariaLabel: string;
  caption: string;
  legend: readonly LegendItem[];
}
```

- [ ] **Step 2：切换页面 imports、Visual 映射和封面价值句**

```astro
---
import DeckLayout from '../../layouts/DeckLayout.astro';
import ProblemMap from '../../components/knowledge-harness/ProblemMap.astro';
import KnowledgeProductionGates from '../../components/knowledge-harness/KnowledgeProductionGates.astro';
import V1RoutingRuntime from '../../components/knowledge-harness/V1RoutingRuntime.astro';
import V2ShadowRuntime from '../../components/knowledge-harness/V2ShadowRuntime.astro';
import EvaluationActivationGate from '../../components/knowledge-harness/EvaluationActivationGate.astro';
import V15ProfileRuntime from '../../components/knowledge-harness/V15ProfileRuntime.astro';
import WorkflowImpact from '../../components/knowledge-harness/WorkflowImpact.astro';
import { harnessSections, timelineLabels } from '../../data/knowledgeHarness';

const visualById = {
  'problem-map': ProblemMap,
  'knowledge-production-gates': KnowledgeProductionGates,
  'v1-routing-runtime': V1RoutingRuntime,
  'v2-shadow-runtime': V2ShadowRuntime,
  'evaluation-activation-gate': EvaluationActivationGate,
  'v15-profile-runtime': V15ProfileRuntime,
  'workflow-impact': WorkflowImpact,
} as const;
---
```

封面替换为：

```astro
<p class="sub value-line">让企业经验成为 Agent 可复用的判断力</p>
<p class="sub">让多个 Agent 与产品经理基于同一事实工作</p>
<p class="sub signal-line">知识产生 · 按任务交付 · 评测演进 · 工作流结果</p>
```

保留现有 `DeckLayout`、`main#deck`、来源链接、IntersectionObserver、主题按钮和 timeline 生成逻辑。将移动端特殊选择器由旧 `#s6, #s9` 调整为 `#s5, #s6, #s7`，不得修改全局 `DeckLayout`。

- [ ] **Step 3：调整 S2 与 S8 的事实层级**

`ProblemMap` 的业务风险改为“上下文膨胀 / 来源冲突 / 材料过期 / 加载成本”，把 Skill 耦合放入 Caption；`WorkflowImpact` Caption 必须保留“历史文档缺失的产品优化需求除外”，并继续区分业务结果与技术门指标。

- [ ] **Step 4：删除七个无引用旧组件并扫描引用**

Run: `rg -n "LayeredArchitecture|KnowledgePipeline|RoutingIndexMap|ContextAssembly|RankingMechanism|FailureBoundary|ReleaseRollback|layered-architecture|knowledge-pipeline|routing-index-map|context-assembly|ranking-mechanism|failure-boundary|release-rollback" src e2e`

Expected: 无输出。若仍有引用，先迁移引用，不保留 deprecated 第二入口。

- [ ] **Step 5：运行 GREEN 功能契约**

Run: `npm run check`

Expected: PASS，0 errors / 0 warnings / 0 hints。

Run: `npx playwright test e2e/knowledge-harness.spec.ts`

Expected: 7 tests全部 PASS；若最终测试数量因逐 Hash 校验拆分而增加，以全部通过为准。

- [ ] **Step 6：提交四幕八章切换**

```bash
git add src/data/knowledgeHarness.ts src/pages/ai/knowledge-harness.astro \
  src/components/knowledge-harness/DiagramFrame.astro \
  src/components/knowledge-harness/ProblemMap.astro \
  src/components/knowledge-harness/WorkflowImpact.astro \
  src/components/knowledge-harness/LayeredArchitecture.astro \
  src/components/knowledge-harness/KnowledgePipeline.astro \
  src/components/knowledge-harness/RoutingIndexMap.astro \
  src/components/knowledge-harness/ContextAssembly.astro \
  src/components/knowledge-harness/RankingMechanism.astro \
  src/components/knowledge-harness/FailureBoundary.astro \
  src/components/knowledge-harness/ReleaseRollback.astro
git commit -m "feat: tell knowledge harness V1 to V1.5 story"
```

Expected: Git 接受删除路径并提交；不得使用 `git add -A`。

### Task 5：更新视觉回归并完成桌面/移动人工审图

**Files:**
- Modify: `e2e/knowledge-harness.visual.spec.ts`
- Replace only Knowledge Harness images in: `e2e/knowledge-harness.visual.spec.ts-snapshots/`
- Modify if required by review: Knowledge Harness 专用页面/组件 CSS

- [ ] **Step 1：把视觉矩阵改为 7 张桌面 + 4 张移动**

```ts
const desktopSections = ['s2', 's3', 's4', 's5', 's6', 's7', 's8'] as const;
const mobileSections = ['s3', 's5', 's6', 's7'] as const;
```

保留 `reducedMotion: 'reduce'`、暗色固定、隐藏 Astro toolbar 和关闭动画的准备逻辑。

- [ ] **Step 2：生成新快照**

Run: `npx playwright test e2e/knowledge-harness.visual.spec.ts --update-snapshots`

Expected: 11 tests PASS，并只更新 `knowledge-harness-s2-desktop.png` 至 `knowledge-harness-s8-desktop.png`、`s3/s5/s6/s7-mobile.png`；旧 `s9/s10` 及旧移动快照被删除。

- [ ] **Step 3：人工审查 11 张快照**

逐张确认：

- S3 能先读出“双门”，候选/正式知识不是同一状态。
- S5 的 6,000 为预算总上限，五区数字可读但不压过主路径。
- S6 的 18 / 16 是第一视觉层级，`activation=false` 和“不切换”清晰。
- S7 能读出 `Profile → 查找 → 审查组装 → Context-Pack`，并明确“待同题评测”。
- 390px 不裁掉标题、主判断、图例或 Caption，不出现横向滚动。
- 明暗状态不只依赖颜色，Legend 文字始终存在。

发现问题时只调整 Knowledge Harness 专用 CSS；不得为了快照通过降低断言或修改 `DeckLayout`。

- [ ] **Step 4：运行无更新参数的视觉回归**

Run: `npx playwright test e2e/knowledge-harness.visual.spec.ts`

Expected: 11 tests PASS，0 snapshot diff。

- [ ] **Step 5：提交视觉基线**

```bash
git add e2e/knowledge-harness.visual.spec.ts \
  e2e/knowledge-harness.visual.spec.ts-snapshots/ \
  src/pages/ai/knowledge-harness.astro \
  src/components/knowledge-harness/
git commit -m "test: update knowledge harness desk baselines"
```

提交前先执行 `git diff --cached --name-only`，Expected: 只出现 Knowledge Harness 页面、专用组件、视觉测试和对应 PNG。

### Task 6：最终事实审计、全量验证与运行态收口

**Files:**
- Verify only: 本计划范围内文件
- Update: `tmp/plan-runtime/enterprise-knowledge-harness-desk-narrative.plan-runtime.json`

- [ ] **Step 1：执行禁止表述与旧入口扫描**

Run:

```bash
rg -n "V2 已正式替换 V1|V1 有 6,000 Token 硬上限|V2 上限为 6,500 Token|V1\.5 硬上限为 3,500 Token|V1\.5 已证明 Token 中位数和 P90 低于 V2|V1\.5 已完成生产切流|每个对话结束都会自动生成知识卡|digest 是全局会话结束 Hook|两个独立 Skill 已上线负责查找和组装" \
  src/pages/ai/knowledge-harness.astro src/data/knowledgeHarness.ts src/components/knowledge-harness e2e/knowledge-harness.spec.ts
```

Expected: 只允许命中 `e2e/knowledge-harness.spec.ts` 的 forbidden 数组；生产文件 0 命中。

Run:

```bash
rg -n "LayeredArchitecture|KnowledgePipeline|RoutingIndexMap|ContextAssembly|RankingMechanism|FailureBoundary|ReleaseRollback" \
  src/pages/ai/knowledge-harness.astro src/data/knowledgeHarness.ts src/components/knowledge-harness
```

Expected: 无输出。

- [ ] **Step 2：执行格式、类型、功能、视觉与构建验证**

Run: `git diff --check`

Expected: 无输出，退出码 0。

Run: `npm run check`

Expected: 0 errors / 0 warnings / 0 hints。

Run: `npx playwright test e2e/knowledge-harness.spec.ts e2e/knowledge-harness.visual.spec.ts`

Expected: 功能测试全部 PASS，视觉测试 11 个全部 PASS。

Run: `npm run build`

Expected: Astro build 成功，`/ai/knowledge-harness/` 路由生成，无类型或资源错误。

Run: `npm run test:e2e`

Expected: 全站 Playwright 全绿。若失败来自本任务范围外的用户未提交改动，保存完整失败证据，重新运行 Knowledge Harness 定向测试确认本页仍全绿，不擅自修改无关文件。

- [ ] **Step 3：记录最终证据 Hash**

Run:

```bash
shasum -a 256 \
  src/data/knowledgeHarness.ts \
  src/pages/ai/knowledge-harness.astro \
  e2e/knowledge-harness.spec.ts \
  e2e/knowledge-harness.visual.spec.ts
```

Expected: 输出 4 行稳定 SHA-256；写入运行时状态的 `reason`，作为 `KNOWLEDGE_HARNESS_DESK_PASS` 证据。

- [ ] **Step 4：确认提交边界和工作树归属**

Run: `git status --short`

Expected: 本计划文件均已提交；剩余 `.gitignore`、简历、resume 脚本/测试、`.superpowers/`、`tmp/` 等原有改动仍存在且未被纳入本任务提交。

- [ ] **Step 5：写入真实终态**

仅在以上检查实际通过且没有剩余授权内工作时执行：

```bash
python3 /Users/qqx/.agents/skills/adaptive-orchestration/scripts/plan_stop_gate.py set-state \
  --file /Users/qqx/my_code_cursor/personal-website/tmp/plan-runtime/enterprise-knowledge-harness-desk-narrative.plan-runtime.json \
  --plan /Users/qqx/my_code_cursor/personal-website/docs/superpowers/plans/2026-08-10-enterprise-knowledge-harness-desk-narrative.md \
  --state completed \
  --remaining 0 \
  --unblocked 0 \
  --next-step "none" \
  --reason "KNOWLEDGE_HARNESS_DESK_PASS: check, targeted functional and visual tests, build, full e2e, manual screenshot review and SHA-256 evidence completed"
```

若有真实产品决策或唯一外部动作阻塞，必须写入与事实一致的 `decision-required` 或 `external-action-required`，不得伪造 `completed`。

---

## 执行启动与恢复

实施开始后的第一条状态写入：

```bash
mkdir -p /Users/qqx/my_code_cursor/personal-website/tmp/plan-runtime
python3 /Users/qqx/.agents/skills/adaptive-orchestration/scripts/plan_stop_gate.py set-state \
  --file /Users/qqx/my_code_cursor/personal-website/tmp/plan-runtime/enterprise-knowledge-harness-desk-narrative.plan-runtime.json \
  --plan /Users/qqx/my_code_cursor/personal-website/docs/superpowers/plans/2026-08-10-enterprise-knowledge-harness-desk-narrative.md \
  --state running \
  --remaining 6 \
  --unblocked 6 \
  --next-step "Task 1 Step 1: update the eight-section RED contract" \
  --reason "Implementation authorized; baseline check and targeted Knowledge Harness tests were green before the narrative migration"
```

每个 Task 完成后更新 `remaining`、`unblocked`、`next-step` 和证据摘要。恢复时顺序固定为：读取状态文件 → `git status --short` → 核对最近提交 → 运行上一个 checkpoint 的定向命令 → 继续 `next-step`。

## 最终验收清单

- [ ] 页面恰好 8 个 section、7 个独立 Figure、8 个 Hash 时间线入口。
- [ ] 左侧是一条 A 骨架的产品判断链，右侧用 C 版本演进提供技术证据。
- [ ] S3 明确候选捕获并非每个对话触发、不是会话结束 Hook。
- [ ] V1 精确表达“最多 5 个文件、无 Token 硬上限”。
- [ ] V2 精确表达 6,000 Token 与 300/1,400/800/2,600/900 五区预算。
- [ ] S6 精确表达 20 组、V1 18、V2 16、activation=false、production_enabled=false。
- [ ] V1.5 精确表达 Profile、两阶段、RetrievalTrace、可替换检索接口、6,000 安全硬上限和待同题评测。
- [ ] 页面没有声称 3,500 是硬门，没有声称 V1.5 已切流或已有同口径结果。
- [ ] PRD Writer、独立 Reviewer、渗透率 100% 和历史文档缺失例外完整。
- [ ] 1280×800 与 390×844 无横向溢出，11 张快照通过人工审图。
- [ ] 来源桥接、主题切换、Reduced Motion、Figure aria-label/Caption/Legend 保持可用。
- [ ] 旧七组件无引用并已删除，不保留多个“最终版”入口。
- [ ] 用户原有未提交改动未被暂存、修改或提交。
