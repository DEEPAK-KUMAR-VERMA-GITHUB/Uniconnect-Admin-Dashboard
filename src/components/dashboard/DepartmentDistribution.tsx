import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EllipsisVertical } from "lucide-react";
import {
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip
} from "recharts";

interface DepartmentDistributionData {
  name: string;
  value: number;
  color: string;
}

interface DepartmentDistributionProps {
  data: DepartmentDistributionData[];
}

export function DepartmentDistribution({ data }: DepartmentDistributionProps) {
  const RADIAN = Math.PI / 180;

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Only show label if segment is large enough
    return percent > 0.1 ? (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  return (
    <Card>
      <CardHeader className="flex-row justify-between items-center pb-2">
        <CardTitle className="text-lg">Department Distribution</CardTitle>
        <Button variant="ghost" size="icon">
          <EllipsisVertical className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value} students`, "Enrollment"]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow:
                    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center">
              <div
                className="h-3 w-3 rounded-sm mr-2"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-xs text-muted-foreground">
                {item.name} (
                {(
                  (item.value /
                    data.reduce((acc, curr) => acc + curr.value, 0)) *
                  100
                ).toFixed(1)}
                %)
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
