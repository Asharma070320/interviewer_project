import { generateJSON, generateText } from "./gemini.client";
import type { InterviewQuestion, InterviewScores, InterviewFeedback, DifficultyLevel, InterviewRole } from "@/types";
import { generateId } from "@/lib/utils";

const ROLE_LABELS: Record<string, string> = {
  "frontend-developer": "Frontend Developer (React, CSS, JavaScript, Browser APIs)",
  "backend-developer": "Backend Developer (APIs, Databases, Architecture, Node.js)",
  "fullstack-developer": "Full Stack Developer (React, Node.js, Databases, APIs)",
  "react-developer": "React Developer (React ecosystem, Hooks, State Management, Performance)",
  "nodejs-developer": "Node.js Developer (Express, REST APIs, Databases, Streams)",
  "java-developer": "Java Developer (Spring Boot, OOP, JVM, Microservices)",
  "python-developer": "Python Developer (Django/FastAPI, Data processing, Scripting)",
  "devops-engineer": "DevOps Engineer (CI/CD, Docker, Kubernetes, Cloud Infrastructure)",
  "hr-interview": "HR / Behavioral Interview (Soft skills, Culture fit, Leadership)",
  "custom": "Software Engineering",
};

interface GeminiQuestionsResult {
  questions: Array<{
    text: string;
    category: string;
    difficulty: string;
    followUps: string[];
    expectedDuration: number;
  }>;
}

export async function generateInterviewQuestions(
  role: InterviewRole,
  difficulty: DifficultyLevel,
  customRole?: string,
  count = 5
): Promise<InterviewQuestion[]> {
  const roleDesc = role === "custom" ? customRole || "Software Engineer" : ROLE_LABELS[role] || role;

  const prompt = `
You are an expert technical interviewer at a top tech company.

Generate exactly ${count} interview questions for a ${roleDesc} position at ${difficulty} level.

Return ONLY valid JSON with this structure:
{
  "questions": [
    {
      "text": "the interview question",
      "category": "Technical|System Design|Behavioral|Problem Solving|Architecture",
      "difficulty": "${difficulty}",
      "followUps": ["follow up question 1", "follow up question 2"],
      "expectedDuration": <expected answer duration in seconds, 60-180>
    }
  ]
}

Requirements:
- Questions must be specific to the ${roleDesc} role
- Mix technical depth with behavioral elements
- ${difficulty === "expert" ? "Include system design and architecture questions" : ""}
- ${difficulty === "beginner" ? "Focus on fundamentals and concepts" : ""}
- Make questions realistic — ones actually asked at companies like Google, Meta, Amazon
- No yes/no questions — all should require detailed explanations
`;

  const result = await generateJSON<GeminiQuestionsResult>(prompt);
  return (result.questions || []).map((q) => ({
    id: generateId(),
    text: q.text,
    category: q.category || "Technical",
    difficulty: (q.difficulty as DifficultyLevel) || difficulty,
    followUps: q.followUps || [],
    expectedDuration: q.expectedDuration || 120,
  }));
}

interface GeminiEvalResult {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  keyPointsCovered: string[];
  missingPoints: string[];
}

export async function evaluateAnswer(
  question: string,
  answer: string,
  role: string,
  difficulty: DifficultyLevel
): Promise<{ score: number; feedback: string; strengths: string[]; improvements: string[] }> {
  if (!answer.trim()) {
    return { score: 0, feedback: "No answer provided.", strengths: [], improvements: ["Provide a detailed answer"] };
  }

  const prompt = `
You are a senior technical interviewer evaluating a candidate's answer.

ROLE: ${role}
DIFFICULTY: ${difficulty}
QUESTION: ${question}
CANDIDATE'S ANSWER: ${answer}

Evaluate the answer and return ONLY valid JSON:
{
  "score": <score from 1.0 to 10.0>,
  "feedback": "2-3 sentence constructive feedback on the answer",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "keyPointsCovered": ["key point covered"],
  "missingPoints": ["missing point"]
}

Scoring guide:
- 9-10: Exceptional, covers all aspects with examples and depth
- 7-8: Good, covers most aspects with some examples
- 5-6: Average, covers basics but lacks depth
- 3-4: Below average, missing key concepts
- 1-2: Poor, irrelevant or incorrect

Be fair, constructive, and specific to the question asked.
`;

  const result = await generateJSON<GeminiEvalResult>(prompt);
  return {
    score: Math.min(10, Math.max(1, result.score || 5)),
    feedback: result.feedback || "Thank you for your answer.",
    strengths: result.strengths || [],
    improvements: result.improvements || [],
  };
}

interface GeminiFeedbackResult {
  scores: {
    communication: number;
    technicalKnowledge: number;
    problemSolving: number;
    confidence: number;
    clarity: number;
    overall: number;
  };
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  detailedFeedback: string;
}

export async function generateOverallFeedback(
  role: string,
  questionsAndAnswers: Array<{ question: string; answer: string; score: number }>
): Promise<{ scores: InterviewScores; feedback: InterviewFeedback }> {
  const qaText = questionsAndAnswers
    .map((qa, i) => `Q${i + 1}: ${qa.question}\nA: ${qa.answer}\nScore: ${qa.score}/10`)
    .join("\n\n");

  const prompt = `
You are an expert interview coach reviewing a complete interview session.

ROLE: ${role}
INTERVIEW TRANSCRIPT:
${qaText}

Provide comprehensive feedback. Return ONLY valid JSON:
{
  "scores": {
    "communication": <1.0-10.0>,
    "technicalKnowledge": <1.0-10.0>,
    "problemSolving": <1.0-10.0>,
    "confidence": <1.0-10.0>,
    "clarity": <1.0-10.0>,
    "overall": <1.0-10.0>
  },
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "recommendations": ["specific learning recommendation 1", "recommendation 2", "recommendation 3"],
  "detailedFeedback": "3-4 sentence comprehensive assessment of the candidate's performance"
}
`;

  const result = await generateJSON<GeminiFeedbackResult>(prompt);
  return {
    scores: result.scores || {
      communication: 7, technicalKnowledge: 7, problemSolving: 7,
      confidence: 7, clarity: 7, overall: 7,
    },
    feedback: {
      strengths: result.strengths || [],
      improvements: result.improvements || [],
      recommendations: result.recommendations || [],
      detailedFeedback: result.detailedFeedback || "",
    },
  };
}
