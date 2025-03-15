import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import workData from '@/data/work.json';
import { WorkData, Company } from '@/lib/types';
import { RootState } from '@/store/store';
import { setActiveProject } from '@/store/features/workSlice';
import Building from './Building';
import Character from './Character';
import Home from './Home';
import WorkDetails from './WorkDetails';
import {
  CharacterState, buildingWidth, gapWidth, roadWidth,
  stateSwitchDuration, floorSwitchDuration, characterSize, buildingSwitchDuration,
  floorHeight, roadLevel, sceneHeight
} from './utils';


const prepareWorkData = (): WorkData => {
  const companies: Company[] = [];
  workData.forEach((job) => {
    const company: Company = {
      name: job.company,
      location: job.location,
      projects: [{
        title: job.company,
        description: job.description.join(' '),
        startDate: job.startDate,
        endDate: job.endDate || 'Present',
        type: 'professional'
      }]
    };
    const existingCompany = companies.find(c => c.name === job.company);
    if (existingCompany) {
      existingCompany.projects.push(...company.projects);
    } else {
      companies.push(company);
    }
  });
  return { companies };
};

const WorkScene: React.FC = () => {
  const dispatch = useDispatch();
  const { animationLevel } = useSelector((state: RootState) => state.mode);
  const activeProject = useSelector((state: RootState) => state.work.activeProject);
  const [workData, setWorkData] = useState<WorkData>(prepareWorkData());
  const [characterPosition, setCharacterPosition] = useState({ x: 0, y: 0 });
  const [targetPosition, setTargetPosition] = useState<{ x: number, y: number, buildingIndex: number, floorIndex: number } | null>(null);
  const [currentBuilding, setCurrentBuilding] = useState(-1);
  const [currentFloor, setCurrentFloor] = useState(-1);
  const [isCycleComplete, setIsCycleComplete] = useState(false);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [characterState, setCharacterState] = useState(CharacterState.Resting);

  const sceneRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const buildingRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Initially character is at home door
    setCharacterPosition({ x: gapWidth + buildingWidth / 2, y: roadLevel });
  }, []);

  const handleFloorSelect = (buildingIndex: number, floorIndex: number) => {
    if (characterState == CharacterState.Moving) return; // Prevent multiple movements at once
    setTargetPosition({
      x: gapWidth + (buildingIndex + 1) * (buildingWidth + gapWidth),
      y: roadLevel - (floorIndex * floorHeight) - characterSize,
      buildingIndex,
      floorIndex
    });
    setCharacterState(CharacterState.Moving);
  };

  const scrollToPosition = (x: number) => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollTo({
      left: Math.max(0, x - buildingWidth),
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    if (!targetPosition || characterState === CharacterState.Moving) return;
    console.log('Moving character to:', targetPosition);
    const moveCharacter = async () => {
      setCharacterState(CharacterState.Moving);
      await new Promise(resolve => setTimeout(resolve, stateSwitchDuration));
      if (currentBuilding !== targetPosition.buildingIndex) {
        // If inside a building, exit first
        if (currentFloor !== -1) {
          // Exit to the road
          setCharacterPosition(prev => ({ ...prev, y: roadLevel + characterSize / 2 }));
          await new Promise(resolve => setTimeout(resolve, floorSwitchDuration * (currentFloor + 1)));
          setCurrentFloor(-1);
        }
        // Scroll to target building
        scrollToPosition(targetPosition.x);
        // Move horizontally on the road to the target building
        setCharacterPosition(prev => ({
          ...prev,
          x: targetPosition.x,
          y: roadLevel + characterSize / 2
        }));
        await new Promise(resolve => setTimeout(resolve, buildingSwitchDuration * (Math.abs(targetPosition.buildingIndex - currentBuilding))));
        // Move up to the building floor
        setCurrentBuilding(targetPosition.buildingIndex);
      }
      setCharacterPosition(prev => ({ ...prev, y: targetPosition.y }));
      await new Promise(resolve => setTimeout(resolve, floorSwitchDuration * Math.abs(currentFloor - targetPosition.floorIndex)));
      setCurrentFloor(targetPosition.floorIndex);
      setCharacterState(CharacterState.Working);
      const company = workData.companies[targetPosition.buildingIndex];
      const project = company?.projects[targetPosition.floorIndex];
      if (project) {
        dispatch(setActiveProject({
          company: company.name,
          project: {
            title: project.title,
            description: project.description,
            startDate: project.startDate,
            endDate: project.endDate,
            type: project.type
          }
        }));
        setShowProjectDetails(true);
      }
    };
    moveCharacter();
  }, [targetPosition, characterState, currentBuilding, currentFloor, dispatch]);

  // When finished working on a floor, move to next floor or building
  useEffect(() => {
    if (characterState === CharacterState.Working) {
      console.log('Working on floor:', currentFloor, 'in building:', currentBuilding);
      // Simulate working time
      const workingTimer = setTimeout(() => {
        setCharacterState(CharacterState.Moving);
        // Find next floor or building
        const currentBuildingData = workData.companies[currentBuilding];
        if (currentBuildingData) {
          if (currentFloor < currentBuildingData.projects.length - 1) {
            // Move to next floor in the same building
            setTimeout(() => {
              handleFloorSelect(currentBuilding, currentFloor + 1);
            }, 200);
          } else if (currentBuilding < workData.companies.length - 1) {
            // Move to the next building, first floor
            setTimeout(() => {
              handleFloorSelect(currentBuilding + 1, 0);
            }, 200);
          } else {
            // Cycle complete, go home
            setTimeout(() => {
              setTargetPosition({
                x: 100, // Home position
                y: roadLevel + characterSize / 2, // Ground level
                buildingIndex: -1,
                floorIndex: -1
              });
              scrollToPosition(0);
              setCharacterState(CharacterState.Moving);
              setCurrentBuilding(-1);
              setCurrentFloor(-1);
            }, 500);
          }
        }
      }, 4000); // Work for 4 seconds on each floor
      return () => clearTimeout(workingTimer);
    }
  }, [characterState, currentBuilding, currentFloor, workData.companies.length]);

  // Rest at home and then restart the cycle
  useEffect(() => {
    if (characterState === CharacterState.Resting) {
      console.log('Resting at home');
      const restTimer = setTimeout(() => {
        setCharacterState(CharacterState.Moving);
        setIsCycleComplete(true);
        // Clear active project when at home
        dispatch(setActiveProject(null));
        setShowProjectDetails(false);
        const resetTimer = setTimeout(() => {
          setCharacterPosition({ x: 80, y: roadLevel - floorHeight });
          const cycleTimer = setTimeout(() => {
            setIsCycleComplete(false); // Reset cycle flag to start a new cycle
          }, 500);
          return () => clearTimeout(cycleTimer);
        }, 3000);
        return () => clearTimeout(resetTimer);
      }, 4000);
      return () => clearTimeout(restTimer);
    }
  }, [characterState, dispatch]);

  // Also clear the active project when we're going home
  useEffect(() => {
    if (targetPosition && targetPosition.buildingIndex === -1 && targetPosition.floorIndex === -1) {
      // We're heading home, clear the active project after a small delay
      const clearTimeoutFunc = setTimeout(() => {
        dispatch(setActiveProject(null));
        setShowProjectDetails(false);
      }, 1000);
      return () => clearTimeout(clearTimeoutFunc);
    }
  }, [targetPosition, dispatch]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      buildingRefs.current = buildingRefs.current.slice(0, workData.companies.length);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [workData.companies.length]);

  // Calculate the total content width
  const totalWidth = gapWidth + (workData.companies.length + 1) * (buildingWidth + gapWidth);

  return (
    <div
      ref={sceneRef}
      className='relative w-full bg-background'
      aria-label="Interactive work experience timeline"
      style={{ height: `${sceneHeight}px` }}
    >
      {/* Sky/Background */}
      <div
        className='absolute inset-0 h-[300px] bg-gradient-to-b from-palette-teal-light/20 to-background dark:from-palette-teal-DEFAULT/10'
        aria-hidden="true"
      />
      {/* Road */}
      <div
        className='absolute bottom-0 left-0 right-0 bg-palette-slate/30 dark:bg-palette-slate/50'
        style={{ height: `${roadWidth}px` }}
        aria-hidden="true"
      >
        {/* Road markings */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-yellow-400 dashed-road-line" aria-hidden="true" />
      </div>
      {/* Scroll container */}
      <div
        ref={scrollContainerRef}
        className="absolute inset-0 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-palette-teal scrollbar-track-transparent"
        style={{ width: '100%' }}
      >
        <div style={{ minWidth: `${totalWidth}px`, height: '100%', position: 'relative' }}>
          <Home position={gapWidth} />
          {workData.companies.map((company, buildingIndex) => (
            <Building
              key={`building-${buildingIndex}`}
              ref={(el) => { buildingRefs.current[buildingIndex] = el; }}
              company={company}
              position={gapWidth + (buildingIndex + 1) * (buildingWidth + gapWidth)}
              isCurrent={currentBuilding === buildingIndex}
              currentFloor={currentFloor}
              onFloorSelect={(floorIndex) => handleFloorSelect(buildingIndex, floorIndex)}
              animationLevel={animationLevel}
            />
          ))}
          <Character
            position={characterPosition}
            isInBuilding={currentFloor !== -1}
            characterState={characterState}
          />
        </div>
      </div>
      {/* Project Details Panel - Only show when there's an active project AND we're not at home */}
      <AnimatePresence>
        {activeProject && currentBuilding !== -1 && showProjectDetails && (
          <WorkDetails
            company={activeProject.company}
            project={activeProject.project}
            onMinimize={() => {
              // When the card is minimized, we just let the WorkCard component handle it
              // Only hide the card completely when there's no active project
              if (!activeProject) {
                setShowProjectDetails(false);
              }
            }}
            animationLevel={animationLevel}
          />
        )}
      </AnimatePresence>
      {/* Scene Controls - Optional */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          className='px-4 py-2 rounded-md text-sm font-medium bg-palette-teal hover:bg-palette-teal-light text-white'
          onClick={() => handleFloorSelect(0, 0)}
          aria-label="Restart work experience animation"
        >
          Restart Tour
        </button>
      </div>
      {/* Accessibility announcements */}
      <div className="sr-only" aria-live="polite">
        {characterState === CharacterState.Working && activeProject && (
          <div>
            Now working at {activeProject.company} as {activeProject.project.title}
            from {activeProject.project.startDate} to {activeProject.project.endDate}.
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkScene;