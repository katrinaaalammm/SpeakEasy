import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Report, TrainingMode } from "../types";

export const getApiKey = (): string => {
  const stored = localStorage.getItem('speak_easy_api_key');
  if (stored) return stored;
  return process.env.API_KEY || '';
};

export const saveApiKey = (key: string) => {
  if (key.trim()) {
    localStorage.setItem('speak_easy_api_key', key.trim());
  } else {
    localStorage.removeItem('speak_easy_api_key');
  }
};

const getAiClient = () => {
  return new GoogleGenAI({ apiKey: getApiKey() });
};

// Helper to define schemas
const contentSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    keywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 5 relevant keywords for the topic.",
    },
    teammateComments: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 5 short, conversational comments or counter-points a teammate might say in a group discussion.",
    },
    audienceQuestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 3 insightful follow-up questions an audience member might ask after the speech.",
    }
  },
  required: ["keywords", "teammateComments", "audienceQuestions"],
};

export const generateSessionContent = async (topic: string, mode: TrainingMode): Promise<{ keywords: string[], teammateComments: string[], audienceQuestions: string[] }> => {
  try {
    let systemInstruction = "You are a helpful public speaking coach and simulator generator.";
    let userPrompt = "";

    if (mode === 'discussion') {
        userPrompt = `The student is practicing a group discussion on: "${topic}". 
        Generate relevant keywords.
        Generate conversational comments/counter-points for AI teammates.
        Generate follow-up questions for the end.`;
    } else {
        userPrompt = `The student is practicing a public speech/presentation on: "${topic}".
        Generate relevant keywords.
        Generate NO teammate comments (empty array).
        Generate insightful audience questions for the Q&A session after the speech.`;
    }

    const response = await getAiClient().models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: contentSchema,
      },
    });

    const json = JSON.parse(response.text || '{}');
    return {
      keywords: json.keywords || [],
      teammateComments: json.teammateComments || [],
      audienceQuestions: json.audienceQuestions || [],
    };

  } catch (error) {
    console.error("Gemini API Error (Session Content):", error);
    return {
      keywords: ["Confidence", "Structure", "Clarity", "Pacing", "Engagement"],
      teammateComments: ["That's an interesting point, but have you considered...", "I agree, and I'd add that...", "Could you clarify what you mean by that?"],
      audienceQuestions: ["Can you elaborate on your main argument?", "How does this apply to real-world scenarios?", "What was your biggest challenge in researching this?"],
    };
  }
};

export const generateFeedback = async (topic: string, reportData: Omit<Report, 'feedback' | 'overallScore'>): Promise<string> => {
  try {
    const prompt = `
      Topic: "${topic}"
      Metrics:
      - Eye Contact: ${reportData.eyeContactScore}/100
      - Composure: ${100 - reportData.nervousScore}/100
      - Gestures: ${reportData.gestureScore}/100
      - Pace: ${reportData.speechRate} WPM
      
      Write a short, constructive feedback (max 2 sentences). Focus on improvement.
    `;

    const response = await getAiClient().models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Good effort. Focus on maintaining steady eye contact and pacing your speech for better clarity.";
  } catch (error) {
    return "Great effort! We noticed you spoke clearly. Try to maintain more eye contact next time.";
  }
};
