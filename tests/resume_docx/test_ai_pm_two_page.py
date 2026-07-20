import tempfile
import unittest
from pathlib import Path
from zipfile import ZipFile

from lxml import etree

from scripts.resume_docx.build_ai_pm_two_page import build_resume
from scripts.resume_docx.model import FORBIDDEN_PUBLIC_TEXT, REQUIRED_PUBLIC_TEXT
from scripts.resume_docx.ooxml import NS, file_sha256

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


if __name__ == "__main__":
    unittest.main()
