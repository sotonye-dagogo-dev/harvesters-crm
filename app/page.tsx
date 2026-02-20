"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  TeamOutlined,
  BarChartOutlined,
  HeartOutlined,
  RocketOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import Button from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuth } from "@/providers/AuthProvider";
import { getDashboardRoute } from "@/lib/constants/roles";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (user?.role) {
      router.push(getDashboardRoute(user.role));
    }
  }, [user, router]);

  // Don't render home content if redirecting
  if (user?.role) {
    return null;
  }

  return (
    <main className="min-h-screen ">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full mx-auto">
        <div className="w-full mx-auto flex flex-col gap-6 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          {/* Hero Section - Reduced and Centered */}
          <div className="text-center mb-16 flex flex-col gap-6">
            <div className="inline-block px-4 py-2 bg-ds-brand-accent-subtle rounded-full">
              <span className="text-sm font-medium text-ds-brand-accent">
                Changing Lives | Pioneering Thriving Churches
              </span>
            </div>

            <h1 className="text-5xl text-ds-text-primary sm:text-6xl md:text-7xl font-bold leading-tight">
              Harvesters{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-ds-brand-accent to-emerald-600 dark:to-emerald-400">
                Small Groups CRM
              </span>
            </h1>

            <div className="px-8 md:px-16">
              <p className="text-center text-xl sm:text-2xl text-ds-text-secondary leading-relaxed">
                Connect people with God and influence culture through thriving
                small groups at Harvesters International Christian Centre.
              </p>
            </div>

            {/* Primary CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 max-w-md mx-auto sm:max-w-none">
              <Link href="/register" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="large"
                  icon={<RocketOutlined />}
                  className="w-full sm:w-auto px-10 py-6 text-lg font-semibold shadow-ds-xl hover:shadow-ds-xl transition-all"
                >
                  Get Started Free
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="large"
                  icon={<DashboardOutlined />}
                  className="w-full sm:w-auto px-10 py-6 text-lg font-semibold border-2 hover:bg-ds-brand-accent-subtle"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Benefits Section - Simplified */}
          <div className="w-5/6 mx-auto bg-ds-surface-elevated/80 backdrop-blur-sm rounded-3xl p-8 sm:p-12 border border-ds-border-base">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-ds-text-primary mb-4">
              Our Small Groups Platform
            </h2>
            <p className="text-center text-ds-text-secondary mb-10 max-w-2xl mx-auto">
              With over 70,000 worshippers across Nigeria, UK, and USA,
              we&apos;re pioneering a new way to manage and grow small group
              ministry.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-ds-brand-accent-subtle rounded-2xl flex items-center justify-center mx-auto">
                  <TeamOutlined className="text-ds-brand-accent text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-ds-text-primary">
                  Connect People & God
                </h3>
                <p className="text-ds-text-secondary">
                  Manage small groups across multiple campuses with ease.
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-ds-chart-1/10 rounded-2xl flex items-center justify-center mx-auto">
                  <BarChartOutlined className="text-ds-chart-1 text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-ds-text-primary">
                  Bring Hope & Change
                </h3>
                <p className="text-ds-text-secondary">
                  Track engagement and foster transformational encounters.
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-ds-chart-6/10 rounded-2xl flex items-center justify-center mx-auto">
                  <HeartOutlined className="text-ds-chart-6 text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-ds-text-primary">
                  Influence Culture
                </h3>
                <p className="text-ds-text-secondary">
                  Lead people to become fully devoted followers of Christ.
                </p>
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="text-center mt-16 space-y-4">
            <p className="text-lg text-ds-text-secondary">
              Join the Harvesters family and experience impactful,
              transformational encounters
            </p>
            <Link href="/register">
              <Button
                variant="primary"
                size="large"
                className="px-8 py-4 text-base font-semibold shadow-lg hover:shadow-ds-xl transition-all"
              >
                Join a Small Group Today
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
