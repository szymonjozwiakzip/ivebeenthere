import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import styles from './Globe3D.module.css';

function GlobeMesh() {
  const groupRef = useRef<THREE.Group>(null);

  const gridLines = useMemo(() => {
    const gridMaterial = new THREE.LineBasicMaterial({
      color: '#2563eb',
      transparent: true,
      opacity: 0.55,
    });
    const lines: THREE.Line[] = [];
    const radius = 1.01;

    for (let lat = -60; lat <= 60; lat += 30) {
      const points: THREE.Vector3[] = [];
      const phi = (90 - lat) * (Math.PI / 180);
      for (let lng = 0; lng <= 360; lng += 4) {
        const theta = lng * (Math.PI / 180);
        points.push(
          new THREE.Vector3(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta),
          ),
        );
      }
      lines.push(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), gridMaterial));
    }

    for (let lng = 0; lng < 360; lng += 30) {
      const points: THREE.Vector3[] = [];
      const theta = lng * (Math.PI / 180);
      for (let lat = -90; lat <= 90; lat += 4) {
        const phi = (90 - lat) * (Math.PI / 180);
        points.push(
          new THREE.Vector3(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta),
          ),
        );
      }
      lines.push(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), gridMaterial));
    }

    return lines;
  }, []);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.008;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial color="#ffffff" roughness={0.35} metalness={0.05} />
      </mesh>
      <group>
        {gridLines.map((line, i) => (
          <primitive key={i} object={line} />
        ))}
      </group>
    </group>
  );
}

interface Globe3DProps {
  size?: number;
}

export function Globe3D({ size = 64 }: Globe3DProps) {
  return (
    <div className={styles.wrapper} style={{ width: size, height: size }} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 2.6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.85} />
        <directionalLight position={[4, 2, 4]} intensity={1.1} />
        <directionalLight position={[-3, -1, -2]} intensity={0.3} />
        <GlobeMesh />
      </Canvas>
      <div className={styles.shadow} />
    </div>
  );
}
