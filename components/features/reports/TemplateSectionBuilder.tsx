"use client";

import { useState, useCallback } from "react";
import {
  Card,
  Button,
  Input,
  Select,
  Switch,
  Space,
  Typography,
  Collapse,
  Popconfirm,
  Form,
  Modal,
  InputNumber,
  Tag,
  Empty,
  Tooltip,
} from "antd";
import Table from "@/components/ui/Table";
import { TextArea } from "@/components/ui/Input";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CopyOutlined,
  AppstoreAddOutlined,
} from "@ant-design/icons";
import { MetricFieldType } from "@/lib/types";
import {
  METRIC_FIELD_TYPE_LABELS,
  REPORT_VALIDATION,
} from "@/lib/constants/reports";

const { Text, Title } = Typography;

// ============================================================================
// Types
// ============================================================================

interface MetricInput {
  key: string; // local key for React
  name: string;
  description?: string;
  fieldType: MetricFieldType;
  isRequired: boolean;
  capturesGoal: boolean;
  capturesAchieved: boolean;
  capturesYoY: boolean;
  minValue?: number;
  maxValue?: number;
  order: number;
}

interface SubSectionInput {
  key: string;
  name: string;
  description?: string;
  order: number;
  metrics: MetricInput[];
}

interface SectionInput {
  key: string;
  name: string;
  description?: string;
  order: number;
  isRequired: boolean;
  metrics: MetricInput[];
  subSections: SubSectionInput[];
}

interface TemplateSectionBuilderProps {
  /** Initial sections (for editing existing templates) */
  initialSections?: SectionInput[];
  /** Called whenever sections change */
  onChange: (sections: SectionInput[]) => void;
  /** Whether the builder is read-only */
  readOnly?: boolean;
}

export type { MetricInput, SubSectionInput, SectionInput };

// ============================================================================
// Helpers
// ============================================================================

let keyCounter = 0;
function nextKey(prefix: string) {
  keyCounter += 1;
  return `${prefix}-${keyCounter}-${Date.now()}`;
}

function makeDefaultMetric(order: number): MetricInput {
  return {
    key: nextKey("metric"),
    name: "",
    fieldType: MetricFieldType.NUMBER,
    isRequired: true,
    capturesGoal: true,
    capturesAchieved: true,
    capturesYoY: true,
    order,
  };
}

function makeDefaultSubSection(order: number): SubSectionInput {
  return {
    key: nextKey("subsec"),
    name: "",
    order,
    metrics: [makeDefaultMetric(1)],
  };
}

function makeDefaultSection(order: number): SectionInput {
  return {
    key: nextKey("sec"),
    name: "",
    order,
    isRequired: true,
    metrics: [makeDefaultMetric(1)],
    subSections: [],
  };
}

// ============================================================================
// Metric Editor Modal
// ============================================================================

interface MetricModalProps {
  open: boolean;
  metric: MetricInput | null;
  onSave: (metric: MetricInput) => void;
  onCancel: () => void;
}

function MetricEditorModal({
  open,
  metric,
  onSave,
  onCancel,
}: MetricModalProps) {
  const [form] = Form.useForm();

  const handleOpen = useCallback(() => {
    if (metric) {
      form.setFieldsValue({
        name: metric.name,
        description: metric.description ?? "",
        fieldType: metric.fieldType,
        isRequired: metric.isRequired,
        capturesGoal: metric.capturesGoal,
        capturesAchieved: metric.capturesAchieved,
        capturesYoY: metric.capturesYoY,
        minValue: metric.minValue,
        maxValue: metric.maxValue,
      });
    } else {
      form.resetFields();
    }
  }, [metric, form]);

  return (
    <Modal
      title={metric?.name ? `Edit Metric: ${metric.name}` : "Add Metric"}
      open={open}
      onCancel={onCancel}
      afterOpenChange={(visible) => {
        if (visible) handleOpen();
      }}
      footer={null}
      width={560}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => {
          if (!metric) return;
          onSave({
            ...metric,
            name: values.name,
            description: values.description || undefined,
            fieldType: values.fieldType,
            isRequired: values.isRequired ?? true,
            capturesGoal: values.capturesGoal ?? true,
            capturesAchieved: values.capturesAchieved ?? true,
            capturesYoY: values.capturesYoY ?? true,
            minValue: values.minValue,
            maxValue: values.maxValue,
          });
        }}
        initialValues={{
          fieldType: MetricFieldType.NUMBER,
          isRequired: true,
          capturesGoal: true,
          capturesAchieved: true,
          capturesYoY: true,
        }}
      >
        <Form.Item
          name="name"
          label="Metric Name"
          rules={[{ required: true, message: "Enter metric name" }]}
        >
          <Input placeholder="e.g., Sunday Service Attendance" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <TextArea
            rows={2}
            placeholder="Brief description of this metric"
          />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item name="fieldType" label="Field Type">
            <Select
              options={Object.entries(METRIC_FIELD_TYPE_LABELS).map(
                ([value, label]) => ({ value, label })
              )}
            />
          </Form.Item>

          <Form.Item name="isRequired" label="Required" valuePropName="checked">
            <Switch />
          </Form.Item>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Form.Item
            name="capturesGoal"
            label="Captures Goal"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="capturesAchieved"
            label="Captures Achieved"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="capturesYoY"
            label="Captures YoY"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item name="minValue" label="Min Value">
            <InputNumber className="w-full" placeholder="Optional" />
          </Form.Item>
          <Form.Item name="maxValue" label="Max Value">
            <InputNumber className="w-full" placeholder="Optional" />
          </Form.Item>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            {metric?.name ? "Update Metric" : "Add Metric"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

// ============================================================================
// Metrics Table (used in sections and sub-sections)
// ============================================================================

interface MetricTableProps {
  metrics: MetricInput[];
  onEdit: (metric: MetricInput) => void;
  onDelete: (key: string) => void;
  onMoveUp: (key: string) => void;
  onMoveDown: (key: string) => void;
  onAdd: () => void;
  readOnly?: boolean;
  maxMetrics?: number;
}

function MetricTable({
  metrics,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  onAdd,
  readOnly = false,
  maxMetrics = REPORT_VALIDATION.MAX_SECTION_METRICS,
}: MetricTableProps) {
  const sorted = [...metrics].sort((a, b) => a.order - b.order);

  const columns = [
    {
      title: "#",
      key: "order",
      width: 50,
      render: (_: unknown, __: MetricInput, idx: number) => (
        <Text className="text-ds-text-subtle">{idx + 1}</Text>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: string) => (
        <Text className={!name ? "text-ds-status-error italic" : ""}>
          {name || "Unnamed metric"}
        </Text>
      ),
    },
    {
      title: "Type",
      dataIndex: "fieldType",
      key: "fieldType",
      width: 110,
      render: (ft: MetricFieldType) => (
        <Tag>{METRIC_FIELD_TYPE_LABELS[ft] || ft}</Tag>
      ),
    },
    {
      title: "Required",
      dataIndex: "isRequired",
      key: "isRequired",
      width: 80,
      render: (v: boolean) => (v ? <Tag color="blue">Yes</Tag> : <Tag>No</Tag>),
    },
    {
      title: "Goal",
      dataIndex: "capturesGoal",
      key: "capturesGoal",
      width: 60,
      render: (v: boolean) => (v ? "✓" : "—"),
    },
    {
      title: "Achieved",
      dataIndex: "capturesAchieved",
      key: "capturesAchieved",
      width: 80,
      render: (v: boolean) => (v ? "✓" : "—"),
    },
    {
      title: "YoY",
      dataIndex: "capturesYoY",
      key: "capturesYoY",
      width: 50,
      render: (v: boolean) => (v ? "✓" : "—"),
    },
    ...(!readOnly
      ? [
          {
            title: "Actions",
            key: "actions",
            width: 160,
            render: (_: unknown, record: MetricInput, idx: number) => (
              <Space size="small">
                <Tooltip title="Edit">
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => onEdit(record)}
                  />
                </Tooltip>
                <Tooltip title="Move Up">
                  <Button
                    type="text"
                    size="small"
                    icon={<ArrowUpOutlined />}
                    disabled={idx === 0}
                    onClick={() => onMoveUp(record.key)}
                  />
                </Tooltip>
                <Tooltip title="Move Down">
                  <Button
                    type="text"
                    size="small"
                    icon={<ArrowDownOutlined />}
                    disabled={idx === sorted.length - 1}
                    onClick={() => onMoveDown(record.key)}
                  />
                </Tooltip>
                <Popconfirm
                  title="Delete this metric?"
                  onConfirm={() => onDelete(record.key)}
                >
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                  />
                </Popconfirm>
              </Space>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col gap-2">
      <Table
        dataSource={sorted}
        columns={columns}
        rowKey="key"
        size="small"
        pagination={false}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No metrics yet"
            />
          ),
        }}
      />
      {!readOnly && (
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={onAdd}
          disabled={metrics.length >= maxMetrics}
          className="w-full"
        >
          Add Metric{" "}
          {metrics.length >= maxMetrics && `(max ${maxMetrics} reached)`}
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function TemplateSectionBuilder({
  initialSections,
  onChange,
  readOnly = false,
}: TemplateSectionBuilderProps) {
  const [sections, setSections] = useState<SectionInput[]>(() =>
    initialSections && initialSections.length > 0
      ? initialSections
      : [makeDefaultSection(1)]
  );

  // Metric editor modal state
  const [editingMetric, setEditingMetric] = useState<{
    metric: MetricInput;
    sectionKey: string;
    subSectionKey?: string;
  } | null>(null);

  // Propagate changes
  const updateSections = useCallback(
    (updater: (prev: SectionInput[]) => SectionInput[]) => {
      setSections((prev) => {
        const next = updater(prev);
        onChange(next);
        return next;
      });
    },
    [onChange]
  );

  // ---- Section CRUD ----
  const addSection = () => {
    const maxOrder = sections.reduce((max, s) => Math.max(max, s.order), 0);
    updateSections((prev) => [...prev, makeDefaultSection(maxOrder + 1)]);
  };

  const removeSection = (key: string) => {
    updateSections((prev) =>
      prev
        .filter((s) => s.key !== key)
        .map((s, idx) => ({ ...s, order: idx + 1 }))
    );
  };

  const updateSection = (key: string, patch: Partial<SectionInput>) => {
    updateSections((prev) =>
      prev.map((s) => (s.key === key ? { ...s, ...patch } : s))
    );
  };

  const moveSectionUp = (key: string) => {
    updateSections((prev) => {
      const idx = prev.findIndex((s) => s.key === key);
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next.map((s, i) => ({ ...s, order: i + 1 }));
    });
  };

  const moveSectionDown = (key: string) => {
    updateSections((prev) => {
      const idx = prev.findIndex((s) => s.key === key);
      if (idx < 0 || idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next.map((s, i) => ({ ...s, order: i + 1 }));
    });
  };

  const duplicateSection = (key: string) => {
    updateSections((prev) => {
      const source = prev.find((s) => s.key === key);
      if (!source) return prev;
      const maxOrder = prev.reduce((max, s) => Math.max(max, s.order), 0);
      const newSection: SectionInput = {
        ...source,
        key: nextKey("sec"),
        name: `${source.name} (Copy)`,
        order: maxOrder + 1,
        metrics: source.metrics.map((m) => ({
          ...m,
          key: nextKey("metric"),
        })),
        subSections: source.subSections.map((ss) => ({
          ...ss,
          key: nextKey("subsec"),
          metrics: ss.metrics.map((m) => ({
            ...m,
            key: nextKey("metric"),
          })),
        })),
      };
      return [...prev, newSection];
    });
  };

  // ---- SubSection CRUD ----
  const addSubSection = (sectionKey: string) => {
    updateSections((prev) =>
      prev.map((s) => {
        if (s.key !== sectionKey) return s;
        const maxOrder = s.subSections.reduce(
          (max, ss) => Math.max(max, ss.order),
          0
        );
        return {
          ...s,
          subSections: [...s.subSections, makeDefaultSubSection(maxOrder + 1)],
        };
      })
    );
  };

  const removeSubSection = (sectionKey: string, subKey: string) => {
    updateSections((prev) =>
      prev.map((s) => {
        if (s.key !== sectionKey) return s;
        return {
          ...s,
          subSections: s.subSections
            .filter((ss) => ss.key !== subKey)
            .map((ss, idx) => ({ ...ss, order: idx + 1 })),
        };
      })
    );
  };

  const updateSubSection = (
    sectionKey: string,
    subKey: string,
    patch: Partial<SubSectionInput>
  ) => {
    updateSections((prev) =>
      prev.map((s) => {
        if (s.key !== sectionKey) return s;
        return {
          ...s,
          subSections: s.subSections.map((ss) =>
            ss.key === subKey ? { ...ss, ...patch } : ss
          ),
        };
      })
    );
  };

  // ---- Metric CRUD (Section-level) ----
  const addSectionMetric = (sectionKey: string) => {
    const section = sections.find((s) => s.key === sectionKey);
    if (!section) return;
    const maxOrder = section.metrics.reduce(
      (max, m) => Math.max(max, m.order),
      0
    );
    const newMetric = makeDefaultMetric(maxOrder + 1);
    setEditingMetric({ metric: newMetric, sectionKey });
  };

  const deleteSectionMetric = (sectionKey: string, metricKey: string) => {
    updateSections((prev) =>
      prev.map((s) => {
        if (s.key !== sectionKey) return s;
        return {
          ...s,
          metrics: s.metrics
            .filter((m) => m.key !== metricKey)
            .map((m, idx) => ({ ...m, order: idx + 1 })),
        };
      })
    );
  };

  const moveSectionMetric = (
    sectionKey: string,
    metricKey: string,
    direction: "up" | "down"
  ) => {
    updateSections((prev) =>
      prev.map((s) => {
        if (s.key !== sectionKey) return s;
        const sorted = [...s.metrics].sort((a, b) => a.order - b.order);
        const idx = sorted.findIndex((m) => m.key === metricKey);
        if (direction === "up" && idx > 0) {
          [sorted[idx - 1], sorted[idx]] = [sorted[idx], sorted[idx - 1]];
        } else if (direction === "down" && idx < sorted.length - 1) {
          [sorted[idx], sorted[idx + 1]] = [sorted[idx + 1], sorted[idx]];
        }
        return {
          ...s,
          metrics: sorted.map((m, i) => ({ ...m, order: i + 1 })),
        };
      })
    );
  };

  // ---- Metric CRUD (SubSection-level) ----
  const addSubSectionMetric = (sectionKey: string, subSectionKey: string) => {
    const section = sections.find((s) => s.key === sectionKey);
    const sub = section?.subSections.find((ss) => ss.key === subSectionKey);
    if (!sub) return;
    const maxOrder = sub.metrics.reduce((max, m) => Math.max(max, m.order), 0);
    const newMetric = makeDefaultMetric(maxOrder + 1);
    setEditingMetric({
      metric: newMetric,
      sectionKey,
      subSectionKey,
    });
  };

  const deleteSubSectionMetric = (
    sectionKey: string,
    subKey: string,
    metricKey: string
  ) => {
    updateSections((prev) =>
      prev.map((s) => {
        if (s.key !== sectionKey) return s;
        return {
          ...s,
          subSections: s.subSections.map((ss) => {
            if (ss.key !== subKey) return ss;
            return {
              ...ss,
              metrics: ss.metrics
                .filter((m) => m.key !== metricKey)
                .map((m, idx) => ({ ...m, order: idx + 1 })),
            };
          }),
        };
      })
    );
  };

  const moveSubSectionMetric = (
    sectionKey: string,
    subKey: string,
    metricKey: string,
    direction: "up" | "down"
  ) => {
    updateSections((prev) =>
      prev.map((s) => {
        if (s.key !== sectionKey) return s;
        return {
          ...s,
          subSections: s.subSections.map((ss) => {
            if (ss.key !== subKey) return ss;
            const sorted = [...ss.metrics].sort((a, b) => a.order - b.order);
            const idx = sorted.findIndex((m) => m.key === metricKey);
            if (direction === "up" && idx > 0) {
              [sorted[idx - 1], sorted[idx]] = [sorted[idx], sorted[idx - 1]];
            } else if (direction === "down" && idx < sorted.length - 1) {
              [sorted[idx], sorted[idx + 1]] = [sorted[idx + 1], sorted[idx]];
            }
            return {
              ...ss,
              metrics: sorted.map((m, i) => ({
                ...m,
                order: i + 1,
              })),
            };
          }),
        };
      })
    );
  };

  // ---- Metric modal save ----
  const handleMetricSave = (metric: MetricInput) => {
    if (!editingMetric) return;
    const { sectionKey, subSectionKey } = editingMetric;

    updateSections((prev) =>
      prev.map((s) => {
        if (s.key !== sectionKey) return s;

        if (subSectionKey) {
          return {
            ...s,
            subSections: s.subSections.map((ss) => {
              if (ss.key !== subSectionKey) return ss;
              const exists = ss.metrics.some((m) => m.key === metric.key);
              return {
                ...ss,
                metrics: exists
                  ? ss.metrics.map((m) => (m.key === metric.key ? metric : m))
                  : [...ss.metrics, metric],
              };
            }),
          };
        }

        const exists = s.metrics.some((m) => m.key === metric.key);
        return {
          ...s,
          metrics: exists
            ? s.metrics.map((m) => (m.key === metric.key ? metric : m))
            : [...s.metrics, metric],
        };
      })
    );

    setEditingMetric(null);
  };

  // ---- Render ----
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Title level={5} className="!mb-0">
          Template Sections ({sections.length})
        </Title>
        {!readOnly && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={addSection}
            disabled={
              sections.length >= REPORT_VALIDATION.MAX_TEMPLATE_SECTIONS
            }
          >
            Add Section
          </Button>
        )}
      </div>

      {sections.length === 0 && (
        <Empty
          description="No sections defined. Add a section to get started."
          className="py-8"
        >
          {!readOnly && (
            <Button type="primary" icon={<PlusOutlined />} onClick={addSection}>
              Add First Section
            </Button>
          )}
        </Empty>
      )}

      <Collapse
        accordion={false}
        defaultActiveKey={sortedSections.map((s) => s.key)}
        items={sortedSections.map((section, sIdx) => ({
          key: section.key,
          label: (
            <div className="flex items-center justify-between w-full pr-4">
              <div className="flex items-center gap-2">
                <Tag className="text-xs">{sIdx + 1}</Tag>
                <Text className="font-medium">
                  {section.name || "Unnamed Section"}
                </Text>
                {section.isRequired && (
                  <Tag color="blue" className="text-xs">
                    Required
                  </Tag>
                )}
                <Text className="text-xs text-ds-text-subtle">
                  {section.metrics.length +
                    section.subSections.reduce(
                      (sum, ss) => sum + ss.metrics.length,
                      0
                    )}{" "}
                  metrics
                  {section.subSections.length > 0 &&
                    `, ${section.subSections.length} sub-sections`}
                </Text>
              </div>

              {!readOnly && (
                <Space size="small" onClick={(e) => e.stopPropagation()}>
                  <Tooltip title="Move Up">
                    <Button
                      type="text"
                      size="small"
                      icon={<ArrowUpOutlined />}
                      disabled={sIdx === 0}
                      onClick={() => moveSectionUp(section.key)}
                    />
                  </Tooltip>
                  <Tooltip title="Move Down">
                    <Button
                      type="text"
                      size="small"
                      icon={<ArrowDownOutlined />}
                      disabled={sIdx === sortedSections.length - 1}
                      onClick={() => moveSectionDown(section.key)}
                    />
                  </Tooltip>
                  <Tooltip title="Duplicate">
                    <Button
                      type="text"
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={() => duplicateSection(section.key)}
                    />
                  </Tooltip>
                  <Popconfirm
                    title="Delete this section and all its metrics?"
                    onConfirm={() => removeSection(section.key)}
                  >
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                    />
                  </Popconfirm>
                </Space>
              )}
            </div>
          ),
          children: (
            <div className="flex flex-col gap-4">
              {/* Section fields */}
              {!readOnly && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Text className="text-xs text-ds-text-subtle">Section Name</Text>
                    <Input
                      value={section.name}
                      onChange={(e) =>
                        updateSection(section.key, {
                          name: e.target.value,
                        })
                      }
                      placeholder="e.g., Attendance & Quality of Program"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Text className="text-xs text-ds-text-subtle">Description</Text>
                    <TextArea
                      value={section.description ?? ""}
                      onChange={(e) =>
                        updateSection(section.key, {
                          description: e.target.value || undefined,
                        })
                      }
                      rows={1}
                      placeholder="Brief description"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-center gap-2 col-span-full">
                    <Switch
                      checked={section.isRequired}
                      onChange={(checked) =>
                        updateSection(section.key, {
                          isRequired: checked,
                        })
                      }
                      size="small"
                    />
                    <Text className="text-sm">Required section</Text>
                  </div>
                </div>
              )}

              {/* Section-level metrics */}
              <div>
                <Text strong className="text-sm">
                  Section Metrics
                </Text>
                <MetricTable
                  metrics={section.metrics}
                  onEdit={(m) =>
                    setEditingMetric({
                      metric: m,
                      sectionKey: section.key,
                    })
                  }
                  onDelete={(key) => deleteSectionMetric(section.key, key)}
                  onMoveUp={(key) => moveSectionMetric(section.key, key, "up")}
                  onMoveDown={(key) =>
                    moveSectionMetric(section.key, key, "down")
                  }
                  onAdd={() => addSectionMetric(section.key)}
                  readOnly={readOnly}
                />
              </div>

              {/* Sub-sections */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Text strong className="text-sm">
                    Sub-Sections ({section.subSections.length})
                  </Text>
                  {!readOnly && (
                    <Button
                      type="dashed"
                      size="small"
                      icon={<AppstoreAddOutlined />}
                      onClick={() => addSubSection(section.key)}
                      disabled={
                        section.subSections.length >=
                        REPORT_VALIDATION.MAX_SUB_SECTIONS
                      }
                    >
                      Add Sub-Section
                    </Button>
                  )}
                </div>

                {section.subSections
                  .sort((a, b) => a.order - b.order)
                  .map((sub) => (
                    <Card
                      key={sub.key}
                      size="small"
                      className="mb-3 bg-ds-surface-sunken"
                      title={
                        !readOnly ? (
                          <Input
                            value={sub.name}
                            onChange={(e) =>
                              updateSubSection(section.key, sub.key, {
                                name: e.target.value,
                              })
                            }
                            placeholder="Sub-section name"
                            variant="borderless"
                            className="font-medium"
                          />
                        ) : (
                          <Text className="font-medium">
                            {sub.name || "Unnamed Sub-Section"}
                          </Text>
                        )
                      }
                      extra={
                        !readOnly && (
                          <Popconfirm
                            title="Delete this sub-section?"
                            onConfirm={() =>
                              removeSubSection(section.key, sub.key)
                            }
                          >
                            <Button
                              type="text"
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                            />
                          </Popconfirm>
                        )
                      }
                    >
                      {!readOnly && (
                        <div className="mb-3">
                          <Text className="text-xs text-ds-text-subtle">
                            Description
                          </Text>
                          <TextArea
                            value={sub.description ?? ""}
                            onChange={(e) =>
                              updateSubSection(section.key, sub.key, {
                                description: e.target.value || undefined,
                              })
                            }
                            rows={1}
                            placeholder="Brief description"
                            className="mt-1"
                          />
                        </div>
                      )}

                      <MetricTable
                        metrics={sub.metrics}
                        onEdit={(m) =>
                          setEditingMetric({
                            metric: m,
                            sectionKey: section.key,
                            subSectionKey: sub.key,
                          })
                        }
                        onDelete={(key) =>
                          deleteSubSectionMetric(section.key, sub.key, key)
                        }
                        onMoveUp={(key) =>
                          moveSubSectionMetric(section.key, sub.key, key, "up")
                        }
                        onMoveDown={(key) =>
                          moveSubSectionMetric(
                            section.key,
                            sub.key,
                            key,
                            "down"
                          )
                        }
                        onAdd={() => addSubSectionMetric(section.key, sub.key)}
                        readOnly={readOnly}
                      />
                    </Card>
                  ))}
              </div>
            </div>
          ),
        }))}
      />

      {!readOnly && sections.length > 0 && (
        <Button
          type="dashed"
          size="large"
          icon={<PlusOutlined />}
          onClick={addSection}
          disabled={sections.length >= REPORT_VALIDATION.MAX_TEMPLATE_SECTIONS}
          className="w-full"
        >
          Add Another Section
        </Button>
      )}

      {/* Metric editor modal */}
      <MetricEditorModal
        open={!!editingMetric}
        metric={editingMetric?.metric ?? null}
        onSave={handleMetricSave}
        onCancel={() => setEditingMetric(null)}
      />
    </div>
  );
}
