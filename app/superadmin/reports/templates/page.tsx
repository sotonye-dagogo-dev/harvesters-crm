"use client";

import { useEffect, useState, useCallback } from "react";
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
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useAuth } from "@/providers/AuthProvider";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";

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

export default function SuperadminTemplatesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const role = user?.role;

  const [templates, setTemplates] = useState<TemplateListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [form] = Form.useForm();

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

  const handleCreate = async (values: { name: string; description?: string; isDefault: boolean }) => {
    setCreateLoading(true);
    try {
      // Create a basic template with a single section — the superadmin can edit it later
      const res = await fetch("/api/report-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          description: values.description,
          isDefault: values.isDefault,
          sections: [
            {
              name: "General Section",
              order: 0,
              isRequired: true,
              metrics: [
                {
                  name: "Attendance",
                  fieldType: "NUMBER",
                  isRequired: true,
                  order: 0,
                  capturesGoal: true,
                  capturesAchieved: true,
                  capturesYoY: false,
                },
              ],
            },
          ],
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create template");
      }
      message.success("Template created successfully");
      setCreateModalOpen(false);
      form.resetFields();
      fetchTemplates();
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Failed to create template");
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
          const res = await fetch(`/api/report-templates/${id}`, { method: "DELETE" });
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
          {r.isDefault && <Tag color="blue" className="ml-2">Default</Tag>}
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
      sorter: (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 180,
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
        <div className="flex justify-center items-center h-64"><Spin size="large" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={role}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Title level={3} className="!mb-0">Report Templates</Title>
            <Text className="text-gray-500">Manage the structure and sections of report templates</Text>
          </div>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchTemplates}>Refresh</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
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

      {/* Create Template Modal */}
      <Modal
        title="Create New Template"
        open={createModalOpen}
        onCancel={() => { setCreateModalOpen(false); form.resetFields(); }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            name="name"
            label="Template Name"
            rules={[
              { required: true, message: "Please enter a template name" },
              { min: 3, message: "Name must be at least 3 characters" },
            ]}
          >
            <Input placeholder="e.g., Monthly Campus Report" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Brief description of this template" />
          </Form.Item>
          <Form.Item name="isDefault" label="Set as Default" valuePropName="checked" initialValue={false}>
            <Switch />
          </Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={() => { setCreateModalOpen(false); form.resetFields(); }}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={createLoading}>Create</Button>
          </div>
        </Form>
      </Modal>
    </DashboardLayout>
  );
}
