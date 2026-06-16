import * as THREE from 'three';
import type { PartId, PartOffset, WoodVariant } from '../types';

const WOOD_COLORS: Record<WoodVariant, number> = {
  light: 0xd4a574,
  medium: 0xa0785a,
  dark: 0x6b4423,
};

export function createWoodMaterial(
  variant: WoodVariant = 'medium',
  opacity = 1
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: WOOD_COLORS[variant],
    roughness: 0.75,
    metalness: 0.08,
    transparent: opacity < 1,
    opacity,
    side: THREE.DoubleSide,
  });
}

export const PART_DETACH_OFFSETS: Record<PartId, PartOffset> = {
  gong: {
    position: [0, -1.8, 0],
    rotation: [0, 0, 0],
  },
  dou: {
    position: [0, 1.8, 0],
    rotation: [0, 0, 0],
  },
  fang: {
    position: [2.6, 0.1, 0],
    rotation: [0, 0.2, 0],
  },
};

export const PART_ASSEMBLED_POSITIONS: Record<PartId, [number, number, number]> = {
  gong: [0, -0.75, 0],
  dou: [0, 0.1, 0],
  fang: [0, 0.95, 0],
};

export const PART_VARIANTS: Record<PartId, WoodVariant> = {
  gong: 'medium',
  dou: 'dark',
  fang: 'light',
};

export const WOOD_COLOR_VALUES: Record<WoodVariant, number> = WOOD_COLORS;

export const PART_LABEL_OFFSETS: Record<PartId, [number, number, number]> = {
  gong: [0, -0.4, 1.3],
  dou: [0, 0.7, 1.1],
  fang: [1.5, 0.3, 0.9],
};
