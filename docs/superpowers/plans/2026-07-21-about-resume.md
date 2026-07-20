# 个人网站关于页与 AI 产品经理简历更新实施计划

> **Execution governance:** Before implementation, run the shared `adaptive-orchestration` preflight. A plan records a recommended profile but does not dispatch agents or authorize execution by itself.

**Goal:** 把“关于”页升级为可快速浏览又能完整读完七个项目的网页版个人档案，同步更新完整版简历，并将用户提供的两页 AI 产品经理 PDF 设为主下载文件。

**Architecture:** `src/data/resume/facts.ts` 继续作为身份、履历和项目事实的唯一结构化来源，新增 `site` 项目但不自动改变现有网页简历变体；`src/data/about.ts` 只保存关于页的分组、概览指标和详情链接等展示投影。`AboutProjectCard.astro` 负责统一渲染完整项目字段，`about.astro` 负责页面编排；用户头像走 Astro 图片管线，主 PDF 作为受固定 Hash 保护的外部定稿资产。

**Tech Stack:** Astro 5、TypeScript strict、Astro Assets、Playwright、原生 CSS、Poppler (`pdfinfo` / `pdftoppm`)、Git。

**Recommended execution profile:** O0；数据、组件、页面、资源和验收围绕同一事实源强耦合，单一写入者可避免项目顺序、文案和下载文件发生并行漂移。

**Parallelizable workstreams:** none

**Shared-write conflicts:** `src/data/resume/facts.ts` 同时服务关于页与三种网页简历；`public/resume.pdf` 同时受下载入口、导出脚本和 PDF 测试影响；`docs/resume/完整版-简历.md` 当前是用户未跟踪文件，只能在本任务内精确写入和暂存。

**Stage evidence checkpoint:** `ABOUT_RESUME_PASS`；要求 `npm run check`、`npm run resume:check`、`npm run build` 和完整 `npm run test:e2e` 通过，`public/resume.pdf` SHA-256 为 `5e3f51bb2fb5a63452581c49e7286b7dd880da72dbb0582a2848fcc585371cad`，`pdfinfo` 显示 2 页 A4、未加密，并完成人工桌面 / 移动、浅色 / 深色截图和两页 PDF 渲染核验。

**Recovery entry:** 只读取本计划，从首个未勾选 Task 继续；恢复前先运行 `git status --short`、目标 PDF Hash 和最近一次已记录测试命令，不加载旧对话或 `.superpowers/brainstorm/`。

**Authorization boundary:** 允许修改本计划列出的本地网站源码、测试、完整版 Markdown、头像资源、下载 PDF 与简历导出脚本；允许精确暂存和提交这些文件。允许用用户提供的头像和 PDF 覆盖对应站点资产；不部署、不推送、不创建 PR、不修改外部文件。

**Out of scope:** 不重写项目详情页，不重新排版用户 PDF，不修改 B2B PDF，不把手机号或生日写入网页 / Markdown，不全站替换历史页面标题中的“QQ星”，不处理工作区现有 DOCX / 简历生成脚本改动，不提交 `.superpowers/`、`tmp/` 或其他用户文件。

**Potential decision boundaries:** 仅当用户提供的头像 / PDF 在实施前发生内容变化、结构化事实与已批准设计出现新的真实冲突，或必须修改项目详情页才能满足当前页完整性时，才超出授权并形成新的产品选择；普通测试失败、样式收敛和构建兼容问题在当前授权内自行处理。

---

## Planning assumptions and readiness

- 来源设计：`docs/superpowers/specs/2026-07-21-about-resume-design.md`，状态为“已批准”。
- 手工 `spec-readiness: PASS`：本任务没有业务状态机或并发写入；显示 / 隐藏、内部 / 外部链接、JavaScript 失败、减少动效、移动端、资源缺失和 PDF 校验均已闭合。
- 单一真值：身份、履历、项目文案和指标来自 `resumeFacts`；关于页数据只引用项目并增加展示元数据；固定 PDF 的字节内容以 Hash 为准。
- 当前工作区有用户改动和未跟踪文件。每次提交只使用列出的精确路径，禁止 `git add .`，禁止改动 `scripts/resume_docx/`、`tests/resume_docx/` 和现有 DOCX。
- 现有 `resume:export` 会覆盖 `public/resume.pdf`。本计划将其输出收窄为 B2B PDF，避免未来误覆盖用户定稿。

## 本次 context-pack

- 当前任务：已批准设计转实施计划，覆盖静态内容建模、Astro 页面、图片 / PDF 资产和验收。
- 当前材料：用户三份简历、头像、已批准设计、现有源码 / 测试、PDF 渲染证据和仓库提交历史。
- 路由依据：真实任务上下文加载规则、RAG 式上下文治理、正式知识域根索引、需求文档 / 技术分析 / 项目复盘入口。
- 最终加载：`PRD审查经验`、`PRD进入原型前交互封口清单`、`高保真原型真实页面基线规则`、`没有胜仗的敏捷会变成消耗`。
- 未加载：旧 `wiki/`、原文层和其他正式知识域；新库与当前源码已经足够。AI 架构原子卡未进入计划，因为本次只展示 AI 实践，不新增 Agent、RAG、模型或后台能力。
- 风险：关于页正文较长，需要以字段分组、行长和响应式布局保持可读；固定主 PDF 必须与现有网页简历导出职责分离。

## File Structure

| Path | Action | Single responsibility |
| --- | --- | --- |
| `src/data/resume/types.ts` | Modify | 扩展项目 ID 以容纳个人网站，不改变变体选择机制。 |
| `src/data/resume/facts.ts` | Modify | 保存真实姓名、教育时间、2 份竞品分析和个人网站完整事实。 |
| `src/data/about.ts` | Create | 保存关于页定位、双轨概览、项目顺序、字段标签和详情链接。 |
| `src/data/profile.ts` | Modify | 更新公开定位文案，继续提供通用下载和联系方式。 |
| `src/components/about/AboutProjectCard.astro` | Create | 用统一字段契约渲染一张完整项目大卡。 |
| `src/pages/about.astro` | Modify | 编排 Hero、双轨概览、七张项目卡、履历 / 技能和尾部 CTA。 |
| `src/assets/about-portrait.jpg` | Create | 保存用户批准的原始头像，由 Astro 构建时优化。 |
| `src/layouts/BaseLayout.astro` | Modify | 让 reveal 动效成为渐进增强，并提供 IntersectionObserver 降级。 |
| `src/styles/global.css` | Modify | 默认显示 reveal 内容，只有 JavaScript 可用时才进入动画初态。 |
| `docs/resume/完整版-简历.md` | Modify | 同步真实姓名、日期、AI 结果和个人网站完整项目。 |
| `scripts/export-resumes.mjs` | Modify | 停止覆盖固定 AI PDF，仅保留 B2B 网页简历导出。 |
| `public/resume.pdf` | Replace | 保存用户提供的两页 AI 产品经理定稿 PDF。 |
| `e2e/resume-data.spec.ts` | Modify | 验证七个事实项目、变体隔离、身份日期、Markdown 同步和隐私。 |
| `e2e/about.spec.ts` | Modify | 验证页面层级、完整大卡、链接、响应式、无 JS 与减少动效。 |
| `e2e/resume-pdf.spec.ts` | Modify | 用固定 SHA-256 锁定主 PDF，并保留 B2B / 端口失败保护。 |

### Task 1: 冻结输入证据和工作区边界

**Files:**
- Read: `/Users/qqx/Desktop/个人/AI产品经理-钱麒祥.pdf`
- Read: `/Users/qqx/Desktop/个人/图片/mmexport1749092676694.jpg`
- Read: `public/resume-b2b-saas.pdf`
- Runtime only: `tmp/about-resume/worktree-before.txt`
- Runtime only: `tmp/about-resume/input.sha256`

- [ ] **Step 1: 记录 O0 预检和精确写入边界**

确认不创建子 Agent；唯一写入者是根 Agent；共享冲突文件是 `facts.ts`、`about.astro` 和 `public/resume.pdf`；停止点是 `ABOUT_RESUME_PASS`；恢复入口是本计划。

- [ ] **Step 2: 验证输入存在且目标互不相同**

Run:

```bash
test -f '/Users/qqx/Desktop/个人/AI产品经理-钱麒祥.pdf'
test -f '/Users/qqx/Desktop/个人/图片/mmexport1749092676694.jpg'
test '/Users/qqx/Desktop/个人/AI产品经理-钱麒祥.pdf' != 'public/resume.pdf'
test '/Users/qqx/Desktop/个人/图片/mmexport1749092676694.jpg' != 'src/assets/about-portrait.jpg'
```

Expected: 四个命令均退出 0。

- [ ] **Step 3: 保存 Hash、PDF 元数据和工作区快照**

Run:

```bash
mkdir -p tmp/about-resume
shasum -a 256 \
  '/Users/qqx/Desktop/个人/AI产品经理-钱麒祥.pdf' \
  '/Users/qqx/Desktop/个人/图片/mmexport1749092676694.jpg' \
  'public/resume-b2b-saas.pdf' > tmp/about-resume/input.sha256
git status --short --branch > tmp/about-resume/worktree-before.txt
pdfinfo '/Users/qqx/Desktop/个人/AI产品经理-钱麒祥.pdf'
sips -g pixelWidth -g pixelHeight '/Users/qqx/Desktop/个人/图片/mmexport1749092676694.jpg'
```

Expected: PDF Hash 为 `5e3f51...71cad`、2 页 A4、未加密；头像 Hash 为 `8a3d60...13a`、4480 × 6720；B2B PDF Hash 为 `6f84f7...8e0`。

### Task 2: 扩展结构化事实但保持简历变体隔离

**Files:**
- Modify: `e2e/resume-data.spec.ts`
- Modify: `src/data/resume/types.ts`
- Modify: `src/data/resume/facts.ts`

- [ ] **Step 1: 先写失败的事实契约测试**

在 `projectPeriods` 中加入：

```ts
site: '2026.06–至今',
```

将项目数量测试改为 7，并新增以下测试：

```ts
test('public identity and the personal site facts match the approved design', () => {
  expect(resumeFacts.identity.name).toBe('钱麒祥');
  expect(resumeFacts.education[0].period).toBe('2018.09–2022.06');

  const site = resumeFacts.projects.find(({ id }) => id === 'site');
  expect(site).toBeDefined();
  expect(site?.role).toBe('独立产品设计与实践');
  expect(site?.state).toBe('公开运行｜持续迭代');
  expect(JSON.stringify(site)).toContain('22 个 Astro 页面');
  expect(JSON.stringify(site)).toContain('16 个 E2E 测试文件');
  expect(JSON.stringify(site)).toContain('GitHub Pages 发布');
});
```

把 AI 证据中的 `1 份正式业务竞品分析` 改为 `2 份正式业务竞品分析`；在变体测试末尾增加：

```ts
expect(master.projects.map(({ id }) => id)).not.toContain('site');
expect(ai.projects.map(({ id }) => id)).not.toContain('site');
expect(b2b.projects.map(({ id }) => id)).not.toContain('site');
```

- [ ] **Step 2: 运行测试并确认按预期失败**

Run:

```bash
npx playwright test e2e/resume-data.spec.ts
```

Expected: FAIL，至少报告项目数仍为 6、姓名仍为 `QQ星`、教育日期仍为 `2018.08`、缺少 `site` 和竞品分析数量仍为 1。

- [ ] **Step 3: 扩展项目 ID 和事实数据**

在 `src/data/resume/types.ts` 将联合类型改为：

```ts
export type ResumeProjectId =
  | 'ai'
  | 'sales'
  | 'permissions'
  | 'analytics'
  | 'membership'
  | 'parking'
  | 'site';
```

在 `src/data/resume/facts.ts` 完成四项确定性修改：

```ts
name: '钱麒祥',
```

```ts
{ school: '中国计量大学', major: '计算机科学与技术 · 本科', period: '2018.09–2022.06' },
```

AI 项目 `master` 与 `compact` 的结果都从 1 份更新为 2 份；然后把下列对象追加在 `projects` 数组末尾，保持现有索引和变体顺序不变：

```ts
{
  id: 'site',
  name: '个人网站｜qqx.life',
  role: '独立产品设计与实践',
  period: '2026.06–至今',
  state: '公开运行｜持续迭代',
  responsibilities: [
    '独立完成需求、方案、开发、自动化验证与发布，并持续维护项目内容、主题和部署链路。',
  ],
  copy: {
    master: {
      background:
        '个人项目、AI 实践和产品思考缺少统一入口，也需要验证 AI 辅助开发能否形成完整、可复用的交付流程。项目因此以公开网站为载体，连接内容沉淀、项目展示、自动化验证和持续发布。',
      actions: [
        '按“需求 / Spec → 实施计划 → 编码 → E2E 验证 → GitHub Pages 发布”完成端到端交付。',
        '沿用统一设计令牌、深浅主题与内容结构，把项目经历、AI 实践和产品思考连接为公开作品档案。',
        '使用 Playwright 验证核心页面和响应式表现，并通过 GitHub Actions 持续发布。',
      ],
      results: [
        '当前公开项目包含 22 个 Astro 页面和 16 个 E2E 测试文件。',
        '已具备自动化部署和可复现的简历导出能力。',
      ],
    },
    compact: {
      background: '个人项目与 AI 实践缺少统一入口，需要验证 AI 辅助开发的端到端交付流程。',
      actions: [
        '按需求、Spec、计划、编码、E2E 和 GitHub Pages 发布完成交付。',
        '统一项目展示、AI 实践、主题和自动化验证入口。',
      ],
      results: ['形成 22 个 Astro 页面、16 个 E2E 测试文件和自动化部署链路。'],
    },
  },
  tags: ['AI 辅助开发', '端到端交付', '自动化验证', '持续发布'],
},
```

- [ ] **Step 4: 运行事实与网页简历回归测试**

Run:

```bash
npx playwright test e2e/resume-data.spec.ts e2e/resume.spec.ts
```

Expected: PASS；master / ai / b2b 仍保持原项目组合，新增 `site` 只存在于事实源。

- [ ] **Step 5: 精确提交事实模型**

Run:

```bash
git add -- src/data/resume/types.ts src/data/resume/facts.ts e2e/resume-data.spec.ts
git diff --cached --check
git commit -m "feat: add personal site resume facts"
```

### Task 3: 建立关于页展示投影和完整项目卡组件

**Files:**
- Create: `src/data/about.ts`
- Modify: `src/data/profile.ts`
- Create: `src/components/about/AboutProjectCard.astro`
- Modify: `e2e/about.spec.ts`

- [ ] **Step 1: 用失败测试冻结页面内容契约**

将 `e2e/about.spec.ts` 重写为四个测试。第一个测试必须断言：

```ts
const expectedProjectOrder = [
  'ai',
  'site',
  'sales',
  'permissions',
  'analytics',
  'membership',
  'parking',
];

test('about page is a complete recruiter-first profile', async ({ page }) => {
  await page.goto('/about/');
  await expect(page.getByRole('heading', { level: 1, name: '钱麒祥' })).toBeVisible();
  await expect(page.getByText('AI PRODUCT MANAGER · HANGZHOU')).toBeVisible();
  await expect(page.getByText('把复杂业务系统，做成可落地的 AI 产品')).toBeVisible();
  await expect(page.getByAltText('钱麒祥个人照片')).toBeVisible();
  await expect(page.getByRole('heading', { name: '商业产品基本盘' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'AI 产品实践' })).toBeVisible();

  expect(await page.locator('[data-about-project]').evaluateAll((cards) =>
    cards.map((card) => card.getAttribute('data-project-id')),
  )).toEqual(expectedProjectOrder);

  for (const id of expectedProjectOrder) {
    const card = page.locator(`[data-about-project][data-project-id="${id}"]`);
    await expect(card.getByText('项目背景', { exact: true })).toBeVisible();
    await expect(card.getByText('关键行动', { exact: true })).toBeVisible();
    await expect(card.getByText('结果证据', { exact: true })).toBeVisible();
    await expect(card.getByText('能力关键词', { exact: true })).toBeVisible();
  }
  await expect(page.locator('[data-project-id="site"]').getByText('具体实现', { exact: true })).toBeVisible();
});
```

第二个测试验证下载、详情链接和隐私：

```ts
test('about links are explicit and public copy excludes private fields', async ({ page }) => {
  await page.goto('/about/');
  const basePath = new URL(page.url()).pathname.replace(/about\/?$/, '');
  await expect(page.getByRole('link', { name: '下载 AI 产品经理简历' }))
    .toHaveAttribute('href', `${basePath}resume.pdf`);
  await expect(page.getByRole('link', { name: 'B2B / SaaS 版' }))
    .toHaveAttribute('href', `${basePath}resume-b2b-saas.pdf`);
  await expect(page.locator('[data-project-id="ai"] a'))
    .toHaveAttribute('href', `${basePath}ai/knowledge-harness/`);
  await expect(page.locator('[data-project-id="site"] a'))
    .toHaveAttribute('href', 'https://github.com/666qqx666-jpg/personal-website');
  const mainText = await page.locator('main').innerText();
  expect(mainText).not.toContain('173 9571 1345');
  expect(mainText).not.toContain('2000.02');
});
```

第三、第四个测试使用以下完整代码：

```ts
test('about page stays within the mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/about/');
  expect(await page.evaluate(() =>
    document.documentElement.scrollWidth - window.innerWidth <= 1,
  )).toBe(true);
  await expect(page.locator('[data-about-project]')).toHaveCount(7);
});

test('about page removes motion when the visitor requests it', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/about/');
  const motion = await page.locator('.reveal').first().evaluate((element) => {
    const style = getComputedStyle(element);
    return { transitionDuration: style.transitionDuration, transform: style.transform };
  });
  expect(motion.transitionDuration).toBe('0s');
  expect(motion.transform).toBe('none');
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run:

```bash
npx playwright test e2e/about.spec.ts
```

Expected: FAIL，缺少真实姓名 Hero、双轨概览、头像和七张项目卡。

- [ ] **Step 3: 创建关于页展示数据**

创建 `src/data/about.ts`，定义 `AboutMetric`、`AboutOverview`、`AboutProjectView` 和 `AboutProjectGroup`。使用固定项目顺序和显式链接：

```ts
import { deepFreeze, resumeFacts } from './resume/facts';
import type { DeepReadonly, ResumeProject, ResumeProjectId } from './resume/types';

export interface AboutMetric { value: string; label: string; note?: string; }
export interface AboutOverview {
  id: 'business' | 'ai';
  eyebrow: string;
  title: string;
  description: string;
  metrics: readonly AboutMetric[];
}
export interface AboutProjectView {
  project: DeepReadonly<ResumeProject>;
  responsibilityLabel: '本人职责' | '具体实现';
  href: string;
  linkLabel: string;
  external: boolean;
}
export interface AboutProjectGroup {
  id: 'ai-practice' | 'commercial';
  eyebrow: string;
  title: string;
  description: string;
  projects: readonly AboutProjectView[];
}

const projectById = new Map(resumeFacts.projects.map((project) => [project.id, project]));
const getProject = (id: ResumeProjectId) => {
  const project = projectById.get(id);
  if (!project) throw new Error(`Unknown about project: ${id}`);
  return project;
};

const view = (
  id: ResumeProjectId,
  href: string,
  linkLabel = '查看完整项目故事',
  external = false,
  responsibilityLabel: AboutProjectView['responsibilityLabel'] = '本人职责',
): AboutProjectView => ({ project: getProject(id), href, linkLabel, external, responsibilityLabel });

export const aboutData = deepFreeze({
  kicker: 'AI PRODUCT MANAGER · HANGZHOU',
  headline: '把复杂业务系统，做成可落地的 AI 产品',
  location: '杭州',
  capabilities: ['Agent 工作流', '复杂业务建模', 'RAG / Context', '数据与技术协作'],
  overviews: [
    {
      id: 'business',
      eyebrow: '商业产品基本盘',
      title: '复杂业务系统的 4 年积累',
      description: 'CRM、权限、数据、交易与营销',
      metrics: [
        { value: '4 年', label: '企业服务产品经验' },
        { value: '5 类', label: '核心产品域' },
        { value: '15,000', label: '销售线索系统上线门店' },
        { value: '876 万', label: '客户主体下会员记录', note: '不是独立自然人数' },
      ],
    },
    {
      id: 'ai',
      eyebrow: 'AI 产品实践',
      title: 'Agent 工作台已进入真实交付',
      description: '需求、PRD、竞品、决策与报价',
      metrics: [
        { value: '6 / 8', label: '工作流稳定自用' },
        { value: '9 份', label: '真实业务 PRD' },
        { value: '6 份', label: '蓝图 / 决策材料' },
        { value: '2 + 3', label: '竞品分析 + 报价类型' },
      ],
    },
  ],
  projectGroups: [
    {
      id: 'ai-practice',
      eyebrow: '01 · AI 产品实践',
      title: 'AI 能力如何进入真实工作',
      description: '从知识与工作流系统，到端到端 AI 辅助交付。',
      projects: [
        view('ai', 'ai/knowledge-harness/'),
        view('site', 'https://github.com/666qqx666-jpg/personal-website', '查看网站源码', true, '具体实现'),
      ],
    },
    {
      id: 'commercial',
      eyebrow: '02 · 商业项目经历',
      title: '每个项目都在当前页讲清楚',
      description: '详情页继续承接流程图、关键取舍和业务蓝图。',
      projects: [
        view('sales', 'projects/sales-lead-slm/'),
        view('permissions', 'projects/enterprise-permissions/'),
        view('analytics', 'projects/group-business-analytics/'),
        view('membership', 'projects/membership-operations/'),
        view('parking', 'projects/smart-parking/'),
      ],
    },
  ],
});
```

- [ ] **Step 4: 更新通用公开定位**

在 `src/data/profile.ts` 保留下载配置和链接结构，把摘要更新为：

```ts
summary:
  '4 年企业服务产品经验，覆盖 CRM、权限、数据、交易与营销场景；已将个人 AI Agent 工作台用于真实产品交付。',
```

把 `typewriter` 第一项更新为 `企业服务产品 → AI 产品经理`；`name` 继续从 `resumeFacts.identity.name` 派生。

- [ ] **Step 5: 创建完整项目卡组件**

创建 `src/components/about/AboutProjectCard.astro`。组件必须：

```astro
---
import type { AboutProjectView } from '../../data/about';
interface Props { item: AboutProjectView; base: string; }
const { item, base } = Astro.props;
const { project } = item;
const copy = project.copy.master;
const href = item.external ? item.href : `${base}${item.href}`;
---
<article class="about-project-card reveal" data-about-project data-project-id={project.id}>
  <header class="project-head">
    <div>
      <p class="project-period">{project.period}</p>
      <h3>{project.name}</h3>
      <p class="project-role">{project.role}</p>
    </div>
    <span class="project-state">{project.state}</span>
  </header>
  <dl class="project-fields">
    <div class="project-field">
      <dt>项目背景</dt><dd>{copy.background}</dd>
    </div>
    <div class="project-field">
      <dt>{item.responsibilityLabel}</dt>
      <dd><ul>{project.responsibilities.map((text) => <li>{text}</li>)}</ul></dd>
    </div>
    <div class="project-field">
      <dt>关键行动</dt><dd><ul>{copy.actions.map((text) => <li>{text}</li>)}</ul></dd>
    </div>
    <div class="project-field evidence-field">
      <dt>结果证据</dt><dd><ul>{copy.results.map((text) => <li>{text}</li>)}</ul></dd>
    </div>
    <div class="project-field tag-field">
      <dt>能力关键词</dt>
      <dd class="project-tags">{project.tags.map((tag) => <span>{tag}</span>)}</dd>
    </div>
  </dl>
  <a class="project-link" href={href} target={item.external ? '_blank' : undefined}
     rel={item.external ? 'noopener' : undefined}>{item.linkLabel}<span aria-hidden="true">→</span></a>
</article>
```

组件末尾使用以下局部 CSS：

```astro
<style>
  .about-project-card {
    padding: clamp(22px, 4vw, 34px);
    border: 1px solid var(--border);
    border-radius: 22px;
    background: var(--surface);
    box-shadow: var(--shadow);
    transition: transform .25s var(--ease), box-shadow .25s var(--ease), border-color .25s var(--ease);
  }
  .about-project-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); border-color: color-mix(in srgb, var(--accent) 32%, var(--border)); }
  .project-head { display: flex; justify-content: space-between; gap: 24px; padding-bottom: 20px; border-bottom: 1px solid var(--border); }
  .project-period { color: var(--accent); font-size: 13px; font-weight: 700; }
  .project-head h3 { margin-top: 5px; font-size: clamp(22px, 3vw, 30px); }
  .project-role { margin-top: 7px; color: var(--muted); }
  .project-state { align-self: flex-start; padding: 6px 10px; border-radius: 999px; background: var(--bg-soft); color: var(--muted); font-size: 12px; white-space: nowrap; }
  .project-fields { display: grid; gap: 14px; margin-top: 20px; }
  .project-field { display: grid; grid-template-columns: 8rem minmax(0, 1fr); gap: 18px; }
  dt { color: var(--text); font-size: 14px; font-weight: 750; }
  dd { min-width: 0; max-width: 72ch; color: var(--muted); }
  ul { padding-left: 1.15rem; }
  li + li { margin-top: 7px; }
  .evidence-field { padding: 16px; border-radius: 14px; background: color-mix(in srgb, var(--accent) 8%, var(--surface)); }
  .project-tags { display: flex; flex-wrap: wrap; gap: 8px; }
  .project-tags span { padding: 5px 10px; border: 1px solid var(--border); border-radius: 999px; background: var(--bg-soft); color: var(--text); font-size: 12px; }
  .project-link { display: inline-flex; gap: 8px; align-items: center; margin-top: 22px; font-weight: 700; }
  .project-link span { transition: transform .2s var(--ease); }
  .project-link:hover span { transform: translateX(4px); }
  .project-link:focus-visible { outline: 3px solid color-mix(in srgb, var(--accent) 45%, transparent); outline-offset: 5px; border-radius: 4px; }
  @media (max-width: 760px) {
    .project-head { flex-direction: column; gap: 12px; }
    .project-state { white-space: normal; }
    .project-field { grid-template-columns: 1fr; gap: 5px; }
    .evidence-field { margin-inline: -4px; padding: 14px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .about-project-card, .project-link span { transition: none; }
    .about-project-card:hover, .project-link:hover span { transform: none; }
  }
</style>
```

- [ ] **Step 6: 运行展示数据和组件类型检查**

Run:

```bash
npm run check
```

Expected: PASS；新展示数据和组件类型闭合。关于页 E2E 仍失败，因为页面尚未编排。

### Task 4: 重建关于页并接入响应式头像

**Files:**
- Create: `src/assets/about-portrait.jpg`
- Modify: `src/pages/about.astro`

- [ ] **Step 1: 复制用户批准头像并核对字节**

Run:

```bash
cp '/Users/qqx/Desktop/个人/图片/mmexport1749092676694.jpg' 'src/assets/about-portrait.jpg'
shasum -a 256 'src/assets/about-portrait.jpg' '/Users/qqx/Desktop/个人/图片/mmexport1749092676694.jpg'
```

Expected: 两行 Hash 都是 `8a3d601cdd3432c3962253e84ad6bf07f5136829ede943021f19e09ea17ff13a`。

- [ ] **Step 2: 用已批准结构重写页面**

`src/pages/about.astro` 导入 `Image`、头像、`aboutData`、`profile`、`AboutProjectCard`、`Timeline` 和 `SkillTags`，并按固定顺序渲染：

```astro
---
import { Image } from 'astro:assets';
import portrait from '../assets/about-portrait.jpg';
import AboutProjectCard from '../components/about/AboutProjectCard.astro';
import SkillTags from '../components/SkillTags.astro';
import Timeline from '../components/Timeline.astro';
import BaseLayout from '../layouts/BaseLayout.astro';
import { aboutData } from '../data/about';
import { profile } from '../data/profile';
const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
---
<BaseLayout title={`关于 · ${profile.name}`} description={profile.summary}>
  <section class="about-hero section-pad">
    <div class="container hero-grid">
      <div class="hero-copy reveal">
        <p class="eyebrow">{aboutData.kicker}</p>
        <h1>{profile.name}</h1>
        <h2>{aboutData.headline}</h2>
        <p class="summary">{profile.summary}</p>
        <div class="capability-pills">{aboutData.capabilities.map((item) => <span>{item}</span>)}</div>
        <div class="hero-actions">
          <a class="button primary" href={`${base}${profile.resumeDownloads[0].href}`} download>下载 AI 产品经理简历</a>
          <a class="text-link" href={`${base}${profile.resumeDownloads[1].href}`} download>B2B / SaaS 版</a>
          <a class="text-link" href={`mailto:${profile.email}`}>联系我</a>
        </div>
      </div>
      <figure class="portrait-frame reveal" data-delay="1">
        <Image src={portrait} alt="钱麒祥个人照片" widths={[420, 640, 840]}
          sizes="(max-width: 760px) calc(100vw - 48px), 34vw" loading="eager" />
        <figcaption>{aboutData.location} · AI 产品经理</figcaption>
      </figure>
    </div>
  </section>

  <section class="overview-section">
    <div class="container overview-grid">
      {aboutData.overviews.map((overview, index) => (
        <article class:list={['overview-card', `overview-${overview.id}`, 'reveal']} data-delay={String(index + 1)}>
          <p class="section-eyebrow">{overview.eyebrow}</p><h2>{overview.title}</h2>
          <p>{overview.description}</p>
          <div class="metric-grid">{overview.metrics.map((metric) => (
            <div class="metric"><strong>{metric.value}</strong><span>{metric.label}</span>
              {metric.note && <small>{metric.note}</small>}</div>
          ))}</div>
        </article>
      ))}
    </div>
  </section>

  {aboutData.projectGroups.map((group) => (
    <section class="project-section section-pad" data-project-group={group.id}>
      <div class="container project-container">
        <header class="section-head reveal"><p class="section-eyebrow">{group.eyebrow}</p>
          <h2>{group.title}</h2><p>{group.description}</p></header>
        <div class="project-list">{group.projects.map((item) => (
          <AboutProjectCard item={item} base={base} />
        ))}</div>
      </div>
    </section>
  ))}

  <section class="credentials section-pad">
    <div class="container credentials-grid">
      <div class="reveal"><p class="section-eyebrow">03 · 经历与资质</p><Timeline /></div>
      <div class="reveal" data-delay="1"><h2>能力与认证</h2><SkillTags />
        <nav class="profile-links" aria-label="公开链接">{profile.links.map((link) => (
          <a href={link.href} target="_blank" rel="noopener">{link.label}</a>
        ))}</nav></div>
    </div>
  </section>

  <section class="closing-cta"><div class="container closing-inner reveal">
    <div><p class="section-eyebrow">NEXT STEP</p><h2>已经了解全貌，下一步按需深入</h2>
      <p>下载正式简历，或继续查看项目详情与 AI 实践。</p></div>
    <div class="hero-actions"><a class="button primary" href={`${base}resume.pdf`} download>下载 AI 产品经理简历</a>
      <a class="text-link" href={`mailto:${profile.email}`}>联系我</a></div>
  </div></section>
</BaseLayout>
```

页面末尾使用以下局部 CSS：

```astro
<style>
  .about-hero { padding-bottom: 48px; background: linear-gradient(135deg, var(--bg) 35%, color-mix(in srgb, var(--accent) 9%, var(--bg))); }
  .hero-grid { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(280px, .8fr); gap: clamp(28px, 6vw, 72px); align-items: center; }
  .eyebrow, .section-eyebrow { color: var(--accent); font-size: 12px; font-weight: 800; letter-spacing: .13em; text-transform: uppercase; }
  .hero-copy h1 { margin-top: 14px; font-size: clamp(48px, 8vw, 82px); font-weight: 850; }
  .hero-copy h2 { max-width: 19ch; margin-top: 12px; font-size: clamp(25px, 4vw, 40px); }
  .summary { max-width: 62ch; margin-top: 18px; color: var(--muted); font-size: 17px; }
  .capability-pills { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 20px; }
  .capability-pills span { padding: 6px 11px; border: 1px solid color-mix(in srgb, var(--accent) 25%, var(--border)); border-radius: 999px; background: color-mix(in srgb, var(--accent) 7%, var(--surface)); color: var(--accent); font-size: 13px; }
  .hero-actions { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; margin-top: 24px; }
  .button { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 10px 18px; border-radius: 999px; font-weight: 750; transition: transform .25s var(--ease), box-shadow .25s var(--ease); }
  .button.primary { background: var(--accent); color: #fff; box-shadow: 0 10px 28px color-mix(in srgb, var(--accent) 30%, transparent); }
  .button:hover { transform: translateY(-2px); }
  .text-link { font-weight: 700; }
  .button:focus-visible, .text-link:focus-visible, .profile-links a:focus-visible { outline: 3px solid color-mix(in srgb, var(--accent) 45%, transparent); outline-offset: 5px; border-radius: 5px; }
  .portrait-frame { overflow: hidden; position: relative; aspect-ratio: 4 / 5; border: 1px solid var(--border); border-radius: 88px 24px 24px 88px; background: var(--surface); box-shadow: var(--shadow-lg); }
  .portrait-frame :global(img) { width: 100%; height: 100%; object-fit: cover; object-position: 50% 24%; }
  .portrait-frame figcaption { position: absolute; right: 14px; bottom: 14px; padding: 6px 10px; border-radius: 999px; background: rgba(15, 23, 42, .72); color: #fff; font-size: 12px; backdrop-filter: blur(12px); }
  .overview-section { padding: 32px 0 72px; }
  .overview-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
  .overview-card { padding: clamp(22px, 4vw, 34px); border: 1px solid var(--border); border-radius: 22px; background: var(--surface); box-shadow: var(--shadow); }
  .overview-card h2 { margin-top: 8px; font-size: clamp(22px, 3vw, 30px); }
  .overview-card > p:not(.section-eyebrow) { margin-top: 7px; color: var(--muted); }
  .overview-ai { background: linear-gradient(135deg, #171b31, #303a74); color: #fff; }
  .overview-ai > p:not(.section-eyebrow), .overview-ai .metric span, .overview-ai .metric small { color: #cbd5e1; }
  .metric-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 20px; }
  .metric { padding: 14px; border: 1px solid var(--border); border-radius: 13px; background: color-mix(in srgb, var(--surface) 90%, transparent); }
  .overview-ai .metric { border-color: rgba(255,255,255,.11); background: rgba(255,255,255,.07); }
  .metric strong { display: block; color: var(--accent); font-size: clamp(23px, 3vw, 34px); line-height: 1.1; }
  .overview-ai .metric strong { color: #c7d2fe; }
  .metric span, .metric small { display: block; margin-top: 5px; color: var(--muted); font-size: 12px; }
  .metric small { margin-top: 2px; font-size: 10px; }
  .project-section:nth-of-type(even) { background: color-mix(in srgb, var(--bg-soft) 55%, var(--bg)); }
  .project-container { max-width: 960px; }
  .section-head { max-width: 72ch; margin-bottom: 26px; }
  .section-head h2, .credentials h2, .closing-cta h2 { margin-top: 8px; font-size: clamp(28px, 4vw, 42px); }
  .section-head > p:last-child, .closing-cta p { margin-top: 10px; color: var(--muted); }
  .project-list { display: grid; gap: 22px; }
  .credentials { background: var(--surface); }
  .credentials-grid { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(280px, .75fr); gap: clamp(32px, 6vw, 72px); }
  .profile-links { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 24px; }
  .profile-links a { font-weight: 700; }
  .closing-cta { padding: 52px 0; background: #111827; color: #fff; }
  .closing-inner { display: flex; justify-content: space-between; gap: 30px; align-items: center; }
  .closing-cta .section-eyebrow, .closing-cta .text-link { color: #c7d2fe; }
  .closing-cta p { color: #cbd5e1; }
  @media (max-width: 760px) {
    .about-hero { padding-top: 48px; }
    .hero-grid, .overview-grid, .credentials-grid { grid-template-columns: 1fr; }
    .portrait-frame { border-radius: 24px; }
    .overview-section { padding-bottom: 48px; }
    .metric-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .closing-inner { align-items: flex-start; flex-direction: column; }
  }
  @media (max-width: 430px) {
    .metric-grid { grid-template-columns: 1fr; }
    .hero-actions { align-items: stretch; flex-direction: column; }
    .hero-actions .button, .hero-actions .text-link { width: 100%; text-align: center; }
  }
  @media (prefers-reduced-motion: reduce) {
    .button { transition: none; }
    .button:hover { transform: none; }
  }
</style>
```

- [ ] **Step 3: 运行关于页、类型和构建测试**

Run:

```bash
npm run check
npx playwright test e2e/about.spec.ts
npm run build
```

Expected: PASS；页面包含 7 张完整卡，桌面 / 移动无横向溢出，下载和详情链接正确。

- [ ] **Step 4: 精确提交关于页主体**

Run:

```bash
git add -- src/assets/about-portrait.jpg src/data/about.ts src/data/profile.ts \
  src/components/about/AboutProjectCard.astro src/pages/about.astro e2e/about.spec.ts
git diff --cached --check
git commit -m "feat: rebuild about page as project profile"
```

### Task 5: 让滚动动效成为渐进增强

**Files:**
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/styles/global.css`
- Modify: `e2e/about.spec.ts`

- [ ] **Step 1: 增加无 JavaScript 失败测试**

在 `e2e/about.spec.ts` 增加：

```ts
test('about content remains visible without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/about/');
  await expect(page.getByRole('heading', { level: 1, name: '钱麒祥' })).toBeVisible();
  await expect(page.locator('[data-about-project]')).toHaveCount(7);
  await expect(page.locator('[data-project-id="sales"]')).toBeVisible();
  await context.close();
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run:

```bash
npx playwright test e2e/about.spec.ts --grep "without JavaScript"
```

Expected: FAIL；现有 `.reveal` 默认 `opacity: 0`。

- [ ] **Step 3: 修改 BaseLayout 的增强标记和 observer 降级**

在 `<head>` 的现有内联脚本开头加入：

```js
document.documentElement.classList.add('js');
```

把 body 末尾滚动脚本改为：

```js
const runReveal = () => {
  const elements = [...document.querySelectorAll('.reveal')];
  if (!('IntersectionObserver' in window)) {
    elements.forEach((element) => element.classList.add('in'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  elements.forEach((element) => observer.observe(element));
};
if (document.readyState !== 'loading') runReveal();
else document.addEventListener('DOMContentLoaded', runReveal, { once: true });
```

- [ ] **Step 4: 反转 reveal 的 CSS 默认态**

将全局规则改为：

```css
.reveal { opacity: 1; transform: none; }
.js .reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.65s var(--ease), transform 0.65s var(--ease);
}
.js .reveal.in { opacity: 1; transform: none; }
.js .reveal[data-delay='1'] { transition-delay: 0.08s; }
.js .reveal[data-delay='2'] { transition-delay: 0.16s; }
.js .reveal[data-delay='3'] { transition-delay: 0.24s; }
@media (prefers-reduced-motion: reduce) {
  .js .reveal { opacity: 1; transform: none; transition: none; }
  .aurora::before { animation: none; }
  html { scroll-behavior: auto; }
}
```

- [ ] **Step 5: 运行动效降级和站点回归**

Run:

```bash
npx playwright test e2e/about.spec.ts e2e/home.spec.ts e2e/visual.spec.ts --grep-invert "resume"
```

Expected: PASS；无 JS 与减少动效模式内容可见，首页现有 reveal 仍正常。

- [ ] **Step 6: 精确提交渐进增强**

Run:

```bash
git add -- src/layouts/BaseLayout.astro src/styles/global.css e2e/about.spec.ts
git diff --cached --check
git commit -m "fix: make reveal motion progressive"
```

### Task 6: 同步本地完整版 Markdown

**Files:**
- Modify: `e2e/resume-data.spec.ts`
- Modify: `docs/resume/完整版-简历.md`

- [ ] **Step 1: 增加 Markdown 同步测试**

在 `e2e/resume-data.spec.ts` 顶部导入：

```ts
import { readFileSync } from 'node:fs';
```

增加：

```ts
test('complete resume markdown contains the approved public facts', () => {
  const markdown = readFileSync('docs/resume/完整版-简历.md', 'utf8');
  expect(markdown).toMatch(/^# 钱麒祥$/m);
  expect(markdown).toContain('2 份正式业务竞品分析');
  expect(markdown).toContain('### 个人网站｜qqx.life');
  expect(markdown).toContain('2026.06–至今');
  expect(markdown).toContain('22 个 Astro 页面');
  expect(markdown).toContain('16 个 E2E 测试文件');
  expect(markdown).toContain('2018.09–2022.06');
  expect(markdown).not.toMatch(/173\s*9571\s*1345|2000\.02/);
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run:

```bash
npx playwright test e2e/resume-data.spec.ts --grep "complete resume markdown"
```

Expected: FAIL；姓名、竞品数量、个人网站项目和教育日期尚未同步。

- [ ] **Step 3: 精确更新 Markdown**

在 `docs/resume/完整版-简历.md`：

- 将首行改为 `# 钱麒祥`。
- 将 Knowledge Harness 的 1 份竞品分析改为 2 份。
- 将教育日期改为 `2018.09–2022.06`。
- 在 Knowledge Harness 后、工作经历前新增：

```markdown
### 个人网站｜qqx.life

**角色：** 独立产品设计与实践

**时间：** 2026.06–至今

**状态：** 公开运行｜持续迭代

**项目背景：**

个人项目、AI 实践和产品思考缺少统一入口，也需要验证 AI 辅助开发能否形成完整、可复用的交付流程。项目因此以公开网站为载体，连接内容沉淀、项目展示、自动化验证和持续发布。

**具体实现：**

- 按“需求 / Spec → 实施计划 → 编码 → E2E 验证 → GitHub Pages 发布”完成端到端交付。
- 沿用统一设计令牌、深浅主题与内容结构，把项目经历、AI 实践和产品思考连接为公开作品档案。
- 使用 Playwright 验证核心页面和响应式表现，并通过 GitHub Actions 持续发布。

**结果证据：**

- 当前公开项目包含 22 个 Astro 页面和 16 个 E2E 测试文件。
- 已具备自动化部署和可复现的简历导出能力。

**关键词：** AI 辅助开发 / 端到端交付 / 自动化验证 / 持续发布
```

- [ ] **Step 4: 运行事实、Markdown 和隐私测试**

Run:

```bash
npx playwright test e2e/resume-data.spec.ts
```

Expected: PASS。

- [ ] **Step 5: 精确提交完整版简历**

Run:

```bash
git add -- 'docs/resume/完整版-简历.md' e2e/resume-data.spec.ts
git diff --cached --check
git commit -m "docs: sync complete AI product resume"
```

### Task 7: 替换并保护主下载 PDF

**Files:**
- Modify: `e2e/resume-pdf.spec.ts`
- Modify: `scripts/export-resumes.mjs`
- Replace: `public/resume.pdf`
- Verify unchanged: `public/resume-b2b-saas.pdf`

- [ ] **Step 1: 先用 Hash 写失败测试**

在 `e2e/resume-pdf.spec.ts` 导入 `createHash`：

```ts
import { createHash } from 'node:crypto';
```

把 AI PDF 测试改为：

```ts
test('AI product manager resume PDF is the approved two-page document', () => {
  const pdf = readFileSync('public/resume.pdf');
  expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
  expect(pdf.byteLength).toBe(278_828);
  expect(createHash('sha256').update(pdf).digest('hex')).toBe(
    '5e3f51bb2fb5a63452581c49e7286b7dd880da72dbb0582a2848fcc585371cad',
  );
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run:

```bash
npx playwright test e2e/resume-pdf.spec.ts --grep "approved two-page"
```

Expected: FAIL；当前 `public/resume.pdf` 是 706333 字节的一页网页导出文件。

- [ ] **Step 3: 防止导出脚本再次覆盖固定文件**

将 `scripts/export-resumes.mjs` 的 `outputs` 改为只包含：

```js
const outputs = [
  { route: '/resume/b2b/', variant: 'b2b', file: 'public/resume-b2b-saas.pdf' },
];
```

保留端口探测、临时文件、原子 rename 和清理逻辑不变。`/resume/ai/` 网页仍可预览，但不再由 `resume:export` 写入主下载文件。

- [ ] **Step 4: 复制用户 PDF 并验证主 / 次文件**

Run:

```bash
cp '/Users/qqx/Desktop/个人/AI产品经理-钱麒祥.pdf' 'public/resume.pdf'
shasum -a 256 'public/resume.pdf' '/Users/qqx/Desktop/个人/AI产品经理-钱麒祥.pdf'
shasum -a 256 -c tmp/about-resume/input.sha256
pdfinfo 'public/resume.pdf'
```

Expected: 主文件两行 Hash 一致；输入快照中头像和 B2B PDF 仍为 OK；`pdfinfo` 显示 2 页 A4、未加密。

- [ ] **Step 5: 运行 PDF 和下载链接测试**

Run:

```bash
npx playwright test e2e/resume-pdf.spec.ts e2e/about.spec.ts
```

Expected: PASS；端口冲突测试仍确认导出失败不会修改两个 public PDF。

- [ ] **Step 6: 渲染两页并人工核验**

Run:

```bash
mkdir -p tmp/about-resume/pdf-render
pdftoppm -png -r 144 'public/resume.pdf' 'tmp/about-resume/pdf-render/page'
ls -lh tmp/about-resume/pdf-render/page-1.png tmp/about-resume/pdf-render/page-2.png
```

使用图片查看工具检查两页：无裁切、遮挡、乱码、黑块或不可读内容；同时记录 PDF 内部日期差异——第一页个人网站为 2026.06，第二页为 2026.04，本次不修改。

- [ ] **Step 7: 精确提交下载资产保护**

Run:

```bash
git add -- public/resume.pdf scripts/export-resumes.mjs e2e/resume-pdf.spec.ts
git diff --cached --check
git commit -m "feat: publish approved AI product resume"
```

### Task 8: 全量验证与视觉封板

**Files:**
- Verify: all task files
- Runtime only: `test-results/`
- Runtime only: `tmp/about-resume/`

- [ ] **Step 1: 运行静态检查、专用检查和构建**

Run:

```bash
npm run check
npm run resume:check
npm run build
```

Expected: 三个命令均退出 0；`dist/resume.pdf` 是 278828 字节，`dist/resume-b2b-saas.pdf` 仍存在。

- [ ] **Step 2: 运行完整 E2E**

Run:

```bash
npm run test:e2e
```

Expected: 全部测试通过，没有因真实姓名、项目数或 reveal 渐进增强造成其他页面回归。

- [ ] **Step 3: 生成关于页四组视觉证据**

Run:

```bash
npx playwright test e2e/visual.spec.ts --grep "shot /about/"
find test-results -type f -name '*about*.png' -print | sort
```

Expected: 生成桌面 / 移动 × 浅色 / 深色四张完整页面截图。逐张检查 Hero、头像裁切、双轨概览、七张大卡、长文换行、底部 CTA 和无横向溢出。

- [ ] **Step 4: 复核固定资产与工作区边界**

Run:

```bash
test "$(shasum -a 256 public/resume.pdf | awk '{print $1}')" = \
  '5e3f51bb2fb5a63452581c49e7286b7dd880da72dbb0582a2848fcc585371cad'
test "$(shasum -a 256 public/resume-b2b-saas.pdf | awk '{print $1}')" = \
  '6f84f760c4a4d8c30a30dbd9af686640bd462e2e99d6cbda1d13d1ba8530d8e0'
git diff --check
git status --short
```

Expected: 两个 Hash 断言通过；只剩任务范围内已提交结果和实施前就存在的用户改动 / 未跟踪文件；`.superpowers/`、`tmp/`、DOCX 和 resume_docx 现有改动未被暂存。

- [ ] **Step 5: 记录 `ABOUT_RESUME_PASS`**

在最终交付中报告：

- 关于页设计、完整项目卡和响应式 / 无 JS / 减少动效验收结果。
- 完整版 Markdown 的具体更新。
- 主 PDF Hash、2 页 A4 和视觉核验结果；B2B PDF 未修改。
- PDF 第二页个人网站日期仍为 2026.04 的已知差异。
- 未部署、未推送；工作区其他用户改动保持原样。
