# Enterprise PRD Pilot Rollout Implementation Plan

> **Execution governance:** Before implementation, run the shared `adaptive-orchestration` preflight. A plan records a recommended profile but does not dispatch agents or authorize execution by itself.

**Goal:** 将已验证的 Foundation、Feishu Adapter 和 Workflow 组合成当前公司的企业能力包、可更新共享 Skill 安装、canary/stable 发布、只读 live preflight 和 4 周试点证据链。

**Architecture:** 真实公司包与通用运行时保存在同一私有源码仓但构建为独立发布物；V0 source catalog 只列负责人逐项确认的文档 ID，目录/空间只用于人工发现，不进入自动 live preflight。安装器把 stable `current/skill/<name>` 作为共享真值源，再把 Codex/Claude/OpenClaw 入口链接到共享目录；指标只读取无正文 audit 与人工评分 CSV。

**Tech Stack:** Python 3.12、PyYAML、标准库 `unittest`/`csv`/`statistics`/`pathlib`、Git、`lark-cli 1.0.66`、macOS symlink。

**Recommended execution profile:** O3；本子计划涉及全局 Skill 入口、公司飞书范围、发布地址和 4–6 人试点。首次 live 操作前必须已有一次明确授权，后续在同一 source catalog 和只读边界内不重复询问。

**Parallelizable workstreams:** 基线 PRD 评分与安装器离线测试可独立进行；真实能力包发布、shared links 和 live preflight 必须串行。

**Shared-write conflicts:** `packs/company-product/**`、`registry/stable-manifest.yaml`、`~/.agents/skills/enterprise-prd-*`、三套 Agent 私有入口和试点 audit 目录只能有一个发布者写入。

**Stage evidence checkpoint:** `PILOT_DRY_RUN_PASS`；全仓 tests 通过，company pack/Skill ZIP Hash 与 canary manifest 一致，负责人 shared links 指向同一 canary source，live preflight 只输出元数据/revision 覆盖率、revision 探针固定为 outline depth 0 且未读取范围外文档，试点 runbook 与基线模板完整。此 checkpoint 不生成或宣称 stable。

**Recovery entry:** `docs/recovery.md` 的 `pilot_next_step`；离线阶段恢复时验证 canary manifest Hash、负责人共享链接目标和 Git HEAD；live canary 后再验证 stable promotion evidence 与最近一次 live preflight JSON。

**Authorization boundary:** 在总 Program 的执行授权内，可以写私有源码仓、构建发布物、更新当前用户的共享 Skill 软链接，并对 source catalog 中明确列出的飞书文档执行只读 preflight；单次写回必须由产品经理查看差异后确认。不得创建/推送远程仓、扩大 source catalog、批量覆盖文档或自动邀请同事。

**Out of scope:** 公司完整知识库重构、全公司推广、真实业务正文提交到 Git、自动收集聊天记录、平台后台、外部客户复制和第二个文档 Adapter。

**Potential decision boundaries:** 没有公司可访问 registry URL、公司 AI 数据政策不允许当前文档进入 Agent、live preflight 权限覆盖率低于 80%、或 canary 出现权限/覆盖事故时，必须在修正基础设施后继续与停止当前试点之间选择。

---

## Planning assumptions and readiness

- `FOUNDATION_PASS`、`FEISHU_ADAPTER_PASS`、`WORKFLOW_PASS` 三个 tag 已存在。
- 当前公司能力包 V0 由试点负责人发布；产品负责人审批是试点后的治理升级。
- company pack 初始稳定规则只包含已确认的 PRD 质量底线，不把历史 PRD 自动升级为规范。
- 真实 source catalog 在负责人确认数据范围后生成；生成前所有命令使用合成夹具。
- canary 先由试点负责人完成至少 1 份真实 PRD；无 P0/P1 数据或覆盖事故后才能 stable。
- stable 后参与者为 4–6 人、4 周、8–12 份 PRD。
- 质量指标用于内部 go/iterate/stop，不宣称统计学外推。

## File Structure

| Path | Action | Single responsibility |
| --- | --- | --- |
| `enterprise_prd/install.py` | Create | stable Skill 到 shared/agent-private 目录的安全软链接。 |
| `enterprise_prd/task_start.py` | Create | 新任务自动同步 stable、离线回退和不可热更新的任务快照。 |
| `enterprise_prd/pilot.py` | Create | source catalog 生成、只读 live preflight 和离线 ready 校验。 |
| `enterprise_prd/evidence.py` | Create | 汇总 tag、测试、manifest 与发布物 Hash。 |
| `enterprise_prd/workflow/metrics.py` | Create | 试点质量、效率、采用和离散度指标。 |
| `enterprise_prd/cli.py` | Modify | `install`、`pilot`、`evidence`、`update status`。 |
| `packs/company-product/**` | Create | 当前公司 V0 能力包；不包含动态 PRD 正文。 |
| `registry/canary-manifest.yaml` | Create | 试点负责人先用的版本组合。 |
| `registry/stable-manifest.yaml` | Modify at live promotion | 真实 canary 通过后才生成的全员组合。 |
| `registry/bootstrap/*.whl` | Create | 每位参与者一次安装的轻量 bootstrap；后续运行转发到 stable runtime。 |
| `tests/test_install.py` | Create | 软链接、冲突与同源校验。 |
| `tests/test_task_start.py` | Create | 自动同步、重开提示、离线缓存和快照锁定。 |
| `tests/test_pilot.py` | Create | source catalog 与 metadata-only preflight。 |
| `tests/test_metrics.py` | Create | 指标公式、阈值与小样本取整。 |
| `tests/test_evidence.py` | Create | tag/Hash/manifest 证据完整性。 |
| `pilot/templates/baseline.csv` | Create | 历史基线评分列定义。 |
| `pilot/templates/observation.csv` | Create | 试点人工评分与继续使用意愿。 |
| `docs/pilot-runbook.md` | Create | canary、stable、4 周节奏和退出条件。 |
| `docs/release-runbook.md` | Create | 构建、发布、回滚和强制停用。 |
| `docs/recovery.md` | Modify | 最终恢复入口。 |

### Task 1: Install one channel-current Skill source across Agent clients

**Files:**
- Create: `enterprise_prd/install.py`
- Create: `tests/test_install.py`

- [ ] **Step 1: Write failing installer tests**

Create `tests/test_install.py`:

```python
from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from enterprise_prd.errors import ContractError
from enterprise_prd.install import install_shared_links, verify_shared_links


SKILLS = ("enterprise-prd-chain", "enterprise-prd-writer", "enterprise-prd-review")


class InstallTest(unittest.TestCase):
    def test_all_clients_point_to_one_shared_source(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            source = root / "current/skill"
            for name in SKILLS:
                (source / name).mkdir(parents=True)
                (source / name / "SKILL.md").write_text(f"# {name}", encoding="utf-8")
            home = root / "home"
            install_shared_links(source, home=home)
            result = verify_shared_links(source, home=home)
            self.assertEqual(result, {name: True for name in SKILLS})
            for name in SKILLS:
                shared = home / ".agents/skills" / name
                self.assertEqual(shared.resolve(), (source / name).resolve())

    def test_existing_real_directory_is_never_overwritten(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            source = root / "source"
            for name in SKILLS:
                (source / name).mkdir(parents=True)
                (source / name / "SKILL.md").write_text(f"# {name}", encoding="utf-8")
            conflict = root / "home/.agents/skills/enterprise-prd-chain"
            conflict.mkdir(parents=True)
            with self.assertRaises(ContractError):
                install_shared_links(source, home=root / "home")
```

- [ ] **Step 2: Run and verify installer tests fail**

Run:

```bash
cd /Users/qqx/my_code_cursor/enterprise-prd-pilot
.venv/bin/python -m unittest tests.test_install -v
```

Expected: FAIL because `enterprise_prd.install` does not exist.

- [ ] **Step 3: Implement guarded shared links**

Create `enterprise_prd/install.py`:

```python
from __future__ import annotations

import os
from pathlib import Path

from .errors import ContractError


SKILLS = ("enterprise-prd-chain", "enterprise-prd-writer", "enterprise-prd-review")
CLIENT_ROOTS = (".codex", ".claude", ".openclaw")


def _replace_link(path: Path, target: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists() and not path.is_symlink():
        raise ContractError(f"refusing to overwrite real path: {path}")
    if path.is_symlink():
        path.unlink()
    path.symlink_to(target)


def install_shared_links(source: Path, *, home: Path | None = None) -> None:
    source = Path(os.path.abspath(source.expanduser()))
    home = (home or Path.home()).resolve()
    for name in SKILLS:
        skill_source = source / name
        if not (skill_source / "SKILL.md").is_file():
            raise ContractError(f"missing Skill source: {skill_source}")
        shared = home / ".agents/skills" / name
        _replace_link(shared, skill_source)
        for client_root in CLIENT_ROOTS:
            _replace_link(home / client_root / "skills" / name, shared)


def verify_shared_links(source: Path, *, home: Path | None = None) -> dict[str, bool]:
    source = Path(os.path.abspath(source.expanduser()))
    home = (home or Path.home()).resolve()
    result = {}
    for name in SKILLS:
        expected = (source / name).resolve()
        paths = [home / ".agents/skills" / name]
        paths.extend(home / client / "skills" / name for client in CLIENT_ROOTS)
        result[name] = all(path.is_symlink() and path.resolve() == expected for path in paths)
    return result
```

Append this installer test; it proves links follow the stable `current` indirection instead of pinning the version that existed during installation:

```python
    def test_shared_links_follow_current_after_atomic_switch(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            versions = root / "install/versions"
            for version in ("v1", "v2"):
                for name in SKILLS:
                    path = versions / version / "skill" / name
                    path.mkdir(parents=True)
                    (path / "SKILL.md").write_text(f"# {name} {version}", encoding="utf-8")
            current = root / "install/current"
            current.parent.mkdir(parents=True, exist_ok=True)
            current.symlink_to(Path("versions/v1"))
            home = root / "home"
            install_shared_links(current / "skill", home=home)
            current.unlink()
            current.symlink_to(Path("versions/v2"))
            result = verify_shared_links(current / "skill", home=home)
            self.assertTrue(all(result.values()))
            self.assertIn(
                "v2",
                (home / ".agents/skills/enterprise-prd-chain/SKILL.md").read_text(encoding="utf-8"),
            )
```

- [ ] **Step 4: Run and commit installer tests**

Run:

```bash
.venv/bin/python -m unittest tests.test_install -v
git add enterprise_prd/install.py tests/test_install.py
git commit -m "feat: install one shared enterprise PRD skill source"
```

Expected: 3 tests pass; existing real directories are never removed or overwritten, and one stable `current` switch updates every Agent entry.

### Task 2: Create the current-company V0 capability pack

**Files:**
- Create: `packs/company-product/pack.yaml`
- Create: `packs/company-product/contracts/prd.yaml`
- Create: `packs/company-product/standards/prd-quality-baseline.md`
- Create: `packs/company-product/standards/authority.md`
- Create: `packs/company-product/cases/index.yaml`
- Create: `packs/company-product/sources/catalog.yaml`
- Create: `packs/company-product/governance/candidates/README.md`

- [ ] **Step 1: Create the pack manifest**

Create `packs/company-product/pack.yaml`:

```yaml
schema_version: 1
pack_id: company-product
version: 0.1.0
compatible_skill: ">=0.2.0,<1.0.0"
published_by: pilot-owner
published_at: "2026-07-26T12:00:00+08:00"
runtime_paths:
  - contracts
  - standards
  - cases
  - sources
```

- [ ] **Step 2: Copy the already-tested knowledge contracts**

Copy `packs/example-company/contracts/prd.yaml` to `packs/company-product/contracts/prd.yaml`, then change no fields. The contracts are generic workflow behavior; company-specific facts enter standards and source catalog.

Run:

```bash
mkdir -p packs/company-product/contracts
cp packs/example-company/contracts/prd.yaml packs/company-product/contracts/prd.yaml
cmp packs/example-company/contracts/prd.yaml packs/company-product/contracts/prd.yaml
```

Expected: `cmp` exits 0.

- [ ] **Step 3: Write the approved V0 quality and authority standards**

Create `packs/company-product/standards/prd-quality-baseline.md`:

```markdown
# PRD Quality Baseline V0

- Every business rule states trigger, rule, observable result, failure result, and acceptance.
- Scope, non-goals, terms, roles, permissions, empty states, denial, failure, conflict, retry, and cancellation are explicit when applicable.
- Unconfirmed decisions remain visibly unconfirmed and name the decision owner.
- Shared high-impact edits reject silent overwrite unless the PRD records an approved exception and recovery boundary.
- A PRD cannot enter implementation planning while review evidence is blocked, readiness is not passed, or any Blocker remains open.
- Every run records Skill version, capability-pack version, source IDs, revisions, and degraded state.
```

Create `packs/company-product/standards/authority.md`:

```markdown
# Enterprise Knowledge Authority V0

1. Current project decisions explicitly confirmed by the responsible product manager.
2. Published company standards in this capability-pack version.
3. Tagged historical cases with an explicit applicable scope.
4. General product methods.

Same-tier conflicts require a product-manager decision. Governance candidates have
no runtime authority until a later stable release.
```

- [ ] **Step 4: Create empty-but-closed case and source catalogs**

Create `packs/company-product/cases/index.yaml`:

```yaml
schema_version: 1
cases: []
```

Create `packs/company-product/sources/catalog.yaml`:

```yaml
schema_version: 1
mode: requires-scoped-local-catalog
allowed_adapters: [feishu]
local_catalog: catalog.local.yaml
```

Create `packs/company-product/governance/candidates/README.md`:

```markdown
# Governance Candidates

Each candidate must record source, applicable scope, proposed rule, evidence,
owner, canary result, and publish decision. This directory is excluded from
runtime release archives.
```

- [ ] **Step 5: Validate and commit the company pack**

Run:

```bash
.venv/bin/python -m enterprise_prd.cli pack validate --path packs/company-product
rg -n '/Users/qqx|Obsidian Vault|https://.*feishu|docx_[A-Za-z0-9]+' packs/company-product || true
git add packs/company-product
git commit -m "feat: add company product capability pack v0"
```

Expected: validation passes; scan returns no personal path or live document token; candidates are excluded from runtime files.

### Task 3: Configure source scope without committing dynamic documents

**Files:**
- Create: `enterprise_prd/pilot.py`
- Create: `tests/test_pilot.py`
- Modify: `enterprise_prd/cli.py`

- [ ] **Step 1: Write failing source-catalog tests**

Create `tests/test_pilot.py`:

```python
from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from enterprise_prd.errors import ContractError
from enterprise_prd.pilot import SourceTarget, write_local_catalog


class PilotCatalogTest(unittest.TestCase):
    def test_catalog_has_explicit_targets_only(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            output = Path(raw) / "catalog.local.yaml"
            write_local_catalog(
                (
                    SourceTarget("prd-alpha", "document", "docx_alpha"),
                    SourceTarget("prd-beta", "document", "docx_beta"),
                ),
                output,
            )
            text = output.read_text(encoding="utf-8")
            self.assertIn("docx_alpha", text)
            self.assertIn("docx_beta", text)
            self.assertNotIn("query_all", text)

    def test_duplicate_or_empty_target_is_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            with self.assertRaises(ContractError):
                write_local_catalog(
                    (
                        SourceTarget("same", "document", "docx_alpha"),
                        SourceTarget("same", "document", "docx_alpha"),
                    ),
                    Path(raw) / "catalog.local.yaml",
                )
```

- [ ] **Step 2: Implement explicit source targets**

Create `enterprise_prd/pilot.py`:

```python
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import yaml

from .errors import ContractError


@dataclass(frozen=True)
class SourceTarget:
    source_id: str
    kind: str
    token: str

    def validate(self) -> None:
        if not self.source_id or self.kind != "document" or not self.token:
            raise ContractError("source target is invalid")


def write_local_catalog(targets: tuple[SourceTarget, ...], output: Path) -> None:
    if not targets:
        raise ContractError("at least one explicit source target is required")
    for target in targets:
        target.validate()
    identities = {(target.kind, target.token) for target in targets}
    if len(identities) != len(targets):
        raise ContractError("source targets must be unique")
    payload = {
        "schema_version": 1,
        "adapter": "feishu",
        "identity": "user",
        "targets": [
            {"source_id": target.source_id, "kind": target.kind, "token": target.token}
            for target in targets
        ],
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(yaml.safe_dump(payload, allow_unicode=True, sort_keys=False), encoding="utf-8")
```

- [ ] **Step 3: Add the closed interactive configuration command**

Add this import to `enterprise_prd/cli.py`:

```python
from enterprise_prd.errors import ContractError
from enterprise_prd.pilot import SourceTarget, write_local_catalog
```

Add this parser to the existing `main()`:

```python
    pilot = commands.add_parser("pilot")
    pilot_sub = pilot.add_subparsers(dest="pilot_command", required=True)
    configure_source = pilot_sub.add_parser("configure-source")
    configure_source.add_argument("--output", type=Path, required=True)
```

Add this handler before the unreachable assertion:

```python
    if args.command == "pilot" and args.pilot_command == "configure-source":
        expected_output = Path("packs/company-product/sources/catalog.local.yaml").resolve()
        if args.output.resolve() != expected_output:
            raise ContractError(f"source catalog output must be {expected_output}")
        targets = []
        while True:
            source_id = input("source id (empty to finish): ").strip()
            if not source_id:
                break
            token = input("canonical document token: ").strip()
            targets.append(SourceTarget(source_id, "document", token))
        write_local_catalog(tuple(targets), args.output)
        print(json.dumps({"status": "pass", "targets": len(targets), "output": str(args.output)}))
        return 0
```

The command writes only explicit document IDs to the ignored local catalog. Folder/space discovery remains a manual scope-selection step and never becomes an implicit recursive read.

Use this exact command interface:

```bash
.venv/bin/python -m enterprise_prd.cli pilot configure-source \
  --output packs/company-product/sources/catalog.local.yaml
```

- [ ] **Step 4: Test and commit catalog code**

Run:

```bash
.venv/bin/python -m unittest tests.test_pilot.PilotCatalogTest -v
git check-ignore packs/company-product/sources/catalog.local.yaml
git add enterprise_prd/pilot.py enterprise_prd/cli.py tests/test_pilot.py
git commit -m "feat: configure explicit enterprise document scope"
```

Expected: 2 tests pass; `catalog.local.yaml` is ignored by Git. If `git check-ignore` fails, add that exact path to the repository `.gitignore` and include the `.gitignore` change in this commit.

### Task 4: Compute the frozen pilot metrics

**Files:**
- Create: `enterprise_prd/workflow/metrics.py`
- Create: `tests/test_metrics.py`
- Create: `pilot/templates/baseline.csv`
- Create: `pilot/templates/observation.csv`

- [ ] **Step 1: Write failing metric tests**

Create `tests/test_metrics.py`:

```python
from __future__ import annotations

import unittest

from enterprise_prd.workflow.metrics import PilotObservation, summarize_pilot


class MetricsTest(unittest.TestCase):
    def test_quality_efficiency_and_adoption_thresholds(self) -> None:
        baseline_scores = (60.0, 70.0, 80.0, 90.0)
        observations = tuple(
            PilotObservation(
                document_id=f"PRD-{index}",
                participant_id=f"PM-{(index % 4) + 1}",
                quality_score=82.0 + index,
                revision_rounds=1 if index < 8 else 2,
                blocker_escape=0,
                cycle_minutes=70.0,
                baseline_cycle_minutes=100.0,
                willing_to_continue=index < 8,
            )
            for index in range(10)
        )
        result = summarize_pilot(baseline_scores, observations)
        self.assertEqual(result["documents"], 10)
        self.assertEqual(result["pass_within_one_revision"], 0.8)
        self.assertEqual(result["blocker_escapes"], 0)
        self.assertEqual(result["cycle_reduction"], 0.3)
        self.assertEqual(result["continuation_rate"], 0.8)
        self.assertTrue(result["go_candidate"])

    def test_small_sample_does_not_claim_external_proof(self) -> None:
        result = summarize_pilot((60.0, 80.0), (
            PilotObservation("PRD-1", "PM-1", 90.0, 1, 0, 70.0, 100.0, True),
        ))
        self.assertFalse(result["go_candidate"])
        self.assertEqual(result["interpretation"], "internal_directional_only")
```

- [ ] **Step 2: Implement metric formulas**

Create `enterprise_prd/workflow/metrics.py`:

```python
from __future__ import annotations

import statistics
from dataclasses import dataclass

from enterprise_prd.errors import ContractError


@dataclass(frozen=True)
class PilotObservation:
    document_id: str
    participant_id: str
    quality_score: float
    revision_rounds: int
    blocker_escape: int
    cycle_minutes: float
    baseline_cycle_minutes: float
    willing_to_continue: bool


def summarize_pilot(
    baseline_scores: tuple[float, ...],
    observations: tuple[PilotObservation, ...],
) -> dict:
    if len(baseline_scores) < 2 or not observations:
        raise ContractError("pilot metrics need baseline and observations")
    scores = tuple(item.quality_score for item in observations)
    baseline_dispersion = statistics.pstdev(baseline_scores)
    pilot_dispersion = statistics.pstdev(scores) if len(scores) > 1 else 0.0
    dispersion_reduction = (
        0.0 if baseline_dispersion == 0
        else round((baseline_dispersion - pilot_dispersion) / baseline_dispersion, 4)
    )
    pass_rate = round(sum(item.revision_rounds <= 1 for item in observations) / len(observations), 4)
    blocker_escapes = sum(item.blocker_escape for item in observations)
    cycle_reductions = tuple(
        (item.baseline_cycle_minutes - item.cycle_minutes) / item.baseline_cycle_minutes
        for item in observations
        if item.baseline_cycle_minutes > 0
    )
    cycle_reduction = round(statistics.median(cycle_reductions), 4)
    continuation = round(sum(item.willing_to_continue for item in observations) / len(observations), 4)
    go = (
        len(observations) >= 8
        and pass_rate >= 0.8
        and blocker_escapes == 0
        and dispersion_reduction >= 0.3
        and cycle_reduction >= 0.3
        and continuation >= 0.7
    )
    return {
        "documents": len(observations),
        "pass_within_one_revision": pass_rate,
        "blocker_escapes": blocker_escapes,
        "dispersion_reduction": dispersion_reduction,
        "cycle_reduction": cycle_reduction,
        "continuation_rate": continuation,
        "go_candidate": go,
        "interpretation": "internal_directional_only",
    }
```

- [ ] **Step 3: Create exact CSV templates**

Create `pilot/templates/baseline.csv`:

```csv
document_id,participant_id,quality_score,review_rounds,cycle_minutes
```

Create `pilot/templates/observation.csv`:

```csv
document_id,participant_id,quality_score,revision_rounds,blocker_escape,cycle_minutes,baseline_cycle_minutes,willing_to_continue
```

- [ ] **Step 4: Run and commit metric contracts**

Run:

```bash
.venv/bin/python -m unittest tests.test_metrics -v
git add enterprise_prd/workflow/metrics.py tests/test_metrics.py pilot/templates
git commit -m "feat: calculate enterprise PRD pilot metrics"
```

Expected: 2 tests pass; results remain labeled `internal_directional_only`.

### Task 5: Build the canary release and updater status

**Files:**
- Modify: `enterprise_prd/cli.py`
- Modify: `enterprise_prd/updater.py`
- Create: `enterprise_prd/task_start.py`
- Modify: `tests/test_updater.py`
- Modify: `tests/test_install.py`
- Create: `tests/test_task_start.py`
- Create: `registry/canary-manifest.yaml`
- Create: `docs/release-runbook.md`

- [ ] **Step 1: Add updater status and shared-link CLI commands**

Add these imports and function to `enterprise_prd/updater.py`:

```python
from .contracts import UpdateStatus
from .errors import RegistryUnavailable


def inspect_update(manifest: StableManifest, registry, install_root: Path) -> UpdateStatus:
    manifest.validate()
    try:
        for ref in (manifest.skill, manifest.company_pack):
            if sha256_bytes(registry.fetch_bytes(ref.archive)) != ref.sha256:
                return UpdateStatus.FAILED_INTEGRITY
    except RegistryUnavailable:
        return UpdateStatus.DEGRADED_CACHE
    expected = (
        install_root
        / "versions"
        / f"{manifest.skill.version}__{manifest.company_pack.version}"
    )
    current = install_root / "current"
    if current.is_symlink() and current.resolve() == expected.resolve():
        return UpdateStatus.CURRENT
    if manifest.force_update:
        return UpdateStatus.BLOCKED_FORCE_UPDATE
    return UpdateStatus.UPDATE_AVAILABLE
```

Append to `tests/test_updater.py`:

```python
    def test_update_status_is_closed(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            registry_root = root / "registry"
            registry_root.mkdir()
            skill_hash = build_zip(ROOT / "skills", registry_root / "skill.zip")
            pack_hash = build_zip(ROOT / "packs/example-company", registry_root / "pack.zip")
            manifest = self.manifest(skill_hash, pack_hash)
            registry = FileRegistry(registry_root)
            self.assertEqual(inspect_update(manifest, registry, root / "install"), UpdateStatus.UPDATE_AVAILABLE)
            apply_manifest(manifest, registry, root / "install")
            self.assertEqual(inspect_update(manifest, registry, root / "install"), UpdateStatus.CURRENT)
            (registry_root / "skill.zip").write_bytes(b"damaged")
            self.assertEqual(inspect_update(manifest, registry, root / "install"), UpdateStatus.FAILED_INTEGRITY)
```

Add the missing imports in that test:

```python
from enterprise_prd.contracts import UpdateStatus
from enterprise_prd.updater import inspect_update
```

Add these imports to `enterprise_prd/cli.py`:

```python
from enterprise_prd.install import install_shared_links, verify_shared_links
from enterprise_prd.updater import inspect_update
```

Add parsers:

```python
    status = update_sub.add_parser("status")
    status.add_argument("--manifest", type=Path, required=True)
    status.add_argument("--registry", type=Path, required=True)
    status.add_argument("--install-root", type=Path, required=True)

    install = commands.add_parser("install")
    install_sub = install.add_subparsers(dest="install_command", required=True)
    install_apply = install_sub.add_parser("apply")
    install_apply.add_argument("--source", type=Path, required=True)
    install_apply.add_argument("--home", type=Path)
    install_verify = install_sub.add_parser("verify-shared-links")
    install_verify.add_argument("--source", type=Path, required=True)
    install_verify.add_argument("--home", type=Path)
```

Add handlers:

```python
    if args.command == "update" and args.update_command == "status":
        status_value = inspect_update(
            manifest_from_file(args.manifest),
            FileRegistry(args.registry),
            args.install_root,
        )
        print(json.dumps({"status": status_value.value}))
        return 0 if status_value.value in {"current", "update_available", "degraded_cache"} else 4
    if args.command == "install" and args.install_command == "apply":
        install_shared_links(args.source, home=args.home)
        print(json.dumps({"status": "pass"}))
        return 0
    if args.command == "install" and args.install_command == "verify-shared-links":
        result = verify_shared_links(args.source, home=args.home)
        passed = all(result.values())
        print(json.dumps({"status": "pass" if passed else "blocked", "skills": result}))
        return 0 if passed else 5
```

Add these imports and test to `tests/test_install.py`:

```python
from unittest.mock import patch

from enterprise_prd.cli import main


    def test_install_cli_exit_codes_without_real_home(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            source = root / "source"
            for name in SKILLS:
                (source / name).mkdir(parents=True)
                (source / name / "SKILL.md").write_text(f"# {name}", encoding="utf-8")
            home = root / "home"
            with patch("sys.argv", ["enterprise-prd", "install", "apply", "--source", str(source), "--home", str(home)]):
                self.assertEqual(main(), 0)
            with patch("sys.argv", ["enterprise-prd", "install", "verify-shared-links", "--source", str(source), "--home", str(home)]):
                self.assertEqual(main(), 0)
            empty_home = root / "empty-home"
            with patch("sys.argv", ["enterprise-prd", "install", "verify-shared-links", "--source", str(source), "--home", str(empty_home)]):
                self.assertEqual(main(), 5)
```

Keep this method inside `InstallTest`; it verifies CLI exit behavior without touching the real home.

- [ ] **Step 2: Auto-sync the configured approved channel and lock a new-task snapshot**

Create `enterprise_prd/task_start.py`:

```python
from __future__ import annotations

import json
import os
import re
import urllib.parse
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

from .canonical import sha256_bytes
from .errors import ContractError, RegistryUnavailable
from .manifest import manifest_from_bytes
from .registry import FileRegistry, HttpsRegistry
from .updater import apply_manifest


@dataclass(frozen=True)
class StartConfig:
    registry_url: str
    install_root: Path
    credential_env: str | None
    channel: str


def load_start_config(path: Path) -> StartConfig:
    import yaml

    raw = yaml.safe_load(path.read_text(encoding="utf-8"))
    if type(raw) is not dict or set(raw) != {
        "schema_version", "registry_url", "install_root", "credential_env", "channel",
    }:
        raise ContractError("task-start config fields are invalid")
    if raw["schema_version"] != 1 or type(raw["registry_url"]) is not str:
        raise ContractError("task-start config is invalid")
    install_root = Path(str(raw["install_root"])).expanduser()
    if not install_root.is_absolute():
        raise ContractError("install_root must be absolute or start with ~")
    credential_env = raw["credential_env"]
    if credential_env is not None and (
        type(credential_env) is not str
        or re.fullmatch(r"[A-Z][A-Z0-9_]+", credential_env) is None
    ):
        raise ContractError("credential_env must be null or an uppercase environment variable name")
    if raw["channel"] not in {"canary", "stable"}:
        raise ContractError("channel must be canary or stable")
    return StartConfig(raw["registry_url"], install_root, credential_env, raw["channel"])


def registry_from_url(value: str, credential_env: str | None = None):
    parsed = urllib.parse.urlparse(value)
    if parsed.scheme == "file" and not parsed.netloc:
        return FileRegistry(Path(urllib.parse.unquote(parsed.path)))
    if parsed.scheme == "https":
        token = os.environ.get(credential_env) if credential_env else None
        if credential_env and not token:
            raise RegistryUnavailable(f"registry credential environment variable is absent: {credential_env}")
        return HttpsRegistry(value.rstrip("/") + "/", bearer_token=token)
    raise ContractError("registry_url must use file:// or https://")


def write_start_config(
    registry_url: str,
    install_root: Path,
    output: Path,
    credential_env: str | None,
    channel: str,
) -> None:
    import yaml

    parsed = urllib.parse.urlparse(registry_url)
    if parsed.scheme not in {"file", "https"}:
        raise ContractError("registry_url must use file:// or https://")
    if credential_env is not None and re.fullmatch(r"[A-Z][A-Z0-9_]+", credential_env) is None:
        raise ContractError("credential_env must be an uppercase environment variable name")
    if channel not in {"canary", "stable"}:
        raise ContractError("channel must be canary or stable")
    expanded_root = install_root.expanduser()
    if not expanded_root.is_absolute():
        raise ContractError("install_root must be absolute")
    payload = yaml.safe_dump(
        {
            "schema_version": 1,
            "registry_url": registry_url,
            "install_root": str(expanded_root),
            "credential_env": credential_env,
            "channel": channel,
        },
        sort_keys=False,
    ).encode("utf-8")
    _atomic_bytes(output.expanduser(), payload)


def _atomic_bytes(path: Path, payload: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.new")
    temporary.write_bytes(payload)
    os.replace(temporary, path)


def _snapshot(
    run_id: str,
    manifest_payload: bytes,
    manifest,
    install_root: Path,
    status: str,
    last_sync_at: str,
) -> dict:
    current = install_root / "current"
    if not current.is_symlink():
        raise ContractError("current release pair is absent")
    payload = {
        "schema_version": 1,
        "run_id": run_id,
        "status": status,
        "channel": manifest.channel,
        "skill_version": manifest.skill.version,
        "pack_version": manifest.company_pack.version,
        "manifest_sha256": sha256_bytes(manifest_payload),
        "pair_path": str(current.resolve()),
        "last_sync_at": last_sync_at,
        "started_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    }
    output = install_root / "runs" / f"{run_id}.json"
    if output.exists():
        raise ContractError("run_id already has a locked snapshot")
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    return payload


def require_snapshot_pack(snapshot_path: Path, pack_path: Path) -> dict:
    raw = json.loads(snapshot_path.read_text(encoding="utf-8"))
    required = {
        "schema_version", "run_id", "status", "channel", "skill_version", "pack_version",
        "manifest_sha256", "pair_path", "last_sync_at", "started_at",
    }
    if type(raw) is not dict or set(raw) != required:
        raise ContractError("run snapshot fields are invalid")
    if raw["status"] not in {"ready", "degraded", "restart_required"}:
        raise ContractError("run snapshot status is invalid")
    if raw["status"] == "restart_required":
        raise ContractError("restart-required snapshot cannot load project context")
    expected = (Path(raw["pair_path"]) / "pack").resolve()
    if pack_path.resolve() != expected:
        raise ContractError("capability pack is not the run-snapshot pack")
    return raw


def start_new_task(run_id: str, config_path: Path) -> dict:
    if not run_id.strip():
        raise ContractError("run_id is required")
    config = load_start_config(config_path)
    cached = config.install_root / "cache/release-manifest.yaml"
    current = config.install_root / "current"
    before = current.resolve() if current.is_symlink() else None
    try:
        registry = registry_from_url(config.registry_url, config.credential_env)
        manifest_payload = registry.fetch_bytes(f"{config.channel}-manifest.yaml")
        manifest = manifest_from_bytes(manifest_payload)
        if manifest.channel != config.channel:
            raise ContractError("release manifest channel does not match task configuration")
        apply_manifest(manifest, registry, config.install_root)
        _atomic_bytes(cached, manifest_payload)
        after = current.resolve()
        status = "restart_required" if before is not None and before != after else "ready"
        synced_at = datetime.fromtimestamp(
            cached.stat().st_mtime,
            tz=timezone.utc,
        ).isoformat(timespec="seconds")
        return _snapshot(
            run_id,
            manifest_payload,
            manifest,
            config.install_root,
            status,
            synced_at,
        )
    except RegistryUnavailable:
        if not cached.is_file() or not current.is_symlink():
            raise
        manifest_payload = cached.read_bytes()
        manifest = manifest_from_bytes(manifest_payload)
        if manifest.channel != config.channel:
            raise ContractError("cached manifest channel does not match task configuration")
        expected = (
            config.install_root
            / "versions"
            / f"{manifest.skill.version}__{manifest.company_pack.version}"
        )
        if current.resolve() != expected.resolve():
            raise ContractError("offline cached pair is not allowed to start")
        synced_at = datetime.fromtimestamp(
            cached.stat().st_mtime,
            tz=timezone.utc,
        ).isoformat(timespec="seconds")
        return _snapshot(
            run_id,
            manifest_payload,
            manifest,
            config.install_root,
            "degraded",
            synced_at,
        )
```

Create `tests/test_task_start.py`:

```python
from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

import yaml

from enterprise_prd.canonical import sha256_file
from enterprise_prd.errors import ContractError, RegistryUnavailable
from enterprise_prd.registry import build_skill_bundle, build_zip
from enterprise_prd.task_start import require_snapshot_pack, start_new_task


ROOT = Path(__file__).resolve().parents[1]


class TaskStartTest(unittest.TestCase):
    def test_new_task_syncs_stable_then_locks_snapshot(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            registry = root / "registry"
            releases = registry / "releases"
            releases.mkdir(parents=True)
            skill = releases / "skill-0.2.0.zip"
            pack = releases / "pack.zip"
            build_skill_bundle(ROOT / "enterprise_prd", ROOT / "skills", skill)
            build_zip(ROOT / "packs/example-company", pack)

            def publish(version: str, archive: Path) -> None:
                manifest = {
                    "schema_version": 1,
                    "channel": "stable",
                    "skill": {
                        "name": "enterprise-prd-skills",
                        "version": version,
                        "archive": f"releases/{archive.name}",
                        "sha256": sha256_file(archive),
                    },
                    "company_pack": {
                        "name": "example-company",
                        "version": "0.1.0",
                        "archive": "releases/pack.zip",
                        "sha256": sha256_file(pack),
                    },
                    "compatible_skill": f">={version},<1.0.0",
                    "published_by": "pilot-owner",
                    "published_at": (
                        "2026-07-26T12:00:00+08:00"
                        if version == "0.2.0"
                        else "2026-07-26T13:00:00+08:00"
                    ),
                    "force_update": False,
                }
                (registry / "stable-manifest.yaml").write_text(
                    yaml.safe_dump(manifest, sort_keys=False),
                    encoding="utf-8",
                )

            publish("0.2.0", skill)
            install_root = root / "install"
            config = root / "config.yaml"
            config.write_text(yaml.safe_dump({
                "schema_version": 1,
                "registry_url": registry.as_uri(),
                "install_root": str(install_root),
                "credential_env": None,
                "channel": "stable",
            }, sort_keys=False), encoding="utf-8")
            first = start_new_task("RUN-001", config)
            self.assertEqual(first["status"], "ready")
            snapshot_path = install_root / "runs/RUN-001.json"
            self.assertEqual(
                require_snapshot_pack(
                    snapshot_path,
                    Path(first["pair_path"]) / "pack",
                )["run_id"],
                "RUN-001",
            )
            with self.assertRaises(ContractError):
                require_snapshot_pack(snapshot_path, ROOT / "packs/example-company")
            second = start_new_task("RUN-002", config)
            self.assertEqual(second["pair_path"], first["pair_path"])
            self.assertTrue((install_root / "runs/RUN-002.json").is_file())
            skill_next = releases / "skill-0.3.0.zip"
            build_skill_bundle(ROOT / "enterprise_prd", ROOT / "skills", skill_next)
            publish("0.3.0", skill_next)
            updated = start_new_task("RUN-003", config)
            self.assertEqual(updated["status"], "restart_required")
            manifest_path = registry / "stable-manifest.yaml"
            manifest_path.rename(registry / "stable-manifest.offline")
            offline = start_new_task("RUN-004", config)
            self.assertEqual(offline["status"], "degraded")
            (install_root / "cache/release-manifest.yaml").unlink()
            with self.assertRaises(RegistryUnavailable):
                start_new_task("RUN-005", config)


if __name__ == "__main__":
    unittest.main()
```

Add imports to `enterprise_prd/cli.py`:

```python
from enterprise_prd.task_start import (
    require_snapshot_pack,
    start_new_task,
    write_start_config,
)
```

Add parser and handler:

```python
    task = commands.add_parser("task")
    task_sub = task.add_subparsers(dest="task_command", required=True)
    task_start = task_sub.add_parser("start")
    task_start.add_argument("--run-id", required=True)
    task_start.add_argument(
        "--config",
        type=Path,
        default=Path.home() / ".enterprise-prd/config.yaml",
    )
    install_configure = install_sub.add_parser("configure")
    install_configure.add_argument("--registry-url", required=True)
    install_configure.add_argument("--install-root", type=Path, required=True)
    install_configure.add_argument("--credential-env")
    install_configure.add_argument("--channel", choices=("canary", "stable"), default="stable")
    install_configure.add_argument(
        "--output",
        type=Path,
        default=Path.home() / ".enterprise-prd/config.yaml",
    )
    context.add_argument("--run-snapshot", type=Path, required=True)

    if args.command == "task" and args.task_command == "start":
        result = start_new_task(args.run_id, args.config)
        print(json.dumps(result, ensure_ascii=False))
        return 6 if result["status"] == "restart_required" else 0
    if args.command == "install" and args.install_command == "configure":
        write_start_config(
            args.registry_url,
            args.install_root,
            args.output,
            args.credential_env,
            args.channel,
        )
        print(json.dumps({"status": "pass", "config": str(args.output)}))
        return 0
    if args.command == "workflow" and args.workflow_command == "context":
        require_snapshot_pack(args.run_snapshot, args.pack)
```

Place the final `require_snapshot_pack` call at the top of the existing workflow-context handler, before `load_pack`. The caller must stop and open a fresh conversation on exit code `6`. A run snapshot is immutable because duplicate `run_id` is rejected; no task hot-updates after snapshot creation and no arbitrary pack can replace the locked version.

- [ ] **Step 3: Build Skill 0.2.0 and company pack 0.1.0**

Run:

```bash
.venv/bin/python -m enterprise_prd.cli release build-skill \
  --package enterprise_prd \
  --skills skills \
  --output registry/releases/enterprise-prd-skills-0.2.0.zip
.venv/bin/python -m enterprise_prd.cli release build \
  --source packs/company-product \
  --output registry/releases/company-product-0.1.0.zip
.venv/bin/python -m pip wheel --no-deps --wheel-dir registry/bootstrap .
shasum -a 256 registry/releases/enterprise-prd-skills-0.2.0.zip \
  registry/releases/company-product-0.1.0.zip \
  registry/bootstrap/enterprise_prd-0.1.0-py3-none-any.whl
```

Expected: two deterministic release Hashes and one bootstrap wheel Hash；stable Skill archive itself contains `runtime/enterprise_prd/cli.py`.

- [ ] **Step 4: Generate the canary manifest programmatically**

Use the `release publish-pair` command implemented and tested in Foundation. It calculates both SHA-256 values and validates the closed canary manifest contract. Run:

```bash
.venv/bin/python -m enterprise_prd.cli release publish-pair \
  --skill-archive registry/releases/enterprise-prd-skills-0.2.0.zip \
  --skill-name enterprise-prd-skills \
  --skill-version 0.2.0 \
  --pack-archive registry/releases/company-product-0.1.0.zip \
  --pack-name company-product \
  --pack-version 0.1.0 \
  --channel canary \
  --output registry/canary-manifest.yaml \
  --published-by pilot-owner
```

Expected: canary manifest contains the actual archive Hashes and no editable marker; `registry/stable-manifest.yaml` still points to the Foundation example and must not be changed to the company pair before a real canary passes.

- [ ] **Step 5: Write the release runbook**

Create `docs/release-runbook.md`:

```markdown
# Release Runbook

1. Run the full test suite.
2. Build immutable Skill/Runtime bundle, pack archive, and one-time bootstrap wheel.
3. Generate canary manifest from archive Hashes.
4. Publish canary behind an owner-only registry credential; cohort credentials must not read `canary-manifest.yaml`.
5. Complete one real PRD without permission, data, revision, or gate incident.
6. Only after real canary evidence passes, generate stable manifest from the same archive bytes.
7. Publish stable; each new task runs `task start`, atomically syncs the pair, and locks a snapshot before reading project content.
8. On regression, repoint stable to the previous compatible pair.
9. Set force_update only when continuing on the previous version is unsafe.

Never edit archive or wheel content after Hash recording. Never publish a company pack
whose governance candidates or dynamic PRD bodies entered the ZIP.
```

- [ ] **Step 6: Test, commit and keep canary owner-local**

Run:

```bash
.venv/bin/python -m unittest tests.test_install tests.test_updater tests.test_registry tests.test_task_start -v
.venv/bin/python -m enterprise_prd.cli update apply \
  --manifest registry/canary-manifest.yaml \
  --registry registry \
  --install-root tmp/canary-install
.venv/bin/python -m enterprise_prd.cli update status \
  --manifest registry/canary-manifest.yaml \
  --install-root tmp/canary-install
git add enterprise_prd/cli.py enterprise_prd/updater.py enterprise_prd/task_start.py \
  tests/test_install.py tests/test_updater.py tests/test_task_start.py \
  registry/releases registry/bootstrap registry/canary-manifest.yaml docs/release-runbook.md
git commit -m "feat: publish enterprise PRD canary pair"
```

Expected: updater status is `current`; canary manifest and immutable artifacts are committed only to the private repository，and no company stable manifest is published.

### Task 6: Add metadata-only live preflight and evidence

**Files:**
- Modify: `enterprise_prd/pilot.py`
- Create: `enterprise_prd/evidence.py`
- Modify: `enterprise_prd/cli.py`
- Modify: `tests/test_pilot.py`
- Create: `tests/test_evidence.py`

- [ ] **Step 1: Add failing metadata-only preflight tests**

Append to `tests/test_pilot.py`:

```python
from types import SimpleNamespace

from enterprise_prd.contracts import AccessDecision
from enterprise_prd.pilot import live_preflight


class MetadataAdapter:
    def check_access(self, document_id, action):
        return AccessDecision.DENIED if document_id == "denied" else AccessDecision.ALLOWED

    def revision(self, document_id):
        return "12"

    def metadata(self, document_id):
        return SimpleNamespace(revision="12")

    def read(self, document_id, revision=None):
        raise AssertionError("live preflight must not read document bodies")

    def commit_write(self, patch):
        raise AssertionError("live preflight must not write")


class PilotPreflightTest(unittest.TestCase):
    def test_live_preflight_returns_counts_not_content(self) -> None:
        result = live_preflight(("allowed", "denied"), MetadataAdapter())
        self.assertEqual(result["targets"], 2)
        self.assertEqual(result["accessible"], 1)
        self.assertEqual(result["denied"], 1)
        self.assertEqual(result["revision_coverage"], 0.5)
        self.assertNotIn("content", result)
```

- [ ] **Step 2: Implement metadata-only preflight**

Append to `enterprise_prd/pilot.py`:

```python
from .adapters.base import AccessAction
from .contracts import AccessDecision


def live_preflight(document_ids: tuple[str, ...], adapter) -> dict:
    if not document_ids:
        raise ContractError("live preflight requires explicit document IDs")
    accessible = 0
    denied = 0
    revisions = 0
    for document_id in document_ids:
        access = adapter.check_access(document_id, AccessAction.READ)
        if access is AccessDecision.DENIED:
            denied += 1
            continue
        if access is not AccessDecision.ALLOWED:
            continue
        accessible += 1
        if adapter.metadata(document_id).revision:
            revisions += 1
    return {
        "status": "ready_for_scoped_live_preflight",
        "targets": len(document_ids),
        "accessible": accessible,
        "denied": denied,
        "revision_coverage": round(revisions / len(document_ids), 4),
    }
```

- [ ] **Step 3: Implement evidence verification**

Create `enterprise_prd/evidence.py`:

```python
from __future__ import annotations

import json
import subprocess
from pathlib import Path

from .canonical import load_yaml, sha256_file
from .errors import ContractError


def build_evidence(
    repo: Path,
    required_tags: tuple[str, ...],
    manifest_path: Path,
) -> dict:
    tags = subprocess.run(
        ["git", "tag", "--list"],
        cwd=repo,
        text=True,
        capture_output=True,
        check=True,
    ).stdout.splitlines()
    missing = sorted(set(required_tags) - set(tags))
    if missing:
        raise ContractError(f"required tags are missing: {missing}")
    head = subprocess.run(
        ["git", "rev-parse", "HEAD"],
        cwd=repo,
        text=True,
        capture_output=True,
        check=True,
    ).stdout.strip()
    manifest_path = manifest_path.resolve()
    if repo.resolve() not in manifest_path.parents or manifest_path.name not in {
        "canary-manifest.yaml", "stable-manifest.yaml",
    }:
        raise ContractError("evidence manifest path is outside the release registry")
    manifest = load_yaml(manifest_path)
    releases = {}
    for key in ("skill", "company_pack"):
        archive = repo / "registry" / manifest[key]["archive"]
        actual = sha256_file(archive)
        if actual != manifest[key]["sha256"]:
            raise ContractError(f"{key} archive hash mismatch")
        releases[key] = {"archive": str(archive.relative_to(repo)), "sha256": actual}
    bootstrap_wheels = sorted((repo / "registry/bootstrap").glob("*.whl"))
    if len(bootstrap_wheels) != 1:
        raise ContractError("evidence requires exactly one bootstrap wheel")
    bootstrap = bootstrap_wheels[0]
    return {
        "status": "pass",
        "git_head": head,
        "required_tags": list(required_tags),
        "release_manifest": str(manifest_path.relative_to(repo)),
        "release_manifest_sha256": sha256_file(manifest_path),
        "releases": releases,
        "bootstrap": {
            "wheel": str(bootstrap.relative_to(repo)),
            "sha256": sha256_file(bootstrap),
        },
    }


def write_evidence(payload: dict, output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
```

Create `tests/test_evidence.py`:

```python
from __future__ import annotations

import subprocess
import tempfile
import unittest
from pathlib import Path

import yaml

from enterprise_prd.canonical import sha256_file
from enterprise_prd.errors import ContractError
from enterprise_prd.evidence import build_evidence


class EvidenceTest(unittest.TestCase):
    def test_tags_manifest_and_archive_bytes_are_bound(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            repo = Path(raw)
            subprocess.run(["git", "init"], cwd=repo, check=True, capture_output=True)
            subprocess.run(["git", "config", "user.email", "pilot@example.invalid"], cwd=repo, check=True)
            subprocess.run(["git", "config", "user.name", "Pilot Test"], cwd=repo, check=True)
            (repo / "README.md").write_text("# fixture\n", encoding="utf-8")
            subprocess.run(["git", "add", "README.md"], cwd=repo, check=True)
            subprocess.run(["git", "commit", "-m", "fixture"], cwd=repo, check=True, capture_output=True)
            required = ("FOUNDATION_PASS", "FEISHU_ADAPTER_PASS", "WORKFLOW_PASS")
            for tag in required:
                subprocess.run(["git", "tag", tag], cwd=repo, check=True)
            releases = repo / "registry/releases"
            releases.mkdir(parents=True)
            bootstrap = repo / "registry/bootstrap"
            bootstrap.mkdir(parents=True)
            (bootstrap / "enterprise_prd-0.1.0-py3-none-any.whl").write_bytes(b"bootstrap wheel")
            skill = releases / "skill.zip"
            pack = releases / "pack.zip"
            skill.write_bytes(b"skill archive")
            pack.write_bytes(b"pack archive")
            manifest = {
                "schema_version": 1,
                "channel": "stable",
                "skill": {
                    "name": "enterprise-prd-skills",
                    "version": "0.2.0",
                    "archive": "releases/skill.zip",
                    "sha256": sha256_file(skill),
                },
                "company_pack": {
                    "name": "company-product",
                    "version": "0.1.0",
                    "archive": "releases/pack.zip",
                    "sha256": sha256_file(pack),
                },
                "compatible_skill": ">=0.2.0,<1.0.0",
                "published_by": "pilot-owner",
                "published_at": "2026-07-26T12:00:00+08:00",
                "force_update": False,
            }
            (repo / "registry/stable-manifest.yaml").write_text(
                yaml.safe_dump(manifest, sort_keys=False),
                encoding="utf-8",
            )
            manifest_path = repo / "registry/stable-manifest.yaml"
            self.assertEqual(build_evidence(repo, required, manifest_path)["status"], "pass")
            skill.write_bytes(b"damaged")
            with self.assertRaises(ContractError):
                build_evidence(repo, required, manifest_path)


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 4: Add exact CLI commands**

Add imports to `enterprise_prd/cli.py`:

```python
from enterprise_prd.adapters.feishu import FeishuAdapter, FeishuSourceConfig
from enterprise_prd.canonical import sha256_bytes
from enterprise_prd.contracts import compatible_version
from enterprise_prd.evidence import build_evidence, write_evidence
from enterprise_prd.errors import IntegrityError
from enterprise_prd.pilot import live_preflight
```

Add these parsers immediately after the existing `pilot configure-source` parser:

```python
    pilot_verify = pilot_sub.add_parser("verify")
    pilot_verify.add_argument("--registry", type=Path, required=True)
    pilot_verify.add_argument("--pack", type=Path, required=True)
    pilot_verify.add_argument("--manifest", type=Path, required=True)
    live = pilot_sub.add_parser("live-preflight")
    live.add_argument("--pack", type=Path, required=True)
    live.add_argument("--read-only", action="store_true")

    evidence = commands.add_parser("evidence")
    evidence.add_argument("--repo", type=Path, default=Path.cwd())
    evidence.add_argument("--require-tag", action="append", required=True)
    evidence.add_argument("--manifest", type=Path, required=True)
    evidence.add_argument("--output", type=Path, required=True)
```

Add handlers before the unreachable assertion:

```python
    if args.command == "pilot" and args.pilot_command == "verify":
        registry_root = args.registry.resolve()
        manifest_path = args.manifest.resolve()
        if registry_root not in manifest_path.parents:
            raise ContractError("release manifest must be inside the selected registry")
        pack = load_pack(args.pack)
        manifest = manifest_from_file(manifest_path)
        if manifest.company_pack.name != pack.manifest.pack_id:
            raise ContractError("stable manifest pack ID does not match loaded pack")
        if manifest.company_pack.version != pack.manifest.version:
            raise ContractError("stable manifest pack version does not match loaded pack")
        if not compatible_version(manifest.skill.version, pack.manifest.compatible_skill):
            raise ContractError("loaded pack is incompatible with stable Skill")
        registry = FileRegistry(registry_root)
        for ref in (manifest.skill, manifest.company_pack):
            if sha256_bytes(registry.fetch_bytes(ref.archive)) != ref.sha256:
                raise IntegrityError(f"archive hash mismatch: {ref.name}")
        print(json.dumps({
            "status": "ready_for_scoped_live_preflight",
            "pack_id": pack.manifest.pack_id,
            "skill_version": manifest.skill.version,
            "pack_version": manifest.company_pack.version,
        }))
        return 0
    if args.command == "pilot" and args.pilot_command == "live-preflight":
        if not args.read_only:
            raise ContractError("live-preflight requires --read-only")
        catalog_path = args.pack / "sources/catalog.local.yaml"
        catalog = load_yaml(catalog_path)
        raw_targets = catalog.get("targets")
        if type(raw_targets) is not list or not raw_targets:
            raise ContractError("local source catalog has no explicit targets")
        document_ids = tuple(
            str(item["token"])
            for item in raw_targets
            if type(item) is dict and item.get("kind") == "document"
        )
        if len(document_ids) != len(raw_targets):
            raise ContractError("live preflight accepts document targets only")
        adapter = FeishuAdapter(FeishuSourceConfig(document_ids=document_ids))
        print(json.dumps(live_preflight(document_ids, adapter), ensure_ascii=False))
        return 0
    if args.command == "evidence":
        payload = build_evidence(
            args.repo.resolve(),
            tuple(args.require_tag),
            args.manifest,
        )
        write_evidence(payload, args.output)
        print(json.dumps({"status": "pass", "output": str(args.output)}))
        return 0
```

`PilotPreflightTest.MetadataAdapter.read()` and `.commit_write()` already raise if invoked, so the named test proves preflight remains metadata-only.

- [ ] **Step 5: Run and commit preflight/evidence**

Run:

```bash
.venv/bin/python -m unittest tests.test_pilot tests.test_evidence -v
git add enterprise_prd/pilot.py enterprise_prd/evidence.py enterprise_prd/cli.py \
  tests/test_pilot.py tests/test_evidence.py
git commit -m "feat: verify scoped enterprise PRD pilot readiness"
```

Expected: tests pass; no live command runs.

### Task 7: Freeze the pilot runbook and offline evidence

**Files:**
- Create: `docs/pilot-runbook.md`
- Modify: `docs/recovery.md`
- Create: `docs/evidence/PILOT_DRY_RUN_PASS.json`

- [ ] **Step 1: Write the four-week runbook**

Create `docs/pilot-runbook.md`:

```markdown
# Four-Week Internal Pilot

## Cohort

- 4–6 product managers.
- 8–12 real PRDs across different experience levels and product modules.
- 6–10 recent PRDs scored with the same rubric as historical baseline.

## Before week 1

- Confirm company AI data policy and explicit source catalog.
- Complete canary with the pilot owner.
- Publish one stable Skill/pack pair.
- Verify every participant sees the same versions.

## Weekly operation

- Start each new task with `enterprise-prd task start --run-id <unique-id>`.
- If status is `restart_required`, open a fresh conversation before continuing; never hot-update an active task.
- If status is `degraded`, show the cached versions and last successful manifest Hash.
- Use Writer handoff and a fresh Reviewer conversation.
- Record metadata audit after gate.
- Record knowledge gaps as candidates; do not change stable rules mid-task.
- Publish at most one planned stable pack update per week after canary.

## Success thresholds

- 100% required fields, sources and versions recorded.
- At least 80% pass within one revision.
- Zero Blocker escapes after AI gate.
- Quality-score dispersion decreases at least 30%.
- Median cycle time decreases at least 30%.
- At least 70% of participants want to continue.

## Decision

- Go: thresholds met, no data/permission incident, updater stable.
- Iterate: quality improves but knowledge gaps or workflow burden remain high.
- Stop: no visible quality improvement or unacceptable data/permission risk.

All results are internal directional evidence, not external statistical proof.
```

- [ ] **Step 2: Install the owner-local canary pair and shared links**

Run only within the approved local write boundary:

```bash
.venv/bin/python -m enterprise_prd.cli update apply \
  --manifest registry/canary-manifest.yaml \
  --registry registry \
  --install-root "$PWD/tmp/canary-install"
.venv/bin/python -m enterprise_prd.cli install configure \
  --registry-url "file://$PWD/registry" \
  --install-root "$PWD/tmp/canary-install" \
  --channel canary
.venv/bin/python -m enterprise_prd.cli install apply \
  --source "$PWD/tmp/canary-install/current/skill"
.venv/bin/python -m enterprise_prd.cli install verify-shared-links \
  --source "$PWD/tmp/canary-install/current/skill"
.venv/bin/python -m enterprise_prd.cli task start \
  --run-id PILOT-INSTALL-VERIFY
```

Expected: all three Skill names verify true across the owner’s shared, Codex, Claude and OpenClaw paths; task start is `ready` and records the exact canary pair. The commands never remove a real directory and do not expose canary to other participants.

- [ ] **Step 3: Run the full offline gate**

Run:

```bash
.venv/bin/python -m unittest discover -s tests -v
.venv/bin/python -m enterprise_prd.cli pilot verify \
  --registry registry \
  --pack packs/company-product \
  --manifest registry/canary-manifest.yaml
git status --short
```

Expected: tests `OK`; pilot status `ready_for_scoped_live_preflight`; only runbook/recovery/evidence files remain uncommitted.

- [ ] **Step 4: Generate and verify the evidence JSON**

Run:

```bash
.venv/bin/python -m enterprise_prd.cli evidence \
  --require-tag FOUNDATION_PASS \
  --require-tag FEISHU_ADAPTER_PASS \
  --require-tag WORKFLOW_PASS \
  --manifest registry/canary-manifest.yaml \
  --output docs/evidence/PILOT_DRY_RUN_PASS.json
.venv/bin/python -m json.tool docs/evidence/PILOT_DRY_RUN_PASS.json
```

Expected: evidence status is `pass`; both release Hashes match canary manifest，and the bootstrap wheel Hash is recorded. The evidence does not imply stable approval.

- [ ] **Step 5: Close recovery and commit offline readiness**

Replace `docs/recovery.md`:

```markdown
# Recovery

- phase: pilot-canary-offline-ready
- pilot_next_step: obtain scoped live authorization, then run pilot live-preflight --read-only
- last_valid_test: python3 -m unittest discover -s tests -v
- external_state: owner canary links installed; no live company document accessed and no company stable manifest published
- resume_rule: verify canary manifest Hash, owner links, Git HEAD, and PILOT_DRY_RUN_PASS.json
```

Run:

```bash
git add docs/pilot-runbook.md docs/recovery.md docs/evidence/PILOT_DRY_RUN_PASS.json
git commit -m "docs: record enterprise PRD pilot dry-run readiness"
git status --short
```

Expected: clean Git status.

### Task 8: Execute the scoped canary and start the pilot

**Files:**
- Create at runtime only: `packs/company-product/sources/catalog.local.yaml`
- Create at runtime only: `pilot/private/live-preflight.json`
- Create at runtime only: `pilot/private/audits/*.json`
- Create at runtime only: `pilot/private/baseline.csv`
- Create at runtime only: `pilot/private/observation.csv`

- [ ] **Step 1: Confirm the external boundary once**

Before any live command, record:

- exact company-approved Feishu document IDs; folder/space discovery results are reviewed manually before an ID enters the catalog;
- current company AI data policy result;
- 4–6 participant cohort;
- read-only canary owner;
- registry URL accessible to the cohort;
- immutable bootstrap wheel URL and its evidence-recorded SHA-256;
- owner-only canary credential and separate cohort stable-read credential/ACL;
- no bulk write or source-scope expansion.

If any field is absent, do not run the live command.

- [ ] **Step 2: Generate the explicit source catalog**

Run:

```bash
.venv/bin/python -m enterprise_prd.cli pilot configure-source \
  --output packs/company-product/sources/catalog.local.yaml
```

Enter only approved canonical document tokens resolved by `drive +inspect`. Expected: the command prints the exact target count and no document body.

- [ ] **Step 3: Run read-only live preflight**

Run:

```bash
.venv/bin/python -m enterprise_prd.cli pilot live-preflight \
  --pack packs/company-product \
  --read-only > pilot/private/live-preflight.json
.venv/bin/python -m json.tool pilot/private/live-preflight.json
```

Expected: output contains target/access/revision counts only. Continue to canary only when access coverage is at least 80%, revision coverage is 100% for accessible targets, and denied targets are understood.

- [ ] **Step 4: Complete one owner-only canary PRD**

Use only the owner-scoped canary installation:

1. Start Writer in one Agent conversation.
2. Produce PRD and handoff.
3. Open a new conversation and run Reviewer.
4. Resolve all Blockers.
5. Preview one Feishu local write operation.
6. Confirm the diff manually before commit.
7. Record metadata audit.

Expected: no permission incident, no revision overwrite, no hidden Writer context in Reviewer handoff, and final gate is pass.

- [ ] **Step 5: Promote stable and start four weeks**

Only after canary evidence passes:

1. Generate stable from the exact canary-tested archive bytes, then verify both Hashes equal canary:

```bash
.venv/bin/python -m enterprise_prd.cli release publish-pair \
  --skill-archive registry/releases/enterprise-prd-skills-0.2.0.zip \
  --skill-name enterprise-prd-skills \
  --skill-version 0.2.0 \
  --pack-archive registry/releases/company-product-0.1.0.zip \
  --pack-name company-product \
  --pack-version 0.1.0 \
  --channel stable \
  --output registry/stable-manifest.yaml \
  --published-by pilot-owner
.venv/bin/python -m enterprise_prd.cli pilot verify \
  --registry registry \
  --pack packs/company-product \
  --manifest registry/stable-manifest.yaml
.venv/bin/python - <<'PY'
from pathlib import Path
from enterprise_prd.manifest import manifest_from_file

canary = manifest_from_file(Path("registry/canary-manifest.yaml"))
stable = manifest_from_file(Path("registry/stable-manifest.yaml"))
assert canary.skill.sha256 == stable.skill.sha256
assert canary.company_pack.sha256 == stable.company_pack.sha256
assert canary.skill.version == stable.skill.version
assert canary.company_pack.version == stable.company_pack.version
PY
```

Commit the stable manifest and canary evidence together, then publish that tested manifest and the unchanged artifacts to the company registry.
2. Give each participant the same approved HTTPS registry URL, bootstrap wheel URL and Hash. On each participant’s Mac, set the three values as process-local environment variables and run:

```bash
test -n "$ENTERPRISE_PRD_REGISTRY_URL"
test -n "$ENTERPRISE_PRD_BOOTSTRAP_WHEEL_URL"
test -n "$ENTERPRISE_PRD_BOOTSTRAP_SHA256"
mkdir -p "$HOME/.enterprise-prd/bootstrap"
curl --fail --silent --show-error --location \
  --header "Authorization: Bearer $ENTERPRISE_PRD_REGISTRY_TOKEN" \
  "$ENTERPRISE_PRD_BOOTSTRAP_WHEEL_URL" \
  --output "$HOME/.enterprise-prd/bootstrap/enterprise_prd-0.1.0-py3-none-any.whl"
test "$(shasum -a 256 "$HOME/.enterprise-prd/bootstrap/enterprise_prd-0.1.0-py3-none-any.whl" | awk '{print $1}')" = \
  "$ENTERPRISE_PRD_BOOTSTRAP_SHA256"
python3 -m venv "$HOME/.enterprise-prd/bootstrap-venv"
"$HOME/.enterprise-prd/bootstrap-venv/bin/python" -m pip install \
  "$HOME/.enterprise-prd/bootstrap/enterprise_prd-0.1.0-py3-none-any.whl"
"$HOME/.enterprise-prd/bootstrap-venv/bin/enterprise-prd" install configure \
  --registry-url "$ENTERPRISE_PRD_REGISTRY_URL" \
  --credential-env ENTERPRISE_PRD_REGISTRY_TOKEN \
  --install-root "$HOME/.enterprise-prd/install"
```

Then generate a unique run ID, execute `task start`, install shared links from `$HOME/.enterprise-prd/install/current/skill`, and verify all participants’ snapshots report the same Skill/pack versions. Never send the token through chat or save it in config.
3. Copy the CSV templates into `pilot/private/`.
4. Run 8–12 real PRDs over four weeks.
5. Generate the metrics summary and make go/iterate/stop decision.

Expected: no plan step claims the outcome before the four-week data exists.
