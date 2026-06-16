export type StepIndex = 0 | 1 | 2 | 3;

export type PartId = 'gong' | 'dou' | 'fang';

export interface StepData {
  id: StepIndex;
  title: string;
  description: string;
  partName?: string;
}

export interface PartOffset {
  position: [number, number, number];
  rotation: [number, number, number];
}

export type WoodVariant = 'light' | 'medium' | 'dark';
