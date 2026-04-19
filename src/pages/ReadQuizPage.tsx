import React from 'react';
import { useSheet } from '../services/SheetContext';

export function ReadQuizPage() {
  const { filteredQuizzes, isLoading, error } = useSheet();

  if (isLoading) return <div className="p-8 text-center text-text-dim uppercase font-mono tracking-widest">LOADING DATABASE...</div>;
  if (error) return <div className="p-8 text-center text-red-500 uppercase font-mono tracking-widest">ERROR: {error}</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-20">
      <div className="flex items-end justify-between mb-12 border-b-2 border-border-line pb-6">
        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] text-text-main">
          Read.
        </h1>
        <div className="text-sm font-mono tracking-widest text-accent font-bold uppercase">
          READING MODULE (QUIZ) - 共 {filteredQuizzes.length} 題
        </div>
      </div>

      <div className="space-y-12">
        {filteredQuizzes.length === 0 ? (
          <div className="text-center text-text-dim uppercase font-mono tracking-widest">NO DATA.</div>
        ) : (
          filteredQuizzes.map((item: any, index) => (
            <div key={`quiz-${item.id}-${index}`} className="bg-surface border-4 border-border-line hover:border-text-main transition-colors p-8 md:p-10">
              <h2 className="text-xl md:text-2xl font-bold text-text-main leading-snug mb-8 pb-8 border-b border-border-line">
                <span className="text-accent font-mono mr-4 tracking-widest">#{index + 1}</span>
                {item.yearTerm && <span className="inline-block mr-3 text-sm md:text-base font-mono tracking-widest text-accent px-2 py-1 border border-accent">[{item.yearTerm}]</span>}
                {item.question}
              </h2>
              
              <div className="space-y-4">
                {[
                  { key: 'A', value: item.optionA },
                  { key: 'B', value: item.optionB },
                  { key: 'C', value: item.optionC },
                  { key: 'D', value: item.optionD },
                ].filter(o => o.value).map((opt) => {
                  const isCorrect = item.answer === opt.key;
                  return (
                    <div 
                      key={opt.key}
                      className={`flex items-center gap-4 px-6 py-4 border-2 font-bold transition-all ${
                        isCorrect ? 'bg-accent border-accent text-bg' : 'border-border-line text-text-main'
                      }`}
                    >
                        <span className="w-8 h-8 flex items-center justify-center border-2 border-current font-black text-sm">
                          {opt.key}
                        </span>
                        <span className="text-lg flex-1 font-sans font-medium normal-case">{opt.value}</span>
                        {isCorrect && <span className="font-mono text-sm tracking-widest text-[#000000]">CORRECT</span>}
                    </div>
                  );
                })}
                {item.explanation && (
                  <div className="mt-8 pt-6 border-t border-dashed border-border-line">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-text-dim block mb-2">Explanation</span>
                    <p className="text-text-main font-mono text-sm leading-relaxed">{item.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
