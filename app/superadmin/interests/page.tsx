"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import {
  Card,
  Progress,
  Table,
  Tag,
  Empty,
  Button,
  Tabs,
  Statistic,
  Row,
  Col,
  Tooltip,
} from "antd";
import {
  PieChartOutlined,
  TeamOutlined,
  TrophyOutlined,
  InfoCircleOutlined,
  DownloadOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { StatCard } from "@/components/ui/Card";

interface InterestDistribution {
  interest: string;
  count: number;
  percentage: number;
}

interface InterestDemographic {
  interest: string;
  totalMembers: number;
  ageGroups: Record<string, number>;
  maritalStatus: Record<string, number>;
  employmentStatus: Record<string, number>;
  groupDistribution: Record<string, number>;
}

interface GroupAffinityScore {
  groupId: string;
  groupName: string;
  memberCount: number;
  affinityScore: number;
  commonInterests: Array<{
    interest: string;
    count: number;
    percentage: number;
  }>;
}

interface MemberSuggestion {
  memberId: string;
  memberName: string;
  currentGroup: string;
  currentGroupMatch: number;
  suggestedGroup: string | null;
  suggestedGroupMatch: number | null;
  suggestedGroupMatchingInterests: string[];
}

interface InterestAnalytics {
  interestDistribution: InterestDistribution[];
  interestDemographics: InterestDemographic[];
  groupAffinityScores: GroupAffinityScore[];
  memberSuggestions: MemberSuggestion[];
  summary: {
    totalMembers: number;
    totalInterests: number;
    membersWithInterests: number;
    averageInterestsPerMember: number;
  };
}

export default function InterestInsightsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<InterestAnalytics | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/analytics/interests");
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Error fetching interest analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!analytics) return;

    const csvData = [
      ["Interest", "Members", "Percentage"],
      ...analytics.interestDistribution.map((item) => [
        item.interest,
        item.count.toString(),
        `${item.percentage}%`,
      ]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      csvData.map((row) => row.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "interest_distribution.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <DashboardLayout role={user?.role || "SUPERADMIN"}>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Interest-Based Insights
          </h2>
          <CardSkeleton count={4} />
        </div>
      </DashboardLayout>
    );
  }

  if (!analytics) {
    return (
      <DashboardLayout role={user?.role || "SUPERADMIN"}>
        <div className="p-6">
          <Empty description="No analytics data available" />
        </div>
      </DashboardLayout>
    );
  }

  const distributionColumns = [
    {
      title: "Interest",
      dataIndex: "interest",
      key: "interest",
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Members",
      dataIndex: "count",
      key: "count",
      sorter: (a: InterestDistribution, b: InterestDistribution) =>
        a.count - b.count,
    },
    {
      title: "Percentage",
      dataIndex: "percentage",
      key: "percentage",
      render: (percentage: number) => (
        <div>
          <Progress
            percent={percentage}
            size="small"
            format={() => `${percentage}%`}
          />
        </div>
      ),
      sorter: (a: InterestDistribution, b: InterestDistribution) =>
        a.percentage - b.percentage,
    },
  ];

  const affinityColumns = [
    {
      title: "Group",
      dataIndex: "groupName",
      key: "groupName",
    },
    {
      title: "Members",
      dataIndex: "memberCount",
      key: "memberCount",
    },
    {
      title: "Affinity Score",
      dataIndex: "affinityScore",
      key: "affinityScore",
      render: (score: number) => (
        <div className="flex items-center gap-2">
          <Progress
            percent={score}
            size="small"
            strokeColor={
              score > 70 ? "#52c41a" : score > 40 ? "#faad14" : "#ff4d4f"
            }
          />
          <Tooltip title="Higher scores indicate more shared interests among group members">
            <InfoCircleOutlined className="text-gray-400" />
          </Tooltip>
        </div>
      ),
      sorter: (a: GroupAffinityScore, b: GroupAffinityScore) =>
        a.affinityScore - b.affinityScore,
    },
    {
      title: "Common Interests",
      dataIndex: "commonInterests",
      key: "commonInterests",
      render: (interests: Array<{ interest: string; percentage: number }>) => (
        <div className="flex flex-wrap gap-1">
          {interests.slice(0, 3).map((interest) => (
            <Tag key={interest.interest} color="blue">
              {interest.interest} ({interest.percentage}%)
            </Tag>
          ))}
          {interests.length > 3 && <Tag>+{interests.length - 3} more</Tag>}
        </div>
      ),
    },
  ];

  const suggestionColumns = [
    {
      title: "Member",
      dataIndex: "memberName",
      key: "memberName",
    },
    {
      title: "Current Group",
      dataIndex: "currentGroup",
      key: "currentGroup",
      render: (group: string, record: MemberSuggestion) => (
        <div>
          <div>{group}</div>
          <div className="text-xs text-gray-500">
            Match: {record.currentGroupMatch}%
          </div>
        </div>
      ),
    },
    {
      title: "Suggested Group",
      dataIndex: "suggestedGroup",
      key: "suggestedGroup",
      render: (_: string, record: MemberSuggestion) => (
        <div>
          <div className="font-medium text-green-600">
            {record.suggestedGroup}
          </div>
          <div className="text-xs text-gray-500">
            Match: {record.suggestedGroupMatch}%
          </div>
        </div>
      ),
    },
    {
      title: "Matching Interests",
      dataIndex: "suggestedGroupMatchingInterests",
      key: "matchingInterests",
      render: (interests: string[]) => (
        <div className="flex flex-wrap gap-1">
          {interests.slice(0, 3).map((interest) => (
            <Tag key={interest} color="green">
              {interest}
            </Tag>
          ))}
          {interests.length > 3 && <Tag>+{interests.length - 3}</Tag>}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout role={user?.role || "SUPERADMIN"}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Interest-Based Insights
            </h2>
            <p className="text-gray-600 mt-1">
              Analyze member interests and optimize group compositions
            </p>
          </div>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={exportToCSV}
          >
            Export Distribution
          </Button>
        </div>

        {/* Summary Cards */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Total Members"
              value={analytics.summary.totalMembers}
              icon={<TeamOutlined />}
              color="blue"
              description="Active church members"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Unique Interests"
              value={analytics.summary.totalInterests}
              icon={<PieChartOutlined />}
              color="purple"
              description="Different interests tracked"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="With Interests"
              value={analytics.summary.membersWithInterests}
              icon={<TrophyOutlined />}
              color="green"
              description={`${Math.round((analytics.summary.membersWithInterests / analytics.summary.totalMembers) * 100)}% of members`}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Avg Interests/Member"
                value={analytics.summary.averageInterestsPerMember}
                precision={1}
                prefix={<PieChartOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
              <div className="text-xs text-gray-500 mt-2">
                Per member average
              </div>
            </Card>
          </Col>
        </Row>

        {/* Tabs for Different Views */}
        <Tabs
          defaultActiveKey="distribution"
          items={[
            {
              key: "distribution",
              label: (
                <span>
                  <PieChartOutlined /> Interest Distribution
                </span>
              ),
              children: (
                <Card>
                  <Table
                    dataSource={analytics.interestDistribution}
                    columns={distributionColumns}
                    rowKey="interest"
                    pagination={{ pageSize: 15 }}
                  />
                </Card>
              ),
            },
            {
              key: "groups",
              label: (
                <span>
                  <TeamOutlined /> Group Affinity
                </span>
              ),
              children: (
                <Card>
                  <p className="text-gray-600 mb-4">
                    Groups with higher affinity scores have members who share
                    more common interests, leading to better engagement.
                  </p>
                  <Table
                    dataSource={analytics.groupAffinityScores}
                    columns={affinityColumns}
                    rowKey="groupId"
                    pagination={{ pageSize: 10 }}
                  />
                </Card>
              ),
            },
            {
              key: "suggestions",
              label: (
                <span>
                  <SwapOutlined /> Group Suggestions
                  {analytics.memberSuggestions.length > 0 && (
                    <Tag color="orange" className="ml-2">
                      {analytics.memberSuggestions.length}
                    </Tag>
                  )}
                </span>
              ),
              children: (
                <Card>
                  <p className="text-gray-600 mb-4">
                    Members who might benefit from joining different groups
                    based on interest alignment (20%+ improvement).
                  </p>
                  {analytics.memberSuggestions.length === 0 ? (
                    <Empty
                      description="No group transfer suggestions at this time"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  ) : (
                    <Table
                      dataSource={analytics.memberSuggestions}
                      columns={suggestionColumns}
                      rowKey="memberId"
                      pagination={{ pageSize: 10 }}
                    />
                  )}
                </Card>
              ),
            },
            {
              key: "demographics",
              label: (
                <span>
                  <InfoCircleOutlined /> Demographics
                </span>
              ),
              children: (
                <div className="space-y-4">
                  {analytics.interestDemographics.slice(0, 10).map((demo) => (
                    <Card key={demo.interest} title={demo.interest}>
                      <Row gutter={[16, 16]}>
                        <Col xs={24} md={12}>
                          <h4 className="font-medium mb-2">Age Distribution</h4>
                          {Object.entries(demo.ageGroups).map(
                            ([age, count]) => (
                              <div key={age} className="mb-2">
                                <div className="flex justify-between text-sm mb-1">
                                  <span>{age}</span>
                                  <span>{count}</span>
                                </div>
                                <Progress
                                  percent={Math.round(
                                    (count / demo.totalMembers) * 100
                                  )}
                                  size="small"
                                  strokeColor="#1890ff"
                                />
                              </div>
                            )
                          )}
                        </Col>
                        <Col xs={24} md={12}>
                          <h4 className="font-medium mb-2">Marital Status</h4>
                          {Object.entries(demo.maritalStatus).map(
                            ([status, count]) => (
                              <div key={status} className="mb-2">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="capitalize">{status}</span>
                                  <span>{count}</span>
                                </div>
                                <Progress
                                  percent={Math.round(
                                    (count / demo.totalMembers) * 100
                                  )}
                                  size="small"
                                  strokeColor="#52c41a"
                                />
                              </div>
                            )
                          )}
                        </Col>
                      </Row>
                    </Card>
                  ))}
                </div>
              ),
            },
          ]}
        />
      </div>
    </DashboardLayout>
  );
}
