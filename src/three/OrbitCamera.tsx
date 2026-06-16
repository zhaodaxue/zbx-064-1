import { useRef, useCallback, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { useDisassemblyStore } from '../store/useDisassemblyStore';
import { STEP_CAMERA_PRESETS } from '../data/parts';
import type { StepIndex } from '../types';

export function OrbitCamera() {
  const { camera, gl } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const cameraTarget = useDisassemblyStore((s) => s.cameraTarget);
  const cameraTransitionKey = useDisassemblyStore((s) => s.cameraTransitionKey);

  const animatingRef = useRef(false);
  const animStartPosRef = useRef(new THREE.Vector3());
  const animTargetPosRef = useRef(new THREE.Vector3());
  const animStartTargetRef = useRef(new THREE.Vector3());
  const animTargetTargetRef = useRef(new THREE.Vector3());
  const animProgressRef = useRef(0);
  const animDurationRef = useRef(1.0);

  const startCameraAnimation = useCallback((preset: typeof STEP_CAMERA_PRESETS[StepIndex]) => {
    if (!controlsRef.current) return;
    animStartPosRef.current.copy(camera.position);
    animTargetPosRef.current.set(...preset.position);
    animStartTargetRef.current.copy(controlsRef.current.target);
    animTargetTargetRef.current.set(...preset.target);
    animProgressRef.current = 0;
    animatingRef.current = true;
  }, [camera]);

  useEffect(() => {
    startCameraAnimation(cameraTarget);
  }, [cameraTransitionKey, cameraTarget, startCameraAnimation]);

  const resetCamera = useCallback(() => {
    startCameraAnimation(STEP_CAMERA_PRESETS[0]);
  }, [startCameraAnimation]);

  useEffect(() => {
    const canvas = gl.domElement;
    const handleDoubleClick = (e: MouseEvent) => {
      e.preventDefault();
      resetCamera();
    };
    canvas.addEventListener('dblclick', handleDoubleClick);
    return () => canvas.removeEventListener('dblclick', handleDoubleClick);
  }, [gl, resetCamera]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        resetCamera();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetCamera]);

  useFrame((_, delta) => {
    if (animatingRef.current && controlsRef.current) {
      animProgressRef.current = Math.min(
        animProgressRef.current + delta / animDurationRef.current,
        1
      );
      const t = easeInOutCubic(animProgressRef.current);

      camera.position.lerpVectors(
        animStartPosRef.current,
        animTargetPosRef.current,
        t
      );
      controlsRef.current.target.lerpVectors(
        animStartTargetRef.current,
        animTargetTargetRef.current,
        t
      );

      if (animProgressRef.current >= 1) {
        animatingRef.current = false;
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      minDistance={3}
      maxDistance={18}
      minPolarAngle={Math.PI / 18}
      maxPolarAngle={Math.PI / 2.1}
      target={STEP_CAMERA_PRESETS[0].target}
      makeDefault
    />
  );
}

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
