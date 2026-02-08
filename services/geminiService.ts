
import { GoogleGenAI, Type } from "@google/genai";

export const fineTuneSystemParams = async (currentSettings: any, userGoal: string, focusArea: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `You are the Lead Systems Architect for Swift Plastics Inc. 
    We are fine-tuning the Industrial OS based on our current roadmap.
    
    FOCUS AREA: ${focusArea}
    USER OBJECTIVE: ${userGoal}
    CURRENT SYSTEM CONFIG: ${JSON.stringify(currentSettings)}
    
    TASKS:
    1. Analyze the current metrics.
    2. Propose a specific numerical shift for Commission Rates and Logistics Thresholds.
    3. Generate a 3-phase execution roadmap.
    4. Provide a "Strategy Summary" for the board.
    
    CRITICAL: The logic must adhere to the "ORDER -> SALES -> PARTNER INVENTORY" loop.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          recommendedCommissionRate: { 
            type: Type.NUMBER,
            description: "The optimized commission percentage (e.g., 2.5)."
          },
          targetEfficiencyMetric: { 
            type: Type.STRING,
            description: "A short, catchy KPI name for the dashboard."
          },
          customerSegmentationAdvice: { 
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Actionable steps for partner handling."
          },
          logisticsThreshold: { 
            type: Type.NUMBER,
            description: "Max liters of fuel or KM cap per dispatch."
          },
          projectedImpact: {
            type: Type.STRING,
            description: "Estimated % improvement or savings (e.g., +15% Throughput)."
          },
          summary: { 
            type: Type.STRING,
            description: "Detailed analysis of why these changes are needed."
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
        required: ["recommendedCommissionRate", "targetEfficiencyMetric", "customerSegmentationAdvice", "logisticsThreshold", "projectedImpact", "summary", "roadmap"]
      },
    },
  });

  const jsonStr = response.text?.trim();
  if (!jsonStr) throw new Error("AI architect failed to generate recommendations.");
  
  return JSON.parse(jsonStr);
};
