# JobTrack - Kanban Job Tracker

A drag-and-drop Kanban board for tracking job applications across stages:
**Applied → Interviewing → Offer → Rejected**.

## Stack

- React 19 + TypeScript (strict mode, no `any`)
- [dnd-kit](https://dndkit.com) - drag & drop (pointer + keyboard sensors)
- Tailwind CSS v4
- react-hook-form - Add / Edit job forms
- [Radix UI](https://www.radix-ui.com) - accessible Dialog (modal + drawer) and Toast primitives
- framer-motion - spring entrances, drawer/modal/toast motion, button feedback
- lucide-react - icon set

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b type-check + production build
npm run lint
```

## Features

- **Drag & drop** across columns and reorder within a column (`closestCorners` collision detection, `DragOverlay` ghost).
- **Type-safe state**: `Status`, `Job`, `Column`, `BoardState` interfaces in `src/types.ts`; normalized state (`jobs` record + per-column id arrays) managed by a pure `useReducer` reducer with a 10-step history.
- **LocalStorage persistence** via the generic `usePersistedResource<T>` hook (`src/hooks/usePersistedResource.ts`) that simulates a **1-second network delay** and shows a **skeleton loader** while loading, then debounced-writes on every change. Stored JSON is validated with type guards before use.
- **Undo-move toast**: Radix Toast - 5-second, swipe-to-dismiss, pauses on hover (native + synced progress bar) with an accessible **Undo** action backed by the reducer history.
- **Search & filter**: live filter by title/company/location with per-column `shown/total` counts; dragging is disabled while a filter is active so hidden ordering can't be corrupted.
- **Job detail drawer**: Radix Dialog styled as a right-side drawer - edit fields or delete (with confirm) via React Hook Form.
- **Add Job modal**: Radix Dialog with spring motion; opened globally or pre-set to a column via its `+` button.

## Humanized interface

- **People**: deterministic gradient avatars (initials) for companies on cards, drawer, everywhere a company appears.
- **Microcopy**: time-based greeting + contextual cheer line (“2 interviews in play”, “1 offer in hand, finish strong.”), warm empty states (“Nothing here yet. Drag a card in or hit +.”).
- **Motion**: staggered column reveal after the skeleton loads, spring card entrances/hover lift, slide-in drawer, modal springs, toast slide with progress bar.
- **Visual polish**: per-stage accent colors on column headers, count badges, and a subtle left stripe on cards; tinted stat chips.
- **Progress & nudges**: stats bar (applied / interviewing / offer / rejected, % heard back, added this week) plus a “Follow up, Nd silent” chip on applications with no response for 7+ days.

## Structure

```
src/
  types.ts              # Job, Column, Status, BoardState, form values
  constants.ts          # columns, seed board, id helpers
  boardReducer.ts       # pure reducer + moveJob logic + undo history
  storage.ts            # localStorage read + type-guard validation
  dragGuard.ts          # swallows stray click after a drag
  utils.ts              # form mapping, search matcher, date formatting
  hooks/
    usePersistedResource.ts   # generic delayed-load + debounced-save hook
  components/
    Board, Column, JobCard, SkeletonBoard, SearchBar, Avatar,
    AddJobModal, JobDrawer, JobFormFields, UndoToast, BoardStatsBar
  App.tsx               # header, load gate, stats bar, Radix toast provider
```
