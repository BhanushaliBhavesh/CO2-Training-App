import { GoogleGenAI } from "@google/genai";
// import { Session } from "../types"; // REMOVED: Type imports are not needed in JS

export const geminiService = {
  generateInsights: async (sessions) => {
    if (sessions.length === 0)
      return ["Start your first session to see insights!"];

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const summary = sessions.slice(0, 10).map((s) => ({
      date: s.date,
      type: s.type,
      hold: s.maxHold || s.holdDuration,
      rounds: s.roundsCompleted,
    }));

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Based on these breath-holding session logs, provide 3 short, encouraging therapist-style insights (max 15 words each). 
        Logs: ${JSON.stringify(summary)}`,
        config: {
          temperature: 0.7,
        },
      });

      const text = response.text || "";
      return text
        .split("\n")
        .filter((line) => line.trim().length > 0)
        .slice(0, 3);
    } catch (error) {
      console.error("Gemini Insight Error:", error);
      return [
        "Your max hold is improving steadily.",
        "Consistency is the key to CO2 tolerance.",
        "Keep breathing mindfully today.",
      ];
    }
  },
};
