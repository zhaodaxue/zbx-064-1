import { useMemo, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import {
  createWoodMaterial,
  PART_DETACH_OFFSETS,
  PART_ASSEMBLED_POSITIONS,
  PART_VARIANTS,
  PART_LABEL_OFFSETS,
} from './meshFactories';
import { useDisassemblyStore } from '../store/useDisassemblyStore';
import { ANIMATION_DURATION } from '../data/parts';
import type { PartId } from '../types';

const PARTS: PartId[] = ['gong', 'dou', 'fang'];

const PART_NAMES: Record<PartId, string> = {
  gong: '拱',
  dou: '斗',
  fang: '枋',
};

interface PartMeshProps {
  partId: PartId;
}

function PartMesh({ partId }: PartMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshesRef = useRef<THREE.Mesh[]>([]);
  const targetPosition = useRef(new THREE.Vector3());
  const currentPosition = useRef(new THREE.Vector3());
  const targetRotation = useRef(new THREE.Euler());
  const currentRotation = useRef(new THREE.Euler());
  const targetOpacity = useRef(1);
  const currentOpacity = useRef(1);
  const isAnimatingRef = useRef(false);
  const hasNotifiedRef = useRef(false);

  const notifyPartAnimationComplete = useDisassemblyStore(
    (s) => s.notifyPartAnimationComplete
  );
  const variant = PART_VARIANTS[partId];

  const materials = useMemo(() => {
    const base = createWoodMaterial(variant, 1);
    base.transparent = true;
    return base;
  }, [variant]);

  const materialsDark = useMemo(() => {
    const m = createWoodMaterial('dark', 1);
    m.transparent = true;
    return m;
  }, []);

  const materialsLight = useMemo(() => {
    const m = createWoodMaterial('light', 1);
    m.transparent = true;
    return m;
  }, []);

  const isDetached = useDisassemblyStore((s) => s.isPartDetached(partId));
  const isSelected = useDisassemblyStore((s) => s.isPartSelected(partId));
  const selectPart = useDisassemblyStore((s) => s.selectPart);
  const canSelect = useDisassemblyStore((s) => s.canSelectParts());

  useEffect(() => {
    targetPosition.current = new THREE.Vector3();
    currentPosition.current = new THREE.Vector3();
    const assembled = PART_ASSEMBLED_POSITIONS[partId];
    currentPosition.current.set(
      assembled[0],
      assembled[1],
      assembled[2]
    );
    if (groupRef.current) {
      groupRef.current.position.copy(currentPosition.current);
    }
  }, [partId]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const assembled = PART_ASSEMBLED_POSITIONS[partId];
    const detached = PART_DETACH_OFFSETS[partId];

    if (isDetached) {
      targetPosition.current.set(
        assembled[0] + detached.position[0],
        assembled[1] + detached.position[1],
        assembled[2] + detached.position[2]
      );
      targetRotation.current.set(
        detached.rotation[0],
        detached.rotation[1],
        detached.rotation[2]
      );
      targetOpacity.current = 0.82;
    } else {
      targetPosition.current.set(
        assembled[0],
        assembled[1],
        assembled[2]
      );
      targetRotation.current.set(0, 0, 0);
      targetOpacity.current = 1;
    }

    const posDiff = currentPosition.current.distanceTo(targetPosition.current);
    const rotDiffX = Math.abs(currentRotation.current.x - targetRotation.current.x);
    const rotDiffY = Math.abs(currentRotation.current.y - targetRotation.current.y);
    const rotDiffZ = Math.abs(currentRotation.current.z - targetRotation.current.z);
    const opacityDiff = Math.abs(currentOpacity.current - targetOpacity.current);
    const isMoving =
      posDiff > 0.02 || rotDiffX > 0.01 || rotDiffY > 0.01 || rotDiffZ > 0.01 || opacityDiff > 0.01;

    if (isMoving && !isAnimatingRef.current) {
      isAnimatingRef.current = true;
      hasNotifiedRef.current = false;
    }

    const lerpFactor = Math.min(delta * (1 / ANIMATION_DURATION) * 1.2, 1);
    currentPosition.current.lerp(targetPosition.current, lerpFactor);
    currentRotation.current.x = THREE.MathUtils.lerp(
      currentRotation.current.x,
      targetRotation.current.x,
      lerpFactor
    );
    currentRotation.current.y = THREE.MathUtils.lerp(
      currentRotation.current.y,
      targetRotation.current.y,
      lerpFactor
    );
    currentRotation.current.z = THREE.MathUtils.lerp(
      currentRotation.current.z,
      targetRotation.current.z,
      lerpFactor
    );
    currentOpacity.current = THREE.MathUtils.lerp(
      currentOpacity.current,
      targetOpacity.current,
      lerpFactor
    );

    groupRef.current.position.copy(currentPosition.current);
    groupRef.current.rotation.set(
      currentRotation.current.x,
      currentRotation.current.y,
      currentRotation.current.z
    );
    materials.opacity = currentOpacity.current;
    materialsDark.opacity = currentOpacity.current;
    materialsLight.opacity = currentOpacity.current;

    const highlightIntensity = isSelected ? 0.6 : 0;
    materials.emissive.setHex(isSelected ? 0xf5d79e : 0x000000);
    materials.emissiveIntensity = highlightIntensity;
    materialsDark.emissive.setHex(isSelected ? 0xf5d79e : 0x000000);
    materialsDark.emissiveIntensity = highlightIntensity;
    materialsLight.emissive.setHex(isSelected ? 0xf5d79e : 0x000000);
    materialsLight.emissiveIntensity = highlightIntensity;

    if (isAnimatingRef.current && !isMoving && !hasNotifiedRef.current) {
      hasNotifiedRef.current = true;
      isAnimatingRef.current = false;
      notifyPartAnimationComplete();
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (!canSelect) return;
    selectPart(partId);
  };

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    if (!canSelect) return;
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    document.body.style.cursor = 'default';
  };

  const renderGeometry = () => {
    const meshProps = {
      castShadow: true,
      receiveShadow: true,
      onClick: handleClick,
      onPointerOver: handlePointerOver,
      onPointerOut: handlePointerOut,
    };

    if (partId === 'gong') {
      return (
        <>
          <mesh {...meshProps} material={materials}>
            <boxGeometry args={[3.2, 0.45, 0.9]} />
          </mesh>
          <mesh {...meshProps} position={[-1.55, 0.08, 0]} material={materialsDark}>
            <boxGeometry args={[0.5, 0.55, 1.0]} />
          </mesh>
          <mesh {...meshProps} position={[1.55, 0.08, 0]} material={materialsDark}>
            <boxGeometry args={[0.5, 0.55, 1.0]} />
          </mesh>
          <mesh {...meshProps} position={[0, 0.32, 0]} material={materialsLight}>
            <boxGeometry args={[1.0, 0.25, 0.85]} />
          </mesh>
        </>
      );
    }

    if (partId === 'dou') {
      return (
        <>
          <mesh {...meshProps} position={[0, -0.35, 0]} material={materials}>
            <boxGeometry args={[1.1, 0.35, 1.0]} />
          </mesh>
          <mesh {...meshProps} position={[0, 0.15, 0]} material={materialsDark}>
            <boxGeometry args={[1.4, 0.7, 1.2]} />
          </mesh>
          <mesh {...meshProps} position={[0, 0.65, 0]} material={materialsLight}>
            <boxGeometry args={[1.6, 0.3, 1.4]} />
          </mesh>
          <mesh {...meshProps} position={[0, 0.78, 0]} material={materialsDark}>
            <boxGeometry args={[1.7, 0.35, 0.45]} />
          </mesh>
        </>
      );
    }

    return (
      <>
        <mesh {...meshProps} material={materials}>
          <boxGeometry args={[3.8, 0.4, 0.4]} />
        </mesh>
        <mesh {...meshProps} position={[-1.9, 0, 0]} material={materialsDark}>
          <boxGeometry args={[0.25, 0.5, 0.5]} />
        </mesh>
        <mesh {...meshProps} position={[1.9, 0, 0]} material={materialsDark}>
          <boxGeometry args={[0.25, 0.5, 0.5]} />
        </mesh>
      </>
    );
  };

  return (
    <group ref={groupRef}>
      {renderGeometry()}
    </group>
  );
}

function PartLabel({ partId }: { partId: PartId }) {
  const ref = useRef<THREE.Group>(null);
  const targetPos = useRef(new THREE.Vector3());
  const currentPos = useRef(new THREE.Vector3());

  const isDetached = useDisassemblyStore((s) => s.isPartDetached(partId));
  const isSelected = useDisassemblyStore((s) => s.isPartSelected(partId));

  useEffect(() => {
    const assembled = PART_ASSEMBLED_POSITIONS[partId];
    const labelOffset = PART_LABEL_OFFSETS[partId];
    currentPos.current.set(
      assembled[0] + labelOffset[0],
      assembled[1] + labelOffset[1],
      assembled[2] + labelOffset[2]
    );
    if (ref.current) {
      ref.current.position.copy(currentPos.current);
    }
  }, [partId]);

  useFrame((_, delta) => {
    if (!ref.current) return;

    const assembled = PART_ASSEMBLED_POSITIONS[partId];
    const detached = PART_DETACH_OFFSETS[partId];
    const labelOffset = PART_LABEL_OFFSETS[partId];

    if (isDetached) {
      targetPos.current.set(
        assembled[0] + detached.position[0] + labelOffset[0],
        assembled[1] + detached.position[1] + labelOffset[1],
        assembled[2] + detached.position[2] + labelOffset[2]
      );
    } else {
      targetPos.current.set(
        assembled[0] + labelOffset[0],
        assembled[1] + labelOffset[1],
        assembled[2] + labelOffset[2]
      );
    }

    const lerpFactor = Math.min(delta * 4.5, 1);
    currentPos.current.lerp(targetPos.current, lerpFactor);
    ref.current.position.copy(currentPos.current);
  });

  const labelColor = isSelected ? '#fff3d4' : isDetached ? '#f5d79e' : '#c9a474';
  const bgColor = isSelected ? '#a06a2a' : isDetached ? '#6b4423' : '#3e2723';

  return (
    <group ref={ref}>
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[0.9, 0.45]} />
        <meshBasicMaterial color={bgColor} transparent opacity={0.85} />
      </mesh>
      <Text
        fontSize={0.26}
        color={labelColor}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.015}
        outlineColor="#1f140c"
      >
        {PART_NAMES[partId]}
      </Text>
    </group>
  );
}

function SceneClickHandler() {
  const { gl } = useThree();
  const clearSelection = useDisassemblyStore((s) => s.clearSelection);
  const selectedPart = useDisassemblyStore((s) => s.selectedPart);

  useEffect(() => {
    const canvas = gl.domElement;

    const handleCanvasClick = (e: MouseEvent) => {
      if (!selectedPart) return;

      const target = e.target as HTMLElement;
      if (target === canvas) {
        clearSelection();
      }
    };

    canvas.addEventListener('click', handleCanvasClick);
    return () => canvas.removeEventListener('click', handleCanvasClick);
  }, [gl, selectedPart, clearSelection]);

  return null;
}

export function DougongMesh() {
  return (
    <group>
      <SceneClickHandler />

      <mesh position={[0, -1.55, 0]} receiveShadow>
        <cylinderGeometry args={[0.65, 0.7, 0.1, 32]} />
        <meshStandardMaterial
          color={0x3e2723}
          roughness={0.92}
          metalness={0.04}
        />
      </mesh>
      <mesh position={[0, -1.45, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.58, 0.58, 0.15, 32]} />
        <meshStandardMaterial
          color={0x6b4423}
          roughness={0.8}
          metalness={0.05}
        />
      </mesh>

      {PARTS.map((partId) => (
        <PartMesh key={partId} partId={partId} />
      ))}

      {PARTS.map((partId) => (
        <PartLabel key={`label-${partId}`} partId={partId} />
      ))}
    </group>
  );
}
