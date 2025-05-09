import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface EnrollmentData {
  name: string;
  students: number;
  future?: boolean;
}

type EnrollmentPeriod = "monthly" | "quarterly" | "yearly";

interface EnrollmentChartProps {
  data: EnrollmentData[];
}

export function EnrollmentChart({ data }: EnrollmentChartProps) {
  const [period, setPeriod] = useState<EnrollmentPeriod>("monthly");
  const [chartData, setChartData] = useState<EnrollmentData[]>([]);

  useEffect(() => {
    // In a real app, this would be fetched based on the selected period
    setChartData(data);
  }, [data, period]);

  return (
    <Card className="col-span-2">
      <CardHeader className="flex-row justify-between items-center pb-2">
        <CardTitle className="text-lg">Enrollment Trends</CardTitle>
        <div className="flex space-x-2">
          <Button
            variant={period === "monthly" ? "default" : "ghost"}
            size="sm"
            onClick={() => setPeriod("monthly")}
            className="text-sm h-8"
          >
            Monthly
          </Button>
          <Button
            variant={period === "quarterly" ? "default" : "ghost"}
            size="sm"
            onClick={() => setPeriod("quarterly")}
            className="text-sm h-8"
          >
            Quarterly
          </Button>
          <Button
            variant={period === "yearly" ? "default" : "ghost"}
            size="sm"
            onClick={() => setPeriod("yearly")}
            className="text-sm h-8"
          >
            Yearly
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 5,
              right: 5,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              width={40}
            />
            <Tooltip
              cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              }}
              formatter={(value) => [`${value} students`, "Enrollment"]}
            />
            <Bar
              dataKey="students"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              fillOpacity={(entry) => (entry.future ? 0.5 : 1)}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
