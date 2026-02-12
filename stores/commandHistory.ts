import { create } from "zustand";

// Simple command history for edit operations
interface UndoRedoState {
  past: any[];
  present: any;
  future: any[];

  push: (state: any) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

export const useHistoryStore = create<UndoRedoState>((set, get) => ({
  past: [],
  present: null,
  future: [],

  push: (state: any) => {
    const { present, past, future } = get();
    if (present !== null) {
      set({
        past: [...past, present],
        present: state,
        future: [],
      });
    } else {
      set({ present: state });
    }
  },

  undo: () => {
    const { past, present, future } = get();
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    set({
      past: newPast,
      present: previous,
      future: [present, ...future],
    });
  },

  redo: () => {
    const { past, present, future } = get();
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);

    set({
      past: [...past, present],
      present: next,
      future: newFuture,
    });
  },

  clear: () => {
    set({ past: [], present: null, future: [] });
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,
}));
