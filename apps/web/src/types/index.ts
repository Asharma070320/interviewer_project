// ────────────────────────────────────────────────
// Interview Types
// ────────────────────────────────────────────────
export type InterviewRole =
  | "frontend-developer"
  | "backend-developer"
  | "fullstack-developer"
  | "react-developer"
  | "nodejs-developer"
  | "java-developer"
  | "python-developer"
  | "devops-engineer"
  | "hr-interview"
  | "custom";

export type InterviewStatus = "pending" | "in-progress" | "completed" | "cancelled";

export type DifficultyLevel = "beginner" | "intermediate" | "advanced" | "expert";

export interface InterviewQuestion {
  id: string;
  text: string;
  category: string;
  difficulty: DifficultyLevel;
  followUps?: string[];
  expectedDuration?: number; // seconds
}

export interface InterviewAnswer {
  questionId: string;
  transcript: string;
  audioUrl?: string;
  duration: number; // seconds
  timestamp: string;
}

export interface InterviewScores {
  communication: number;
  technicalKnowledge: number;
  problemSolving: number;
  confidence: number;
  clarity: number;
  overall: number;
}

export interface InterviewFeedback {
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  detailedFeedback: string;
}

export interface InterviewSession {
  id: string;
  role: InterviewRole;
  customRole?: string;
  title: string;
  status: InterviewStatus;
  difficulty: DifficultyLevel;
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  scores?: InterviewScores;
  feedback?: InterviewFeedback;
  duration?: number; // seconds
  startedAt: string;
  completedAt?: string;
  createdAt: string;
  type: "voice" | "text" | "coding";
  transcript?: string;
  audioRecordingUrl?: string;
}

// ────────────────────────────────────────────────
// Resume Types
// ────────────────────────────────────────────────
export interface ResumeSkill {
  name: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  category: string;
}

export interface ResumeExperience {
  company: string;
  role: string;
  duration: string;
  description: string[];
  technologies: string[];
}

export interface ResumeProject {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
}

export interface ResumeAnalysis {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  candidateName: string;
  email?: string;
  phone?: string;
  summary: string;
  skills: ResumeSkill[];
  experience: ResumeExperience[];
  projects: ResumeProject[];
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    year: string;
  }>;
  strengths: string[];
  missingSkills: string[];
  suggestedRoles: string[];
  generatedQuestions: InterviewQuestion[];
  overallScore: number;
  experienceYears: number;
}

// ────────────────────────────────────────────────
// Coding Assessment Types
// ────────────────────────────────────────────────
export type CodingLanguage = "javascript" | "typescript" | "python" | "java" | "cpp";

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

export interface CodingProblem {
  id: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  category: string;
  starterCode: Record<CodingLanguage, string>;
  testCases: TestCase[];
  constraints: string[];
  hints: string[];
  timeLimit: number; // milliseconds
  memoryLimit: number; // MB
}

export interface CodeSubmission {
  id: string;
  problemId: string;
  language: CodingLanguage;
  code: string;
  status: "pending" | "running" | "passed" | "failed" | "error" | "timeout";
  passedTests: number;
  totalTests: number;
  executionTime?: number;
  memoryUsed?: number;
  output?: string;
  error?: string;
  aiReview?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  submittedAt: string;
}

// ────────────────────────────────────────────────
// Career Coach Types
// ────────────────────────────────────────────────
export interface CareerRoadmapStep {
  id: string;
  title: string;
  description: string;
  skills: string[];
  resources: Array<{ title: string; url: string; type: "course" | "book" | "article" | "video" }>;
  estimatedWeeks: number;
  completed: boolean;
}

export interface CareerRoadmap {
  id: string;
  targetRole: string;
  currentLevel: string;
  steps: CareerRoadmapStep[];
  estimatedTotalWeeks: number;
  createdAt: string;
}

export interface CoachMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

// ────────────────────────────────────────────────
// Dashboard / Analytics Types
// ────────────────────────────────────────────────
export interface DashboardStats {
  totalInterviews: number;
  averageScore: number;
  communicationScore: number;
  technicalScore: number;
  problemSolvingScore: number;
  confidenceScore: number;
  interviewsThisWeek: number;
  scoreImprovement: number;
  practiceStreak: number;
}

export interface ScoreHistory {
  date: string;
  overall: number;
  communication: number;
  technical: number;
}

export interface PracticeArea {
  name: string;
  score: number;
  totalQuestions: number;
  recommended: boolean;
}
