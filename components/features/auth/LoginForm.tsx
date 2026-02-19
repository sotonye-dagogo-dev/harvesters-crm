"use client";

import { useState } from "react";
import { Form, Input, Button, Card, Typography, Alert, Checkbox, Collapse, Tag } from "antd";
import { MailOutlined, LockOutlined, UserOutlined, BugOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";

const { Title, Text } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

interface LoginFormProps {
  showDevCredentials?: boolean;
}

const DEV_CREDENTIALS = [
  { role: "Superadmin", email: "admin@harvestersng.org", password: "Admin@123", color: "red" },
  { role: "Group Pastor", email: "group.pastor@harvestersng.org", password: "Pastor@123", color: "volcano" },
  { role: "Group Admin", email: "group.admin@harvestersng.org", password: "GroupAdmin@123", color: "orange" },
  { role: "Campus Pastor", email: "lekki.pastor@harvestersng.org", password: "Pastor@123", color: "gold" },
  { role: "Campus Admin", email: "lekki.admin@harvestersng.org", password: "Campus@123", color: "lime" },
  { role: "Zonal Leader", email: "zone.lagos@harvestersng.org", password: "Zonal@123", color: "green" },
  { role: "HOD", email: "hod.youth@harvestersng.org", password: "Hod@1234", color: "cyan" },
  { role: "SG Leader", email: "sgl.youthfire@harvestersng.org", password: "Leader@123", color: "blue" },
  { role: "Cell Leader", email: "cell.spark@harvestersng.org", password: "CellLd@123", color: "geekblue" },
  { role: "Data Entry", email: "dataentry1@harvestersng.org", password: "DataEntry@123", color: "purple" },
  { role: "Member", email: "samuel.ojo@email.com", password: "Member@123", color: "magenta" },
] as const;

export default function LoginForm({ showDevCredentials = false }: LoginFormProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    setError(null);

    try {
      await login(values.email, values.password);
      // Redirect is handled by AuthProvider
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (email: string, password: string) => {
    form.setFieldsValue({ email, password });
  };

  return (
    <Card className="shadow-xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-church-primary rounded-full mb-4">
          <UserOutlined className="text-3xl text-white" />
        </div>
        <Title level={2} className="!mb-2">
          Welcome Back
        </Title>
        <Text type="secondary">Sign in to your church fellowship account</Text>
      </div>

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
        name="login"
        onFinish={onFinish}
        layout="vertical"
        size="large"
        autoComplete="off"
      >
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
          rules={[{ required: true, message: "Please enter your password" }]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
        </Form.Item>

        <Form.Item>
          <div className="flex items-center justify-between">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>
            <Link
              href="/forgot-password"
              className="text-church-primary hover:text-church-primary/80"
            >
              Forgot password?
            </Link>
          </div>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            className="h-12 text-lg font-semibold"
          >
            Sign In
          </Button>
        </Form.Item>

        <div className="text-center mt-6">
          <Text type="secondary">Don&apos;t have an account? </Text>
          <Link
            href="/register"
            className="text-church-primary hover:text-church-primary/80 font-semibold"
          >
            Sign Up
          </Link>
        </div>
      </Form>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <Text type="secondary" className="text-xs text-center block">
          By signing in, you agree to our <Link href="/terms" className="text-church-primary hover:text-church-primary/80">Terms of Service</Link> and <Link href="/privacy" className="text-church-primary hover:text-church-primary/80">Privacy Policy</Link>.
        </Text>
      </div>

      {showDevCredentials && (
        <div className="mt-6">
          <Collapse
            ghost
            size="small"
            items={[
              {
                key: "dev-creds",
                label: (
                  <span className="text-xs font-medium text-orange-600 dark:text-orange-400 flex items-center gap-1">
                    <BugOutlined /> Dev Credentials
                  </span>
                ),
                children: (
                  <div className="space-y-1.5 max-h-64 overflow-y-auto">
                    {DEV_CREDENTIALS.map((cred) => (
                      <button
                        key={cred.email}
                        type="button"
                        onClick={() => fillCredentials(cred.email, cred.password)}
                        className="w-full text-left px-2.5 py-1.5 rounded-md border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <Tag color={cred.color} className="!m-0 !text-[10px] !leading-tight !px-1.5">
                            {cred.role}
                          </Tag>
                          <Text className="!text-[11px] text-gray-500 truncate flex-1 text-right">
                            {cred.email}
                          </Text>
                        </div>
                      </button>
                    ))}
                  </div>
                ),
              },
            ]}
          />
        </div>
      )}
    </Card>
  );
}
