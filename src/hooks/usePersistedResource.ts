import { useCallback, useEffect, useRef, useState } from 'react';
import type { LoadStatus } from '../types';

export interface PersistedResourceOptions<T> {
  delayMs?: number;
  validate?: (value: unknown) => value is T;
}

export interface PersistedResource<T> {
  data: T | null;
  status: LoadStatus;
  save: (value: T) => void;
}

const DEFAULT_DELAY_MS = 1000;
const SAVE_DEBOUNCE_MS = 250;

function readStorage<T>(
  key: string,
  fallback: T,
  validate: ((value: unknown) => value is T) | undefined,
): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (validate === undefined) return parsed as T;
    return validate(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable; the in-memory state stays authoritative.
  }
}

export function usePersistedResource<T>(
  key: string,
  fallback: T,
  options: PersistedResourceOptions<T> = {},
): PersistedResource<T> {
  const { delayMs = DEFAULT_DELAY_MS, validate } = options;
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(() => {
      if (cancelled) return;
      setData(readStorage(key, fallback, validate));
      setStatus('ready');
    }, delayMs);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [key, delayMs, fallback, validate]);

  const save = useCallback(
    (value: T) => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        writeStorage(key, value);
      }, SAVE_DEBOUNCE_MS);
    },
    [key],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  return { data, status, save };
}
