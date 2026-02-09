"use client";

import { Card, Empty } from "antd";
import { CHART_COLORS } from "@/lib/constants";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface GrowthChartProps {
  data: Array<{
    period: string;
    value: number;
    target?: number;
  }>;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  type?: "line" | "area";
  dataLabel?: string;
}

export default function GrowthChart({
  data,
  title = "Growth Trend",
  subtitle,
  loading = false,
  type = "line",
  dataLabel = "Growth",
}: GrowthChartProps) {
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
          description="No growth data available"
          className="py-12"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
    };

    const commonElements = (
      <>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis
          dataKey="period"
          tick={{ fontSize: 12 }}
          stroke="currentColor"
          className="text-gray-600 dark:text-gray-400"
        />
        <YAxis
          tick={{ fontSize: 12 }}
          stroke="currentColor"
          className="text-gray-600 dark:text-gray-400"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
          cursor={{ stroke: CHART_COLORS.primary, strokeWidth: 2 }}
        />
        <Legend
          wrapperStyle={{ paddingTop: "20px" }}
          iconType="circle"
          formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
        />
      </>
    );

    if (type === "area") {
      return (
        <AreaChart {...commonProps}>
          {commonElements}
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={CHART_COLORS.primary}
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor={CHART_COLORS.primary}
                stopOpacity={0}
              />
            </linearGradient>
            <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={CHART_COLORS.success}
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor={CHART_COLORS.success}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={CHART_COLORS.primary}
            fillOpacity={1}
            fill="url(#colorValue)"
            name={dataLabel}
            strokeWidth={3}
          />
          {data.some((d) => d.target !== undefined) && (
            <Area
              type="monotone"
              dataKey="target"
              stroke={CHART_COLORS.success}
              fillOpacity={1}
              fill="url(#colorTarget)"
              name="Target"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          )}
        </AreaChart>
      );
    }

    return (
      <LineChart {...commonProps}>
        {commonElements}
        <Line
          type="monotone"
          dataKey="value"
          stroke={CHART_COLORS.primary}
          strokeWidth={3}
          dot={{ r: 4, fill: CHART_COLORS.primary }}
          activeDot={{ r: 6 }}
          name={dataLabel}
        />
        {data.some((d) => d.target !== undefined) && (
          <Line
            type="monotone"
            dataKey="target"
            stroke={CHART_COLORS.success}
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 3, fill: CHART_COLORS.success }}
            name="Target"
          />
        )}
      </LineChart>
    );
  };

  return (
    <Card
      title={title}
      extra={
        subtitle && <span className="text-sm text-gray-500">{subtitle}</span>
      }
      className="shadow-md"
    >
      <ResponsiveContainer width="100%" height={320}>
        {renderChart()}
      </ResponsiveContainer>
    </Card>
  );
}
