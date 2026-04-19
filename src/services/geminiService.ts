import { GoogleGenAI, Type } from '@google/genai';

export async function gradeEssay(question: string, keyPoints: string, userResponse: string): Promise<{ score: number, feedback: string }> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `
您是一位專業的閱卷老師。請根據以下題目的「評分要點/參考解答」來評估學生的「作答」。

【題目】
${question}

【評分要點/參考解答】
${keyPoints}

【學生作答】
${userResponse}

請基於評分要點給予 0 到 100 分的評分，並提供詳細的中文回饋。指出作答中好的地方以及需要改善或漏掉的要點。以客觀、鼓勵的語氣。
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: {
              type: Type.INTEGER,
              description: "The grade score from 0 to 100"
            },
            feedback: {
              type: Type.STRING,
              description: "Detailed feedback explaining the score and what points were missed or answered well, in Traditional Chinese (zh-TW)."
            }
          },
          required: ["score", "feedback"]
        }
      }
    });

    const resultText = response.text || '';
    const result = JSON.parse(resultText);
    
    return {
      score: result.score || 0,
      feedback: result.feedback || '無法生成評語。'
    };
  } catch (error) {
    console.error('Error grading essay with Gemini:', error);
    return {
      score: 0,
      feedback: '網路錯誤或 API 設定異常，無法批改此題。請稍後再試。'
    };
  }
}
