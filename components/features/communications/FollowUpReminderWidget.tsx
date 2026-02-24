"use client";

import { useEffect, useState } from "react";
import { Badge, Empty, Spin, message } from "antd";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import {
  BellOutlined,
  ClockCircleOutlined,
  UserOutlined,
  RightOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface OverdueFollowUp {
  id: string;
  memberId: string;
  memberName: string;
  reason: string;
  scheduledDate: string;
  daysOverdue: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
}

interface FollowUpReminderWidgetProps {
  leaderGroupId: string;
}

export default function FollowUpReminderWidget({
  leaderGroupId,
}: FollowUpReminderWidgetProps) {
  const [loading, setLoading] = useState(true);
  const [overdueFollowUps, setOverdueFollowUps] = useState<OverdueFollowUp[]>(
    []
  );

  useEffect(() => {
    fetchOverdueFollowUps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaderGroupId]);

  const fetchOverdueFollowUps = async () => {
    setLoading(true);
    try {
      // Mock API call - replace with real API
      const response = await fetch(
        `/api/follow-ups/overdue?groupId=${leaderGroupId}`
      );
      if (response.ok) {
        const data = await response.json();
        setOverdueFollowUps(data.overdueFollowUps || []);

        // Create notification if there are overdue items
        if (data.overdueFollowUps?.length > 0) {
          await createReminderNotifications(data.overdueFollowUps);
        }
      }
    } catch (error) {
      console.error("Failed to fetch overdue follow-ups:", error);
    } finally {
      setLoading(false);
    }
  };

  const createReminderNotifications = async (followUps: OverdueFollowUp[]) => {
    try {
      // Create notifications for overdue follow-ups
      await fetch("/api/notifications/follow-up-reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          followUps: followUps.map((f) => ({
            id: f.id,
            memberName: f.memberName,
            daysOverdue: f.daysOverdue,
          })),
        }),
      });
    } catch (error) {
      console.error("Failed to create reminder notifications:", error);
    }
  };

  const handleMarkComplete = async (followUpId: string) => {
    try {
      const response = await fetch(`/api/follow-ups/${followUpId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });

      if (response.ok) {
        message.success("Follow-up marked as complete");
        setOverdueFollowUps((prev) => prev.filter((f) => f.id !== followUpId));
      }
    } catch {
      message.error("Failed to mark follow-up as complete");
    }
  };

  if (loading) {
    return (
      <Card className="shadow-sm">
        <div className="flex items-center justify-center py-8">
          <Spin />
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BellOutlined className="text-ds-chart-4" />
            <span>Overdue Follow-ups</span>
            {overdueFollowUps.length > 0 && (
              <Badge count={overdueFollowUps.length} showZero={false} />
            )}
          </div>
          <Link
            href="/leader/follow-ups"
            className="text-sm text-ds-chart-1 hover:text-blue-700"
          >
            View All <RightOutlined />
          </Link>
        </div>
      }
      className="shadow-sm"
    >
      {overdueFollowUps.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No overdue follow-ups"
          className="py-4"
        />
      ) : (
        <div className="space-y-3">
          {overdueFollowUps.slice(0, 5).map((followUp) => (
            <div
              key={followUp.id}
              className="p-3 border border-ds-border-base rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <UserOutlined className="text-ds-text-subtle" />
                    <span className="font-medium text-ds-text-primary">
                      {followUp.memberName}
                    </span>
                    <StatusBadge status={followUp.priority} category="priority" />
                  </div>
                  <p className="text-sm text-ds-text-secondary mb-2">
                    {followUp.reason}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-ds-status-error">
                    <ClockCircleOutlined />
                    <span>
                      {followUp.daysOverdue} day
                      {followUp.daysOverdue !== 1 ? "s" : ""} overdue
                    </span>
                    <span className="text-ds-text-subtle">•</span>
                    <span className="text-ds-text-subtle">
                      Due {dayjs(followUp.scheduledDate).format("D MMM")}
                    </span>
                  </div>
                </div>
                <Button
                  size="small"
                  variant="link"
                  onClick={() => handleMarkComplete(followUp.id)}
                >
                  Mark Done
                </Button>
              </div>
            </div>
          ))}
          {overdueFollowUps.length > 5 && (
            <Link
              href="/leader/follow-ups"
              className="block text-center text-sm text-ds-chart-1 hover:text-blue-700 pt-2"
            >
              View {overdueFollowUps.length - 5} more overdue follow-ups
            </Link>
          )}
        </div>
      )}
    </Card>
  );
}
