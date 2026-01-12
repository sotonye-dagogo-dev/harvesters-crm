"use client";

import { useState } from "react";
import { Form, Input, Button, Card, message } from "antd";
import { MailOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (values: { email: string }) => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmailSent(true);
        message.success("Password reset link sent to your email!");
      } else {
        message.error(data.error || "Failed to send reset link");
      }
    } catch {
      message.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-church-primary to-church-secondary p-4">
        <Card className="w-full max-w-md shadow-xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MailOutlined className="text-3xl text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Check Your Email
            </h2>
            <p className="text-gray-600 mb-6">
              We&apos;ve sent a password reset link to your email address. Click
              the link in the email to reset your password.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Didn&apos;t receive the email? Check your spam folder or try
              again.
            </p>
            <Link href="/login">
              <Button
                type="primary"
                size="large"
                block
                icon={<ArrowLeftOutlined />}
              >
                Back to Login
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-church-primary to-church-secondary p-4">
      <Card className="w-full max-w-md shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Forgot Password?
          </h1>
          <p className="text-gray-600">
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </p>
        </div>

        <Form
          name="forgot-password"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="your.email@example.com"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              className="mb-4"
            >
              Send Reset Link
            </Button>
          </Form.Item>

          <div className="text-center">
            <Link
              href="/login"
              className="text-church-primary hover:text-church-primary/80 text-sm"
            >
              <ArrowLeftOutlined /> Back to Login
            </Link>
          </div>
        </Form>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-church-primary hover:text-church-primary/80 font-medium"
            >
              Register here
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
