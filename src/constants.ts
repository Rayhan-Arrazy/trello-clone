import type { BoardState, Column, Job, Status } from './types';

export const STORAGE_KEY = 'jobtrack.board.v1';

export const COLUMN_PREFIX = 'column:';

export const JOB_PREFIX = 'job:';

export const STATUS_ORDER: readonly Status[] = [
  'applied',
  'interviewing',
  'offer',
  'rejected',
];

export const COLUMNS: readonly Column[] = [
  { id: 'applied', title: 'Applied' },
  { id: 'interviewing', title: 'Interviewing' },
  { id: 'offer', title: 'Offer' },
  { id: 'rejected', title: 'Rejected' },
];

const SEED_JOBS: readonly Job[] = [
  {
    id: 'job:seed-1',
    title: 'Frontend Engineer',
    company: 'Stripe',
    location: 'Remote',
    status: 'interviewing',
    appliedDate: '2026-10-12',
    priority: 'high',
    notes: 'Second round with the platform team scheduled.',
  },
  {
    id: 'job:seed-2',
    title: 'React Developer',
    company: 'Shopify',
    location: 'Toronto, ON',
    status: 'applied',
    appliedDate: '2026-10-28',
    priority: 'medium',
  },
  {
    id: 'job:seed-3',
    title: 'UI Engineer',
    company: 'Linear',
    location: 'Remote',
    status: 'applied',
    appliedDate: '2026-11-01',
    priority: 'high',
    notes: 'Referral from Alex, follow up next week.',
  },
  {
    id: 'job:seed-4',
    title: 'Full-Stack Developer',
    company: 'Vercel',
    location: 'Remote',
    status: 'interviewing',
    appliedDate: '2026-10-19',
    priority: 'medium',
  },
  {
    id: 'job:seed-5',
    title: 'Product Engineer',
    company: 'Notion',
    location: 'New York, NY',
    status: 'offer',
    appliedDate: '2026-09-30',
    priority: 'high',
    notes: 'Offer expires Friday, negotiate equity.',
  },
  {
    id: 'job:seed-6',
    title: 'Junior Web Developer',
    company: 'Acme Studio',
    location: 'Austin, TX',
    status: 'rejected',
    appliedDate: '2026-09-15',
    priority: 'low',
  },
  {
    id: 'job:seed-7',
    title: 'Design Engineer',
    company: 'Figma',
    location: 'San Francisco, CA',
    status: 'applied',
    appliedDate: '2026-11-03',
    priority: 'medium',
  },
];

function groupSeedJobs(): BoardState {
  const jobs: Record<string, Job> = {};
  const columns: Record<Status, string[]> = {
    applied: [],
    interviewing: [],
    offer: [],
    rejected: [],
  };

  for (const job of SEED_JOBS) {
    jobs[job.id] = job;
    columns[job.status].push(job.id);
  }

  return { jobs, columns };
}

export const SEED_BOARD: BoardState = groupSeedJobs();

export function createJobId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${JOB_PREFIX}${crypto.randomUUID()}`;
  }
  return `${JOB_PREFIX}${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function columnDroppableId(status: Status): string {
  return `${COLUMN_PREFIX}${status}`;
}

export function isColumnDroppableId(id: string): boolean {
  return id.startsWith(COLUMN_PREFIX);
}

export function columnTitle(status: Status): string {
  return COLUMNS.find((column) => column.id === status)?.title ?? status;
}

/** Theme-aware stage accent (see --stage-* vars in index.css). */
export function stageVar(status: Status): string {
  return `var(--stage-${status})`;
}
