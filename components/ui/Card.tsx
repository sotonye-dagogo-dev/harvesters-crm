"use client";

import { Card as AntCard, CardProps as AntCardProps } from "antd";
import { ReactNode } from "react";

interface CardProps extends AntCardProps {
  children: ReactNode;
}

function CardBase({
  children,
  className = "",
  ...props
}: CardProps) {
  return (
    <AntCard
      className={`shadow-ds-md hover:shadow-ds-lg transition-all duration-300 hover:-translate-y-0.5 rounded-[var(--ds-radius-xl)] border border-ds-border-base bg-ds-surface-elevated overflow-hidden ds-hover-glow ${className}`}
      {...props}
    >
      {children}
    </AntCard>
  );
}

/** Expose Ant Design Card sub-components on the wrapper */
const Card = Object.assign(CardBase, {
  Meta: AntCard.Meta,
  Grid: AntCard.Grid,
});

export default Card;

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
      className={`shadow-ds-md hover:shadow-ds-lg transition-all duration-300 hover:-translate-y-0.5 rounded-[var(--ds-radius-xl)] border border-ds-border-base bg-ds-surface-elevated overflow-hidden ds-hover-glow ${className}`}
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
  color = "text-ds-brand-accent",
  description,
}: StatCardProps) {
  return (
    <Card className="bg-ds-surface-elevated border-ds-border-base overflow-hidden group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-ds-text-secondary text-sm font-medium mb-2 truncate uppercase tracking-wide">
            {title}
          </p>
          <h3 className={`text-3xl font-bold ${color} m-0 mb-1`}>{value}</h3>
          {description && (
            <p className="text-sm mt-2 text-ds-text-secondary font-medium">
              {description}
            </p>
          )}
          {trend && (
            <div className="flex items-center gap-2 mt-3">
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  trend.isPositive
                    ? "bg-ds-brand-accent-subtle text-ds-status-success"
                    : "bg-ds-status-error/5 text-ds-status-error dark:bg-red-900/20"
                }`}
              >
                <span className="text-sm">{trend.isPositive ? "↑" : "↓"}</span>
                {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-ds-text-subtle">
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
