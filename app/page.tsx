"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  TeamOutlined,
  BarChartOutlined,
  HeartOutlined,
  RocketOutlined,
  DashboardOutlined,
  GlobalOutlined,
  SafetyOutlined,
  MenuOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import Button from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuth } from "@/providers/AuthProvider";
import { getDashboardRoute } from "@/lib/constants/roles";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <main className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-ds-surface-base/90 backdrop-blur-md border-b border-ds-border-base">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo/light-bg-harvesters-Logo.jpg"
                alt="Harvesters"
                width={40}
                height={40}
                className="rounded-lg dark:hidden"
              />
              <Image
                src="/logo/dark-bg-harvesters-Logo.jpg"
                alt="Harvesters"
                width={40}
                height={40}
                className="rounded-lg hidden dark:block"
              />
              <span className="text-lg font-bold text-ds-text-primary hidden sm:block">
                Harvesters Church CRM
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/about"
                className="text-sm font-medium text-ds-text-secondary hover:text-ds-brand-accent transition-colors"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-sm font-medium text-ds-text-secondary hover:text-ds-brand-accent transition-colors"
              >
                Contact
              </Link>
              <ThemeToggle />
              <Link href="/login">
                <Button variant="outline" size="small">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="small">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-3 md:hidden">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-ds-text-secondary hover:text-ds-text-primary"
              >
                {mobileMenuOpen ? (
                  <CloseOutlined className="text-xl" />
                ) : (
                  <MenuOutlined className="text-xl" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 border-t border-ds-border-base pt-4 space-y-3">
              <Link
                href="/about"
                className="block px-3 py-2 text-sm font-medium text-ds-text-secondary hover:text-ds-brand-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className="block px-3 py-2 text-sm font-medium text-ds-text-secondary hover:text-ds-brand-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="flex gap-3 px-3 pt-2">
                <Link href="/login" className="flex-1">
                  <Button variant="outline" size="small" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" className="flex-1">
                  <Button variant="primary" size="small" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1">
        <div className="w-full mx-auto flex flex-col gap-6 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16 flex flex-col gap-6 max-w-4xl mx-auto">
            <div className="inline-block px-4 py-2 bg-ds-brand-accent-subtle rounded-full">
              <span className="text-sm font-medium text-ds-brand-accent">
                Changing Lives | Pioneering Thriving Churches
              </span>
            </div>

            <h1 className="text-5xl text-ds-text-primary sm:text-6xl md:text-7xl font-bold leading-tight">
              Harvesters{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-ds-brand-accent to-emerald-600 dark:to-emerald-400">
                Church CRM
              </span>
            </h1>

            <div className="px-4 md:px-16">
              <p className="text-center text-xl sm:text-2xl text-ds-text-secondary leading-relaxed">
                Connect people with God and influence culture through thriving
                church communities at Harvesters International Christian Centre.
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

          {/* Stats Strip */}
          <div className="w-full max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Worshippers", value: "70,000+" },
              { label: "Countries", value: "3" },
              { label: "Campuses", value: "20+" },
              { label: "Groups", value: "500+" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center p-4 bg-ds-surface-elevated/60 rounded-xl border border-ds-border-base"
              >
                <div className="text-2xl sm:text-3xl font-bold text-ds-brand-accent">
                  {stat.value}
                </div>
                <div className="text-sm text-ds-text-subtle mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Benefits Section */}
          <div className="w-full max-w-5xl mx-auto bg-ds-surface-elevated/80 backdrop-blur-sm rounded-3xl p-8 sm:p-12 border border-ds-border-base">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-ds-text-primary mb-4">
              Our Church Management Platform
            </h2>
            <p className="text-center text-ds-text-secondary mb-10 max-w-2xl mx-auto">
              With over 70,000 worshippers across Nigeria, UK, and USA,
              we&apos;re pioneering a new way to manage and grow church
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
                  Manage groups across multiple campuses with ease.
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

          {/* Feature Highlights */}
          <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="flex items-start gap-4 p-6 bg-ds-surface-elevated/60 rounded-2xl border border-ds-border-base">
              <div className="w-12 h-12 bg-ds-chart-3/10 rounded-xl flex items-center justify-center shrink-0">
                <GlobalOutlined className="text-ds-chart-3 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-ds-text-primary mb-1">
                  Multi-Campus Management
                </h3>
                <p className="text-sm text-ds-text-secondary">
                  Oversee groups across Nigeria, UK, and USA from a single
                  platform with full organizational hierarchy support.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 bg-ds-surface-elevated/60 rounded-2xl border border-ds-border-base">
              <div className="w-12 h-12 bg-ds-status-success/10 rounded-xl flex items-center justify-center shrink-0">
                <SafetyOutlined className="text-ds-status-success text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-ds-text-primary mb-1">
                  Role-Based Access Control
                </h3>
                <p className="text-sm text-ds-text-secondary">
                  From Superadmin to Cell Leader, every role gets tailored
                  dashboards, analytics, and management tools.
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
                Join Harvesters Today
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-ds-surface-elevated border-t border-ds-border-base mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src="/logo/light-bg-harvesters-Logo.jpg"
                  alt="Harvesters"
                  width={36}
                  height={36}
                  className="rounded-lg dark:hidden"
                />
                <Image
                  src="/logo/dark-bg-harvesters-Logo.jpg"
                  alt="Harvesters"
                  width={36}
                  height={36}
                  className="rounded-lg hidden dark:block"
                />
                <span className="text-lg font-bold text-ds-text-primary">
                  Harvesters Church CRM
                </span>
              </div>
              <p className="text-sm text-ds-text-secondary max-w-md">
                Changing lives by pioneering thriving churches across Nigeria,
                the United Kingdom, and the United States of America.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-ds-text-primary mb-4">
                Quick Links
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/about"
                    className="text-sm text-ds-text-secondary hover:text-ds-brand-accent transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-sm text-ds-text-secondary hover:text-ds-brand-accent transition-colors"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="text-sm text-ds-text-secondary hover:text-ds-brand-accent transition-colors"
                  >
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="text-sm text-ds-text-secondary hover:text-ds-brand-accent transition-colors"
                  >
                    Register
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-ds-text-primary mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/terms"
                    className="text-sm text-ds-text-secondary hover:text-ds-brand-accent transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-sm text-ds-text-secondary hover:text-ds-brand-accent transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-10 pt-6 border-t border-ds-border-base flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-ds-text-subtle">
              &copy; {new Date().getFullYear()} Harvesters International
              Christian Centre. All rights reserved.
            </p>
            <p className="text-xs text-ds-text-subtle">
              Built with love for the Harvesters family
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
