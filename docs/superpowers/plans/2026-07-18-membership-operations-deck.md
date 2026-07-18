# Multi-platform Membership Operations Deck Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the fifth public project-experience Deck at `/projects/membership-operations/`, telling a 12-scene story from CRM membership context through identity extension, growth attribution, and bounded risk governance.

**Architecture:** Add one semantic Astro page that owns all copy, CSS-based diagrams, responsive styles, and four-chapter navigation. Add one isolated `IntersectionObserver` controller that only updates scene, chapter, and membership-spine state; the static HTML remains the source of truth and the complete fallback. Extend the existing project listing and Deck theme regression without changing `DeckLayout` or either existing project Deck.

**Tech Stack:** Astro 5, TypeScript, scoped CSS, semantic HTML/CSS diagrams, native `IntersectionObserver`, Playwright.

---

## Planning context and readiness

### Context pack

- **Current task:** Turn the confirmed membership-operations Deck design into an executable implementation plan.
- **Current materials:** `docs/superpowers/specs/2026-07-18-membership-operations-deck-design.md`, `docs/project-experience/00-project-experience-guide.md`, existing enterprise-permissions Deck/page/controller/tests, and current project listing/theme tests.
- **Routing basis:** `真实任务上下文加载规则`, `个人知识库RAG式上下文治理规则`, formal work-domain indexes, plus requirement-document, technical-analysis, and project-retro indexes.
- **Loaded cards:** `PRD审查经验`, `PRD进入原型前交互封口清单`, `高保真原型真实页面基线规则`, `没有胜仗的敏捷会变成消耗`.
- **Excluded domains:** AI runtime and recoverable-task cards were excluded because this Deck contains no model, background job, or server-side state. The old wiki and raw evidence layer were excluded because the confirmed guide and Spec already carry the necessary public facts and boundaries.
- **Risk control:** Preserve `DeckLayout` and existing Deck behavior; keep every public number beside its counting boundary; treat motion as optional enhancement; verify the new page against the existing site theme, mobile layout, and no-JavaScript behavior.

### Spec-readiness verdict: PASS

- **State combinations:** `static`, `observe`, `reduce`, and `fallback` motion modes have defined visibility behavior. Light/dark theme and desktop/mobile behavior are defined.
- **Failure and concurrency:** The feature performs no writes and has no concurrent business state. Script failure, missing `IntersectionObserver`, reduced motion, and Astro page cleanup all have explicit behavior.
- **Enum closure:** The plan uses exactly 12 scenes, four chapters, three semantic color domains, and the exact public status/data wording from the Spec. There are no open-ended business enums.
- **Single source of truth:** Public facts and contribution boundaries come from the confirmed Spec and project guide. Motion state lives in page data attributes; the HTML remains the content truth.

## File map

| File | Responsibility |
| --- | --- |
| `src/pages/projects/membership-operations.astro` | Route, 12 semantic scenes, four-chapter navigation, public copy, CSS/SVG-free CSS diagrams, responsive and reduced-motion styles |
| `src/scripts/membership-operations-motion.ts` | Observer lifecycle, visible scene state, active chapter, active membership-spine node, fallback, cleanup |
| `e2e/membership-operations.spec.ts` | Content boundaries, public metrics, semantics, responsive layout, motion modes, cleanup, accessibility |
| `src/pages/projects/index.astro` | Add the membership-operations project card after the currently implemented cases |
| `e2e/deck-theme.spec.ts` | Add the new Deck route to the shared light/dark theme regression |

Do not modify `src/layouts/DeckLayout.astro`, `src/pages/projects/sales-lead-slm.astro`, `src/pages/projects/enterprise-permissions.astro`, or either existing motion controller.

### Task 1: Build the route and CRM membership opening

**Files:**
- Create: `src/pages/projects/membership-operations.astro`
- Create: `e2e/membership-operations.spec.ts`

- [ ] **Step 1: Write the failing opening tests**

Create `e2e/membership-operations.spec.ts` with:

```ts
import { readFile } from 'node:fs/promises';
import { test, expect } from '@playwright/test';

const route = '/projects/membership-operations/';

test('opening explains why membership is the CRM relationship spine', async ({ page }) => {
  await page.goto(route);

  await expect(page.getByRole('heading', { name: '把分散的平台访客，变成可持续经营的会员关系' })).toBeVisible();
  await expect(page.locator('#s2')).toContainText('CRM 管理的不是一次访问');
  for (const asset of ['会员卡', '积分', '卡券', '消费', '等级', '互动关系']) {
    await expect(page.locator('#s2')).toContainText(asset);
  }
  await expect(page.locator('#s2 [data-member-asset]')).toHaveCount(6);
});

test('background connects channel expansion to fragmented member identity', async ({ page }) => {
  await page.goto(route);
  const scene = page.locator('#s3');

  for (const platform of ['微信', '支付宝', '抖音', '小红书', '快手', '线下二维码']) {
    await expect(scene).toContainText(platform);
  }
  await expect(scene).toContainText('同一顾客会以多个平台访客身份进入系统');
  await expect(scene.locator('[data-platform-entry]')).toHaveCount(6);

  const body = await page.locator('body').innerText();
  expect(body).not.toContain('跨客户识别同一自然人');
  expect(body).not.toContain('876 万独立用户');
});
```

- [ ] **Step 2: Run the opening tests and verify the route is missing**

Run:

```bash
npx playwright test e2e/membership-operations.spec.ts
```

Expected: FAIL because `/projects/membership-operations/` does not exist and the headings/scenes cannot be found.

- [ ] **Step 3: Create the page shell and scenes S1–S3**

Create `src/pages/projects/membership-operations.astro` with:

```astro
---
import DeckLayout from '../../layouts/DeckLayout.astro';

const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
const chapters = [
  { href: '#s1', id: 'member', label: '会员主线' },
  { href: '#s4', id: 'identity', label: '身份扩展' },
  { href: '#s7', id: 'growth', label: '增长闭环' },
  { href: '#s11', id: 'risk', label: '风险治理' },
];
const memberAssets = ['会员卡', '积分', '卡券', '消费', '等级', '互动关系'];
const platformEntries = ['微信', '支付宝', '抖音', '小红书', '快手', '线下二维码'];
---

<DeckLayout
  title="多平台会员运营体系｜QQ星"
  description="在继承会员身份底座后，把平台、触达、归因和风控能力演进成可持续运营的会员关系。"
>
  <main
    id="membership-operations-deck"
    class="membership-operations-deck"
    data-membership-operations-deck
    data-motion-mode="static"
  >
    <section id="s1" data-scene="opening" data-chapter="member">
      <div class="scene-shell hero-shell">
        <p class="eyebrow">Membership Operations</p>
        <h1>把分散的平台访客，变成可持续经营的会员关系</h1>
        <p class="lead">多平台会员运营体系：从身份扩展到增长与风控闭环。</p>
        <div class="scope-tags" aria-label="案例范围">
          <span>多平台身份</span><span>会员运营</span><span>异常治理</span>
        </div>
        <p class="memory-line">身份不是终点，它让每次触达、交易与处置回到同一条会员主线。</p>
      </div>
    </section>

    <section id="s2" data-scene="crm-context" data-chapter="member">
      <div class="scene-shell split-shell">
        <div>
          <p class="eyebrow">Why Membership Matters</p>
          <h2>CRM 管理的不是一次访问，而是一段持续累积的会员关系</h2>
          <p class="lead-copy">只有把同一会员在不同时间、平台和业务中的行为持续连接起来，运营与服务才能拥有上下文。</p>
        </div>
        <div class="member-spine-figure" data-motion-item role="img" aria-label="会员关系连接会员卡、积分、卡券、消费、等级和互动关系">
          <strong>持续的会员关系</strong>
          <div class="asset-orbit">
            {memberAssets.map((asset) => <span data-member-asset>{asset}</span>)}
          </div>
        </div>
      </div>
    </section>

    <section id="s3" data-scene="platform-fragmentation" data-chapter="member">
      <div class="scene-shell">
        <p class="eyebrow">The Business Context</p>
        <h2>业务扩张，把同一会员拆成多个平台访客</h2>
        <p class="lead-copy">平台从微信、支付宝扩展到内容平台、交易平台和线下点位；同一顾客会以多个平台访客身份进入系统，身份、触达、交易和来源随之断开。</p>
        <div class="platform-flow" data-motion-item role="img" aria-label="六类平台入口汇入待连接的会员关系">
          <div class="platform-cloud">
            {platformEntries.map((platform) => <span data-platform-entry>{platform}</span>)}
          </div>
          <span class="flow-arrow" aria-hidden="true">→</span>
          <div class="fragmented-member"><strong>同一顾客</strong><span>多个访客身份</span></div>
        </div>
        <p class="principle">先认清客户主体下的会员关系，后续运营才不是一组彼此断开的动作。</p>
      </div>
    </section>
  </main>
</DeckLayout>

<style>
  .membership-operations-deck {
    --mo-identity: var(--c-blue);
    --mo-decision: var(--c-violet);
    --mo-growth: #22c55e;
    --mo-risk: #f97316;
    --mo-blocked: var(--c-problem);
  }
  .membership-operations-deck section { width: 100%; }
  .scene-shell { width: min(1120px, 100%); margin-inline: auto; }
  .hero-shell { text-align: center; }
  .eyebrow { color: var(--mo-identity); font-size: .78rem; font-weight: 800; letter-spacing: .16em; margin-bottom: .75rem; text-transform: uppercase; }
  .lead, .lead-copy { color: var(--text-dim); line-height: 1.8; }
  .lead { max-width: 760px; margin: 1rem auto 0; font-size: clamp(1rem, 1.7vw, 1.25rem); }
  .memory-line, .principle { color: var(--text); font-size: clamp(1.05rem, 1.8vw, 1.35rem); font-weight: 750; line-height: 1.6; margin-top: 1.25rem; }
  .split-shell { display: grid; grid-template-columns: minmax(280px, .9fr) minmax(360px, 1.1fr); gap: clamp(1.25rem, 4vw, 3.5rem); align-items: center; }
  .scope-tags, .asset-orbit, .platform-cloud { display: flex; flex-wrap: wrap; justify-content: center; gap: .55rem; }
  .scope-tags { margin-top: 1.3rem; }
  .scope-tags span, .asset-orbit span, .platform-cloud span { border: 1px solid var(--glass-border); border-radius: 999px; padding: .45rem .7rem; color: var(--text-dim); }
  .member-spine-figure, .platform-flow { border: 1px solid var(--glass-border); border-radius: 1.2rem; background: var(--glass); padding: 1.2rem; }
  .member-spine-figure { display: grid; gap: 1rem; text-align: center; }
  .member-spine-figure strong { color: var(--mo-identity); }
  .platform-flow { display: grid; grid-template-columns: 1fr auto minmax(8rem, .4fr); gap: 1rem; align-items: center; margin-top: 1.3rem; }
  .flow-arrow { color: var(--mo-decision); font-size: 1.5rem; font-weight: 850; }
  .fragmented-member { display: grid; gap: .3rem; text-align: center; }
  .fragmented-member span { color: var(--text-dim); }
  @media (max-width: 860px) {
    .membership-operations-deck { scroll-snap-type: y proximity; }
    .membership-operations-deck section { height: auto; min-height: 100vh; padding-inline: 1rem; }
    .split-shell, .platform-flow { grid-template-columns: 1fr; }
    .flow-arrow { rotate: 90deg; justify-self: center; }
  }
</style>
```

- [ ] **Step 4: Run the opening tests**

Run:

```bash
npx playwright test e2e/membership-operations.spec.ts
```

Expected: 2 tests PASS.

- [ ] **Step 5: Commit the opening chapter**

```bash
git add src/pages/projects/membership-operations.astro e2e/membership-operations.spec.ts
git commit -m "feat: establish membership deck context"
```

### Task 2: Add the inherited identity model and two product decisions

**Files:**
- Modify: `src/pages/projects/membership-operations.astro`
- Modify: `e2e/membership-operations.spec.ts`

- [ ] **Step 1: Append failing identity-boundary tests**

Append to `e2e/membership-operations.spec.ts`:

```ts
test('identity chapter preserves inherited model and asset boundaries', async ({ page }) => {
  await page.goto(route);

  const foundation = page.locator('#s4');
  await expect(foundation).toContainText('原始微信 / 支付宝模型由其他产品经理规划');
  for (const entity of ['MCU', 'ECU', 'XCU']) {
    await expect(foundation.locator(`[data-identity-entity="${entity.toLowerCase()}"]`)).toHaveCount(1);
  }
  await expect(foundation.locator('[data-contribution-boundary]')).toContainText('多平台接入、券主 MCU、会员触达、渠道归因和异常治理');
  await expect(foundation.locator('[data-contribution-boundary]')).toContainText('研发团队负责工程实现');

  const rebind = page.locator('#s5');
  await expect(rebind.locator('[data-rebind="xcu"]')).toContainText('当前平台身份迁移');
  await expect(rebind.locator('[data-assets="preserved"]')).toContainText('积分、卡券、消费和等级保持不动');
  await expect(rebind).toContainText('重绑定不等于会员资产合并');

  const body = await page.locator('body').innerText();
  expect(body).not.toContain('原始身份模型由我从零设计');
  expect(body).not.toContain('自动识别同一自然人');
});

test('voucher-owner MCU keeps transactions running and exposes the debt', async ({ page }) => {
  await page.goto(route);
  const scene = page.locator('#s6');

  await expect(scene.locator('[data-voucher-path="reuse"]')).toContainText('优先复用真实 MCU');
  await expect(scene.locator('[data-voucher-path="fallback"]')).toContainText('实例化券主 MCU');
  await expect(scene).toContainText('订单、投放记录和核销继续运行');
  await expect(scene.locator('[data-identity-debt]')).toContainText('可能长期并存');
  await expect(scene.locator('[data-identity-debt]')).toContainText('不能可靠自动合并');
});
```

- [ ] **Step 2: Run only the identity tests and verify they fail**

Run:

```bash
npx playwright test e2e/membership-operations.spec.ts -g "identity|voucher-owner"
```

Expected: 2 tests FAIL because S4–S6 do not exist.

- [ ] **Step 3: Add scenes S4–S6 before `</main>`**

Insert this markup after S3 and before `</main>`:

```astro
    <section id="s4" data-scene="identity-foundation" data-chapter="identity">
      <div class="scene-shell">
        <p class="eyebrow">Inherited Foundation</p>
        <h2>继承身份底座，在清楚的贡献边界上继续扩展</h2>
        <p class="lead-copy">原始微信 / 支付宝模型由其他产品经理规划；我的工作从理解、吸收并扩展这套关系开始。</p>
        <p class="contribution-boundary" data-contribution-boundary><strong>本人主导范围</strong><span>多平台接入、券主 MCU、会员触达、渠道归因和异常治理的业务建模、方案设计与上线推动；研发团队负责工程实现。</span></p>
        <div class="identity-model" data-motion-item role="img" aria-label="XCU 通过 ECU 关联客户主体下的 MCU">
          <article data-identity-entity="xcu"><span>平台访客</span><strong>XCU</strong><p>顾客在某一小程序平台中的访客身份</p></article>
          <span class="model-link">→</span>
          <article data-identity-entity="ecu"><span>关系层</span><strong>ECU</strong><p>连接 MCU 与不同平台 XCU 的当前归属</p></article>
          <span class="model-link">→</span>
          <article data-identity-entity="mcu"><span>会员主体</span><strong>MCU</strong><p>承载会员卡、积分、卡券、消费和等级资产</p></article>
        </div>
        <p class="principle">继承的不是一组缩写，而是一条需要继续尊重的会员资产边界。</p>
      </div>
    </section>

    <section id="s5" data-scene="identity-rebind" data-chapter="identity">
      <div class="scene-shell split-shell">
        <div>
          <p class="eyebrow">Decision 01 · Rebinding</p>
          <h2>迁移当前平台身份，但不合并旧会员资产</h2>
          <p class="lead-copy">同一 XCU 使用新手机号合法开卡并命中 MCU-B 后，相关平台身份迁移到 ECU-B；MCU-A 及其历史资产继续保留。</p>
          <p class="principle">重绑定不等于会员资产合并。</p>
        </div>
        <div class="rebind-figure" role="img" aria-label="当前平台身份从 ECU-A 重绑定到 ECU-B，MCU-A 资产保持不动">
          <div class="rebind-before" data-motion-item><span>XCU</span><span>ECU-A</span><span>MCU-A</span></div>
          <div class="rebind-action" data-rebind="xcu" data-motion-item><strong>当前平台身份迁移</strong><span>XCU → ECU-B → MCU-B</span></div>
          <div class="asset-boundary" data-assets="preserved" data-motion-item><strong>MCU-A 不迁移</strong><span>积分、卡券、消费和等级保持不动</span></div>
        </div>
      </div>
    </section>

    <section id="s6" data-scene="voucher-owner" data-chapter="identity">
      <div class="scene-shell">
        <p class="eyebrow">Decision 02 · Business Continuity</p>
        <h2>上游没有手机号时，先让交易链路继续运行</h2>
        <p class="lead-copy">部分外部平台订单只返回平台会员标识。系统先查找已有身份；无法找到时，再用券主 MCU 兜底。</p>
        <div class="voucher-paths" data-motion-item role="group" aria-label="有真实会员时复用 MCU，无手机号且无法关联时创建券主 MCU">
          <article data-voucher-path="reuse"><span>能够关联</span><strong>优先复用真实 MCU</strong><p>XCU / ECU 已经找到客户主体下的会员。</p></article>
          <article data-voucher-path="fallback"><span>无法关联</span><strong>实例化券主 MCU</strong><p>使用平台会员标识，让订单、投放记录和核销继续运行。</p></article>
        </div>
        <div class="debt-note" data-identity-debt><strong>真实边界</strong><span>券主 MCU 与真实 MCU 可能长期并存，不能可靠自动合并。</span></div>
      </div>
    </section>
```

- [ ] **Step 4: Run the identity tests**

Run:

```bash
npx playwright test e2e/membership-operations.spec.ts -g "identity|voucher-owner"
```

Expected: 2 tests PASS.

- [ ] **Step 5: Run all current membership tests**

Run:

```bash
npx playwright test e2e/membership-operations.spec.ts
```

Expected: 4 tests PASS.

- [ ] **Step 6: Commit the identity chapter**

```bash
git add src/pages/projects/membership-operations.astro e2e/membership-operations.spec.ts
git commit -m "feat: explain membership identity decisions"
```

### Task 3: Add reusable growth infrastructure, attribution, and bounded results

**Files:**
- Modify: `src/pages/projects/membership-operations.astro`
- Modify: `e2e/membership-operations.spec.ts`

- [ ] **Step 1: Append failing growth and metric tests**

Append to `e2e/membership-operations.spec.ts`:

```ts
test('growth chapter connects reusable infrastructure to touch and attribution', async ({ page }) => {
  await page.goto(route);

  const foundation = page.locator('#s7');
  for (const capability of ['customer-list', 'audience-filter', 'audience-pack', 'sms-service']) {
    await expect(foundation.locator(`[data-foundation="${capability}"]`)).toHaveCount(1);
  }

  const touch = page.locator('#s8');
  await expect(touch.locator('[data-touch-step]')).toHaveCount(6);
  for (const label of ['筛选人群', '创建计划', '内容与额度审核', '发送短信', '点击短链', '访问小程序']) {
    await expect(touch).toContainText(label);
  }

  const attribution = page.locator('#s9');
  await expect(attribution.locator('[data-channel="short-link"]')).toContainText('线上短链');
  await expect(attribution.locator('[data-channel="qr"]')).toContainText('线下二维码');
  await expect(attribution.locator('[data-loop="growth"]')).toHaveCount(1);
  await expect(attribution).toContainText('短链点击与小程序访问使用同一页面访问日志');
  for (const behavior of ['开卡', '领券', '核销', '下单']) {
    await expect(attribution).toContainText(behavior);
  }
  await expect(attribution).toContainText('完整链路不等于增量因果');
});

test('result scene binds every number to its counting boundary', async ({ page }) => {
  await page.goto(route);
  const scene = page.locator('#s10');

  await expect(scene.locator('[data-metric="mcu-records"]')).toContainText('约 876 万条');
  await expect(scene.locator('[data-metric="mcu-records"]')).toContainText('记录数，不是独立自然人数');
  await expect(scene.locator('[data-metric="annual-new-members"]')).toContainText('约 11.37 万');
  await expect(scene.locator('[data-metric="post-signup-reach"]')).toContainText('约 10.08 万');
  await expect(scene.locator('[data-metric="reach-rate"]')).toContainText('约 88.7%');
  await expect(scene).toContainText('开卡后触达覆盖率');
  await expect(scene.locator('[data-status="launched"]')).toContainText('核心能力均已正式上线');

  const body = await page.locator('body').innerText();
  expect(body).not.toContain('短信带来 11.37 万人开卡');
  expect(body).not.toContain('营销计划直接带来 7,296 万元销售额');
  expect(body).not.toContain('最大单一客户约 271 万');
});
```

- [ ] **Step 2: Run the growth tests and verify they fail**

Run:

```bash
npx playwright test e2e/membership-operations.spec.ts -g "growth|result scene"
```

Expected: 2 tests FAIL because S7–S10 do not exist.

- [ ] **Step 3: Add scenes S7–S10 before `</main>`**

Insert after S6 and before `</main>`:

```astro
    <section id="s7" data-scene="growth-foundation" data-chapter="growth">
      <div class="scene-shell">
        <p class="eyebrow">Reusable Foundation</p>
        <h2>认清会员之后，运营能力才能被多个业务复用</h2>
        <div class="foundation-grid" data-motion-item>
          <article data-foundation="customer-list"><strong>顾客列表</strong><p>汇总会员资料、平台访问、开卡、积分、卡券和订单。</p></article>
          <article data-foundation="audience-filter"><strong>人群筛选器</strong><p>按会员属性与业务行为定义目标范围。</p></article>
          <article data-foundation="audience-pack"><strong>定向人群包</strong><p>让不同业务模块复用同一批会员范围。</p></article>
          <article data-foundation="sms-service"><strong>公共短信服务</strong><p>统一模板、计划、执行记录和回调，避免重复建设。</p></article>
        </div>
        <p class="principle">公共能力只建设一次，后续运营链路围绕同一会员关系展开。</p>
      </div>
    </section>

    <section id="s8" data-scene="touch-flow" data-chapter="growth">
      <div class="scene-shell scene-shell-wide">
        <p class="eyebrow">Auditable Outreach</p>
        <h2>不是“发一条短信”，而是一条可审核、可执行、可追踪的触达链路</h2>
        <div class="touch-flow" role="list" aria-label="从筛选人群到访问小程序的六步触达链路">
          <span data-touch-step data-motion-item role="listitem">筛选人群</span>
          <span data-touch-step data-motion-item role="listitem">创建计划</span>
          <span data-touch-step data-motion-item role="listitem">内容与额度审核</span>
          <span data-touch-step data-motion-item role="listitem">发送短信</span>
          <span data-touch-step data-motion-item role="listitem">点击短链</span>
          <span data-touch-step data-motion-item role="listitem">访问小程序</span>
        </div>
        <div class="touch-boundaries">
          <p><strong>审核责任</strong><span>审核员可指定成员，也可按角色动态匹配。</span></p>
          <p><strong>上下文参数</strong><span>短链携带商场、目标页面和推广渠道。</span></p>
        </div>
      </div>
    </section>

    <section id="s9" data-scene="channel-attribution" data-chapter="growth">
      <div class="scene-shell">
        <p class="eyebrow">Attribution Loop</p>
        <h2>线上短链与线下二维码，回到同一条会员行为主线</h2>
        <div class="channel-sources" data-motion-item>
          <article data-channel="short-link"><span>线上</span><strong>线上短链</strong><p>短信响应继续携带推广渠道和目标页面。</p></article>
          <article data-channel="qr"><span>线下</span><strong>线下二维码</strong><p>停车场、电梯、门店与具体点位形成渠道明细。</p></article>
        </div>
        <p class="lead-copy">短链点击与小程序访问使用同一页面访问日志，日志继续携带推广渠道。</p>
        <div class="attribution-flow" data-loop="growth" role="img" aria-label="渠道入口关联小程序访问、开卡、领券、核销和下单">
          <span>推广渠道</span><b>→</b><span>小程序访问</span><b>→</b><span>开卡</span><span>领券</span><span>核销</span><span>下单</span><b>→</b><span>MCU 串联行为</span>
        </div>
        <p class="boundary-note">完整链路不等于增量因果；活动效果仍取决于活动设计和对照口径。</p>
      </div>
    </section>

    <section id="s10" data-scene="running-evidence" data-chapter="growth">
      <div class="scene-shell">
        <p class="eyebrow">Evidence of Use</p>
        <h2>用采用规模与开卡后触达覆盖，证明体系真实运行</h2>
        <p class="status-line" data-status="launched">核心能力均已正式上线</p>
        <div class="result-grid" data-motion-item>
          <article data-metric="mcu-records"><strong>约 876 万条</strong><span>平台管理的 MCU</span><small>客户主体下的记录数，不是独立自然人数</small></article>
          <article data-metric="annual-new-members"><strong>约 11.37 万</strong><span>匿名客户一年新增开卡会员</span><small>先开卡，再进入后续触达计划</small></article>
          <article data-metric="post-signup-reach"><strong>约 10.08 万</strong><span>开卡后营销计划成功发送</span><small>实际发送成功人数</small></article>
          <article data-metric="reach-rate"><strong>约 88.7%</strong><span>开卡后触达覆盖率</span><small>不是拉新转化率</small></article>
        </div>
        <p class="boundary-note">年度积分与销售数据只说明体系承载规模，不作为营销计划的增量结果。</p>
      </div>
    </section>
```

- [ ] **Step 4: Run the growth tests**

Run:

```bash
npx playwright test e2e/membership-operations.spec.ts -g "growth|result scene"
```

Expected: 2 tests PASS.

- [ ] **Step 5: Run all current membership tests**

Run:

```bash
npx playwright test e2e/membership-operations.spec.ts
```

Expected: 6 tests PASS.

- [ ] **Step 6: Commit the growth chapter**

```bash
git add src/pages/projects/membership-operations.astro e2e/membership-operations.spec.ts
git commit -m "feat: connect membership growth and attribution"
```

### Task 4: Add risk escalation, bounded governance, and four-chapter navigation

**Files:**
- Modify: `src/pages/projects/membership-operations.astro`
- Modify: `e2e/membership-operations.spec.ts`

- [ ] **Step 1: Append failing governance and structure tests**

Append to `e2e/membership-operations.spec.ts`:

```ts
test('risk escalation leads to a bounded governance loop', async ({ page }) => {
  await page.goto(route);

  const escalation = page.locator('#s11');
  await expect(escalation.locator('[data-risk-stage]')).toHaveCount(4);
  for (const stage of ['本店员工刷单', '本店员工订单不产生积分', '跨店互刷与黄牛刷单', '单一身份硬规则失效']) {
    await expect(escalation).toContainText(stage);
  }

  const governance = page.locator('#s12');
  await expect(governance.locator('[data-governance-step]')).toHaveCount(4);
  for (const step of ['可配置预警', '人工核查', '白名单 / 禁用', '有限权益限制']) {
    await expect(governance).toContainText(step);
  }
  for (const scope of ['全部门店', '分类', '楼层', '标签', '业态', '指定门店']) {
    await expect(governance).toContainText(scope);
  }
  await expect(governance).toContainText('每日计算异常会员及触发订单');
  await expect(governance).toContainText('通知运营人员');
  await expect(governance.locator('[data-loop="governance"]')).toHaveCount(1);
  await expect(governance).toContainText('禁止会员升级和积分消耗');
  await expect(governance).toContainText('仍允许获取积分、自然降级和领取免费券');

  const body = await page.locator('body').innerText();
  expect(body).not.toContain('具体风控阈值');
  expect(body).not.toContain('真实异常会员名单');
});

test('deck exposes twelve scenes and four usable chapter links', async ({ page }) => {
  await page.goto(route);
  await expect(page.locator('section[data-scene]')).toHaveCount(12);

  const nav = page.getByRole('navigation', { name: '多平台会员运营体系案例章节' });
  for (const label of ['会员主线', '身份扩展', '增长闭环', '风险治理']) {
    await expect(nav.getByRole('link', { name: label })).toBeVisible();
  }
  await expect(page.getByRole('link', { name: '返回项目经历' })).toHaveAttribute('href', '/projects/');
});
```

- [ ] **Step 2: Run the new tests and verify they fail**

Run:

```bash
npx playwright test e2e/membership-operations.spec.ts -g "risk escalation|twelve scenes"
```

Expected: 2 tests FAIL because S11–S12 and the chapter navigation do not exist.

- [ ] **Step 3: Add S11–S12 and the chapter navigation**

Insert after S10 and before `</main>`:

```astro
    <section id="s11" data-scene="risk-escalation" data-chapter="risk">
      <div class="scene-shell">
        <p class="eyebrow">Real-world Adversaries</p>
        <h2>增长系统进入真实业务后，身份硬规则开始被绕过</h2>
        <div class="risk-chain" role="list" aria-label="异常消费从本店刷单演变到跨店互刷">
          <article data-risk-stage data-motion-item role="listitem"><span>01</span><strong>本店员工刷单</strong><p>在本店制造消费，获取积分和会员等级。</p></article>
          <article data-risk-stage data-motion-item role="listitem"><span>02</span><strong>本店员工订单不产生积分</strong><p>用员工身份规则限制最直接的刷单。</p></article>
          <article data-risk-stage data-motion-item role="listitem"><span>03</span><strong>跨店互刷与黄牛刷单</strong><p>行为转向其他门店，静态身份标签被绕过。</p></article>
          <article data-risk-stage data-motion-item role="listitem"><span>04</span><strong>单一身份硬规则失效</strong><p>问题必须从“封禁某类人”升级为异常行为治理。</p></article>
        </div>
        <p class="principle">规则写得更多，不代表系统更懂正在变化的风险。</p>
      </div>
    </section>

    <section id="s12" data-scene="governance-loop" data-chapter="risk">
      <div class="scene-shell conclusion-shell">
        <p class="eyebrow">The Product Decision</p>
        <h2>把封禁升级为可发现、可核查、可纠错、可处置的治理闭环</h2>
        <div class="governance-loop" data-loop="governance" data-motion-item role="list" aria-label="异常会员预警、核查、纠错和有限处置闭环">
          <article data-governance-step role="listitem"><strong>可配置预警</strong><p>按全部门店、分类、楼层、标签、业态或指定门店配置范围，识别单笔、单店累计和跨店累计异常。</p></article>
          <article data-governance-step role="listitem"><strong>人工核查</strong><p>系统每日计算异常会员及触发订单，记录异常原因并通知运营人员核查。</p></article>
          <article data-governance-step role="listitem"><strong>白名单 / 禁用</strong><p>正常高频消费者进入白名单，确认风险的会员进入禁用。</p></article>
          <article data-governance-step role="listitem"><strong>有限权益限制</strong><p>禁止会员升级和积分消耗；仍允许获取积分、自然降级和领取免费券。</p></article>
        </div>
        <p class="memory-line">身份不是终点，它让每次触达、响应、交易和处置回到同一条会员业务主线。</p>
        <a class="back-projects" href={`${base}projects/`}>返回项目经历</a>
      </div>
    </section>
```

Add this navigation immediately after `</main>` and still inside `DeckLayout`:

```astro
  <nav class="membership-operations-nav" aria-label="多平台会员运营体系案例章节">
    {chapters.map((chapter, index) => (
      <a
        href={chapter.href}
        class:list={{ active: index === 0 }}
        data-chapter-link={chapter.id}
        aria-current={index === 0 ? 'true' : undefined}
      >
        <span class="nav-dot"></span><span>{chapter.label}</span>
      </a>
    ))}
  </nav>
```

- [ ] **Step 4: Run the governance and structure tests**

Run:

```bash
npx playwright test e2e/membership-operations.spec.ts -g "risk escalation|twelve scenes"
```

Expected: 2 tests PASS.

- [ ] **Step 5: Run the complete content suite**

Run:

```bash
npx playwright test e2e/membership-operations.spec.ts
```

Expected: 8 tests PASS.

- [ ] **Step 6: Commit the completed semantic narrative**

```bash
git add src/pages/projects/membership-operations.astro e2e/membership-operations.spec.ts
git commit -m "feat: complete membership governance narrative"
```

### Task 5: Apply the membership-spine visual system and responsive layout

**Files:**
- Modify: `src/pages/projects/membership-operations.astro`
- Modify: `e2e/membership-operations.spec.ts`

- [ ] **Step 1: Append failing visual, responsive, and static-mode tests**

Append to `e2e/membership-operations.spec.ts`:

```ts
test('membership spine and diagrams use explicit semantic labels', async ({ page }) => {
  await page.goto(route);

  await expect(page.locator('[data-member-node]')).toHaveCount(4);
  await expect(page.locator('[data-member-node="member"]')).toContainText('会员主线');
  await expect(page.locator('[data-member-node="identity"]')).toContainText('身份扩展');
  await expect(page.locator('[data-member-node="growth"]')).toContainText('增长闭环');
  await expect(page.locator('[data-member-node="risk"]')).toContainText('风险治理');
  await expect(page.locator('[data-loop="growth"]')).toHaveCount(1);
  await expect(page.locator('[data-loop="governance"]')).toHaveCount(1);
  await expect(page.locator('img')).toHaveCount(0);
  await expect(page.locator('[role="img"]')).toHaveCount(5);
});

test('desktop keeps DeckLayout snap and mobile preserves all twelve scenes without overflow', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(route);
  expect(await page.locator('[data-membership-operations-deck]').evaluate((element) => getComputedStyle(element).scrollSnapType)).toContain('y');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)).toBe(false);
  const ids = await page.locator('section[data-scene]').evaluateAll((sections) => sections.map((section) => section.id));
  expect(ids).toEqual(['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11', 's12']);
  await expect(page.locator('#s12 [data-governance-step]')).toHaveCount(4);
});

test('static mode keeps the complete story readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(route);

  await expect(page.locator('[data-membership-operations-deck]')).toHaveAttribute('data-motion-mode', 'static');
  await expect(page.locator('section[data-scene]')).toHaveCount(12);
  await page.locator('#s12').scrollIntoViewIfNeeded();
  await expect(page.locator('#s12')).toBeVisible();
  await expect(page.locator('#s12')).toContainText('身份不是终点');
  await context.close();
});
```

- [ ] **Step 2: Run the new visual tests and verify the missing spine**

Run:

```bash
npx playwright test e2e/membership-operations.spec.ts -g "membership spine|desktop keeps|static mode"
```

Expected: the membership-spine test FAILS because `[data-member-node]` does not exist. The responsive/static tests may pass partially.

- [ ] **Step 3: Add the four-node membership spine**

Inside `<main>`, immediately before S1, add:

```astro
    <aside class="member-progress" aria-hidden="true">
      <span data-member-node="member"><i></i><b>会员主线</b></span>
      <span data-member-node="identity"><i></i><b>身份扩展</b></span>
      <span data-member-node="growth"><i></i><b>增长闭环</b></span>
      <span data-member-node="risk"><i></i><b>风险治理</b></span>
    </aside>
```

Add `data-active-member-node="member"` to the root `<main>` so the static and no-JavaScript state has a defined starting node:

```astro
  <main
    id="membership-operations-deck"
    class="membership-operations-deck"
    data-membership-operations-deck
    data-motion-mode="static"
    data-active-member-node="member"
  >
```

- [ ] **Step 4: Replace the page `<style>` block with the complete visual system**

Replace the existing `<style>` block with:

```astro
<style>
  .membership-operations-deck {
    --mo-identity: var(--c-blue);
    --mo-decision: var(--c-violet);
    --mo-growth: #22c55e;
    --mo-risk: #f97316;
    --mo-blocked: var(--c-problem);
    --mo-surface: color-mix(in srgb, var(--glass) 90%, transparent);
    --mo-line: color-mix(in srgb, var(--mo-identity) 35%, var(--glass-border));
  }

  .membership-operations-deck section { width: 100%; }
  .scene-shell { width: min(1120px, 100%); margin-inline: auto; }
  .scene-shell-wide { width: min(1240px, 100%); }
  .hero-shell, .conclusion-shell { text-align: center; }
  .eyebrow { color: var(--mo-identity); font-size: .78rem; font-weight: 800; letter-spacing: .16em; margin-bottom: .75rem; text-transform: uppercase; }
  .lead, .lead-copy, .boundary-note { color: var(--text-dim); line-height: 1.8; }
  .lead { max-width: 760px; margin: 1rem auto 0; font-size: clamp(1rem, 1.7vw, 1.25rem); }
  .memory-line, .principle { color: var(--text); font-size: clamp(1.05rem, 1.8vw, 1.35rem); font-weight: 750; line-height: 1.6; margin-top: 1.25rem; }
  .split-shell { display: grid; grid-template-columns: minmax(280px, .9fr) minmax(360px, 1.1fr); gap: clamp(1.25rem, 4vw, 3.5rem); align-items: center; }
  .contribution-boundary { display: grid; grid-template-columns: auto 1fr; gap: .75rem; border-left: 3px solid var(--mo-decision); background: var(--mo-surface); color: var(--text-dim); line-height: 1.6; margin-top: 1rem; padding: .75rem .9rem; }
  .contribution-boundary strong { color: var(--text); }
  .status-line { width: fit-content; margin: 0 auto; border: 1px solid color-mix(in srgb, var(--mo-growth) 55%, var(--glass-border)); border-radius: 999px; color: var(--mo-growth); padding: .35rem .7rem; }

  .member-progress {
    position: fixed; z-index: 12; left: 1rem; top: 50%; translate: 0 -50%;
    display: grid; gap: .55rem; border: 1px solid var(--glass-border); border-radius: 1rem;
    background: var(--chrome-bg); padding: .65rem .55rem; backdrop-filter: blur(16px);
  }
  .member-progress::before { content: ""; position: absolute; left: .82rem; top: 1rem; bottom: 1rem; width: 1px; background: var(--timeline-line); }
  .member-progress span { position: relative; display: flex; gap: .45rem; align-items: center; color: var(--text-dim); }
  .member-progress i { position: relative; z-index: 1; width: .55rem; height: .55rem; border: 1px solid currentColor; border-radius: 50%; background: var(--chrome-bg); }
  .member-progress b { font-size: .68rem; font-weight: 700; white-space: nowrap; }
  [data-active-member-node='member'] [data-member-node='member'],
  [data-active-member-node='identity'] [data-member-node='identity'],
  [data-active-member-node='growth'] [data-member-node='growth'],
  [data-active-member-node='risk'] [data-member-node='risk'] { color: var(--text); }
  [data-active-member-node='member'] [data-member-node='member'] i { background: var(--mo-identity); }
  [data-active-member-node='identity'] [data-member-node='identity'] i { background: var(--mo-decision); }
  [data-active-member-node='growth'] [data-member-node='growth'] i { background: var(--mo-growth); }
  [data-active-member-node='risk'] [data-member-node='risk'] i { background: var(--mo-risk); }

  .scope-tags, .asset-orbit, .platform-cloud, .attribution-flow { display: flex; flex-wrap: wrap; justify-content: center; gap: .55rem; }
  .scope-tags { margin-top: 1.3rem; }
  .scope-tags span, .asset-orbit span, .platform-cloud span, .attribution-flow span {
    border: 1px solid var(--glass-border); border-radius: 999px; padding: .45rem .7rem; color: var(--text-dim);
  }
  .member-spine-figure, .platform-flow, .rebind-figure, .debt-note, .touch-boundaries p, .attribution-flow {
    border: 1px solid var(--glass-border); border-radius: 1.2rem; background: var(--mo-surface); padding: 1.2rem;
  }
  .member-spine-figure { display: grid; gap: 1rem; text-align: center; }
  .member-spine-figure strong { color: var(--mo-identity); }
  .asset-orbit span { border-color: color-mix(in srgb, var(--mo-identity) 42%, var(--glass-border)); }
  .platform-flow { display: grid; grid-template-columns: 1fr auto minmax(8rem, .4fr); gap: 1rem; align-items: center; margin-top: 1.3rem; }
  .flow-arrow, .model-link, .attribution-flow b { color: var(--mo-decision); font-size: 1.35rem; font-weight: 850; }
  .fragmented-member { display: grid; gap: .3rem; text-align: center; }
  .fragmented-member span { color: var(--text-dim); }

  .identity-model { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; gap: .7rem; align-items: stretch; margin-top: 1.25rem; }
  .identity-model article, .voucher-paths article, .foundation-grid article, .channel-sources article, .result-grid article, .risk-chain article, .governance-loop article {
    border: 1px solid var(--glass-border); border-radius: 1rem; background: var(--mo-surface); padding: 1rem;
  }
  .identity-model article { display: grid; gap: .35rem; align-content: center; text-align: center; }
  .identity-model article span, .voucher-paths article > span, .channel-sources article > span { color: var(--mo-decision); font-size: .72rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
  .identity-model article strong { color: var(--mo-identity); font-size: 1.35rem; }
  .identity-model p, .voucher-paths p, .foundation-grid p, .channel-sources p, .risk-chain p, .governance-loop p { color: var(--text-dim); line-height: 1.6; }

  .rebind-figure { display: grid; gap: .8rem; }
  .rebind-before { display: grid; grid-template-columns: repeat(3, 1fr); gap: .45rem; }
  .rebind-before span { border: 1px solid var(--glass-border); border-radius: .7rem; padding: .55rem; text-align: center; }
  .rebind-action, .asset-boundary { display: grid; gap: .3rem; border-left: 3px solid var(--mo-decision); padding: .7rem .8rem; }
  .rebind-action span, .asset-boundary span { color: var(--text-dim); }
  .asset-boundary { border-left-color: var(--mo-blocked); }
  .voucher-paths { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; margin-top: 1.25rem; }
  .voucher-paths article { border-color: color-mix(in srgb, var(--mo-decision) 48%, var(--glass-border)); }
  .debt-note { display: grid; grid-template-columns: auto 1fr; gap: .75rem; margin-top: 1rem; border-style: dashed; }
  .debt-note strong { color: var(--mo-blocked); }
  .debt-note span { color: var(--text-dim); }

  .foundation-grid, .channel-sources, .result-grid, .risk-chain, .governance-loop { display: grid; gap: 1rem; margin-top: 1.25rem; }
  .foundation-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .foundation-grid article { border-color: color-mix(in srgb, var(--mo-growth) 46%, var(--glass-border)); }
  .foundation-grid strong, .channel-sources strong { display: block; margin-bottom: .35rem; }
  .touch-flow { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: .6rem; margin-top: 1.3rem; }
  .touch-flow span { position: relative; display: grid; place-items: center; min-height: 5rem; border: 1px solid color-mix(in srgb, var(--mo-growth) 50%, var(--glass-border)); border-radius: .9rem; background: color-mix(in srgb, var(--mo-growth) 8%, var(--mo-surface)); padding: .65rem; text-align: center; }
  .touch-flow span:not(:last-child)::after { content: "→"; position: absolute; right: -.55rem; color: var(--mo-growth); }
  .touch-boundaries { display: grid; grid-template-columns: repeat(2, 1fr); gap: .8rem; margin-top: 1rem; }
  .touch-boundaries p { display: grid; gap: .25rem; }
  .touch-boundaries span { color: var(--text-dim); }
  .channel-sources { grid-template-columns: repeat(2, 1fr); }
  .channel-sources article { border-color: color-mix(in srgb, var(--mo-growth) 48%, var(--glass-border)); }
  .attribution-flow { align-items: center; margin-top: 1rem; }
  .attribution-flow span:last-child { color: var(--text); border-color: var(--mo-growth); }
  [data-loop] { border-radius: 1.2rem; box-shadow: inset 0 0 0 1px color-mix(in srgb, currentColor 20%, transparent); }
  [data-loop='growth'] { color: var(--mo-growth); }
  [data-loop='governance'] { color: var(--mo-risk); padding: 1rem; }
  .result-grid { grid-template-columns: repeat(4, 1fr); }
  .result-grid article { display: grid; gap: .35rem; text-align: center; }
  .result-grid strong { color: var(--mo-growth); font-size: clamp(1.35rem, 2.6vw, 2.1rem); }
  .result-grid span { color: var(--text); }
  .result-grid small { color: var(--text-dim); line-height: 1.5; }

  .risk-chain, .governance-loop { grid-template-columns: repeat(4, 1fr); }
  .risk-chain article, .governance-loop article { border-color: color-mix(in srgb, var(--mo-risk) 50%, var(--glass-border)); }
  .risk-chain article > span { color: var(--mo-risk); font-size: .75rem; font-weight: 850; }
  .risk-chain strong, .governance-loop strong { display: block; margin: .35rem 0; }
  .governance-loop article:last-child { border-color: color-mix(in srgb, var(--mo-decision) 55%, var(--glass-border)); }
  .conclusion-shell .memory-line { max-width: 820px; margin-inline: auto; margin-top: 1.4rem; }

  .back-projects { display: inline-flex; margin-top: 1.4rem; border: 1px solid var(--glass-border); border-radius: 999px; color: var(--text); padding: .7rem 1rem; text-decoration: none; }
  .back-projects:focus-visible, .membership-operations-nav a:focus-visible { outline: 3px solid var(--mo-identity); outline-offset: 3px; }
  .membership-operations-nav { position: fixed; z-index: 18; left: 50%; bottom: 1rem; translate: -50% 0; display: flex; gap: .3rem; border: 1px solid var(--glass-border); border-radius: 999px; background: var(--chrome-bg); padding: .5rem; backdrop-filter: blur(16px); }
  .membership-operations-nav a { display: inline-flex; gap: .4rem; align-items: center; border-radius: 999px; color: var(--text-dim); padding: .42rem .65rem; text-decoration: none; white-space: nowrap; }
  .membership-operations-nav a.active { color: var(--text); background: var(--glass); }
  .nav-dot { width: .5rem; height: .5rem; border-radius: 50%; background: currentColor; }
  #s12 { padding-bottom: 9rem; }

  @media (max-width: 1040px) {
    .member-progress b { display: none; }
    .member-progress { left: .5rem; }
    .foundation-grid, .result-grid, .risk-chain, .governance-loop { grid-template-columns: repeat(2, 1fr); }
    .touch-flow { grid-template-columns: repeat(3, 1fr); }
    .touch-flow span:nth-child(3)::after, .touch-flow span:last-child::after { content: none; }
  }

  @media (max-width: 860px) {
    .membership-operations-deck { scroll-snap-type: y proximity; }
    .membership-operations-deck section { height: auto; min-height: 100vh; padding-inline: 1.15rem; }
    .split-shell, .platform-flow, .identity-model, .voucher-paths, .channel-sources, .touch-boundaries { grid-template-columns: 1fr; }
    .model-link, .flow-arrow { rotate: 90deg; justify-self: center; }
    .member-progress { left: .2rem; padding: .45rem .28rem; border-radius: .75rem; }
    .member-progress::before { left: .56rem; }
    .member-progress i { width: .48rem; height: .48rem; }
    .membership-operations-nav a { padding-inline: .5rem; }
    .membership-operations-nav a span:last-child { font-size: .68rem; }
  }

  @media (max-width: 620px) {
    .foundation-grid, .result-grid, .risk-chain, .governance-loop, .touch-flow { grid-template-columns: 1fr; }
    .touch-flow span::after { content: "↓" !important; right: auto !important; bottom: -.65rem; }
    .touch-flow span:last-child::after { content: none !important; }
    .debt-note, .contribution-boundary { grid-template-columns: 1fr; }
    .membership-operations-nav { width: calc(100% - 1rem); justify-content: space-between; }
  }

  @supports (height: 100dvh) {
    @media (max-width: 860px) {
      .membership-operations-deck section { min-height: 100dvh; }
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .membership-operations-deck *,
    .membership-operations-deck *::before,
    .membership-operations-deck *::after {
      scroll-behavior: auto;
      animation-duration: .01ms;
      animation-iteration-count: 1;
      transition-duration: .01ms;
      transition-delay: 0ms;
    }
  }
</style>
```

- [ ] **Step 5: Run the visual and responsive tests**

Run:

```bash
npx playwright test e2e/membership-operations.spec.ts -g "membership spine|desktop keeps|static mode"
```

Expected: 3 tests PASS.

- [ ] **Step 6: Run the complete membership suite**

Run:

```bash
npx playwright test e2e/membership-operations.spec.ts
```

Expected: 11 tests PASS.

- [ ] **Step 7: Commit the visual system**

```bash
git add src/pages/projects/membership-operations.astro e2e/membership-operations.spec.ts
git commit -m "feat: style membership relationship journey"
```

### Task 6: Add native motion, active chapter state, and full fallback behavior

**Files:**
- Create: `src/scripts/membership-operations-motion.ts`
- Modify: `src/pages/projects/membership-operations.astro`
- Modify: `e2e/membership-operations.spec.ts`

- [ ] **Step 1: Append failing motion-controller tests**

Append to `e2e/membership-operations.spec.ts`:

```ts
test('desktop uses native observed reveals and advances the membership spine', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(route);
  const root = page.locator('[data-membership-operations-deck]');

  await expect(root).toHaveAttribute('data-motion-ready', 'true');
  await expect(root).toHaveAttribute('data-motion-mode', 'observe');
  await expect(page.locator('#s1')).toHaveAttribute('data-motion-state', 'visible');
  await page.locator('#s11').scrollIntoViewIfNeeded();
  await expect(page.locator('#s11')).toHaveAttribute('data-motion-state', 'visible');
  await expect(root).toHaveAttribute('data-active-member-node', 'risk');
  await expect(page.getByRole('navigation', { name: '多平台会员运营体系案例章节' }).getByRole('link', { name: '风险治理' })).toHaveAttribute('aria-current', 'true');
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
});

test('reduced motion exposes every scene immediately', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(route);
  const root = page.locator('[data-membership-operations-deck]');

  await expect(root).toHaveAttribute('data-motion-mode', 'reduce');
  await expect(root).toHaveAttribute('data-motion-ready', 'true');
  await expect(page.locator('section[data-motion-state="visible"]')).toHaveCount(12);
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await context.close();
});

test('missing IntersectionObserver falls back to fully visible content', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'IntersectionObserver', { value: undefined, configurable: true });
  });
  await page.goto(route);
  const root = page.locator('[data-membership-operations-deck]');

  await expect(root).toHaveAttribute('data-motion-mode', 'fallback');
  await expect(root).toHaveAttribute('data-motion-ready', 'false');
  await expect(page.locator('section[data-motion-state="visible"]')).toHaveCount(12);
  await page.locator('#s12').scrollIntoViewIfNeeded();
  await expect(page.locator('#s12')).toBeVisible();
});

test('motion controller remains independent from GSAP and ScrollTrigger', async () => {
  const source = await readFile(new URL('../src/scripts/membership-operations-motion.ts', import.meta.url), 'utf8');
  expect(source).not.toContain("from 'gsap'");
  expect(source).not.toContain('ScrollTrigger');
});

test('controller cleanup restores static readable state', async ({ page }) => {
  await page.goto(route);
  const root = page.locator('[data-membership-operations-deck]');
  await expect(root).toHaveAttribute('data-motion-mode', 'observe');

  await page.evaluate(() => document.dispatchEvent(new Event('astro:before-swap')));
  await expect(root).toHaveAttribute('data-motion-mode', 'static');
  await expect(root).not.toHaveAttribute('data-motion-ready', /.+/);
  await expect(root).not.toHaveAttribute('data-active-member-node', /.+/);
  await expect(page.locator('section[data-motion-state]')).toHaveCount(0);
});

test('rapid forward and reverse scrolling leaves visible content and no browser errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(route);

  for (const id of ['s4', 's8', 's12', 's7', 's2', 's11']) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await expect(page.locator(`#${id}`)).toHaveAttribute('data-motion-state', 'visible');
  }
  expect(errors).toEqual([]);
});
```

- [ ] **Step 2: Run the motion tests and verify the controller is missing**

Run:

```bash
npx playwright test e2e/membership-operations.spec.ts -g "native observed|reduced motion|missing IntersectionObserver|motion controller|controller cleanup|rapid forward"
```

Expected: tests FAIL because the controller file and `data-motion-ready` states do not exist.

- [ ] **Step 3: Create the isolated motion controller**

Create `src/scripts/membership-operations-motion.ts` with:

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

function setActiveChapter(root: HTMLElement, chapterId: string) {
  root.dataset.activeMemberNode = chapterId;
  document.querySelectorAll<HTMLAnchorElement>(chapterLinkSelector).forEach((link) => {
    const active = link.dataset.chapterLink === chapterId;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
}

export function initMembershipOperationsMotion(root: HTMLElement) {
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
    setActiveChapter(root, scenes[0]?.dataset.chapter ?? 'member');
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
      if (leadingScene?.dataset.chapter) setActiveChapter(root, leadingScene.dataset.chapter);
    }, { root, rootMargin: '-15% 0px -25% 0px', threshold: [0, 0.15, 0.4, 0.7] });

    scenes.forEach((scene, index) => {
      scene.dataset.motionState = index === 0 ? 'visible' : 'pending';
      observer?.observe(scene);
    });
    setActiveChapter(root, scenes[0]?.dataset.chapter ?? 'member');
    setRootMode(root, 'observe', true);
  };

  const onPreferenceChange = () => {
    if (disposed) return;
    try {
      setup();
    } catch (error) {
      applyStaticMode('fallback', false);
      console.error('Membership operations motion initialization failed', error);
    }
  };

  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    disconnectObserver();
    if (listening) reduceMotion.removeEventListener('change', onPreferenceChange);
    document.removeEventListener('astro:before-swap', cleanup);
    scenes.forEach((scene) => { delete scene.dataset.motionState; });
    delete root.dataset.activeMemberNode;
    setRootMode(root, 'static', null);
  };

  try {
    setup();
    reduceMotion.addEventListener('change', onPreferenceChange);
    listening = true;
    document.addEventListener('astro:before-swap', cleanup);
  } catch (error) {
    applyStaticMode('fallback', false);
    console.error('Membership operations motion initialization failed', error);
  }

  return cleanup;
}
```

- [ ] **Step 4: Initialize the controller from the page**

Add this script after the chapter navigation and before `</DeckLayout>`:

```astro
  <script>
    import { initMembershipOperationsMotion } from '../../scripts/membership-operations-motion';

    const root = document.querySelector<HTMLElement>('[data-membership-operations-deck]');
    if (root) initMembershipOperationsMotion(root);
  </script>
```

- [ ] **Step 5: Add opt-in reveal transitions to the scoped styles**

Add before the first responsive media query:

```css
  [data-membership-operations-deck][data-motion-ready='true'][data-motion-mode='observe'] [data-motion-state='pending'] [data-motion-item] {
    opacity: 0;
    transform: translateY(1rem);
  }

  [data-membership-operations-deck][data-motion-mode='observe'] [data-motion-state='visible'] [data-motion-item] {
    opacity: 1;
    transform: translateY(0);
    transition: opacity .42s ease, transform .42s ease;
  }

  #s8 [data-touch-step]:nth-child(2), #s11 [data-risk-stage]:nth-child(2) { transition-delay: .04s; }
  #s8 [data-touch-step]:nth-child(3), #s11 [data-risk-stage]:nth-child(3) { transition-delay: .08s; }
  #s8 [data-touch-step]:nth-child(4), #s11 [data-risk-stage]:nth-child(4) { transition-delay: .12s; }
  #s8 [data-touch-step]:nth-child(5) { transition-delay: .16s; }
  #s8 [data-touch-step]:nth-child(6) { transition-delay: .2s; }
  #s5 [data-motion-item]:nth-child(2) { transition-delay: .06s; }
  #s5 [data-motion-item]:nth-child(3) { transition-delay: .12s; }
```

- [ ] **Step 6: Run the motion tests**

Run:

```bash
npx playwright test e2e/membership-operations.spec.ts -g "native observed|reduced motion|missing IntersectionObserver|motion controller|controller cleanup|rapid forward"
```

Expected: 6 tests PASS.

- [ ] **Step 7: Run the complete membership suite**

Run:

```bash
npx playwright test e2e/membership-operations.spec.ts
```

Expected: 17 tests PASS.

- [ ] **Step 8: Commit the motion controller**

```bash
git add src/scripts/membership-operations-motion.ts src/pages/projects/membership-operations.astro e2e/membership-operations.spec.ts
git commit -m "feat: add native membership deck motion"
```

### Task 7: Integrate the project card and shared Deck theme regression

**Files:**
- Modify: `src/pages/projects/index.astro`
- Modify: `e2e/membership-operations.spec.ts`
- Modify: `e2e/deck-theme.spec.ts`

- [ ] **Step 1: Append the failing project-listing test**

Append to `e2e/membership-operations.spec.ts`:

```ts
test('projects listing exposes the membership operations case', async ({ page }) => {
  await page.goto('/projects/');
  const card = page.locator('.card', { hasText: '多平台会员运营体系' });

  await expect(card).toBeVisible();
  await expect(card).toContainText('把分散的平台访客');
  await expect(card).toContainText('会员关系');
  await expect(card).toHaveAttribute('href', route);
});
```

- [ ] **Step 2: Run the listing test and verify it fails**

Run:

```bash
npx playwright test e2e/membership-operations.spec.ts -g "projects listing"
```

Expected: FAIL because the project card does not exist.

- [ ] **Step 3: Add the membership card after the currently implemented permissions case**

In `src/pages/projects/index.astro`, append this object after the enterprise-permissions item:

```ts
  {
    title: '多平台会员运营体系',
    hook: '把分散的平台访客，变成可持续经营的会员关系',
    tags: ['会员体系', '增长归因', '风险治理'],
    href: `${base}projects/membership-operations/`,
    cover: 'linear-gradient(120deg, #2563eb 0%, #7c3aed 42%, #22c55e 72%, #f97316 100%)',
  },
```

Do not reorder the two existing cases. The membership card remains after the currently implemented cases until the analytics and parking Decks are added.

- [ ] **Step 4: Add the route to the shared theme matrix**

In `e2e/deck-theme.spec.ts`, add this entry immediately after `/projects/enterprise-permissions/`:

```ts
  '/projects/membership-operations/',
```

- [ ] **Step 5: Run the listing and theme tests**

Run:

```bash
npx playwright test e2e/membership-operations.spec.ts -g "projects listing"
npx playwright test e2e/deck-theme.spec.ts
```

Expected: the first command reports 1 PASS and the second reports 2 PASS.

- [ ] **Step 6: Run the complete membership suite**

Run:

```bash
npx playwright test e2e/membership-operations.spec.ts
```

Expected: 18 tests PASS.

- [ ] **Step 7: Commit project integration**

```bash
git add src/pages/projects/index.astro e2e/membership-operations.spec.ts e2e/deck-theme.spec.ts
git commit -m "feat: publish membership operations case"
```

### Task 8: Run engineering, content-boundary, and regression acceptance

**Files:**
- Verify: `src/pages/projects/membership-operations.astro`
- Verify: `src/scripts/membership-operations-motion.ts`
- Verify: `src/pages/projects/index.astro`
- Verify: `e2e/membership-operations.spec.ts`
- Verify: `e2e/deck-theme.spec.ts`

- [ ] **Step 1: Run Astro type and template checks**

Run:

```bash
npm run check
```

Expected: exit 0 with no Astro or TypeScript errors.

- [ ] **Step 2: Build the production site**

Run:

```bash
npm run build
```

Expected: exit 0 and a generated `/projects/membership-operations/index.html` route in the build output.

- [ ] **Step 3: Run the focused Deck regression set**

Run:

```bash
npx playwright test \
  e2e/membership-operations.spec.ts \
  e2e/deck-theme.spec.ts \
  e2e/enterprise-permissions.spec.ts \
  e2e/sales-lead-slm.spec.ts
```

Expected: all focused tests PASS; existing project Deck behavior remains unchanged.

- [ ] **Step 4: Run the complete Playwright suite**

Run:

```bash
npx playwright test
```

Expected: all repository E2E tests PASS.

- [ ] **Step 5: Scan the final page for prohibited public claims**

Run:

```bash
rg -n "876 万独立用户|自动识别同一自然人|短信带来 11\.37 万人开卡|营销计划直接带来 7,296 万元销售额|原始身份模型由我从零设计|真实异常会员名单|具体风控阈值" \
  src/pages/projects/membership-operations.astro
```

Expected: no output.

- [ ] **Step 6: Verify the implementation did not import forbidden motion dependencies**

Run:

```bash
rg -n "gsap|ScrollTrigger|pin-spacer" \
  src/pages/projects/membership-operations.astro \
  src/scripts/membership-operations-motion.ts
```

Expected: no output.

- [ ] **Step 7: Review only the task-owned diff**

Run:

```bash
git diff HEAD~7 -- \
  src/pages/projects/membership-operations.astro \
  src/scripts/membership-operations-motion.ts \
  src/pages/projects/index.astro \
  e2e/membership-operations.spec.ts \
  e2e/deck-theme.spec.ts
```

Expected: only the membership Deck, its controller/tests, the project card, and the theme-route addition appear. Do not stage or alter unrelated `.gitignore`, guide, `.superpowers/`, or other plan files if they exist in the working tree.

- [ ] **Step 8: Record final verification without creating an empty commit**

Run:

```bash
git status --short
git log -5 --oneline
```

Expected: the seven implementation commits from Tasks 1–7 are visible, task-owned files are clean, and any pre-existing unrelated working-tree changes remain untouched. If a verification step required a real code correction, commit only the corrected task-owned files with:

```bash
git add src/pages/projects/membership-operations.astro src/scripts/membership-operations-motion.ts src/pages/projects/index.astro e2e/membership-operations.spec.ts e2e/deck-theme.spec.ts
git commit -m "fix: complete membership deck acceptance"
```

## Implementation guardrails

- Keep the confirmed public wording from the Spec; do not invent new metrics or claim strict marketing causality.
- Keep S4 explicit that the original identity model came from another product manager.
- Keep S5 explicit that current platform identity moves while historical MCU assets remain.
- Keep S6 explicit that voucher-owner MCU is both a continuity mechanism and unresolved identity debt.
- Keep all 12 scenes in semantic DOM order; visual movement must never change keyboard or reading order.
- Use no production screenshots, external images, customer names, real platform accounts, phone numbers, orders, or risk thresholds.
- Do not modify shared `DeckLayout` scroll behavior or either existing project Deck.
- Do not stage unrelated user changes present in the worktree.
