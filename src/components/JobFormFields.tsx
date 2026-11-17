import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import type { ReactNode } from 'react';
import type { JobFormValues, Priority } from '../types';
import { COLUMNS } from '../constants';
import { PRIORITY_LABELS } from '../utils';

const PRIORITIES: readonly Priority[] = ['low', 'medium', 'high'];

const inputClass = (invalid: boolean): string =>
  [
    'w-full rounded-lg border bg-input px-3 py-2 text-sm text-ink placeholder:text-faint',
    'focus:outline-none focus:ring-2',
    invalid
      ? 'border-rose-400/60 focus:border-rose-500/70 focus:ring-rose-400/20 light:border-rose-500/50'
      : 'border-line focus:border-sky-400/50 focus:ring-sky-400/20',
  ].join(' ');

interface FieldWrapperProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

function FieldWrapper({ label, htmlFor, error, hint, children }: FieldWrapperProps) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-xs font-medium text-muted"
      >
        {label}
        {hint !== undefined ? (
          <span className="ml-1 font-normal text-ghost">({hint})</span>
        ) : null}
      </label>
      {children}
      {error !== undefined ? (
        <p className="mt-1 text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

interface JobFormFieldsProps {
  idPrefix: string;
  register: UseFormRegister<JobFormValues>;
  errors: FieldErrors<JobFormValues>;
}

export function JobFormFields({ idPrefix, register, errors }: JobFormFieldsProps) {
  return (
    <div className="space-y-4">
      <FieldWrapper label="Job title" htmlFor={`${idPrefix}-title`} error={errors.title?.message}>
        <input
          id={`${idPrefix}-title`}
          type="text"
          autoComplete="off"
          placeholder="Senior Frontend Engineer"
          className={inputClass(errors.title !== undefined)}
          {...register('title', {
            required: 'Title is required',
            minLength: { value: 2, message: 'At least 2 characters' },
            maxLength: { value: 120, message: 'Max 120 characters' },
          })}
        />
      </FieldWrapper>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldWrapper
          label="Company"
          htmlFor={`${idPrefix}-company`}
          error={errors.company?.message}
        >
          <input
            id={`${idPrefix}-company`}
            type="text"
            autoComplete="off"
            placeholder="Acme Inc."
            className={inputClass(errors.company !== undefined)}
            {...register('company', {
              required: 'Company is required',
              maxLength: { value: 80, message: 'Max 80 characters' },
            })}
          />
        </FieldWrapper>

        <FieldWrapper
          label="Location"
          htmlFor={`${idPrefix}-location`}
          error={errors.location?.message}
          hint="optional"
        >
          <input
            id={`${idPrefix}-location`}
            type="text"
            autoComplete="off"
            placeholder="Remote"
            className={inputClass(errors.location !== undefined)}
            {...register('location', {
              maxLength: { value: 80, message: 'Max 80 characters' },
            })}
          />
        </FieldWrapper>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FieldWrapper label="Stage" htmlFor={`${idPrefix}-status`} error={errors.status?.message}>
          <select
            id={`${idPrefix}-status`}
            className={inputClass(errors.status !== undefined)}
            {...register('status')}
          >
            {COLUMNS.map((column) => (
              <option key={column.id} value={column.id} className="bg-panel text-ink">
                {column.title}
              </option>
            ))}
          </select>
        </FieldWrapper>

        <FieldWrapper label="Priority" htmlFor={`${idPrefix}-priority`}>
          <select
            id={`${idPrefix}-priority`}
            className={inputClass(false)}
            {...register('priority')}
          >
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority} className="bg-panel text-ink">
                {PRIORITY_LABELS[priority]}
              </option>
            ))}
          </select>
        </FieldWrapper>

        <FieldWrapper
          label="Applied date"
          htmlFor={`${idPrefix}-date`}
          error={errors.appliedDate?.message}
        >
          <input
            id={`${idPrefix}-date`}
            type="date"
            className={inputClass(errors.appliedDate !== undefined)}
            {...register('appliedDate', { required: 'Date is required' })}
          />
        </FieldWrapper>
      </div>

      <FieldWrapper
        label="Notes"
        htmlFor={`${idPrefix}-notes`}
        error={errors.notes?.message}
        hint="optional"
      >
        <textarea
          id={`${idPrefix}-notes`}
          rows={3}
          placeholder="Referral, recruiter contact, follow-up reminders…"
          className={`${inputClass(errors.notes !== undefined)} resize-none`}
          {...register('notes', {
            maxLength: { value: 500, message: 'Max 500 characters' },
          })}
        />
      </FieldWrapper>
    </div>
  );
}
