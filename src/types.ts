export type Status = 'applied' | 'interviewing' | 'offer' | 'rejected';

export type Priority = 'low' | 'medium' | 'high';

export type LoadStatus = 'loading' | 'ready';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  status: Status;
  appliedDate: string;
  priority: Priority;
  notes?: string;
}

export interface Column {
  id: Status;
  title: string;
}

export interface BoardState {
  jobs: Record<string, Job>;
  columns: Record<Status, string[]>;
}

export interface BoardStore {
  present: BoardState;
  past: BoardState[];
}

export interface JobFormValues {
  title: string;
  company: string;
  location: string;
  status: Status;
  priority: Priority;
  appliedDate: string;
  notes: string;
}

export interface DragGuard {
  active: boolean;
}

export interface UndoToastData {
  seq: number;
  jobTitle: string;
  toStatus: Status;
}
