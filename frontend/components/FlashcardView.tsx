"use client";

import { useState } from 'react';

export default function FlashcardView() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Mock data for now
  const cards = [
    { question: "What is the mitochondria?", answer: "The powerhouse of the cell." },
    { question: "What is 2 + 2?", answer: "4" },
  ];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  return (
    <div className="flex flex-col items-center p-4">
      <div 
        className="w-full h-64 perspective-1000 cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          {/* Front */}
          <div className={`absolute w-full h-full bg-white border-2 border-blue-200 rounded-xl flex items-center justify-center p-6 backface-hidden shadow-sm ${isFlipped ? 'invisible' : 'visible'}`}>
            <p className="text-xl font-medium text-center text-gray-800">{cards[currentIndex].question}</p>
          </div>
          
          {/* Back */}
          <div className={`absolute w-full h-full bg-blue-50 border-2 border-blue-300 rounded-xl flex items-center justify-center p-6 backface-hidden rotate-y-180 shadow-sm ${isFlipped ? 'visible' : 'invisible'}`}>
            <p className="text-xl font-medium text-center text-blue-900">{cards[currentIndex].answer}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <button 
          onClick={() => setIsFlipped(!isFlipped)}
          className="px-6 py-2 border border-gray-300 rounded-full hover:bg-gray-50 text-gray-700 font-medium"
        >
          {isFlipped ? 'Show Question' : 'Show Answer'}
        </button>
        <button 
          onClick={handleNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 font-medium"
        >
          Next Card
        </button>
      </div>
    </div>
  );
}
