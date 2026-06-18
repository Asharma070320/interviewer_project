import { generateJSON } from "./gemini.client";
import type { ResumeAnalysis, ResumeSkill, ResumeExperience, InterviewQuestion } from "@/types";
import { generateId } from "@/lib/utils";

interface GeminiResumeResult {
  candidateName: string;
  email: string;
  phone: string;
  summary: string;
  experienceYears: number;
  skills: Array<{ name: string; level: "beginner" | "intermediate" | "advanced" | "expert"; category: string }>;
  experience: Array<{ company: string; role: string; duration: string; description: string[]; technologies: string[] }>;
  projects: Array<{ name: string; description: string; technologies: string[] }>;
  education: Array<{ institution: string; degree: string; field: string; year: string }>;
  strengths: string[];
  missingSkills: string[];
  suggestedRoles: string[];
  generatedQuestions: Array<{ text: string; category: string; difficulty: "beginner" | "intermediate" | "advanced" | "expert" }>;
  overallScore: number;
}

export async function analyzeResume(resumeText: string, fileName: string): Promise<ResumeAnalysis> {
  const prompt = `
You are an expert technical recruiter and career coach. Analyze the following resume and return a detailed JSON analysis.

RESUME TEXT:
${resumeText}

Return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  "candidateName": "full name from resume",
  "email": "email if present else empty string",
  "phone": "phone if present else empty string",
  "summary": "2-3 sentence professional summary based on their experience",
  "experienceYears": <number of years of experience>,
  "skills": [
    { "name": "skill name", "level": "beginner|intermediate|advanced|expert", "category": "Frontend|Backend|Language|Database|DevOps|Cloud|Testing|Other" }
  ],
  "experience": [
    { "company": "company name", "role": "job title", "duration": "e.g. 2021 – Present", "description": ["bullet 1", "bullet 2"], "technologies": ["tech1", "tech2"] }
  ],
  "projects": [
    { "name": "project name", "description": "brief description", "technologies": ["tech1"] }
  ],
  "education": [
    { "institution": "university name", "degree": "B.Tech|M.Tech|B.Sc|MBA etc", "field": "field of study", "year": "graduation year" }
  ],
  "strengths": ["strength 1", "strength 2", "strength 3", "strength 4"],
  "missingSkills": ["gap 1", "gap 2", "gap 3", "gap 4"],
  "suggestedRoles": ["role 1", "role 2", "role 3"],
  "generatedQuestions": [
    { "text": "interview question based on their resume", "category": "Technical|Behavioral|System Design", "difficulty": "beginner|intermediate|advanced|expert" }
  ],
  "overallScore": <score from 1.0 to 10.0 based on overall profile strength>
}

Generate exactly 6 interview questions tailored to their specific experience and skills.
Be accurate, professional, and base everything strictly on the resume content.
`;

  const result = await generateJSON<GeminiResumeResult>(prompt);

  return {
    id: generateId(),
    fileName,
    fileUrl: "",
    uploadedAt: new Date().toISOString(),
    candidateName: result.candidateName || "Unknown",
    email: result.email,
    phone: result.phone,
    summary: result.summary,
    experienceYears: result.experienceYears || 0,
    skills: result.skills || [],
    experience: result.experience || [],
    projects: result.projects || [],
    education: result.education || [],
    strengths: result.strengths || [],
    missingSkills: result.missingSkills || [],
    suggestedRoles: result.suggestedRoles || [],
    generatedQuestions: (result.generatedQuestions || []).map((q) => ({
      id: generateId(),
      text: q.text,
      category: q.category,
      difficulty: q.difficulty,
    })),
    overallScore: Math.min(10, Math.max(1, result.overallScore || 7)),
  };
}
