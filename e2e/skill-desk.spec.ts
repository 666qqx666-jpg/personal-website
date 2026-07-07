import { test, expect } from '@playwright/test';

test('AI listing links to Skill Desk', async ({ page }) => {
  await page.goto('/ai/');
  const card = page.locator('.card', { hasText: 'Skill Desk' });
  await expect(card).toBeVisible();
  await expect(card).toContainText('常用技能');
  await expect(card).toContainText('可产品化');
  await expect(card).toHaveAttribute('href', '/ai/skill-desk/');
  await expect(page.locator('.card', { hasText: 'reading-dialogue Skill' })).toHaveCount(0);
});

test('Skill Desk homepage shows skill cards and detail entries', async ({ page }) => {
  await page.goto('/ai/skill-desk/');
  await expect(page.getByRole('heading', { name: 'Skill Desk' })).toBeVisible();
  await expect(page.locator('.skill-card')).toHaveCount(8);
  await expect(page.locator('.desk-tabs')).toContainText('阅读与沉淀');
  await expect(page.locator('.desk-tabs')).toContainText('PRD / Spec');
  await expect(page.locator('.desk-tabs')).toContainText('交付与报价');
  await expect(page.locator('.desk-tabs')).toContainText('记忆控制');
  await expect(page.locator('.skill-card', { hasText: '深度阅读对话' })).toContainText('稳定使用');
  await expect(page.locator('.skill-card', { hasText: '深度阅读对话' })).toHaveAttribute(
    'href',
    '/ai/skill-desk/reading-dialogue/'
  );
  await expect(page.locator('.skill-card:not(.absorbed-card)', { hasText: '周度复盘反思' })).toHaveAttribute(
    'href',
    '/ai/skill-desk/weekly-retro/'
  );
  await expect(page.locator('.skill-card', { hasText: '需求头脑风暴' })).toHaveAttribute(
    'href',
    '/ai/skill-desk/requirement-discovery/'
  );
  await expect(page.locator('.skill-card', { hasText: 'PRD Skill' })).toHaveAttribute(
    'href',
    '/ai/skill-desk/prd-skill/'
  );
  await expect(page.locator('.skill-card', { hasText: '竞品分析' })).toHaveAttribute(
    'href',
    '/ai/skill-desk/competitive-analysis/'
  );
  await expect(page.locator('.skill-card', { hasText: '报价书生成' })).toHaveAttribute(
    'href',
    '/ai/skill-desk/quotation/'
  );
  await expect(page.locator('.skill-card', { hasText: '记忆控制层' })).toHaveAttribute(
    'href',
    '/ai/skill-desk/memory-loader/'
  );
  const digestCard = page.locator('.skill-card.absorbed-card', { hasText: 'Digest 方法组件' });
  await expect(digestCard).toBeVisible();
  await expect(digestCard).toContainText('已融入周度复盘反思');
  await expect(digestCard).toContainText('不是独立 Skill Desk');
  await expect(digestCard).toContainText('已融入周报');
  await expect(digestCard).toHaveAttribute(
    'href',
    '/ai/skill-desk/weekly-retro/#s3'
  );
  await expect(page.locator('.product-lane')).toContainText('GitHub 开源项目');
  await expect(page.locator('.harness-link')).toHaveAttribute('href', '/ai/knowledge-harness/');
});

test('Skill Desk homepage and detail pages share the selected theme state', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('theme', 'light'));

  await page.goto('/ai/skill-desk/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  const homeBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(homeBg).toBe('rgb(247, 249, 253)');

  await page.goto('/ai/skill-desk/reading-dialogue/');
  await expect(page.locator('html')).toHaveAttribute('data-deck-theme', 'site');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  const detailBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(detailBg).toBe('rgb(247, 249, 253)');

  await page.locator('#deck-theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('#deck-theme-toggle')).toContainText('☀️');
  const storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
  expect(storedTheme).toBe('dark');
});

test('Skill Desk homepage separates unvalidated skills into Lab', async ({ page }) => {
  await page.goto('/ai/skill-desk/');
  await expect(page.locator('.skill-card')).toHaveCount(8);
  const lab = page.locator('.skill-lab');
  await expect(lab).toBeVisible();
  await expect(lab).toContainText('Skill Lab');
  await expect(lab).toContainText('待实战验证');
  await expect(lab.locator('.lab-item')).toHaveCount(2);
  await expect(lab).toContainText('原型设计工作流');
  await expect(lab).toContainText('暂不单独做详情页');
  await expect(lab).toContainText('下一次基于 PRD、旧页面、截图或竞品参考做原型');
  await expect(lab).toContainText('多 Agent 协作协议');
  await expect(lab).toContainText('Mode Gate');
  await expect(lab).toContainText('Judge 裁决');
  await expect(lab).toContainText('PRD 写审');
  await expect(lab.locator('a')).toHaveCount(0);
});

test('reading-dialogue flagship has ten sections and core controls', async ({ page }) => {
  await page.goto('/ai/skill-desk/reading-dialogue/');
  await expect(page.getByRole('heading', { name: 'reading-dialogue Skill：把深度阅读变成知识生产' })).toBeVisible();
  await expect(page.locator('main#deck section')).toHaveCount(10);
  await expect(page.locator('#s4')).toContainText('事故现场：《置身钉内》里的失控');
  await expect(page.locator('#s6')).toContainText('划线交流档');
  await expect(page.locator('#s6')).toContainText('为什么划线');
  await expect(page.locator('#s6')).toContainText('只有明确切档后');
  await expect(page.locator('#s6')).toContainText('需求发现或产品文档工作流');
  await expect(page.locator('#s7')).toContainText('单条划线最多两轮');
  await expect(page.locator('#s8')).toContainText('三分流收口');
  await expect(page.locator('#s8')).toContainText('观点知识卡');
  await expect(page.locator('#s8')).toContainText('需求构思候选池');
  await expect(page.locator('#s8')).toContainText('不是灵感池');
  await expect(page.locator('#s9')).toContainText('入库门禁');
  await expect(page.locator('#s9')).toContainText('需求构思成熟后');
  await expect(page.locator('#s10')).toContainText('开源潜力');
});

test('reading-dialogue flagship exposes timeline labels', async ({ page }) => {
  await page.goto('/ai/skill-desk/reading-dialogue/');
  const timeline = page.locator('nav.timeline');
  await expect(timeline).toBeVisible();
  for (const label of ['入口', '问题', '直觉', '事故', '反思', '档位', '刹车', '分流', '门禁', '资产']) {
    await expect(timeline).toContainText(label);
  }
});

test('weekly-retro detail page explains how AI usage gets better', async ({ page }) => {
  await page.goto('/ai/skill-desk/weekly-retro/');
  await expect(page.getByRole('heading', { name: 'weekly-retro Skill：让 AI 使用方式持续变好' })).toBeVisible();
  await expect(page.locator('main#deck section')).toHaveCount(11);
  await expect(page.locator('#s3')).toContainText('早期 digest');
  await expect(page.locator('#s3')).toContainText('主动沉淀对话里的知识点');
  await expect(page.locator('#s3')).toContainText('主动触发');
  await expect(page.locator('#s4')).toContainText('固定提示词');
  await expect(page.locator('#s4 .copy-prompt')).toContainText('复制原始提示词');
  await expect(page.locator('#s4 .copy-prompt')).toHaveAttribute('data-prompt', /请帮我审查 5\.25-5\.31/);
  await expect(page.locator('#s5')).toContainText('低效不只在 AI');
  await expect(page.locator('#s7')).toContainText('单 agent 的局限');
  await expect(page.locator('#s8')).toContainText('多 agent 插曲');
  await expect(page.locator('#s9')).toContainText('digest 的方法在这里重新出现');
  await expect(page.locator('#s10')).toContainText('线头更新');
  await expect(page.locator('#s10')).toContainText('能力层规则');
  await expect(page.locator('#s10')).toContainText('正式知识卡');
  await expect(page.locator('#s10')).toContainText('索引维护');
  await expect(page.locator('#s11')).toContainText('AI 使用方式持续变好');
});

test('weekly-retro detail page exposes timeline labels', async ({ page }) => {
  await page.goto('/ai/skill-desk/weekly-retro/');
  const timeline = page.locator('nav.timeline');
  await expect(timeline).toBeVisible();
  for (const label of ['入口', '起点', 'Digest', '提示词', '发现', 'Skill化', '单Agent', '多Agent', '周报', '收口', '变好']) {
    await expect(timeline).toContainText(label);
  }
});

test('weekly-retro original prompt can be copied', async ({ page }) => {
  await page.addInitScript(() => {
    let copied = '';
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          copied = text;
        },
        readText: async () => copied,
      },
    });
  });
  await page.goto('/ai/skill-desk/weekly-retro/#s4');
  await page.locator('#s4 .copy-prompt').click();
  await expect(page.locator('#s4 .copy-status')).toContainText('已复制');
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toContain('请帮我审查 5.25-5.31');
  expect(clipboard).toContain('我的 Claude 使用优化建议');
});

test('weekly-retro detail page links back to Skill Desk and Knowledge Harness', async ({ page }) => {
  await page.goto('/ai/skill-desk/weekly-retro/');
  await expect(page.locator('#s11 a', { hasText: '回到 Skill Desk' })).toHaveAttribute(
    'href',
    '/ai/skill-desk/'
  );
  await expect(page.locator('#s11 a', { hasText: '查看知识 Harness' })).toHaveAttribute(
    'href',
    '/ai/knowledge-harness/'
  );
});

test('prd-skill detail page explains the PRD workflow evolution', async ({ page }) => {
  await page.goto('/ai/skill-desk/prd-skill/');
  await expect(page.getByRole('heading', { name: 'prd-skill：从 AI 代写 PRD 到双角色工作流' })).toBeVisible();
  await expect(page.locator('main#deck section')).toHaveCount(11);
  await expect(page.locator('#s2')).toContainText('让 AI 代替写需求文档');
  await expect(page.locator('#s3')).toContainText('给模板');
  await expect(page.locator('#s4')).toContainText('反反复复修改');
  await expect(page.locator('#s6')).toContainText('同一个对话框里审查');
  await expect(page.locator('#s7')).toContainText('prd-writer 和 prd-review');
  await expect(page.locator('#s8')).toContainText('不同 agent');
  await expect(page.locator('#s9')).toContainText('spec-readiness');
  await expect(page.locator('#s10')).toContainText('实现门禁：没过审，就不进入 writing-plans');
  await expect(page.locator('#s10')).toContainText('Blocker');
  await expect(page.locator('#s10')).toContainText('实现门禁');
  await expect(page.locator('#s11')).toContainText('交付更稳');
});

test('prd-skill detail page exposes timeline labels and links', async ({ page }) => {
  await page.goto('/ai/skill-desk/prd-skill/');
  const timeline = page.locator('nav.timeline');
  await expect(timeline).toBeVisible();
  for (const label of ['入口', '愿景', '模板', '返工', '工作流', '同框', '拆分', '双Agent', '关卡', '门禁', '交付']) {
    await expect(timeline).toContainText(label);
  }
  await expect(page.locator('#s11 a', { hasText: '回到 Skill Desk' })).toHaveAttribute(
    'href',
    '/ai/skill-desk/'
  );
  await expect(page.locator('#s11 a', { hasText: '查看知识 Harness' })).toHaveAttribute(
    'href',
    '/ai/knowledge-harness/'
  );
});

test('competitive-analysis detail page explains PM-oriented competitive analysis', async ({ page }) => {
  await page.goto('/ai/skill-desk/competitive-analysis/');
  await expect(page.getByRole('heading', { name: 'competitive-analysis Skill：从竞品资料到产品判断' })).toBeVisible();
  await expect(page.locator('main#deck section')).toHaveCount(10);
  await expect(page.locator('#s2')).toContainText('资料汇编');
  await expect(page.locator('#s3')).toContainText('堆功能、堆截图、堆表格');
  await expect(page.locator('#s4')).toContainText('产品负责人视角');
  await expect(page.locator('#s6')).toContainText('模块选择');
  await expect(page.locator('#s7')).toContainText('当前竞品事实必须重新调研');
  await expect(page.locator('#s8')).toContainText('按用户路径和业务链路拆');
  await expect(page.locator('#s9')).toContainText('偷师清单');
  await expect(page.locator('#s9')).toContainText('反向避坑');
  await expect(page.locator('#s9')).toContainText('PRD 可用度');
});

test('competitive-analysis detail page exposes timeline labels and links', async ({ page }) => {
  await page.goto('/ai/skill-desk/competitive-analysis/');
  const timeline = page.locator('nav.timeline');
  await expect(timeline).toBeVisible();
  for (const label of ['入口', '起点', '误区', '视角', '输入', '模块', '事实', '路径', '动作', '判断']) {
    await expect(timeline).toContainText(label);
  }
  await expect(page.locator('#s10 a', { hasText: '回到 Skill Desk' })).toHaveAttribute(
    'href',
    '/ai/skill-desk/'
  );
  await expect(page.locator('#s10 a', { hasText: '查看 PRD Skill' })).toHaveAttribute(
    'href',
    '/ai/skill-desk/prd-skill/'
  );
});

test('requirement-discovery detail page explains demand discovery before solution design', async ({ page }) => {
  await page.goto('/ai/skill-desk/requirement-discovery/');
  await expect(page.getByRole('heading', { name: 'requirement-discovery Skill：在方案设计前先刹车' })).toBeVisible();
  await expect(page.locator('main#deck section')).toHaveCount(10);
  await expect(page.locator('#s2')).toContainText('需求还没想清楚');
  await expect(page.locator('#s2')).toContainText('AI 已经开始设计方案');
  await expect(page.locator('#s3')).toContainText('需求发现，不是方案共创');
  await expect(page.locator('#s4')).toContainText('需求发现');
  await expect(page.locator('#s4')).toContainText('需求澄清');
  await expect(page.locator('#s4')).toContainText('方案设计');
  await expect(page.locator('#s4')).toContainText('PRD 写作');
  await expect(page.locator('#s5')).toContainText('组织叙事');
  await expect(page.locator('#s5')).toContainText('真实痛点');
  await expect(page.locator('#s5')).toContainText('技术包装');
  await expect(page.locator('#s6')).toContainText('风险承担者');
  await expect(page.locator('#s7')).toContainText('证据缺口');
  await expect(page.locator('#s8')).toContainText('V0 收敛');
  await expect(page.locator('#s9')).toContainText('PRD Skill');
  await expect(page.locator('#s9')).toContainText('competitive-analysis');
});

test('requirement-discovery detail page exposes timeline labels and links', async ({ page }) => {
  await page.goto('/ai/skill-desk/requirement-discovery/');
  const timeline = page.locator('nav.timeline');
  await expect(timeline).toBeVisible();
  for (const label of ['入口', '失速', '反思', '档位', '来源', '角色', '证据', 'V0', '交接', '判断']) {
    await expect(timeline).toContainText(label);
  }
  await expect(page.locator('#s10 a', { hasText: '回到 Skill Desk' })).toHaveAttribute(
    'href',
    '/ai/skill-desk/'
  );
  await expect(page.locator('#s10 a', { hasText: '查看 PRD Skill' })).toHaveAttribute(
    'href',
    '/ai/skill-desk/prd-skill/'
  );
  await expect(page.locator('#s10 a', { hasText: '查看竞品分析' })).toHaveAttribute(
    'href',
    '/ai/skill-desk/competitive-analysis/'
  );
});

test('quotation detail page explains customer-readable quote generation', async ({ page }) => {
  await page.goto('/ai/skill-desk/quotation/');
  await expect(page.getByRole('heading', { name: 'quotation Skill：把需求拆成客户看得懂的报价' })).toBeVisible();
  await expect(page.locator('main#deck section')).toHaveCount(10);
  await expect(page.locator('#s2')).toContainText('让 AI 代替报价书制作');
  await expect(page.locator('#s3')).toContainText('研发任务细拆');
  await expect(page.locator('#s4')).toContainText('充电桩报价拆得太细');
  await expect(page.locator('#s4')).toContainText('3-5 个功能');
  await expect(page.locator('#s4')).toContainText('5 个大模块');
  await expect(page.locator('#s5')).toContainText('报价是客户沟通，不是研发排期');
  await expect(page.locator('#s6')).toContainText('需求边界');
  await expect(page.locator('#s7')).toContainText('客户可读模块');
  await expect(page.locator('#s8')).toContainText('产品、UI、前端、后端、测试');
  await expect(page.locator('#s9')).toContainText('先预览确认，再生成报价书');
  await expect(page.locator('#s10')).toContainText('需求共识工具');
});

test('quotation detail page exposes timeline labels and links', async ({ page }) => {
  await page.goto('/ai/skill-desk/quotation/');
  const timeline = page.locator('nav.timeline');
  await expect(timeline).toBeVisible();
  for (const label of ['入口', '愿景', '细拆', '事故', '反思', '边界', '模块', '估工', '飞书', '共识']) {
    await expect(timeline).toContainText(label);
  }
  await expect(page.locator('#s10 a', { hasText: '回到 Skill Desk' })).toHaveAttribute(
    'href',
    '/ai/skill-desk/'
  );
  await expect(page.locator('#s10 a', { hasText: '查看需求头脑风暴' })).toHaveAttribute(
    'href',
    '/ai/skill-desk/requirement-discovery/'
  );
  await expect(page.locator('#s10 a', { hasText: '查看 PRD Skill' })).toHaveAttribute(
    'href',
    '/ai/skill-desk/prd-skill/'
  );
});

test('memory-loader detail page explains the memory control layer', async ({ page }) => {
  await page.goto('/ai/skill-desk/memory-loader/');
  await expect(page.getByRole('heading', { name: 'memory-loader Skill：给 AI 记忆加控制层' })).toBeVisible();
  await expect(page.locator('main#deck section')).toHaveCount(10);
  await expect(page.locator('#s2')).toContainText('所有知识和上下文都塞进 skill');
  await expect(page.locator('#s3')).toContainText('skill 越多，沉淀越勤，上下文越爆炸');
  await expect(page.locator('#s4')).toContainText('隐藏 skill');
  await expect(page.locator('#s5')).toContainText('各 agent 的 skill 目录不能各自为政');
  await expect(page.locator('#s6')).toContainText('同一领域有很多卡');
  await expect(page.locator('#s7')).toContainText('README 和 00 索引不是目录，而是路由器');
  await expect(page.locator('#s8')).toContainText('最小充分上下文包');
  await expect(page.locator('#s8')).toContainText('未加载什么和原因');
  await expect(page.locator('#s9')).toContainText('它在产出前先控制记忆');
  await expect(page.locator('#s10')).toContainText('给 AI 记忆加控制层');
});

test('memory-loader detail page exposes timeline labels and links', async ({ page }) => {
  await page.goto('/ai/skill-desk/memory-loader/');
  const timeline = page.locator('nav.timeline');
  await expect(timeline).toBeVisible();
  for (const label of ['入口', '塞入', '爆炸', '隐藏', '共享', '卡片', '索引', '包', '关系', '控制']) {
    await expect(timeline).toContainText(label);
  }
  await expect(page.locator('#s10 a', { hasText: '回到 Skill Desk' })).toHaveAttribute(
    'href',
    '/ai/skill-desk/'
  );
  await expect(page.locator('#s10 a', { hasText: '查看 Knowledge Harness' })).toHaveAttribute(
    'href',
    '/ai/knowledge-harness/'
  );
  await expect(page.locator('#s10 a', { hasText: '查看周度复盘' })).toHaveAttribute(
    'href',
    '/ai/skill-desk/weekly-retro/'
  );
});

test('Skill Desk and Zhi Shen Ding Nei decks cross-link', async ({ page }) => {
  await page.goto('/ai/skill-desk/reading-dialogue/');
  await expect(page.locator('#s10 a', { hasText: '查看一次真实阅读产出的产品判断' })).toHaveAttribute(
    'href',
    '/ai/zhi-shen-ding-nei/'
  );

  await page.goto('/ai/zhi-shen-ding-nei/');
  await expect(page.locator('#s10 a', { hasText: '查看这套阅读方法如何被做成 skill' })).toHaveAttribute(
    'href',
    '/ai/skill-desk/reading-dialogue/'
  );
});

test('Skill Desk pages have no horizontal overflow on desktop and mobile', async ({ page }) => {
  for (const route of [
    '/ai/skill-desk/',
    '/ai/skill-desk/reading-dialogue/',
    '/ai/skill-desk/weekly-retro/',
    '/ai/skill-desk/prd-skill/',
    '/ai/skill-desk/competitive-analysis/',
    '/ai/skill-desk/requirement-discovery/',
    '/ai/skill-desk/quotation/',
    '/ai/skill-desk/memory-loader/',
  ]) {
    for (const viewport of [
      { width: 1280, height: 800 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto(route);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      expect(overflow).toBe(false);
    }
  }
});
