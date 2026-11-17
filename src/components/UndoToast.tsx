import * as Toast from '@radix-ui/react-toast';
import { Undo2, X } from 'lucide-react';
import { useState } from 'react';
import { columnTitle } from '../constants';
import type { UndoToastData } from '../types';

interface UndoToastProps {
  data: UndoToastData | null;
  open: boolean;
  onUndo: () => void;
  onDismiss: () => void;
}

export function UndoToast({ data, open, onUndo, onDismiss }: UndoToastProps) {
  const [paused, setPaused] = useState(false);

  return (
    <Toast.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onDismiss();
      }}
      type="foreground"
      duration={5000}
      onPause={() => setPaused(true)}
      onResume={() => setPaused(false)}
      className="toast-motion relative w-full overflow-hidden rounded-xl border border-line bg-panel/95 p-4 shadow-2xl shadow-black/40 backdrop-blur"
    >
      {data !== null ? (
        <>
          <div className="flex items-center gap-3">
            <span className="h-8 w-1 shrink-0 rounded-full bg-sky-400" aria-hidden="true" />
            <p className="min-w-0 flex-1 truncate text-sm text-ink">
              Moved <span className="font-semibold text-ink">{data.jobTitle}</span> to{' '}
              <span className="font-semibold text-accent-text">{columnTitle(data.toStatus)}</span>
            </p>
            <Toast.Action altText={`Undo move of ${data.jobTitle}`} asChild>
              <button
                type="button"
                onClick={onUndo}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-btn-ghost px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-btn-ghost-hover"
              >
                <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
                Undo
              </button>
            </Toast.Action>
            <Toast.Close asChild>
              <button
                type="button"
                aria-label="Dismiss"
                className="shrink-0 rounded-md p-1 text-muted transition-colors hover:bg-btn-ghost hover:text-ink"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </Toast.Close>
          </div>
          <div className="mt-2.5 h-0.5 overflow-hidden rounded-full bg-line-strong">
            <div
              key={data.seq}
              className="h-full w-full animate-toast-progress bg-sky-400/70"
              style={{ animationPlayState: paused ? 'paused' : 'running' }}
            />
          </div>
        </>
      ) : null}
    </Toast.Root>
  );
}
