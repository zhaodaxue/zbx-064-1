import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import {
  createWoodMaterial,
  PART_DETACH_OFFSETS,
  PART_ASSEMBLED_POSITIONS,
  PART_VARIANTS,
  WOOD_COLOR_VALUES,
  PART_LABEL_OFFSETS,
} from './meshFactories';
import { useDisassemblyStore } from '../store/useDisassemblyStore';
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
  const targetPosition = useRef(new THREE.Vector3());
  const currentPosition = useRef(new THREE.Vector3());
  const targetRotation = useRef(new THREE.Euler());
  const currentRotation = useRef(new THREE.Euler());
  const targetOpacity = useRef(1);
  const currentOpacity = useRef(1);

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

    const lerpFactor = Math.min(delta * 4.5, 1);
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
  });

  return (
    <group ref={groupRef}>
      {partId === 'gong' && (
        <>
          <mesh castShadow receiveShadow material={materials}>
            <boxGeometry args={[3.2, 0.45, 0.9]} />
          </mesh>
          <mesh position={[-1.55, 0.08, 0]} castShadow receiveShadow material={materialsDark}>
            <boxGeometry args={[0.5, 0.55, 1.0]} />
          </mesh>
          <mesh position={[1.55, 0.08, 0]} castShadow receiveShadow material={materialsDark}>
            <boxGeometry args={[0.5, 0.55, 1.0]} />
          </mesh>
          <mesh position={[0, 0.32, 0]} castShadow receiveShadow material={materialsLight}>
            <boxGeometry args={[1.0, 0.25, 0.85]} />
          </mesh>
        </>
      )}

      {partId === 'dou' && (
        <>
          <mesh position={[0, -0.35, 0]} castShadow receiveShadow material={materials}>
            <boxGeometry args={[1.1, 0.35, 1.0]} />
          </mesh>
          <mesh position={[0, 0.15, 0]} castShadow receiveShadow material={materialsDark}>
            <boxGeometry args={[1.4, 0.7, 1.2]} />
          </mesh>
          <mesh position={[0, 0.65, 0]} castShadow receiveShadow material={materialsLight}>
            <boxGeometry args={[1.6, 0.3, 1.4]} />
          </mesh>
          <mesh position={[0, 0.78, 0]} castShadow receiveShadow material={materialsDark}>
            <boxGeometry args={[1.7, 0.35, 0.45]} />
          </mesh>
        </>
      )}

      {partId === 'fang' && (
        <>
          <mesh castShadow receiveShadow material={materials}>
            <boxGeometry args={[3.8, 0.4, 0.4]} />
          </mesh>
          <mesh position={[-1.9, 0, 0]} castShadow receiveShadow material={materialsDark}>
            <boxGeometry args={[0.25, 0.5, 0.5]} />
          </mesh>
          <mesh position={[1.9, 0, 0]} castShadow receiveShadow material={materialsDark}>
            <boxGeometry args={[0.25, 0.5, 0.5]} />
          </mesh>
        </>
      )}
    </group>
  );
}

function PartLabel({ partId }: { partId: PartId }) {
  const ref = useRef<THREE.Group>(null);
  const targetPos = useRef(new THREE.Vector3());
  const currentPos = useRef(new THREE.Vector3());

  const isDetached = useDisassemblyStore((s) => s.isPartDetached(partId));

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

  const labelColor = isDetached ? '#f5d79e' : '#c9a474';
  const bgColor = isDetached ? '#6b4423' : '#3e2723';

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

export function DougongMesh() {
  return (
    <group>
      <mesh position={[0, -1.55, 0]} receiveShadow>
        <cylinderGeometry args={[0.65, 0.7, 0.1, 32]} />
        <meshStandardMaterial color={0x3e2723} roughness={0.92} metalness={0.04} />
      </mesh>
      <mesh position={[0, -1.45, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.58, 0.58, 0.15, 32]} />
        <meshStandardMaterial color={0x6b4423} roughness={0.8} metalness={0.05} />
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
