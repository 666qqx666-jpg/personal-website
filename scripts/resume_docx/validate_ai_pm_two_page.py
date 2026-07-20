from __future__ import annotations

import argparse
import json
from pathlib import Path
import posixpath
import sys
from zipfile import ZipFile

from lxml import etree

if __package__ in (None, ""):
    sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from scripts.resume_docx.model import (
    A4_HEIGHT_TWIPS,
    A4_WIDTH_TWIPS,
    FORBIDDEN_PUBLIC_TEXT,
    MIN_FONT_HALF_POINTS,
    PARAGRAPH_ORIGIN_MM,
    REQUIRED_PUBLIC_TEXT,
)
from scripts.resume_docx.ooxml import NS, VML_GRAPHICS_XPATH, file_sha256

EDITABLE_PARTS = {"word/document.xml", "docProps/core.xml", "docProps/app.xml"}
DECORATIVE_NAMES = {
    "P2_WHITE_BACKGROUND",
    "P2_GRAY_SIDEBAR",
    "P2_BLUE_STRIP",
}
PRIVATE_PAGE_TWO_TEXT = (
    "173 9571 1345",
    "666qqx666@gmail.com",
    "666qqx666-jpg",
    "生日：",
    "手机：",
    "邮箱：",
    "GitHub：",
)


def _normalized_text(node: etree._Element) -> str:
    return "".join(node.xpath(".//w:t/text()", namespaces=NS)).replace("\xa0", " ").strip()


def _page_two_text(root: etree._Element) -> str:
    return "".join(
        root.xpath(
            './/wp:docPr[starts-with(@name, "P2_")]/ancestor::mc:AlternateContent[1]//w:t/text()',
            namespaces=NS,
        )
    )


def _assert_relationship_targets(archive: ZipFile) -> None:
    rels_path = "word/_rels/document.xml.rels"
    rels = etree.fromstring(archive.read(rels_path))
    names = set(archive.namelist())
    for relationship in rels.xpath("./rel:Relationship", namespaces=NS):
        if relationship.get("TargetMode") == "External":
            continue
        target = relationship.get("Target")
        resolved = posixpath.normpath(posixpath.join("word", target)).lstrip("/")
        if resolved not in names:
            raise AssertionError(f"missing relationship target: {resolved}")


def _assert_package_preservation(source: ZipFile, target: ZipFile) -> list[str]:
    source_names = set(source.namelist())
    target_names = set(target.namelist())
    if source_names != target_names:
        raise AssertionError(
            f"package part set changed: removed={source_names-target_names}, added={target_names-source_names}"
        )
    changed = sorted(
        name for name in source_names if source.read(name) != target.read(name)
    )
    unexpected = set(changed) - EDITABLE_PARTS
    if unexpected:
        raise AssertionError(f"preserve-only parts changed: {sorted(unexpected)}")
    return changed


def _assert_metadata_clean(archive: ZipFile) -> None:
    core = etree.fromstring(archive.read("docProps/core.xml"))
    app = etree.fromstring(archive.read("docProps/app.xml"))
    for xpath in ("./dc:creator", "./cp:lastModifiedBy"):
        nodes = core.xpath(xpath, namespaces=NS)
        if len(nodes) != 1 or (nodes[0].text or "") != "":
            raise AssertionError(f"metadata field is not empty: {xpath}")
    for xpath in ("./ep:Template", "./ep:Application"):
        nodes = app.xpath(xpath, namespaces=NS)
        if len(nodes) != 1 or (nodes[0].text or "") != "":
            raise AssertionError(f"metadata field is not empty: {xpath}")
    app_version = app.xpath("./ep:AppVersion", namespaces=NS)
    if app_version and (app_version[0].text or "") != "":
        raise AssertionError("metadata field is not empty: ./ep:AppVersion")
    for xpath in ("./dcterms:created", "./dcterms:modified"):
        if len(core.xpath(xpath, namespaces=NS)) != 1:
            raise AssertionError(f"required timestamp is missing: {xpath}")


def _assert_compatibility_text(root: etree._Element) -> None:
    components = root.xpath(
        './/wp:docPr[starts-with(@name, "P1_") or starts-with(@name, "P2_")]/ancestor::mc:AlternateContent[1]',
        namespaces=NS,
    )
    seen: set[int] = set()
    for component in components:
        identity = id(component)
        if identity in seen:
            continue
        seen.add(identity)
        boxes = component.xpath(".//w:txbxContent", namespaces=NS)
        if len(boxes) == 2 and _normalized_text(boxes[0]) != _normalized_text(boxes[1]):
            name = component.xpath("string(.//wp:docPr/@name)", namespaces=NS)
            raise AssertionError(f"DrawingML/VML text mismatch: {name}")


def _component_geometry_mm(component: etree._Element) -> tuple[float, float]:
    y = int(component.xpath("string(.//wp:positionV/wp:posOffset)", namespaces=NS))
    cy = int(component.xpath("string(.//wp:extent/@cy)", namespaces=NS))
    top = PARAGRAPH_ORIGIN_MM + y / 36_000
    bottom = top + cy / 36_000
    return round(top, 3), round(bottom, 3)


def _assert_geometry(root: etree._Element) -> None:
    docprs = root.xpath(
        './/wp:docPr[starts-with(@name, "P1_") or starts-with(@name, "P2_")]',
        namespaces=NS,
    )
    for docpr in docprs:
        name = docpr.get("name")
        if name in DECORATIVE_NAMES:
            continue
        component = docpr.xpath("ancestor::mc:AlternateContent[1]", namespaces=NS)[0]
        top, bottom = _component_geometry_mm(component)
        if top < 11.95 or bottom > 285.05:
            raise AssertionError(f"unsafe geometry for {name}: {top}–{bottom} mm")
    certificate = root.xpath(
        './/wp:docPr[@name="P1_CERTIFICATES_BODY"]/ancestor::mc:AlternateContent[1]',
        namespaces=NS,
    )[0]
    site = root.xpath(
        './/wp:docPr[@name="P2_PERSONAL_SITE_BODY"]/ancestor::mc:AlternateContent[1]',
        namespaces=NS,
    )[0]
    if _component_geometry_mm(certificate)[1] > 285.05:
        raise AssertionError("certificate body exceeds 285 mm")
    if _component_geometry_mm(site)[1] > 280.05:
        raise AssertionError("personal site body exceeds 280 mm")


def _minimum_changed_font(root: etree._Element) -> float:
    components = root.xpath(
        './/wp:docPr[starts-with(@name, "P1_") or starts-with(@name, "P2_")]/ancestor::mc:AlternateContent[1]',
        namespaces=NS,
    )
    values: list[int] = []
    seen: set[int] = set()
    for component in components:
        identity = id(component)
        if identity in seen:
            continue
        seen.add(identity)
        for raw in component.xpath(
            ".//w:txbxContent//w:r/w:rPr/w:sz/@w:val", namespaces=NS
        ):
            values.append(int(raw))
    if not values or min(values) < MIN_FONT_HALF_POINTS:
        raise AssertionError(f"font floor violated: {min(values) if values else 'missing'}")
    return min(values) / 2


def validate(
    source: Path,
    target: Path,
    *,
    expected_source_sha256: str | None = None,
) -> dict[str, object]:
    source_hash_before = file_sha256(source)
    if expected_source_sha256 and source_hash_before != expected_source_sha256:
        raise AssertionError("source SHA-256 differs from frozen evidence")

    with ZipFile(source) as source_archive, ZipFile(target) as target_archive:
        if target_archive.testzip() is not None:
            raise AssertionError("target ZIP integrity failed")
        required_parts = {
            "[Content_Types].xml",
            "word/document.xml",
            "word/_rels/document.xml.rels",
            "docProps/core.xml",
            "docProps/app.xml",
        }
        missing = required_parts - set(target_archive.namelist())
        if missing:
            raise AssertionError(f"required package parts missing: {sorted(missing)}")
        changed_parts = _assert_package_preservation(source_archive, target_archive)
        _assert_relationship_targets(target_archive)
        _assert_metadata_clean(target_archive)
        root = etree.fromstring(target_archive.read("word/document.xml"))

    section = root.find(".//w:sectPr", namespaces=NS)
    page_size = section.find("w:pgSz", namespaces=NS)
    if (
        int(page_size.get(f"{{{NS['w']}}}w")) != A4_WIDTH_TWIPS
        or int(page_size.get(f"{{{NS['w']}}}h")) != A4_HEIGHT_TWIPS
        or page_size.get(f"{{{NS['w']}}}orient") == "landscape"
    ):
        raise AssertionError("page size is not A4 portrait")

    page_breaks = len(root.xpath('.//w:br[@w:type="page"]', namespaces=NS))
    if page_breaks != 1:
        raise AssertionError(f"expected one explicit page break, found {page_breaks}")
    anchor_paragraphs = root.xpath("./w:body/w:p[.//wp:anchor]", namespaces=NS)
    if len(anchor_paragraphs) != 2:
        raise AssertionError(f"expected two anchor paragraphs, found {len(anchor_paragraphs)}")

    docpr_ids = root.xpath(".//wp:docPr/@id", namespaces=NS)
    vml_ids = root.xpath(f"({VML_GRAPHICS_XPATH})/@id", namespaces=NS)
    anchor_ids = root.xpath(".//wp:anchor/@wp14:anchorId", namespaces=NS)
    if len(docpr_ids) != len(set(docpr_ids)):
        raise AssertionError("duplicate wp:docPr IDs")
    if len(vml_ids) != len(set(vml_ids)):
        raise AssertionError("duplicate VML IDs")
    if len(anchor_ids) != len(set(anchor_ids)):
        raise AssertionError("duplicate wp14 anchor IDs")

    _assert_compatibility_text(root)
    visible = "".join(root.xpath(".//w:t/text()", namespaces=NS))
    for required in REQUIRED_PUBLIC_TEXT:
        if required not in visible:
            raise AssertionError(f"required content missing: {required}")
    for forbidden in FORBIDDEN_PUBLIC_TEXT:
        if forbidden in visible:
            raise AssertionError(f"forbidden content present: {forbidden}")
    page_two = _page_two_text(root)
    for private in PRIVATE_PAGE_TWO_TEXT:
        if private in page_two:
            raise AssertionError(f"private page-two content present: {private}")

    evidence = (
        "8 类工作流中 6 类稳定自用",
        "9 份真实业务 PRD",
        "6 份蓝图或关键决策材料",
        "2 份正式业务竞品分析",
        "3 类定制开发报价方案",
        "尚未推广给团队",
        "早期多平台接入底座由前任产品负责人建设",
        "2026.06–至今",
    )
    for item in evidence:
        if item not in visible:
            raise AssertionError(f"evidence boundary missing: {item}")

    _assert_geometry(root)
    minimum_font = _minimum_changed_font(root)
    if file_sha256(source) != source_hash_before:
        raise AssertionError("source changed during validation")

    return {
        "source_unchanged": True,
        "package_integrity": True,
        "preserve_only_parts_unchanged": True,
        "changed_parts": changed_parts,
        "a4_portrait": True,
        "explicit_page_breaks": page_breaks,
        "anchor_paragraphs": 2,
        "unique_docpr_ids": True,
        "unique_vml_ids": True,
        "unique_anchor_ids": True,
        "compatibility_text_matches": True,
        "required_content_present": True,
        "forbidden_content_absent": True,
        "page_two_privacy_clean": True,
        "page_1_safe_bottom_mm": 285.0,
        "page_2_safe_bottom_mm": 280.0,
        "minimum_font_pt": minimum_font,
        "metadata_clean": True,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Validate the two-page AI PM resume")
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--target", type=Path, required=True)
    parser.add_argument("--expected-source-sha256")
    parser.add_argument("--report", type=Path)
    args = parser.parse_args()
    report = validate(
        args.source,
        args.target,
        expected_source_sha256=args.expected_source_sha256,
    )
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print("STRUCTURE_PASS")


if __name__ == "__main__":
    main()
