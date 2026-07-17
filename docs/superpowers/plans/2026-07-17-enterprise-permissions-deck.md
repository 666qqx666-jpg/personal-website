# Enterprise Permissions Deck Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `/projects/enterprise-permissions/` 上线第二个项目案例 Deck，用 11 个整屏场景讲清“共享同一套业务底座，不代表必须共享同一种权限模型”，重点证明连锁品牌五类权限对象应由各业务模块按数据对象取用。

**Architecture:** 复用 `DeckLayout.astro` 的主题、极光、网格、返回入口和桌面纵向 scroll-snap；新 Astro 页面承载脱敏后的语义内容与 CSS 图形，独立 TypeScript 控制器只用 `IntersectionObserver + matchMedia` 管理一次性短入场、章节导航和清理。HTML 默认呈现最终状态，只有观察器成功建立后才进入 `observe` 准备态；移动端、减少动态、无 JavaScript 和观察器不可用时都保持完整静态可读。

**Tech Stack:** Astro 5、TypeScript、原生 `IntersectionObserver`、CSS/SVG、Playwright、`astro check`

---

## 0. 实施前裁决

### 0.1 输入、知识预检与事实真值源

- 设计真值源：`docs/superpowers/specs/2026-07-17-enterprise-permissions-deck-design.md`。
- 项目事实来源：`docs/project-experience/00-project-experience-guide.md`，只读取，不在本任务修改。
- 用户已明确批准设计 Spec，并确认本 Deck 不使用 GSAP Skills，也不使用 GSAP 或 ScrollTrigger 运行时。
- 正式知识预检采用三张卡：`PRD审查经验`、`PRD进入原型前交互封口清单`、`高保真原型真实页面基线规则`。据此把状态、事实边界、页面关系、失败路径和视觉保留项写成可测试合同。
- `没有胜仗的敏捷会变成消耗`只适用于连续高压迭代复盘，本次单页实施不采用；AI/RAG/Agent 技术卡与静态 Deck 运行时无关，也不进入计划。
- 仓库实际测试目录是 `e2e/`。Spec 中泛指的 `tests/` 在实施中落为 `e2e/enterprise-permissions.spec.ts`，不新建第二套测试目录。
- 2026-07-17 基线：`npm run check` 为 0 errors、0 warnings；`e2e/sales-lead-slm.spec.ts` 与 `e2e/deck-theme.spec.ts` 共 16 条用例全部通过。

### 0.2 Spec-readiness gate：PASS

| 检查面 | 结论 | 实施约束 |
|---|---|---|
| 状态组合 | 已闭合 | `static`、`observe`、`reduce`、`fallback` 四种动效模式；桌面、390px 移动端、深色、浅色均有验收 |
| 失败与快速滚动 | 已闭合 | 默认不隐藏内容；观察器成功后才标记 pending；脚本失败、观察器缺失、反向滚动均能显示最终内容 |
| 枚举闭合 | 已闭合 | 固定 11 场景、5 章节、2 套已上线模型、5 类权限、3 个业务读取关系、4 个采用规模指标 |
| SSOT | 已闭合 | 场景事实以批准 Spec 为唯一内容源；章节与规模数据在 Astro frontmatter 中集中声明；五维及模块映射由稳定 `data-*` 语义接口唯一标识；测试只锁公开口径 |
| 并发与写入 | 不适用 | 页面无表单、持久化、资金、账号或权限写入；主题存储沿用 `DeckLayout` 既有逻辑 |
| 脱敏边界 | 已闭合 | 只用抽象标签和虚构节点；不出现客户名、成员名、生产字段、接口、权限字典或鉴权细节 |
| 范围 | 可单计划交付 | 一个路由、一个控制器、一个入口增量、一份 E2E 合同和一处共享主题路由增量 |

### 0.3 页面关系与保留边界

| 页面/文件 | 关系 | 必须保留 | 本次允许变化 |
|---|---|---|---|
| `/projects/` | 原页面扩展 | `BaseLayout + SectionGrid`、现有销售线索卡 | 在其后增加权限体系案例卡 |
| `/projects/enterprise-permissions/` | 新建页面 | 复用 `DeckLayout` | 新增 11 场景、5 章节导航、局部 CSS 图形、原生动效启动入口 |
| `DeckLayout.astro` | 只复用 | 深浅色同步、主题按钮、返回首页、极光网格、桌面 scroll-snap | 不修改文件 |
| 销售线索 Deck | 不在范围 | 页面、CSS、事实、GSAP 控制器、E2E 全部保持现状 | 仅作为回归对象 |
| `.superpowers/` | 草稿目录 | 用户现有内容保持原样 | 不暂存、不提交 |
| 项目总控指南 | 只读 | 用户现有修改保持原样 | 不暂存、不提交 |

### 0.4 11 场景内容合同

| 场景 | 章节 | 必须出现的内容 | 视觉职责 |
|---|---|---|---|
| S1 | 共同约束 | “同一套系统，为什么需要两种权限模型？”；共享底座不等于共享模型 | 两种业务世界从共享底座分叉 |
| S2 | 共同约束 | 综合商场与连锁品牌均为已上线；商场管辖对照门店网络与自定义组织 | 青绿与紫色双世界对照 |
| S3 | 共同约束 | 业务权限身份分离、审计操作身份统一；复用数据库、业务模块和日志 | 双身份桥接共享底座 |
| S4 | 商场基线 | `成员有效权限 = 商场管辖范围 × 页面操作范围`；角色不含商场范围 | 二维权限矩阵 |
| S5 | 商场基线 | 具体商场是绝对范围；商场组覆盖当前和未来新增商场；角色复用页面操作 | 固定集合对照动态商场组 |
| S6 | 品牌分叉 | 品牌管的是企业组织和门店网络；固定总部—区域—门店模板不成立 | 模型分叉转折 |
| S7 | 品牌分叉 | 组织、门店、行政区、平台、页面及操作五类权限；组织节点不自动继承其他权限 | 五个独立图形完整解释五维 |
| S8 | 品牌分叉 | 卡券读门店+平台；销售线索读行政区+平台；成员治理读组织；页面操作作为横向边界；不做五维全局求交 | 模块与权限的按需取用关系 |
| S9 | 治理闭环 | 向下授权只能缩小；同级隔离；总部跨区；前后端双重校验；统一审计身份 | 授权路径与越权阻断 |
| S10 | 真实运行 | 约 25 个商场、约 30 个品牌、约 3,000 名成员、单客户 3 万多家门店；规模不等于增长因果 | 静态规模板与治理行为分栏 |
| S11 | 真实运行 | 复用底座而不是复用错误模型；不扩张成万能权限中台；返回项目经历 | 双模型重新落回共享底座 |

### 0.5 动效状态机

| 模式 | 进入条件 | DOM 合同 | 视觉结果 |
|---|---|---|---|
| `static` | HTML 初始状态或清理完成 | 无 `data-motion-ready`；场景无 pending | 全部最终可见 |
| `observe` | 未减少动态且 `IntersectionObserver` 成功创建 | `data-motion-ready="true"`；未进入场景=`pending`，已进入=`visible` | 一次性短入场，无 pin、scrub、横向轨道 |
| `reduce` | `prefers-reduced-motion: reduce` | `data-motion-ready="true"`；全部=`visible` | 无位移、无错峰等待 |
| `fallback` | `IntersectionObserver` 不存在或初始化抛错 | `data-motion-ready="false"`；全部=`visible` | 静态最终状态 |

控制器不得导入 `gsap`、`ScrollTrigger` 或其他动效依赖；页面不得生成 `.pin-spacer`。主题切换只改变 CSS 变量，不重新创建观察器。

## 1. 文件结构

### 新建

- `src/pages/projects/enterprise-permissions.astro`：11 场景内容、五维图形、模块映射、局部 CSS、章节导航、控制器启动。
- `src/scripts/enterprise-permissions-motion.ts`：原生观察器、减少动态分支、章节导航、清理和静态降级。
- `e2e/enterprise-permissions.spec.ts`：入口、内容、映射、主题、响应式、可访问性、动效状态和回归合同。

### 修改

- `src/pages/projects/index.astro`：保留销售线索卡并增加第二张权限体系卡。
- `e2e/deck-theme.spec.ts`：把新路由加入共享主题路由数组。

### 明确不修改

- `src/layouts/DeckLayout.astro`
- `src/pages/projects/sales-lead-slm.astro`
- `src/scripts/sales-lead-slm-motion.ts`
- `e2e/sales-lead-slm.spec.ts`
- `.gitignore`
- `docs/project-experience/00-project-experience-guide.md`

## Task 1: 建立项目入口与路由失败合同

**Files:**
- Create: `e2e/enterprise-permissions.spec.ts`
- Modify: `src/pages/projects/index.astro`

- [ ] **Step 1: 写项目入口失败测试**

创建 `e2e/enterprise-permissions.spec.ts`：

```ts
import { readFile } from 'node:fs/promises';
import { test, expect } from '@playwright/test';

const route = '/projects/enterprise-permissions/';

test('projects listing exposes the enterprise permissions case', async ({ page }) => {
  await page.goto('/projects/');
  const card = page.locator('.card', { hasText: '多业务线企业权限体系' });

  await expect(card).toBeVisible();
  await expect(card).toContainText('共享同一套业务底座');
  await expect(card).toContainText('权限模型');
  await expect(card).toHaveAttribute('href', route);
});
```

- [ ] **Step 2: 运行入口测试并确认先失败**

Run: `npx playwright test e2e/enterprise-permissions.spec.ts --grep "projects listing"`

Expected: FAIL，项目列表找不到“多业务线企业权限体系”卡片。

- [ ] **Step 3: 在现有销售线索卡后增加第二张卡**

把 `src/pages/projects/index.astro` 的 `items` 改为：

```astro
const items = [
  {
    title: '全域销售线索管理系统',
    hook: '让线索真正到达合适的门店：从动态匹配到责任链重构',
    tags: ['销售线索', '公海池', '责任链重构'],
    href: `${base}projects/sales-lead-slm/`,
    cover: 'linear-gradient(120deg, #2563eb 0%, #7c3aed 52%, #0891b2 100%)',
  },
  {
    title: '多业务线企业权限体系',
    hook: '共享同一套业务底座，不代表必须共享同一种权限模型',
    tags: ['权限建模', '组织治理', '多业务线'],
    href: `${base}projects/enterprise-permissions/`,
    cover: 'linear-gradient(120deg, #0f9f8f 0%, #2563eb 48%, #7c3aed 100%)',
  },
];
```

不得重排、改写或删除销售线索卡。

- [ ] **Step 4: 运行入口测试并确认通过**

Run: `npx playwright test e2e/enterprise-permissions.spec.ts --grep "projects listing"`

Expected: PASS。

- [ ] **Step 5: 提交入口增量**

```bash
git add e2e/enterprise-permissions.spec.ts src/pages/projects/index.astro
git commit -m "feat: add enterprise permissions project entry"
```

## Task 2: 落地 11 场景静态内容与事实边界

**Files:**
- Modify: `e2e/enterprise-permissions.spec.ts`
- Create: `src/pages/projects/enterprise-permissions.astro`

- [ ] **Step 1: 增加场景、章节、上线状态和规模失败测试**

追加：

```ts
test('deck renders eleven scenes and five chapter links', async ({ page }) => {
  await page.goto(route);

  await expect(page.getByRole('heading', { name: '同一套系统，为什么需要两种权限模型？' })).toBeVisible();
  await expect(page.locator('section[data-scene]')).toHaveCount(11);

  const nav = page.getByRole('navigation', { name: '企业权限体系案例章节' });
  for (const label of ['共同约束', '商场基线', '品牌分叉', '治理闭环', '真实运行']) {
    await expect(nav.getByRole('link', { name: label })).toBeVisible();
  }
});

test('deck keeps launched status, public scale, and contribution boundary accurate', async ({ page }) => {
  await page.goto(route);

  await expect(page.locator('#s2 [data-status="launched"]')).toHaveCount(2);
  await expect(page.locator('#s2')).toContainText('综合商场成员与权限体系');
  await expect(page.locator('#s2')).toContainText('连锁品牌组织与多维权限体系');
  await expect(page.locator('#s3')).toContainText('业务权限身份分离');
  await expect(page.locator('#s3')).toContainText('审计操作身份统一');
  await expect(page.locator('#s10')).toContainText('约 25 个综合商场');
  await expect(page.locator('#s10')).toContainText('约 30 个连锁品牌');
  await expect(page.locator('#s10')).toContainText('约 3,000 名已创建成员');
  await expect(page.locator('#s10')).toContainText('单客户 3 万多家门店');

  const body = await page.locator('body').innerText();
  expect(body).not.toContain('万能权限中台');
  expect(body).not.toContain('独立完成研发');
  expect(body).not.toContain('生产权限字典');
});
```

- [ ] **Step 2: 运行静态合同并确认路由失败**

Run: `npx playwright test e2e/enterprise-permissions.spec.ts --grep "eleven scenes|public scale"`

Expected: FAIL，路由尚不存在。

- [ ] **Step 3: 创建 frontmatter、章节和集中事实数据**

`src/pages/projects/enterprise-permissions.astro` 顶部使用：

```astro
---
import DeckLayout from '../../layouts/DeckLayout.astro';

const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
const chapters = [
  { href: '#s1', id: 'constraint', label: '共同约束' },
  { href: '#s4', id: 'mall', label: '商场基线' },
  { href: '#s6', id: 'brand', label: '品牌分叉' },
  { href: '#s9', id: 'governance', label: '治理闭环' },
  { href: '#s10', id: 'running', label: '真实运行' },
];
const scale = [
  ['约 25 个', '综合商场'],
  ['约 30 个', '连锁品牌'],
  ['约 3,000 名', '已创建成员'],
  ['3 万多家', '单客户门店场景'],
];
---
```

章节 ID 同时是 `data-chapter` 和控制器接口，不再声明第二套章节映射。

- [ ] **Step 4: 写入 S1–S6 静态语义结构**

在 `<DeckLayout>` 内先放根容器和前六屏：

```astro
<DeckLayout
  title="多业务线企业权限体系｜QQ星"
  description="共享同一套业务底座，不代表必须共享同一种权限模型。"
>
  <main
    id="enterprise-permissions-deck"
    class="enterprise-permissions-deck"
    data-enterprise-permissions-deck
    data-motion-mode="static"
  >
    <section id="s1" data-scene="opening" data-chapter="constraint">
      <div class="scene-shell hero-shell">
        <p class="chapter">Enterprise Permissions</p>
        <h1>同一套系统，为什么需要两种权限模型？</h1>
        <p class="lead">综合商场与连锁品牌共用数据库、多数业务模块和操作日志，但它们真正治理的对象并不相同。</p>
        <p class="memory-line">共享同一套业务底座，不代表必须共享同一种权限模型。</p>
      </div>
    </section>

    <section id="s2" data-scene="worlds" data-chapter="constraint">
      <div class="scene-shell">
        <p class="eyebrow">Two Business Worlds</p>
        <h2>一个围绕商场管辖，一个围绕门店网络生长</h2>
        <div class="world-grid" data-motion-item>
          <article class="world-card world-mall">
            <span class="status" data-status="launched">已上线</span>
            <h3>综合商场成员与权限体系</h3>
            <p>围绕具体商场、商场组、区域与集团岗位建立管辖关系。</p>
            <div class="world-shape" role="img" aria-label="综合商场按商场和商场组治理">
              <span>集团</span><span>区域</span><span>商场组</span><span>商场</span>
            </div>
          </article>
          <article class="world-card world-brand">
            <span class="status" data-status="launched">已上线</span>
            <h3>连锁品牌组织与多维权限体系</h3>
            <p>围绕门店网络、自定义组织分支、区域、事业部与品类治理。</p>
            <div class="world-shape" role="img" aria-label="连锁品牌按组织分支和门店网络治理">
              <span>企业</span><span>区域线</span><span>事业部</span><span>门店网</span>
            </div>
          </article>
        </div>
        <div class="shared-base" data-motion-item>
          <strong>共享业务底座</strong>
          <span>同一数据库</span><span>多数业务模块</span><span>统一操作日志</span>
        </div>
      </div>
    </section>

    <section id="s3" data-scene="identity" data-chapter="constraint">
      <div class="scene-shell split-shell">
        <div>
          <p class="eyebrow">Shared Base, Separate Identity</p>
          <h2>共用数据库，不等于共用成员模型</h2>
          <p class="lead-copy">连锁品牌成员承担真实业务鉴权，同时关联一个综合商场成员身份；后者继续作为全系统统一操作身份写入现有日志。</p>
          <p class="principle">业务权限身份分离，审计操作身份统一。</p>
        </div>
        <div class="identity-bridge" data-motion-item role="img" aria-label="业务权限身份与审计操作身份的关联关系">
          <article><span>业务鉴权</span><strong>品牌成员身份</strong><small>组织、门店、行政区、平台、页面操作</small></article>
          <span class="bridge-link">关联</span>
          <article><span>统一审计</span><strong>商场成员身份</strong><small>沿用现有操作日志与业务对象</small></article>
        </div>
      </div>
    </section>

    <section id="s4" data-scene="mall-model" data-chapter="mall">
      <div class="scene-shell">
        <p class="eyebrow">Mall Baseline</p>
        <h2>综合商场先用二维模型解决管辖与操作</h2>
        <p class="formula">成员有效权限 = 商场管辖范围 × 页面操作范围</p>
        <div class="matrix" data-motion-item role="img" aria-label="商场管辖范围与页面操作范围组成二维权限矩阵">
          <div class="matrix-axis matrix-scope"><strong>商场范围</strong><span>具体商场</span><span>商场组</span></div>
          <span class="matrix-times">×</span>
          <div class="matrix-axis matrix-action"><strong>页面操作</strong><span>角色</span><span>自定义权限</span></div>
        </div>
        <p class="boundary-note">角色只封装页面和操作，不把商场范围打包进去。</p>
      </div>
    </section>

    <section id="s5" data-scene="mall-evolution" data-chapter="mall">
      <div class="scene-shell">
        <p class="eyebrow">From Repetition to Reuse</p>
        <h2>把逐人配置收敛成角色复用与动态商场组</h2>
        <div class="evolution-grid" data-motion-item>
          <article><span class="type-label">绝对范围</span><strong>具体商场</strong><p>成员直接选择一组确定商场，范围固定。</p><div class="fixed-set"><i>A 商场</i><i>B 商场</i><i>C 商场</i></div></article>
          <article><span class="type-label">相对范围</span><strong>动态商场组</strong><p>按组织关系覆盖当前商场，并自动覆盖未来新增商场。</p><div class="dynamic-set"><i>华东组</i><i>当前商场</i><i>未来新增</i></div></article>
          <article><span class="type-label">操作复用</span><strong>客户自建角色</strong><p>常规岗位复用角色，特殊岗位保留自定义页面操作。</p><div class="role-set"><i>区域负责人</i><i>运营岗位</i></div></article>
        </div>
      </div>
    </section>

    <section id="s6" data-scene="branch" data-chapter="brand">
      <div class="scene-shell split-shell">
        <div>
          <p class="eyebrow">Model Branch</p>
          <h2>品牌管的不是商场，而是企业组织与门店网络</h2>
          <p class="lead-copy">客户可能按区域组织，也可能按事业部或品类组织。固定“总部—区域—门店”模板无法覆盖真实组织，商场二维模型也无法解释品牌业务数据。</p>
          <p class="principle">共享底座继续复用，治理模型从这里分叉。</p>
        </div>
        <div class="branch-figure" data-motion-item role="img" aria-label="品牌组织按区域、事业部和品类形成自定义分支">
          <strong>品牌企业</strong>
          <div><span>区域组织</span><span>事业部</span><span>品类线</span></div>
          <div><i>门店网络</i><i>成员关系</i><i>业务数据</i></div>
        </div>
      </div>
    </section>
```

- [ ] **Step 5: 写入 S7–S11 与章节导航**

继续放入：

```astro
    <section id="s7" data-scene="dimensions" data-chapter="brand">
      <div class="scene-shell scene-shell-wide">
        <p class="eyebrow">Five Independent Objects</p>
        <h2>五类权限对象，每一维只解决一种治理问题</h2>
        <div class="dimension-grid">
          <article class="dimension-card" data-dimension="organization" data-motion-item>
            <h3>组织架构权限</h3>
            <p>决定上下级成员治理，以及能否管理下级创建的数据。</p>
            <div class="org-tree" role="img" aria-label="组织权限树：总部向区域和事业部分支">
              <strong>总部</strong><div><span>华东区域</span><span>事业部 A</span></div><div><i>成员</i><i>下级数据</i></div>
            </div>
          </article>
          <article class="dimension-card" data-dimension="store" data-motion-item>
            <h3>门店权限</h3>
            <p>作用于以门店为数据对象的业务范围。</p>
            <div class="store-scopes" role="img" aria-label="门店权限包含全部门店、区域内门店和指定门店">
              <span>全部门店</span><span>区域内门店</span><span>指定门店</span>
            </div>
          </article>
          <article class="dimension-card" data-dimension="region" data-motion-item>
            <h3>行政区权限</h3>
            <p>直接作用于只携带行政区的数据，不从门店地址反推。</p>
            <div class="region-rings" role="img" aria-label="行政区权限包含全部、指定和无权限三档"><span>全部</span><span>指定</span><span>无</span></div>
          </article>
          <article class="dimension-card" data-dimension="platform" data-motion-item>
            <h3>平台权限</h3>
            <p>成员可管辖的平台集合可被多个业务模块共同读取。</p>
            <div class="platform-groups" role="img" aria-label="平台权限按内容、电商、本地生活和私域分类">
              <span>内容平台</span><span>电商平台</span><span>本地生活</span><span>私域平台</span>
            </div>
          </article>
          <article class="dimension-card" data-dimension="page-action" data-motion-item>
            <h3>页面及操作权限</h3>
            <p>控制页面入口，以及查看、创建、编辑和授权动作。</p>
            <div class="menu-tree" role="img" aria-label="页面菜单树和按钮级操作权限">
              <strong>业务菜单</strong><span>卡券页</span><span>线索页</span><div><i>查看</i><i>编辑</i><i>授权</i></div>
            </div>
          </article>
        </div>
        <p class="boundary-note">组织节点只确定上下级关系，不自动向节点内成员继承门店、行政区、平台或页面权限。</p>
      </div>
    </section>

    <section id="s8" data-scene="module-mapping" data-chapter="brand">
      <div class="scene-shell scene-shell-wide">
        <p class="eyebrow">The Product Decision</p>
        <h2>业务模块各取所需，而不是把五类权限全局求交</h2>
        <div class="mapping-grid" data-motion-item role="group" aria-label="卡券、销售线索和成员治理按业务对象读取权限">
          <article class="module-card" data-module="coupon">
            <h3>卡券</h3><p>卡券归属于门店，并来自具体平台。</p>
            <div class="permission-picks"><span data-permission-ref="store" data-required>门店</span><span data-permission-ref="platform" data-required>平台</span><span data-permission-ref="region" data-excluded>行政区不参与</span></div>
          </article>
          <article class="module-card" data-module="sales-lead">
            <h3>销售线索</h3><p>部分线索只有行政区和来源平台。</p>
            <div class="permission-picks"><span data-permission-ref="region" data-required>行政区</span><span data-permission-ref="platform" data-required>平台</span><span data-permission-ref="store" data-excluded>不反推门店</span></div>
          </article>
          <article class="module-card" data-module="member-governance">
            <h3>成员治理</h3><p>上下级关系决定能管理谁，以及谁创建的数据。</p>
            <div class="permission-picks"><span data-permission-ref="organization" data-required>组织架构</span></div>
          </article>
        </div>
        <div class="governance-rails">
          <p data-governance-boundary="organization"><strong>组织治理横向边界</strong><span>决定下级成员及其创建数据的治理关系，不充当业务数据筛选字段。</span></p>
          <p data-governance-boundary="page-action"><strong>页面与操作横向边界</strong><span>继续控制三个模块的入口与动作，不与业务范围混成全局交集。</span></p>
        </div>
        <p class="principle">权限越多不等于模型越强，关键是依赖关系与数据对象匹配。</p>
      </div>
    </section>

    <section id="s9" data-scene="governance" data-chapter="governance">
      <div class="scene-shell">
        <p class="eyebrow">Governance Loop</p>
        <h2>向下授权只能缩小，同级越权在边界处停止</h2>
        <div class="governance-figure" data-motion-item role="group" aria-label="总部向下授权、同级区域隔离和统一审计">
          <div class="grant-source"><strong>总部</strong><span>可跨区域治理</span></div>
          <div class="grant-branches">
            <article><strong>华东区域</strong><span>默认带入上级范围</span><span>只允许继续缩小</span></article>
            <b aria-label="同级越权被阻断">× 同级阻断</b>
            <article><strong>华南区域</strong><span>管理本区成员</span><span>不能访问华东分支</span></article>
          </div>
          <div class="control-chain"><span>前端控制入口与按钮</span><span>后端接口再次校验</span><span>统一审计身份写入日志</span></div>
        </div>
      </div>
    </section>

    <section id="s10" data-scene="results" data-chapter="running">
      <div class="scene-shell">
        <p class="eyebrow">Running at Real Scale</p>
        <h2>规模证明系统真实运行，治理行为证明边界成立</h2>
        <div class="result-columns">
          <div class="stats" role="group" aria-label="企业权限体系实际采用规模">
            {scale.map(([value, label]) => <article class="stat"><b>{value}</b><span>{label}</span></article>)}
          </div>
          <div class="governance-results" data-motion-item>
            <strong>真实治理行为</strong>
            <p>区域负责人可以治理本区域成员及其业务数据。</p>
            <p>同级区域不能互相访问或修改。</p>
            <p>总部可以跨区域管理。</p>
          </div>
        </div>
        <p class="boundary-note">采用规模不等于单一功能带来的业务增长，也不虚构效率提升比例。</p>
      </div>
    </section>

    <section id="s11" data-scene="conclusion" data-chapter="running">
      <div class="scene-shell conclusion-shell">
        <p class="eyebrow">Conclusion</p>
        <h2>复用底座，而不是复用错误模型</h2>
        <p class="lead">数据库、多数业务模块和操作日志继续共享；综合商场与连锁品牌按各自治理对象分别生长。</p>
        <div class="conclusion-base" data-motion-item><span>综合商场模型</span><strong>共享业务底座</strong><span>连锁品牌模型</span></div>
        <p class="boundary-note">这不是一个包打天下的权限引擎，而是两套与真实业务对象匹配、已经进入运行的权限模型。</p>
        <a class="back-projects" href={`${base}projects/`}>返回项目经历</a>
      </div>
    </section>
  </main>

  <nav class="enterprise-permissions-nav" aria-label="企业权限体系案例章节">
    {chapters.map((chapter, index) => (
      <a href={chapter.href} class:list={{ active: index === 0 }} data-chapter-link={chapter.id} aria-current={index === 0 ? 'true' : undefined}>
        <span class="nav-dot"></span><span>{chapter.label}</span>
      </a>
    ))}
  </nav>
</DeckLayout>
```

- [ ] **Step 6: 先用最小样式保证页面可读**

在页面末尾加入最小样式；完整视觉在 Task 4 收敛：

```astro
<style>
  .enterprise-permissions-deck section { width: 100%; }
  .scene-shell { width: min(1120px, 100%); margin-inline: auto; }
  .scene-shell-wide { width: min(1240px, 100%); }
  .hero-shell, .conclusion-shell { text-align: center; }
  .lead, .lead-copy, .boundary-note { color: var(--text-dim); line-height: 1.75; }
  .enterprise-permissions-nav { position: fixed; z-index: 18; left: 50%; bottom: 1rem; translate: -50% 0; }
</style>
```

- [ ] **Step 7: 运行静态测试并确认通过**

Run: `npx playwright test e2e/enterprise-permissions.spec.ts --grep "eleven scenes|public scale"`

Expected: PASS。

- [ ] **Step 8: 提交静态 Deck**

```bash
git add src/pages/projects/enterprise-permissions.astro e2e/enterprise-permissions.spec.ts
git commit -m "feat: build enterprise permissions deck content"
```

## Task 3: 用测试锁定 S7 五维与 S8 模块取用关系

**Files:**
- Modify: `e2e/enterprise-permissions.spec.ts`
- Modify: `src/pages/projects/enterprise-permissions.astro`

- [ ] **Step 1: 增加五维结构与模块映射失败测试**

追加：

```ts
test('S7 explains all five permission objects with distinct visual semantics', async ({ page }) => {
  await page.goto(route);
  const scene = page.locator('#s7');

  for (const dimension of ['organization', 'store', 'region', 'platform', 'page-action']) {
    await expect(scene.locator(`[data-dimension="${dimension}"]`)).toHaveCount(1);
  }
  await expect(scene.locator('[data-dimension="organization"]')).toContainText('上下级成员治理');
  await expect(scene.locator('[data-dimension="store"]')).toContainText('全部门店');
  await expect(scene.locator('[data-dimension="store"]')).toContainText('区域内门店');
  await expect(scene.locator('[data-dimension="store"]')).toContainText('指定门店');
  await expect(scene.locator('[data-dimension="region"]')).toContainText('全部');
  await expect(scene.locator('[data-dimension="region"]')).toContainText('指定');
  await expect(scene.locator('[data-dimension="region"]')).toContainText('无');
  await expect(scene.locator('[data-dimension="platform"] .platform-groups span')).toHaveCount(4);
  await expect(scene.locator('[data-dimension="page-action"]')).toContainText('查看');
  await expect(scene).toContainText('不自动向节点内成员继承');
});

test('S8 maps business modules to matching data objects instead of a global intersection', async ({ page }) => {
  await page.goto(route);
  const coupon = page.locator('#s8 [data-module="coupon"]');
  const salesLead = page.locator('#s8 [data-module="sales-lead"]');
  const member = page.locator('#s8 [data-module="member-governance"]');

  await expect(coupon.locator('[data-permission-ref="store"][data-required]')).toBeVisible();
  await expect(coupon.locator('[data-permission-ref="platform"][data-required]')).toBeVisible();
  await expect(coupon.locator('[data-permission-ref="region"][data-excluded]')).toContainText('不参与');

  await expect(salesLead.locator('[data-permission-ref="region"][data-required]')).toBeVisible();
  await expect(salesLead.locator('[data-permission-ref="platform"][data-required]')).toBeVisible();
  await expect(salesLead.locator('[data-permission-ref="store"][data-excluded]')).toContainText('不反推');

  await expect(member.locator('[data-permission-ref="organization"][data-required]')).toBeVisible();
  await expect(page.locator('#s8 [data-governance-boundary="page-action"]')).toContainText('入口与动作');
  await expect(page.locator('#s8')).toContainText('不是把五类权限全局求交');
});
```

- [ ] **Step 2: 运行关系测试**

Run: `npx playwright test e2e/enterprise-permissions.spec.ts --grep "S7 explains|S8 maps"`

Expected: 若 Task 2 的选择器、文字或映射有任何偏差则 FAIL；按测试合同只修 S7/S8，不改变其他场景。

- [ ] **Step 3: 对照语义检查 S7 图形职责**

逐项确认：

- `organization` 是树状上下级关系，不画成门店列表。
- `store` 同时出现“全部门店 / 区域内门店 / 指定门店”。
- `region` 是三层环形范围，并用文本标注“全部 / 指定 / 无”。
- `platform` 至少四个抽象平台类别，不出现真实客户账号。
- `page-action` 同时有菜单层和按钮动作层。
- 五张卡都有标题、说明和 `aria-label`，颜色不是唯一编码。

- [ ] **Step 4: 对照数据对象检查 S8**

只保留以下依赖，不增加隐含维度：

| 模块 | 业务范围读取 | 明确不参与 | 横向边界 |
|---|---|---|---|
| 卡券 | 门店、平台 | 行政区 | 页面与操作 |
| 销售线索 | 行政区、平台 | 不从门店反推行政区 | 页面与操作 |
| 成员治理 | 组织架构 | 门店、行政区、平台不充当成员层级 | 页面与操作 |

组织治理 rail 只说明下级成员及其创建数据的治理关系；页面操作 rail 只说明入口和动作。两者都不能画成与门店、行政区、平台一起求交的筛选条件。

- [ ] **Step 5: 运行关系测试并提交**

Run: `npx playwright test e2e/enterprise-permissions.spec.ts --grep "S7 explains|S8 maps"`

Expected: PASS。

```bash
git add src/pages/projects/enterprise-permissions.astro e2e/enterprise-permissions.spec.ts
git commit -m "feat: visualize permission dimensions and module mapping"
```

## Task 4: 完成局部视觉系统、主题和响应式

**Files:**
- Modify: `src/pages/projects/enterprise-permissions.astro`
- Modify: `e2e/enterprise-permissions.spec.ts`

- [ ] **Step 1: 增加 scroll-snap、移动端、溢出和颜色冗余失败测试**

追加：

```ts
test('desktop keeps DeckLayout snap while mobile preserves reading order without overflow', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(route);
  expect(await page.locator('[data-enterprise-permissions-deck]').evaluate((element) => getComputedStyle(element).scrollSnapType)).toContain('y');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)).toBe(false);
  const sceneIds = await page.locator('section[data-scene]').evaluateAll((sections) => sections.map((section) => section.id));
  expect(sceneIds).toEqual(['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11']);
  await expect(page.locator('#s7 [data-dimension]')).toHaveCount(5);
  await expect(page.locator('#s8 [data-module]')).toHaveCount(3);
});

test('permission semantics remain explicit without relying on color', async ({ page }) => {
  await page.goto(route);

  await expect(page.locator('#s7 [data-dimension="organization"]')).toHaveAttribute('data-dimension', 'organization');
  await expect(page.locator('#s8 [data-required]')).toHaveCount(5);
  await expect(page.locator('#s8 [data-excluded]')).toHaveCount(2);
  await expect(page.locator('#s9 b[aria-label="同级越权被阻断"]')).toContainText('阻断');
});
```

- [ ] **Step 2: 用页面变量建立四类语义颜色**

把 Task 2 的最小 `<style>` 替换为完整局部样式。开头必须是：

```css
.enterprise-permissions-deck {
  --ep-mall: #2dd4bf;
  --ep-brand: #a78bfa;
  --ep-shared: var(--c-blue);
  --ep-focus: var(--c-cyan);
  --ep-blocked: var(--c-problem);
  --ep-surface: color-mix(in srgb, var(--glass) 90%, transparent);
  --ep-line: color-mix(in srgb, var(--c-blue) 34%, var(--glass-border));
}

.enterprise-permissions-deck section { width: 100%; }
.scene-shell { width: min(1120px, 100%); margin-inline: auto; }
.scene-shell-wide { width: min(1240px, 100%); }
.hero-shell, .conclusion-shell { text-align: center; }
.eyebrow { color: var(--ep-focus); font-size: .78rem; font-weight: 800; letter-spacing: .16em; margin-bottom: .75rem; text-transform: uppercase; }
.lead { max-width: 780px; margin: 1rem auto 0; color: var(--text-dim); font-size: clamp(1rem, 1.7vw, 1.25rem); line-height: 1.8; }
.lead-copy, .boundary-note { color: var(--text-dim); line-height: 1.75; }
.memory-line, .principle { color: var(--text); font-size: clamp(1.05rem, 1.8vw, 1.35rem); font-weight: 750; line-height: 1.6; margin-top: 1.25rem; }
.split-shell { display: grid; grid-template-columns: minmax(280px, .9fr) minmax(360px, 1.1fr); gap: clamp(1.25rem, 4vw, 3.5rem); align-items: center; }
.status, .type-label { display: inline-flex; border: 1px solid currentColor; border-radius: 999px; padding: .3rem .65rem; font-size: .72rem; font-weight: 750; }
```

- [ ] **Step 3: 完成 S2–S6 的共享底座与模型分叉图形**

使用以下布局合同：

```css
.world-grid, .evolution-grid, .dimension-grid, .mapping-grid, .result-columns { display: grid; gap: 1rem; }
.world-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.world-card, .identity-bridge article, .matrix-axis, .evolution-grid article, .dimension-card, .module-card, .governance-figure, .governance-results {
  border: 1px solid var(--glass-border); border-radius: 1.1rem; background: var(--ep-surface); padding: 1rem;
}
.world-mall { border-color: color-mix(in srgb, var(--ep-mall) 55%, var(--glass-border)); }
.world-brand { border-color: color-mix(in srgb, var(--ep-brand) 55%, var(--glass-border)); }
.world-shape, .shared-base, .identity-bridge, .matrix, .fixed-set, .dynamic-set, .role-set, .branch-figure > div { display: flex; flex-wrap: wrap; gap: .55rem; align-items: center; }
.world-shape span, .shared-base span, .fixed-set i, .dynamic-set i, .role-set i, .branch-figure span, .branch-figure i {
  border: 1px solid var(--glass-border); border-radius: .7rem; color: var(--text-dim); font-style: normal; padding: .45rem .6rem;
}
.shared-base { justify-content: center; margin-top: 1rem; border: 1px solid var(--ep-line); border-radius: 1rem; background: color-mix(in srgb, var(--ep-shared) 9%, var(--ep-surface)); padding: .8rem; }
.identity-bridge { justify-content: center; }
.identity-bridge article { flex: 1 1 13rem; }
.identity-bridge small { display: block; color: var(--text-dim); line-height: 1.5; margin-top: .4rem; }
.bridge-link, .matrix-times { color: var(--ep-focus); font-weight: 850; }
.formula { color: var(--text); font-size: clamp(1.1rem, 2vw, 1.45rem); font-weight: 800; text-align: center; }
.matrix { justify-content: center; margin-top: 1.2rem; }
.matrix-axis { display: grid; gap: .5rem; min-width: min(18rem, 100%); }
.matrix-scope { border-color: color-mix(in srgb, var(--ep-mall) 55%, var(--glass-border)); }
.matrix-action { border-color: color-mix(in srgb, var(--ep-shared) 55%, var(--glass-border)); }
.evolution-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.evolution-grid p, .dimension-card p, .module-card p, .governance-results p { color: var(--text-dim); line-height: 1.6; }
.branch-figure { display: grid; gap: 1rem; border: 1px solid color-mix(in srgb, var(--ep-brand) 55%, var(--glass-border)); border-radius: 1.2rem; background: var(--ep-surface); padding: 1.2rem; }
```

- [ ] **Step 4: 完成 S7 五维图形与 S8 映射层级**

```css
.dimension-grid { grid-template-columns: repeat(6, minmax(0, 1fr)); }
.dimension-card { grid-column: span 2; min-width: 0; }
.dimension-card:nth-child(4) { grid-column: 2 / span 2; }
.dimension-card:nth-child(5) { grid-column: 4 / span 2; }
.dimension-card h3, .module-card h3 { margin-bottom: .35rem; }
.org-tree, .menu-tree { display: grid; gap: .45rem; }
.org-tree > div, .menu-tree > div, .store-scopes, .platform-groups, .permission-picks { display: flex; flex-wrap: wrap; gap: .4rem; }
.org-tree span, .org-tree i, .store-scopes span, .platform-groups span, .menu-tree span, .menu-tree i, .permission-picks span {
  border: 1px solid var(--glass-border); border-radius: .65rem; color: var(--text-dim); font-style: normal; padding: .35rem .5rem;
}
.store-scopes span:nth-child(1) { border-style: double; }
.store-scopes span:nth-child(2) { border-style: dashed; }
.store-scopes span:nth-child(3) { border-radius: 999px; }
.region-rings { position: relative; display: grid; place-items: center; width: 8.5rem; aspect-ratio: 1; margin-inline: auto; border: 1px solid var(--ep-brand); border-radius: 50%; }
.region-rings::before, .region-rings::after { content: ""; position: absolute; border: 1px dashed var(--glass-border); border-radius: 50%; }
.region-rings::before { inset: 18%; }
.region-rings::after { inset: 36%; }
.region-rings span { position: relative; z-index: 1; display: block; font-size: .7rem; }
.mapping-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.module-card { border-color: color-mix(in srgb, var(--ep-focus) 42%, var(--glass-border)); }
.permission-picks [data-required] { color: var(--text); border-color: var(--ep-focus); background: color-mix(in srgb, var(--ep-focus) 11%, transparent); }
.permission-picks [data-required]::before { content: "读取 · "; font-size: .68rem; color: var(--ep-focus); }
.permission-picks [data-excluded] { opacity: .72; border-style: dashed; }
.permission-picks [data-excluded]::before { content: "排除 · "; font-size: .68rem; }
.governance-rails { display: grid; gap: .7rem; margin-top: 1rem; }
.governance-rails p { display: grid; grid-template-columns: minmax(10rem, .35fr) 1fr; gap: .8rem; border-left: 3px solid var(--ep-brand); background: var(--ep-surface); color: var(--text-dim); line-height: 1.6; padding: .7rem .9rem; }
.governance-rails p:last-child { border-left-color: var(--ep-shared); }
.governance-rails strong { color: var(--text); }
```

- [ ] **Step 5: 完成 S9–S11 与固定章节导航**

```css
.governance-figure { display: grid; gap: 1rem; }
.grant-source { justify-self: center; display: grid; gap: .25rem; text-align: center; }
.grant-branches { display: grid; grid-template-columns: 1fr auto 1fr; gap: .8rem; align-items: stretch; }
.grant-branches article { display: grid; gap: .4rem; border: 1px solid color-mix(in srgb, var(--ep-brand) 48%, var(--glass-border)); border-radius: .9rem; padding: .8rem; }
.grant-branches article span, .grant-source span { color: var(--text-dim); }
.grant-branches b { align-self: center; color: var(--ep-blocked); white-space: nowrap; }
.control-chain { display: grid; grid-template-columns: repeat(3, 1fr); gap: .6rem; }
.control-chain span { border: 1px solid var(--ep-line); border-radius: .75rem; padding: .6rem; text-align: center; }
.result-columns { grid-template-columns: 1.35fr .65fr; align-items: stretch; }
.stats { grid-template-columns: repeat(2, 1fr); }
.conclusion-base { display: grid; grid-template-columns: 1fr auto 1fr; gap: .75rem; align-items: center; margin: 1.5rem auto; max-width: 760px; }
.conclusion-base > * { border: 1px solid var(--glass-border); border-radius: .85rem; padding: .75rem; }
.conclusion-base strong { border-color: var(--ep-line); }
.back-projects { display: inline-flex; margin-top: 1.4rem; border: 1px solid var(--glass-border); border-radius: 999px; color: var(--text); padding: .7rem 1rem; text-decoration: none; }
.back-projects:focus-visible, .enterprise-permissions-nav a:focus-visible { outline: 3px solid var(--ep-focus); outline-offset: 3px; }
.enterprise-permissions-nav { position: fixed; z-index: 18; left: 50%; bottom: 1rem; translate: -50% 0; display: flex; gap: .3rem; border: 1px solid var(--glass-border); border-radius: 999px; background: var(--chrome-bg); padding: .5rem; backdrop-filter: blur(16px); }
.enterprise-permissions-nav a { display: inline-flex; gap: .4rem; align-items: center; border-radius: 999px; color: var(--text-dim); padding: .42rem .65rem; text-decoration: none; white-space: nowrap; }
.enterprise-permissions-nav a.active { color: var(--text); background: var(--glass); }
.nav-dot { width: .5rem; height: .5rem; border-radius: 50%; background: currentColor; }
#s11 { padding-bottom: 9rem; }
```

- [ ] **Step 6: 封口 860px 与 390px 响应式**

```css
@media (max-width: 860px) {
  .enterprise-permissions-deck { scroll-snap-type: y proximity; }
  .enterprise-permissions-deck section { height: auto; min-height: 100vh; padding-inline: 1rem; }
  .split-shell, .world-grid, .evolution-grid, .mapping-grid, .result-columns { grid-template-columns: 1fr; }
  .dimension-grid { grid-template-columns: 1fr; }
  .dimension-card, .dimension-card:nth-child(4), .dimension-card:nth-child(5) { grid-column: auto; }
  .grant-branches { grid-template-columns: 1fr; }
  .grant-branches b { justify-self: center; }
  .control-chain, .conclusion-base { grid-template-columns: 1fr; }
  .governance-rails p { grid-template-columns: 1fr; gap: .3rem; }
  .enterprise-permissions-nav a { padding-inline: .5rem; }
  .enterprise-permissions-nav a span:last-child { font-size: .68rem; }
}

@supports (height: 100dvh) {
  @media (max-width: 860px) {
    .enterprise-permissions-deck section { min-height: 100dvh; }
  }
}
```

不得通过 `html { overflow-x: hidden; }` 掩盖局部溢出；若某图形超宽，只修该图形的 grid、wrap 或 `min-width: 0`。

- [ ] **Step 7: 运行视觉结构测试并提交**

Run: `npx playwright test e2e/enterprise-permissions.spec.ts --grep "desktop keeps|semantics remain"`

Expected: PASS。

```bash
git add src/pages/projects/enterprise-permissions.astro e2e/enterprise-permissions.spec.ts
git commit -m "feat: style enterprise permissions deck"
```

## Task 5: 实现原生一次性动效、导航同步与静态降级

**Files:**
- Create: `src/scripts/enterprise-permissions-motion.ts`
- Modify: `src/pages/projects/enterprise-permissions.astro`
- Modify: `e2e/enterprise-permissions.spec.ts`

- [ ] **Step 1: 增加无 JS、正常、减少动态、fallback 和依赖边界测试**

追加：

```ts
test('static mode keeps all scenes readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(route);

  await expect(page.locator('[data-enterprise-permissions-deck]')).toHaveAttribute('data-motion-mode', 'static');
  await expect(page.locator('section[data-scene]')).toHaveCount(11);
  await page.locator('#s11').scrollIntoViewIfNeeded();
  await expect(page.locator('#s11')).toBeVisible();
  await expect(page.locator('#s11')).toContainText('复用底座，而不是复用错误模型');
  await context.close();
});

test('desktop uses native observed reveals without pinning or horizontal tracks', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(route);
  const root = page.locator('[data-enterprise-permissions-deck]');

  await expect(root).toHaveAttribute('data-motion-ready', 'true');
  await expect(root).toHaveAttribute('data-motion-mode', 'observe');
  await expect(page.locator('#s1')).toHaveAttribute('data-motion-state', 'visible');
  await page.locator('#s8').scrollIntoViewIfNeeded();
  await expect(page.locator('#s8')).toHaveAttribute('data-motion-state', 'visible');
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)).toBe(false);
});

test('reduced motion directly exposes final content', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(route);
  const root = page.locator('[data-enterprise-permissions-deck]');

  await expect(root).toHaveAttribute('data-motion-mode', 'reduce');
  await expect(root).toHaveAttribute('data-motion-ready', 'true');
  await expect(page.locator('section[data-motion-state="visible"]')).toHaveCount(11);
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await context.close();
});

test('missing IntersectionObserver falls back to fully visible content', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'IntersectionObserver', { value: undefined, configurable: true });
  });
  await page.goto(route);
  const root = page.locator('[data-enterprise-permissions-deck]');

  await expect(root).toHaveAttribute('data-motion-mode', 'fallback');
  await expect(root).toHaveAttribute('data-motion-ready', 'false');
  await expect(page.locator('section[data-motion-state="visible"]')).toHaveCount(11);
  await page.locator('#s11').scrollIntoViewIfNeeded();
  await expect(page.locator('#s11')).toBeVisible();
});

test('motion controller stays independent from GSAP and ScrollTrigger', async () => {
  const source = await readFile(new URL('../src/scripts/enterprise-permissions-motion.ts', import.meta.url), 'utf8');
  expect(source).not.toContain("from 'gsap'");
  expect(source).not.toContain('ScrollTrigger');
});
```

- [ ] **Step 2: 运行测试并确认控制器缺失**

Run: `npx playwright test e2e/enterprise-permissions.spec.ts --grep "static mode|native observed|reduced motion|missing IntersectionObserver|independent"`

Expected: 无 JS 用例 PASS；其余用例因脚本缺失或文件不存在而 FAIL。

- [ ] **Step 3: 创建完整原生控制器**

创建 `src/scripts/enterprise-permissions-motion.ts`：

```ts
type MotionMode = 'static' | 'observe' | 'reduce' | 'fallback';

const sceneSelector = '[data-scene]';
const chapterLinkSelector = '[data-chapter-link]';

function setRootMode(root: HTMLElement, mode: MotionMode, ready: boolean | null) {
  root.dataset.motionMode = mode;
  if (ready === null) delete root.dataset.motionReady;
  else root.dataset.motionReady = String(ready);
}

function setAllScenesVisible(scenes: HTMLElement[]) {
  scenes.forEach((scene) => { scene.dataset.motionState = 'visible'; });
}

function setActiveChapter(chapterId: string) {
  document.querySelectorAll<HTMLAnchorElement>(chapterLinkSelector).forEach((link) => {
    const active = link.dataset.chapterLink === chapterId;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
}

export function initEnterprisePermissionsMotion(root: HTMLElement) {
  const scenes = Array.from(root.querySelectorAll<HTMLElement>(sceneSelector));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let observer: IntersectionObserver | null = null;
  let listening = false;
  let disposed = false;

  const disconnectObserver = () => {
    observer?.disconnect();
    observer = null;
  };

  const applyStaticMode = (mode: Extract<MotionMode, 'reduce' | 'fallback'>, ready: boolean) => {
    disconnectObserver();
    setRootMode(root, mode, ready);
    setAllScenesVisible(scenes);
  };

  const setup = () => {
    disconnectObserver();
    if (reduceMotion.matches) {
      applyStaticMode('reduce', true);
      return;
    }
    if (typeof window.IntersectionObserver !== 'function') {
      applyStaticMode('fallback', false);
      return;
    }

    observer = new IntersectionObserver((entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      visibleEntries.forEach((entry) => {
        const scene = entry.target as HTMLElement;
        scene.dataset.motionState = 'visible';
      });

      const leadingScene = visibleEntries[0]?.target as HTMLElement | undefined;
      if (leadingScene?.dataset.chapter) setActiveChapter(leadingScene.dataset.chapter);
    }, { root: root, rootMargin: '-15% 0px -25% 0px', threshold: [0, 0.15, 0.4, 0.7] });

    scenes.forEach((scene, index) => {
      scene.dataset.motionState = index === 0 ? 'visible' : 'pending';
      observer?.observe(scene);
    });
    setActiveChapter(scenes[0]?.dataset.chapter ?? 'constraint');
    setRootMode(root, 'observe', true);
  };

  const onPreferenceChange = () => {
    if (disposed) return;
    try {
      setup();
    } catch (error) {
      applyStaticMode('fallback', false);
      console.error('Enterprise permissions motion initialization failed', error);
    }
  };

  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    disconnectObserver();
    if (listening) reduceMotion.removeEventListener('change', onPreferenceChange);
    document.removeEventListener('astro:before-swap', cleanup);
    scenes.forEach((scene) => { delete scene.dataset.motionState; });
    setRootMode(root, 'static', null);
  };

  try {
    setup();
    reduceMotion.addEventListener('change', onPreferenceChange);
    listening = true;
    document.addEventListener('astro:before-swap', cleanup);
  } catch (error) {
    applyStaticMode('fallback', false);
    console.error('Enterprise permissions motion initialization failed', error);
  }

  return cleanup;
}
```

- [ ] **Step 4: 在页面中启动控制器**

把以下脚本放在章节导航之后、`</DeckLayout>` 之前：

```astro
<script>
  import { initEnterprisePermissionsMotion } from '../../scripts/enterprise-permissions-motion';

  const root = document.querySelector<HTMLElement>('[data-enterprise-permissions-deck]');
  if (root) initEnterprisePermissionsMotion(root);
</script>
```

- [ ] **Step 5: 添加只在 `observe + pending` 生效的过渡样式**

追加到页面 `<style>`：

```css
[data-enterprise-permissions-deck][data-motion-ready='true'][data-motion-mode='observe'] [data-motion-state='pending'] [data-motion-item] {
  opacity: 0;
  transform: translateY(1rem);
}

[data-enterprise-permissions-deck][data-motion-mode='observe'] [data-motion-state='visible'] [data-motion-item] {
  opacity: 1;
  transform: translateY(0);
  transition: opacity .42s ease, transform .42s ease;
}

#s7 [data-motion-item]:nth-child(2) { transition-delay: .04s; }
#s7 [data-motion-item]:nth-child(3) { transition-delay: .08s; }
#s7 [data-motion-item]:nth-child(4) { transition-delay: .12s; }
#s7 [data-motion-item]:nth-child(5) { transition-delay: .16s; }

@media (prefers-reduced-motion: reduce) {
  .enterprise-permissions-deck *,
  .enterprise-permissions-deck *::before,
  .enterprise-permissions-deck *::after {
    scroll-behavior: auto;
    animation-duration: .01ms;
    animation-iteration-count: 1;
    transition-duration: .01ms;
    transition-delay: 0ms;
  }
}
```

CSS 只能隐藏带 `data-motion-item` 的图形，不能隐藏标题、解释文字、整屏 section 或导航。fallback 与 static 模式不匹配 pending 选择器，因此异常时自动呈现最终状态。

- [ ] **Step 6: 运行完整动效状态测试**

Run: `npx playwright test e2e/enterprise-permissions.spec.ts --grep "static mode|native observed|reduced motion|missing IntersectionObserver|independent"`

Expected: 全部 PASS；DOM 中始终 0 个 `.pin-spacer`。

- [ ] **Step 7: 提交控制器**

```bash
git add src/scripts/enterprise-permissions-motion.ts src/pages/projects/enterprise-permissions.astro e2e/enterprise-permissions.spec.ts
git commit -m "feat: add native permissions deck motion"
```

## Task 6: 接入共享主题并封口导航、清理和浏览器错误

**Files:**
- Modify: `e2e/deck-theme.spec.ts`
- Modify: `e2e/enterprise-permissions.spec.ts`
- Modify if a scoped defect is found: `src/pages/projects/enterprise-permissions.astro`
- Modify if a scoped defect is found: `src/scripts/enterprise-permissions-motion.ts`

- [ ] **Step 1: 把新路由加入共享 Deck 主题回归**

在 `e2e/deck-theme.spec.ts` 的 `deckRoutes` 最后追加：

```ts
  '/projects/enterprise-permissions/',
```

不得改变其他路由顺序或共享主题断言。

- [ ] **Step 2: 增加章节锚点、清理和浏览器错误测试**

追加到权限测试：

```ts
test('chapter anchors remain usable and active state is accessible', async ({ page }) => {
  await page.goto(route);
  const nav = page.getByRole('navigation', { name: '企业权限体系案例章节' });
  const brand = nav.getByRole('link', { name: '品牌分叉' });

  await brand.click();
  await expect(page).toHaveURL(/#s6$/);
  await expect(page.locator('#s6')).toBeAttached();
  await expect(brand).toHaveAttribute('aria-current', 'true');
  await expect(page.getByRole('link', { name: '返回项目经历' })).toHaveAttribute('href', '/projects/');
});

test('controller cleanup restores static readable state', async ({ page }) => {
  await page.goto(route);
  const root = page.locator('[data-enterprise-permissions-deck]');
  await expect(root).toHaveAttribute('data-motion-mode', 'observe');

  await page.evaluate(() => document.dispatchEvent(new Event('astro:before-swap')));
  await expect(root).toHaveAttribute('data-motion-mode', 'static');
  await expect(root).not.toHaveAttribute('data-motion-ready', /.+/);
  await expect(page.locator('section[data-motion-state]')).toHaveCount(0);
  await expect(page.locator('#s11')).toBeAttached();
});

test('rapid forward and reverse scrolling produces no browser errors or hidden current scene', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(route);

  for (const id of ['s4', 's8', 's11', 's7', 's2', 's10']) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await expect(page.locator(`#${id}`)).toHaveAttribute('data-motion-state', 'visible');
  }

  expect(errors).toEqual([]);
});
```

- [ ] **Step 3: 运行主题与运行时封口测试**

Run: `npx playwright test e2e/enterprise-permissions.spec.ts e2e/deck-theme.spec.ts`

Expected: 全部 PASS；浅色 body 背景仍为 `rgb(247, 249, 253)`，主题按钮可见且切换结果持久化。

- [ ] **Step 4: 只修新 Deck 范围内的失败**

允许修复：

- 新页面的 CSS 变量、长标签换行、导航 z-index、底部留白。
- 新控制器的 observer root、阈值、active 章节和 cleanup。
- 新路由在共享主题数组中的遗漏。

禁止修复：

- `DeckLayout.astro` 的全局 scroll-snap 或主题实现。
- 销售线索页面、GSAP 控制器和已有 E2E。
- 其他 AI Deck 或首页样式。

- [ ] **Step 5: 提交主题与运行时封口**

```bash
git add e2e/deck-theme.spec.ts e2e/enterprise-permissions.spec.ts src/pages/projects/enterprise-permissions.astro src/scripts/enterprise-permissions-motion.ts
git commit -m "test: harden enterprise permissions deck states"
```

若页面与控制器没有产生修复，只暂存两份测试文件；不得创建空文件变更。

## Task 7: 完成工程、回归与视觉验收

**Files:**
- Verify only unless an enterprise-permissions-scoped defect is found

- [ ] **Step 1: 运行静态检查**

Run: `npm run check`

Expected: `0 errors`、`0 warnings`、`0 hints`。

- [ ] **Step 2: 运行生产构建并确认路由产物**

Run: `npm run build`

Expected: 构建成功，`dist/projects/enterprise-permissions/index.html` 存在。

- [ ] **Step 3: 运行新 Deck、共享主题和销售线索回归**

Run: `npx playwright test e2e/enterprise-permissions.spec.ts e2e/deck-theme.spec.ts e2e/sales-lead-slm.spec.ts e2e/sections.spec.ts`

Expected: 全部 PASS；销售线索基线仍为 14 条用例通过，共享主题继续通过。

- [ ] **Step 4: 运行全量 Playwright**

Run: `npx playwright test`

Expected: 全部 PASS、无 retry。若既有页面失败，先用 `git diff --name-only` 判断是否与本次文件相关；不得顺手重构无关页面。

- [ ] **Step 5: 桌面 1280×800 视觉走查**

Run: `npm run dev`

检查 `http://localhost:4321/projects/enterprise-permissions/`：

- S1–S3：两个业务世界在共享底座上分叉，身份桥能读出“业务分离、审计统一”。
- S4–S5：二维模型、具体商场、动态商场组和角色复用的层次清楚。
- S6：叙事重心明确从 30% 商场基线转到 70% 品牌主线。
- S7：五张卡在一个整屏内完整可读；组织是树、门店是三档、行政区是环、平台是分类、页面操作是菜单树。
- S8：卡券、销售线索、成员治理的亮显维度准确；两个横向治理 rail 不被误读成全局交集。
- S9：向下授权、同级阻断、总部治理、前后端校验和统一审计构成闭环。
- S10：四个数字静态呈现，“采用规模”与“治理行为”明显分栏。
- S11：返回项目经历入口不被底部导航遮挡。
- 每屏只发生一次短入场；没有 pin、scrub、横向轨道、数字滚动和庆祝动效。

- [ ] **Step 6: 移动端、减少动态和无 JavaScript 视觉走查**

390×844：

- 11 场景按 S1–S11 排列，长标签换行后不溢出。
- S7 五维和 S8 三模块依次纵向堆叠，阅读顺序不变。
- 底部导航、主题按钮、返回首页和 S11 返回项目经历均可点击。
- 页面没有横向滚动条。

减少动态：

- 刷新后所有图形直接处于最终状态。
- 没有位移、错峰等待、闪烁或 `.pin-spacer`。

无 JavaScript：

- S1–S11、章节链接和返回项目经历均存在。
- 所有图形保持最终可见，页面不依赖 observer 才能理解。

- [ ] **Step 7: 核对改动边界和空白错误**

Run: `git status --short`

Expected: 本任务只包含计划列出的五个新建/修改文件；用户原有 `.gitignore`、`docs/project-experience/00-project-experience-guide.md` 和 `.superpowers/` 保持未暂存。

Run: `git diff --check`

Expected: 无空白错误。

- [ ] **Step 8: 记录视觉修复提交**

若走查产生新 Deck 范围内修复：

```bash
git add src/pages/projects/enterprise-permissions.astro src/scripts/enterprise-permissions-motion.ts e2e/enterprise-permissions.spec.ts e2e/deck-theme.spec.ts src/pages/projects/index.astro
git commit -m "fix: polish enterprise permissions deck experience"
```

若没有文件修改，不创建空提交。

## 2. 完成定义

- `/projects/` 同时保留销售线索卡和新的多业务线企业权限体系卡。
- `/projects/enterprise-permissions/` 正好呈现 11 场景和 5 个可用章节锚点。
- S2 两套体系都明确为已上线，S3 说明业务身份分离与审计身份统一。
- S7 用五种不同图形完整解释组织、门店、行政区、平台、页面及操作权限。
- S8 准确表达卡券、销售线索、成员治理的按需取用关系，不出现五维全局求交误导。
- S9 的向下授权、同级隔离、总部治理、前后端鉴权和统一审计完整闭环。
- S10 使用“约”或明确场景边界呈现 25 个商场、30 个品牌、3,000 名成员和单客户 3 万多家门店，不虚构效率与增长因果。
- 不导入 GSAP 或 ScrollTrigger，不修改 `DeckLayout`，DOM 中没有 `.pin-spacer`。
- `static / observe / reduce / fallback` 四种状态均完整可读，快速正反滚动不留下隐藏正文。
- 1280×800、390×844、深色、浅色、减少动态和无 JavaScript 全部通过验收。
- `npm run check`、`npm run build`、新 Deck Playwright、共享主题、销售线索回归和全量 Playwright 全部通过。
- 销售线索 Deck、项目总控指南、`.gitignore` 和 `.superpowers/` 没有被本任务提交。
