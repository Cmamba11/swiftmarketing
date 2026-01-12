
import { GoogleGenAI, Type } from "@google/genai";

// Fix: Use process.env.API_KEY directly as per Gemini API guidelines for initialization
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fineTuneSystemParams = async (currentSettings: any, userGoal: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Based on the following user goal: "${userGoal}", suggest optimized configuration parameters for a Marketing Software system (Customer types, Commission percentages, Logistics thresholds, and Key Performance Indicators).
    
    Current System Context: ${JSON.stringify(currentSettings)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          recommendedCommissionRate: { type: Type.NUMBER, description: "Suggested base commission rate (percentage)" },
          targetEfficiencyMetric: { type: Type.STRING, description: "Primary KPI to track for agents" },
          customerSegmentationAdvice: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Ways to slice customer data" },
          logisticsThreshold: { type: Type.NUMBER, description: "Suggested fuel limit per day" },
          summary: { type: Type.STRING, description: "A brief explanation of why these settings were chosen." }
        },
        required: ["recommendedCommissionRate", "targetEfficiencyMetric", "customerSegmentationAdvice", "logisticsThreshold", "summary"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};
