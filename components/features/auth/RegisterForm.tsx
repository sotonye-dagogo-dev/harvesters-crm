"use client";

import { UserRole, Gender, EmploymentStatus, MaritalStatus } from "@/lib/types";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Form,
  Button,
  Card,
  Typography,
  Alert,
  Steps,
  Select,
  DatePicker,
  Checkbox,
  Spin,
  Tag,
  Empty,
  Divider,
} from "antd";
import Input, { PasswordInput, TextArea } from "@/components/ui/Input";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  PhoneOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { useSearchParams } from "next/navigation";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

interface GroupSuggestion {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  meetingFrequency: string;
  leader: {
    id: string;
    name: string;
  } | null;
  matchReasons: string[];
  score: number;
}

interface LeaderSearchResult {
  type: "cell" | "group";
  id: string;
  name: string;
  description: string;
  memberCount: number;
  meetingFrequency: string;
  parentGroupName: string | null;
  leader: {
    id: string;
    name: string;
  };
}

interface RegisterFormValues {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: dayjs.Dayjs;
  gender: Gender;
  address: string;
  employmentStatus: EmploymentStatus;
  maritalStatus: MaritalStatus;
  interests: string[];
  acceptTerms: boolean;
  selectedGroupId?: string; // For group selection
}

const INTEREST_OPTIONS = [
  "Prayer",
  "Worship",
  "Bible Study",
  "Evangelism",
  "Children's Ministry",
  "Youth Ministry",
  "Community Outreach",
  "Counseling",
  "Media & Technology",
  "Administration",
  "Music",
  "Drama & Arts",
];

export default function RegisterForm() {
  const [form] = Form.useForm();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register } = useAuth();

  // Invite parameters from URL
  const inviteGroupId = searchParams.get("groupId");
  const inviteCode = searchParams.get("inviteCode");
  const inviteType = searchParams.get("type"); // "leader" or "member"

  // Referral link parameters from URL (from /join/[code] landing page)
  const referralCode = searchParams.get("referralCode");
  const assignedRole = searchParams.get("assignedRole");
  const referralLinkType = searchParams.get("linkType");

  // Group suggestions
  const [groupSuggestions, setGroupSuggestions] = useState<GroupSuggestion[]>(
    []
  );
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedGroupForRequest, setSelectedGroupForRequest] = useState<
    string | null
  >(null);
  const [inviteGroupName, setInviteGroupName] = useState<string | null>(null);

  // Cell leader search
  const [leaderSearchQuery, setLeaderSearchQuery] = useState("");
  const [leaderSearchResults, setLeaderSearchResults] = useState<
    LeaderSearchResult[]
  >([]);
  const [searchingLeader, setSearchingLeader] = useState(false);
  const [selectedLeaderResult, setSelectedLeaderResult] =
    useState<LeaderSearchResult | null>(null);
  const leaderSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  // Check if invitation is valid
  useEffect(() => {
    if (inviteGroupId && inviteCode) {
      // Verify invite and get group name
      fetch(`/api/groups/${inviteGroupId}`)
        .then((res) => res.json())
        .then((result) => {
          const group = result.data || result;
          if (group.inviteCode === inviteCode) {
            setInviteGroupName(group.name);
          }
        })
        .catch((err) => console.error("Failed to verify invite:", err));
    }
  }, [inviteGroupId, inviteCode]);

  // Determine steps based on invite status
  const hasInvite = !!(inviteGroupId && inviteCode);
  const hasReferral = !!referralCode;
  const skipGroupStep = hasInvite || hasReferral;

  const steps = skipGroupStep
    ? [
        { title: "Account", content: "Login credentials" },
        { title: "Personal", content: "Basic information" },
        { title: "Details", content: "Additional info" },
      ]
    : [
        { title: "Account", content: "Login credentials" },
        { title: "Personal", content: "Basic information" },
        { title: "Details", content: "Additional info" },
        { title: "Group", content: "Join a group" },
      ];

  // Fetch group suggestions when reaching the group step (only if no invite)
  const fetchGroupSuggestions = async () => {
    if (skipGroupStep) return; // Skip if user has invite link or referral

    const formValues = form.getFieldsValue();
    const location = formValues.address || "";
    const interests = formValues.interests || [];
    const campus = ""; // Can be added as a form field if needed

    setLoadingSuggestions(true);
    try {
      const params = new URLSearchParams();
      if (location) params.append("location", location);
      if (interests.length > 0) params.append("interests", interests.join(","));
      if (campus) params.append("campus", campus);

      const res = await fetch(`/api/groups/suggestions?${params.toString()}`);
      const result = await res.json();

      if (result.success) {
        setGroupSuggestions(result.data.suggestions || []);
      }
    } catch (err) {
      console.error("Failed to fetch group suggestions:", err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Debounced leader search
  const searchByLeader = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setLeaderSearchResults([]);
      return;
    }

    setSearchingLeader(true);
    try {
      const res = await fetch(
        `/api/cells/search-by-leader?query=${encodeURIComponent(query.trim())}`
      );
      const result = await res.json();
      if (result.success) {
        setLeaderSearchResults(result.data.results || []);
      }
    } catch (err) {
      console.error("Leader search failed:", err);
    } finally {
      setSearchingLeader(false);
    }
  }, []);

  const handleLeaderSearchChange = (value: string) => {
    setLeaderSearchQuery(value);
    // Clear previous timeout
    if (leaderSearchTimeout.current) {
      clearTimeout(leaderSearchTimeout.current);
    }
    // Debounce the search
    leaderSearchTimeout.current = setTimeout(() => {
      searchByLeader(value);
    }, 400);
  };

  const handleSelectLeaderResult = (result: LeaderSearchResult) => {
    setSelectedLeaderResult(result);
    // Also set as the selected group for the membership request
    setSelectedGroupForRequest(result.id);
  };

  const clearLeaderSelection = () => {
    setSelectedLeaderResult(null);
    setLeaderSearchQuery("");
    setLeaderSearchResults([]);
    // Only clear group selection if it came from leader search
    if (
      selectedLeaderResult &&
      selectedGroupForRequest === selectedLeaderResult.id
    ) {
      setSelectedGroupForRequest(null);
    }
  };

  const next = async () => {
    try {
      // Validate current step fields
      const fieldsToValidate = getStepFields(currentStep);
      await form.validateFields(fieldsToValidate);

      // Fetch suggestions when moving to group step
      if (currentStep === 2 && !skipGroupStep) {
        await fetchGroupSuggestions();
      }

      setCurrentStep(currentStep + 1);
      setError(null);
    } catch (err) {
      console.error("Validation failed:", err);
    }
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
    setError(null);
  };

  const getStepFields = (step: number): string[] => {
    if (skipGroupStep) {
      // Without group selection step
      switch (step) {
        case 0:
          return ["email", "password", "confirmPassword"];
        case 1:
          return [
            "firstName",
            "lastName",
            "phone",
            "dateOfBirth",
            "gender",
            "address",
          ];
        case 2:
          return [
            "employmentStatus",
            "maritalStatus",
            "interests",
            "acceptTerms",
          ];
        default:
          return [];
      }
    } else {
      // With group selection step
      switch (step) {
        case 0:
          return ["email", "password", "confirmPassword"];
        case 1:
          return [
            "firstName",
            "lastName",
            "phone",
            "dateOfBirth",
            "gender",
            "address",
          ];
        case 2:
          return [
            "employmentStatus",
            "maritalStatus",
            "interests",
            "acceptTerms",
          ];
        case 3:
          return []; // Group selection is optional
        default:
          return [];
      }
    }
  };

  const onFinish = async (values: RegisterFormValues) => {
    setLoading(true);
    setError(null);

    try {
      // Ensure dateOfBirth is properly formatted
      const dateOfBirth = values.dateOfBirth;

      if (!dateOfBirth) {
        throw new Error("Please select a valid date of birth");
      }

      // Handle both dayjs objects and date strings
      let formattedDateOfBirth: string;
      if (dayjs.isDayjs(dateOfBirth)) {
        formattedDateOfBirth = dateOfBirth.format("YYYY-MM-DD");
      } else if (typeof dateOfBirth === "string") {
        formattedDateOfBirth = dateOfBirth;
      } else {
        throw new Error("Please select a valid date of birth");
      }

      const age = dayjs(formattedDateOfBirth).diff(dayjs(), "years") * -1;

      if (age < 13) {
        throw new Error("You must be at least 13 years old to register");
      }

      // Prepare registration data
      const registrationData = {
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        dateOfBirth: formattedDateOfBirth,
        gender: values.gender,
        address: values.address,
        employmentStatus: values.employmentStatus,
        maritalStatus: values.maritalStatus,
        interests: values.interests || [],
        // Include invite parameters if present
        ...(inviteGroupId &&
          inviteCode && {
            groupId: inviteGroupId,
            inviteCode,
            inviteType,
          }),
        // Include referral code if present (from /join/[code])
        ...(referralCode && {
          referralCode,
        }),
      };

      await register(registrationData);

      // If user selected a group or cell (without invite/referral), create membership request
      if (!skipGroupStep && selectedGroupForRequest) {
        try {
          const requestBody: Record<string, string> = {
            type: "JOIN",
          };

          // If selected from leader search and it's a cell, send cellId
          if (selectedLeaderResult?.type === "cell") {
            requestBody.cellId = selectedGroupForRequest;
          } else {
            requestBody.groupId = selectedGroupForRequest;
          }

          await fetch("/api/membership-requests", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          });
        } catch (err) {
          console.error("Failed to create membership request:", err);
          // Don't fail registration if request fails
        }
      }

      // Redirect is handled by AuthProvider
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again."
      );
      // Go back to first step on error
      setCurrentStep(0);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-ds-text-subtle" />}
                placeholder="your.email@example.com"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please enter your password" },
                {
                  min: 8,
                  message: "Password must be at least 8 characters",
                },
                {
                  pattern:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                  message:
                    "Password must contain uppercase, lowercase, number, and special character",
                },
              ]}
            >
              <PasswordInput
                prefix={<LockOutlined className="text-ds-text-subtle" />}
                placeholder="Create a strong password"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Please confirm your password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Passwords do not match"));
                  },
                }),
              ]}
            >
              <PasswordInput
                prefix={<LockOutlined className="text-ds-text-subtle" />}
                placeholder="Re-enter your password"
                autoComplete="new-password"
              />
            </Form.Item>
          </>
        );

      case 1:
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label="First Name"
                name="firstName"
                rules={[
                  { required: true, message: "Please enter your first name" },
                ]}
              >
                <Input
                  prefix={<UserOutlined className="text-ds-text-subtle" />}
                  placeholder="John"
                />
              </Form.Item>

              <Form.Item
                label="Last Name"
                name="lastName"
                rules={[
                  { required: true, message: "Please enter your last name" },
                ]}
              >
                <Input
                  prefix={<UserOutlined className="text-ds-text-subtle" />}
                  placeholder="Doe"
                />
              </Form.Item>
            </div>

            <Form.Item
              label="Phone Number"
              name="phone"
              rules={[
                { required: true, message: "Please enter your phone number" },
                {
                  pattern: /^\+?[\d\s-()]+$/,
                  message: "Please enter a valid phone number",
                },
              ]}
            >
              <Input
                prefix={<PhoneOutlined className="text-ds-text-subtle" />}
                placeholder="+2349015678900"
              />
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label="Date of Birth"
                name="dateOfBirth"
                rules={[
                  {
                    required: true,
                    message: "Please select your date of birth",
                  },
                  {
                    validator: (_, value) => {
                      if (!value) {
                        return Promise.reject(
                          new Error("Please select your date of birth")
                        );
                      }

                      // Ensure it's a valid dayjs object
                      if (!dayjs.isDayjs(value) || !value.isValid()) {
                        return Promise.reject(
                          new Error("Please select a valid date")
                        );
                      }

                      // Check minimum age (13 years)
                      const age = dayjs().diff(value, "years");
                      if (age < 13) {
                        return Promise.reject(
                          new Error("You must be at least 13 years old")
                        );
                      }

                      // Check maximum reasonable age (120 years)
                      if (age > 120) {
                        return Promise.reject(
                          new Error("Please enter a valid date of birth")
                        );
                      }

                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <DatePicker
                  className="w-full"
                  placeholder="Select date"
                  disabledDate={(current) =>
                    current && current > dayjs().subtract(13, "years")
                  }
                  format="D MMM YYYY"
                />
              </Form.Item>

              <Form.Item
                label="Gender"
                name="gender"
                rules={[
                  { required: true, message: "Please select your gender" },
                ]}
              >
                <Select placeholder="Select gender">
                  <Option value="MALE">Male</Option>
                  <Option value="FEMALE">Female</Option>
                </Select>
              </Form.Item>
            </div>

            <Form.Item
              label="Address"
              name="address"
              rules={[{ required: true, message: "Please enter your address" }]}
            >
              <TextArea
                placeholder="123 Main Street, City, State, ZIP"
                rows={3}
              />
            </Form.Item>
          </>
        );

      case 2:
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label="Employment Status"
                name="employmentStatus"
                rules={[
                  {
                    required: true,
                    message: "Please select your employment status",
                  },
                ]}
              >
                <Select placeholder="Select status">
                  <Option value="EMPLOYED">Employed</Option>
                  <Option value="SELF_EMPLOYED">Self-Employed</Option>
                  <Option value="UNEMPLOYED">Unemployed</Option>
                  <Option value="STUDENT">Student</Option>
                  <Option value="RETIRED">Retired</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Marital Status"
                name="maritalStatus"
                rules={[
                  {
                    required: true,
                    message: "Please select your marital status",
                  },
                ]}
              >
                <Select placeholder="Select status">
                  <Option value="SINGLE">Single</Option>
                  <Option value="MARRIED">Married</Option>
                  <Option value="DIVORCED">Divorced</Option>
                  <Option value="WIDOWED">Widowed</Option>
                </Select>
              </Form.Item>
            </div>

            <Form.Item label="Areas of Interest" name="interests">
              <Select
                mode="multiple"
                placeholder="Select your areas of interest"
                maxTagCount="responsive"
              >
                {INTEREST_OPTIONS.map((interest) => (
                  <Option key={interest} value={interest}>
                    {interest}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="acceptTerms"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error("You must accept the terms and conditions")
                        ),
                },
              ]}
            >
              <Checkbox>
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-ds-brand-accent hover:text-ds-brand-accent-hover"
                  target="_blank"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-ds-brand-accent hover:text-ds-brand-accent-hover"
                  target="_blank"
                >
                  Privacy Policy
                </Link>
              </Checkbox>
            </Form.Item>
          </>
        );

      case 3:
        // Group Selection Step (only shown if no invite)
        return (
          <>
            <div className="text-center mb-6">
              <TeamOutlined className="text-5xl text-ds-brand-accent mb-2" />
              <Title level={4}>Join a Group</Title>
              <Text type="secondary">
                Search for your cell leader by name or choose from suggested
                groups (optional)
              </Text>
            </div>

            {/* Leader search section */}
            <div className="mb-6">
              <Text strong className="block mb-2">
                <SearchOutlined className="mr-1" />
                Search by Leader Name
              </Text>
              <Input
                placeholder="Type your cell leader's name..."
                value={leaderSearchQuery}
                onChange={(e) => handleLeaderSearchChange(e.target.value)}
                prefix={<SearchOutlined className="text-ds-text-subtle" />}
                allowClear
                onClear={() => {
                  setLeaderSearchQuery("");
                  setLeaderSearchResults([]);
                }}
              />

              {searchingLeader && (
                <div className="text-center py-4">
                  <Spin size="small" />
                  <Text type="secondary" className="ml-2">
                    Searching...
                  </Text>
                </div>
              )}

              {/* Selected leader result */}
              {selectedLeaderResult && (
                <Card
                  size="small"
                  className="mt-3 border-ds-brand-accent border-2 bg-ds-brand-accent-subtle"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <CheckCircleOutlined className="text-ds-brand-accent text-lg" />
                        <Text strong>{selectedLeaderResult.name}</Text>
                        <Tag
                          color={
                            selectedLeaderResult.type === "cell"
                              ? "green"
                              : "blue"
                          }
                        >
                          {selectedLeaderResult.type === "cell"
                            ? "Cell"
                            : "Group"}
                        </Tag>
                      </div>
                      <Text type="secondary" className="text-sm block mt-1">
                        Led by {selectedLeaderResult.leader.name}
                        {selectedLeaderResult.parentGroupName &&
                          ` · ${selectedLeaderResult.parentGroupName}`}
                      </Text>
                    </div>
                    <Button
                      type="link"
                      size="small"
                      danger
                      onClick={clearLeaderSelection}
                    >
                      Change
                    </Button>
                  </div>
                </Card>
              )}

              {/* Search results */}
              {!selectedLeaderResult &&
                leaderSearchResults.length > 0 &&
                leaderSearchQuery.length >= 2 && (
                  <div className="mt-3 space-y-2">
                    {leaderSearchResults.map((result) => (
                      <Card
                        key={`${result.type}-${result.id}`}
                        size="small"
                        hoverable
                        className="cursor-pointer transition-all border-ds-border-base hover:border-ds-brand-accent"
                        onClick={() => handleSelectLeaderResult(result)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Text strong>{result.name}</Text>
                              <Tag
                                color={
                                  result.type === "cell" ? "green" : "blue"
                                }
                              >
                                {result.type === "cell" ? "Cell" : "Group"}
                              </Tag>
                            </div>
                            <Text
                              type="secondary"
                              className="text-sm block mb-1"
                            >
                              {result.description}
                            </Text>
                            <div className="flex items-center gap-3 text-xs text-ds-text-secondary">
                              <span>
                                Led by <strong>{result.leader.name}</strong>
                              </span>
                              <span>
                                <TeamOutlined /> {result.memberCount} members
                              </span>
                              {result.parentGroupName && (
                                <span>Part of {result.parentGroupName}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

              {/* No results message */}
              {!selectedLeaderResult &&
                !searchingLeader &&
                leaderSearchQuery.length >= 2 &&
                leaderSearchResults.length === 0 && (
                  <Text
                    type="secondary"
                    className="block mt-2 text-sm text-center"
                  >
                    No leaders found matching &ldquo;{leaderSearchQuery}&rdquo;
                  </Text>
                )}
            </div>

            {/* Divider between search and suggestions */}
            {!selectedLeaderResult && (
              <>
                <Divider plain>
                  <Text type="secondary" className="text-xs">
                    OR choose from suggested groups
                  </Text>
                </Divider>

                {/* Existing group suggestions */}
                {loadingSuggestions ? (
                  <div className="text-center py-8">
                    <Spin size="large" tip="Finding groups for you..." />
                  </div>
                ) : groupSuggestions.length > 0 ? (
                  <div className="space-y-4">
                    {groupSuggestions.map((suggestion) => (
                      <Card
                        key={suggestion.id}
                        hoverable
                        className={`cursor-pointer transition-all ${
                          selectedGroupForRequest === suggestion.id
                            ? "border-ds-brand-accent border-2 bg-ds-brand-accent-subtle"
                            : "border-ds-border-base"
                        }`}
                        onClick={() => {
                          setSelectedGroupForRequest(suggestion.id);
                          setSelectedLeaderResult(null);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Text strong className="text-lg">
                                {suggestion.name}
                              </Text>
                              {selectedGroupForRequest === suggestion.id && (
                                <CheckCircleOutlined className="text-ds-brand-accent text-xl" />
                              )}
                            </div>
                            <Text type="secondary" className="block mb-2">
                              {suggestion.description}
                            </Text>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {suggestion.matchReasons.map((reason, idx) => (
                                <Tag key={idx} color="blue">
                                  {reason}
                                </Tag>
                              ))}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-ds-text-secondary">
                              <span>
                                <TeamOutlined /> {suggestion.memberCount}{" "}
                                members
                              </span>
                              <span>{suggestion.meetingFrequency}</span>
                              {suggestion.leader && (
                                <span>Led by {suggestion.leader.name}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Empty
                    description="No group suggestions available. You can browse and join groups after registration."
                    className="py-8"
                  />
                )}

                <Button
                  type="link"
                  onClick={() => {
                    setSelectedGroupForRequest(null);
                    setSelectedLeaderResult(null);
                  }}
                  className="w-full mt-4"
                >
                  Skip - I&apos;ll choose a group later
                </Button>
              </>
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="shadow-ds-xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-ds-brand-accent rounded-full mb-4">
          <UserOutlined className="text-3xl text-white" />
        </div>
        <Title level={2} className="!mb-2">
          Join Our Fellowship
        </Title>
        <Text type="secondary">Create your account to get started</Text>
      </div>

      {/* Invite Banner */}
      {inviteGroupName && (
        <Alert
          message={`You've been invited to join ${inviteGroupName}`}
          description={
            inviteType === UserRole.SMALL_GROUP_LEADER
              ? "You will be assigned as the group leader after registration"
              : "You will be automatically added to this group after registration"
          }
          type="success"
          showIcon
          icon={<TeamOutlined />}
          className="mb-6"
        />
      )}

      {/* Referral Banner */}
      {hasReferral && !inviteGroupName && (
        <Alert
          message="You're registering via a referral link"
          description={
            assignedRole
              ? `You will be assigned the role of ${assignedRole.replace(/_/g, " ").toLowerCase()} after registration.${referralLinkType ? ` Link type: ${referralLinkType.replace(/_/g, " ")}` : ""}`
              : "Your role and group will be automatically assigned based on the referral link."
          }
          type="info"
          showIcon
          icon={<LinkOutlined />}
          className="mb-6"
        />
      )}

      <Steps current={currentStep} items={steps} className="mb-8" />

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          className="mb-6"
        />
      )}

      <Form
        form={form}
        name="register"
        onFinish={onFinish}
        layout="vertical"
        size="large"
        autoComplete="off"
      >
        <div className={currentStep === 0 ? "block" : "hidden"}>
          {renderStepContent(0)}
        </div>
        <div className={currentStep === 1 ? "block" : "hidden"}>
          {renderStepContent(1)}
        </div>
        <div className={currentStep === 2 ? "block" : "hidden"}>
          {renderStepContent(2)}
        </div>
        {!skipGroupStep && (
          <div className={currentStep === 3 ? "block" : "hidden"}>
            {renderStepContent(3)}
          </div>
        )}

        <div className="flex justify-between mt-8">
          {currentStep > 0 && (
            <Button onClick={prev} size="large">
              Previous
            </Button>
          )}
          {currentStep < steps.length - 1 && (
            <Button
              type="primary"
              onClick={next}
              size="large"
              className="ml-auto"
            >
              Next
            </Button>
          )}
          {currentStep === steps.length - 1 && (
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              className="ml-auto"
            >
              Create Account
            </Button>
          )}
        </div>
      </Form>

      <div className="text-center mt-6">
        <Text type="secondary">Already have an account? </Text>
        <Link
          href="/login"
          className="text-ds-brand-accent hover:text-ds-brand-accent-hover font-semibold"
        >
          Sign In
        </Link>
      </div>
    </Card>
  );
}
