"use client";

import { useState } from 'react';

type Flashcard = {
  question: string;
  answer: string;
};

export default function FlashcardView() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string>('');

  const generateFlashcards = async () => {
    setGenerating(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/study/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'generate flashcards' }),
      });

      const data = await response.json();

      if (data.flashcards && data.flashcards.length > 0) {
        setFlashcards(data.flashcards);
        setCurrentIndex(0);
        setIsFlipped(false);
      } else {
        setError(data.message || 'No flashcards generated. Please upload documents first.');
      }
    } catch (err) {
      console.error('Failed to generate flashcards:', err);
      setError('Failed to generate flashcards. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  if (flashcards.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎴</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Flashcards</h2>
          <p className="text-gray-600 mb-6">
            Generate flashcards from your uploaded documents to help you study and memorize key concepts.
          </p>
          {error && (
            <p className="text-red-600 mb-4 text-sm">{error}</p>
          )}
          <button
            onClick={generateFlashcards}
            disabled={generating}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {generating ? '⏳ Generating Flashcards...' : '✨ Generate Flashcards'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Flashcards</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {currentIndex + 1} / {flashcards.length}
          </span>
          <button
            onClick={generateFlashcards}
            disabled={generating}
            className="text-sm bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
          >
            {generating ? 'Regenerating...' : '🔄 Regenerate'}
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div
          className="w-full max-w-2xl h-80 perspective-1000 cursor-pointer mb-6"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
            {/* Front - Question */}
            <div className={`absolute w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl flex items-center justify-center p-8 backface-hidden shadow-lg ${isFlipped ? 'invisible' : 'visible'}`}>
              <div className="text-center">
                <div className="text-sm font-semibold text-blue-600 mb-4">QUESTION</div>
                <p className="text-2xl font-medium text-gray-900">{flashcards[currentIndex].question}</p>
                <div className="mt-6 text-sm text-gray-500">Click to reveal answer</div>
              </div>
            </div>

            {/* Back - Answer */}
            <div className={`absolute w-full h-full bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-300 rounded-2xl flex items-center justify-center p-8 backface-hidden rotate-y-180 shadow-lg ${isFlipped ? 'visible' : 'invisible'}`}>
              <div className="text-center">
                <div className="text-sm font-semibold text-green-600 mb-4">ANSWER</div>
                <p className="text-xl font-medium text-gray-900">{flashcards[currentIndex].answer}</p>
                <div className="mt-6 text-sm text-gray-500">Click to see question</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handlePrevious}
            disabled={flashcards.length <= 1}
            className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors"
          >
            {isFlipped ? '🔄 Show Question' : '🔄 Show Answer'}
          </button>
          <button
            onClick={handleNext}
            disabled={flashcards.length <= 1}
            className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
