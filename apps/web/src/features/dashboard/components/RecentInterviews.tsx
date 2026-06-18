import { useNavigate } from "react-router-dom";
import { Mic, Code2, MessageSquare, ChevronRight, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getScoreBg, formatDate } from "@/lib/utils";
import type { InterviewSession } from "@/types";

const typeIcon = {
  voice: Mic,
  text: MessageSquare,
  coding: Code2,
};

const roleLabels: Record<string, string> = {
  "frontend-developer": "Frontend Developer",
  "backend-developer": "Backend Developer",
  "fullstack-developer": "Full Stack Developer",
  "react-developer": "React Developer",
  "nodejs-developer": "Node.js Developer",
  "hr-interview": "HR Interview",
  "devops-engineer": "DevOps Engineer",
};

interface RecentInterviewsProps {
  sessions: InterviewSession[];
}

export function RecentInterviews({ sessions }: RecentInterviewsProps) {
  const navigate = useNavigate();
  const recent = sessions.slice(0, 5);

  if (recent.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Interviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Mic className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No interviews yet</p>
            <p className="text-xs text-muted-foreground mt-1">Start your first AI interview to see results here</p>
            <Button size="sm" className="mt-4" onClick={() => navigate("/interview")}>
              Start Interview
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Recent Interviews</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate("/history")}>
          View all <ChevronRight className="h-3 w-3 ml-1" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {recent.map((session) => {
            const Icon = typeIcon[session.type];
            const score = session.scores?.overall;
            return (
              <div
                key={session.id}
                className="flex items-center gap-4 px-6 py-3 hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => navigate(`/history/${session.id}`)}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {roleLabels[session.role] ?? session.customRole ?? session.role}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{formatDate(session.createdAt)}</span>
                  </div>
                </div>
                {score !== undefined && (
                  <Badge className={getScoreBg(score)} variant="outline">
                    {score.toFixed(1)}/10
                  </Badge>
                )}
                {session.status === "in-progress" && (
                  <Badge variant="warning">In Progress</Badge>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
