"use client";

import { useState } from "react";
import { Form, Input, Button, Card, Typography, Alert, Checkbox } from "antd";
import { MailOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";

const { Title, Text } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

export default function LoginForm() {
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
          By signing in, you agree to our Terms of Service and Privacy Policy
        </Text>
      </div>
    </Card>
  );
}
