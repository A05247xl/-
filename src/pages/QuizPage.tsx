import React, { useState } from 'react';
import { useSheet } from '../services/SheetContext';
import { motion, AnimatePresence } from 'motion/react';

export function QuizPage() {
  const { filteredQuizzes, isLoading, error } = useSheet();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  // If filter changed and out of bounds, reset
  if (currentIndex >= filteredQuizzes.length && filteredQuizzes.length > 0) {
    setCurrentIndex(0);
  }

  if (isLoading) {
    return <div className="p-8 text-center text-text-dim uppercase font-mono tracking-widest">LOADING DATABASE...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500 uppercase font-mono tracking-widest">ERROR: {error}</div>;
  }

  if (!filteredQuizzes.length) {
    return <div className="p-8 text-center text-text-dim uppercase font-mono tracking-widest">NO DATA. CHECK "測驗題" TAB OR CHANGE FILTER.</div>;
  }

  const question = filteredQuizzes[currentIndex];
  const options = [
    { key: 'A', value: question.optionA },
    { key: 'B', value: question.optionB },
    { key: 'C', value: question.optionC },
    { key: 'D', value: question.optionD },
  ].filter(o => o.value);

  const handleSelect = (key: string) => {
    if (showResult) return;
    setSelectedOption(key);
  };

  const handleSubmit = () => {
    if (!selectedOption) return;
    setShowResult(true);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, filteredQuizzes.length - 1));
    setSelectedOption(null);
    setShowResult(false);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
    setSelectedOption(null);
    setShowResult(false);
  };

  const isCorrect = selectedOption === question.answer;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
      <div className="flex items-end justify-between mb-12 border-b-2 border-border-line pb-6">
        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] text-text-main">
          Quiz.
        </h1>
        <div className="text-sm font-mono tracking-widest text-accent font-bold">
          {currentIndex + 1} / {filteredQuizzes.length}
        </div>
      </div>

      <div className="bg-bg border-4 border-text-main p-8 md:p-12 mb-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
        <h2 className="text-2xl md:text-3xl font-bold text-text-main leading-snug mb-10">
          {question.yearTerm && <span className="inline-block mr-3 text-sm md:text-base font-mono tracking-widest text-accent px-2 py-1 border border-accent">[{question.yearTerm}]</span>}
          {question.question}
        </h2>

        <div className="space-y-4">
          {options.map((opt) => {
            const isSelected = selectedOption === opt.key;
            const isAnswer = showResult && opt.key === question.answer;
            const isWrongSelection = showResult && isSelected && !isCorrect;

            let buttonClass = "w-full text-left px-6 py-4 border-2 transition-all flex items-center gap-4 font-bold uppercase tracking-wide ";
            
            if (isAnswer) {
              buttonClass += "bg-accent border-accent text-bg";
            } else if (isWrongSelection) {
              buttonClass += "bg-red-600 border-red-600 text-bg";
            } else if (isSelected) {
              buttonClass += "bg-text-main border-text-main text-bg";
            } else if (!showResult) {
              buttonClass += "bg-surface border-border-line hover:border-text-main text-text-dim hover:text-text-main";
            } else {
              buttonClass += "bg-surface border-border-line text-border-line opacity-50";
            }

            return (
              <button
                key={opt.key}
                disabled={showResult}
                onClick={() => handleSelect(opt.key)}
                className={buttonClass}
              >
                <span className="w-8 h-8 flex items-center justify-center border-2 border-current font-black text-sm">
                  {opt.key}
                </span>
                <span className="text-lg flex-1 font-sans font-medium normal-case">{opt.value}</span>
                {isAnswer && <span className="font-mono text-sm tracking-widest">CORRECT</span>}
                {isWrongSelection && <span className="font-mono text-sm tracking-widest">ERROR</span>}
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {showResult && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-10 p-6 border-l-4 ${isCorrect ? 'border-accent bg-[rgba(225,255,0,0.05)] text-accent' : 'border-red-500 bg-red-950 text-red-400'}`}
            >
              <h3 className="text-xl font-black uppercase tracking-widest mb-3">
                {isCorrect ? 'SUCCESS' : `FAILED / CORE: ${question.answer}`}
              </h3>
              {question.explanation && (
                <p className="text-text-main font-mono text-sm leading-relaxed mt-4 pt-4 border-t border-border-line">
                  {question.explanation}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-between items-center mt-12 pt-8 border-t border-border-line">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-6 py-3 border-2 border-text-dim text-text-dim uppercase font-bold text-sm hover:border-text-main hover:text-text-main disabled:opacity-30 transition"
        >
          &lt; Prev
        </button>

        {!showResult ? (
          <button
            onClick={handleSubmit}
            disabled={!selectedOption}
            className="px-10 py-4 bg-accent text-bg border-4 border-accent uppercase font-black tracking-widest shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-1 hover:shadow-none disabled:opacity-50 disabled:shadow-none transition-all"
          >
            Submit
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={currentIndex === filteredQuizzes.length - 1}
            className="px-10 py-4 bg-text-main text-bg border-4 border-text-main uppercase font-black tracking-widest shadow-[4px_4px_0px_0px_rgba(225,255,0,1)] hover:translate-y-1 hover:shadow-none disabled:opacity-50 disabled:shadow-none transition-all"
          >
            Next &gt;
          </button>
        )}
      </div>
    </div>
  );
}
