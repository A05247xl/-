import React, { useState } from 'react';
import { generateTechDoc, generateManualDoc } from '../services/docGenerator';

export function DownloadDocButton() {
  const [isGeneratingTech, setIsGeneratingTech] = useState(false);
  const [isGeneratingManual, setIsGeneratingManual] = useState(false);

  const handleDownloadTech = async () => {
    setIsGeneratingTech(true);
    try {
      const url = await generateTechDoc();
      const a = document.createElement('a');
      a.href = url;
      a.download = '技術文件.docx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Tech Doc generation error:", error);
      alert("生成技術文件時發生錯誤，請稍後再試。");
    } finally {
      setIsGeneratingTech(false);
    }
  };

  const handleDownloadManual = async () => {
    setIsGeneratingManual(true);
    try {
      const url = await generateManualDoc();
      const a = document.createElement('a');
      a.href = url;
      a.download = '功能及操作說明.docx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Manual Doc generation error:", error);
      alert("生成功能操作文件時發生錯誤，請稍後再試。");
    } finally {
      setIsGeneratingManual(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <button
        onClick={handleDownloadTech}
        disabled={isGeneratingTech}
        title="下載技術文件 (Word)"
        className="text-xs border-2 border-accent text-accent px-2 py-1 font-bold tracking-widest uppercase hover:bg-accent hover:text-bg transition-colors disabled:opacity-50"
      >
        {isGeneratingTech ? 'Gen...' : '技術文件 ↓'}
      </button>
      <button
        onClick={handleDownloadManual}
        disabled={isGeneratingManual}
        title="下載功能及操作說明 (Word)"
        className="text-xs border-2 border-accent text-accent px-2 py-1 font-bold tracking-widest uppercase hover:bg-accent hover:text-bg transition-colors disabled:opacity-50"
      >
        {isGeneratingManual ? 'Gen...' : '操作說明 ↓'}
      </button>
    </div>
  );
}
