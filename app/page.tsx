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

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (user?.role) {
      const rolePath = user.role.toLowerCase();
      router.push(`/${rolePath}/dashboard`);
    }
  }, [user, router]);

  // Don't render home content if redirecting
  if (user?.role) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section - Reduced and Centered */}
          <div className="text-center mb-16 space-y-6">
            <div className="inline-block px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full">
              <span className="text-sm font-medium text-green-800 dark:text-green-300">
                Changing Lives | Pioneering Thriving Churches
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 dark:text-white leading-tight">
              Harvesters{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400">
                Small Groups CRM
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Connect people with God and influence culture through thriving
              small groups at Harvesters International Christian Centre.
            </p>

            {/* Primary CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 max-w-md mx-auto sm:max-w-none">
              <Link href="/register" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="large"
                  icon={<RocketOutlined />}
                  className="w-full sm:w-auto px-10 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all"
                >
                  Get Started Free
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="large"
                  icon={<DashboardOutlined />}
                  className="w-full sm:w-auto px-10 py-6 text-lg font-semibold border-2 hover:bg-gray-50 dark:hover:bg-slate-800"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Benefits Section - Simplified */}
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-3xl p-8 sm:p-12 border border-gray-200 dark:border-slate-700">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
              Our Small Groups Platform
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
              With over 70,000 worshippers across Nigeria, UK, and USA,
              we&apos;re pioneering a new way to manage and grow small group
              ministry.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-2xl flex items-center justify-center mx-auto">
                  <TeamOutlined className="text-green-600 dark:text-green-400 text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Connect People & God
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage small groups across multiple campuses with ease.
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl flex items-center justify-center mx-auto">
                  <BarChartOutlined className="text-blue-600 dark:text-blue-400 text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Bring Hope & Change
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Track engagement and foster transformational encounters.
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-rose-200 dark:from-rose-900/30 dark:to-rose-800/30 rounded-2xl flex items-center justify-center mx-auto">
                  <HeartOutlined className="text-rose-600 dark:text-rose-400 text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Influence Culture
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Lead people to become fully devoted followers of Christ.
                </p>
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="text-center mt-16 space-y-4">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Join the Harvesters family and experience impactful,
              transformational encounters
            </p>
            <Link href="/register">
              <Button
                variant="primary"
                size="large"
                className="px-8 py-4 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
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
