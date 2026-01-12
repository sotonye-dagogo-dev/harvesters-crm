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
  color = "text-church-primary",
  description,
}: StatCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm mb-1">{title}</p>
          <h3 className={`text-2xl font-bold ${color} m-0`}>{value}</h3>
          {description && (
            <p className="text-xs mt-2 text-gray-500">{description}</p>
          )}
          {trend && (
            <p
              className={`text-xs mt-2 ${trend.isPositive ? "text-green-600" : "text-red-600"}`}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}% from last
              period
            </p>
          )}
        </div>
        {icon && <div className={`text-3xl ${color} opacity-20`}>{icon}</div>}
      </div>
    </Card>
  );
}
