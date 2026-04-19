import React from 'react';
import { useSheet } from '../services/SheetContext';

export function ReadEssayPage() {
  const { filteredEssays, isLoading, error } = useSheet();

  if (isLoading) return <div className="p-8 text-center text-text-dim uppercase font-mono tracking-widest">LOADING DATABASE...</div>;
  if (error) return <div className="p-8 text-center text-red-500 uppercase font-mono tracking-widest">ERROR: {error}</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-20">
      <div className="flex items-end justify-between mb-12 border-b-2 border-border-line pb-6">
        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] text-text-main">
          Read.
        </h1>
        <div className="text-sm font-mono tracking-widest text-accent font-bold uppercase">
          READING MODULE (ESSAY) - 共 {filteredEssays.length} 題
        </div>
      </div>

      <div className="space-y-12">
        {filteredEssays.length === 0 ? (
          <div className="text-center text-text-dim uppercase font-mono tracking-widest">NO DATA.</div>
        ) : (
          filteredEssays.map((item: any, index) => (
            <div key={`essay-${item.id}-${index}`} className="bg-surface border-4 border-border-line hover:border-text-main transition-colors p-8 md:p-10">
              <h2 className="text-xl md:text-2xl font-bold text-text-main leading-snug mb-8 pb-8 border-b border-border-line">
                <span className="text-accent font-mono mr-4 tracking-widest">#{index + 1}</span>
                {item.yearTerm && <span className="inline-block mr-3 text-sm md:text-base font-mono tracking-widest text-accent px-2 py-1 border border-accent">[{item.yearTerm}]</span>}
                {item.question}
              </h2>
              
              <div className="space-y-8">
                {item.keyPoints && (
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-accent block mb-3 border-l-2 border-accent pl-2">Key Points / 擬答要點</span>
                    <p className="text-text-main font-mono text-sm leading-relaxed">{item.keyPoints}</p>
                  </div>
                )}
                {item.fullAnswer && (
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-accent block mb-3 border-l-2 border-accent pl-2">Full Reference / 完整參考擬答</span>
                    <p className="text-text-main font-mono text-sm leading-relaxed whitespace-pre-wrap">{item.fullAnswer}</p>
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
