# Sales Lead SLM GSAP Deck Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `/projects/sales-lead-slm/` 上线销售线索旗舰案例 Deck，用经过验证的事实讲清“从动态匹配到责任链重构”的持续演进，并以局部、可退化的 GSAP 动效完成试点。

**Architecture:** 复用现有 `DeckLayout.astro` 的主题、返回入口与视觉变量，不修改其全局滚动规则；新页面通过 `.sales-lead-deck` 局部覆盖为文档滚动。Astro 页面承载 11 个语义化场景与静态可读结构，独立 TypeScript 控制器负责 GSAP、ScrollTrigger、章节导航和清理。桌面端启用两段 pinned timeline，移动端改为纵向阅读，减少动态效果和脚本失败时直接展示最终内容。

**Tech Stack:** Astro 5、TypeScript、GSAP Core、ScrollTrigger、CSS/SVG、Playwright、`astro check`

---

## 0. 实施前裁决

### 0.1 输入与状态

- 设计真值源：`docs/superpowers/specs/2026-07-13-sales-lead-slm-gsap-deck-design.md`。
- spec 文件头仍写着“等待书面审阅”，但当前对话已经得到用户明确确认；本计划以“设计已批准、允许进入实施计划”为准，不回头改写设计。
- 项目事实补充来源：`docs/project-experience/00-project-experience-guide.md`，只读取，不在本任务修改。
- 实现不能把“方案规划中”写成“已上线”，不能把卡券核销提升包装成严格因果实验。
- 正式知识预检只采用“高保真原型真实页面基线规则”“PRD 审查经验”“PRD 进入原型前交互封口清单”：据此保留现有 `DeckLayout` 和项目列表骨架，并把响应式、失败态、状态标签与锚点交互写成验收合同。
- AI 架构、RAG、模型、权限和 Agent 自主性知识卡与本页面运行时无关，明确不进入本计划，避免用错误语义扩张技术范围。

### 0.2 Spec-readiness gate：PASS

| 检查面 | 结论 | 实施约束 |
|---|---|---|
| 状态矩阵 | 已闭合 | 桌面、移动端、`prefers-reduced-motion: reduce`、脚本未加载四种状态均有明确退化路径 |
| 内容枚举 | 已闭合 | 固定 11 个场景、5 个导航章节、3/5/10/30 公里四级示意 |
| 规划状态 | 已闭合 | S9=`已排期`、S10=`方案规划中`、S11=`待验证`，标签常驻 |
| 失败路径 | 已闭合 | GSAP 未加载时不隐藏内容；初始化异常时回到 `fallback`，不保留 pin spacer |
| 清理路径 | 已闭合 | 页面切换时 `matchMedia.revert()`、断开 `IntersectionObserver`、移除监听 |
| 并发与数据写入 | 不适用 | 纯静态作品集页面，不存在持久化、资金、权限或并发写入 |
| 模糊词封口 | 已处理 | “其他资格条件”不扩写；画面只呈现已确认的经营分与门店负载过滤 |

### 0.3 页面关系与保留边界

| 页面/组件 | 关系 | 保留内容 | 本次增量 |
|---|---|---|---|
| `/projects/` | 既有页面增量 | `BaseLayout + SectionGrid + Card` 结构 | 把唯一的整理中提示替换为销售线索旗舰卡片 |
| `/projects/sales-lead-slm/` | 全新页面 | 复用 `DeckLayout` | 新增 11 场景、章节导航、局部视觉系统和动效 |
| `DeckLayout.astro` | 只复用 | 主题同步、返回按钮、背景变量 | 不修改文件；页面局部关闭 scroll-snap |
| 首页 `/` | 不在范围 | 现状完整保留 | 不增加入口，不接入 GSAP |
| 其他 AI/项目 Deck | 不在范围 | 现状完整保留 | 仅将新路由加入共享主题回归测试 |

### 0.4 11 场景内容合同

| 场景 | 章节 | 页面必须出现的事实 | 状态 |
|---|---|---|---|
| S1 | 起点 | “让线索真正到达合适的门店”；“全域销售线索管理系统：从动态匹配到责任链重构”；10+ 付费品牌、15k+ 门店、5 类来源 | 已发生 |
| S2 | 起点 | 真问题不是下载麻烦，而是信息不完整、错过最佳跟进时间、门店缺少责任回收；说明前任 PM 已搭建采集接入底座 | 已发生 |
| S3 | 评分 | 线索三组数据、门店三组数据、历史数据与最近 180 天、线性/阶梯/映射方案；明确算法没有上线 | 探索过但未上线 |
| S4 | 评分 | 放弃伪精确总分；只保留成交加分、超时回收扣分、经营分与门店负载过滤 | 已上线 |
| S5 | 机制 | 可直接分发的线索不进公海池；意向门店和最近门店最早可见；保护期后 3/5/10/30 公里扩圈；早期门店一直可见；已分配或抢过后过滤 | 已上线 |
| S6 | 机制 | 同一客户、约 3 个月、月均约 10 万条；卡券核销计为成交；不足 49.4% 到 61.7%，提升超过 12.3 个百分点 | 已验证结果 |
| S7 | 边界 | 头部家电线索质量高、门店密度高、平台与广告预算更充足、总部客服先做把关 | 已观察 |
| S8 | 边界 | 小众品牌、全屋定制和家具链路长；误触、非本人手机号、地理位置错误不能靠门店处罚解决 | 已观察 |
| S9 | 重构 | 确认本人、确认地理位置/最近门店、确认初步意向、补充意向门店、选择直接分发或公海池 | 已排期 |
| S10 | 重构 | 门店线下充值、后台工单审核、增加线索点、抢单扣点；平台不经手资金；尚未进入详细 PRD | 方案规划中 |
| S11 | 重构 | 后续验证跟进时效、有效联系率、抢单后回收率、点数消耗、投诉/退款边界 | 待验证 |

### 0.5 ScrollTrigger 预算

| ID | 触发内容 | pin | scrub | 模式 |
|---|---|---:|---:|---|
| `sales-lead-problem` | S2 业务断点显现 | 否 | 否 | 桌面、移动端 |
| `sales-lead-decision` | S3→S4→S5 评分到公海池 | 是 | 是 | 仅桌面 |
| `sales-lead-result` | S6 结果连线与数值强调 | 否 | 否 | 桌面、移动端 |
| `sales-lead-industry` | S7→S8 行业边界横向轨道 | 是 | 是 | 仅桌面 |
| `sales-lead-responsibility` | S9→S11 责任链节点显现 | 否 | 否 | 桌面、移动端 |

目标是桌面 5 个活跃 ScrollTrigger、其中 2 个 pin；移动端 3 个非 pin ScrollTrigger；减少动态效果模式 0 个。不得添加 markers，不得在顶层 timeline 的子 tween 上再建 ScrollTrigger。

## 1. 文件结构

### 新建

- `src/pages/projects/sales-lead-slm.astro`：11 场景语义内容、SVG/CSS 示意、局部滚动覆盖、5 章节导航、动效启动入口。
- `src/scripts/sales-lead-slm-motion.ts`：GSAP 注册、桌面/移动端/减弱动效分支、五个顶层编排、导航观察和统一清理。
- `e2e/sales-lead-slm.spec.ts`：入口、事实口径、状态、桌面动效、移动端退化、减少动态效果、无溢出与控制台验收。

### 修改

- `src/pages/projects/index.astro`：增加旗舰案例卡片并移除整理中提示。
- `package.json`、`package-lock.json`：增加公开 `gsap` 运行时依赖。
- `e2e/deck-theme.spec.ts`：将 `/projects/sales-lead-slm/` 纳入共享 Deck 主题回归。

### 明确不修改

- `src/layouts/DeckLayout.astro`
- 首页与首页动画文件
- 其他 Deck 页面
- `.gitignore`
- `docs/project-experience/00-project-experience-guide.md`

## Task 1: 建立项目入口与第一条失败测试

**Files:**
- Create: `e2e/sales-lead-slm.spec.ts`
- Modify: `src/pages/projects/index.astro`

- [ ] **Step 1: 写项目入口失败测试**

创建测试文件的第一段：

```ts
import { test, expect } from '@playwright/test';

const route = '/projects/sales-lead-slm/';

test('projects listing exposes the sales lead flagship case', async ({ page }) => {
  await page.goto('/projects/');
  const card = page.locator('.card', { hasText: '全域销售线索管理系统' });

  await expect(card).toBeVisible();
  await expect(card).toContainText('让线索真正到达合适的门店');
  await expect(card).toContainText('责任链重构');
  await expect(card).toHaveAttribute('href', route);
});
```

- [ ] **Step 2: 运行测试并确认先失败**

Run: `npx playwright test e2e/sales-lead-slm.spec.ts --grep "projects listing"`

Expected: FAIL，原因是 `/projects/` 仍只有“项目梳理中”，找不到销售线索卡片。

- [ ] **Step 3: 用真实案例替换整理中提示**

将 `src/pages/projects/index.astro` 改为：

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import SectionGrid from '../../components/SectionGrid.astro';

const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
const items = [
  {
    title: '全域销售线索管理系统',
    hook: '让线索真正到达合适的门店：从动态匹配到责任链重构',
    tags: ['销售线索', '公海池', '责任链重构'],
    href: `${base}projects/sales-lead-slm/`,
    cover: 'linear-gradient(120deg, #2563eb 0%, #7c3aed 52%, #0891b2 100%)',
  },
];
---

<BaseLayout title="项目经历">
  <SectionGrid title="项目经历" icon="🚀" items={items} />
</BaseLayout>
```

- [ ] **Step 4: 运行入口测试并确认通过**

Run: `npx playwright test e2e/sales-lead-slm.spec.ts --grep "projects listing"`

Expected: PASS。

- [ ] **Step 5: 提交入口增量**

```bash
git add e2e/sales-lead-slm.spec.ts src/pages/projects/index.astro
git commit -m "feat: add sales lead project entry"
```

## Task 2: 落地 11 场景静态 Deck 与事实口径

**Files:**
- Modify: `e2e/sales-lead-slm.spec.ts`
- Create: `src/pages/projects/sales-lead-slm.astro`

- [ ] **Step 1: 增加静态内容、角色边界和状态失败测试**

把以下测试追加到 `e2e/sales-lead-slm.spec.ts`：

```ts
test('deck renders eleven scenes and five chapter links', async ({ page }) => {
  await page.goto(route);

  await expect(page.getByRole('heading', { name: '让线索真正到达合适的门店' })).toBeVisible();
  await expect(page.locator('section[data-scene]')).toHaveCount(11);

  const nav = page.getByRole('navigation', { name: '销售线索案例章节' });
  for (const label of ['起点', '评分', '机制', '边界', '重构']) {
    await expect(nav.getByRole('link', { name: label })).toBeVisible();
  }
});

test('deck preserves verified facts and contribution boundary', async ({ page }) => {
  await page.goto(route);

  await expect(page.locator('#s1')).toContainText('10+');
  await expect(page.locator('#s1')).toContainText('15k+');
  await expect(page.locator('#s1')).toContainText('5 类来源');
  await expect(page.locator('#s2')).toContainText('前任 PM 已经搭建采集接入底座');
  await expect(page.locator('#s3')).toContainText('最近 180 天');
  await expect(page.locator('#s3')).toContainText('探索过但未上线');
  await expect(page.locator('#s5')).toContainText('3 公里');
  await expect(page.locator('#s5')).toContainText('30 公里');
  await expect(page.locator('#s6')).toContainText('不足 49.4%');
  await expect(page.locator('#s6')).toContainText('61.7%');
  await expect(page.locator('#s6')).toContainText('超过 12.3 个百分点');
  await expect(page.locator('#s6')).toContainText('卡券核销计为成交');

  const body = await page.locator('body').innerText();
  expect(body).not.toContain('从零建设');
  expect(body).not.toContain('独立完成整套系统');
});

test('future work keeps visible and accurate status labels', async ({ page }) => {
  await page.goto(route);

  await expect(page.locator('#s9 [data-status]')).toHaveText('已排期');
  await expect(page.locator('#s10 [data-status]')).toHaveText('方案规划中');
  await expect(page.locator('#s11 [data-status]')).toHaveText('待验证');
  await expect(page.locator('#s10')).toContainText('平台不经手资金');
  await expect(page.locator('#s10')).toContainText('尚未进入详细 PRD');
});
```

- [ ] **Step 2: 运行静态合同测试并确认失败**

Run: `npx playwright test e2e/sales-lead-slm.spec.ts --grep "deck renders|verified facts|future work"`

Expected: FAIL，路由返回 404 或缺少 11 场景内容。

- [ ] **Step 3: 创建页面 frontmatter 与 5 章节导航数据**

页面必须使用以下数据和基线路径写法：

```astro
---
import DeckLayout from '../../layouts/DeckLayout.astro';

const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
const chapters = [
  { href: '#s1', label: '起点' },
  { href: '#s3', label: '评分' },
  { href: '#s5', label: '机制' },
  { href: '#s7', label: '边界' },
  { href: '#s9', label: '重构' },
];
const scale = [
  ['10+', '付费品牌'],
  ['15k+', '覆盖门店'],
  ['5 类来源', '平台线索接入'],
];
---
```

`base` 只用于显式链接；`DeckLayout` 的返回按钮继续指向站点首页，不修改布局文件。

- [ ] **Step 4: 按固定语义骨架实现 S1–S11**

页面主体必须保持这个层级，测试和动效都依赖这些稳定选择器：

```astro
<DeckLayout
  title="全域销售线索管理系统｜QQ星"
  description="从动态匹配到责任链重构：让线索真正到达合适的门店。"
>
  <main id="sales-lead-deck" class="sales-lead-deck" data-sales-lead-deck data-motion-mode="static">
    <section id="s1" data-scene="origin" data-chapter="origin">
      <p class="chapter">Sales Lead Management</p>
      <h1>让线索真正到达合适的门店</h1>
      <p class="lead">全域销售线索管理系统：从动态匹配到责任链重构</p>
      <div class="scale-grid">
        {scale.map(([value, label]) => <div class="metric"><strong>{value}</strong><span>{label}</span></div>)}
      </div>
      <p class="role-line">我从报表与分配问题进入，推动智能分发、任务、公海池、隐私外呼、自动回收与门店经营能力持续演进。</p>
    </section>

    <section id="s2" data-scene="problem" data-chapter="origin">
      <div class="scene-shell">
        <p class="eyebrow">业务断点</p>
        <h2>下载麻烦只是表象，真正流失的是跟进责任</h2>
        <div class="breakpoint-grid" data-motion="problem-lines">
          <article><strong>信息不完整</strong><p>缺少地理位置、最近门店和意向门店，线索无法到达合适的承接方。</p></article>
          <article><strong>最佳时间被错过</strong><p>下载、导入、再分配拉长链路，门店看到时已经错过最佳跟进时间。</p></article>
          <article><strong>责任无法回收</strong><p>门店积极性不足，却没有回收机制把线索重新交给愿意负责的人。</p></article>
        </div>
        <p class="boundary-note">前任 PM 已经搭建采集接入底座；我的核心贡献从报表、分配与经营问题进入，继续推动分发、任务、公海池、隐私外呼、自动回收与门店经营模块。</p>
      </div>
    </section>

    <div class="decision-stage" data-motion="decision-stage">
      <div class="decision-panels">
        <section id="s3" class="decision-panel" data-scene="scoring" data-chapter="scoring">
          <div class="scene-shell">
            <p class="eyebrow">先尝试计算</p>
            <h2>我们一度想用一套总分决定“最合适的门店”</h2>
            <span class="status status-explored">探索过但未上线</span>
            <div class="score-cloud" data-motion="score-cloud">
              <article><strong>线索 · 创建时间</strong><p>新鲜度与最佳跟进窗口</p></article>
              <article><strong>线索 · 标签</strong><p>有效性、价值、成交难度</p></article>
              <article><strong>线索 · 地理位置</strong><p>位置与来源准确性</p></article>
              <article><strong>门店 · 评分</strong><p>任务失败、跟进效率、成交绩效、客户意向度、意向门店成交绩效</p></article>
              <article><strong>门店 · 当前负载</strong><p>已分配数量与跟进中数量</p></article>
              <article><strong>门店 · 基本属性</strong><p>地理位置与品类适配</p></article>
            </div>
            <p class="formula-note">历史数据 + 最近 180 天；线性计算、阶梯递减和数据映射都讨论过，但没有足够验证成本支撑上线。</p>
          </div>
        </section>

        <section id="s4" class="decision-panel" data-scene="decision" data-chapter="scoring">
          <div class="scene-shell">
            <p class="eyebrow">放弃伪精确</p>
            <h2>当团队无法证明权重，正确决策不是继续调分</h2>
            <div class="decision-balance" data-motion="decision-balance">
              <article><span>不再保留</span><strong>臆想出来的综合评分与距离乘法系数</strong></article>
              <article><span>成交加分</span><strong>让持续兑现结果的门店获得正向信用</strong></article>
              <article><span>超时回收扣分</span><strong>让抢单但不跟进的行为承担成本</strong></article>
              <article><span>资格过滤</span><strong>只校验经营分与门店当前负载</strong></article>
            </div>
          </div>
        </section>

        <section id="s5" class="decision-panel" data-scene="pool" data-chapter="mechanism">
          <div class="scene-shell">
            <p class="eyebrow">公海池机制</p>
            <h2>用时间保护地理优势，用抢单建立跟进责任</h2>
            <div class="pool-layout" data-motion="pool-rings">
              <div class="rings" aria-label="保护期后按 3、5、10、30 公里扩圈">
                <span>3 公里</span><span>5 公里</span><span>10 公里</span><span>30 公里</span>
              </div>
              <ol>
                <li>能够直接分发给意向门店的线索不进入公海池。</li>
                <li>意向门店和购买线索最近门店最早看到线索。</li>
                <li>场景开始时间与阶段保护时间共同控制扩圈。</li>
                <li>早期门店不抢也一直可见，不会因扩圈被移除。</li>
                <li>线索已经分配为任务或被门店抢过，回收后过滤对应门店。</li>
              </ol>
            </div>
          </div>
        </section>
      </div>
    </div>

    <section id="s6" data-scene="result" data-chapter="mechanism">
      <div class="scene-shell result-shell">
        <p class="eyebrow">结果验证</p>
        <h2>责任机制落地后，卡券核销率明显上升</h2>
        <div class="result-line" data-motion="result-line">
          <div><span>改造前</span><strong>不足 49.4%</strong></div>
          <div class="result-arrow" aria-hidden="true"></div>
          <div><span>改造后</span><strong>61.7%</strong></div>
        </div>
        <p>提升超过 12.3 个百分点</p>
        <p class="evidence-note">同一客户 · 约 3 个月 · 月均约 10 万条线索 · 卡券核销计为成交</p>
      </div>
    </section>

    <div class="industry-stage" data-motion="industry-stage">
      <div class="industry-track" data-motion="industry-track">
        <section id="s7" data-scene="industry" data-chapter="boundary">
          <div class="scene-shell">
            <p class="eyebrow">行业边界</p>
            <h2>头部家电行业为何能承接这套机制</h2>
            <div class="industry-grid">
              <article><strong>线索质量高</strong><p>平台流量扶持和广告预算更充足。</p></article>
              <article><strong>门店密度高</strong><p>一个地区通常有多家可承接门店。</p></article>
              <article><strong>总部先把关</strong><p>客服团队会先排除一部分低质量线索。</p></article>
              <article><strong>成交链路短</strong><p>部分卡券甚至已经在门店购买，后续更接近履约。</p></article>
            </div>
          </div>
        </section>

        <section id="s8" data-scene="limit" data-chapter="boundary">
          <div class="scene-shell">
            <p class="eyebrow">机制边界</p>
            <h2>低质量线索不能继续由门店承担</h2>
            <div class="industry-grid">
              <article><strong>非本人手机号</strong><p>联系人本身就不成立。</p></article>
              <article><strong>误触表单或客服</strong><p>用户没有形成真实购买意向。</p></article>
              <article><strong>地理位置错误</strong><p>小众品牌一个城市可能只有一两家门店，错误会被放大。</p></article>
              <article><strong>链路更长</strong><p>全屋定制、家具等品类需要更长的决策和服务周期。</p></article>
            </div>
            <p class="boundary-note">继续加重门店处罚，只会让门店为上游数据错误承担责任；问题必须前移到清洗层。</p>
          </div>
        </section>
      </div>
    </div>

    <div class="responsibility-stage" data-motion="responsibility-stage">
      <section id="s9" data-scene="cleaning" data-chapter="rebuild">
        <div class="scene-shell">
          <span class="status status-scheduled" data-status>已排期</span>
          <h2>先建立清洗层，再把正确责任交给门店</h2>
          <ol class="responsibility-flow">
            <li data-motion="responsibility-node">确认本人</li>
            <li data-motion="responsibility-node">确认地理位置与最近门店</li>
            <li data-motion="responsibility-node">确认初步意向，约定由专业人员继续跟进</li>
            <li data-motion="responsibility-node">补充客户意向门店</li>
            <li data-motion="responsibility-node">选择直接分发给意向门店或进入付费公海池</li>
          </ol>
        </div>
      </section>

      <section id="s10" data-scene="points" data-chapter="rebuild">
        <div class="scene-shell">
          <span class="status status-planning" data-status>方案规划中</span>
          <h2>用线索点连接门店付费意愿与抢单责任</h2>
          <ol class="responsibility-flow">
            <li data-motion="responsibility-node">门店自行线下充值</li>
            <li data-motion="responsibility-node">后台提交并审核工单</li>
            <li data-motion="responsibility-node">审核通过后增加对应门店线索点</li>
            <li data-motion="responsibility-node">门店抢单后获得线索并扣减线索点</li>
          </ol>
          <p class="boundary-note">平台不经手资金；当前仅有方案索引，尚未进入详细 PRD。</p>
        </div>
      </section>

      <section id="s11" data-scene="validation" data-chapter="rebuild">
        <div class="scene-shell">
          <span class="status status-validation" data-status>待验证</span>
          <h2>下一步不是继续加功能，而是证明责任重构成立</h2>
          <div class="validation-grid">
            <article data-motion="responsibility-node"><strong>跟进时效</strong><p>清洗后到首次有效跟进是否缩短。</p></article>
            <article data-motion="responsibility-node"><strong>有效联系率</strong><p>本人、位置与意向确认是否提升可联系性。</p></article>
            <article data-motion="responsibility-node"><strong>抢单后回收率</strong><p>付费抢单是否减少占单不跟进。</p></article>
            <article data-motion="responsibility-node"><strong>点数消耗</strong><p>门店是否愿意持续为可承接线索付费。</p></article>
            <article data-motion="responsibility-node"><strong>投诉与退款边界</strong><p>清洗错误或线索争议如何被识别和处理。</p></article>
          </div>
          <a class="back-projects" href={`${base}projects/`}>返回项目经历</a>
        </div>
      </section>
    </div>
  </main>

  <nav class="sales-lead-nav" aria-label="销售线索案例章节">
    {chapters.map((chapter, index) => (
      <a href={chapter.href} class:list={{ active: index === 0 }} data-chapter-link={chapter.href.slice(1)}>
        <span class="nav-dot"></span><span>{chapter.label}</span>
      </a>
    ))}
  </nav>
</DeckLayout>
```

不得增加未经确认的评分公式、退款规则、点数价格或“其他资格条件”。

- [ ] **Step 5: 加入可读的基础样式，确保无脚本也完整纵向展示**

先写静态视觉层，关键规则必须完整保留：

```css
.sales-lead-deck {
  --slm-surface: color-mix(in srgb, var(--glass) 88%, transparent);
  --slm-line: color-mix(in srgb, var(--c-blue) 34%, var(--glass-border));
  height: auto;
  min-height: 100%;
  overflow: visible;
  scroll-snap-type: none;
}

.sales-lead-deck section {
  width: 100%;
  height: auto;
  min-height: 100svh;
  scroll-snap-align: none;
  padding: clamp(5.5rem, 9vw, 8rem) clamp(1.25rem, 6vw, 6rem);
}

.scene-shell {
  width: min(1120px, 100%);
  margin-inline: auto;
}

.scale-grid,
.score-cloud,
.breakpoint-grid,
.industry-grid,
.validation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.metric,
.score-cloud article,
.breakpoint-grid article,
.industry-grid article,
.validation-grid article,
.decision-balance article {
  border: 1px solid var(--glass-border);
  border-radius: 1.1rem;
  background: var(--slm-surface);
  padding: 1.15rem;
}

.decision-panels,
.industry-track {
  display: grid;
}

.rings {
  display: grid;
  grid-template-columns: repeat(4, minmax(5.5rem, 1fr));
  gap: 0.7rem;
}

.result-line,
.responsibility-flow {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.responsibility-flow {
  flex-wrap: wrap;
  list-style-position: inside;
}

.sales-lead-nav {
  position: fixed;
  z-index: 18;
  left: 50%;
  bottom: 1rem;
  transform: translateX(-50%);
  display: flex;
  gap: 0.35rem;
  padding: 0.55rem;
  border: 1px solid var(--glass-border);
  border-radius: 999px;
  background: var(--chrome-bg);
  backdrop-filter: blur(16px);
}

.sales-lead-nav a {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border-radius: 999px;
  padding: 0.45rem 0.7rem;
  color: var(--text-dim);
  text-decoration: none;
}

.sales-lead-nav a.active {
  color: var(--text);
  background: var(--glass);
}

.nav-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: currentColor;
}

.status {
  display: inline-flex;
  border: 1px solid var(--glass-border);
  border-radius: 999px;
  padding: 0.35rem 0.7rem;
  color: var(--text);
  background: var(--glass);
}

@media (max-width: 860px) {
  .sales-lead-deck section { padding-inline: 1rem; }
  .result-line { align-items: stretch; flex-direction: column; }
  .rings { grid-template-columns: repeat(2, 1fr); }
  .sales-lead-nav a { padding-inline: 0.55rem; }
  .sales-lead-nav a span:last-child { font-size: 0.72rem; }
}
```

在此基础上补齐标题层级、状态色、连接线、圆环、结果箭头和卡片细节；颜色只能引用 `DeckLayout` 变量或页面局部变量，不能写死只适合暗色主题的正文颜色。

- [ ] **Step 6: 运行静态合同与类型检查**

Run: `npx playwright test e2e/sales-lead-slm.spec.ts --grep "deck renders|verified facts|future work"`

Expected: PASS。

Run: `npm run check`

Expected: `0 errors`。

- [ ] **Step 7: 提交静态 Deck**

```bash
git add src/pages/projects/sales-lead-slm.astro e2e/sales-lead-slm.spec.ts
git commit -m "feat: build sales lead deck content"
```

## Task 3: 锁定页面局部滚动、主题与静态退化

**Files:**
- Modify: `e2e/sales-lead-slm.spec.ts`
- Modify: `e2e/deck-theme.spec.ts`
- Modify: `src/pages/projects/sales-lead-slm.astro`

- [ ] **Step 1: 增加滚动容器、主题和无脚本可读性失败测试**

```ts
test('deck replaces inherited snap scrolling with document scrolling', async ({ page }) => {
  await page.goto(route);

  const scrollMode = await page.locator('[data-sales-lead-deck]').evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      height: style.height,
      overflowY: style.overflowY,
      scrollSnapType: style.scrollSnapType,
    };
  });

  expect(scrollMode.height).not.toBe(`${page.viewportSize()?.height}px`);
  expect(scrollMode.overflowY).toBe('visible');
  expect(scrollMode.scrollSnapType).toBe('none');
});

test('static mode keeps every scene readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(route);

  await expect(page.locator('[data-sales-lead-deck]')).toHaveAttribute('data-motion-mode', 'static');
  for (let index = 1; index <= 11; index += 1) {
    await expect(page.locator(`#s${index}`)).toBeAttached();
  }
  await page.locator('#s11').scrollIntoViewIfNeeded();
  await expect(page.locator('#s11')).toBeVisible();
  await expect(page.locator('#s11')).toContainText('投诉与退款边界');
  await context.close();
});
```

说明：用 `javaScriptEnabled: false` 直接验收服务端输出，避免依赖 Astro 带 hash 的脚本 URL；这条用例必须证明静态 HTML 本身完整可读。

- [ ] **Step 2: 将新路由加入共享主题回归**

在 `e2e/deck-theme.spec.ts` 的 `deckRoutes` 数组末尾增加：

```ts
  '/projects/sales-lead-slm/',
```

- [ ] **Step 3: 运行测试并确认失败原因正确**

Run: `npx playwright test e2e/sales-lead-slm.spec.ts e2e/deck-theme.spec.ts`

Expected: 如果 Task 2 的局部 CSS 已正确生效，滚动和静态测试直接 PASS；共享主题测试在未加入路由前不会覆盖新页面，加入后必须 PASS。任何失败都应定位到页面局部样式或新路由主题变量，不能修改 `DeckLayout.astro` 解题。

- [ ] **Step 4: 补齐增强态专用布局规则**

只允许 `data-motion-mode="desktop"` 进入 pin/horizontal 布局：

```css
[data-sales-lead-deck][data-motion-mode='desktop'] .decision-stage {
  position: relative;
  height: 100svh;
  overflow: hidden;
}

[data-sales-lead-deck][data-motion-mode='desktop'] .decision-panels {
  position: relative;
  height: 100%;
}

[data-sales-lead-deck][data-motion-mode='desktop'] .decision-panel {
  position: absolute;
  inset: 0;
}

[data-sales-lead-deck][data-motion-mode='desktop'] .industry-stage {
  width: 100%;
  height: 100svh;
  overflow: hidden;
}

[data-sales-lead-deck][data-motion-mode='desktop'] .industry-track {
  display: flex;
  width: 200vw;
  height: 100%;
  will-change: transform;
}

[data-sales-lead-deck][data-motion-mode='desktop'] .industry-track > section {
  flex: 0 0 100vw;
  min-height: 100svh;
}

[data-sales-lead-deck][data-motion-mode='mobile'] .decision-stage,
[data-sales-lead-deck][data-motion-mode='reduce'] .decision-stage,
[data-sales-lead-deck][data-motion-mode='fallback'] .decision-stage,
[data-sales-lead-deck][data-motion-mode='mobile'] .industry-stage,
[data-sales-lead-deck][data-motion-mode='reduce'] .industry-stage,
[data-sales-lead-deck][data-motion-mode='fallback'] .industry-stage {
  height: auto;
  overflow: visible;
}
```

不要对 `width`、`height`、`top`、`left` 做逐帧动画；动效只改 `transform`、`opacity` 和 `autoAlpha`。

- [ ] **Step 5: 运行主题、滚动与构建检查**

Run: `npx playwright test e2e/sales-lead-slm.spec.ts e2e/deck-theme.spec.ts`

Expected: PASS。

Run: `npm run build`

Expected: 构建成功，新路由出现在 `dist/projects/sales-lead-slm/index.html`。

- [ ] **Step 6: 提交滚动和主题合同**

```bash
git add src/pages/projects/sales-lead-slm.astro e2e/sales-lead-slm.spec.ts e2e/deck-theme.spec.ts
git commit -m "test: lock sales lead deck fallback states"
```

## Task 4: 安装 GSAP 并实现可清理的动效控制器

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/scripts/sales-lead-slm-motion.ts`
- Modify: `src/pages/projects/sales-lead-slm.astro`
- Modify: `e2e/sales-lead-slm.spec.ts`

- [ ] **Step 1: 增加桌面、移动端与减少动态效果失败测试**

追加以下用例：

```ts
test('desktop motion creates exactly two pinned chapters without markers', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(route);

  const root = page.locator('[data-sales-lead-deck]');
  await expect(root).toHaveAttribute('data-motion-ready', 'true');
  await expect(root).toHaveAttribute('data-motion-mode', 'desktop');
  await expect(root).toHaveAttribute('data-motion-trigger-count', '5');
  await expect(root).toHaveAttribute('data-motion-pin-count', '2');
  await expect(page.locator('.pin-spacer')).toHaveCount(2);
  await expect(page.locator('.gsap-marker-start, .gsap-marker-end')).toHaveCount(0);
});

test('mobile motion keeps the full vertical flow without pin spacers', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route);

  const root = page.locator('[data-sales-lead-deck]');
  await expect(root).toHaveAttribute('data-motion-ready', 'true');
  await expect(root).toHaveAttribute('data-motion-mode', 'mobile');
  await expect(root).toHaveAttribute('data-motion-trigger-count', '3');
  await expect(root).toHaveAttribute('data-motion-pin-count', '0');
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await expect(page.locator('#s7')).toBeAttached();
  await expect(page.locator('#s8')).toBeAttached();
});

test('reduced motion renders final content without ScrollTrigger pinning', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.goto(route);

  const root = page.locator('[data-sales-lead-deck]');
  await expect(root).toHaveAttribute('data-motion-ready', 'true');
  await expect(root).toHaveAttribute('data-motion-mode', 'reduce');
  await expect(root).toHaveAttribute('data-motion-trigger-count', '0');
  await expect(root).toHaveAttribute('data-motion-pin-count', '0');
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await expect(page.locator('#s11')).toContainText('待验证');

  await context.close();
});
```

- [ ] **Step 2: 运行动效测试并确认失败**

Run: `npx playwright test e2e/sales-lead-slm.spec.ts --grep "desktop motion|mobile motion|reduced motion"`

Expected: FAIL，页面停留在 `data-motion-mode="static"`，没有 `data-motion-ready` 和 pin spacer。

- [ ] **Step 3: 安装公开 GSAP 运行时依赖**

Run: `npm install gsap`

Expected: `package.json` 的 `dependencies` 增加 `gsap`，`package-lock.json` 同步；不得安装 ScrollSmoother 或第三方滚动平滑库。

- [ ] **Step 4: 创建统一动效控制器**

`src/scripts/sales-lead-slm-motion.ts` 使用下面的完整控制流。实现时可调整 duration 和 ease，但不能改变触发器数量、pin 数量、媒体分支或清理边界。

```ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type MotionMode = 'desktop' | 'mobile' | 'reduce' | 'fallback';

function setMode(root: HTMLElement, mode: MotionMode, ready: boolean) {
  root.dataset.motionMode = mode;
  root.dataset.motionReady = String(ready);
}

function syncDiagnostics(root: HTMLElement) {
  const triggers = ScrollTrigger.getAll().filter((trigger) =>
    String(trigger.vars.id ?? '').startsWith('sales-lead-'),
  );
  root.dataset.motionTriggerCount = String(triggers.length);
  root.dataset.motionPinCount = String(triggers.filter((trigger) => Boolean(trigger.vars.pin)).length);
}

function initChapterNav(root: HTMLElement) {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-chapter-link]'));
  const targets = ['s1', 's6', 's9']
    .map((id) => root.querySelector<HTMLElement>(`#${id}`))
    .filter((target): target is HTMLElement => target !== null);

  const setActive = (chapterId: string) => {
    links.forEach((link) => {
      const active = link.dataset.chapterLink === chapterId;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const chapterId = visible.target.id === 's6' ? 's5' : visible.target.id;
      setActive(chapterId);
    },
    { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.2, 0.5] },
  );

  const clickCleanups = links.map((link) => {
    const onClick = (event: MouseEvent) => {
      if (root.dataset.motionMode !== 'desktop') return;

      const chapterId = link.dataset.chapterLink;
      const targetMap: Record<string, { triggerId: string; progress: number }> = {
        s3: { triggerId: 'sales-lead-decision', progress: 0.02 },
        s5: { triggerId: 'sales-lead-decision', progress: 0.84 },
        s7: { triggerId: 'sales-lead-industry', progress: 0.02 },
      };
      const target = chapterId ? targetMap[chapterId] : undefined;
      const trigger = target ? ScrollTrigger.getById(target.triggerId) : undefined;
      if (!target || !trigger || !chapterId) return;

      event.preventDefault();
      history.replaceState(null, '', `#${chapterId}`);
      setActive(chapterId);
      window.scrollTo({
        top: trigger.start + (trigger.end - trigger.start) * target.progress,
        behavior: 'smooth',
      });
    };

    link.addEventListener('click', onClick);
    return () => link.removeEventListener('click', onClick);
  });

  targets.forEach((target) => observer.observe(target));
  return {
    setActive,
    disconnect: () => {
      observer.disconnect();
      clickCleanups.forEach((remove) => remove());
    },
  };
}

export function initSalesLeadMotion(root: HTMLElement) {
  const mm = gsap.matchMedia();
  const chapterNav = initChapterNav(root);
  let disposed = false;

  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    mm.revert();
    chapterNav.disconnect();
    delete root.dataset.motionReady;
    delete root.dataset.motionTriggerCount;
    delete root.dataset.motionPinCount;
    root.dataset.motionMode = 'static';
    document.removeEventListener('astro:before-swap', cleanup);
  };

  try {
    mm.add(
      {
        isDesktop: '(min-width: 861px)',
        isMobile: '(max-width: 860px)',
        reduceMotion: '(prefers-reduced-motion: reduce)',
      },
      (context) => {
        const { isDesktop, isMobile, reduceMotion } = context.conditions as {
          isDesktop: boolean;
          isMobile: boolean;
          reduceMotion: boolean;
        };

        if (reduceMotion) {
          setMode(root, 'reduce', true);
          syncDiagnostics(root);
          return;
        }

        setMode(root, isDesktop ? 'desktop' : 'mobile', false);

        const intro = gsap.timeline({ defaults: { ease: 'power2.out' } });
        intro
          .from('#s1 .chapter', { autoAlpha: 0, y: 12, duration: 0.25 })
          .from('#s1 h1', { autoAlpha: 0, y: 24, duration: 0.4 }, '<0.08')
          .from('#s1 .lead', { autoAlpha: 0, y: 16, duration: 0.3 }, '<0.12')
          .from('#s1 .metric', { autoAlpha: 0, y: 14, duration: 0.25, stagger: 0.06 }, '<0.05');

        gsap.from('[data-motion="problem-lines"] > *', {
          autoAlpha: 0,
          y: 18,
          duration: 0.45,
          stagger: 0.08,
          scrollTrigger: {
            id: 'sales-lead-problem',
            trigger: '#s2',
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        });

        gsap.from('[data-motion="result-line"] > *', {
          autoAlpha: 0,
          scale: 0.96,
          duration: 0.55,
          stagger: 0.1,
          scrollTrigger: {
            id: 'sales-lead-result',
            trigger: '#s6',
            start: 'top 68%',
            toggleActions: 'play none none reverse',
          },
        });

        gsap.from('[data-motion="responsibility-node"]', {
          autoAlpha: 0,
          y: 18,
          duration: 0.4,
          stagger: 0.07,
          scrollTrigger: {
            id: 'sales-lead-responsibility',
            trigger: '[data-motion="responsibility-stage"]',
            start: 'top 72%',
            toggleActions: 'play none none reverse',
          },
        });

        if (isDesktop) {
          const panels = gsap.utils.toArray<HTMLElement>('.decision-panel');
          gsap.set(panels.slice(1), { autoAlpha: 0, yPercent: 6 });

          const decision = gsap.timeline({
            scrollTrigger: {
              id: 'sales-lead-decision',
              trigger: '[data-motion="decision-stage"]',
              start: 'top top',
              end: '+=260%',
              pin: true,
              scrub: 0.8,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => chapterNav.setActive(self.progress < 0.58 ? 's3' : 's5'),
            },
          });

          decision
            .from('[data-motion="score-cloud"] > *', { autoAlpha: 0.35, y: 20, stagger: 0.05 })
            .to(panels[0], { autoAlpha: 0, yPercent: -6 })
            .to(panels[1], { autoAlpha: 1, yPercent: 0 }, '<')
            .from('[data-motion="decision-balance"] > *', { x: 24, autoAlpha: 0, stagger: 0.08 })
            .to(panels[1], { autoAlpha: 0, yPercent: -6 })
            .to(panels[2], { autoAlpha: 1, yPercent: 0 }, '<')
            .from('[data-motion="pool-rings"] span', { scale: 0.82, autoAlpha: 0, stagger: 0.08 });

          const track = root.querySelector<HTMLElement>('[data-motion="industry-track"]');
          const stage = root.querySelector<HTMLElement>('[data-motion="industry-stage"]');
          if (track && stage) {
            const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
            gsap.timeline({
              scrollTrigger: {
                id: 'sales-lead-industry',
                trigger: stage,
                start: 'top top',
                end: () => `+=${distance()}`,
                pin: true,
                scrub: 0.8,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onEnter: () => chapterNav.setActive('s7'),
                onEnterBack: () => chapterNav.setActive('s7'),
              },
            }).to(track, { x: () => -distance(), ease: 'none' });
          }
        }

        setMode(root, isDesktop ? 'desktop' : isMobile ? 'mobile' : 'fallback', true);
        syncDiagnostics(root);
      },
      root,
    );

    document.fonts?.ready.then(() => {
      if (!disposed && root.dataset.motionMode === 'desktop') ScrollTrigger.refresh();
    });
    document.addEventListener('astro:before-swap', cleanup);
  } catch (error) {
    cleanup();
    setMode(root, 'fallback', false);
    syncDiagnostics(root);
    console.error('Sales lead motion initialization failed', error);
  }

  return cleanup;
}
```

实现注意：

- `ScrollTrigger` 只注册一次。
- `scrub` timeline 不配置 `toggleActions`。
- 两个 pinned timeline 的 tween 都在顶层 timeline 内，不给子 tween 创建 trigger。
- 横向轨道必须 `ease: 'none'`，pin wrapper，移动 track。
- 不在 `matchMedia` 回调里再套 `gsap.context()`。
- 如果实际 GSAP TypeScript 类型不接受第三个 `scope` 参数，先查本地 `node_modules/gsap/types`；只有确认版本签名后才做最小类型调整，不能删除作用域或清理逻辑。

- [ ] **Step 5: 在 Astro 页面启动控制器**

在页面 `</DeckLayout>` 前加入经 Astro 打包的模块脚本：

```astro
<script>
  import { initSalesLeadMotion } from '../../scripts/sales-lead-slm-motion';

  const root = document.querySelector<HTMLElement>('[data-sales-lead-deck]');
  if (root) initSalesLeadMotion(root);
</script>
```

不要使用 CDN，不要把脚本标记为 `is:inline`。

- [ ] **Step 6: 运行动效分支测试与类型检查**

Run: `npx playwright test e2e/sales-lead-slm.spec.ts --grep "desktop motion|mobile motion|reduced motion"`

Expected: PASS；桌面 2 个 `.pin-spacer`，移动端和减少动态效果模式都是 0 个。

Run: `npm run check`

Expected: `0 errors`。

- [ ] **Step 7: 提交 GSAP 试点**

```bash
git add package.json package-lock.json src/scripts/sales-lead-slm-motion.ts src/pages/projects/sales-lead-slm.astro e2e/sales-lead-slm.spec.ts
git commit -m "feat: add gsap motion to sales lead deck"
```

## Task 5: 完成响应式、可访问性与运行时回归

**Files:**
- Modify: `e2e/sales-lead-slm.spec.ts`
- Modify: `src/pages/projects/sales-lead-slm.astro`
- Modify: `src/scripts/sales-lead-slm-motion.ts`

- [ ] **Step 1: 增加溢出、导航、控制台与横向轨道测试**

```ts
test('deck has no horizontal overflow on desktop and mobile', async ({ page }) => {
  for (const viewport of [
    { width: 1280, height: 800 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(route);
    await expect(page.locator('[data-sales-lead-deck]')).toHaveAttribute('data-motion-ready', 'true');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(overflow).toBe(false);
  }
});

test('chapter navigation updates aria-current and anchors remain usable', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(route);

  const rebuild = page.getByRole('navigation', { name: '销售线索案例章节' }).getByRole('link', { name: '重构' });
  await rebuild.click();
  await expect(page).toHaveURL(/#s9$/);
  await expect(page.locator('#s9')).toBeAttached();
  await expect(rebuild).toHaveAttribute('aria-current', 'true');
});

test('desktop horizontal chapter moves the track while keeping S8 readable', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(route);

  const track = page.locator('[data-motion="industry-track"]');
  const before = await track.evaluate((element) => getComputedStyle(element).transform);
  const stageTop = await page.locator('[data-motion="industry-stage"]').evaluate(
    (element) => element.getBoundingClientRect().top + window.scrollY,
  );
  await page.evaluate((top) => window.scrollTo(0, top + window.innerWidth * 0.82), stageTop);
  await page.waitForTimeout(250);
  const after = await track.evaluate((element) => getComputedStyle(element).transform);

  expect(after).not.toBe(before);
  await expect(page.locator('#s8')).toContainText('问题必须前移到清洗层');
});

test('deck produces no browser errors during the main scroll path', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(route);
  const maxScroll = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  for (const progress of [0, 0.12, 0.25, 0.38, 0.5, 0.62, 0.75, 0.88, 1]) {
    await page.evaluate(([max, ratio]) => window.scrollTo(0, max * ratio), [maxScroll, progress]);
    await page.waitForTimeout(120);
  }

  expect(errors).toEqual([]);
});
```

- [ ] **Step 2: 运行新增测试并定位真实失败**

Run: `npx playwright test e2e/sales-lead-slm.spec.ts --grep "overflow|navigation|horizontal chapter|browser errors"`

Expected: 首次运行可能暴露 fixed nav、200vw track、pin spacer 或 IntersectionObserver 对 anchor 的影响；只修销售线索页面局部 CSS/控制器。

- [ ] **Step 3: 封口移动端与减弱动效 CSS**

必须满足：

```css
@media (max-width: 860px), (prefers-reduced-motion: reduce) {
  .decision-panels,
  .industry-track {
    display: grid;
    width: 100%;
    height: auto;
    transform: none;
  }

  .decision-panel,
  .industry-track > section {
    position: relative;
    inset: auto;
    width: 100%;
    min-height: auto;
    opacity: 1;
    visibility: visible;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sales-lead-deck *,
  .sales-lead-deck *::before,
  .sales-lead-deck *::after {
    scroll-behavior: auto;
    animation-duration: 0.01ms;
    animation-iteration-count: 1;
    transition-duration: 0.01ms;
  }
}
```

如果 `200vw` 轨道导致桌面文档 `scrollWidth` 溢出，修复 `.industry-stage { overflow: clip; }` 或等价局部规则；不能在 `html` 上增加全局隐藏来掩盖问题。

- [ ] **Step 4: 保持导航可访问且不依赖动画**

- 每个章节链接保留真实 `href="#sN"`。
- active 项同步 `aria-current="true"`。
- 无 JS 时锚点仍可跳转。
- fixed 导航不能覆盖 S11 的返回入口；页面底部预留至少 `6rem`。
- 主题按钮、返回按钮和章节导航的 z-index 不互相遮挡。

- [ ] **Step 5: 运行销售线索完整测试**

Run: `npx playwright test e2e/sales-lead-slm.spec.ts`

Expected: 全部 PASS，无 flaky retry。

- [ ] **Step 6: 提交响应式和运行时封口**

```bash
git add src/pages/projects/sales-lead-slm.astro src/scripts/sales-lead-slm-motion.ts e2e/sales-lead-slm.spec.ts
git commit -m "test: harden sales lead deck runtime states"
```

## Task 6: 完成全站验证与视觉验收

**Files:**
- Verify only unless a sales-lead-scoped defect is found

- [ ] **Step 1: 运行静态检查与生产构建**

Run: `npm run check`

Expected: `0 errors`。

Run: `npm run build`

Expected: 构建成功；`dist/projects/sales-lead-slm/index.html` 存在。

- [ ] **Step 2: 运行相关回归测试**

Run: `npx playwright test e2e/sales-lead-slm.spec.ts e2e/deck-theme.spec.ts e2e/sections.spec.ts`

Expected: 全部 PASS；项目入口、Deck 主题和项目列表未回归。

- [ ] **Step 3: 运行全量 Playwright**

Run: `npx playwright test`

Expected: 全部 PASS。若失败发生在既有页面，先确认是否可由本次改动复现；不得顺手重构无关 Deck。

- [ ] **Step 4: 在真实浏览器完成视觉走查**

运行 `npm run dev`，检查：

- `http://localhost:4321/projects/`
- `http://localhost:4321/projects/sales-lead-slm/`

桌面 1280×800 逐段验收：

- S1 文字和规模数据在约 1.2 秒内完成入场，动效不抢正文。
- S3–S5 只出现一个 pin spacer，时间轴能从评分尝试自然转到公海池机制。
- S6 的“不足 49.4% → 61.7%”始终清晰，状态口径不被动画隐藏。
- S7–S8 水平移动使用线性滚动映射，没有横向滚动条和突跳。
- S9–S11 状态标签常驻，内容不会在到达视口时仍处于不可见状态。
- 页面总计正好 2 个 pin spacer，生产环境无 markers。

移动 390×844 逐段验收：

- 11 场景严格按 S1–S11 纵向排列。
- 无 pin、无横向轨道、无正文遮挡、无横向溢出。
- 底部导航仍可点击，S11 返回项目经历按钮可见。

减弱动效验收：

- 系统开启“减少动态效果”后刷新页面。
- 首屏、评分、行业轨道和责任链全部直接显示最终状态。
- DOM 中没有 `.pin-spacer`。

- [ ] **Step 5: 核对最终改动边界**

Run: `git status --short`

Expected: 本任务只包含计划列出的新建/修改文件；用户原有 `.gitignore` 和 `docs/project-experience/00-project-experience-guide.md` 改动保持原样且未被暂存。

Run: `git diff --check`

Expected: 无空白错误。

- [ ] **Step 6: 记录最终验证提交**

若 Task 6 的走查产生销售线索页面修复：

```bash
git add src/pages/projects/sales-lead-slm.astro src/scripts/sales-lead-slm-motion.ts e2e/sales-lead-slm.spec.ts e2e/deck-theme.spec.ts
git commit -m "fix: polish sales lead deck experience"
```

若没有产生文件修改，不创建空提交。

## 2. 完成定义

- `/projects/` 存在可点击的销售线索旗舰案例卡片。
- `/projects/sales-lead-slm/` 完整呈现 11 场景、5 章节和准确状态标签。
- 角色边界、评分探索、公海池机制、结果数据、行业边界和后续责任重构全部符合 spec。
- 桌面恰好 2 个 pinned timeline，活跃 ScrollTrigger 不超过 5 个。
- 移动端没有 pin 和横向滚动，减少动态效果模式没有 ScrollTrigger。
- 脚本失败或禁用时，所有内容仍按纵向静态文档可读。
- 深浅色、锚点导航、返回入口、390×844 与 1280×800 均通过验收。
- `npm run check`、`npm run build`、相关 Playwright 和全量 Playwright 全部通过。
- 首页、其他 Deck、`DeckLayout.astro`、`.gitignore` 和项目总控指南没有被本任务改动。
- GSAP 是否复用到首页仍是后续独立决策，本任务不自动扩大范围。
