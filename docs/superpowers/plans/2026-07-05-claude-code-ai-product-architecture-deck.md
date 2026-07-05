# Claude Code AI Product Architecture Deck Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/ai/claude-code-architecture/` deck and connect it from the AI section, presenting Claude Code source-code learning as a transferable AI product architecture framework.

**Architecture:** Follow the existing deck pattern: a single Astro page rendered inside `DeckLayout`, with section-local content, short code snippets, SVG/HTML architecture diagrams, and a bottom scroll timeline. Keep `DeckLayout` stable unless a bug blocks the new deck; implement new visual density inside the new page so `Personal Knowledge Harness` remains unchanged except for one optional source-link back to this deck.

**Tech Stack:** Astro 5, static Astro pages, existing `DeckLayout`, Playwright e2e tests, `npm run check`, `npm run build`.

---

## Context Pack

- 当前任务：基于已确认 spec 创建个人网站第三个 deck 的 implementation plan。
- 当前材料：`docs/superpowers/specs/2026-07-05-claude-code-ai-product-architecture-deck-design.md`，现有 `DeckLayout`，现有 `Personal Knowledge Harness` deck，AI 列表页和 Playwright 配置。
- 路由依据：读取了真实任务上下文加载规则、个人知识库 RAG 式上下文治理规则、正式知识域 README、正式知识域索引、工作领域 README、需求文档/技术分析/项目复盘 README。
- 最终加载：需求文档 README、技术分析 README、项目复盘 README、`PRD进入原型前交互封口清单`、`渐进式上下文加载`。`未封口系统线头状态看板`仅作为弱相关提醒，不进入实现任务主依据。
- 未加载：旧 `wiki/`、原文层、整份 4000 行聊天记录；当前 spec 已经抽象出可执行内容，计划不需要全量原文。
- 风险：本 deck 文案和图形密度较高，移动端代码块、底部 timeline 和 SVG 文字是主要验收风险。

## Spec-Readiness Gate

Source spec has no formal `prd-review spec-readiness: PASS`, so this plan runs the four checks directly:

- State combinations：页面状态清晰，只有静态 deck、AI 列表卡片、timeline active state、desktop/mobile layout；不涉及业务状态矩阵。
- Failure & concurrency：无并发写入；主要失败路径是 base path、route 404、移动端横向溢出、代码块不可读，均进入测试任务。
- Enum closure：路由、标题、10 屏结构、导航标签、AI 卡片 tags、测试命令均在本 plan 固定。
- Single source of truth：deck 内容以 spec 为唯一产品内容来源；实现文件承载展示，测试只校验可访问性、结构和关键文案。

Verdict：PASS，可以进入 implementation plan。

## File Structure

- Create `src/pages/ai/claude-code-architecture.astro`
  - Responsibility：new 10-section deck page, local section content, diagrams, code cards, timeline script.
- Modify `src/pages/ai/index.astro`
  - Responsibility：link the Claude Code card to the new deck and update title/hook/tags.
- Modify `src/pages/ai/knowledge-harness.astro`
  - Responsibility：add one small source-link in S2 from the existing origin slide to the new method deck, without changing the existing deck structure.
- Create `e2e/claude-code-architecture.spec.ts`
  - Responsibility：route, AI listing, deck structure, cross-link, and responsive layout checks.

## Deck Content Matrix

Use this matrix as the exact content source for `src/pages/ai/claude-code-architecture.astro`.

| Section | Chapter | Heading | Method line | Evidence |
| --- | --- | --- | --- | --- |
| `s1` | `AI 产品架构方法论` | `从 Claude Code 到 AI 产品架构` | `我拆开的不是一个 coding 工具，而是一套 AI 产品如何组织输入、工具、状态、权限与协作的工程方法。` | hub diagram: `system / messages / tools -> context / control / runtime / multi-agent` |
| `s2` | `02 · 第一性原理` | `模型看到的世界，其实很小` | `AI 产品经理设计的不是页面流程本身，而是模型能看到什么、不能看到什么，以及能选择哪些行动入口。` | code card with `client.messages.create({ system, messages, tools })` |
| `s3` | `03 · Agent Loop` | `不是固定流程，而是动态控制流` | `产品职责从编排固定步骤，转向设计可控的行动空间。` | loop diagram and code card with `while True -> stop_reason -> tool_use` |
| `s4` | `04 · Tool Interface` | `工具不是按钮，是给模型看的能力接口` | `功能要同时面向人类用户和模型：人要结果，模型要清晰的名称、description、参数边界和失败反馈。` | `schema -> tool_use -> handler -> tool_result` |
| `s5` | `05 · Context Architecture` | `上下文怎么进出，决定产品上限` | `关键不是让模型知道更多，而是让它每次只看到足够完成当前任务的最小上下文。` | three columns: subagent, skill, compact |
| `s6` | `06 · Control Plane` | `把控制权交给模型后，必须加控制层` | `AI 产品不能只设计模型能做什么，还要设计什么时候不能做、被拦后如何知道、失败后如何继续。` | `tool_use -> permission gate -> handler -> hook -> tool_result` |
| `s7` | `07 · Runtime Layer` | `把一次聊天，变成持续工作系统` | `任务不只是聊天里的待办项，而应该有生命周期、依赖关系、执行槽位和时间触发机制。` | cards: todo, task, background, cron |
| `s8` | `08 · Multi-Agent Layer` | `多 agent 是系统设计，不是多开模型` | `先设计组织结构和协作协议，再谈模型数量。` | `lead -> inbox -> request -> claim -> worktree -> MCP` |
| `s9` | `09 · Framework` | `我的 AI 产品架构框架` | `输入层、工具层、上下文层、控制层、运行时层，构成我看 AI 产品的基础地图。` | five-layer stack |
| `s10` | `10 · Practice` | `这套方法，后来落到我自己的系统里` | `Personal Knowledge Harness 不是凭空来的，而是这套源码学习方法论在个人工作系统上的一次落地。` | bridge cards linking Context, Control, Runtime, Multi-Agent to Knowledge Harness |

Timeline labels:

`封面`、`输入`、`循环`、`工具`、`上下文`、`控制`、`运行时`、`多 agent`、`框架`、`实践`

## Task 1: Link the AI Listing Card

**Files:**
- Modify: `src/pages/ai/index.astro`
- Create: `e2e/claude-code-architecture.spec.ts`

- [ ] **Step 1: Write the failing AI listing test**

Create `e2e/claude-code-architecture.spec.ts` with:

```ts
import { test, expect } from '@playwright/test';

test('AI listing links to Claude Code architecture deck', async ({ page }) => {
  await page.goto('/personal-website/ai/');
  const card = page.locator('.card', { hasText: '从 Claude Code 到 AI 产品架构' });
  await expect(card).toBeVisible();
  await expect(card).toContainText('AI 产品架构');
  await expect(card.locator('a')).toHaveAttribute('href', '/personal-website/ai/claude-code-architecture/');
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```bash
npx playwright test e2e/claude-code-architecture.spec.ts --grep "AI listing"
```

Expected: FAIL because the AI listing still shows `Claude Code 源码解析` without an `href`.

- [ ] **Step 3: Update the AI listing card**

In `src/pages/ai/index.astro`, replace the third `items` entry with:

```ts
  {
    title: '从 Claude Code 到 AI 产品架构',
    hook: '拆开 AI Coding Agent 源码，抽象出输入、工具、上下文、控制层与运行时的产品架构框架',
    tags: ['方法论', '源码学习', 'AI 产品架构'],
    href: `${base}ai/claude-code-architecture/`,
  },
```

The full `items` array should become:

```ts
const items = [
  { title: 'Personal Knowledge Harness', hook: '从上下文爆炸到三层知识库 × 多 agent 共用记忆——一个个人 AI 产品的完整决策史', tags: ['旗舰 deck', '架构设计', '已上线'], href: `${base}ai/knowledge-harness/` },
  { title: 'reading-dialogue Skill', hook: '把"读完就忘"变成结构化阅读对话', tags: ['工作流'] },
  {
    title: '从 Claude Code 到 AI 产品架构',
    hook: '拆开 AI Coding Agent 源码，抽象出输入、工具、上下文、控制层与运行时的产品架构框架',
    tags: ['方法论', '源码学习', 'AI 产品架构'],
    href: `${base}ai/claude-code-architecture/`,
  },
];
```

- [ ] **Step 4: Run the listing test and verify it passes**

Run:

```bash
npx playwright test e2e/claude-code-architecture.spec.ts --grep "AI listing"
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/ai/index.astro e2e/claude-code-architecture.spec.ts
git commit -m "feat: link Claude Code architecture deck"
```

## Task 2: Create the Deck Route and Core Structure

**Files:**
- Create: `src/pages/ai/claude-code-architecture.astro`
- Modify: `e2e/claude-code-architecture.spec.ts`

- [ ] **Step 1: Extend the failing deck structure test**

Append these tests to `e2e/claude-code-architecture.spec.ts`:

```ts
test('Claude Code architecture deck has ten method sections', async ({ page }) => {
  await page.goto('/personal-website/ai/claude-code-architecture/');
  await expect(page.getByRole('heading', { name: '从 Claude Code 到 AI 产品架构' })).toBeVisible();
  await expect(page.locator('main#deck section')).toHaveCount(10);
  await expect(page.locator('#s2')).toContainText('模型看到的世界');
  await expect(page.locator('#s5')).toContainText('上下文怎么进出');
  await expect(page.locator('#s9')).toContainText('我的 AI 产品架构框架');
});

test('Claude Code architecture deck exposes timeline labels', async ({ page }) => {
  await page.goto('/personal-website/ai/claude-code-architecture/');
  const timeline = page.locator('nav.timeline');
  await expect(timeline).toBeVisible();
  for (const label of ['封面', '输入', '循环', '工具', '上下文', '控制', '运行时', '多 agent', '框架', '实践']) {
    await expect(timeline).toContainText(label);
  }
});
```

- [ ] **Step 2: Run the new tests and verify they fail**

Run:

```bash
npx playwright test e2e/claude-code-architecture.spec.ts --grep "deck"
```

Expected: FAIL because `/personal-website/ai/claude-code-architecture/` does not exist.

- [ ] **Step 3: Create the Astro page shell and ten concrete sections**

Create `src/pages/ai/claude-code-architecture.astro` with this frontmatter, layout wrapper, timeline, and observer script:

```astro
---
import DeckLayout from '../../layouts/DeckLayout.astro';
const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
---
<DeckLayout
  title="从 Claude Code 到 AI 产品架构 — QQ星"
  description="我从 AI Coding Agent 源码里抽象出的可迁移产品架构方法"
>
  <main id="deck" class="method-deck"></main>

  <nav class="timeline" id="tl" aria-label="Deck timeline">
    {[
      ['s1', '封面'],
      ['s2', '输入'],
      ['s3', '循环'],
      ['s4', '工具'],
      ['s5', '上下文'],
      ['s6', '控制'],
      ['s7', '运行时'],
      ['s8', '多 agent'],
      ['s9', '框架'],
      ['s10', '实践'],
    ].map(([id, label]) => (
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
</DeckLayout>
```

Inside `<main id="deck" class="method-deck">`, add ten concrete `section` elements with ids `s1` through `s10`. Use the Deck Content Matrix above as the source of truth for every section's chapter, heading, method line, and evidence. Use this exact pattern for method sections that have left copy and right evidence:

```astro
<section id="s2">
  <div class="chapter">02 · 第一性原理</div>
  <h2>模型看到的世界，<em>其实很小</em></h2>
  <div class="split">
    <div class="method-copy">
      <div class="lens">关键认知</div>
      <p>再复杂的 harness，最终也只是把信息塞进 <code>system</code>、<code>messages</code> 和 <code>tools</code>。</p>
      <div class="method-card">
        <span>方法论抽象</span>
        <p>AI 产品经理设计的不是页面流程本身，而是模型能看到什么、不能看到什么，以及能选择哪些行动入口。</p>
      </div>
    </div>
    <div class="figure evidence">
      <div class="fig-label">源码证据</div>
      <pre><code>response = client.messages.create(
    system=SYSTEM,
    messages=messages,
    tools=TOOLS,
)</code></pre>
    </div>
  </div>
</section>
```

For the other sections, use the same `split -> method-copy + figure` structure and the exact text from the Deck Content Matrix. Section-specific evidence requirements:

- `s1`: use `h1` and two `.sub` lines, then a `.architecture-orbit` figure with center label `AI Product Architecture` and five nodes: `system`, `messages`, `tools`, `context`, `runtime`.
- `s3`: include a `pre` block with the `while True` snippet from the spec and a `.flow-row` showing `model -> tool_use -> tool_result -> next turn`.
- `s4`: include `.flow-row` showing `schema -> tool_use -> handler -> tool_result` and a `pre` block with `TOOL_HANDLERS[block.name](**block.input)`.
- `s5`: include three `.mini-card` items with titles `Subagent`, `Skill`, `Compact`.
- `s6`: include `.flow-row` showing `tool_use -> permission gate -> handler -> hook -> tool_result`.
- `s7`: include four `.mini-card` items with titles `Todo`, `Task`, `Background`, `Cron`.
- `s8`: include `.flow-row.wide` showing `lead -> inbox -> request -> claim -> worktree -> MCP`.
- `s9`: include five `.layer-row` items: `输入层`, `工具层`, `上下文层`, `控制层`, `运行时层`.
- `s10`: include four `.mini-card` bridge items and a link with text `查看 Personal Knowledge Harness` using `href={`${base}ai/knowledge-harness/`}`.

The S1 and S10 links need concrete markup:

```astro
<section id="s1">
  <div class="chapter">AI 产品架构方法论</div>
  <h1>从 Claude Code 到 AI 产品架构</h1>
  <p class="sub" style="margin-top:1.4rem">我拆开的不是一个 coding 工具，<br>而是一套 AI 产品如何组织输入、工具、状态、权限与协作的工程方法。</p>
  <p class="sub" style="margin-top:1.2rem; font-size:0.88rem">system / messages / tools ─── context ─── control ─── runtime ─── multi-agent</p>
  <div class="figure architecture-orbit" aria-label="AI product architecture orbit">
    <strong>AI Product<br />Architecture</strong>
    <span>system</span><span>messages</span><span>tools</span><span>context</span><span>runtime</span>
  </div>
  <div class="scroll-hint">↓ 滚动进入框架</div>
</section>

<section id="s10">
  <div class="chapter">10 · Practice</div>
  <h2>这套方法，<em>后来落到我自己的系统里</em></h2>
  <div class="split">
    <div class="method-copy">
      <div class="lens">关键认知</div>
      <p>Personal Knowledge Harness 不是凭空来的，而是这套 AI 产品架构方法在个人工作系统上的一次落地。</p>
      <div class="method-card">
        <span>方法论抽象</span>
        <p>AI 产品的真正设计对象，不是模型本身，而是模型周围那套让它可靠工作的环境。</p>
      </div>
      <a class="bridge-link" href={`${base}ai/knowledge-harness/`}>查看 Personal Knowledge Harness</a>
    </div>
    <div class="figure evidence">
      <div class="fig-label">实践映射</div>
      <div class="mini-grid">
        <div class="mini-card"><b>Context</b><p>三层知识库与 context-pack。</p></div>
        <div class="mini-card"><b>Control</b><p>能力层、加载规则、入库门禁。</p></div>
        <div class="mini-card"><b>Runtime</b><p>skill 工作流、复盘、计划。</p></div>
        <div class="mini-card"><b>Multi-Agent</b><p>Claude、Codex、OpenClaw 共用记忆。</p></div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 4: Add page-local styles**

At the end of the new Astro file, add:

```astro
<style>
  .method-deck code {
    color: #dbeafe;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  }
  .method-copy {
    display: grid;
    gap: 0.95rem;
    max-width: 460px;
  }
  .lens,
  .fig-label {
    color: var(--c-cyan);
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }
  .method-copy > p {
    color: var(--text);
    font-size: 1rem;
    line-height: 1.78;
  }
  .method-card,
  .mini-card,
  .layer-row {
    border: 1px solid var(--glass-border);
    background: rgba(255,255,255,0.045);
    border-radius: 14px;
    padding: 0.95rem 1rem;
  }
  .method-card span,
  .mini-card b,
  .layer-row b {
    display: block;
    color: var(--c-decide);
    font-size: 0.82rem;
    margin-bottom: 0.35rem;
  }
  .method-card p,
  .mini-card p,
  .layer-row span {
    color: var(--text-dim);
    font-size: 0.9rem;
    line-height: 1.65;
  }
  .evidence pre {
    margin-top: 0.8rem;
    overflow-x: auto;
    color: #dbeafe;
    background: rgba(4, 8, 18, 0.62);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 12px;
    padding: 1rem;
    font-size: 0.8rem;
    line-height: 1.65;
  }
  .flow-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    align-items: center;
    justify-content: center;
    margin-top: 0.9rem;
  }
  .flow-row span,
  .architecture-orbit span {
    color: var(--text);
    border: 1px solid rgba(79,140,255,0.38);
    background: rgba(79,140,255,0.12);
    border-radius: 999px;
    padding: 0.42rem 0.72rem;
    font-size: 0.78rem;
    white-space: nowrap;
  }
  .flow-row i {
    color: var(--text-dim);
    font-style: normal;
  }
  .mini-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.8rem;
    margin-top: 0.9rem;
  }
  .layer-stack {
    display: grid;
    gap: 0.55rem;
    margin-top: 0.8rem;
  }
  .bridge-link {
    color: var(--text);
    text-decoration: none;
    border: 1px solid rgba(34,211,238,0.42);
    background: rgba(34,211,238,0.1);
    border-radius: 999px;
    padding: 0.58rem 1rem;
    display: inline-flex;
    width: fit-content;
    margin-top: 1rem;
  }
  .architecture-orbit {
    min-height: 280px;
    display: grid;
    place-items: center;
    position: relative;
  }
  .architecture-orbit strong {
    display: grid;
    place-items: center;
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background: rgba(139,92,246,0.16);
    border: 1px solid rgba(139,92,246,0.48);
    text-align: center;
    line-height: 1.35;
  }
  .architecture-orbit span {
    position: absolute;
  }
  .architecture-orbit span:nth-of-type(1) { top: 1rem; left: 50%; transform: translateX(-50%); }
  .architecture-orbit span:nth-of-type(2) { left: 1rem; top: 45%; }
  .architecture-orbit span:nth-of-type(3) { right: 1rem; top: 45%; }
  .architecture-orbit span:nth-of-type(4) { left: 25%; bottom: 1.2rem; }
  .architecture-orbit span:nth-of-type(5) { right: 25%; bottom: 1.2rem; }
  @media (max-width: 860px) {
    .method-copy { max-width: 100%; }
    .mini-grid { grid-template-columns: 1fr; }
    .evidence pre {
      max-width: min(88vw, 480px);
      font-size: 0.72rem;
    }
    .architecture-orbit {
      min-height: 230px;
    }
    .architecture-orbit strong {
      width: 118px;
      height: 118px;
      font-size: 0.86rem;
    }
    .architecture-orbit span {
      font-size: 0.68rem;
      padding: 0.35rem 0.55rem;
    }
  }
</style>
```

- [ ] **Step 5: Run the deck structure tests**

Run:

```bash
npx playwright test e2e/claude-code-architecture.spec.ts --grep "deck"
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/pages/ai/claude-code-architecture.astro e2e/claude-code-architecture.spec.ts
git commit -m "feat: add Claude Code architecture deck"
```

## Task 3: Add Cross-Link Between Method Deck and Knowledge Harness

**Files:**
- Modify: `src/pages/ai/knowledge-harness.astro`
- Modify: `src/pages/ai/claude-code-architecture.astro`
- Modify: `e2e/claude-code-architecture.spec.ts`

- [ ] **Step 1: Add failing cross-link tests**

Append:

```ts
test('method deck links to Knowledge Harness practice deck', async ({ page }) => {
  await page.goto('/personal-website/ai/claude-code-architecture/');
  await expect(page.locator('#s10 a', { hasText: '查看 Personal Knowledge Harness' })).toHaveAttribute(
    'href',
    '/personal-website/ai/knowledge-harness/'
  );
});

test('Knowledge Harness origin slide links back to method deck', async ({ page }) => {
  await page.goto('/personal-website/ai/knowledge-harness/');
  await expect(page.locator('#s2 a', { hasText: '源码方法论篇' })).toHaveAttribute(
    'href',
    '/personal-website/ai/claude-code-architecture/'
  );
});
```

- [ ] **Step 2: Run the cross-link tests and verify failure**

Run:

```bash
npx playwright test e2e/claude-code-architecture.spec.ts --grep "links"
```

Expected: first test passes if Task 2 added the S10 link; second test fails until `knowledge-harness.astro` is updated.

- [ ] **Step 3: Add the reverse link to Knowledge Harness S2**

In `src/pages/ai/knowledge-harness.astro`, line near S2 after the decision row, add:

```astro
        <a class="source-link" href={`${import.meta.env.BASE_URL.replace(/\/?$/, '/')}ai/claude-code-architecture/`}>源码方法论篇</a>
```

Add this local style before the closing `</DeckLayout>` if no page-local style exists, or append to an existing page-local style block:

```astro
<style>
  .source-link {
    color: var(--text);
    text-decoration: none;
    border: 1px solid rgba(34,211,238,0.38);
    background: rgba(34,211,238,0.09);
    border-radius: 999px;
    padding: 0.5rem 0.9rem;
    font-size: 0.82rem;
    width: fit-content;
  }
  .source-link:hover {
    border-color: rgba(34,211,238,0.72);
  }
</style>
```

If the implementation worker prefers not to compute `base` inline, add this frontmatter line after the import:

```astro
const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
```

Then use:

```astro
        <a class="source-link" href={`${base}ai/claude-code-architecture/`}>源码方法论篇</a>
```

- [ ] **Step 4: Run the cross-link tests**

Run:

```bash
npx playwright test e2e/claude-code-architecture.spec.ts --grep "links"
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/ai/knowledge-harness.astro src/pages/ai/claude-code-architecture.astro e2e/claude-code-architecture.spec.ts
git commit -m "feat: connect method and practice decks"
```

## Task 4: Responsive Layout and Visual Guard Tests

**Files:**
- Modify: `e2e/claude-code-architecture.spec.ts`
- Modify: `src/pages/ai/claude-code-architecture.astro`

- [ ] **Step 1: Add responsive guard tests**

Append:

```ts
test('method deck has no horizontal overflow on desktop and mobile', async ({ page }) => {
  for (const viewport of [
    { width: 1280, height: 800 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/personal-website/ai/claude-code-architecture/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(overflow).toBe(false);
  }
});

test('mobile deck keeps code snippets readable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/personal-website/ai/claude-code-architecture/#s2');
  const codeBox = page.locator('#s2 pre').first();
  await expect(codeBox).toBeVisible();
  const box = await codeBox.boundingBox();
  expect(box?.width).toBeLessThanOrEqual(360);
});
```

- [ ] **Step 2: Run responsive tests and inspect failures**

Run:

```bash
npx playwright test e2e/claude-code-architecture.spec.ts --grep "overflow|mobile"
```

Expected: PASS if Task 2 CSS is sufficient. If FAIL, continue with Step 3.

- [ ] **Step 3: Apply fixed-width safeguards when needed**

If the overflow test fails, add these CSS rules to `src/pages/ai/claude-code-architecture.astro`:

```css
.method-deck .figure,
.method-deck .method-copy,
.method-deck pre,
.method-deck .flow-row {
  min-width: 0;
}
.method-deck pre code {
  white-space: pre;
}
@media (max-width: 520px) {
  .method-deck .figure {
    width: min(100%, 480px);
    padding: 1rem;
  }
  .method-deck .flow-row {
    justify-content: flex-start;
  }
}
```

- [ ] **Step 4: Re-run responsive tests**

Run:

```bash
npx playwright test e2e/claude-code-architecture.spec.ts --grep "overflow|mobile"
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/ai/claude-code-architecture.astro e2e/claude-code-architecture.spec.ts
git commit -m "test: cover Claude Code deck responsive layout"
```

## Task 5: Final Build, Type Check, and Regression Pass

**Files:**
- Verify: `src/pages/ai/claude-code-architecture.astro`
- Verify: `src/pages/ai/index.astro`
- Verify: `src/pages/ai/knowledge-harness.astro`
- Verify: `e2e/claude-code-architecture.spec.ts`

- [ ] **Step 1: Run Astro check**

Run:

```bash
npm run check
```

Expected: completes without Astro or TypeScript errors.

- [ ] **Step 2: Run production build**

Run:

```bash
npm run build
```

Expected: build completes and includes `/personal-website/ai/claude-code-architecture/`.

- [ ] **Step 3: Run all Playwright tests**

Run:

```bash
npx playwright test
```

Expected: all existing and new tests pass.

- [ ] **Step 4: Capture manual QA screenshots**

Run:

```bash
npm run dev
```

Open these URLs manually or with Playwright:

- `http://localhost:4321/personal-website/ai/`
- `http://localhost:4321/personal-website/ai/claude-code-architecture/`
- `http://localhost:4321/personal-website/ai/knowledge-harness/`

Check:

- AI listing card title, hook, tags, and link are correct.
- New deck has exactly ten screens.
- S2, S3, S4, S6 include short code or flow evidence.
- S10 links to Knowledge Harness.
- Knowledge Harness S2 links back to the method deck.
- Mobile width 390px has no overlapping title, code block, figure, or timeline.

- [ ] **Step 5: Commit final fixes if any**

If Step 1-4 require code changes:

```bash
git add src/pages/ai/claude-code-architecture.astro src/pages/ai/index.astro src/pages/ai/knowledge-harness.astro e2e/claude-code-architecture.spec.ts
git commit -m "fix: polish Claude Code architecture deck"
```

If no code changes were needed, do not create an empty commit.

## Self-Review

Spec coverage:

- New route `/ai/claude-code-architecture/`: Task 2.
- AI listing card link and copy: Task 1.
- Ten deck screens and timeline: Task 2.
- Medium source-code evidence density: Task 2 content requirements and Task 2 tests.
- Knowledge Harness connection: Task 3.
- Desktop/mobile layout checks: Task 4.
- Build and regression verification: Task 5.

Placeholder scan:

- Plan uses concrete file paths, commands, expected results, section copy, timeline labels, section evidence requirements, and test code.
- Task 2 fixes the deck structure, S1 markup, S10 markup, and exact content matrix before execution starts.

Type and path consistency:

- Route path uses Astro file `src/pages/ai/claude-code-architecture.astro`.
- Tests use deployed base path `/personal-website/ai/claude-code-architecture/`.
- AI listing uses `base` exactly like existing `knowledge-harness` card.
