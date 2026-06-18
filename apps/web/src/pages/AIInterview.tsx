import { useState } from "react";
import {
  Zap, ChevronRight, Clock, BarChart3, Star,
  MessageSquare, CheckCircle2, RefreshCw, ArrowRight,
  Sparkles, Bot, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn, generateId, getScoreBg, getScoreLabel } from "@/lib/utils";
import { useInterviewStore } from "@/stores/interview.store";
import {
  generateInterviewQuestions,
  evaluateAnswer,
  generateOverallFeedback,
} from "@/services/interview.service";
import type { InterviewRole, DifficultyLevel, InterviewSession, InterviewQuestion } from "@/types";

const ROLES: { value: InterviewRole; label: string; icon: string; desc: string }[] = [
  { value: "frontend-developer", label: "Frontend Developer", icon: "⚛️", desc: "React, CSS, Browser APIs" },
  { value: "backend-developer", label: "Backend Developer", icon: "🔧", desc: "APIs, Databases, Architecture" },
  { value: "fullstack-developer", label: "Full Stack Developer", icon: "🌐", desc: "End-to-end development" },
  { value: "react-developer", label: "React Developer", icon: "⚛️", desc: "React ecosystem & patterns" },
  { value: "nodejs-developer", label: "Node.js Developer", icon: "🟩", desc: "Server-side JavaScript" },
  { value: "java-developer", label: "Java Developer", icon: "☕", desc: "Spring Boot, OOP, JVM" },
  { value: "python-developer", label: "Python Developer", icon: "🐍", desc: "Django, FastAPI, scripting" },
  { value: "devops-engineer", label: "DevOps Engineer", icon: "⚙️", desc: "CI/CD, Docker, Kubernetes" },
  { value: "hr-interview", label: "HR Interview", icon: "👥", desc: "Behavioral & soft skills" },
  { value: "custom", label: "Custom Role", icon: "✨", desc: "Define your own role" },
];

const roleLabels: Record<string, string> = Object.fromEntries(ROLES.map((r) => [r.value, r.label]));

type Stage = "setup" | "loading" | "interview" | "evaluating" | "results";

interface AnswerRecord {
  question: InterviewQuestion;
  text: string;
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export default function AIInterview() {
  const [stage, setStage] = useState<Stage>("setup");
  const [selectedRole, setSelectedRole] = useState<InterviewRole | "">("");
  const [customRole, setCustomRole] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("intermediate");
  const [questionCount, setQuestionCount] = useState(5);
  const [currentQ, setCurrentQ] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const { addSession } = useInterviewStore();

  const startInterview = async () => {
    if (!selectedRole) return;
    setStage("loading");
    try {
      const qs = await generateInterviewQuestions(
        selectedRole as InterviewRole,
        difficulty,
        customRole || undefined,
        questionCount
      );
      if (!qs.length) throw new Error("No questions returned");
      setQuestions(qs);
      setCurrentQ(0);
      setAnswers([]);
      setUserAnswer("");
      setStage("interview");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate questions. Check your Gemini API key.");
      setStage("setup");
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) return;
    setSubmittingAnswer(true);
    setStage("evaluating");

    try {
      const q = questions[currentQ];
      const result = await evaluateAnswer(
        q.text,
        userAnswer,
        roleLabels[selectedRole] || selectedRole,
        difficulty
      );
      const record: AnswerRecord = {
        question: q,
        text: userAnswer,
        score: result.score,
        feedback: result.feedback,
        strengths: result.strengths,
        improvements: result.improvements,
      };
      const newAnswers = [...answers, record];
      setAnswers(newAnswers);
      setUserAnswer("");
      setSubmittingAnswer(false);

      if (currentQ + 1 >= questions.length) {
        // Generate overall feedback
        const { scores, feedback } = await generateOverallFeedback(
          roleLabels[selectedRole] || selectedRole,
          newAnswers.map((a) => ({ question: a.question.text, answer: a.text, score: a.score }))
        );
        const session: InterviewSession = {
          id: generateId(),
          role: selectedRole as InterviewRole,
          customRole: customRole || undefined,
          title: `${roleLabels[selectedRole] || selectedRole} Interview`,
          status: "completed",
          difficulty,
          questions,
          answers: [],
          scores,
          feedback,
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          type: "text",
        };
        addSession(session);
        setStage("results");
      } else {
        setCurrentQ((c) => c + 1);
        setStage("interview");
      }
    } catch (err) {
      console.error(err);
      toast.error("Evaluation failed. Check your Gemini API key.");
      setSubmittingAnswer(false);
      setStage("interview");
    }
  };

  // ── Setup ──────────────────────────────────────────────────────────────
  if (stage === "setup") {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold">AI Mock Interview</h2>
            <Badge variant="gradient" className="text-[10px]">
              <Bot className="h-3 w-3 mr-1" /> Gemini AI
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Gemini AI generates questions in real-time and evaluates every answer with detailed feedback
          </p>
        </div>

        {/* Role grid */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {ROLES.map((role) => (
            <button
              key={role.value}
              onClick={() => setSelectedRole(role.value)}
              className={cn(
                "relative flex flex-col items-start gap-2 p-4 rounded-xl border text-left transition-all duration-200",
                selectedRole === role.value
                  ? "border-primary bg-primary/5 shadow-glow-sm"
                  : "border-border hover:border-primary/40 hover:bg-accent/30"
              )}
            >
              <span className="text-2xl">{role.icon}</span>
              <div>
                <p className={cn("text-sm font-semibold", selectedRole === role.value && "text-primary")}>
                  {role.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{role.desc}</p>
              </div>
              {selectedRole === role.value && (
                <CheckCircle2 className="h-4 w-4 text-primary absolute top-3 right-3" />
              )}
            </button>
          ))}
        </div>

        {/* Custom role input */}
        {selectedRole === "custom" && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Your Role</label>
            <input
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              placeholder="e.g. Senior iOS Developer, Data Engineer..."
              className="w-full h-9 px-3 rounded-lg border border-input bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        )}

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Interview Settings</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Difficulty</label>
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as DifficultyLevel)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner (0–2 yrs)</SelectItem>
                  <SelectItem value="intermediate">Intermediate (2–5 yrs)</SelectItem>
                  <SelectItem value="advanced">Advanced (5–8 yrs)</SelectItem>
                  <SelectItem value="expert">Expert (8+ yrs)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Questions</label>
              <Select value={String(questionCount)} onValueChange={(v) => setQuestionCount(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 questions (~12 min)</SelectItem>
                  <SelectItem value="5">5 questions (~20 min)</SelectItem>
                  <SelectItem value="8">8 questions (~30 min)</SelectItem>
                  <SelectItem value="10">10 questions (~40 min)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">AI Model</label>
              <div className="flex h-9 items-center gap-2 px-3 rounded-lg border bg-muted text-sm text-muted-foreground">
                <Bot className="h-3.5 w-3.5 text-primary" /> Gemini 2.0 Flash
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          size="xl" variant="gradient" className="w-full"
          disabled={!selectedRole || (selectedRole === "custom" && !customRole.trim())}
          onClick={startInterview}
        >
          <Zap className="h-5 w-5" /> Generate Questions with Gemini AI
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────
  if (stage === "loading") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-gradient-brand animate-pulse shadow-glow" />
          <Bot className="absolute inset-0 m-auto h-10 w-10 text-white" />
        </div>
        <div className="text-center">
          <p className="text-xl font-bold">Gemini is generating your questions...</p>
          <p className="text-muted-foreground text-sm mt-1">
            Creating {questionCount} personalized {roleLabels[selectedRole]} questions at {difficulty} level
          </p>
        </div>
        <div className="flex gap-1">
          {[0, 0.2, 0.4].map((d) => (
            <div key={d} className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${d}s` }} />
          ))}
        </div>
      </div>
    );
  }

  // ── Interview ──────────────────────────────────────────────────────────
  if (stage === "interview" || stage === "evaluating") {
    const progress = (answers.length / questions.length) * 100;
    const isEvaluating = stage === "evaluating";

    return (
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Question {answers.length + 1} of {questions.length}</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] capitalize">{difficulty}</Badge>
              <span className="text-muted-foreground">{Math.round(progress)}% complete</span>
            </div>
          </div>
          <Progress value={progress} />
        </div>

        {/* Question */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-brand shadow-glow-sm">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-[10px]">
                    {questions[currentQ]?.category}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] capitalize">
                    {questions[currentQ]?.difficulty}
                  </Badge>
                  {questions[currentQ]?.expectedDuration && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> ~{Math.round((questions[currentQ].expectedDuration ?? 120) / 60)} min
                    </span>
                  )}
                </div>
                <p className="text-base font-medium leading-relaxed">{questions[currentQ]?.text}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Previous answers mini feed */}
        {answers.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Recent Answers</p>
            {answers.slice(-2).map((a, i) => (
              <Card key={i} className="bg-muted/30">
                <CardContent className="p-3 flex items-start justify-between gap-3">
                  <p className="text-xs text-muted-foreground line-clamp-2 flex-1">{a.text}</p>
                  <Badge className={cn("shrink-0 text-xs", getScoreBg(a.score))} variant="outline">
                    {a.score.toFixed(1)}/10
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Answer input */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your detailed answer here... Include examples, explain your reasoning, and be specific."
              className="w-full min-h-[160px] resize-none rounded-lg border border-input bg-transparent px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              disabled={isEvaluating}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{userAnswer.length} characters</span>
              <Button
                onClick={submitAnswer}
                disabled={!userAnswer.trim() || isEvaluating}
                loading={isEvaluating}
                variant="gradient"
              >
                <Sparkles className="h-4 w-4" />
                {isEvaluating
                  ? "Gemini is evaluating..."
                  : currentQ + 1 >= questions.length
                  ? "Finish & Get Results"
                  : "Submit & Next Question"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {isEvaluating && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground bg-primary/5 border border-primary/20 rounded-xl p-4">
            <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
            Gemini AI is evaluating your answer and generating personalized feedback...
          </div>
        )}
      </div>
    );
  }

  // ── Results ────────────────────────────────────────────────────────────
  const avgScore = answers.reduce((s, a) => s + a.score, 0) / (answers.length || 1);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Score hero */}
      <div className="text-center py-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-brand mx-auto shadow-glow mb-4">
          <Star className="h-12 w-12 text-white" />
        </div>
        <h2 className="text-4xl font-black">{avgScore.toFixed(1)}<span className="text-xl font-normal text-muted-foreground">/10</span></h2>
        <p className="text-lg font-semibold mt-1">{getScoreLabel(avgScore)}</p>
        <p className="text-muted-foreground text-sm mt-1">
          {questions.length} questions · evaluated by Gemini AI
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid gap-3 grid-cols-3">
        {[
          { label: "Questions", value: questions.length, icon: MessageSquare, color: "text-primary" },
          { label: "Avg Score", value: `${avgScore.toFixed(1)}/10`, icon: BarChart3, color: "text-emerald-500" },
          { label: "Performance", value: getScoreLabel(avgScore), icon: Star, color: "text-amber-500" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <stat.icon className={cn("h-7 w-7 shrink-0", stat.color)} />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="font-bold text-sm truncate">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Per-question breakdown */}
      <div className="space-y-3">
        <h3 className="font-semibold">Question Breakdown</h3>
        {answers.map((a, i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium flex-1">Q{i + 1}: {a.question.text}</p>
                <Badge className={cn("shrink-0", getScoreBg(a.score))} variant="outline">
                  {a.score.toFixed(1)}/10
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2 line-clamp-3">
                {a.text}
              </p>
              {/* Gemini feedback */}
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <Bot className="h-3.5 w-3.5" /> Gemini Feedback
                </div>
                <p className="text-xs text-foreground">{a.feedback}</p>
                {a.strengths.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {a.strengths.map((s, j) => (
                      <Badge key={j} variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30 bg-emerald-500/5">
                        ✓ {s}
                      </Badge>
                    ))}
                  </div>
                )}
                {a.improvements.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {a.improvements.map((s, j) => (
                      <Badge key={j} variant="outline" className="text-[10px] text-orange-600 border-orange-500/30 bg-orange-500/5">
                        ↑ {s}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline" className="flex-1"
          onClick={() => { setStage("setup"); setAnswers([]); setQuestions([]); }}
        >
          <RefreshCw className="h-4 w-4" /> Try Again
        </Button>
        <Button
          variant="gradient" className="flex-1"
          onClick={() => { setStage("setup"); setAnswers([]); setQuestions([]); }}
        >
          New Interview <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
