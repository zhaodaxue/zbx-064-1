import { useMemo } from 'react';
import * as THREE from 'three';

export function SceneSetup() {
  const floorGeometry = useMemo(() => {
    return new THREE.PlaneGeometry(20, 20);
  }, []);

  return (
    <>
      <color attach="background" args={[0x1f140c]} />
      <fog attach="fog" args={[0x1f140c, 12, 28]} />

      <ambientLight intensity={0.35} color={0xf5e6d3} />

      <directionalLight
        position={[5, 8, 4]}
        intensity={1.1}
        color={0xffd9a8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />

      <directionalLight
        position={[-4, 3, -3]}
        intensity={0.35}
        color={0xb8c8e0}
      />

      <directionalLight
        position={[0, -2, -5]}
        intensity={0.25}
        color={0xd4a574}
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.6, 0]} receiveShadow>
        <primitive object={floorGeometry} attach="geometry" />
        <meshStandardMaterial
          color={0x2c1810}
          roughness={0.95}
          metalness={0.02}
        />
      </mesh>

      <gridHelper
        args={[20, 40, 0x5d4037, 0x3e2723]}
        position={[0, -1.59, 0]}
      />
    </>
  );
}
