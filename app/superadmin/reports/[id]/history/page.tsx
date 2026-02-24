"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Spin, Typography, message } from "antd";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { ReportEventType } from "@/lib/types";
import { useAuth } from "@/providers/AuthProvider";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import { ReportTimeline } from "@/components/features/reports";

const { Title, Text } = Typography;

interface HistoryEvent {
  id: string;
  eventType: ReportEventType;
  actorId: string;
  timestamp: string;
  details?: Record<string, unknown>;
  previousStatus?: string;
  newStatus?: string;
  actor?: { firstName: string; lastName: string };
}

export default function SuperadminReportHistoryPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = params.id as string;
  const { user } = useAuth();
  const role = user?.role;

  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reports/${reportId}/history`);
      if (!response.ok) throw new Error("Failed to fetch history");
      const data = await response.json();
      setEvents(data.data || []);
    } catch {
      message.error("Failed to load report history");
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  if (!role) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={role}>
      <div className="flex flex-col gap-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push(`/superadmin/reports/${reportId}`)}
            variant="text"
          />
          <div>
            <Title level={3} className="!mb-0">
              Report History
            </Title>
            <Text className="text-ds-text-subtle">Full audit trail of actions</Text>
          </div>
        </div>

        <Card loading={loading}>
          <ReportTimeline
            events={events.map((e) => ({
              id: e.id,
              eventType: e.eventType,
              timestamp: e.timestamp,
              actorName: e.actor
                ? `${e.actor.firstName} ${e.actor.lastName}`
                : undefined,
              details: e.details,
              previousStatus: e.previousStatus,
              newStatus: e.newStatus,
            }))}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}
