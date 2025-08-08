import React, { useState, useRef, useEffect } from "react";
import { useAnimation } from "framer-motion";
import "./referenceS.css";
import NavigationButtons from "./NavigationButtons";
import PageContent from "./PageContent";
import educationData from "@/data/education.json";
import useWindowSize from "@/hooks/use-window-size";

const Education2: React.FC = () => {
  // State to track current page location
  const [currentLocation, setCurrentLocation] = useState(0);
  const numOfPapers = educationData.length + 1; // Extra one for the front/back cover page
  // Add state for animation and content
  const [textWritten, setTextWritten] = useState(false);
  const pencilAnimation = useAnimation();
  // Get window size to determine if we need mobile behavior
  const { width: windowWidth } = useWindowSize();
  // Refs for DOM elements
  const bookRef = useRef<HTMLDivElement>(null);
  const prevBtnRef = useRef<HTMLButtonElement>(null);
  const nextBtnRef = useRef<HTMLButtonElement>(null);
  const paperRefs = Array.from({ length: numOfPapers }, () =>
    useRef<HTMLDivElement>(null),
  );

  // Calculate if we need mobile book behavior (360° turn instead of 180°)
  const isMobileBehavior = () => {
    if (!bookRef.current) return false;
    const bookWidth = bookRef.current.offsetWidth;
    const openBookWidth = bookWidth * 2; // When opened, book is roughly twice as wide
    const bufferSpace = 80; // Extra buffer for padding/margins and safe spacing
    return openBookWidth > windowWidth - bufferSpace;
  };

  // Start the writing animation when page is flipped
  useEffect(() => {
    if (currentLocation > 0 && currentLocation < numOfPapers) {
      setTextWritten(false);
      const animateWriting = async () => {
        await pencilAnimation.start({
          x: [0, 150, 0, 150, 0],
          y: [0, 20, 40, 60, 80],
          transition: { duration: 2 },
        });
        setTextWritten(true);
      };
      animateWriting();
    }
  }, [currentLocation, pencilAnimation]);

  // Update CSS custom property for page turn behavior based on screen size
  useEffect(() => {
    const shouldUseMobileBehavior = isMobileBehavior();
    const bookElement = bookRef.current;
    if (bookElement) {
      bookElement.style.setProperty(
        '--page-turn-angle', 
        shouldUseMobileBehavior ? '360deg' : '180deg'
      );
      bookElement.classList.toggle('mobile-book', shouldUseMobileBehavior);
      
      // Update all currently flipped pages to use the new rotation angle
      paperRefs.forEach((ref) => {
        if (ref.current && ref.current.classList.contains('flipped')) {
          const front = ref.current.querySelector('.front') as HTMLElement;
          const back = ref.current.querySelector('.back') as HTMLElement;
          if (front && back) {
            const newAngle = shouldUseMobileBehavior ? '-360deg' : '-180deg';
            front.style.transform = `rotateY(${newAngle})`;
            back.style.transform = `rotateY(${newAngle})`;
          }
        }
      });
    }
  }, [windowWidth, currentLocation]);

  // Book functions
  const openBook = () => {
    if (bookRef.current && prevBtnRef.current && nextBtnRef.current) {
      const shouldUseMobileBehavior = isMobileBehavior();
      if (shouldUseMobileBehavior) {
        // In mobile mode, don't translate the book horizontally
        bookRef.current.style.transform = "translateX(0%)";
        prevBtnRef.current.style.transform = "translateX(-80px)";
        nextBtnRef.current.style.transform = "translateX(80px)";
      } else {
        // Desktop behavior - translate book to center
        bookRef.current.style.transform = "translateX(50%)";
        prevBtnRef.current.style.transform = "translateX(-180px)";
        nextBtnRef.current.style.transform = "translateX(180px)";
      }
    }
  };

  const closeBook = (isAtBeginning: boolean) => {
    if (bookRef.current && prevBtnRef.current && nextBtnRef.current) {
      const shouldUseMobileBehavior = isMobileBehavior();
      if (shouldUseMobileBehavior) {
        // In mobile mode, keep book centered
        bookRef.current.style.transform = "translateX(0%)";
      } else {
        // Desktop behavior
        if (isAtBeginning) {
          bookRef.current.style.transform = "translateX(0%)";
        } else {
          bookRef.current.style.transform = "translateX(100%)";
        }
      }
      prevBtnRef.current.style.transform = "translateX(0px)";
      nextBtnRef.current.style.transform = "translateX(0px)";
    }
  };

  // Page turning functions
  const goNextPage = () => {
    if (currentLocation < numOfPapers) {
      if (currentLocation === 0) {
        openBook();
      } else if (currentLocation === numOfPapers - 1) {
        closeBook(false);
      }
      paperRefs[currentLocation]?.current?.classList.add("flipped");
      if (paperRefs[currentLocation]?.current)
        paperRefs[currentLocation].current.style.zIndex =
          `${currentLocation + 1}`;
      setCurrentLocation(currentLocation + 1);
    }
  };

  const goPrevPage = () => {
    if (currentLocation > 0) {
      if (currentLocation === 1) {
        closeBook(true);
      } else if (currentLocation === numOfPapers) {
        openBook();
      }
      paperRefs[currentLocation - 1]?.current?.classList.remove("flipped");
      if (paperRefs[currentLocation - 1]?.current)
        paperRefs[currentLocation - 1].current!.style.zIndex =
          `${numOfPapers + 1 - currentLocation}`;
      setCurrentLocation(currentLocation - 1);
    }
  };

  // Handle page navigation for the NavigationButtons component
  const handlePageClick = (direction: "prev" | "next") => {
    if (direction === "next") {
      goNextPage();
    } else {
      goPrevPage();
    }
  };

  return (
    <div className="book-container">
      {/* Book */}
      <div id="book" className="book" ref={bookRef}>
        {paperRefs.map((ref, index) => (
          <div key={`p${index}`} id={`p${index}`} className="paper" ref={ref}>
            <div className="front">
              <div id={`f${index}`} className="front-content">
                <PageContent
                  pageIndex={2 * index}
                  totalPages={numOfPapers}
                  textWritten={textWritten}
                  pencilAnimation={pencilAnimation}
                  education={educationData}
                />
              </div>
            </div>
            <div className="back">
              <div id={`b${index}`} className="back-content">
                <PageContent
                  pageIndex={2 * index + 1}
                  totalPages={numOfPapers}
                  textWritten={textWritten}
                  pencilAnimation={pencilAnimation}
                  education={educationData}
                  isBackSide={true}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Navigation Buttons */}
      <NavigationButtons
        currentPage={currentLocation}
        totalPages={numOfPapers}
        handlePageClick={handlePageClick}
      />
      {/* Hidden buttons for keyboard accessibility */}
      <button
        id="prev-btn"
        ref={prevBtnRef}
        onClick={goPrevPage}
        className="sr-only"
        aria-label="Previous page"
      >
        Previous
      </button>
      <button
        id="next-btn"
        ref={nextBtnRef}
        onClick={goNextPage}
        className="sr-only"
        aria-label="Next page"
      >
        Next
      </button>
    </div>
  );
};

export default Education2;
