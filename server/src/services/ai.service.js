import { GoogleGenAI } from "@google/genai";

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const calculateBMI = (weight, height) => {
  const h = height / 100;
  return (weight / (h * h)).toFixed(1);
};

export const generateRiskAssessment = async (profile, responses, language) => {
  const prompt = `
You are SanadHealth, a preventive health AI assistant for Nigerian users.
Respond only in ${language}.

Patient Profile:
- Age: ${profile.age}
- Gender: ${profile.gender}
- BMI: ${calculateBMI(profile.weight, profile.height)}
- Location: ${profile.lga}, ${profile.state}
- Family history of diabetes/hypertension: ${profile.familyHistory ? "Yes" : "No"}
- Smoker: ${profile.smoker ? "Yes" : "No"}
- Activity level: ${profile.activityLevel}
- Diet type: ${profile.dietType}

Symptom Responses:
${JSON.stringify(responses, null, 2)}

Based on this, provide:
1. Risk level: LOW / MEDIUM / HIGH / CRITICAL
2. Risk score: 0–100 (integer)
3. A clear explanation in simple language (2–3 sentences)
4. 3 specific actionable recommendations for this person (strings in an array)
5. Whether they should see a doctor urgently (boolean)

Format your response exactly as JSON with these keys:
{
  "riskLevel": "",
  "riskScore": 0,
  "explanation": "",
  "recommendations": [],
  "urgentCare": true
}
Do not include any explanation outside of the JSON block. Do not use markdown formatting around the JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const raw = response.text;
    
    // Strip possible markdown JSON fences if Claude still includes them
    const clean = raw.replace(/```json\n?|\n?```/g, "").trim();
    
    return JSON.parse(clean);
  } catch (error) {
    console.error("AI Service Error:", error);
    throw new Error("Failed to generate AI assessment");
  }
};
