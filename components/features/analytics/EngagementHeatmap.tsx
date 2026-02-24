"use client";

import { Empty, Tooltip } from "antd";
import Card from "@/components/ui/Card";

interface HeatmapData {
  day: string;
  hour: number;
  value: number;
}

interface EngagementHeatmapProps {
  data: HeatmapData[];
  title?: string;
  loading?: boolean;
  metric?: string;
}

export default function EngagementHeatmap({
  data,
  title = "Engagement Heatmap",
  loading = false,
  metric = "activities",
}: EngagementHeatmapProps) {
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
          description="No engagement data available"
          className="py-12"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Get max value for color scaling
  const maxValue = Math.max(...data.map((d) => d.value));

  // Get color intensity based on value
  const getColorIntensity = (value: number) => {
    if (value === 0) return "bg-ds-surface-sunken";
    const intensity = (value / maxValue) * 100;

    if (intensity < 20) return "bg-ds-brand-accent/40 dark:bg-ds-brand-accent/40";
    if (intensity < 40) return "bg-ds-brand-accent/60 dark:bg-ds-brand-accent/60";
    if (intensity < 60) return "bg-ds-brand-accent dark:bg-ds-brand-accent/80";
    if (intensity < 80) return "bg-ds-brand-accent dark:bg-ds-brand-accent";
    return "bg-ds-brand-accent dark:bg-ds-brand-accent";
  };

  // Get data point for specific day and hour
  const getDataPoint = (day: string, hour: number): number => {
    const point = data.find((d) => d.day === day && d.hour === hour);
    return point?.value || 0;
  };

  // Format hour for display
  const formatHour = (hour: number) => {
    if (hour === 0) return "12am";
    if (hour < 12) return `${hour}am`;
    if (hour === 12) return "12pm";
    return `${hour - 12}pm`;
  };

  return (
    <Card title={title} className="shadow-md">
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Hour labels */}
          <div className="flex mb-2">
            <div className="w-12" /> {/* Space for day labels */}
            {hours.map((hour) => (
              <div
                key={hour}
                className="flex-1 text-xs text-center text-ds-text-subtle"
              >
                {hour % 4 === 0 && formatHour(hour)}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          {days.map((day) => (
            <div key={day} className="flex items-center mb-1">
              {/* Day label */}
              <div className="w-12 text-sm text-ds-text-secondary font-medium">
                {day}
              </div>

              {/* Hour cells */}
              {hours.map((hour) => {
                const value = getDataPoint(day, hour);
                return (
                  <Tooltip
                    key={`${day}-${hour}`}
                    title={`${day} ${formatHour(hour)}: ${value} ${metric}`}
                  >
                    <div
                      className={`flex-1 aspect-square rounded ${getColorIntensity(
                        value
                      )} hover:ring-2 hover:ring-ds-brand-accent transition-all cursor-pointer mx-0.5`}
                    />
                  </Tooltip>
                );
              })}
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center justify-center mt-6 gap-2">
            <span className="text-xs text-ds-text-subtle">
              Less
            </span>
            <div className="flex gap-1">
              <div className="w-4 h-4 rounded bg-ds-surface-sunken" />
              <div className="w-4 h-4 rounded bg-ds-brand-accent/40 dark:bg-ds-brand-accent/40" />
              <div className="w-4 h-4 rounded bg-ds-brand-accent/60 dark:bg-ds-brand-accent/60" />
              <div className="w-4 h-4 rounded bg-ds-brand-accent dark:bg-ds-brand-accent/80" />
              <div className="w-4 h-4 rounded bg-ds-brand-accent dark:bg-ds-brand-accent" />
              <div className="w-4 h-4 rounded bg-ds-brand-accent dark:bg-ds-brand-accent" />
            </div>
            <span className="text-xs text-ds-text-subtle">
              More
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
