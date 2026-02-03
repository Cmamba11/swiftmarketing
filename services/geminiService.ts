import { GoogleGenAI, Type } from "@google/genai";

export const fineTuneSystemParams = async (currentSettings: any, userGoal: string) => {
  // Always initialize GoogleGenAI with a named parameter object.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
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
          recommendedCommissionRate: { 
            type: Type.NUMBER,
            description: "The optimized commission percentage for the sales force."
          },
          targetEfficiencyMetric: { 
            type: Type.STRING,
            description: "The key performance indicator to track (e.g., 'Delivery Speed')."
          },
          customerSegmentationAdvice: { 
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Strategic advice on how to segment industrial partners."
          },
          logisticsThreshold: { 
            type: Type.NUMBER,
            description: "Daily threshold limit for fuel or distance."
          },
          summary: { 
            type: Type.STRING,
            description: "High-level architectural reasoning for these adjustments."
          }
        },
        required: ["recommendedCommissionRate", "targetEfficiencyMetric", "customerSegmentationAdvice", "logisticsThreshold", "summary"]
      },
    },
  });

  // Access the text directly via the .text property as per SDK guidelines.
  const jsonStr = response.text?.trim();
  if (!jsonStr) throw new Error("AI architect failed to generate recommendations.");
  
  return JSON.parse(jsonStr);
};