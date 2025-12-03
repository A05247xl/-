import React, { useState, useCallback } from 'react';
import AudioRecorder from './components/AudioRecorder';
import FileUploader from './components/FileUploader';
import TranscriptionEditor from './components/TranscriptionEditor';
import { TranscriptionStatus } from './types';
import { blobToBase64 } from './utils/audioUtils';
import { transcribeAudio } from './services/geminiService';

const App: React.FC = () => {
  const [status, setStatus] = useState<TranscriptionStatus>(TranscriptionStatus.IDLE);
  const [transcribedText, setTranscribedText] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAudioProcessing = useCallback(async (audioBlob: Blob) => {
    setStatus(TranscriptionStatus.PROCESSING);
    setErrorMsg(null);
    setTranscribedText("");

    try {
      // 1. Convert Blob to Base64
      const base64Audio = await blobToBase64(audioBlob);
      
      // 2. Send to Gemini
      // Determine MIME type (default to mp3 if generic blob, but Gemini handles most audio types)
      const mimeType = audioBlob.type || 'audio/mp3';
      
      const text = await transcribeAudio(base64Audio, mimeType);
      
      setTranscribedText(text);
      setStatus(TranscriptionStatus.COMPLETED);

    } catch (error) {
      console.error(error);
      setErrorMsg("處理失敗：請檢查網路連線或 API 金鑰。");
      setStatus(TranscriptionStatus.ERROR);
    }
  }, []);

  const handleReset = () => {
    setStatus(TranscriptionStatus.IDLE);
    setTranscribedText("");
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-primary-100 selection:text-primary-700">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-500/30">
              S
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
              智聲筆記 <span className="text-xs font-normal text-slate-400 ml-1 border border-slate-200 rounded px-1.5 py-0.5">Beta</span>
            </h1>
          </div>
          <div className="flex gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              系統連線正常
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-8rem)]">
          
          {/* Left Column: Input Controls */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-2">開始轉錄</h2>
              <p className="text-sm text-slate-500 mb-6">
                選擇上傳音訊檔案或直接使用麥克風錄音。AI 將自動過濾雜訊並整理重點。
              </p>

              <div className="space-y-4">
                <AudioRecorder 
                  onAudioRecorded={handleAudioProcessing} 
                  status={status}
                />
                
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink-0 mx-4 text-slate-400 text-xs uppercase tracking-wider">OR</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <FileUploader 
                  onFileSelected={handleAudioProcessing}
                  status={status}
                />
              </div>

              {/* Status Indicator */}
              {status === TranscriptionStatus.PROCESSING && (
                <div className="mt-6 p-4 bg-primary-50 rounded-xl border border-primary-100 animate-pulse">
                  <div className="flex items-center gap-3">
                    <svg className="animate-spin h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <div>
                      <div className="text-sm font-semibold text-primary-800">正在處理音訊...</div>
                      <div className="text-xs text-primary-600">AI 正在分析語意並整理逐字稿</div>
                    </div>
                  </div>
                </div>
              )}

              {status === TranscriptionStatus.ERROR && (
                <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-100">
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-red-700 font-medium">
                      {errorMsg || "發生未知錯誤"}
                    </div>
                  </div>
                  <button 
                    onClick={handleReset}
                    className="mt-3 text-xs text-red-600 hover:text-red-800 underline"
                  >
                    重試
                  </button>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl shadow-lg text-white">
              <h3 className="font-bold text-lg mb-2">安全與效能</h3>
              <ul className="text-sm space-y-2 opacity-90">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  企業級加密傳輸
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  Gemini Flash 2.5 極速引擎
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                  隱私優先，不保留音訊
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Output Editor */}
          <div className="lg:col-span-8 h-full min-h-[500px]">
            {status === TranscriptionStatus.COMPLETED || status === TranscriptionStatus.PROCESSING || transcribedText ? (
              <TranscriptionEditor initialText={transcribedText} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-400 p-8 text-center">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-600 mb-2">等待輸入</h3>
                <p className="max-w-md">
                  您的轉錄內容將會顯示於此。系統將自動過濾贅字、整理段落，並支援即時編輯與匯出功能。
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
