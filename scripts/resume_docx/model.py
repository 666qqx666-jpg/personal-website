from __future__ import annotations

from dataclasses import dataclass

EMU_PER_MM = 36_000
PARAGRAPH_ORIGIN_MM = 25.4
A4_WIDTH_TWIPS = 11_906
A4_HEIGHT_TWIPS = 16_838
MIN_FONT_HALF_POINTS = 19

PAGE_1_REGIONS_MM = {
    "education": (12.0, 33.0),
    "summary": (38.0, 59.0),
    "capabilities": (64.0, 84.0),
    "employment": (88.0, 156.0),
    "project_preview": (162.0, 238.0),
    "certificates": (248.0, 285.0),
}

PAGE_2_REGIONS_MM = {
    "page_title": (12.0, 30.0),
    "knowledge_harness": (34.0, 118.0),
    "sales_leads": (124.0, 209.0),
    "personal_site": (215.0, 280.0),
}

SOURCE_ANCHORS = {
    "education_body": 45,
    "education_title": (46, 53, 60, 65),
    "employment_body": 47,
    "employment_title": (48, 54, 61, 66),
    "projects_body": 49,
    "projects_title": (50, 55, 62, 67),
    "certificates_body": 51,
    "certificates_title": (52, 56, 63, 68),
    "sidebar": (6, 7, 70, 8),
    "identity": (5, 9, 10, 11, 12),
}

REQUIRED_PUBLIC_TEXT = (
    "AI 产品经理",
    "中国计量大学",
    "Personal Knowledge Harness",
    "全域销售线索管理系统",
    "qqx.life",
    "产品经理国际资格认证（NPDP）",
    "PMP（Project Management Professional）",
    "信息系统项目管理师",
)

FORBIDDEN_PUBLIC_TEXT = (
    "团队提效",
    "团队采用率",
    "公司级 AI 产品",
    "统一总分模型",
    "2026.04–至今｜个人网站",
    "49.4%",
    "61.7%",
)


@dataclass(frozen=True)
class Project:
    title: str
    role: str
    period: str
    background: str
    judgment: str
    actions: tuple[str, ...]
    evidence: str
    keywords: str

    def body_lines(self) -> tuple[str, ...]:
        return (
            f"{self.role}｜{self.period}",
            f"项目背景：{self.background}",
            f"产品判断：{self.judgment}",
            *(f"关键行动：{action}" for action in self.actions),
            f"结果证据：{self.evidence}",
            f"能力关键词：{self.keywords}",
        )


@dataclass(frozen=True)
class ResumeContent:
    target_role: str
    education: str
    summary: str
    capabilities: str
    employment: tuple[str, ...]
    previews: tuple[str, ...]
    certificates: tuple[str, ...]
    sidebar_navigation: tuple[str, ...]
    projects: tuple[Project, ...]

    def all_public_lines(self) -> tuple[str, ...]:
        return (
            self.target_role,
            self.education,
            self.summary,
            self.capabilities,
            *self.employment,
            *self.previews,
            *self.certificates,
            *self.sidebar_navigation,
            *(line for project in self.projects for line in (project.title, *project.body_lines())),
        )


RESUME = ResumeContent(
    target_role="AI 产品经理",
    education="2018.09–2022.06｜中国计量大学｜计算机科学与技术",
    summary=(
        "4 年企业服务产品经验，覆盖 CRM、权限、数据、交易与营销场景；擅长复杂业务建模与技术协作，"
        "已将 AI Agent 工作流用于真实产品交付。"
    ),
    capabilities="Agent 工作流设计｜RAG 与上下文治理｜复杂业务建模｜AI 产品落地｜数据与技术协作",
    employment=(
        "2022.06–至今｜浙江影能科技有限公司｜产品经理",
        "负责企业服务产品的问题识别、业务建模、版本规划、PRD、原型、技术协作与上线推动。",
        "先后主导或承接权限、会员运营、经营分析、智慧停车和销售线索等核心模块。",
        "自 2026 年起将个人 AI Agent 工作台用于真实需求与交付，当前仍处于个人验证阶段。",
        "2021.07–2021.10｜浙江达摩科技有限公司｜Java 实习｜基于 SpringMVC 参与项目开发。",
    ),
    previews=(
        "Personal Knowledge Harness｜2026.04–至今｜8 类工作流中 6 类稳定自用，累计支撑 9 份真实业务 PRD、2 份正式业务竞品分析及 3 类定制报价。",
        "全域销售线索管理系统｜2025.04–至今｜覆盖约 10 个付费品牌、15,000 家门店，累计约 102.6 万条线索，月处理约 10 万–30 万条。",
        "qqx.life｜2026.06–至今｜以 AI 辅助完成需求、方案、开发、自动化验证与发布，形成 22 个页面和 16 个 E2E 测试文件。",
    ),
    certificates=(
        "产品经理国际资格认证（NPDP）",
        "PMP（Project Management Professional）",
        "信息系统项目管理师",
    ),
    sidebar_navigation=(
        "AI Agent",
        "RAG / Context",
        "Vibe Coding",
        "复杂业务建模",
        "数据与技术协作",
    ),
    projects=(
        Project(
            title="Personal Knowledge Harness",
            role="独立产品设计与实践",
            period="2026.04–至今",
            background="工作文档、经验和 AI 对话长期散落，需要建立可追溯、按需加载、跨 Agent 共用的知识与工作流系统。",
            judgment="目标不是一次性塞入全部资料，而是建立分层真值源与最小充分上下文，让不同 Agent 基于同一事实完成任务。",
            actions=(
                "建立“原文层—正式知识域—能力层”三层结构，以最小 context-pack 按任务加载材料。",
                "将需求发现、PRD 写审、竞品分析、报价、复盘和上下文治理沉淀为可复用 Agent Skill。",
            ),
            evidence="8 类工作流中 6 类稳定自用，支撑 9 份真实业务 PRD、6 份蓝图或关键决策材料、2 份正式业务竞品分析及 3 类定制开发报价方案；尚未推广给团队。",
            keywords="Agent 工作流、RAG、上下文治理、知识架构、AI 产品验证",
        ),
        Project(
            title="全域销售线索管理系统",
            role="产品线负责人",
            period="2025.04–至今",
            background="多平台线索依赖人工导入和分配，跟进延迟且缺少责任回收，需要建立可持续的门店跟进闭环。",
            judgment="不采用未经验证的统一评分，优先建立可解释、可配置、可回收的规则机制；早期多平台接入底座由前任产品负责人建设。",
            actions=(
                "主导智能分发、任务生命周期、公海池、隐私外呼、自动回收和经营分析。",
                "通过资格过滤、保护期、分阶段扩圈、公海池认领与超时回收形成责任闭环。",
            ),
            evidence="覆盖约 10 个付费品牌、15,000 家门店，累计约 102.6 万条线索，月处理约 10 万–30 万条。",
            keywords="复杂业务建模、规则治理、责任闭环、数据分析、商业化落地",
        ),
        Project(
            title="qqx.life 个人网站",
            role="独立设计与开发实践",
            period="2026.06–至今",
            background="需要统一入口沉淀个人项目、AI 实践和产品思考，并验证 AI 辅助开发能否形成完整、可复用的交付流程。",
            judgment="Vibe Coding 的价值不只在生成代码，而在于连接需求、规格、实施、验证与发布，形成可复核闭环。",
            actions=(
                "使用 Astro 5、TypeScript、GSAP 和 Playwright 完成产品表达与实现。",
                "按“需求 / Spec → 实施计划 → 编码 → E2E 验证 → GitHub Pages 发布”完成端到端交付。",
            ),
            evidence="当前公开项目包含 22 个 Astro 页面、16 个 E2E 测试文件、自动化部署和可复现的简历导出能力。",
            keywords="Vibe Coding、需求到交付、自动化验证、技术协作、产品表达",
        ),
    ),
)
