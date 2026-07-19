import { expect, test } from '@playwright/test';

import { education, jobs } from '../src/data/resume';
import { resumeFacts } from '../src/data/resume/facts';
import { getResumeDocument, resumeVariantIds } from '../src/data/resume/variants';

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

test('AI facts preserve verified scope and all public outputs exclude sensitive or placeholder content', () => {
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

  const publicOutput = JSON.stringify([
    resumeFacts,
    getResumeDocument('master'),
    getResumeDocument('ai'),
    getResumeDocument('b2b'),
  ]);
  expect(publicOutput).not.toMatch(/报价单号|甲方|联系电话|真实客户名称|详细地址|联系地址|报价金额|合同金额/);
  expect(publicOutput).not.toMatch(/1[3-9]\d{9}/);
  expect(publicOutput).not.toMatch(/智慧校园|汽车数据标注/);
  expect(publicOutput).not.toMatch(/https?:\/\/[^"\\\s]*(?:feishu\.cn|larksuite\.com|\/drive\/|\/folder\/)/i);
  expect(publicOutput).not.toMatch(new RegExp(['T' + 'BD', 'TO' + 'DO', '待' + '补', '若' + '干', '等' + '等'].join('|')));

  const urls = publicOutput.match(/https?:\/\/[^"\\\s]+/g) ?? [];
  expect(urls.length).toBeGreaterThan(0);
  for (const url of urls) {
    expect(
      url === 'https://qqx.life' || url === 'https://github.com/666qqx666-jpg',
      `unexpected public URL: ${url}`,
    ).toBe(true);
  }
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

test('canonical facts, compatibility exports, and resolved documents are deeply immutable', () => {
  const master = getResumeDocument('master');
  const ai = getResumeDocument('ai');
  const b2b = getResumeDocument('b2b');
  const frozenValues = [
    resumeFacts,
    resumeFacts.identity,
    resumeFacts.identity.links,
    resumeFacts.identity.links[0],
    resumeFacts.jobs,
    resumeFacts.jobs[0],
    resumeFacts.jobs[0].highlights,
    resumeFacts.education,
    resumeFacts.education[0],
    resumeFacts.certifications,
    resumeFacts.tools,
    resumeFacts.projects,
    resumeFacts.projects[0],
    resumeFacts.projects[0].responsibilities,
    resumeFacts.projects[0].copy,
    resumeFacts.projects[0].copy.master,
    resumeFacts.projects[0].copy.master.actions,
    resumeFacts.projects[0].copy.master.results,
    resumeFacts.projects[0].copy.compact,
    resumeFacts.projects[0].tags,
    jobs,
    education,
    resumeVariantIds,
    master,
    master.capabilities,
    master.projectIds,
    master.projects,
    ai,
    b2b,
    b2b.shortProject,
  ];

  for (const value of frozenValues) {
    expect(Object.isFrozen(value)).toBe(true);
  }

  const originalLeadProjectName = master.leadProject?.name;
  expect(master.leadProject).toBe(resumeFacts.projects[0]);
  expect(master.projects[0]).toBe(resumeFacts.projects[1]);
  expect(jobs).toBe(resumeFacts.jobs);
  expect(education).toBe(resumeFacts.education);

  expect(() => (resumeFacts.tools as unknown as string[]).push('mutated')).toThrow(TypeError);
  expect(() => {
    (master.leadProject as unknown as { name: string }).name = 'mutated';
  }).toThrow(TypeError);
  expect(() => (master.projectIds as unknown as string[]).push('parking')).toThrow(TypeError);
  expect(() => {
    (master as unknown as { summary: string }).summary = 'mutated';
  }).toThrow(TypeError);

  const refreshedMaster = getResumeDocument('master');
  expect(refreshedMaster.leadProject?.name).toBe(originalLeadProjectName);
  expect(refreshedMaster.projectIds).toEqual(['sales', 'permissions', 'analytics', 'membership', 'parking']);
  expect(refreshedMaster.projectIds).toBe(master.projectIds);
  expect(refreshedMaster.capabilities).toBe(master.capabilities);
  expect(resumeFacts.tools).not.toContain('mutated');
});
