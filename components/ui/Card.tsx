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
      className={`shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </AntCard>
  );
}

// Scrollable card for content that may overflow
interface ScrollableCardProps extends CardProps {
  maxHeight?: string;
}

// Dynamic maxHeight requires inline style - ESLint exception approved
/* eslint-disable @next/next/no-inline-styles */
export function ScrollableCard({
  children,
  className = "",
  maxHeight = "600px",
  ...props
}: ScrollableCardProps) {
  return (
    <AntCard
      className={`shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden ${className}`}
      {...props}
    >
      <div
        className="overflow-x-auto overflow-y-auto"
        style={{ maxHeight: maxHeight }}
      >
        {children}
      </div>
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
    <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 border-gray-200 dark:border-slate-700 overflow-hidden group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2 truncate uppercase tracking-wide">
            {title}
          </p>
          <h3 className={`text-3xl font-bold ${color} m-0 mb-1`}>{value}</h3>
          {description && (
            <p className="text-sm mt-2 text-gray-600 dark:text-gray-400 font-medium">
              {description}
            </p>
          )}
          {trend && (
            <div className="flex items-center gap-2 mt-3">
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  trend.isPositive
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                <span className="text-sm">{trend.isPositive ? "↑" : "↓"}</span>
                {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                from last period
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className={`text-4xl ${color} opacity-20 dark:opacity-30 flex-shrink-0 transition-all duration-300 group-hover:opacity-40 group-hover:scale-110`}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
