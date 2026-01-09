
import { GoogleGenAI } from "@google/genai";

// الموضع المميز للمفاتيح لسهولة التبديل مستقبلاً
const AI_KEYS = [
  'AIzaSyCCCEHh-17VpcgrJM4TCVaX7nT1Otdhslw', // Key 1 (Primary)
  'AIzaSyCs3DM3c0-BJEBSCSwwv0l8vuNwZsetD3U'  // Key 2 (Fallback)
];

// استخدام Gemini 3 Flash حسب تعليمات النظام (وهو الترقية لـ 1.5 فلاش المطلوبة)
const AI_MODEL = 'gemini-3-flash-preview';

export const aiService = {
  generateInsights: async (prompt: string): Promise<string> => {
    let lastError: any = null;

    for (const apiKey of AI_KEYS) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: AI_MODEL,
          contents: prompt,
          config: {
             temperature: 0.7,
             topP: 0.8,
             topK: 40
          }
        });

        if (response && response.text) {
          return response.text;
        }
        throw new Error("Empty AI response");
      } catch (error: any) {
        lastError = error;
        const errorMsg = error.toString().toLowerCase();
        
        // التحقق مما إذا كان الخطأ متعلقاً بالقيود أو الحصة (Quota)
        const isQuotaError = errorMsg.includes('429') || 
                             errorMsg.includes('quota') || 
                             errorMsg.includes('rate limit') ||
                             errorMsg.includes('exhausted');

        if (isQuotaError) {
          console.warn(`AI Key limit reached, trying next key...`);
          continue; // تجربة المفتاح التالي
        }
        
        // إذا كان خطأ آخر غير الكوتا، نتوقف ونعرضه
        throw error;
      }
    }

    throw lastError || new Error("All AI Keys failed");
  }
};
