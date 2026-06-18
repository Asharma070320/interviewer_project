import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScoreHistory } from "@/types";

interface ScoreChartProps {
  data: ScoreHistory[];
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border bg-popover p-3 shadow-xl text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-muted-foreground">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="capitalize">{p.name}:</span>
          <span className="font-semibold text-foreground">{p.value.toFixed(1)}</span>
        </div>
      ))}
    </div>
  );
};

export function ScoreChart({ data }: ScoreChartProps) {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="text-base">Score Progression</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="date"
              tickFormatter={(d) => new Date(d).toLocaleDateString("en", { month: "short", day: "numeric" })}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 10]}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
              formatter={(v) => <span className="capitalize text-muted-foreground">{v}</span>}
            />
            <Line type="monotone" dataKey="overall" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3, fill: "#6366f1" }} activeDot={{ r: 5 }} name="overall" />
            <Line type="monotone" dataKey="communication" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="communication" />
            <Line type="monotone" dataKey="technical" stroke="#f59e0b" strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="technical" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
