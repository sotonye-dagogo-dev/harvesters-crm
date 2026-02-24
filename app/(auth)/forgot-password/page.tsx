"use client";

import { useState } from "react";
import { Form, message } from "antd";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
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
      <div className="min-h-screen flex items-center justify-center bg-ds-surface-base p-4">
        <Card className="w-full max-w-md shadow-ds-lg">
          <div className="text-center">
            <div className="w-16 h-16 bg-ds-brand-accent-subtle rounded-full flex items-center justify-center mx-auto mb-4">
              <MailOutlined className="text-3xl text-ds-brand-accent" />
            </div>
            <h2 className="text-2xl font-bold text-ds-text-primary mb-2">
              Check Your Email
            </h2>
            <p className="text-ds-text-secondary mb-6">
              We&apos;ve sent a password reset link to your email address. Click
              the link in the email to reset your password.
            </p>
            <p className="text-sm text-ds-text-subtle mb-6">
              Didn&apos;t receive the email? Check your spam folder or try
              again.
            </p>
            <Link href="/login">
              <Button
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
    <div className="min-h-screen flex items-center justify-center bg-ds-surface-base p-4">
      <Card className="w-full max-w-md shadow-ds-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-ds-text-primary mb-2">
            Forgot Password?
          </h1>
          <p className="text-ds-text-secondary">
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
              className="text-ds-brand-accent hover:text-ds-brand-accent-hover text-sm"
            >
              <ArrowLeftOutlined /> Back to Login
            </Link>
          </div>
        </Form>

        <div className="mt-6 pt-6 border-t border-ds-border-base text-center">
          <p className="text-sm text-ds-text-secondary">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-ds-brand-accent hover:text-ds-brand-accent-hover font-medium"
            >
              Register here
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
