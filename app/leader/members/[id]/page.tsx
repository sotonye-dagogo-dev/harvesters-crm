"use client";

import { UserRole } from "@/lib/types";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Space,
  message,
  Spin,
  Statistic,
  Row,
  Col,
  Timeline,
  Avatar,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

interface MemberDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsappPhone: string;
  age: number;
  location: string;
  maritalStatus: string;
  employmentStatus: string;
  interests: string[];
  isActive: boolean;
  joinedDate: string;
  attendanceRate?: number;
  totalMeetings?: number;
  attendedMeetings?: number;
  recentMeetings?: Array<{
    date: string;
    attended: boolean;
    notes?: string;
  }>;
}

export default function MemberDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [member, setMember] = useState<MemberDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMemberDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setMember(data.data);
      } else {
        message.error("Failed to fetch member details");
      }
    } catch {
      message.error("An error occurred while fetching member details");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchMemberDetails();
  }, [fetchMemberDetails]);

  if (loading) {
    return (
      <DashboardLayout role={UserRole.SMALL_GROUP_LEADER}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  if (!member) {
    return (
      <DashboardLayout role={UserRole.SMALL_GROUP_LEADER}>
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Member not found</p>
            <Button
              type="primary"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
            >
              Go Back
            </Button>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={UserRole.SMALL_GROUP_LEADER}>
      <div className="space-y-8">
        {/* Back Button */}
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.back()}
          size="large"
        >
          Back to Members
        </Button>

        {/* Profile Header */}
        <Card className="shadow-xl">
          <div className="flex items-center gap-6">
            <Avatar
              size={100}
              icon={<UserOutlined />}
              className="bg-gradient-to-br from-green-600 to-green-700"
            >
              {member.firstName[0]}
              {member.lastName[0]}
            </Avatar>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {member.firstName} {member.lastName}
              </h2>
              <Space size="large" wrap>
                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <MailOutlined />
                  {member.email}
                </span>
                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <PhoneOutlined />
                  {member.phone}
                </span>
                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <EnvironmentOutlined />
                  {member.location}
                </span>
              </Space>
              <div className="mt-3">
                <Tag
                  icon={
                    member.isActive ? (
                      <CheckCircleOutlined />
                    ) : (
                      <CloseCircleOutlined />
                    )
                  }
                  color={member.isActive ? "success" : "default"}
                >
                  {member.isActive ? "Active" : "Inactive"}
                </Tag>
              </div>
            </div>
          </div>
        </Card>

        {/* Statistics */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card className="shadow-lg">
              <Statistic
                title="Attendance Rate"
                value={member.attendanceRate || 0}
                suffix="%"
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="shadow-lg">
              <Statistic
                title="Total Meetings"
                value={member.totalMeetings || 0}
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="shadow-lg">
              <Statistic
                title="Meetings Attended"
                value={member.attendedMeetings || 0}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Personal Information */}
        <Card title="Personal Information" className="shadow-xl">
          <Descriptions bordered column={{ xs: 1, sm: 2, md: 2 }}>
            <Descriptions.Item label="Age">{member.age}</Descriptions.Item>
            <Descriptions.Item label="Marital Status">
              {member.maritalStatus}
            </Descriptions.Item>
            <Descriptions.Item label="Employment Status">
              {member.employmentStatus}
            </Descriptions.Item>
            <Descriptions.Item label="WhatsApp">
              {member.whatsappPhone}
            </Descriptions.Item>
            <Descriptions.Item label="Joined" span={2}>
              {new Date(member.joinedDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Descriptions.Item>
            <Descriptions.Item label="Interests" span={2}>
              <Space wrap>
                {member.interests.map((interest) => (
                  <Tag key={interest} color="blue">
                    {interest}
                  </Tag>
                ))}
              </Space>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Recent Attendance */}
        {member.recentMeetings && member.recentMeetings.length > 0 && (
          <Card title="Recent Attendance" className="shadow-xl">
            <Timeline>
              {member.recentMeetings.map((meeting, index) => (
                <Timeline.Item
                  key={index}
                  color={meeting.attended ? "green" : "red"}
                  dot={
                    meeting.attended ? (
                      <CheckCircleOutlined style={{ fontSize: "16px" }} />
                    ) : (
                      <CloseCircleOutlined style={{ fontSize: "16px" }} />
                    )
                  }
                >
                  <div className="py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {new Date(meeting.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                      <Tag color={meeting.attended ? "success" : "error"}>
                        {meeting.attended ? "Attended" : "Absent"}
                      </Tag>
                    </div>
                    {meeting.notes && (
                      <div className="text-sm text-gray-500 dark:text-gray-500 mt-1 italic">
                        {meeting.notes}
                      </div>
                    )}
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        )}

        {/* Action Buttons */}
        <Card className="shadow-lg">
          <Space>
            <Button
              type="primary"
              icon={<PhoneOutlined />}
              onClick={() =>
                router.push(
                  `/leader/interactions/new?memberId=${member.id}&memberName=${member.firstName} ${member.lastName}`
                )
              }
            >
              Log Interaction
            </Button>
            <Button
              icon={<CalendarOutlined />}
              onClick={() => message.info("Feature coming soon")}
            >
              View Full History
            </Button>
          </Space>
        </Card>
      </div>
    </DashboardLayout>
  );
}
