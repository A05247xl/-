import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SheetProvider } from './services/SheetContext';
import { Navigation } from './components/Navigation';
import { QuizPage } from './pages/QuizPage';
import { EssayPage } from './pages/EssayPage';
import { AudioReviewPage } from './pages/AudioReviewPage';
import { ReadQuizPage } from './pages/ReadQuizPage';
import { ReadEssayPage } from './pages/ReadEssayPage';
import { ExamPage } from './pages/ExamPage';

export default function App() {
  return (
    <SheetProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-bg text-text-main font-sans selection:bg-accent selection:text-bg pb-20">
          <Navigation />
          <main>
            <Routes>
              <Route path="/" element={<QuizPage />} />
              <Route path="/essay" element={<EssayPage />} />
              <Route path="/audio" element={<AudioReviewPage />} />
              <Route path="/read" element={<ReadQuizPage />} />
              <Route path="/read-essay" element={<ReadEssayPage />} />
              <Route path="/exam" element={<ExamPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </SheetProvider>
  );
}
