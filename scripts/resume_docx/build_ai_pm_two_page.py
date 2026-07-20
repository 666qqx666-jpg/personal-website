from __future__ import annotations

import argparse
from pathlib import Path
from typing import Callable

from lxml import etree

from scripts.resume_docx.model import (
    EMU_PER_MM,
    PAGE_1_REGIONS_MM,
    PAGE_2_REGIONS_MM,
    PARAGRAPH_ORIGIN_MM,
    RESUME,
)
from scripts.resume_docx.ooxml import (
    NS,
    append_component,
    append_second_page,
    cleaned_metadata_parts,
    clone_component,
    component_by_docpr_id,
    component_geometry,
    file_sha256,
    normalize_object_ids,
    read_document_xml,
    rename_component,
    set_component_geometry,
    set_component_paragraphs,
    write_package_atomic,
)

SOURCE_DEFAULT = Path("/Users/qqx/Desktop/个人/AI产品经理-钱麒祥.docx")
TARGET_DEFAULT = Path("docs/resume/AI产品经理-钱麒祥-双页版.docx")
TITLE_SUFFIXES = ("TITLE", "DIVIDER", "ICON_BG", "ICON")
FROZEN_SOURCE_IDS = (
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    45,
    46,
    47,
    48,
    49,
    50,
    51,
    52,
    53,
    54,
    55,
    56,
    60,
    61,
    62,
    63,
    65,
    66,
    67,
    68,
    70,
)


def absolute_y_emu(mm: float) -> int:
    return round((mm - PARAGRAPH_ORIGIN_MM) * EMU_PER_MM)


def _allocator(root: etree._Element) -> Callable[[], int]:
    next_value = max(int(value) for value in root.xpath(".//wp:docPr/@id", namespaces=NS)) + 1

    def allocate() -> int:
        nonlocal next_value
        value = next_value
        next_value += 1
        return value

    return allocate


def _assert_frozen_source_map(root: etree._Element) -> None:
    for identifier in FROZEN_SOURCE_IDS:
        component_by_docpr_id(root, identifier)
    ids = root.xpath(".//wp:docPr/@id", namespaces=NS)
    if len(ids) != 50 or len(ids) != len(set(ids)):
        raise ValueError(f"source map drift: expected 50 unique anchors, found {len(ids)}")
    if len(root.xpath(".//mc:AlternateContent", namespaces=NS)) != 47:
        raise ValueError("source map drift: expected 47 compatibility components")


def _materialize(
    root: etree._Element,
    paragraph: etree._Element,
    source_id: int,
    name: str,
    *,
    clone: bool,
    allocate: Callable[[], int],
) -> etree._Element:
    source = component_by_docpr_id(root, source_id)
    if clone:
        identifier = allocate()
        output = clone_component(source, identifier, name, identifier)
        append_component(paragraph, output)
    else:
        output = source
        rename_component(output, name)
    return output


def _place_title_group(
    root: etree._Element,
    paragraph: etree._Element,
    template_ids: tuple[int, int, int, int],
    prefix: str,
    top_mm: float,
    title: str,
    *,
    clone: bool,
    allocate: Callable[[], int],
) -> None:
    geometries = [component_geometry(component_by_docpr_id(root, item)) for item in template_ids]
    source_top = min(geometry[1] for geometry in geometries)
    for source_id, suffix, geometry in zip(
        template_ids, TITLE_SUFFIXES, geometries, strict=True
    ):
        output = _materialize(
            root,
            paragraph,
            source_id,
            f"{prefix}_{suffix}",
            clone=clone,
            allocate=allocate,
        )
        x_emu, y_emu, cx_emu, cy_emu = geometry
        target_y = absolute_y_emu(top_mm) + (y_emu - source_top)
        if suffix == "DIVIDER":
            target_y = absolute_y_emu(top_mm + 10.5)
        set_component_geometry(
            output,
            x_emu=x_emu,
            y_emu=target_y,
            cx_emu=cx_emu,
            cy_emu=cy_emu,
        )
        if suffix == "TITLE":
            set_component_paragraphs(
                output, (title,), font_half_points=28, line_twips=320, bold_first=True
            )


def _place_section(
    root: etree._Element,
    paragraph: etree._Element,
    *,
    title_ids: tuple[int, int, int, int],
    body_id: int,
    prefix: str,
    region: tuple[float, float],
    title: str,
    lines: tuple[str, ...],
    body_font_half_points: int,
    body_line_twips: int,
    clone: bool,
    allocate: Callable[[], int],
    bold_labels: bool = False,
    bold_first: bool = False,
) -> None:
    top_mm, bottom_mm = region
    _place_title_group(
        root,
        paragraph,
        title_ids,
        prefix,
        top_mm,
        title,
        clone=clone,
        allocate=allocate,
    )
    body = _materialize(
        root,
        paragraph,
        body_id,
        f"{prefix}_BODY",
        clone=clone,
        allocate=allocate,
    )
    x_emu, _, cx_emu, _ = component_geometry(body)
    body_top_mm = top_mm + 11.5
    set_component_geometry(
        body,
        x_emu=x_emu,
        y_emu=absolute_y_emu(body_top_mm),
        cx_emu=cx_emu,
        cy_emu=round((bottom_mm - body_top_mm) * EMU_PER_MM),
    )
    set_component_paragraphs(
        body,
        lines,
        font_half_points=body_font_half_points,
        line_twips=body_line_twips,
        bold_labels=bold_labels,
        bold_first=bold_first,
    )


def _clone_sidebar_box(
    root: etree._Element,
    paragraph: etree._Element,
    source_id: int,
    name: str,
    top_mm: float,
    bottom_mm: float,
    allocate: Callable[[], int],
    *,
    lines: tuple[str, ...] = (),
    font_half_points: int = 21,
    line_twips: int = 420,
    x_emu: int | None = None,
    cx_emu: int | None = None,
) -> etree._Element:
    output = _materialize(
        root, paragraph, source_id, name, clone=True, allocate=allocate
    )
    source_x, _, source_cx, _ = component_geometry(output)
    set_component_geometry(
        output,
        x_emu=source_x if x_emu is None else x_emu,
        y_emu=absolute_y_emu(top_mm),
        cx_emu=source_cx if cx_emu is None else cx_emu,
        cy_emu=round((bottom_mm - top_mm) * EMU_PER_MM),
    )
    if lines:
        set_component_paragraphs(
            output,
            lines,
            font_half_points=font_half_points,
            line_twips=line_twips,
            bold_first=True,
        )
    return output


def _repair_page_one_sidebar(root: etree._Element) -> None:
    role = component_by_docpr_id(root, 10)
    labels = component_by_docpr_id(root, 11)
    values = component_by_docpr_id(root, 12)
    set_component_paragraphs(
        role,
        ("求职意向：AI 产品经理",),
        font_half_points=21,
        line_twips=280,
        bold_first=True,
    )
    set_component_paragraphs(
        labels,
        ("生日：", "现居：", "学历：", "专业：", "手机：", "邮箱：", "网站：", "GitHub："),
        font_half_points=20,
        line_twips=480,
    )
    set_component_paragraphs(
        values,
        (
            "2000.02",
            "浙江杭州",
            "大学本科",
            "计算机科学与技术",
            "173 9571 1345",
            "666qqx666@gmail.com",
            "qqx.life",
            "666qqx666-jpg",
        ),
        font_half_points=19,
        line_twips=480,
    )


def _build_page_one(
    root: etree._Element, paragraph: etree._Element, allocate: Callable[[], int]
) -> None:
    _repair_page_one_sidebar(root)
    sections = (
        (
            (48, 54, 61, 66),
            45,
            "P1_SUMMARY",
            PAGE_1_REGIONS_MM["summary"],
            "职业摘要",
            (RESUME.summary,),
            21,
            240,
            True,
            False,
            False,
        ),
        (
            (48, 54, 61, 66),
            45,
            "P1_CAPABILITIES",
            PAGE_1_REGIONS_MM["capabilities"],
            "核心能力",
            (RESUME.capabilities,),
            20,
            230,
            True,
            False,
            False,
        ),
        (
            (46, 53, 60, 65),
            45,
            "P1_EDUCATION",
            PAGE_1_REGIONS_MM["education"],
            "教育背景",
            (RESUME.education,),
            22,
            260,
            False,
            False,
            False,
        ),
        (
            (48, 54, 61, 66),
            47,
            "P1_EMPLOYMENT",
            PAGE_1_REGIONS_MM["employment"],
            "工作经历",
            RESUME.employment,
            20,
            245,
            False,
            False,
            True,
        ),
        (
            (50, 55, 62, 67),
            49,
            "P1_PROJECTS",
            PAGE_1_REGIONS_MM["project_preview"],
            "代表项目",
            RESUME.previews,
            20,
            250,
            False,
            False,
            True,
        ),
        (
            (52, 56, 63, 68),
            51,
            "P1_CERTIFICATES",
            PAGE_1_REGIONS_MM["certificates"],
            "证书奖励",
            RESUME.certificates,
            20,
            240,
            False,
            False,
            False,
        ),
    )
    for (
        title_ids,
        body_id,
        prefix,
        region,
        title,
        lines,
        font_size,
        line_twips,
        clone,
        bold_labels,
        bold_first,
    ) in sections:
        _place_section(
            root,
            paragraph,
            title_ids=title_ids,
            body_id=body_id,
            prefix=prefix,
            region=region,
            title=title,
            lines=lines,
            body_font_half_points=font_size,
            body_line_twips=line_twips,
            clone=clone,
            allocate=allocate,
            bold_labels=bold_labels,
            bold_first=bold_first,
        )


def _build_page_two(
    root: etree._Element, paragraph: etree._Element, allocate: Callable[[], int]
) -> None:
    _clone_sidebar_box(root, paragraph, 6, "P2_WHITE_BACKGROUND", 0.0, 297.0, allocate)
    _clone_sidebar_box(root, paragraph, 7, "P2_GRAY_SIDEBAR", 0.0, 297.0, allocate)
    _clone_sidebar_box(root, paragraph, 70, "P2_BLUE_STRIP", 0.0, 297.0, allocate)
    _clone_sidebar_box(
        root,
        paragraph,
        8,
        "P2_PORTFOLIO_LABEL",
        259.0,
        275.0,
        allocate,
        lines=("PROJECT PORTFOLIO",),
        font_half_points=18,
        line_twips=240,
    )
    label_x, _, _, _ = component_geometry(component_by_docpr_id(root, 11))
    _, _, value_width, _ = component_geometry(component_by_docpr_id(root, 12))
    _clone_sidebar_box(
        root,
        paragraph,
        12,
        "P2_NAVIGATION",
        42.0,
        118.0,
        allocate,
        lines=RESUME.sidebar_navigation,
        font_half_points=21,
        line_twips=520,
        x_emu=label_x,
        cx_emu=value_width,
    )
    _place_title_group(
        root,
        paragraph,
        (50, 55, 62, 67),
        "P2_PAGE_TITLE",
        PAGE_2_REGIONS_MM["page_title"][0],
        "项目经历",
        clone=True,
        allocate=allocate,
    )
    for key, prefix, project in zip(
        ("knowledge_harness", "sales_leads", "personal_site"),
        ("P2_KNOWLEDGE_HARNESS", "P2_SALES_LEADS", "P2_PERSONAL_SITE"),
        RESUME.projects,
        strict=True,
    ):
        _place_section(
            root,
            paragraph,
            title_ids=(50, 55, 62, 67),
            body_id=49,
            prefix=prefix,
            region=PAGE_2_REGIONS_MM[key],
            title=project.title,
            lines=project.body_lines(),
            body_font_half_points=19,
            body_line_twips=225,
            clone=True,
            allocate=allocate,
            bold_labels=True,
            bold_first=True,
        )


def build_resume(source: Path, target: Path) -> None:
    if source.resolve() == target.resolve():
        raise ValueError("source and target must be different files")
    if not source.is_file():
        raise FileNotFoundError(source)
    source_hash_before = file_sha256(source)
    root = read_document_xml(source)
    _assert_frozen_source_map(root)
    paragraphs = root.xpath("./w:body/w:p[.//wp:anchor]", namespaces=NS)
    if len(paragraphs) != 1:
        raise ValueError(f"expected one source anchor paragraph, found {len(paragraphs)}")
    allocate = _allocator(root)
    _build_page_one(root, paragraphs[0], allocate)
    page_two = append_second_page(root)
    _build_page_two(root, page_two, allocate)
    normalize_object_ids(root)
    write_package_atomic(
        source,
        target,
        root,
        part_overrides=cleaned_metadata_parts(source),
    )
    if file_sha256(source) != source_hash_before:
        target.unlink(missing_ok=True)
        raise RuntimeError("source changed during build")


def main() -> None:
    parser = argparse.ArgumentParser(description="Build the AI PM two-page resume")
    parser.add_argument("--source", type=Path, default=SOURCE_DEFAULT)
    parser.add_argument("--target", type=Path, default=TARGET_DEFAULT)
    args = parser.parse_args()
    build_resume(args.source, args.target)
    print(f"source_sha256={file_sha256(args.source)}")
    print(f"target_sha256={file_sha256(args.target)}")
    print(args.target)


if __name__ == "__main__":
    main()
