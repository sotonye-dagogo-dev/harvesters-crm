"use client";

import { UserRole } from "@/lib/types";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { formatDateLong } from "@/lib/utils/format";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import {
  Card,
  Statistic,
  Row,
  Col,
  Timeline,
  message,
  Spin,
  Empty,
} from "antd";
import { BooleanBadge } from "@/components/ui/StatusBadge";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TrophyOutlined,
} from "@ant-design/icons";

interface MeetingHistory {
  id: string;
  groupName: string;
  date: string;
  attended: boolean;
  notes?: string;
}

interface ParticipationStats {
  totalMeetings: number;
  attended: number;
  missed: number;
  attendanceRate: number;
}

export default function MemberHistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<MeetingHistory[]>([]);
  const [stats, setStats] = useState<ParticipationStats>({
    totalMeetings: 0,
    attended: 0,
    missed: 0,
    attendanceRate: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/members/${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        const analyticsData = data.data;

        // Transform analytics data to history format
        const historyData: MeetingHistory[] =
          analyticsData.meetings?.map(
            (meeting: {
              id: string;
              date: string;
              attended: boolean;
              notes?: string;
            }) => ({
              id: meeting.id,
              groupName: analyticsData.groupName || "Unknown Group",
              date: meeting.date,
              attended: meeting.attended,
              notes: meeting.notes,
            })
          ) || [];

        setHistory(historyData);
        setStats({
          totalMeetings: analyticsData.totalMeetings || 0,
          attended: analyticsData.attendedMeetings || 0,
          missed:
            (analyticsData.totalMeetings || 0) -
            (analyticsData.attendedMeetings || 0),
          attendanceRate: analyticsData.attendanceRate || 0,
        });
      } else {
        message.error("Failed to fetch participation history");
      }
    } catch {
      message.error("An error occurred while fetching history");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  if (loading) {
    return (
      <DashboardLayout role={UserRole.MEMBER}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={UserRole.MEMBER}>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 p-6 rounded-2xl shadow-lg border border-ds-border-base">
          <h2 className="text-3xl font-bold text-ds-text-primary flex items-center gap-3">
            <div className="w-12 h-12 bg-ds-chart-1/10 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <CalendarOutlined className="text-2xl text-ds-chart-1" />
            </div>
            My Participation History
          </h2>
          <p className="text-ds-text-secondary mt-2 ml-15">
            Track your fellowship meeting attendance and engagement
          </p>
        </div>

        {/* Statistics */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-lg hover:shadow-ds-xl transition-all duration-300">
              <Statistic
                title="Total Meetings"
                value={stats.totalMeetings}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: "#1B4B3E" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-lg hover:shadow-ds-xl transition-all duration-300">
              <Statistic
                title="Attended"
                value={stats.attended}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-lg hover:shadow-ds-xl transition-all duration-300">
              <Statistic
                title="Missed"
                value={stats.missed}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: "#ff4d4f" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-lg hover:shadow-ds-xl transition-all duration-300">
              <Statistic
                title="Attendance Rate"
                value={stats.attendanceRate}
                suffix="%"
                prefix={<TrophyOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Timeline History */}
        <Card
          title={
            <span className="flex items-center gap-2 text-xl">
              <CalendarOutlined />
              Meeting Timeline
            </span>
          }
          className="shadow-ds-xl"
        >
          {history.length === 0 ? (
            <Empty description="No participation history found" />
          ) : (
            <Timeline mode="left">
              {history.map((item) => (
                <Timeline.Item
                  key={item.id}
                  color={item.attended ? "green" : "red"}
                  dot={
                    item.attended ? (
                      <CheckCircleOutlined style={{ fontSize: "16px" }} />
                    ) : (
                      <CloseCircleOutlined style={{ fontSize: "16px" }} />
                    )
                  }
                >
                  <div className="py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-ds-text-primary">
                        {formatDateLong(item.date)}
                      </span>
                      <BooleanBadge value={item.attended} trueLabel="Attended" falseLabel="Absent" />
                    </div>
                    <div className="text-ds-text-secondary">
                      {item.groupName}
                    </div>
                    {item.notes && (
                      <div className="text-sm text-ds-text-subtle dark:text-ds-text-subtle mt-1 italic">
                        {item.notes}
                      </div>
                    )}
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
