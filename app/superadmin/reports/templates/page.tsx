"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  Button,
  Space,
  Spin,
  message,
  Typography,
  Tag,
  Modal,
  Form,
  Input,
  Switch,
} from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  EyeOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useAuth } from "@/providers/AuthProvider";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import TemplateSectionBuilder from "@/components/features/reports/TemplateSectionBuilder";
import type { SectionInput } from "@/components/features/reports/TemplateSectionBuilder";

const { Title, Text } = Typography;
const { confirm } = Modal;

interface TemplateListItem {
  id: string;
  name: string;
  description?: string;
  version: number;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  sections: Array<{ id: string; name: string; order: number }>;
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

export default function SuperadminTemplatesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const role = user?.role;

  const [templates, setTemplates] = useState<TemplateListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [form] = Form.useForm();

  // Section builder state (kept outside the modal so it persists while open)
  const sectionsRef = useRef<SectionInput[]>([]);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/report-templates");
      if (!res.ok) throw new Error("Failed to fetch templates");
      const data = await res.json();
      setTemplates(data.data || []);
    } catch {
      message.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleCreate = async (values: {
    name: string;
    description?: string;
    isDefault: boolean;
  }) => {
    const apiSections = sectionsToApiPayload(sectionsRef.current);
    if (apiSections.length === 0) {
      message.warning(
        "Add at least one section with a name and metrics before creating the template."
      );
      return;
    }

    // Validate that each section has at least one metric (in metrics or subsections)
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

    setCreateLoading(true);
    try {
      const res = await fetch("/api/report-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          description: values.description,
          isDefault: values.isDefault,
          sections: apiSections,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create template");
      }
      message.success("Template created successfully");
      setCreateModalOpen(false);
      form.resetFields();
      sectionsRef.current = [];
      fetchTemplates();
    } catch (err) {
      message.error(
        err instanceof Error ? err.message : "Failed to create template"
      );
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeactivate = (id: string, name: string) => {
    confirm({
      title: "Deactivate Template",
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to deactivate "${name}"? Existing reports using this template will not be affected.`,
      okText: "Deactivate",
      okType: "danger",
      onOk: async () => {
        try {
          const res = await fetch(`/api/report-templates/${id}`, {
            method: "DELETE",
          });
          if (!res.ok) throw new Error("Failed to deactivate");
          message.success("Template deactivated");
          fetchTemplates();
        } catch {
          message.error("Failed to deactivate template");
        }
      },
    });
  };

  const columns: ColumnsType<TemplateListItem> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: string, r) => (
        <div>
          <Text className="font-medium">{name}</Text>
          {r.isDefault && (
            <Tag color="blue" className="ml-2">
              Default
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Version",
      dataIndex: "version",
      key: "version",
      width: 90,
      render: (v: number) => <Tag>v{v}</Tag>,
    },
    {
      title: "Sections",
      key: "sections",
      width: 100,
      render: (_, r) => <Text>{r.sections?.length ?? 0}</Text>,
    },
    {
      title: "Status",
      key: "status",
      width: 100,
      render: (_, r) =>
        r.isActive ? (
          <Tag color="green">Active</Tag>
        ) : (
          <Tag color="red">Inactive</Tag>
        ),
    },
    {
      title: "Last Updated",
      key: "updatedAt",
      render: (_, r) => new Date(r.updatedAt).toLocaleDateString(),
      sorter: (a, b) =>
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 240,
      render: (_, r) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => router.push(`/superadmin/reports/templates/${r.id}`)}
          >
            View
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            size="small"
            onClick={() =>
              router.push(`/superadmin/reports/templates/${r.id}?edit=true`)
            }
          >
            Edit
          </Button>
          {r.isActive && (
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => handleDeactivate(r.id, r.name)}
            >
              Deactivate
            </Button>
          )}
        </Space>
      ),
    },
  ];

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
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Title level={3} className="!mb-0">
              Report Templates
            </Title>
            <Text className="text-gray-500">
              Manage the structure and sections of report templates
            </Text>
          </div>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchTemplates}>
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalOpen(true)}
            >
              New Template
            </Button>
          </Space>
        </div>

        <Table
          dataSource={templates}
          columns={columns}
          rowKey="id"
          loading={loading}
          scroll={{ x: 800 }}
          pagination={{ pageSize: 10, showTotal: (t) => `${t} templates` }}
        />
      </div>

      {/* Create Template Modal — now with full section builder */}
      <Modal
        title="Create New Report Template"
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false);
          form.resetFields();
          sectionsRef.current = [];
        }}
        footer={null}
        width={960}
        styles={{ body: { maxHeight: "70vh", overflowY: "auto" } }}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Form.Item
              name="name"
              label="Template Name"
              rules={[
                { required: true, message: "Please enter a template name" },
                { min: 3, message: "Name must be at least 3 characters" },
              ]}
              className="!mb-0"
            >
              <Input placeholder="e.g., Monthly Campus Report" />
            </Form.Item>
            <Form.Item
              name="isDefault"
              label="Set as Default"
              valuePropName="checked"
              initialValue={false}
              className="!mb-0"
            >
              <Switch />
            </Form.Item>
          </div>
          <Form.Item name="description" label="Description" className="!mb-6">
            <Input.TextArea
              rows={2}
              placeholder="Brief description of this template"
            />
          </Form.Item>

          {/* Section Builder */}
          <TemplateSectionBuilder
            onChange={(sections) => {
              sectionsRef.current = sections;
            }}
          />

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={() => {
                setCreateModalOpen(false);
                form.resetFields();
                sectionsRef.current = [];
              }}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={createLoading}>
              Create Template
            </Button>
          </div>
        </Form>
      </Modal>
    </DashboardLayout>
  );
}
