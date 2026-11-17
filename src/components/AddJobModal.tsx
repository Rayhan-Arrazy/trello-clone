import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { COLUMNS, createJobId } from '../constants';
import type { Job, JobFormValues, Status } from '../types';
import { defaultFormValues, toJob } from '../utils';
import { JobFormFields } from './JobFormFields';

interface AddJobModalProps {
  open: boolean;
  defaultStatus: Status;
  onClose: () => void;
  onCreate: (job: Job) => void;
}

export function AddJobModal({ open, defaultStatus, onClose, onCreate }: AddJobModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<JobFormValues>({
    defaultValues: { ...defaultFormValues(), status: defaultStatus },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (open) reset({ ...defaultFormValues(), status: defaultStatus });
  }, [open, defaultStatus, reset]);

  const submit = handleSubmit((values) => {
    onCreate(toJob(values, createJobId()));
    onClose();
  });

  const stageTitle =
    COLUMNS.find((column) => column.id === defaultStatus)?.title ?? 'Applied';

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <AnimatePresence>
        {open ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              />
            </Dialog.Overlay>
            <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
              <Dialog.Content asChild forceMount>
                <motion.div
                  initial={{ opacity: 0, y: 24, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 14, scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-panel p-6 shadow-2xl shadow-black/40"
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <Dialog.Title className="text-lg font-semibold text-ink">
                        Add a job
                      </Dialog.Title>
                      <Dialog.Description className="mt-0.5 text-xs text-faint">
                        Starts in <span className="text-accent-text">{stageTitle}</span>, you can
                        drag it between stages.
                      </Dialog.Description>
                    </div>
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        aria-label="Close"
                        className="rounded-md p-1.5 text-muted transition-colors hover:bg-btn-ghost hover:text-ink"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </Dialog.Close>
                  </div>

                  <form onSubmit={submit} noValidate className="space-y-5">
                    <JobFormFields idPrefix="add" register={register} errors={errors} />

                    <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
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
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        Add job
                      </button>
                    </div>
                  </form>
                </motion.div>
              </Dialog.Content>
            </div>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
