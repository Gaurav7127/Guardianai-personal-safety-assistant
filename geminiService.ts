import { GoogleGenAI, Chat } from "@google/genai";
import { SAFETY_KNOWLEDGE_BASE } from "../constants";

let chatSession: Chat | null = null;

const getAIClient = () => {
  // Support both standard Node.js env and Vite (frontend) env variables
  // When deploying to Netlify/Vercel, use VITE_API_KEY
  const apiKey = process.env.API_KEY || (import.meta as any).env?.VITE_API_KEY;
  
  if (!apiKey) {
    console.error("GuardianAI Error: API Key is missing.");
    throw new Error("API Key is missing. Please set VITE_API_KEY in your environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

export const initializeChat = async (): Promise<Chat> => {
  try {
    const ai = getAIClient();
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SAFETY_KNOWLEDGE_BASE,
        temperature: 0.4, // Keep it relatively deterministic and focused on safety
      },
    });
    return chatSession;
  } catch (error) {
    console.error("Failed to initialize chat:", error);
    throw error;
  }
};

export const sendMessageStream = async (message: string) => {
  if (!chatSession) {
    try {
      await initializeChat();
    } catch (e) {
      throw new Error("Chat could not be initialized. Check API Key.");
    }
  }
  
  if (!chatSession) {
     throw new Error("Failed to initialize chat session");
  }

  return chatSession.sendMessageStream({ message });
};

export const getQuickAdvice = async (topic: string): Promise<string> => {
    try {
      const ai = getAIClient();
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Provide a very short, bulleted list (max 3 items) of immediate safety actions for this situation based on your knowledge base: ${topic}`,
          config: {
              systemInstruction: SAFETY_KNOWLEDGE_BASE
          }
      });
      return response.text || "Consult emergency services immediately if in danger.";
    } catch (error) {
      console.error("Quick advice error:", error);
      return "Unable to connect to AI. Please call 112.";
    }
}