# Fourth Smart Parking Deck Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `/projects/smart-parking/` 上线第四个项目经历 Deck，用 11 个场景证明如何从无文档的外包停车系统中逆向还原业务、完成原生化重构，并恢复持续演进能力。

**Architecture:** 复用 `DeckLayout.astro` 的站点主题、整屏滚动和基础变量；一个新 Astro 页面集中承载 11 个语义场景、5 章导航、脱敏后的 CSS 图形与数据闸门。独立 TypeScript 控制器只使用 `IntersectionObserver` 管理短时入场、章节状态、减少动态、观察器缺失和页面卸载；HTML 默认保持最终内容可见，不引入 GSAP、ScrollTrigger、长时间 pin 或横向轨道。

**Tech Stack:** Astro 5、TypeScript 5.6、原生 IntersectionObserver、CSS、Playwright 1.48、`astro check`

---

## 0. 实施前裁决

### 0.1 本次上下文包

- **当前任务：** 将已确认的第四个智慧停车 Deck Spec 转成可逐步执行的实现计划。
- **当前材料：** `docs/superpowers/specs/2026-07-18-fourth-deck-smart-parking-design.md`、`docs/project-experience/00-project-experience-guide.md` 第 8 节、现有企业权限 Deck 页面/控制器/E2E，以及项目首页和共享主题测试。
- **路由依据：** `真实任务上下文加载规则`、`个人知识库RAG式上下文治理规则`、正式知识域根索引、工作/需求文档/技术分析/项目复盘/原型分析 README。
- **最终加载：** `PRD审查经验`、`PRD进入原型前交互封口清单`、`高保真原型真实页面基线规则`。这些卡要求把页面关系、事实边界、失败分支、主题、移动端、无脚本与验收项写成自动化合同。
- **未加载：** AI/RAG/Agent 技术卡不适用纯展示页面；`正常路径轻异常路径结构化` 明确排除纯内容页；旧 wiki 与原文层没有加载，因为已确认 Spec 和总控指南足以作为公开事实真值源。
- **风险：** 第三个集团经营分析 Deck 与第五个会员运营 Deck 正在并行实施，都会触碰 `src/pages/projects/index.astro` 或 `e2e/deck-theme.spec.ts`；第四个 Deck 的入口集成必须按固定锚点插入，不能依赖“数组尾部”。

### 0.2 Spec-readiness gate：PASS

| 检查面 | 结论 | 实施约束 |
| --- | --- | --- |
| 状态组合 | 已闭合 | `static / observe / reduce / fallback` × 桌面/移动 × 深浅色均有明确行为 |
| S2 数据状态 | 已闭合 | 经过核验的数据只能为 0 项或 3 项；0 项时显示无数字业务旅程，禁止示例数字上线 |
| 失败与并发 | 已闭合 | 页面没有服务端写入或共享数据并发；脚本失败、观察器缺失、媒体偏好变化和卸载均回到静态可读 |
| 枚举闭合 | 已闭合 | 固定 11 场景、5 章节、4 类权益、2 个限制对象、2 个版本车道、4 种动效模式 |
| SSOT | 已闭合 | 章节、S2 指标、S10 采用数据在 Astro frontmatter 集中声明；DOM 用稳定 `data-*` 标识语义 |
| 事实边界 | 已闭合 | 1.0 仍可运行、8/27 版本范围、约 7.57 万月缴费单、退款无真实订单和本人贡献边界均常驻可见 |
| 范围 | 可单计划交付 | 一个路由、一个控制器、一个入口增量、一份 E2E 合同和一处共享主题路由增量 |

### 0.3 执行顺序与并行工作保护

开始 Task 1 前记录基线：

```bash
git status --short
git log -5 --oneline
npm run check
npx playwright test e2e/sales-lead-slm.spec.ts e2e/enterprise-permissions.spec.ts e2e/deck-theme.spec.ts
```

2026-07-18 计划编写时的可复现基线：

- `npm run check`：0 errors；存在 3 个由第五个会员运营 Deck 在途页面/测试产生的 hints，本任务不得新增 `smart-parking` 诊断。
- 销售线索、企业权限和共享主题回归：31/31 passed。
- 项目首页第三张集团经营分析卡已在提交 `2b80f25` 中落地。
- `e2e/group-business-analytics.spec.ts`、会员运营文件、`.gitignore`、项目总控指南和 `.superpowers/` 存在其他工作，不得暂存或改写。

Task 5 的首页和主题集成必须在集团经营分析路由已经落地后执行：

```bash
test -f src/pages/projects/group-business-analytics.astro
test -f src/scripts/group-business-analytics-motion.ts
test -f e2e/group-business-analytics.spec.ts
```

Expected: 三条命令均退出 0。若前两条失败，先完成 `docs/superpowers/plans/2026-07-18-group-business-analytics-deck.md`，再继续 Task 5。Task 1–4 的智慧停车独立路由可以先完成，但不得抢先把会员运营卡错误地排成第四个案例。

### 0.4 页面关系与保留边界

| 页面/文件 | 关系 | 本次允许变化 | 必须保留 |
| --- | --- | --- | --- |
| `/projects/smart-parking/` | 新建页面 | 11 场景、5 章导航、局部 CSS 图形和独立控制器 | 复用 `DeckLayout` 主题、返回入口和站点变量 |
| `/projects/` | 原页面扩展 | 在集团经营分析卡后插入智慧停车卡 | 销售线索、企业权限、集团经营分析的顺序与文案不变；会员运营若已存在则保持在智慧停车之后 |
| `DeckLayout.astro` | 只复用 | 无 | 文件不修改 |
| 其他项目 Deck | 回归对象 | 无 | 页面、脚本、样式和事实不修改 |
| 会员运营 Deck | 并行工作 | 无 | `membership-operations` 页面、脚本、测试、Spec 和计划不修改 |
| `.superpowers/` | 可视化草稿 | 无 | 不作为生产事实源，不暂存、不提交 |
| 项目总控指南 | 只读事实源 | 无 | 保留用户当前未提交修改 |

### 0.5 文件结构

**新建：**

- `src/pages/projects/smart-parking.astro`：11 场景语义内容、S2 数据闸门、CSS 图形、响应式样式、章节导航和控制器入口。
- `src/scripts/smart-parking-motion.ts`：场景观察、章节状态、减少动态、fallback、媒体偏好变化和 cleanup。
- `e2e/smart-parking.spec.ts`：结构、事实、数据闸门、语义对象、主题、响应式、动效模式、可访问性和清理测试。

**修改：**

- `src/pages/projects/index.astro`：在集团经营分析卡后插入第四张智慧停车卡。
- `e2e/deck-theme.spec.ts`：把 `/projects/smart-parking/` 加入共享主题回归数组。

**明确不修改：**

- `src/layouts/DeckLayout.astro`
- `src/pages/projects/sales-lead-slm.astro`
- `src/scripts/sales-lead-slm-motion.ts`
- `e2e/sales-lead-slm.spec.ts`
- `src/pages/projects/enterprise-permissions.astro`
- `src/scripts/enterprise-permissions-motion.ts`
- `e2e/enterprise-permissions.spec.ts`
- 所有 `group-business-analytics` 在途文件
- 所有 `membership-operations` 在途文件
- `.gitignore`
- `docs/project-experience/00-project-experience-guide.md`
- `.superpowers/`

### 0.6 稳定 DOM 与模式合同

| 合同 | 固定值 |
| --- | --- |
| 页面根 | `data-smart-parking-deck` |
| 场景 | `section[data-scene]`，ID 固定为 `s1`–`s11` |
| 章节 | `data-chapter` + `data-chapter-link` |
| 动效对象 | `data-motion-item` |
| S2 数据 | `data-background-metric`、`data-scope`、`data-time-basis` |
| 身份 | `data-identity="xcu"`、`data-identity="mcu"` |
| 架构层 | `data-layer="internal|parking-service|parking-middleware|adapter|parking-lot"` |
| 权益 | `data-benefit="level|points|coupon|consumption"` |
| 限制对象 | `data-limit-axis="member|vehicle"` |
| 支付状态 | `data-payment-state="validate|freeze|pending|paid|zero|release|notify"` |
| 上线迭代 | `data-iteration="benefits|vehicle-risk|double-pay|refund"` |
| 版本 | `data-version="2.0|1.0"` |
| 动效模式 | `static|observe|reduce|fallback` |

视觉 class 不作为控制器或测试的唯一接口。

## Task 1: 建立 11 场景静态页面与事实合同

**Files:**
- Create: `e2e/smart-parking.spec.ts`
- Create: `src/pages/projects/smart-parking.astro`
- Create: `src/scripts/smart-parking-motion.ts`

- [ ] **Step 1: 写结构、开场、身份与数据闸门失败测试**

创建 `e2e/smart-parking.spec.ts`：

```ts
import { readFile } from 'node:fs/promises';
import { test, expect } from '@playwright/test';

const route = '/projects/smart-parking/';

test('deck renders eleven scenes and five chapter links', async ({ page }) => {
  await page.goto(route);
  await expect(page.getByRole('heading', { name: '让一套停车系统，重新拥有演进能力' })).toBeVisible();
  await expect(page.locator('section[data-scene]')).toHaveCount(11);

  const nav = page.getByRole('navigation', { name: '智慧停车案例章节' });
  for (const label of ['需求背景', '黑盒还原', '原生重构', '持续演进', '真实落地']) {
    await expect(nav.getByRole('link', { name: label })).toBeVisible();
  }
});

test('S1 to S4 establish the business importance and black-box reconstruction', async ({ page }) => {
  await page.goto(route);
  await expect(page.locator('#s2')).toContainText('停车，是商场体验的第一站与最后一站');
  await expect(page.locator('#s2')).toContainText('到场');
  await expect(page.locator('#s2')).toContainText('消费');
  await expect(page.locator('#s2')).toContainText('缴费离场');
  await expect(page.locator('#s3')).toContainText('1.0 仍在运行');
  await expect(page.locator('#s3')).toContainText('外包响应慢');
  await expect(page.locator('#s3')).toContainText('需求迭代慢');
  await expect(page.locator('#s4')).toContainText('没有可直接使用的产品文档和开发技术文档');
  await expect(page.locator('#s4')).toContainText('后台和小程序');
  await expect(page.locator('#s4')).toContainText('功能覆盖接近原系统');
});

test('S2 never exposes visual-companion sample numbers', async ({ page }) => {
  await page.goto(route);
  const scene = page.locator('#s2');
  const metricCount = await scene.locator('[data-background-metric]').count();
  expect([0, 3]).toContain(metricCount);

  if (metricCount === 0) {
    await expect(scene.locator('[data-metric-state="without-data"]')).toBeVisible();
  } else {
    for (const metric of await scene.locator('[data-background-metric]').all()) {
      await expect(metric).toHaveAttribute('data-scope', /.+/);
      await expect(metric).toHaveAttribute('data-time-basis', /.+/);
    }
  }

  const body = await page.locator('body').innerText();
  expect(body).not.toMatch(/42\.6 万|¥318 万|12\.8 万/);
});

test('S5 makes visitor payment independent from voluntary membership', async ({ page }) => {
  await page.goto(route);
  const scene = page.locator('#s5');
  await expect(scene.locator('[data-identity="xcu"]')).toContainText('无需开卡');
  await expect(scene.locator('[data-identity="xcu"]')).toContainText('直接缴费');
  await expect(scene.locator('[data-identity="mcu"]')).toContainText('自愿成为会员');
  await expect(scene.locator('[data-identity="mcu"]')).toContainText('会员权益');
  await expect(scene).toContainText('2.0 首发能力');
});

test('public copy keeps legacy, contribution, and result boundaries explicit', async ({ page }) => {
  await page.goto(route);
  const body = await page.locator('body').innerText();
  expect(body).toContain('1.0 仍在运行');
  expect(body).toContain('研发团队完成工程实现');
  expect(body).toContain('退款能力已上线，但暂无真实线上退款订单');
  expect(body).not.toContain('1.0 完全不可用');
  expect(body).not.toContain('2.0 已经全面替代 1.0');
  expect(body).not.toContain('独立完成研发');
});
```

- [ ] **Step 2: 运行新测试并确认路由缺失**

Run:

```bash
npx playwright test e2e/smart-parking.spec.ts
```

Expected: FAIL，`/projects/smart-parking/` 返回 404 或找不到标题与场景。

- [ ] **Step 3: 创建最小静态控制器**

创建 `src/scripts/smart-parking-motion.ts`：

```ts
export function initSmartParkingMotion(root: HTMLElement) {
  root.dataset.motionMode = 'static';
  return () => undefined;
}
```

- [ ] **Step 4: 创建完整语义页面**

创建 `src/pages/projects/smart-parking.astro`：

```astro
---
import DeckLayout from '../../layouts/DeckLayout.astro';

const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
const chapters = [
  { href: '#s1', id: 'background', label: '需求背景' },
  { href: '#s4', id: 'reconstruct', label: '黑盒还原' },
  { href: '#s5', id: 'native', label: '原生重构' },
  { href: '#s9', id: 'evolution', label: '持续演进' },
  { href: '#s10', id: 'running', label: '真实落地' },
];

type BackgroundMetric = { value: string; label: string; scope: string; timeBasis: string };
const backgroundMetrics: BackgroundMetric[] = [];
if (backgroundMetrics.length !== 0 && backgroundMetrics.length !== 3) {
  throw new Error('Smart parking background metrics must contain zero or three verified items.');
}
const hasBackgroundMetrics = backgroundMetrics.length === 3;

const adoptionStats = [
  { value: '8 个', label: '运行停车 2.0 的商场', scope: '35 个停车商场' },
  { value: '27 个', label: '继续运行停车 1.0', scope: '存量商场' },
  { value: '约 7.57 万笔', label: '2.0 月停车缴费单', scope: '8 个 2.0 商场' },
  { value: '1 / 18', label: '某集团 2.0 / 1.0 商场', scope: '集团共 19 个商场' },
];
---

<DeckLayout
  title="智慧停车 2.0｜QQ星"
  description="从无文档外包系统到可持续演进的自有停车产品。"
>
  <main id="smart-parking-deck" class="smart-parking-deck" data-smart-parking-deck data-motion-mode="static">
    <section id="s1" data-scene="opening" data-chapter="background">
      <div class="scene-shell hero-shell">
        <p class="chapter">Smart Parking 2.0</p>
        <h1>让一套停车系统，重新拥有演进能力</h1>
        <p class="lead">从无文档的外包系统逆向还原，到重新规划产品、接入内部业务体系并持续迭代。</p>
        <div class="opening-road" data-motion-item role="img" aria-label="从停车 1.0 外包黑盒驶向停车 2.0 自有体系">
          <span>1.0 外包黑盒</span><i></i><strong>2.0 自有体系</strong>
        </div>
        <p class="memory-line">迁回内部的不是一套旧页面，而是停车产品的定义权与演进能力。</p>
      </div>
    </section>

    <section id="s2" data-scene="business-background" data-chapter="background">
      <div class="scene-shell">
        <p class="eyebrow">Business Background</p>
        <h2>停车，是商场体验的第一站与最后一站</h2>
        <p class="lead-copy">它贯穿顾客到场、消费和缴费离场，也连接车辆、访客、会员、权益、订单与支付。</p>
        {hasBackgroundMetrics ? (
          <div class="background-metrics" data-metric-state="with-data" role="group" aria-label="停车业务规模">
            {backgroundMetrics.map((metric) => (
              <article data-background-metric data-scope={metric.scope} data-time-basis={metric.timeBasis}>
                <strong>{metric.value}</strong><span>{metric.label}</span><small>{metric.scope} · {metric.timeBasis}</small>
              </article>
            ))}
          </div>
        ) : (
          <div class="journey-only" data-metric-state="without-data" role="img" aria-label="顾客从到场到缴费离场的停车旅程">
            <span>到场</span><i></i><span>停车</span><i></i><span>消费</span><i></i><span>缴费离场</span>
          </div>
        )}
        <p class="principle">当核心服务依赖响应慢、难迭代的外包系统，影响的不只是一个页面。</p>
      </div>
    </section>

    <section id="s3" data-scene="legacy" data-chapter="background">
      <div class="scene-shell">
        <p class="eyebrow">The Legacy Constraint</p>
        <h2>1.0 仍在运行，但已经难以继续演进</h2>
        <div class="legacy-grid" data-motion-item>
          <article><strong>外包响应慢</strong><p>问题定位、修复与沟通依赖外部团队。</p></article>
          <article><strong>需求迭代慢</strong><p>新业务能力无法跟随内部产品节奏持续演进。</p></article>
          <article><strong>UI 与交互不合理</strong><p>后台和小程序存在明显体验问题。</p></article>
          <article><strong>内部模型割裂</strong><p>会员、积分、卡券和订单需要专用接口反向查询。</p></article>
        </div>
        <p class="principle">真正失去的，是公司对停车产品的演进控制。</p>
      </div>
    </section>

    <section id="s4" data-scene="reconstruct" data-chapter="reconstruct">
      <div class="scene-shell split-shell">
        <div>
          <p class="eyebrow">Black-box Reconstruction</p>
          <h2>没有文档，只能从线上系统反推产品</h2>
          <p class="lead-copy">没有可直接使用的产品文档和开发技术文档，只能查看仍在运行的 1.0 后台和小程序，逐项还原功能、规则、状态、异常与能力边界。</p>
          <p class="principle">功能覆盖接近原系统，但产品结构、业务规则、交互和系统分层重新规划。</p>
        </div>
        <div class="blackbox-map" data-motion-item role="img" aria-label="从停车 1.0 黑盒逐项还原页面流程规则状态异常和边界">
          <strong>1.0 线上系统</strong>
          <div><span>页面</span><span>流程</span><span>规则</span><span>状态</span><span>异常</span><span>边界</span></div>
        </div>
      </div>
    </section>

    <section id="s5" data-scene="identity" data-chapter="native">
      <div class="scene-shell">
        <p class="eyebrow">Identity Decoupling</p>
        <h2>第一项重构：缴费不再以开卡为前提</h2>
        <p class="lead-copy">XCU—MCU 身份解耦属于 2.0 首发能力，支付身份与会员身份从产品基线开始就被分开。</p>
        <div class="identity-road" data-motion-item role="group" aria-label="XCU 访客直接缴费与 MCU 会员权益支线">
          <article data-identity="xcu"><span>XCU 访客身份</span><strong>无需开卡，直接缴费</strong><p>先承接车辆查询与停车支付。</p></article>
          <div class="gate" aria-hidden="true"><i></i><b></b></div>
          <article data-identity="mcu"><span>MCU 会员身份</span><strong>自愿成为会员后使用会员权益</strong><p>再接入会员等级、积分和卡券。</p></article>
        </div>
        <p class="boundary-note">这项设计满足支付宝平台授权边界，但不声称提升了开卡率或支付转化。</p>
      </div>
    </section>

    <section id="s6" data-scene="architecture" data-chapter="native">
      <div class="scene-shell">
        <p class="eyebrow">Native Architecture</p>
        <h2>把停车接回内部业务，再用统一协议连接外部系统</h2>
        <div class="architecture-stack" data-motion-item>
          <article data-layer="internal"><strong>内部业务</strong><span>XCU / MCU / 会员等级 / 积分 / 卡券 / SO / 支付</span></article>
          <article data-layer="parking-service"><strong>停车后端服务</strong><span>缴费、权益和订单状态编排</span></article>
          <article data-layer="parking-middleware"><strong>停车业务中台</strong><span>统一查询、缴费通知和回调协议</span></article>
          <article data-layer="adapter"><strong>厂商适配器 / 集团停车中台</strong><span>吸收外部接口差异</span></article>
          <article data-layer="parking-lot"><strong>商场停车场</strong><span>真实计费与出场系统</span></article>
        </div>
      </div>
    </section>

    <section id="s7" data-scene="benefits" data-chapter="native">
      <div class="scene-shell">
        <p class="eyebrow">Benefit Orchestration</p>
        <h2>四类权益进入同一套可解释的优惠规则</h2>
        <div class="benefit-grid" data-motion-item>
          <article data-benefit="level">会员等级</article><article data-benefit="points">积分抵现</article>
          <article data-benefit="coupon">停车券</article><article data-benefit="consumption">消费减免</article>
        </div>
        <p>用户选择顺序决定优惠优先级，商场配置单次总减免上限，后端重新校验资格与额度。</p>
        <div class="limit-grid"><span data-limit-axis="member">会员日 / 周 / 月限制</span><span data-limit-axis="vehicle">车辆日 / 周 / 月限制</span></div>
      </div>
    </section>

    <section id="s8" data-scene="payment" data-chapter="native">
      <div class="scene-shell">
        <p class="eyebrow">Payment Lifecycle</p>
        <h2>从优惠计算到冻结、支付、扣减与回退</h2>
        <div class="payment-flow" data-motion-item>
          <span data-payment-state="validate">重新校验</span><span data-payment-state="freeze">冻结权益</span><span data-payment-state="pending">待支付</span>
          <span data-payment-state="paid">支付成功后扣减 / 核销</span><span data-payment-state="zero">零元缴费直接完成</span>
          <span data-payment-state="release">失败、取消或超时后解冻</span><span data-payment-state="notify">通知停车中台与停车场</span>
        </div>
        <p class="principle">冻结防止同一积分、停车券或使用次数被并发重复占用。</p>
      </div>
    </section>

    <section id="s9" data-scene="evolution" data-chapter="evolution">
      <div class="scene-shell">
        <p class="eyebrow">Back to Evolution</p>
        <h2>真实问题开始进入内部迭代闭环</h2>
        <div class="iteration-grid" data-motion-item>
          <article data-iteration="benefits"><strong>权益扩展</strong><p>等级、积分、商户停车券、消费减免与便捷出场。</p></article>
          <article data-iteration="vehicle-risk"><strong>车辆风控</strong><p>会员与车辆双维限制、绑定查询、解绑和日志。</p></article>
          <article data-iteration="double-pay"><strong>双重支付</strong><p>支付后 Loading 与等待出场提示缓冲结果同步。</p></article>
          <article data-iteration="refund"><strong>异常闭环</strong><p>全额退款、权益回退、失败步骤重试与跨日核销。</p></article>
        </div>
      </div>
    </section>

    <section id="s10" data-scene="running" data-chapter="running">
      <div class="scene-shell">
        <p class="eyebrow">Running at Real Scale</p>
        <h2>真实落地，也保留真实迁移边界</h2>
        <div class="adoption-stats" role="group" aria-label="停车 2.0 实际采用范围">
          {adoptionStats.map((stat) => <article><strong>{stat.value}</strong><span>{stat.label}</span><small>{stat.scope}</small></article>)}
        </div>
        <div class="version-lanes" data-motion-item role="group" aria-label="停车 2.0 与 1.0 渐进迁移">
          <article data-version="2.0"><strong>2.0 车道</strong><span>8 个商场 · 完整缴费与权益能力</span></article>
          <article data-version="1.0"><strong>1.0 车道</strong><span>27 个存量商场 · 历史数据整合成本待处理</span></article>
        </div>
        <p class="new-mall-note">其中一个 2.0 商场刚上线、交易数据较少，不把不完整月份包装为成熟月均。</p>
        <p class="boundary-note">退款能力已上线，但暂无真实线上退款订单；版本并存不等于全面替代 1.0。</p>
      </div>
    </section>

    <section id="s11" data-scene="conclusion" data-chapter="running">
      <div class="scene-shell conclusion-shell">
        <p class="eyebrow">Conclusion</p>
        <h2>迁回的是产品定义权与演进能力</h2>
        <p class="lead">从线上 1.0 黑盒还原能力，重新规划身份、权益、交易与系统分层，再通过真实问题持续完善 2.0。</p>
        <div class="conclusion-points" data-motion-item><span>不是重做页面</span><span>不是原样复制</span><span>不是全面替代</span></div>
        <p class="boundary-note">本人负责产品盘点、重构规划、规则与系统分层设计并推动上线；研发团队完成工程实现。</p>
        <a class="back-projects" href={`${base}projects/`}>返回项目经历</a>
      </div>
    </section>
  </main>

  <nav class="smart-parking-nav" data-smart-parking-nav aria-label="智慧停车案例章节">
    {chapters.map((chapter, index) => (
      <a href={chapter.href} class:list={{ active: index === 0 }} data-chapter-link={chapter.id} aria-current={index === 0 ? 'true' : undefined}>
        <span class="nav-dot"></span><span>{chapter.label}</span>
      </a>
    ))}
  </nav>

  <script>
    import { initSmartParkingMotion } from '../../scripts/smart-parking-motion';
    const root = document.querySelector<HTMLElement>('[data-smart-parking-deck]');
    if (root) initSmartParkingMotion(root);
  </script>
</DeckLayout>

<style>
  .smart-parking-deck { --sp-road: #111827; --sp-lane: #f59e0b; --sp-native: #14b8a6; --sp-member: #8b5cf6; }
  .smart-parking-deck section { width: 100%; }
  .scene-shell { width: min(1120px, 100%); margin-inline: auto; }
  .hero-shell, .conclusion-shell { text-align: center; }
  .eyebrow { color: var(--sp-native); font-size: .78rem; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; }
  .lead, .lead-copy, .boundary-note { color: var(--text-dim); line-height: 1.75; }
  .lead { max-width: 760px; margin: 1rem auto 0; }
  .memory-line, .principle { margin-top: 1.2rem; color: var(--text); font-weight: 750; line-height: 1.6; }
  .split-shell { display: grid; grid-template-columns: .9fr 1.1fr; gap: 2rem; align-items: center; }
  .opening-road, .journey-only, .identity-road, .benefit-grid, .limit-grid, .payment-flow, .conclusion-points { display: flex; flex-wrap: wrap; gap: .7rem; align-items: center; }
  .legacy-grid, .iteration-grid, .adoption-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: .8rem; }
  article, .blackbox-map, .architecture-stack, .version-lanes { border: 1px solid var(--glass-border); border-radius: 1rem; background: var(--glass); padding: 1rem; }
  article p, article span, article small { color: var(--text-dim); }
  .architecture-stack, .version-lanes { display: grid; gap: .6rem; }
  .architecture-stack article { display: grid; gap: .3rem; }
  .back-projects { display: inline-flex; margin-top: 1.4rem; color: var(--text); }
  .smart-parking-nav { position: fixed; z-index: 18; left: 50%; bottom: 1rem; translate: -50% 0; display: flex; border: 1px solid var(--glass-border); border-radius: 999px; background: var(--chrome-bg); padding: .5rem; }
  .smart-parking-nav a { display: inline-flex; gap: .4rem; align-items: center; color: var(--text-dim); padding: .42rem .65rem; text-decoration: none; white-space: nowrap; }
  .smart-parking-nav a.active { color: var(--text); }
  .nav-dot { width: .5rem; height: .5rem; border-radius: 50%; background: currentColor; }
  @media (max-width: 860px) {
    .smart-parking-deck { scroll-snap-type: y proximity; }
    .smart-parking-deck section { height: auto; min-height: 100vh; padding-inline: 1rem; }
    .split-shell, .legacy-grid, .iteration-grid, .adoption-stats { grid-template-columns: 1fr; }
  }
</style>
```

- [ ] **Step 5: 运行静态内容测试**

Run:

```bash
npx playwright test e2e/smart-parking.spec.ts
```

Expected: 5 tests PASS。

- [ ] **Step 6: 提交静态页面**

```bash
git add src/pages/projects/smart-parking.astro src/scripts/smart-parking-motion.ts e2e/smart-parking.spec.ts
git commit -m "feat: build smart parking deck content"
```

## Task 2: 锁定架构、权益、支付与演进语义

**Files:**
- Modify: `e2e/smart-parking.spec.ts`
- Modify: `src/pages/projects/smart-parking.astro`

- [ ] **Step 1: 追加语义失败测试**

在 `e2e/smart-parking.spec.ts` 追加：

```ts
test('S6 exposes five architecture layers without claiming universal standardization', async ({ page }) => {
  await page.goto(route);
  const scene = page.locator('#s6');
  for (const layer of ['internal', 'parking-service', 'parking-middleware', 'adapter', 'parking-lot']) {
    await expect(scene.locator(`[data-layer="${layer}"]`)).toHaveCount(1);
  }
  await expect(scene).toContainText('独立部署系统仍可能逐客户适配');
  await expect(scene).toContainText('集团级对接可覆盖 19 个商场');
});

test('S7 keeps four benefits, one total cap, and member plus vehicle limits explicit', async ({ page }) => {
  await page.goto(route);
  const scene = page.locator('#s7');
  for (const benefit of ['level', 'points', 'coupon', 'consumption']) {
    await expect(scene.locator(`[data-benefit="${benefit}"]`)).toHaveCount(1);
  }
  await expect(scene.locator('[data-discount-cap]')).toContainText('单次总减免上限');
  await expect(scene.locator('[data-limit-axis="member"]')).toContainText('会员');
  await expect(scene.locator('[data-limit-axis="vehicle"]')).toContainText('车辆');
  await expect(scene).toContainText('用户选择顺序决定优惠优先级');
  await expect(scene).toContainText('后端重新校验');
  await expect(scene).toContainText('每名会员每天最多使用一次');
});

test('S8 closes the payment lifecycle for cash, zero-pay, and failure branches', async ({ page }) => {
  await page.goto(route);
  const scene = page.locator('#s8');
  for (const state of ['validate', 'freeze', 'pending', 'paid', 'zero', 'release', 'notify']) {
    await expect(scene.locator(`[data-payment-state="${state}"]`)).toHaveCount(1);
  }
  await expect(scene).toContainText('并发重复占用');
});

test('S9 and S10 prove continued evolution while preserving migration boundaries', async ({ page }) => {
  await page.goto(route);
  for (const iteration of ['benefits', 'vehicle-risk', 'double-pay', 'refund']) {
    await expect(page.locator(`#s9 [data-iteration="${iteration}"]`)).toHaveCount(1);
  }
  await expect(page.locator('#s9')).toContainText('再次执行只重试失败步骤');
  await expect(page.locator('#s10 [data-version="2.0"]')).toContainText('8 个商场');
  await expect(page.locator('#s10 [data-version="1.0"]')).toContainText('27 个存量商场');
  await expect(page.locator('#s10')).toContainText('约 7.57 万笔');
  await expect(page.locator('#s10')).toContainText('1 个使用 2.0、18 个继续使用 1.0');
  await expect(page.locator('#s10')).toContainText('其中一个 2.0 商场刚上线');
});
```

- [ ] **Step 2: 运行语义测试并确认缺少细节**

Run:

```bash
npx playwright test e2e/smart-parking.spec.ts --grep "S6|S7|S8|S9"
```

Expected: FAIL，S6 缺少外部适配边界，S7 缺少总额度节点，S9 缺少失败步骤重试与集团版本明细。

- [ ] **Step 3: 补齐 S6–S10 的稳定语义节点**

在 `src/pages/projects/smart-parking.astro` 中进行以下精确修改：

1. 在 S6 的 `architecture-stack` 后追加：

```astro
<div class="architecture-notes" data-motion-item>
  <p><strong>平台型接入</strong><span>某集团一次集团级对接可覆盖 19 个商场。</span></p>
  <p><strong>真实边界</strong><span>外部生态没有被完全标准化，独立部署系统仍可能逐客户适配。</span></p>
</div>
```

2. 把 S7 的 `benefit-grid` 后正文与 `limit-grid` 替换为：

```astro
<div class="discount-cap" data-discount-cap data-motion-item>
  <strong>单次总减免上限</strong>
  <span>用户选择顺序决定优惠优先级，先选择的权益优先占用额度。</span>
  <small>前端即时展示，后端重新校验资格、限制与总额度。</small>
</div>
<div class="limit-grid" data-motion-item>
  <span data-limit-axis="member"><strong>会员限制</strong>日 / 周 / 月使用上限</span>
  <span data-limit-axis="vehicle"><strong>车辆限制</strong>日 / 周 / 月使用上限</span>
</div>
<p class="boundary-note">车辆维度来自多人绑定同一车辆、轮流使用会员权益的真实风控问题；任一维度达到上限，本次权益不可使用。消费减免按每名会员每天最多使用一次，不复制低频二次入场的复杂匹配。</p>
```

3. 把 S9 的 `iteration-grid` 替换为：

```astro
<div class="iteration-grid" data-motion-item>
  <article data-iteration="benefits"><strong>权益扩展</strong><p>会员等级、积分抵现、商户停车券、消费减免和便捷出场进入统一体系。</p></article>
  <article data-iteration="vehicle-risk"><strong>车辆风控</strong><p>从仅限制会员升级为会员与车辆双维限制，并增加绑定查询、后台解绑和操作日志。</p></article>
  <article data-iteration="double-pay"><strong>双重支付治理</strong><p>针对 ETC 与小程序结果同步时间差，增加支付后 Loading 与等待出场提示；优化后未再明显发生同类问题。</p></article>
  <article data-iteration="refund"><strong>异常闭环</strong><p>现金与权益同步回退；再次执行只重试失败步骤，以校验时间处理跨日核销，超出宽限时由退款兜底。</p></article>
</div>
```

4. 在 S10 的 `version-lanes` 后、边界说明前追加：

```astro
<p class="mixed-version-note" data-motion-item>
  某集团共 19 个商场，其中 1 个使用 2.0、18 个继续使用 1.0；版本按商场配置，支持渐进迁移。
</p>
```

- [ ] **Step 4: 运行全部内容与语义测试**

Run:

```bash
npx playwright test e2e/smart-parking.spec.ts
```

Expected: 9 tests PASS。

- [ ] **Step 5: 提交语义增量**

```bash
git add src/pages/projects/smart-parking.astro e2e/smart-parking.spec.ts
git commit -m "feat: model smart parking system decisions"
```

## Task 3: 完成车道导视视觉、主题与响应式布局

**Files:**
- Modify: `e2e/smart-parking.spec.ts`
- Modify: `src/pages/projects/smart-parking.astro`

- [ ] **Step 1: 追加主题与响应式失败测试**

在 `e2e/smart-parking.spec.ts` 追加：

```ts
test('desktop keeps snap while mobile preserves scene order without overflow', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(route);
  expect(await page.locator('[data-smart-parking-deck]').evaluate((element) => getComputedStyle(element).scrollSnapType)).toContain('y');
  expect(await page.locator('#s5 .identity-road').evaluate((element) => getComputedStyle(element).display)).toBe('grid');
  expect(await page.locator('#s8 .payment-flow').evaluate((element) => getComputedStyle(element).display)).toBe('grid');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)).toBe(false);
  const sceneIds = await page.locator('section[data-scene]').evaluateAll((sections) => sections.map((section) => section.id));
  expect(sceneIds).toEqual(['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11']);
});

test('light and dark themes retain parking semantic tokens', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('theme', 'light'));
  await page.goto(route);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  const lightTokens = await page.locator('[data-smart-parking-deck]').evaluate((element) => {
    const style = getComputedStyle(element);
    return [style.getPropertyValue('--sp-lane').trim(), style.getPropertyValue('--sp-native').trim(), style.getPropertyValue('--sp-member').trim()];
  });
  expect(lightTokens.every(Boolean)).toBe(true);

  await page.locator('#deck-theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('#deck-theme-toggle')).toContainText('☀️');
});

test('parking semantics remain explicit without relying on color', async ({ page }) => {
  await page.goto(route);
  await expect(page.locator('#s5 [data-identity="xcu"]')).toHaveAttribute('data-identity', 'xcu');
  await expect(page.locator('#s5 [data-identity="mcu"]')).toHaveAttribute('data-identity', 'mcu');
  await expect(page.locator('#s7 [data-limit-axis]')).toHaveCount(2);
  await expect(page.locator('#s10 [data-version]')).toHaveCount(2);
  await expect(page.locator('#s10 [data-version="1.0"]')).toContainText('历史数据整合成本');
});
```

- [ ] **Step 2: 运行视觉合同测试并记录当前不足**

Run:

```bash
npx playwright test e2e/smart-parking.spec.ts --grep "desktop keeps|light and dark|without relying"
```

Expected: FAIL，`identity-road` 和 `payment-flow` 在最小样式中仍是 flex，尚未形成正式车道与状态网格。

- [ ] **Step 3: 用正式视觉系统替换页面现有 `<style>`**

把 `src/pages/projects/smart-parking.astro` 的整个 `<style>` 替换为：

```astro
<style>
  .smart-parking-deck {
    --sp-road: color-mix(in srgb, var(--text) 10%, var(--bg));
    --sp-road-strong: color-mix(in srgb, var(--text) 18%, var(--bg));
    --sp-lane: #f59e0b;
    --sp-native: #14b8a6;
    --sp-member: #8b5cf6;
    --sp-external: var(--c-blue);
    --sp-risk: var(--c-problem);
    --sp-surface: color-mix(in srgb, var(--glass) 92%, transparent);
    --sp-line: color-mix(in srgb, var(--sp-native) 38%, var(--glass-border));
  }

  .smart-parking-deck section { width: 100%; }
  .scene-shell { width: min(1120px, 100%); margin-inline: auto; }
  .hero-shell, .conclusion-shell { text-align: center; }
  .eyebrow { margin-bottom: .75rem; color: var(--sp-native); font-size: .78rem; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; }
  .lead { max-width: 780px; margin: 1rem auto 0; color: var(--text-dim); font-size: clamp(1rem, 1.7vw, 1.2rem); line-height: 1.8; }
  .lead-copy, .boundary-note { color: var(--text-dim); line-height: 1.75; }
  .memory-line, .principle { margin-top: 1.25rem; color: var(--text); font-size: clamp(1rem, 1.6vw, 1.25rem); font-weight: 760; line-height: 1.65; }
  .split-shell { display: grid; grid-template-columns: minmax(280px, .9fr) minmax(360px, 1.1fr); gap: clamp(1.25rem, 4vw, 3.5rem); align-items: center; }

  .opening-road {
    position: relative; display: grid; grid-template-columns: minmax(9rem, 1fr) 2fr minmax(9rem, 1fr); gap: .8rem; align-items: center;
    max-width: 820px; margin: 2rem auto 0; border: 1px solid var(--glass-border); border-radius: 1.3rem;
    background: linear-gradient(110deg, var(--sp-road), var(--sp-road-strong)); padding: 1.2rem;
  }
  .opening-road span, .opening-road strong { border: 1px solid var(--glass-border); border-radius: .8rem; padding: .7rem; }
  .opening-road span { color: var(--sp-lane); }
  .opening-road strong { color: var(--sp-native); }
  .opening-road i { height: 2px; background: repeating-linear-gradient(90deg, var(--sp-lane) 0 1.2rem, transparent 1.2rem 2rem); }

  .background-metrics, .legacy-grid, .iteration-grid, .adoption-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .9rem; margin-top: 1.4rem; }
  .background-metrics { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .smart-parking-deck article, .blackbox-map, .architecture-notes, .discount-cap, .mixed-version-note {
    border: 1px solid var(--glass-border); border-radius: 1rem; background: var(--sp-surface); padding: 1rem;
  }
  .background-metrics article { display: grid; gap: .35rem; border-color: color-mix(in srgb, var(--sp-lane) 42%, var(--glass-border)); }
  .background-metrics strong, .adoption-stats strong { color: var(--sp-native); font-size: clamp(1.1rem, 2vw, 1.55rem); }
  .background-metrics span, .background-metrics small, .adoption-stats span, .adoption-stats small { color: var(--text-dim); }
  .journey-only { display: grid; grid-template-columns: auto 1fr auto 1fr auto 1fr auto; gap: .6rem; align-items: center; margin-top: 1.5rem; border: 1px solid var(--sp-line); border-radius: 1rem; background: var(--sp-surface); padding: 1rem; }
  .journey-only span { border: 1px solid var(--glass-border); border-radius: 999px; padding: .45rem .7rem; text-align: center; }
  .journey-only i { height: 2px; background: linear-gradient(90deg, var(--sp-lane), var(--sp-native)); }

  .legacy-grid article, .iteration-grid article, .adoption-stats article { display: grid; gap: .4rem; }
  .legacy-grid article { border-top: 3px solid var(--sp-lane); }
  .legacy-grid p, .iteration-grid p { color: var(--text-dim); line-height: 1.6; }
  .blackbox-map { display: grid; gap: 1rem; border-color: color-mix(in srgb, var(--sp-lane) 55%, var(--glass-border)); background: linear-gradient(145deg, var(--sp-road), var(--sp-road-strong)); }
  .blackbox-map > strong { color: var(--sp-lane); text-align: center; }
  .blackbox-map > div { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .6rem; }
  .blackbox-map span { border: 1px solid color-mix(in srgb, var(--sp-native) 42%, var(--glass-border)); border-radius: .7rem; color: var(--text); padding: .65rem; text-align: center; }

  .identity-road { display: grid; grid-template-columns: 1fr auto 1fr; gap: 1rem; align-items: stretch; margin-top: 1.4rem; }
  .identity-road article { display: grid; gap: .5rem; }
  .identity-road [data-identity='xcu'] { border-color: color-mix(in srgb, var(--sp-native) 60%, var(--glass-border)); }
  .identity-road [data-identity='mcu'] { border-color: color-mix(in srgb, var(--sp-member) 60%, var(--glass-border)); }
  .identity-road [data-identity='xcu'] > span { color: var(--sp-native); }
  .identity-road [data-identity='mcu'] > span { color: var(--sp-member); }
  .identity-road p { color: var(--text-dim); }
  .gate { position: relative; width: 4.5rem; min-height: 7.5rem; align-self: center; }
  .gate b { position: absolute; left: .65rem; bottom: .8rem; width: 2rem; height: 1.2rem; border-radius: .3rem; background: var(--sp-lane); }
  .gate i { position: absolute; left: 1.5rem; bottom: 1.8rem; width: .35rem; height: 5rem; border-radius: 999px; background: var(--text); transform: rotate(-55deg); transform-origin: bottom; }

  .architecture-stack { display: grid; gap: .55rem; margin-top: 1.3rem; }
  .architecture-stack article { display: grid; grid-template-columns: minmax(10rem, .35fr) 1fr; gap: .7rem; align-items: center; border-left: 3px solid var(--sp-external); }
  .architecture-stack [data-layer='internal'], .architecture-stack [data-layer='parking-service'] { border-left-color: var(--sp-native); }
  .architecture-stack [data-layer='parking-middleware'] { border-left-color: var(--sp-lane); }
  .architecture-stack span { color: var(--text-dim); }
  .architecture-notes { display: grid; grid-template-columns: repeat(2, 1fr); gap: .8rem; margin-top: 1rem; }
  .architecture-notes p { display: grid; gap: .35rem; color: var(--text-dim); line-height: 1.6; }
  .architecture-notes strong { color: var(--text); }

  .benefit-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .75rem; margin-top: 1.2rem; }
  .benefit-grid article { border-color: color-mix(in srgb, var(--sp-member) 48%, var(--glass-border)); text-align: center; }
  .discount-cap { display: grid; grid-template-columns: auto 1fr; gap: .45rem 1rem; align-items: center; margin-top: 1rem; border-color: color-mix(in srgb, var(--sp-lane) 55%, var(--glass-border)); }
  .discount-cap strong { color: var(--sp-lane); }
  .discount-cap span, .discount-cap small { color: var(--text-dim); }
  .discount-cap small { grid-column: 2; }
  .limit-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: .8rem; margin-top: 1rem; }
  .limit-grid span { border: 1px dashed var(--sp-line); border-radius: .8rem; color: var(--text-dim); padding: .8rem; }
  .limit-grid strong { display: block; color: var(--text); margin-bottom: .25rem; }

  .payment-flow { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: .5rem; margin-top: 1.2rem; }
  .payment-flow span { position: relative; display: grid; place-items: center; min-height: 5.4rem; border: 1px solid var(--sp-line); border-radius: .8rem; background: var(--sp-surface); padding: .6rem; text-align: center; }
  .payment-flow span:not(:last-child)::after { content: '→'; position: absolute; right: -.55rem; color: var(--sp-lane); z-index: 2; }
  .payment-flow [data-payment-state='release'] { border-color: color-mix(in srgb, var(--sp-risk) 55%, var(--glass-border)); }
  .payment-flow [data-payment-state='paid'], .payment-flow [data-payment-state='zero'], .payment-flow [data-payment-state='notify'] { border-color: color-mix(in srgb, var(--sp-native) 55%, var(--glass-border)); }

  .iteration-grid article { border-top: 3px solid var(--sp-native); }
  .iteration-grid [data-iteration='double-pay'], .iteration-grid [data-iteration='refund'] { border-top-color: var(--sp-lane); }
  .version-lanes { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-top: 1rem; }
  .version-lanes article { display: grid; gap: .4rem; }
  .version-lanes [data-version='2.0'] { border-color: color-mix(in srgb, var(--sp-native) 60%, var(--glass-border)); }
  .version-lanes [data-version='1.0'] { border-color: color-mix(in srgb, var(--sp-lane) 60%, var(--glass-border)); }
  .version-lanes span, .new-mall-note, .mixed-version-note { color: var(--text-dim); line-height: 1.65; }
  .new-mall-note, .mixed-version-note { margin-top: 1rem; }

  .conclusion-points { display: flex; flex-wrap: wrap; justify-content: center; gap: .75rem; margin-top: 1.5rem; }
  .conclusion-points span { border: 1px solid var(--sp-line); border-radius: 999px; padding: .55rem .8rem; }
  .back-projects { display: inline-flex; margin-top: 1.4rem; border: 1px solid var(--glass-border); border-radius: 999px; color: var(--text); padding: .7rem 1rem; text-decoration: none; }
  .back-projects:focus-visible, .smart-parking-nav a:focus-visible { outline: 3px solid var(--sp-native); outline-offset: 3px; }

  .smart-parking-nav { position: fixed; z-index: 18; left: 50%; bottom: 1rem; translate: -50% 0; display: flex; gap: .25rem; border: 1px solid var(--glass-border); border-radius: 999px; background: var(--chrome-bg); padding: .5rem; backdrop-filter: blur(16px); }
  .smart-parking-nav a { display: inline-flex; gap: .4rem; align-items: center; border-radius: 999px; color: var(--text-dim); padding: .42rem .65rem; text-decoration: none; white-space: nowrap; }
  .smart-parking-nav a.active { color: var(--text); background: var(--glass); }
  .nav-dot { width: .5rem; height: .5rem; border-radius: 50%; background: currentColor; }
  #s11 { padding-bottom: 9rem; }

  [data-smart-parking-deck][data-motion-ready='true'][data-motion-mode='observe'] [data-motion-state='pending'] [data-motion-item] { opacity: 0; transform: translateY(1rem); }
  [data-smart-parking-deck][data-motion-mode='observe'] [data-motion-state='visible'] [data-motion-item] { opacity: 1; transform: translateY(0); transition: opacity .42s ease, transform .42s ease; }
  [data-smart-parking-deck][data-motion-ready='true'][data-motion-mode='observe'] #s4[data-motion-state='pending'] .blackbox-map span { opacity: 0; transform: translateY(.5rem); }
  [data-smart-parking-deck][data-motion-mode='observe'] #s4[data-motion-state='visible'] .blackbox-map span { opacity: 1; transform: none; transition: opacity .35s ease, transform .35s ease; }
  [data-smart-parking-deck][data-motion-ready='true'][data-motion-mode='observe'] #s5[data-motion-state='pending'] .gate i { transform: rotate(0deg); }
  [data-smart-parking-deck][data-motion-mode='observe'] #s5[data-motion-state='visible'] .gate i { transform: rotate(-55deg); transition: transform .5s ease .12s; }

  @media (max-width: 860px) {
    .smart-parking-deck { scroll-snap-type: y proximity; }
    .smart-parking-deck section { height: auto; min-height: 100vh; padding-inline: 1rem; }
    .split-shell, .legacy-grid, .iteration-grid, .adoption-stats, .background-metrics, .identity-road, .benefit-grid, .limit-grid, .version-lanes, .architecture-notes { grid-template-columns: 1fr; }
    .opening-road { grid-template-columns: 1fr; }
    .opening-road i { width: 2px; height: 2.5rem; justify-self: center; background: repeating-linear-gradient(180deg, var(--sp-lane) 0 .65rem, transparent .65rem 1rem); }
    .journey-only { grid-template-columns: 1fr; }
    .journey-only i { width: 2px; height: 1rem; justify-self: center; }
    .gate { width: 100%; min-height: 3rem; }
    .gate b { left: 50%; bottom: .2rem; translate: -50% 0; }
    .gate i { left: 50%; bottom: 1.2rem; width: .3rem; height: 3rem; }
    .architecture-stack article, .discount-cap { grid-template-columns: 1fr; }
    .discount-cap small { grid-column: auto; }
    .payment-flow { grid-template-columns: 1fr; }
    .payment-flow span { min-height: auto; }
    .payment-flow span:not(:last-child)::after { content: '↓'; right: auto; bottom: -.8rem; }
    .smart-parking-nav { width: calc(100% - 1rem); justify-content: space-between; }
    .smart-parking-nav a { padding-inline: .42rem; }
    .smart-parking-nav a span:last-child { font-size: .67rem; }
  }

  @supports (height: 100dvh) {
    @media (max-width: 860px) { .smart-parking-deck section { min-height: 100dvh; } }
  }

  @media (prefers-reduced-motion: reduce) {
    .smart-parking-deck *, .smart-parking-deck *::before, .smart-parking-deck *::after {
      scroll-behavior: auto; animation-duration: .01ms; animation-iteration-count: 1; transition-duration: .01ms; transition-delay: 0ms;
    }
  }
</style>
```

- [ ] **Step 4: 运行页面全部测试**

Run:

```bash
npx playwright test e2e/smart-parking.spec.ts
```

Expected: 12 tests PASS，无横向溢出。

- [ ] **Step 5: 提交视觉系统**

```bash
git add src/pages/projects/smart-parking.astro e2e/smart-parking.spec.ts
git commit -m "feat: style smart parking deck"
```

## Task 4: 实现原生观察动效、章节状态与降级

**Files:**
- Modify: `e2e/smart-parking.spec.ts`
- Replace: `src/scripts/smart-parking-motion.ts`

- [ ] **Step 1: 追加动效模式与清理失败测试**

在 `e2e/smart-parking.spec.ts` 追加：

```ts
test('static mode keeps all scenes readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(route);
  await expect(page.locator('[data-smart-parking-deck]')).toHaveAttribute('data-motion-mode', 'static');
  await expect(page.locator('section[data-scene]')).toHaveCount(11);
  await page.locator('#s11').scrollIntoViewIfNeeded();
  await expect(page.locator('#s11')).toContainText('迁回的是产品定义权与演进能力');
  await context.close();
});

test('desktop uses native observed reveals without pinning', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(route);
  const root = page.locator('[data-smart-parking-deck]');
  await expect(root).toHaveAttribute('data-motion-ready', 'true');
  await expect(root).toHaveAttribute('data-motion-mode', 'observe');
  await expect(page.locator('#s1')).toHaveAttribute('data-motion-state', 'visible');
  await page.locator('#s7').scrollIntoViewIfNeeded();
  await expect(page.locator('#s7')).toHaveAttribute('data-motion-state', 'visible');
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
});

test('reduced motion directly exposes all scenes', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(route);
  const root = page.locator('[data-smart-parking-deck]');
  await expect(root).toHaveAttribute('data-motion-mode', 'reduce');
  await expect(root).toHaveAttribute('data-motion-ready', 'true');
  await expect(page.locator('section[data-motion-state="visible"]')).toHaveCount(11);
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await context.close();
});

test('missing IntersectionObserver falls back to visible content', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'IntersectionObserver', { value: undefined, configurable: true });
  });
  await page.goto(route);
  const root = page.locator('[data-smart-parking-deck]');
  await expect(root).toHaveAttribute('data-motion-mode', 'fallback');
  await expect(root).toHaveAttribute('data-motion-ready', 'false');
  await expect(page.locator('section[data-motion-state="visible"]')).toHaveCount(11);
});

test('motion controller stays independent from GSAP and ScrollTrigger', async () => {
  const source = await readFile(new URL('../src/scripts/smart-parking-motion.ts', import.meta.url), 'utf8');
  expect(source).not.toContain("from 'gsap'");
  expect(source).not.toContain('ScrollTrigger');
});

test('chapter anchors remain keyboard usable and active state is accessible', async ({ page }) => {
  await page.goto(route);
  const nav = page.getByRole('navigation', { name: '智慧停车案例章节' });
  const native = nav.getByRole('link', { name: '原生重构' });
  await native.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#s5$/);
  await expect(native).toHaveAttribute('aria-current', 'true');
  await expect(page.getByRole('link', { name: '返回项目经历' })).toHaveAttribute('href', '/projects/');
});

test('controller cleanup restores static readable state', async ({ page }) => {
  await page.goto(route);
  const root = page.locator('[data-smart-parking-deck]');
  await expect(root).toHaveAttribute('data-motion-mode', 'observe');
  await page.evaluate(() => document.dispatchEvent(new Event('astro:before-swap')));
  await expect(root).toHaveAttribute('data-motion-mode', 'static');
  await expect(root).not.toHaveAttribute('data-motion-ready', /.+/);
  await expect(page.locator('section[data-motion-state]')).toHaveCount(0);
});

test('rapid forward and reverse scrolling keeps current scenes visible without browser errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(route);
  for (const id of ['s4', 's8', 's11', 's7', 's2', 's10']) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await expect(page.locator(`#${id}`)).toHaveAttribute('data-motion-state', 'visible');
  }
  expect(errors).toEqual([]);
});
```

- [ ] **Step 2: 运行动效测试并确认最小控制器失败**

Run:

```bash
npx playwright test e2e/smart-parking.spec.ts --grep "static mode|native observed|reduced motion|missing IntersectionObserver|motion controller|chapter anchors|controller cleanup|rapid forward"
```

Expected: 静态无脚本测试通过；`observe / reduce / fallback / cleanup` 测试失败，因为当前控制器只保留 `static`。

- [ ] **Step 3: 用完整控制器替换最小实现**

把 `src/scripts/smart-parking-motion.ts` 替换为：

```ts
type MotionMode = 'static' | 'observe' | 'reduce' | 'fallback';

const sceneSelector = '[data-scene]';
const chapterLinkSelector = '[data-smart-parking-nav] [data-chapter-link]';

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

export function initSmartParkingMotion(root: HTMLElement) {
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
    }, { root, rootMargin: '-15% 0px -25% 0px', threshold: [0, 0.15, 0.4, 0.7] });

    scenes.forEach((scene, index) => {
      scene.dataset.motionState = index === 0 ? 'visible' : 'pending';
      observer?.observe(scene);
    });
    setActiveChapter(scenes[0]?.dataset.chapter ?? 'background');
    setRootMode(root, 'observe', true);
  };

  const onPreferenceChange = () => {
    if (disposed) return;
    try {
      setup();
    } catch (error) {
      applyStaticMode('fallback', false);
      console.error('Smart parking motion initialization failed', error);
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
    console.error('Smart parking motion initialization failed', error);
  }

  return cleanup;
}
```

- [ ] **Step 4: 运行动效与全页测试**

Run:

```bash
npx playwright test e2e/smart-parking.spec.ts
```

Expected: 20 tests PASS；页面没有 `.pin-spacer`，控制器源码不包含 GSAP 或 ScrollTrigger。

- [ ] **Step 5: 提交动效控制器**

```bash
git add src/scripts/smart-parking-motion.ts e2e/smart-parking.spec.ts
git commit -m "feat: add smart parking deck motion"
```

## Task 5: 按第四个案例位置接入项目首页与共享主题

**Files:**
- Modify: `e2e/smart-parking.spec.ts`
- Modify: `src/pages/projects/index.astro`
- Modify: `e2e/deck-theme.spec.ts`

- [ ] **Step 1: 验证第三个案例依赖已经落地**

Run:

```bash
test -f src/pages/projects/group-business-analytics.astro
test -f src/scripts/group-business-analytics-motion.ts
npx playwright test e2e/group-business-analytics.spec.ts
```

Expected: 文件检查退出 0，集团经营分析 E2E 全部 PASS。若未通过，停止本 Task，先完成第三个 Deck；不要通过改变智慧停车卡顺序绕开依赖。

- [ ] **Step 2: 追加第四张项目卡失败测试**

在 `e2e/smart-parking.spec.ts` 追加：

```ts
test('projects listing exposes smart parking as the fourth public case', async ({ page }) => {
  await page.goto('/projects/');
  const cards = page.locator('.card');
  const firstFourTitles = await cards.locator('h3').evaluateAll((headings) => headings.slice(0, 4).map((heading) => heading.textContent?.trim()));
  expect(firstFourTitles).toEqual([
    '全域销售线索管理系统',
    '多业务线企业权限体系',
    '集团经营数据分析体系',
    '智慧停车 2.0',
  ]);

  const card = cards.nth(3);
  await expect(card).toContainText('外包系统内收');
  await expect(card).toContainText('持续演进');
  await expect(card).toHaveAttribute('href', route);

  const membershipIndex = await cards.evaluateAll((elements) => elements.findIndex((element) => element.textContent?.includes('多平台会员运营体系')));
  expect(membershipIndex === -1 || membershipIndex > 3).toBe(true);
});
```

- [ ] **Step 3: 运行入口测试并确认失败**

Run:

```bash
npx playwright test e2e/smart-parking.spec.ts --grep "fourth public case"
```

Expected: FAIL，第四张卡不存在或会员运营卡暂时占据第四位。

- [ ] **Step 4: 在集团经营分析卡后插入智慧停车卡**

在 `src/pages/projects/index.astro` 的集团经营分析对象结束后、会员运营对象之前插入：

```astro
  {
    title: '智慧停车 2.0',
    hook: '从外包系统内收到重新获得产品定义权与持续演进能力',
    tags: ['系统内收', '权益编排', '持续演进'],
    href: `${base}projects/smart-parking/`,
    cover: 'linear-gradient(120deg, #111827 0%, #f59e0b 48%, #14b8a6 100%)',
  },
```

不得改写前三张卡；如果会员运营卡已经存在，确保它仍位于本对象之后。

- [ ] **Step 5: 把智慧停车路由加入共享主题回归**

在 `e2e/deck-theme.spec.ts` 的项目路由部分，将以下两行连续放置：

```ts
  '/projects/group-business-analytics/',
  '/projects/smart-parking/',
```

如果会员运营路由已经存在，最终顺序为：

```ts
  '/projects/group-business-analytics/',
  '/projects/smart-parking/',
  '/projects/membership-operations/',
```

- [ ] **Step 6: 运行入口、主题与智慧停车测试**

Run:

```bash
npx playwright test e2e/smart-parking.spec.ts e2e/deck-theme.spec.ts
```

Expected: 全部 PASS；项目首页前四张卡顺序固定，智慧停车页跟随共享浅色主题并支持主题切换。

- [ ] **Step 7: 提交入口与主题集成**

```bash
git add src/pages/projects/index.astro e2e/deck-theme.spec.ts e2e/smart-parking.spec.ts
git commit -m "feat: add smart parking project entry"
```

## Task 6: 完成构建、视觉与回归验收

**Files:**
- Verify: `src/pages/projects/smart-parking.astro`
- Verify: `src/scripts/smart-parking-motion.ts`
- Verify: `src/pages/projects/index.astro`
- Verify: `e2e/smart-parking.spec.ts`
- Verify: `e2e/deck-theme.spec.ts`

- [ ] **Step 1: 检查未核验数据与敏感文本**

Run:

```bash
rg -n "42\.6 万|¥318 万|12\.8 万|真实车牌|生产接口|客户名称|独立完成研发|2\.0 已经全面替代 1\.0" src/pages/projects/smart-parking.astro
```

Expected: 无输出。`退款能力已上线，但暂无真实线上退款订单`、`研发团队完成工程实现`和 8/27 版本边界必须保留。

- [ ] **Step 2: 运行 Astro 类型与模板检查**

Run:

```bash
npm run check
```

Expected: 0 errors；`smart-parking.astro`、`smart-parking-motion.ts` 和 `smart-parking.spec.ts` 不产生新诊断。若第五个 Deck 的既有 hints 仍存在，记录来源但不要在本任务修改会员运营文件。

- [ ] **Step 3: 运行生产构建**

Run:

```bash
npm run build
test -f dist/projects/smart-parking/index.html
```

Expected: build 退出 0，智慧停车静态路由存在。

- [ ] **Step 4: 运行新页面完整 E2E**

Run:

```bash
npx playwright test e2e/smart-parking.spec.ts
```

Expected: 所有智慧停车测试 PASS。

- [ ] **Step 5: 运行核心 Deck 与共享主题回归**

Run:

```bash
npx playwright test \
  e2e/sales-lead-slm.spec.ts \
  e2e/enterprise-permissions.spec.ts \
  e2e/group-business-analytics.spec.ts \
  e2e/smart-parking.spec.ts \
  e2e/deck-theme.spec.ts
```

Expected: 全部 PASS；不得通过修改前三个 Deck 的页面、控制器或测试消除回归。

- [ ] **Step 6: 进行桌面、移动端和双主题视觉检查**

启动本地站点：

```bash
npm run dev
```

依次检查：

- `1280×800` 浅色：S1 车道、S5 闸机、S6 分层、S8 状态流和底部导航不遮挡正文。
- `1280×800` 深色：琥珀车道、青绿 2.0 节点、紫色 MCU 支线和玫红异常路径仍可区分。
- `390×844` 浅色与深色：场景按 S1–S11 纵向排列，支付状态流改为竖向，无横向溢出。
- 减少动态：无位移、开闸和错峰，但所有图形处于最终可读状态。
- S2：真实数据未提供时只显示顾客旅程，不出现任何示例数字或空白数字卡。

- [ ] **Step 7: 检查提交范围**

Run:

```bash
git status --short
git diff --name-only HEAD~5..HEAD
```

Expected: 本任务提交只包含以下文件：

```text
src/pages/projects/smart-parking.astro
src/scripts/smart-parking-motion.ts
src/pages/projects/index.astro
e2e/smart-parking.spec.ts
e2e/deck-theme.spec.ts
```

`.gitignore`、项目总控指南、集团经营分析在途文件、会员运营文件和 `.superpowers/` 不在本任务提交中。

- [ ] **Step 8: 仅在验收修正产生未提交变更时提交**

Run:

```bash
git status --short -- src/pages/projects/smart-parking.astro src/scripts/smart-parking-motion.ts src/pages/projects/index.astro e2e/smart-parking.spec.ts e2e/deck-theme.spec.ts
```

Expected: 无输出。若视觉或验收修正产生变更，执行：

```bash
git add src/pages/projects/smart-parking.astro src/scripts/smart-parking-motion.ts src/pages/projects/index.astro e2e/smart-parking.spec.ts e2e/deck-theme.spec.ts
git commit -m "test: verify smart parking deck"
```

## 7. 完成定义

计划只有在以下条件全部满足时才算完成：

- `/projects/smart-parking/` 存在并包含 11 个完整场景与 5 章导航。
- 项目首页前四张卡顺序为销售线索、企业权限、集团经营分析、智慧停车；会员运营如果存在，位于智慧停车之后。
- S2 使用经过核验的 3 项真实数据，或使用无数字顾客旅程；绝不出现示例数字。
- XCU 访客直接缴费、MCU 自愿会员权益、五层停车架构、四类权益、双维限制与完整支付生命周期均有稳定语义节点。
- S9 的持续迭代和 S10 的 8/27 版本边界、约 7.57 万月缴费单、19 商场混合版本、新上线商场数据边界、退款无真实订单均准确可见。
- 页面跟随站点深浅色主题；桌面、移动端、减少动态、无脚本和观察器缺失状态均可读。
- 控制器不使用 GSAP 或 ScrollTrigger，卸载后不残留 observer、媒体监听或半隐藏内容。
- `npm run check`、`npm run build`、智慧停车 E2E 和核心 Deck 回归通过。
- 其他项目和用户未提交文件未被修改或暂存。
