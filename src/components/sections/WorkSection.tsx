import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Sphere, RoundedBox } from "@react-three/drei";
import { motion } from "framer-motion";
import { useState, useRef } from "react";
import * as THREE from "three";
import { useAudioSystem } from "@/hooks/useAudioSystem";
import { useIsMobile } from "@/hooks/use-mobile";
import { useReducedMotion } from "@/hooks/useReducedMotion";
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
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const lastMousePos = useRef({ x: 0, y: 0 });

  useFrame(() => {
    if (groupRef.current && !isDragging && !prefersReducedMotion) {
      // Auto-rotate slowly when not dragging and animations are enabled
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
        position={[0, 0, 0.1]}
        transform
        occlude
        style={{
          width: isMobile ? "190px" : "380px",
          height: "36vh",
          pointerEvents: "none",
        }}
      >
        <div
          className="text-center select-none px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-lg h-full flex flex-col"
          style={{
            background:
              "linear-gradient(180deg, rgba(0, 100, 24, 0.15) 0%, rgba(0, 0, 0, 0.3) 100%)",
            border: "2px solid rgba(0, 191, 255, 0.3)",
            boxShadow: "0 0 20px rgba(0, 191, 255, 0.2)",
          }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-1 mb-1">
            <div className="text-left">
              <h3 className="font-orbitron text-[7px] sm:text-xs text-foreground leading-tight">
                {work.role}
              </h3>
              <p className="font-rajdhani text-iron-gold text-[6px] sm:text-[10px] mt-0.5">
                {work.company}
              </p>
              <p className="font-rajdhani text-foreground/50 text-[5px] sm:text-[8px]">
                {work.location}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="font-orbitron text-arc-blue text-[5px] sm:text-[8px]">
                {work.period}
              </p>
              {work.active && (
                <div className="flex items-center gap-0.5 mt-0.5 px-1 py-0.5 bg-arc-blue/20 border border-arc-blue/50 rounded-full">
                  <div className="w-1 h-1 rounded-full bg-arc-blue animate-pulse" />
                  <span className="font-orbitron text-[4px] sm:text-[7px] text-arc-blue">
                    ACTIVE
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="h-px bg-linear-to-r from-transparent via-arc-blue/50 to-transparent my-0.5" />

          <ul className="space-y-0.5 text-left flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-arc-blue/30">
            {work.highlights.map((highlight, index) => (
              <li
                key={index}
                className="flex items-start gap-1 text-foreground/80 font-rajdhani text-[6px] sm:text-[10px] leading-snug"
              >
                <span className="text-arc-blue text-[7px] sm:text-[10px] shrink-0">
                  ▸
                </span>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      </Html>
    </group>
  );
};

// Scene content component to use hooks
const SceneContent = ({
  selectedWork,
}: {
  selectedWork: (typeof workData)[0];
}) => {
  const isMobile = useIsMobile();

  return (
    <>
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
      <group
        position={isMobile ? [0, -0.3, 0] : [0.5, 0, 0]}
        scale={isMobile ? 1.3 : 1}
      >
        <HologramCard work={selectedWork} isActive={true} />
      </group>

      {/* Projection light rays - fan out from selected label to panel center vertical - Desktop only */}
      {!isMobile &&
        (() => {
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
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(
              points,
            );

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
    </>
  );
};

// 3D Scene with hologram
const WorkScene = ({
  selectedWork,
}: {
  selectedWork: (typeof workData)[0];
}) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 50 }}
      style={{ width: "100%", height: "100%" }}
    >
      <SceneContent selectedWork={selectedWork} />
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

  const nextWork = () => {
    playBeep();
    const currentIndex = workData.findIndex((w) => w.id === selectedId);
    const nextIndex = (currentIndex + 1) % workData.length;
    setSelectedId(workData[nextIndex].id);
  };

  const prevWork = () => {
    playBeep();
    const currentIndex = workData.findIndex((w) => w.id === selectedId);
    const prevIndex = (currentIndex - 1 + workData.length) % workData.length;
    setSelectedId(workData[prevIndex].id);
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden flex flex-col py-8 sm:py-16 md:py-20">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-b from-background via-arc-blue/5 to-background" />

      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-30"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 191, 255, 0.03) 2px, rgba(0, 191, 255, 0.03) 4px)",
        }}
      />

      {/* 3D Canvas */}
      <div className="relative z-10 p-4 h-[420px] lg:h-[560px] items-center justify-center flex">
        <WorkScene selectedWork={selectedWork} />
      </div>

      {/* Clickable labels on left side - Desktop only */}
      <div className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 flex-col gap-3">
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

      {/* Mobile navigation */}
      <div className="md:hidden absolute bottom-12 left-0 right-0 z-20 flex items-center justify-center gap-4 px-4">
        <motion.button
          onClick={prevWork}
          className="w-10 h-10 flex items-center justify-center border-2 border-arc-blue/50 rounded-lg bg-background/50 text-arc-blue"
          whileTap={{ scale: 0.95 }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </motion.button>

        <div className="flex flex-col items-center gap-1 min-w-37.5">
          <p className="font-rajdhani text-sm text-foreground font-medium text-center">
            {selectedWork.company}
          </p>
          <p className="font-orbitron text-[10px] text-arc-blue">
            {selectedWork.period}
          </p>
        </div>

        <motion.button
          onClick={nextWork}
          className="w-10 h-10 flex items-center justify-center border-2 border-arc-blue/50 rounded-lg bg-background/50 text-arc-blue"
          whileTap={{ scale: 0.95 }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </motion.button>
      </div>
    </section>
  );
};
