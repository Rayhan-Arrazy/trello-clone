import { STATUS_ORDER } from './constants';
import type { BoardState, Job, Priority, Status } from './types';

const PRIORITIES: readonly Priority[] = ['low', 'medium', 'high'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isStatus(value: unknown): value is Status {
  const allowed: readonly unknown[] = STATUS_ORDER;
  return allowed.includes(value);
}

function isPriority(value: unknown): value is Priority {
  const allowed: readonly unknown[] = PRIORITIES;
  return allowed.includes(value);
}

function isJob(value: unknown): value is Job {
  if (!isRecord(value)) return false;
  return (
    isString(value.id) &&
    isString(value.title) &&
    isString(value.company) &&
    isString(value.location) &&
    isStatus(value.status) &&
    isString(value.appliedDate) &&
    isPriority(value.priority) &&
    (value.notes === undefined || isString(value.notes))
  );
}

export function isBoardState(value: unknown): value is BoardState {
  if (!isRecord(value)) return false;
  if (!isRecord(value.jobs)) return false;
  if (!Object.values(value.jobs).every(isJob)) return false;
  if (!isRecord(value.columns)) return false;

  const jobs = value.jobs;
  for (const status of STATUS_ORDER) {
    const ids: unknown = value.columns[status];
    if (!Array.isArray(ids)) return false;
    if (!ids.every(isString)) return false;
    if (!ids.every((id) => Object.hasOwn(jobs, id))) return false;
  }

  return true;
}

export function loadStoredBoard(key: string, fallback: BoardState): BoardState {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    return isBoardState(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}
