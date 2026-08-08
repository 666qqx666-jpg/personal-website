# 完整版简历 AI 项目重构 Implementation Plan

> **Execution governance:** Before implementation, run the shared `adaptive-orchestration` preflight. A plan records a recommended profile but does not dispatch agents or authorize execution by itself.

**Goal:** 将完整版 Markdown 简历重构为“企业产品交付 Agent Harness—企业知识与上下文平台—全渠道销售线索管理系统”三段重点项目叙事，并保持其余已确认经历完整。

**Architecture:** 以已确认设计规格为唯一业务口径，只修改一份 Markdown 母稿。先整体替换职业摘要、核心能力和 AI 产品实践，再原子替换销售线索项目，最后用结构断言、关键词断言、Pandoc 解析和 Git 差异检查验证内容完整性；不联动 DOCX、网站页面或其他简历版本。

**Tech Stack:** Markdown / Git / ripgrep / Pandoc / Python 3 标准库（只读验收断言）

**Recommended execution profile:** O0；单文件、单写入者、无独立并行流，预计 30 分钟内完成。

**Parallelizable workstreams:** none

**Shared-write conflicts:** `/Users/qqx/my_code_cursor/personal-website/docs/resume/完整版-简历.md` 必须由一个执行者顺序修改；工作区其他未提交文件不得暂存或改写。

**Stage evidence checkpoint:** `resume-ai-projects-final`；必须通过 `git diff --check`、Pandoc GFM 解析、计划内 Python 内容断言，并记录目标文件 SHA-256 与最终提交 Hash。

**Recovery entry:** `/Users/qqx/my_code_cursor/personal-website/docs/superpowers/plans/2026-08-09-resume-ai-projects-rewrite.md`；恢复时先读取本计划，再运行 `git diff -- /Users/qqx/my_code_cursor/personal-website/docs/resume/完整版-简历.md` 判断已完成到哪一项 Task。

**Authorization boundary:** 用户回复“开始实施”后，授权目标为完成本计划全部 Task；交付物仅为更新后的 `/Users/qqx/my_code_cursor/personal-website/docs/resume/完整版-简历.md`。允许读取已确认 Spec 与当前 Git 差异，使用 `apply_patch` 修改目标文件，运行本计划列出的只读验证命令，并只暂存、提交该目标文件。

**Out of scope:** 不修改 `/Users/qqx/Desktop/个人/AI产品经理-钱麒祥.docx`、其他 Markdown/DOCX 简历、个人网站页面、项目详情页、脚本、测试代码、Obsidian Vault、企业 PRD Skill 或知识库实现；不发布网站、不生成 DOCX/PDF、不推送远端；不改联系方式、教育、认证、自我评价、Java 实习和其余四个商业项目的事实正文。

**Potential decision boundaries:** 仅当实施中发现目标文件出现与已确认 Spec 冲突的新事实，或必须改动排除范围内文件才能完成交付时，才超出授权；若只是补丁锚点变化、Markdown 解析失败或关键词遗漏，均在原范围内修复，不请求新的产品决定。

---

## 计划依据与上下文

**Approved Spec:** `/Users/qqx/my_code_cursor/personal-website/docs/superpowers/specs/2026-08-09-resume-ai-projects-rewrite-design.md`

**Plan:** `/Users/qqx/my_code_cursor/personal-website/docs/superpowers/plans/2026-08-09-resume-ai-projects-rewrite.md`

**当前材料：** 已确认 Spec、当前完整版简历、用户在本对话确认的项目事实和结果口径。

**最终加载的正式知识：**

- `AI产品架构六层总览`：用于区分 Agent 工作流、上下文、控制面和运行时表达。
- `Agent产品用动态控制流替代固定流程`：用于避免把固定步骤全部包装成 Agent 自主决策。
- `PRD审查经验`：用于保留 Writer 与冷启动 Reviewer 的写审隔离逻辑。
- `上下文设计追求最小充分而非信息最多`：用于明确索引、排序、预算、冲突和溯源。

**未加载：** 旧 wiki、原文层、竞品分析、原型细节卡、多 Agent 协作卡和其他项目材料；本轮是简历单文件改写，已确认 Spec 与四张正式卡足以支持表达。

**主要风险：** 目标文件已有本对话前序修改，不能用历史版本覆盖；“约 10 个付费品牌”是现有客户规模，“门店采购/付费认领”是商业化演进设计，两者不得混写成同一收益证据；个人网站联系方式保留，但个人网站项目和职业摘要中的网站证明口径删除。

## Spec-readiness：PASS

- **状态组合：** 已验证结果、内部复用状态和未来一个月目标态已经分开；报价、原型不写团队人数或效率百分比，知识库 V2 在正式投递前按 Spec 检查。
- **失败与并发：** 本轮没有产品运行态；文件修改采用单写入者和单文件原子提交。补丁锚点变化时先读取当前差异再重放，不覆盖目标范围外内容。
- **枚举闭合：** 三个项目、七个平台、保留章节、删除文本和结果数字全部列明。“按需加载”由任务类型、项目范围、权威性、时效性和上下文预算共同限定，不是开放占位词。
- **唯一真值源：** 本计划的业务内容唯一继承已确认 Spec；当前 Markdown 简历是唯一写入目标，其他简历版本不参与同步。

### Task 1: 建立单文件修改边界

**Files:**

- Read: `/Users/qqx/my_code_cursor/personal-website/docs/superpowers/specs/2026-08-09-resume-ai-projects-rewrite-design.md`
- Inspect: `/Users/qqx/my_code_cursor/personal-website/docs/resume/完整版-简历.md:10`
- Modify later: `/Users/qqx/my_code_cursor/personal-website/docs/resume/完整版-简历.md`

- [ ] **Step 1: 重新读取已确认 Spec 与目标文件标题锚点**

Run:

```bash
sed -n '1,240p' /Users/qqx/my_code_cursor/personal-website/docs/superpowers/specs/2026-08-09-resume-ai-projects-rewrite-design.md
rg -n '^## |^### ' /Users/qqx/my_code_cursor/personal-website/docs/resume/完整版-简历.md
```

Expected: Spec 状态为“已确认”；目标文件中 `## 职业摘要`、`## AI 产品实践`、`## 工作经历`、`### 全域销售线索管理系统`、`### 多业务线企业权限体系` 和 `## 自我评价` 各出现一次。

- [ ] **Step 2: 核对工作区边界与目标文件当前差异**

Run:

```bash
git -C /Users/qqx/my_code_cursor/personal-website status --short
git -C /Users/qqx/my_code_cursor/personal-website diff -- docs/resume/完整版-简历.md
shasum -a 256 /Users/qqx/my_code_cursor/personal-website/docs/resume/完整版-简历.md
```

Expected: 可以看到工作区存在其他未提交内容；后续只修改和暂存 `docs/resume/完整版-简历.md`。记录命令输出的目标文件 SHA-256 作为修改前证据，不创建额外备份文件。

- [ ] **Step 3: 确认替换锚点唯一**

Run:

```bash
rg -c '^## 职业摘要$|^## 工作经历$' /Users/qqx/my_code_cursor/personal-website/docs/resume/完整版-简历.md
rg -c '^### 全域销售线索管理系统$|^### 多业务线企业权限体系$' /Users/qqx/my_code_cursor/personal-website/docs/resume/完整版-简历.md
```

Expected: 两条命令均输出 `2`。若不是 `2`，不得按历史行号覆盖；应重新运行标题检索，以当前唯一标题边界应用同一份确定文本。

### Task 2: 重写职业摘要、核心能力与两项 AI 项目

**Files:**

- Modify: `/Users/qqx/my_code_cursor/personal-website/docs/resume/完整版-简历.md:10`

- [ ] **Step 1: 用 `apply_patch` 整体替换 `## 职业摘要` 至 `## 工作经历` 之前的内容**

Replacement content:

```markdown
## 职业摘要

4 年以上 B2B 企业服务产品经验，覆盖 CRM、权限、经营分析、交易与会员营销等场景；擅长复杂业务建模、产品规划以及数据与研发协作。具备计算机背景，已将企业 Agent 工作流、RAG 与上下文治理用于真实产品交付，形成从需求澄清、PRD 写作与独立审查，到原型、报价和企业知识治理的完整实践。

## 核心能力

- AI Agent 产品与工作流设计
- 企业知识库、RAG 与上下文治理
- 复杂业务、规则与权限建模
- B2B / SaaS 产品规划与落地
- 数据产品设计与技术协作
- 企业 Agent 工作流与知识平台建设

## AI 产品实践

### 企业产品交付 Agent Harness

**角色：** 产品设计与架构负责人
**时间：** 2026.04–至今
**状态：** 内部复用｜持续完善工作包

**项目背景：**
早期 PRD、报价和原型能力分别沉淀在独立 Skill 中，模板、规则与经验直接写在 Skill 正文里。随着迭代增加，Skill 不断膨胀且难以维护；PRD 写作与审查处于同一对话时又会继承相同假设，涉及存量项目时还需要反复查找历史代码、文档和项目决策。

**产品判断：**
企业 Agent 不应把全部知识写死在 Skill 中，而应将稳定工作流与企业知识分离：Skill 负责流程、角色和质量门禁，企业知识库按任务提供规则、经验与项目记忆。

**本人职责：**
负责需求抽象、工作流架构、企业知识接入、质量门禁，以及 PRD、原型和报价工作包建设，并在真实产品任务中持续验证。

**关键行动：**

- 重构 PRD Skill，将企业模板、业务规则与历史经验迁移到企业知识库，按照需求发现、PRD 写作和独立审查等任务类型组装最小上下文。
- 将 PRD 生产拆分为 Writer 与冷启动 Reviewer 两个隔离工作流，避免审查阶段继承写作对话中的假设；存在关键问题时阻止文档进入后续交付。
- 增加项目依赖门控：涉及存量系统时，先识别历史代码、文档和项目决策依赖，再从企业知识库的项目记忆模块按任务加载。
- 建设原型工作流，基于已经封口的 PRD 和真实页面基线生成高保真原型，并建立原型结束后的 PRD 同步门，减少产品、UI 与前端之间的理解偏差。
- 建设报价工作流，根据需求蓝图、功能边界和交付范围生成结构化报价单，减少产品经理、项目经理和销售的人工拆分与反复核对。

**结果证据：**

- 企业知识库与 PRD 写作、独立审查工作流已由多名公司同事用于真实产品任务。
- 将 PRD 从写作到通过独立审查、达到可交付状态的周期，由近 1 个月缩短至约 2 周。
- 将 PRD、原型与报价能力封装为可复用工作包，连接需求澄清、方案设计、质量审查和商务交付。

**关键词：** 企业 Agent / PRD Writer / 独立 Review / 项目依赖门控 / 原型与报价工作流

### Enterprise Knowledge Harness｜企业知识与上下文平台

**角色：** 产品设计与架构负责人
**时间：** 2026.04–至今
**状态：** 企业复用｜持续演进

**项目背景：**
企业规范、历史项目经验和业务文档分散在不同系统中。直接把全部材料加载给模型会造成上下文膨胀、来源冲突和加载成本增加；把规则长期写在 Skill 中，又会使工作流与企业知识相互耦合，难以独立升级。

**产品判断：**
企业知识库不能只是文档集合，而应同时解决知识生产、权威治理、最小上下文组装、版本发布和失败回滚，使多个 Agent 与产品经理基于同一事实工作。

**本人职责：**
负责整体架构、历史材料迁移、候选知识治理、上下文组装和版本演进机制设计，并将能力接入真实产品工作流。

**关键行动：**

- 将知识系统拆分为原始材料、正式知识、企业能力包和 Agent 工作流；企业原始文档继续作为动态事实真值源，通用 Skill 只保留流程与质量门禁。
- 建立“材料快照—内容切分—证据片段—候选知识卡—人工裁决—正式知识”的生产链路，并参考 AI 产品经理训练营实践，对历史企业内容进行分批、增量迁移。
- 通过压缩 Skill 控制工作流加载体积，建立领域索引、任务索引和项目记忆索引，根据任务类型、项目范围和知识权威顺序加载必要知识卡。
- 引入知识卡组装与排序机制，综合相关性、权威性、时效性和上下文预算生成最小充分上下文；对弱相关、冲突、过期和缺失材料定义降级或人工确认行为。
- 使用 canary、stable、版本校验、原子切换和生产级回滚管理知识包与 Skill，在不影响 V1 使用的前提下逐步引入 V2 的索引、组装和排序能力。

**结果证据：**

- 企业知识库已与 PRD Writer、独立 Reviewer 工作流连接，并由多名公司同事用于真实产品任务。
- 将企业知识从固定 Skill 正文中解耦，使规则、案例与项目记忆能够独立维护、按任务加载和版本化演进。

**关键词：** 企业知识库 / Context Engineering / 知识候选治理 / RAG / 版本发布与回滚
```

Expected: `## 工作经历` 及其后内容仍在；页首联系方式保持原样；AI 产品实践只保留上述两个企业项目。

- [ ] **Step 2: 检查 AI 两层叙事和职业摘要一致性**

Run:

```bash
rg -n '^## 职业摘要$|^## 核心能力$|^## AI 产品实践$|^### 企业产品交付 Agent Harness$|^### Enterprise Knowledge Harness｜企业知识与上下文平台$|^## 工作经历$' /Users/qqx/my_code_cursor/personal-website/docs/resume/完整版-简历.md
rg -n '近 1 个月缩短至约 2 周|Writer 与冷启动 Reviewer|材料快照—内容切分—证据片段—候选知识卡—人工裁决—正式知识|canary、stable' /Users/qqx/my_code_cursor/personal-website/docs/resume/完整版-简历.md
```

Expected: 第一条输出六个标题且顺序正确；第二条输出四个关键证据点各一次。

### Task 3: 重写全渠道销售线索管理系统

**Files:**

- Modify: `/Users/qqx/my_code_cursor/personal-website/docs/resume/完整版-简历.md:103`

- [ ] **Step 1: 用 `apply_patch` 替换原 `### 全域销售线索管理系统` 至 `### 多业务线企业权限体系` 之前的内容**

Replacement content:

```markdown
### 全渠道销售线索管理系统

**角色：** 产品线负责人
**时间：** 2025.04–至今
**状态：** 核心链路已上线｜持续商业化演进

**项目背景：**
连锁品牌的销售线索分散在多个内容、交易和本地生活平台，长期依赖人工下载、导入和分配；大量平台门店尚未被品牌认领，线索无法及时匹配到具备服务能力的门店，也缺少跟进、回收和再次分发机制。

**本人职责：**
从 0 到 1 负责整套销售线索系统建设，主导抖音、快手、美团、小红书、高德、微信和支付宝七个平台接入，以及采集整合、任务生命周期、智能分发、公海池、自动回收和商业化演进。

**关键行动：**

- 统一七个平台的线索来源、门店和状态口径，将采集数据接入销售线索任务生命周期。
- 针对大量平台门店尚未认领、线索需要分配给就近或成交能力更强门店的问题，设计资格筛选、候选门店排序和智能分发机制。
- 结合保护期与 3 / 5 / 10 / 30 公里分阶段扩圈，并通过公海池认领和超时回收，形成可解释、可配置、可回收的责任闭环。
- 识别门店自驱力不足无法只靠分发规则解决，进一步完成品牌治理下的门店采购模式设计，并将付费认领兼容进既有智能分发、任务和回收生命周期，避免另建一套孤立购买系统。

**结果证据：**

- 现有服务覆盖约 10 个付费品牌、约 15,000 家上线门店；平台累计处理约 102.6 万条线索，当前月处理量约 10 万–30 万条。
- 某匿名客户约三个月、月均约 10 万条线索，卡券核销率由不足 49.4% 提升至 61.7%。

**关键词：** 全渠道接入 / 任务生命周期 / 智能分发 / 公海池 / 商业化演进
```

Expected: 新项目标题为“全渠道”；七个平台与完整 0 到 1 贡献边界明确；付费认领只出现在“模式设计”动作中，结果证据只陈述现有服务规模与核销率。

- [ ] **Step 2: 核对销售线索项目的事实与边界**

Run:

```bash
rg -n '从 0 到 1 负责整套销售线索系统建设|抖音、快手、美团、小红书、高德、微信和支付宝|3 / 5 / 10 / 30 公里|门店采购模式设计|102.6 万条|49.4% 提升至 61.7%' /Users/qqx/my_code_cursor/personal-website/docs/resume/完整版-简历.md
rg -n '早期多平台接入底座由前任产品负责人建设|从智能分发、任务生命周期、公海池等核心经营链路开始主导|清洗层已排期，付费认领仍在规划中' /Users/qqx/my_code_cursor/personal-website/docs/resume/完整版-简历.md
```

Expected: 第一条输出六个关键事实；第二条无输出且返回状态 `1`，表示三条旧口径均已移除。

### Task 4: 执行完整性与 Markdown 验收

**Files:**

- Test: `/Users/qqx/my_code_cursor/personal-website/docs/resume/完整版-简历.md`

- [ ] **Step 1: 运行结构和内容断言**

Run:

```bash
python3 - <<'PY'
from pathlib import Path

path = Path('/Users/qqx/my_code_cursor/personal-website/docs/resume/完整版-简历.md')
text = path.read_text(encoding='utf-8')

ordered = [
    '### 企业产品交付 Agent Harness',
    '### Enterprise Knowledge Harness｜企业知识与上下文平台',
    '## 工作经历',
    '### 全渠道销售线索管理系统',
    '### 多业务线企业权限体系',
    '### 集团经营数据分析体系',
    '### 多平台会员运营体系',
    '### 智慧停车 2.0',
    '## 自我评价',
    '## 教育经历',
    '## 认证与工具',
]
positions = [text.index(item) for item in ordered]
assert positions == sorted(positions), '项目或保留章节顺序错误'

required_once = [
    '### 企业产品交付 Agent Harness',
    '### Enterprise Knowledge Harness｜企业知识与上下文平台',
    '### 全渠道销售线索管理系统',
    '近 1 个月缩短至约 2 周',
    '从 0 到 1 负责整套销售线索系统建设',
    '抖音、快手、美团、小红书、高德、微信和支付宝',
]
for item in required_once:
    assert text.count(item) == 1, f'应且只应出现一次：{item}'

forbidden = [
    '### Personal Knowledge Harness｜个人 AI 产品工作台',
    '### qqx.life｜个人网站与 AI 辅助开发实践',
    '通过个人网站完成从需求到发布的 AI 辅助开发闭环',
    '早期多平台接入底座由前任产品负责人建设',
    '### 全域销售线索管理系统',
]
for item in forbidden:
    assert item not in text, f'仍包含旧口径：{item}'

preserved = [
    '**个人网站：** https://qqx.life',
    '### 浙江达摩网络科技有限公司｜Java 实习生',
    '### 多业务线企业权限体系',
    '### 集团经营数据分析体系',
    '### 多平台会员运营体系',
    '### 智慧停车 2.0',
    '## 自我评价',
    '## 教育经历',
    '## 认证与工具',
]
for item in preserved:
    assert item in text, f'误删保留内容：{item}'

print('resume assertions: PASS')
PY
```

Expected: 输出 `resume assertions: PASS`。任何断言失败都必须回到 Task 2 或 Task 3 修复目标文件后重跑，不得降低断言。

- [ ] **Step 2: 运行 Markdown、空白和模糊占位检查**

Run:

```bash
git -C /Users/qqx/my_code_cursor/personal-website diff --check -- docs/resume/完整版-简历.md
pandoc --from=gfm --to=plain --output=/dev/null /Users/qqx/my_code_cursor/personal-website/docs/resume/完整版-简历.md
rg -n 'TBD|TODO|待确认|约 X|若干|后续补充' /Users/qqx/my_code_cursor/personal-website/docs/resume/完整版-简历.md
```

Expected: 前两条命令返回 `0` 且无错误；第三条无输出并返回状态 `1`。简历中的“约 10 个”“约 2 周”是已经确认的估算口径，不属于占位符。

- [ ] **Step 3: 审阅最终差异，确认只改授权内容**

Run:

```bash
git -C /Users/qqx/my_code_cursor/personal-website diff -- docs/resume/完整版-简历.md
git -C /Users/qqx/my_code_cursor/personal-website diff --name-only -- docs/resume/完整版-简历.md
```

Expected: 差异覆盖前序已确认的工作经历补全，以及本计划的职业摘要、核心能力、两项 AI 项目和销售线索项目；第二条只输出 `docs/resume/完整版-简历.md`。自我评价、教育、认证、Java 实习与其余商业项目仍完整。

### Task 5: 建立最终证据检查点并提交

**Files:**

- Stage and commit only: `/Users/qqx/my_code_cursor/personal-website/docs/resume/完整版-简历.md`

- [ ] **Step 1: 只暂存目标文件并检查暂存区**

Run:

```bash
git -C /Users/qqx/my_code_cursor/personal-website add -- docs/resume/完整版-简历.md
git -C /Users/qqx/my_code_cursor/personal-website diff --cached --check
git -C /Users/qqx/my_code_cursor/personal-website diff --cached --name-only
```

Expected: `diff --cached --check` 无输出且返回 `0`；暂存文件列表只包含 `docs/resume/完整版-简历.md`。如果出现其他文件，立即取消暂存那些文件，但保留其工作区内容。

- [ ] **Step 2: 创建单文件原子提交**

Run:

```bash
git -C /Users/qqx/my_code_cursor/personal-website commit -m "docs: rewrite resume AI project portfolio"
```

Expected: 提交成功且报告仅一个文件被修改。该提交同时收口本对话中已确认但尚未提交的完整版简历前序修改。

- [ ] **Step 3: 记录最终恢复证据**

Run:

```bash
git -C /Users/qqx/my_code_cursor/personal-website show --stat --oneline --summary HEAD
git -C /Users/qqx/my_code_cursor/personal-website rev-parse HEAD
shasum -a 256 /Users/qqx/my_code_cursor/personal-website/docs/resume/完整版-简历.md
git -C /Users/qqx/my_code_cursor/personal-website status --short
```

Expected: 最新提交为 `docs: rewrite resume AI project portfolio`，提交统计只包含目标 Markdown 简历；输出最终提交 Hash 和文件 SHA-256；工作区原有其他未提交内容仍在且未被纳入提交。

## 计划自检

- **Spec 覆盖：** 三个重点项目、两层 AI 架构、目标态与结果边界、七个平台、现有规模数据、个人网站项目删除、摘要与能力一致性、其余内容保留均有对应 Task 和断言。
- **占位扫描：** 计划不包含待补实现项；目标文案中的“按任务加载”已有任务类型、项目范围、权威性、时效性和预算规则，“约”均为用户确认的简历数据口径。
- **一致性：** 项目名称、角色、时间、平台名称、PRD 周期和结果数字在替换文本与验收断言中一致；“付费品牌”与“付费认领设计”保持不同语义。
- **恢复门：** Spec 与 Plan 均使用绝对路径；授权、排除范围、决定边界、失败行为、验收命令和恢复入口完整。计划本身是实施前恢复入口，运行中通过目标文件 Git 差异定位进度。
