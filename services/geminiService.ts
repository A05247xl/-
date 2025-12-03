import { GoogleGenAI } from "@google/genai";

// Ensure API Key is available
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("API_KEY is missing in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

const SYSTEM_INSTRUCTION = `
你是一位精通台灣多語環境（國語、台語/閩南語）的語音轉錄與內容整理專家。
你的任務是接收音訊，並產生「整理後」的繁體中文逐字稿。

核心規則與優化目標：

1. **強化的說話者辨識 (Enhanced Speaker Diarization)**：
   - 請極力區分音訊中的不同說話者。
   - 格式要求：在每一位說話者開始發言時，請獨立一行並使用粗體標示，例如：
     
     **[講者 1]**
     這裡是發言內容...
     
     **[講者 2]**
     這是回應內容...

   - 確保標籤清晰可見，方便閱讀。

2. **台語與國語混合辨識 (Taiwanese & Mandarin Support)**：
   - 精確辨識國語與台語（Taiwanese Hokkien）。
   - 轉錄策略：
     - 台語部分請優先使用教育部推薦漢字或通用台語漢字（如：毋是、按呢）。
     - 若無法確定漢字，可轉換為語意對應的書面繁體中文，但在括號中標註原文發音或詞彙，確保語意精確傳達。

3. **智慧整理與過濾**：
   - 去除口語贅字（如「那個」、「呃」、「然後...」），除非該詞彙對語氣表達至關重要。
   - 修正語法錯誤，使語句通順。
   - 依據話題轉換自動分段。

4. **輸出規範**：
   - 直接輸出整理後的 Markdown 內容。
   - 不要有任何非逐字稿的系統回覆（如「好的，這是您的逐字稿...」）。
`;

export const transcribeAudio = async (
  base64Audio: string,
  mimeType: string
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio,
            },
          },
          {
            text: "請將這段語音轉錄為包含清楚講者標示（如 [講者 1]）的繁體中文逐字稿，並支援國台語混雜辨識。",
          },
        ],
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3, 
      },
    });

    if (!response.text) {
      throw new Error("No text response received from Gemini.");
    }

    return response.text;
  } catch (error) {
    console.error("Gemini Transcription Error:", error);
    throw error;
  }
};