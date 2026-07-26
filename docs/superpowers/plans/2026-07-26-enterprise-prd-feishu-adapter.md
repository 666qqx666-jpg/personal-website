# Enterprise PRD Feishu Adapter Implementation Plan

> **Execution governance:** Before implementation, run the shared `adaptive-orchestration` preflight. A plan records a recommended profile but does not dispatch agents or authorize execution by itself.

**Goal:** 在不把 Feishu 变成 Skill 架构依赖的前提下，实现统一文档协议的搜索、检视、读取、revision、权限判断、差异预览与单操作安全写回。

**Architecture:** `FeishuAdapter` 只依赖可注入的 `LarkRunner`，生产运行调用 `lark-cli`，默认测试使用内存 FakeRunner。读取结果归一化为通用 `SearchHit`/`SourceDocument`；写回先基于当前 revision 和片段 Hash 生成 preview，再使用同一 expected revision 提交一条局部操作。

**Tech Stack:** Python 3.12、标准库 `subprocess`/`json`/`xml.etree.ElementTree`/`difflib`/`unittest`、`lark-cli 1.0.66`。

**Recommended execution profile:** O0；Adapter 及其命令运行器属于单一文件边界，live Feishu 不在本子计划默认执行范围。若沿总 Program 执行，继续使用已批准的外部边界。

**Parallelizable workstreams:** none

**Shared-write conflicts:** `enterprise_prd/contracts.py`、`enterprise_prd/adapters/feishu.py` 和 `enterprise_prd/cli.py` 必须由同一写入者串行修改。

**Stage evidence checkpoint:** `FEISHU_ADAPTER_PASS`；全部测试使用 FakeRunner 通过，权限/不存在错误不重试，临时错误最多 2 次重试，revision 变化阻止 update，命令列表不包含 `overwrite`。

**Recovery entry:** `docs/recovery.md` 的 `feishu_adapter_next_step`；恢复时先执行 `python3 -m unittest tests.test_feishu_adapter -v`。

**Authorization boundary:** 只修改 `/Users/qqx/my_code_cursor/enterprise-prd-pilot` 中 Adapter 代码、夹具和文档；默认不运行 live Feishu 命令。live smoke 只在 Pilot Rollout 的 scoped preflight 中执行。

**Out of scope:** 自动同步、批量写回、`overwrite`、评论迁移、全量企业搜索、机器人身份、Feishu 以外的 Adapter。

**Potential decision boundaries:** live 环境的 `lark-cli` JSON 合同与夹具不兼容时，需要在“适配当前 CLI 并提高最低版本”与“保持兼容旧版本”之间选择；公司要求 bot 身份时，需要重新定义员工权限继承，不能静默改 `--as user`。

---

## Planning assumptions and readiness

- Foundation 已通过并存在 tag `FOUNDATION_PASS`。
- `lark-cli drive +search`、`drive +inspect`、`docs +fetch` 和 `docs +update` 是唯一 Feishu 调用入口。
- V0 身份固定为 `--as user`，继承当前产品经理权限。
- Adapter config 一次只使用 `folder_tokens`、`space_ids` 或显式 `document_ids` 中一种模式；同一企业多来源通过多个 Adapter 实例组合，live preflight 使用显式文档模式。
- `check_access(read)` 通过 `drive +inspect` 判断；`check_access(write)` 返回 `unknown`，实际写权限在 commit 时由 Feishu 校验。
- 写回只允许一个局部命令；任何 `partial_success` 都按失败处理并要求重新读取。
- 默认测试不联网，也不读取任何真实公司文档。

## File Structure

| Path | Action | Single responsibility |
| --- | --- | --- |
| `enterprise_prd/lark_runner.py` | Create | `lark-cli` 子进程、JSON 解析、错误分类与有限重试。 |
| `enterprise_prd/adapters/feishu.py` | Create | Feishu 搜索、读取、revision、权限、preview 和 commit。 |
| `enterprise_prd/contracts.py` | Modify | 增加单操作 `WritePatch`/`WritePreview`/`WriteResult`。 |
| `enterprise_prd/cli.py` | Modify | 增加 Adapter 只读 smoke 与 preview 命令；不增加自动 commit。 |
| `tests/test_feishu_adapter.py` | Create | 内存命令夹具与全部 Adapter 合同。 |
| `tests/fixtures/feishu/*.json` | Create | 版本锁定的 search/inspect/fetch/update 示例。 |
| `docs/adapter-contract.md` | Create | 渠道无关接口、Feishu 映射、错误和写回门禁。 |
| `docs/recovery.md` | Modify | Feishu Adapter 恢复点。 |

### Task 1: Add deterministic `lark-cli` execution

**Files:**
- Create: `enterprise_prd/lark_runner.py`
- Create: `tests/test_feishu_adapter.py`

- [ ] **Step 1: Write failing runner tests**

Create the first section of `tests/test_feishu_adapter.py`:

```python
from __future__ import annotations

import json
import subprocess
import unittest
from collections import deque

from enterprise_prd.errors import AccessDenied, RegistryUnavailable
from enterprise_prd.lark_runner import LarkRunner


class Completed:
    def __init__(self, returncode: int, stdout: str = "", stderr: str = "") -> None:
        self.returncode = returncode
        self.stdout = stdout
        self.stderr = stderr


class ScriptedRun:
    def __init__(self, results: list[Completed]) -> None:
        self.results = deque(results)
        self.calls: list[list[str]] = []

    def __call__(self, argv, **kwargs):
        self.calls.append(list(argv))
        return self.results.popleft()


class LarkRunnerTest(unittest.TestCase):
    def test_success_returns_one_json_object(self) -> None:
        run = ScriptedRun([Completed(0, '{"ok":true,"data":{"value":1}}')])
        result = LarkRunner(run=run, sleep=lambda _: None).json(["drive", "+inspect"])
        self.assertEqual(result["data"]["value"], 1)
        self.assertEqual(run.calls[0][:2], ["lark-cli", "drive"])

    def test_permission_error_is_not_retried(self) -> None:
        run = ScriptedRun([Completed(1, stderr="permission denied")])
        with self.assertRaises(AccessDenied):
            LarkRunner(run=run, sleep=lambda _: None).json(["drive", "+inspect"])
        self.assertEqual(len(run.calls), 1)

    def test_transient_error_gets_two_retries(self) -> None:
        run = ScriptedRun([
            Completed(1, stderr="rate limit"),
            Completed(1, stderr="temporary network error"),
            Completed(0, '{"ok":true}'),
        ])
        result = LarkRunner(run=run, sleep=lambda _: None).json(["drive", "+search"])
        self.assertTrue(result["ok"])
        self.assertEqual(len(run.calls), 3)
```

- [ ] **Step 2: Run and verify the runner tests fail**

Run:

```bash
cd /Users/qqx/my_code_cursor/enterprise-prd-pilot
.venv/bin/python -m unittest tests.test_feishu_adapter.LarkRunnerTest -v
```

Expected: FAIL because `enterprise_prd.lark_runner` does not exist.

- [ ] **Step 3: Implement the command runner**

Create `enterprise_prd/lark_runner.py`:

```python
from __future__ import annotations

import json
import subprocess
import time
from collections.abc import Callable

from .errors import AccessDenied, ContractError, RegistryUnavailable


PERMANENT_ACCESS = ("permission denied", "forbidden", "missing scope", "not found")
TRANSIENT = ("rate limit", "timeout", "temporary", "network", "connection reset")


class LarkRunner:
    def __init__(
        self,
        *,
        run: Callable = subprocess.run,
        sleep: Callable[[float], None] = time.sleep,
    ) -> None:
        self.run = run
        self.sleep = sleep

    def json(self, arguments: list[str]) -> dict:
        argv = ["lark-cli", *arguments, "--as", "user", "--format", "json"]
        delays = (0.0, 0.2, 0.5)
        last = ""
        for delay in delays:
            if delay:
                self.sleep(delay)
            result = self.run(argv, text=True, capture_output=True)
            if result.returncode == 0:
                try:
                    payload = json.loads(result.stdout)
                except json.JSONDecodeError as exc:
                    raise ContractError("lark-cli returned non-JSON output") from exc
                if type(payload) is not dict:
                    raise ContractError("lark-cli JSON root must be an object")
                return payload
            last = (result.stderr or result.stdout).strip().casefold()
            if any(marker in last for marker in PERMANENT_ACCESS):
                raise AccessDenied(last)
            if not any(marker in last for marker in TRANSIENT):
                raise ContractError(f"lark-cli failed: {last}")
        raise RegistryUnavailable(f"lark-cli transient failure after 3 attempts: {last}")
```

- [ ] **Step 4: Run and commit the runner**

Run:

```bash
.venv/bin/python -m unittest tests.test_feishu_adapter.LarkRunnerTest -v
git add enterprise_prd/lark_runner.py tests/test_feishu_adapter.py
git commit -m "feat: add bounded lark command runner"
```

Expected: 3 tests pass; permission failure has one call, transient failure has three.

### Task 2: Normalize Feishu search and read results

**Files:**
- Create: `enterprise_prd/adapters/feishu.py`
- Modify: `tests/test_feishu_adapter.py`
- Create: `tests/fixtures/feishu/search.json`
- Create: `tests/fixtures/feishu/inspect.json`
- Create: `tests/fixtures/feishu/revision.json`
- Create: `tests/fixtures/feishu/fetch.json`
- Create: `tests/fixtures/feishu/fetch-xml.json`

- [ ] **Step 1: Add failing search/read tests**

Append to `tests/test_feishu_adapter.py`:

```python
from pathlib import Path

from enterprise_prd.adapters.base import AccessAction
from enterprise_prd.adapters.feishu import FeishuAdapter, FeishuSourceConfig
from enterprise_prd.contracts import AccessDecision


FIXTURES = Path(__file__).parent / "fixtures/feishu"


def fixture(name: str) -> dict:
    return json.loads((FIXTURES / name).read_text(encoding="utf-8"))


class FakeRunner:
    def __init__(self, payloads: list[dict]) -> None:
        self.payloads = deque(payloads)
        self.calls: list[list[str]] = []

    def json(self, arguments: list[str]) -> dict:
        self.calls.append(list(arguments))
        return self.payloads.popleft()


class FeishuReadTest(unittest.TestCase):
    def test_search_maps_folder_scope(self) -> None:
        runner = FakeRunner([fixture("search.json")])
        adapter = FeishuAdapter(
            FeishuSourceConfig(folder_tokens=("fld_approved",), space_ids=()),
            runner=runner,
        )
        hits = adapter.search("需求", scope="project")
        self.assertEqual([hit.document_id for hit in hits], ["docx_alpha"])
        self.assertIn("--folder-tokens", runner.calls[0])
        self.assertEqual(hits[0].revision, "12")

    def test_read_returns_revision_and_content_hash(self) -> None:
        runner = FakeRunner([fixture("fetch.json")])
        adapter = FeishuAdapter(
            FeishuSourceConfig(folder_tokens=("fld_approved",), space_ids=()),
            runner=runner,
        )
        document = adapter.read("docx_alpha")
        self.assertEqual(document.revision, "12")
        self.assertIn("# Alpha PRD", document.content)
        self.assertEqual(len(document.content_hash), 64)

    def test_access_uses_inspect_and_write_stays_unknown(self) -> None:
        runner = FakeRunner([fixture("inspect.json")])
        adapter = FeishuAdapter(
            FeishuSourceConfig(folder_tokens=("fld_approved",), space_ids=()),
            runner=runner,
        )
        self.assertEqual(adapter.check_access("docx_alpha", AccessAction.READ), AccessDecision.ALLOWED)
        self.assertEqual(adapter.check_access("docx_alpha", AccessAction.WRITE), AccessDecision.UNKNOWN)

    def test_metadata_and_revision_do_not_fetch_document_body(self) -> None:
        runner = FakeRunner([
            fixture("inspect.json"),
            fixture("revision.json"),
            fixture("revision.json"),
        ])
        adapter = FeishuAdapter(
            FeishuSourceConfig(folder_tokens=("fld_approved",), space_ids=()),
            runner=runner,
        )
        metadata = adapter.metadata("docx_alpha")
        self.assertEqual(metadata.revision, "12")
        self.assertEqual(adapter.revision("docx_alpha"), "12")
        self.assertIn("+inspect", runner.calls[0])
        for call in runner.calls[1:]:
            self.assertIn("+fetch", call)
            self.assertIn("--scope", call)
            self.assertIn("outline", call)
            self.assertIn("--max-depth", call)
            self.assertIn("0", call)
```

- [ ] **Step 2: Create versioned JSON fixtures**

Create `tests/fixtures/feishu/search.json`:

```json
{
  "ok": true,
  "data": {
    "items": [
      {
        "token": "docx_alpha",
        "title": "Alpha PRD",
        "type": "docx",
        "url": "https://example.feishu.cn/docx/docx_alpha",
        "revision_id": 12
      }
    ]
  }
}
```

Create `tests/fixtures/feishu/inspect.json`:

```json
{
  "ok": true,
  "data": {
    "token": "docx_alpha",
      "title": "Alpha PRD",
      "type": "docx",
      "url": "https://example.feishu.cn/docx/docx_alpha",
      "owner_name": "Product Owner",
      "modified_time": "2026-07-26T10:00:00+08:00"
  }
}
```

Create `tests/fixtures/feishu/revision.json`:

```json
{
  "ok": true,
  "data": {
    "document": {
      "document_id": "docx_alpha",
      "revision_id": 12,
      "content": "<fragment mode=\"outline\"></fragment>"
    }
  }
}
```

Create `tests/fixtures/feishu/fetch.json`:

```json
{
  "ok": true,
  "data": {
    "document": {
      "document_id": "docx_alpha",
      "title": "Alpha PRD",
      "revision_id": 12,
      "content": "# Alpha PRD\n\n共享规则冲突时拒绝静默覆盖。"
    }
  }
}
```

Create `tests/fixtures/feishu/fetch-xml.json`:

```json
{
  "ok": true,
  "data": {
    "document": {
      "document_id": "docx_alpha",
      "title": "Alpha PRD",
      "revision_id": 12,
      "content": "<document><paragraph id=\"blk_rule\">共享规则冲突时拒绝静默覆盖。</paragraph></document>"
    }
  }
}
```

- [ ] **Step 3: Run and verify Feishu read tests fail**

Run:

```bash
.venv/bin/python -m unittest tests.test_feishu_adapter.FeishuReadTest -v
```

Expected: FAIL because `enterprise_prd.adapters.feishu` does not exist.

- [ ] **Step 4: Implement source-scoped Feishu read operations**

Create `enterprise_prd/adapters/feishu.py`:

```python
from __future__ import annotations

from dataclasses import dataclass

from enterprise_prd.canonical import sha256_bytes
from enterprise_prd.contracts import AccessDecision
from enterprise_prd.errors import AccessDenied, ContractError
from enterprise_prd.lark_runner import LarkRunner

from .base import AccessAction, SearchHit, SourceDocument, SourceMetadata


@dataclass(frozen=True)
class FeishuSourceConfig:
    folder_tokens: tuple[str, ...] = ()
    space_ids: tuple[str, ...] = ()
    document_ids: tuple[str, ...] = ()

    def validate(self) -> None:
        modes = sum(bool(values) for values in (self.folder_tokens, self.space_ids, self.document_ids))
        if modes != 1:
            raise ContractError("configure exactly one source mode")


class FeishuAdapter:
    def __init__(self, config: FeishuSourceConfig, *, runner=None) -> None:
        config.validate()
        self.config = config
        self.runner = runner or LarkRunner()

    def _require_direct_scope(self, document_id: str) -> None:
        if self.config.document_ids and document_id not in self.config.document_ids:
            raise AccessDenied(f"document is outside configured direct scope: {document_id}")

    def search(self, query: str, *, scope: str) -> tuple[SearchHit, ...]:
        if scope != "project":
            raise ContractError("Feishu V0 only exposes project scope")
        if self.config.document_ids:
            raise ContractError("direct document scope does not support broad search")
        arguments = ["drive", "+search", "--query", query, "--page-size", "20"]
        if self.config.folder_tokens:
            arguments += ["--folder-tokens", ",".join(self.config.folder_tokens)]
        else:
            arguments += ["--space-ids", ",".join(self.config.space_ids)]
        payload = self.runner.json(arguments)
        items = payload.get("data", {}).get("items", [])
        if type(items) is not list:
            raise ContractError("Feishu search items must be a list")
        hits = []
        for item in items:
            if type(item) is not dict or item.get("type") not in {"docx", "wiki", "doc"}:
                continue
            token = str(item.get("token", ""))
            title = str(item.get("title", ""))
            url = str(item.get("url", ""))
            if not token or not title or not url:
                raise ContractError("Feishu search item lacks identity")
            hits.append(SearchHit(token, title, str(item.get("revision_id", "")), url))
        return tuple(hits)

    def read(self, document_id: str, *, revision: str | None = None) -> SourceDocument:
        self._require_direct_scope(document_id)
        arguments = [
            "docs", "+fetch", "--doc", document_id,
            "--doc-format", "markdown", "--detail", "simple",
        ]
        if revision is not None:
            arguments += ["--revision-id", revision]
        payload = self.runner.json(arguments)
        document = payload.get("data", {}).get("document")
        if type(document) is not dict:
            raise ContractError("Feishu fetch lacks document")
        content = document.get("content")
        current_revision = document.get("revision_id")
        if type(content) is not str or current_revision is None:
            raise ContractError("Feishu fetch lacks content or revision")
        return SourceDocument(
            document_id=str(document.get("document_id") or document_id),
            title=str(document.get("title") or document_id),
            revision=str(current_revision),
            content=content,
            content_hash=sha256_bytes(content.encode("utf-8")),
            source_url=f"feishu://{document_id}",
            realtime=True,
        )

    def metadata(self, document_id: str) -> SourceMetadata:
        self._require_direct_scope(document_id)
        payload = self.runner.json(
            ["drive", "+inspect", "--url", document_id, "--type", "docx"]
        )
        data = payload.get("data")
        if type(data) is not dict:
            raise ContractError("Feishu inspect lacks metadata")
        token = str(data.get("token") or document_id)
        title = str(data.get("title") or "")
        source_url = str(data.get("url") or "")
        document_type = str(data.get("type") or "")
        if not title or not source_url or not document_type:
            raise ContractError("Feishu metadata lacks required fields")
        return SourceMetadata(
            document_id=token,
            title=title,
            revision=self._revision_probe(document_id),
            source_url=source_url,
            document_type=document_type,
            author=str(data["owner_name"]) if data.get("owner_name") else None,
            modified_at=str(data["modified_time"]) if data.get("modified_time") else None,
        )

    def _revision_probe(self, document_id: str) -> str:
        self._require_direct_scope(document_id)
        payload = self.runner.json([
            "docs", "+fetch", "--doc", document_id,
            "--doc-format", "xml", "--detail", "simple",
            "--scope", "outline", "--max-depth", "0",
        ])
        document = payload.get("data", {}).get("document")
        if type(document) is not dict or document.get("revision_id") is None:
            raise ContractError("Feishu revision probe lacks revision_id")
        return str(document["revision_id"])

    def revision(self, document_id: str) -> str:
        return self._revision_probe(document_id)

    def check_access(self, document_id: str, action: AccessAction) -> AccessDecision:
        if self.config.document_ids and document_id not in self.config.document_ids:
            return AccessDecision.DENIED
        if action is AccessAction.WRITE:
            return AccessDecision.UNKNOWN
        try:
            self.runner.json(["drive", "+inspect", "--url", document_id, "--type", "docx"])
        except AccessDenied:
            return AccessDecision.DENIED
        return AccessDecision.ALLOWED
```

- [ ] **Step 5: Run and commit Feishu reads**

Run:

```bash
.venv/bin/python -m unittest \
  tests.test_feishu_adapter.LarkRunnerTest \
  tests.test_feishu_adapter.FeishuReadTest -v
git add enterprise_prd/adapters/feishu.py tests/test_feishu_adapter.py tests/fixtures/feishu
git commit -m "feat: read Feishu documents through adapter contract"
```

Expected: 7 tests pass; metadata uses `drive +inspect`，revision 只用 `outline --max-depth 0` 探针且不进入上下文；all command calls contain `--as user` only when using production LarkRunner.

### Task 3: Add single-operation preview and revision-safe commit

**Files:**
- Modify: `enterprise_prd/contracts.py`
- Modify: `enterprise_prd/adapters/feishu.py`
- Modify: `tests/test_feishu_adapter.py`
- Create: `tests/fixtures/feishu/update.json`

- [ ] **Step 1: Add failing writeback tests**

Append to `tests/test_feishu_adapter.py`:

```python
from enterprise_prd.canonical import sha256_bytes
from enterprise_prd.contracts import WriteCommand, WritePatch
from enterprise_prd.errors import RevisionConflict


class FeishuWriteTest(unittest.TestCase):
    def patch(self) -> WritePatch:
        return WritePatch(
            document_id="docx_alpha",
            expected_revision="12",
            command=WriteCommand.STR_REPLACE,
            content="共享规则冲突时拒绝覆盖。",
            pattern="共享规则冲突时拒绝静默覆盖。",
            block_id=None,
            expected_fragment_sha256=None,
        )

    def test_preview_does_not_call_update(self) -> None:
        runner = FakeRunner([fixture("fetch.json")])
        adapter = FeishuAdapter(
            FeishuSourceConfig(folder_tokens=("fld_approved",), space_ids=()),
            runner=runner,
        )
        preview = adapter.preview_write(self.patch())
        self.assertEqual(preview.current_revision, "12")
        self.assertIn("-共享规则冲突时拒绝静默覆盖。", preview.diff)
        self.assertFalse(any("+update" in call for call in runner.calls))

    def test_revision_conflict_never_calls_update(self) -> None:
        changed = fixture("fetch.json")
        changed["data"]["document"]["revision_id"] = 13
        runner = FakeRunner([changed])
        adapter = FeishuAdapter(
            FeishuSourceConfig(folder_tokens=("fld_approved",), space_ids=()),
            runner=runner,
        )
        with self.assertRaises(RevisionConflict):
            adapter.commit_write(self.patch())
        self.assertFalse(any("+update" in call for call in runner.calls))

    def test_commit_uses_one_local_operation_and_expected_revision(self) -> None:
        runner = FakeRunner([fixture("fetch.json"), fixture("update.json")])
        adapter = FeishuAdapter(
            FeishuSourceConfig(folder_tokens=("fld_approved",), space_ids=()),
            runner=runner,
        )
        result = adapter.commit_write(self.patch())
        self.assertEqual(result.new_revision, "13")
        update = runner.calls[-1]
        self.assertIn("str_replace", update)
        self.assertIn("--revision-id", update)
        self.assertNotIn("overwrite", update)

    def test_block_preview_hashes_only_the_exact_xml_fragment(self) -> None:
        runner = FakeRunner([fixture("fetch-xml.json")])
        adapter = FeishuAdapter(
            FeishuSourceConfig(folder_tokens=("fld_approved",), space_ids=()),
            runner=runner,
        )
        fragment = '<paragraph id="blk_rule">共享规则冲突时拒绝静默覆盖。</paragraph>'
        patch = WritePatch(
            document_id="docx_alpha",
            expected_revision="12",
            command=WriteCommand.BLOCK_REPLACE,
            content="<p>共享规则冲突时拒绝覆盖。</p>",
            pattern=None,
            block_id="blk_rule",
            expected_fragment_sha256=sha256_bytes(fragment.encode("utf-8")),
        )
        preview = adapter.preview_write(patch)
        self.assertIn("block=blk_rule", preview.diff)
        self.assertIn("--doc-format", runner.calls[0])
        self.assertIn("xml", runner.calls[0])
```

Create `tests/fixtures/feishu/update.json`:

```json
{
  "ok": true,
  "data": {
    "document": {"revision_id": 13},
    "result": "success",
    "updated_blocks_count": 1,
    "warnings": []
  }
}
```

- [ ] **Step 2: Add strict write contracts**

Append to `enterprise_prd/contracts.py`:

```python
@dataclass(frozen=True)
class WritePatch:
    document_id: str
    expected_revision: str
    command: WriteCommand
    content: str
    pattern: str | None
    block_id: str | None
    expected_fragment_sha256: str | None

    def validate(self) -> None:
        need(bool(self.document_id.strip()), "document_id is required")
        need(bool(self.expected_revision.strip()), "expected_revision is required")
        need(type(self.command) is WriteCommand, "write command is invalid")
        need(bool(self.content), "write content is required")
        if self.command is WriteCommand.STR_REPLACE:
            need(bool(self.pattern), "str_replace pattern is required")
            need(self.block_id is None and self.expected_fragment_sha256 is None, "str_replace has extra fields")
        else:
            need(bool(self.block_id), "block operation needs block_id")
            need(
                type(self.expected_fragment_sha256) is str
                and bool(HASH_RE.fullmatch(self.expected_fragment_sha256)),
                "block operation needs fragment sha256",
            )
            need(self.pattern is None, "block operation cannot have pattern")


@dataclass(frozen=True)
class WritePreview:
    document_id: str
    current_revision: str
    operation_sha256: str
    diff: str


@dataclass(frozen=True)
class WriteResult:
    document_id: str
    previous_revision: str
    new_revision: str
    updated_blocks_count: int
```

- [ ] **Step 3: Implement preview and commit**

Add these imports and methods to `enterprise_prd/adapters/feishu.py`:

```python
import difflib
import xml.etree.ElementTree as ET

from enterprise_prd.canonical import canonical_json
from enterprise_prd.contracts import (
    WriteCommand,
    WritePatch,
    WritePreview,
    WriteResult,
)
from enterprise_prd.errors import RevisionConflict
```

Add this module helper before `FeishuAdapter`:

```python
def _xml_fragment(content: str, block_id: str) -> bytes:
    try:
        root = ET.fromstring(f"<root>{content}</root>")
    except ET.ParseError as exc:
        raise ContractError("Feishu XML is malformed") from exc
    matches = [element for element in root.iter() if element.attrib.get("id") == block_id]
    if len(matches) != 1:
        raise ContractError("block_id must resolve to exactly one XML element")
    return ET.tostring(matches[0], encoding="utf-8")
```

Add `_read_xml` and the write methods inside `FeishuAdapter`:

```python
    def _read_xml(self, document_id: str) -> tuple[str, str]:
        self._require_direct_scope(document_id)
        payload = self.runner.json([
            "docs", "+fetch", "--doc", document_id,
            "--doc-format", "xml", "--detail", "with-ids",
        ])
        document = payload.get("data", {}).get("document")
        if type(document) is not dict:
            raise ContractError("Feishu XML fetch lacks document")
        content = document.get("content")
        revision = document.get("revision_id")
        if type(content) is not str or revision is None:
            raise ContractError("Feishu XML fetch lacks content or revision")
        return content, str(revision)

    def preview_write(self, patch: WritePatch) -> WritePreview:
        patch.validate()
        if patch.command is WriteCommand.STR_REPLACE:
            current = self.read(patch.document_id)
            current_revision = current.revision
            if current_revision != patch.expected_revision:
                raise RevisionConflict(
                    f"expected revision {patch.expected_revision}, got {current_revision}"
                )
            assert patch.pattern is not None
            if current.content.count(patch.pattern) != 1:
                raise ContractError("str_replace pattern must match exactly once")
            revised = current.content.replace(patch.pattern, patch.content, 1)
            diff = "\n".join(difflib.unified_diff(
                current.content.splitlines(),
                revised.splitlines(),
                fromfile=f"{patch.document_id}@{current.revision}",
                tofile=f"{patch.document_id}@proposed",
                lineterm="",
            ))
        else:
            assert patch.block_id is not None
            assert patch.expected_fragment_sha256 is not None
            try:
                proposed_root = ET.fromstring(f"<root>{patch.content}</root>")
            except ET.ParseError as exc:
                raise ContractError("block write content must be valid XML fragments") from exc
            if len(proposed_root) == 0:
                raise ContractError("block write content must contain an XML element")
            xml_content, current_revision = self._read_xml(patch.document_id)
            if current_revision != patch.expected_revision:
                raise RevisionConflict(
                    f"expected revision {patch.expected_revision}, got {current_revision}"
                )
            actual_fragment_sha256 = sha256_bytes(
                _xml_fragment(xml_content, patch.block_id)
            )
            if actual_fragment_sha256 != patch.expected_fragment_sha256:
                raise ContractError("block fragment hash does not match current content")
            diff = f"{patch.command.value} block={patch.block_id} content_sha256={sha256_bytes(patch.content.encode('utf-8'))}"
        operation_sha256 = sha256_bytes(canonical_json({
            "document_id": patch.document_id,
            "expected_revision": patch.expected_revision,
            "command": patch.command.value,
            "content": patch.content,
            "pattern": patch.pattern,
            "block_id": patch.block_id,
            "expected_fragment_sha256": patch.expected_fragment_sha256,
        }))
        return WritePreview(patch.document_id, current_revision, operation_sha256, diff)

    def commit_write(self, patch: WritePatch) -> WriteResult:
        self.preview_write(patch)
        arguments = [
            "docs", "+update", "--doc", patch.document_id,
            "--command", patch.command.value,
            "--doc-format", "markdown" if patch.command is WriteCommand.STR_REPLACE else "xml",
            "--content", patch.content,
            "--revision-id", patch.expected_revision,
        ]
        if patch.pattern is not None:
            arguments += ["--pattern", patch.pattern]
        if patch.block_id is not None:
            arguments += ["--block-id", patch.block_id]
        payload = self.runner.json(arguments)
        data = payload.get("data", {})
        if data.get("result") != "success":
            raise ContractError("Feishu update did not complete successfully")
        document = data.get("document", {})
        new_revision = document.get("revision_id")
        count = data.get("updated_blocks_count")
        if new_revision is None or type(count) is not int or count < 1:
            raise ContractError("Feishu update result is incomplete")
        return WriteResult(
            document_id=patch.document_id,
            previous_revision=patch.expected_revision,
            new_revision=str(new_revision),
            updated_blocks_count=count,
        )
```

- [ ] **Step 4: Run writeback tests and verify no forbidden command**

Run:

```bash
.venv/bin/python -m unittest tests.test_feishu_adapter.FeishuWriteTest -v
rg -n 'overwrite|append' enterprise_prd/adapters/feishu.py tests/test_feishu_adapter.py || true
```

Expected: 4 tests pass; block preview uses XML with IDs, hashes exactly one serialized element, and the scan contains only the test assertion that `overwrite` is absent.

- [ ] **Step 5: Commit safe writeback**

Run:

```bash
git add enterprise_prd/contracts.py enterprise_prd/adapters/feishu.py \
  tests/test_feishu_adapter.py tests/fixtures/feishu/update.json
git commit -m "feat: protect Feishu writes with revision previews"
```

Expected: commit contains one-operation write contracts, Adapter changes and tests.

### Task 4: Document and close the Adapter contract

**Files:**
- Create: `docs/adapter-contract.md`
- Modify: `docs/recovery.md`

- [ ] **Step 1: Write the Adapter contract**

Create `docs/adapter-contract.md`:

```markdown
# Document Adapter Contract

## Required operations

- `search(query, scope)` returns source IDs, title, source URL and known revision.
- `read(document_id, revision?)` returns content, revision, content Hash and realtime flag.
- `revision(document_id)` returns the source-system revision.
- `check_access(document_id, read|write)` returns allowed, denied or unknown.

## Feishu mapping

- search: `lark-cli drive +search`
- metadata/access: `lark-cli drive +inspect`
- read/revision: `lark-cli docs +fetch --detail with-ids`
- write: one `docs +update` local operation with `--revision-id`

## Closed failure behavior

- Permission, missing scope and not found: no retry.
- Rate limit, timeout and temporary network error: two retries.
- Invalid JSON or contract drift: fail immediately.
- Changed revision: conflict; no update call.
- Partial update: failure; refetch before any next action.
- Read-only snapshot: degraded; no writeback.

`overwrite`, multi-operation transactions and broad search are not V0 capabilities.
```

- [ ] **Step 2: Update the recovery entry**

Replace `docs/recovery.md` with:

```markdown
# Recovery

- phase: feishu-adapter-complete
- feishu_adapter_next_step: execute Enterprise PRD Workflow plan
- last_valid_test: python3 -m unittest tests.test_feishu_adapter -v
- external_state: no live Feishu call has run
- resume_rule: verify tag FEISHU_ADAPTER_PASS and inspect adapter-contract.md
```

- [ ] **Step 3: Run the full Adapter evidence gate**

Run:

```bash
.venv/bin/python -m unittest tests.test_feishu_adapter -v
.venv/bin/python -m unittest \
  tests.test_contracts \
  tests.test_pack \
  tests.test_registry \
  tests.test_updater \
  tests.test_local_adapter -v
rg -n '/Users/qqx|Obsidian Vault|需求文档-AI' enterprise_prd docs/adapter-contract.md || true
git status --short
```

Expected: all tests pass; scan is empty; only `docs/adapter-contract.md` and `docs/recovery.md` are uncommitted.

- [ ] **Step 4: Commit and tag `FEISHU_ADAPTER_PASS`**

Run:

```bash
git add docs/adapter-contract.md docs/recovery.md
git commit -m "docs: freeze Feishu adapter contract"
git tag FEISHU_ADAPTER_PASS
git status --short
```

Expected: Git status is empty and the tag points to the final Adapter commit.
