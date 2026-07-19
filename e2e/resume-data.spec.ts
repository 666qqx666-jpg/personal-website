import { expect, test } from '@playwright/test';

import { resumeFacts } from '../src/data/resume/facts';
import { getResumeDocument } from '../src/data/resume/variants';

const projectPeriods = {
  permissions: '2022.06–2023.12｜分两期建设',
  membership: '2022.09–2024.07',
  analytics: '2022.12–2024.05',
  parking: '2024.07–2026.03',
  sales: '2025.04–至今',
  ai: '2026.04–至今',
};

test('canonical facts contain the exact six projects and periods', () => {
  expect(resumeFacts.projects).toHaveLength(6);
  expect(Object.fromEntries(resumeFacts.projects.map(({ id, period }) => [id, period]))).toEqual(projectPeriods);
});

test('every project has bounded master and compact background copy', () => {
  for (const project of resumeFacts.projects) {
    expect(project.copy.master.background.length, `${project.id} master background`).toBeGreaterThanOrEqual(80);
    expect(project.copy.master.background.length, `${project.id} master background`).toBeLessThanOrEqual(120);
    expect(project.copy.compact.background.length, `${project.id} compact background`).toBeGreaterThanOrEqual(30);
    expect(project.copy.compact.background.length, `${project.id} compact background`).toBeLessThanOrEqual(50);
  }
});

test('AI facts preserve verified scope and all public facts exclude sensitive or placeholder content', () => {
  const aiProject = resumeFacts.projects.find(({ id }) => id === 'ai');
  expect(aiProject).toBeDefined();

  const aiJson = JSON.stringify(aiProject);
  for (const claim of [
    '8 类核心 Agent 工作流',
    '6 类已稳定',
    '9 份真实业务 PRD',
    '1 份正式业务竞品分析',
    '3 类定制开发报价方案',
    '25 项关键决策',
    '6 张业务蓝图',
    '尚未推广给团队',
  ]) {
    expect(aiJson).toContain(claim);
  }
  expect(aiJson).not.toMatch(/提升效率|团队提效|团队推广/);

  const publicFacts = JSON.stringify(resumeFacts);
  expect(publicFacts).not.toMatch(/报价单号|甲方：|联系电话|真实客户名称/);
  expect(publicFacts).not.toMatch(/1[3-9]\d{9}/);
  expect(publicFacts).not.toMatch(/智慧校园|汽车数据标注/);
  expect(publicFacts).not.toMatch(new RegExp(['T' + 'BD', 'TO' + 'DO', '待' + '补', '若' + '干', '等' + '等'].join('|')));
});

test('resume variants resolve project facts without duplicating them', () => {
  const master = getResumeDocument('master');
  expect(master.mode).toBe('full');
  expect(master.leadProject?.id).toBe('ai');
  expect([master.leadProject?.id, ...master.projects.map(({ id }) => id)]).toEqual([
    'ai',
    'sales',
    'permissions',
    'analytics',
    'membership',
    'parking',
  ]);

  const ai = getResumeDocument('ai');
  expect(ai.mode).toBe('compact');
  expect(ai.leadProject?.id).toBe('ai');
  expect([ai.leadProject?.id, ...ai.projects.map(({ id }) => id)]).toEqual(['ai', 'sales', 'permissions']);

  const b2b = getResumeDocument('b2b');
  expect(b2b.mode).toBe('compact');
  expect(b2b.projects.map(({ id }) => id)).toEqual(['sales', 'permissions', 'analytics']);
  expect(b2b.shortProject?.id).toBe('ai');
});
