import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  shownCount: number;
  totalCount: number;
}

export function SearchBar({ value, onChange, shownCount, totalCount }: SearchBarProps) {
  const filtering = value.trim().length > 0;

  return (
    <div className="relative flex-1 sm:max-w-sm">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search title, company, location…"
        aria-label="Search jobs"
        className="w-full rounded-lg border border-line bg-input py-2 pl-9 pr-20 text-sm text-ink placeholder:text-faint focus:border-sky-400/50 focus:outline-none focus:ring-2 focus:ring-sky-400/20"
      />
      {filtering ? (
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
          <span className="text-xs tabular-nums text-muted">
            {shownCount}/{totalCount}
          </span>
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Clear search"
            className="rounded-md p-1 text-muted transition-colors hover:bg-btn-ghost hover:text-ink"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
