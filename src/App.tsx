import * as Toast from '@radix-ui/react-toast';
import { motion } from 'framer-motion';
import { Moon, Plus, Sun } from 'lucide-react';
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { AddJobModal } from './components/AddJobModal';
import { Board } from './components/Board';
import { BoardStatsBar } from './components/BoardStatsBar';
import { JobDrawer } from './components/JobDrawer';
import { SearchBar } from './components/SearchBar';
import { SkeletonBoard } from './components/SkeletonBoard';
import { UndoToast } from './components/UndoToast';
import { boardReducer, createBoardStore, moveJob } from './boardReducer';
import type { BoardAction } from './boardReducer';
import { SEED_BOARD, STORAGE_KEY } from './constants';
import { usePersistedResource } from './hooks/usePersistedResource';
import type { Theme } from './hooks/useTheme';
import { useTheme } from './hooks/useTheme';
import { isBoardState } from './storage';
import type {
  BoardState,
  Job,
  Status,
  UndoToastData,
} from './types';
import { boardStats, matchQuery } from './utils';

function Brand() {
  return (
    <div>
      <div>
        <p className="text-sm font-bold leading-tight tracking-tight text-ink">JobTrack</p>
        <p className="text-[11px] leading-tight text-faint">Kanban for your job search</p>
      </div>
    </div>
  );
}

interface HeaderProps {
  loading: boolean;
  query: string;
  onQueryChange: (value: string) => void;
  shownCount: number;
  totalCount: number;
  theme: Theme;
  onToggleTheme: () => void;
  onAddJob?: () => void;
}

function Header({
  loading,
  query,
  onQueryChange,
  shownCount,
  totalCount,
  theme,
  onToggleTheme,
  onAddJob,
}: HeaderProps) {
  const nextThemeLabel = theme === 'dark' ? 'light' : 'dark';

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-header backdrop-blur-md">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 px-6 py-4">
        <Brand />

        {loading ? (
          <div className="order-3 h-9 w-full animate-pulse rounded-lg bg-skeleton sm:order-none sm:ml-auto sm:w-80" />
        ) : (
          <SearchBar
            value={query}
            onChange={onQueryChange}
            shownCount={shownCount}
            totalCount={totalCount}
          />
        )}

        <button
          type="button"
          onClick={() => onQueryChange('')}
          disabled={loading || query.length === 0}
          className="hidden rounded-lg px-3 py-2 text-xs font-medium text-muted transition-colors hover:bg-btn-ghost hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 sm:block"
        >
          Reset view
        </button>

        <div className="ml-auto flex items-center gap-2 sm:ml-0">
          <motion.button
            type="button"
            onClick={onToggleTheme}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.9 }}
            aria-label={`Switch to ${nextThemeLabel} mode`}
            title={`Switch to ${nextThemeLabel} mode`}
            className="rounded-lg border border-line bg-surface p-2 text-muted shadow-sm transition-colors hover:border-line-strong hover:text-ink"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </motion.button>

          <motion.button
            type="button"
            onClick={onAddJob}
            disabled={loading || onAddJob === undefined}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-950/40 transition-colors hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Job
          </motion.button>
        </div>
      </div>
    </header>
  );
}

interface BoardScreenProps {
  initialBoard: BoardState;
  query: string;
  onQueryChange: (value: string) => void;
  save: (value: BoardState) => void;
  theme: Theme;
  onToggleTheme: () => void;
}

function BoardScreen({
  initialBoard,
  query,
  onQueryChange,
  save,
  theme,
  onToggleTheme,
}: BoardScreenProps) {
  const [store, dispatch] = useReducer(boardReducer, initialBoard, createBoardStore);
  const [toast, setToast] = useState<UndoToastData | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<Status | null>(null);
  const [openJobId, setOpenJobId] = useState<string | null>(null);
  const seqRef = useRef(1);

  const board = store.present;

  useEffect(() => {
    save(board);
  }, [board, save]);

  const dispatchBoard = useCallback((action: BoardAction) => {
    if (action.type !== 'moveJob') setToastOpen(false);
    dispatch(action);
  }, []);

  const handleMove = useCallback(
    (jobId: string, toStatus: Status, toIndex: number) => {
      const job = board.jobs[jobId];
      if (job === undefined) return;
      const { changed } = moveJob(board, jobId, toStatus, toIndex);
      if (!changed) return;
      dispatch({ type: 'moveJob', jobId, toStatus, toIndex });
      setToast({ seq: seqRef.current++, jobTitle: job.title, toStatus });
      setToastOpen(true);
    },
    [board],
  );

  const handleUndo = useCallback(() => {
    dispatchBoard({ type: 'undo' });
    setToastOpen(false);
  }, [dispatchBoard]);

  const handleDismiss = useCallback(() => {
    setToastOpen(false);
  }, []);

  const handleCreate = useCallback(
    (job: Job) => {
      dispatchBoard({ type: 'addJob', job });
      setOpenJobId(null);
    },
    [dispatchBoard],
  );

  const handleSave = useCallback(
    (job: Job) => dispatchBoard({ type: 'updateJob', job }),
    [dispatchBoard],
  );

  const handleDelete = useCallback(
    (jobId: string) => {
      dispatchBoard({ type: 'deleteJob', jobId });
      setOpenJobId(null);
    },
    [dispatchBoard],
  );

  const openJob = openJobId !== null ? (board.jobs[openJobId] ?? null) : null;

  const filtering = query.trim().length > 0;
  const matches = useMemo(() => matchQuery(query), [query]);
  const totalCount = Object.keys(board.jobs).length;
  const shownCount = useMemo(() => {
    if (!filtering) return totalCount;
    return Object.values(board.jobs).filter(matches).length;
  }, [board.jobs, filtering, matches, totalCount]);

  const stats = useMemo(() => boardStats(board), [board]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        loading={false}
        query={query}
        onQueryChange={onQueryChange}
        shownCount={shownCount}
        totalCount={totalCount}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onAddJob={() => setModalStatus('applied')}
      />

      <BoardStatsBar stats={stats} />

      <main className="flex-1">
        <Board
          board={board}
          query={query}
          onMove={handleMove}
          onOpenJob={(job) => setOpenJobId(job.id)}
          onAddJob={(status) => setModalStatus(status)}
        />
      </main>

      <AddJobModal
        open={modalStatus !== null}
        defaultStatus={modalStatus ?? 'applied'}
        onClose={() => setModalStatus(null)}
        onCreate={handleCreate}
      />

      <JobDrawer
        job={openJob}
        onClose={() => setOpenJobId(null)}
        onSave={handleSave}
        onDelete={handleDelete}
      />

      <UndoToast
        data={toast}
        open={toastOpen}
        onUndo={handleUndo}
        onDismiss={handleDismiss}
      />
    </div>
  );
}

export default function App() {
  const { data, status, save } = usePersistedResource<BoardState>(
    STORAGE_KEY,
    SEED_BOARD,
    { delayMs: 1000, validate: isBoardState },
  );
  const [query, setQuery] = useState('');
  const { theme, toggleTheme } = useTheme();

  const loading = status === 'loading' || data === null;

  return (
    <Toast.Provider swipeDirection="right" duration={5000}>
      {loading ? (
        <div className="flex min-h-screen flex-col">
          <Header
            loading
            query={query}
            onQueryChange={setQuery}
            shownCount={0}
            totalCount={0}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
          <div className="flex items-center gap-3 px-6 pb-1 pt-4" aria-hidden="true">
            <div className="h-4 w-64 animate-pulse rounded bg-skeleton" />
            <div className="ml-auto h-5 w-44 animate-pulse rounded-full bg-skeleton" />
          </div>
          <main className="flex-1">
            <SkeletonBoard />
          </main>
        </div>
      ) : (
        <BoardScreen
          initialBoard={data}
          query={query}
          onQueryChange={setQuery}
          save={save}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}

      <Toast.Viewport className="fixed bottom-6 left-1/2 z-[60] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 list-none flex-col gap-3 p-0" />
    </Toast.Provider>
  );
}
