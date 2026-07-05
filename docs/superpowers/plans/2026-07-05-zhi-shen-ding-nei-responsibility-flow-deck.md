# Zhi Shen Ding Nei Responsibility Flow Deck Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/ai/zhi-shen-ding-nei/` deck and connect it from the AI listing, presenting《置身钉内》as a product-judgment deck about enterprise AI responsibility flow.

**Architecture:** Follow the existing static Astro deck pattern: one new `DeckLayout` page with local content, timeline navigation, section-local CSS, and Playwright coverage. Keep `DeckLayout` unchanged; implement the fourth deck as a focused page that reuses existing layout primitives while giving this topic its own responsibility-flow visual language.

**Tech Stack:** Astro 5, static Astro pages, existing `DeckLayout`, Playwright e2e tests, `npm run check`, `npm run build`.

---

## Context Pack

- 当前任务：为个人网站第四个 deck《置身钉内：我读到的不是消息总结，而是责任流》创建实施计划。
- 当前材料：`docs/superpowers/specs/2026-07-05-zhi-shen-ding-nei-responsibility-flow-deck-design.md`，现有 `DeckLayout`，现有 `Personal Knowledge Harness` deck，现有 `从 Claude Code 到 AI 产品架构` deck，AI 列表页和 Playwright 配置。
- 路由依据：读取了真实任务上下文加载规则、个人知识库 RAG 式上下文治理规则、正式知识域 README、正式知识域索引、工作领域 README、需求文档 README、技术分析 README、原型分析 README、项目复盘 README、渐进式上下文加载规则。
- 最终加载：`需求文档/README.md`、`技术分析/README.md`、`项目复盘/README.md`、`原型分析/README.md`、`AI工作流产品的技术债清单`、`没有胜仗的敏捷会变成消耗`。
- 未加载：旧 `wiki/` 未加载，因为新库上下文和当前 spec 已足够；原文层未整篇加载，因为本计划不需要核验原文出处；需求分析目录下全部 7 张卡未全量加载，因为 deck 内容已在 spec 中收束。
- 风险：本 deck 文案密度高，移动端图形、timeline、长标题和 10 屏 scroll-snap 是主要验收风险。

## Spec-Readiness Gate

Source spec has no formal `prd-review spec-readiness: PASS`, so this plan runs the four checks directly:

- State combinations：页面状态清晰，只有静态 deck、AI 列表卡片、timeline active state、desktop/mobile layout；不涉及业务状态矩阵。
- Failure & concurrency：无并发写入；主要失败路径是 route 404、base path 错误、移动端横向溢出、文字遮挡、timeline 标签缺失，均进入测试任务。
- Enum closure：路由、标题、10 屏结构、timeline 标签、AI 卡片 tags、验证命令均在 spec 和本 plan 固定。
- Single source of truth：deck 内容以 spec 为唯一产品内容来源；Astro 页面承载展示；测试只校验可访问性、结构和关键文案。

Verdict：PASS，可以进入 implementation plan。

## Scope Check

本 plan 只实现第四个 deck：`/ai/zhi-shen-ding-nei/`。未来 `reading-dialogue Skill` 常用技能 deck 不在本计划内，只在 S10 作为一句伏笔出现。

## File Structure

- Create `src/pages/ai/zhi-shen-ding-nei.astro`
  - Responsibility：new 10-section responsibility-flow deck page, local content data, visual cards/flows/matrix, timeline script, responsive CSS.
- Modify `src/pages/ai/index.astro`
  - Responsibility：add the AI listing card for the new deck.
- Create `e2e/zhi-shen-ding-nei.spec.ts`
  - Responsibility：AI listing link, deck route, 10 sections, key content, timeline labels, S10 boundary, desktop/mobile overflow tests.

## Deck Content Matrix

Use this matrix as the exact content source for `src/pages/ai/zhi-shen-ding-nei.astro`.

| Section | Chapter | Heading | Key line | Visual mode |
| --- | --- | --- | --- | --- |
| `s1` | `AI 阅读总结 · 企业 AI 责任流` | `置身钉内：我读到的不是消息总结，而是责任流` | `一本钉钉 ONE 复盘，让我重新理解企业 AI 到底该接住什么。` | flow |
| `s2` | `02 · Reading Lens` | `我没有把它当成普通书评来读` | `阅读切口从功能复盘转向组织责任流。` | contrast |
| `s3` | `03 · Tension` | `发信人基因，和收信人叙事` | `企业 AI 的难点不是选一边，而是设计中间层。` | tension |
| `s4` | `04 · Judgment 01` | `企业 AI 必须区分信息、任务、责任` | `不是所有信息都该变成待办，也不是所有待办都意味着承担后果。` | triad |
| `s5` | `05 · Judgment 02` | `AI 判断不是传统规则里的 1 和 0` | `低置信、高损失的判断，应先进入风险池或复核机制。` | matrix |
| `s6` | `06 · Judgment 03` | `一线可以说“不归我”，但风险不能漂移` | `规则可以争议，风险不能悬空。` | flow |
| `s7` | `07 · Judgment 04` | `顺流动作要轻，分歧动作要留下证据` | `正常路径轻，异常路径结构化。` | split |
| `s8` | `08 · Judgment 05` | `先用流程定义组织确定性，再让 AI 接管稳定确定性` | `流程不是 AI 的反面，而是 AI 冷启动时的训练轨道。` | flow |
| `s9` | `09 · Learning` | `没有胜仗的敏捷，会变成消耗` | `失败要入账，才会变成组织资产。` | cards |
| `s10` | `10 · From Reading To Assets` | `读书不是摘录，而是把判断力变成资产` | `这次阅读沉淀成 11 张知识卡，reading-dialogue Skill 另起常用技能 deck。` | flow |

Timeline labels:

`封面`、`阅读`、`张力`、`三层`、`不确定性`、`兜底`、`异常`、`流程`、`胜仗`、`资产`

## Task 1: Link The AI Listing Card

**Files:**
- Modify: `src/pages/ai/index.astro`
- Create: `e2e/zhi-shen-ding-nei.spec.ts`

- [ ] **Step 1: Write the failing AI listing test**

Create `e2e/zhi-shen-ding-nei.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('AI listing links to Zhi Shen Ding Nei responsibility flow deck', async ({ page }) => {
  await page.goto('/personal-website/ai/');
  const card = page.locator('.card', { hasText: '置身钉内：责任流阅读笔记' });
  await expect(card).toBeVisible();
  await expect(card).toContainText('企业 AI');
  await expect(card).toContainText('To B 产品');
  await expect(card).toHaveAttribute('href', '/personal-website/ai/zhi-shen-ding-nei/');
});
```

- [ ] **Step 2: Run the listing test and verify it fails**

Run:

```bash
npx playwright test e2e/zhi-shen-ding-nei.spec.ts --grep "AI listing"
```

Expected: FAIL because the AI listing does not yet contain `置身钉内：责任流阅读笔记`.

- [ ] **Step 3: Update the AI listing card**

In `src/pages/ai/index.astro`, replace the full `items` array with:

```astro
const items = [
  { title: 'Personal Knowledge Harness', hook: '从上下文爆炸到三层知识库 × 多 agent 共用记忆——一个个人 AI 产品的完整决策史', tags: ['旗舰 deck', '架构设计', '已上线'], href: `${base}ai/knowledge-harness/` },
  { title: 'reading-dialogue Skill', hook: '把"读完就忘"变成结构化阅读对话', tags: ['工作流'] },
  {
    title: '从 Claude Code 到 AI 产品架构',
    hook: '拆开 AI Coding Agent 源码，抽象出输入、工具、上下文、控制层与运行时的产品架构框架',
    tags: ['方法论', '源码学习', 'AI 产品架构'],
    href: `${base}ai/claude-code-architecture/`,
  },
  {
    title: '置身钉内：责任流阅读笔记',
    hook: '从钉钉 ONE 复盘里读出企业 AI 的责任流、风险兜底和组织学习方法',
    tags: ['阅读总结', '企业 AI', 'To B 产品'],
    href: `${base}ai/zhi-shen-ding-nei/`,
  },
];
```

- [ ] **Step 4: Run the listing test and verify it passes**

Run:

```bash
npx playwright test e2e/zhi-shen-ding-nei.spec.ts --grep "AI listing"
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/ai/index.astro e2e/zhi-shen-ding-nei.spec.ts
git commit -m "feat: link Zhi Shen Ding Nei deck"
```

## Task 2: Create The Deck Route And Ten Sections

**Files:**
- Create: `src/pages/ai/zhi-shen-ding-nei.astro`
- Modify: `e2e/zhi-shen-ding-nei.spec.ts`

- [ ] **Step 1: Extend the failing deck tests**

Append these tests to `e2e/zhi-shen-ding-nei.spec.ts`:

```ts
test('Zhi Shen Ding Nei deck has ten responsibility-flow sections', async ({ page }) => {
  await page.goto('/personal-website/ai/zhi-shen-ding-nei/');
  await expect(page.getByRole('heading', { name: '置身钉内：我读到的不是消息总结，而是责任流' })).toBeVisible();
  await expect(page.locator('main#deck section')).toHaveCount(10);
  await expect(page.locator('#s3')).toContainText('发信人基因');
  await expect(page.locator('#s4')).toContainText('信息、任务、责任');
  await expect(page.locator('#s5')).toContainText('AI 判断不是传统规则里的 1 和 0');
  await expect(page.locator('#s9')).toContainText('没有胜仗的敏捷');
  await expect(page.locator('#s10')).toContainText('reading-dialogue Skill');
});

test('Zhi Shen Ding Nei deck exposes responsibility-flow timeline labels', async ({ page }) => {
  await page.goto('/personal-website/ai/zhi-shen-ding-nei/');
  const timeline = page.locator('nav.timeline');
  await expect(timeline).toBeVisible();
  for (const label of ['封面', '阅读', '张力', '三层', '不确定性', '兜底', '异常', '流程', '胜仗', '资产']) {
    await expect(timeline).toContainText(label);
  }
});

test('Zhi Shen Ding Nei deck keeps reading workflow as a closing hook only', async ({ page }) => {
  await page.goto('/personal-website/ai/zhi-shen-ding-nei/');
  await expect(page.locator('#s10')).toContainText('不展开讲完整阅读 workflow');
  await expect(page.locator('#s10')).toContainText('常用技能 deck');
  await expect(page.locator('#s4')).not.toContainText('候选卡片池');
});

test('Zhi Shen Ding Nei deck has no horizontal overflow on desktop and mobile', async ({ page }) => {
  for (const viewport of [
    { width: 1280, height: 800 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/personal-website/ai/zhi-shen-ding-nei/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(overflow).toBe(false);
  }
});

test('mobile responsibility visuals remain within the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/personal-website/ai/zhi-shen-ding-nei/#s5');
  const visual = page.locator('#s5 .figure').first();
  await expect(visual).toBeVisible();
  const box = await visual.boundingBox();
  expect(box?.width).toBeLessThanOrEqual(360);
});
```

- [ ] **Step 2: Run the new tests and verify they fail**

Run:

```bash
npx playwright test e2e/zhi-shen-ding-nei.spec.ts --grep "Zhi Shen Ding Nei deck"
```

Expected: FAIL because `/personal-website/ai/zhi-shen-ding-nei/` does not exist.

- [ ] **Step 3: Create the Astro page**

Create `src/pages/ai/zhi-shen-ding-nei.astro`:

```astro
---
import DeckLayout from '../../layouts/DeckLayout.astro';

const timeline = [
  ['s1', '封面'],
  ['s2', '阅读'],
  ['s3', '张力'],
  ['s4', '三层'],
  ['s5', '不确定性'],
  ['s6', '兜底'],
  ['s7', '异常'],
  ['s8', '流程'],
  ['s9', '胜仗'],
  ['s10', '资产'],
];

const screens = [
  {
    id: 's2',
    chapter: '02 · Reading Lens',
    heading: '我没有把它当成普通书评来读',
    insight: '《置身钉内》最有价值的部分，不只是钉钉 ONE 做了什么，而是它暴露了企业协同产品里长期存在的责任成本。',
    points: ['AI 总结、待办、会议、卡片只是表层形态。', '真问题是：谁被看见，谁被打扰，谁要行动，谁承担后果。', '阅读切口从功能复盘转向组织责任流。'],
    method: '从功能复盘进入组织责任流，才有机会把一次阅读变成可迁移的 To B 产品判断。',
    visualMode: 'contrast',
    visualTitle: '表层与深层',
    visualItems: ['表层：AI 总结 / 工作入口 / 卡片 / 智能待办', '深层：责任成本 / 组织确定性 / 一线压力 / 风险兜底'],
  },
  {
    id: 's3',
    chapter: '03 · Tension',
    heading: '发信人基因，和收信人叙事',
    insight: '钉钉这类组织协同产品天然有发信人基因：确保触达、确保处理、确保组织确定性。但 AI 助手叙事往往更像收信人叙事：过滤噪音、降低打扰、提升个人效率。',
    points: ['对发信人来说，消息是必须触达。', '对收信人来说，消息可能是噪音。', '对主管来说，高风险事项不能漏。', '对一线来说，系统不能什么都变成我的责任。'],
    method: '企业 AI 的难点不是选一边，而是设计可解释、可纠错、可复审的中间层。',
    visualMode: 'tension',
    visualTitle: '组织确定性 vs 个人降噪',
    visualItems: ['组织确定性 / 发信人', 'AI 责任判断', '个人降噪 / 收信人'],
  },
  {
    id: 's4',
    chapter: '04 · Judgment 01',
    heading: '企业 AI 必须区分信息、任务、责任',
    insight: '不是所有信息都该变成待办，也不是所有待办都意味着某个人要承担后果。',
    points: ['信息：需要知道，但不一定要行动。', '任务：需要执行某个动作，但不一定意味着长期责任归属。', '责任：需要有人承接结果、风险、时效或客户后果。'],
    method: '设计 AI 摘要、智能待办、责任视图、主动提醒时，要先问：系统是在整理信息，推动任务，还是分配责任。',
    visualMode: 'triad',
    visualTitle: '语义升级',
    visualItems: ['信息', '任务', '责任'],
  },
  {
    id: 's5',
    chapter: '05 · Judgment 02',
    heading: 'AI 判断不是传统规则里的 1 和 0',
    insight: '低置信、高损失的判断，不应该直接压到一线责任视图里。它应先进入主管风险池、治理队列或复核机制。',
    points: ['传统规则更像开关，AI 判断更像概率。', '一线不需要看到复杂概率，但需要知道命中原因、证据来源和可纠错入口。', 'AI 可以参与判断，但不能隐藏不确定性。'],
    method: '不能让同一个模型既当选手又当唯一裁判；高风险低置信判断需要规则、证据、历史数据或独立评估兜底。',
    visualMode: 'matrix',
    visualTitle: '置信度 × 损失',
    visualItems: ['低置信 / 低损失：低频摘要', '高置信 / 低损失：轻提醒', '低置信 / 高损失：主管风险池', '高置信 / 高损失：一线责任视图'],
  },
  {
    id: 's6',
    chapter: '06 · Judgment 03',
    heading: '一线可以说“不归我”，但风险不能漂移',
    insight: '允许责任异议是必要的，但高风险事项不能因为争议而没人接住。',
    points: ['责任归属常常有争议：客户经理、客服、项目经理、实施、主管、流程 owner 都可能相关。', 'V0 可以允许一线否认责任，但不能让一线自由重分配责任。', '裁决完成前，需要默认 owner、主管风险队列或流程 owner 临时兜底。'],
    method: '规则可以争议，风险不能悬空。责任争议流程要回答谁先接住、谁来裁决、裁决前谁兜底、裁决后是否回写长期规则。',
    visualMode: 'flow',
    visualTitle: '责任争议流',
    visualItems: ['默认 owner', '不归我', '争议待裁决', '临时兜底', '主管裁决', '规则回写'],
  },
  {
    id: 's7',
    chapter: '07 · Judgment 04',
    heading: '顺流动作要轻，分歧动作要留下证据',
    insight: 'B 端工作流如果每一步都要求解释，会让一线觉得笨重；但异常动作如果完全不留原因，组织就无法知道问题出在规则、模型、流程还是人。',
    points: ['已处理、确认、完成：低摩擦。', '误判、不归我、无需处理、重复提醒、规则错误：要求选择原因。', '高风险事项的异常关闭，至少进入轻量复核池。'],
    method: '正常路径轻，异常路径结构化。驳回不是关闭提醒，而是规则学习数据。',
    visualMode: 'split',
    visualTitle: '双路径交互',
    visualItems: ['正常路径：轻按钮 / 少解释 / 快速结束', '异常路径：原因枚举 / 复核池 / 规则学习'],
  },
  {
    id: 's8',
    chapter: '08 · Judgment 05',
    heading: '先用流程定义组织确定性，再让 AI 接管稳定确定性',
    insight: '企业 AI 早期不应该直接替代流程。很多时候不是模型不够强，而是组织自己还没定义清楚高风险、责任归属、异常处理和裁决机制。',
    points: ['先用人工流程显性化组织规则。', '让 AI 辅助识别风险、解释原因、记录反馈。', '把误判、不归我、无需处理、主管裁决沉淀成规则数据。', '对重复、稳定、低争议、高一致性的判断逐步自动化。'],
    method: '流程不是 AI 的反面，而是 AI 冷启动时的训练轨道。',
    visualMode: 'flow',
    visualTitle: '渐进自动化',
    visualItems: ['人工流程', 'AI 辅助识别', '结构化反馈', '规则复审', '局部自动化'],
  },
  {
    id: 's9',
    chapter: '09 · Learning',
    heading: '没有胜仗的敏捷，会变成消耗',
    insight: '团队不怕辛苦，怕的是辛苦之后既没有结果胜仗，也没有学习胜仗。',
    points: ['结果胜仗：用户真的用起来，指标长出来，关键风险下降。', '学习胜仗：指标未变，但团队改变了问题判断、目标用户、产品边界、核心指标、资源分配或下一轮行动。', '如果连续三轮高强度迭代没有指标变化，应暂停做根因审查。'],
    method: '敏捷不是为了更快生产可截图变化，而是更快发现误差、校准方向、调整资源。失败要入账，才会变成组织资产。',
    visualMode: 'cards',
    visualTitle: '两类胜仗',
    visualItems: ['结果胜仗：指标变化 / 风险下降', '学习胜仗：判断变化 / 资源重排', '失败入账：规则 / 模板 / 避坑清单 / 下一轮约束'],
  },
  {
    id: 's10',
    chapter: '10 · From Reading To Assets',
    heading: '读书不是摘录，而是把判断力变成资产',
    insight: '这次阅读最后沉淀成 11 张知识卡，但本 deck 不展开讲完整阅读 workflow。',
    points: ['这次阅读沉淀为需求分析、原型分析、技术分析、项目复盘四类卡片。', '真正复用的不是书摘，而是产品判断。', 'reading-dialogue Skill 的完整设计会单独进入后续常用技能 deck。'],
    method: '我读《置身钉内》最大的收获不是某个功能怎么做，而是企业 AI 进入组织工作流时，必须理解责任如何产生、如何争议、如何兜底、如何沉淀。',
    visualMode: 'flow',
    visualTitle: '阅读到资产',
    visualItems: ['reading dialogue', '11 knowledge cards', 'product judgment', 'future skill deck'],
  },
];
---
<DeckLayout
  title="置身钉内：责任流阅读笔记 — QQ星"
  description="从钉钉 ONE 复盘里读出企业 AI 的责任流、风险兜底和组织学习方法"
>
  <main id="deck" class="responsibility-deck">
    <section id="s1">
      <div class="chapter">AI 阅读总结 · 企业 AI 责任流</div>
      <h1>置身钉内：我读到的不是消息总结，而是责任流</h1>
      <p class="sub hero-sub">一本钉钉 ONE 复盘，让我重新理解企业 AI 到底该接住什么。</p>
      <p class="sub signal-line">message -> task -> responsibility -> owner -> review</p>
      <div class="figure hero-flow" aria-label="responsibility flow">
        {['message', 'task', 'responsibility', 'owner', 'review'].map((item, index) => (
          <>
            <span>{item}</span>
            {index < 4 && <i>-></i>}
          </>
        ))}
      </div>
      <div class="scroll-hint">↓ 滚动进入责任流</div>
    </section>

    {screens.map((screen) => (
      <section id={screen.id}>
        <div class="chapter">{screen.chapter}</div>
        <h2>{screen.heading}</h2>
        <div class="split">
          <div class="responsibility-copy">
            <div class="lens">关键认知</div>
            <p>{screen.insight}</p>
            <ul>
              {screen.points.map((point) => <li>{point}</li>)}
            </ul>
            <div class="method-card">
              <span>方法论抽象</span>
              <p>{screen.method}</p>
            </div>
          </div>
          <div class={`figure visual visual-${screen.visualMode}`}>
            <div class="fig-label">{screen.visualTitle}</div>
            <div class="visual-items">
              {screen.visualItems.map((item, index) => (
                <>
                  <div class="visual-node">{item}</div>
                  {['flow', 'triad', 'tension'].includes(screen.visualMode) && index < screen.visualItems.length - 1 && <span class="visual-arrow">-></span>}
                </>
              ))}
            </div>
          </div>
        </div>
      </section>
    ))}
  </main>

  <nav class="timeline" id="tl" aria-label="Deck timeline">
    {timeline.map(([id, label]) => (
      <a href={`#${id}`} data-t={id}><span class="dot"></span><span class="lbl">{label}</span></a>
    ))}
  </nav>

  <script is:inline>
    const links = document.querySelectorAll('#tl a[data-t]');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(l => l.classList.toggle('active', l.dataset.t === e.target.id));
        }
      });
    }, { root: document.getElementById('deck'), threshold: 0.55 });
    document.querySelectorAll('main section').forEach(s => obs.observe(s));
  </script>

  <style>
    .responsibility-deck {
      background:
        linear-gradient(180deg, rgba(255,255,255,0.018), rgba(255,255,255,0)),
        radial-gradient(circle at 50% 36%, rgba(52,211,153,0.075), transparent 34%);
    }
    .responsibility-deck section {
      gap: 0;
    }
    .hero-sub {
      margin-top: 1.4rem;
    }
    .signal-line {
      margin-top: 1.05rem;
      font-size: 0.88rem;
    }
    .hero-flow {
      display: flex;
      flex-wrap: wrap;
      gap: 0.7rem;
      align-items: center;
      justify-content: center;
      margin-top: 1.8rem;
      max-width: 780px;
    }
    .hero-flow span,
    .visual-node {
      color: var(--text);
      border: 1px solid rgba(52,211,153,0.38);
      background: rgba(52,211,153,0.11);
      border-radius: 999px;
      padding: 0.52rem 0.82rem;
      font-size: 0.82rem;
      line-height: 1.35;
    }
    .hero-flow i,
    .visual-arrow {
      color: var(--text-dim);
      font-style: normal;
    }
    .responsibility-copy {
      display: grid;
      gap: 0.9rem;
      max-width: 470px;
      min-width: 0;
    }
    .lens,
    .fig-label {
      color: var(--c-decide);
      font-size: 0.78rem;
      font-weight: 800;
      letter-spacing: 0.18em;
      text-transform: uppercase;
    }
    .responsibility-copy > p {
      color: var(--text);
      font-size: 1rem;
      line-height: 1.78;
    }
    .responsibility-copy ul {
      display: grid;
      gap: 0.52rem;
      padding-left: 1.05rem;
      color: var(--text-dim);
      font-size: 0.9rem;
      line-height: 1.62;
    }
    .method-card {
      border: 1px solid var(--glass-border);
      background: rgba(255,255,255,0.045);
      border-radius: 14px;
      padding: 0.95rem 1rem;
    }
    .method-card span {
      display: block;
      color: var(--c-cyan);
      font-size: 0.82rem;
      margin-bottom: 0.35rem;
    }
    .method-card p {
      color: var(--text-dim);
      font-size: 0.9rem;
      line-height: 1.65;
    }
    .responsibility-deck .figure {
      min-width: 0;
    }
    .visual-items {
      display: flex;
      flex-wrap: wrap;
      gap: 0.72rem;
      align-items: center;
      justify-content: center;
      margin-top: 1rem;
    }
    .visual-contrast .visual-items,
    .visual-split .visual-items,
    .visual-cards .visual-items {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      align-items: stretch;
    }
    .visual-cards .visual-items {
      grid-template-columns: 1fr;
    }
    .visual-matrix .visual-items {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      align-items: stretch;
    }
    .visual-contrast .visual-node,
    .visual-split .visual-node,
    .visual-matrix .visual-node,
    .visual-cards .visual-node {
      border-radius: 14px;
      white-space: normal;
      min-height: 76px;
      display: grid;
      align-content: center;
    }
    .visual-tension .visual-items {
      min-height: 220px;
    }
    .visual-tension .visual-node:nth-of-type(3) {
      border-color: rgba(34,211,238,0.48);
      background: rgba(34,211,238,0.12);
      transform: scale(1.08);
    }
    .visual-triad .visual-node:nth-of-type(5),
    .visual-flow .visual-node:last-of-type {
      border-color: rgba(34,211,238,0.5);
      background: rgba(34,211,238,0.12);
    }
    @media (max-width: 860px) {
      .responsibility-deck section {
        padding-top: 5.2rem;
        padding-bottom: 6.9rem;
      }
      .responsibility-copy {
        max-width: 100%;
      }
      .visual-contrast .visual-items,
      .visual-split .visual-items,
      .visual-matrix .visual-items {
        grid-template-columns: 1fr;
      }
      .hero-flow,
      .visual-items {
        justify-content: flex-start;
      }
      .signal-line {
        font-size: 0.76rem;
      }
    }
    @media (max-width: 520px) {
      .responsibility-deck .figure {
        width: min(100%, 480px);
        padding: 1rem;
      }
      .hero-flow span,
      .visual-node {
        font-size: 0.72rem;
        padding: 0.42rem 0.62rem;
      }
      .visual-arrow {
        display: none;
      }
    }
  </style>
</DeckLayout>
```

- [ ] **Step 4: Run the deck tests and verify they pass**

Run:

```bash
npx playwright test e2e/zhi-shen-ding-nei.spec.ts
```

Expected: PASS for listing, section count, timeline labels, S10 boundary, desktop/mobile overflow, and mobile visual width.

- [ ] **Step 5: Commit**

```bash
git add src/pages/ai/zhi-shen-ding-nei.astro e2e/zhi-shen-ding-nei.spec.ts
git commit -m "feat: add Zhi Shen Ding Nei responsibility flow deck"
```

## Task 3: Run Full Validation

**Files:**
- Verify: `src/pages/ai/index.astro`
- Verify: `src/pages/ai/zhi-shen-ding-nei.astro`
- Verify: `e2e/zhi-shen-ding-nei.spec.ts`

- [ ] **Step 1: Run Astro type/content check**

Run:

```bash
npm run check
```

Expected: PASS with Astro check completing without TypeScript or template errors.

- [ ] **Step 2: Run production build**

Run:

```bash
npm run build
```

Expected: PASS and generated output includes `dist/ai/zhi-shen-ding-nei/index.html`; runtime URLs still use `/personal-website/ai/zhi-shen-ding-nei/` because `astro.config.mjs` sets `base: '/personal-website'`.

- [ ] **Step 3: Run the new e2e suite**

Run:

```bash
npx playwright test e2e/zhi-shen-ding-nei.spec.ts
```

Expected: PASS.

- [ ] **Step 4: Run the existing deck regression suite**

Run:

```bash
npx playwright test e2e/claude-code-architecture.spec.ts e2e/sections.spec.ts
```

Expected: PASS. This confirms the new deck did not break the AI listing page, existing Claude Code deck route, or section pages.

- [ ] **Step 5: Inspect git status**

Run:

```bash
git status --short
```

Expected: only intended files are modified or the worktree is clean after commits. If `.gitignore` remains modified from before this plan, leave it untouched and mention it in the handoff.

## Self-Review Checklist

- Spec coverage：Tasks cover AI listing, route, 10 sections, timeline, S10 reading-workflow boundary, responsive no-overflow, check/build/e2e.
- Placeholder scan：No task contains unfinished work markers; code snippets include exact file contents or exact patch targets.
- Type consistency：Test route `/personal-website/ai/zhi-shen-ding-nei/` matches AI card href `${base}ai/zhi-shen-ding-nei/` and Astro page path `src/pages/ai/zhi-shen-ding-nei.astro`.
- Scope boundary：No task implements the future `reading-dialogue Skill` deck.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-05-zhi-shen-ding-nei-responsibility-flow-deck.md`. Two execution options:

1. **Subagent-Driven (recommended)** - Dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
