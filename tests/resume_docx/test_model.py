import unittest

from scripts.resume_docx.model import (
    FORBIDDEN_PUBLIC_TEXT,
    PAGE_1_REGIONS_MM,
    PAGE_2_REGIONS_MM,
    REQUIRED_PUBLIC_TEXT,
    RESUME,
)


class ResumeModelTest(unittest.TestCase):
    def test_fixed_public_facts(self) -> None:
        joined = "\n".join(RESUME.all_public_lines())
        for value in REQUIRED_PUBLIC_TEXT:
            self.assertIn(value, joined)
        for value in FORBIDDEN_PUBLIC_TEXT:
            self.assertNotIn(value, joined)
        self.assertIn("尚未推广给团队", joined)
        self.assertIn("2026.06–至今", joined)
        self.assertIn("约 102.6 万条线索", joined)
        self.assertIn("2 份正式业务竞品分析", joined)

    def test_page_regions_are_closed_and_safe(self) -> None:
        self.assertEqual(PAGE_1_REGIONS_MM["certificates"][1], 285.0)
        self.assertEqual(PAGE_2_REGIONS_MM["personal_site"][1], 280.0)
        for regions in (PAGE_1_REGIONS_MM, PAGE_2_REGIONS_MM):
            previous_bottom = 0.0
            for top, bottom in regions.values():
                self.assertGreaterEqual(top, 12.0)
                self.assertGreater(bottom, top)
                self.assertGreater(top, previous_bottom)
                previous_bottom = bottom

    def test_three_projects_have_closed_two_action_structure(self) -> None:
        self.assertEqual(3, len(RESUME.projects))
        for project in RESUME.projects:
            self.assertEqual(2, len(project.actions))
            self.assertEqual(7, len(project.body_lines()))


if __name__ == "__main__":
    unittest.main()
