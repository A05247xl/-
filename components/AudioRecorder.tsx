import React, { useState, useRef, useEffect } from 'react';
import { TranscriptionStatus } from '../types';
import { formatDuration } from '../utils/audioUtils';

interface AudioRecorderProps {
  onAudioRecorded: (blob: Blob) => void;
  status: TranscriptionStatus;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onAudioRecorded, status }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const intervalRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/mp3' }); // Browsers often default to webm/ogg, but we label generally
        onAudioRecorded(blob);
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setDuration(0);

      intervalRef.current = window.setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("無法存取麥克風，請檢查權限設定。");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  const isDisabled = status === TranscriptionStatus.PROCESSING;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
      <div className="text-sm font-medium text-slate-500 mb-4">即時錄音</div>
      
      <div className="relative">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isDisabled}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
            isDisabled ? 'bg-gray-300 cursor-not-allowed' :
            isRecording 
              ? 'bg-red-500 hover:bg-red-600 ring-4 ring-red-200 animate-pulse' 
              : 'bg-primary-600 hover:bg-primary-700 hover:scale-105 shadow-lg shadow-primary-500/30'
          }`}
        >
          {isRecording ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>
      </div>

      <div className={`mt-4 font-mono text-xl ${isRecording ? 'text-red-500' : 'text-slate-400'}`}>
        {formatDuration(duration)}
      </div>
      
      <p className="mt-2 text-xs text-slate-400">
        {isRecording ? "錄音中... 點擊停止以開始處理" : "點擊麥克風開始錄音"}
      </p>
    </div>
  );
};

export default AudioRecorder;
