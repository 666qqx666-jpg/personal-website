import tempfile
import unittest
from pathlib import Path
from zipfile import ZipFile

from lxml import etree

from scripts.resume_docx.build_ai_pm_two_page import build_resume
from scripts.resume_docx.model import FORBIDDEN_PUBLIC_TEXT, REQUIRED_PUBLIC_TEXT
from scripts.resume_docx.ooxml import NS, file_sha256
from scripts.resume_docx.validate_ai_pm_two_page import validate

SOURCE = Path("/Users/qqx/Desktop/个人/AI产品经理-钱麒祥.docx")


class AiPmTwoPageBuildTest(unittest.TestCase):
    def test_build_preserves_source_and_creates_closed_two_page_structure(self) -> None:
        before = file_sha256(SOURCE)
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / "resume.docx"
            build_resume(SOURCE, target)
            self.assertTrue(target.is_file())
            with ZipFile(target) as archive:
                self.assertIsNone(archive.testzip())
                root = etree.fromstring(archive.read("word/document.xml"))
                visible = "".join(root.xpath(".//w:t/text()", namespaces=NS))
                self.assertEqual(
                    1, len(root.xpath('.//w:br[@w:type="page"]', namespaces=NS))
                )
                ids = root.xpath(".//wp:docPr/@id", namespaces=NS)
                self.assertEqual(len(ids), len(set(ids)))
                for required in REQUIRED_PUBLIC_TEXT:
                    self.assertIn(required, visible)
                for forbidden in FORBIDDEN_PUBLIC_TEXT:
                    self.assertNotIn(forbidden, visible)
                page_two_text = "".join(
                    root.xpath(
                        './/wp:docPr[starts-with(@name, "P2_")]/ancestor::mc:AlternateContent[1]//w:t/text()',
                        namespaces=NS,
                    )
                )
                self.assertNotIn("173 9571 1345", page_two_text)
                self.assertNotIn("666qqx666@gmail.com", page_two_text)
                self.assertNotIn("666qqx666-jpg", page_two_text)
        self.assertEqual(before, file_sha256(SOURCE))

    def test_validator_closes_structure_privacy_and_geometry(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / "resume.docx"
            build_resume(SOURCE, target)
            report = validate(SOURCE, target, expected_source_sha256=file_sha256(SOURCE))
        expected_true = {
            "source_unchanged",
            "package_integrity",
            "preserve_only_parts_unchanged",
            "a4_portrait",
            "unique_docpr_ids",
            "unique_vml_ids",
            "unique_anchor_ids",
            "compatibility_text_matches",
            "required_content_present",
            "forbidden_content_absent",
            "page_two_privacy_clean",
            "metadata_clean",
        }
        for key in expected_true:
            self.assertIs(report[key], True)
        self.assertEqual(1, report["explicit_page_breaks"])
        self.assertEqual(2, report["anchor_paragraphs"])
        self.assertEqual(9.5, report["minimum_font_pt"])
        self.assertEqual(
            ["docProps/app.xml", "docProps/core.xml", "word/document.xml"],
            report["changed_parts"],
        )


if __name__ == "__main__":
    unittest.main()
