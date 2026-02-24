"use client";

import React, { useMemo } from "react";
import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Checkbox,
  Card,
  Button,
  Tooltip,
  Spin,
  Typography,
} from "antd";
import {
  LockOutlined,
  SaveOutlined,
  SendOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import type { Rule } from "antd/es/form";
import { isFieldLocked } from "@/lib/utils/reporting";
import { ReportStatus } from "@/lib/types";

const { TextArea } = Input;
const { Text } = Typography;

interface DynamicFormRendererProps {
  reportType: ReportType;
  initialData?: Record<string, unknown>;
  reportStatus?: ReportStatus;
  mode: "create" | "edit" | "view";
  loading?: boolean;
  isSaving?: boolean;
  lastSaved?: Date | null;
  onSave?: (formData: Record<string, unknown>) => void;
  onSubmit?: (formData: Record<string, unknown>) => void;
  onFormChange?: (formData: Record<string, unknown>) => void;
}

export default function DynamicFormRenderer({
  reportType,
  initialData,
  reportStatus = ReportStatus.DRAFT,
  mode,
  loading = false,
  isSaving = false,
  lastSaved,
  onSave,
  onSubmit,
  onFormChange,
}: DynamicFormRendererProps) {
  const [form] = Form.useForm();
  const formDefinition = reportType.formDefinition;

  const sortedSections = useMemo(() => {
    return [...formDefinition.sections].sort(
      (a, b) => a.displayOrder - b.displayOrder
    );
  }, [formDefinition.sections]);

  const renderField = (field: FormField): React.ReactNode => {
    const locked = isFieldLocked(
      field,
      reportStatus,
      initialData?.[field.name]
    );
    const disabled = locked || mode === "view";

    switch (field.type) {
      case "TEXT":
        return (
          <Input
            disabled={disabled}
            placeholder={field.placeholder}
            maxLength={200}
          />
        );

      case "NUMBER":
        return (
          <InputNumber
            disabled={disabled}
            min={field.minValue}
            max={field.maxValue}
            placeholder={field.placeholder}
            className="!w-full"
          />
        );

      case "DATE":
        return (
          <DatePicker
            disabled={disabled}
            className="!w-full"
            format="YYYY-MM-DD"
          />
        );

      case "SELECT":
        return (
          <Select
            disabled={disabled}
            placeholder={field.placeholder ?? "Select an option"}
            options={field.options?.map((opt) => ({
              label: opt.label,
              value: opt.value,
            }))}
            allowClear
          />
        );

      case "TEXTAREA":
        return (
          <TextArea
            rows={4}
            disabled={disabled}
            placeholder={field.placeholder}
            maxLength={2000}
            showCount
          />
        );

      case "CHECKBOX":
        return (
          <Checkbox disabled={disabled}>
            {field.placeholder ?? field.label}
          </Checkbox>
        );

      case "STRATEGIC_INDICATOR":
        return (
          <InputNumber
            disabled={disabled}
            min={field.minValue ?? 0}
            max={field.maxValue}
            placeholder={field.placeholder ?? "Enter value"}
            className="!w-full"
            addonAfter={field.helpText ? undefined : "%"}
          />
        );

      case "FILE_UPLOAD":
        return (
          <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center dark:border-gray-600">
            <Text type="secondary">
              File upload is available in production environment.
            </Text>
          </div>
        );

      case "MULTI_FILE_UPLOAD":
        return (
          <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center dark:border-gray-600">
            <Text type="secondary">
              Multi-file upload is available in production environment.
            </Text>
          </div>
        );

      default:
        return <Input disabled={disabled} placeholder={field.placeholder} />;
    }
  };

  const buildValidationRules = (field: FormField): Rule[] => {
    const rules: Rule[] = [];

    if (field.isRequired) {
      rules.push({
        required: true,
        message: `${field.label} is required`,
      });
    }

    if (field.type === "NUMBER" || field.type === "STRATEGIC_INDICATOR") {
      if (field.minValue !== undefined) {
        rules.push({
          type: "number",
          min: field.minValue,
          message: `Minimum value is ${field.minValue}`,
        });
      }
      if (field.maxValue !== undefined) {
        rules.push({
          type: "number",
          max: field.maxValue,
          message: `Maximum value is ${field.maxValue}`,
        });
      }
    }

    if (field.pattern) {
      rules.push({
        pattern: new RegExp(field.pattern),
        message: `${field.label} format is invalid`,
      });
    }

    return rules;
  };

  const handleValuesChange = () => {
    if (onFormChange && mode !== "view") {
      const values = form.getFieldsValue();
      onFormChange(values);
    }
  };

  const handleSave = () => {
    const values = form.getFieldsValue();
    onSave?.(values);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit?.(values);
    } catch {
      // Validation errors are shown on the form fields
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Form
        form={form}
        layout="vertical"
        initialValues={initialData ?? {}}
        onValuesChange={handleValuesChange}
        disabled={mode === "view"}
      >
        {sortedSections.map((section) => {
          const sortedFields = [...section.fields].sort(
            (a, b) => a.displayOrder - b.displayOrder
          );

          return (
            <Card
              key={section.id}
              title={section.title}
              className="mb-4"
              size="small"
            >
              {section.description && (
                <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
                  {section.description}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                {sortedFields.map((field) => {
                  const locked = isFieldLocked(
                    field,
                    reportStatus,
                    initialData?.[field.name]
                  );
                  const isFullWidth =
                    field.type === "TEXTAREA" ||
                    field.type === "FILE_UPLOAD" ||
                    field.type === "MULTI_FILE_UPLOAD";

                  return (
                    <div
                      key={field.id}
                      className={isFullWidth ? "md:col-span-2" : ""}
                    >
                      <Form.Item
                        name={field.name}
                        label={
                          <span className="flex items-center gap-1">
                            {field.label}
                            {locked && (
                              <Tooltip title="This field is locked">
                                <LockOutlined className="text-gray-400" />
                              </Tooltip>
                            )}
                            {field.helpText && (
                              <Tooltip title={field.helpText}>
                                <InfoCircleOutlined className="text-gray-400" />
                              </Tooltip>
                            )}
                          </span>
                        }
                        rules={buildValidationRules(field)}
                        valuePropName={
                          field.type === "CHECKBOX" ? "checked" : "value"
                        }
                      >
                        {renderField(field)}
                      </Form.Item>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </Form>

      {/* Action buttons */}
      {mode !== "view" && (
        <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {isSaving && (
              <span className="flex items-center gap-1">
                <Spin size="small" /> Saving...
              </span>
            )}
            {lastSaved && !isSaving && (
              <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
            )}
          </div>
          <div className="flex gap-3">
            {onSave && (
              <Button
                icon={<SaveOutlined />}
                onClick={handleSave}
                loading={isSaving}
              >
                Save Draft
              </Button>
            )}
            {onSubmit && (
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSubmit}
                className="!bg-green-600 hover:!bg-green-700"
              >
                Submit Report
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
