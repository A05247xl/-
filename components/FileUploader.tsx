import React, { useRef, useState } from 'react';
import { TranscriptionStatus } from '../types';

interface FileUploaderProps {
  onFileSelected: (file: File) => void;
  status: TranscriptionStatus;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelected, status }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndUpload(e.target.files[0]);
    }
  };

  const validateAndUpload = (file: File) => {
    // Check for audio MIME type or specific extensions like .aac
    // Note: some browsers might not detect mime type for .aac correctly, so we check extension too.
    const isValidType = file.type.startsWith('audio/') || 
                        file.name.toLowerCase().endsWith('.aac') ||
                        file.name.toLowerCase().endsWith('.m4a');
    
    if (!isValidType) {
      alert("請上傳有效的音訊檔案 (MP3, WAV, M4A, AAC)");
      return;
    }
    // Limit size to roughly 10MB for client-side demo stability
    if (file.size > 10 * 1024 * 1024) {
      alert("檔案過大，請上傳小於 10MB 的檔案。"); 
      return; 
    }
    onFileSelected(file);
  };

  const isDisabled = status === TranscriptionStatus.PROCESSING;

  return (
    <div 
      className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer
        ${isDragOver 
          ? 'border-primary-500 bg-primary-50' 
          : 'border-slate-200 hover:border-primary-400 hover:bg-slate-50'
        }
        ${isDisabled ? 'opacity-50 pointer-events-none' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input 
        type="file" 
        ref={inputRef} 
        onChange={handleChange} 
        className="hidden" 
        accept="audio/*,.aac,.m4a,.mp3,.wav,.ogg"
      />
      
      <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>
      
      <p className="text-sm font-medium text-slate-700 text-center">
        點擊上傳或拖放檔案
      </p>
      <p className="text-xs text-slate-400 mt-1 text-center">
        支援 MP3, WAV, M4A, AAC (Max 10MB)
      </p>
    </div>
  );
};

export default FileUploader;