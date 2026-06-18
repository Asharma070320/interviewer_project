import { useNavigate } from "react-router-dom";
import {
  Trophy, TrendingUp, MessageSquare, Code2,
  Mic, Zap, FileText, BrainCircuit, Flame,
} from "lucide-react";
import { StatCard } from "@/features/dashboard/components/StatCard";
import { ScoreChart } from "@/features/dashboard/components/ScoreChart";
import { SkillRadar } from "@/features/dashboard/components/RadarChart";
import { RecentInterviews } from "@/features/dashboard/components/RecentInterviews";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useInterviewStore } from "@/stores/interview.store";

const quickActions = [
  { label: "Resume Analysis", icon: FileText, path: "/resume", color: "text-blue-500", bg: "bg-blue-500/10", desc: "Upload & analyze your resume" },
  { label: "AI Interview", icon: Zap, path: "/interview", color: "text-purple-500", bg: "bg-purple-500/10", desc: "Practice with AI questions" },
  { label: "Voice Interview", icon: Mic, path: "/voice", color: "text-pink-500", bg: "bg-pink-500/10", desc: "Real-time voice practice" },
  { label: "Coding Round", icon: Code2, path: "/coding", color: "text-orange-500", bg: "bg-orange-500/10", desc: "Solve coding challenges" },
  { label: "Career Coach", icon: BrainCircuit, path: "/coach", color: "text-emerald-500", bg: "bg-emerald-500/10", desc: "AI-powered career guidance" },
];

const practiceAreas = [
  { name: "System Design", score: 45, recommended: true },
  { name: "Data Structures", score: 62, recommended: false },
  { name: "Behavioral Questions", score: 78, recommended: false },
  { name: "JavaScript Concepts", score: 55, recommended: true },
  { name: "React Patterns", score: 70, recommended: false },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { stats, scoreHistory, sessions } = useInterviewStore();

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-purple-600 p-6 text-white shadow-glow">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Flame className="h-5 w-5 text-orange-300" />
              <span className="text-sm font-medium text-white/80">{stats.practiceStreak} day streak</span>
            </div>
            <h2 className="text-2xl font-bold">Welcome back, Aman!</h2>
            <p className="text-white/70 text-sm mt-1">
              You've improved by <span className="text-white font-semibold">+{stats.scoreImprovement}</span> points this week. Keep going!
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-2">
            <Button variant="glass" size="sm" onClick={() => navigate("/interview")}>
              <Zap className="h-4 w-4" /> Start Interview
            </Button>
            <Button variant="glass" size="sm" onClick={() => navigate("/voice")}>
              <Mic className="h-4 w-4" /> Voice Practice
            </Button>
          </div>
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white/5" />
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <StatCard
          title="Total Interviews"
          value={stats.totalInterviews}
          change={`${stats.interviewsThisWeek} this week`}
          changeType="positive"
          icon={Trophy}
          iconBg="bg-amber-500/10"
          iconColor="text-amber-500"
        />
        <StatCard
          title="Average Score"
          value={`${stats.averageScore}/10`}
          change="+0.8 vs last week"
          changeType="positive"
          icon={TrendingUp}
          iconBg="bg-primary/10"
          iconColor="text-primary"
        />
        <StatCard
          title="Communication"
          value={`${stats.communicationScore}/10`}
          description="Articulation & clarity"
          icon={MessageSquare}
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-500"
        />
        <StatCard
          title="Technical Score"
          value={`${stats.technicalScore}/10`}
          description="Domain knowledge"
          icon={Code2}
          iconBg="bg-orange-500/10"
          iconColor="text-orange-500"
        />
        <StatCard
          title="Practice Streak"
          value={`${stats.practiceStreak} days`}
          change="Best: 12 days"
          changeType="neutral"
          icon={Flame}
          iconBg="bg-red-500/10"
          iconColor="text-red-500"
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <ScoreChart data={scoreHistory} />
        <SkillRadar stats={stats} />
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Quick Actions</h3>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {quickActions.map((action) => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-start gap-3 p-4 rounded-xl border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md text-left group"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.bg}`}>
                <action.icon className={`h-5 w-5 ${action.color}`} />
              </div>
              <div>
                <p className="text-sm font-semibold group-hover:text-primary transition-colors">{action.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <RecentInterviews sessions={sessions} />
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                Practice Areas
                <Badge variant="info" className="text-[10px]">AI Recommended</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {practiceAreas.map((area) => (
                <div key={area.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{area.name}</span>
                      {area.recommended && (
                        <Badge variant="warning" className="text-[9px] h-4">Recommended</Badge>
                      )}
                    </div>
                    <span className="text-muted-foreground text-xs">{area.score}%</span>
                  </div>
                  <Progress
                    value={area.score}
                    indicatorClassName={area.score < 60 ? "bg-orange-500" : area.score < 75 ? "bg-yellow-500" : "bg-emerald-500"}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
