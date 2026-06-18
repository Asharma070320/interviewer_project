import { useState, useRef, useEffect, useCallback } from "react";
import {
  BrainCircuit, Send, Sparkles, Map,
  Target, BookOpen, TrendingUp, CheckCircle2,
  Circle, User, Bot, RefreshCw, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, generateId } from "@/lib/utils";
import { sendCoachMessage, resetCoachChat } from "@/services/coach.service";
import type { CoachMessage } from "@/types";

const QUICK_PROMPTS = [
  "Create a 3-month learning roadmap for Senior React Developer",
  "What skills does a Senior Frontend Developer need in 2025?",
  "How do I negotiate a higher salary effectively?",
  "Review my career path from Backend to Full Stack",
  "What projects should I build for my portfolio?",
  "How to prepare for a system design interview?",
];

const WELCOME_MESSAGE: CoachMessage = {
  id: "welcome",
  role: "assistant",
  content: `👋 Hi! I'm your **AI Career Coach**, powered by **Gemini AI**.

I can help you with:
- 🗺️ **Career Roadmaps** — Personalized step-by-step learning plans
- 🎯 **Skill Gap Analysis** — What to learn for your target role
- 💼 **Interview Prep** — Strategies for landing your dream job
- 💰 **Salary Negotiation** — How to get paid what you're worth
- 📂 **Portfolio Guidance** — Projects that impress employers

What would you like to work on today?`,
  timestamp: new Date().toISOString(),
};

const ROADMAP_STEPS = [
  { id: "1", title: "Master TypeScript", completed: true, weeks: 3, skills: ["Generics", "Utility Types", "Strict Mode"] },
  { id: "2", title: "Advanced React Patterns", completed: true, weeks: 4, skills: ["Compound Components", "Render Props", "Custom Hooks"] },
  { id: "3", title: "State Management", completed: false, weeks: 2, skills: ["Zustand", "React Query", "Context API"] },
  { id: "4", title: "Testing Mastery", completed: false, weeks: 3, skills: ["Vitest", "RTL", "Playwright"] },
  { id: "5", title: "System Design", completed: false, weeks: 5, skills: ["Micro-frontends", "Design Systems", "Performance"] },
  { id: "6", title: "Full Stack Integration", completed: false, weeks: 4, skills: ["Node.js", "PostgreSQL", "REST/GraphQL"] },
];

const SKILL_GAPS = [
  { skill: "System Design", current: 35, target: 80, priority: "high" },
  { skill: "Testing (E2E)", current: 50, target: 85, priority: "high" },
  { skill: "Performance Optimization", current: 60, target: 90, priority: "medium" },
  { skill: "TypeScript Advanced", current: 70, target: 90, priority: "medium" },
  { skill: "Node.js Backend", current: 45, target: 75, priority: "low" },
];

const priorityColor: Record<string, string> = {
  high: "text-red-500",
  medium: "text-amber-500",
  low: "text-blue-500",
};

export default function CareerCoach() {
  const [messages, setMessages] = useState<CoachMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const completedSteps = ROADMAP_STEPS.filter((s) => s.completed).length;
  const roadmapProgress = (completedSteps / ROADMAP_STEPS.length) * 100;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: CoachMessage = {
      id: generateId(), role: "user",
      content: trimmed, timestamp: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await sendCoachMessage(trimmed);
      const aiMsg: CoachMessage = {
        id: generateId(), role: "assistant",
        content: response, timestamp: new Date().toISOString(),
      };
      setMessages((m) => [...m, aiMsg]);
    } catch (err) {
      console.error(err);
      toast.error("Gemini API error. Check your API key in .env");
      setMessages((m) => [...m, {
        id: generateId(), role: "assistant",
        content: "⚠️ I'm having trouble connecting to Gemini AI right now. Please check your API key in the `.env` file and try again.",
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleReset = () => {
    resetCoachChat();
    setMessages([WELCOME_MESSAGE]);
    toast.success("Conversation reset");
  };

  // Render message text with basic markdown-like formatting
  const renderContent = (content: string) => {
    return content.split("\n").map((line, i) => {
      // Bold
      const formatted = line
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/`(.+?)`/g, '<code class="bg-muted px-1 rounded text-xs font-mono">$1</code>');
      return (
        <p
          key={i}
          className={cn("leading-relaxed", line.startsWith("##") ? "font-bold mt-2" : "", !line.trim() && "h-2")}
          dangerouslySetInnerHTML={{ __html: formatted.replace(/^#+\s/, "") }}
        />
      );
    });
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 shrink-0 border-r bg-background flex flex-col overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 mb-1">
            <BrainCircuit className="h-5 w-5 text-primary" />
            <h2 className="font-bold">AI Career Coach</h2>
            <Badge variant="gradient" className="text-[9px] ml-auto">Gemini</Badge>
          </div>
          <p className="text-xs text-muted-foreground">Personalized career guidance</p>
        </div>

        <ScrollArea className="flex-1">
          <Tabs defaultValue="roadmap" className="px-3 py-3">
            <TabsList className="w-full">
              <TabsTrigger value="roadmap" className="flex-1 text-xs">Roadmap</TabsTrigger>
              <TabsTrigger value="gaps" className="flex-1 text-xs">Skill Gaps</TabsTrigger>
            </TabsList>

            <TabsContent value="roadmap" className="mt-3 space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">Senior Frontend Path</span>
                  <span className="text-muted-foreground">{completedSteps}/{ROADMAP_STEPS.length}</span>
                </div>
                <Progress value={roadmapProgress} className="h-1.5" />
              </div>
              <div className="space-y-2">
                {ROADMAP_STEPS.map((step, i) => (
                  <div
                    key={step.id}
                    className={cn(
                      "flex items-start gap-2 p-2.5 rounded-lg border transition-colors",
                      step.completed
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    {step.completed
                      ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      : <Circle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-xs font-medium",
                        step.completed && "text-emerald-600 dark:text-emerald-400"
                      )}>
                        {i + 1}. {step.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{step.weeks} weeks</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {step.skills.map((s) => (
                          <Badge key={s} variant="secondary" className="text-[9px] h-3.5 px-1">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="gaps" className="mt-3 space-y-3">
              {SKILL_GAPS.map((gap) => (
                <div key={gap.skill} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{gap.skill}</span>
                    <Badge variant="outline" className={cn("text-[9px]", priorityColor[gap.priority])}>
                      {gap.priority}
                    </Badge>
                  </div>
                  <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="absolute left-0 h-full bg-muted-foreground/20 rounded-full"
                      style={{ width: `${gap.target}%` }}
                    />
                    <div
                      className="absolute left-0 h-full bg-primary rounded-full transition-all"
                      style={{ width: `${gap.current}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Current: {gap.current}%</span>
                    <span>Target: {gap.target}%</span>
                  </div>
                </div>
              ))}
              <p className="text-[10px] text-muted-foreground text-center pt-2">
                Ask Gemini for a custom skill gap analysis
              </p>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b bg-background/80 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-brand shadow-glow-sm">
              <BrainCircuit className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm">Gemini Career Coach</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {loading ? "Thinking..." : "Online · Gemini 2.0 Flash"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground">
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Reset
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4 py-4">
          <div className="space-y-5 max-w-3xl mx-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "")}
              >
                {/* Avatar */}
                <div className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  msg.role === "assistant"
                    ? "bg-gradient-brand text-white shadow-glow-sm"
                    : "bg-secondary"
                )}>
                  {msg.role === "assistant"
                    ? <BrainCircuit className="h-4 w-4" />
                    : <User className="h-4 w-4" />
                  }
                </div>

                {/* Bubble */}
                <div className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3 text-sm space-y-1",
                  msg.role === "assistant"
                    ? "bg-card border shadow-sm rounded-tl-sm"
                    : "bg-primary text-primary-foreground rounded-tr-sm"
                )}>
                  {renderContent(msg.content)}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-brand shadow-glow-sm">
                  <BrainCircuit className="h-4 w-4 text-white" />
                </div>
                <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-card border flex items-center gap-1.5">
                  {[0, 0.15, 0.3].map((d) => (
                    <span
                      key={d}
                      className="h-2 w-2 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: `${d}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Quick prompts */}
        <div className="border-t px-4 pt-2 pb-1">
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                disabled={loading}
                className="shrink-0 text-xs px-3 py-1.5 rounded-full border hover:border-primary/50 hover:bg-primary/5 transition-colors whitespace-nowrap disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="px-4 pb-4 pt-2 border-t bg-background">
          <div className="flex gap-3 max-w-3xl mx-auto">
            <div className="flex-1 flex items-end rounded-xl border bg-background focus-within:ring-1 focus-within:ring-ring px-3 py-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Gemini about career paths, skills, interview prep... (Enter to send)"
                className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground max-h-32 min-h-[20px]"
                rows={1}
                disabled={loading}
              />
            </div>
            <Button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              size="icon"
              variant="gradient"
              className="shrink-0 h-10 w-10 rounded-xl"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-1.5">
            Powered by Google Gemini 2.0 Flash · Responses may not always be accurate
          </p>
        </div>
      </div>
    </div>
  );
}
