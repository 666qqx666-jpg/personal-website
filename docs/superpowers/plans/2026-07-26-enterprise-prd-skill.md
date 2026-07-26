# Enterprise PRD Skill Program Implementation Plan

> **Execution governance:** Before implementation, run the shared `adaptive-orchestration` preflight. A plan records a recommended profile but does not dispatch agents or authorize execution by itself.

**Goal:** 在独立私有源码仓中交付可版本化的企业 PRD Skill 内核、企业能力包、渠道无关文档 Adapter、冷启动写审门禁和当前公司内部试点工具链。

**Architecture:** 采用一个私有 monorepo 保存通用运行时、三个企业 Skill 入口、企业能力包模板与发布工具，并把不同发布物构建成独立归档。动态 PRD 始终由原文档系统保存；本地运行时通过 Adapter 读取 revision、通过 stable manifest 原子更新，并用 Writer handoff 与全新 Reviewer 上下文实现 Blocker 门禁。

**Tech Stack:** Python 3.12、PyYAML 6.x、标准库 `dataclasses`/`unittest`/`urllib`/`zipfile`/`subprocess`、`lark-cli 1.0.66`、Markdown/YAML/JSON、Git、Claude Code/Codex Skill 目录。

**Recommended execution profile:** O3；这是跨阶段、预计超过 120 分钟、涉及新私有仓、全局 Skill 软链接、版本发布、飞书读写与多人试点的工作。执行前需要一次覆盖目标、写入范围、外部读写与回滚策略的产品语言授权；当前请求只授权写计划。

**Parallelizable workstreams:** 基础合同完成后，`Feishu Adapter` 与 `PRD workflow` 的只读实现和测试可并行；试点发布必须等待基础、Adapter 与 workflow 三者全部通过。

**Shared-write conflicts:** `pyproject.toml`、`enterprise_prd/contracts.py`、`enterprise_prd/cli.py`、`registry/stable-manifest.yaml`、`packs/company-product/pack.yaml` 及 `/Users/qqx/.agents/skills/enterprise-prd-*` 软链接只能由一个写入者串行修改。

**Stage evidence checkpoint:** `PILOT_DRY_RUN_PASS`；四份子计划的离线部分完成，`python3 -m unittest discover -s tests -v` 全绿，Skill/能力包发布物 SHA-256 与 canary manifest 一致，本地 Adapter 全链路和 Feishu Adapter 只读/并发写回夹具通过，负责人三个 Agent Skill 入口无个人路径泄漏；此 checkpoint 不代表 stable 已批准。

**Recovery entry:** 先读本计划的“子计划执行顺序”，再读取当前子计划，从首个未勾选步骤继续；恢复前只运行该子计划声明的验证命令，不读取旧对话全文。

**Authorization boundary:** 后续一次完整执行授权应覆盖：创建 `/Users/qqx/my_code_cursor/enterprise-prd-pilot` 私有本地 Git 仓、写入该仓、创建共享 Skill 软链接、构建本地发布物、对用户明确列出的飞书试点文档做只读发现与经差异确认后的单操作写回、生成不含正文的试点指标。授权不包括创建或推送远程仓、批量覆盖飞书文档、读取未列入 source catalog 的文档、向全公司推广或处理生产机密。

**Out of scope:** personal-website 运行代码、个人 Obsidian Vault 迁移、现有 `prd-writer`/`prd-review` 行为重写、多租户 Web 平台、Confluence/Notion Adapter、自动 `overwrite`、多操作非原子写回、远程仓和企业 SSO 管理。

**Potential decision boundaries:** 公司没有可用的私有发布地址时，需要在“公司 Git/对象存储”与“先做本机冒烟、不进入 4–6 人试点”之间选择；公司 AI 数据规则禁止将 PRD 正文提供给本地 Agent 时，需要在“只使用脱敏快照”与“停止当前试点”之间选择；试点负责人要扩大飞书搜索范围或启用批量写回时，必须重新确认外部读写范围。

---

## 1. 计划拆分依据

本 Spec 包含四个能独立验收的子系统。按 `writing-plans` 的 scope check，不把它们塞进一个共享文件边界不清的巨型任务，而是分成四份计划：

| 顺序 | 子计划 | 独立交付 | 依赖 |
| --- | --- | --- | --- |
| 1 | [Enterprise PRD Foundation](2026-07-26-enterprise-prd-foundation.md) | 新私有仓、合同模型、能力包校验、发布构建、stable updater、本地文档 Adapter | 无 |
| 2 | [Enterprise PRD Feishu Adapter](2026-07-26-enterprise-prd-feishu-adapter.md) | 渠道无关接口的 Feishu 实现、revision 保护、单操作差异预览与写回 | Foundation |
| 3 | [Enterprise PRD Workflow](2026-07-26-enterprise-prd-workflow.md) | 最小上下文、Writer handoff、冷启动 Reviewer、Blocker 门禁、审计与三个 Skill 入口 | Foundation；Feishu 非阻断，可先用 Local Adapter |
| 4 | [Enterprise PRD Pilot Rollout](2026-07-26-enterprise-prd-pilot-rollout.md) | 企业能力包 V0、canary/stable 发布、跨 Agent 安装、基线与 4 周试点 | Foundation + Feishu + Workflow |

每份子计划都以 `/Users/qqx/my_code_cursor/enterprise-prd-pilot` 为源码根目录。第一份计划负责在获得实施授权后创建该目录和 Git 仓；后续计划禁止再次初始化仓库。

## 2. Product Knowledge Preflight

### 2.1 实际加载

本计划按 `memory-loader` 与 `writing-plans` 的产品知识预检加载：

- `能力层/上下文加载规则/真实任务上下文加载规则.md`
- `能力层/上下文加载规则/个人知识库RAG式上下文治理规则.md`
- `正式知识域/README.md`
- `正式知识域/00-正式知识域索引.md`
- `正式知识域/工作/README.md`
- `正式知识域/工作/需求文档/README.md`
- `正式知识域/工作/技术分析/README.md`
- `正式知识域/工作/项目复盘/README.md`
- `正式知识域/工作/需求文档/PRD审查经验.md`
- `正式知识域/工作/需求文档/PRD进入原型前交互封口清单.md`
- `能力层/Skill工作流/AI产品架构语义触发与分层诊断规则.md`
- `正式知识域/工作/技术分析/上下文设计追求最小充分而非信息最多.md`

实际进入计划的正式规则为：

1. PRD 写审必须冷启动隔离，不能审共同记忆。
2. 高影响共享对象默认拒绝静默覆盖，产品行为与技术锁机制分开。
3. 上下文只加载最小充分内容，并保留来源、预算和冲突行为。
4. 模型获得读取、写入和门禁权后，必须具备权限、审计、降级与人工接管。
5. PRD 进入下游前必须先完成业务规则和用户可观察行为封口。

### 2.2 未加载

- 旧 `wiki/`：新正式知识与已批准 Spec 已足够。
- 原文层正文：当前任务是实施拆解，不需要额外历史证据。
- 竞品、报价和原型执行卡：不影响 V0 代码边界；原型前封口卡只用于确认 PRD 门禁不会自动进入原型。
- 多 Agent 协作知识正文：当前计划不派生 Agent；执行档位只记录可并行工作流。

### 2.3 风险

- 当前公司真实文档范围尚未列出，因此前三份计划只使用合成夹具；第四份计划在 live preflight 前要求明确 source catalog。
- `/Users/qqx/.agents/skills` 不是 Git 仓，不能作为源码真值源；必须采用独立 Git 源码仓加共享软链接。
- `lark-cli` 当前版本为 `1.0.66`；Adapter 通过命令与 JSON 合同测试隔离 CLI 版本漂移。

## 3. Spec-Readiness：PASS

源 Spec 没有显式 `spec-readiness` 字段，本计划按四项门禁独立检查后判定 PASS。

### 3.1 State combinations

- 发布组合定义 `stable / canary`；负责人 canary 与普通参与者 stable 各自只锁定一个任务快照，普通参与者不能选择 canary。
- 更新状态闭合为 `current / update_available / degraded_cache / blocked_force_update / failed_integrity`。
- 文档访问闭合为 `allowed / denied / unknown`，读写分别判断。
- 运行状态闭合为 `ready / degraded / blocked / drafting / reviewing / revision_required / passed / conflict`。
- 审查状态闭合为 `review-evidence: PASS|BLOCK` 与 `spec-readiness: PASS|BLOCK|NOT_ASSESSED`，Blocker 未清零不得通过。
- 离线时仅允许最后校验通过且与当前 `current` 完全一致的缓存组合；若强制更新要求的组合未安装则阻止，已安装并匹配则可降级启动。

### 3.2 Failure and concurrency

- 每个新任务先运行 `task start`：按受控配置查询负责人 canary 或参与者 stable manifest、下载并校验兼容组合、原子切换 `current`、生成不可变任务快照；版本变化时阻止继续并要求新开对话，任何失败保留上一校验通过的组合。
- HTTP/临时 CLI 错误最多重试 2 次，间隔 `0.2s / 0.5s`；权限、不存在、合同错误和校验失败不重试。
- 写回只允许单个 `str_replace`、`block_replace` 或 `block_insert_after` 操作；V0 禁止 `overwrite` 和多操作伪事务。
- 写回使用 `expected_revision`；revision 变化时拒绝覆盖并返回 `conflict`。
- Writer 或 Reviewer 重试不会重复已确认的外部写入，写回独立于内容生成。

### 3.3 Enum closure

所有运行状态、权限状态、缺失行为、审查严重度、文档操作、发布频道和 Adapter 能力在 Foundation 合同中定义为闭合枚举。多值知识来源按优先级顺序依次选择；同级冲突为人工裁决，不使用隐式 OR/AND。

### 3.4 Single source of truth

- 动态正文：企业原文档系统。
- 企业稳定规则：已发布能力包版本。
- 当前批准组合：stable manifest。
- 单次任务事实：run snapshot。
- 审查结论：review report。
- 试点指标：不含正文的 run audit records。

同一字段不在多个文件重复定义；生成的摘要、缓存和报告只引用上述真值源及其 Hash/revision。

## 4. 冻结的实施决策

为使子计划不含占位符，实施阶段采用以下确定性选择：

- V0 运行环境：macOS、Python 3.12、`lark-cli 1.0.66`、Claude Code/Codex 本地客户端。
- Python 包名：`enterprise_prd`。
- CLI：`enterprise-prd`。
- 源码根：`/Users/qqx/my_code_cursor/enterprise-prd-pilot`。
- 本地运行根：`Path.home() / ".enterprise-prd"`，产品代码中不硬编码 `/Users/qqx`。
- 发布协议：`file://` 与 `https://` registry；公司 Git raw URL 或对象存储都映射为 HTTPS。
- 配置格式：YAML；运行记录：JSON；用户产物：Markdown。
- 测试：标准库 `unittest`；不把 live Feishu 访问放入默认测试。
- Feishu 搜索/读取：`lark-cli drive +search`、`drive +inspect`、`docs +fetch`；live preflight 的 revision 只用 `outline --max-depth 0` 探针。
- Feishu 写回：只允许一条局部操作，必须先 preview，再用 `--revision-id` 提交。
- Skill 入口：`enterprise-prd-chain`、`enterprise-prd-writer`、`enterprise-prd-review`。
- 普通运行端不分发 `governance/candidates/`。

## 5. 总体文件结构

```text
/Users/qqx/my_code_cursor/enterprise-prd-pilot/
├── pyproject.toml
├── README.md
├── enterprise_prd/
│   ├── contracts.py
│   ├── errors.py
│   ├── canonical.py
│   ├── pack.py
│   ├── registry.py
│   ├── updater.py
│   ├── adapters/
│   │   ├── base.py
│   │   ├── local.py
│   │   └── feishu.py
│   ├── workflow/
│   │   ├── context.py
│   │   ├── state.py
│   │   ├── handoff.py
│   │   ├── review.py
│   │   ├── audit.py
│   │   └── metrics.py
│   └── cli.py
├── skills/
│   ├── enterprise-prd-chain/
│   ├── enterprise-prd-writer/
│   └── enterprise-prd-review/
├── packs/
│   ├── example-company/
│   └── company-product/
├── registry/
│   ├── stable-manifest.yaml
│   └── releases/
├── tests/
│   ├── fixtures/
│   ├── test_contracts.py
│   ├── test_pack.py
│   ├── test_registry.py
│   ├── test_updater.py
│   ├── test_local_adapter.py
│   ├── test_feishu_adapter.py
│   ├── test_context.py
│   ├── test_workflow.py
│   ├── test_audit.py
│   └── test_skill_invariants.py
└── docs/
    ├── adapter-contract.md
    ├── release-runbook.md
    ├── pilot-runbook.md
    └── recovery.md
```

## 6. 子计划执行顺序

### Program Task 1: Foundation

**Files:**
- Execute: `docs/superpowers/plans/2026-07-26-enterprise-prd-foundation.md`

- [ ] **Step 1: 完成 Foundation 子计划**

Run:

```bash
cd /Users/qqx/my_code_cursor/enterprise-prd-pilot
python3 -m unittest \
  tests.test_contracts \
  tests.test_pack \
  tests.test_registry \
  tests.test_updater \
  tests.test_local_adapter -v
```

Expected: 5 个测试模块全部 `OK`，并生成可校验的本地 Skill/能力包归档。

- [ ] **Step 2: 记录 `FOUNDATION_PASS`**

Run:

```bash
git tag --list FOUNDATION_PASS
git status --short
```

Expected: tag 列表含 `FOUNDATION_PASS`，工作区为空。

### Program Task 2: Feishu Adapter

**Files:**
- Execute: `docs/superpowers/plans/2026-07-26-enterprise-prd-feishu-adapter.md`

- [ ] **Step 1: 完成 Feishu Adapter 子计划**

Run:

```bash
cd /Users/qqx/my_code_cursor/enterprise-prd-pilot
python3 -m unittest tests.test_feishu_adapter -v
```

Expected: 合成 search/inspect/fetch/update 夹具全部通过，权限拒绝不重试，revision 冲突不执行 update。

- [ ] **Step 2: 记录 `FEISHU_ADAPTER_PASS`**

Run:

```bash
git tag --list FEISHU_ADAPTER_PASS
git status --short
```

Expected: tag 列表含 `FEISHU_ADAPTER_PASS`，工作区为空。

### Program Task 3: Workflow

**Files:**
- Execute: `docs/superpowers/plans/2026-07-26-enterprise-prd-workflow.md`

- [ ] **Step 1: 完成 Workflow 子计划**

Run:

```bash
cd /Users/qqx/my_code_cursor/enterprise-prd-pilot
python3 -m unittest \
  tests.test_context \
  tests.test_workflow \
  tests.test_audit \
  tests.test_skill_invariants -v
```

Expected: Writer handoff 不含隐藏对话，Reviewer context ID 与 Writer 不同，Blocker 阻止 gate，Skill 文件无个人路径。

- [ ] **Step 2: 记录 `WORKFLOW_PASS`**

Run:

```bash
git tag --list WORKFLOW_PASS
git status --short
```

Expected: tag 列表含 `WORKFLOW_PASS`，工作区为空。

### Program Task 4: Pilot rollout

**Files:**
- Execute: `docs/superpowers/plans/2026-07-26-enterprise-prd-pilot-rollout.md`

- [ ] **Step 1: 完成 Pilot Rollout 子计划的离线阶段**

Run:

```bash
cd /Users/qqx/my_code_cursor/enterprise-prd-pilot
python3 -m unittest discover -s tests -v
python3 -m enterprise_prd.cli pilot verify \
  --registry registry \
  --pack packs/company-product \
  --manifest registry/canary-manifest.yaml
```

Expected: 全测试 `OK`；pilot verify 输出 `status: ready_for_scoped_live_preflight`。

- [ ] **Step 2: 只在外部范围已确认后执行 live preflight**

执行前必须存在：

- 公司 AI 数据规则允许当前 4–6 人试点。
- `packs/company-product/sources/catalog.local.yaml` 已由负责人从明确列出的飞书 URL 生成。
- 负责人 canary 安装与本地 registry 已通过离线门禁。
- live 阶段初始权限为只读。

Run:

```bash
cd /Users/qqx/my_code_cursor/enterprise-prd-pilot
python3 -m enterprise_prd.cli pilot live-preflight \
  --pack packs/company-product \
  --read-only
```

Expected: 输出列出目标数量、可访问数量、拒绝数量和 revision 覆盖率；不返回任何正文，不执行写操作。

### Program Task 5: Final evidence checkpoint

**Files:**
- Read: `/Users/qqx/my_code_cursor/enterprise-prd-pilot`
- Create: `/Users/qqx/my_code_cursor/enterprise-prd-pilot/docs/evidence/PILOT_DRY_RUN_PASS.json`

- [ ] **Step 1: 生成最终证据**

Run:

```bash
cd /Users/qqx/my_code_cursor/enterprise-prd-pilot
python3 -m enterprise_prd.cli evidence \
  --require-tag FOUNDATION_PASS \
  --require-tag FEISHU_ADAPTER_PASS \
  --require-tag WORKFLOW_PASS \
  --manifest registry/canary-manifest.yaml \
  --output docs/evidence/PILOT_DRY_RUN_PASS.json
```

Expected: JSON 中 `status` 为 `pass`，列出 Git HEAD、三个 tag、canary manifest Hash、两个发布物 Hash 和 bootstrap wheel Hash；测试通过证据来自紧接着执行的 Step 2。

- [ ] **Step 2: 验证源码与共享安装入口**

Run:

```bash
cd /Users/qqx/my_code_cursor/enterprise-prd-pilot
python3 -m enterprise_prd.cli install verify-shared-links \
  --source "$PWD/tmp/canary-install/current/skill"
python3 -m unittest discover -s tests -v
git status --short
```

Expected: 三个共享 Skill 在 `.agents`、`.codex`、`.claude`、`.openclaw` 的入口均指向同一源码；测试 `OK`；Git 工作区为空。

- [ ] **Step 3: 提交最终计划执行证据**

Run:

```bash
git add docs/evidence/PILOT_DRY_RUN_PASS.json docs/recovery.md
git commit -m "chore: record enterprise PRD pilot dry-run evidence"
```

Expected: commit 只包含证据 JSON 与恢复说明。

## 7. 完成定义

本 Program 只有同时满足以下条件才算完成：

- 四份子计划的离线测试和 checkpoint 全部通过。
- 三个 Skill 入口可由同一源码版本安装和更新。
- stable manifest 能锁定兼容 Skill/能力包版本并回滚。
- 动态文档不被复制为第二份可编辑真值。
- Feishu Adapter 的 live preflight 只读取负责人明确列出的范围。
- Writer 与 Reviewer 的交接产物不包含 Writer 对话历史。
- Blocker、证据不足、revision 冲突和强制更新离线组合都产生确定性阻止行为。
- 运行日志不保存 PRD 正文。
- 4 周试点尚未开始时，不宣称质量指标已经达成。

## 8. Execution handoff

- 推荐执行档位：O3。
- 证据：需要创建独立私有仓、修改当前用户的共享 Skill 入口、访问明确列出的飞书文档、完成 canary/stable 发布，并组织 4–6 人的四周试点；任一事项都跨越纯本地代码边界。
- 当前授权仅覆盖这五份计划文档，不覆盖实施。
- 真正开始实施时，只需用产品语言确认一次目标、源码写入范围、共享软链接、飞书读写边界、回滚方式和不包含的远程/批量动作；范围内阶段切换不重复确认。
- 建议从 Foundation 子计划首个未勾选步骤开始，严格按 Foundation → Feishu Adapter → Workflow → Pilot Rollout 顺序执行。
