"use client";

import { UserRole } from "@/lib/types";
import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import {
  Card,
  Statistic,
  Row,
  Col,
  Timeline,
  Tag,
  message,
  Spin,
  Empty,
} from "antd";
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
      const response = await fetch("/api/analytics/members/me");
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
  }, []);

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
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <CalendarOutlined className="text-2xl text-blue-600 dark:text-blue-400" />
            </div>
            My Participation History
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2 ml-15">
            Track your fellowship meeting attendance and engagement
          </p>
        </div>

        {/* Statistics */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
              <Statistic
                title="Total Meetings"
                value={stats.totalMeetings}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: "#1B4B3E" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
              <Statistic
                title="Attended"
                value={stats.attended}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
              <Statistic
                title="Missed"
                value={stats.missed}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: "#ff4d4f" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
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
          className="shadow-xl"
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
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {new Date(item.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                      <Tag color={item.attended ? "success" : "error"}>
                        {item.attended ? "Attended" : "Absent"}
                      </Tag>
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {item.groupName}
                    </div>
                    {item.notes && (
                      <div className="text-sm text-gray-500 dark:text-gray-500 mt-1 italic">
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
