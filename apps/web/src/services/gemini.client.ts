import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
const MODEL_NAME = (import.meta.env.VITE_GEMINI_MODEL as string) || "gemini-2.0-flash";

if (!API_KEY) {
  console.warn("[Gemini] VITE_GEMINI_API_KEY is not set. AI features will not work.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

export function getModel() {
  return genAI.getGenerativeModel({
    model: MODEL_NAME,
    safetySettings,
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
  });
}

export async function generateText(prompt: string): Promise<string> {
  const model = getModel();
  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
}

export async function generateJSON<T>(prompt: string): Promise<T> {
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    safetySettings,
    generationConfig: {
      temperature: 0.4,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 4096,
      responseMimeType: "application/json",
    },
  });
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return JSON.parse(text) as T;
}

export function startChat(systemInstruction: string) {
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    safetySettings,
    systemInstruction,
    generationConfig: {
      temperature: 0.8,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    },
  });
  return model.startChat({ history: [] });
}
