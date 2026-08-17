# Live Portfolio Incremental Visual Evolution Implementation Plan

> **Execution governance:** Before implementation, run the shared `adaptive-orchestration` preflight. A plan records a recommended profile but does not dispatch agents or authorize execution by itself.

**Goal:** 以当前线上 `qqx.life` 对应的冻结提交为基线，增量增加首页精选工作、两张项目证据封面和 Knowledge Harness 的四轮验证视觉证据，同时保留线上公共外壳、八章 Deck、紫蓝配色和案例个性。

**Architecture:** 从已核实的线上基线提交 `718023c054356a9d6036f4b5837251ceedd0f573` 创建隔离分支与工作树，绝不在当前脏 `main` 上回滚或开发。两个真实脱敏截图由带 SHA-256 的视觉资产清单管理；Knowledge Harness、首页知识结构与停车分层均使用线上紫蓝 Token 驱动的 HTML/CSS 原生图形，避免把上一轮朱红结构图或视觉伴侣栅格图带回网站。

**Tech Stack:** Astro 5、TypeScript、CSS、Playwright、`@axe-core/playwright`、Node.js `crypto`、现有深浅主题与 DeckLayout。

**Recommended execution profile:** O3；这是一次预计超过 120 分钟的三阶段基线迁移与视觉验收，当前工作区存在大量未提交改动，必须隔离写入、连续验证并保留可恢复状态。

**Parallelizable workstreams:** 基线与资产契约完成后，`首页 + 项目索引` 与 `Knowledge Harness` 可独立推进；最终快照、全量测试和验收必须串行收敛。

**Shared-write conflicts:** `package.json`、`src/data/portfolioVisuals.json`、`src/components/site/ParkingLayersPreview.astro`、视觉快照目录和最终验收提交只能由根执行者写入；停车分层组件先由首页任务创建，项目索引任务只消费它，不得并发改写。

**Stage evidence checkpoint:** `live-portfolio-incremental-acceptance`；要求冻结基线 SHA 为 `718023c054356a9d6036f4b5837251ceedd0f573`、两个真实截图 Hash 全部匹配、`npm run check`、`npm run portfolio:visuals`、定向 Playwright、增量无障碍测试、全量 `npm run test:e2e` 和 `npm run build` 全部通过，并人工查看首页、项目索引、Knowledge Harness S5/S6/S7 的桌面与移动快照。

**Recovery entry:** 读取本 Plan、`PLAN_RUNTIME_STATE_FILE`，再从其中记录的唯一 `next-step` 继续；隔离工作树固定为 `/Users/qqx/my_code_cursor/personal-website-live-incremental`。

**Plan runtime state file:** `/Users/qqx/my_code_cursor/personal-website/docs/superpowers/plans/2026-08-17-live-portfolio-incremental-visual-evolution.md.plan-runtime.json`

**Authorization boundary:** 允许从冻结提交创建 `codex/live-portfolio-incremental` 分支与隔离工作树；允许修改本 Plan 列出的首页、项目索引、Knowledge Harness、资产清单、校验脚本、定向 E2E 与视觉快照；允许选择性恢复两个已审核脱敏截图、运行本地开发/构建/测试/截图和创建范围内本地提交。一次实施授权覆盖全部 Task 和阶段验收。

**Out of scope:** 不修改当前脏 `main` 的既有未提交内容；不修改简历、About、Skill Desk、商业案例详情、其他三个项目封面、Obsidian Vault、V1/V2/V1.5 的实际运行代码或盲评材料；只调整网站中的展示组件，不生成或发布三版本赢家结论；不部署、不推送、不创建 PR、不改线上外部状态。

**Potential decision boundaries:** 若冻结提交无法复现当前线上结构，需要在“追溯真实部署提交”与“以线上 DOM/截图重建缺失差异”之间选择；若任一已审核资产重新检查后仍可能泄露敏感内容，需要在“改用结构重绘”与“等待新的脱敏资产”之间选择；若 S6 只能通过修改全站 `DeckLayout` 才能在 390px 可读，需要在“页面局部滚动布局”与“授权全站 Deck 响应式改造”之间选择。

**Required execution order:** Task 1–3 → Task 5–7 → Task 4 → Task 8。Task 4 因复用首页的停车分层组件而在文档中相邻说明，但必须等首页 Step 9 与 Knowledge Harness S6 Step 11 的人工视觉检查均通过后再执行，避免样板未收敛就扩散到项目索引。

---

## 0. Source of truth and planning preflight

**Approved Spec:** `/Users/qqx/my_code_cursor/personal-website/docs/superpowers/specs/2026-08-17-live-portfolio-incremental-visual-evolution-design.md`

**Absolute Plan:** `/Users/qqx/my_code_cursor/personal-website/docs/superpowers/plans/2026-08-17-live-portfolio-incremental-visual-evolution.md`

**Spec-readiness:** PASS。

- **State combinations:** V2 固定为 Shadow 且 `activation=false`；V1.5 第二轮只表示纯检索契约通过、整体 Gate 为 `incomplete`；三版本盲测模块缺失时不渲染 DOM 或导航。
- **Failure and concurrency:** 资产缺失或 Hash 不符时 fail closed；脏主工作区不参与实施；页面改动只在隔离工作树串行提交；视觉快照只在人工查看后更新。
- **Enum closure:** 资产类型只有 `real-sanitized | structural-redraw`；卡片视觉只有 `feature | support | strip`；验证状态只有 `fail | no-cutover | incomplete`。
- **Single source of truth:** 视觉资产元数据只存在于 `portfolioVisuals.json`；四轮验证事实只存在于 `knowledgeHarnessValidation.ts`；V2 冻结报告和 V1.5 当前检查点继续是上游事实源。

**Context-pack:**

- 当前任务：把已确认视觉 Spec 拆成可执行、可恢复、可验证的实施计划。
- 当前材料：用户确认的首页与 V2 视觉伴侣、线上 `qqx.life`、冻结 Spec、Git 历史、现有 Astro / Playwright 代码。
- 路由依据：真实任务上下文加载规则、个人知识库 RAG 式上下文治理规则、正式知识域与工作域索引、需求文档/技术分析/项目复盘 README。
- 最终加载：`高保真原型真实页面基线规则`、`迁移不得反向降级已验证门禁`、`上下文设计追求最小充分而非信息最多`、`AI产品架构六层总览`、`没有胜仗的敏捷会变成消耗`。
- 未加载：财经、心理学、儿童教育、竞品、旧 `wiki/` 和大段原文；当前 Spec、真实页面、Git 与五张正式卡已足够。
- 主要风险：部署基线与脏工作区混淆、视觉资产被错误当成真实截图、验证数字漂移、为了单页密度反向修改全站 Deck。

## 1. File structure map

### Create

- `src/data/portfolioVisuals.json`：两个真实脱敏截图的唯一元数据与 Hash 真值源。
- `src/data/portfolioVisuals.ts`：为 Astro 提供类型安全的资产读取接口。
- `scripts/verify-portfolio-visuals.mjs`：构建前逐文件校验存在性与 SHA-256。
- `src/components/home/WorkPreview.astro`：单个首页作品预览，支持 feature/support/strip 三种视觉层级。
- `src/components/home/SelectedWork.astro`：首页非对称精选工作编排。
- `src/components/home/KnowledgeSystemPreview.astro`：首页 Knowledge Harness 的紫蓝五层结构与无数字报告切片。
- `src/components/site/ParkingLayersPreview.astro`：首页与项目索引复用的紫蓝停车系统分层图。
- `src/data/knowledgeHarnessValidation.ts`：V2 两轮、V1.5 两轮冻结事实。
- `src/components/knowledge-harness/V2Architecture.astro`：S6 五层 V2 架构。
- `src/components/knowledge-harness/ValidationReportExcerpt.astro`：单轮脱敏报告切片。
- `src/components/knowledge-harness/ValidationDecisionFlow.astro`：两轮验证到“不切流”的决策门。
- `src/components/knowledge-harness/V15Convergence.astro`：只渲染 V1.5 两阶段运行结构、质量处理和预算门。
- `e2e/knowledge-harness-validation-data.spec.ts`：验证数据契约测试。
- `e2e/project-index.visual.spec.ts`：项目索引桌面/移动视觉快照。
- `e2e/incremental-accessibility.spec.ts`：三个增量页面的 axe 验收。

### Modify

- `package.json`：增加 `portfolio:visuals` 脚本和固定版本的 axe Playwright 开发依赖。
- `package-lock.json`：锁定新增的 axe Playwright 依赖。
- `src/components/Banner.astro`：缩短首页 Hero 并修正下滚锚点。
- `src/pages/index.astro`：在 Hero 与原“作品与思考”之间插入 `SelectedWork`。
- `src/components/Card.astro`：允许卡片封面消费真实截图或停车分层组件，同时保留渐变回退。
- `src/components/SectionGrid.astro`：把可选 `media` / `diagram` 透传给 `Card`。
- `src/pages/projects/index.astro`：只为销售线索绑定真实截图、为智慧停车绑定代码原生分层图。
- `src/data/knowledgeHarness.ts`：保持八章，更新 S5/S6/S7 的稳定文案和视觉职责。
- `src/components/knowledge-harness/DiagramFrame.astro`：增加 `evidence` 宽画布变体。
- `src/components/knowledge-harness/V2ShadowRuntime.astro`：S5 只表达扩展假设，不重复完整架构。
- `src/components/knowledge-harness/EvaluationActivationGate.astro`：组合五层架构、两轮报告和不切流决策。
- `src/components/knowledge-harness/V15ProfileRuntime.astro`：组合 V1.5 两阶段结构、两轮检索报告与 incomplete 状态。
- `src/pages/ai/knowledge-harness.astro`：只增加 S6/S7 页面局部宽度与高度适配。
- `e2e/home.spec.ts`、`e2e/sections.spec.ts`、`e2e/knowledge-harness.spec.ts`：增加功能与事实契约。
- `e2e/knowledge-harness.visual.spec.ts-snapshots/*s5*`、`*s6*`、`*s7*`：只更新受影响视觉基线。

### Selectively restore from reviewed source commit

- `public/portfolio/delivery-review-sanitized.png`
- `public/portfolio/sales-lead-sanitized.png`

## 2. Execution preflight

### Task 1: Create a clean recovery-safe worktree from the live baseline

**Files:**
- Read: `/Users/qqx/my_code_cursor/personal-website/.git`
- Create worktree: `/Users/qqx/my_code_cursor/personal-website-live-incremental`
- Create branch: `codex/live-portfolio-incremental`
- Restore docs: approved Spec and this Plan only

- [ ] **Step 1: Initialize the explicit Plan runtime state**

Run from `/Users/qqx/my_code_cursor/personal-website`:

```bash
python3 /Users/qqx/.agents/skills/adaptive-orchestration/scripts/plan_stop_gate.py set-state \
  --file /Users/qqx/my_code_cursor/personal-website/docs/superpowers/plans/2026-08-17-live-portfolio-incremental-visual-evolution.md.plan-runtime.json \
  --plan /Users/qqx/my_code_cursor/personal-website/docs/superpowers/plans/2026-08-17-live-portfolio-incremental-visual-evolution.md \
  --state running \
  --remaining true \
  --unblocked true \
  --next-step "核验冻结基线并创建隔离工作树"
```

Expected: JSON state exists and reports `state=running`, `remaining=true`.

- [ ] **Step 2: Prove the frozen commit contains the live page contract**

```bash
git cat-file -e 718023c054356a9d6036f4b5837251ceedd0f573^{commit}
git show 718023c054356a9d6036f4b5837251ceedd0f573:src/pages/index.astro | rg 'Banner|作品与思考'
git show 718023c054356a9d6036f4b5837251ceedd0f573:src/pages/projects/index.astro | rg '全渠道销售线索管理系统|智慧停车 2.0'
git show 718023c054356a9d6036f4b5837251ceedd0f573:src/data/knowledgeHarness.ts | rg "timelineLabels = \['封面', '问题', '产生', 'V1', 'V2', '评测', 'V1.5', '结果'\]"
```

Expected: all four commands exit 0. If any fails, do not select another commit by taste; enter the first Potential decision boundary.

- [ ] **Step 3: Preserve evidence of the dirty main without changing it**

```bash
git status --short > /tmp/personal-website-main-before-live-incremental.txt
git diff --cached --name-only > /tmp/personal-website-main-staged-before-live-incremental.txt
git worktree list --porcelain
```

Expected: two evidence files exist; no reset, checkout, stash, clean, add, or commit runs in the dirty main.

- [ ] **Step 4: Create or safely recover the isolated worktree**

First inspect:

```bash
git show-ref --verify --quiet refs/heads/codex/live-portfolio-incremental; echo $?
test -e /Users/qqx/my_code_cursor/personal-website-live-incremental; echo $?
```

Expected on first execution: both print `1`. Then run:

```bash
git worktree add -b codex/live-portfolio-incremental \
  /Users/qqx/my_code_cursor/personal-website-live-incremental \
  718023c054356a9d6036f4b5837251ceedd0f573
```

If either preflight prints `0`, run `git worktree list --porcelain` and reuse only when the path, branch and base SHA match and `git -C /Users/qqx/my_code_cursor/personal-website-live-incremental status --short` is empty. Otherwise stop as technical recovery; do not delete or overwrite the existing path.

- [ ] **Step 5: Bring only the approved documentation into the isolated branch**

Run from the isolated worktree:

```bash
git restore --source=main -- \
  docs/superpowers/specs/2026-08-17-live-portfolio-incremental-visual-evolution-design.md \
  docs/superpowers/plans/2026-08-17-live-portfolio-incremental-visual-evolution.md
git add -- \
  docs/superpowers/specs/2026-08-17-live-portfolio-incremental-visual-evolution-design.md \
  docs/superpowers/plans/2026-08-17-live-portfolio-incremental-visual-evolution.md
git commit -m "docs: attach approved incremental portfolio plan"
```

Expected: exactly two documentation files in the commit.

- [ ] **Step 6: Install and prove the untouched baseline**

```bash
npm ci
npm run check
npm run test:e2e -- e2e/home.spec.ts e2e/sections.spec.ts e2e/knowledge-harness.spec.ts
npm run build
```

Expected: Astro reports 0 errors; targeted Playwright passes; build exits 0. Baseline failures must be recorded before any implementation and cannot be hidden by changing tests.

- [ ] **Step 7: Record the first recovery checkpoint**

```bash
python3 /Users/qqx/.agents/skills/adaptive-orchestration/scripts/plan_stop_gate.py set-state \
  --file /Users/qqx/my_code_cursor/personal-website/docs/superpowers/plans/2026-08-17-live-portfolio-incremental-visual-evolution.md.plan-runtime.json \
  --plan /Users/qqx/my_code_cursor/personal-website/docs/superpowers/plans/2026-08-17-live-portfolio-incremental-visual-evolution.md \
  --state running \
  --remaining true \
  --unblocked true \
  --next-step "建立两个真实脱敏截图的单一清单与 Hash 门"
```

Expected: next step points to Task 2.

### Task 2: Establish the reviewed visual asset contract

**Files:**
- Create: `src/data/portfolioVisuals.json`
- Create: `src/data/portfolioVisuals.ts`
- Create: `scripts/verify-portfolio-visuals.mjs`
- Modify: `package.json`
- Restore: two `public/portfolio/*` screenshots listed in the file map

- [ ] **Step 1: Add the manifest before the files so the verifier can fail closed**

Create `src/data/portfolioVisuals.json` exactly as follows:

```json
[
  {
    "id": "delivery-review-sanitized",
    "kind": "real-sanitized",
    "src": "/portfolio/delivery-review-sanitized.png",
    "sha256": "d17f61119a23c5df9a7550b2be250c8830859199ca348e9defb05582c62cdfb8",
    "width": 1200,
    "height": 960,
    "alt": "脱敏后的 Markdown PRD 审查记录，展示独立审查结论和交付状态",
    "caption": "真实 Markdown 工作记录，经裁切和脱敏；仅展示审查机制与结论。"
  },
  {
    "id": "sales-lead-sanitized",
    "kind": "real-sanitized",
    "src": "/portfolio/sales-lead-sanitized.png",
    "sha256": "044f7415c6aa5f0eefe9875f19d4778bb5abb1bfd35af519a9e124d2d2b77fc5",
    "width": 1751,
    "height": 983,
    "alt": "脱敏后的销售线索管理界面，展示筛选、分发状态和列表结构",
    "caption": "真实产品界面，经裁切和脱敏；仅展示与本案例判断相关的结构。"
  }
]
```

- [ ] **Step 2: Add a verifier that rejects missing or changed assets**

Create `scripts/verify-portfolio-visuals.mjs`:

```js
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const manifestPath = join(repoRoot, 'src/data/portfolioVisuals.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const errors = [];
const ids = new Set();

for (const asset of manifest) {
  if (ids.has(asset.id)) errors.push(`duplicate id: ${asset.id}`);
  ids.add(asset.id);
  if (!['real-sanitized', 'structural-redraw'].includes(asset.kind)) errors.push(`invalid kind: ${asset.id}`);
  if (!asset.src.startsWith('/portfolio/')) errors.push(`invalid public path: ${asset.id}`);
  if (!Number.isInteger(asset.width) || asset.width <= 0 || !Number.isInteger(asset.height) || asset.height <= 0) errors.push(`invalid dimensions: ${asset.id}`);
  const absolutePath = join(repoRoot, 'public', asset.src.replace(/^\//, ''));
  try {
    const buffer = await readFile(absolutePath);
    const actual = createHash('sha256').update(buffer).digest('hex');
    if (actual !== asset.sha256) errors.push(`sha256 mismatch: ${asset.id} expected=${asset.sha256} actual=${actual}`);
  } catch (error) {
    errors.push(`missing asset: ${asset.id} (${error.code ?? 'read-error'})`);
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`portfolio visuals verified: ${manifest.length}`);
```

Add this exact script entry to `package.json` without changing existing scripts:

```json
"portfolio:visuals": "node scripts/verify-portfolio-visuals.mjs"
```

- [ ] **Step 3: Run the verifier and prove it fails for the absent files**

```bash
npm run portfolio:visuals
```

Expected: FAIL with two `missing asset:` lines. A PASS here means the clean baseline was contaminated and must be investigated.

- [ ] **Step 4: Restore only the two reviewed screenshots from the reviewed source commit**

```bash
git restore --source=8d4ae7a -- \
  public/portfolio/delivery-review-sanitized.png \
  public/portfolio/sales-lead-sanitized.png
```

Expected: exactly two untracked/restored screenshot files; no SVG, page or component comes from the failed redesign branch.

- [ ] **Step 5: Add the typed reader**

Create `src/data/portfolioVisuals.ts`:

```ts
import rawVisuals from './portfolioVisuals.json';

export type PortfolioVisualId =
  | 'delivery-review-sanitized'
  | 'sales-lead-sanitized';

export type PortfolioVisual = {
  readonly id: PortfolioVisualId;
  readonly kind: 'real-sanitized' | 'structural-redraw';
  readonly src: `/portfolio/${string}.${'svg' | 'png' | 'webp'}`;
  readonly sha256: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  readonly caption: string;
};

export const portfolioVisuals = rawVisuals as unknown as readonly PortfolioVisual[];

export function getPortfolioVisual(id: PortfolioVisualId): PortfolioVisual {
  const visual = portfolioVisuals.find((item) => item.id === id);
  if (!visual) throw new Error(`Missing reviewed portfolio visual: ${id}`);
  return visual;
}
```

- [ ] **Step 6: Run the Hash and type gates**

```bash
npm run portfolio:visuals
npm run check
```

Expected: `portfolio visuals verified: 2`; Astro reports 0 errors.

- [ ] **Step 7: Commit the asset contract**

```bash
git add -- package.json scripts/verify-portfolio-visuals.mjs src/data/portfolioVisuals.json src/data/portfolioVisuals.ts public/portfolio
git diff --cached --check
git commit -m "feat: add reviewed portfolio visual assets"
```

Expected: only the manifest, typed reader, verifier, package script and two screenshots are committed.

## 3. Homepage increment

### Task 3: Add the asymmetric selected-work section

**Files:**
- Create: `src/components/home/WorkPreview.astro`
- Create: `src/components/home/SelectedWork.astro`
- Create: `src/components/home/KnowledgeSystemPreview.astro`
- Create: `src/components/site/ParkingLayersPreview.astro`
- Modify: `src/components/Banner.astro`
- Modify: `src/pages/index.astro`
- Modify test: `e2e/home.spec.ts`

- [ ] **Step 1: Write failing homepage behavior tests**

Append to `e2e/home.spec.ts`:

```ts
test('home adds selected work without replacing the original section navigation', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page.locator('[data-selected-work]')).toBeVisible();
  await expect(page.locator('[data-work-preview]')).toHaveCount(4);
  expect(await page.locator('[data-work-preview]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-work-id'))))
    .toEqual(['knowledge-harness', 'delivery-harness', 'sales-lead', 'smart-parking']);
  await expect(page.locator('.grid a.card')).toHaveCount(3);
  const heroHeight = await page.locator('.banner').evaluate((node) => node.getBoundingClientRect().height);
  expect(heroHeight).toBeGreaterThanOrEqual(560);
  expect(heroHeight).toBeLessThan(900);
});

test('selected work keeps AI systems first on mobile and loads reviewed visuals', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const previews = page.locator('[data-work-preview]');
  await expect(previews).toHaveCount(4);
  await expect(previews.nth(0)).toContainText('Enterprise Knowledge Harness');
  await expect(previews.nth(1)).toContainText('Enterprise Product Delivery Agent Harness');
  await expect(previews.nth(0).locator('[data-knowledge-preview]')).toBeVisible();
  await expect(previews.nth(1).locator('img')).toHaveAttribute('alt', /PRD 审查记录/);
  await expect(previews.nth(3).locator('[data-system-preview="parking-layers"]')).toBeVisible();
  expect(await previews.nth(0).innerText()).not.toMatch(/V1\.5|V2|16\/20|18\/20/);
  expect(await previews.locator('img').evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0))).toBe(true);
});
```

- [ ] **Step 2: Run the tests and verify RED**

```bash
npm run test:e2e -- e2e/home.spec.ts
```

Expected: the two new tests fail because `[data-selected-work]` does not exist; the three baseline tests still pass.

- [ ] **Step 3: Create the reusable preview component**

Create `src/components/home/WorkPreview.astro`:

```astro
---
import { getPortfolioVisual, type PortfolioVisualId } from '../../data/portfolioVisuals';

interface Props {
  id: 'knowledge-harness' | 'delivery-harness' | 'sales-lead' | 'smart-parking';
  href: string;
  eyebrow: string;
  title: string;
  summary: string;
  visualId?: PortfolioVisualId;
  visualCaption?: string;
  variant: 'feature' | 'support' | 'strip';
}

const { id, href, eyebrow, title, summary, visualId, visualCaption, variant } = Astro.props;
const visual = visualId ? getPortfolioVisual(visualId) : undefined;
if (!visual && !visualCaption) throw new Error(`Structural preview ${id} needs a public caption`);
---

<a class:list={['work-preview', variant]} href={href} data-work-preview data-work-id={id}>
  <div class="preview-copy">
    <span class="eyebrow">{eyebrow}</span>
    <h3>{title}</h3>
    <p>{summary}</p>
    <span class="deep-link">查看案例 <span aria-hidden="true">↗</span></span>
  </div>
  <figure data-visual-kind={visual?.kind ?? 'code-native'}>
    {visual ? <img src={visual.src} alt={visual.alt} width={visual.width} height={visual.height} loading="lazy" /> : <div class="visual-slot"><slot name="visual" /></div>}
    <figcaption>{visual?.caption ?? visualCaption}</figcaption>
  </figure>
</a>

<style>
  .work-preview {
    position: relative;
    display: grid;
    gap: 1rem;
    min-width: 0;
    overflow: hidden;
    color: var(--text);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 18px;
    box-shadow: var(--shadow);
    padding: clamp(1.1rem, 2vw, 1.6rem);
    transition: transform .3s var(--ease), border-color .3s var(--ease), box-shadow .3s var(--ease);
  }
  .work-preview:hover { transform: translateY(-4px); border-color: color-mix(in srgb, var(--accent) 42%, var(--border)); box-shadow: var(--shadow-lg); }
  .work-preview:focus-visible { outline: 3px solid color-mix(in srgb, var(--accent) 52%, transparent); outline-offset: 4px; }
  .preview-copy { display: grid; align-content: start; gap: .65rem; }
  .eyebrow { color: var(--accent); font-size: .72rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
  h3 { font-size: clamp(1.15rem, 2vw, 1.8rem); }
  p { color: var(--muted); font-size: .92rem; line-height: 1.65; }
  .deep-link { color: var(--text); font-size: .82rem; font-weight: 650; margin-top: .2rem; }
  figure { min-width: 0; align-self: stretch; display: grid; align-content: center; gap: .45rem; }
  .visual-slot { min-width: 0; height: 100%; min-height: 220px; }
  img { width: 100%; height: 100%; max-height: 290px; object-fit: cover; object-position: top left; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-soft); }
  figcaption { color: var(--muted); font-size: .68rem; line-height: 1.45; }
  .feature { grid-template-columns: minmax(210px, .76fr) minmax(320px, 1.24fr); }
  .support { grid-template-rows: auto minmax(250px, 1fr); height: 100%; }
  .strip { grid-template-columns: minmax(160px, .72fr) minmax(220px, 1.28fr); min-height: 220px; }
  .strip img { max-height: 180px; }
  @media (max-width: 820px) {
    .feature, .support, .strip { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto; height: auto; }
    .work-preview { min-height: 0; }
    img, .strip img { height: auto; max-height: 260px; aspect-ratio: 16 / 9; }
    .visual-slot { min-height: 210px; }
  }
</style>
```

- [ ] **Step 4: Create the Knowledge Harness evidence preview**

Create `src/components/home/KnowledgeSystemPreview.astro`:

```astro
---
const layers = [
  ['Task & Profile', '固定任务、角色与知识边界'],
  ['Query Planning', '规划查找路径'],
  ['Retrieval & Ranking', '召回、排序与候选'],
  ['Quality Gate', '冲突、缺失与失败门'],
  ['Context-Pack', '可追溯地进入工作流'],
] as const;
---

<div class="knowledge-preview" data-knowledge-preview role="img" aria-label="Knowledge Harness 五层链路旁连接一张脱敏验证材料切片">
  <div class="layer-stack">
    {layers.map(([title, detail], index) => (
      <div class:list={['layer', index === 3 && 'gate']}>
        <span>{String(index + 1).padStart(2, '0')}</span><b>{title}</b><em>{detail}</em>
      </div>
    ))}
  </div>
  <aside class="report-slice" aria-label="脱敏验证材料切片">
    <header><span>FROZEN REPORT</span><b>验证材料切片</b></header>
    <div><span>上下文相关性</span><i>已检查</i></div>
    <div><span>必需角色覆盖</span><i>已检查</i></div>
    <div><span>输出回归</span><i>需处置</i></div>
    <footer>验证门未通过 · 保持 Shadow</footer>
  </aside>
</div>

<style>
  .knowledge-preview { height: 100%; display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(150px, .65fr); gap: .75rem; align-items: stretch; padding: .75rem; background: linear-gradient(145deg, color-mix(in srgb, var(--accent) 7%, var(--surface)), var(--surface)); border: 1px solid var(--border); border-radius: 12px; }
  .layer-stack { display: grid; gap: .35rem; align-content: center; }
  .layer { display: grid; grid-template-columns: 28px minmax(115px, .72fr) minmax(0, 1.2fr); gap: .48rem; align-items: center; padding: .48rem .55rem; border: 1px solid color-mix(in srgb, var(--accent) 26%, var(--border)); background: color-mix(in srgb, var(--accent) 5%, var(--surface)); }
  .layer > span { color: var(--accent); font-size: .58rem; font-variant-numeric: tabular-nums; }
  .layer b { font-size: .66rem; }
  .layer em { color: var(--muted); font-size: .58rem; font-style: normal; }
  .layer.gate { border-color: color-mix(in srgb, #f59e0b 48%, var(--border)); background: color-mix(in srgb, #f59e0b 5%, var(--surface)); }
  .report-slice { align-self: center; display: grid; gap: .4rem; padding: .68rem; background: var(--surface); border: 1px solid var(--border); box-shadow: var(--shadow); transform: translateY(.35rem); }
  .report-slice header { display: grid; gap: .1rem; padding-bottom: .35rem; border-bottom: 1px solid var(--border); }
  .report-slice header span { color: var(--accent); font-size: .5rem; letter-spacing: .08em; }
  .report-slice header b { font-size: .68rem; }
  .report-slice > div { display: flex; justify-content: space-between; gap: .4rem; color: var(--muted); font-size: .54rem; }
  .report-slice i { color: var(--text); font-style: normal; font-weight: 650; }
  .report-slice footer { padding-top: .35rem; border-top: 1px dashed var(--border); color: var(--muted); font-size: .52rem; line-height: 1.4; }
  @media (max-width: 620px) {
    .knowledge-preview { grid-template-columns: minmax(0, 1fr); }
    .layer { grid-template-columns: 24px minmax(110px, .8fr) minmax(0, 1fr); }
    .report-slice { transform: none; }
  }
</style>
```

- [ ] **Step 5: Create the reusable parking layers preview**

Create `src/components/site/ParkingLayersPreview.astro`:

```astro
<div class="parking-preview" data-system-preview="parking-layers" role="img" aria-label="内部业务经过停车服务、中台和适配器连接不同停车场的五层结构">
  <div class="system-layer"><span>01</span><b>内部业务</b><em>会员 · 权益 · 财务</em></div>
  <div class="system-layer"><span>02</span><b>停车服务</b><em>查询 · 校验 · 核销</em></div>
  <div class="system-layer hub"><span>03</span><b>停车中台</b><em>统一订单与生命周期</em></div>
  <div class="system-layer"><span>04</span><b>适配器层</b><em>供应商差异收口</em></div>
  <div class="system-layer"><span>05</span><b>停车场</b><em>多场库接入</em></div>
</div>

<style>
  .parking-preview { height: 100%; min-height: 96px; display: grid; gap: .14rem; align-content: center; padding: .32rem; background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 7%, var(--surface)), color-mix(in srgb, #06b6d4 5%, var(--surface))); border: 1px solid var(--border); border-radius: 8px; }
  .system-layer { position: relative; display: grid; grid-template-columns: 20px minmax(64px, .62fr) minmax(0, 1fr); gap: .28rem; align-items: center; min-width: 0; padding: .18rem .34rem; background: var(--surface); border: 1px solid color-mix(in srgb, var(--accent) 28%, var(--border)); }
  .system-layer:not(:last-child)::after { content: ''; position: absolute; left: 10px; bottom: -.16rem; width: 1px; height: .16rem; background: color-mix(in srgb, var(--accent) 55%, var(--border)); }
  .system-layer span { color: var(--accent); font-size: .45rem; }
  .system-layer b { font-size: .55rem; }
  .system-layer em { color: var(--muted); font-size: .46rem; font-style: normal; }
  .system-layer.hub { border-color: color-mix(in srgb, #06b6d4 48%, var(--border)); box-shadow: 0 0 0 3px color-mix(in srgb, #06b6d4 7%, transparent); }
</style>
```

- [ ] **Step 6: Create the asymmetric selected-work composition**

Create `src/components/home/SelectedWork.astro`:

```astro
---
import WorkPreview from './WorkPreview.astro';
import KnowledgeSystemPreview from './KnowledgeSystemPreview.astro';
import ParkingLayersPreview from '../site/ParkingLayersPreview.astro';
const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
---

<section id="selected-work" class="selected-work section-pad" data-selected-work aria-labelledby="selected-work-title">
  <div class="container">
    <div class="section-heading reveal">
      <span>精选工作</span>
      <h2 id="selected-work-title">把 AI 嵌入真实工作</h2>
      <p>先看企业 AI 工作系统，再看支撑这些判断的复杂业务产品经验。</p>
    </div>
    <div class="selected-grid">
      <WorkPreview
        id="knowledge-harness"
        href={`${base}ai/knowledge-harness/`}
        eyebrow="企业 AI 工作系统"
        title="Enterprise Knowledge Harness"
        summary="让企业经验成为 Agent 可复用、可追溯、可验证的判断力。"
        visualCaption="五层知识链路与脱敏验证材料切片；不展示未完成的版本比较。"
        variant="feature"
      >
        <KnowledgeSystemPreview slot="visual" />
      </WorkPreview>
      <WorkPreview
        id="delivery-harness"
        href={`${base}ai/skill-desk/`}
        eyebrow="产品交付工作流"
        title="Enterprise Product Delivery Agent Harness"
        summary="把需求发现、PRD、独立审查与人工决策连接成可交付工作流。"
        visualId="delivery-review-sanitized"
        variant="support"
      />
      <div class="business-pair" aria-label="复杂业务系统">
        <WorkPreview
          id="sales-lead"
          href={`${base}projects/sales-lead-slm/`}
          eyebrow="复杂业务系统"
          title="销售线索管理"
          summary="从动态匹配到责任链重构，让线索真正到达合适的门店。"
          visualId="sales-lead-sanitized"
          variant="strip"
        />
        <WorkPreview
          id="smart-parking"
          href={`${base}projects/smart-parking/`}
          eyebrow="复杂业务系统"
          title="智慧停车系统"
          summary="从外包黑盒到自有体系，重新获得产品定义权和演进能力。"
          visualCaption="内部业务、停车服务、中台、适配器与停车场的产品分层。"
          variant="strip"
        >
          <ParkingLayersPreview slot="visual" />
        </WorkPreview>
      </div>
    </div>
  </div>
</section>

<style>
  .selected-work { padding-top: 72px; background: linear-gradient(180deg, var(--bg) 0%, var(--bg-soft) 100%); }
  .section-heading { display: grid; gap: .7rem; max-width: 720px; margin-bottom: 2rem; }
  .section-heading > span { color: var(--accent); font-size: .78rem; font-weight: 750; letter-spacing: .12em; }
  .section-heading h2 { font-size: clamp(1.9rem, 4vw, 3.2rem); }
  .section-heading p { color: var(--muted); font-size: 1rem; }
  .selected-grid { display: grid; grid-template-columns: minmax(0, 1.9fr) minmax(300px, .92fr); grid-template-areas: "feature support" "business support"; gap: 1.25rem; align-items: stretch; }
  .selected-grid > :global(.feature) { grid-area: feature; }
  .selected-grid > :global(.support) { grid-area: support; }
  .business-pair { grid-area: business; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.25rem; }
  @media (max-width: 960px) {
    .selected-grid { grid-template-columns: minmax(0, 1fr); grid-template-areas: "feature" "support" "business"; }
    .business-pair { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (max-width: 640px) {
    .selected-work { padding-top: 56px; }
    .business-pair { grid-template-columns: minmax(0, 1fr); }
  }
</style>
```

- [ ] **Step 7: Shorten the Hero and insert the new section**

In `src/components/Banner.astro`, replace:

```astro
<a class="scroll" href="#main" aria-label="向下滚动">↓</a>
```

with:

```astro
<a class="scroll" href="#selected-work" aria-label="查看精选工作">↓</a>
```

Replace the `.banner` height rule with:

```css
.banner {
  position: relative;
  min-height: clamp(560px, 72vh, 720px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 24px 40px;
}
```

Add this mobile rule inside the component style:

```css
@media (max-width: 640px) {
  .banner { min-height: min(680px, calc(100svh - 60px)); padding-top: 40px; }
}
```

In `src/pages/index.astro`, add:

```astro
import SelectedWork from '../components/home/SelectedWork.astro';
```

and render it between `<Banner />` and `<SectionGrid ... />`:

```astro
<Banner />
<SelectedWork />
<SectionGrid title="作品与思考" items={sections} />
```

- [ ] **Step 8: Run functional and type checks**

```bash
npm run check
npm run test:e2e -- e2e/home.spec.ts
```

Expected: 0 Astro errors; all homepage tests pass.

- [ ] **Step 9: Capture and inspect homepage visual evidence**

```bash
npm run test:e2e -- e2e/visual.spec.ts --grep "shot / desktop light|shot / mobile light"
```

Expected: screenshots exist under `test-results/`. Open the desktop and mobile PNGs with the image viewer and verify AI hierarchy, no equal four-card grid, no fake metrics, and the original “作品与思考” remains below.

- [ ] **Step 10: Commit the homepage increment**

```bash
git add -- src/components/Banner.astro src/components/home/WorkPreview.astro src/components/home/SelectedWork.astro src/components/home/KnowledgeSystemPreview.astro src/components/site/ParkingLayersPreview.astro src/pages/index.astro e2e/home.spec.ts
git diff --cached --check
git commit -m "feat: add selected work to live homepage"
```

Expected: homepage-only code and its contract test are committed.

## 4. Project index increment

### Task 4: Replace only two abstract project covers

> **Deferred execution:** Read this task here, but execute it only after Task 7 and after the homepage/S6 visual checks named in the Plan header have passed.

**Files:**
- Modify: `src/components/Card.astro`
- Modify: `src/components/SectionGrid.astro`
- Modify: `src/pages/projects/index.astro`
- Modify test: `e2e/sections.spec.ts`
- Create visual test: `e2e/project-index.visual.spec.ts`

- [ ] **Step 1: Write the failing project-cover contract**

Append to `e2e/sections.spec.ts`:

```ts
test('project index replaces only sales lead and parking covers', async ({ page }) => {
  await page.goto('/projects/');
  const cards = page.locator('.grid a.card');
  await expect(cards).toHaveCount(5);
  await expect(cards.locator('[data-card-media]')).toHaveCount(2);
  await expect(cards.nth(0).locator('img')).toHaveAttribute('alt', /销售线索管理界面/);
  await expect(cards.nth(1).locator('[data-system-preview="parking-layers"]')).toHaveAttribute('aria-label', /停车服务|停车场/);
  await expect(cards.nth(2).locator('img')).toHaveCount(0);
  await expect(cards.nth(3).locator('img')).toHaveCount(0);
  await expect(cards.nth(4).locator('img')).toHaveCount(0);
});
```

- [ ] **Step 2: Run the test and verify RED**

```bash
npm run test:e2e -- e2e/sections.spec.ts
```

Expected: baseline reachability tests pass; the new test fails because no card has `[data-card-media]`.

- [ ] **Step 3: Extend Card without changing its existing API behavior**

Replace the complete frontmatter block at the top of `src/components/Card.astro`—from the opening `---` through the closing `---`—with:

```astro
---
import ParkingLayersPreview from './site/ParkingLayersPreview.astro';
interface CardMedia { src: string; alt: string; width: number; height: number; position?: string; }
interface Props {
  title: string;
  hook?: string;
  tags?: string[];
  href?: string;
  cover?: string;
  media?: CardMedia;
  diagram?: 'parking-layers';
}
const { title, hook = '', tags = [], href, cover, media, diagram } = Astro.props;
const Tag = href ? 'a' : 'div';
---
```

Replace the cover markup with:

```astro
<div
  class:list={['cover', (media || diagram) && 'evidence-cover']}
  style={!media && !diagram && cover ? `background:${cover}` : undefined}
  data-card-media={(media || diagram) ? '' : undefined}
>
  {media && <img src={media.src} alt={media.alt} width={media.width} height={media.height} loading="lazy" style={`object-position:${media.position ?? 'center'}`} />}
  {diagram === 'parking-layers' && <ParkingLayersPreview />}
  <span class="shine"></span>
</div>
```

Add these rules after `.cover` in the component style:

```css
.cover.evidence-cover { height: 104px; padding: .25rem; background: var(--bg-soft); }
.cover img { width: 100%; height: 100%; object-fit: cover; background: var(--bg-soft); }
.cover :global([data-system-preview]) { min-height: 0; height: 100%; }
.cover[data-card-media]::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 55%, rgba(15, 23, 42, .16)); pointer-events: none; }
```

- [ ] **Step 4: Pass the optional media through SectionGrid**

Replace the `Item` interface in `src/components/SectionGrid.astro` with:

```ts
interface Item {
  title: string;
  hook?: string;
  tags?: string[];
  href?: string;
  cover?: string;
  media?: { src: string; alt: string; width: number; height: number; position?: string };
  diagram?: 'parking-layers';
}
```

No markup change is needed because `<Card {...it} />` already forwards the property.

- [ ] **Step 5: Bind only the first two projects to approved evidence visuals**

At the top of `src/pages/projects/index.astro`, add:

```astro
import { getPortfolioVisual } from '../../data/portfolioVisuals';
const salesVisual = getPortfolioVisual('sales-lead-sanitized');
```

Replace the first item’s `cover` line with:

```ts
media: { src: salesVisual.src, alt: salesVisual.alt, width: salesVisual.width, height: salesVisual.height, position: 'top left' },
```

Replace the second item’s `cover` line with:

```ts
diagram: 'parking-layers' as const,
```

Do not alter the remaining three items.

- [ ] **Step 6: Add deterministic desktop and mobile visual captures**

Create `e2e/project-index.visual.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

for (const viewport of [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 390, height: 844 },
] as const) {
  test(`project index ${viewport.name} visual`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => localStorage.setItem('theme', 'light'));
    await page.goto('/projects/');
    await page.addStyleTag({ content: 'astro-dev-toolbar { display: none !important; } *, *::before, *::after { animation: none !important; transition: none !important; }' });
    await expect(page).toHaveScreenshot(`project-index-${viewport.name}.png`, { fullPage: true, animations: 'disabled' });
  });
}
```

- [ ] **Step 7: Run tests and deliberately create the new visual baseline**

```bash
npm run check
npm run test:e2e -- e2e/sections.spec.ts
npm run test:e2e -- e2e/project-index.visual.spec.ts --update-snapshots
npm run test:e2e -- e2e/project-index.visual.spec.ts
```

Expected: functional tests pass; two snapshot PNGs are created and then pass without update mode. Inspect both PNGs before staging; verify only the first two covers changed.

- [ ] **Step 8: Commit the project index increment**

```bash
git add -- src/components/Card.astro src/components/SectionGrid.astro src/pages/projects/index.astro e2e/sections.spec.ts e2e/project-index.visual.spec.ts e2e/project-index.visual.spec.ts-snapshots
git diff --cached --check
git commit -m "feat: add real evidence to two project covers"
```

Expected: no commercial detail page or remaining cover is staged.

## 5. Knowledge Harness data and visuals

### Task 5: Freeze the four validation runs in one typed data source

**Files:**
- Create: `src/data/knowledgeHarnessValidation.ts`
- Create test: `e2e/knowledge-harness-validation-data.spec.ts`

- [ ] **Step 1: Write the failing data-contract test**

Create `e2e/knowledge-harness-validation-data.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import { v2ValidationRuns, v15ValidationRuns } from '../src/data/knowledgeHarnessValidation';

test('four frozen validation runs keep exact public facts', () => {
  expect(v2ValidationRuns).toEqual([
    expect.objectContaining({ id: 'v2-1', baselineScore: '16/20', candidateScore: '8/20', state: 'fail' }),
    expect.objectContaining({ id: 'v2-2', baselineScore: '18/20', candidateScore: '16/20', state: 'no-cutover' }),
  ]);
  expect(v15ValidationRuns).toEqual([
    expect.objectContaining({ id: 'v15-1', candidateScore: '11/20', failures: 9, state: 'fail' }),
    expect.objectContaining({ id: 'v15-2', candidateScore: '20/20', failures: 0, state: 'incomplete' }),
  ]);
  expect(JSON.stringify([...v2ValidationRuns, ...v15ValidationRuns])).not.toContain('/Users/');
});
```

- [ ] **Step 2: Run the data test and verify RED**

```bash
npm run test:e2e -- e2e/knowledge-harness-validation-data.spec.ts
```

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Create the frozen data module**

Create `src/data/knowledgeHarnessValidation.ts`:

```ts
export type ValidationState = 'fail' | 'no-cutover' | 'incomplete';

export type ValidationMetric = {
  readonly label: string;
  readonly value: string;
};

export type ValidationRun = {
  readonly id: 'v2-1' | 'v2-2' | 'v15-1' | 'v15-2';
  readonly version: 'V2' | 'V1.5';
  readonly round: 1 | 2;
  readonly label: string;
  readonly reportTitle: string;
  readonly sample: string;
  readonly baselineLabel?: 'V1';
  readonly baselineScore?: string;
  readonly candidateScore: string;
  readonly failures?: number;
  readonly metrics: readonly ValidationMetric[];
  readonly state: ValidationState;
  readonly decision: string;
  readonly sourceRef: 'v2-offline-20260719' | 'v2-offline-20260726' | 'v15-retrieval-contract-v1' | 'v15-retrieval-coverage-repair-v1';
};

export const v2ValidationRuns: readonly ValidationRun[] = [
  {
    id: 'v2-1', version: 'V2', round: 1, label: '第一次验证', reportTitle: 'V2 影子实验评测报告（轮次 1）', sample: '20 组同题',
    baselineLabel: 'V1', baselineScore: '16/20', candidateScore: '8/20',
    metrics: [{ label: '上下文精度', value: '31.9%' }, { label: '必需角色覆盖', value: '1/20' }],
    state: 'fail', decision: '扩展方案明显退化，返回检索与覆盖返修。', sourceRef: 'v2-offline-20260719',
  },
  {
    id: 'v2-2', version: 'V2', round: 2, label: '第二次验证', reportTitle: 'V2 影子实验评测报告（轮次 2）', sample: '20 组同题',
    baselineLabel: 'V1', baselineScore: '18/20', candidateScore: '16/20',
    metrics: [{ label: '上下文相关性', value: '87.2%' }, { label: '必需角色覆盖', value: '19/20' }, { label: '完成输出回归', value: '6 个' }],
    state: 'no-cutover', decision: '差距缩小，但 activation=false，V2 保持 Shadow。', sourceRef: 'v2-offline-20260726',
  },
] as const;

export const v15ValidationRuns: readonly ValidationRun[] = [
  {
    id: 'v15-1', version: 'V1.5', round: 1, label: '第一次检索验证', reportTitle: 'V1.5 冻结检索契约（轮次 1）', sample: '20 题',
    candidateScore: '11/20', failures: 9,
    metrics: [{ label: '契约失败', value: '9 题' }, { label: 'Gate', value: 'fail' }],
    state: 'fail', decision: '候选和覆盖判断未满足冻结 Gold，返回修复。', sourceRef: 'v15-retrieval-contract-v1',
  },
  {
    id: 'v15-2', version: 'V1.5', round: 2, label: '第二次检索验证', reportTitle: 'V1.5 覆盖返修验证（轮次 2）', sample: '20 题',
    candidateScore: '20/20', failures: 0,
    metrics: [{ label: '契约失败', value: '0 题' }, { label: 'Gate', value: 'incomplete' }],
    state: 'incomplete', decision: '纯检索契约通过；模型答案与人工盲评尚未形成最终结论。', sourceRef: 'v15-retrieval-coverage-repair-v1',
  },
] as const;
```

- [ ] **Step 4: Run the data contract and commit**

```bash
npm run test:e2e -- e2e/knowledge-harness-validation-data.spec.ts
npm run check
git add -- src/data/knowledgeHarnessValidation.ts e2e/knowledge-harness-validation-data.spec.ts
git diff --cached --check
git commit -m "test: freeze knowledge harness validation facts"
```

Expected: the data test passes and no local absolute path is published.

### Task 6: Build the confirmed V2 architecture, two-report and no-cutover screen

**Files:**
- Create: `src/components/knowledge-harness/V2Architecture.astro`
- Create: `src/components/knowledge-harness/ValidationReportExcerpt.astro`
- Create: `src/components/knowledge-harness/ValidationDecisionFlow.astro`
- Modify: `src/components/knowledge-harness/DiagramFrame.astro`
- Modify: `src/components/knowledge-harness/V2ShadowRuntime.astro`
- Modify: `src/components/knowledge-harness/EvaluationActivationGate.astro`
- Modify: `src/data/knowledgeHarness.ts`
- Modify: `src/pages/ai/knowledge-harness.astro`
- Modify test: `e2e/knowledge-harness.spec.ts`
- Update snapshots: S5 and S6 only

- [ ] **Step 1: Add failing V2 evidence assertions**

Append to `e2e/knowledge-harness.spec.ts`:

```ts
test('V2 evaluation connects five architecture layers, two reports and the no-cutover decision', async ({ page }) => {
  await page.goto('/ai/knowledge-harness/#s6');
  const section = page.locator('#s6');
  await expect(section.locator('[data-architecture-layer]')).toHaveCount(5);
  await expect(section.locator('[data-validation-timeline] li')).toHaveCount(2);
  await expect(section.locator('[data-validation-report="v2-1"]')).toContainText('V1 16/20');
  await expect(section.locator('[data-validation-report="v2-1"]')).toContainText('V2 8/20');
  await expect(section.locator('[data-validation-report="v2-2"]')).toContainText('V1 18/20');
  await expect(section.locator('[data-validation-report="v2-2"]')).toContainText('V2 16/20');
  await expect(section).toContainText('31.9%');
  await expect(section).toContainText('87.2%');
  await expect(section).toContainText('activation=false');
  await expect(section).toContainText('V2 保持 Shadow');
  await expect(section).toContainText('有效机制收敛进 V1.5');
});

test('Knowledge Harness keeps eight chapters and does not publish the ongoing three-way blind test', async ({ page }) => {
  await page.goto('/ai/knowledge-harness/');
  await expect(page.locator('main#deck section')).toHaveCount(8);
  await expect(page.locator('nav.timeline a[data-t]')).toHaveCount(8);
  const body = await page.locator('body').innerText();
  expect(body).not.toContain('三版本赢家');
  expect(body).not.toContain('三版本排名');
  expect(body).not.toContain('正在盲测');
});
```

- [ ] **Step 2: Run the new V2 tests and verify RED**

```bash
npm run test:e2e -- e2e/knowledge-harness.spec.ts --grep "V2 evaluation|keeps eight chapters"
```

Expected: eight-chapter assertion passes; architecture/report assertions fail.

- [ ] **Step 3: Create the five-layer architecture component**

Create `src/components/knowledge-harness/V2Architecture.astro`:

```astro
---
const layers = [
  ['Task & Profile', '任务意图解析 · 角色画像 · 门票元数据', '查询需求结构'],
  ['Query Planning', 'Query Planner · RoleRetriever', '优化检索计划'],
  ['Retrieval & Ranking', 'Exact · Lexical · Metadata · RRF · Reranker', '候选内容列表'],
  ['Quality Gate & Conflict Handling', '去重 · 冲突分组 · Selector · Quality Gate', '审查与失败处理'],
  ['Context-Pack & RetrievalTrace', 'Composer · Renderer · 选择原因与门禁记录', '上下文包与追踪'],
] as const;
---

<div class="v2-architecture" aria-label="V2 影子实验的五层架构">
  {layers.map(([title, mechanism, output], index) => (
    <div class:list={['architecture-layer', index === 3 && 'gate-layer', index === 4 && 'trace-layer']} data-architecture-layer>
      <b>{title}</b><span>{mechanism}</span><em>{output}</em>
    </div>
  ))}
  <div class="budget-strip" aria-label="V2 六千 Token 五区预算">
    <span>Envelope <b>300</b></span>
    <span>Current Task <b>1,400</b></span>
    <span>Control <b>800</b></span>
    <span>Formal + Legacy <b>2,600</b></span>
    <span>Evidence <b>900</b></span>
    <strong>硬上限 6,000 Token</strong>
  </div>
</div>

<style>
  .v2-architecture { display: grid; gap: .42rem; }
  .architecture-layer { display: grid; grid-template-columns: minmax(170px, .78fr) minmax(240px, 1.35fr) minmax(120px, .7fr); gap: .75rem; align-items: center; padding: .55rem .7rem; border: 1px solid rgba(79, 140, 255, .34); border-radius: .55rem; background: rgba(79, 140, 255, .055); }
  .architecture-layer b { font-size: .72rem; }
  .architecture-layer span { color: var(--text-dim); font-size: .62rem; }
  .architecture-layer em { justify-self: stretch; padding: .34rem .45rem; border: 1px dashed var(--c-cyan); border-radius: .45rem; color: var(--text-dim); font-size: .6rem; font-style: normal; text-align: center; }
  .gate-layer { border-color: rgba(245, 158, 11, .48); background: rgba(245, 158, 11, .055); }
  .gate-layer em { border-color: #f59e0b; }
  .trace-layer { border-color: rgba(139, 92, 246, .4); background: rgba(139, 92, 246, .06); }
  .budget-strip { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: .3rem; padding-top: .1rem; }
  .budget-strip span, .budget-strip strong { display: grid; gap: .08rem; align-content: center; min-width: 0; padding: .3rem .24rem; border: 1px solid var(--glass-border); border-radius: .42rem; color: var(--text-dim); font-size: .5rem; text-align: center; }
  .budget-strip b, .budget-strip strong { color: var(--text); }
  .budget-strip strong { border-color: rgba(245, 158, 11, .48); }
  @media (max-width: 650px) {
    .architecture-layer { grid-template-columns: minmax(0, 1fr); gap: .22rem; }
    .architecture-layer em { justify-self: stretch; }
    .budget-strip { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
</style>
```

- [ ] **Step 4: Create the report excerpt component**

Create `src/components/knowledge-harness/ValidationReportExcerpt.astro`:

```astro
---
import type { ValidationRun } from '../../data/knowledgeHarnessValidation';
interface Props { run: ValidationRun; }
const { run } = Astro.props;
---

<article class:list={['report-excerpt', run.state]} data-validation-report={run.id}>
  <header><span>{run.label}</span><b>{run.reportTitle}</b><small>{run.sample}</small></header>
  <div class="score-row">
    {run.baselineLabel && <span>{run.baselineLabel} <strong>{run.baselineScore}</strong></span>}
    <span>{run.version} <strong>{run.candidateScore}</strong></span>
  </div>
  <dl>
    {run.metrics.map((metric) => <div><dt>{metric.label}</dt><dd>{metric.value}</dd></div>)}
  </dl>
  <p>{run.decision}</p>
</article>

<style>
  .report-excerpt { position: relative; display: grid; gap: .45rem; min-width: 0; padding: .7rem .75rem .78rem; color: var(--text); background: color-mix(in srgb, var(--bg) 18%, var(--glass)); border: 1px solid var(--glass-border); border-radius: .35rem .35rem .75rem .35rem; box-shadow: 0 10px 22px rgba(15, 23, 42, .11); }
  .report-excerpt::before { content: ''; position: absolute; left: .45rem; top: -.22rem; width: .38rem; height: 1rem; border: 1px solid var(--text-dim); border-radius: .25rem; opacity: .55; }
  header { display: grid; gap: .12rem; padding-bottom: .36rem; border-bottom: 1px solid var(--glass-border); }
  header span { color: var(--c-blue); font-size: .58rem; font-weight: 750; }
  header b { font-size: .68rem; }
  header small { color: var(--text-dim); font-size: .54rem; }
  .score-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(90px, 1fr)); gap: .35rem; }
  .score-row span { padding: .28rem .38rem; background: rgba(79, 140, 255, .06); border-radius: .35rem; color: var(--text-dim); font-size: .57rem; }
  .score-row strong { color: var(--text); font-size: .7rem; }
  dl { display: grid; gap: .2rem; }
  dl div { display: flex; justify-content: space-between; gap: .5rem; font-size: .56rem; }
  dt { color: var(--text-dim); } dd { font-weight: 700; }
  p { color: var(--text-dim); font-size: .54rem; line-height: 1.4; }
  .fail { border-top: 2px solid #f59e0b; }
  .no-cutover { border-top: 2px solid var(--c-cyan); }
  .incomplete { border-top: 2px solid var(--c-violet); }
</style>
```

- [ ] **Step 5: Create the decision flow**

Create `src/components/knowledge-harness/ValidationDecisionFlow.astro`:

```astro
<div class="decision-flow" aria-label="V2 验证后的不切流决策">
  <div class="kh-node shadow">V2 保持 Shadow</div>
  <div class="kh-arrow" aria-hidden="true">←</div>
  <div class="kh-node gate"><b>不切流</b><small>activation=false</small></div>
  <div class="kh-arrow" aria-hidden="true">→</div>
  <div class="kh-node verified">有效机制收敛进 V1.5</div>
</div>

<style>
  .decision-flow { display: grid; grid-template-columns: 1fr auto 1.1fr auto 1.2fr; gap: .45rem; align-items: center; }
  .decision-flow b { color: #f59e0b; font-size: .9rem; }
  @media (max-width: 650px) {
    .decision-flow { grid-template-columns: minmax(0, 1fr); }
    .decision-flow .kh-arrow { transform: rotate(90deg); }
  }
</style>
```

- [ ] **Step 6: Add an evidence-canvas variant to DiagramFrame**

In `src/components/knowledge-harness/DiagramFrame.astro`, extend Props and class binding:

```ts
interface Props {
  visualId: HarnessVisualId;
  title: string;
  ariaLabel: string;
  caption: string;
  legend: readonly LegendItem[];
  variant?: 'standard' | 'evidence';
}
const { visualId, title, ariaLabel, caption, legend, variant = 'standard' } = Astro.props;
```

```astro
<figure class:list={['figure', 'kh-frame', variant]} data-visual={visualId} aria-label={ariaLabel}>
```

Add:

```css
.kh-frame.evidence { width: min(100%, 860px); padding: 1rem 1.05rem .85rem; }
.kh-frame.evidence .diagram-labels { min-height: 0; }
```

- [ ] **Step 7: Make S5 a hypothesis lead-in instead of a duplicate architecture**

Replace the body of `V2ShadowRuntime.astro` inside its `DiagramFrame` slot with:

```astro
<div class="v2-hypothesis">
  <div class="growth-signals"><span>知识角色增加</span><span>跨项目材料增加</span><span>文件长度波动</span></div>
  <div class="kh-arrow">↓</div>
  <div class="kh-node stable">V1 stable<small>继续服务真实任务</small></div>
  <div class="kh-arrow">＋ 影子旁路</div>
  <div class="kh-node shadow">V2 Shadow hypothesis<small>先验证检索、排序、质量门与可观察性</small></div>
</div>
```

Replace its component style with:

```css
.v2-hypothesis { display: grid; gap: .55rem; justify-items: center; }
.growth-signals { width: 100%; display: grid; grid-template-columns: repeat(3, 1fr); gap: .45rem; }
.growth-signals span { padding: .5rem; border: 1px solid var(--glass-border); border-radius: .55rem; color: var(--text-dim); font-size: .64rem; text-align: center; }
.v2-hypothesis .kh-node { width: min(100%, 390px); }
@media (max-width: 620px) { .growth-signals { grid-template-columns: 1fr; } }
```

Keep its existing `visualId="v2-shadow-runtime"`, legend and caption so the eight-chapter contract stays stable.

- [ ] **Step 8: Replace S6 with the confirmed evidence canvas**

Replace `src/components/knowledge-harness/EvaluationActivationGate.astro` with:

```astro
---
import DiagramFrame from './DiagramFrame.astro';
import V2Architecture from './V2Architecture.astro';
import ValidationReportExcerpt from './ValidationReportExcerpt.astro';
import ValidationDecisionFlow from './ValidationDecisionFlow.astro';
import { v2ValidationRuns } from '../../data/knowledgeHarnessValidation';
const legend = [
  { tone: 'shadow', label: 'V2：影子实验' },
  { tone: 'gate', label: '激活门：未通过' },
  { tone: 'stable', label: 'V1：生产基线保持' },
] as const;
---

<DiagramFrame
  visualId="evaluation-activation-gate"
  title="V2 影子实验的分层链路与两轮报告"
  ariaLabel="V2 五层架构经过两轮验证后未通过激活门，保持 Shadow 并把有效机制收敛进 V1.5"
  caption="工程完整度不是切流理由；两轮报告均来自冻结评测，本页只解释当时的不切流决策。"
  {legend}
  variant="evidence"
>
  <div class="evaluation-canvas">
    <V2Architecture />
    <div class="validation-band">
      <ol class="validation-timeline" data-validation-timeline aria-label="V2 两轮验证时间线">
        {v2ValidationRuns.map((run) => (
          <li><span>{run.label}</span><b>{run.candidateScore}</b><small>{run.decision}</small></li>
        ))}
      </ol>
      <div class="report-pair">{v2ValidationRuns.map((run) => <ValidationReportExcerpt {run} />)}</div>
    </div>
    <ValidationDecisionFlow />
  </div>
</DiagramFrame>

<style>
  .evaluation-canvas { display: grid; gap: .65rem; }
  .validation-band { display: grid; grid-template-columns: minmax(120px, .34fr) minmax(0, 1.66fr); gap: .75rem; padding-top: .55rem; border-top: 1px dashed var(--glass-border); }
  .validation-timeline { position: relative; display: grid; align-content: space-around; gap: .7rem; margin: 0; padding: 0 0 0 1rem; list-style: none; }
  .validation-timeline::before { content: ''; position: absolute; left: .28rem; top: .4rem; bottom: .4rem; border-left: 1px dashed var(--c-blue); }
  .validation-timeline li { position: relative; display: grid; gap: .12rem; color: var(--text-dim); }
  .validation-timeline li::before { content: ''; position: absolute; left: -1rem; top: .25rem; width: .5rem; height: .5rem; border: 2px solid var(--bg); border-radius: 50%; background: var(--c-blue); box-shadow: 0 0 0 1px var(--c-blue); }
  .validation-timeline span { color: var(--c-blue); font-size: .56rem; font-weight: 700; }
  .validation-timeline b { color: var(--text); font-size: .72rem; }
  .validation-timeline small { font-size: .5rem; line-height: 1.35; }
  .report-pair { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .75rem; }
  @media (max-width: 650px) {
    .validation-band, .report-pair { grid-template-columns: minmax(0, 1fr); }
    .validation-timeline { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
</style>
```

- [ ] **Step 9: Update only S5/S6 narrative and page-local width rules**

In `src/data/knowledgeHarness.ts`, replace S5 narrative with:

```ts
narrative: [
  { label: '规模信号', body: '知识角色、跨项目材料和文件长度同时增长，V1 的文件数量控制开始出现波动。', tone: 'problem' },
  { label: '实验假设', body: '用更强的检索、排序、质量门和 RetrievalTrace 验证规模化能力，但不直接接管生产流量。', tone: 'thinking' },
  { label: '状态', body: 'V1 保持 stable，V2 只作为 Shadow 旁路进入同题验证。', tone: 'status' },
],
```

Replace S6 heading and narrative with:

```ts
heading: '工程能力更完整，为什么仍然没有切流？',
narrative: [
  { label: '事实', body: 'V2 把查找、排序、冲突处理与组装拆成可观察的分层链路。', tone: 'thinking' },
  { label: '验证', body: '第一次明显退化；第二次返修缩小差距，但仍有 6 个完成输出回归。', tone: 'result' },
  { label: '决策', body: 'activation=false：保留 V1 生产基线，V2 保持 Shadow，把有效机制收敛进 V1.5。', tone: 'decision' },
],
```

In the scoped style of `src/pages/ai/knowledge-harness.astro`, add:

```css
#s6 .enterprise-split { width: min(1320px, 100%); grid-template-columns: minmax(270px, .62fr) minmax(620px, 1.58fr); gap: clamp(1.4rem, 3vw, 3rem); }
@media (max-width: 1080px) {
  #s6 .enterprise-split { grid-template-columns: minmax(250px, .66fr) minmax(520px, 1.34fr); }
}
@media (max-width: 860px) {
  #s6 .enterprise-split { grid-template-columns: minmax(0, 1fr); }
}
@media (min-width: 861px) and (max-height: 860px) {
  #s6 { height: auto; min-height: 100vh; justify-content: flex-start; padding-top: 4.1rem; }
}
```

- [ ] **Step 10: Run V2 functional, overflow and fact tests**

```bash
npm run check
npm run test:e2e -- e2e/knowledge-harness-validation-data.spec.ts e2e/knowledge-harness.spec.ts
```

Expected: all tests pass; eight sections and seven visual IDs remain; desktop/mobile overflow test remains green.

- [ ] **Step 11: Update and inspect only S5/S6 visual baselines**

```bash
npm run test:e2e -- e2e/knowledge-harness.visual.spec.ts --grep "s5|s6" --update-snapshots
npm run test:e2e -- e2e/knowledge-harness.visual.spec.ts --grep "s5|s6"
```

Expected: four affected PNGs pass after update. Inspect S5/S6 desktop and mobile images; verify the report numbers are legible, architecture is not a generic card grid, and the decision path is visible without relying only on color.

- [ ] **Step 12: Commit the V2 evidence screen**

```bash
git add -- src/data/knowledgeHarness.ts src/components/knowledge-harness/DiagramFrame.astro src/components/knowledge-harness/V2ShadowRuntime.astro src/components/knowledge-harness/V2Architecture.astro src/components/knowledge-harness/ValidationReportExcerpt.astro src/components/knowledge-harness/ValidationDecisionFlow.astro src/components/knowledge-harness/EvaluationActivationGate.astro src/pages/ai/knowledge-harness.astro e2e/knowledge-harness.spec.ts e2e/knowledge-harness.visual.spec.ts-snapshots
git diff --cached --check
git commit -m "feat: connect V2 architecture to validation decisions"
```

Expected: S5/S6 code, tests and only their affected snapshots are committed.

### Task 7: Add the two V1.5 retrieval validations without publishing the blind test

**Files:**
- Create: `src/components/knowledge-harness/V15Convergence.astro`
- Modify: `src/components/knowledge-harness/V15ProfileRuntime.astro`
- Modify: `src/data/knowledgeHarness.ts`
- Modify test: `e2e/knowledge-harness.spec.ts`
- Update snapshots: S7 desktop and mobile only

- [ ] **Step 1: Add failing V1.5 evidence assertions**

Append to `e2e/knowledge-harness.spec.ts`:

```ts
test('V1.5 shows two retrieval validations while keeping the overall result incomplete', async ({ page }) => {
  await page.goto('/ai/knowledge-harness/#s7');
  const section = page.locator('#s7');
  await expect(section.locator('[data-validation-report="v15-1"]')).toContainText('V1.5 11/20');
  await expect(section.locator('[data-validation-report="v15-1"]')).toContainText('9 题');
  await expect(section.locator('[data-validation-report="v15-2"]')).toContainText('V1.5 20/20');
  await expect(section.locator('[data-validation-report="v15-2"]')).toContainText('0 题');
  await expect(section).toContainText('Gate incomplete');
  await expect(section).toContainText('模型答案与人工盲评尚未形成最终结论');
  await expect(section).not.toContainText('三版本赢家');
});
```

- [ ] **Step 2: Run the V1.5 test and verify RED**

```bash
npm run test:e2e -- e2e/knowledge-harness.spec.ts --grep "V1.5 shows"
```

Expected: FAIL because no V1.5 report excerpts are rendered.

- [ ] **Step 3: Extract the two-stage runtime into V15Convergence**

Create `src/components/knowledge-harness/V15Convergence.astro`:

```astro
---
const quality = [['弱相关', '不加载'], ['冲突', '保留冲突组'], ['过期', '标记复核'], ['关键缺失', 'insufficient / escalation']] as const;
---

<div class="v15-convergence" aria-label="V1.5 Profile 驱动的两阶段运行结构">
  <div class="main-flow"><div class="kh-node orchestrator">Task</div><div class="kh-arrow">→</div><div class="kh-node verified">Profile<small>任务 · 角色 · 知识边界</small></div><div class="kh-arrow">→</div><div class="kh-node shadow">阶段一：查找候选<small>可替换检索接口</small></div><div class="kh-arrow">→</div><div class="kh-node gate">阶段二：审查与组装<small>RetrievalTrace</small></div><div class="kh-arrow">→</div><div class="kh-node verified">Context-Pack</div></div>
  <div class="compact-flow"><div class="kh-node orchestrator">Task → Profile<small>任务 · 角色 · 知识边界</small></div><div class="kh-arrow">↓</div><div class="kh-node shadow">阶段一：查找候选<small>可替换检索接口</small></div><div class="kh-arrow">↓</div><div class="kh-node gate">阶段二：审查与组装 → Context-Pack<small>RetrievalTrace</small></div></div>
  <div class="quality-grid">{quality.map(([input, output]) => <div><b>{input}</b><span>{output}</span></div>)}</div>
  <div class="budget-gate"><span>6,000 Token 安全硬上限</span><b>同题评测：工作价值不降低 · 中位数低于 V2 · P90 低于 V2</b><em>满足后再决定是否下调</em></div>
</div>

<style>
  .v15-convergence { display: grid; gap: .5rem; }
  .compact-flow { display: none; }
  .main-flow { display: grid; grid-template-columns: .6fr auto .8fr auto 1fr auto 1fr auto .8fr; gap: .3rem; align-items: stretch; }
  .main-flow .kh-node { display: grid; place-content: center; padding: .45rem .3rem; }
  .quality-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: .32rem; }
  .quality-grid div { display: grid; gap: .1rem; padding: .35rem; border: 1px solid var(--glass-border); border-radius: .5rem; text-align: center; }
  .quality-grid b { font-size: .6rem; }
  .quality-grid span { color: var(--text-dim); font-size: .52rem; }
  .budget-gate { display: grid; gap: .14rem; padding: .45rem; border: 1px dashed #f59e0b; border-radius: .65rem; text-align: center; }
  .budget-gate span, .budget-gate em { color: var(--text-dim); font-size: .55rem; font-style: normal; }
  .budget-gate b { font-size: .62rem; }
  @media (max-width: 650px) {
    .main-flow { display: none !important; }
    .compact-flow { display: grid !important; gap: .18rem; }
    .compact-flow .kh-arrow { transform: none; line-height: .9; }
    .compact-flow .kh-node { padding: .34rem; }
    .quality-grid { grid-template-columns: repeat(2, 1fr); }
  }
</style>
```

- [ ] **Step 4: Compose V1.5 runtime, reports and incomplete state**

Replace `src/components/knowledge-harness/V15ProfileRuntime.astro` with:

```astro
---
import DiagramFrame from './DiagramFrame.astro';
import V15Convergence from './V15Convergence.astro';
import ValidationReportExcerpt from './ValidationReportExcerpt.astro';
import { v15ValidationRuns } from '../../data/knowledgeHarnessValidation';
const legend = [
  { tone: 'stable', label: '保留：V1 有效性' },
  { tone: 'shadow', label: '吸收：V2 可扩展接口' },
  { tone: 'gate', label: '门禁：待同题评测后再下调预算' },
] as const;
---

<DiagramFrame
  visualId="v15-profile-runtime"
  title="Profile 驱动的两阶段 V1.5 与两轮检索验证"
  ariaLabel="V1.5 先按 Profile 固定任务、角色与知识边界，再经过候选查找与审查组装；两轮纯检索验证由十一分进展到二十分，但整体门禁仍未完成"
  caption="V1.5 保留 6,000 Token 安全硬上限；20/20 只表示第二轮纯检索契约通过，不代表整体工作价值或生产切流已经验证。"
  {legend}
  variant="evidence"
>
  <div class="v15-profile-evidence">
    <V15Convergence />
    <div class="v15-report-pair" aria-label="V1.5 两轮检索验证">
      {v15ValidationRuns.map((run) => <ValidationReportExcerpt {run} />)}
    </div>
    <div class="v15-status"><b>Gate incomplete</b><span>纯检索契约通过；模型答案与人工盲评尚未形成最终结论。</span></div>
  </div>
</DiagramFrame>

<style>
  .v15-profile-evidence { display: grid; gap: .65rem; }
  .v15-report-pair { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .65rem; padding-top: .45rem; border-top: 1px dashed var(--glass-border); }
  .v15-status { display: flex; gap: .5rem; align-items: baseline; justify-content: center; padding: .4rem .55rem; border: 1px dashed var(--c-violet); border-radius: .55rem; }
  .v15-status b { color: var(--c-violet); font-size: .65rem; }
  .v15-status span { color: var(--text-dim); font-size: .58rem; }
  @media (max-width: 650px) {
    .v15-report-pair { grid-template-columns: minmax(0, 1fr); }
    .v15-status { display: grid; text-align: center; }
  }
</style>
```

- [ ] **Step 5: Update the S7 narrative without exposing a three-version result**

Replace S7 narrative in `src/data/knowledgeHarness.ts` with:

```ts
narrative: [
  { label: '收敛', body: 'V1.5 保留人工权威索引，用 Profile 固定任务、角色与知识边界，再分两阶段查找和审查组装。', tone: 'decision' },
  { label: '返修', body: '第一次冻结检索契约只通过 11/20；九题失败推动候选与覆盖判断返修。', tone: 'thinking' },
  { label: '当前', body: '第二次纯检索契约达到 20/20，但模型答案与人工盲评未形成最终结论，整体仍为 incomplete。', tone: 'status' },
],
```

- [ ] **Step 6: Run V1.5 functional and overflow tests**

```bash
npm run check
npm run test:e2e -- e2e/knowledge-harness-validation-data.spec.ts e2e/knowledge-harness.spec.ts
```

Expected: all V1.5 assertions pass; eight chapters remain; no horizontal overflow.

- [ ] **Step 7: Update and inspect only S7 snapshots**

```bash
npm run test:e2e -- e2e/knowledge-harness.visual.spec.ts --grep "s7" --update-snapshots
npm run test:e2e -- e2e/knowledge-harness.visual.spec.ts --grep "s7"
```

Expected: S7 desktop/mobile pass. Inspect both images and confirm architecture appears before the two reports on mobile, and `incomplete` is legible without implying failure or success.

- [ ] **Step 8: Commit the V1.5 evidence**

```bash
git add -- src/components/knowledge-harness/V15Convergence.astro src/components/knowledge-harness/V15ProfileRuntime.astro src/data/knowledgeHarness.ts e2e/knowledge-harness.spec.ts e2e/knowledge-harness.visual.spec.ts-snapshots
git diff --cached --check
git commit -m "feat: show V1.5 retrieval validation history"
```

Expected: no blind-test answer, identity map, review file or three-version score is staged.

## 6. Integration, accessibility and recovery closure

### Task 8: Close the incremental acceptance contract

**Files:**
- Create: `e2e/incremental-accessibility.spec.ts`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify only if test evidence requires: authorized files already listed above
- Runtime state: fixed Plan runtime JSON

- [ ] **Step 1: Install the missing accessibility test dependency at a fixed version**

```bash
npm install --save-dev --save-exact @axe-core/playwright@4.12.1
```

Expected: `package.json` gains exactly `"@axe-core/playwright": "4.12.1"`; `package-lock.json` records the same package; no other direct dependency changes.

- [ ] **Step 2: Add an accessibility test for the affected surfaces**

Create `e2e/incremental-accessibility.spec.ts`:

```ts
import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

const cases = [
  { path: '/', selector: '[data-selected-work]' },
  { path: '/projects/', selector: 'main' },
  { path: '/ai/knowledge-harness/#s6', selector: '#s6' },
  { path: '/ai/knowledge-harness/#s7', selector: '#s7' },
] as const;

for (const item of cases) {
  test(`${item.path} incremental surface has no axe violations`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(item.path);
    const results = await new AxeBuilder({ page }).include(item.selector).analyze();
    expect(results.violations).toEqual([]);
  });
}
```

- [ ] **Step 3: Run all targeted gates**

```bash
npm run portfolio:visuals
npm run check
npm run test:e2e -- \
  e2e/home.spec.ts \
  e2e/sections.spec.ts \
  e2e/project-index.visual.spec.ts \
  e2e/knowledge-harness-validation-data.spec.ts \
  e2e/knowledge-harness.spec.ts \
  e2e/knowledge-harness.visual.spec.ts \
  e2e/incremental-accessibility.spec.ts
```

Expected: two screenshots verified; Astro 0 errors; all targeted tests and visual snapshots pass.

- [ ] **Step 4: Inspect the final visual evidence set**

Open and inspect these exact snapshots with the image viewer:

```text
e2e/project-index.visual.spec.ts-snapshots/project-index-desktop-darwin.png
e2e/project-index.visual.spec.ts-snapshots/project-index-mobile-darwin.png
e2e/knowledge-harness.visual.spec.ts-snapshots/knowledge-harness-s5-desktop-darwin.png
e2e/knowledge-harness.visual.spec.ts-snapshots/knowledge-harness-s5-mobile-darwin.png
e2e/knowledge-harness.visual.spec.ts-snapshots/knowledge-harness-s6-desktop-darwin.png
e2e/knowledge-harness.visual.spec.ts-snapshots/knowledge-harness-s6-mobile-darwin.png
e2e/knowledge-harness.visual.spec.ts-snapshots/knowledge-harness-s7-desktop-darwin.png
e2e/knowledge-harness.visual.spec.ts-snapshots/knowledge-harness-s7-mobile-darwin.png
```

Also inspect the homepage desktop/mobile outputs from `test-results/`. Reject the result if cards become equal-weight, the Hero remains effectively full-screen on desktop, report text is illegible, or other three project covers change.

- [ ] **Step 5: Run the full non-regression suite**

```bash
npm run test:e2e
npm run build
```

Expected: full Playwright suite passes; Astro build exits 0. If a frozen unrelated baseline fails on the clean branch, record it separately and prove the same failure on `718023c`; do not update unrelated snapshots.

- [ ] **Step 6: Verify the change boundary**

```bash
git status --short
git diff --name-only 718023c054356a9d6036f4b5837251ceedd0f573...HEAD
git diff --check 718023c054356a9d6036f4b5837251ceedd0f573...HEAD
```

Expected: only approved docs, two portfolio screenshots, listed source/components/tests/snapshots and package verifier changes appear. No previous red structural SVG, resume, About, Skill Desk, commercial detail page, Obsidian or blind-test file appears.

- [ ] **Step 7: Commit final accessibility and acceptance evidence**

```bash
git add -- package.json package-lock.json e2e/incremental-accessibility.spec.ts
git diff --cached --check
git commit -m "test: close incremental portfolio acceptance"
```

Expected: the commit contains only the pinned axe dependency, lockfile update and new accessibility test unless a preceding targeted fix was required and separately verified.

- [ ] **Step 8: Mark the Plan complete only after every authorized task passes**

```bash
python3 /Users/qqx/.agents/skills/adaptive-orchestration/scripts/plan_stop_gate.py set-state \
  --file /Users/qqx/my_code_cursor/personal-website/docs/superpowers/plans/2026-08-17-live-portfolio-incremental-visual-evolution.md.plan-runtime.json \
  --plan /Users/qqx/my_code_cursor/personal-website/docs/superpowers/plans/2026-08-17-live-portfolio-incremental-visual-evolution.md \
  --state completed \
  --remaining false \
  --unblocked true \
  --next-step "全部授权增量、测试和视觉验收已完成"
```

Expected: runtime state is `completed` with no remaining authorized work. Do not deploy or push.

## 7. Final implementation handoff checklist

- [ ] Isolated branch is based on exact live commit `718023c054356a9d6036f4b5837251ceedd0f573`.
- [ ] Dirty `main` evidence remains untouched.
- [ ] Two public screenshots match the frozen SHA-256 manifest; all new structure diagrams are code-native and use the existing purple-blue theme tokens.
- [ ] Homepage order is Knowledge Harness → Delivery Harness → Sales Lead → Smart Parking.
- [ ] Original three “作品与思考” cards still render.
- [ ] Exactly two project-index cards have evidence covers: one real sales screenshot and one code-native parking structure.
- [ ] Knowledge Harness retains eight sections and eight timeline items.
- [ ] S6 contains five architecture layers, two V2 reports and `activation=false` no-cutover decision.
- [ ] S7 contains two V1.5 retrieval reports and `Gate incomplete`.
- [ ] No ongoing three-version blind-test result or progress is public.
- [ ] Targeted tests, axe, full E2E and build pass.
- [ ] Final result remains local: no push, PR or deployment.
