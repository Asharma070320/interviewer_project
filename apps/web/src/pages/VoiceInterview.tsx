import { useState, useRef, useEffect } from "react";
import {
  Mic, MicOff, Volume2, VolumeX, Play, Square, RotateCcw,
  ChevronRight, Clock, MessageSquare, Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, formatDuration, generateId } from "@/lib/utils";

type SessionState = "idle" | "ai-speaking" | "listening" | "processing" | "feedback" | "completed";

interface TranscriptEntry {
  id: string;
  role: "ai" | "user";
  text: string;
  timestamp: string;
}

const AI_QUESTIONS = [
  "Hello! Welcome to your AI voice interview. Let's start with: Tell me about yourself and your professional background.",
  "Great! Can you walk me through a challenging project you've worked on recently and how you handled the obstacles?",
  "Excellent! How do you approach learning new technologies or skills in a fast-moving field like software development?",
  "Very interesting. Where do you see yourself in the next 3–5 years, and how does this role fit into that vision?",
  "Final question: Do you have any questions for us about the role or the company?",
];

export default function VoiceInterview() {
  const [state, setState] = useState<SessionState>("idle");
  const [currentQ, setCurrentQ] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const scrollRef = useRef<HTMLDivElement>(null);

  const totalQuestions = AI_QUESTIONS.length;
  const progress = (currentQ / totalQuestions) * 100;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  useEffect(() => {
    if (state === "listening") {
      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
        setAudioLevel(Math.random() * 100);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      if (state !== "feedback") setAudioLevel(0);
    }
    return () => clearInterval(timerRef.current);
  }, [state]);

  const startSession = async () => {
    setState("ai-speaking");
    setCurrentQ(0);
    setTranscript([]);
    await simulateAISpeaking(AI_QUESTIONS[0]);
    setState("listening");
    setRecordingTime(0);
  };

  const simulateAISpeaking = async (text: string) => {
    await new Promise((r) => setTimeout(r, 2000));
    setTranscript((prev) => [...prev, { id: generateId(), role: "ai", text, timestamp: new Date().toISOString() }]);
  };

  const stopRecording = async () => {
    setState("processing");
    clearInterval(timerRef.current);

    await new Promise((r) => setTimeout(r, 1500));

    const mockAnswers = [
      "I'm a full-stack developer with 5 years of experience specializing in React and Node.js. I've built several SaaS products and enjoy solving complex problems with clean, scalable code.",
      "I recently led the development of a real-time bidding platform. The main challenge was handling concurrent users. I implemented WebSockets with Redis pub/sub which reduced latency by 60%.",
      "I follow a structured approach: first I understand the fundamentals, then build something practical, then teach it to others. I also engage with the community through open source.",
      "I aim to grow into a technical lead role, mentoring junior developers while still writing code. This position aligns perfectly as it offers both technical depth and leadership opportunities.",
      "Yes! I'm curious about the tech stack evolution plans and how the team approaches technical debt management.",
    ];

    setTranscript((prev) => [...prev, {
      id: generateId(), role: "user",
      text: mockAnswers[currentQ] || "Thank you for the question.",
      timestamp: new Date().toISOString(),
    }]);

    if (currentQ + 1 >= totalQuestions) {
      setState("completed");
    } else {
      setState("ai-speaking");
      setCurrentQ((q) => q + 1);
      await simulateAISpeaking(AI_QUESTIONS[currentQ + 1]);
      setState("listening");
      setRecordingTime(0);
    }
  };

  const resetSession = () => {
    setState("idle");
    setCurrentQ(0);
    setTranscript([]);
    setRecordingTime(0);
    clearInterval(timerRef.current);
  };

  if (state === "idle") {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Voice Interview</h2>
          <p className="text-muted-foreground text-sm mt-1">Practice speaking with AI-powered voice interview. Your answers are transcribed and evaluated in real-time.</p>
        </div>

        <Card className="overflow-hidden">
          <div className="h-2 bg-gradient-brand" />
          <CardContent className="p-8 text-center space-y-6">
            <div className="relative mx-auto w-32 h-32">
              <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
              <div className="absolute inset-3 rounded-full bg-primary/20 animate-pulse" style={{ animationDelay: "0.3s" }} />
              <div className="absolute inset-6 rounded-full bg-gradient-brand flex items-center justify-center shadow-glow">
                <Mic className="h-12 w-12 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold">Ready to Start?</h3>
              <p className="text-muted-foreground text-sm mt-2 max-w-md mx-auto">
                The AI interviewer will ask you {totalQuestions} behavioral questions. Speak clearly into your microphone. Your answers will be transcribed and scored.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              {[
                { icon: MessageSquare, label: "5 Questions", desc: "Behavioral focus" },
                { icon: Clock, label: "~15 minutes", desc: "Average duration" },
                { icon: Sparkles, label: "AI Feedback", desc: "Instant scoring" },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-muted/50">
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="font-medium">{label}</span>
                  <span className="text-xs text-muted-foreground">{desc}</span>
                </div>
              ))}
            </div>
            <Button size="xl" variant="gradient" className="w-full max-w-sm" onClick={startSession}>
              <Mic className="h-5 w-5" /> Start Voice Interview
            </Button>
            <p className="text-xs text-muted-foreground">Make sure your microphone is enabled and you're in a quiet environment</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-bold">Voice Interview in Progress</h2>
          <div className="flex items-center gap-2">
            <Progress value={progress} className="w-48 h-1.5" />
            <span className="text-xs text-muted-foreground">Q{Math.min(currentQ + 1, totalQuestions)}/{totalQuestions}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon-sm" onClick={() => setIsSpeakerOn((s) => !s)}>
            {isSpeakerOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => setIsMuted((m) => !m)}>
            {isMuted ? <MicOff className="h-4 w-4 text-destructive" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={resetSession} className="text-muted-foreground">
            <RotateCcw className="h-4 w-4 mr-1" /> Restart
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* AI Avatar */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6 flex flex-col items-center gap-4">
            <div className="relative">
              <div className={cn(
                "h-24 w-24 rounded-full bg-gradient-brand flex items-center justify-center shadow-glow transition-transform",
                state === "ai-speaking" && "scale-110"
              )}>
                <span className="text-4xl">🤖</span>
              </div>
              {state === "ai-speaking" && (
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-6 w-6 bg-primary items-center justify-center">
                    <Volume2 className="h-3 w-3 text-white" />
                  </span>
                </span>
              )}
            </div>
            <div className="text-center">
              <p className="font-semibold">InterviewAI</p>
              <Badge variant={
                state === "ai-speaking" ? "default" :
                state === "listening" ? "success" :
                state === "processing" ? "info" : "secondary"
              } className="text-[10px] mt-1">
                {state === "ai-speaking" ? "Speaking..." :
                 state === "listening" ? "Listening..." :
                 state === "processing" ? "Processing..." :
                 state === "completed" ? "Done" : "Waiting"}
              </Badge>
            </div>

            {/* Audio visualizer */}
            {state === "listening" && (
              <div className="flex items-end gap-0.5 h-12">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full bg-primary transition-all duration-100"
                    style={{ height: `${10 + Math.random() * audioLevel * 0.8}%`, minHeight: "4px" }}
                  />
                ))}
              </div>
            )}

            {state === "listening" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="recording-indicator"><span /></div>
                <span>{formatDuration(recordingTime)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transcript + Controls */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card className="flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Conversation Transcript</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[300px] px-4 pb-4" ref={scrollRef as React.RefObject<HTMLDivElement>}>
                <div className="space-y-3">
                  {transcript.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">Transcript will appear here...</p>
                  )}
                  {transcript.map((entry) => (
                    <div
                      key={entry.id}
                      className={cn(
                        "flex gap-2 max-w-[85%]",
                        entry.role === "user" ? "ml-auto flex-row-reverse" : ""
                      )}
                    >
                      <div className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm",
                        entry.role === "ai" ? "bg-gradient-brand text-white" : "bg-secondary"
                      )}>
                        {entry.role === "ai" ? "AI" : "You"}
                      </div>
                      <div className={cn(
                        "rounded-xl px-3 py-2 text-sm",
                        entry.role === "ai"
                          ? "bg-primary/10 text-foreground"
                          : "bg-secondary text-foreground"
                      )}>
                        {entry.text}
                      </div>
                    </div>
                  ))}
                  {state === "ai-speaking" && (
                    <div className="flex gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-white text-sm">AI</div>
                      <div className="rounded-xl px-3 py-2 bg-primary/10 flex items-center gap-1">
                        {[0, 0.2, 0.4].map((d) => (
                          <span key={d} className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${d}s` }} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Controls */}
          {state === "completed" ? (
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardContent className="p-4 text-center space-y-3">
                <p className="font-semibold text-emerald-600 dark:text-emerald-400">Interview Completed!</p>
                <p className="text-sm text-muted-foreground">Your answers have been recorded and are being analyzed.</p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={resetSession}><RotateCcw className="h-4 w-4 mr-1" /> Practice Again</Button>
                  <Button variant="gradient"><Sparkles className="h-4 w-4 mr-1" /> View Results</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1"
                variant={state === "listening" ? "destructive" : "gradient"}
                disabled={state === "ai-speaking" || state === "processing"}
                onClick={state === "listening" ? stopRecording : undefined}
              >
                {state === "listening" ? (
                  <><Square className="h-4 w-4" /> Stop Recording</>
                ) : state === "processing" ? (
                  <><Sparkles className="h-4 w-4 animate-spin" /> Processing...</>
                ) : (
                  <><Mic className="h-4 w-4" /> Waiting for AI...</>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
