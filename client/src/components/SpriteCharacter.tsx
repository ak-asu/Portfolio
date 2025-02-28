import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';

type Expression = 'neutral' | 'happy' | 'excited' | 'curious';

export const SpriteCharacter = () => {
  const characterRef = useRef<HTMLDivElement>(null);
  const [expression, setExpression] = useState<Expression>('neutral');
  const animationLevel = useSelector((state: RootState) => state.mode.animationLevel);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!characterRef.current) return;

      const { left, top, width, height } = characterRef.current.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;

      // Calculate angle for eye movement
      const angleX = (e.clientX - centerX) / 30;
      const angleY = (e.clientY - centerY) / 30;

      // Apply smoother transitions based on animation level
      const transition = 
        animationLevel === 'basic' ? 'transform 0.1s ease' :
        animationLevel === 'medium' ? 'transform 0.2s ease' :
        'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

      if (characterRef.current) {
        characterRef.current.style.transition = transition;
        characterRef.current.style.transform = `rotateY(${angleX}deg) rotateX(${-angleY}deg)`;
      }

      // Update expression based on mouse position
      const distanceFromCenter = Math.sqrt(
        Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
      );

      if (distanceFromCenter < 100) {
        setExpression('excited');
      } else if (distanceFromCenter < 200) {
        setExpression('happy');
      } else if (distanceFromCenter < 300) {
        setExpression('curious');
      } else {
        setExpression('neutral');
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [animationLevel]);

  const getExpressionStyles = () => {
    switch (expression) {
      case 'happy':
        return {
          eyes: 'w-2 h-2 bg-black rounded-full',
          mouth: 'w-4 h-2 bg-black rounded-full'
        };
      case 'excited':
        return {
          eyes: 'w-2 h-2 bg-black rounded-full animate-bounce',
          mouth: 'w-5 h-3 bg-black rounded-full'
        };
      case 'curious':
        return {
          eyes: 'w-2 h-2 bg-black rounded-full',
          mouth: 'w-3 h-2 bg-black rounded-full rotate-45'
        };
      default:
        return {
          eyes: 'w-2 h-2 bg-black rounded-full',
          mouth: 'w-4 h-1 bg-black rounded-full'
        };
    }
  };

  const styles = getExpressionStyles();

  const expressionDescriptions = {
    neutral: 'I\'m waiting to interact with you',
    happy: 'I\'m happy to see you!',
    excited: 'I\'m super excited!',
    curious: 'Hmm, what\'s going on?'
  };

  return (
    <motion.div
      ref={characterRef}
      className="fixed bottom-4 right-4 w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring" }}
      role="img"
      aria-label={`Interactive character feeling ${expression}: ${expressionDescriptions[expression]}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          setExpression(prev => 
            prev === 'neutral' ? 'happy' :
            prev === 'happy' ? 'excited' :
            prev === 'excited' ? 'curious' : 'neutral'
          );
        }
      }}
    >
      <div className="relative w-8 h-8">
        {/* Eyes */}
        <div className={`absolute left-1 top-2 ${styles.eyes}`} aria-hidden="true" />
        <div className={`absolute right-1 top-2 ${styles.eyes}`} aria-hidden="true" />
        {/* Mouth */}
        <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 ${styles.mouth}`} aria-hidden="true" />
      </div>
      {/* Hidden live region for expression changes */}
      <div 
        className="sr-only" 
        role="status" 
        aria-live="polite"
      >
        {expressionDescriptions[expression]}
      </div>
    </motion.div>
  );
};