import React from 'react';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import Scene from './Scene';
import { Vector3 } from 'three';

export const InteractiveThreeSphere: React.FC = () => {
  // Define the container center - this is the center of the sphere in the scene
  const containerCenter = new Vector3(0, 0, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-[500px]"
    >
      <Canvas camera={{ position: [0, 0, 5], fov: 40 }}>
        <Scene containerCenter={containerCenter} />
      </Canvas>
    </motion.div>
  );
};
