"use client";

import { Empty } from "antd";
import Card from "@/components/ui/Card";
import { CHART_COLORS } from "@/lib/constants";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AttendanceChartProps {
  data: Array<{
    date: string;
    attended: number;
    absent: number;
  }>;
  title?: string;
  loading?: boolean;
}

export default function AttendanceChart({
  data,
  title = "Attendance Overview",
  loading = false,
}: AttendanceChartProps) {
  if (loading) {
    return (
      <Card title={title} loading={loading}>
        <div className="h-80" />
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card title={title}>
        <Empty
          description="No attendance data available"
          className="py-12"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <Card title={title} className="shadow-md">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            stroke="currentColor"
            className="text-ds-text-secondary"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="currentColor"
            className="text-ds-text-secondary"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
            cursor={{ fill: "rgba(99, 102, 241, 0.1)" }}
          />
          <Legend
            wrapperStyle={{ paddingTop: "20px" }}
            iconType="circle"
            formatter={(value) =>
              value.charAt(0).toUpperCase() + value.slice(1)
            }
          />
          <Bar
            dataKey="attended"
            fill={CHART_COLORS.primary}
            radius={[8, 8, 0, 0]}
            name="Attended"
          />
          <Bar
            dataKey="absent"
            fill={CHART_COLORS.danger}
            radius={[8, 8, 0, 0]}
            name="Absent"
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
