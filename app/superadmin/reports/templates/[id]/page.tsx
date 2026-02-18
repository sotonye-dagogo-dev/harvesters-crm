"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Spin,
  Typography,
  Button,
  Card,
  Descriptions,
  Tag,
  Collapse,
  message,
  Table,
} from "antd";
import { ArrowLeftOutlined, HistoryOutlined } from "@ant-design/icons";
import { MetricFieldType } from "@/lib/types";
import { useAuth } from "@/providers/AuthProvider";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import { METRIC_FIELD_TYPE_LABELS } from "@/lib/constants/reports";

const { Title, Text } = Typography;

interface TemplateMetric {
  id: string;
  name: string;
  fieldType: MetricFieldType;
  isRequired: boolean;
  order: number;
  capturesGoal: boolean;
  capturesAchieved: boolean;
  capturesYoY: boolean;
}

interface TemplateSubSection {
  id: string;
  name: string;
  order: number;
  metrics: TemplateMetric[];
}

interface TemplateSection {
  id: string;
  name: string;
  description?: string;
  order: number;
  isRequired: boolean;
  subSections?: TemplateSubSection[];
  metrics: TemplateMetric[];
}

interface TemplateDetail {
  id: string;
  name: string;
  description?: string;
  version: number;
  isActive: boolean;
  isDefault: boolean;
  sections: TemplateSection[];
  createdAt: string;
  updatedAt: string;
}

interface TemplateVersion {
  id: string;
  templateId: string;
  version: number;
  changeNotes?: string;
  createdById: string;
  createdAt: string;
}

export default function SuperadminTemplateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;
  const { user } = useAuth();
  const role = user?.role;

  const [template, setTemplate] = useState<TemplateDetail | null>(null);
  const [versions, setVersions] = useState<TemplateVersion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplate = useCallback(async () => {
    try {
      const res = await fetch(`/api/report-templates/${templateId}`);
      if (!res.ok) throw new Error("Failed to fetch template");
      const data = await res.json();
      setTemplate(data.data);
    } catch {
      message.error("Failed to load template");
    }
  }, [templateId]);

  const fetchVersions = useCallback(async () => {
    try {
      const res = await fetch(`/api/report-templates/${templateId}/versions`);
      if (!res.ok) return;
      const data = await res.json();
      setVersions(data.data || []);
    } catch {
      // non-critical
    }
  }, [templateId]);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchTemplate(), fetchVersions()]);
      setLoading(false);
    };
    loadAll();
  }, [fetchTemplate, fetchVersions]);

  if (loading || !role) {
    return (
      <DashboardLayout role={role}>
        <div className="flex justify-center items-center h-64"><Spin size="large" /></div>
      </DashboardLayout>
    );
  }

  if (!template) {
    return (
      <DashboardLayout role={role}>
        <div className="text-center py-16">
          <Text className="text-gray-500">Template not found</Text>
          <br />
          <Button onClick={() => router.push("/superadmin/reports/templates")} className="mt-4">
            Back to Templates
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const metricColumns = [
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Type",
      dataIndex: "fieldType",
      key: "fieldType",
      render: (ft: MetricFieldType) => (
        <Tag>{METRIC_FIELD_TYPE_LABELS[ft] || ft}</Tag>
      ),
    },
    {
      title: "Required",
      dataIndex: "isRequired",
      key: "isRequired",
      render: (v: boolean) => (v ? <Tag color="blue">Yes</Tag> : <Tag>No</Tag>),
    },
    {
      title: "Goal",
      dataIndex: "capturesGoal",
      key: "capturesGoal",
      render: (v: boolean) => (v ? "✓" : "—"),
    },
    {
      title: "Achieved",
      dataIndex: "capturesAchieved",
      key: "capturesAchieved",
      render: (v: boolean) => (v ? "✓" : "—"),
    },
    {
      title: "YoY",
      dataIndex: "capturesYoY",
      key: "capturesYoY",
      render: (v: boolean) => (v ? "✓" : "—"),
    },
  ];

  return (
    <DashboardLayout role={role}>
      <div className="flex flex-col gap-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push("/superadmin/reports/templates")}
              type="text"
            />
            <div>
              <Title level={3} className="!mb-0">{template.name}</Title>
              <div className="flex items-center gap-2 mt-1">
                <Tag>v{template.version}</Tag>
                {template.isDefault && <Tag color="blue">Default</Tag>}
                {template.isActive ? (
                  <Tag color="green">Active</Tag>
                ) : (
                  <Tag color="red">Inactive</Tag>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <Card size="small" title="Template Information">
          <Descriptions column={{ xs: 1, sm: 2 }} size="small">
            <Descriptions.Item label="Description">
              {template.description || "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Sections">
              {template.sections.length}
            </Descriptions.Item>
            <Descriptions.Item label="Created">
              {new Date(template.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Last Updated">
              {new Date(template.updatedAt).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Sections */}
        <Card title="Template Sections">
          <Collapse
            items={template.sections
              .sort((a, b) => a.order - b.order)
              .map((section) => ({
                key: section.id,
                label: (
                  <div className="flex items-center gap-2">
                    <Text className="font-medium">{section.name}</Text>
                    {section.isRequired && <Tag color="blue" className="text-xs">Required</Tag>}
                    <Text className="text-xs text-gray-400">
                      {section.metrics.length} metrics
                      {section.subSections?.length
                        ? `, ${section.subSections.length} sub-sections`
                        : ""}
                    </Text>
                  </div>
                ),
                children: (
                  <div className="flex flex-col gap-4">
                    {section.description && (
                      <Text className="text-gray-500">{section.description}</Text>
                    )}

                    {/* Section-level metrics */}
                    {section.metrics.length > 0 && (
                      <Table
                        dataSource={section.metrics.sort((a, b) => a.order - b.order)}
                        columns={metricColumns}
                        rowKey="id"
                        size="small"
                        pagination={false}
                      />
                    )}

                    {/* Sub-sections */}
                    {section.subSections?.map((sub) => (
                      <Card key={sub.id} size="small" title={sub.name} className="bg-gray-50 dark:bg-gray-700/50">
                        <Table
                          dataSource={sub.metrics.sort((a, b) => a.order - b.order)}
                          columns={metricColumns}
                          rowKey="id"
                          size="small"
                          pagination={false}
                        />
                      </Card>
                    ))}
                  </div>
                ),
              }))}
          />
        </Card>

        {/* Version History */}
        {versions.length > 0 && (
          <Card title="Version History" extra={<HistoryOutlined />}>
            <Table
              dataSource={versions}
              columns={[
                { title: "Version", dataIndex: "version", key: "version", render: (v: number) => `v${v}` },
                { title: "Change Notes", dataIndex: "changeNotes", key: "changeNotes", render: (v: string) => v || "—" },
                { title: "Date", dataIndex: "createdAt", key: "createdAt", render: (v: string) => new Date(v).toLocaleString() },
              ]}
              rowKey="id"
              size="small"
              pagination={false}
            />
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
