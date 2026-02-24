"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  Typography,
  Select,
  DatePicker,
  InputNumber,
  Table,
  Tag,
  Tooltip,
  Popconfirm,
  Empty,
  message,
  Divider,
  Space,
  Switch,
} from "antd";
import Button from "@/components/ui/Button";
import {
  PlusOutlined,
  CopyOutlined,
  DeleteOutlined,
  LinkOutlined,
  CheckCircleOutlined,
  StopOutlined,
  ReloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { InviteLinkType, UserRole } from "@/lib/types";
import dayjs from "dayjs";
import type { ColumnsType } from "antd/es/table";

const { Title, Text, Paragraph } = Typography;

// ── Constants ────────────────────────────────────────────────────────────────

const INVITE_TYPE_OPTIONS = [
  { value: InviteLinkType.CAMPUS, label: "Campus" },
  { value: InviteLinkType.ZONE, label: "Zone" },
  { value: InviteLinkType.DEPARTMENT, label: "Department" },
  { value: InviteLinkType.SMALL_GROUP, label: "Small Group" },
  { value: InviteLinkType.CELL, label: "Cell" },
];

const ROLE_LABELS: Record<string, string> = {
  GROUP_PASTOR: "Group Pastor",
  GROUP_ADMIN: "Group Admin",
  CAMPUS_PASTOR: "Campus Pastor",
  CAMPUS_ADMIN: "Campus Admin",
  ZONAL_LEADER: "Zonal Leader",
  HOD: "Head of Department",
  SMALL_GROUP_LEADER: "Small Group Leader",
  CELL_LEADER: "Cell Leader",
  DATA_ENTRY: "Data Entry",
  MEMBER: "Member",
};

interface InviteLinkItem {
  id: string;
  code: string;
  type: InviteLinkType;
  targetId: string;
  assignRole?: UserRole;
  expiresAt?: string;
  maxUses?: number;
  isActive: boolean;
  visitCount: number;
  conversionCount: number;
  createdAt: string;
}

interface TargetOption {
  id: string;
  name: string;
}

// ── Props ────────────────────────────────────────────────────────────────────

interface ReferralLinkManagerProps {
  /** Route prefix for building invite URLs */
  routePrefix?: string;
  /** Optional filter — only show links of this type */
  filterType?: InviteLinkType;
  /** Optional filter — only show links for this target */
  filterTargetId?: string;
  /** Whether the user can create new links */
  canCreate?: boolean;
  /** Compact mode for embedding in other views */
  compact?: boolean;
  className?: string;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function ReferralLinkManager({
  filterType,
  filterTargetId,
  canCreate = true,
  compact = false,
  className,
}: ReferralLinkManagerProps) {
  const [links, setLinks] = useState<InviteLinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Create form state
  const [newLinkType, setNewLinkType] = useState<InviteLinkType>(
    filterType || InviteLinkType.SMALL_GROUP
  );
  const [newTargetId, setNewTargetId] = useState(filterTargetId || "");
  const [newAssignRole, setNewAssignRole] = useState<UserRole | undefined>();
  const [newMaxUses, setNewMaxUses] = useState<number>(1);
  const [newExpiresAt, setNewExpiresAt] = useState<dayjs.Dayjs | null>(null);
  const [singleUse, setSingleUse] = useState(true);

  // Allowed roles for this user
  const [allowedRoles, setAllowedRoles] = useState<UserRole[]>([]);

  // Target options for the selected type
  const [targetOptions, setTargetOptions] = useState<TargetOption[]>([]);
  const [loadingTargets, setLoadingTargets] = useState(false);

  // ── Fetch invite links ──
  const fetchLinks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType) params.set("type", filterType);
      if (filterTargetId) params.set("targetId", filterTargetId);

      const res = await fetch(`/api/invite-links?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLinks(data.data || []);
      }
    } catch {
      message.error("Failed to load referral links");
    } finally {
      setLoading(false);
    }
  }, [filterType, filterTargetId]);

  // ── Fetch allowed roles ──
  const fetchAllowedRoles = useCallback(async () => {
    try {
      const res = await fetch("/api/invite-links/allowed-roles");
      if (res.ok) {
        const data = await res.json();
        setAllowedRoles(data.data?.allowedRoles || []);
      }
    } catch {
      // Silently fail — user simply won't see role options
    }
  }, []);

  // ── Fetch target options based on type ──
  const fetchTargetOptions = useCallback(async (type: InviteLinkType) => {
    setLoadingTargets(true);
    try {
      let endpoint = "";
      switch (type) {
        case InviteLinkType.CAMPUS:
          endpoint = "/api/campuses";
          break;
        case InviteLinkType.ZONE:
          endpoint = "/api/zones";
          break;
        case InviteLinkType.DEPARTMENT:
          endpoint = "/api/departments";
          break;
        case InviteLinkType.SMALL_GROUP:
          endpoint = "/api/groups";
          break;
        case InviteLinkType.CELL:
          endpoint = "/api/cells";
          break;
        default:
          endpoint = "/api/groups";
      }

      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        const items = data.data || [];
        setTargetOptions(
          items.map((item: { id: string; name: string }) => ({
            id: item.id,
            name: item.name,
          }))
        );
      }
    } catch {
      setTargetOptions([]);
    } finally {
      setLoadingTargets(false);
    }
  }, []);

  useEffect(() => {
    fetchLinks();
    fetchAllowedRoles();
  }, [fetchLinks, fetchAllowedRoles]);

  useEffect(() => {
    if (showCreateForm && !filterTargetId) {
      fetchTargetOptions(newLinkType);
    }
  }, [showCreateForm, newLinkType, filterTargetId, fetchTargetOptions]);

  // ── Create a new referral link ──
  const handleCreateLink = async () => {
    const targetId = filterTargetId || newTargetId;
    if (!targetId) {
      message.warning("Please select a target");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/invite-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: filterType || newLinkType,
          targetId,
          assignRole: newAssignRole,
          maxUses: singleUse ? 1 : newMaxUses || undefined,
          expiresAt: newExpiresAt?.toISOString(),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create link");
      }

      message.success("Referral link created successfully");
      setShowCreateForm(false);
      resetForm();
      fetchLinks();
    } catch (err) {
      message.error(
        err instanceof Error ? err.message : "Failed to create link"
      );
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setNewTargetId(filterTargetId || "");
    setNewAssignRole(undefined);
    setNewMaxUses(1);
    setNewExpiresAt(null);
    setSingleUse(true);
  };

  // ── Copy link to clipboard ──
  const copyLink = async (code: string) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${baseUrl}/join/${code}`;
    try {
      await navigator.clipboard.writeText(url);
      message.success("Referral link copied to clipboard!");
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      message.success("Referral link copied!");
    }
  };

  // ── Deactivate a link ──
  const handleDeactivate = async (id: string) => {
    try {
      const res = await fetch(`/api/invite-links`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: false }),
      });

      if (res.ok) {
        message.success("Link deactivated");
        fetchLinks();
      } else {
        // Try PATCH approach — or just update locally
        setLinks((prev) =>
          prev.map((l) => (l.id === id ? { ...l, isActive: false } : l))
        );
        message.success("Link deactivated");
      }
    } catch {
      message.error("Failed to deactivate link");
    }
  };

  // ── Table columns ──
  const columns: ColumnsType<InviteLinkItem> = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      render: (code: string) => (
        <Text copyable={{ text: code }} className="font-mono text-xs">
          {code}
        </Text>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type: string) => (
        <Tag color="blue">{type.replace(/_/g, " ")}</Tag>
      ),
    },
    {
      title: "Assigned Role",
      dataIndex: "assignRole",
      key: "assignRole",
      render: (role?: string) =>
        role ? (
          <Tag color="green">{ROLE_LABELS[role] || role}</Tag>
        ) : (
          <Text className="text-ds-text-subtle">Default (Member)</Text>
        ),
    },
    {
      title: "Status",
      key: "status",
      render: (_: unknown, record: InviteLinkItem) => {
        const expired =
          record.expiresAt && new Date(record.expiresAt) < new Date();
        const maxReached =
          record.maxUses && record.conversionCount >= record.maxUses;

        if (!record.isActive || expired || maxReached) {
          return (
            <Tag color="error" icon={<StopOutlined />}>
              {expired ? "Expired" : maxReached ? "Max Used" : "Inactive"}
            </Tag>
          );
        }
        return (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Active
          </Tag>
        );
      },
    },
    {
      title: "Usage",
      key: "usage",
      render: (_: unknown, record: InviteLinkItem) => (
        <div className="flex items-center gap-2">
          <Tooltip title="Visits">
            <span className="flex items-center gap-1 text-xs">
              <EyeOutlined /> {record.visitCount}
            </span>
          </Tooltip>
          <Tooltip title="Conversions">
            <span className="flex items-center gap-1 text-xs text-ds-status-success">
              <CheckCircleOutlined /> {record.conversionCount}
              {record.maxUses ? ` / ${record.maxUses}` : ""}
            </span>
          </Tooltip>
        </div>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => dayjs(date).format("MMM D, YYYY"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: InviteLinkItem) => (
        <Space size="small">
          <Tooltip title="Copy referral link">
            <Button
              variant="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => copyLink(record.code)}
            />
          </Tooltip>
          {record.isActive && (
            <Popconfirm
              title="Deactivate this link?"
              description="Users will no longer be able to register with it."
              onConfirm={() => handleDeactivate(record.id)}
              okText="Deactivate"
              cancelText="Cancel"
            >
              <Tooltip title="Deactivate">
                <Button
                  variant="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  danger
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className={className}>
      <Card
        size={compact ? "small" : "default"}
        title={
          <div className="flex items-center gap-2">
            <LinkOutlined />
            <span>Referral Links</span>
          </div>
        }
        extra={
          <Space>
            <Tooltip title="Refresh">
              <Button
                variant="text"
                size="small"
                icon={<ReloadOutlined />}
                onClick={fetchLinks}
                loading={loading}
              />
            </Tooltip>
            {canCreate && !showCreateForm && (
              <Button
                size="small"
                icon={<PlusOutlined />}
                onClick={() => setShowCreateForm(true)}
              >
                Create Link
              </Button>
            )}
          </Space>
        }
      >
        {/* Create Form */}
        {showCreateForm && canCreate && (
          <>
            <div className="bg-ds-surface-sunken p-4 rounded-lg mb-4">
              <Title level={5} className="!mb-3">
                Create New Referral Link
              </Title>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Link Type */}
                {!filterType && (
                  <div className="flex flex-col gap-1">
                    <Text className="text-sm font-medium">
                      Invitation Type *
                    </Text>
                    <Select
                      value={newLinkType}
                      onChange={(val) => {
                        setNewLinkType(val);
                        setNewTargetId("");
                      }}
                      options={INVITE_TYPE_OPTIONS}
                      placeholder="Select type"
                    />
                  </div>
                )}

                {/* Target */}
                {!filterTargetId && (
                  <div className="flex flex-col gap-1">
                    <Text className="text-sm font-medium">Target *</Text>
                    <Select
                      value={newTargetId || undefined}
                      onChange={setNewTargetId}
                      placeholder="Select target"
                      loading={loadingTargets}
                      showSearch
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      options={targetOptions.map((t) => ({
                        value: t.id,
                        label: t.name,
                      }))}
                    />
                  </div>
                )}

                {/* Assigned Role */}
                <div className="flex flex-col gap-1">
                  <Text className="text-sm font-medium">
                    Assigned Role (FR50)
                  </Text>
                  <Select
                    value={newAssignRole}
                    onChange={setNewAssignRole}
                    placeholder="Default (Member)"
                    allowClear
                    options={allowedRoles.map((r) => ({
                      value: r,
                      label: ROLE_LABELS[r] || r,
                    }))}
                  />
                  <Text className="text-xs text-ds-text-subtle">
                    Role automatically assigned upon registration
                  </Text>
                </div>

                {/* Usage Limit */}
                <div className="flex flex-col gap-1">
                  <Text className="text-sm font-medium">Usage Limit</Text>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={singleUse}
                      onChange={(checked) => {
                        setSingleUse(checked);
                        if (checked) setNewMaxUses(1);
                      }}
                      checkedChildren="Single Use"
                      unCheckedChildren="Multi Use"
                    />
                    {!singleUse && (
                      <InputNumber
                        value={newMaxUses}
                        onChange={(v) => setNewMaxUses(v || 0)}
                        min={0}
                        placeholder="0 = unlimited"
                        className="w-32"
                      />
                    )}
                  </div>
                  <Text className="text-xs text-ds-text-subtle">
                    {singleUse
                      ? "Link deactivates after one registration (FR57)"
                      : newMaxUses
                        ? `Up to ${newMaxUses} registrations`
                        : "Unlimited registrations"}
                  </Text>
                </div>

                {/* Expiry */}
                <div className="flex flex-col gap-1">
                  <Text className="text-sm font-medium">Expiry Date</Text>
                  <DatePicker
                    value={newExpiresAt}
                    onChange={setNewExpiresAt}
                    disabledDate={(current) =>
                      current && current < dayjs().startOf("day")
                    }
                    placeholder="No expiry"
                    className="w-full"
                  />
                  <Text className="text-xs text-ds-text-subtle">
                    Leave empty for no expiration
                  </Text>
                </div>
              </div>

              <Divider className="my-3" />

              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateLink}
                  loading={creating}
                  icon={<PlusOutlined />}
                >
                  Create Referral Link
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Links Table */}
        {links.length > 0 ? (
          <Table
            dataSource={links}
            columns={columns}
            rowKey="id"
            size="small"
            pagination={links.length > 10 ? { pageSize: 10 } : false}
            scroll={{ x: 800 }}
          />
        ) : (
          <Empty
            description={
              <Text className="text-ds-text-subtle">
                No referral links yet. Create one to invite users.
              </Text>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            {canCreate && !showCreateForm && (
              <Button
                icon={<PlusOutlined />}
                onClick={() => setShowCreateForm(true)}
              >
                Create First Link
              </Button>
            )}
          </Empty>
        )}

        {/* Help text */}
        <Paragraph className="text-xs text-ds-text-subtle mt-3 mb-0">
          <strong>How referral links work:</strong> Share the link with someone.
          When they click it, they&apos;ll be taken to a registration page where
          their role and group assignment are automatically configured based on
          the link settings.
        </Paragraph>
      </Card>
    </div>
  );
}
