# 简历项目经历双版本 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立一套结构化简历事实源，生成完整版、AI 产品经理一页版和 B2B / SaaS 一页版，并可重复导出两份公开 PDF。

**Architecture:** 以 `src/data/resume/` 作为唯一事实源，用显式版本配置选择项目、摘要和篇幅；Astro 静态路由复用同一套渲染组件生成三个版本，独立打印布局保证 A4 输出；Playwright 同时承担内容合同、版式和 PDF 产物验证。现有 `src/data/resume.ts` 保留为兼容适配层，避免关于页时间线与新简历数据分叉。

**Tech Stack:** Astro 5、TypeScript、Playwright、Node.js、CSS Paged Media、Git

---

## 0. 上下文、前置判断与执行边界

### 已加载上下文

- 当前设计：`docs/superpowers/specs/2026-07-19-resume-project-experience-design.md`
- 当前实现：`src/data/resume.ts`、`src/data/profile.ts`、`src/pages/about.astro`、`src/components/Timeline.astro`、`public/resume.pdf`
- 路由规则：真实任务上下文加载规则、个人知识库 RAG 式上下文治理规则、正式知识域根索引、工作领域与任务域 README
- 正式知识卡：`PRD审查经验`、`AI产品架构六层总览`、`上下文设计追求最小充分而非信息最多`
- 未加载：旧 `wiki/`、原文层正文、多 Agent 运行时卡和组织敏捷复盘卡；当前 Spec 与飞书审计结论已经足够，继续加载只会扩大上下文并增加过期事实风险。

### Spec-readiness：PASS

- **状态组合：** 六类公开状态已经闭合；项目日期明确区分“核心建设期”和“至今”。
- **失败与并发：** 本功能是静态内容生成，不存在业务并发写入；构建失败、单页溢出、PDF 生成失败和敏感信息泄露均在测试中设置阻断。
- **枚举闭合：** 三个版本、六个项目、默认项目顺序、替换规则、数字口径和非目标均已明确，无开放式占位。
- **单一真值源：** 时间、指标、状态和贡献边界只定义在结构化事实源；页面、PDF 和关于页都从该事实源读取。

### 执行边界

- 实施时使用隔离 worktree；当前主工作区已有 `.gitignore`、`docs/project-experience/00-project-experience-guide.md`、`.superpowers/` 和一份集团分析计划的未提交改动，不得带入或覆盖。
- 不修改现有项目 Deck 及其动效。
- 不把飞书私有链接、客户名称、手机号、地址、报价金额或生产截图写入仓库。
- `public/resume.pdf` 当前只有 27 字节占位内容，必须由可重复脚本替换，禁止手工拖入无法复现的 PDF。

## 1. 文件结构

### 新建

- `src/data/resume/types.ts`：简历事实、项目和版本文档类型。
- `src/data/resume/facts.ts`：六个项目、工作经历、教育、认证与工具的唯一事实源。
- `src/data/resume/variants.ts`：完整版、AI 版、B2B 版的选择与组合规则。
- `src/layouts/ResumeLayout.astro`：无导航、无页脚的独立简历 HTML 外壳。
- `src/components/resume/ResumeProject.astro`：单个项目的完整、紧凑和短项渲染。
- `src/components/resume/ResumeDocument.astro`：简历章节编排和 A4 打印样式。
- `src/pages/resume/[variant].astro`：生成 `/resume/master/`、`/resume/ai/`、`/resume/b2b/`。
- `scripts/export-resumes.mjs`：启动本地 Astro、验证一页适配并原子导出 PDF。
- `e2e/resume-data.spec.ts`：事实、版本选择、数字和脱敏合同。
- `e2e/resume.spec.ts`：路由、内容顺序、A4 适配和响应式合同。
- `e2e/resume-pdf.spec.ts`：PDF 文件头与最小体积验证。
- `public/resume-b2b-saas.pdf`：脚本生成的 B2B / SaaS 投递版。

### 修改

- `src/data/resume.ts:1-34`：改为兼容导出层。
- `src/data/profile.ts:1-29`：更新摘要并增加两个简历下载入口。
- `src/data/skills.ts:1-18`：将 AI 探索改为已验证的 AI 产品实践能力。
- `src/pages/about.astro:1-51`：展示两个 PDF 下载按钮。
- `e2e/about.spec.ts:1-8`：验证两个下载入口及新摘要。
- `e2e/visual.spec.ts:1-11`：增加两个简历版本的桌面与移动截图。
- `package.json:1-17`：增加 `test:e2e`、`resume:check`、`resume:export`。
- `public/resume.pdf`：由导出脚本替换为 AI 产品经理一页版。
- `docs/superpowers/specs/2026-07-19-resume-project-experience-design.md:5`：实施完成后更新状态。

## 2. 任务拆解

### Task 1: 建立唯一事实源和版本选择合同

**Files:**
- Create: `e2e/resume-data.spec.ts`
- Create: `src/data/resume/types.ts`
- Create: `src/data/resume/facts.ts`
- Create: `src/data/resume/variants.ts`
- Modify: `src/data/resume.ts:1-34`

- [ ] **Step 1: 先写失败的数据合同测试**

```ts
// e2e/resume-data.spec.ts
import { test, expect } from '@playwright/test';
import { resumeFacts } from '../src/data/resume/facts';
import { getResumeDocument } from '../src/data/resume/variants';

const expectedPeriods = {
  permissions: '2022.06–2023.12｜分两期建设',
  membership: '2022.09–2024.07',
  analytics: '2022.12–2024.05',
  parking: '2024.07–2026.03',
  sales: '2025.04–至今',
  ai: '2026.04–至今',
};

test('canonical facts contain six approved projects and exact periods', () => {
  expect(resumeFacts.projects).toHaveLength(6);
  expect(Object.fromEntries(resumeFacts.projects.map((project) => [project.id, project.period])))
    .toEqual(expectedPeriods);
  for (const project of resumeFacts.projects) {
    expect(project.copy.master.background.length).toBeGreaterThanOrEqual(80);
    expect(project.copy.master.background.length).toBeLessThanOrEqual(120);
    expect(project.copy.compact.background.length).toBeGreaterThanOrEqual(30);
    expect(project.copy.compact.background.length).toBeLessThanOrEqual(50);
  }
});

test('AI evidence uses the conservative audited counts and scope', () => {
  const ai = resumeFacts.projects.find((project) => project.id === 'ai');
  expect(ai).toBeDefined();
  const copy = JSON.stringify(ai);
  expect(copy).toContain('8 类核心 Agent 工作流');
  expect(copy).toContain('6 类已稳定');
  expect(copy).toContain('9 份真实业务 PRD');
  expect(copy).toContain('1 份正式业务竞品分析');
  expect(copy).toContain('3 类定制开发报价方案');
  expect(copy).toContain('25 项关键决策');
  expect(copy).toContain('6 张业务蓝图');
  expect(copy).toContain('尚未推广给团队');
  expect(copy).not.toMatch(/提升效率|团队提效|团队推广/);
});

test('variants select the approved projects without copying facts', () => {
  const master = getResumeDocument('master');
  const ai = getResumeDocument('ai');
  const b2b = getResumeDocument('b2b');

  expect([master.leadProject?.id, ...master.projects.map((project) => project.id)])
    .toEqual(['ai', 'sales', 'permissions', 'analytics', 'membership', 'parking']);
  expect([ai.leadProject?.id, ...ai.projects.map((project) => project.id)])
    .toEqual(['ai', 'sales', 'permissions']);
  expect(b2b.projects.map((project) => project.id))
    .toEqual(['sales', 'permissions', 'analytics']);
  expect(b2b.shortProject?.id).toBe('ai');
  expect(master.mode).toBe('full');
  expect(ai.mode).toBe('compact');
  expect(b2b.mode).toBe('compact');
});

test('public facts exclude sensitive and ambiguous material', () => {
  const publicCopy = JSON.stringify(resumeFacts);
  expect(publicCopy).not.toMatch(/报价单号|甲方：|联系电话|真实客户名称/);
  expect(publicCopy).not.toMatch(/1[3-9]\d{9}/);
  expect(publicCopy).not.toMatch(/智慧校园|汽车数据标注/);
  for (const marker of ['T' + 'BD', 'T' + 'ODO', '待' + '补', '若' + '干', '等' + '等']) {
    expect(publicCopy).not.toContain(marker);
  }
});
```

- [ ] **Step 2: 运行测试并确认因模块不存在而失败**

Run: `npx playwright test e2e/resume-data.spec.ts`

Expected: FAIL，错误包含 `Cannot find module '../src/data/resume/facts'`。

- [ ] **Step 3: 创建简历类型定义**

```ts
// src/data/resume/types.ts
export type ResumeVariantId = 'master' | 'ai' | 'b2b';
export type ResumeMode = 'full' | 'compact';
export type ResumeProjectId = 'ai' | 'sales' | 'permissions' | 'analytics' | 'membership' | 'parking';

export interface ResumeIdentity {
  name: string;
  email: string;
  site: string;
  links: { label: string; href: string }[];
}

export interface Job {
  company: string;
  title: string;
  period: string;
  highlights: string[];
}

export interface Education {
  school: string;
  major: string;
  period: string;
}

export interface ResumeProjectCopy {
  background: string;
  actions: string[];
  results: string[];
}

export interface ResumeProject {
  id: ResumeProjectId;
  name: string;
  role: string;
  period: string;
  state: string;
  responsibilities: string[];
  copy: {
    master: ResumeProjectCopy;
    compact: ResumeProjectCopy;
  };
  tags: string[];
}

export interface ResumeFacts {
  identity: ResumeIdentity;
  jobs: Job[];
  education: Education[];
  certifications: string[];
  tools: string[];
  projects: ResumeProject[];
}

export interface ResumeVariantConfig {
  id: ResumeVariantId;
  label: string;
  target: string;
  summary: string;
  capabilities: string[];
  mode: ResumeMode;
  leadProjectId?: ResumeProjectId;
  projectIds: ResumeProjectId[];
  shortProjectId?: ResumeProjectId;
  showTags: boolean;
}

export interface ResumeDocument extends ResumeVariantConfig {
  identity: ResumeIdentity;
  jobs: Job[];
  education: Education[];
  certifications: string[];
  tools: string[];
  leadProject?: ResumeProject;
  projects: ResumeProject[];
  shortProject?: ResumeProject;
}
```

- [ ] **Step 4: 写入完整且脱敏的唯一事实源**

```ts
// src/data/resume/facts.ts
import type { ResumeFacts } from './types';

export const resumeFacts = {
  identity: {
    name: 'QQ星',
    email: '666qqx666@gmail.com',
    site: 'https://qqx.life',
    links: [
      { label: '个人网站', href: 'https://qqx.life' },
      { label: 'GitHub', href: 'https://github.com/666qqx666-jpg' },
    ],
  },
  jobs: [
    {
      company: '浙江影能科技有限公司',
      title: '产品经理',
      period: '2022.06–至今',
      highlights: [
        '负责企业服务产品的问题识别、业务建模、版本规划、PRD、原型、技术协作与上线推动，并持续维护已上线模块。',
        '先后主导或承接权限、会员运营、经营分析、智慧停车和销售线索等核心模块，处理组织权限、状态流转、数据口径与交易异常。',
        '主导集团经营分析的指标与维度模型、集团—商场两级下钻及数仓方案演进，四类报表覆盖约 25 个商场。',
        '自 2026 年起将个人 AI Agent 工作台用于真实需求与交付过程，当前仍处于个人验证阶段。',
      ],
    },
    {
      company: '浙江达摩网络科技有限公司',
      title: 'Java 实习生',
      period: '2021.07–2021.10',
      highlights: ['基于 SpringMVC 三层架构参与“好办 3.0”版本开发与迭代。'],
    },
  ],
  education: [
    { school: '中国计量大学', major: '计算机科学与技术 · 本科', period: '2018.08–2022.06' },
  ],
  certifications: ['NPDP', 'PMP', '信息系统项目管理师'],
  tools: ['Axure', 'SQL', 'Obsidian', 'Claude', 'Codex', 'OpenClaw'],
  projects: [
    {
      id: 'ai',
      name: 'Personal Knowledge Harness｜个人 AI 产品工作台',
      role: '独立产品设计与实践',
      period: '2026.04–至今',
      state: '个人稳定自用｜尚未推广给团队',
      responsibilities: ['独立完成问题定义、架构设计、知识与上下文治理、Agent Skill 工作流建设，并持续在真实产品任务中验证和修订。'],
      copy: {
        master: {
          background: '工作文档、经验和 AI 对话长期散落；零散 Skill 与知识卡片又带来重复内容、上下文膨胀和 Agent 记忆割裂。项目希望建立可追溯、按需加载、跨 Agent 共用的个人知识与工作流系统，让 AI 进入需求分析、文档交付和复盘过程。',
          actions: [
            '将早期两层结构演进为“原文层—正式知识域—能力层”，明确内容路由、加载、沉淀和索引维护规则。',
            '以 Obsidian Vault 和共享 Skill 目录作为跨 Agent 真值源，通过最小 context-pack 按任务加载必要材料。',
            '让 Claude、Codex、OpenClaw 共用记忆与能力层，并依据真实交付问题补充冷启动审查、spec-readiness 和上下文治理门禁。',
          ],
          results: [
            '建成 8 类核心 Agent 工作流，其中 6 类已稳定用于个人真实产品工作。',
            '累计支撑 9 份真实业务 PRD、6 份蓝图或关键决策等配套材料、1 份正式业务竞品分析及 3 类定制开发报价方案。',
            '在销售线索与充电业务中跑通“需求澄清—方案拆解—决策沉淀—报价输出”的跨环节闭环。',
            '以付费线索流转为例，将复杂方案拆解为 25 项关键决策和 6 张业务蓝图。',
          ],
        },
        compact: {
          background: '工作材料与 AI 记忆分散，零散 Skill 导致重复和上下文膨胀，需要建设跨 Agent 工作台。',
          actions: [
            '搭建三层知识架构与最小 context-pack，让 Claude、Codex、OpenClaw 共用真值源。',
            '将需求发现、PRD 写审、竞品分析、报价、复盘和上下文治理沉淀为可复用工作流。',
          ],
          results: [
            '8 类工作流中 6 类稳定自用，支撑 9 份真实业务 PRD、1 份正式竞品分析和 3 类定制报价。',
            '复杂需求可沉淀为 25 项关键决策与 6 张业务蓝图；结果仅代表个人工作验证。',
          ],
        },
      },
      tags: ['Agent 工作流', 'RAG / Context', '知识治理', '产品交付'],
    },
    {
      id: 'sales',
      name: '全域销售线索管理系统',
      role: '产品线负责人',
      period: '2025.04–至今',
      state: '核心链路已上线｜持续迭代',
      responsibilities: ['从智能分发、任务生命周期、公海池等核心经营链路开始主导，随后承接完整产品线；早期多平台接入底座由前任产品负责人建设。'],
      copy: {
        master: {
          background: '连锁品牌的销售线索分散在多个内容与交易平台，长期依赖人工下载、导入和分配，不仅错过最佳跟进时间，也缺少门店责任回收机制。项目需要把多平台接入、智能分发、门店跟进、公海池、超时回收和经营分析连接成可持续运行的责任闭环。',
          actions: [
            '主导智能分发、任务生命周期、公海池、隐私外呼、自动回收、门店经营和分析链路的业务建模与产品设计。',
            '放弃未经验证的统一总分，改用资格过滤、保护期、3 / 5 / 10 / 30 公里阶梯扩圈、公海池抢单与超时回收。',
            '从跨行业差异中识别“下游激励不能修复上游真实性”，推动已排期的去重 / 清洗层和规划中的付费认领机制。',
          ],
          results: [
            '约 10 个付费品牌、约 15,000 家上线门店；平台累计约 102.6 万条线索，当前月处理约 10 万–30 万条。',
            '某匿名客户约三个月、月均约 10 万条线索，卡券核销率由不足 49.4% 提升至 61.7%。',
            '清洗层已排期，付费认领仍在规划中，不将后续方案包装为已上线结果。',
          ],
        },
        compact: {
          background: '多平台线索依赖人工导入分配，跟进延迟且缺少责任回收，需要建立可持续的门店跟进闭环。',
          actions: [
            '主导智能分发、任务、公海池、隐私外呼、超时回收与经营分析。',
            '放弃伪精确总分，设计资格过滤、阶梯扩圈、公海池抢单和自动回收机制。',
          ],
          results: [
            '覆盖约 10 个付费品牌、15,000 家门店，累计约 102.6 万条线索，月处理约 10 万–30 万条。',
            '某匿名客户核销率由不足 49.4% 提升至 61.7%；去重 / 清洗已排期，付费认领规划中。',
          ],
        },
      },
      tags: ['复杂流程', '责任闭环', '产品演进', '规模化落地'],
    },
    {
      id: 'permissions',
      name: '多业务线企业权限体系',
      role: '产品负责人',
      period: '2022.06–2023.12｜分两期建设',
      state: '已上线｜持续维护',
      responsibilities: ['主导综合商场与连锁品牌两条业务线的问题识别、权限建模、PRD、原型、技术协作和上线推动。'],
      copy: {
        master: {
          background: '综合商场与连锁品牌共用数据库和大量业务模块，但前者围绕商场管辖，后者围绕门店网络、企业组织与跨模块数据范围治理。项目需要在复用统一操作身份和审计日志的同时，为两条业务线建立各自适用、可向下授权且不可越权的权限模型。',
          actions: [
            '分离业务权限身份与审计操作身份，在分别鉴权的同时复用统一操作日志。',
            '为综合商场建立“商场范围 × 页面操作范围”，引入商场组和可复用角色。',
            '为连锁品牌建立自定义组织树，拆分组织、门店、行政区、平台、页面及操作五类权限，并设计向下授权不可越权规则。',
          ],
          results: [
            '覆盖约 25 个综合商场、约 30 个连锁品牌和约 3,000 名成员。',
            '支持单客户超过 3 万家门店的权限管理场景。',
          ],
        },
        compact: {
          background: '商场与连锁品牌共用底座却有不同管辖对象，需要建立两套可复用、不可越权的权限模型。',
          actions: [
            '分离业务鉴权身份与统一审计身份，避免重复建设操作日志。',
            '设计商场范围模型与连锁品牌自定义组织树、五类权限和向下授权规则。',
          ],
          results: ['覆盖约 25 个商场、30 个品牌、3,000 名成员，并支持单客户 3 万余家门店。'],
        },
      },
      tags: ['权限建模', '组织治理', '多租户', '越权防护'],
    },
    {
      id: 'analytics',
      name: '集团经营数据分析体系',
      role: '产品负责人',
      period: '2022.12–2024.05',
      state: '已上线｜核心建设期',
      responsibilities: ['主导指标与维度模型、集团—商场两级结构、PRD、原型及数据和研发协作。'],
      copy: {
        master: {
          background: '集团客户跨商场经营分析长期依赖多份 Excel，运营人员需要反复导出、合并和核对数据；集团与单商场又存在不同指标口径，直接复用容易产生误判。项目需要统一指标与维度模型，建立集团—商场两级下钻，并推动底层数据架构持续演进。',
          actions: [
            '建立指标与维度模型及集团—商场两级结构，明确同名指标在不同层级的计算口径。',
            '推动数据架构从预聚合组合演进为原子明细 / 事件进入数仓后再聚合，并显式保留早期技术债边界。',
          ],
          results: [
            '四类经营报表上线并进入客户季度考核，覆盖约 25 个商场。',
            '某集团原需至少下载 20 份 Excel 的六个月、十商场分析，收敛为一次查询或导出。',
          ],
        },
        compact: {
          background: '跨商场经营分析依赖多份 Excel 且指标口径不一，需要统一模型并支持集团—商场两级下钻。',
          actions: [
            '主导指标 / 维度模型、两级下钻与数仓方案演进。',
            '区分集团和商场指标口径，避免同名指标跨层级误用。',
          ],
          results: ['四类报表覆盖约 25 个商场，将某集团至少 20 份 Excel 的分析收敛为一次查询或导出。'],
        },
      },
      tags: ['指标建模', '数据产品', '数仓协作', '经营分析'],
    },
    {
      id: 'membership',
      name: '多平台会员运营体系',
      role: '产品负责人',
      period: '2022.09–2024.07',
      state: '已上线｜核心建设期',
      responsibilities: ['在继承 MCU—ECU 早期身份模型后，主导多平台扩展、无手机号交易兼容、会员触达、推广归因和异常会员治理。'],
      copy: {
        master: {
          background: '业务从微信、支付宝扩展到更多内容与交易平台后，同一会员会以多个平台访客身份进入系统，触达、交易、归因和异常治理随之断开。项目需要在继承既有会员身份模型的前提下，继续完成多平台扩展、无手机号交易兼容、精准触达、渠道归因与风险治理。',
          actions: [
            '扩展多平台身份接入与溯源，并使用券主 MCU 保障上游缺少手机号时的交易和核销连续性。',
            '建设人群筛选、定向人群包、公共短信、审核、短链、推广渠道和二维码归因链路。',
            '将异常治理从身份硬规则升级为预警、人工核查、白名单和有限禁用，避免误伤正常会员。',
          ],
          results: [
            '平台管理约 876 万条 MCU 记录；该数据是客户主体下会员记录数，不是独立自然人数。',
            '某匿名客户开卡后营销计划触达覆盖率约 88.7%，不反向表述为拉新转化。',
          ],
        },
        compact: {
          background: '多平台扩张让会员身份、触达与归因断开，需要在既有身份底座上补齐运营和治理闭环。',
          actions: [
            '主导多平台身份扩展、无手机号交易兼容和会员触达 / 归因链路。',
            '将异常会员治理升级为预警、核查、白名单和有限禁用。',
          ],
          results: ['管理约 876 万条 MCU 记录；某匿名客户开卡后触达覆盖率约 88.7%。'],
        },
      },
      tags: ['会员身份', '增长归因', '运营平台', '风险治理'],
    },
    {
      id: 'parking',
      name: '智慧停车 2.0',
      role: '产品负责人',
      period: '2024.07–2026.03',
      state: '已上线｜核心建设期',
      responsibilities: ['主导分层架构、停车接入、支付、权益编排、支付生命周期、风险与异常处理。'],
      copy: {
        master: {
          background: '外包建设的停车 1.0 系统与内部会员、权益、支付和订单模型相互割裂，新增业务依赖重复对接，异常交易也难以统一处理。停车 2.0 不是简单复制旧系统，而是把接入、支付、权益、订单生命周期、退款与风险控制迁回内部体系并重新编排。',
          actions: [
            '重构停车接入、支付、会员权益和订单生命周期的分层编排。',
            '设计会员与车牌限制、支付冻结与回滚、退款重试和跨日订单等边界规则。',
            '在迁移收益与客户切换成本之间保留 1.0 / 2.0 并行，避免强推升级。',
          ],
          results: [
            '停车业务覆盖 35 个商场，其中 8 个使用 2.0，27 个因迁移成本继续使用 1.0。',
            '2.0 每月约 7.57 万笔账单，优惠前应付金额约 118.3 万元。',
            '退款能力已上线但尚无真实退款订单，不声明已验证退款效果。',
          ],
        },
        compact: {
          background: '外包停车系统与内部会员、权益和支付割裂，需要重构统一的交易编排与异常处理体系。',
          actions: [
            '主导停车接入、支付、权益、订单生命周期及异常规则重构。',
            '在迁移价值和客户成本之间保留 1.0 / 2.0 并行。',
          ],
          results: ['覆盖 35 个商场；2.0 月均约 7.57 万笔账单、优惠前应付约 118.3 万元。'],
        },
      },
      tags: ['交易系统', '权益编排', '异常处理', '迁移策略'],
    },
  ],
} satisfies ResumeFacts;
```

- [ ] **Step 5: 创建版本组合器并保留旧导入路径**

```ts
// src/data/resume/variants.ts
import { resumeFacts } from './facts';
import type { ResumeDocument, ResumeProjectId, ResumeVariantConfig, ResumeVariantId } from './types';

export const resumeVariantIds: ResumeVariantId[] = ['master', 'ai', 'b2b'];

const variants: Record<ResumeVariantId, ResumeVariantConfig> = {
  master: {
    id: 'master',
    label: '完整版内容母稿',
    target: 'AI 产品经理 / B2B SaaS 产品经理',
    summary: '4 年企业服务产品经验，覆盖 CRM、权限、数据、交易与营销场景；具备计算机背景，并已将个人 AI Agent 工作台用于真实产品交付。',
    capabilities: ['AI Agent 工作流', '复杂业务建模', 'B2B / SaaS 产品规划', '数据与技术协作'],
    mode: 'full',
    leadProjectId: 'ai',
    projectIds: ['sales', 'permissions', 'analytics', 'membership', 'parking'],
    showTags: true,
  },
  ai: {
    id: 'ai',
    label: 'AI 产品经理一页版',
    target: 'AI 产品经理｜AI + 企业服务 / SaaS',
    summary: '4 年企业服务产品经验，能够处理复杂规则、权限、状态与数据模型；已将 Agent 工作流用于真实产品任务，并用商业项目证明落地与协作能力。',
    capabilities: ['Agent 工作流设计', '复杂业务建模', 'PRD / Spec 交付', '技术与数据协作'],
    mode: 'compact',
    leadProjectId: 'ai',
    projectIds: ['sales', 'permissions'],
    showTags: false,
  },
  b2b: {
    id: 'b2b',
    label: 'B2B / SaaS 产品经理一页版',
    target: 'B2B / SaaS 产品经理',
    summary: '4 年企业服务产品经验，主导或承接 CRM、权限、经营分析、交易与营销模块，擅长把复杂组织、业务规则和数据口径转化为可落地产品方案。',
    capabilities: ['B2B / SaaS 产品规划', '权限与流程建模', '数据产品设计', '跨团队交付'],
    mode: 'compact',
    projectIds: ['sales', 'permissions', 'analytics'],
    shortProjectId: 'ai',
    showTags: false,
  },
};

const projectById = new Map(resumeFacts.projects.map((project) => [project.id, project]));

function resolveProject(id: ResumeProjectId) {
  const project = projectById.get(id);
  if (!project) throw new Error(`Unknown resume project: ${id}`);
  return project;
}

export function getResumeDocument(id: ResumeVariantId): ResumeDocument {
  const config = variants[id];
  return {
    ...config,
    identity: resumeFacts.identity,
    jobs: resumeFacts.jobs,
    education: resumeFacts.education,
    certifications: resumeFacts.certifications,
    tools: resumeFacts.tools,
    leadProject: config.leadProjectId ? resolveProject(config.leadProjectId) : undefined,
    projects: config.projectIds.map(resolveProject),
    shortProject: config.shortProjectId ? resolveProject(config.shortProjectId) : undefined,
  };
}
```

```ts
// src/data/resume.ts
export type { Job, Education } from './resume/types';
export { resumeFacts } from './resume/facts';

import { resumeFacts } from './resume/facts';

export const jobs = resumeFacts.jobs;
export const education = resumeFacts.education;
```

- [ ] **Step 6: 运行类型检查与数据合同**

Run: `npm run check && npx playwright test e2e/resume-data.spec.ts`

Expected: Astro check reports `0 errors`；Playwright reports `4 passed`。

- [ ] **Step 7: 提交唯一事实源**

```bash
git add src/data/resume.ts src/data/resume e2e/resume-data.spec.ts
git commit -m "feat: add canonical resume facts and variants"
```

### Task 2: 渲染完整版和两个一页版本

**Files:**
- Create: `e2e/resume.spec.ts`
- Create: `src/layouts/ResumeLayout.astro`
- Create: `src/components/resume/ResumeProject.astro`
- Create: `src/components/resume/ResumeDocument.astro`
- Create: `src/pages/resume/[variant].astro`

- [ ] **Step 1: 写路由、顺序和单页适配的失败测试**

```ts
// e2e/resume.spec.ts
import { test, expect } from '@playwright/test';

test('master route renders all six projects in the approved order', async ({ page }) => {
  await page.goto('/resume/master/');
  await expect(page.locator('[data-resume-variant="master"]')).toBeVisible();
  const ids = await page.locator('[data-project-id]').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-project-id')),
  );
  expect(ids).toEqual(['ai', 'sales', 'permissions', 'analytics', 'membership', 'parking']);
  await expect(page.getByText('2026.04–至今', { exact: true })).toBeVisible();
  await expect(page.getByText('2022.06–2023.12｜分两期建设', { exact: true })).toBeVisible();
});

test('AI one-page route keeps only the approved flagship projects', async ({ page }) => {
  await page.goto('/resume/ai/');
  const ids = await page.locator('[data-project-id]').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-project-id')),
  );
  expect(ids).toEqual(['ai', 'sales', 'permissions']);
  await expect(page.getByText('9 份真实业务 PRD')).toBeVisible();
  await expect(page.getByText('多平台会员运营体系')).toHaveCount(0);
  await expect(page.getByText('智慧停车 2.0')).toHaveCount(0);
});

test('B2B one-page route prioritizes commercial projects and keeps AI as a short item', async ({ page }) => {
  await page.goto('/resume/b2b/');
  const ids = await page.locator('[data-project-id]').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-project-id')),
  );
  expect(ids).toEqual(['sales', 'permissions', 'analytics', 'ai']);
  await expect(page.locator('[data-project-id="ai"]')).toHaveAttribute('data-density', 'short');
  await expect(page.getByText('多平台会员运营体系')).toHaveCount(0);
});

for (const variant of ['ai', 'b2b']) {
  test(`${variant} print layout fits one A4 sheet`, async ({ page }) => {
    await page.setViewportSize({ width: 794, height: 1123 });
    await page.emulateMedia({ media: 'print' });
    await page.goto(`/resume/${variant}/`);
    const metrics = await page.locator('.resume-sheet').evaluate((element) => ({
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
      pageCount: document.querySelectorAll('.resume-sheet').length,
    }));
    expect(metrics.pageCount).toBe(1);
    expect(metrics.scrollHeight).toBeLessThanOrEqual(metrics.clientHeight + 1);
  });
}

for (const variant of ['master', 'ai', 'b2b']) {
  test(`${variant} route has no horizontal overflow on mobile`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/resume/${variant}/`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}
```

- [ ] **Step 2: 运行测试并确认三个路由均返回 404**

Run: `npx playwright test e2e/resume.spec.ts`

Expected: FAIL，首个断言找不到 `[data-resume-variant="master"]`。

- [ ] **Step 3: 创建无站点导航的简历布局**

```astro
---
// src/layouts/ResumeLayout.astro
import '../styles/global.css';

interface Props {
  title: string;
  description: string;
}

const { title, description } = Astro.props;
---
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta name="robots" content="noindex" />
  </head>
  <body class="resume-output">
    <main><slot /></main>
  </body>
</html>
```

- [ ] **Step 4: 创建单项目渲染单元**

```astro
---
// src/components/resume/ResumeProject.astro
import type { ResumeMode, ResumeProject } from '../../data/resume/types';

interface Props {
  project: ResumeProject;
  mode: ResumeMode;
  density?: 'full' | 'compact' | 'short';
  showTags?: boolean;
}

const {
  project,
  mode,
  density = mode === 'full' ? 'full' : 'compact',
  showTags = false,
} = Astro.props;
const copy = project.copy[mode === 'full' ? 'master' : 'compact'];
const isShort = density === 'short';
---
<article class:list={['resume-project', `density-${density}`]} data-project-id={project.id} data-density={density}>
  <header class="project-head">
    <div>
      <h3>{project.name}</h3>
      <p class="project-role">{project.role}</p>
    </div>
    <p class="project-meta"><span>{project.period}</span><span>{project.state}</span></p>
  </header>
  <p class="project-background">{copy.background}</p>
  {!isShort && density === 'full' && (
    <div class="project-block">
      <strong>本人职责</strong>
      <ul>{project.responsibilities.map((item) => <li>{item}</li>)}</ul>
    </div>
  )}
  {!isShort && (
    <div class="project-columns">
      <div class="project-block">
        <strong>关键行动</strong>
        <ul>{copy.actions.map((item) => <li>{item}</li>)}</ul>
      </div>
      <div class="project-block">
        <strong>结果证据</strong>
        <ul>{copy.results.map((item) => <li>{item}</li>)}</ul>
      </div>
    </div>
  )}
  {isShort && <p class="short-result">{copy.results[0]}</p>}
  {showTags && <p class="project-tags">{project.tags.join(' · ')}</p>}
</article>
```

- [ ] **Step 5: 创建简历文档编排与完整打印样式**

```astro
---
// src/components/resume/ResumeDocument.astro
import type { ResumeDocument as ResumeDocumentData } from '../../data/resume/types';
import ResumeProject from './ResumeProject.astro';

interface Props { resume: ResumeDocumentData; }
const { resume } = Astro.props;
const compact = resume.mode === 'compact';
---
<div class="resume-shell" data-resume-variant={resume.id}>
  <div class="screen-actions" aria-label="简历预览操作">
    <a href="/about/">返回关于页</a>
    <button type="button" onclick="window.print()">打印 / 导出 PDF</button>
  </div>
  <article class:list={['resume-sheet', compact && 'is-compact']} data-one-page={compact ? 'true' : 'false'}>
    <header class="resume-header">
      <div>
        <p class="eyebrow">{resume.label}</p>
        <h1>{resume.identity.name}</h1>
        <p class="target">{resume.target}</p>
      </div>
      <div class="contact">
        <a href={`mailto:${resume.identity.email}`}>{resume.identity.email}</a>
        <a href={resume.identity.site}>{resume.identity.site.replace('https://', '')}</a>
        {resume.identity.links.filter((link) => link.label === 'GitHub').map((link) => (
          <a href={link.href}>GitHub</a>
        ))}
      </div>
    </header>

    <section class="resume-section summary-section">
      <h2>职业摘要</h2>
      <p>{resume.summary}</p>
    </section>

    <section class="resume-section capabilities-section">
      <h2>核心能力</h2>
      <div class="capabilities">{resume.capabilities.map((item) => <span>{item}</span>)}</div>
    </section>

    {resume.leadProject && (
      <section class="resume-section lead-section">
        <h2>AI 产品实践</h2>
        <ResumeProject project={resume.leadProject} mode={resume.mode} showTags={resume.showTags} />
      </section>
    )}

    <section class="resume-section experience-section">
      <h2>工作经历</h2>
      {resume.jobs.map((job, index) => (
        <article class="job">
          <header><strong>{job.company}｜{job.title}</strong><span>{job.period}</span></header>
          <ul>{(compact ? job.highlights.slice(0, index === 0 ? 3 : 1) : job.highlights).map((item) => <li>{item}</li>)}</ul>
        </article>
      ))}
    </section>

    <section class="resume-section projects-section">
      <h2>{compact ? '精选项目' : '商业项目经历'}</h2>
      {resume.projects.map((project) => (
        <ResumeProject project={project} mode={resume.mode} showTags={resume.showTags} />
      ))}
    </section>

    {resume.shortProject && (
      <section class="resume-section short-section">
        <h2>AI 产品实践</h2>
        <ResumeProject project={resume.shortProject} mode="compact" density="short" />
      </section>
    )}

    <section class="resume-section footer-section">
      <div><h2>教育</h2>{resume.education.map((item) => <p><strong>{item.school}</strong>｜{item.major}<span>{item.period}</span></p>)}</div>
      <div><h2>认证</h2><p>{resume.certifications.join(' · ')}</p></div>
      <div><h2>工具</h2><p>{resume.tools.join(' · ')}</p></div>
    </section>
  </article>
</div>

<style>
  :global(body.resume-output) { background: #e9eef5; color: #172033; font-family: var(--font); }
  .resume-shell { min-height: 100vh; padding: 28px 16px 48px; }
  .screen-actions { width: min(210mm, 100%); margin: 0 auto 12px; display: flex; justify-content: flex-end; gap: 10px; }
  .screen-actions a, .screen-actions button { border: 1px solid #cad3df; border-radius: 8px; background: #fff; color: #344054; padding: 7px 11px; font: inherit; cursor: pointer; }
  .resume-sheet { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 13mm 14mm; background: #fff; color: #172033; box-shadow: 0 18px 50px rgba(32, 48, 71, .16); }
  .resume-sheet.is-compact { height: 297mm; overflow: hidden; padding: 9.5mm 11mm; font-size: 8.5pt; line-height: 1.38; }
  .resume-header { display: flex; justify-content: space-between; gap: 24px; padding-bottom: 8px; border-bottom: 2px solid #263b5a; }
  .eyebrow { color: #52647d; font-size: 8pt; letter-spacing: .08em; }
  h1 { margin-top: 2px; font-size: 24pt; letter-spacing: .02em; }
  .target { margin-top: 3px; color: #315f8a; font-size: 11pt; font-weight: 700; }
  .contact { display: flex; flex-direction: column; align-items: flex-end; justify-content: flex-end; font-size: 8.5pt; }
  .contact a { color: #344054; }
  .resume-section { margin-top: 10px; }
  .is-compact .resume-section { margin-top: 6px; }
  .resume-section > h2, .footer-section h2 { margin-bottom: 5px; color: #244f78; font-size: 11pt; letter-spacing: .04em; }
  .is-compact .resume-section > h2, .is-compact .footer-section h2 { margin-bottom: 3px; font-size: 9.5pt; }
  .summary-section p { font-size: 9.5pt; }
  .capabilities { display: flex; flex-wrap: wrap; gap: 5px; }
  .capabilities span { border: 1px solid #cad7e5; border-radius: 999px; padding: 2px 8px; color: #244f78; font-size: 8pt; }
  .job { margin-top: 6px; break-inside: avoid; }
  .job header { display: flex; justify-content: space-between; gap: 16px; }
  .job header span { color: #667085; white-space: nowrap; }
  ul { margin: 3px 0 0 16px; }
  li { margin-top: 2px; }
  .footer-section { display: grid; grid-template-columns: 1.3fr .8fr 1fr; gap: 12px; border-top: 1px solid #d9e1ea; padding-top: 6px; break-inside: avoid; }
  .footer-section p { display: flex; justify-content: space-between; gap: 8px; font-size: 8pt; }
  .footer-section p span { color: #667085; white-space: nowrap; }
  :global(.resume-project) { padding: 7px 0; border-top: 1px solid #e0e6ed; break-inside: avoid; }
  :global(.resume-project:first-of-type) { border-top: 0; padding-top: 2px; }
  :global(.project-head) { display: flex; justify-content: space-between; gap: 16px; }
  :global(.project-head h3) { font-size: 11pt; }
  :global(.project-role) { color: #52647d; font-size: 8pt; }
  :global(.project-meta) { display: flex; flex-direction: column; align-items: flex-end; color: #667085; font-size: 8pt; white-space: nowrap; }
  :global(.project-background) { margin-top: 4px; font-size: 8.8pt; }
  :global(.project-columns) { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 4px; }
  :global(.project-block) { margin-top: 4px; }
  :global(.project-block strong) { color: #244f78; font-size: 8.5pt; }
  :global(.project-block ul) { font-size: 8.2pt; }
  :global(.project-tags) { margin-top: 5px; color: #52647d; font-size: 8pt; }
  :global(.density-short) { display: grid; grid-template-columns: 1.2fr 1fr; gap: 12px; align-items: start; }
  :global(.density-short .project-head) { grid-column: 1 / -1; }
  :global(.density-short .project-background), :global(.short-result) { margin-top: 0; font-size: 8pt; }
  .is-compact :global(.resume-project) { padding: 4px 0; }
  .is-compact :global(.project-head h3) { font-size: 9.5pt; }
  .is-compact :global(.project-background) { margin-top: 2px; font-size: 8pt; }
  .is-compact :global(.project-columns) { gap: 9px; margin-top: 2px; }
  .is-compact :global(.project-block) { margin-top: 2px; }
  .is-compact :global(.project-block ul) { margin-top: 1px; font-size: 7.7pt; }
  .is-compact .job { margin-top: 3px; }
  .is-compact .job ul { margin-top: 1px; font-size: 7.8pt; }
  .is-compact .footer-section { margin-top: 5px; padding-top: 4px; }

  @media screen and (max-width: 850px) {
    .resume-shell { padding: 0; }
    .screen-actions { padding: 10px 12px; margin: 0; }
    .resume-sheet, .resume-sheet.is-compact { width: 100%; min-height: 0; height: auto; padding: 24px 18px; overflow: visible; box-shadow: none; }
    .resume-header, :global(.project-head) { flex-direction: column; gap: 4px; }
    .contact, :global(.project-meta) { align-items: flex-start; }
    :global(.project-columns), .footer-section, :global(.density-short) { grid-template-columns: 1fr; }
  }

  @page { size: A4; margin: 0; }
  @media print {
    :global(body.resume-output) { background: #fff; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    .resume-shell { padding: 0; }
    .screen-actions { display: none; }
    .resume-sheet { margin: 0; box-shadow: none; }
  }
</style>
```

- [ ] **Step 6: 创建三个静态路由**

```astro
---
// src/pages/resume/[variant].astro
import ResumeLayout from '../../layouts/ResumeLayout.astro';
import ResumeDocument from '../../components/resume/ResumeDocument.astro';
import { getResumeDocument, resumeVariantIds } from '../../data/resume/variants';
import type { ResumeVariantId } from '../../data/resume/types';

export function getStaticPaths() {
  return resumeVariantIds.map((variant) => ({ params: { variant }, props: { variant } }));
}

interface Props { variant: ResumeVariantId; }
const { variant } = Astro.props;
const resume = getResumeDocument(variant);
---
<ResumeLayout title={`${resume.label} · ${resume.identity.name}`} description={resume.summary}>
  <ResumeDocument resume={resume} />
</ResumeLayout>
```

- [ ] **Step 7: 运行路由合同、类型检查和构建**

Run: `npm run check && npx playwright test e2e/resume.spec.ts && npm run build`

Expected: Astro check reports `0 errors`；resume tests report `8 passed`；build emits `/resume/master/index.html`、`/resume/ai/index.html`、`/resume/b2b/index.html`。

- [ ] **Step 8: 提交简历页面**

```bash
git add src/layouts/ResumeLayout.astro src/components/resume src/pages/resume e2e/resume.spec.ts
git commit -m "feat: render master and one-page resumes"
```

### Task 3: 更新站点职业摘要与双版本下载入口

**Files:**
- Modify: `e2e/about.spec.ts:1-8`
- Modify: `src/data/profile.ts:1-29`
- Modify: `src/data/skills.ts:1-18`
- Modify: `src/pages/about.astro:1-51`

- [ ] **Step 1: 将关于页测试改为双下载合同**

```ts
// e2e/about.spec.ts
import { test, expect } from '@playwright/test';

test('about page exposes updated positioning and two resume downloads', async ({ page }) => {
  await page.goto('/about/');
  await expect(page.getByText('求职意向：AI 产品经理')).toBeVisible();
  await expect(page.getByText(/Agent 工作流用于真实产品工作/)).toBeVisible();
  await expect(page.locator('.timeline')).toBeVisible();
  await expect(page.locator('.skills')).toBeVisible();
  await expect(page.getByRole('link', { name: 'AI 产品经理版' })).toHaveAttribute('href', '/resume.pdf');
  await expect(page.getByRole('link', { name: 'B2B / SaaS 版' })).toHaveAttribute('href', '/resume-b2b-saas.pdf');
  await expect(page.locator('.cta a[download]')).toHaveCount(2);
});
```

- [ ] **Step 2: 运行测试并确认旧页面只有一个下载按钮**

Run: `npx playwright test e2e/about.spec.ts`

Expected: FAIL，找不到 `B2B / SaaS 版`。

- [ ] **Step 3: 更新站点 Profile，保留主 PDF 兼容字段**

```ts
// src/data/profile.ts
import { resumeFacts } from './resume/facts';

export interface Profile {
  name: string;
  intent: string;
  summary: string;
  typewriter: string[];
  email: string;
  links: { label: string; href: string }[];
  resumePdf: string;
  resumeDownloads: { label: string; href: string }[];
}

export const profile: Profile = {
  name: resumeFacts.identity.name,
  intent: '求职意向：AI 产品经理',
  summary: 'B 端产品经理，4 年 CRM / SaaS 与复杂系统经验；已将个人 AI Agent 工作流用于真实产品工作。',
  typewriter: [
    '企业服务产品 → AI 产品实践',
    '复杂规则 / 权限 / 数据建模',
    'Agent 工作流，真实业务自用',
  ],
  email: resumeFacts.identity.email,
  links: [
    { label: 'CSDN', href: 'https://blog.csdn.net/weixin_50178621' },
    { label: 'GitHub', href: 'https://github.com/666qqx666-jpg' },
  ],
  resumePdf: 'resume.pdf',
  resumeDownloads: [
    { label: 'AI 产品经理版', href: 'resume.pdf' },
    { label: 'B2B / SaaS 版', href: 'resume-b2b-saas.pdf' },
  ],
};
```

- [ ] **Step 4: 更新可公开且能够面试解释的能力标签**

```ts
// src/data/skills.ts
export interface SkillGroup {
  group: string;
  items: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    group: '产品能力',
    items: ['需求分析', 'CRM / SaaS', '复杂业务建模', '权限与流程设计', '数据产品', 'PRD / Spec', 'Axure 原型', '项目推动'],
  },
  { group: '技术背景', items: ['Java', 'SpringMVC', '阿里云大数据数仓', 'SQL'] },
  { group: 'AI 产品实践', items: ['Agent 工作流', 'RAG / 上下文治理', 'Claude', 'Codex', 'OpenClaw', 'Obsidian'] },
  { group: '认证', items: ['NPDP', 'PMP', '信息系统项目管理师'] },
];
```

- [ ] **Step 5: 将关于页按钮改为配置驱动的两个下载入口**

将 `src/pages/about.astro` 中原单个 PDF 链接：

```astro
<a class="btn" href={`${base}${profile.resumePdf}`} download>⬇ 下载 PDF 简历</a>
```

替换为：

```astro
{profile.resumeDownloads.map((resume, index) => (
  <a class:list={['btn', index > 0 && 'ghost']} href={`${base}${resume.href}`} download>{resume.label}</a>
))}
```

保留现有“联系我”按钮、Timeline、技能和链接章节不变。

- [ ] **Step 6: 验证关于页、首页和旧时间线没有回归**

Run: `npm run check && npx playwright test e2e/about.spec.ts e2e/home.spec.ts`

Expected: Astro check reports `0 errors`；Playwright reports `3 passed`。

- [ ] **Step 7: 提交站点入口更新**

```bash
git add src/data/profile.ts src/data/skills.ts src/pages/about.astro e2e/about.spec.ts
git commit -m "feat: expose two resume variants"
```

### Task 4: 建立可重复 PDF 导出与产物阻断

**Files:**
- Create: `e2e/resume-pdf.spec.ts`
- Create: `scripts/export-resumes.mjs`
- Modify: `package.json:1-17`
- Modify: `public/resume.pdf`
- Create: `public/resume-b2b-saas.pdf`

- [ ] **Step 1: 写 PDF 产物的失败测试**

```ts
// e2e/resume-pdf.spec.ts
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const outputs = [
  ['AI 产品经理版', 'public/resume.pdf'],
  ['B2B / SaaS 版', 'public/resume-b2b-saas.pdf'],
] as const;

for (const [label, relativePath] of outputs) {
  test(`${label} is a real generated PDF`, () => {
    const contents = readFileSync(resolve(relativePath));
    expect(contents.subarray(0, 5).toString()).toBe('%PDF-');
    expect(contents.byteLength).toBeGreaterThan(20_000);
  });
}
```

- [ ] **Step 2: 运行测试并确认占位 PDF 与缺失文件被阻断**

Run: `npx playwright test e2e/resume-pdf.spec.ts`

Expected: FAIL；AI 版体积只有 27 字节，B2B 文件不存在。

- [ ] **Step 3: 创建原子 PDF 导出脚本**

```js
// scripts/export-resumes.mjs
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdir, rename, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const host = '127.0.0.1';
const port = 4322;
const baseURL = `http://${host}:${port}`;
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const outputs = [
  { route: '/resume/ai/', file: 'public/resume.pdf' },
  { route: '/resume/b2b/', file: 'public/resume-b2b-saas.pdf' },
];

async function waitForServer() {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    try {
      const response = await fetch(baseURL);
      if (response.ok) return;
    } catch {
      // The server is still starting; retry within the bounded loop.
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 250));
  }
  throw new Error(`Astro dev server did not start at ${baseURL}`);
}

const server = spawn(
  npmCommand,
  ['run', 'dev', '--', '--host', host, '--port', String(port)],
  { stdio: 'inherit' },
);

let browser;
try {
  await waitForServer();
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 794, height: 1123 } });
  await page.emulateMedia({ media: 'print' });

  for (const output of outputs) {
    await page.goto(`${baseURL}${output.route}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    const fits = await page.locator('.resume-sheet').evaluate(
      (element) => element.scrollHeight <= element.clientHeight + 1,
    );
    if (!fits) throw new Error(`${output.route} exceeds one A4 sheet`);

    const target = resolve(output.file);
    const temporary = `${target}.tmp`;
    await mkdir(dirname(target), { recursive: true });
    await rm(temporary, { force: true });
    await page.pdf({ path: temporary, printBackground: true, preferCSSPageSize: true });
    await rename(temporary, target);
  }
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
```

- [ ] **Step 4: 增加标准命令**

将 `package.json` 的 `scripts` 改为：

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test:e2e": "playwright test",
    "resume:check": "npm run check && playwright test e2e/resume-data.spec.ts e2e/resume.spec.ts e2e/about.spec.ts e2e/resume-pdf.spec.ts",
    "resume:export": "node scripts/export-resumes.mjs"
  }
}
```

只修改 `scripts`，保留现有 `name`、`type`、版本、依赖和开发依赖。

- [ ] **Step 5: 生成两份 PDF 并重新构建静态站点**

Run: `npm run resume:export && npm run build`

Expected: `public/resume.pdf` 与 `public/resume-b2b-saas.pdf` 均生成；Astro build 成功并将两份 PDF 复制到 `dist/`。

- [ ] **Step 6: 验证 PDF 和公开下载响应**

Run: `npx playwright test e2e/resume-pdf.spec.ts e2e/about.spec.ts`

Expected: Playwright reports `3 passed`。

- [ ] **Step 7: 提交生成器和两个 PDF**

```bash
git add package.json scripts/export-resumes.mjs e2e/resume-pdf.spec.ts public/resume.pdf public/resume-b2b-saas.pdf
git commit -m "feat: generate reproducible resume PDFs"
```

### Task 5: 增加视觉回归并完成全量验收

**Files:**
- Modify: `e2e/visual.spec.ts:1-11`
- Modify: `docs/superpowers/specs/2026-07-19-resume-project-experience-design.md:5`

- [ ] **Step 1: 为两个一页版本增加固定截图**

```ts
// e2e/visual.spec.ts
import { test } from '@playwright/test';

const sitePages = ['/', '/about/'];
const sizes = [
  { w: 1280, h: 800, n: 'desktop' },
  { w: 390, h: 844, n: 'mobile' },
];

for (const path of sitePages) for (const size of sizes) for (const theme of ['light', 'dark']) {
  test(`shot ${path} ${size.n} ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: size.w, height: size.h });
    await page.addInitScript((selectedTheme) => localStorage.setItem('theme', selectedTheme), theme);
    await page.goto(path);
    await page.screenshot({ path: `test-results/${size.n}-${theme}-${path.replace(/\W/g, '_')}.png`, fullPage: true });
  });
}

for (const variant of ['ai', 'b2b']) for (const size of sizes) {
  test(`resume ${variant} ${size.n}`, async ({ page }) => {
    await page.setViewportSize({ width: size.w, height: size.h });
    await page.goto(`/resume/${variant}/`);
    await page.screenshot({ path: `test-results/resume-${variant}-${size.n}.png`, fullPage: true });
  });
}
```

- [ ] **Step 2: 运行视觉截图并逐张检查四个新增产物**

Run: `npx playwright test e2e/visual.spec.ts`

Expected: Playwright reports `12 passed`，并生成：

```text
test-results/resume-ai-desktop.png
test-results/resume-ai-mobile.png
test-results/resume-b2b-desktop.png
test-results/resume-b2b-mobile.png
```

用 `view_image` 逐张检查以下固定验收项：

- 桌面版姓名、目标岗位、摘要、能力、工作经历、项目和教育均完整显示。
- AI 版中 AI 项目视觉权重最高，B2B 版中销售线索视觉权重最高。
- A4 末尾没有内容截断；项目标题、时间和状态不重叠。
- 移动端无水平滚动，双列项目内容自然降为单列。
- 没有客户名称、手机号、地址、报价金额或生产截图。

- [ ] **Step 3: 运行完整质量门禁**

Run: `npm run resume:export && npm run resume:check && npm run build && npm run test:e2e`

Expected:

- 两份 PDF 被重新生成且产物测试通过。
- Astro check reports `0 errors`。
- Astro build succeeds。
- 全量 Playwright 测试全部通过。

- [ ] **Step 4: 更新设计 Spec 状态**

将：

```markdown
> 状态：设计已确认，等待用户复核书面 Spec
```

替换为：

```markdown
> 状态：已实施并通过内容、版式与 PDF 导出验证
```

- [ ] **Step 5: 核对提交范围**

Run: `git status --short`

Expected: 只出现本计划列出的实现文件；隔离 worktree 中不得出现主工作区原有 `.gitignore`、项目总纲、`.superpowers/` 或集团分析计划改动。

- [ ] **Step 6: 提交视觉回归和状态更新**

```bash
git add e2e/visual.spec.ts docs/superpowers/specs/2026-07-19-resume-project-experience-design.md
git commit -m "test: verify resume content and print layout"
```

## 3. 最终交付清单

- `/resume/master/`：六项目完整版内容母稿。
- `/resume/ai/`：AI 产品经理一页预览。
- `/resume/b2b/`：B2B / SaaS 产品经理一页预览。
- `public/resume.pdf`：AI 产品经理一页 PDF，继续兼容现有站点主下载入口。
- `public/resume-b2b-saas.pdf`：B2B / SaaS 一页 PDF。
- `npm run resume:export`：可重复生成两份 PDF。
- `npm run resume:check`：内容、路由、一页适配、关于页和 PDF 的集中门禁。

## 4. 不在本计划内

- 新增或重写任何项目案例 Deck。
- 自动从飞书同步公开简历。
- 将私有飞书链接或原始报价表纳入站点。
- 宣称团队已经使用个人 AI 工作台。
- 为不同岗位复制两套独立事实数据。
