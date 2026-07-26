# Enterprise PRD Workflow Implementation Plan

> **Execution governance:** Before implementation, run the shared `adaptive-orchestration` preflight. A plan records a recommended profile but does not dispatch agents or authorize execution by itself.

**Goal:** 实现最小上下文组装、Writer 可审计交接、全新 Reviewer 上下文、Blocker 门禁、元数据审计和三个渠道无关的企业 PRD Skill 入口。

**Architecture:** Python workflow runtime 只管理确定性状态、来源、Hash、交接与门禁，不在代码中绑定模型。Agent Skill 负责对话式需求发现、写作和审查；Writer 只输出结构化 handoff，Reviewer 从该 handoff 冷启动，无法访问 Writer 的隐藏对话。

**Tech Stack:** Python 3.12、PyYAML、标准库 `dataclasses`/`unittest`/`statistics`/`json`、Markdown、Claude Code/Codex Skill。

**Recommended execution profile:** O0；核心状态、handoff 和 gate 共享类型且需要串行收敛。若在总 Program 授权内执行，仍不自动创建子 Agent。

**Parallelizable workstreams:** Skill 文案静态测试可在 workflow 合同冻结后独立进行，但默认串行以避免接口名称漂移。

**Shared-write conflicts:** `enterprise_prd/contracts.py`、`enterprise_prd/cli.py`、三个 `SKILL.md` 和 `docs/recovery.md` 只能有一个写入者。

**Stage evidence checkpoint:** `WORKFLOW_PASS`；Local Adapter 的端到端任务完成 context → writer handoff → reviewer init → review report → gate，证据不足/同 context/Blocker 均被阻止，审计 JSON 不含正文，三个 Skill 无个人路径与平台耦合。

**Recovery entry:** `docs/recovery.md` 的 `workflow_next_step`；恢复时先执行 `python3 -m unittest tests.test_context tests.test_workflow tests.test_audit tests.test_skill_invariants -v`。

**Authorization boundary:** 只修改私有源码仓中的 workflow、CLI、Skill、合成夹具和文档；允许读取 Local Adapter 夹具，不读取或写入 live Feishu，不安装共享软链接。

**Out of scope:** 模型 API、自动创建 Codex/Claude 新对话、自动批准产品决策、原型/实施计划生成、真实企业规则和团队试点。

**Potential decision boundaries:** 目标 Agent 客户端无法提供稳定会话 ID 时，需要在“使用运行时随机 context ID + 人工新开对话”与“为每个客户端开发专用会话插件”之间选择；本计划采用前者，后者超出 V0。

---

## Planning assumptions and readiness

- Foundation tag `FOUNDATION_PASS` 已存在；Feishu Adapter 可未完成，因为本计划使用 Local Adapter。
- runtime 不能证明用户真的开了新对话，只能要求 Reviewer 使用与 Writer 不同的随机 context ID，并保证 handoff 不含 Writer 对话。
- Agent 生成内容后必须写成受合同约束的 Markdown/JSON 文件；Python runtime 不保存隐藏推理。
- `review-evidence=BLOCK` 时 `spec-readiness` 固定为 `NOT_ASSESSED`。
- `spec-readiness=PASS`、`review-evidence=PASS` 且 Blocker 数量为 0 才能通过 gate。
- Major 和 Minor 不阻止 gate，但必须保留在报告中。
- 候选经验只写入治理工作区，不自动修改 stable 能力包。

## File Structure

| Path | Action | Single responsibility |
| --- | --- | --- |
| `enterprise_prd/workflow/__init__.py` | Create | Workflow 包入口。 |
| `enterprise_prd/workflow/state.py` | Create | Run 状态与合法迁移。 |
| `enterprise_prd/workflow/context.py` | Create | 知识契约加载、来源裁剪和 context-pack。 |
| `enterprise_prd/workflow/handoff.py` | Create | Writer handoff 创建、Hash 与 Reviewer 隔离校验。 |
| `enterprise_prd/workflow/review.py` | Create | 审查报告解析、Blocker gate 和候选生成。 |
| `enterprise_prd/workflow/audit.py` | Create | 不含正文的运行审计。 |
| `enterprise_prd/contracts.py` | Modify | 增加运行、handoff、review 和 gate 对象。 |
| `enterprise_prd/cli.py` | Modify | `workflow start/context/handoff/reviewer-init/gate`。 |
| `skills/enterprise-prd-chain/SKILL.md` | Modify | 企业链路入口与版本预检。 |
| `skills/enterprise-prd-writer/SKILL.md` | Create | 需求发现、写作和 handoff。 |
| `skills/enterprise-prd-review/SKILL.md` | Create | 冷启动审查与 gate。 |
| `skills/**/references/*.md` | Create | 精确产物格式和运行命令。 |
| `tests/test_context.py` | Create | 最小充分上下文、预算、缺失与冲突。 |
| `tests/test_workflow.py` | Create | 状态、handoff、review 与 gate。 |
| `tests/test_audit.py` | Create | 审计无正文与可追溯字段。 |
| `tests/test_skill_invariants.py` | Create | Skill 脱离个人 Vault、路径与渠道。 |
| `docs/workflow-contract.md` | Create | 用户可观察流程和恢复点。 |
| `docs/recovery.md` | Modify | Workflow 恢复入口。 |

### Task 1: Close workflow states and transitions

**Files:**
- Create: `enterprise_prd/workflow/__init__.py`
- Create: `enterprise_prd/workflow/state.py`
- Modify: `enterprise_prd/contracts.py`
- Create: `tests/test_workflow.py`

- [ ] **Step 1: Write failing state and gate tests**

Create the first part of `tests/test_workflow.py`:

```python
from __future__ import annotations

import unittest

from enterprise_prd.contracts import (
    ReviewEvidence,
    ReviewIssue,
    ReviewReport,
    ReviewSeverity,
    RunStatus,
    SpecReadiness,
)
from enterprise_prd.errors import ContractError
from enterprise_prd.workflow.review import evaluate_gate
from enterprise_prd.workflow.state import transition


class WorkflowStateTest(unittest.TestCase):
    def test_allowed_transitions(self) -> None:
        self.assertEqual(transition(RunStatus.READY, RunStatus.DRAFTING), RunStatus.DRAFTING)
        self.assertEqual(transition(RunStatus.DRAFTING, RunStatus.REVIEWING), RunStatus.REVIEWING)
        self.assertEqual(transition(RunStatus.REVIEWING, RunStatus.REVISION_REQUIRED), RunStatus.REVISION_REQUIRED)
        self.assertEqual(transition(RunStatus.REVIEWING, RunStatus.PASSED), RunStatus.PASSED)

    def test_invalid_transition_is_rejected(self) -> None:
        with self.assertRaises(ContractError):
            transition(RunStatus.BLOCKED, RunStatus.PASSED)

    def test_gate_requires_evidence_readiness_and_no_blocker(self) -> None:
        blocker = ReviewIssue(
            issue_id="ISSUE-001",
            severity=ReviewSeverity.BLOCKER,
            title="权限行为缺失",
            evidence_ref="prd.md#权限",
            required_change="写清拒绝结果",
        )
        report = ReviewReport(
            run_id="RUN-001",
            review_context_id="CTX-REVIEW-001",
            review_evidence=ReviewEvidence.PASS,
            spec_readiness=SpecReadiness.PASS,
            issues=(blocker,),
            reviewed_artifact_sha256="a" * 64,
        )
        decision = evaluate_gate(report)
        self.assertFalse(decision.passed)
        self.assertEqual(decision.reason_codes, ("blocker_open",))
```

- [ ] **Step 2: Run and verify the tests fail**

Run:

```bash
cd /Users/qqx/my_code_cursor/enterprise-prd-pilot
.venv/bin/python -m unittest tests.test_workflow.WorkflowStateTest -v
```

Expected: FAIL because workflow contracts and modules do not exist.

- [ ] **Step 3: Add closed workflow contracts**

Append to `enterprise_prd/contracts.py`:

```python
class RunStatus(StrEnum):
    READY = "ready"
    DEGRADED = "degraded"
    BLOCKED = "blocked"
    DRAFTING = "drafting"
    REVIEWING = "reviewing"
    REVISION_REQUIRED = "revision_required"
    PASSED = "passed"
    CONFLICT = "conflict"


class ReviewEvidence(StrEnum):
    PASS = "pass"
    BLOCK = "block"


class SpecReadiness(StrEnum):
    PASS = "pass"
    BLOCK = "block"
    NOT_ASSESSED = "not_assessed"


class ReviewSeverity(StrEnum):
    BLOCKER = "blocker"
    MAJOR = "major"
    MINOR = "minor"


@dataclass(frozen=True)
class ReviewIssue:
    issue_id: str
    severity: ReviewSeverity
    title: str
    evidence_ref: str
    required_change: str

    def validate(self) -> None:
        need(bool(re.fullmatch(r"ISSUE-\d{3}", self.issue_id)), "issue_id is invalid")
        need(type(self.severity) is ReviewSeverity, "severity is invalid")
        need(all(value.strip() for value in (self.title, self.evidence_ref, self.required_change)), "issue fields are required")


@dataclass(frozen=True)
class ReviewReport:
    run_id: str
    review_context_id: str
    review_evidence: ReviewEvidence
    spec_readiness: SpecReadiness
    issues: tuple[ReviewIssue, ...]
    reviewed_artifact_sha256: str

    def validate(self) -> None:
        need(bool(self.run_id.strip()), "run_id is required")
        need(bool(self.review_context_id.strip()), "review_context_id is required")
        need(type(self.review_evidence) is ReviewEvidence, "review_evidence is invalid")
        need(type(self.spec_readiness) is SpecReadiness, "spec_readiness is invalid")
        need(bool(HASH_RE.fullmatch(self.reviewed_artifact_sha256)), "reviewed artifact hash is invalid")
        for issue in self.issues:
            issue.validate()
        need(len({issue.issue_id for issue in self.issues}) == len(self.issues), "issue IDs must be unique")
        if self.review_evidence is ReviewEvidence.BLOCK:
            need(self.spec_readiness is SpecReadiness.NOT_ASSESSED, "evidence block requires not_assessed")


@dataclass(frozen=True)
class GateDecision:
    passed: bool
    reason_codes: tuple[str, ...]
```

- [ ] **Step 4: Implement legal transitions and gate**

Create `enterprise_prd/workflow/__init__.py` as an empty file.

Create `enterprise_prd/workflow/state.py`:

```python
from enterprise_prd.contracts import RunStatus
from enterprise_prd.errors import ContractError


ALLOWED = {
    RunStatus.READY: {RunStatus.DRAFTING, RunStatus.DEGRADED, RunStatus.BLOCKED},
    RunStatus.DEGRADED: {RunStatus.DRAFTING, RunStatus.BLOCKED},
    RunStatus.BLOCKED: {RunStatus.READY, RunStatus.DEGRADED},
    RunStatus.DRAFTING: {RunStatus.REVIEWING, RunStatus.BLOCKED, RunStatus.CONFLICT},
    RunStatus.REVIEWING: {RunStatus.REVISION_REQUIRED, RunStatus.PASSED, RunStatus.BLOCKED},
    RunStatus.REVISION_REQUIRED: {RunStatus.DRAFTING, RunStatus.BLOCKED},
    RunStatus.CONFLICT: {RunStatus.DRAFTING, RunStatus.BLOCKED},
    RunStatus.PASSED: set(),
}


def transition(current: RunStatus, target: RunStatus) -> RunStatus:
    if target not in ALLOWED[current]:
        raise ContractError(f"invalid workflow transition: {current.value}->{target.value}")
    return target
```

Create `enterprise_prd/workflow/review.py` initially with:

```python
from enterprise_prd.contracts import (
    GateDecision,
    ReviewEvidence,
    ReviewReport,
    ReviewSeverity,
    SpecReadiness,
)


def evaluate_gate(report: ReviewReport) -> GateDecision:
    report.validate()
    reasons: list[str] = []
    if report.review_evidence is ReviewEvidence.BLOCK:
        reasons.append("evidence_block")
    if report.spec_readiness is not SpecReadiness.PASS:
        reasons.append("spec_not_ready")
    if any(issue.severity is ReviewSeverity.BLOCKER for issue in report.issues):
        reasons.append("blocker_open")
    return GateDecision(passed=not reasons, reason_codes=tuple(reasons))
```

- [ ] **Step 5: Run and commit state contracts**

Run:

```bash
.venv/bin/python -m unittest tests.test_workflow.WorkflowStateTest -v
git add enterprise_prd/contracts.py enterprise_prd/workflow tests/test_workflow.py
git commit -m "feat: close enterprise PRD workflow states"
```

Expected: 3 tests pass and no transition allows `blocked -> passed`.

### Task 2: Assemble minimum-sufficient context

**Files:**
- Create: `enterprise_prd/workflow/context.py`
- Create: `tests/test_context.py`
- Create: `tests/fixtures/local-docs/decisions.md`

- [ ] **Step 1: Write failing context tests**

Create `tests/fixtures/local-docs/decisions.md`:

```markdown
# Confirmed Decisions

- D-001: 共享规则冲突时拒绝静默覆盖。
```

Create `tests/test_context.py`:

```python
from __future__ import annotations

import unittest
from pathlib import Path

from enterprise_prd.adapters.local import LocalAdapter
from enterprise_prd.errors import ContractError
from enterprise_prd.pack import load_pack
from enterprise_prd.workflow.context import DocumentRequest, assemble_context


ROOT = Path(__file__).resolve().parents[1]


class ContextTest(unittest.TestCase):
    def setUp(self) -> None:
        self.pack = load_pack(ROOT / "packs/example-company")
        self.adapter = LocalAdapter(ROOT / "tests/fixtures/local-docs")

    def test_writer_context_has_sources_budget_and_no_governance(self) -> None:
        result = assemble_context(
            self.pack,
            "writer",
            (
                DocumentRequest("current-prd", "alpha.md", True),
                DocumentRequest("confirmed-decisions", "decisions.md", True),
            ),
            self.adapter,
        )
        self.assertEqual(result.status, "ready")
        self.assertIn("Alpha PRD", result.markdown)
        self.assertIn("Example PRD Standard", result.markdown)
        self.assertNotIn("Governance-only proposals", result.markdown)
        self.assertLessEqual(result.item_count, result.contract.max_items)
        self.assertLessEqual(len(result.markdown), result.contract.max_chars)

    def test_missing_required_document_blocks(self) -> None:
        with self.assertRaises(ContractError):
            assemble_context(
                self.pack,
                "writer",
                (DocumentRequest("current-prd", "missing.md", True),),
                self.adapter,
            )
```

- [ ] **Step 2: Run and verify context tests fail**

Run:

```bash
.venv/bin/python -m unittest tests.test_context -v
```

Expected: FAIL because `workflow.context` does not exist.

- [ ] **Step 3: Implement contract loading and context assembly**

Create `enterprise_prd/workflow/context.py`:

```python
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from enterprise_prd.adapters.base import DocumentAdapter
from enterprise_prd.canonical import load_yaml
from enterprise_prd.contracts import KnowledgeContract, MissingBehavior
from enterprise_prd.errors import AccessDenied, ContractError
from enterprise_prd.pack import CapabilityPack


@dataclass(frozen=True)
class DocumentRequest:
    role: str
    document_id: str
    required: bool


@dataclass(frozen=True)
class ContextResult:
    status: str
    contract: KnowledgeContract
    markdown: str
    item_count: int
    source_revisions: tuple[tuple[str, str], ...]
    missing: tuple[str, ...]


def _contract(pack: CapabilityPack, stage: str) -> KnowledgeContract:
    raw = load_yaml(pack.root / "contracts/prd.yaml")
    entries = raw.get("contracts")
    if type(entries) is not list:
        raise ContractError("contracts must be a list")
    matches = [entry for entry in entries if entry.get("stage") == stage]
    if len(matches) != 1:
        raise ContractError(f"stage must have exactly one contract: {stage}")
    entry = matches[0]
    contract = KnowledgeContract(
        stage=entry["stage"],
        required=tuple(entry["required"]),
        optional=tuple(entry["optional"]),
        source_scopes=tuple(entry["source_scopes"]),
        authority=tuple(entry["authority"]),
        max_items=entry["max_items"],
        max_chars=entry["max_chars"],
        freshness_seconds=entry["freshness_seconds"],
        missing_behavior=MissingBehavior(entry["missing_behavior"]),
        evidence_required=entry["evidence_required"],
        writeback=entry["writeback"],
    )
    contract.validate()
    return contract


def assemble_context(
    pack: CapabilityPack,
    stage: str,
    requests: tuple[DocumentRequest, ...],
    adapter: DocumentAdapter,
) -> ContextResult:
    contract = _contract(pack, stage)
    sections: list[str] = []
    revisions: list[tuple[str, str]] = []
    missing: list[str] = []
    provided_roles: set[str] = set()
    item_count = 0
    for request in requests:
        try:
            document = adapter.read(request.document_id)
        except AccessDenied:
            if request.required:
                missing.append(request.role)
            continue
        sections.append(
            f"## Source: {request.role}\n"
            f"- id: {document.document_id}\n"
            f"- revision: {document.revision}\n"
            f"- content_sha256: {document.content_hash}\n\n"
            f"{document.content.strip()}"
        )
        revisions.append((document.document_id, document.revision))
        provided_roles.add(request.role)
        item_count += 1
    standards = sorted((pack.root / "standards").glob("*.md"))
    for standard in standards:
        sections.append(
            f"## Company standard: {standard.name}\n\n"
            f"{standard.read_text(encoding='utf-8').strip()}"
        )
        item_count += 1
    if standards:
        provided_roles.add("company-standards")
    for required_role in contract.required:
        if required_role not in provided_roles:
            missing.append(required_role)
    if missing and contract.missing_behavior is MissingBehavior.BLOCK:
        raise ContractError(f"required context is missing: {sorted(set(missing))}")
    if item_count > contract.max_items:
        raise ContractError("context item budget exceeded")
    authority = " > ".join(contract.authority)
    markdown = (
        "# Enterprise PRD Context Pack\n\n"
        f"- stage: {contract.stage}\n"
        f"- authority_order: {authority}\n\n"
        + "\n\n".join(sections)
    )
    if len(markdown) > contract.max_chars:
        raise ContractError("context character budget exceeded")
    status = "degraded" if missing else "ready"
    return ContextResult(
        status=status,
        contract=contract,
        markdown=markdown,
        item_count=item_count,
        source_revisions=tuple(revisions),
        missing=tuple(sorted(set(missing))),
    )
```

- [ ] **Step 4: Run and commit context assembly**

Run:

```bash
.venv/bin/python -m unittest tests.test_context -v
git add enterprise_prd/workflow/context.py tests/test_context.py tests/fixtures/local-docs/decisions.md
git commit -m "feat: assemble minimum enterprise PRD context"
```

Expected: 2 tests pass; candidate workspace is not loaded.

### Task 3: Create Writer handoff and enforce Reviewer isolation

**Files:**
- Create: `enterprise_prd/workflow/handoff.py`
- Modify: `enterprise_prd/contracts.py`
- Modify: `tests/test_workflow.py`

- [ ] **Step 1: Add failing handoff tests**

Append to `tests/test_workflow.py`:

```python
import json
import tempfile
from pathlib import Path

from enterprise_prd.canonical import sha256_file
from enterprise_prd.errors import IntegrityError
from enterprise_prd.workflow.handoff import create_handoff, load_for_reviewer


class HandoffTest(unittest.TestCase):
    def test_handoff_contains_artifacts_not_conversation(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            prd = root / "prd.md"
            prd.write_text("# PRD\n\n已确认规则。", encoding="utf-8")
            snapshot = root / "run-snapshot.json"
            snapshot.write_text('{"run_id":"RUN-001"}', encoding="utf-8")
            handoff_path = root / "handoff.json"
            handoff = create_handoff(
                run_id="RUN-001",
                writer_context_id="CTX-WRITER-001",
                prd_path=prd,
                context_pack_sha256="b" * 64,
                run_snapshot_path=snapshot,
                confirmed_decision_ids=("D-001",),
                unresolved_decision_ids=(),
                source_revisions=(("alpha.md", "rev-1"),),
                output=handoff_path,
            )
            raw_text = handoff_path.read_text(encoding="utf-8")
            self.assertNotIn("conversation", raw_text.casefold())
            self.assertEqual(handoff.prd_sha256, sha256_file(prd))
            loaded = load_for_reviewer(handoff_path, "CTX-REVIEW-001")
            self.assertEqual(loaded.run_id, "RUN-001")

    def test_same_context_is_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            prd = root / "prd.md"
            prd.write_text("# PRD", encoding="utf-8")
            snapshot = root / "run-snapshot.json"
            snapshot.write_text('{"run_id":"RUN-001"}', encoding="utf-8")
            handoff_path = root / "handoff.json"
            create_handoff(
                run_id="RUN-001",
                writer_context_id="CTX-SAME",
                prd_path=prd,
                context_pack_sha256="b" * 64,
                run_snapshot_path=snapshot,
                confirmed_decision_ids=(),
                unresolved_decision_ids=(),
                source_revisions=(),
                output=handoff_path,
            )
            with self.assertRaises(ContractError):
                load_for_reviewer(handoff_path, "CTX-SAME")

    def test_extra_conversation_field_is_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            prd = root / "prd.md"
            prd.write_text("# PRD", encoding="utf-8")
            snapshot = root / "run-snapshot.json"
            snapshot.write_text('{"run_id":"RUN-001"}', encoding="utf-8")
            handoff_path = root / "handoff.json"
            create_handoff(
                run_id="RUN-001",
                writer_context_id="CTX-WRITER-001",
                prd_path=prd,
                context_pack_sha256="b" * 64,
                run_snapshot_path=snapshot,
                confirmed_decision_ids=(),
                unresolved_decision_ids=(),
                source_revisions=(),
                output=handoff_path,
            )
            payload = json.loads(handoff_path.read_text(encoding="utf-8"))
            payload["conversation"] = "must not cross boundary"
            handoff_path.write_text(json.dumps(payload), encoding="utf-8")
            with self.assertRaises(ContractError):
                load_for_reviewer(handoff_path, "CTX-REVIEW-001")

    def test_changed_run_snapshot_is_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            prd = root / "prd.md"
            prd.write_text("# PRD", encoding="utf-8")
            snapshot = root / "run-snapshot.json"
            snapshot.write_text('{"run_id":"RUN-001"}', encoding="utf-8")
            handoff_path = root / "handoff.json"
            create_handoff(
                run_id="RUN-001",
                writer_context_id="CTX-WRITER-001",
                prd_path=prd,
                context_pack_sha256="b" * 64,
                run_snapshot_path=snapshot,
                confirmed_decision_ids=(),
                unresolved_decision_ids=(),
                source_revisions=(),
                output=handoff_path,
            )
            snapshot.write_text('{"run_id":"RUN-CHANGED"}', encoding="utf-8")
            with self.assertRaises(IntegrityError):
                load_for_reviewer(handoff_path, "CTX-REVIEW-001")
```

- [ ] **Step 2: Run and verify handoff tests fail**

Run:

```bash
.venv/bin/python -m unittest tests.test_workflow.HandoffTest -v
```

Expected: FAIL because `workflow.handoff` does not exist.

- [ ] **Step 3: Add the handoff contract**

Append to `enterprise_prd/contracts.py`:

```python
@dataclass(frozen=True)
class WriterHandoff:
    schema_version: int
    run_id: str
    writer_context_id: str
    prd_path: str
    prd_sha256: str
    context_pack_sha256: str
    run_snapshot_path: str
    run_snapshot_sha256: str
    confirmed_decision_ids: tuple[str, ...]
    unresolved_decision_ids: tuple[str, ...]
    source_revisions: tuple[tuple[str, str], ...]

    def validate(self) -> None:
        need(self.schema_version == 1, "handoff schema_version must be 1")
        need(bool(self.run_id.strip()) and bool(self.writer_context_id.strip()), "handoff identity is required")
        need(bool(self.prd_path.strip()), "prd_path is required")
        need(bool(HASH_RE.fullmatch(self.prd_sha256)), "prd_sha256 is invalid")
        need(bool(HASH_RE.fullmatch(self.context_pack_sha256)), "context_pack_sha256 is invalid")
        need(bool(self.run_snapshot_path.strip()), "run_snapshot_path is required")
        need(bool(HASH_RE.fullmatch(self.run_snapshot_sha256)), "run_snapshot_sha256 is invalid")
        exact_strings(self.confirmed_decision_ids, "confirmed_decision_ids", nonempty=False)
        exact_strings(self.unresolved_decision_ids, "unresolved_decision_ids", nonempty=False)
        need(
            not set(self.confirmed_decision_ids) & set(self.unresolved_decision_ids),
            "confirmed and unresolved decisions overlap",
        )
        need(
            all(len(item) == 2 and all(type(value) is str and value for value in item) for item in self.source_revisions),
            "source_revisions are invalid",
        )
```

- [ ] **Step 4: Implement content-free handoff serialization**

Create `enterprise_prd/workflow/handoff.py`:

```python
from __future__ import annotations

import json
from pathlib import Path

from enterprise_prd.canonical import sha256_file
from enterprise_prd.contracts import WriterHandoff
from enterprise_prd.errors import ContractError, IntegrityError


HANDOFF_KEYS = {
    "schema_version", "run_id", "writer_context_id", "prd_path",
    "prd_sha256", "context_pack_sha256", "run_snapshot_path", "run_snapshot_sha256",
    "confirmed_decision_ids", "unresolved_decision_ids", "source_revisions",
}


def _payload(handoff: WriterHandoff) -> dict:
    return {
        "schema_version": handoff.schema_version,
        "run_id": handoff.run_id,
        "writer_context_id": handoff.writer_context_id,
        "prd_path": handoff.prd_path,
        "prd_sha256": handoff.prd_sha256,
        "context_pack_sha256": handoff.context_pack_sha256,
        "run_snapshot_path": handoff.run_snapshot_path,
        "run_snapshot_sha256": handoff.run_snapshot_sha256,
        "confirmed_decision_ids": list(handoff.confirmed_decision_ids),
        "unresolved_decision_ids": list(handoff.unresolved_decision_ids),
        "source_revisions": [list(item) for item in handoff.source_revisions],
    }


def create_handoff(
    *,
    run_id: str,
    writer_context_id: str,
    prd_path: Path,
    context_pack_sha256: str,
    run_snapshot_path: Path,
    confirmed_decision_ids: tuple[str, ...],
    unresolved_decision_ids: tuple[str, ...],
    source_revisions: tuple[tuple[str, str], ...],
    output: Path,
) -> WriterHandoff:
    handoff = WriterHandoff(
        schema_version=1,
        run_id=run_id,
        writer_context_id=writer_context_id,
        prd_path=str(prd_path.resolve()),
        prd_sha256=sha256_file(prd_path),
        context_pack_sha256=context_pack_sha256,
        run_snapshot_path=str(run_snapshot_path.resolve()),
        run_snapshot_sha256=sha256_file(run_snapshot_path),
        confirmed_decision_ids=confirmed_decision_ids,
        unresolved_decision_ids=unresolved_decision_ids,
        source_revisions=source_revisions,
    )
    handoff.validate()
    output.write_text(json.dumps(_payload(handoff), ensure_ascii=False, indent=2), encoding="utf-8")
    return handoff


def load_for_reviewer(path: Path, review_context_id: str) -> WriterHandoff:
    raw = json.loads(path.read_text(encoding="utf-8"))
    if type(raw) is not dict or set(raw) != HANDOFF_KEYS:
        raise ContractError("Writer handoff fields are invalid")
    handoff = WriterHandoff(
        schema_version=raw["schema_version"],
        run_id=raw["run_id"],
        writer_context_id=raw["writer_context_id"],
        prd_path=raw["prd_path"],
        prd_sha256=raw["prd_sha256"],
        context_pack_sha256=raw["context_pack_sha256"],
        run_snapshot_path=raw["run_snapshot_path"],
        run_snapshot_sha256=raw["run_snapshot_sha256"],
        confirmed_decision_ids=tuple(raw["confirmed_decision_ids"]),
        unresolved_decision_ids=tuple(raw["unresolved_decision_ids"]),
        source_revisions=tuple(tuple(item) for item in raw["source_revisions"]),
    )
    handoff.validate()
    if review_context_id == handoff.writer_context_id:
        raise ContractError("Reviewer must use a fresh context ID")
    if sha256_file(Path(handoff.prd_path)) != handoff.prd_sha256:
        raise IntegrityError("PRD changed after Writer handoff")
    if sha256_file(Path(handoff.run_snapshot_path)) != handoff.run_snapshot_sha256:
        raise IntegrityError("run snapshot changed after Writer handoff")
    snapshot = json.loads(Path(handoff.run_snapshot_path).read_text(encoding="utf-8"))
    if type(snapshot) is not dict or snapshot.get("run_id") != handoff.run_id:
        raise IntegrityError("run snapshot identity does not match Writer handoff")
    return handoff
```

- [ ] **Step 5: Run and commit the handoff implementation**

Run:

```bash
.venv/bin/python -m unittest tests.test_workflow.HandoffTest -v
git add enterprise_prd/contracts.py enterprise_prd/workflow/handoff.py tests/test_workflow.py
git commit -m "feat: isolate writer and reviewer handoff"
```

Expected: 4 tests pass; serialized handoff has no field containing `conversation`, `prompt`, or `reasoning`，any injected field or changed run snapshot is rejected.

### Task 4: Parse review reports and close the Blocker gate

**Files:**
- Modify: `enterprise_prd/workflow/review.py`
- Modify: `tests/test_workflow.py`

- [ ] **Step 1: Add failing report parser tests**

Append to `tests/test_workflow.py`:

```python
from enterprise_prd.workflow.review import report_from_dict


class ReviewReportTest(unittest.TestCase):
    def test_evidence_block_forces_not_assessed(self) -> None:
        with self.assertRaises(ContractError):
            report_from_dict({
                "run_id": "RUN-001",
                "review_context_id": "CTX-REVIEW-001",
                "review_evidence": "block",
                "spec_readiness": "pass",
                "reviewed_artifact_sha256": "a" * 64,
                "issues": [],
            })

    def test_major_does_not_block_ready_report(self) -> None:
        report = report_from_dict({
            "run_id": "RUN-001",
            "review_context_id": "CTX-REVIEW-001",
            "review_evidence": "pass",
            "spec_readiness": "pass",
            "reviewed_artifact_sha256": "a" * 64,
            "issues": [{
                "issue_id": "ISSUE-001",
                "severity": "major",
                "title": "案例不足",
                "evidence_ref": "prd.md#案例",
                "required_change": "补一个已确认案例",
            }],
        })
        self.assertTrue(evaluate_gate(report).passed)
```

- [ ] **Step 2: Implement strict report parsing**

Append to `enterprise_prd/workflow/review.py`:

```python
from enterprise_prd.errors import ContractError
from enterprise_prd.contracts import ReviewIssue


REPORT_KEYS = {
    "run_id", "review_context_id", "review_evidence",
    "spec_readiness", "issues", "reviewed_artifact_sha256",
}
ISSUE_KEYS = {
    "issue_id", "severity", "title", "evidence_ref", "required_change",
}


def report_from_dict(raw: dict) -> ReviewReport:
    if type(raw) is not dict or set(raw) != REPORT_KEYS or type(raw["issues"]) is not list:
        raise ContractError("review report fields are invalid")
    issues = []
    for item in raw["issues"]:
        if type(item) is not dict or set(item) != ISSUE_KEYS:
            raise ContractError("review issue fields are invalid")
        issues.append(ReviewIssue(
            issue_id=item["issue_id"],
            severity=ReviewSeverity(item["severity"]),
            title=item["title"],
            evidence_ref=item["evidence_ref"],
            required_change=item["required_change"],
        ))
    report = ReviewReport(
        run_id=raw["run_id"],
        review_context_id=raw["review_context_id"],
        review_evidence=ReviewEvidence(raw["review_evidence"]),
        spec_readiness=SpecReadiness(raw["spec_readiness"]),
        issues=tuple(issues),
        reviewed_artifact_sha256=raw["reviewed_artifact_sha256"],
    )
    report.validate()
    return report
```

- [ ] **Step 3: Run and commit the review gate**

Run:

```bash
.venv/bin/python -m unittest \
  tests.test_workflow.WorkflowStateTest \
  tests.test_workflow.HandoffTest \
  tests.test_workflow.ReviewReportTest -v
git add enterprise_prd/workflow/review.py tests/test_workflow.py
git commit -m "feat: enforce independent PRD review gate"
```

Expected: all workflow tests pass; a Major remains visible but does not block.

### Task 5: Record audit metadata without PRD content

**Files:**
- Create: `enterprise_prd/workflow/audit.py`
- Create: `tests/test_audit.py`

- [ ] **Step 1: Write failing audit tests**

Create `tests/test_audit.py`:

```python
from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from enterprise_prd.errors import ContractError
from enterprise_prd.workflow.audit import AuditRecord, write_audit


class AuditTest(unittest.TestCase):
    def record(self) -> AuditRecord:
        return AuditRecord(
            schema_version=1,
            run_id="RUN-001",
            participant_id="PM-001",
            skill_version="0.1.0",
            pack_version="0.1.0",
            adapter="local",
            source_revisions=(("alpha.md", "rev-1"),),
            started_at="2026-07-26T12:00:00+08:00",
            completed_at="2026-07-26T12:30:00+08:00",
            final_status="passed",
            review_rounds=1,
            blocker_count=0,
            degraded_flags=(),
        )

    def test_audit_is_metadata_only(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            output = Path(raw) / "audit.json"
            write_audit(self.record(), output)
            text = output.read_text(encoding="utf-8")
            self.assertNotIn("Alpha PRD", text)
            self.assertEqual(json.loads(text)["review_rounds"], 1)

    def test_content_like_fields_are_not_part_of_contract(self) -> None:
        with self.assertRaises(TypeError):
            AuditRecord(**{**self.record().__dict__, "content": "secret"})
```

- [ ] **Step 2: Implement the audit record**

Create `enterprise_prd/workflow/audit.py`:

```python
from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from datetime import datetime
from pathlib import Path

from enterprise_prd.errors import ContractError


@dataclass(frozen=True)
class AuditRecord:
    schema_version: int
    run_id: str
    participant_id: str
    skill_version: str
    pack_version: str
    adapter: str
    source_revisions: tuple[tuple[str, str], ...]
    started_at: str
    completed_at: str
    final_status: str
    review_rounds: int
    blocker_count: int
    degraded_flags: tuple[str, ...]

    def validate(self) -> None:
        if self.schema_version != 1:
            raise ContractError("audit schema_version must be 1")
        if self.final_status not in {"blocked", "revision_required", "passed", "conflict"}:
            raise ContractError("audit final_status is invalid")
        if type(self.review_rounds) is not int or self.review_rounds < 0:
            raise ContractError("review_rounds is invalid")
        if type(self.blocker_count) is not int or self.blocker_count < 0:
            raise ContractError("blocker_count is invalid")
        start = datetime.fromisoformat(self.started_at)
        end = datetime.fromisoformat(self.completed_at)
        if start.tzinfo is None or end.tzinfo is None or end < start:
            raise ContractError("audit timestamps are invalid")


def write_audit(record: AuditRecord, output: Path) -> None:
    record.validate()
    payload = asdict(record)
    payload["source_revisions"] = [list(item) for item in record.source_revisions]
    payload["degraded_flags"] = list(record.degraded_flags)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
```

- [ ] **Step 3: Run and commit audit tests**

Run:

```bash
.venv/bin/python -m unittest tests.test_audit -v
git add enterprise_prd/workflow/audit.py tests/test_audit.py
git commit -m "feat: record metadata-only PRD audits"
```

Expected: 2 tests pass; AuditRecord has no body, prompt, response or reasoning field.

### Task 6: Add workflow CLI commands

**Files:**
- Modify: `enterprise_prd/cli.py`
- Create: `tests/fixtures/review-pass.json`
- Create: `tests/fixtures/decision-ledger.json`
- Create: `tests/fixtures/run-snapshot.json`

- [ ] **Step 1: Create a valid review fixture**

Create `tests/fixtures/review-pass.json`:

```json
{
  "run_id": "RUN-LOCAL-001",
  "review_context_id": "CTX-REVIEW-001",
  "review_evidence": "pass",
  "spec_readiness": "pass",
  "reviewed_artifact_sha256": "178a2e3ec3cdd90edc3df95cf0b8377d84d0a03d3a302adc131e42b4a308d75c",
  "issues": []
}
```

Create `tests/fixtures/decision-ledger.json`:

```json
{
  "confirmed_decision_ids": ["D-001"],
  "unresolved_decision_ids": []
}
```

Create `tests/fixtures/run-snapshot.json`:

```json
{
  "schema_version": 1,
  "run_id": "RUN-LOCAL-001",
  "status": "ready",
  "skill_version": "0.1.0",
  "pack_version": "0.1.0",
  "manifest_sha256": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  "pair_path": "local-fixture",
  "last_sync_at": "2026-07-26T12:00:00+08:00",
  "started_at": "2026-07-26T12:00:00+08:00"
}
```

- [ ] **Step 2: Add deterministic workflow commands**

Extend `enterprise_prd/cli.py` with imports:

```python
from enterprise_prd.adapters.local import LocalAdapter
from enterprise_prd.canonical import sha256_file
from enterprise_prd.workflow.context import DocumentRequest, assemble_context
from enterprise_prd.workflow.handoff import create_handoff, load_for_reviewer
from enterprise_prd.workflow.review import evaluate_gate, report_from_dict
```

Add this parser helper above `main()`:

```python
def document_request(value: str) -> DocumentRequest:
    role, separator, document_id = value.partition("=")
    if separator != "=" or not role.strip() or not document_id.strip():
        raise argparse.ArgumentTypeError("--source must be ROLE=DOCUMENT_ID")
    return DocumentRequest(role.strip(), document_id.strip(), True)
```

Add a `workflow` parser with these subcommands:

```python
    workflow = commands.add_parser("workflow")
    workflow_sub = workflow.add_subparsers(dest="workflow_command", required=True)

    context = workflow_sub.add_parser("context")
    context.add_argument("--pack", type=Path, required=True)
    context.add_argument("--documents", type=Path, required=True)
    context.add_argument("--source", type=document_request, action="append", required=True)
    context.add_argument("--stage", choices=("discovery", "writer", "reviewer"), required=True)
    context.add_argument("--output", type=Path, required=True)
    context.add_argument("--metadata-output", type=Path, required=True)

    handoff = workflow_sub.add_parser("handoff")
    handoff.add_argument("--run-id", required=True)
    handoff.add_argument("--writer-context-id", required=True)
    handoff.add_argument("--prd", type=Path, required=True)
    handoff.add_argument("--context-pack", type=Path, required=True)
    handoff.add_argument("--run-snapshot", type=Path, required=True)
    handoff.add_argument("--decision-ledger", type=Path, required=True)
    handoff.add_argument("--source-revisions", type=Path, required=True)
    handoff.add_argument("--output", type=Path, required=True)

    reviewer = workflow_sub.add_parser("reviewer-init")
    reviewer.add_argument("--handoff", type=Path, required=True)
    reviewer.add_argument("--review-context-id", required=True)

    gate = workflow_sub.add_parser("gate")
    gate.add_argument("--report", type=Path, required=True)
    gate.add_argument("--handoff", type=Path, required=True)
```

Add command handling before the unreachable assertion:

```python
    if args.command == "workflow" and args.workflow_command == "context":
        pack = load_pack(args.pack)
        result = assemble_context(
            pack,
            args.stage,
            tuple(args.source),
            LocalAdapter(args.documents),
        )
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.metadata_output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(result.markdown, encoding="utf-8")
        args.metadata_output.write_text(
            json.dumps(
                {"source_revisions": [list(item) for item in result.source_revisions]},
                ensure_ascii=False,
                indent=2,
            ),
            encoding="utf-8",
        )
        print(json.dumps({"status": result.status, "output": str(args.output), "sources": result.source_revisions}))
        return 0
    if args.command == "workflow" and args.workflow_command == "handoff":
        ledger = json.loads(args.decision_ledger.read_text(encoding="utf-8"))
        revisions = json.loads(args.source_revisions.read_text(encoding="utf-8"))
        handoff = create_handoff(
            run_id=args.run_id,
            writer_context_id=args.writer_context_id,
            prd_path=args.prd,
            context_pack_sha256=sha256_file(args.context_pack),
            run_snapshot_path=args.run_snapshot,
            confirmed_decision_ids=tuple(ledger["confirmed_decision_ids"]),
            unresolved_decision_ids=tuple(ledger["unresolved_decision_ids"]),
            source_revisions=tuple(tuple(item) for item in revisions["source_revisions"]),
            output=args.output,
        )
        print(json.dumps({"status": "pass", "handoff": str(args.output), "prd_sha256": handoff.prd_sha256}))
        return 0
    if args.command == "workflow" and args.workflow_command == "reviewer-init":
        handoff = load_for_reviewer(args.handoff, args.review_context_id)
        print(json.dumps({"status": "pass", "run_id": handoff.run_id, "prd_path": handoff.prd_path}))
        return 0
    if args.command == "workflow" and args.workflow_command == "gate":
        report = report_from_dict(json.loads(args.report.read_text(encoding="utf-8")))
        handoff = load_for_reviewer(args.handoff, report.review_context_id)
        identity_reasons = []
        if report.run_id != handoff.run_id:
            identity_reasons.append("run_id_mismatch")
        if report.reviewed_artifact_sha256 != handoff.prd_sha256:
            identity_reasons.append("artifact_hash_mismatch")
        decision = evaluate_gate(report)
        reason_codes = tuple(identity_reasons) + decision.reason_codes
        print(json.dumps({"status": "pass" if not reason_codes else "blocked", "reason_codes": reason_codes}))
        return 0 if not reason_codes else 3
```

- [ ] **Step 3: Run a Local Adapter workflow smoke**

Run:

```bash
mkdir -p tmp/workflow
.venv/bin/python -m enterprise_prd.cli workflow context \
  --pack packs/example-company \
  --documents tests/fixtures/local-docs \
  --source current-prd=alpha.md \
  --source confirmed-decisions=decisions.md \
  --stage writer \
  --output tmp/workflow/context-pack.md \
  --metadata-output tmp/workflow/context-metadata.json
cp tests/fixtures/local-docs/alpha.md tmp/workflow/prd.md
.venv/bin/python -m enterprise_prd.cli workflow handoff \
  --run-id RUN-LOCAL-001 \
  --writer-context-id CTX-WRITER-001 \
  --prd tmp/workflow/prd.md \
  --context-pack tmp/workflow/context-pack.md \
  --run-snapshot tests/fixtures/run-snapshot.json \
  --decision-ledger tests/fixtures/decision-ledger.json \
  --source-revisions tmp/workflow/context-metadata.json \
  --output tmp/workflow/handoff.json
.venv/bin/python -m enterprise_prd.cli workflow reviewer-init \
  --handoff tmp/workflow/handoff.json \
  --review-context-id CTX-REVIEW-001
.venv/bin/python -m enterprise_prd.cli workflow gate \
  --report tests/fixtures/review-pass.json \
  --handoff tmp/workflow/handoff.json
```

Expected: context, handoff, reviewer-init and gate all report `status: pass`.

- [ ] **Step 4: Commit the workflow CLI**

Run:

```bash
git add enterprise_prd/cli.py tests/fixtures/review-pass.json \
  tests/fixtures/decision-ledger.json tests/fixtures/run-snapshot.json
git commit -m "feat: expose enterprise PRD workflow CLI"
```

Expected: commit contains CLI and one review fixture.

### Task 7: Create channel-neutral Agent Skills

**Files:**
- Modify: `skills/enterprise-prd-chain/SKILL.md`
- Create: `skills/enterprise-prd-writer/SKILL.md`
- Create: `skills/enterprise-prd-writer/references/writer-output.md`
- Create: `skills/enterprise-prd-review/SKILL.md`
- Create: `skills/enterprise-prd-review/references/review-output.md`
- Create: `tests/test_skill_invariants.py`

- [ ] **Step 1: Write failing Skill invariant tests**

Create `tests/test_skill_invariants.py`:

```python
from __future__ import annotations

import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SKILLS = (
    ROOT / "skills/enterprise-prd-chain/SKILL.md",
    ROOT / "skills/enterprise-prd-writer/SKILL.md",
    ROOT / "skills/enterprise-prd-review/SKILL.md",
)
FORBIDDEN = (
    "/Users/qqx",
    "Obsidian Vault",
    "需求文档-AI",
    "MtFnf9c9jlSAELdxcaCcJp55nkc",
    "docs +update --command overwrite",
)


class SkillInvariantTest(unittest.TestCase):
    def test_all_skills_are_portable(self) -> None:
        for path in SKILLS:
            text = path.read_text(encoding="utf-8")
            self.assertIn("enterprise-prd", text)
            for marker in FORBIDDEN:
                self.assertNotIn(marker, text)

    def test_reviewer_requires_fresh_context_and_handoff(self) -> None:
        text = SKILLS[2].read_text(encoding="utf-8")
        self.assertIn("全新对话", text)
        self.assertIn("reviewer-init", text)
        self.assertIn("Do not request or inherit Writer 的完整对话", text)
        self.assertNotIn("继续沿用 Writer 对话", text)


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Run and verify Skill tests fail**

Run:

```bash
.venv/bin/python -m unittest tests.test_skill_invariants -v
```

Expected: FAIL because writer/reviewer Skill files do not exist.

- [ ] **Step 3: Write the chain and writer Skills**

Replace `skills/enterprise-prd-chain/SKILL.md`:

```markdown
---
name: enterprise-prd-chain
description: Start and route an enterprise PRD production or review task using an approved Skill/capability-pack pair.
---

# Enterprise PRD Chain

1. Generate a unique run ID and run `enterprise-prd task start --run-id <RUN-ID>` before loading project content.
2. If it exits `6` with `restart_required`, stop and ask the user to open a fresh conversation so the newly switched Skill becomes active.
3. Accept `ready` or visibly labeled `degraded`; any other failure blocks the new task.
4. Use only the Skill version, capability-pack version and pair path locked in the run snapshot.
5. Start from the configured enterprise capability pack and DocumentAdapter.
6. For discovery and drafting, invoke `enterprise-prd-writer`.
7. When Writer handoff is ready, ask the user to open a fresh conversation and invoke `enterprise-prd-review`.
8. Do not enter implementation planning until gate output is `status: pass`.

Never read personal memory paths, silently choose between conflicting enterprise facts,
or copy dynamic source documents into the capability pack.
```

Create `skills/enterprise-prd-writer/SKILL.md`:

```markdown
---
name: enterprise-prd-writer
description: Discover requirements and draft an enterprise PRD from the approved capability pack and current source documents.
---

# Enterprise PRD Writer

1. Run `enterprise-prd workflow context` for the discovery stage, passing the locked run snapshot and its `pair_path/pack`; never substitute another pack path.
2. Ask one product question at a time. Keep confirmed and unresolved decisions separate.
3. Run the writer-stage context command with the same run snapshot before drafting.
4. Write only confirmed behavior, responsibility, permission, failure result, and acceptance.
5. Mark every unresolved business decision explicitly; do not invent company facts.
6. Save the PRD and create a Writer handoff with `enterprise-prd workflow handoff`.
7. Stop. Review must happen in a new conversation through `enterprise-prd-review`.

Read `references/writer-output.md` for the exact output contract.
```

Create `skills/enterprise-prd-writer/references/writer-output.md`:

```markdown
# Writer Output

The PRD must contain:

- goal and non-goals;
- terms;
- confirmed decision ledger;
- role and permission behavior;
- normal, empty, denied, failed, conflict, retry and cancel behavior;
- acceptance matrix;
- unresolved decisions with owner;
- source document IDs and revisions;
- Skill and capability-pack versions.

The handoff contains paths, IDs, revisions and Hashes only. It never contains the
Writer conversation, hidden reasoning, model response history or personal memory.
```

- [ ] **Step 4: Write the Reviewer Skill**

Create `skills/enterprise-prd-review/SKILL.md`:

```markdown
---
name: enterprise-prd-review
description: Cold-start review an enterprise PRD and emit evidence/readiness verdicts plus a Blocker gate.
---

# Enterprise PRD Review

This Skill must run in a 全新对话.

1. Receive only the Writer handoff path and a new review context ID.
2. Run `enterprise-prd workflow reviewer-init`; stop if it rejects the context or artifact Hash.
3. Load the reviewer knowledge contract, review target, enterprise rubric and necessary project evidence.
4. Do not request or inherit Writer 的完整对话、隐藏推理或自我解释.
5. Emit `review-evidence: pass|block`.
6. If evidence is blocked, emit `spec-readiness: not_assessed`.
7. Otherwise emit `spec-readiness: pass|block` and classify every issue as blocker, major or minor.
8. Save the exact JSON contract in `references/review-output.md`.
9. Run `enterprise-prd workflow gate`; only `status: pass` can enter an implementation plan.
```

Create `skills/enterprise-prd-review/references/review-output.md`:

```markdown
# Review Output

```json
{
  "run_id": "RUN-001",
  "review_context_id": "CTX-REVIEW-001",
  "review_evidence": "pass",
  "spec_readiness": "pass",
  "reviewed_artifact_sha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "issues": [
    {
      "issue_id": "ISSUE-001",
      "severity": "major",
      "title": "短标题",
      "evidence_ref": "prd.md#章节",
      "required_change": "可验证的正文修改"
    }
  ]
}
```

Allowed severities are `blocker`, `major`, and `minor`. Do not add keys.
```

- [ ] **Step 5: Run and commit Skill invariants**

Run:

```bash
.venv/bin/python -m unittest tests.test_skill_invariants -v
git add skills tests/test_skill_invariants.py
git commit -m "feat: add portable enterprise PRD agent skills"
```

Expected: 2 tests pass; all three Skill files reference the CLI and contain no personal paths.

### Task 8: Freeze workflow documentation and checkpoint

**Files:**
- Create: `docs/workflow-contract.md`
- Modify: `docs/recovery.md`

- [ ] **Step 1: Write the workflow contract**

Create `docs/workflow-contract.md`:

```markdown
# Workflow Contract

## User-visible sequence

`update preflight → select sources → context → discovery → writer → human confirm
→ handoff → fresh reviewer → evidence/readiness verdict → gate → preview writeback`

## Blocking behavior

- Required context missing: blocked.
- Optional context missing: degraded and visible.
- Writer and Reviewer context IDs equal: blocked.
- PRD Hash changed after handoff: blocked.
- Review evidence blocked: readiness not assessed.
- Any open Blocker: gate blocked.
- Source revision changed before writeback: conflict.

## Human responsibility

The product manager confirms scope, business rules, responsibility, permissions,
conflicts and final writeback. The runtime never converts unresolved decisions into facts.
```

- [ ] **Step 2: Update recovery**

Replace `docs/recovery.md`:

```markdown
# Recovery

- phase: workflow-complete
- workflow_next_step: execute Enterprise PRD Pilot Rollout plan
- last_valid_test: python3 -m unittest tests.test_context tests.test_workflow tests.test_audit tests.test_skill_invariants -v
- external_state: no live company document read or write
- resume_rule: verify tag WORKFLOW_PASS and rerun the Local Adapter smoke
```

- [ ] **Step 3: Run the workflow evidence gate**

Run:

```bash
.venv/bin/python -m unittest \
  tests.test_context \
  tests.test_workflow \
  tests.test_audit \
  tests.test_skill_invariants -v
rg -n '/Users/qqx|Obsidian Vault|需求文档-AI|MtFnf9c9jlSAELdxcaCcJp55nkc' \
  enterprise_prd/workflow skills docs/workflow-contract.md || true
git status --short
```

Expected: all tests pass; scan is empty; only workflow documentation and recovery are uncommitted.

- [ ] **Step 4: Commit and tag `WORKFLOW_PASS`**

Run:

```bash
git add docs/workflow-contract.md docs/recovery.md
git commit -m "docs: freeze enterprise PRD workflow contract"
git tag WORKFLOW_PASS
git status --short
```

Expected: clean status and tag on the final Workflow commit.
