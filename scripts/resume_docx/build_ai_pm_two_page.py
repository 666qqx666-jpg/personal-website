from __future__ import annotations

import argparse
from pathlib import Path
import sys
from typing import Callable

from lxml import etree

if __package__ in (None, ""):
    sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

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
    title_width_emu: int | None = None,
    icon_text: str = "•",
) -> None:
    geometries = [component_geometry(component_by_docpr_id(root, item)) for item in template_ids]
    source_top = min(geometry[1] for geometry in geometries)
    icon_background_geometry: tuple[int, int, int, int] | None = None
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
        if suffix == "ICON":
            output.getparent().remove(output)
            continue
        x_emu, y_emu, cx_emu, cy_emu = geometry
        if suffix == "TITLE" and title_width_emu is not None:
            cx_emu = title_width_emu
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
        if suffix == "ICON_BG":
            icon_background_geometry = (x_emu, target_y, cx_emu, cy_emu)
        if suffix == "TITLE":
            set_component_paragraphs(
                output, (title,), font_half_points=28, line_twips=320, bold_first=True
            )
    if icon_background_geometry is None:
        raise ValueError("title group has no icon background")
    icon_label = _materialize(
        root,
        paragraph,
        template_ids[0],
        f"{prefix}_ICON_TEXT",
        clone=True,
        allocate=allocate,
    )
    x_emu, y_emu, cx_emu, cy_emu = icon_background_geometry
    set_component_geometry(
        icon_label,
        x_emu=x_emu,
        y_emu=y_emu,
        cx_emu=cx_emu,
        cy_emu=cy_emu,
    )
    set_component_paragraphs(
        icon_label,
        (icon_text,),
        font_half_points=20,
        line_twips=240,
        bold_first=True,
        color="FFFFFF",
        alignment="center",
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
    title_width_emu: int | None = None,
    icon_text: str = "•",
    clone_body: bool | None = None,
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
        title_width_emu=title_width_emu,
        icon_text=icon_text,
    )
    body = _materialize(
        root,
        paragraph,
        body_id,
        f"{prefix}_BODY",
        clone=clone if clone_body is None else clone_body,
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


def _repair_page_one_sidebar(
    root: etree._Element,
    paragraph: etree._Element,
    allocate: Callable[[], int],
) -> None:
    role = component_by_docpr_id(root, 10)
    labels = component_by_docpr_id(root, 11)
    values = component_by_docpr_id(root, 12)
    label_x, _, _, _ = component_geometry(labels)
    for identifier in (2, 26, 27, 28, 29, 30, 31, 37, 38, 39, 40, 41, 42):
        component = component_by_docpr_id(root, identifier)
        component.getparent().remove(component)
    labels.getparent().remove(labels)
    set_component_paragraphs(
        role,
        ("求职意向：AI 产品经理",),
        font_half_points=21,
        line_twips=280,
        bold_first=True,
    )
    rows = (
        "生日：2000.02",
        "现居：浙江杭州",
        "学历：大学本科",
        "专业：计算机科学与技术",
        "手机：173 9571 1345",
        "邮箱：666qqx666@gmail.com",
        "网站：qqx.life",
        "GitHub：666qqx666-jpg",
    )
    for index, row in enumerate(rows):
        component = values if index == 0 else _materialize(
            root,
            paragraph,
            12,
            f"P1_CONTACT_{index + 1}",
            clone=True,
            allocate=allocate,
        )
        if index == 0:
            rename_component(component, "P1_CONTACT_1")
        set_component_geometry(
            component,
            x_emu=label_x,
            y_emu=absolute_y_emu(82.5 + index * 10.6),
            cx_emu=1_850_000,
            cy_emu=round(9.0 * EMU_PER_MM),
        )
        set_component_paragraphs(
            component,
            (row,),
            font_half_points=19,
            line_twips=240,
            bold_labels=True,
        )


def _build_page_one(
    root: etree._Element, paragraph: etree._Element, allocate: Callable[[], int]
) -> None:
    _repair_page_one_sidebar(root, paragraph, allocate)
    _place_section(
        root, paragraph, title_ids=(48, 54, 61, 66), body_id=45,
        prefix="P1_SUMMARY", region=PAGE_1_REGIONS_MM["summary"], title="职业摘要",
        lines=(RESUME.summary,), body_font_half_points=21, body_line_twips=240,
        clone=True, allocate=allocate, icon_text="摘",
    )
    _place_section(
        root, paragraph, title_ids=(48, 54, 61, 66), body_id=45,
        prefix="P1_CAPABILITIES", region=PAGE_1_REGIONS_MM["capabilities"],
        title="核心能力", lines=(RESUME.capabilities,), body_font_half_points=20,
        body_line_twips=230, clone=True, allocate=allocate, icon_text="能",
    )
    _place_section(
        root, paragraph, title_ids=(46, 53, 60, 65), body_id=45,
        prefix="P1_EDUCATION", region=PAGE_1_REGIONS_MM["education"], title="教育背景",
        lines=(RESUME.education,), body_font_half_points=22, body_line_twips=260,
        clone=False, allocate=allocate, icon_text="学",
    )
    _place_section(
        root, paragraph, title_ids=(48, 54, 61, 66), body_id=47,
        prefix="P1_EMPLOYMENT", region=PAGE_1_REGIONS_MM["employment"], title="工作经历",
        lines=RESUME.employment, body_font_half_points=20, body_line_twips=245,
        clone=False, allocate=allocate, bold_first=True, icon_text="职",
    )
    _place_section(
        root, paragraph, title_ids=(50, 55, 62, 67), body_id=47,
        prefix="P1_PROJECTS", region=PAGE_1_REGIONS_MM["project_preview"], title="代表项目",
        lines=RESUME.previews, body_font_half_points=20, body_line_twips=250,
        clone=False, clone_body=True, allocate=allocate, bold_first=True, icon_text="项",
    )
    component_by_docpr_id(root, 49).getparent().remove(component_by_docpr_id(root, 49))
    _place_section(
        root, paragraph, title_ids=(52, 56, 63, 68), body_id=51,
        prefix="P1_CERTIFICATES", region=PAGE_1_REGIONS_MM["certificates"], title="证书奖励",
        lines=RESUME.certificates, body_font_half_points=20, body_line_twips=240,
        clone=False, allocate=allocate, icon_text="证",
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
        font_half_points=30,
        line_twips=360,
    )
    label_x, _, value_width, _ = component_geometry(component_by_docpr_id(root, 12))
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
        title_width_emu=4_140_000,
        icon_text="项",
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
            body_id=47,
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
            title_width_emu=4_140_000,
            icon_text={
                "knowledge_harness": "AI",
                "sales_leads": "销",
                "personal_site": "站",
            }[key],
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
    page_two = append_second_page(root)
    _build_page_two(root, page_two, allocate)
    _build_page_one(root, paragraphs[0], allocate)
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
