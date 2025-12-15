"use client";

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCw, ChevronLeft, ChevronRight, Sparkles, AlertCircle } from "lucide-react";

type Flashcard = {
  question: string;
  answer: string;
};

export default function FlashcardView({ sessionId }: { sessionId?: number }) {
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
        body: JSON.stringify({ message: 'generate flashcards', session_id: sessionId }),
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
      <Card className="border-2">
        <CardContent className="flex flex-col items-center justify-center py-16 px-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-lg">
            🎴
          </div>
          <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Flashcards
          </h2>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            Generate intelligent flashcards from your uploaded documents to help you study and memorize key concepts.
          </p>
          {error && (
            <div className="flex items-center gap-2 text-destructive mb-4 bg-destructive/10 px-4 py-2 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          <Button
            onClick={generateFlashcards}
            disabled={generating}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
          >
            {generating ? (
              <>
                <RotateCw className="mr-2 h-5 w-5 animate-spin" />
                Generating Flashcards...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Flashcards
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2">
      <CardContent className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-1">Flashcards</h2>
            <p className="text-sm text-muted-foreground">Click card to flip</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-sm">
              {currentIndex + 1} / {flashcards.length}
            </Badge>
            <Button
              onClick={generateFlashcards}
              disabled={generating}
              variant="outline"
              size="sm"
            >
              {generating ? (
                <>
                  <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RotateCw className="mr-2 h-4 w-4" />
                  Regenerate
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Flashcard */}
        <div className="flex flex-col items-center">
          <div
            className="w-full max-w-2xl h-80 perspective-1000 cursor-pointer mb-6"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
              {/* Front - Question */}
              <Card className={`absolute w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-primary/20 backface-hidden shadow-xl hover:shadow-2xl transition-shadow ${isFlipped ? 'invisible' : 'visible'}`}>
                <CardContent className="flex items-center justify-center h-full p-8">
                  <div className="text-center">
                    <Badge className="mb-4 bg-blue-600">QUESTION</Badge>
                    <p className="text-2xl font-semibold text-foreground leading-relaxed">
                      {flashcards[currentIndex].question}
                    </p>
                    <p className="mt-6 text-sm text-muted-foreground">Click to reveal answer</p>
                  </div>
                </CardContent>
              </Card>

              {/* Back - Answer */}
              <Card className={`absolute w-full h-full bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-500/20 backface-hidden shadow-xl hover:shadow-2xl transition-shadow ${isFlipped ? 'visible' : 'invisible'}`} style={{ transform: 'rotateY(180deg)' }}>
                <CardContent className="flex items-center justify-center h-full p-8">
                  <div className="text-center">
                    <Badge className="mb-4 bg-green-600">ANSWER</Badge>
                    <p className="text-xl font-medium text-foreground leading-relaxed">
                      {flashcards[currentIndex].answer}
                    </p>
                    <p className="mt-6 text-sm text-muted-foreground">Click to see question</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            <Button
              onClick={handlePrevious}
              disabled={flashcards.length <= 1}
              variant="outline"
              size="lg"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button
              onClick={() => setIsFlipped(!isFlipped)}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <RotateCw className="mr-2 h-4 w-4" />
              {isFlipped ? 'Show Question' : 'Show Answer'}
            </Button>
            <Button
              onClick={handleNext}
              disabled={flashcards.length <= 1}
              variant="outline"
              size="lg"
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
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
      </CardContent>
    </Card>
  );
}
