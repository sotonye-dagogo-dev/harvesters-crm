"use client";

import { Card as AntCard, CardProps as AntCardProps } from "antd";
import { ReactNode } from "react";

interface CardProps extends AntCardProps {
  children: ReactNode;
}

export default function Card({
  children,
  className = "",
  ...props
}: CardProps) {
  return (
    <AntCard
      className={`shadow-sm hover:shadow-md transition-shadow ${className}`}
      {...props}
    >
      {children}
    </AntCard>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
  description?: string;
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  color = "text-church-primary dark:text-green-400",
  description,
}: StatCardProps) {
  return (
    <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-1 truncate">{title}</p>
          <h3 className={`text-2xl font-bold ${color} m-0`}>{value}</h3>
          {description && (
            <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">{description}</p>
          )}
          {trend && (
            <p
              className={`text-xs mt-2 ${trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}% from last
              period
            </p>
          )}
        </div>
        {icon && <div className={`text-3xl ${color} opacity-30 dark:opacity-40 flex-shrink-0`}>{icon}</div>}
      </div>
    </Card>
  );
}
