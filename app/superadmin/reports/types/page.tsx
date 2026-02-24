"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import { useAuth } from "@/providers/AuthProvider";
import {
  Table,
  Button,
  Tag,
  Space,
  Typography,
  Spin,
  Empty,
  Popconfirm,
  Modal,
  Descriptions,
  Collapse,
  List,
  message,
} from "antd";
import { DeleteOutlined, EyeOutlined, ReloadOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  REPORT_CATEGORY_LABELS,
  REPORT_FREQUENCY_LABELS,
} from "@/lib/constants";

const { Title, Text } = Typography;

export default function SuperadminReportTypesPage() {
  const { user } = useAuth();
  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingType, setViewingType] = useState<ReportType | null>(null);

  const fetchReportTypes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/report-types");
      const data = await response.json();
      if (data.success) {
        setReportTypes(data.data ?? []);
      }
    } catch {
      message.error("Failed to load report types.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReportTypes();
  }, [fetchReportTypes]);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/report-types/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        message.success("Report type deleted.");
        fetchReportTypes();
      } else {
        message.error(data.error ?? "Failed to delete.");
      }
    } catch {
      message.error("Failed to delete report type.");
    }
  };

  const columns: ColumnsType<ReportType> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: string, record) => (
        <div>
          <Text strong>{name}</Text>
          <br />
          <Text type="secondary" className="text-xs">
            {record.code}
          </Text>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (cat: string) => (
        <Tag color="blue">{REPORT_CATEGORY_LABELS[cat] ?? cat}</Tag>
      ),
    },
    {
      title: "Frequency",
      dataIndex: "frequency",
      key: "frequency",
      render: (freq: string) => REPORT_FREQUENCY_LABELS[freq] ?? freq,
    },
    {
      title: "Fields",
      key: "fields",
      render: (_, record) => {
        const totalFields = record.formDefinition.sections.reduce(
          (sum, s) => sum + s.fields.length,
          0
        );
        return (
          <Text>
            {record.formDefinition.sections.length} sections, {totalFields}{" "}
            fields
          </Text>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (active: boolean) => (
        <Tag color={active ? "green" : "default"}>
          {active ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => setViewingType(record)}
          >
            View
          </Button>
          <Popconfirm
            title="Delete this report type?"
            description="All associated reports will be affected."
            onConfirm={() => handleDelete(record.id)}
            okText="Delete"
            cancelText="Cancel"
            okType="danger"
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <DashboardLayout role={user?.role}>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Title level={4} className="!mb-0">
            Report Types
          </Title>
          <Button icon={<ReloadOutlined />} onClick={fetchReportTypes}>
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spin size="large" />
          </div>
        ) : reportTypes.length === 0 ? (
          <Empty description="No report types configured." />
        ) : (
          <Table
            columns={columns}
            dataSource={reportTypes}
            rowKey="id"
            pagination={{ pageSize: 10, showTotal: (t) => `${t} types` }}
            scroll={{ x: 900 }}
            size="middle"
          />
        )}
      </div>

      {/* Report Type Detail Modal */}
      <Modal
        title={viewingType?.name ?? "Report Type Details"}
        open={!!viewingType}
        onCancel={() => setViewingType(null)}
        footer={<Button onClick={() => setViewingType(null)}>Close</Button>}
        width={720}
      >
        {viewingType && (
          <div className="space-y-4">
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="Code">
                {viewingType.code}
              </Descriptions.Item>
              <Descriptions.Item label="Category">
                <Tag color="blue">
                  {REPORT_CATEGORY_LABELS[viewingType.category] ??
                    viewingType.category}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Frequency">
                {REPORT_FREQUENCY_LABELS[viewingType.frequency] ??
                  viewingType.frequency}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={viewingType.isActive ? "green" : "default"}>
                  {viewingType.isActive ? "Active" : "Inactive"}
                </Tag>
              </Descriptions.Item>
              {viewingType.description && (
                <Descriptions.Item label="Description" span={2}>
                  {viewingType.description}
                </Descriptions.Item>
              )}
              {viewingType.organizationalLevel && (
                <Descriptions.Item label="Org Level">
                  {viewingType.organizationalLevel}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Title level={5} className="!mt-4 !mb-2">
              Form Sections & Fields
            </Title>
            <Collapse
              items={viewingType.formDefinition.sections.map(
                (section, sIdx) => ({
                  key: section.id,
                  label: (
                    <span>
                      <Text strong>{section.title}</Text>
                      <Text type="secondary" className="ml-2">
                        ({section.fields.length} field
                        {section.fields.length !== 1 ? "s" : ""})
                      </Text>
                    </span>
                  ),
                  children: (
                    <List
                      size="small"
                      dataSource={section.fields}
                      renderItem={(field, fIdx) => (
                        <List.Item>
                          <List.Item.Meta
                            title={
                              <span>
                                {field.label}
                                {field.isRequired && (
                                  <Tag color="red" className="ml-2">
                                    Required
                                  </Tag>
                                )}
                              </span>
                            }
                            description={
                              <Space size="small" wrap>
                                <Tag>{field.type}</Tag>
                                {field.helpText && (
                                  <Text type="secondary" className="text-xs">
                                    {field.helpText}
                                  </Text>
                                )}
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  ),
                })
              )}
              defaultActiveKey={
                viewingType.formDefinition.sections.length > 0
                  ? [viewingType.formDefinition.sections[0].id]
                  : []
              }
            />

            {viewingType.allowedSubmitterRoles &&
              viewingType.allowedSubmitterRoles.length > 0 && (
                <div>
                  <Text strong>Allowed Submitters: </Text>
                  {viewingType.allowedSubmitterRoles.map((role) => (
                    <Tag key={role} color="purple" className="mt-1">
                      {role}
                    </Tag>
                  ))}
                </div>
              )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
