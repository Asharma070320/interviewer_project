import {
  RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis,
  Radar, ResponsiveContainer, Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardStats } from "@/types";

interface SkillRadarProps {
  stats: DashboardStats;
}

export function SkillRadar({ stats }: SkillRadarProps) {
  const data = [
    { subject: "Communication", value: stats.communicationScore * 10 },
    { subject: "Technical", value: stats.technicalScore * 10 },
    { subject: "Problem Solving", value: stats.problemSolvingScore * 10 },
    { subject: "Confidence", value: stats.confidenceScore * 10 },
    { subject: "Clarity", value: 72 },
    { subject: "Leadership", value: 65 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Skill Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <RechartsRadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            />
            <Radar
              name="Skills"
              dataKey="value"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.15}
              strokeWidth={2}
            />
            <Tooltip
              formatter={(v: number) => [`${(v / 10).toFixed(1)}/10`, "Score"]}
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
          </RechartsRadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
