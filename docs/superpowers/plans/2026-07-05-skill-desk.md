# Skill Desk Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/ai/skill-desk/` Skill Desk homepage and `/ai/skill-desk/reading-dialogue/` flagship page, then connect them from the AI listing and the Zhi Shen Ding Nei deck.

**Architecture:** Use the existing Astro static-site pattern. Put reusable Skill Desk content in one data module, render the homepage with `BaseLayout`, render the flagship reading-dialogue story with `DeckLayout`, and keep all page-specific styling scoped to the new pages. Add a new Playwright spec so existing dirty test files do not need to be touched.

**Tech Stack:** Astro 5, static Astro pages, existing `BaseLayout` and `DeckLayout`, TypeScript data module, Playwright e2e, `npm run check`, `npm run build`.

---

## Context Pack

- 当前任务：基于 `docs/superpowers/specs/2026-07-05-skill-desk-design.md` 生成实施计划。
- 当前材料：Skill Desk spec、现有 AI 列表页、`BaseLayout`、`DeckLayout`、现有 deck 测试模式、Playwright 配置。
- 路由依据：读取了 `writing-plans` 稳定入口、真实任务上下文加载规则、个人知识库 RAG 式上下文治理规则、正式知识域 README、正式知识域索引、工作领域 README、需求文档 README、技术分析 README、项目复盘 README。
- 最终加载：`未封口系统线头状态看板`、`PRD到Spec的正交检查规则`、`基于现有页面的高保真原型工作流`、`通用原型设计工作流`、`需求文档/README.md`。
- 未加载：旧 `wiki/` 未加载，因为新 spec、现有代码和新库规则足够；原文层未整篇加载，因为本计划不需要核验阅读原文；竞品/需求分析正式卡未加载，因为本次是静态页面实施计划，不是产品方案判断。
- 风险：当前工作区有用户已有 `.gitignore` 修改，执行本计划时不要把它纳入 Skill Desk 相关提交；若执行时发现其他未提交文件，先确认是否与当前任务相关。

## Spec-Readiness Gate

Source spec has no formal `prd-review spec-readiness: PASS`, so this plan runs the four checks directly:

- State combinations：页面状态只有静态 listing、Skill Desk homepage、reading-dialogue flagship deck、timeline active state、desktop/mobile layout、inter-page links；每类状态都有明确验收测试。
- Failure & concurrency：无数据写入和并发；主要失败路径是 route 404、GitHub Pages base path 错误、卡片链接缺失、移动端横向溢出、文本遮挡和现有 deck 回链缺失，均进入 Playwright 测试。
- Enum closure：路由、6 个首页 skill 卡片、10 个旗舰 section、tabs 文案、成熟度、产品化标签、互链文案、验证命令均在 spec 和本 plan 固定。
- Single source of truth：Skill Desk 内容以 `src/data/skillDesk.ts` 为页面内容真值源；首页和旗舰页从该模块读取；测试只校验用户可见文案、路由和布局。

Verdict：PASS，可以进入 implementation plan。

## Scope Check

本计划只实现第一版 Skill Desk：

- 新增 `/ai/skill-desk/` 首页。
- 新增 `/ai/skill-desk/reading-dialogue/` 旗舰子页。
- 更新 `/ai/` 列表卡片。
- 给 `/ai/zhi-shen-ding-nei/` 增加回链。
- 新增 Playwright 覆盖和最终构建验证。

不实现其他 skill 子页，不创建开源仓库，不修改 Obsidian Vault，不修改 shared skill。

## Page Relationship Matrix

| 页面 | 类型 | 本计划动作 | 验收 |
| --- | --- | --- | --- |
| `/ai/` | 现有列表页 | 把 `reading-dialogue Skill` 占位替换为 `Skill Desk` 链接卡 | AI listing test |
| `/ai/skill-desk/` | 新建首页 | 展示 6 个 skill、筛选结构、旗舰入口、产品化候选区 | homepage tests |
| `/ai/skill-desk/reading-dialogue/` | 新建旗舰页 | 展示 10 section、timeline、pipeline、档位/刹车/门禁/产品化判断 | flagship tests |
| `/ai/zhi-shen-ding-nei/` | 现有 deck | 在 S10 增加 `reading-dialogue` Skill Desk 回链 | cross-link test |

## Existing Structure To Preserve

- 保留现有 `/ai/knowledge-harness/`、`/ai/claude-code-architecture/`、`/ai/zhi-shen-ding-nei/` 主体内容和路由。
- 保留 `BaseLayout`、`DeckLayout`、`Card`、`SectionGrid` 全局行为，不做无关重构。
- 不触碰当前用户已有 `.gitignore` 修改。
- 不修改现有 `e2e/zhi-shen-ding-nei.spec.ts`，避免和可能的用户改动相撞；新增 `e2e/skill-desk.spec.ts` 承接本功能测试。

## File Structure

- Create `src/data/skillDesk.ts`
  - Responsibility：central Skill Desk content source, including homepage cards, tabs, stats, productization lanes, reading-dialogue section matrix, and timeline labels.
- Modify `src/pages/ai/index.astro`
  - Responsibility：replace the old single `reading-dialogue Skill` placeholder with the `Skill Desk` listing card.
- Create `src/pages/ai/skill-desk/index.astro`
  - Responsibility：render the Skill Desk homepage using `BaseLayout` and `skillDeskItems`.
- Create `src/pages/ai/skill-desk/reading-dialogue.astro`
  - Responsibility：render the 10-section reading-dialogue flagship story using `DeckLayout` and `readingDialogueSections`.
- Modify `src/pages/ai/zhi-shen-ding-nei.astro`
  - Responsibility：add one backlink from S10 to the reading-dialogue flagship page.
- Create `e2e/skill-desk.spec.ts`
  - Responsibility：cover listing route, homepage content, flagship deck content, cross-links, and responsive overflow.

## Task 1: Link The AI Listing To Skill Desk

**Files:**
- Create: `e2e/skill-desk.spec.ts`
- Modify: `src/pages/ai/index.astro`

- [ ] **Step 1: Write the failing Skill Desk route tests**

Create `e2e/skill-desk.spec.ts` with this content:

```ts
import { test, expect } from '@playwright/test';

test('AI listing links to Skill Desk', async ({ page }) => {
  await page.goto('/personal-website/ai/');
  const card = page.locator('.card', { hasText: 'Skill Desk' });
  await expect(card).toBeVisible();
  await expect(card).toContainText('常用技能');
  await expect(card).toContainText('可产品化');
  await expect(card).toHaveAttribute('href', '/personal-website/ai/skill-desk/');
  await expect(page.locator('.card', { hasText: 'reading-dialogue Skill' })).toHaveCount(0);
});

test('Skill Desk homepage shows six skill cards and the flagship entry', async ({ page }) => {
  await page.goto('/personal-website/ai/skill-desk/');
  await expect(page.getByRole('heading', { name: 'Skill Desk' })).toBeVisible();
  await expect(page.locator('.skill-card')).toHaveCount(6);
  await expect(page.locator('.desk-tabs')).toContainText('阅读与沉淀');
  await expect(page.locator('.desk-tabs')).toContainText('PRD / Spec');
  await expect(page.locator('.skill-card', { hasText: '深度阅读对话' })).toContainText('稳定使用');
  await expect(page.locator('.skill-card', { hasText: '深度阅读对话' })).toHaveAttribute(
    'href',
    '/personal-website/ai/skill-desk/reading-dialogue/'
  );
  await expect(page.locator('.product-lane')).toContainText('GitHub 开源项目');
  await expect(page.locator('.harness-link')).toHaveAttribute('href', '/personal-website/ai/knowledge-harness/');
});

test('reading-dialogue flagship has ten sections and core controls', async ({ page }) => {
  await page.goto('/personal-website/ai/skill-desk/reading-dialogue/');
  await expect(page.getByRole('heading', { name: 'reading-dialogue Skill：把深度阅读变成知识生产' })).toBeVisible();
  await expect(page.locator('main#deck section')).toHaveCount(10);
  await expect(page.locator('#s4')).toContainText('事故现场：《置身钉内》里的失控');
  await expect(page.locator('#s6')).toContainText('划线交流档');
  await expect(page.locator('#s7')).toContainText('单条划线最多两轮');
  await expect(page.locator('#s8')).toContainText('候选池，不直接制卡');
  await expect(page.locator('#s9')).toContainText('入库门禁');
  await expect(page.locator('#s10')).toContainText('开源潜力');
});

test('reading-dialogue flagship exposes timeline labels', async ({ page }) => {
  await page.goto('/personal-website/ai/skill-desk/reading-dialogue/');
  const timeline = page.locator('nav.timeline');
  await expect(timeline).toBeVisible();
  for (const label of ['入口', '问题', '直觉', '事故', '反思', '档位', '刹车', '候选', '门禁', '资产']) {
    await expect(timeline).toContainText(label);
  }
});

test('Skill Desk and Zhi Shen Ding Nei decks cross-link', async ({ page }) => {
  await page.goto('/personal-website/ai/skill-desk/reading-dialogue/');
  await expect(page.locator('#s10 a', { hasText: '查看一次真实阅读产出的产品判断' })).toHaveAttribute(
    'href',
    '/personal-website/ai/zhi-shen-ding-nei/'
  );

  await page.goto('/personal-website/ai/zhi-shen-ding-nei/');
  await expect(page.locator('#s10 a', { hasText: '查看这套阅读方法如何被做成 skill' })).toHaveAttribute(
    'href',
    '/personal-website/ai/skill-desk/reading-dialogue/'
  );
});

test('Skill Desk pages have no horizontal overflow on desktop and mobile', async ({ page }) => {
  for (const route of ['/personal-website/ai/skill-desk/', '/personal-website/ai/skill-desk/reading-dialogue/']) {
    for (const viewport of [
      { width: 1280, height: 800 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto(route);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      expect(overflow).toBe(false);
    }
  }
});
```

- [ ] **Step 2: Run the listing test and verify it fails**

Run:

```bash
npx playwright test e2e/skill-desk.spec.ts --grep "AI listing"
```

Expected: FAIL because `/personal-website/ai/` still shows `reading-dialogue Skill` without a `Skill Desk` link.

- [ ] **Step 3: Update the AI listing card**

Replace the `items` array in `src/pages/ai/index.astro` with:

```astro
const items = [
  { title: 'Personal Knowledge Harness', hook: '从上下文爆炸到三层知识库 × 多 agent 共用记忆——一个个人 AI 产品的完整决策史', tags: ['旗舰 deck', '架构设计', '已上线'], href: `${base}ai/knowledge-harness/` },
  {
    title: 'Skill Desk',
    hook: '把深度阅读、复盘、PRD、竞品分析等高频 AI workflow 设计成可复用 skill',
    tags: ['常用技能', '工作流', '可产品化'],
    href: `${base}ai/skill-desk/`,
  },
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
npx playwright test e2e/skill-desk.spec.ts --grep "AI listing"
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/ai/index.astro e2e/skill-desk.spec.ts
git commit -m "feat: link Skill Desk from AI listing"
```

## Task 2: Add Skill Desk Data And Homepage

**Files:**
- Create: `src/data/skillDesk.ts`
- Create: `src/pages/ai/skill-desk/index.astro`
- Test: `e2e/skill-desk.spec.ts`

- [ ] **Step 1: Run the homepage test and verify it fails**

Run:

```bash
npx playwright test e2e/skill-desk.spec.ts --grep "homepage"
```

Expected: FAIL because `/personal-website/ai/skill-desk/` does not exist.

- [ ] **Step 2: Create the Skill Desk data module**

Create `src/data/skillDesk.ts`:

```ts
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

export const deskTabs = ['全部', '阅读与沉淀', '复盘', 'PRD / Spec', '研究与分析', '产品化候选'];

export const skillDeskItems: SkillDeskItem[] = [
  {
    slug: 'reading-dialogue',
    name: 'reading-dialogue',
    title: '深度阅读对话',
    problem: '读完长文后，触动、质疑和迁移灵感容易散掉。',
    category: '阅读与沉淀',
    useCases: ['划线交流', '主题深挖', '候选卡片池', '知识入库'],
    outputs: ['阅读对话笔记', '候选卡片', '入库门禁', '裁决记录'],
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
    problem: '静态周报离人太远，需要报告后自动进入一题一题的反思对话。',
    category: '复盘',
    useCases: ['周报后反思', '系统候选草稿', '复盘补充区'],
    outputs: ['反思入口', '普通小结', '系统候选', '写回补充区'],
    maturity: 'iterating',
    maturityLabel: '迭代中',
    productization: 'team-template',
    productizationLabel: '团队模板',
  },
  {
    slug: 'prd-writer',
    name: 'prd-writer',
    title: 'PRD 写作',
    problem: '模糊需求需要先关闭用户、价值、边界和模糊词，再进入开发链路。',
    category: 'PRD / Spec',
    useCases: ['需求澄清', 'PRD 成稿', '模糊词扫描'],
    outputs: ['PRD 草稿', '待确认清单', 'spec-readiness 信号'],
    maturity: 'stable',
    maturityLabel: '稳定使用',
    productization: 'team-template',
    productizationLabel: '团队模板',
  },
  {
    slug: 'prd-review',
    name: 'prd-review',
    title: 'PRD 审查',
    problem: '结构漂亮的 PRD 仍可能缺状态组合、失败路径、枚举关闭和单一真相。',
    category: 'PRD / Spec',
    useCases: ['spec-readiness', '边界条件', '状态组合', '验收矩阵'],
    outputs: ['审查等级', 'Blocker 清单', '回填建议'],
    maturity: 'stable',
    maturityLabel: '稳定使用',
    productization: 'enterprise-candidate',
    productizationLabel: '企业候选',
  },
  {
    slug: 'competitive-analysis',
    name: 'competitive-analysis',
    title: '竞品分析',
    problem: '竞品报告不能只堆功能，需要从产品负责人视角判断机会和取舍。',
    category: '研究与分析',
    useCases: ['竞品选择', '差异化机会', '报告结构'],
    outputs: ['竞品报告', '机会判断', '需求转化建议'],
    maturity: 'stable',
    maturityLabel: '稳定使用',
    productization: 'team-template',
    productizationLabel: '团队模板',
  },
  {
    slug: 'digest',
    name: 'digest',
    title: '对话沉淀',
    problem: '有价值的对话如果不裁决去向，会污染正式知识域或丢在聊天里。',
    category: '阅读与沉淀',
    useCases: ['对话整理', '经验沉淀', '三层知识库写回'],
    outputs: ['原文层材料', '正式知识卡', '能力层候选'],
    maturity: 'iterating',
    maturityLabel: '迭代中',
    productization: 'personal',
    productizationLabel: '个人工作流',
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
  ['s8', '候选'],
  ['s9', '门禁'],
  ['s10', '资产'],
] as const;

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
    insight: '第一版思路是围绕划线、批注和触动点连续追问，让读者从“这句重要”说到“它为什么对我重要”。',
    points: ['先问为什么划这句。', '再问认同、反感、意外还是联想到工作。', '把模糊感受压成可以记录的最小判断。'],
    visualTitle: '追问分叉',
    visualItems: ['划线', '为什么触动', '前提与反例', '行动灵感'],
  },
  {
    id: 's4',
    label: '04 · 事故现场',
    chapter: 'Failure Case',
    heading: '事故现场：《置身钉内》里的失控',
    insight: '多轮深聊很有价值，但没有边界时会从阅读讨论滑到产品共创。',
    points: ['话题从阅读感受进入企业 AI 和责任流。', '继续推进后出现 AI 提醒小助手、V0、owner、风险池和指标。', '这暴露了一个问题：深度阅读 skill 需要知道什么时候已经切档。'],
    visualTitle: '讨论偏航',
    visualItems: ['阅读交流', '主题深挖', '产品共创', '流程设计'],
  },
  {
    id: 's5',
    label: '05 · 关键反思',
    chapter: 'Reflection',
    heading: '关键反思：深度不是无限展开',
    insight: '真正的深度不是一直追问，而是知道此刻处在什么档位，并在到点时停靠确认。',
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
    points: ['划线交流档围绕具体划线和批注聊为什么触动。', '主题深挖档围绕一个主题连续追问。', '产品共创档一旦出现页面、V0、指标或流程，就必须提醒用户正在切档。'],
    visualTitle: '三档状态机',
    visualItems: ['划线交流档', '主题深挖档', '产品共创档'],
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
    heading: '实现三：候选池，不直接制卡',
    insight: '阅读结束后先生成阅读对话笔记和候选卡片池，不把漂亮总结直接写进正式知识域。',
    points: ['用户原话、AI 推断、共创结论分开记录。', '不满足门槛的内容留在阅读笔记或原文层。', '正式卡片必须先确认观点、原因、边界、路由和来源。'],
    visualTitle: '三栏归因',
    visualItems: ['用户原话', 'AI 推断', '共创结论', '暂不沉淀'],
  },
  {
    id: 's9',
    label: '09 · 实现四',
    chapter: 'Control 04',
    heading: '实现四：入库门禁与卡片裁决',
    insight: '候选要判断新增、追加、合并、暂缓、丢弃或留原文层。正式入库后还要维护索引。',
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
    points: ['当前形态是个人深度阅读 workflow。', '团队复用潜力高，适合读书会、行业研究和产品复盘。', '开源潜力中高，可抽象成 Markdown-first pipeline、CLI、模板和裁决表。'],
    visualTitle: '产品化判断',
    visualItems: ['个人 workflow', '团队模板', '开源潜力', '企业级潜力'],
  },
];
```

- [ ] **Step 3: Create the Skill Desk homepage**

Create `src/pages/ai/skill-desk/index.astro`:

```astro
---
import BaseLayout from '../../../layouts/BaseLayout.astro';
import { deskTabs, productLanes, skillDeskItems } from '../../../data/skillDesk';

const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
const stableCount = skillDeskItems.filter((item) => item.maturity === 'stable').length;
const iteratingCount = skillDeskItems.filter((item) => item.maturity === 'iterating').length;
const productCount = skillDeskItems.filter((item) => item.productization !== 'personal').length;
const hrefFor = (href?: string) => href ? `${base}${href.replace(/^\//, '')}` : undefined;
---
<BaseLayout
  title="Skill Desk — QQ星"
  description="把实用 AI workflow 拆成可解释、可验证、可继续产品化的 skill 方法库"
>
  <section class="section-pad skill-desk-page">
    <div class="container">
      <div class="desk-hero reveal">
        <p class="eyebrow">AI Workflow Method Library</p>
        <h1>Skill Desk</h1>
        <p class="hero-copy">把深度阅读、复盘、PRD、竞品分析等高频 AI workflow 拆成可解释、可验证、可继续产品化的 agent skill。</p>
        <div class="desk-stats" aria-label="Skill Desk stats">
          <div><strong>{stableCount}</strong><span>已稳定使用</span></div>
          <div><strong>{iteratingCount}</strong><span>迭代中</span></div>
          <div><strong>{productCount}</strong><span>可产品化候选</span></div>
        </div>
      </div>

      <nav class="desk-tabs reveal" aria-label="Skill categories">
        {deskTabs.map((tab) => <a href={`#${tab === '全部' ? 'all' : tab}`}>{tab}</a>)}
      </nav>

      <div id="all" class="desk-grid">
        {skillDeskItems.map((item, index) => {
          const href = hrefFor(item.href);
          return href ? (
            <a class="skill-card reveal flagship-card" data-delay={String((index % 3) + 1)} href={href}>
              <span class="card-kicker">{item.category}</span>
              <h2>{item.title}</h2>
              <p>{item.problem}</p>
              <div class="meta-row">
                <span>{item.maturityLabel}</span>
                <span>{item.productizationLabel}</span>
              </div>
              <div class="chip-row">{item.outputs.map((output) => <b>{output}</b>)}</div>
            </a>
          ) : (
            <article class="skill-card reveal" data-delay={String((index % 3) + 1)}>
              <span class="card-kicker">{item.category}</span>
              <h2>{item.title}</h2>
              <p>{item.problem}</p>
              <div class="meta-row">
                <span>{item.maturityLabel}</span>
                <span>{item.productizationLabel}</span>
              </div>
              <div class="chip-row">{item.outputs.map((output) => <b>{output}</b>)}</div>
            </article>
          );
        })}
      </div>

      <section class="product-lane reveal" aria-label="Productization lanes">
        <div>
          <p class="eyebrow">Productization</p>
          <h2>每个 skill 都保留一条产品化判断线</h2>
        </div>
        <div class="lane-grid">
          {productLanes.map((lane) => (
            <article>
              <h3>{lane.title}</h3>
              <p>{lane.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <a class="harness-link reveal" href={`${base}ai/knowledge-harness/`}>这些 skill 最终进入 Personal Knowledge Harness</a>
    </div>
  </section>

  <style>
    .skill-desk-page {
      padding-top: 72px;
    }
    .desk-hero {
      display: grid;
      gap: 1rem;
      max-width: 860px;
    }
    .eyebrow,
    .card-kicker {
      color: var(--accent-3);
      font-size: 0.78rem;
      font-weight: 800;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }
    .desk-hero h1 {
      font-size: clamp(2.5rem, 8vw, 5rem);
      letter-spacing: 0;
      line-height: 1;
    }
    .hero-copy {
      max-width: 720px;
      color: var(--muted);
      font-size: 1.05rem;
      line-height: 1.8;
    }
    .desk-stats {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
      margin-top: 0.6rem;
      max-width: 620px;
    }
    .desk-stats div,
    .skill-card,
    .product-lane,
    .lane-grid article {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      box-shadow: var(--shadow);
    }
    .desk-stats div {
      padding: 16px;
    }
    .desk-stats strong {
      display: block;
      font-size: 1.6rem;
      line-height: 1;
    }
    .desk-stats span {
      color: var(--muted);
      font-size: 0.84rem;
    }
    .desk-tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 34px 0 24px;
    }
    .desk-tabs a {
      border: 1px solid var(--border);
      border-radius: 999px;
      padding: 7px 12px;
      color: var(--muted);
      background: var(--surface-2);
      font-size: 0.88rem;
    }
    .desk-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 18px;
    }
    .skill-card {
      display: grid;
      gap: 12px;
      min-height: 292px;
      padding: 20px;
      color: var(--text);
      transition: transform 0.25s var(--ease), border-color 0.25s var(--ease), box-shadow 0.25s var(--ease);
    }
    a.skill-card:hover {
      transform: translateY(-4px);
      border-color: var(--accent);
      box-shadow: var(--shadow-lg);
    }
    .flagship-card {
      background:
        linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(99, 102, 241, 0.08)),
        var(--surface);
    }
    .skill-card h2 {
      font-size: 1.12rem;
      letter-spacing: 0;
    }
    .skill-card p {
      color: var(--muted);
      font-size: 0.92rem;
      line-height: 1.65;
    }
    .meta-row,
    .chip-row {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
      align-self: end;
    }
    .meta-row span,
    .chip-row b {
      border: 1px solid var(--border);
      border-radius: 999px;
      padding: 4px 9px;
      color: var(--muted);
      background: var(--bg-soft);
      font-size: 0.75rem;
      font-weight: 600;
    }
    .product-lane {
      display: grid;
      grid-template-columns: minmax(220px, 0.8fr) minmax(0, 1.6fr);
      gap: 20px;
      margin-top: 28px;
      padding: 22px;
    }
    .product-lane h2 {
      margin-top: 8px;
      font-size: 1.25rem;
      letter-spacing: 0;
    }
    .lane-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }
    .lane-grid article {
      padding: 16px;
      box-shadow: none;
    }
    .lane-grid h3 {
      font-size: 0.98rem;
      letter-spacing: 0;
    }
    .lane-grid p {
      color: var(--muted);
      font-size: 0.86rem;
      line-height: 1.6;
      margin-top: 6px;
    }
    .harness-link {
      display: inline-flex;
      margin-top: 24px;
      color: var(--accent);
      font-weight: 700;
    }
    @media (max-width: 900px) {
      .desk-grid,
      .product-lane {
        grid-template-columns: 1fr;
      }
    }
    @media (max-width: 560px) {
      .desk-stats,
      .lane-grid {
        grid-template-columns: 1fr;
      }
      .skill-card {
        min-height: 0;
      }
    }
  </style>
</BaseLayout>
```

- [ ] **Step 4: Run the homepage test and verify it passes**

Run:

```bash
npx playwright test e2e/skill-desk.spec.ts --grep "homepage"
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/skillDesk.ts src/pages/ai/skill-desk/index.astro e2e/skill-desk.spec.ts
git commit -m "feat: add Skill Desk homepage"
```

## Task 3: Add The Reading-Dialogue Flagship Page

**Files:**
- Create: `src/pages/ai/skill-desk/reading-dialogue.astro`
- Modify: `src/data/skillDesk.ts`
- Test: `e2e/skill-desk.spec.ts`

- [ ] **Step 1: Run the flagship tests and verify they fail**

Run:

```bash
npx playwright test e2e/skill-desk.spec.ts --grep "reading-dialogue flagship"
```

Expected: FAIL because `/personal-website/ai/skill-desk/reading-dialogue/` does not exist.

- [ ] **Step 2: Create the reading-dialogue flagship page**

Create `src/pages/ai/skill-desk/reading-dialogue.astro`:

```astro
---
import DeckLayout from '../../../layouts/DeckLayout.astro';
import { readingDialogueSections, readingTimeline } from '../../../data/skillDesk';

const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
---
<DeckLayout
  title="reading-dialogue Skill：把深度阅读变成知识生产 — QQ星"
  description="一次真实长阅读任务让我意识到：深度追问如果没有边界，会从阅读沉淀滑进产品共创。"
>
  <main id="deck" class="skill-method-deck">
    <section id="s1">
      <div class="chapter">Skill Desk · 旗舰子页</div>
      <h1>reading-dialogue Skill：把深度阅读变成知识生产</h1>
      <p class="sub hero-copy">一次真实长阅读任务让我意识到：深度追问如果没有边界，会从阅读沉淀滑进产品共创。</p>
      <div class="pipeline" aria-label="reading dialogue pipeline">
        {['划线', '追问', '最小记录', '候选池', '入库门禁', '长期资产'].map((item, index) => (
          <>
            <span>{item}</span>
            {index < 5 && <i>-></i>}
          </>
        ))}
      </div>
      <div class="scroll-hint">↓ 进入一次失控后长出的 skill</div>
    </section>

    {readingDialogueSections.map((section) => (
      <section id={section.id}>
        <div class="chapter">{section.label}</div>
        <h2>{section.heading}</h2>
        <div class="method-layout">
          <div class="method-copy">
            <div class="lens">{section.chapter}</div>
            <p>{section.insight}</p>
            <ul>
              {section.points.map((point) => <li>{point}</li>)}
            </ul>
            {section.id === 's10' && (
              <a class="method-link" href={`${base}ai/zhi-shen-ding-nei/`}>查看一次真实阅读产出的产品判断</a>
            )}
          </div>
          <div class="figure control-figure">
            <div class="fig-label">{section.visualTitle}</div>
            <div class={`visual-items visual-${section.id}`}>
              {section.visualItems.map((item) => <span>{item}</span>)}
            </div>
          </div>
        </div>
      </section>
    ))}
  </main>

  <nav class="timeline" id="tl" aria-label="Deck timeline">
    {readingTimeline.map(([id, label]) => (
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
    .skill-method-deck {
      background:
        linear-gradient(180deg, rgba(255,255,255,0.018), rgba(255,255,255,0)),
        radial-gradient(circle at 50% 35%, rgba(34,211,238,0.08), transparent 34%);
    }
    .hero-copy {
      margin-top: 1.35rem;
    }
    .pipeline,
    .visual-items {
      display: flex;
      flex-wrap: wrap;
      gap: 0.65rem;
      align-items: center;
      justify-content: center;
    }
    .pipeline {
      margin-top: 1.8rem;
      max-width: 860px;
    }
    .pipeline span,
    .visual-items span {
      color: var(--text);
      border: 1px solid rgba(34,211,238,0.38);
      background: rgba(34,211,238,0.1);
      border-radius: 999px;
      padding: 0.5rem 0.78rem;
      font-size: 0.82rem;
      line-height: 1.35;
    }
    .pipeline i {
      color: var(--text-dim);
      font-style: normal;
    }
    .method-layout {
      display: grid;
      grid-template-columns: minmax(300px, 460px) minmax(320px, 560px);
      gap: 4vw;
      align-items: center;
      width: min(100%, 1040px);
    }
    .method-copy {
      display: grid;
      gap: 0.9rem;
      min-width: 0;
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
    .method-copy ul {
      display: grid;
      gap: 0.52rem;
      padding-left: 1.05rem;
      color: var(--text-dim);
      font-size: 0.9rem;
      line-height: 1.62;
    }
    .control-figure {
      min-width: 0;
    }
    .visual-items {
      margin-top: 1rem;
    }
    .visual-s4 span:nth-child(3),
    .visual-s5 span:nth-child(2),
    .visual-s6 span:nth-child(3),
    .visual-s9 span:nth-child(4) {
      border-color: rgba(251,113,133,0.45);
      background: rgba(251,113,133,0.12);
    }
    .method-link {
      display: inline-flex;
      width: fit-content;
      color: var(--text);
      border: 1px solid rgba(34,211,238,0.45);
      border-radius: 999px;
      padding: 0.52rem 0.9rem;
      background: rgba(34,211,238,0.1);
      font-size: 0.88rem;
      font-weight: 700;
    }
    @media (max-width: 860px) {
      .skill-method-deck section {
        padding-top: 5.2rem;
        padding-bottom: 6.9rem;
      }
      .method-layout {
        grid-template-columns: 1fr;
        gap: 1.6rem;
      }
      .control-figure {
        width: min(100%, 480px);
      }
      .pipeline,
      .visual-items {
        justify-content: flex-start;
      }
    }
    @media (max-width: 520px) {
      .control-figure {
        padding: 1rem;
      }
      .pipeline span,
      .visual-items span {
        font-size: 0.72rem;
        padding: 0.42rem 0.62rem;
      }
      .pipeline i {
        display: none;
      }
    }
  </style>
</DeckLayout>
```

- [ ] **Step 3: Run the flagship content tests and verify they pass**

Run:

```bash
npx playwright test e2e/skill-desk.spec.ts --grep "reading-dialogue flagship"
```

Expected: PASS.

- [ ] **Step 4: Run the timeline test and verify it passes**

Run:

```bash
npx playwright test e2e/skill-desk.spec.ts --grep "timeline"
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/ai/skill-desk/reading-dialogue.astro src/data/skillDesk.ts e2e/skill-desk.spec.ts
git commit -m "feat: add reading dialogue Skill Desk page"
```

## Task 4: Connect Zhi Shen Ding Nei Back To The Skill Page

**Files:**
- Modify: `src/pages/ai/zhi-shen-ding-nei.astro`
- Test: `e2e/skill-desk.spec.ts`

- [ ] **Step 1: Run the cross-link test and verify it fails**

Run:

```bash
npx playwright test e2e/skill-desk.spec.ts --grep "cross-link"
```

Expected: FAIL because `/personal-website/ai/zhi-shen-ding-nei/` does not yet link back to `/personal-website/ai/skill-desk/reading-dialogue/`.

- [ ] **Step 2: Add the base URL constant to the Zhi Shen Ding Nei deck**

In `src/pages/ai/zhi-shen-ding-nei.astro`, change the top frontmatter from:

```astro
---
import DeckLayout from '../../layouts/DeckLayout.astro';

const timeline = [
```

to:

```astro
---
import DeckLayout from '../../layouts/DeckLayout.astro';

const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');

const timeline = [
```

- [ ] **Step 3: Add the S10 backlink**

In `src/pages/ai/zhi-shen-ding-nei.astro`, inside the mapped section render, immediately after:

```astro
            <div class="method-card">
              <span>方法论抽象</span>
              <p>{screen.method}</p>
            </div>
```

add:

```astro
            {screen.id === 's10' && (
              <a class="source-link" href={`${base}ai/skill-desk/reading-dialogue/`}>查看这套阅读方法如何被做成 skill</a>
            )}
```

- [ ] **Step 4: Add scoped link styling**

In the `<style>` block of `src/pages/ai/zhi-shen-ding-nei.astro`, after the `.method-card p` rule, add:

```css
    .source-link {
      display: inline-flex;
      width: fit-content;
      color: var(--text);
      border: 1px solid rgba(52,211,153,0.45);
      border-radius: 999px;
      padding: 0.52rem 0.9rem;
      background: rgba(52,211,153,0.1);
      font-size: 0.88rem;
      font-weight: 700;
    }
    .source-link:hover {
      border-color: rgba(34,211,238,0.7);
      background: rgba(34,211,238,0.12);
    }
```

- [ ] **Step 5: Run the cross-link test and verify it passes**

Run:

```bash
npx playwright test e2e/skill-desk.spec.ts --grep "cross-link"
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/pages/ai/zhi-shen-ding-nei.astro e2e/skill-desk.spec.ts
git commit -m "feat: connect reading deck to Skill Desk"
```

## Task 5: Responsive QA And Final Verification

**Files:**
- Verify: `src/pages/ai/skill-desk/index.astro`
- Verify: `src/pages/ai/skill-desk/reading-dialogue.astro`
- Verify: `src/pages/ai/index.astro`
- Verify: `src/pages/ai/zhi-shen-ding-nei.astro`
- Verify: `e2e/skill-desk.spec.ts`

- [ ] **Step 1: Run the responsive overflow test**

Run:

```bash
npx playwright test e2e/skill-desk.spec.ts --grep "overflow"
```

Expected: PASS.

- [ ] **Step 2: Run the full Skill Desk e2e file**

Run:

```bash
npx playwright test e2e/skill-desk.spec.ts
```

Expected: PASS for all 6 tests.

- [ ] **Step 3: Run the existing related e2e files**

Run:

```bash
npx playwright test e2e/claude-code-architecture.spec.ts e2e/zhi-shen-ding-nei.spec.ts
```

Expected: PASS. If `e2e/zhi-shen-ding-nei.spec.ts` has user-local edits when execution begins, inspect its diff before editing or staging it.

- [ ] **Step 4: Run Astro check**

Run:

```bash
npm run check
```

Expected: PASS with Astro reporting no type or template errors.

- [ ] **Step 5: Run production build**

Run:

```bash
npm run build
```

Expected: PASS and generated routes include:

- `/personal-website/ai/skill-desk/`
- `/personal-website/ai/skill-desk/reading-dialogue/`

- [ ] **Step 6: Inspect git diff for accidental unrelated edits**

Run:

```bash
git status --short
git diff --stat
```

Expected:

- Skill Desk related files are modified or created.
- `.gitignore` remains unstaged unless the user explicitly asked to include it.
- No unrelated files are staged.

- [ ] **Step 7: Commit final verification fixes if any were needed**

If the responsive or build verification required small Skill Desk-only fixes, commit them:

```bash
git add src/data/skillDesk.ts src/pages/ai/index.astro src/pages/ai/skill-desk/index.astro src/pages/ai/skill-desk/reading-dialogue.astro src/pages/ai/zhi-shen-ding-nei.astro e2e/skill-desk.spec.ts
git commit -m "fix: polish Skill Desk responsive layout"
```

If no fixes were needed after Task 4, skip this commit and report that final verification passed without additional changes.

## Self-Review

Spec coverage:

- `/ai/skill-desk/` homepage: Task 2.
- `/ai/skill-desk/reading-dialogue/` flagship page: Task 3.
- `/ai/` listing update: Task 1.
- `/ai/zhi-shen-ding-nei/` backlink: Task 4.
- Six homepage skill cards: Task 2 data module and homepage test.
- Ten flagship sections: Task 3 data module and flagship test.
- 三档模式、追问刹车、候选池、入库门禁、产品化判断： Task 3 content and tests.
- Desktop/mobile overflow: Task 5 responsive test.
- GitHub Pages base path: Tasks 1, 2, 3, 4 use `base` or Playwright `/personal-website/` assertions.

Placeholder scan:

- No placeholder markers or empty task steps remain in the plan.
- Each code-changing step includes concrete code or exact insertion snippets.
- Each test step includes exact command and expected result.

Type consistency:

- `SkillDeskItem`, `ReadingDialogueSection`, `skillDeskItems`, `readingDialogueSections`, and `readingTimeline` are defined in Task 2 before Task 3 consumes them.
- Homepage and flagship routes use the same `base` handling pattern as existing AI pages.
- Playwright selectors match classes and headings defined in the implementation snippets.
