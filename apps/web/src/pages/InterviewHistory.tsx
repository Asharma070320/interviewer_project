import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Filter, Mic, Code2, MessageSquare, Calendar,
  Clock, ChevronRight, Download, Trash2, Star,
  TrendingUp, Trophy, Play,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn, formatDate, getScoreBg, getScoreLabel, formatDuration } from "@/lib/utils";
import { useInterviewStore } from "@/stores/interview.store";
import type { InterviewSession } from "@/types";

const typeIcon = { voice: Mic, text: MessageSquare, coding: Code2 };
const roleLabels: Record<string, string> = {
  "frontend-developer": "Frontend Developer", "backend-developer": "Backend Developer",
  "fullstack-developer": "Full Stack Developer", "react-developer": "React Developer",
  "nodejs-developer": "Node.js Developer", "hr-interview": "HR Interview",
  "devops-engineer": "DevOps Engineer", "java-developer": "Java Developer",
  "python-developer": "Python Developer",
};

// Generate mock sessions for demo
const MOCK_SESSIONS: InterviewSession[] = [
  {
    id: "s1", role: "frontend-developer", title: "Frontend Developer Interview",
    status: "completed", difficulty: "intermediate", questions: [], answers: [],
    scores: { communication: 8.2, technicalKnowledge: 7.8, problemSolving: 7.5, confidence: 8.0, clarity: 7.9, overall: 7.9 },
    feedback: { strengths: ["Strong React knowledge", "Clear communication"], improvements: ["System design depth"], recommendations: ["Study distributed systems"], detailedFeedback: "Excellent performance overall." },
    duration: 1245, startedAt: "2026-06-15T10:00:00Z", completedAt: "2026-06-15T10:20:45Z",
    createdAt: "2026-06-15T10:00:00Z", type: "voice",
  },
  {
    id: "s2", role: "fullstack-developer", title: "Full Stack Developer Interview",
    status: "completed", difficulty: "advanced", questions: [], answers: [],
    scores: { communication: 7.5, technicalKnowledge: 8.1, problemSolving: 7.9, confidence: 7.2, clarity: 7.8, overall: 7.7 },
    feedback: { strengths: ["Strong backend skills", "Good API design knowledge"], improvements: ["Frontend optimization"], recommendations: ["Learn WebAssembly"], detailedFeedback: "Strong technical background shown." },
    duration: 1500, startedAt: "2026-06-12T14:00:00Z", completedAt: "2026-06-12T14:25:00Z",
    createdAt: "2026-06-12T14:00:00Z", type: "text",
  },
  {
    id: "s3", role: "react-developer", title: "React Developer Interview",
    status: "completed", difficulty: "intermediate", questions: [], answers: [],
    scores: { communication: 9.0, technicalKnowledge: 8.8, problemSolving: 8.5, confidence: 8.9, clarity: 9.1, overall: 8.9 },
    feedback: { strengths: ["Deep React expertise", "Excellent communication"], improvements: ["Performance testing"], recommendations: ["Contribute to React ecosystem"], detailedFeedback: "Outstanding performance!" },
    duration: 900, startedAt: "2026-06-10T09:00:00Z", completedAt: "2026-06-10T09:15:00Z",
    createdAt: "2026-06-10T09:00:00Z", type: "text",
  },
  {
    id: "s4", role: "hr-interview", title: "HR Behavioral Interview",
    status: "completed", difficulty: "beginner", questions: [], answers: [],
    scores: { communication: 8.5, technicalKnowledge: 7.0, problemSolving: 8.0, confidence: 8.2, clarity: 8.7, overall: 8.1 },
    feedback: { strengths: ["Great storytelling", "Professional demeanor"], improvements: ["More concrete examples"], recommendations: ["Practice STAR method"], detailedFeedback: "Very good behavioral responses." },
    duration: 1100, startedAt: "2026-06-08T11:00:00Z", completedAt: "2026-06-08T11:18:20Z",
    createdAt: "2026-06-08T11:00:00Z", type: "voice",
  },
];

export default function InterviewHistory() {
  const navigate = useNavigate();
  const { sessions: storeSessions } = useInterviewStore();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedSession, setSelectedSession] = useState<InterviewSession | null>(null);

  const allSessions = [...MOCK_SESSIONS, ...storeSessions];

  const filtered = allSessions.filter((s) => {
    const matchSearch = (roleLabels[s.role] ?? s.role).toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || s.type === typeFilter;
    return matchSearch && matchType;
  });

  if (selectedSession) {
    return <SessionDetail session={selectedSession} onBack={() => setSelectedSession(null)} />;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Interview History</h2>
          <p className="text-muted-foreground text-sm mt-1">{allSessions.length} interviews completed</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-1" /> Export
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search interviews..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-input bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="voice">Voice</SelectItem>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="coding">Coding</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="font-semibold">No interviews found</p>
            <p className="text-sm text-muted-foreground mt-1">Try a different filter or start a new interview</p>
            <Button className="mt-4" onClick={() => navigate("/interview")}>Start Interview</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((session) => {
            const Icon = typeIcon[session.type];
            const score = session.scores?.overall;
            return (
              <Card
                key={session.id}
                hover
                glow
                onClick={() => setSelectedSession(session)}
                className="cursor-pointer"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold">{roleLabels[session.role] ?? session.role}</p>
                        <Badge variant="outline" className="text-[10px] capitalize">{session.type}</Badge>
                        <Badge variant="secondary" className="text-[10px] capitalize">{session.difficulty}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(session.createdAt)}</span>
                        {session.duration && (
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDuration(session.duration)}</span>
                        )}
                      </div>
                    </div>
                    {score !== undefined && (
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={cn("text-sm font-bold px-2.5", getScoreBg(score))} variant="outline">
                          {score.toFixed(1)}/10
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{getScoreLabel(score)}</span>
                      </div>
                    )}
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SessionDetail({ session, onBack }: { session: InterviewSession; onBack: () => void }) {
  const score = session.scores;
  if (!score) return null;

  const scoreItems = [
    { label: "Communication", value: score.communication },
    { label: "Technical Knowledge", value: score.technicalKnowledge },
    { label: "Problem Solving", value: score.problemSolving },
    { label: "Confidence", value: score.confidence },
    { label: "Clarity", value: score.clarity },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={onBack}>
          <ChevronRight className="h-4 w-4 rotate-180" />
        </Button>
        <div>
          <h2 className="text-xl font-bold">{roleLabels[session.role] ?? session.role}</h2>
          <p className="text-sm text-muted-foreground">{formatDate(session.createdAt)} · {session.duration && formatDuration(session.duration)}</p>
        </div>
      </div>

      {/* Score hero */}
      <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Overall Score</p>
              <p className="text-5xl font-black text-primary mt-1">{score.overall.toFixed(1)}</p>
              <p className="text-sm font-medium mt-1">{getScoreLabel(score.overall)}</p>
            </div>
            <div className="hidden sm:flex h-24 w-24 items-center justify-center rounded-full border-4 border-primary/30">
              <Star className="h-10 w-10 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="scores">
        <TabsList>
          <TabsTrigger value="scores">Scores</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="scores" className="space-y-3">
          {scoreItems.map((item) => (
            <div key={item.label} className="flex items-center gap-4">
              <span className="text-sm font-medium w-40 shrink-0">{item.label}</span>
              <Progress
                value={item.value * 10}
                className="flex-1 h-2"
                indicatorClassName={item.value >= 8 ? "bg-emerald-500" : item.value >= 6 ? "bg-amber-500" : "bg-red-500"}
              />
              <Badge className={cn("w-16 justify-center", getScoreBg(item.value))} variant="outline">
                {item.value.toFixed(1)}/10
              </Badge>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="feedback" className="grid gap-4 sm:grid-cols-2">
          <Card className="border-emerald-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-emerald-600 dark:text-emerald-400">Strengths</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {session.feedback?.strengths.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <Star className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /> {s}
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-orange-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-orange-600 dark:text-orange-400">Improvements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {session.feedback?.improvements.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" /> {s}
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="sm:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {session.feedback?.recommendations.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-primary font-bold shrink-0">{i + 1}.</span> {r}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
