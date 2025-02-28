import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThreeLaptop } from './ThreeLaptop';
import { SpriteCharacter } from './SpriteCharacter';
import { TicTacToe } from './TicTacToe';
import { ProjectCard } from './ProjectCard';
import { audioManager } from '@/lib/audio';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';

const projects = [
  {
    title: 'Project 1',
    description: 'A sample project',
    techStack: ['React', 'TypeScript', 'Node.js'],
    duration: '3 months',
    videoUrl: 'https://www.youtube.com/embed/sample1'
  },
  // Add more projects as needed
];

export const NonTechnical = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { soundEnabled, animationLevel } = useSelector((state: RootState) => state.mode);

  useEffect(() => {
    if (soundEnabled) {
      audioManager.playBackgroundMusic();
    }

    // Simulate loading delay based on animation level
    const delay = animationLevel === 'basic' ? 1000 : animationLevel === 'medium' ? 2000 : 3000;
    const timer = setTimeout(() => setIsLoading(false), delay);

    return () => {
      clearTimeout(timer);
      audioManager.stopBackgroundMusic();
    };
  }, [soundEnabled, animationLevel]);

  if (isLoading) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        role="status"
        aria-live="polite"
      >
        <div className="text-center">
          <SpriteCharacter />
          <motion.p
            animate={{
              scale: [1, 1.1, 1],
              transition: { repeat: Infinity, duration: 1 }
            }}
            className="mt-4 text-xl"
          >
            Loading your experience...
          </motion.p>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen"
        id="main-content"
        role="main"
      >
        <div className="container mx-auto px-4">
          <section 
            className="py-12"
            aria-label="Interactive 3D Model"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <ThreeLaptop />
            </motion.div>
          </section>

          <section 
            className="py-12"
            id="projects"
            aria-label="Projects"
          >
            <motion.h2
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-3xl font-bold mb-8"
            >
              Projects
            </motion.h2>
            <div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              role="list"
              aria-label="Project list"
            >
              {projects.map((project, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.2 }}
                  role="listitem"
                >
                  <ProjectCard project={project} />
                </motion.div>
              ))}
            </div>
          </section>

          <section 
            className="py-12"
            aria-label="Interactive Game"
          >
            <motion.h2
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-3xl font-bold mb-8"
            >
              Let's Play!
            </motion.h2>
            <TicTacToe />
          </section>
        </div>
      </motion.main>
    </AnimatePresence>
  );
};