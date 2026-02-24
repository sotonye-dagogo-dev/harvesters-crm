"use client";

import Card from "@/components/ui/Card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  LegendPayload,
} from "recharts";
import { CHART_COLORS } from "@/lib/constants";

interface DataItem {
  name: string;
  value: number;
  color?: string;
}

interface DistributionChartProps {
  data: DataItem[];
  title: string;
  showPercentage?: boolean;
}

// Custom label renderer - defined outside component
interface LabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  index: number;
}

const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: LabelProps) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Don't show labels for very small slices

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="font-semibold text-sm drop-shadow-lg"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// Custom tooltip - defined outside component
interface TooltipProps {
  active?: boolean;
  payload?: {
    name: string;
    value: number;
    payload: DataItem;
  }[];
  total: number;
}

const CustomTooltip = ({ active, payload, total }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const percentage = ((data.value / total) * 100).toFixed(1);
    return (
      <div className="bg-ds-surface-elevated p-3 rounded-lg shadow-lg border border-ds-border-base">
        <p className="font-semibold text-ds-text-primary">
          {data.name}
        </p>
        <p className="text-ds-text-secondary">
          Count: <span className="font-medium">{data.value}</span>
        </p>
        <p className="text-ds-text-secondary">
          Percentage: <span className="font-medium">{percentage}%</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function DistributionChart({
  data,
  title,
  showPercentage = true,
}: DistributionChartProps) {
  const colors = [
    CHART_COLORS.primary,
    CHART_COLORS.secondary,
    CHART_COLORS.warning,
    CHART_COLORS.danger,
    CHART_COLORS.info,
    CHART_COLORS.success,
    "#db2777", // pink
    "#0891b2", // cyan
    "#65a30d", // lime
    "#ea580c", // orange
    "#4f46e5", // indigo
    "#f59e0b", // amber
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card title={title} className="shadow-md">
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            // @ts-expect-error - recharts label prop has complex types
            label={showPercentage ? renderCustomLabel : false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || colors[index % colors.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip total={total} />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: string, entry: LegendPayload | any) => {
              const itemData = entry?.payload as DataItem;
              if (!itemData) return value;
              const percentage = ((itemData.value / total) * 100).toFixed(1);
              return `${value} (${percentage}%)`;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
