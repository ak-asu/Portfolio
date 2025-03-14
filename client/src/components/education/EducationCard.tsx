import React, { useState, useRef, useEffect } from 'react';
import { useAnimation } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveEducation } from '@/store/features/educationSlice';
import education from '@/data/education.json';
import BookPage from './BookPage';
import NavigationButtons from './NavigationButtons';
import BookBinding from './BookBinding';
import DragIndicators from './DragIndicators';
import PageContent from './PageContent';
import { getAnimationLevel } from '@/lib/types';

const EducationCard: React.FC = () => {
  const dispatch = useDispatch();
  const activeEducation = useSelector((state: any) => state.education.activeEducation);
  const animationLevel = useSelector((state: any) => state.mode.animationLevel);
  const [currentPage, setCurrentPage] = useState(0);
  const [dragStartX, setDragStartX] = useState(0);
  const [textWritten, setTextWritten] = useState(false);
  const bookRef = useRef<HTMLDivElement>(null);
  const pencilAnimation = useAnimation();
  const textAnimation = useAnimation();
  const [dragProgress, setDragProgress] = useState(0);
  const totalPages = education.length + 1;

  const animateWriting = async () => {
    if (currentPage === 0 || currentPage === totalPages - 1) {
      setTextWritten(true);
      return;
    }
    setTextWritten(false);
    const contentHeight = 300; // Estimated content height
    await pencilAnimation.start({
      x: [0, 300, 0, 300, 0],
      y: [0, 50, 100, 150, 200],
      transition: { duration: getAnimationLevel(animationLevel, { min: 0.5, max: 2 }) }
    });
    setTextWritten(true);
  };

  useEffect(() => {
    if (activeEducation !== currentPage - 1 && currentPage > 0 && currentPage < totalPages - 1) {
      dispatch(setActiveEducation(currentPage - 1));
    }
    animateWriting();
  }, [currentPage]);

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if ('touches' in e) {
      setDragStartX(e.touches[0].clientX);
    } else {
      setDragStartX(e.clientX);
    }
  };

  const handleDragMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const diff = clientX - dragStartX;
    const w = bookRef.current?.clientWidth || 800;
    const distanceFromCenter = Math.abs(w/2 - dragStartX);
    const maxDiff = 2 * distanceFromCenter;
    const normalizedDiff = Math.max(Math.min(Math.abs(diff), maxDiff), -maxDiff) * Math.sign(diff);
    const threshold = 100;
    const progressPercentage = Math.min(Math.abs(normalizedDiff) / threshold, 1);
    setDragProgress(normalizedDiff > 0 ? progressPercentage : -progressPercentage);
    if (Math.abs(normalizedDiff) > threshold) {
      if (normalizedDiff > 0 && currentPage > 0) {
        handlePageFlip(currentPage - 1);
      } else if (normalizedDiff < 0 && currentPage < totalPages - 1) {
        handlePageFlip(currentPage + 1);
      }
      setDragProgress(0);
    }
  };

  const handleDragEnd = () => {
    setDragProgress(0);
  };

  const handlePageClick = (direction: 'prev' | 'next') => {
    let newPage = currentPage;
    if (direction === 'prev' && currentPage > 0) {
      newPage = currentPage - 1;
    } else if (direction === 'next' && currentPage < totalPages - 1) {
      newPage = currentPage + 1;
    }
    if (newPage !== currentPage) {
      handlePageFlip(newPage);
    }
  };

  const handlePageFlip = (newPage: number) => {
    if (newPage !== currentPage) {
      setCurrentPage(newPage);
      const direction = newPage > currentPage ? -1 : 1;
      let steps = 10;
      const interval = 1000 / steps;
      let step = 0;
      const animateProgress = () => {
        step++;
        const progress = (steps - step) / steps * direction;
        setDragProgress(progress);
        if (step < steps/2) {
          setTimeout(animateProgress, interval);
        } else {
          setDragProgress(0);
        }
      };
      animateProgress();
    }
  };

  const getDragStyle = (index: number) => {
    if (dragProgress === 0) return {};
    
    // Current page being dragged to the left (going forward)
    if (index === currentPage && dragProgress < 0) {
      const rotationAmount = dragProgress * 180;
      return {
        transform: `rotateY(${rotationAmount}deg)`,
        transformOrigin: 'left center',
        transition: { duration: 0 }
      };
    }
    
    // Previous page being dragged to the right (going backward)
    if (index === currentPage - 1 && dragProgress > 0) {
      const rotationAmount = dragProgress * 180;
      return {
        transform: `rotateY(${rotationAmount}deg)`,
        transformOrigin: 'right center',
        transition: { duration: 0 }
      };
    }
    
    return {};
  };

  return (
    <div className="flex items-center justify-center w-full py-12">
      <div
        ref={bookRef}
        className="relative w-[800px] h-[500px] mx-auto"
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        <div className="relative w-full h-full" style={{ perspective: '1500px' }}>
          <BookBinding />
          {Array.from({ length: totalPages }).map((_, i) => {
            const isVisible = i === currentPage || i === currentPage - 1 || 
                             (i < currentPage && i >= currentPage - 3);
            
            return isVisible ? (
              <BookPage
                key={i}
                isFlipped={currentPage > i}
                zIndex={totalPages - Math.abs(currentPage - i)}
                dragStyle={getDragStyle(i)}
              >
                <PageContent
                  pageIndex={2 * i}
                  totalPages={2 * totalPages}
                  textWritten={textWritten}
                  pencilAnimation={pencilAnimation}
                  education={education}
                  isBackSide={i < currentPage}
                />
                <PageContent
                  pageIndex={2 * i + 1}
                  totalPages={2 * totalPages}
                  textWritten={textWritten}
                  pencilAnimation={pencilAnimation}
                  education={education}
                  isBackSide={i >= currentPage}
                />
              </BookPage>
            ) : null;
          })}
          {/* Click areas for page turning */}
          <div
            className="absolute top-0 left-0 w-1/4 h-full cursor-pointer z-20"
            onClick={() => handlePageClick('prev')}
            aria-label="Previous page"
          />
          <div
            className="absolute top-0 right-0 w-1/4 h-full cursor-pointer z-20"
            onClick={() => handlePageClick('next')}
            aria-label="Next page"
          />
        </div>
        <DragIndicators
          isDragging={dragProgress !== 0}
          dragProgress={dragProgress}
          currentPage={currentPage}
          totalPages={totalPages}
        />
        <NavigationButtons
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageClick={handlePageClick}
        />
      </div>
    </div>
  );
};

export default EducationCard;