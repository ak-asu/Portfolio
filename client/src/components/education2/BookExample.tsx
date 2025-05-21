import React from 'react';
import BookLayout from './BookLayout';

const BookExample: React.FC = () => {
  // Example content for pages
  const pages = [
    <div key="page1" className="p-4">
      <h2 className="text-xl font-bold">Page 1</h2>
      <p>This is the content for page 1.</p>
    </div>,
    <div key="page2" className="p-4">
      <h2 className="text-xl font-bold">Page 2</h2>
      <p>This is the content for page 2.</p>
    </div>,
    <div key="page3" className="p-4">
      <h2 className="text-xl font-bold">Page 3</h2>
      <p>This is the content for page 3.</p>
    </div>,
    <div key="page4" className="p-4">
      <h2 className="text-xl font-bold">Page 4</h2>
      <p>This is the content for page 4.</p>
    </div>
  ];

  const frontCover = (
    <div className="p-4 text-center h-full flex flex-col justify-center">
      <h1 className="text-2xl font-bold mb-4">My Book</h1>
      <p className="text-lg">A collection of interesting content</p>
      <div className="mt-8 text-sm text-gray-500">Click Next to open</div>
    </div>
  );

  const backCover = (
    <div className="p-4 text-center h-full flex flex-col justify-center">
      <h2 className="text-xl font-bold mb-4">The End</h2>
      <p>Thank you for reading!</p>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Book Example</h1>
      <BookLayout 
        pages={pages} 
        frontCover={frontCover}
        backCover={backCover}
      />
    </div>
  );
};

export default BookExample;
