import React, { useState, useRef } from 'react';
import { useSheet } from '../services/SheetContext';
import { gradeEssay } from '../services/geminiService';
import Markdown from 'react-markdown';
import { QuizQuestion, EssayQuestion } from '../types';

type ExamStep = 'SETUP' | 'EXAM' | 'GRADING' | 'RESULTS';

interface ExamQuestions {
  quizzes: QuizQuestion[];
  essays: EssayQuestion[];
}

interface UserAnswers {
  quizzes: Record<string, string>;
  essays: Record<string, string>;
}

interface GradingResults {
  quizzes: Record<string, boolean>;
  essays: Record<string, { score: number; feedback: string; isCorrect: boolean }>;
}

export function ExamPage() {
  const { filteredQuizzes, filteredEssays, selectedSubject, isLoading, error } = useSheet();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<ExamStep>('SETUP');
  const [questions, setQuestions] = useState<ExamQuestions>({ quizzes: [], essays: [] });
  const [answers, setAnswers] = useState<UserAnswers>({ quizzes: {}, essays: {} });
  const [gradingResults, setGradingResults] = useState<GradingResults>({ quizzes: {}, essays: {} });
  const [gradingProgress, setGradingProgress] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Navigation index in the EXAM step
  const [activeIndex, setActiveIndex] = useState(0);

  const totalQuestions = questions.quizzes.length + questions.essays.length;
  const isQuiz = activeIndex < questions.quizzes.length;
  const currentItem = isQuiz 
    ? questions.quizzes[activeIndex] 
    : questions.essays[activeIndex - questions.quizzes.length];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. SETUP PHASE & GENERATING RANDOM QUESTIONS
  const startExam = () => {
    // Determine number of available questions for current filter
    const maxQuizzes = Math.min(40, filteredQuizzes.length);
    const maxEssays = Math.min(2, filteredEssays.length);

    if (maxQuizzes === 0 && maxEssays === 0) {
      showToast("目前篩選條件下沒有題目可出題，請切換科目或檢查題庫。");
      return;
    }

    // Shuffle and pick
    const shuffledQuizzes = [...filteredQuizzes].sort(() => 0.5 - Math.random());
    const shuffledEssays = [...filteredEssays].sort(() => 0.5 - Math.random());

    setQuestions({
      quizzes: shuffledQuizzes.slice(0, maxQuizzes),
      essays: shuffledEssays.slice(0, maxEssays)
    });
    setAnswers({ quizzes: {}, essays: {} });
    setGradingResults({ quizzes: {}, essays: {} });
    setActiveIndex(0);
    setStep('EXAM');
  };

  // 2. IMPORT JSON MISTAKES
  const handleImportMistakes = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        if (data && (data.quizzes || data.essays)) {
          setQuestions({
            quizzes: data.quizzes || [],
            essays: data.essays || []
          });
          setAnswers({ quizzes: {}, essays: {} });
          setGradingResults({ quizzes: {}, essays: {} });
          setActiveIndex(0);
          setStep('EXAM');
        } else {
          showToast('匯入的檔案格式不正確或找不到題庫資料。');
        }
      } catch (err) {
        showToast('解析 JSON 檔案時發生錯誤。');
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 3. EXAM NAVIGATION & ANSWERING
  const handleQuizSelect = (key: string) => {
    if (!currentItem) return;
    setAnswers(prev => ({
      ...prev,
      quizzes: { ...prev.quizzes, [currentItem.id]: key }
    }));
  };

  const handleEssayChange = (text: string) => {
    if (!currentItem) return;
    setAnswers(prev => ({
      ...prev,
      essays: { ...prev.essays, [currentItem.id]: text }
    }));
  };

  const handleNext = () => {
    if (activeIndex < totalQuestions - 1) setActiveIndex(prev => prev + 1);
  };
  
  const handlePrev = () => {
    if (activeIndex > 0) setActiveIndex(prev => prev - 1);
  };

  // 4. SUBMISSION & GRADING
  const submitExam = async () => {
    // 移除 window.confirm 以避免 iframe 阻擋，直接進入評分
    setStep('GRADING');

    // Grade Quizzes synchronously
    const newQuizResults: Record<string, boolean> = {};
    questions.quizzes.forEach(q => {
      newQuizResults[q.id] = answers.quizzes[q.id] === q.answer;
    });

    // Grade Essays asynchronously (Gemini)
    const newEssayResults: Record<string, { score: number; feedback: string; isCorrect: boolean }> = {};
    for (let i = 0; i < questions.essays.length; i++) {
      const e = questions.essays[i];
      setGradingProgress(`正在評分申論題 ${i + 1} / ${questions.essays.length} ...`);
      
      const userAns = answers.essays[e.id] || "";
      if (!userAns.trim()) {
        newEssayResults[e.id] = { score: 0, feedback: "未作答", isCorrect: false };
        continue;
      }
      
      try {
        const res = await gradeEssay(e.question, e.keyPoints || e.fullAnswer || "", userAns);
        newEssayResults[e.id] = { 
          score: res.score, 
          feedback: res.feedback, 
          isCorrect: res.score >= 60 // >= 60 is correct according to spec
        };
      } catch (err: any) {
        newEssayResults[e.id] = { 
          score: 0, 
          feedback: `評分過程遭遇錯誤: ${err.message}`, 
          isCorrect: false 
        };
      }
    }

    setGradingResults({ quizzes: newQuizResults, essays: newEssayResults });
    setStep('RESULTS');
  };

  // 5. EXPORT MISTAKES (JSON VERSIONING)
  const exportMistakes = () => {
    const wrongQuizzes = questions.quizzes.filter(q => !gradingResults.quizzes[q.id]);
    const wrongEssays = questions.essays.filter(e => !gradingResults.essays[e.id]?.isCorrect);
    
    if (wrongQuizzes.length === 0 && wrongEssays.length === 0) {
      showToast("太棒了！全部答對，沒有錯題需要匯出。");
      return;
    }

    const exportData = {
      version: "1.0",
      date: new Date().toISOString(),
      subject: selectedSubject,
      type: "mistake_review",
      quizzes: wrongQuizzes,
      essays: wrongEssays
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Format: 社會工作_2026-04-18.json
    const dateStr = new Date().toISOString().split('T')[0];
    const subjectSafe = (selectedSubject === 'ALL' || !selectedSubject) ? '全部科目' : selectedSubject.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
    a.download = `複習重點_${subjectSafe}_${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };


  // -------------- RENDERERS --------------

  if (isLoading) return <div className="p-8 text-center text-text-dim uppercase font-mono tracking-widest">LOADING DATABASE...</div>;
  if (error) return <div className="p-8 text-center text-red-500 uppercase font-mono tracking-widest">ERROR: {error}</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-20 relative">
      
      {/* TOAST MESSAGE */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-accent text-bg px-6 py-3 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-top-4 fade-in">
          {toastMessage}
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex items-end justify-between mb-12 border-b-2 border-border-line pb-6">
        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] text-text-main">
          Exam.
        </h1>
        <div className="text-sm font-mono tracking-widest text-accent font-bold uppercase text-right">
          EXAM MODULE <br/>
          {step === 'SETUP' && <span>(設定)</span>}
          {step === 'EXAM' && <span>({activeIndex + 1} / {totalQuestions})</span>}
          {step === 'GRADING' && <span>(評分中)</span>}
          {step === 'RESULTS' && <span>(成績報告)</span>}
        </div>
      </div>

      {/* SETUP STEP */}
      {step === 'SETUP' && (
        <div className="space-y-12 animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-surface border-4 border-text-main p-8 md:p-12 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            <h2 className="text-3xl font-black mb-6 uppercase tracking-wider border-b-2 border-border-line pb-4">New Random Exam</h2>
            <p className="text-text-dim font-mono mb-8">
              Subject: <span className="font-bold text-text-main">{selectedSubject === 'ALL' ? 'ALL / 全部' : selectedSubject}</span><br />
              Criteria: 40 random Multiple Choice Questions + 2 random Essay Questions.
            </p>
            <button 
              onClick={startExam}
              className="w-full py-6 text-xl font-black bg-accent text-bg border-2 border-accent hover:bg-transparent hover:text-accent transition-colors tracking-widest uppercase"
            >
              Start Exam (開始測驗)
            </button>
          </div>

          <div className="relative border-t border-dashed border-border-line my-12 text-center text-text-dim font-mono tracking-widest uppercase">
            <span className="bg-bg px-4 absolute -top-3 left-1/2 -translate-x-1/2">
              OR (或者)
            </span>
          </div>

          <div className="bg-surface border-4 border-text-main p-8 md:p-12">
            <h2 className="text-3xl font-black mb-6 uppercase tracking-wider border-b-2 border-border-line pb-4">Import Review Focus</h2>
            <p className="text-text-dim font-mono mb-8">
              匯入曾經儲存的「複習重點 JSON 檔」，直接針對錯題進行練習與複習。
            </p>
            <input 
              type="file" 
              accept=".json" 
              ref={fileInputRef} 
              onChange={handleImportMistakes} 
              className="hidden" 
              id="import-json"
            />
            <label 
              htmlFor="import-json" 
              className="block cursor-pointer text-center w-full py-6 text-xl font-black bg-text-main text-bg border-2 border-text-main hover:bg-transparent hover:text-text-main transition-colors tracking-widest uppercase"
            >
              Upload JSON / 匯入錯題
            </label>
          </div>
        </div>
      )}

      {/* EXAM STEP */}
      {step === 'EXAM' && currentItem && (
        <div className="animate-in fade-in duration-300">
          <div className="mb-4 text-xs font-mono tracking-widest text-text-dim uppercase">
            Question Type: {isQuiz ? 'MULTIPLE CHOICE (測驗題)' : 'ESSAY (申論題)'}
          </div>
          <div className="bg-surface border-4 border-text-main p-8 md:p-12 mb-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] min-h-[400px] flex flex-col">
            
            <h2 className="text-xl md:text-3xl font-bold text-text-main leading-snug mb-10">
              <span className="text-accent font-mono mr-4 tracking-widest">Q{activeIndex + 1}.</span>
              {currentItem.yearTerm && <span className="inline-block mr-3 text-sm md:text-base font-mono tracking-widest text-accent px-2 py-1 border border-accent">[{currentItem.yearTerm}]</span>}
              {currentItem.question}
            </h2>

            <div className="flex-1">
              {/* QUIZ UI */}
              {isQuiz && (
                <div className="space-y-4">
                  {[
                    { key: 'A', value: (currentItem as QuizQuestion).optionA },
                    { key: 'B', value: (currentItem as QuizQuestion).optionB },
                    { key: 'C', value: (currentItem as QuizQuestion).optionC },
                    { key: 'D', value: (currentItem as QuizQuestion).optionD },
                  ].filter(o => o.value).map((opt) => {
                    const isSelected = answers.quizzes[currentItem.id] === opt.key;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => handleQuizSelect(opt.key)}
                        className={`w-full text-left flex items-center gap-4 px-6 py-4 border-2 font-bold transition-all ${
                          isSelected 
                            ? 'bg-text-main border-text-main text-bg' 
                            : 'border-border-line text-text-main hover:border-text-main'
                        }`}
                      >
                         <span className="w-8 h-8 flex items-center justify-center border-2 border-current font-black text-sm">
                           {opt.key}
                         </span>
                         <span className="text-lg flex-1 font-sans font-medium normal-case">{opt.value}</span>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* ESSAY UI */}
              {!isQuiz && (
                <div className="space-y-4 h-full flex flex-col">
                  <textarea
                    className="w-full flex-1 min-h-[250px] p-6 text-base font-mono border-2 border-text-main bg-bg focus:outline-none focus:ring-4 ring-accent/30 resize-y"
                    placeholder="Type your essay answer here... / 請在此輸入擬答..."
                    value={answers.essays[currentItem.id] || ''}
                    onChange={(e) => handleEssayChange(e.target.value)}
                  />
                </div>
              )}
            </div>
            
            {/* NAVIGATION CONTROLS */}
            <div className="mt-12 pt-8 border-t-2 border-border-line flex justify-between items-center bg-surface">
              <button 
                onClick={handlePrev}
                disabled={activeIndex === 0}
                className="px-6 py-3 font-bold uppercase tracking-widest border-2 border-border-line text-text-main disabled:opacity-30 disabled:cursor-not-allowed hover:bg-text-main hover:text-bg transition-colors"
               >
                 Prev
               </button>
               
               {activeIndex < totalQuestions - 1 ? (
                 <button 
                  onClick={handleNext}
                  className="px-6 py-3 font-bold uppercase tracking-widest border-2 border-text-main bg-bg text-text-main hover:bg-text-main hover:text-bg transition-colors shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                 >
                   Next
                 </button>
               ) : (
                 <button 
                  onClick={submitExam}
                  className="px-8 py-3 font-bold uppercase tracking-widest border-2 border-accent bg-accent text-bg hover:bg-transparent hover:text-accent transition-colors shadow-[4px_4px_0px_0px_var(--color-accent)]"
                 >
                   Submit & Grade
                 </button>
               )}
            </div>
          </div>
        </div>
      )}

      {/* GRADING STEP */}
      {step === 'GRADING' && (
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
           <div className="w-16 h-16 border-4 border-border-line border-t-accent rounded-full animate-spin mb-8"></div>
           <h2 className="text-3xl font-black uppercase tracking-widest mb-4">Grading in Progress</h2>
           <p className="text-text-dim font-mono uppercase tracking-[2px]">{gradingProgress}</p>
        </div>
      )}

      {/* RESULTS STEP */}
      {step === 'RESULTS' && (
        <div className="animate-in fade-in slide-in-from-bottom-10 duration-700">
          
          {/* SCORE BOARD */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
             <div className="bg-surface border-4 border-text-main p-8 text-center shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
                <div className="text-xs uppercase tracking-widest text-text-dim font-mono mb-2">Quiz Score (測驗分)</div>
                <div className="text-6xl font-black text-text-main">
                   {Object.values(gradingResults.quizzes).filter(Boolean).length} <span className="text-3xl text-text-dim">/ {questions.quizzes.length}</span>
                </div>
             </div>
             <div className="bg-surface border-4 border-text-main p-8 text-center shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
                <div className="text-xs uppercase tracking-widest text-text-dim font-mono mb-2">Essay Pass (申論達標)</div>
                <div className="text-6xl font-black text-accent">
                   {Object.values(gradingResults.essays).filter(r => r.isCorrect).length} <span className="text-3xl text-text-dim">/ {questions.essays.length}</span>
                </div>
             </div>
          </div>

          <div className="mb-12">
             <button 
               onClick={exportMistakes}
               className="w-full py-6 text-xl font-black bg-accent text-bg border-2 border-accent hover:bg-transparent hover:text-accent transition-colors tracking-widest uppercase"
             >
               Export Wrong Answers (匯出複習重點)
             </button>
             <p className="text-center font-mono text-xs text-text-dim mt-4 uppercase tracking-[2px]">
               Downloads a JSON file of your mistakes to be imported later.
             </p>
          </div>

          <div className="space-y-12 border-t-2 border-border-line pt-12">
             <h2 className="text-3xl font-black uppercase tracking-wider text-center mb-8">Review Questions</h2>
             
             {/* Render all Quizzes in Results */}
             {questions.quizzes.map((q, idx) => {
               const uAns = answers.quizzes[q.id];
               const isCorrect = gradingResults.quizzes[q.id];
               return (
                 <div key={`res-q-${q.id}`} className={`bg-bg border-4 p-8 md:p-10 ${isCorrect ? 'border-border-line' : 'border-red-600 shadow-[6px_6px_0px_0px_rgba(220,38,38,1)]'}`}>
                   <h3 className="text-xl font-bold mb-6">
                     <span className="font-mono text-text-dim">Q{idx + 1} [測驗]. </span> 
                     {q.question}
                   </h3>
                   
                   {/* Options List */}
                   <div className="mb-6 space-y-2">
                     {[
                       { key: 'A', value: q.optionA },
                       { key: 'B', value: q.optionB },
                       { key: 'C', value: q.optionC },
                       { key: 'D', value: q.optionD },
                     ].filter(o => o.value).map(opt => (
                       <div key={opt.key} className="flex gap-3 text-sm">
                         <span className="font-bold text-text-dim border border-border-line px-2 py-0.5 min-w-[2rem] text-center">{opt.key}</span>
                         <span className="text-text-main">{opt.value}</span>
                       </div>
                     ))}
                   </div>

                   <div className="font-mono text-sm space-y-2">
                     <div className="flex gap-4">
                       <span className="text-text-dim w-32 uppercase shrink-0">Your Answer:</span>
                       <span className={`font-bold ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>{uAns || '未作答'}</span>
                     </div>
                     {!isCorrect && (
                       <div className="flex gap-4">
                         <span className="text-text-dim w-32 uppercase shrink-0">Correct Answer:</span>
                         <span className="font-bold text-accent">{q.answer}</span>
                       </div>
                     )}
                     {q.explanation && !isCorrect && (
                       <div className="mt-4 pt-4 border-t border-dashed border-border-line text-text-dim">
                         [解析] {q.explanation}
                       </div>
                     )}
                   </div>
                 </div>
               );
             })}

             {/* Render all Essays in Results */}
             {questions.essays.map((e, idx) => {
               const uAns = answers.essays[e.id];
               const res = gradingResults.essays[e.id];
               return (
                 <div key={`res-e-${e.id}`} className={`bg-bg border-4 p-8 md:p-10 ${res?.isCorrect ? 'border-border-line' : 'border-red-600 shadow-[6px_6px_0px_0px_rgba(220,38,38,1)]'}`}>
                   <h3 className="text-xl font-bold mb-6">
                     <span className="font-mono text-text-dim">E{idx + 1} [申論]. </span> 
                     {e.question}
                   </h3>
                   
                   <div className="space-y-6">
                     <div className="bg-surface p-6 border-l-4 border-text-main">
                        <div className="text-xs uppercase font-mono tracking-widest text-text-dim mb-3">Your Final Answer</div>
                        <p className="font-mono text-sm whitespace-pre-wrap">{uAns || '未作答'}</p>
                     </div>
                     
                     {res && (
                       <div className={`p-6 border-2 ${res.isCorrect ? 'border-accent bg-accent/10' : 'border-red-600 bg-red-600/10'}`}>
                          <div className="flex justify-between items-end mb-4 border-b border-current pb-4">
                             <span className="text-xs uppercase font-mono tracking-widest font-bold">AI Response</span>
                             <span className="text-3xl font-black">{res.score} <span className="text-sm font-normal">/ 100</span></span>
                          </div>
                          <div className="prose prose-invert md:prose-lg max-w-none text-text-main font-mono text-sm">
                             <Markdown>{res.feedback}</Markdown>
                          </div>
                       </div>
                     )}

                     {!res?.isCorrect && e.keyPoints && (
                       <div className="p-6 border-2 border-border-line">
                          <div className="text-xs uppercase font-mono tracking-widest text-text-dim mb-3">Official Key Points (官方評分要點)</div>
                          <p className="text-sm tracking-wide leading-relaxed">{e.keyPoints}</p>
                       </div>
                     )}
                   </div>
                 </div>
               );
             })}
          </div>
          
          <button 
            onClick={() => setStep('SETUP')}
            className="w-full mt-12 py-6 text-xl font-black bg-surface text-text-main border-2 border-text-main hover:bg-text-main hover:text-bg transition-colors tracking-widest uppercase"
          >
            Return to Setup / 結束並返回
          </button>
        </div>
      )}

    </div>
  );
}
