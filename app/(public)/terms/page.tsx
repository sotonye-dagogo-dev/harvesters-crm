import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import {
  FileTextOutlined,
  SafetyOutlined,
  TeamOutlined,
  UserOutlined,
  LockOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

export const metadata: Metadata = {
  title: "Terms of Service | Harvesters Church CRM",
  description:
    "Terms of Service for Harvesters International Christian Centre Church CRM platform. Read about user responsibilities, acceptable use, and service guidelines.",
  keywords: "Harvesters terms, CRM terms of service, user agreement, HICC CRM",
};

export default function TermsPage() {
  const sections = [
    {
      icon: <UserOutlined className="text-3xl" />,
      title: "User Accounts",
      items: [
        "All users must register with accurate information",
        "Each user is responsible for maintaining account security",
        "Passwords must be kept confidential and not shared",
        "Users must notify support immediately of any unauthorized access",
        "Account credentials are non-transferable",
      ],
    },
    {
      icon: <CheckCircleOutlined className="text-3xl" />,
      title: "Acceptable Use",
      items: [
        "Platform must be used for church group management only",
        "Users must respect privacy of all member information",
        "No harassment, abuse, or inappropriate content allowed",
        "Accurate reporting of attendance and interaction data required",
        "System resources must not be misused or overused",
      ],
    },
    {
      icon: <TeamOutlined className="text-3xl" />,
      title: "Role-Based Access",
      items: [
        "Members can view and manage their own profiles and group information",
        "Leaders have access to their assigned group's data only",
        "Superadmins have full access for church leadership oversight",
        "Users must not attempt to access data beyond their role permissions",
        "Role changes must be approved by authorized church leadership",
      ],
    },
    {
      icon: <LockOutlined className="text-3xl" />,
      title: "Data Responsibilities",
      items: [
        "Users must handle member data with confidentiality and respect",
        "Personal information must not be shared outside the platform",
        "Data exports are for authorized church use only",
        "Meeting screenshots and photos must respect member privacy",
        "Inactive or incorrect data should be reported to administrators",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-ds-surface-base/80 backdrop-blur-lg border-b border-ds-border-base">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo/white-bg-harvesters-Logo.jpg"
              alt="Harvesters International Christian Centre"
              width={150}
              height={50}
              className="object-contain"
              priority
            />
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/about"
              className="text-ds-text-secondary hover:text-ds-status-success dark:hover:text-green-400 transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-ds-text-secondary hover:text-ds-status-success dark:hover:text-green-400 transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/login"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
            >
              Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="w-20 h-20 bg-ds-status-success/10 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileTextOutlined className="text-5xl text-ds-status-success" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-ds-text-primary mb-6">
            Terms of Service
          </h1>
          <p className="text-xl text-ds-text-secondary max-w-3xl mx-auto leading-relaxed">
            Harvesters International Christian Centre Church CRM Platform
          </p>
          <p className="text-sm text-ds-text-subtle mt-4">
            Last Updated: January 13, 2026
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-ds-surface-elevated rounded-2xl shadow-ds-xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-ds-text-primary mb-6">
              Welcome to Harvesters Church CRM
            </h2>
            <div className="space-y-4 text-lg text-ds-text-secondary leading-relaxed">
              <p>
                By accessing and using the Harvesters Church CRM platform
                (&quot;Platform&quot;), you agree to be bound by these Terms of
                Service (&quot;Terms&quot;). This Platform is provided by
                Harvesters International Christian Centre
                (&quot;Harvesters,&quot; &quot;we,&quot; &quot;us,&quot; or
                &quot;our&quot;) to support the management of group fellowships
                within our church community.
              </p>
              <p>
                These Terms govern your access to and use of the Platform,
                including all features, functionality, and services provided. If
                you do not agree to these Terms, you may not access or use the
                Platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Sections */}
      <section className="py-8 px-4">
        <div className="max-w-5xl mx-auto space-y-6">
          {sections.map((section, index) => (
            <div
              key={index}
              className="bg-ds-surface-elevated rounded-2xl shadow-ds-xl p-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-ds-status-success/5 dark:bg-green-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-ds-status-success">{section.icon}</span>
                </div>
                <h2 className="text-2xl font-bold text-ds-text-primary">
                  {section.title}
                </h2>
              </div>
              <ul className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <li
                    key={itemIndex}
                    className="flex items-start gap-3 text-ds-text-secondary"
                  >
                    <CheckCircleOutlined className="text-ds-status-success mt-1 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Additional Terms */}
      <section className="py-8 px-4">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="bg-ds-surface-elevated rounded-2xl shadow-ds-xl p-8">
            <h2 className="text-2xl font-bold text-ds-text-primary mb-6">
              Service Availability
            </h2>
            <div className="space-y-4 text-ds-text-secondary">
              <p>
                We strive to provide continuous, uninterrupted access to the
                Platform. However, we reserve the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Perform scheduled maintenance with advance notice</li>
                <li>Make emergency updates to ensure security and stability</li>
                <li>
                  Suspend service temporarily due to technical issues or force
                  majeure
                </li>
                <li>
                  Update features and functionality to improve user experience
                </li>
              </ul>
              <p>
                We will make reasonable efforts to notify users of planned
                downtime and minimize service disruptions.
              </p>
            </div>
          </div>

          <div className="bg-ds-surface-elevated rounded-2xl shadow-ds-xl p-8">
            <h2 className="text-2xl font-bold text-ds-text-primary mb-6">
              Intellectual Property
            </h2>
            <div className="space-y-4 text-ds-text-secondary">
              <p>
                The Platform, including all content, features, design, and
                functionality, is owned by Harvesters International Christian
                Centre and is protected by copyright, trademark, and other
                intellectual property laws.
              </p>
              <p>Users are granted a limited, non-exclusive license to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  Access and use the Platform for authorized church purposes
                </li>
                <li>
                  View and interact with content within their role permissions
                </li>
                <li>Export data for legitimate group management activities</li>
              </ul>
              <p>
                Users may not copy, modify, distribute, sell, or create
                derivative works from the Platform without explicit written
                permission from Harvesters.
              </p>
            </div>
          </div>

          <div className="bg-ds-surface-elevated rounded-2xl shadow-ds-xl p-8">
            <h2 className="text-2xl font-bold text-ds-text-primary mb-6">
              Termination
            </h2>
            <div className="space-y-4 text-ds-text-secondary">
              <p>
                We reserve the right to suspend or terminate user accounts for
                violations of these Terms, including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Misuse of the Platform or member data</li>
                <li>Unauthorized access attempts</li>
                <li>Providing false or misleading information</li>
                <li>Engaging in harmful or disruptive behavior</li>
                <li>Violating privacy or security policies</li>
              </ul>
              <p>
                Upon termination, users must cease all access to the Platform
                and delete any exported data in their possession.
              </p>
            </div>
          </div>

          <div className="bg-ds-surface-elevated rounded-2xl shadow-ds-xl p-8">
            <h2 className="text-2xl font-bold text-ds-text-primary mb-6">
              Limitation of Liability
            </h2>
            <div className="space-y-4 text-ds-text-secondary">
              <p>
                To the fullest extent permitted by law, Harvesters International
                Christian Centre and its leadership shall not be liable for any
                indirect, incidental, special, consequential, or punitive
                damages arising from:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Use or inability to use the Platform</li>
                <li>Unauthorized access to or alteration of user data</li>
                <li>Platform errors, bugs, or technical issues</li>
                <li>Loss of data or service interruptions</li>
              </ul>
              <p>
                Users acknowledge that the Platform is provided &quot;as
                is&quot; and Harvesters makes no warranties regarding uptime,
                accuracy, or fitness for a particular purpose.
              </p>
            </div>
          </div>

          <div className="bg-ds-surface-elevated rounded-2xl shadow-ds-xl p-8">
            <h2 className="text-2xl font-bold text-ds-text-primary mb-6">
              Changes to Terms
            </h2>
            <div className="space-y-4 text-ds-text-secondary">
              <p>
                We reserve the right to modify these Terms at any time.
                Significant changes will be communicated through:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>In-app notifications</li>
                <li>Email notifications to registered users</li>
                <li>Updates to this Terms page with revision date</li>
              </ul>
              <p>
                Continued use of the Platform after changes constitutes
                acceptance of the updated Terms. If you do not agree with
                changes, you must discontinue use of the Platform.
              </p>
            </div>
          </div>

          <div className="bg-ds-surface-elevated rounded-2xl shadow-ds-xl p-8">
            <h2 className="text-2xl font-bold text-ds-text-primary mb-6">
              Governing Law
            </h2>
            <div className="space-y-4 text-ds-text-secondary">
              <p>
                These Terms shall be governed by and construed in accordance
                with the laws of the Federal Republic of Nigeria, without regard
                to its conflict of law provisions.
              </p>
              <p>
                Any disputes arising from these Terms or use of the Platform
                shall be resolved through good faith negotiation with church
                leadership. If resolution cannot be reached, disputes will be
                subject to the exclusive jurisdiction of the courts in Lagos,
                Nigeria.
              </p>
            </div>
          </div>

          <div className="bg-ds-surface-elevated rounded-2xl shadow-ds-xl p-8">
            <h2 className="text-2xl font-bold text-ds-text-primary mb-6">
              Contact Information
            </h2>
            <div className="space-y-4 text-ds-text-secondary">
              <p>
                For questions, concerns, or support regarding these Terms,
                please contact us at:
              </p>
              <div className="bg-ds-status-success/5 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="font-semibold text-ds-text-primary">
                  Harvesters International Christian Centre
                </p>
                <p>Church CRM Support Team</p>
                <p>Email: support@harvestersng.org</p>
                <p>Website: harvestersng.org</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Acknowledgment */}
      <section className="py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl shadow-ds-xl p-8 md:p-12 text-white text-center">
            <SafetyOutlined className="text-6xl mb-6" />
            <h2 className="text-3xl font-bold mb-4">
              By Using This Platform, You Agree to These Terms
            </h2>
            <p className="text-lg opacity-95 mb-8">
              We are committed to providing a secure, effective tool for small
              group management while protecting the privacy and data of all
              members.
            </p>
            <Link
              href="/privacy"
              className="inline-block px-8 py-3 bg-white text-ds-status-success rounded-lg hover:bg-ds-surface-sunken transition-colors shadow-lg font-semibold mr-4"
            >
              Read Privacy Policy
            </Link>
            <Link
              href="/login"
              className="inline-block px-8 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors shadow-lg font-semibold"
            >
              Login to Platform
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ds-surface-base text-white py-12 px-4 mt-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Image
              src="/logo/dark-bg-harvesters-Logo.jpg"
              alt="Harvesters International Christian Centre"
              width={150}
              height={50}
              className="object-contain mb-4"
            />
            <p className="text-ds-text-subtle">
              Changing lives through thriving churches across the globe.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2 text-ds-text-subtle">
              <li>
                <Link
                  href="/about"
                  className="hover:text-green-400 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-green-400 transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-green-400 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-green-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4">Connect With Us</h4>
            <p className="text-ds-text-subtle mb-2">
              Visit{" "}
              <a
                href="https://harvestersng.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:underline"
              >
                harvestersng.org
              </a>
            </p>
            <p className="text-ds-text-subtle text-sm mt-6">
              &copy; {new Date().getFullYear()} Harvesters International
              Christian Centre. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
