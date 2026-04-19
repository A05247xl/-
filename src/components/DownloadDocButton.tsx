import React, { useState } from 'react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

export function DownloadDocButton() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAndDownloadDoc = async () => {
    setIsGenerating(true);
    try {
      const doc = new Document({
        creator: "Archive.AI System",
        title: "Archive.AI 題庫系統 - 技術與功能說明文件",
        description: "Technical and Functional Documentation",
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                text: "Archive.AI 題庫系統",
                heading: HeadingLevel.TITLE,
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 }
              }),
              new Paragraph({
                text: "技術架構與功能說明文件",
                heading: HeadingLevel.HEADING_2,
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }
              }),

              // Section 1
              new Paragraph({
                text: "一、系統概述 (System Overview)",
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 400, after: 200 }
              }),
              new Paragraph({
                text: "Archive.AI 是一個現代化、智慧化的跨平台學習與題庫測驗系統。其主要目標是幫助考生進行高效的題目反覆練習（包含選擇測驗題與申論題），並能夠透過 Google Sheets 進行全自動的資料同步。系統不僅內嵌了 Web Speech API 進行語音朗讀，更深度結合了 Google Gemini 大型語言模型（LLM），提供申論題的 AI 自動智能批閱與反饋機制。",
                spacing: { after: 120 }
              }),

              // Section 2
              new Paragraph({
                text: "二、核心技術架構 (Tech Stack)",
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 400, after: 200 }
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "• 前端框架：", bold: true }),
                  new TextRun({ text: " React 19 + TypeScript + Vite" })
                ],
                spacing: { after: 80 }
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "• 路由管理：", bold: true }),
                  new TextRun({ text: " React Router v7" })
                ],
                spacing: { after: 80 }
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "• 樣式系統：", bold: true }),
                  new TextRun({ text: " Tailwind CSS v4 (採用黑白、Brutalist 高對比設計風格)" })
                ],
                spacing: { after: 80 }
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "• 動畫系統：", bold: true }),
                  new TextRun({ text: " Motion (framer-motion) 支援流暢的轉場與 UI 反饋" })
                ],
                spacing: { after: 80 }
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "• AI 引擎：", bold: true }),
                  new TextRun({ text: " @google/genai (Gemini 3.1 Pro Preview) 用於申論題批改與自然語言處理" })
                ],
                spacing: { after: 80 }
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "• 資料流與解析：", bold: true }),
                  new TextRun({ text: " PapaParse (即時抓取與解析 Google Sheets 生成之 CSV)" })
                ],
                spacing: { after: 120 }
              }),

              // Section 3
              new Paragraph({
                text: "三、核心功能模組 (Functional Modules)",
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 400, after: 200 }
              }),

              new Paragraph({ text: "1. 測驗模組 (Quiz Module)", heading: HeadingLevel.HEADING_2 }),
              new Paragraph({ text: "提供快問快答模式，點擊選項後立即顯示正確與否及詳解，方便快速刷題。" }),

              new Paragraph({ text: "2. 申論觀摩模組 (Essay Module)", heading: HeadingLevel.HEADING_2 }),
              new Paragraph({ text: "專門顯示申論題題目、評分要點與完整參考解答，具有獨立的過濾與視覺層次。" }),

              new Paragraph({ text: "3. 閱讀模組 (Read Q / Read E)", heading: HeadingLevel.HEADING_2 }),
              new Paragraph({ text: "將題庫拆分為「讀(測)」與「讀(申)」兩個獨立的分頁。使用者能夠以長清單、無干擾的瀑布流方式快速總覽所有題材，頁首包含準確的題數統計。" }),

              new Paragraph({ text: "4. 語音朗讀模組 (Audio Module)", heading: HeadingLevel.HEADING_2 }),
              new Paragraph({ text: "透過瀏覽器原生 Web Speech API 實作，可設定語速 (Speed) 與音量 (Volume)。能夠依序自動朗讀題目與選項，適用於通勤或螢幕疲勞時聆聽學習。" }),

              new Paragraph({ text: "5. 全真出題與測驗模組 (Exam Module)", heading: HeadingLevel.HEADING_2 }),
              new Paragraph({
                children: [
                  new TextRun({ text: "• 隨機抽題：", bold: true }),
                  new TextRun({ text: " 從當前科目中隨機抽取 40 題測驗題與 2 題申論題。\n" }),
                  new TextRun({ text: "• 使用者體驗：", bold: true }),
                  new TextRun({ text: " 不使用擾人的 alert/confirm，採取沈浸式的 UI 流程。包含「設定」、「測驗中」、「AI 評分中」、「報告」四個漸進階段。\n" }),
                  new TextRun({ text: "• 申論題 AI 批改：", bold: true }),
                  new TextRun({ text: " 透過 Gemini 設定精確 Prompt 與 JSON 回傳格式，比對官方要點與學生的擬答，給出 0~100 分。滿 60 分以達標計算。\n" }),
                  new TextRun({ text: "• 錯題匯出匯入：", bold: true }),
                  new TextRun({ text: " 測驗結算後，可將所有錯題（包含申論不達標者）匯出為帶有版本與時間戳記的 JSON 檔（如：複習重點_全部科目_2026-04-18.json）。並支援在首頁重新匯入該 JSON，實現跨電腦與時間的錯題收斂複習迴圈。" })
                ]
              }),

              // Section 4
              new Paragraph({
                text: "四、資料庫與安全性配置",
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 400, after: 200 }
              }),
              new Paragraph({ text: "1. 無伺服器架構：直接透過前端解析公開或受權限控管的 Google Sheet CSV，達到免維護資料庫即可隨時更新題庫的效果。" }),
              new Paragraph({ text: "2. 本端儲存：無痛支援 JSON 匯出入，所有使用者的測驗紀錄、錯題都保留在客戶端與實體檔案，不具資料外洩風險。" }),
              new Paragraph({ text: "3. 環境變數：Gemini API Key 採用嚴格的伺服器端環境變數注入或無伺服器架構保護，避免客戶端金鑰暴露。" }),

            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Archive_AI_Tech_Manual.docx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Doc generation error:", error);
      alert("生成文件時發生錯誤，請稍後再試。");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generateAndDownloadDoc}
      disabled={isGenerating}
      title="下載技術與功能說明文件 (Word)"
      className="text-xs border-2 border-accent text-accent px-2 py-1 font-bold tracking-widest uppercase hover:bg-accent hover:text-bg transition-colors disabled:opacity-50"
    >
      {isGenerating ? 'Generating...' : 'Doc ↓'}
    </button>
  );
}
