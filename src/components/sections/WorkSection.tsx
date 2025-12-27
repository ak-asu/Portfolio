import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Sphere, RoundedBox } from "@react-three/drei";
import { motion } from "framer-motion";
import { useState, useRef } from "react";
import * as THREE from "three";
import { useAudioSystem } from "@/hooks/useAudioSystem";
import workDataRaw from "@/data/work.json";

// Format date to readable period
const formatPeriod = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const startMonth = start.toLocaleString("en-US", { month: "short" });
  const startYear = start.getFullYear();
  const endMonth = end.toLocaleString("en-US", { month: "short" });
  const endYear = end.getFullYear();

  const isPresent = new Date(endDate) > new Date();
  return `${startMonth} ${startYear} - ${isPresent ? "Present" : `${endMonth} ${endYear}`}`;
};

// Check if position is currently active
const isCurrentlyActive = (endDate: string) => {
  return new Date(endDate) > new Date();
};

// Transform work data to match component structure
const workData = workDataRaw.map((work, index) => ({
  id: index + 1,
  role: work.position,
  company: work.company,
  location: work.location,
  period: formatPeriod(work.startDate, work.endDate),
  highlights: work.description,
  active: isCurrentlyActive(work.endDate),
}));

// Interactive 3D Hologram Card
const HologramCard = ({
  work,
  isActive,
}: {
  work: (typeof workData)[0];
  isActive: boolean;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const { gl } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const lastMousePos = useRef({ x: 0, y: 0 });

  useFrame(() => {
    if (groupRef.current && !isDragging) {
      // Auto-rotate slowly when not dragging
      groupRef.current.rotation.y += 0.003;
    }
  });

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    setIsDragging(true);
    lastMousePos.current = { x: e.point?.x || 0, y: e.point?.y || 0 };
    gl.domElement.style.cursor = "grabbing";
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    gl.domElement.style.cursor = "grab";
  };

  const handlePointerMove = (e: any) => {
    if (!isDragging || !groupRef.current) return;

    const deltaX = (e.point?.x || 0) - lastMousePos.current.x;
    const deltaY = (e.point?.y || 0) - lastMousePos.current.y;

    groupRef.current.rotation.y += deltaX * 0.5;
    groupRef.current.rotation.x -= deltaY * 0.5;

    // Clamp X rotation
    groupRef.current.rotation.x = Math.max(
      -0.5,
      Math.min(0.5, groupRef.current.rotation.x),
    );

    lastMousePos.current = { x: e.point?.x || 0, y: e.point?.y || 0 };
  };

  return (
    <group
      ref={groupRef}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerMove={handlePointerMove}
    >
      {/* Content via Html */}
      <Html
        position={[0, 0.25, 0.1]}
        transform
        occlude
        style={{
          width: "320px",
          height: "200px",
          pointerEvents: "none",
        }}
      >
        <div
          className="text-center select-none"
          style={{ transform: "scale(0.75)" }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-left">
              <h3 className="font-orbitron text-base text-foreground leading-tight">
                {work.role}
              </h3>
              <p className="font-rajdhani text-iron-gold text-xs mt-0.5">
                {work.company}
              </p>
              <p className="font-rajdhani text-foreground/50 text-[10px]">
                {work.location}
              </p>
            </div>
            <div className="text-right">
              <p className="font-orbitron text-arc-blue text-[10px]">
                {work.period}
              </p>
              {work.active && (
                <div className="flex items-center gap-1 mt-1 px-1.5 py-0.5 bg-arc-blue/20 border border-arc-blue/50 rounded-full">
                  <div className="w-1 h-1 rounded-full bg-arc-blue animate-pulse" />
                  <span className="font-orbitron text-[8px] text-arc-blue">
                    ACTIVE
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-arc-blue/50 to-transparent my-1.5" />

          <ul className="space-y-0.5 text-left">
            {work.highlights.map((highlight, index) => (
              <li
                key={index}
                className="flex items-start gap-1.5 text-foreground/80 font-rajdhani text-[10px] leading-snug"
              >
                <span className="text-arc-blue text-xs">▸</span>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>

          <p className="mt-2 font-orbitron text-[8px] text-iron-gold/50 uppercase tracking-wider">
            Drag to rotate hologram
          </p>
        </div>
      </Html>
    </group>
  );
};

// 3D Scene with hologram
const WorkScene = ({
  selectedWork,
}: {
  selectedWork: (typeof workData)[0];
}) => {
  return (
    <Canvas camera={{ position: [0, 0, 7], fov: 50 }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 5]} intensity={1} color="#00BFFF" />
      <pointLight position={[-5, 0, 3]} intensity={0.8} color="#C49102" />
      <pointLight position={[5, 0, 3]} intensity={0.5} color="#00BFFF" />
      <spotLight
        position={[0, 5, 5]}
        angle={0.5}
        penumbra={1}
        intensity={0.5}
        color="#00BFFF"
      />

      {/* Central 3D Hologram Card */}
      <group position={[0.5, 0, 0]}>
        <HologramCard work={selectedWork} isActive={true} />
      </group>

      {/* Projection light rays - fan out from selected label to panel center vertical */}
      {(() => {
        const selectedIndex = workData.findIndex(
          (w) => w.id === selectedWork.id,
        );
        if (selectedIndex === -1) return null;

        const spacing = workData.length > 1 ? 3 / (workData.length - 1) : 0;
        const labelY = 1.5 - selectedIndex * spacing;
        const startX = -3.8; // Just to the right of label
        const startY = labelY;
        const endX = 0.5; // Center X of hologram panel

        // Create 10 rays fanning out from single point to center vertical line of panel
        const numRays = 10;
        const hologramHeight = 2.4; // Height of hologram card
        const fanStart = -hologramHeight / 2;
        const fanEnd = hologramHeight / 2;

        return Array.from({ length: numRays }).map((_, i) => {
          const endY = fanStart + (i / (numRays - 1)) * (fanEnd - fanStart);

          // Create line geometry
          const points = [
            new THREE.Vector3(startX, startY, -0.5),
            new THREE.Vector3(endX, endY, -0.5),
          ];
          const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

          return (
            <line key={i} geometry={lineGeometry}>
              <lineBasicMaterial
                color="#00BFFF"
                transparent
                opacity={0.4}
                linewidth={2}
              />
            </line>
          );
        });
      })()}

      {/* Grid lines for depth */}
      {Array.from({ length: 11 }).map((_, i) => (
        <mesh key={i} position={[0, -2.5 + i * 0.5, -3]} rotation={[0, 0, 0]}>
          <boxGeometry args={[14, 0.003, 0.003]} />
          <meshBasicMaterial color="#00BFFF" transparent opacity={0.08} />
        </mesh>
      ))}
    </Canvas>
  );
};

export const WorkSection = () => {
  const [selectedId, setSelectedId] = useState(1);
  const selectedWork = workData.find((w) => w.id === selectedId) || workData[0];
  const { playClick, playHover, playBeep } = useAudioSystem();

  const handleSelect = (id: number) => {
    playBeep();
    setSelectedId(id);
  };

  return (
    <section className="relative h-screen w-full overflow-hidden flex flex-col">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-arc-blue/5 to-background" />

      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-30"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 191, 255, 0.03) 2px, rgba(0, 191, 255, 0.03) 4px)",
        }}
      />

      {/* 3D Canvas */}
      <div className="flex-1 relative z-10">
        <WorkScene selectedWork={selectedWork} />
      </div>

      {/* Clickable labels on left side */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
        {workData.map((work) => (
          <motion.button
            key={work.id}
            onClick={() => handleSelect(work.id)}
            onMouseEnter={playHover}
            className={`text-left transition-all duration-300 ${
              selectedId === work.id
                ? "opacity-100"
                : "opacity-60 hover:opacity-90"
            }`}
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.98 }}
          >
            <p
              className={`font-orbitron text-[10px] mb-0.5 ${
                selectedId === work.id ? "text-arc-blue" : "text-iron-gold"
              }`}
            >
              {work.period}
            </p>
            <p
              className={`font-rajdhani text-sm font-medium ${
                selectedId === work.id
                  ? "text-foreground"
                  : "text-foreground/80"
              }`}
            >
              {work.company}
            </p>
            <p className="font-rajdhani text-[10px] text-foreground/50">
              {work.location}
            </p>
          </motion.button>
        ))}
      </div>
    </section>
  );
};
