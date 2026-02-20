import { Metadata } from "next";
import { Suspense } from "react";
import RegisterForm from "@/components/features/auth/RegisterForm";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Spin } from "antd";

export const metadata: Metadata = {
  title: "Register - Harvesters Small Groups CRM",
  description: "Create your church fellowship account",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ds-surface-base p-4 py-12">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-2xl">
        <Suspense
          fallback={
            <div className="flex justify-center items-center min-h-[400px]">
              <Spin size="large" />
            </div>
          }
        >
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
