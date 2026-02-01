import { GoogleGenAI } from "@google/genai";

/**
 * خدمة الذكاء الاصطناعي السريرية - مدعومة بمحرك Gemini 3 Pro.
 * تم تحديث الخدمة لتعالج أخطاء المصادقة السابقة وتوفر تحليلًا أدق.
 */
export const aiService = {
  generateInsights: async (prompt: string): Promise<string> => {
    try {
      //初始化 Gemini API باستخدام مفتاح البيئة المؤمن تلقائياً
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          systemInstruction: "You are a world-class senior dental consultant. Analyze the provided patient data (Medical history, dental chart, and clinical notes) and provide professional insights in the same language as the prompt. Include: 1) Potential diagnosis, 2) Recommended immediate actions, 3) Long-term treatment suggestions, 4) Urgent medical alerts. Be concise and professional.",
          temperature: 0.5,
          topP: 0.95,
          topK: 40,
        },
      });

      const text = response.text;

      if (!text) {
        throw new Error("لم يتمكن المحرك من إنشاء رد. يرجى المحاولة مرة أخرى.");
      }

      return text;
    } catch (error: any) {
      console.error("AI Service Error:", error);
      
      // معالجة الأخطاء الشائعة
      if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('Invalid API Key')) {
        throw new Error("عذراً، هناك مشكلة في إعدادات النظام البرمجية (API Key). يرجى مراجعة الدعم الفني.");
      }
      
      if (error.message?.includes('429')) {
        throw new Error("تم تجاوز حد الطلبات المسموح به حالياً. يرجى الانتظار قليلاً ثم المحاولة.");
      }

      throw new Error("حدث خطأ تقني أثناء تحليل البيانات. يرجى التأكد من اتصالك بالإنترنت.");
    }
  }
};
