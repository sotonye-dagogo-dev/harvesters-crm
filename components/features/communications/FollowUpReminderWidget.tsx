"use client";

import { useEffect, useState } from "react";
import { Card, Badge, Empty, Spin, message, Button } from "antd";
import {
  BellOutlined,
  ClockCircleOutlined,
  UserOutlined,
  RightOutlined,
} from "@ant-design/icons";
import Link from "next/link";
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "red";
      case "MEDIUM":
        return "orange";
      case "LOW":
        return "blue";
      default:
        return "default";
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
    } catch (error) {
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
            <BellOutlined className="text-orange-500" />
            <span>Overdue Follow-ups</span>
            {overdueFollowUps.length > 0 && (
              <Badge count={overdueFollowUps.length} showZero={false} />
            )}
          </div>
          <Link
            href="/leader/follow-ups"
            className="text-sm text-blue-600 hover:text-blue-700"
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
              className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <UserOutlined className="text-gray-500" />
                    <span className="font-medium text-gray-900">
                      {followUp.memberName}
                    </span>
                    <Badge
                      color={getPriorityColor(followUp.priority)}
                      text={followUp.priority}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {followUp.reason}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-red-600">
                    <ClockCircleOutlined />
                    <span>
                      {followUp.daysOverdue} day
                      {followUp.daysOverdue !== 1 ? "s" : ""} overdue
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">
                      Due {dayjs(followUp.scheduledDate).format("MMM D")}
                    </span>
                  </div>
                </div>
                <Button
                  size="small"
                  type="link"
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
              className="block text-center text-sm text-blue-600 hover:text-blue-700 pt-2"
            >
              View {overdueFollowUps.length - 5} more overdue follow-ups
            </Link>
          )}
        </div>
      )}
    </Card>
  );
}
