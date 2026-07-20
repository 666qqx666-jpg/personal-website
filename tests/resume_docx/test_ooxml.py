import tempfile
import unittest
from pathlib import Path
from zipfile import ZipFile

from lxml import etree

from scripts.resume_docx.ooxml import (
    NS,
    append_component,
    append_second_page,
    clone_component,
    component_geometry,
    normalize_object_ids,
    set_component_geometry,
    set_component_paragraphs,
    write_package_atomic,
)

XML = """<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
 xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
 xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
 xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
 xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
 xmlns:v="urn:schemas-microsoft-com:vml"><w:body><w:p><w:r><mc:AlternateContent>
 <mc:Choice Requires="w"><w:drawing><wp:anchor><wp:positionH relativeFrom="column"><wp:posOffset>10</wp:posOffset></wp:positionH><wp:positionV relativeFrom="paragraph"><wp:posOffset>20</wp:posOffset></wp:positionV><wp:extent cx="30" cy="40"/><a:xfrm><a:off x="0" y="0"/><a:ext cx="30" cy="40"/></a:xfrm><wp:docPr id="7" name="source"/><w:txbxContent><w:p><w:r><w:rPr><w:rFonts w:ascii="微软雅黑"/></w:rPr><w:t>old</w:t></w:r></w:p></w:txbxContent></wp:anchor></w:drawing></mc:Choice>
 <mc:Fallback><w:pict><v:shape id="duplicate" style="position:absolute;margin-left:0pt;margin-top:0pt;width:1pt;height:1pt"><v:textbox><w:txbxContent><w:p><w:r><w:rPr><w:rFonts w:ascii="微软雅黑"/></w:rPr><w:t>old</w:t></w:r></w:p></w:txbxContent></v:textbox></v:shape></w:pict></mc:Fallback>
 </mc:AlternateContent></w:r></w:p><w:sectPr/></w:body></w:document>""".encode("utf-8")


class OoxmlTest(unittest.TestCase):
    def setUp(self) -> None:
        self.root = etree.fromstring(XML)
        self.component = self.root.xpath(".//mc:AlternateContent", namespaces=NS)[0]

    def test_text_is_identical_in_choice_and_fallback(self) -> None:
        set_component_paragraphs(
            self.component,
            ("第一行", "项目背景：第二行"),
            font_half_points=21,
            line_twips=260,
            bold_labels=True,
        )
        branches = self.component.xpath(".//w:txbxContent", namespaces=NS)
        self.assertEqual(2, len(branches))
        self.assertEqual(
            ["第一行项目背景：第二行", "第一行项目背景：第二行"],
            ["".join(x.itertext()) for x in branches],
        )
        self.assertEqual(2, len(self.component.xpath('.//w:r[w:rPr/w:b]', namespaces=NS)))

    def test_geometry_updates_drawingml_and_vml(self) -> None:
        set_component_geometry(
            self.component, x_emu=12700, y_emu=25400, cx_emu=38100, cy_emu=50800
        )
        self.assertEqual((12700, 25400, 38100, 50800), component_geometry(self.component))
        self.assertEqual(
            ("38100", "50800"),
            tuple(
                self.component.xpath(".//a:xfrm/a:ext", namespaces=NS)[0].get(key)
                for key in ("cx", "cy")
            ),
        )
        style = self.component.xpath("string(.//v:shape/@style)", namespaces=NS)
        self.assertIn("margin-left:1.000000pt", style)
        self.assertIn("margin-top:2.000000pt", style)
        self.assertIn("width:3.000000pt", style)
        self.assertIn("height:4.000000pt", style)

    def test_clone_and_normalize_assign_unique_ids(self) -> None:
        paragraph = self.root.xpath("./w:body/w:p", namespaces=NS)[0]
        clone = clone_component(self.component, 101, "P2_TEST", 101)
        append_component(paragraph, clone)
        normalize_object_ids(self.root)
        docpr_ids = self.root.xpath(".//wp:docPr/@id", namespaces=NS)
        vml_ids = self.root.xpath(".//v:shape/@id", namespaces=NS)
        self.assertEqual(len(docpr_ids), len(set(docpr_ids)))
        self.assertEqual(len(vml_ids), len(set(vml_ids)))
        self.assertEqual("P2_TEST", clone.xpath("string(.//wp:docPr/@name)", namespaces=NS))

    def test_second_page_contains_one_explicit_break(self) -> None:
        paragraph = append_second_page(self.root)
        append_component(paragraph, clone_component(self.component, 102, "P2_BODY", 102))
        self.assertEqual(
            1, len(self.root.xpath('.//w:br[@w:type="page"]', namespaces=NS))
        )
        self.assertEqual(3, len(self.root.xpath("./w:body/w:p", namespaces=NS)))

    def test_atomic_package_preserves_unmodified_parts(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "source.docx"
            target = Path(directory) / "target.docx"
            with ZipFile(source, "w") as archive:
                archive.writestr("word/document.xml", XML)
                archive.writestr("word/media/image.png", b"image-bytes")
            write_package_atomic(source, target, self.root)
            with ZipFile(target) as archive:
                self.assertEqual(b"image-bytes", archive.read("word/media/image.png"))
                etree.fromstring(archive.read("word/document.xml"))


if __name__ == "__main__":
    unittest.main()
