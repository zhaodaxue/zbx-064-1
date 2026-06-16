import { create } from 'zustand';
import type { PartId, StepIndex } from '../types';

const DISASSEMBLY_ORDER: PartId[] = ['gong', 'dou', 'fang'];

interface DisassemblyState {
  currentStep: StepIndex;
  totalSteps: number;
  next: () => void;
  prev: () => void;
  goTo: (step: StepIndex) => void;
  reset: () => void;
  isPartDetached: (partId: PartId) => boolean;
  getDetachedProgress: (partId: PartId) => number;
}

export const useDisassemblyStore = create<DisassemblyState>((set, get) => ({
  currentStep: 0,
  totalSteps: 3,

  next: () =>
    set((state) => ({
      currentStep: (Math.min(state.currentStep + 1, 3) as StepIndex),
    })),

  prev: () =>
    set((state) => ({
      currentStep: (Math.max(state.currentStep - 1, 0) as StepIndex),
    })),

  goTo: (step: StepIndex) => set({ currentStep: step }),

  reset: () => set({ currentStep: 0 }),

  isPartDetached: (partId: PartId) => {
    const step = get().currentStep;
    const partIndex = DISASSEMBLY_ORDER.indexOf(partId);
    return partIndex < step;
  },

  getDetachedProgress: (partId: PartId) => {
    const step = get().currentStep;
    const partIndex = DISASSEMBLY_ORDER.indexOf(partId);
    if (partIndex < step) return 1;
    if (partIndex + 1 === step) return 1;
    return 0;
  },
}));
