# Enterprise PRD Foundation Implementation Plan

> **Execution governance:** Before implementation, run the shared `adaptive-orchestration` preflight. A plan records a recommended profile but does not dispatch agents or authorize execution by itself.

**Goal:** 创建企业 PRD 私有源码仓，交付闭合合同、能力包校验、本地文档 Adapter、发布构建和可原子回滚的 stable updater。

**Architecture:** Python 包以冻结 dataclass/Enum 定义发布、能力包、知识契约和文档访问边界；YAML 只在边界读取，运行时使用验证后的不可变对象。发布物是不可变 ZIP，registry 只提供 manifest 与 bytes；updater 在版本目录完成校验后原子切换 `current` 软链接。

**Tech Stack:** Python 3.12、PyYAML 6.x、标准库 `unittest`/`zipfile`/`urllib`/`hashlib`/`tempfile`、Git。

**Recommended execution profile:** O0；Foundation 的合同、registry 和 updater 共享核心类型，单一写入流更安全。若作为总 Program 执行，沿用已确认的 O3 授权范围，但不创建子 Agent。

**Parallelizable workstreams:** none

**Shared-write conflicts:** `pyproject.toml`、`enterprise_prd/contracts.py`、`enterprise_prd/cli.py` 和 `registry/stable-manifest.yaml` 必须串行修改。

**Stage evidence checkpoint:** `FOUNDATION_PASS`；5 个 Foundation 测试模块全绿，两个发布 ZIP 的 SHA-256 与 stable manifest 一致，损坏更新不会改变 `current`，Git tag `FOUNDATION_PASS` 指向干净提交。

**Recovery entry:** `/Users/qqx/my_code_cursor/enterprise-prd-pilot/docs/recovery.md` 中的 `foundation_next_step`；文件不存在时从本计划首个未勾选步骤开始。

**Authorization boundary:** 在总 Program 实施授权生效后，可创建并写入 `/Users/qqx/my_code_cursor/enterprise-prd-pilot`、初始化本地 Git、安装项目虚拟环境依赖和构建本地归档；不创建远程仓、不读取飞书、不修改共享 Skill 入口。

**Out of scope:** Feishu Adapter、Writer/Reviewer、真实公司规则、远程 registry、共享目录安装和团队试点。

**Potential decision boundaries:** 目标目录已存在且包含非本计划文件时，必须在“使用现有仓并重新映射计划”与“选择新的源码根”之间确认；PyYAML 无法按公司依赖策略安装时，需要在“vendor 锁定版本”与“改用 JSON 配置”之间确认。

---

## Planning assumptions and readiness

- 源 Spec：`docs/superpowers/specs/2026-07-26-enterprise-prd-skill-architecture-design.md`。
- 总计划已完成四项 spec-readiness 自检，本子计划不改变产品行为。
- V0 仅支持 macOS；路径解析使用 `Path.home()`，代码不包含 `/Users/qqx`。
- transient registry 请求最多重试 2 次；校验、权限、404 和合同错误不重试。
- 只有 `file://` 与 `https://` registry；HTTP 明文 URL 一律拒绝。
- stable 更新只切换 Skill 与能力包成对组合。
- 当前 `/Users/qqx/.agents/skills` 不是 Git 仓，本子计划只建立源码真值源，不安装软链接。

## File Structure

| Path | Action | Single responsibility |
| --- | --- | --- |
| `.gitignore` | Create | 排除虚拟环境、构建临时目录、真实 source catalog 与试点私有数据。 |
| `pyproject.toml` | Create | Python 包、PyYAML 依赖、CLI 与 unittest 配置。 |
| `README.md` | Create | V0 边界、开发命令和不存企业正文的安全说明。 |
| `enterprise_prd/__init__.py` | Create | 包版本。 |
| `enterprise_prd/bootstrap.py` | Create | 一次安装后始终转发到当前 stable 发布物中的运行时。 |
| `enterprise_prd/errors.py` | Create | 闭合错误类型与稳定错误码。 |
| `enterprise_prd/canonical.py` | Create | YAML/JSON 读取、canonical JSON 和 SHA-256。 |
| `enterprise_prd/contracts.py` | Create | 发布、能力包、知识契约、文档与写回对象。 |
| `enterprise_prd/manifest.py` | Create | 发布 manifest 的唯一解析和严格验证入口。 |
| `enterprise_prd/pack.py` | Create | 企业能力包目录加载与严格校验。 |
| `enterprise_prd/registry.py` | Create | file/https registry 与 ZIP 发布构建。 |
| `enterprise_prd/updater.py` | Create | 下载、校验、原子安装、current 切换和回滚。 |
| `enterprise_prd/adapters/base.py` | Create | 渠道无关 Adapter 协议。 |
| `enterprise_prd/adapters/local.py` | Create | 测试和离线演示用本地 Markdown Adapter。 |
| `enterprise_prd/cli.py` | Create | `pack validate`、`release build`、`update apply/status`。 |
| `packs/example-company/**` | Create | 无公司机密的最小能力包夹具。 |
| `skills/enterprise-prd-chain/SKILL.md` | Create | Foundation 发布物中的可运行 bootstrap Skill；Workflow 计划在保持命令兼容的前提下扩展行为。 |
| `registry/stable-manifest.yaml` | Create | 本地 registry 当前稳定组合。 |
| `tests/fixtures/local-docs/**` | Create | 本地 Adapter 文档夹具。 |
| `tests/test_contracts.py` | Create | 严格枚举、版本与知识契约校验。 |
| `tests/test_pack.py` | Create | 能力包加载、候选排除和路径安全。 |
| `tests/test_registry.py` | Create | 发布 ZIP 与 file/https registry 行为。 |
| `tests/test_updater.py` | Create | 原子更新、损坏归档、离线和强制更新。 |
| `tests/test_local_adapter.py` | Create | search/read/revision/access 本地合同。 |
| `docs/recovery.md` | Create | 唯一恢复入口与阶段测试。 |

### Task 1: Create the authorized private source repository

**Files:**
- Create: `/Users/qqx/my_code_cursor/enterprise-prd-pilot/.gitignore`
- Create: `/Users/qqx/my_code_cursor/enterprise-prd-pilot/pyproject.toml`
- Create: `/Users/qqx/my_code_cursor/enterprise-prd-pilot/README.md`
- Create: `/Users/qqx/my_code_cursor/enterprise-prd-pilot/enterprise_prd/__init__.py`
- Create: `/Users/qqx/my_code_cursor/enterprise-prd-pilot/enterprise_prd/bootstrap.py`
- Create: `/Users/qqx/my_code_cursor/enterprise-prd-pilot/docs/recovery.md`

- [ ] **Step 1: Run the execution preflight and verify the target is absent**

Read shared `adaptive-orchestration` and record the active authorization boundary. Then run:

```bash
test ! -e /Users/qqx/my_code_cursor/enterprise-prd-pilot
python3 --version
lark-cli --version
```

Expected: target path is absent, Python is `3.12.x`, and `lark-cli` is `1.0.66`. If the target exists, stop at the declared decision boundary; do not merge into it automatically.

- [ ] **Step 2: Create the repository skeleton**

Run only after the execution authorization explicitly includes local repository creation:

```bash
mkdir -p /Users/qqx/my_code_cursor/enterprise-prd-pilot/enterprise_prd/adapters
mkdir -p /Users/qqx/my_code_cursor/enterprise-prd-pilot/tests/fixtures/local-docs
mkdir -p /Users/qqx/my_code_cursor/enterprise-prd-pilot/packs/example-company
mkdir -p /Users/qqx/my_code_cursor/enterprise-prd-pilot/skills/enterprise-prd-chain
mkdir -p /Users/qqx/my_code_cursor/enterprise-prd-pilot/registry/releases
mkdir -p /Users/qqx/my_code_cursor/enterprise-prd-pilot/docs
git init /Users/qqx/my_code_cursor/enterprise-prd-pilot
```

Expected: `git -C /Users/qqx/my_code_cursor/enterprise-prd-pilot status --short --branch` reports an empty repository.

- [ ] **Step 3: Create package metadata and repository exclusions**

Create `.gitignore`:

```gitignore
.venv/
__pycache__/
*.pyc
tmp/
packs/company-product/sources/catalog.local.yaml
pilot/private/
```

Create `pyproject.toml`:

```toml
[build-system]
requires = ["setuptools>=75"]
build-backend = "setuptools.build_meta"

[project]
name = "enterprise-prd"
version = "0.1.0"
requires-python = ">=3.12,<3.13"
dependencies = ["PyYAML>=6.0,<7.0"]

[project.scripts]
enterprise-prd = "enterprise_prd.bootstrap:main"

[tool.setuptools.packages.find]
include = ["enterprise_prd*"]
```

Create `enterprise_prd/__init__.py`:

```python
__version__ = "0.1.0"
```

Create `enterprise_prd/bootstrap.py`:

```python
from __future__ import annotations

import os
import sys
from pathlib import Path

import yaml


def _configured_runtime() -> Path | None:
    config = Path.home() / ".enterprise-prd/config.yaml"
    if not config.is_file():
        return None
    raw = yaml.safe_load(config.read_text(encoding="utf-8"))
    if type(raw) is not dict or type(raw.get("install_root")) is not str:
        return None
    install_root = Path(raw["install_root"]).expanduser()
    runtime = install_root / "current/skill/runtime"
    return runtime if (runtime / "enterprise_prd/cli.py").is_file() else None


def main() -> int:
    runtime = _configured_runtime()
    if runtime is not None:
        environment = os.environ.copy()
        loader = (
            "import runpy,sys;"
            "sys.path.insert(0,sys.argv.pop(1));"
            "runpy.run_module('enterprise_prd.cli',run_name='__main__')"
        )
        os.execve(
            sys.executable,
            [sys.executable, "-c", loader, str(runtime), *sys.argv[1:]],
            environment,
        )
    from .cli import main as cli_main

    return cli_main()
```

- [ ] **Step 4: Write the repository boundary**

Create `README.md`:

```markdown
# Enterprise PRD Pilot

Private V0 source for the enterprise PRD Skill runtime, capability-pack
contracts, document adapters, release updater, and pilot evidence.

## Safety boundary

- Dynamic PRD bodies remain in the enterprise source system.
- Runtime logs store IDs, revisions, hashes, states, and durations, not PRD bodies.
- Personal Obsidian paths and company secrets are forbidden in distributable Skills.
- V0 writeback is one reviewed local operation with an expected revision; overwrite is forbidden.

## Development

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -e .
.venv/bin/python -m unittest discover -s tests -v
```
```

Create `docs/recovery.md`:

```markdown
# Recovery

- phase: foundation
- foundation_next_step: Task 2 Step 1
- last_valid_test: none
- external_state: no live registry or document access
- resume_rule: run the current task's named unittest module before continuing
```

- [ ] **Step 5: Install locally and commit the skeleton**

Run:

```bash
cd /Users/qqx/my_code_cursor/enterprise-prd-pilot
python3 -m venv .venv
.venv/bin/python -m pip install -e .
.venv/bin/python -c "import enterprise_prd; print(enterprise_prd.__version__)"
git add .gitignore pyproject.toml README.md enterprise_prd/__init__.py enterprise_prd/bootstrap.py docs/recovery.md
git commit -m "chore: initialize enterprise PRD pilot"
```

Expected: version output is `0.1.0`; commit contains the bootstrap source plus repository skeleton；`.venv/` is absent from `git status --short`.

### Task 2: Define strict runtime contracts

**Files:**
- Create: `enterprise_prd/errors.py`
- Create: `enterprise_prd/canonical.py`
- Create: `enterprise_prd/contracts.py`
- Create: `tests/test_contracts.py`

- [ ] **Step 1: Write the failing contract tests**

Create `tests/test_contracts.py`:

```python
from __future__ import annotations

import unittest

from enterprise_prd.contracts import (
    AccessDecision,
    KnowledgeContract,
    MissingBehavior,
    PackManifest,
    ReleaseChannel,
    ReleaseRef,
    StableManifest,
    UpdateStatus,
    WriteCommand,
)
from enterprise_prd.errors import ContractError


HASH = "a" * 64


class ContractTest(unittest.TestCase):
    def release(self, name: str, version: str) -> ReleaseRef:
        return ReleaseRef(name=name, version=version, archive=f"{name}-{version}.zip", sha256=HASH)

    def test_stable_manifest_requires_compatible_pair(self) -> None:
        manifest = StableManifest(
            schema_version=1,
            channel="stable",
            skill=self.release("enterprise-prd-skills", "1.4.2"),
            company_pack=self.release("company-product", "0.9.5"),
            compatible_skill=">=1.4.0,<2.0.0",
            published_by="pilot-owner",
            published_at="2026-07-26T12:00:00+08:00",
            force_update=False,
        )
        manifest.validate()
        self.assertEqual(manifest.skill.version, "1.4.2")

    def test_canary_uses_the_same_closed_contract(self) -> None:
        manifest = StableManifest(
            schema_version=1,
            channel=ReleaseChannel.CANARY.value,
            skill=self.release("enterprise-prd-skills", "1.4.2"),
            company_pack=self.release("company-product", "0.9.5"),
            compatible_skill=">=1.4.0,<2.0.0",
            published_by="pilot-owner",
            published_at="2026-07-26T12:00:00+08:00",
            force_update=False,
        )
        manifest.validate()

    def test_release_archive_rejects_path_escape(self) -> None:
        with self.assertRaises(ContractError):
            ReleaseRef(
                name="enterprise-prd-skills",
                version="1.4.2",
                archive="../enterprise-prd-skills.zip",
                sha256=HASH,
            ).validate()

    def test_manifest_rejects_skill_outside_pack_range(self) -> None:
        manifest = StableManifest(
            schema_version=1,
            channel="stable",
            skill=self.release("enterprise-prd-skills", "2.0.0"),
            company_pack=self.release("company-product", "0.9.5"),
            compatible_skill=">=1.4.0,<2.0.0",
            published_by="pilot-owner",
            published_at="2026-07-26T12:00:00+08:00",
            force_update=False,
        )
        with self.assertRaises(ContractError):
            manifest.validate()

    def test_contract_closes_missing_behavior_and_budget(self) -> None:
        contract = KnowledgeContract(
            stage="writer",
            required=("current-prd", "company-standards"),
            optional=("tagged-cases",),
            source_scopes=("project", "company-product"),
            authority=("current-project", "company-standard", "tagged-case", "general-method"),
            max_items=8,
            max_chars=24000,
            freshness_seconds=300,
            missing_behavior=MissingBehavior.BLOCK,
            evidence_required=True,
            writeback="preview-confirm",
        )
        contract.validate()
        self.assertEqual(contract.missing_behavior, MissingBehavior.BLOCK)

    def test_contract_rejects_open_ended_or_duplicate_values(self) -> None:
        with self.assertRaises(ContractError):
            KnowledgeContract(
                stage="writer",
                required=("current-prd", "current-prd"),
                optional=(),
                source_scopes=("project",),
                authority=("current-project",),
                max_items=0,
                max_chars=1,
                freshness_seconds=1,
                missing_behavior=MissingBehavior.BLOCK,
                evidence_required=True,
                writeback="preview-confirm",
            ).validate()

    def test_pack_manifest_rejects_candidates_in_runtime_paths(self) -> None:
        with self.assertRaises(ContractError):
            PackManifest(
                schema_version=1,
                pack_id="company-product",
                version="0.1.0",
                compatible_skill=">=0.1.0,<1.0.0",
                published_by="pilot-owner",
                published_at="2026-07-26T12:00:00+08:00",
                runtime_paths=("contracts", "standards", "governance/candidates"),
            ).validate()

    def test_enums_are_closed(self) -> None:
        self.assertEqual({item.value for item in UpdateStatus}, {
            "current", "update_available", "degraded_cache",
            "blocked_force_update", "failed_integrity",
        })
        self.assertEqual({item.value for item in AccessDecision}, {"allowed", "denied", "unknown"})
        self.assertEqual({item.value for item in WriteCommand}, {
            "str_replace", "block_replace", "block_insert_after",
        })


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Run the contract tests and verify they fail**

Run:

```bash
cd /Users/qqx/my_code_cursor/enterprise-prd-pilot
.venv/bin/python -m unittest tests.test_contracts -v
```

Expected: FAIL with `ModuleNotFoundError` for `enterprise_prd.contracts`.

- [ ] **Step 3: Implement stable errors and canonical helpers**

Create `enterprise_prd/errors.py`:

```python
class EnterprisePrdError(RuntimeError):
    code = "enterprise_prd_error"


class ContractError(EnterprisePrdError):
    code = "contract_error"


class IntegrityError(EnterprisePrdError):
    code = "integrity_error"


class RegistryUnavailable(EnterprisePrdError):
    code = "registry_unavailable"


class AccessDenied(EnterprisePrdError):
    code = "access_denied"


class RevisionConflict(EnterprisePrdError):
    code = "revision_conflict"
```

Create `enterprise_prd/canonical.py`:

```python
from __future__ import annotations

import hashlib
import json
from pathlib import Path

import yaml

from .errors import ContractError


def load_yaml(path: Path) -> dict:
    value = yaml.safe_load(path.read_text(encoding="utf-8"))
    if type(value) is not dict:
        raise ContractError(f"{path} must contain one YAML object")
    return value


def canonical_json(value: object) -> bytes:
    return json.dumps(
        value,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()
```

- [ ] **Step 4: Implement the closed contracts**

Create `enterprise_prd/contracts.py`:

```python
from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from pathlib import PurePosixPath

from .errors import ContractError


class StrEnum(str, Enum):
    pass


class UpdateStatus(StrEnum):
    CURRENT = "current"
    UPDATE_AVAILABLE = "update_available"
    DEGRADED_CACHE = "degraded_cache"
    BLOCKED_FORCE_UPDATE = "blocked_force_update"
    FAILED_INTEGRITY = "failed_integrity"


class ReleaseChannel(StrEnum):
    CANARY = "canary"
    STABLE = "stable"


class AccessDecision(StrEnum):
    ALLOWED = "allowed"
    DENIED = "denied"
    UNKNOWN = "unknown"


class MissingBehavior(StrEnum):
    BLOCK = "block"
    DEGRADE = "degrade"
    ASK_USER = "ask_user"


class WriteCommand(StrEnum):
    STR_REPLACE = "str_replace"
    BLOCK_REPLACE = "block_replace"
    BLOCK_INSERT_AFTER = "block_insert_after"


HASH_RE = re.compile(r"^[0-9a-f]{64}$")
VERSION_RE = re.compile(r"^\d+\.\d+\.\d+$")
RANGE_RE = re.compile(r"^>=(\d+\.\d+\.\d+),<(\d+\.\d+\.\d+)$")
IDENTITY_RE = re.compile(r"^[a-z0-9][a-z0-9-]{1,62}$")


def need(condition: bool, message: str) -> None:
    if not condition:
        raise ContractError(message)


def exact_strings(values: tuple[str, ...], field: str, *, nonempty: bool = True) -> None:
    need(type(values) is tuple, f"{field} must be a tuple")
    need(all(type(value) is str and value.strip() for value in values), f"{field} has empty values")
    need(len(values) == len(set(values)), f"{field} has duplicates")
    if nonempty:
        need(bool(values), f"{field} is required")


def aware_timestamp(value: str, field: str) -> None:
    parsed = datetime.fromisoformat(value)
    need(parsed.tzinfo is not None and parsed.utcoffset() is not None, f"{field} needs UTC offset")


def compatible_version(version: str, requirement: str) -> bool:
    match = RANGE_RE.fullmatch(requirement)
    need(bool(VERSION_RE.fullmatch(version)) and match is not None, "version range is invalid")
    assert match is not None
    parsed = tuple(int(part) for part in version.split("."))
    lower = tuple(int(part) for part in match.group(1).split("."))
    upper = tuple(int(part) for part in match.group(2).split("."))
    return lower <= parsed < upper


@dataclass(frozen=True)
class ReleaseRef:
    name: str
    version: str
    archive: str
    sha256: str

    def validate(self) -> None:
        archive = PurePosixPath(self.archive)
        need(bool(IDENTITY_RE.fullmatch(self.name)), "release name is invalid")
        need(bool(VERSION_RE.fullmatch(self.version)), "release version must be semver")
        need(
            archive.suffix == ".zip"
            and not archive.is_absolute()
            and ".." not in archive.parts,
            "archive must be a safe relative ZIP path",
        )
        need(bool(HASH_RE.fullmatch(self.sha256)), "release sha256 is invalid")


@dataclass(frozen=True)
class StableManifest:
    schema_version: int
    channel: str
    skill: ReleaseRef
    company_pack: ReleaseRef
    compatible_skill: str
    published_by: str
    published_at: str
    force_update: bool

    def validate(self) -> None:
        need(self.schema_version == 1, "release manifest schema_version must be 1")
        need(self.channel in {item.value for item in ReleaseChannel}, "release channel is invalid")
        self.skill.validate()
        self.company_pack.validate()
        need(self.company_pack.version != "", "company pack version is required")
        need(compatible_version(self.skill.version, self.compatible_skill), "skill pair is incompatible")
        need(bool(self.published_by.strip()), "published_by is required")
        aware_timestamp(self.published_at, "published_at")
        need(type(self.force_update) is bool, "force_update must be boolean")


@dataclass(frozen=True)
class PackManifest:
    schema_version: int
    pack_id: str
    version: str
    compatible_skill: str
    published_by: str
    published_at: str
    runtime_paths: tuple[str, ...]

    def validate(self) -> None:
        need(self.schema_version == 1, "pack schema_version must be 1")
        need(bool(IDENTITY_RE.fullmatch(self.pack_id)), "pack_id is invalid")
        need(bool(VERSION_RE.fullmatch(self.version)), "pack version must be semver")
        need(RANGE_RE.fullmatch(self.compatible_skill) is not None, "compatible_skill is invalid")
        need(bool(self.published_by.strip()), "published_by is required")
        aware_timestamp(self.published_at, "published_at")
        exact_strings(self.runtime_paths, "runtime_paths")
        need(all(not path.startswith("/") and ".." not in path.split("/") for path in self.runtime_paths), "runtime path escapes pack")
        need(all(not path.startswith("governance") for path in self.runtime_paths), "governance is not distributable")


@dataclass(frozen=True)
class KnowledgeContract:
    stage: str
    required: tuple[str, ...]
    optional: tuple[str, ...]
    source_scopes: tuple[str, ...]
    authority: tuple[str, ...]
    max_items: int
    max_chars: int
    freshness_seconds: int
    missing_behavior: MissingBehavior
    evidence_required: bool
    writeback: str

    def validate(self) -> None:
        need(self.stage in {"discovery", "writer", "reviewer"}, "stage is invalid")
        exact_strings(self.required, "required")
        exact_strings(self.optional, "optional", nonempty=False)
        need(not set(self.required) & set(self.optional), "required and optional overlap")
        exact_strings(self.source_scopes, "source_scopes")
        exact_strings(self.authority, "authority")
        need(type(self.max_items) is int and 1 <= self.max_items <= 20, "max_items must be 1..20")
        need(type(self.max_chars) is int and 1000 <= self.max_chars <= 100000, "max_chars must be 1000..100000")
        need(type(self.freshness_seconds) is int and self.freshness_seconds >= 0, "freshness_seconds is invalid")
        need(type(self.missing_behavior) is MissingBehavior, "missing_behavior is invalid")
        need(type(self.evidence_required) is bool, "evidence_required must be boolean")
        need(self.writeback in {"none", "preview-confirm"}, "writeback is invalid")
```

- [ ] **Step 5: Run and commit the contract tests**

Run:

```bash
cd /Users/qqx/my_code_cursor/enterprise-prd-pilot
.venv/bin/python -m unittest tests.test_contracts -v
git add enterprise_prd/errors.py enterprise_prd/canonical.py enterprise_prd/contracts.py tests/test_contracts.py
git commit -m "feat: define enterprise PRD contracts"
```

Expected: all contract tests pass, including canary, path-escape and incompatible-version rejection; commit contains only contracts, helpers, errors, and tests.

### Task 3: Load and validate distributable capability packs

**Files:**
- Create: `enterprise_prd/pack.py`
- Create: `tests/test_pack.py`
- Create: `packs/example-company/pack.yaml`
- Create: `packs/example-company/contracts/prd.yaml`
- Create: `packs/example-company/standards/prd-standard.md`
- Create: `packs/example-company/cases/index.yaml`
- Create: `packs/example-company/sources/catalog.yaml`
- Create: `packs/example-company/governance/candidates/README.md`

- [ ] **Step 1: Create the failing pack tests**

Create `tests/test_pack.py`:

```python
from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from enterprise_prd.errors import ContractError
from enterprise_prd.pack import load_pack, runtime_files


ROOT = Path(__file__).resolve().parents[1]


class PackTest(unittest.TestCase):
    def test_example_pack_loads_and_excludes_governance(self) -> None:
        pack = load_pack(ROOT / "packs/example-company")
        self.assertEqual(pack.manifest.pack_id, "example-company")
        files = {path.relative_to(pack.root).as_posix() for path in runtime_files(pack)}
        self.assertIn("contracts/prd.yaml", files)
        self.assertIn("standards/prd-standard.md", files)
        self.assertNotIn("governance/candidates/README.md", files)

    def test_missing_runtime_path_is_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            (root / "pack.yaml").write_text(
                "schema_version: 1\npack_id: broken-pack\nversion: 0.1.0\n"
                "compatible_skill: '>=0.1.0,<1.0.0'\npublished_by: owner\n"
                "published_at: '2026-07-26T12:00:00+08:00'\n"
                "runtime_paths: [contracts]\n",
                encoding="utf-8",
            )
            with self.assertRaises(ContractError):
                load_pack(root)


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Run and verify the pack tests fail**

Run:

```bash
.venv/bin/python -m unittest tests.test_pack -v
```

Expected: FAIL because `enterprise_prd.pack` does not exist.

- [ ] **Step 3: Create the example pack**

Create `packs/example-company/pack.yaml`:

```yaml
schema_version: 1
pack_id: example-company
version: 0.1.0
compatible_skill: ">=0.1.0,<1.0.0"
published_by: pilot-owner
published_at: "2026-07-26T12:00:00+08:00"
runtime_paths:
  - contracts
  - standards
  - cases
  - sources
```

Create `packs/example-company/contracts/prd.yaml`:

```yaml
schema_version: 1
contracts:
  - stage: discovery
    required: [current-prd, company-standards]
    optional: [tagged-cases]
    source_scopes: [project, company-product]
    authority: [current-project, company-standard, tagged-case, general-method]
    max_items: 8
    max_chars: 24000
    freshness_seconds: 300
    missing_behavior: ask_user
    evidence_required: true
    writeback: none
  - stage: writer
    required: [current-prd, confirmed-decisions, company-standards]
    optional: [tagged-cases]
    source_scopes: [project, company-product]
    authority: [current-project, company-standard, tagged-case, general-method]
    max_items: 10
    max_chars: 32000
    freshness_seconds: 300
    missing_behavior: block
    evidence_required: true
    writeback: preview-confirm
  - stage: reviewer
    required: [review-target, company-review-rubric]
    optional: [project-evidence, tagged-cases]
    source_scopes: [project, company-product]
    authority: [current-project, company-standard, tagged-case, general-method]
    max_items: 10
    max_chars: 32000
    freshness_seconds: 300
    missing_behavior: block
    evidence_required: true
    writeback: none
```

Create `packs/example-company/standards/prd-standard.md`:

```markdown
# Example PRD Standard

- Every business rule states trigger, rule, observable result, failure result, and acceptance.
- Unconfirmed decisions stay explicitly unconfirmed.
- Shared high-impact edits reject silent overwrite.
- A Blocker prevents implementation planning.
```

Create `packs/example-company/cases/index.yaml`:

```yaml
schema_version: 1
cases: []
```

Create `packs/example-company/sources/catalog.yaml`:

```yaml
schema_version: 1
sources:
  - source_id: local-fixtures
    adapter: local
    scopes: [project]
    root: tests/fixtures/local-docs
```

Create `packs/example-company/governance/candidates/README.md`:

```markdown
# Candidates

Governance-only proposals live here and are excluded from runtime releases.
```

- [ ] **Step 4: Implement strict pack loading**

Create `enterprise_prd/pack.py`:

```python
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from .canonical import load_yaml
from .contracts import PackManifest
from .errors import ContractError


@dataclass(frozen=True)
class CapabilityPack:
    root: Path
    manifest: PackManifest


def load_pack(root: Path) -> CapabilityPack:
    resolved = root.resolve()
    if not resolved.is_dir():
        raise ContractError(f"pack root does not exist: {root}")
    raw = load_yaml(resolved / "pack.yaml")
    expected = {
        "schema_version", "pack_id", "version", "compatible_skill",
        "published_by", "published_at", "runtime_paths",
    }
    if set(raw) != expected or type(raw["runtime_paths"]) is not list:
        raise ContractError("pack.yaml fields are invalid")
    manifest = PackManifest(
        schema_version=raw["schema_version"],
        pack_id=raw["pack_id"],
        version=raw["version"],
        compatible_skill=raw["compatible_skill"],
        published_by=raw["published_by"],
        published_at=raw["published_at"],
        runtime_paths=tuple(raw["runtime_paths"]),
    )
    manifest.validate()
    for relative in manifest.runtime_paths:
        path = (resolved / relative).resolve()
        if resolved not in path.parents or not path.exists():
            raise ContractError(f"runtime path is missing or escapes pack: {relative}")
    return CapabilityPack(root=resolved, manifest=manifest)


def runtime_files(pack: CapabilityPack) -> tuple[Path, ...]:
    files: list[Path] = [pack.root / "pack.yaml"]
    for relative in pack.manifest.runtime_paths:
        path = pack.root / relative
        if path.is_file():
            files.append(path)
        else:
            files.extend(item for item in sorted(path.rglob("*")) if item.is_file())
    for path in files:
        relative = path.relative_to(pack.root)
        if relative.parts and relative.parts[0] == "governance":
            raise ContractError("governance files cannot enter runtime release")
    return tuple(files)
```

- [ ] **Step 5: Run and commit pack validation**

Run:

```bash
.venv/bin/python -m unittest tests.test_pack -v
git add enterprise_prd/pack.py packs/example-company tests/test_pack.py
git commit -m "feat: validate enterprise capability packs"
```

Expected: 2 tests pass; governance candidate exists in source but is absent from runtime file list.

### Task 4: Define the Adapter protocol and Local Adapter

**Files:**
- Create: `enterprise_prd/adapters/__init__.py`
- Create: `enterprise_prd/adapters/base.py`
- Create: `enterprise_prd/adapters/local.py`
- Create: `tests/fixtures/local-docs/alpha.md`
- Create: `tests/test_local_adapter.py`

- [ ] **Step 1: Write the failing Local Adapter contract test**

Create `tests/test_local_adapter.py`:

```python
from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from enterprise_prd.adapters.base import AccessAction
from enterprise_prd.adapters.local import LocalAdapter
from enterprise_prd.contracts import AccessDecision
from enterprise_prd.errors import AccessDenied


ROOT = Path(__file__).resolve().parents[1]


class LocalAdapterTest(unittest.TestCase):
    def test_search_read_revision_and_access(self) -> None:
        adapter = LocalAdapter(ROOT / "tests/fixtures/local-docs")
        hits = adapter.search("Alpha", scope="project")
        self.assertEqual([hit.document_id for hit in hits], ["alpha.md"])
        document = adapter.read("alpha.md")
        self.assertEqual(document.revision, document.content_hash)
        metadata = adapter.metadata("alpha.md")
        self.assertEqual(metadata.revision, document.revision)
        self.assertEqual(metadata.document_type, "markdown")
        self.assertEqual(adapter.check_access("alpha.md", AccessAction.READ), AccessDecision.ALLOWED)
        self.assertEqual(adapter.check_access("alpha.md", AccessAction.WRITE), AccessDecision.DENIED)

    def test_path_escape_is_denied(self) -> None:
        adapter = LocalAdapter(ROOT / "tests/fixtures/local-docs")
        with self.assertRaises(AccessDenied):
            adapter.read("../pack.yaml")


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Run and verify the Local Adapter test fails**

Run:

```bash
.venv/bin/python -m unittest tests.test_local_adapter -v
```

Expected: FAIL because Adapter modules do not exist.

- [ ] **Step 3: Implement the protocol**

Create `enterprise_prd/adapters/__init__.py` as an empty file.

Create `enterprise_prd/adapters/base.py`:

```python
from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Protocol

from enterprise_prd.contracts import AccessDecision


class AccessAction(str, Enum):
    READ = "read"
    WRITE = "write"


@dataclass(frozen=True)
class SearchHit:
    document_id: str
    title: str
    revision: str
    source_url: str


@dataclass(frozen=True)
class SourceDocument:
    document_id: str
    title: str
    revision: str
    content: str
    content_hash: str
    source_url: str
    realtime: bool


@dataclass(frozen=True)
class SourceMetadata:
    document_id: str
    title: str
    revision: str
    source_url: str
    document_type: str
    author: str | None
    modified_at: str | None


class DocumentAdapter(Protocol):
    def search(self, query: str, *, scope: str) -> tuple[SearchHit, ...]: ...
    def metadata(self, document_id: str) -> SourceMetadata: ...
    def read(self, document_id: str, *, revision: str | None = None) -> SourceDocument: ...
    def revision(self, document_id: str) -> str: ...
    def check_access(self, document_id: str, action: AccessAction) -> AccessDecision: ...
```

- [ ] **Step 4: Implement the read-only Local Adapter**

Create `enterprise_prd/adapters/local.py`:

```python
from __future__ import annotations

from pathlib import Path

from enterprise_prd.canonical import sha256_bytes
from enterprise_prd.contracts import AccessDecision
from enterprise_prd.errors import AccessDenied, ContractError

from .base import AccessAction, SearchHit, SourceDocument, SourceMetadata


class LocalAdapter:
    def __init__(self, root: Path) -> None:
        self.root = root.resolve()
        if not self.root.is_dir():
            raise ContractError("local adapter root must exist")

    def _path(self, document_id: str) -> Path:
        path = (self.root / document_id).resolve()
        if self.root not in path.parents or not path.is_file():
            raise AccessDenied(f"document is outside local scope: {document_id}")
        return path

    def search(self, query: str, *, scope: str) -> tuple[SearchHit, ...]:
        if scope != "project":
            raise ContractError("local adapter only exposes project scope")
        lowered = query.casefold()
        hits = []
        for path in sorted(self.root.glob("*.md")):
            content = path.read_text(encoding="utf-8")
            if lowered in path.stem.casefold() or lowered in content.casefold():
                revision = sha256_bytes(content.encode("utf-8"))
                hits.append(SearchHit(path.name, path.stem, revision, path.as_uri()))
        return tuple(hits)

    def read(self, document_id: str, *, revision: str | None = None) -> SourceDocument:
        path = self._path(document_id)
        content = path.read_text(encoding="utf-8")
        current = sha256_bytes(content.encode("utf-8"))
        if revision is not None and revision != current:
            raise ContractError("requested local revision is not current")
        return SourceDocument(
            document_id=path.name,
            title=path.stem,
            revision=current,
            content=content,
            content_hash=current,
            source_url=path.as_uri(),
            realtime=True,
        )

    def metadata(self, document_id: str) -> SourceMetadata:
        path = self._path(document_id)
        content = path.read_text(encoding="utf-8")
        stat = path.stat()
        return SourceMetadata(
            document_id=path.name,
            title=path.stem,
            revision=sha256_bytes(content.encode("utf-8")),
            source_url=path.as_uri(),
            document_type="markdown",
            author=None,
            modified_at=str(stat.st_mtime_ns),
        )

    def revision(self, document_id: str) -> str:
        return self.metadata(document_id).revision

    def check_access(self, document_id: str, action: AccessAction) -> AccessDecision:
        try:
            self._path(document_id)
        except AccessDenied:
            return AccessDecision.DENIED
        return AccessDecision.ALLOWED if action is AccessAction.READ else AccessDecision.DENIED
```

Create `tests/fixtures/local-docs/alpha.md`:

```markdown
# Alpha PRD

Current project decision: reject silent overwrite for shared rules.
```

- [ ] **Step 5: Run and commit the Adapter contract**

Run:

```bash
.venv/bin/python -m unittest tests.test_local_adapter -v
git add enterprise_prd/adapters tests/fixtures/local-docs tests/test_local_adapter.py
git commit -m "feat: add channel-neutral document adapter contract"
```

Expected: 2 tests pass; write access is deterministically denied.

### Task 5: Build immutable releases and registry clients

**Files:**
- Create: `enterprise_prd/registry.py`
- Create: `tests/test_registry.py`
- Create: `skills/enterprise-prd-chain/SKILL.md`

- [ ] **Step 1: Write failing release and registry tests**

Create `tests/test_registry.py`:

```python
from __future__ import annotations

import tempfile
import unittest
import zipfile
from pathlib import Path

from enterprise_prd.canonical import sha256_file
from enterprise_prd.registry import FileRegistry, build_skill_bundle, build_zip


ROOT = Path(__file__).resolve().parents[1]


class RegistryTest(unittest.TestCase):
    def test_build_zip_is_deterministic_and_fetchable(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            target = Path(raw) / "example.zip"
            first = build_zip(ROOT / "packs/example-company", target)
            second = build_zip(ROOT / "packs/example-company", target)
            self.assertEqual(first, second)
            self.assertEqual(first, sha256_file(target))
            with zipfile.ZipFile(target) as built:
                names = built.namelist()
            self.assertFalse(any("governance/" in name for name in names))
            self.assertNotIn("sources/catalog.local.yaml", names)
            registry = FileRegistry(Path(raw))
            self.assertEqual(registry.fetch_bytes("example.zip"), target.read_bytes())

    def test_registry_rejects_path_escape(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            registry = FileRegistry(Path(raw))
            with self.assertRaises(ValueError):
                registry.fetch_bytes("../secret")

    def test_skill_bundle_contains_entrypoints_and_runtime(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            target = Path(raw) / "skills.zip"
            build_skill_bundle(ROOT / "enterprise_prd", ROOT / "skills", target)
            with zipfile.ZipFile(target) as built:
                names = built.namelist()
            self.assertIn("enterprise-prd-chain/SKILL.md", names)
            self.assertIn("runtime/enterprise_prd/cli.py", names)


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Run and verify the registry tests fail**

Run:

```bash
.venv/bin/python -m unittest tests.test_registry -v
```

Expected: FAIL because `enterprise_prd.registry` does not exist.

- [ ] **Step 3: Create a minimal distributable Skill source**

Create `skills/enterprise-prd-chain/SKILL.md`:

```markdown
---
name: enterprise-prd-chain
description: Start an enterprise PRD task from an approved Skill/capability-pack pair.
---

# Enterprise PRD Chain

Run `enterprise-prd update status` before starting. Do not read personal
Obsidian paths. Dynamic documents must be accessed through a configured
DocumentAdapter. Full writer/reviewer behavior is added by the Workflow plan.
```

- [ ] **Step 4: Implement deterministic ZIP and file/HTTPS registry**

Create `enterprise_prd/registry.py`:

```python
from __future__ import annotations

import io
import shutil
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
import zipfile
from pathlib import Path

from .canonical import sha256_file
from .errors import RegistryUnavailable


def build_zip(source: Path, target: Path) -> str:
    source = source.resolve()
    target.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(target, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(item for item in source.rglob("*") if item.is_file()):
            relative_path = path.relative_to(source)
            if (
                "governance" in relative_path.parts
                or "__pycache__" in relative_path.parts
                or relative_path.name == "catalog.local.yaml"
                or relative_path.suffix == ".pyc"
            ):
                continue
            relative = relative_path.as_posix()
            info = zipfile.ZipInfo(relative, date_time=(2026, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            archive.writestr(info, path.read_bytes())
    return sha256_file(target)


def build_skill_bundle(package: Path, skills: Path, target: Path) -> str:
    with tempfile.TemporaryDirectory() as raw:
        staging = Path(raw)
        shutil.copytree(
            package,
            staging / "runtime" / package.name,
            ignore=shutil.ignore_patterns("__pycache__", "*.pyc"),
        )
        for skill in sorted(path for path in skills.iterdir() if path.is_dir()):
            if not (skill / "SKILL.md").is_file():
                continue
            shutil.copytree(skill, staging / skill.name)
        return build_zip(staging, target)


class FileRegistry:
    def __init__(self, root: Path) -> None:
        self.root = root.resolve()

    def fetch_bytes(self, relative: str) -> bytes:
        path = (self.root / relative).resolve()
        if self.root not in path.parents:
            raise ValueError("registry path is invalid")
        if not path.is_file():
            raise RegistryUnavailable(f"registry object is unavailable: {relative}")
        return path.read_bytes()


class HttpsRegistry:
    def __init__(self, base_url: str, *, bearer_token: str | None = None) -> None:
        parsed = urllib.parse.urlparse(base_url)
        if parsed.scheme != "https":
            raise ValueError("registry URL must use https")
        self.base_url = base_url.rstrip("/") + "/"
        self.bearer_token = bearer_token

    def fetch_bytes(self, relative: str) -> bytes:
        if relative.startswith("/") or ".." in relative.split("/"):
            raise ValueError("registry path is invalid")
        url = urllib.parse.urljoin(self.base_url, relative)
        delays = (0.0, 0.2, 0.5)
        last_error: Exception | None = None
        for delay in delays:
            if delay:
                time.sleep(delay)
            request = urllib.request.Request(url)
            if self.bearer_token:
                request.add_header("Authorization", f"Bearer {self.bearer_token}")
            try:
                with urllib.request.urlopen(request, timeout=10) as response:
                    return response.read()
            except urllib.error.HTTPError as exc:
                if exc.code not in {429, 500, 502, 503, 504}:
                    raise RegistryUnavailable(f"registry HTTP {exc.code}") from exc
                last_error = exc
            except (TimeoutError, urllib.error.URLError) as exc:
                last_error = exc
        raise RegistryUnavailable(f"registry unavailable after 3 attempts: {last_error}")
```

- [ ] **Step 5: Run and commit release infrastructure**

Run:

```bash
.venv/bin/python -m unittest tests.test_registry -v
git add enterprise_prd/registry.py tests/test_registry.py skills/enterprise-prd-chain/SKILL.md
git commit -m "feat: build immutable enterprise PRD releases"
```

Expected: 3 tests pass; rebuilding the same source produces the same SHA-256，and the Skill bundle contains both runtime and Agent entrypoints.

### Task 6: Apply atomic stable updates and rollback

**Files:**
- Create: `enterprise_prd/updater.py`
- Create: `tests/test_updater.py`

- [ ] **Step 1: Write failing updater tests**

Create `tests/test_updater.py`:

```python
from __future__ import annotations

import tempfile
import unittest
from concurrent.futures import ThreadPoolExecutor
from dataclasses import replace
from pathlib import Path

from enterprise_prd.contracts import ReleaseRef, StableManifest
from enterprise_prd.errors import ContractError, IntegrityError
from enterprise_prd.registry import FileRegistry, build_zip
from enterprise_prd.updater import apply_manifest


ROOT = Path(__file__).resolve().parents[1]


class UpdaterTest(unittest.TestCase):
    def manifest(self, skill_hash: str, pack_hash: str) -> StableManifest:
        return StableManifest(
            schema_version=1,
            channel="stable",
            skill=ReleaseRef("enterprise-prd-skills", "0.1.0", "skill.zip", skill_hash),
            company_pack=ReleaseRef("example-company", "0.1.0", "pack.zip", pack_hash),
            compatible_skill=">=0.1.0,<1.0.0",
            published_by="pilot-owner",
            published_at="2026-07-26T12:00:00+08:00",
            force_update=False,
        )

    def test_atomic_pair_install_and_integrity_failure(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            registry_root = root / "registry"
            registry_root.mkdir()
            skill_hash = build_zip(ROOT / "skills", registry_root / "skill.zip")
            pack_hash = build_zip(ROOT / "packs/example-company", registry_root / "pack.zip")
            install_root = root / "install"
            apply_manifest(self.manifest(skill_hash, pack_hash), FileRegistry(registry_root), install_root)
            current = install_root / "current"
            self.assertTrue(current.is_symlink())
            previous = current.resolve()
            (registry_root / "skill.zip").write_bytes(b"damaged archive")
            with self.assertRaises(IntegrityError):
                apply_manifest(
                    self.manifest(skill_hash, pack_hash),
                    FileRegistry(registry_root),
                    install_root,
                )
            self.assertEqual(current.resolve(), previous)

    def test_concurrent_updates_serialize_on_one_pair(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            registry_root = root / "registry"
            registry_root.mkdir()
            skill_hash = build_zip(ROOT / "skills", registry_root / "skill.zip")
            pack_hash = build_zip(ROOT / "packs/example-company", registry_root / "pack.zip")
            manifest = self.manifest(skill_hash, pack_hash)
            install_root = root / "install"
            with ThreadPoolExecutor(max_workers=2) as executor:
                results = list(executor.map(
                    lambda _: apply_manifest(manifest, FileRegistry(registry_root), install_root),
                    range(2),
                ))
            self.assertEqual(results[0], results[1])
            self.assertEqual(
                (install_root / "current").resolve(),
                results[0].resolve(),
            )

    def test_stale_manifest_cannot_win_a_race(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            registry_root = root / "registry"
            registry_root.mkdir()
            skill_hash = build_zip(ROOT / "skills", registry_root / "skill.zip")
            pack_hash = build_zip(ROOT / "packs/example-company", registry_root / "pack.zip")
            old = self.manifest(skill_hash, pack_hash)
            newer = replace(
                old,
                skill=replace(old.skill, version="0.2.0"),
                compatible_skill=">=0.2.0,<1.0.0",
                published_at="2026-07-26T13:00:00+08:00",
            )
            install_root = root / "install"
            apply_manifest(newer, FileRegistry(registry_root), install_root)
            with self.assertRaises(ContractError):
                apply_manifest(old, FileRegistry(registry_root), install_root)
            self.assertEqual(
                (install_root / "current").resolve().name,
                "0.2.0__0.1.0",
            )

    def test_released_version_cannot_be_reused_for_new_bytes(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            registry_root = root / "registry"
            registry_root.mkdir()
            skill_hash = build_zip(ROOT / "skills", registry_root / "skill.zip")
            pack_hash = build_zip(ROOT / "packs/example-company", registry_root / "pack.zip")
            original = self.manifest(skill_hash, pack_hash)
            apply_manifest(original, FileRegistry(registry_root), root / "install")
            reused = replace(
                original,
                skill=replace(original.skill, sha256="0" * 64),
                published_at="2026-07-26T13:00:00+08:00",
            )
            with self.assertRaises(ContractError):
                apply_manifest(reused, FileRegistry(registry_root), root / "install")


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Run and verify the updater test fails**

Run:

```bash
.venv/bin/python -m unittest tests.test_updater -v
```

Expected: FAIL because `enterprise_prd.updater` does not exist.

- [ ] **Step 3: Implement safe extraction and atomic current switching**

Create `enterprise_prd/updater.py`:

```python
from __future__ import annotations

import io
import fcntl
import json
import os
import tempfile
import zipfile
from datetime import datetime
from pathlib import Path

from .canonical import sha256_bytes
from .contracts import ReleaseRef, StableManifest
from .errors import ContractError, IntegrityError


def _safe_extract(payload: bytes, target: Path) -> None:
    with zipfile.ZipFile(io.BytesIO(payload)) as archive:
        for member in archive.infolist():
            destination = (target / member.filename).resolve()
            if target.resolve() not in destination.parents:
                raise IntegrityError("archive contains path traversal")
        archive.extractall(target)


def _install_release(ref: ReleaseRef, registry, parent: Path) -> Path:
    payload = registry.fetch_bytes(ref.archive)
    if sha256_bytes(payload) != ref.sha256:
        raise IntegrityError(f"checksum mismatch for {ref.name}")
    destination = parent / f"{ref.name}-{ref.version}"
    if destination.exists():
        return destination
    with tempfile.TemporaryDirectory(dir=parent, prefix=".extract-") as raw:
        extracted = Path(raw)
        _safe_extract(payload, extracted)
        os.replace(extracted, destination)
    return destination


def _apply_manifest_locked(manifest: StableManifest, registry, install_root: Path) -> Path:
    manifest.validate()
    install_root.mkdir(parents=True, exist_ok=True)
    active_path = install_root / "active-release.json"
    incoming_identity = {
        "published_at": manifest.published_at,
        "skill_version": manifest.skill.version,
        "skill_sha256": manifest.skill.sha256,
        "pack_version": manifest.company_pack.version,
        "pack_sha256": manifest.company_pack.sha256,
    }
    if active_path.is_file():
        active = json.loads(active_path.read_text(encoding="utf-8"))
        if type(active) is not dict or set(active) != set(incoming_identity):
            raise IntegrityError("active release receipt is invalid")
        incoming_time = datetime.fromisoformat(manifest.published_at)
        active_time = datetime.fromisoformat(active["published_at"])
        same_versions = (
            manifest.skill.version == active["skill_version"]
            and manifest.company_pack.version == active["pack_version"]
        )
        same_hashes = (
            manifest.skill.sha256 == active["skill_sha256"]
            and manifest.company_pack.sha256 == active["pack_sha256"]
        )
        if same_versions and not same_hashes:
            raise ContractError("a released version cannot be reused for different bytes")
        if incoming_time < active_time:
            raise ContractError("stale manifest cannot replace a newer published pair")
        if incoming_time == active_time and active != incoming_identity:
            raise ContractError("one published_at cannot identify two release pairs")
    versions = install_root / "versions"
    versions.mkdir(exist_ok=True)
    pair_name = f"{manifest.skill.version}__{manifest.company_pack.version}"
    pair = versions / pair_name
    if not pair.exists():
        staging = versions / f".staging-{pair_name}"
        staging.mkdir()
        try:
            skill = _install_release(manifest.skill, registry, staging)
            pack = _install_release(manifest.company_pack, registry, staging)
            (staging / "skill").symlink_to(skill.name)
            (staging / "pack").symlink_to(pack.name)
            os.replace(staging, pair)
        except Exception:
            if staging.exists():
                for child in sorted(staging.rglob("*"), reverse=True):
                    if child.is_symlink() or child.is_file():
                        child.unlink()
                    elif child.is_dir():
                        child.rmdir()
                staging.rmdir()
            raise
    active_new = install_root / ".active-release.new"
    active_new.write_text(json.dumps(incoming_identity, sort_keys=True), encoding="utf-8")
    os.replace(active_new, active_path)
    new_link = install_root / ".current-new"
    if new_link.exists() or new_link.is_symlink():
        new_link.unlink()
    new_link.symlink_to(Path("versions") / pair_name)
    os.replace(new_link, install_root / "current")
    return pair


def apply_manifest(manifest: StableManifest, registry, install_root: Path) -> Path:
    install_root.mkdir(parents=True, exist_ok=True)
    lock_path = install_root / ".update.lock"
    with lock_path.open("a+b") as lock:
        fcntl.flock(lock.fileno(), fcntl.LOCK_EX)
        try:
            return _apply_manifest_locked(manifest, registry, install_root)
        finally:
            fcntl.flock(lock.fileno(), fcntl.LOCK_UN)
```

- [ ] **Step 4: Run updater and full Foundation tests**

Run:

```bash
.venv/bin/python -m unittest \
  tests.test_contracts \
  tests.test_pack \
  tests.test_registry \
  tests.test_updater \
  tests.test_local_adapter -v
```

Expected: all tests pass; checksum failure preserves the prior `current`.

- [ ] **Step 5: Commit the updater**

Run:

```bash
git add enterprise_prd/updater.py tests/test_updater.py
git commit -m "feat: apply atomic stable release updates"
```

Expected: commit contains updater and its test only.

### Task 7: Add the Foundation CLI and local stable release

**Files:**
- Create: `enterprise_prd/cli.py`
- Create: `enterprise_prd/manifest.py`
- Create: `registry/stable-manifest.yaml`
- Modify: `docs/recovery.md`

- [ ] **Step 1: Write CLI smoke assertions**

Run before implementation:

```bash
.venv/bin/python -m enterprise_prd.cli pack validate --path packs/example-company
```

Expected: FAIL because `enterprise_prd.cli` does not exist.

- [ ] **Step 2: Implement the single manifest parser and Foundation CLI**

Create `enterprise_prd/manifest.py`:

```python
from __future__ import annotations

from pathlib import Path

import yaml

from .contracts import ReleaseRef, StableManifest
from .errors import ContractError


def manifest_from_dict(raw: dict) -> StableManifest:
    if type(raw) is not dict:
        raise ContractError("release manifest must be a mapping")
    expected = {
        "schema_version", "channel", "skill", "company_pack",
        "compatible_skill", "published_by", "published_at", "force_update",
    }
    if set(raw) != expected or type(raw["skill"]) is not dict or type(raw["company_pack"]) is not dict:
        raise ContractError("release manifest fields are invalid")
    ref_fields = {"name", "version", "archive", "sha256"}
    if set(raw["skill"]) != ref_fields or set(raw["company_pack"]) != ref_fields:
        raise ContractError("release reference fields are invalid")
    manifest = StableManifest(
        schema_version=raw["schema_version"],
        channel=raw["channel"],
        skill=ReleaseRef(**raw["skill"]),
        company_pack=ReleaseRef(**raw["company_pack"]),
        compatible_skill=raw["compatible_skill"],
        published_by=raw["published_by"],
        published_at=raw["published_at"],
        force_update=raw["force_update"],
    )
    manifest.validate()
    return manifest


def manifest_from_bytes(payload: bytes) -> StableManifest:
    raw = yaml.safe_load(payload.decode("utf-8"))
    return manifest_from_dict(raw)


def manifest_from_file(path: Path) -> StableManifest:
    return manifest_from_bytes(path.read_bytes())
```

Create `enterprise_prd/cli.py`:

```python
from __future__ import annotations

import argparse
import json
import os
from datetime import datetime, timezone
from pathlib import Path

import yaml

from .canonical import sha256_file
from .manifest import manifest_from_file
from .pack import load_pack
from .registry import FileRegistry, build_skill_bundle, build_zip
from .updater import apply_manifest

def main() -> int:
    parser = argparse.ArgumentParser(prog="enterprise-prd")
    commands = parser.add_subparsers(dest="command", required=True)

    pack = commands.add_parser("pack")
    pack_sub = pack.add_subparsers(dest="pack_command", required=True)
    validate = pack_sub.add_parser("validate")
    validate.add_argument("--path", type=Path, required=True)

    release = commands.add_parser("release")
    release_sub = release.add_subparsers(dest="release_command", required=True)
    build = release_sub.add_parser("build")
    build.add_argument("--source", type=Path, required=True)
    build.add_argument("--output", type=Path, required=True)
    build_skill = release_sub.add_parser("build-skill")
    build_skill.add_argument("--package", type=Path, required=True)
    build_skill.add_argument("--skills", type=Path, required=True)
    build_skill.add_argument("--output", type=Path, required=True)
    publish = release_sub.add_parser("publish-pair")
    publish.add_argument("--skill-archive", type=Path, required=True)
    publish.add_argument("--skill-name", required=True)
    publish.add_argument("--skill-version", required=True)
    publish.add_argument("--pack-archive", type=Path, required=True)
    publish.add_argument("--pack-name", required=True)
    publish.add_argument("--pack-version", required=True)
    publish.add_argument("--channel", choices=("canary", "stable"), required=True)
    publish.add_argument("--output", type=Path, required=True)
    publish.add_argument("--published-by", required=True)
    publish.add_argument("--force-update", action="store_true")

    update = commands.add_parser("update")
    update_sub = update.add_subparsers(dest="update_command", required=True)
    apply = update_sub.add_parser("apply")
    apply.add_argument("--manifest", type=Path, required=True)
    apply.add_argument("--registry", type=Path, required=True)
    apply.add_argument("--install-root", type=Path, required=True)

    args = parser.parse_args()
    if args.command == "pack" and args.pack_command == "validate":
        loaded = load_pack(args.path)
        print(json.dumps({"status": "pass", "pack_id": loaded.manifest.pack_id, "version": loaded.manifest.version}))
        return 0
    if args.command == "release" and args.release_command == "build":
        digest = build_zip(args.source, args.output)
        print(json.dumps({"status": "pass", "archive": str(args.output), "sha256": digest}))
        return 0
    if args.command == "release" and args.release_command == "build-skill":
        digest = build_skill_bundle(args.package, args.skills, args.output)
        print(json.dumps({"status": "pass", "archive": str(args.output), "sha256": digest}))
        return 0
    if args.command == "release" and args.release_command == "publish-pair":
        output_parent = args.output.resolve().parent
        payload = {
            "schema_version": 1,
            "channel": args.channel,
            "skill": {
                "name": args.skill_name,
                "version": args.skill_version,
                "archive": os.path.relpath(args.skill_archive.resolve(), output_parent),
                "sha256": sha256_file(args.skill_archive),
            },
            "company_pack": {
                "name": args.pack_name,
                "version": args.pack_version,
                "archive": os.path.relpath(args.pack_archive.resolve(), output_parent),
                "sha256": sha256_file(args.pack_archive),
            },
            "compatible_skill": f">={args.skill_version},<{int(args.skill_version.split('.')[0]) + 1}.0.0",
            "published_by": args.published_by,
            "published_at": datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds"),
            "force_update": args.force_update,
        }
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(
            yaml.safe_dump(payload, allow_unicode=True, sort_keys=False),
            encoding="utf-8",
        )
        manifest_from_file(args.output)
        print(json.dumps({"status": "pass", "manifest": str(args.output)}))
        return 0
    if args.command == "update" and args.update_command == "apply":
        installed = apply_manifest(manifest_from_file(args.manifest), FileRegistry(args.registry), args.install_root)
        print(json.dumps({"status": "pass", "installed": str(installed)}))
        return 0
    raise AssertionError("unreachable command")


if __name__ == "__main__":
    raise SystemExit(main())
```

- [ ] **Step 3: Build the two release archives**

Run:

```bash
mkdir -p registry/releases
.venv/bin/python -m enterprise_prd.cli release build-skill \
  --package enterprise_prd \
  --skills skills \
  --output registry/releases/enterprise-prd-skills-0.1.0.zip
.venv/bin/python -m enterprise_prd.cli release build \
  --source packs/example-company \
  --output registry/releases/example-company-0.1.0.zip
shasum -a 256 registry/releases/*.zip
```

Expected: two JSON `status: pass` lines and two SHA-256 records.

- [ ] **Step 4: Generate the stable manifest from the archive bytes**

Run:

```bash
.venv/bin/python -m enterprise_prd.cli release publish-pair \
  --skill-archive registry/releases/enterprise-prd-skills-0.1.0.zip \
  --skill-name enterprise-prd-skills \
  --skill-version 0.1.0 \
  --pack-archive registry/releases/example-company-0.1.0.zip \
  --pack-name example-company \
  --pack-version 0.1.0 \
  --channel stable \
  --output registry/stable-manifest.yaml \
  --published-by pilot-owner
.venv/bin/python -c "from pathlib import Path; from enterprise_prd.manifest import manifest_from_file; manifest_from_file(Path('registry/stable-manifest.yaml'))"
```

Expected: manifest validation succeeds and its two SHA-256 fields were calculated from the immutable archives, never typed by a person.

- [ ] **Step 5: Validate and apply the local stable pair**

Run:

```bash
.venv/bin/python -m enterprise_prd.cli pack validate --path packs/example-company
.venv/bin/python -m enterprise_prd.cli update apply \
  --manifest registry/stable-manifest.yaml \
  --registry registry \
  --install-root tmp/install
readlink tmp/install/current
```

Expected: both commands report `status: pass`; symlink target is `versions/0.1.0__0.1.0`.

- [ ] **Step 6: Close the Foundation checkpoint**

Replace `docs/recovery.md` with:

```markdown
# Recovery

- phase: foundation-complete
- foundation_next_step: execute Feishu Adapter plan
- last_valid_test: python3 -m unittest tests.test_contracts tests.test_pack tests.test_registry tests.test_updater tests.test_local_adapter -v
- external_state: no live registry or document access
- resume_rule: verify tag FOUNDATION_PASS and clean Git status
```

Run:

```bash
rg -n 'REPLACE_WITH|TBD|TODO|/Users/qqx|Obsidian Vault' \
  enterprise_prd skills packs/example-company registry/stable-manifest.yaml || true
.venv/bin/python -m unittest \
  tests.test_contracts \
  tests.test_pack \
  tests.test_registry \
  tests.test_updater \
  tests.test_local_adapter -v
git add enterprise_prd/cli.py enterprise_prd/manifest.py registry skills/enterprise-prd-chain/SKILL.md docs/recovery.md
git commit -m "feat: publish enterprise PRD foundation"
git tag FOUNDATION_PASS
git status --short
```

Expected: the scan returns no forbidden markers or personal paths; all tests pass; Git status is empty; tag points to the final Foundation commit.
