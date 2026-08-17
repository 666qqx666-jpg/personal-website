# 个人网站窄屏与移动端响应式修复 Implementation Plan

> **Execution governance:** Before implementation, run the shared `adaptive-orchestration` preflight. A plan records a recommended profile but does not dispatch agents or authorize execution by itself.

**Goal:** 修复首页 Desk 卡片在中等宽度下失衡、Knowledge Harness 证据画布在窄桌面下裁切的问题，并建立覆盖桌面、平板与手机的响应式验收门禁。

**Architecture:** 保留现有页面结构和内容，只增加三档响应式行为。首页通过组件变体让 Desk 在中等宽度下成为紧凑横向证据条；Knowledge Harness 在 `1080px` 及以下提前切换单列，并让 S5/S6/S7 密集图表依据 `DiagramFrame` 的实际容器宽度响应。

**Tech Stack:** Astro 5、组件内 CSS、CSS Grid、CSS Container Queries、Playwright、Axe Core。

**Recommended execution profile:** O0；首页与 Knowledge Harness 共用同一响应式验收链，改动集中且写入文件互相耦合，单一执行流更容易保持断点和截图一致。

**Parallelizable workstreams:** none

**Shared-write conflicts:** `e2e/home.spec.ts`、`e2e/knowledge-harness.spec.ts` 与响应式样式必须由同一执行流按测试先行顺序修改。

**Stage evidence checkpoint:** `responsive-layout-green`；`e2e/home.spec.ts`、`e2e/knowledge-harness.spec.ts`、`e2e/skill-desk.spec.ts` 全部通过，且首页 Desk 在 768px 为两列、Knowledge Harness 在 1024px/834px/390px 为单列、所有 `.kh-frame` 内部无溢出。

**Recovery entry:** `/Users/qqx/my_code_cursor/personal-website-live-incremental/docs/superpowers/plans/2026-08-17-portfolio-responsive-repair.md`

**Plan runtime state file:** `/Users/qqx/my_code_cursor/personal-website-live-incremental/docs/superpowers/plans/2026-08-17-portfolio-responsive-repair.md.plan-runtime.json`

PLAN_RUNTIME_STATE_FILE: /Users/qqx/my_code_cursor/personal-website-live-incremental/docs/superpowers/plans/2026-08-17-portfolio-responsive-repair.md.plan-runtime.json

**Authorization boundary:** 在 `/Users/qqx/my_code_cursor/personal-website-live-incremental` 内修改本计划列出的 Astro 样式、响应式 E2E、视觉快照与计划运行状态；允许启动本地开发服务、生成本地截图、运行检查/测试/构建并创建本地原子提交。

**Out of scope:** 不修改页面事实、文案、验证数字、数据文件、公开图片、主站配色、Skill Desk 信息架构或其他案例页面；不推送、不部署、不创建 PR，不写入 Obsidian 知识库。

**Potential decision boundaries:** 只有当 1080px 单列无法在不删除内容的前提下保留完整证据，或修复必须改变用户已确认的桌面构图、章节顺序、文案或数据时，才需要重新请求产品选择；普通断点数值微调和 CSS 技术恢复仍在授权范围内。

---

## 0. 规划依据与准备状态

**Approved spec:** `/Users/qqx/my_code_cursor/personal-website-live-incremental/docs/superpowers/specs/2026-08-17-portfolio-responsive-repair-design.md`

**Plan path:** `/Users/qqx/my_code_cursor/personal-website-live-incremental/docs/superpowers/plans/2026-08-17-portfolio-responsive-repair.md`

### Context-pack

- 当前材料：用户提供的两张窄屏截图、已确认响应式 Spec、当前分支代码、现有 Playwright 测试。
- 路由依据：真实任务上下文加载规则、RAG 式上下文治理规则、正式知识域根索引、需求文档/原型分析/项目复盘任务域 README。
- 最终加载：`PRD审查经验`、`PRD进入原型前交互封口清单`、`高保真原型真实页面基线规则`、`迁移不得反向降级已验证门禁`。
- 未加载：旧 `wiki/`、原文层正文、AI/RAG 架构卡、竞品/报价/数据规则卡；本次只改响应式呈现，不改变 Harness 技术语义或业务事实。
- 风险：用户截图使用高像素密度，物理像素不能直接当 CSS 宽度；验收统一使用计划内明确的 CSS 视口。

### Readiness verdicts

- `spec-readiness: PASS`：断点、布局状态、内容顺序、验收视口和失败行为均已关闭；无状态枚举、并发、数据字段或指标真值缺口。
- `baseline-evidence: PASS`：当前代码、用户截图、现有线上增量设计 Spec 和自动化测试能共同定位问题。
- `high-fidelity-readiness: PASS`：页面关系为现有页面增量，保留项和本次变化已写入 Spec，不存在未裁决的结构重设计。
- `prototype-sync: NOT_REQUIRED`：本轮只有呈现级 CSS 和测试变化，不改变入口、交互路径、内容事实或产品规则。

### 实施前动作

- [ ] **Step 1: 运行执行预检**

读取并执行 `/Users/qqx/.codex/skills/adaptive-orchestration/SKILL.md`。本计划推荐 O0；除非预检发现范围变化，不创建子 Agent。

- [ ] **Step 2: 初始化运行状态**

Run:

```bash
python3 /Users/qqx/.codex/skills/adaptive-orchestration/scripts/plan_stop_gate.py set-state \
  --file /Users/qqx/my_code_cursor/personal-website-live-incremental/docs/superpowers/plans/2026-08-17-portfolio-responsive-repair.md.plan-runtime.json \
  --plan /Users/qqx/my_code_cursor/personal-website-live-incremental/docs/superpowers/plans/2026-08-17-portfolio-responsive-repair.md \
  --state running \
  --remaining true \
  --unblocked true \
  --next-step "Task 1：写入首页 Desk 平板断点回归测试"
```

Expected: 状态文件存在并显示 `running`。如果脚本参数与当前版本不同，先读取脚本 `--help`，使用同一 state file 和等价字段重试一次。

- [ ] **Step 3: 加载 Impeccable 的适配规则**

Run once:

```bash
node /Users/qqx/.codex/skills/impeccable/scripts/context.mjs --target src/pages/ai/knowledge-harness.astro
```

随后完整读取：

```text
/Users/qqx/.codex/skills/impeccable/reference/adapt.md
/Users/qqx/.codex/skills/impeccable/reference/craft-floor.md
```

Expected: 以现有设计为视觉真值，只执行响应式适配；任何 `CONTEXT_STALE` 只报告，不顺带修复。

### Task 1: 首页 Desk 中等宽度回归测试与修复

**Files:**
- Modify: `e2e/home.spec.ts:31-53`
- Modify: `src/components/home/WorkPreview.astro:58-68`
- Verify only: `src/components/home/SelectedWork.astro:12-43`

- [ ] **Step 1: 写入会失败的平板断点测试**

在 `e2e/home.spec.ts` 末尾加入：

```ts
test('selected work turns the Desk card into a compact tablet row', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('/');

  const knowledge = page.locator('[data-work-id="knowledge-harness"]');
  const desk = page.locator('[data-work-id="delivery-harness"]');
  const [knowledgeBox, deskBox] = await Promise.all([knowledge.boundingBox(), desk.boundingBox()]);

  expect(deskBox?.y).toBeGreaterThan((knowledgeBox?.y ?? 0) + (knowledgeBox?.height ?? 0) - 1);
  expect(await desk.evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length)).toBe(2);
  expect(deskBox?.height).toBeLessThan(460);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    await page.evaluate(() => document.documentElement.clientWidth)
  );
});
```

在现有手机测试 `selected work keeps AI systems first on mobile and loads reviewed visuals` 中，紧接 `const columns` 断言前加入：

```ts
const deskColumns = await previews.nth(1).evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length);
expect(deskColumns).toBe(1);
```

- [ ] **Step 2: 运行测试并确认当前实现失败**

Run:

```bash
npx playwright test e2e/home.spec.ts
```

Expected: 新增平板测试失败，Desk 的列数实际为 `1` 而不是 `2`；原有测试继续通过。若失败原因不是列数断言，先确认本地服务使用当前 worktree，再继续。

- [ ] **Step 3: 实现 641–960px 的紧凑横向 Desk 卡**

在 `src/components/home/WorkPreview.astro` 现有 `@media (max-width: 820px)` 之后加入：

```css
@media (min-width: 641px) and (max-width: 960px) {
  .work-preview.support {
    grid-template-columns: minmax(220px, .78fr) minmax(0, 1.22fr);
    grid-template-rows: auto;
    align-items: center;
    height: auto;
  }

  .support img {
    height: clamp(180px, 24vw, 220px);
    max-height: none;
    object-fit: cover;
    object-position: top left;
  }
}
```

不要修改 `SelectedWork.astro` 的顺序或 `960px`/`640px` 两个既定断点；本任务只让已经下移的 Desk 卡表现得有意且紧凑。

- [ ] **Step 4: 运行首页响应式测试**

Run:

```bash
npx playwright test e2e/home.spec.ts
```

Expected: 全部首页测试通过；768px Desk 为两列且高度小于 460px，390px Desk 为单列。

- [ ] **Step 5: 提交首页修复**

```bash
git add e2e/home.spec.ts src/components/home/WorkPreview.astro
git commit -m "fix: compact delivery harness card on tablet"
```

Expected: 只提交上述两个文件。

### Task 2: Knowledge Harness 窄桌面布局与容器响应

**Files:**
- Modify: `e2e/knowledge-harness.spec.ts:64-75`
- Modify: `src/pages/ai/knowledge-harness.astro:79-111`
- Modify: `src/components/knowledge-harness/DiagramFrame.astro:27-50`
- Modify: `src/components/knowledge-harness/V2ShadowRuntime.astro`
- Modify: `src/components/knowledge-harness/V2Architecture.astro`
- Modify: `src/components/knowledge-harness/EvaluationActivationGate.astro`
- Modify: `src/components/knowledge-harness/ValidationDecisionFlow.astro`
- Modify: `src/components/knowledge-harness/V15ProfileRuntime.astro`

- [ ] **Step 1: 用元素边界替换容易假通过的页面滚动测试**

用下面的测试替换 `e2e/knowledge-harness.spec.ts` 中现有的 `desktop and mobile layouts do not overflow horizontally`：

```ts
test('approved viewport matrix keeps dense diagrams inside their own frames', async ({ page }) => {
  const viewports = [
    { width: 1440, height: 900, columns: 2 },
    { width: 1280, height: 800, columns: 2 },
    { width: 1024, height: 768, columns: 1 },
    { width: 834, height: 1194, columns: 1 },
    { width: 430, height: 932, columns: 1 },
    { width: 390, height: 844, columns: 1 },
    { width: 360, height: 800, columns: 1 },
  ] as const;

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto('/ai/knowledge-harness/#s6');

    const splitColumns = await page.locator('#s6 .enterprise-split').evaluate(
      (node) => getComputedStyle(node).gridTemplateColumns.split(' ').length
    );
    expect(splitColumns).toBe(viewport.columns);

    for (const id of ['s5', 's6', 's7']) {
      const frame = page.locator(`#${id} [data-visual]`);
      const containment = await frame.evaluate((node) => {
        const frameRect = node.getBoundingClientRect();
        const offenders = [...node.querySelectorAll<HTMLElement>('*')]
          .filter((child) => {
            const rect = child.getBoundingClientRect();
            return rect.left < frameRect.left - 1 || rect.right > frameRect.right + 1;
          })
          .map((child) => child.className || child.tagName);
        return {
          internalOverflow: node.scrollWidth > node.clientWidth + 1,
          offenders,
        };
      });
      expect(containment).toEqual({ internalOverflow: false, offenders: [] });
    }

    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
      await page.evaluate(() => document.documentElement.clientWidth)
    );
  }
});
```

- [ ] **Step 2: 运行测试并确认窄桌面基线失败**

Run:

```bash
npx playwright test e2e/knowledge-harness.spec.ts
```

Expected: 1024px 的 `splitColumns` 实际为 `2`，与期望 `1` 不一致；在修复前不得放宽断言或恢复只检查页面 `scrollWidth` 的旧门禁。

- [ ] **Step 3: 把页面级双栏断点提升到 1080px**

在 `src/pages/ai/knowledge-harness.astro` 中：

1. 将 `.enterprise-split` 基础规则改为：

```css
.enterprise-split {
  width: min(1180px, 100%);
  min-width: 0;
  grid-template-columns: minmax(280px, .72fr) minmax(520px, 1.16fr);
  gap: clamp(2rem, 4vw, 4rem);
  align-items: center;
}
.enterprise-split > * { min-width: 0; }
```

2. 删除现有 `980px` 和 `860px` 两段 `.enterprise-split` 规则，替换为：

```css
@media (max-width: 1080px) {
  section[data-section] {
    height: auto;
    min-height: 100vh;
    padding-top: 5rem;
    padding-bottom: 7rem;
  }

  .enterprise-split {
    grid-template-columns: minmax(0, 1fr);
    width: min(100%, 760px);
    gap: 1.2rem;
  }

  .narrative-copy { width: 100%; }
  .enterprise-split :global(.kh-frame) { width: 100%; }

  @supports (height: 100dvh) {
    section[data-section] { min-height: 100dvh; }
  }
}
```

保留现有 `520px` 的密度规则；它继续负责手机端 S5/S6/S7 的文字和间距。

- [ ] **Step 4: 建立 DiagramFrame 容器**

将 `src/components/knowledge-harness/DiagramFrame.astro` 的相关规则改为：

```css
.kh-frame {
  width: min(100%, 650px);
  min-width: 0;
  padding: 1.2rem 1.25rem 1rem;
  container-type: inline-size;
  container-name: kh-frame;
}
.kh-frame.evidence { width: min(100%, 860px); padding: 1rem 1.05rem .85rem; }
.kh-frame.evidence .diagram-labels { min-height: 0; }
.diagram-labels { min-width: 0; min-height: 290px; display: grid; align-content: center; }
```

并将文件末尾的 `@media (max-width: 760px)` 改为：

```css
@container kh-frame (max-width: 650px) {
  .diagram-labels { min-height: 0; }
  .kh-title { margin-bottom: .75rem; }
}

@media (max-width: 760px) {
  .kh-frame { padding: 1rem; }
}
```

- [ ] **Step 5: 让密集图表查询容器而不是页面**

只替换以下五个组件已有的响应式 at-rule，不改变其中的布局声明：

```text
V2ShadowRuntime.astro:
@media (max-width: 620px)
→ @container kh-frame (max-width: 620px)

V2Architecture.astro:
@media (max-width: 650px)
→ @container kh-frame (max-width: 650px)

EvaluationActivationGate.astro:
@media (max-width: 650px)
→ @container kh-frame (max-width: 650px)

ValidationDecisionFlow.astro:
@media (max-width: 650px)
→ @container kh-frame (max-width: 650px)

V15ProfileRuntime.astro:
@media (max-width: 650px)
→ @container kh-frame (max-width: 650px)
```

该替换的目的只是让同一图表在窄列中按实际空间折叠；不得更改节点文案、验证数字、状态或颜色语义。

- [ ] **Step 6: 运行 Knowledge Harness 测试**

Run:

```bash
npx playwright test e2e/knowledge-harness.spec.ts
```

Expected: 全部测试通过；1440px/1280px 为双栏，1024px 及以下为单列，S5/S6/S7 每个画布的 `offenders` 均为空。

- [ ] **Step 7: 提交 Knowledge Harness 修复**

```bash
git add e2e/knowledge-harness.spec.ts \
  src/pages/ai/knowledge-harness.astro \
  src/components/knowledge-harness/DiagramFrame.astro \
  src/components/knowledge-harness/V2ShadowRuntime.astro \
  src/components/knowledge-harness/V2Architecture.astro \
  src/components/knowledge-harness/EvaluationActivationGate.astro \
  src/components/knowledge-harness/ValidationDecisionFlow.astro \
  src/components/knowledge-harness/V15ProfileRuntime.astro
git commit -m "fix: contain knowledge harness diagrams on narrow screens"
```

Expected: 只提交上述响应式样式和回归测试，不包含数据或文案变更。

### Task 3: Skill Desk 邻接验收、移动端无障碍与视觉基线

**Files:**
- Modify: `e2e/skill-desk.spec.ts`
- Modify: `e2e/incremental-accessibility.spec.ts`
- Create: `e2e/responsive-portfolio.visual.spec.ts`
- Create: `e2e/responsive-portfolio.visual.spec.ts-snapshots/selected-work-tablet-light-darwin.png`
- Create: `e2e/responsive-portfolio.visual.spec.ts-snapshots/selected-work-mobile-light-darwin.png`
- Create: `e2e/responsive-portfolio.visual.spec.ts-snapshots/knowledge-harness-s6-tablet-dark-darwin.png`

- [ ] **Step 1: 增加 Skill Desk 三档溢出检查**

在 `e2e/skill-desk.spec.ts` 末尾加入：

```ts
test('Skill Desk stays contained on tablet and mobile widths', async ({ page }) => {
  for (const viewport of [
    { width: 1024, height: 768 },
    { width: 834, height: 1194 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/ai/skill-desk/');
    await expect(page.locator('.skill-desk-page')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
      await page.evaluate(() => document.documentElement.clientWidth)
    );
    await expect(page.getByRole('link', { name: /Enterprise Knowledge Harness/ })).toBeVisible();
  }
});
```

Run:

```bash
npx playwright test e2e/skill-desk.spec.ts
```

Expected: 全部 Skill Desk 测试通过。本任务只验收邻接页面；若出现失败，先判断是否由本分支已有代码造成。与本次响应式修改无关的既有问题记录为 concern，不顺带重设计页面。

- [ ] **Step 2: 把无障碍检查扩展到手机和 Skill Desk**

将 `e2e/incremental-accessibility.spec.ts` 的 `cases` 增加：

```ts
{ path: '/ai/skill-desk/', selector: '.skill-desk-page' },
```

在 `themes` 后增加：

```ts
const viewports = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
] as const;
```

把现有双层循环改为三层循环：

```ts
for (const theme of themes) for (const viewport of viewports) for (const item of cases) test(
  `${item.path} ${theme} ${viewport.name} incremental surface has no axe violations`,
  async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript((selectedTheme) => localStorage.setItem('theme', selectedTheme), theme);
    await page.goto(item.path);
    await page.addStyleTag({ content: '.reveal { opacity: 1 !important; transform: none !important; }' });
    const results = await new AxeBuilder({ page }).include(item.selector).analyze();
    expect(results.violations).toEqual([]);
  }
);
```

Run:

```bash
npx playwright test e2e/incremental-accessibility.spec.ts
```

Expected: 20 项通过，即 5 个页面切片 × 2 个主题 × 2 个视口。

- [ ] **Step 3: 创建三张新的视觉基线**

创建 `e2e/responsive-portfolio.visual.spec.ts`：

```ts
import { test, expect, type Page } from '@playwright/test';

async function prepare(page: Page, viewport: { width: number; height: number }, theme: 'light' | 'dark') {
  await page.setViewportSize(viewport);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript((selectedTheme) => localStorage.setItem('theme', selectedTheme), theme);
}

async function freezeMotion(page: Page) {
  await page.addStyleTag({
    content: 'astro-dev-toolbar{display:none!important}*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}',
  });
}

test('selected work tablet visual', async ({ page }) => {
  await prepare(page, { width: 768, height: 1024 }, 'light');
  await page.goto('/');
  await freezeMotion(page);
  await expect(page.locator('[data-selected-work]')).toHaveScreenshot('selected-work-tablet-light.png', { animations: 'disabled' });
});

test('selected work mobile visual', async ({ page }) => {
  await prepare(page, { width: 390, height: 844 }, 'light');
  await page.goto('/');
  await freezeMotion(page);
  await expect(page.locator('[data-selected-work]')).toHaveScreenshot('selected-work-mobile-light.png', { animations: 'disabled' });
});

test('Knowledge Harness evaluation tablet visual', async ({ page }) => {
  await prepare(page, { width: 834, height: 1194 }, 'dark');
  await page.goto('/ai/knowledge-harness/#s6');
  await freezeMotion(page);
  const section = page.locator('#s6');
  await section.scrollIntoViewIfNeeded();
  await expect(section).toHaveScreenshot('knowledge-harness-s6-tablet-dark.png', { animations: 'disabled' });
});
```

- [ ] **Step 4: 生成、人工查看并冻结视觉快照**

Run:

```bash
npx playwright test e2e/responsive-portfolio.visual.spec.ts --update-snapshots
```

Expected: 新增三张 Darwin PNG。使用本地图片查看器逐张检查：

1. 768px Desk 为紧凑左文右图，没有整屏高的截图。
2. 390px 四项工作单列，文字和图像不被裁切。
3. 834px S6 为上文下图，五层架构、两份报告、决策门、图例与图注全部可见。

任何一项不满足时，不接受快照；回到对应 CSS 一次性修正，再重新生成。最多执行一轮确认修正。

- [ ] **Step 5: 无更新模式重跑视觉测试**

Run:

```bash
npx playwright test e2e/responsive-portfolio.visual.spec.ts e2e/knowledge-harness.visual.spec.ts
```

Expected: 新增三张快照和既有 Knowledge Harness 桌面/手机快照全部通过。只有确认是计划内响应式变化时才更新既有快照。

- [ ] **Step 6: 提交验收资产**

```bash
git add e2e/skill-desk.spec.ts \
  e2e/incremental-accessibility.spec.ts \
  e2e/responsive-portfolio.visual.spec.ts \
  e2e/responsive-portfolio.visual.spec.ts-snapshots
git commit -m "test: cover responsive portfolio breakpoints"
```

Expected: 提交响应式测试和三张视觉基线；不提交 `/tmp` 或 `.gstack` 运行产物。

### Task 4: 最终质量门、标准 QA 与交付提交

**Files:**
- Verify: all changed source and test files
- Runtime evidence only: `/tmp/portfolio-responsive-qa/`
- Update: `/Users/qqx/my_code_cursor/personal-website-live-incremental/docs/superpowers/plans/2026-08-17-portfolio-responsive-repair.md.plan-runtime.json`

- [ ] **Step 1: 运行 Impeccable 检测器一次**

Run exactly once after all UI edits:

```bash
node /Users/qqx/.codex/skills/impeccable/scripts/detect.mjs --json \
  src/components/home/WorkPreview.astro \
  src/pages/ai/knowledge-harness.astro \
  src/components/knowledge-harness/DiagramFrame.astro \
  src/components/knowledge-harness/V2ShadowRuntime.astro \
  src/components/knowledge-harness/V2Architecture.astro \
  src/components/knowledge-harness/EvaluationActivationGate.astro \
  src/components/knowledge-harness/ValidationDecisionFlow.astro \
  src/components/knowledge-harness/V15ProfileRuntime.astro
```

Expected: 无新增阻断项。既有且与本次无关的 advisory 记录在交付说明中，不扩大范围修改。

- [ ] **Step 2: 运行静态、资源、定向和构建验证**

Run:

```bash
npm run portfolio:visuals
npm run check
npx playwright test \
  e2e/home.spec.ts \
  e2e/knowledge-harness.spec.ts \
  e2e/skill-desk.spec.ts \
  e2e/incremental-accessibility.spec.ts \
  e2e/responsive-portfolio.visual.spec.ts \
  e2e/knowledge-harness.visual.spec.ts
npm run build
```

Expected: 所有命令退出码为 0。任何新增测试、无障碍、快照或构建失败都阻止进入完成状态。

- [ ] **Step 3: 运行全量 E2E**

Run:

```bash
npm run test:e2e
```

Expected: 本次新增和相关测试全部通过。允许记录分支实施前已经存在的 `e2e/resume-data.spec.ts:37` 简历文案空格断言失败；出现任何其他失败时，必须回到对应任务修复或明确证明为既有问题后才能继续。

- [ ] **Step 4: 执行三页面标准响应式 QA**

完整读取并执行 `/Users/qqx/.codex/skills/qa/SKILL.md` 的 preamble、clean-tree gate 和 Standard 修复流程，目标 URL 与范围固定为：

```text
http://localhost:4321/#selected-work
http://localhost:4321/ai/knowledge-harness/#s6
http://localhost:4321/ai/skill-desk/
```

输出目录覆盖为：

```text
/tmp/portfolio-responsive-qa/
```

QA 视口固定为 `1440×900`、`1024×768`、`834×1194`、`390×844`、`360×800`。每个页面检查可见裁切、内部溢出、导航可用性、主题状态和控制台错误。范围内 Critical/High/Medium 问题按 QA 流程原子修复；范围外问题只记录 concern。

Expected: 本次两个已知问题均为 verified，未出现新的范围内 Critical/High/Medium 问题；修复后的目标范围健康分为 100。浏览器截图必须实际打开查看，不只依赖命令退出码。

- [ ] **Step 5: 检查提交边界与工作树**

Run:

```bash
git diff --check
git status --short
git log -6 --oneline
```

Expected: 没有未提交的计划内源文件或测试文件；`/tmp/portfolio-responsive-qa/` 不进入 Git。若 QA 产生了范围内修复，使用 `fix(qa): ISSUE-001 — contain responsive evidence canvas` 这类包含实际问题编号和内容的独立提交后，重新执行 Step 2 和 Step 3。

- [ ] **Step 6: 写入真实完成状态**

只有所有计划内工作实际完成后运行：

```bash
python3 /Users/qqx/.codex/skills/adaptive-orchestration/scripts/plan_stop_gate.py set-state \
  --file /Users/qqx/my_code_cursor/personal-website-live-incremental/docs/superpowers/plans/2026-08-17-portfolio-responsive-repair.md.plan-runtime.json \
  --plan /Users/qqx/my_code_cursor/personal-website-live-incremental/docs/superpowers/plans/2026-08-17-portfolio-responsive-repair.md \
  --state completed \
  --remaining false \
  --unblocked false \
  --next-step "无；计划已完成"
```

Expected: 状态文件记录与实际测试、提交和 QA 事实一致的 `completed`。若仍有范围内失败，不得写入完成状态。

## 最终交付清单

- 首页 Desk 在宽桌面保持侧卡，在 641–960px 成为紧凑横向卡，在 640px 以下单列。
- Knowledge Harness 在 1081px 及以上双栏，在 1080px 及以下上文下图。
- S5/S6/S7 密集图表根据画布宽度响应，内部节点没有隐藏裁切。
- Skill Desk 在 1024px、834px、390px 无横向溢出。
- 浅色/深色、桌面/手机无障碍检查通过。
- 三张新增视觉基线和既有 Knowledge Harness 视觉基线通过。
- 资源校验、Astro check、定向 E2E、构建通过；全量 E2E 没有新增失败。
- 没有文案、数据、公开图片、其他案例或部署层变更。
