import React, { useState } from 'react';
import { useSheet } from '../services/SheetContext';
import { gradeEssay } from '../services/geminiService';
import Markdown from 'react-markdown';
import { motion } from 'motion/react';

export function EssayPage() {
  const { filteredEssays, isLoading, error } = useSheet();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userResponse, setUserResponse] = useState('');
  const [isGrading, setIsGrading] = useState(false);
  const [result, setResult] = useState<{score: number, feedback: string} | null>(null);

  // If filter changed and out of bounds, reset
  if (currentIndex >= filteredEssays.length && filteredEssays.length > 0) {
    setCurrentIndex(0);
  }

  if (isLoading) return <div className="p-8 text-center text-text-dim uppercase font-mono tracking-widest">LOADING DATABASE...</div>;
  if (error) return <div className="p-8 text-center text-red-500 uppercase font-mono tracking-widest">ERROR: {error}</div>;
  if (!filteredEssays.length) return <div className="p-8 text-center text-text-dim uppercase font-mono tracking-widest">NO DATA. CHECK FILTER.</div>;

  const question = filteredEssays[currentIndex];

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(prev + 1, filteredEssays.length - 1));
    reset();
  };

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
    reset();
  };

  const reset = () => {
    setUserResponse('');
    setResult(null);
  };

  const handleGrade = async () => {
    if (!userResponse.trim()) return;
    setIsGrading(true);
    const scoreResult = await gradeEssay(question.question, question.keyPoints, userResponse);
    setResult(scoreResult);
    setIsGrading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
      <div className="flex items-end justify-between mb-12 border-b-2 border-border-line pb-6">
        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] text-text-main">
          Essay.
        </h1>
        <div className="text-sm font-mono tracking-widest text-accent font-bold">
          {currentIndex + 1} / {filteredEssays.length}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-12">
        <div className="bg-surface border-4 border-text-main p-8 md:p-10 flex flex-col h-full shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
          <h2 className="text-xl md:text-2xl font-bold text-text-main leading-snug mb-8 pb-8 border-b-2 border-border-line">
            {question.yearTerm && <span className="inline-block mr-3 text-sm md:text-base font-mono tracking-widest text-accent px-2 py-1 border border-accent">[{question.yearTerm}]</span>}
            Q: {question.question}
          </h2>
          
          <div className="flex-1">
            <textarea
              value={userResponse}
              onChange={(e) => setUserResponse(e.target.value)}
              disabled={isGrading || !!result}
              placeholder="YOUR ANSWER HERE..."
              className="w-full h-64 md:h-[400px] p-6 bg-bg border-2 border-border-line text-text-main font-mono focus:border-accent outline-none resize-none transition disabled:opacity-50 uppercase placeholder:text-text-dim"
            />
          </div>

          <div className="mt-8 flex justify-end">
            {!result ? (
              <button
                onClick={handleGrade}
                disabled={!userResponse.trim() || isGrading}
                className="px-8 py-4 bg-accent text-bg border-4 border-accent uppercase font-black tracking-widest shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-1 hover:shadow-none disabled:opacity-50 disabled:shadow-none transition-all"
              >
                {isGrading ? 'ANALYZING...' : 'GRADE ESSAY'}
              </button>
            ) : (
              <button
                onClick={reset}
                className="px-8 py-4 border-4 border-text-main text-text-main uppercase font-black tracking-widest hover:bg-surface transition-colors"
              >
                RETRY
              </button>
            )}
          </div>
        </div>

        <div className="h-full">
          {result ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-bg border-4 border-accent p-8 md:p-10 h-full shadow-[8px_8px_0px_0px_rgba(225,255,0,1)]"
            >
              <div className="flex items-end gap-4 mb-8 pb-8 border-b border-border-line">
                <div className="text-8xl font-black tracking-tighter text-accent leading-[0.8]">
                  {result.score}
                </div>
                <div className="text-xl font-bold text-text-dim uppercase tracking-widest mb-2">/ 100 PTS</div>
              </div>

              <div className="prose prose-invert max-w-none text-text-main font-mono text-sm md:text-base leading-relaxed">
                <div className="markdown-body">
                  <Markdown>{result.feedback}</Markdown>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-surface border-4 border-dashed border-border-line h-full min-h-[300px] flex flex-col items-center justify-center p-10 text-center text-text-dim">
              <p className="text-xl font-black uppercase tracking-widest mb-2 text-text-main">AWAITING INPUT</p>
              <p className="font-mono text-sm uppercase tracking-wider">Submit essay for AI evaluation.</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center pt-8 border-t border-border-line">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-6 py-3 border-2 border-text-dim text-text-dim uppercase font-bold text-sm hover:border-text-main hover:text-text-main disabled:opacity-30 transition"
        >
          &lt; Prev
        </button>
        <button
          onClick={handleNext}
          disabled={currentIndex === filteredEssays.length - 1}
          className="px-6 py-3 border-2 border-text-main text-text-main uppercase font-bold text-sm hover:bg-surface disabled:opacity-30 transition"
        >
          Next &gt;
        </button>
      </div>
    </div>
  );
}
