import { todayISO } from './constants';
import type { BoardState, Job, JobFormValues, Priority, Status } from './types';

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const PRIORITY_STYLES: Record<Priority, string> = {
  low: 'bg-chip-slate-bg text-chip-slate-fg ring-chip-slate-ring',
  medium: 'bg-chip-sky-bg text-chip-sky-fg ring-chip-sky-ring',
  high: 'bg-chip-rose-bg text-chip-rose-fg ring-chip-rose-ring',
};

export function defaultFormValues(): JobFormValues {
  return {
    title: '',
    company: '',
    location: '',
    status: 'applied',
    priority: 'medium',
    appliedDate: todayISO(),
    notes: '',
  };
}

export function toFormValues(job: Job): JobFormValues {
  return {
    title: job.title,
    company: job.company,
    location: job.location,
    status: job.status,
    priority: job.priority,
    appliedDate: job.appliedDate,
    notes: job.notes ?? '',
  };
}

export function toJob(values: JobFormValues, id: string): Job {
  const notes = values.notes.trim();
  return {
    id,
    title: values.title.trim(),
    company: values.company.trim(),
    location: values.location.trim(),
    status: values.status,
    priority: values.priority,
    appliedDate: values.appliedDate,
    ...(notes.length > 0 ? { notes } : {}),
  };
}

export function matchQuery(query: string): (job: Job) => boolean {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) return () => true;
  return (job) =>
    [job.title, job.company, job.location].some((field) =>
      field.toLowerCase().includes(needle),
    );
}

export function formatRelativeDate(isoDate: string): string {
  const days = daysSince(isoDate);
  if (days === null) return isoDate;
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  const parsed = new Date(`${isoDate}T00:00:00`);
  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export function daysSince(isoDate: string): number | null {
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return Math.floor((Date.now() - parsed.getTime()) / 86_400_000);
}

const FOLLOW_UP_AFTER_DAYS = 7;

/** Days since applying, when a polite nudge is due; null when none is needed. */
export function followUpNudge(job: Job): number | null {
  if (job.status !== 'applied') return null;
  const days = daysSince(job.appliedDate);
  if (days === null || days < FOLLOW_UP_AFTER_DAYS) return null;
  return days;
}

export function initials(label: string): string {
  const words = label
    .split(/[\s-]+/)
    .filter((word) => word.length > 0)
    .slice(0, 2);
  if (words.length === 0) return '?';
  return words.map((word) => word[0]?.toUpperCase() ?? '').join('');
}

const AVATAR_GRADIENTS: readonly string[] = [
  'from-sky-500 to-indigo-500',
  'from-violet-500 to-fuchsia-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
  'from-cyan-500 to-blue-500',
];

export function avatarGradient(label: string): string {
  let hash = 0;
  for (let i = 0; i < label.length; i += 1) {
    hash = (hash * 31 + label.charCodeAt(i)) >>> 0;
  }
  const index = hash % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index] ?? AVATAR_GRADIENTS[0] ?? '';
}

export function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return 'Burning the midnight oil';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export interface BoardStats {
  total: number;
  byStatus: Record<Status, number>;
  inPlay: number;
  heardBack: number;
  responseRate: number;
  addedThisWeek: number;
}

export function boardStats(board: BoardState): BoardStats {
  const byStatus: Record<Status, number> = {
    applied: 0,
    interviewing: 0,
    offer: 0,
    rejected: 0,
  };
  let addedThisWeek = 0;

  for (const job of Object.values(board.jobs)) {
    byStatus[job.status] += 1;
    const days = daysSince(job.appliedDate);
    if (days !== null && days >= 0 && days < 7) addedThisWeek += 1;
  }

  const total = Object.keys(board.jobs).length;
  const heardBack = byStatus.interviewing + byStatus.offer + byStatus.rejected;
  const inPlay = total - byStatus.rejected;

  return {
    total,
    byStatus,
    inPlay,
    heardBack,
    responseRate: total === 0 ? 0 : heardBack / total,
    addedThisWeek,
  };
}

export function statsCheer(stats: BoardStats): string {
  if (stats.total === 0) return 'Add your first application to get started.';
  if (stats.byStatus.offer > 0) {
    return `${stats.byStatus.offer} offer${stats.byStatus.offer > 1 ? 's' : ''} in hand, finish strong.`;
  }
  if (stats.byStatus.interviewing >= 2) {
    return `Keep the momentum, ${stats.byStatus.interviewing} interviews in play.`;
  }
  if (stats.addedThisWeek > 0) {
    return `${stats.addedThisWeek} added this week, steady wins the search.`;
  }
  if (stats.inPlay === 0) {
    return 'Fresh start, line up your next application.';
  }
  return 'Every application counts. Keep going.';
}
