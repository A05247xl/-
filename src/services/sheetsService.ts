import Papa from 'papaparse';
import { QuizQuestion, EssayQuestion } from '../types';

export const DUMMY_QUIZZES: QuizQuestion[] = [
  {
    id: '1', question: '台灣最高的山是哪一座？', 
    optionA: '雪山', optionB: '玉山', optionC: '阿里山', optionD: '合歡山', 
    answer: 'B', explanation: '玉山主峰海拔3,952公尺，為台灣第一高峰。'
  },
  {
    id: '2', question: '下列何者不是作業系統？', 
    optionA: 'Windows', optionB: 'Linux', optionC: 'Microsoft Word', optionD: 'macOS', 
    answer: 'C', explanation: 'Microsoft Word 是應用程式，而非作業系統。'
  },
  {
    id: '3', question: '光合作用的主要產物是什麼？', 
    optionA: '二氧化碳', optionB: '氧氣與葡萄糖', optionC: '水', optionD: '氮氣', 
    answer: 'B', explanation: '植物透過光合作用將二氧化碳和水轉化為葡萄糖並釋放氧氣。'
  }
];

export const DUMMY_ESSAYS: EssayQuestion[] = [
  {
    id: '1', question: '請說明人工智慧(AI)對現代教育帶來的影響，並舉出一個正向與一個負向的例子。',
    keyPoints: '正向影響：個人化學習、提供輔助教材。負向影響：依賴性增加、作弊問題、思考能力下降。'
  },
  {
    id: '2', question: '溫室效應是什麼？請簡述其成因以及對地球的影響。',
    keyPoints: '成因：二氧化碳、甲烷等溫室氣體增加，吸收地表輻射熱能。影響：全球暖化、海平面上升、極端氣候。'
  }
];

function extractSheetId(input: string): string {
  if (!input) return '';
  const match = input.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : input.trim();
}

async function fetchCsv(sheetId: string, sheetName: string): Promise<any[]> {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Sheets 連線失敗 (HTTP ${response.status})`);
    }
    const text = await response.text();
    
    // 如果回傳的是 HTML，通常是因為權限未公開導致的登入頁面跳轉
    if (text.trim().toLowerCase().startsWith('<!doctype html') || text.trim().toLowerCase().startsWith('<html')) {
      throw new Error('無法讀取試算表，請確認權限是否設為「知道連結的使用者皆可查看」。');
    }

    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        complete: (results) => {
          if (results.errors.length > 0 && !results.data.length) {
            reject(new Error(results.errors[0].message));
          } else {
            resolve(results.data);
          }
        },
        error: (error: any) => reject(error)
      });
    });
  } catch (error: any) {
    throw new Error(error.message || '網路異常，無法存取 Google Sheets。');
  }
}

function getVal(row: any, possibleKeys: string[]): string {
  // 建立一個正規化後的 row 以便比對（將 Key 去除空白、轉小寫）
  const normalizedRow: Record<string, string> = {};
  for (const key in row) {
    const cleanKey = key.replace(/\s+/g, '').toLowerCase();
    normalizedRow[cleanKey] = row[key];
  }

  // 將傳入的 candidates 也做同樣的處理進行比對
  for (const pk of possibleKeys) {
    const cleanPk = pk.replace(/\s+/g, '').toLowerCase();
    if (normalizedRow[cleanPk] !== undefined && normalizedRow[cleanPk] !== '') {
      return String(normalizedRow[cleanPk]).trim();
    }
  }
  return '';
}

function hasQuizFields(row: any): boolean {
  return !!(
    getVal(row, ['OptionA', 'Option A', '選項A', '選項 A', 'A']) ||
    getVal(row, ['OptionB', 'Option B', '選項B', '選項 B', 'B']) ||
    getVal(row, ['Answer', '答案', '解答', '正解', '正確答案'])
  );
}

function hasEssayFields(row: any): boolean {
  return !!(
    getVal(row, ['擬答要點', 'KeyPoints', 'Key Points', '評分要點', '參考解答', '解答提示']) ||
    getVal(row, ['完整參考擬答內容', '完整解答', '詳細解答', 'FullAnswer', 'Full Answer'])
  );
}

export async function loadDataFromSheet(inputSheetId: string): Promise<{quizzes: QuizQuestion[], essays: EssayQuestion[]}> {
  if (!inputSheetId || !inputSheetId.trim() || inputSheetId === "請在此貼上您的表單ID") {
    return { quizzes: DUMMY_QUIZZES, essays: DUMMY_ESSAYS };
  }

  const sheetId = extractSheetId(inputSheetId);

  try {
    const rawQuizzes = await fetchCsv(sheetId, '測驗題');
    if (!rawQuizzes || rawQuizzes.length === 0) {
      throw new Error('未能在「測驗題」分頁找到任何資料，請檢查表頭或分頁名稱是否正確。');
    }

    const quizzes: QuizQuestion[] = rawQuizzes
      .filter(row => {
        if (!getVal(row, ['Question', '問題', '題目', '題幹', '題目內容'])) return false;
        // MUST have quiz features to be recognized as a Quiz question
        if (!hasQuizFields(row)) return false;
        return true;
      })
      .map((row, index) => ({
        id: getVal(row, ['ID', '編號', '題號']) || String(index + 1),
        question: getVal(row, ['Question', '問題', '題目', '題幹', '題目內容']),
        optionA: getVal(row, ['OptionA', 'Option A', '選項A', '選項 A', 'A']),
        optionB: getVal(row, ['OptionB', 'Option B', '選項B', '選項 B', 'B']),
        optionC: getVal(row, ['OptionC', 'Option C', '選項C', '選項 C', 'C']),
        optionD: getVal(row, ['OptionD', 'Option D', '選項D', '選項 D', 'D']),
        answer: getVal(row, ['Answer', '答案', '解答', '正解', '正確答案']).toUpperCase(),
        explanation: getVal(row, ['Explanation', '解析', '說明', '詳解']),
        subject: getVal(row, ['科目', 'Subject']),
        yearTerm: getVal(row, ['年份-期別', '年份期別', 'YearTerm', 'Year Term'])
      }));

    let rawEssays: any[] = [];
    try {
      rawEssays = await fetchCsv(sheetId, '申論題');
    } catch (e) {
      console.warn('Could not fetch essays tab, skipping. Error:', e);
    }
    
    // 嚴格特徵過濾：必須包含申論題的特徵（擬答要點或參考解答），且不得為測驗題（沒有選項）才視為申論題
    const essays: EssayQuestion[] = rawEssays
      .filter(row => {
        if (!getVal(row, ['Question', '問題', '題目', '題幹', '題目內容'])) return false;
        // MUST have essay features to be recognized as an Essay question
        if (!hasEssayFields(row)) return false;
        // EXCLUDE rows that have multiple-choice options (these are quizzes, even if they match essay headers)
        if (getVal(row, ['OptionA', 'Option A', '選項A', '選項 A', 'A']) || getVal(row, ['OptionB', 'Option B', '選項B', '選項 B', 'B'])) {
           return false;
        }
        return true;
      })
      .map((row, index) => ({
        id: getVal(row, ['ID', '編號', '題號']) || String(index + 1),
        question: getVal(row, ['Question', '問題', '題目', '題幹', '題目內容']),
        // 優先抓取「擬答要點」，如果沒有則抓取「完整參考擬答內容」或其他備用名稱
        keyPoints: getVal(row, ['擬答要點', 'KeyPoints', 'Key Points', '評分要點', '參考解答', '解答提示']),
        fullAnswer: getVal(row, ['完整參考擬答內容', '完整解答', '詳細解答', 'FullAnswer', 'Full Answer']),
        subject: getVal(row, ['科目', 'Subject']),
        yearTerm: getVal(row, ['年份-期別', '年份期別', 'YearTerm', 'Year Term'])
      }));

    if (quizzes.length === 0 && essays.length === 0) {
       const headers = Object.keys(rawQuizzes[0] || {}).join(', ');
       throw new Error(`找不到有效的題目。請確保將題目欄位的表頭命名為「題目」或「Question」。\n(目前偵測到的表頭有：${headers})`);
    }

    return { quizzes, essays };
  } catch (error: any) {
    console.error('Error fetching from Google Sheets:', error);
    // 直接拋出錯誤供前端元件攔截顯示，不要回傳虛擬資料，否則找不到問題出在哪
    throw new Error(error.message || '無法正確解析試算表。');
  }
}

