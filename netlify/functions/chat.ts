import { Handler } from '@netlify/functions';
import { GoogleGenAI } from '@google/genai';

const handler: Handler = async (event) => {
  // 1. Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // 2. Get the message from the frontend
    const { message, systemInstruction } = JSON.parse(event.body || '{}');

    if (!message) {
      return { statusCode: 400, body: 'Message is required' };
    }

    // 3. Initialize Gemini (The Key is hidden here on the server)
    // Netlify accesses env vars via process.env automatically
    const apiKey = process.env.VITE_API_KEY; 
    
    if (!apiKey) {
      return { statusCode: 500, body: 'Server Error: API Key missing in Netlify Settings' };
    }

    const ai = new GoogleGenAI({ apiKey });

    // 4. Call Google API
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.4,
      },
    });

    // 5. Return the text to the frontend
    return {
      statusCode: 200,
      body: JSON.stringify({ text: response.text }),
    };

  } catch (error: any) {
    console.error("Function error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Failed to generate content' }),
    };
  }
};

export { handler };
