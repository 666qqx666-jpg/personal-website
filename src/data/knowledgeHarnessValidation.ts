export type ValidationState = 'fail' | 'no-cutover' | 'incomplete';
export type ValidationMetric = { readonly label: string; readonly value: string; };
export type ValidationRun = {
  readonly id: 'v2-1' | 'v2-2' | 'v15-1' | 'v15-2'; readonly version: 'V2' | 'V1.5'; readonly round: 1 | 2; readonly label: string; readonly reportTitle: string; readonly sample: string;
  readonly baselineLabel?: 'V1'; readonly baselineScore?: string; readonly candidateScore: string; readonly failures?: number; readonly metrics: readonly ValidationMetric[]; readonly state: ValidationState; readonly decision: string;
  readonly sourceRef: 'v2-offline-20260719' | 'v2-offline-20260726' | 'v15-retrieval-contract-v1' | 'v15-retrieval-coverage-repair-v1';
};
export const v2ValidationRuns: readonly ValidationRun[] = [
  { id:'v2-1',version:'V2',round:1,label:'第一次验证',reportTitle:'V2 影子实验评测报告（轮次 1）',sample:'20 组同题',baselineLabel:'V1',baselineScore:'16/20',candidateScore:'8/20',metrics:[{label:'上下文精度',value:'31.9%'},{label:'必需角色覆盖',value:'1/20'}],state:'fail',decision:'扩展方案明显退化，返回检索与覆盖返修。',sourceRef:'v2-offline-20260719' },
  { id:'v2-2',version:'V2',round:2,label:'第二次验证',reportTitle:'V2 影子实验评测报告（轮次 2）',sample:'20 组同题',baselineLabel:'V1',baselineScore:'18/20',candidateScore:'16/20',metrics:[{label:'上下文相关性',value:'87.2%'},{label:'必需角色覆盖',value:'19/20'},{label:'完成输出回归',value:'6 个'}],state:'no-cutover',decision:'差距缩小，但 activation=false，V2 保持 Shadow。',sourceRef:'v2-offline-20260726' },
] as const;
export const v15ValidationRuns: readonly ValidationRun[] = [
  { id:'v15-1',version:'V1.5',round:1,label:'第一次检索验证',reportTitle:'V1.5 冻结检索契约（轮次 1）',sample:'20 题',candidateScore:'11/20',failures:9,metrics:[{label:'契约失败',value:'9 题'},{label:'Gate',value:'fail'}],state:'fail',decision:'候选和覆盖判断未满足冻结 Gold，返回修复。',sourceRef:'v15-retrieval-contract-v1' },
  { id:'v15-2',version:'V1.5',round:2,label:'第二次检索验证',reportTitle:'V1.5 覆盖返修验证（轮次 2）',sample:'20 题',candidateScore:'20/20',failures:0,metrics:[{label:'契约失败',value:'0 题'},{label:'Gate',value:'incomplete'}],state:'incomplete',decision:'纯检索契约通过；模型答案与人工盲评尚未形成最终结论。',sourceRef:'v15-retrieval-coverage-repair-v1' },
] as const;
