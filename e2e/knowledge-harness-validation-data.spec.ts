import { test, expect } from '@playwright/test';
import { v2ValidationRuns, v15ValidationRuns } from '../src/data/knowledgeHarnessValidation';
test('four frozen validation runs keep exact public facts', () => {
  expect(v2ValidationRuns).toEqual([expect.objectContaining({id:'v2-1',baselineScore:'16/20',candidateScore:'8/20',state:'fail'}),expect.objectContaining({id:'v2-2',baselineScore:'18/20',candidateScore:'16/20',state:'no-cutover'})]);
  expect(v15ValidationRuns).toEqual([expect.objectContaining({id:'v15-1',candidateScore:'11/20',failures:9,state:'fail'}),expect.objectContaining({id:'v15-2',candidateScore:'20/20',failures:0,state:'incomplete'})]);
  expect(JSON.stringify([...v2ValidationRuns,...v15ValidationRuns])).not.toContain('/Users/');
});
