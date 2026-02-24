"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  Spin,
  Typography,
  Button,
  Card,
  Descriptions,
  Tag,
  Collapse,
  message,
  Form,
  Switch,
  Space,
} from "antd";
import Input, { TextArea } from "@/components/ui/Input";
import Table from "@/components/ui/Table";
import { BooleanBadge } from "@/components/ui/StatusBadge";
import { formatDateTime } from "@/lib/utils/format";
import {
  ArrowLeftOutlined,
  HistoryOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { MetricFieldType } from "@/lib/types";
import { useAuth } from "@/providers/AuthProvider";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import { METRIC_FIELD_TYPE_LABELS } from "@/lib/constants/reports";
import TemplateSectionBuilder from "@/components/features/reports/TemplateSectionBuilder";
import type { SectionInput } from "@/components/features/reports/TemplateSectionBuilder";

const { Title, Text } = Typography;

interface TemplateMetric {
  id: string;
  name: string;
  description?: string;
  fieldType: MetricFieldType;
  isRequired: boolean;
  order: number;
  capturesGoal: boolean;
  capturesAchieved: boolean;
  capturesYoY: boolean;
  minValue?: number;
  maxValue?: number;
}

interface TemplateSubSection {
  id: string;
  name: string;
  description?: string;
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

/**
 * Convert TemplateSection[] (from API) → SectionInput[] (for builder)
 */
function templateSectionsToBuilderInputs(
  sections: TemplateSection[]
): SectionInput[] {
  return sections
    .sort((a, b) => a.order - b.order)
    .map((s) => ({
      key: s.id,
      name: s.name,
      description: s.description,
      order: s.order,
      isRequired: s.isRequired,
      metrics: s.metrics
        .sort((a, b) => a.order - b.order)
        .map((m) => ({
          key: m.id,
          name: m.name,
          description: m.description,
          fieldType: m.fieldType,
          isRequired: m.isRequired,
          capturesGoal: m.capturesGoal,
          capturesAchieved: m.capturesAchieved,
          capturesYoY: m.capturesYoY,
          minValue: m.minValue,
          maxValue: m.maxValue,
          order: m.order,
        })),
      subSections: (s.subSections ?? [])
        .sort((a, b) => a.order - b.order)
        .map((ss) => ({
          key: ss.id,
          name: ss.name,
          description: ss.description,
          order: ss.order,
          metrics: ss.metrics
            .sort((a, b) => a.order - b.order)
            .map((m) => ({
              key: m.id,
              name: m.name,
              description: m.description,
              fieldType: m.fieldType,
              isRequired: m.isRequired,
              capturesGoal: m.capturesGoal,
              capturesAchieved: m.capturesAchieved,
              capturesYoY: m.capturesYoY,
              minValue: m.minValue,
              maxValue: m.maxValue,
              order: m.order,
            })),
        })),
    }));
}

/**
 * Convert SectionInput[] → API-ready CreateTemplateSectionInput[]
 */
function sectionsToApiPayload(sections: SectionInput[]) {
  return sections
    .filter((s) => s.name.trim())
    .map((s) => ({
      name: s.name.trim(),
      description: s.description,
      order: s.order,
      isRequired: s.isRequired,
      subSections: s.subSections
        .filter((ss) => ss.name.trim())
        .map((ss) => ({
          name: ss.name.trim(),
          description: ss.description,
          order: ss.order,
          metrics: ss.metrics
            .filter((m) => m.name.trim())
            .map((m) => ({
              name: m.name.trim(),
              description: m.description,
              fieldType: m.fieldType,
              isRequired: m.isRequired,
              order: m.order,
              capturesGoal: m.capturesGoal,
              capturesAchieved: m.capturesAchieved,
              capturesYoY: m.capturesYoY,
              minValue: m.minValue,
              maxValue: m.maxValue,
            })),
        })),
      metrics: s.metrics
        .filter((m) => m.name.trim())
        .map((m) => ({
          name: m.name.trim(),
          description: m.description,
          fieldType: m.fieldType,
          isRequired: m.isRequired,
          order: m.order,
          capturesGoal: m.capturesGoal,
          capturesAchieved: m.capturesAchieved,
          capturesYoY: m.capturesYoY,
          minValue: m.minValue,
          maxValue: m.maxValue,
        })),
    }));
}

export default function SuperadminTemplateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const templateId = params.id as string;
  const { user } = useAuth();
  const role = user?.role;

  const [template, setTemplate] = useState<TemplateDetail | null>(null);
  const [versions, setVersions] = useState<TemplateVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm] = Form.useForm();

  // Section builder state for edit mode
  const sectionsRef = useRef<SectionInput[]>([]);

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

  // Start edit mode from URL param
  useEffect(() => {
    if (searchParams.get("edit") === "true" && template && !editMode) {
      enterEditMode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, template]);

  const enterEditMode = () => {
    if (!template) return;
    editForm.setFieldsValue({
      name: template.name,
      description: template.description ?? "",
      isDefault: template.isDefault,
      changeNotes: "",
    });
    sectionsRef.current = templateSectionsToBuilderInputs(template.sections);
    setEditMode(true);
  };

  const cancelEdit = () => {
    setEditMode(false);
    editForm.resetFields();
    sectionsRef.current = [];
    router.replace(`/superadmin/reports/templates/${templateId}`);
  };

  const handleSave = async (values: {
    name: string;
    description?: string;
    isDefault: boolean;
    changeNotes?: string;
  }) => {
    const apiSections = sectionsToApiPayload(sectionsRef.current);
    if (apiSections.length === 0) {
      message.warning("Template must have at least one section with metrics.");
      return;
    }

    const emptySections = apiSections.filter(
      (s) =>
        s.metrics.length === 0 &&
        s.subSections.every((ss) => ss.metrics.length === 0)
    );
    if (emptySections.length > 0) {
      message.warning(
        `Section "${emptySections[0].name}" has no metrics. Add at least one metric per section.`
      );
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/report-templates/${templateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          description: values.description,
          isDefault: values.isDefault,
          sections: apiSections,
          changeNotes: values.changeNotes,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save template");
      }
      message.success("Template updated successfully");
      setEditMode(false);
      editForm.resetFields();
      sectionsRef.current = [];
      router.replace(`/superadmin/reports/templates/${templateId}`);
      await Promise.all([fetchTemplate(), fetchVersions()]);
    } catch (err) {
      message.error(
        err instanceof Error ? err.message : "Failed to save template"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading || !role) {
    return (
      <DashboardLayout role={role}>
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  if (!template) {
    return (
      <DashboardLayout role={role}>
        <div className="text-center py-16">
          <Text className="text-ds-text-subtle">Template not found</Text>
          <br />
          <Button
            onClick={() => router.push("/superadmin/reports/templates")}
            className="mt-4"
          >
            Back to Templates
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // ── EDIT MODE ──
  if (editMode) {
    return (
      <DashboardLayout role={role}>
        <div className="flex flex-col gap-6 max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                icon={<CloseOutlined />}
                onClick={cancelEdit}
                type="text"
              />
              <div>
                <Title level={3} className="!mb-0">
                  Editing: {template.name}
                </Title>
                <Text className="text-ds-text-subtle">
                  Modify sections, sub-sections, and metrics below
                </Text>
              </div>
            </div>
          </div>

          <Form form={editForm} layout="vertical" onFinish={handleSave}>
            <Card size="small" title="Template Information" className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  name="name"
                  label="Template Name"
                  rules={[
                    { required: true, message: "Enter template name" },
                    { min: 3, message: "Min 3 characters" },
                  ]}
                  className="!mb-0"
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="isDefault"
                  label="Default Template"
                  valuePropName="checked"
                  className="!mb-0"
                >
                  <Switch />
                </Form.Item>
              </div>
              <Form.Item
                name="description"
                label="Description"
                className="!mb-0 mt-4"
              >
                <TextArea rows={2} />
              </Form.Item>
            </Card>

            {/* Section Builder */}
            <TemplateSectionBuilder
              initialSections={templateSectionsToBuilderInputs(
                template.sections
              )}
              onChange={(sections) => {
                sectionsRef.current = sections;
              }}
            />

            {/* Change Notes + Actions */}
            <Card size="small" className="mt-6">
              <Form.Item
                name="changeNotes"
                label="Change Notes (optional)"
                className="!mb-4"
              >
                <TextArea
                  rows={2}
                  placeholder="Briefly describe what you changed (for version history)"
                />
              </Form.Item>
              <div className="flex justify-end gap-3">
                <Button onClick={cancelEdit}>Cancel</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={saving}
                >
                  Save Changes
                </Button>
              </div>
            </Card>
          </Form>
        </div>
      </DashboardLayout>
    );
  }

  // ── READ-ONLY VIEW ──

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
              <Title level={3} className="!mb-0">
                {template.name}
              </Title>
              <div className="flex items-center gap-2 mt-1">
                <Tag>v{template.version}</Tag>
                {template.isDefault && <Tag color="blue">Default</Tag>}
                <BooleanBadge value={template.isActive} trueLabel="Active" falseLabel="Inactive" />
              </div>
            </div>
          </div>

          <Space>
            <Button
              icon={<EditOutlined />}
              type="primary"
              onClick={enterEditMode}
            >
              Edit Template
            </Button>
          </Space>
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
            <Descriptions.Item label="Total Metrics">
              {template.sections.reduce(
                (sum, s) =>
                  sum +
                  s.metrics.length +
                  (s.subSections ?? []).reduce(
                    (ssum, ss) => ssum + ss.metrics.length,
                    0
                  ),
                0
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Created">
              {formatDateTime(template.createdAt)}
            </Descriptions.Item>
            <Descriptions.Item label="Last Updated">
              {formatDateTime(template.updatedAt)}
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
                    {section.isRequired && (
                      <Tag color="blue" className="text-xs">
                        Required
                      </Tag>
                    )}
                    <Text className="text-xs text-ds-text-subtle">
                      {section.metrics.length +
                        (section.subSections ?? []).reduce(
                          (sum, ss) => sum + ss.metrics.length,
                          0
                        )}{" "}
                      metrics
                      {section.subSections?.length
                        ? `, ${section.subSections.length} sub-sections`
                        : ""}
                    </Text>
                  </div>
                ),
                children: (
                  <div className="flex flex-col gap-4">
                    {section.description && (
                      <Text className="text-ds-text-subtle">
                        {section.description}
                      </Text>
                    )}

                    {/* Section-level metrics */}
                    {section.metrics.length > 0 && (
                      <Table
                        dataSource={section.metrics.sort(
                          (a, b) => a.order - b.order
                        )}
                        columns={metricColumns}
                        rowKey="id"
                        size="small"
                        pagination={false}
                      />
                    )}

                    {/* Sub-sections */}
                    {section.subSections?.map((sub) => (
                      <Card
                        key={sub.id}
                        size="small"
                        title={sub.name}
                        className="bg-ds-surface-sunken"
                      >
                        {sub.description && (
                          <Text className="text-ds-text-subtle text-sm block mb-2">
                            {sub.description}
                          </Text>
                        )}
                        <Table
                          dataSource={sub.metrics.sort(
                            (a, b) => a.order - b.order
                          )}
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
                {
                  title: "Version",
                  dataIndex: "version",
                  key: "version",
                  render: (v: number) => `v${v}`,
                },
                {
                  title: "Change Notes",
                  dataIndex: "changeNotes",
                  key: "changeNotes",
                  render: (v: string) => v || "—",
                },
                {
                  title: "Date",
                  dataIndex: "createdAt",
                  key: "createdAt",
                  render: (v: string) => formatDateTime(v),
                },
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
