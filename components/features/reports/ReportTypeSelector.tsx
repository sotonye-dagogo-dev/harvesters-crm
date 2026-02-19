"use client";

import { useState, useEffect } from "react";
import { Card, Row, Col, Typography, Tag, Spin, Empty, Input } from "antd";
import {
  FileTextOutlined,
  CalendarOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  REPORT_FREQUENCY_LABELS,
  REPORT_CATEGORY_LABELS,
} from "@/lib/constants";

const { Title, Text, Paragraph } = Typography;

interface ReportTypeSelectorProps {
  onSelect: (reportType: ReportType) => void;
}

export default function ReportTypeSelector({
  onSelect,
}: ReportTypeSelectorProps) {
  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchReportTypes = async () => {
      try {
        const response = await fetch("/api/report-types");
        const data = await response.json();
        if (data.success) {
          setReportTypes(data.data ?? []);
        }
      } catch {
        // Error handled — empty state shown
      } finally {
        setLoading(false);
      }
    };
    fetchReportTypes();
  }, []);

  const filteredTypes = reportTypes.filter(
    (rt) =>
      rt.name.toLowerCase().includes(search.toLowerCase()) ||
      rt.code.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spin size="large" />
      </div>
    );
  }

  if (reportTypes.length === 0) {
    return (
      <Empty description="No report types available. Contact your administrator." />
    );
  }

  return (
    <div className="space-y-4">
      <Title level={4}>Select Report Type</Title>
      <Paragraph type="secondary">
        Choose the type of report you want to submit.
      </Paragraph>

      <Input
        placeholder="Search report types..."
        prefix={<SearchOutlined />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        allowClear
        className="max-w-md"
      />

      <Row gutter={[16, 16]}>
        {filteredTypes.map((rt) => (
          <Col key={rt.id} xs={24} sm={12} lg={8}>
            <Card
              hoverable
              className="h-full cursor-pointer transition-all hover:border-green-400 hover:shadow-md"
              onClick={() => onSelect(rt)}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg shrink-0">
                  <FileTextOutlined className="text-green-600 text-xl" />
                </div>
                <div className="min-w-0">
                  <Text strong className="block mb-1">
                    {rt.name}
                  </Text>
                  {rt.description && (
                    <Paragraph
                      type="secondary"
                      className="!mb-2 !text-xs"
                      ellipsis={{ rows: 2 }}
                    >
                      {rt.description}
                    </Paragraph>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag color="blue" className="!text-xs">
                      {REPORT_CATEGORY_LABELS[rt.category] ?? rt.category}
                    </Tag>
                    <Tag className="!text-xs flex items-center gap-1">
                      <CalendarOutlined />
                      {REPORT_FREQUENCY_LABELS[rt.frequency] ?? rt.frequency}
                    </Tag>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {filteredTypes.length === 0 && search && (
        <Empty description={`No report types matching "${search}"`} />
      )}
    </div>
  );
}
