import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import {
  LockOutlined,
  SafetyOutlined,
  EyeInvisibleOutlined,
  DatabaseOutlined,
  UserOutlined,
} from "@ant-design/icons";

export const metadata: Metadata = {
  title: "Privacy Policy | Harvesters Small Groups CRM",
  description:
    "Privacy Policy for Harvesters International Christian Centre Small Groups CRM. Learn how we collect, use, protect, and manage member data.",
  keywords:
    "Harvesters privacy policy, data protection, HICC CRM privacy, member data security",
};

export default function PrivacyPage() {
  const privacyPrinciples = [
    {
      icon: <LockOutlined className="text-3xl" />,
      title: "Data Security",
      description:
        "We use industry-standard encryption and security measures to protect your personal information from unauthorized access.",
      color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    },
    {
      icon: <EyeInvisibleOutlined className="text-3xl" />,
      title: "Privacy by Design",
      description:
        "Privacy is built into every feature. We collect only what's necessary for small group management.",
      color:
        "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
    },
    {
      icon: <SafetyOutlined className="text-3xl" />,
      title: "Role-Based Access",
      description:
        "Access to member data is strictly controlled based on church roles and responsibilities.",
      color:
        "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    },
    {
      icon: <UserOutlined className="text-3xl" />,
      title: "Your Control",
      description:
        "You have the right to access, update, and request deletion of your personal data at any time.",
      color:
        "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-slate-700">
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
              className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
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
          <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <SafetyOutlined className="text-5xl text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Your privacy is important to us. This policy outlines how we
            collect, use, protect, and manage your personal information.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Last Updated: January 13, 2026
          </p>
        </div>
      </section>

      {/* Privacy Principles */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Our Privacy Principles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {privacyPrinciples.map((principle, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow"
              >
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${principle.color}`}
                >
                  {principle.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {principle.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {principle.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 px-4">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Information We Collect
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p className="font-semibold text-gray-900 dark:text-white">
                When you register and use the Platform, we collect:
              </p>
              <div className="ml-4 space-y-3">
                <div>
                  <p className="font-semibold">Personal Information:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Full name, email address, phone number</li>
                    <li>WhatsApp number (for communication)</li>
                    <li>Age, marital status, employment status</li>
                    <li>Location/address information</li>
                    <li>Profile picture (optional)</li>
                    <li>Areas of interest for group matching</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold">
                    Small Group Participation Data:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Group membership and role assignments</li>
                    <li>Meeting attendance records</li>
                    <li>Interaction logs (calls, follow-ups, check-ins)</li>
                    <li>Membership request history</li>
                    <li>Meeting screenshots and notes</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold">Technical Information:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Login credentials (password encrypted)</li>
                    <li>Authentication tokens and session data</li>
                    <li>Account activity and access logs</li>
                    <li>Device and browser information</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              How We Use Your Information
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                We use the collected information exclusively for church small
                group management purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Small Group Management:</strong> Assign members to
                  groups, track attendance, and monitor engagement
                </li>
                <li>
                  <strong>Pastoral Care:</strong> Enable leaders to provide
                  follow-up, support, and spiritual guidance
                </li>
                <li>
                  <strong>Communication:</strong> Send meeting reminders, role
                  updates, and membership notifications
                </li>
                <li>
                  <strong>Analytics:</strong> Generate insights on group health,
                  member participation, and church-wide trends
                </li>
                <li>
                  <strong>Account Management:</strong> Authenticate users,
                  maintain accounts, and enforce role-based permissions
                </li>
                <li>
                  <strong>Platform Improvement:</strong> Analyze usage patterns
                  to enhance features and user experience
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <DatabaseOutlined className="text-3xl text-purple-600 dark:text-purple-400" />
              Data Retention
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>We retain your personal information as follows:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Active Members:</strong> Data retained while you are
                  an active member of Harvesters
                </li>
                <li>
                  <strong>Historical Records:</strong> Attendance and
                  participation data retained for church records and analytics
                </li>
                <li>
                  <strong>Account Deletion:</strong> Upon request, personal data
                  is anonymized or deleted within 30 days (historical attendance
                  counts may remain aggregated)
                </li>
                <li>
                  <strong>Inactive Accounts:</strong> Accounts inactive for 2+
                  years may be archived or deleted with notice
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Who Has Access to Your Data
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                Access to your information is strictly controlled based on
                church roles:
              </p>
              <div className="space-y-3">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Members (You)
                  </p>
                  <p className="text-sm">
                    Can view and update your own profile, group information, and
                    participation history
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Group Leaders
                  </p>
                  <p className="text-sm">
                    Can view profiles and participation data for members in
                    their assigned group only. Cannot access other groups&apos;
                    data.
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Superadmins (Church Leadership)
                  </p>
                  <p className="text-sm">
                    Have full access to manage users, groups, and analytics for
                    church oversight and strategic decision-making.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Data Sharing and Third Parties
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p className="font-semibold text-green-600 dark:text-green-400">
                We do NOT sell, rent, or trade your personal information to
                third parties.
              </p>
              <p>Limited data sharing occurs only in these cases:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Service Providers:</strong> Trusted vendors providing
                  hosting, database, and authentication services (bound by
                  confidentiality agreements)
                </li>
                <li>
                  <strong>Legal Requirements:</strong> When required by law,
                  court order, or government regulation
                </li>
                <li>
                  <strong>Protection:</strong> To protect the rights, property,
                  or safety of Harvesters, its members, or others
                </li>
              </ul>
              <p>
                No marketing, advertising, or promotional use of your data by
                external parties.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <LockOutlined className="text-3xl text-blue-600 dark:text-blue-400" />
              Security Measures
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>We implement robust security measures to protect your data:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Encryption:</strong> HTTPS/TLS encryption for all data
                  transmission
                </li>
                <li>
                  <strong>Password Protection:</strong> Passwords hashed using
                  bcrypt (never stored in plain text)
                </li>
                <li>
                  <strong>Access Control:</strong> Role-based permissions with
                  strict enforcement
                </li>
                <li>
                  <strong>Authentication:</strong> Secure JWT tokens with
                  httpOnly cookies
                </li>
                <li>
                  <strong>Monitoring:</strong> Audit logs track sensitive
                  operations and access
                </li>
                <li>
                  <strong>Regular Updates:</strong> Security patches and
                  software updates applied promptly
                </li>
                <li>
                  <strong>Database Security:</strong> Parameterized queries
                  prevent SQL injection attacks
                </li>
              </ul>
              <p className="text-sm italic">
                While we implement strong security measures, no system is 100%
                secure. We encourage users to use strong passwords and protect
                their login credentials.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Your Privacy Rights
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>You have the following rights regarding your personal data:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Access:</strong> Request a copy of all personal data
                  we hold about you
                </li>
                <li>
                  <strong>Correction:</strong> Update inaccurate or incomplete
                  information through your profile settings
                </li>
                <li>
                  <strong>Deletion:</strong> Request deletion of your account
                  and personal data (subject to church record-keeping
                  requirements)
                </li>
                <li>
                  <strong>Data Portability:</strong> Export your data in a
                  machine-readable format
                </li>
                <li>
                  <strong>Objection:</strong> Object to certain data processing
                  activities (where applicable)
                </li>
                <li>
                  <strong>Notification Preferences:</strong> Control
                  communication preferences in your account settings
                </li>
              </ul>
              <p>
                To exercise these rights, contact us at{" "}
                <a
                  href="mailto:support@harvestersng.org"
                  className="text-green-600 dark:text-green-400 hover:underline"
                >
                  support@harvestersng.org
                </a>
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Children&apos;s Privacy
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                The Platform is designed for adult members and leaders of
                Harvesters International Christian Centre. We do not knowingly
                collect personal information from individuals under 18 years of
                age without parental/guardian consent.
              </p>
              <p>
                If you are a parent or guardian and believe your child has
                provided personal information without your consent, please
                contact us immediately so we can remove the information.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Changes to Privacy Policy
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                We may update this Privacy Policy from time to time to reflect
                changes in our practices or legal requirements. Significant
                changes will be communicated through:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>In-app notifications to all users</li>
                <li>Email notifications to registered email addresses</li>
                <li>
                  Updates to this page with the &quot;Last Updated&quot; date
                </li>
              </ul>
              <p>
                Continued use of the Platform after changes constitutes
                acceptance of the updated Privacy Policy. We encourage you to
                review this page periodically.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Contact Us
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                If you have questions, concerns, or requests regarding this
                Privacy Policy or your personal data, please contact:
              </p>
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <p className="font-semibold text-gray-900 dark:text-white">
                  Harvesters International Christian Centre
                </p>
                <p>Small Groups CRM Privacy Team</p>
                <p>Email: support@harvestersng.org</p>
                <p>Website: harvestersng.org</p>
                <p className="mt-2 text-sm">
                  We will respond to privacy inquiries within 7 business days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Commitment Statement */}
      <section className="py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-2xl p-8 md:p-12 text-white text-center">
            <SafetyOutlined className="text-6xl mb-6" />
            <h2 className="text-3xl font-bold mb-4">Our Commitment to You</h2>
            <p className="text-lg opacity-95 mb-8">
              We are committed to protecting your privacy and handling your data
              with integrity, transparency, and the utmost respect. Your trust
              is essential to our mission of building thriving small group
              communities.
            </p>
            <Link
              href="/terms"
              className="inline-block px-8 py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors shadow-lg font-semibold mr-4"
            >
              Read Terms of Service
            </Link>
            <Link
              href="/contact"
              className="inline-block px-8 py-3 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors shadow-lg font-semibold"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4 mt-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Image
              src="/logo/dark-bg-harvesters-Logo.jpg"
              alt="Harvesters International Christian Centre"
              width={150}
              height={50}
              className="object-contain mb-4"
            />
            <p className="text-gray-400">
              Changing lives through thriving churches across the globe.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
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
            <p className="text-gray-400 mb-2">
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
            <p className="text-gray-400 text-sm mt-6">
              &copy; {new Date().getFullYear()} Harvesters International
              Christian Centre. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
