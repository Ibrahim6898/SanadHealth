import { GoogleGenAI } from "@google/genai";
import { generateRiskAssessment } from "../services/ai.service.js"; // Reuse

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const openChat = async (req, res, next) => {
  try {
    const { message } = req.body;
    
    const prompt = `
You are SanadHealth, a preventive health AI assistant for Nigerian users.
Respond in ${req.user.language || "English"}.
Be concise, helpful, and empathetic. Provide general guidance.
Do not provide medical diagnoses. Advise seeing a doctor if appropriate.

User asks:
"${message}"
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({ reply: response.text });
  } catch (error) {
    next(error);
  }
};
