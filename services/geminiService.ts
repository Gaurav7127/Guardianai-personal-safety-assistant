import { SAFETY_KNOWLEDGE_BASE } from "../constants";

// Helper to determine the API URL
const getApiUrl = () => {
  // In development, this points to localhost. In production, it points to your Netlify site.
  // Netlify automatically handles the /.netlify/functions path.
  return '/.netlify/functions/chat';
};

export const sendMessageStream = async (message: string) => {
  // NOTE: Streaming is complex with basic serverless functions. 
  // For this implementation, we will convert to a standard request/response 
  // to ensure reliability with the Netlify Function approach.
  
  try {
    const response = await fetch(getApiUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        systemInstruction: SAFETY_KNOWLEDGE_BASE
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    
    // Mimic the stream generator format your UI expects
    // This allows us to switch backend logic without breaking ChatInterface.tsx
    async function* mockStream() {
      yield { text: data.text };
    }

    return mockStream();

  } catch (error) {
    console.error("Chat API Error:", error);
    throw error;
  }
};

// We keep this for compatibility, but it now just calls the main function logic
export const initializeChat = async () => {
  return null; 
};

export const getQuickAdvice = async (topic: string): Promise<string> => {
    try {
      const response = await fetch(getApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Provide a very short, bulleted list (max 3 items) of immediate safety actions for this situation based on your knowledge base: ${topic}`,
          systemInstruction: SAFETY_KNOWLEDGE_BASE
        })
      });

      if (!response.ok) return "Consult emergency services immediately.";
      const data = await response.json();
      return data.text;
    } catch (error) {
      console.error("Quick advice error:", error);
      return "Unable to connect to AI. Please call 112.";
    }
}