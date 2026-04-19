import React, { createContext, useContext, useState, useEffect } from 'react';
import { QuizQuestion, EssayQuestion } from '../types';
import { loadDataFromSheet } from './sheetsService';

interface SheetContextType {
  sheetId: string;
  setSheetId: (id: string) => void;
  quizzes: QuizQuestion[];
  essays: EssayQuestion[];
  filteredQuizzes: QuizQuestion[];
  filteredEssays: EssayQuestion[];
  subjects: string[];
  selectedSubject: string;
  setSelectedSubject: (subject: string) => void;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

const SheetContext = createContext<SheetContextType | undefined>(undefined);

// 請將您目前 Settings 介面中使用的 Sheet ID 填入下方的常數中
// 例如: const DEFAULT_SHEET_ID = "1BxiMVs0X...";
const DEFAULT_SHEET_ID = "1wTnyab2859qNO4VfDV3P07RJBQMm5cqP";

export function SheetProvider({ children }: { children: React.ReactNode }) {
  const [sheetId, setSheetId] = useState<string>(() => localStorage.getItem('study_sheet_id') || DEFAULT_SHEET_ID);
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);
  const [essays, setEssays] = useState<EssayQuestion[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await loadDataFromSheet(sheetId);
      setQuizzes(data.quizzes);
      setEssays(data.essays);
      setSelectedSubject('ALL'); // Reset filter on new data load
    } catch (err: any) {
      setError(err?.message || 'Failed to load data');
      setQuizzes([]);
      setEssays([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [sheetId]);

  const handleSetSheetId = (id: string) => {
    setSheetId(id);
    localStorage.setItem('study_sheet_id', id);
  };

  // Compute unique subjects
  const subjects = React.useMemo(() => {
    const allSubjects = new Set<string>();
    quizzes.forEach(q => q.subject && allSubjects.add(q.subject));
    essays.forEach(e => e.subject && allSubjects.add(e.subject));
    return Array.from(allSubjects).sort();
  }, [quizzes, essays]);

  // Compute filtered lists
  const filteredQuizzes = React.useMemo(() => {
    if (selectedSubject === 'ALL') return quizzes;
    return quizzes.filter(q => q.subject === selectedSubject);
  }, [quizzes, selectedSubject]);

  const filteredEssays = React.useMemo(() => {
    if (selectedSubject === 'ALL') return essays;
    return essays.filter(e => e.subject === selectedSubject);
  }, [essays, selectedSubject]);

  return (
    <SheetContext.Provider value={{
      sheetId,
      setSheetId: handleSetSheetId,
      quizzes,
      essays,
      filteredQuizzes,
      filteredEssays,
      subjects,
      selectedSubject,
      setSelectedSubject,
      isLoading,
      error,
      refresh: fetchData
    }}>
      {children}
    </SheetContext.Provider>
  );
}

export function useSheet() {
  const context = useContext(SheetContext);
  if (context === undefined) {
    throw new Error('useSheet must be used within a SheetProvider');
  }
  return context;
}
