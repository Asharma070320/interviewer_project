import { startChat, generateText } from "./gemini.client";
import type { ChatSession } from "@google/generative-ai";

const COACH_SYSTEM_PROMPT = `You are an expert AI Career Coach specializing in software engineering careers.

Your expertise includes:
- Career path planning for software engineers (Frontend, Backend, Full Stack, DevOps, Mobile)
- Technical skill gap analysis and learning roadmaps
- Interview preparation strategies
- Salary negotiation tactics
- Resume and portfolio guidance
- Transitioning between tech roles

Your coaching style:
- Be specific, actionable, and encouraging
- Use bullet points and structure for clarity
- Give real-world examples and resources
- Reference current industry trends (2024-2026)
- Mention specific tools, courses, and platforms when relevant
- Keep responses focused and concise (under 300 words unless a detailed roadmap is requested)

Always respond in a warm, professional, mentor-like tone.`;

let chatSession: ChatSession | null = null;

export function initCoachChat(): ChatSession {
  chatSession = startChat(COACH_SYSTEM_PROMPT);
  return chatSession;
}

export function getOrInitChat(): ChatSession {
  if (!chatSession) return initCoachChat();
  return chatSession;
}

export async function sendCoachMessage(message: string): Promise<string> {
  const chat = getOrInitChat();
  const result = await chat.sendMessage(message);
  return result.response.text();
}

export function resetCoachChat(): void {
  chatSession = null;
}

export async function generateRoadmap(targetRole: string, currentSkills: string[]): Promise<string> {
  const prompt = `
Create a detailed learning roadmap for someone wanting to become a ${targetRole}.
Their current skills include: ${currentSkills.join(", ") || "basic programming knowledge"}.

Format the roadmap with:
- Phase 1, 2, 3 (each 4-8 weeks)
- Specific skills to learn in each phase
- Recommended resources (courses, books, projects)
- Milestones to measure progress

Keep it practical and achievable.
`;
  return generateText(prompt);
}
