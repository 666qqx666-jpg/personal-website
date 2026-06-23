export interface Job {
  company: string;
  title: string;
  period: string; // 例：2021.03 – 2024.06
  highlights: string[]; // 量化成果 + 个人贡献
}
export interface Education {
  school: string;
  major: string;
  period: string;
}

export const jobs: Job[] = [
  {
    company: '某互联网公司',
    title: '高级产品经理',
    period: '2021.03 – 2024.06',
    highlights: [
      '主导 XX 产品从 0 到 1，上线 6 个月 DAU 达 XX 万',
      '负责 YY 模块改版，关键转化率提升 XX%',
    ],
  },
  {
    company: '另一家公司',
    title: '产品经理',
    period: '2018.07 – 2021.02',
    highlights: ['负责 ZZ 方向，主导 N 个版本迭代'],
  },
];

export const education: Education[] = [
  { school: '某大学', major: '某专业 · 本科', period: '2014 – 2018' },
];
