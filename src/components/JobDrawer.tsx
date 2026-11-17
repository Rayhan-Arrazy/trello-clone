import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { Save, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { columnTitle } from '../constants';
import type { Job, JobFormValues } from '../types';
import { PRIORITY_LABELS, PRIORITY_STYLES, toFormValues, toJob } from '../utils';
import { Avatar } from './Avatar';
import { JobFormFields } from './JobFormFields';

interface JobDrawerProps {
  job: Job | null;
  onClose: () => void;
  onSave: (job: Job) => void;
  onDelete: (jobId: string) => void;
}

function JobDrawerForm({ job, onClose, onSave, onDelete }: JobDrawerProps & { job: Job }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<JobFormValues>({
    defaultValues: toFormValues(job),
    mode: 'onBlur',
  });

  const submit = handleSubmit((values) => {
    onSave(toJob(values, job.id));
    onClose();
  });

  return (
    <form onSubmit={submit} noValidate className="flex h-full flex-col">
      <header className="flex items-start justify-between gap-3 border-b border-line px-6 py-5">
        <div className="flex min-w-0 items-start gap-3">
          <Avatar label={job.company} size="md" ring />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-faint">
              {columnTitle(job.status)}
            </p>
            <Dialog.Title className="mt-0.5 truncate text-lg font-semibold text-ink">
              {job.title}
            </Dialog.Title>
            <Dialog.Description className="mt-1 truncate text-xs text-muted">
              {job.company}
            </Dialog.Description>
            <span
              className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset ${PRIORITY_STYLES[job.priority]}`}
            >
              {PRIORITY_LABELS[job.priority]}
            </span>
          </div>
        </div>
        <Dialog.Close asChild>
          <button
            type="button"
            aria-label="Close details"
            className="rounded-md p-1.5 text-muted transition-colors hover:bg-btn-ghost hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </Dialog.Close>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        <JobFormFields idPrefix="drawer" register={register} errors={errors} />
      </div>

      <footer className="border-t border-line px-6 py-4">
        {confirmingDelete ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted">Delete this application?</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="rounded-lg px-3 py-1.5 text-xs text-muted transition-colors hover:bg-btn-ghost"
              >
                Keep
              </button>
              <button
                type="button"
                onClick={() => onDelete(job.id)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500/90 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-500"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Delete
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-danger transition-colors hover:bg-danger/10"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Delete job
            </button>
            <div className="flex items-center gap-2">
              {isDirty ? (
                <span className="text-[11px] text-warn-text">Unsaved changes</span>
              ) : null}
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-lg px-4 py-2 text-sm text-muted transition-colors hover:bg-btn-ghost hover:text-ink"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-sky-950/50 transition hover:bg-sky-400 disabled:opacity-60"
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                Save changes
              </button>
            </div>
          </div>
        )}
      </footer>
    </form>
  );
}

export function JobDrawer({ job, onClose, onSave, onDelete }: JobDrawerProps) {
  return (
    <Dialog.Root
      open={job !== null}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <AnimatePresence>
        {job !== null ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-30 bg-black/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount>
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 340, damping: 36 }}
                className="fixed right-0 top-0 z-40 flex h-full w-full max-w-md flex-col border-l border-line bg-panel shadow-2xl shadow-black/40 focus:outline-none"
              >
                <JobDrawerForm key={job.id} job={job} onClose={onClose} onSave={onSave} onDelete={onDelete} />
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
