import { COLUMNS } from '../constants';
import { stageVar } from '../constants';

const CARD_COUNTS = [3, 2, 2, 1] as const;

export function SkeletonBoard() {
  return (
    <div
      className="flex gap-4 overflow-x-auto px-6 pb-6 pt-4"
      role="status"
      aria-busy="true"
      aria-label="Loading board"
    >
      <span className="sr-only">Loading board…</span>
      {COLUMNS.map((column, columnIndex) => (
        <section
          key={column.id}
          className="w-72 shrink-0 rounded-2xl border border-line-soft bg-surface p-3 xl:w-80"
        >
          <header className="mb-3 flex items-center gap-2 px-1">
            <span
              className="h-2.5 w-2.5 animate-pulse rounded-full"
              style={{ backgroundColor: stageVar(column.id) }}
            />
            <div className="h-4 w-24 animate-pulse rounded-md bg-skeleton" />
            <div className="ml-auto h-5 w-7 animate-pulse rounded-md bg-skeleton" />
          </header>
          <div className="space-y-3">
            {Array.from({ length: CARD_COUNTS[columnIndex] ?? 2 }).map(
              (_, cardIndex) => (
                <div
                  key={cardIndex}
                  className="animate-pulse rounded-xl border border-line-soft bg-card p-3"
                >
                  <div className="h-3.5 w-3/4 rounded bg-skeleton" />
                  <div className="mt-2.5 h-3 w-1/2 rounded bg-skeleton" />
                  <div className="mt-3.5 flex items-center gap-2">
                    <div className="h-5 w-16 rounded-full bg-skeleton" />
                    <div className="ml-auto h-3.5 w-14 rounded bg-skeleton" />
                  </div>
                </div>
              ),
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
