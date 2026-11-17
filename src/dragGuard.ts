import type { DragGuard } from './types';

/**
 * Shared mutable flag: true between drag start and the end of the current
 * pointer-up task. Used to swallow the browser's stray click that fires when
 * a card is dropped on itself, so the detail drawer does not open after a move.
 */
export const dragGuard: DragGuard = { active: false };

export function beginDrag(): void {
  dragGuard.active = true;
}

export function endDrag(): void {
  window.setTimeout(() => {
    dragGuard.active = false;
  }, 0);
}
