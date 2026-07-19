export type { Job, Education } from './resume/types';
export { resumeFacts } from './resume/facts';

import { resumeFacts } from './resume/facts';

export const jobs = resumeFacts.jobs;
export const education = resumeFacts.education;
