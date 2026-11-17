import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { FileText, HeartHandshake, Trophy, Users, XCircle } from 'lucide-react';
import type { Status } from '../types';
import type { BoardStats } from '../utils';
import { greeting, statsCheer } from '../utils';

interface ChipConfig {
  status: Status;
  label: string;
  icon: LucideIcon;
  className: string;
}

const CHIPS: readonly ChipConfig[] = [
  { status: 'applied', label: 'applied', icon: FileText, className: 'text-chip-sky-fg bg-chip-sky-bg ring-chip-sky-ring' },
  { status: 'interviewing', label: 'interviewing', icon: Users, className: 'text-chip-amber-fg bg-chip-amber-bg ring-chip-amber-ring' },
  { status: 'offer', label: 'offer', icon: Trophy, className: 'text-chip-emerald-fg bg-chip-emerald-bg ring-chip-emerald-ring' },
  { status: 'rejected', label: 'rejected', icon: XCircle, className: 'text-chip-rose-fg bg-chip-rose-bg ring-chip-rose-ring' },
];

interface BoardStatsBarProps {
  stats: BoardStats;
}

export function BoardStatsBar({ stats }: BoardStatsBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-6 pb-1 pt-4">
      <motion.p
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-xs text-muted"
      >
        <span className="font-semibold text-ink">{greeting()}.</span>{' '}
        {statsCheer(stats)}
      </motion.p>

      <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
        {CHIPS.map((chip, chipIndex) => {
          const Icon = chip.icon;
          const count = stats.byStatus[chip.status];
          return (
            <motion.span
              key={chip.status}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + chipIndex * 0.05 }}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset ${chip.className} ${
                count === 0 ? 'opacity-50' : ''
              }`}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="tabular-nums">{count}</span>
              {chip.label}
            </motion.span>
          );
        })}

        <motion.span
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          title="Share of applications that got any response"
          className="inline-flex items-center gap-1.5 rounded-full bg-surface-strong px-2.5 py-1 text-[11px] font-medium text-ink ring-1 ring-inset ring-line"
        >
          <HeartHandshake className="h-3.5 w-3.5 text-chip-violet-fg" aria-hidden="true" />
          <span className="tabular-nums">{Math.round(stats.responseRate * 100)}%</span>
          heard back
        </motion.span>
      </div>
    </div>
  );
}
