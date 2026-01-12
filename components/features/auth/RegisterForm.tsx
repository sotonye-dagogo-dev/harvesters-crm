"use client";

import { useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Alert,
  Steps,
  Select,
  DatePicker,
  Checkbox,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

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
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register } = useAuth();

  const steps = [
    { title: "Account", content: "Login credentials" },
    { title: "Personal", content: "Basic information" },
    { title: "Details", content: "Additional info" },
  ];

  const next = async () => {
    try {
      // Validate current step fields
      const fieldsToValidate = getStepFields(currentStep);
      await form.validateFields(fieldsToValidate);
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

      await register({
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
      });
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
                prefix={<MailOutlined className="text-gray-400" />}
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
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
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
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
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
                  prefix={<UserOutlined className="text-gray-400" />}
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
                  prefix={<UserOutlined className="text-gray-400" />}
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
                prefix={<PhoneOutlined className="text-gray-400" />}
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
                  format="YYYY-MM-DD"
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
              <Input.TextArea
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
                  className="text-church-primary hover:text-church-primary/80"
                  target="_blank"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-church-primary hover:text-church-primary/80"
                  target="_blank"
                >
                  Privacy Policy
                </Link>
              </Checkbox>
            </Form.Item>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="shadow-xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-church-primary rounded-full mb-4">
          <UserOutlined className="text-3xl text-white" />
        </div>
        <Title level={2} className="!mb-2">
          Join Our Fellowship
        </Title>
        <Text type="secondary">Create your account to get started</Text>
      </div>

      <Steps current={currentStep} items={steps} className="mb-8" />

      {error && (
        <Alert
          title={error}
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
          className="text-church-primary hover:text-church-primary/80 font-semibold"
        >
          Sign In
        </Link>
      </div>
    </Card>
  );
}
