
import { GoogleGenAI, Type } from "@google/genai";
import { BUSINESS_LOGIC } from "../constants";

/**
 * AI ARCHITECT ENGINE - TIER 1 SYSTEM TUNER
 * This service takes your roadmap and converts it into application variables.
 */
export const fineTuneSystemParams = async (currentSettings: any, userRoadmap: string, focusArea: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `You are the Lead Systems Architect for Swift Plastics Inc. 
    A user has provided a personal ROADMAP for their business operations.
    
    USER ROADMAP: "${userRoadmap}"
    FOCUS AREA: ${focusArea}
    
    CURRENT SYSTEM VERSION: ${BUSINESS_LOGIC.SYSTEM_VERSION}
    CURRENT CONFIG: ${JSON.stringify(currentSettings)}

    TASK:
    Analyze the user's roadmap and calculate the exact SYSTEM OVERRIDES required to achieve these goals. 
    You must provide realistic industrial numbers.

    OUTPUT SCHEMA REQUIREMENTS:
    - recommendedCommissionRate: Adjusted percentage for agents based on roadmap goals.
    - logisticsThreshold: Fuel cap (Liters) optimized for the described routes.
    - targetEfficiencyMetric: A catchy 3-word KPI name for this roadmap phase.
    - roadmap: A 3-phase execution plan.
    - projectedImpact: A percentage or dollar value estimate of improvement.
    - customLogicOverrides: A JSON object of specific internal logic shifts.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          recommendedCommissionRate: { type: Type.NUMBER },
          targetEfficiencyMetric: { type: Type.STRING },
          customerSegmentationAdvice: { type: Type.ARRAY, items: { type: Type.STRING } },
          logisticsThreshold: { type: Type.NUMBER },
          projectedImpact: { type: Type.STRING },
          summary: { type: Type.STRING },
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
