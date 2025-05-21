import React from 'react';
import RotatableSphere from './Sphere';
import Board from './Board';

const SphereWithBoard: React.FC = () => {
  return (
    <div className="flex flex-col justify-evenly items-center w-full h-full md:flex-row">
      <div className="flex-1 w-full h-full max-h-[300px] max-w-[300px]">
        <RotatableSphere />
      </div>
      <div className="flex-1 justify-center w-full max-w-[300px]">
        <Board />
      </div>
    </div>
  );
};

export default SphereWithBoard;
