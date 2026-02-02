
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fineTuneSystemParams = async (currentSettings: any, userGoal: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `You are an Industrial Supply Chain Architect.
    The user is implementing a strict "ORDER -> SALES -> PARTNER INVENTORY" system.
    Goal: ${userGoal}
    
    Current System Context: ${JSON.stringify(currentSettings)}
    
    Provide optimization advice for:
    1. Commission tiers based on fulfillment speed.
    2. Inventory thresholds for Partner Asset Pools.
    3. Metrics for Marketing-to-Revenue traceability.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          recommendedCommissionRate: { type: Type.NUMBER, description: "Suggested base commission rate (percentage)" },
          targetEfficiencyMetric: { type: Type.STRING, description: "Primary KPI for the Order-to-Sale cycle" },
          customerSegmentationAdvice: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Segments for inventory partitioning" },
          logisticsThreshold: { type: Type.NUMBER, description: "Suggested fuel/delivery cap" },
          summary: { type: Type.STRING, description: "Explanation of how these settings support the roadmap." }
        },
        required: ["recommendedCommissionRate", "targetEfficiencyMetric", "customerSegmentationAdvice", "logisticsThreshold", "summary"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};
