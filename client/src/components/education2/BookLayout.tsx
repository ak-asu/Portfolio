import React, { useState, useRef } from 'react';
import NavigationButtons from './Navigation';

interface BookLayoutProps {
  pages: React.ReactNode[];
  frontCover?: React.ReactNode;
  backCover?: React.ReactNode;
  className?: string;
}

const BookLayout: React.FC<BookLayoutProps> = ({ 
  pages, 
  frontCover, 
  backCover,
  className = '' 
}) => {
  // -1: closed (front cover), 0-n: open pages, pages.length: closed (back cover)
  const [currentPage, setCurrentPage] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Display logic for left and right pages
  const renderPages = () => {
    // Front cover state (closed book)
    if (currentPage === -1) {
      return {
        left: null,
        right: frontCover || (
          <div className="text-center">
            <h2 className="text-xl font-bold">Front Cover</h2>
          </div>
        )
      };
    }
    
    // Back cover state (closed book after reading)
    if (currentPage === pages.length) {
      return {
        left: backCover || (
          <div className="text-center">
            <h2 className="text-xl font-bold">Back Cover</h2>
          </div>
        ),
        right: null
      };
    }
    
    // Ensure currentPage is always even (for left page) when in open book state
    const adjustedPage = currentPage % 2 !== 0 ? currentPage - 1 : currentPage;
    
    return {
      left: pages[adjustedPage],
      right: pages[adjustedPage + 1] || null
    };
  };

  const handlePageClick = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentPage === 0) {
        // From first page spread to front cover
        setCurrentPage(-1);
      } else if (currentPage > 0) {
        // Regular backward navigation (by 2 for page spreads)
        setCurrentPage(currentPage - 2);
      }
    } else if (direction === 'next') {
      if (currentPage === -1) {
        // From front cover to first page spread
        setCurrentPage(0);
      } else if (currentPage < pages.length - 2) {
        // Regular forward navigation (by 2 for page spreads)
        setCurrentPage(currentPage + 2);
      } else if (currentPage < pages.length && currentPage >= pages.length - 2) {
        // From last page spread to back cover
        setCurrentPage(pages.length);
      }
    }
  };
  
  // Calculate total "states" of the book (front cover + page spreads + back cover)
  const totalStates = Math.ceil(pages.length / 2) + 2; // +2 for front and back covers
  
  // Calculate current state index (0: front cover, 1-(total-2): page spreads, total-1: back cover)
  const currentState = currentPage === -1 ? 0 : (currentPage === pages.length ? totalStates - 1 : Math.floor(currentPage / 2) + 1);

  // Get pages to display
  const { left, right } = renderPages();
  
  // Determine if the book is closed (showing only front or back cover)
  const isBookClosed = currentPage === -1 || currentPage === pages.length;

  return (
    <div className={`relative ${className}`}>
      {/* Container with 5:3 aspect ratio */}
      <div 
        ref={containerRef}
        className="w-full relative"
        style={{ paddingBottom: '60%' }} // 3/5 = 60% for 5:3 aspect ratio
      >
        <div className={`absolute inset-0 flex ${!isBookClosed ? 'border rounded-md' : ''} overflow-hidden shadow-lg`}>
          {/* Left page */}
          <div className={`w-1/2 ${!isBookClosed && right ? 'border-r' : ''} ${left ? 'bg-background dark:bg-background' : 'bg-transparent'} p-4 overflow-auto ${currentPage === pages.length ? 'border rounded-md' : ''}`}>
            <div className="h-full flex items-center justify-center">
              {left}
            </div>
          </div>
          
          {/* Right page */}
          <div className={`w-1/2 ${right ? 'bg-background dark:bg-background' : 'bg-transparent'} p-4 overflow-auto ${currentPage === -1 ? 'border rounded-md' : ''}`}>
            <div className="h-full flex items-center justify-center">
              {right}
            </div>
          </div>
          
          {/* Center binding effect - only show when book is open */}
          {!isBookClosed && (
            <div className="absolute h-full w-[3px] left-1/2 transform -translate-x-1/2 bg-gray-300 dark:bg-gray-700 shadow-inner"></div>
          )}
        </div>
      </div>
      
      {/* Navigation buttons */}
      <NavigationButtons 
        currentPage={currentState}
        totalPages={totalStates}
        handlePageClick={handlePageClick}
      />
    </div>
  );
};

export default BookLayout;
