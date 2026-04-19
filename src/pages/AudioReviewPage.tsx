import React, { useState, useEffect } from 'react';
import { useSheet } from '../services/SheetContext';
import { motion } from 'motion/react';

export function AudioReviewPage() {
  const { filteredQuizzes, filteredEssays, isLoading, error } = useSheet();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentType, setCurrentType] = useState<'quiz' | 'essay'>('quiz');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [speechRate, setSpeechRate] = useState(1);
  const [speechVolume, setSpeechVolume] = useState(1);
  
  const synth = window.speechSynthesis;

  useEffect(() => {
    return () => {
      synth.cancel();
    };
  }, []);

  const getCurrentList = () => currentType === 'quiz' ? filteredQuizzes : filteredEssays;
  const currentList = getCurrentList();

  // If filter changed and out of bounds, stop playing and reset index
  useEffect(() => {
    if (currentIndex >= currentList.length && currentList.length > 0) {
       setCurrentIndex(0);
       setIsPlaying(false);
       synth.cancel();
    }
  }, [currentList.length, currentIndex, synth]);

  const speak = (text: string, onEnd?: () => void) => {
    if (!synth) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-TW';
    utterance.rate = speechRate;
    utterance.volume = speechVolume;
    if (onEnd) utterance.onend = onEnd;
    synth.speak(utterance);
  };

  const playCurrent = () => {
    if (!currentList.length) return;
    synth.cancel();
    setIsPlaying(true);

    const item = currentList[currentIndex];
    let fullText = '';

    if (currentType === 'quiz') {
      const q = item as any;
      fullText = `題目：${q.question}。選項A：${q.optionA}。選項B：${q.optionB}。選項C：${q.optionC}。選項D：${q.optionD}。正確答案為${q.answer}。解析：${q.explanation || '無'}`;
    } else {
      const e = item as any;
      fullText = `申論題標題：${e.question}。評分要點參考：${e.keyPoints}`;
    }

    speak(fullText, () => {
      if (currentIndex < currentList.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsPlaying(false);
      }
    });
  };

  useEffect(() => {
    if (isPlaying) {
      synth.cancel();
      playCurrent();
    }
  }, [currentIndex, currentType, speechRate, speechVolume]);

  const togglePlay = () => {
    if (isPlaying) {
      synth.pause();
      setIsPlaying(false);
    } else {
      if (synth.paused) {
        synth.resume();
      } else {
        playCurrent();
      }
      setIsPlaying(true);
    }
  };

  const next = () => {
    if (currentIndex < currentList.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-text-dim uppercase font-mono tracking-widest">LOADING DATABASE...</div>;
  if (error) return <div className="p-8 text-center text-red-500 uppercase font-mono tracking-widest">ERROR: {error}</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
      <div className="flex items-end justify-between mb-12 border-b-2 border-border-line pb-6">
        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] text-text-main">
          Audio.
        </h1>
        <div className="text-sm font-mono tracking-widest text-accent font-bold uppercase">
          Voice Review Module
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => { setCurrentType('quiz'); setCurrentIndex(0); synth.cancel(); setIsPlaying(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className={`flex-1 py-4 border-2 font-bold uppercase tracking-widest text-sm transition-colors ${currentType === 'quiz' ? 'bg-text-main border-text-main text-bg' : 'border-border-line text-text-dim hover:border-text-main hover:text-text-main'}`}
        >
          Quiz ({filteredQuizzes.length})
        </button>
        <button 
          onClick={() => { setCurrentType('essay'); setCurrentIndex(0); synth.cancel(); setIsPlaying(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className={`flex-1 py-4 border-2 font-bold uppercase tracking-widest text-sm transition-colors ${currentType === 'essay' ? 'bg-text-main border-text-main text-bg' : 'border-border-line text-text-dim hover:border-text-main hover:text-text-main'}`}
        >
          Essay ({filteredEssays.length})
        </button>
      </div>

      <div className="bg-surface p-10 md:p-16 border-4 border-text-main shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] flex flex-col justify-between min-h-[500px]">
        <div>
          <div className="text-[11px] uppercase tracking-[2px] text-text-dim mb-10">Voice Review Module</div>
          
          <div className="flex flex-col items-center justify-center gap-10">
            <div className="flex items-center gap-1 h-[120px]">
              {[40, 70, 100, 60, 85, 45, 90, 30, 75, 55].map((h, i) => (
                <motion.div 
                  key={i}
                  animate={{ height: isPlaying ? `${Math.max(20, Math.random() * 100)}%` : `${h}%` }}
                  transition={{ duration: 0.2, repeat: isPlaying ? Infinity : 0, repeatType: "reverse" }}
                  className="w-1 bg-accent"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>

            <div className="text-center w-full max-w-xl">
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-text-main">
                {currentList.length > 0 && currentList[currentIndex]?.yearTerm && <span className="inline-block mr-3 text-sm md:text-base font-mono tracking-widest text-accent px-2 py-1 border border-accent">[{currentList[currentIndex].yearTerm}]</span>}
                {currentList.length > 0 ? currentList[currentIndex].question : 'AWAITING TRACK...'}
              </h3>
              <p className="text-text-dim text-sm font-mono uppercase tracking-widest">
                {currentType === 'quiz' ? 'MULTIPLE CHOICE' : 'ESSAY QUESTION'} - TRACK {currentList.length > 0 ? currentIndex + 1 : 0}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 max-w-sm mx-auto mt-12 w-full">
          <button 
            onClick={prev}
            disabled={currentIndex === 0 || currentList.length === 0}
            className="aspect-square rounded-full border border-border-line flex items-center justify-center text-[10px] font-bold uppercase disabled:opacity-30 hover:border-text-main transition-colors text-text-main"
          >
            Prev
          </button>
          
          <button 
            onClick={togglePlay}
            disabled={currentList.length === 0}
            className="aspect-square rounded-full bg-accent flex items-center justify-center text-3xl text-bg hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            {isPlaying ? '■' : '▶'}
          </button>

          <button 
            onClick={next}
            disabled={currentIndex === currentList.length - 1 || currentList.length === 0}
            className="aspect-square rounded-full border border-border-line flex items-center justify-center text-[10px] font-bold uppercase disabled:opacity-30 hover:border-text-main transition-colors text-text-main"
          >
            Next
          </button>
        </div>

        <div className="mt-12 pt-8 border-t-2 border-border-line w-full">
          <div className="flex flex-col md:flex-row gap-8 max-w-xl mx-auto">
            <div className="flex-1">
              <div className="flex justify-between mb-2">
                <span className="text-xs font-mono uppercase tracking-widest text-text-dim">SPEED</span>
                <span className="text-xs font-mono tracking-widest text-accent font-bold">{speechRate.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="w-full h-2 bg-border-line appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:rounded-none"
              />
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between mb-2">
                <span className="text-xs font-mono uppercase tracking-widest text-text-dim">VOLUME</span>
                <span className="text-xs font-mono tracking-widest text-accent font-bold">{Math.round(speechVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={speechVolume}
                onChange={(e) => setSpeechVolume(parseFloat(e.target.value))}
                className="w-full h-2 bg-border-line appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-text-main [&::-webkit-slider-thumb]:rounded-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
