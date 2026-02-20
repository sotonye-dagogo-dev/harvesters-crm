"use client";

import { Statistic, Tag, Tooltip } from "antd";
import Card from "@/components/ui/Card";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: number | string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  loading?: boolean;
  description?: string;
  color?: "primary" | "success" | "warning" | "danger" | "info";
  onClick?: () => void;
}

export default function StatCard({
  title,
  value,
  prefix,
  suffix,
  icon,
  trend,
  loading = false,
  description,
  color = "primary",
  onClick,
}: StatCardProps) {
  const colorClasses = {
    primary: "from-ds-brand-accent to-purple-600",
    success: "from-green-500 to-emerald-600",
    warning: "from-yellow-500 to-orange-600",
    danger: "from-red-500 to-pink-600",
    info: "from-blue-500 to-cyan-600",
  };

  const iconBgClasses = {
    primary:
      "bg-ds-brand-accent-subtle dark:bg-ds-brand-accent/30 text-ds-brand-accent dark:text-ds-brand-accent",
    success:
      "bg-ds-status-success/10 dark:bg-green-900/30 text-ds-status-success",
    warning:
      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
    danger: "bg-ds-status-error/10 dark:bg-red-900/30 text-ds-status-error",
    info: "bg-ds-chart-1/10 dark:bg-blue-900/30 text-ds-chart-1",
  };

  return (
    <Card
      loading={loading}
      className={`shadow-md hover:shadow-ds-xl transition-all duration-300 ${
        onClick ? "cursor-pointer" : ""
      } overflow-hidden relative`}
      onClick={onClick}
    >
      {/* Gradient Background Element */}
      <div
        className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClasses[color]} opacity-10 rounded-full -mr-16 -mt-16`}
      />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-ds-text-secondary text-sm font-medium">
                {title}
              </span>
              {description && (
                <Tooltip title={description}>
                  <InfoCircleOutlined className="text-ds-text-subtle text-xs cursor-help" />
                </Tooltip>
              )}
            </div>

            <Statistic
              value={value}
              prefix={prefix}
              suffix={suffix}
              valueStyle={{
                fontSize: "2rem",
                fontWeight: "bold",
                color: "inherit",
              }}
              className="[&_.ant-statistic-content]:text-ds-text-primary [&_.ant-statistic-content]:dark:text-ds-text-primary"
            />
          </div>

          {icon && (
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${iconBgClasses[color]}`}
            >
              {icon}
            </div>
          )}
        </div>

        {trend && (
          <div className="flex items-center gap-2 pt-3 border-t border-ds-border-base">
            <Tag
              color={trend.isPositive ? "success" : "error"}
              icon={
                trend.isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />
              }
              className="m-0"
            >
              {Math.abs(trend.value)}%
            </Tag>
            <span className="text-xs text-ds-text-subtle">
              {trend.label || "vs last period"}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
