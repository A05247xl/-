import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

export const generateTechDoc = async () => {
  const doc = new Document({
    creator: "歷屆社工師考試題 Study App",
    title: "技術文件",
    description: "Technical Documentation",
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: "歷屆社工師考試題 Study App",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
          }),
          new Paragraph({
            text: "技術文件 (Technical Documentation)",
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),

          // Section 1: Overview
          new Paragraph({
            text: "一、系統概述 (System Overview)",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            text: "此系統為一純前端單頁應用程式（SPA），專為考生設計的現代化、智慧化跨平台題庫測驗系統。無須依賴傳統後端資料庫，直接透過 Google Sheets 匯出的 CSV 作為題庫來源，並深度整合 Web Speech API 與 Google Gemini 語言模型，提供自動語音朗讀與申論題 AI 批改服務。",
            spacing: { after: 120 }
          }),

          // Section 2: Tech Stack
          new Paragraph({
            text: "二、核心技術架構 (Tech Stack)",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({ children: [new TextRun({ text: "• 核心框架：", bold: true }), new TextRun({ text: " React 19 + TypeScript + Vite" })], spacing: { after: 80 } }),
          new Paragraph({ children: [new TextRun({ text: "• 路由管理：", bold: true }), new TextRun({ text: " React Router v7" })], spacing: { after: 80 } }),
          new Paragraph({ children: [new TextRun({ text: "• 樣式規劃：", bold: true }), new TextRun({ text: " Tailwind CSS v4 (採用黑色系、高對比 Brutalist 設計語彙)" })], spacing: { after: 80 } }),
          new Paragraph({ children: [new TextRun({ text: "• 動畫引擎：", bold: true }), new TextRun({ text: " Motion (framer-motion) 處理過場動畫與介面回饋" })], spacing: { after: 80 } }),
          new Paragraph({ children: [new TextRun({ text: "• AI 整合：", bold: true }), new TextRun({ text: " @google/genai SDK (預設調用 gemini-2.5-flash 模型，用於快速且免費額度大的批改任務)" })], spacing: { after: 80 } }),
          new Paragraph({ children: [new TextRun({ text: "• 資料解析：", bold: true }), new TextRun({ text: " PapaParse (即時解析 Google Sheets 發佈之 CSV)" })], spacing: { after: 80 } }),
          new Paragraph({ children: [new TextRun({ text: "• 文件輸出：", bold: true }), new TextRun({ text: " docx 函式庫 (用於純前端生成 Word 文件)" })], spacing: { after: 120 } }),

          // Section 3: Architecture Diagram & Data Flow
          new Paragraph({
            text: "三、資料流與部署架構 (Data Flow & Deployment)",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({ children: [new TextRun({ text: "1. 無伺服器資料流 (Serverless Data Flow)：", bold: true }), new TextRun({ text: " 應用程式不自帶資料庫，當使用者在設定中貼上 Google Sheets 連結後，前端直接發送 HTTP GET 請求取得 CSV 內容，並透過 PapaParse 轉為 JSON 格式存放於 React Context 中供全域呼叫。" })], spacing: { after: 80 } }),
          new Paragraph({ children: [new TextRun({ text: "2. 環境變數管控 (Environment Variables)：", bold: true }), new TextRun({ text: " 系統依賴 VITE_GEMINI_API_KEY 來驗證 AI 呼叫權限。在 Vercel 等平台部署時，需於專案設定中的 Environment Variables 加入此變數，並透過 vite.config.ts 強制注入打包流程中。" })], spacing: { after: 80 } }),
          new Paragraph({ children: [new TextRun({ text: "3. 錯題快取機制 (Error Tracking & Caching)：", bold: true }), new TextRun({ text: " 使用者在模擬考結束後，產生的錯題紀錄可直接在瀏覽器端打包下載為 JSON 檔案，實現「本地輕量化持久儲存」。" })], spacing: { after: 120 } }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  return URL.createObjectURL(blob);
};

export const generateManualDoc = async () => {
  const doc = new Document({
    creator: "歷屆社工師考試題 Study App",
    title: "功能及操作說明",
    description: "User Manual",
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: "歷屆社工師考試題 Study App",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
          }),
          new Paragraph({
            text: "功能及操作說明 (User Manual)",
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),

          // Section 1
          new Paragraph({
            text: "一、系統簡介",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            text: "本系統是一套專為社工師及各類國家考試考生設計的雲端刷題工具。您無需安裝任何軟體，只需使用瀏覽器並準備一份 Google Sheets 題庫檔，便能享受隨機測驗、語音朗讀、模擬考試以及由 AI 進行的申論題精準批閱服務。",
            spacing: { after: 120 }
          }),

          // Section 2
          new Paragraph({
            text: "二、前期準備：題庫格式說明",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            text: "系統必須透過讀取 Google Sheets 轉換的 CSV 來匯入資料。請確保您的雲端試算表符合以下欄位名稱（首列）：",
            spacing: { after: 120 }
          }),
          new Paragraph({ children: [new TextRun({ text: "• 編號：", bold: true }), new TextRun({ text: " 題目的唯一識別碼" })], spacing: { after: 80 } }),
          new Paragraph({ children: [new TextRun({ text: "• 科目：", bold: true }), new TextRun({ text: " 用於分類不同考科（例如：社會工作直接服務、人類行為與社會環境）" })], spacing: { after: 80 } }),
          new Paragraph({ children: [new TextRun({ text: "• 題目：", bold: true }), new TextRun({ text: " 選擇題或申論題的題幹" })], spacing: { after: 80 } }),
          new Paragraph({ children: [new TextRun({ text: "• 選項 A / B / C / D：", bold: true }), new TextRun({ text: " 選擇題的四個選項內容（申論題可留空）" })], spacing: { after: 80 } }),
          new Paragraph({ children: [new TextRun({ text: "• 答案：", bold: true }), new TextRun({ text: " 選擇題填上 A/B/C/D；若是申論題，請填寫「申論題」以利系統判斷" })], spacing: { after: 80 } }),
          new Paragraph({ children: [new TextRun({ text: "• 詳解：", bold: true }), new TextRun({ text: " 選擇題的解析，或是申論題的「評分要點/官方解答」" })], spacing: { after: 80 } }),
          new Paragraph({ children: [new TextRun({ text: "• 類型：", bold: true }), new TextRun({ text: " 請標示為「選擇」或「申論」" })], spacing: { after: 120 } }),
          new Paragraph({ text: "設定完成後，請於 Google 試算表點擊「檔案」->「共用」->「發布到網路」，選擇「逗號分隔值 (.csv)」，並複製該連結。" }),

          // Section 3
          new Paragraph({
            text: "三、各頁面功能詳細說明",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          
          new Paragraph({ text: "1. 資料設定與匯入 (Settings)", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: "點擊畫面右上角的「⚙️ Settings」圖示，將步驟二複製的 CSV 連結貼入並點擊「Load」。系統將解析題庫並顯示出科目清單，您可以切換至想練習的科目進行測驗。此外，您也可以在此處點擊「匯入錯題」，將以往保存的 JSON 錯題檔上傳，系統會自動切換至「重點複習」模式。" }),

          new Paragraph({ text: "2. 測驗模式 (Quiz)", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: "針對目前選擇的科目，系統會隨機抽出一題選擇題。您可以直接點擊選項作答，系統會立刻以高對比顏色回饋正確或錯誤，並在展開區域顯示詳解。若想暫時跳過，可點擊「換一題」。此模式非常適合零碎時間快問快答。" }),

          new Paragraph({ text: "3. 申論觀摩 (Essay)", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: "只顯示題庫中的「申論題」。您可以瀏覽題目並點擊展開相對應的「評分要點/參考解答」。用途在於考前掃描背誦重要理論與定義。" }),

          new Paragraph({ text: "4. 語音背誦 (Audio)", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: "專為通勤、視力疲勞的考生設計。點擊「開始播放」，系統會利用瀏覽器的引擎自動念出題目與 A 到 D 的選項。您可以自由調整語速與音量，並透過「下一題 / 上一題」控制進度。停止播放前，它會持續自動為您朗讀下去。" }),

          new Paragraph({ text: "5. 題庫閱讀 (Read Q / Read E)", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: "這是不需要互動的「清單模式」。所有的選擇題 (Read Q) 與申論題 (Read E) 會像網頁長列表一樣排開，方便您使用快速捲動方式進行無干擾總覽複習。" }),

          new Paragraph({ text: "6. 模擬考試 (Exam) 與 AI 批改", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: "這是本系統的核心應用區。點擊「開始模擬考」後，系統會鎖定科目，並隨機抽取 40 題選擇與 2 題申論（依題庫實際數量動態調整）。\n• 測驗進行中，選擇題採「點選即存」且不顯示對錯，申論題則提供大型輸入框讓您打字。\n• 交卷後，系統會自動在背景啟動 Gemini AI 模型，根據內建的詳解為您的申論題進行客觀評分，給予 0~100 分及逐項評點。\n• 結算畫面會詳細列出做錯的選擇題與未達標（60分以下）的申論題。\n• 最重要的是，您可以點擊「下載本次錯題 JSON」，將這次失誤的地方存檔，未來在設定畫面即可匯入重新測驗！" }),

          // Section 4
          new Paragraph({
            text: "四、常見問答與故障排除 (Troubleshooting)",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({ children: [new TextRun({ text: "問題：模擬考試時出現 API 額度已滿或無法批改？", bold: true })] }),
          new Paragraph({ text: "解答：請確認您輸入或佈署的 Gemini API Key 額度是否充足，若您是在個人的 Vercel 上架設，請務必於 Vercel 的 Environment Variables 中正確設置 VITE_GEMINI_API_KEY 並重新部署。" }),
          new Paragraph({ children: [new TextRun({ text: "問題：載入 Google Sheets 時出現 CORS 錯誤或格式不符？", bold: true })] }),
          new Paragraph({ text: "解答：請確保該試算表已設為「發布到網路」，且格式下拉選單有正確選擇「逗號分隔值 (.csv)」，否則系統無法解析網頁結構。" }),

        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  return URL.createObjectURL(blob);
};
