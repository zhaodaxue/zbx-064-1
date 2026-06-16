import { create } from 'zustand';
import type { PartId, StepIndex, CameraPreset } from '../types';
import { DISASSEMBLY_ORDER, ANIMATION_DURATION, STEP_CAMERA_PRESETS } from '../data/parts';

interface DisassemblyState {
  currentStep: StepIndex;
  visualStep: StepIndex;
  totalSteps: number;

  selectedPart: PartId | null;
  isAnimating: boolean;
  isTransitioning: boolean;

  cameraTarget: CameraPreset;
  cameraTransitionKey: number;

  selectPart: (partId: PartId) => void;
  clearSelection: () => void;

  next: () => void;
  prev: () => void;
  goTo: (step: StepIndex) => void;
  reset: () => void;

  notifyPartAnimationComplete: () => void;

  isPartDetached: (partId: PartId) => boolean;
  isPartSelected: (partId: PartId) => boolean;

  canControlSteps: () => boolean;
  canSelectParts: () => boolean;
}

function buildTransitionQueue(from: StepIndex, to: StepIndex): StepIndex[] {
  const queue: StepIndex[] = [];
  if (from === to) return queue;

  if (to > from) {
    for (let i = (from + 1); i <= to; i++) {
      queue.push(i as StepIndex);
    }
  } else {
    for (let i = (from - 1); i >= to; i--) {
      queue.push(i as StepIndex);
    }
  }
  return queue;
}

let partAnimationsInProgress = 0;
let animationTimeoutId: ReturnType<typeof setTimeout> | null = null;

function clearAnimationTimeout() {
  if (animationTimeoutId) {
    clearTimeout(animationTimeoutId);
    animationTimeoutId = null;
  }
}

function startAnimationTimeout(get: () => DisassemblyState, set: (partial: Partial<DisassemblyState> | ((state: DisassemblyState) => Partial<DisassemblyState>)) => void) {
  clearAnimationTimeout();
  const timeoutMs = ANIMATION_DURATION * 1000 + 500;
  animationTimeoutId = setTimeout(() => {
    partAnimationsInProgress = 0;
    const state = get();
    if (!state.isTransitioning) {
      set({ isAnimating: false });
    }
  }, timeoutMs);
}

export const useDisassemblyStore = create<DisassemblyState>((set, get) => ({
  currentStep: 0,
  visualStep: 0,
  totalSteps: 3,
  selectedPart: null,
  isAnimating: false,
  isTransitioning: false,
  cameraTarget: STEP_CAMERA_PRESETS[0],
  cameraTransitionKey: 0,

  selectPart: (partId: PartId) => {
    const state = get();
    if (!state.canSelectParts()) return;

    if (state.selectedPart === partId) {
      set({ selectedPart: null });
    } else {
      set({ selectedPart: partId });
    }
  },

  clearSelection: () => {
    set({ selectedPart: null });
  },

  next: () => {
    const state = get();
    if (!state.canControlSteps()) return;
    if (state.currentStep >= 3) return;

    const nextStep = (Math.min(state.currentStep + 1, 3) as StepIndex);

    partAnimationsInProgress = 3;
    startAnimationTimeout(get, set);

    set({
      selectedPart: null,
      isAnimating: true,
      isTransitioning: false,
      currentStep: nextStep,
      visualStep: nextStep,
      cameraTarget: STEP_CAMERA_PRESETS[nextStep],
      cameraTransitionKey: get().cameraTransitionKey + 1,
    });
  },

  prev: () => {
    const state = get();
    if (!state.canControlSteps()) return;
    if (state.currentStep <= 0) return;

    const prevStep = (Math.max(state.currentStep - 1, 0) as StepIndex);

    partAnimationsInProgress = 3;
    startAnimationTimeout(get, set);

    set({
      selectedPart: null,
      isAnimating: true,
      isTransitioning: false,
      currentStep: prevStep,
      visualStep: prevStep,
      cameraTarget: STEP_CAMERA_PRESETS[prevStep],
      cameraTransitionKey: get().cameraTransitionKey + 1,
    });
  },

  goTo: (targetStep: StepIndex) => {
    const state = get();
    if (!state.canControlSteps()) return;
    if (state.currentStep === targetStep) return;

    set({ selectedPart: null });

    const isAdjacent = Math.abs(state.currentStep - targetStep) === 1;

    if (isAdjacent) {
      partAnimationsInProgress = 3;
      startAnimationTimeout(get, set);
      set({
        isAnimating: true,
        isTransitioning: false,
        currentStep: targetStep,
        visualStep: targetStep,
        cameraTarget: STEP_CAMERA_PRESETS[targetStep],
        cameraTransitionKey: get().cameraTransitionKey + 1,
      });
    } else {
      const queue = buildTransitionQueue(state.currentStep, targetStep);
      if (queue.length === 0) return;

      set({
        isAnimating: true,
        isTransitioning: true,
      });

      const firstStep = queue[0];
      partAnimationsInProgress = 3;
      startAnimationTimeout(get, set);
      set({
        currentStep: firstStep,
        visualStep: firstStep,
        cameraTarget: STEP_CAMERA_PRESETS[firstStep],
        cameraTransitionKey: get().cameraTransitionKey + 1,
      });

      processTransitionQueue(queue, 1, get, set);
    }
  },

  reset: () => {
    const state = get();
    if (!state.canControlSteps()) return;
    if (state.currentStep === 0) return;

    const targetStep = 0 as StepIndex;
    const isAdjacent = state.currentStep === 1;

    set({ selectedPart: null });

    if (isAdjacent) {
      partAnimationsInProgress = 3;
      startAnimationTimeout(get, set);
      set({
        isAnimating: true,
        isTransitioning: false,
        currentStep: targetStep,
        visualStep: targetStep,
        cameraTarget: STEP_CAMERA_PRESETS[targetStep],
        cameraTransitionKey: get().cameraTransitionKey + 1,
      });
    } else {
      const queue = buildTransitionQueue(state.currentStep, targetStep);
      if (queue.length === 0) return;

      set({
        isAnimating: true,
        isTransitioning: true,
      });

      const firstStep = queue[0];
      partAnimationsInProgress = 3;
      startAnimationTimeout(get, set);
      set({
        currentStep: firstStep,
        visualStep: firstStep,
        cameraTarget: STEP_CAMERA_PRESETS[firstStep],
        cameraTransitionKey: get().cameraTransitionKey + 1,
      });

      processTransitionQueue(queue, 1, get, set);
    }
  },

  notifyPartAnimationComplete: () => {
    partAnimationsInProgress = Math.max(0, partAnimationsInProgress - 1);
    if (partAnimationsInProgress === 0) {
      clearAnimationTimeout();
      set((state) => {
        if (!state.isTransitioning) {
          return { isAnimating: false };
        }
        return {};
      });
    }
  },

  isPartDetached: (partId: PartId) => {
    const step = get().visualStep;
    const partIndex = DISASSEMBLY_ORDER.indexOf(partId);
    return partIndex < step;
  },

  isPartSelected: (partId: PartId) => {
    return get().selectedPart === partId;
  },

  canControlSteps: () => {
    const s = get();
    return !s.isAnimating && !s.isTransitioning;
  },

  canSelectParts: () => {
    const s = get();
    return !s.isAnimating && !s.isTransitioning;
  },
}));

function processTransitionQueue(
  queue: StepIndex[],
  index: number,
  get: () => DisassemblyState,
  set: (partial: Partial<DisassemblyState> | ((state: DisassemblyState) => Partial<DisassemblyState>)) => void
) {
  if (index >= queue.length) {
    clearAnimationTimeout();
    partAnimationsInProgress = 0;
    set({
      isAnimating: false,
      isTransitioning: false,
    });
    return;
  }

  const delayMs = ANIMATION_DURATION * 1000 + 80;

  setTimeout(() => {
    const current = get();
    if (!current.isTransitioning) {
      set({
        isAnimating: false,
        isTransitioning: false,
      });
      return;
    }

    const nextStep = queue[index];
    partAnimationsInProgress = 3;
    startAnimationTimeout(get, set);
    set({
      currentStep: nextStep,
      visualStep: nextStep,
      cameraTarget: STEP_CAMERA_PRESETS[nextStep],
      cameraTransitionKey: get().cameraTransitionKey + 1,
    });

    processTransitionQueue(queue, index + 1, get, set);
  }, delayMs);
}
