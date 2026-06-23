export interface Profile {
  name: string;
  intent: string; // 求职意向（首页 hero）
  summary: string; // 一句话职业概要
  typewriter: string[]; // 打字机轮播短语
  email: string;
  links: { label: string; href: string }[];
  resumePdf: string; // PDF 路径（相对 BASE_URL）
}

export const profile: Profile = {
  name: 'QQ星',
  intent: '求职意向：AI 产品经理',
  summary:
    '计算机科班出身的 B 端产品经理，2 年 CRM / 数据分析 / 系统架构设计经验，正在动手把 AI 落地到产品工作流。',
  typewriter: [
    '计算机背景 · B 端产品 → AI 产品',
    'CRM / 数据分析 / 系统架构',
    '懂技术，动手把 AI 落地',
  ],
  email: '666qqx666@gmail.com',
  links: [
    { label: 'CSDN', href: 'https://blog.csdn.net/weixin_50178621' },
    { label: 'GitHub', href: 'https://github.com/666qqx666-jpg' },
  ],
  resumePdf: 'resume.pdf',
};
