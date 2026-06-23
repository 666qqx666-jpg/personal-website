export interface Job {
  company: string;
  title: string;
  period: string; // 例：2022.06 – 至今
  highlights: string[]; // 量化成果 + 个人贡献
}
export interface Education {
  school: string;
  major: string;
  period: string;
}

export const jobs: Job[] = [
  {
    company: '浙江影能科技有限公司',
    title: '产品经理',
    period: '2022.06 – 至今',
    highlights: [
      '主导综合商场 CRM 系统整体权限框架设计（用户权限 / 审批流 / 小程序授权 / 开放平台接口架构）',
      '负责数据分析模块：基于阿里云大数据数仓做会员、销售、积分趋势分析，设计门店销售线索智能匹配算法',
      '负责会员运营（权益配置 / 异常会员预警 / 短信群发）与智慧停车系统（缴费流程 / 停车中台架构）',
    ],
  },
  {
    company: '浙江达摩网络科技有限公司',
    title: 'Java 实习生',
    period: '2021.07 – 2021.10',
    highlights: ['基于 SpringMVC 三层架构开发，参与「好办 3.0」版本迭代'],
  },
];

export const education: Education[] = [
  { school: '中国计量大学', major: '计算机科学与技术 · 本科', period: '2018.08 – 2022.06' },
];
