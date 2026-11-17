import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useMemo, useState } from 'react';
import {
  COLUMN_PREFIX,
  COLUMNS,
  STATUS_ORDER,
  isColumnDroppableId,
} from '../constants';
import { beginDrag, endDrag } from '../dragGuard';
import type { BoardState, Job, Status } from '../types';
import { matchQuery } from '../utils';
import { Column } from './Column';
import { JobCardShell } from './JobCard';

interface BoardProps {
  board: BoardState;
  query: string;
  onMove: (jobId: string, toStatus: Status, toIndex: number) => void;
  onOpenJob: (job: Job) => void;
  onAddJob: (status: Status) => void;
}

interface OverTarget {
  status: Status;
  index: number;
}

function resolveOver(overId: string, board: BoardState): OverTarget | null {
  if (isColumnDroppableId(overId)) {
    const status = overId.slice(COLUMN_PREFIX.length);
    const isStatus = STATUS_ORDER.some((candidate) => candidate === status);
    if (!isStatus) return null;
    const valid = status as Status;
    return { status: valid, index: board.columns[valid].length };
  }

  const job = board.jobs[overId];
  if (job === undefined) return null;
  const index = board.columns[job.status].indexOf(job.id);
  if (index === -1) return null;
  return { status: job.status, index };
}

export function Board({ board, query, onMove, onOpenJob, onAddJob }: BoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overStatus, setOverStatus] = useState<Status | null>(null);

  const filtering = query.trim().length > 0;
  const matches = useMemo(() => matchQuery(query), [query]);

  const visibleByColumn = useMemo(() => {
    const result = {} as Record<Status, Job[]>;
    for (const status of STATUS_ORDER) {
      const jobs = board.columns[status]
        .map((id) => board.jobs[id])
        .filter((job): job is Job => job !== undefined);
      result[status] = filtering ? jobs.filter(matches) : jobs;
    }
    return result;
  }, [board, filtering, matches]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const activeJob = activeId !== null ? (board.jobs[activeId] ?? null) : null;

  const handleDragStart = (event: DragStartEvent) => {
    if (filtering) return;
    beginDrag();
    setActiveId(String(event.active.id));
  };

  const handleDragOver = (event: DragOverEvent) => {
    if (filtering) return;
    const over = event.over;
    if (over === null) {
      setOverStatus(null);
      return;
    }
    const target = resolveOver(String(over.id), board);
    setOverStatus(target?.status ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverStatus(null);

    if (!filtering && over !== null) {
      const target = resolveOver(String(over.id), board);
      if (target !== null) {
        onMove(String(active.id), target.status, target.index);
      }
    }

    endDrag();
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setOverStatus(null);
    endDrag();
  };

  const totalJobs = Object.keys(board.jobs).length;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-4 overflow-x-auto px-6 pb-8 pt-4">
        {COLUMNS.map((column, columnIndex) => (
          <Column
            key={column.id}
            column={column}
            index={columnIndex}
            jobs={visibleByColumn[column.id]}
            totalCount={board.columns[column.id].length}
            filtering={filtering}
            highlighted={overStatus === column.id}
            disabled={filtering}
            onOpenJob={onOpenJob}
            onAddJob={onAddJob}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 180, easing: 'ease-out' }}>
        {activeJob !== null ? (
          <JobCardShell job={activeJob} dragging animateEntrance={false} />
        ) : null}
      </DragOverlay>

      <p className="sr-only" aria-live="polite">
        {filtering
          ? `${totalJobs} jobs total, showing filtered results. Clear search to drag cards.`
          : `${totalJobs} jobs on the board.`}
      </p>
    </DndContext>
  );
}
