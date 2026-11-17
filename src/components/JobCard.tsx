import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { ArrowUpRight, CalendarDays, Clock, MapPin } from 'lucide-react';
import { stageVar } from '../constants';
import { dragGuard } from '../dragGuard';
import type { Job } from '../types';
import {
  PRIORITY_LABELS,
  PRIORITY_STYLES,
  followUpNudge,
  formatRelativeDate,
} from '../utils';
import { Avatar } from './Avatar';

interface JobCardShellProps {
  job: Job;
  dragging?: boolean;
  animateEntrance?: boolean;
  onClick?: () => void;
}

export function JobCardShell({
  job,
  dragging = false,
  animateEntrance = true,
  onClick,
}: JobCardShellProps) {
  const nudge = followUpNudge(job);

  return (
    <motion.article
      onClick={onClick}
      initial={
        animateEntrance
          ? { opacity: 0, y: 10, scale: 0.98 }
          : dragging
            ? { opacity: 0.9 }
            : false
      }
      animate={{ opacity: 1, y: 0, scale: 1, rotate: dragging ? 2 : 0 }}
      whileHover={dragging || onClick === undefined ? undefined : { y: -2 }}
      transition={{ type: 'spring', stiffness: 450, damping: 34, mass: 0.7 }}
      className={[
        'group relative cursor-grab select-none rounded-xl border bg-card p-3.5 transition-colors active:cursor-grabbing',
        dragging
          ? 'border-sky-500/60 bg-card-hover shadow-2xl shadow-sky-950/30 ring-2 ring-sky-500/40'
          : 'border-line hover:border-line-strong hover:bg-card-hover',
      ].join(' ')}
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-[3px] rounded-l-xl"
        style={{
          backgroundColor: `color-mix(in srgb, ${stageVar(job.status)} 70%, transparent)`,
        }}
      />
      <div className="flex items-start gap-2.5">
        <Avatar label={job.company} size="sm" ring />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold leading-snug text-ink">
            {job.title}
          </h3>
          <p className="mt-0.5 truncate text-xs text-muted">{job.company}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset ${PRIORITY_STYLES[job.priority]}`}
        >
          {PRIORITY_LABELS[job.priority]}
        </span>
      </div>

      {job.location.length > 0 ? (
        <p className="mt-2 flex items-center gap-1 truncate text-xs text-faint">
          <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
          {job.location}
        </p>
      ) : null}

      {nudge !== null ? (
        <p className="mt-2 inline-flex items-center gap-1 rounded-md bg-chip-amber-bg px-1.5 py-1 text-[10px] font-semibold text-chip-amber-fg ring-1 ring-inset ring-chip-amber-ring">
          <Clock className="h-3 w-3" aria-hidden="true" />
          Follow up, {nudge}d silent
        </p>
      ) : null}

      {job.notes !== undefined && job.notes.length > 0 ? (
        <p className="mt-2 line-clamp-2 rounded-md bg-inset px-2 py-1.5 text-xs leading-relaxed text-muted">
          {job.notes}
        </p>
      ) : null}

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-line-soft pt-2.5">
        <span className="inline-flex items-center gap-1 text-[11px] text-faint">
          <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
          {formatRelativeDate(job.appliedDate)}
        </span>
        <span className="inline-flex items-center gap-0.5 text-[11px] text-accent-text/80 opacity-0 transition group-hover:opacity-100">
          Open
          <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
        </span>
      </div>
    </motion.article>
  );
}

interface JobCardProps {
  job: Job;
  disabled: boolean;
  onOpen: (job: Job) => void;
}

export function JobCard({ job, disabled, onOpen }: JobCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClick = () => {
    if (dragGuard.active || isDragging) return;
    onOpen(job);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`touch-none ${isDragging ? 'opacity-30' : 'opacity-100'}`}
      {...attributes}
      {...listeners}
    >
      <JobCardShell job={job} onClick={handleClick} />
    </div>
  );
}
