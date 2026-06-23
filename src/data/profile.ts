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
  name: '你的名字',
  intent: '求职意向：AI 产品经理（AI 应用 / Agent 方向）',
  summary: '传统互联网 PM 转型 AI 产品，方法论扎实 + 已动手把 AI 落地到产品工作流。',
  typewriter: ['传统 PM → AI 产品 · 动手派', '方法论 + AI 落地实战', '用作品和思路说话'],
  email: 'you@example.com',
  links: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/your-id' },
    { label: '脉脉', href: 'https://maimai.cn/' },
    { label: 'GitHub', href: 'https://github.com/your-id' },
  ],
  resumePdf: 'resume.pdf',
};
