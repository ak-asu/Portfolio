import React from 'react';

const BookBinding: React.FC = () => {
  return (
    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-10 h-full bg-palette-teal dark:bg-palette-slate rounded-sm z-10 shadow-inner">
      <div className="absolute inset-0 bg-gradient-to-r from-palette-teal-light via-palette-teal to-palette-teal-light dark:from-palette-slate dark:via-primary dark:to-palette-slate opacity-70"></div>
    </div>
  );
};

export default BookBinding;
