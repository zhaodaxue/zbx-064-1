export type StepIndex = 0 | 1 | 2 | 3;

export type PartId = 'gong' | 'dou' | 'fang';

export interface StepData {
  id: StepIndex;
  title: string;
  description: string;
  partName?: string;
}

export interface PartData {
  id: PartId;
  name: string;
  title: string;
  description: string;
  relatedStep: StepIndex;
}

export interface PartOffset {
  position: [number, number, number];
  rotation: [number, number, number];
}

export type WoodVariant = 'light' | 'medium' | 'dark';

export interface CameraPreset {
  position: [number, number, number];
  target: [number, number, number];
}
