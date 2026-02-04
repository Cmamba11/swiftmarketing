import { GoogleGenAI, Type } from "@google/genai";

export const fineTuneSystemParams = async (currentSettings: any, userGoal: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `You are an Industrial Supply Chain & Manufacturing Architect for Swift Plastics Inc.
    The user is implementing a strict "ORDER -> SALES -> PARTNER INVENTORY" system.
    Goal: ${userGoal}
    
    Current System Context: ${JSON.stringify(currentSettings)}
    
    Provide a detailed optimization plan and a phased implementation roadmap.
    1. Commission tiers based on fulfillment speed and target achievement.
    2. Inventory thresholds for Partner Asset Pools (Rollers & Bags).
    3. Metrics for Logistics-to-Revenue traceability.
    4. A 3-step execution roadmap with clear milestones.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          recommendedCommissionRate: { 
            type: Type.NUMBER,
            description: "The optimized commission percentage."
          },
          targetEfficiencyMetric: { 
            type: Type.STRING,
            description: "The primary KPI to focus on."
          },
          customerSegmentationAdvice: { 
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Strategies for partner management."
          },
          logisticsThreshold: { 
            type: Type.NUMBER,
            description: "Daily fuel or distance cap."
          },
          summary: { 
            type: Type.STRING,
            description: "Executive summary of the architectural changes."
          },
          roadmap: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                phase: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                milestone: { type: Type.STRING }
              },
              required: ["phase", "title", "description", "milestone"]
            }
          }
        },
        required: ["recommendedCommissionRate", "targetEfficiencyMetric", "customerSegmentationAdvice", "logisticsThreshold", "summary", "roadmap"]
      },
    },
  });

  const jsonStr = response.text?.trim();
  if (!jsonStr) throw new Error("AI architect failed to generate recommendations.");
  
  return JSON.parse(jsonStr);
};