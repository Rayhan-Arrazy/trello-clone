import type { BoardState, BoardStore, Job, Status } from './types';

export const MAX_HISTORY = 10;

export type BoardAction =
  | { type: 'addJob'; job: Job }
  | { type: 'updateJob'; job: Job }
  | { type: 'deleteJob'; jobId: string }
  | { type: 'moveJob'; jobId: string; toStatus: Status; toIndex: number }
  | { type: 'undo' };

export interface MoveResult {
  state: BoardState;
  changed: boolean;
}

export function createBoardStore(state: BoardState): BoardStore {
  return { present: state, past: [] };
}

function moveWithin(list: string[], from: number, to: number): string[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  if (item === undefined) return list;
  next.splice(to, 0, item);
  return next;
}

export function moveJob(
  state: BoardState,
  jobId: string,
  toStatus: Status,
  toIndex: number,
): MoveResult {
  const job = state.jobs[jobId];
  if (job === undefined) return { state, changed: false };

  const fromStatus = job.status;
  const fromColumn = state.columns[fromStatus];
  const fromIndex = fromColumn.indexOf(jobId);
  if (fromIndex === -1) return { state, changed: false };

  const targetColumn = state.columns[toStatus];
  const maxIndex =
    fromStatus === toStatus ? fromColumn.length - 1 : targetColumn.length;
  const clamped = Math.max(0, Math.min(toIndex, maxIndex));

  if (fromStatus === toStatus) {
    if (clamped === fromIndex) return { state, changed: false };
    const columns: Record<Status, string[]> = { ...state.columns };
    columns[fromStatus] = moveWithin(fromColumn, fromIndex, clamped);
    return { state: { ...state, columns }, changed: true };
  }

  const source = fromColumn.filter((id) => id !== jobId);
  const target = [...targetColumn];
  target.splice(clamped, 0, jobId);

  const columns: Record<Status, string[]> = { ...state.columns };
  columns[fromStatus] = source;
  columns[toStatus] = target;

  const jobs: Record<string, Job> = { ...state.jobs };
  jobs[jobId] = { ...job, status: toStatus };

  return { state: { jobs, columns }, changed: true };
}

function pushHistory(store: BoardStore, next: BoardState): BoardStore {
  return {
    present: next,
    past: [...store.past, store.present].slice(-MAX_HISTORY),
  };
}

export function boardReducer(store: BoardStore, action: BoardAction): BoardStore {
  switch (action.type) {
    case 'addJob': {
      const { job } = action;
      const jobs: Record<string, Job> = { ...store.present.jobs };
      if (Object.hasOwn(jobs, job.id)) return store;
      jobs[job.id] = job;

      const columns: Record<Status, string[]> = { ...store.present.columns };
      columns[job.status] = [job.id, ...columns[job.status]];

      return { present: { jobs, columns }, past: [] };
    }
    case 'updateJob': {
      const { job } = action;
      const previous = store.present.jobs[job.id];
      if (previous === undefined) return store;

      const jobs: Record<string, Job> = { ...store.present.jobs };
      jobs[job.id] = job;

      if (previous.status === job.status) {
        return { present: { ...store.present, jobs }, past: [] };
      }

      const columns: Record<Status, string[]> = { ...store.present.columns };
      columns[previous.status] = columns[previous.status].filter(
        (id) => id !== job.id,
      );
      columns[job.status] = [job.id, ...columns[job.status]];

      return { present: { jobs, columns }, past: [] };
    }
    case 'deleteJob': {
      const { jobId } = action;
      const job = store.present.jobs[jobId];
      if (job === undefined) return store;

      const jobs: Record<string, Job> = { ...store.present.jobs };
      delete jobs[jobId];

      const columns: Record<Status, string[]> = { ...store.present.columns };
      columns[job.status] = columns[job.status].filter((id) => id !== jobId);

      return { present: { jobs, columns }, past: [] };
    }
    case 'moveJob': {
      const { jobId, toStatus, toIndex } = action;
      const { state, changed } = moveJob(store.present, jobId, toStatus, toIndex);
      if (!changed) return store;
      return pushHistory(store, state);
    }
    case 'undo': {
      const previous = store.past[store.past.length - 1];
      if (previous === undefined) return store;
      return { present: previous, past: store.past.slice(0, -1) };
    }
    default:
      return store;
  }
}
