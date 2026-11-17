import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { columnDroppableId, stageVar } from '../constants';
import type { Column as ColumnModel, Job, Status } from '../types';
import { JobCard } from './JobCard';

interface ColumnProps {
  column: ColumnModel;
  index: number;
  jobs: Job[];
  totalCount: number;
  filtering: boolean;
  highlighted: boolean;
  disabled: boolean;
  onOpenJob: (job: Job) => void;
  onAddJob: (status: Status) => void;
}

export function Column({
  column,
  index,
  jobs,
  totalCount,
  filtering,
  highlighted,
  disabled,
  onOpenJob,
  onAddJob,
}: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: columnDroppableId(column.id),
    disabled,
  });

  const showDropHint = isOver && !disabled;
  const accent = stageVar(column.id);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0, scale: highlighted && !disabled ? 1.01 : 1 }}
      transition={{
        type: 'spring',
        stiffness: 320,
        damping: 30,
        delay: Math.min(index * 0.07, 0.3),
      }}
      className={`flex w-72 shrink-0 flex-col overflow-hidden rounded-2xl border bg-surface xl:w-80 ${
        highlighted && !disabled ? 'border-line-strong bg-surface-strong' : 'border-line-soft'
      }`}
    >
      <header
        className="flex items-center gap-2 px-3.5 pb-2 pt-3.5"
        style={{ backgroundColor: `color-mix(in srgb, ${accent} 10%, transparent)` }}
      >
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: accent }}
        />
        <h2 className="text-sm font-semibold tracking-wide text-ink">
          {column.title}
        </h2>
        <span
          className={`rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums ${
            filtering && jobs.length !== totalCount
              ? 'bg-chip-sky-bg text-chip-sky-fg'
              : ''
          }`}
          style={
            filtering && jobs.length !== totalCount
              ? undefined
              : {
                  color: accent,
                  backgroundColor: `color-mix(in srgb, ${accent} 16%, transparent)`,
                }
          }
          aria-label={
            filtering
              ? `${jobs.length} of ${totalCount} jobs shown`
              : `${totalCount} jobs`
          }
        >
          {filtering ? `${jobs.length}/${totalCount}` : totalCount}
        </span>
        <button
          type="button"
          onClick={() => onAddJob(column.id)}
          aria-label={`Add job to ${column.title}`}
          className="ml-auto rounded-md p-1 text-muted transition-colors hover:bg-btn-ghost hover:text-ink"
        >
          <Plus className="h-4 w-4" />
        </button>
      </header>

      <div
        ref={setNodeRef}
        className={`min-h-32 flex-1 space-y-2.5 px-3 pb-3 pt-2 transition-colors ${
          showDropHint ? 'bg-sky-500/10 ring-1 ring-inset ring-sky-500/50' : ''
        }`}
      >
        <SortableContext items={jobs.map((job) => job.id)} strategy={verticalListSortingStrategy}>
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} disabled={disabled} onOpen={onOpenJob} />
          ))}
        </SortableContext>

        {jobs.length === 0 ? (
          <div
            className={`rounded-xl border border-dashed border-line px-3 py-6 text-center text-xs leading-relaxed ${
              filtering ? 'text-faint' : 'text-ghost'
            }`}
          >
            {filtering ? (
              <>
                No matches here.
                <br />
                Try another keyword.
              </>
            ) : (
              <>
                Nothing here yet.
                <br />
                Drag a card in or hit +.
              </>
            )}
          </div>
        ) : null}
      </div>
    </motion.section>
  );
}
