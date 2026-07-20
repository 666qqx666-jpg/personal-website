from __future__ import annotations

from copy import deepcopy
from hashlib import sha256
from pathlib import Path, PurePosixPath
import os
import re
import tempfile
from typing import Iterable
from zipfile import ZIP_DEFLATED, ZipFile

from lxml import etree

NS = {
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "cp": "http://schemas.openxmlformats.org/package/2006/metadata/core-properties",
    "dc": "http://purl.org/dc/elements/1.1/",
    "dcterms": "http://purl.org/dc/terms/",
    "ep": "http://schemas.openxmlformats.org/officeDocument/2006/extended-properties",
    "mc": "http://schemas.openxmlformats.org/markup-compatibility/2006",
    "o": "urn:schemas-microsoft-com:office:office",
    "pic": "http://schemas.openxmlformats.org/drawingml/2006/picture",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "rel": "http://schemas.openxmlformats.org/package/2006/relationships",
    "v": "urn:schemas-microsoft-com:vml",
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    "wp": "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing",
    "wp14": "http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing",
}

W = f"{{{NS['w']}}}"
WP14 = f"{{{NS['wp14']}}}"
O = f"{{{NS['o']}}}"
XML_SPACE = "{http://www.w3.org/XML/1998/namespace}space"
VML_GRAPHICS_XPATH = ".//v:shape | .//v:rect | .//v:line | .//v:oval | .//v:group"


def file_sha256(path: Path) -> str:
    digest = sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def read_document_xml(path: Path) -> etree._Element:
    with ZipFile(path) as archive:
        return etree.fromstring(archive.read("word/document.xml"))


def component_by_docpr_id(root: etree._Element, docpr_id: int) -> etree._Element:
    found = root.xpath(f'.//wp:docPr[@id="{docpr_id}"]', namespaces=NS)
    if len(found) != 1:
        raise ValueError(f"expected one wp:docPr id={docpr_id}, found {len(found)}")
    alternate = found[0].xpath("ancestor::mc:AlternateContent[1]", namespaces=NS)
    if alternate:
        return alternate[0]
    runs = found[0].xpath("ancestor::w:r[1]", namespaces=NS)
    if len(runs) != 1:
        raise ValueError(f"wp:docPr id={docpr_id} is not inside one run")
    return runs[0]


def component_geometry(component: etree._Element) -> tuple[int, int, int, int]:
    anchors = component.xpath(".//wp:anchor", namespaces=NS)
    if len(anchors) != 1:
        raise ValueError(f"component must contain one DrawingML anchor, found {len(anchors)}")
    anchor = anchors[0]
    horizontal = anchor.find("wp:positionH/wp:posOffset", namespaces=NS)
    vertical = anchor.find("wp:positionV/wp:posOffset", namespaces=NS)
    extent = anchor.find("wp:extent", namespaces=NS)
    if horizontal is None or vertical is None or extent is None:
        raise ValueError("anchor is missing position or extent")
    return (
        int(horizontal.text),
        int(vertical.text),
        int(extent.get("cx")),
        int(extent.get("cy")),
    )


def rename_component(component: etree._Element, name: str) -> None:
    docpr = component.xpath(".//wp:docPr", namespaces=NS)
    if len(docpr) != 1:
        raise ValueError("component must contain one wp:docPr")
    docpr[0].set("name", name)
    for node in component.xpath(".//pic:cNvPr", namespaces=NS):
        node.set("name", name)


def _replace_style_value(style: str, key: str, value: str) -> str:
    pattern = re.compile(rf"(^|;){re.escape(key)}:[^;]*")
    replacement = rf"\1{key}:{value}"
    if pattern.search(style):
        return pattern.sub(replacement, style)
    return f"{style.rstrip(';')};{key}:{value}"


def _emu_to_pt(value: int) -> str:
    return f"{value / 12700:.6f}pt"


def set_component_geometry(
    component: etree._Element,
    *,
    x_emu: int,
    y_emu: int,
    cx_emu: int,
    cy_emu: int,
) -> None:
    anchors = component.xpath(".//wp:anchor", namespaces=NS)
    if len(anchors) != 1:
        raise ValueError(f"component must contain one DrawingML anchor, found {len(anchors)}")
    anchor = anchors[0]
    horizontal = anchor.find("wp:positionH", namespaces=NS)
    vertical = anchor.find("wp:positionV", namespaces=NS)
    extent = anchor.find("wp:extent", namespaces=NS)
    horizontal.set("relativeFrom", "column")
    vertical.set("relativeFrom", "paragraph")
    horizontal.find("wp:posOffset", namespaces=NS).text = str(x_emu)
    vertical.find("wp:posOffset", namespaces=NS).text = str(y_emu)
    extent.set("cx", str(cx_emu))
    extent.set("cy", str(cy_emu))

    # Keep the shape's internal DrawingML transform in sync with the Word
    # anchor. Quick Look uses this extent when scaling text inside a shape;
    # leaving the template dimensions here can squash otherwise-correct text.
    for inner_extent in component.xpath(".//a:xfrm/a:ext", namespaces=NS):
        inner_extent.set("cx", str(cx_emu))
        inner_extent.set("cy", str(cy_emu))

    for graphic in component.xpath(VML_GRAPHICS_XPATH, namespaces=NS):
        style = graphic.get("style", "")
        for key, raw in (
            ("margin-left", x_emu),
            ("margin-top", y_emu),
            ("width", cx_emu),
            ("height", cy_emu),
        ):
            style = _replace_style_value(style, key, _emu_to_pt(raw))
        graphic.set("style", style)


def _set_run_size(run_properties: etree._Element, font_half_points: int) -> None:
    for tag in ("sz", "szCs"):
        for old in run_properties.findall(f"w:{tag}", namespaces=NS):
            run_properties.remove(old)
        size = etree.SubElement(run_properties, f"{W}{tag}")
        size.set(f"{W}val", str(font_half_points))


def _set_run_bold(run_properties: etree._Element, bold: bool) -> None:
    for tag in ("b", "bCs"):
        for old in run_properties.findall(f"w:{tag}", namespaces=NS):
            run_properties.remove(old)
    if bold:
        etree.SubElement(run_properties, f"{W}b")


def _set_run_color(run_properties: etree._Element, color: str | None) -> None:
    if color is None:
        return
    for old in run_properties.findall("w:color", namespaces=NS):
        run_properties.remove(old)
    node = etree.SubElement(run_properties, f"{W}color")
    node.set(f"{W}val", color)


def _new_run(
    template_run_properties: etree._Element | None,
    text: str,
    font_half_points: int,
    *,
    bold: bool,
    color: str | None,
) -> etree._Element:
    run = etree.Element(f"{W}r")
    run_properties = (
        deepcopy(template_run_properties)
        if template_run_properties is not None
        else etree.Element(f"{W}rPr")
    )
    _set_run_size(run_properties, font_half_points)
    _set_run_bold(run_properties, bold)
    _set_run_color(run_properties, color)
    run.append(run_properties)
    text_node = etree.SubElement(run, f"{W}t")
    text_node.set(XML_SPACE, "preserve")
    text_node.text = text
    return run


def _new_paragraph(
    template: etree._Element,
    text: str,
    font_half_points: int,
    *,
    line_twips: int | None,
    bold_label: bool,
    bold_all: bool,
    color: str | None,
    alignment: str,
) -> etree._Element:
    paragraph = etree.Element(f"{W}p")
    paragraph_properties = etree.Element(f"{W}pPr")
    if line_twips is not None:
        spacing = etree.SubElement(paragraph_properties, f"{W}spacing")
        spacing.set(f"{W}before", "0")
        spacing.set(f"{W}after", "0")
        spacing.set(f"{W}line", str(line_twips))
        spacing.set(f"{W}lineRule", "exact")
    justification = etree.SubElement(paragraph_properties, f"{W}jc")
    justification.set(f"{W}val", alignment)
    paragraph.append(paragraph_properties)

    template_run = template.find("w:r", namespaces=NS)
    template_run_properties = (
        template_run.find("w:rPr", namespaces=NS) if template_run is not None else None
    )
    if bold_label and "：" in text:
        label, value = text.split("：", 1)
        paragraph.append(
            _new_run(
                template_run_properties,
                f"{label}：",
                font_half_points,
                bold=True,
                color=color,
            )
        )
        paragraph.append(
            _new_run(
                template_run_properties,
                value,
                font_half_points,
                bold=False,
                color=color,
            )
        )
    else:
        paragraph.append(
            _new_run(
                template_run_properties,
                text,
                font_half_points,
                bold=bold_all,
                color=color,
            )
        )
    return paragraph


def set_component_paragraphs(
    component: etree._Element,
    lines: Iterable[str],
    *,
    font_half_points: int,
    line_twips: int | None = None,
    bold_labels: bool = False,
    bold_first: bool = False,
    color: str | None = None,
    alignment: str = "left",
) -> None:
    line_values = tuple(lines)
    boxes = component.xpath(".//w:txbxContent", namespaces=NS)
    if not boxes:
        raise ValueError("component has no text box")
    for box in boxes:
        paragraphs = box.findall("w:p", namespaces=NS)
        if not paragraphs:
            raise ValueError("text box has no paragraph template")
        template = paragraphs[0]
        for paragraph in paragraphs:
            box.remove(paragraph)
        for index, line in enumerate(line_values):
            box.append(
                _new_paragraph(
                    template,
                    line,
                    font_half_points,
                    line_twips=line_twips,
                    bold_label=bold_labels,
                    bold_all=bold_first and index == 0,
                    color=color,
                    alignment=alignment,
                )
            )


def clone_component(
    component: etree._Element,
    docpr_id: int,
    name: str,
    serial: int,
) -> etree._Element:
    clone = deepcopy(component)
    docpr = clone.xpath(".//wp:docPr", namespaces=NS)
    if len(docpr) != 1:
        raise ValueError("cloned component must contain one wp:docPr")
    docpr[0].set("id", str(docpr_id))
    docpr[0].set("name", name)
    for node in clone.xpath(".//pic:cNvPr", namespaces=NS):
        node.set("id", str(docpr_id))
        node.set("name", name)
    for graphic in clone.xpath(VML_GRAPHICS_XPATH, namespaces=NS):
        graphic.set("id", f"_x0000_s{serial}")
        if graphic.get(f"{O}spid") is not None:
            graphic.set(f"{O}spid", f"_x0000_s{serial}")
    for anchor in clone.xpath(".//wp:anchor", namespaces=NS):
        anchor.set("relativeHeight", str(251_700_000 + serial))
        anchor.set(f"{WP14}anchorId", f"{serial:08X}"[-8:])
        anchor.set(f"{WP14}editId", f"{serial + 1:08X}"[-8:])
    return clone


def normalize_object_ids(root: etree._Element, *, start: int = 2000) -> None:
    serial = start
    for graphic in root.xpath(VML_GRAPHICS_XPATH, namespaces=NS):
        graphic.set("id", f"_x0000_s{serial}")
        if graphic.get(f"{O}spid") is not None:
            graphic.set(f"{O}spid", f"_x0000_s{serial}")
        serial += 1
    for index, anchor in enumerate(root.xpath(".//wp:anchor", namespaces=NS), start=1):
        anchor.set(f"{WP14}anchorId", f"{index:08X}")
        anchor.set(f"{WP14}editId", f"{index + 100_000:08X}"[-8:])


def append_second_page(root: etree._Element) -> etree._Element:
    body = root.find("w:body", namespaces=NS)
    if body is None:
        raise ValueError("document has no body")
    section = body.find("w:sectPr", namespaces=NS)
    if section is None:
        raise ValueError("document body has no section properties")
    if root.xpath('.//w:br[@w:type="page"]', namespaces=NS):
        raise ValueError("document already contains an explicit page break")
    break_paragraph = etree.Element(f"{W}p")
    break_run = etree.SubElement(break_paragraph, f"{W}r")
    page_break = etree.SubElement(break_run, f"{W}br")
    page_break.set(f"{W}type", "page")
    anchor_paragraph = etree.Element(f"{W}p")
    section_index = body.index(section)
    body.insert(section_index, break_paragraph)
    body.insert(section_index + 1, anchor_paragraph)
    return anchor_paragraph


def append_component(paragraph: etree._Element, component: etree._Element) -> None:
    run = etree.SubElement(paragraph, f"{W}r")
    run.append(component)


def cleaned_metadata_parts(source: Path) -> dict[str, bytes]:
    with ZipFile(source) as archive:
        core = etree.fromstring(archive.read("docProps/core.xml"))
        app = etree.fromstring(archive.read("docProps/app.xml"))
    for xpath in ("./dc:creator", "./cp:lastModifiedBy"):
        for node in core.xpath(xpath, namespaces=NS):
            node.text = ""
    for xpath in ("./ep:Template", "./ep:Application", "./ep:AppVersion"):
        for node in app.xpath(xpath, namespaces=NS):
            node.text = ""
    return {
        "docProps/core.xml": etree.tostring(
            core, xml_declaration=True, encoding="UTF-8", standalone=True
        ),
        "docProps/app.xml": etree.tostring(
            app, xml_declaration=True, encoding="UTF-8", standalone=True
        ),
    }


def write_package_atomic(
    source: Path,
    target: Path,
    document_root: etree._Element,
    *,
    part_overrides: dict[str, bytes] | None = None,
) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    overrides = part_overrides or {}
    document_xml = etree.tostring(
        document_root, xml_declaration=True, encoding="UTF-8", standalone=True
    )
    descriptor, temporary_name = tempfile.mkstemp(
        prefix=f".{target.name}.", suffix=".tmp", dir=target.parent
    )
    os.close(descriptor)
    temporary = Path(temporary_name)
    try:
        with ZipFile(source, "r") as original, ZipFile(
            temporary, "w", compression=ZIP_DEFLATED
        ) as output:
            for info in original.infolist():
                if info.filename == "word/document.xml":
                    payload = document_xml
                else:
                    payload = overrides.get(info.filename, original.read(info.filename))
                output.writestr(info, payload)
        os.replace(temporary, target)
    finally:
        temporary.unlink(missing_ok=True)


def relationship_targets(archive: ZipFile, rels_path: str) -> set[str]:
    root = etree.fromstring(archive.read(rels_path))
    base = PurePosixPath(rels_path).parent.parent
    targets: set[str] = set()
    for relationship in root.xpath("./rel:Relationship", namespaces=NS):
        if relationship.get("TargetMode") == "External":
            continue
        target = relationship.get("Target")
        resolved = str((base / target).as_posix())
        while "/../" in resolved:
            resolved = re.sub(r"[^/]+/\.\./", "", resolved, count=1)
        targets.add(resolved.lstrip("/"))
    return targets
