import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import {
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

export const metadata: Metadata = {
  title: "Contact Us | Harvesters International Christian Centre",
  description:
    "Get in touch with Harvesters International Christian Centre. Find our locations across Nigeria, UK, and USA, and connect with our Small Groups CRM support team.",
  keywords:
    "Harvesters contact, HICC locations, Harvesters church address, contact Pastor Bolaji Idowu",
};

export default function ContactPage() {
  const campuses = [
    {
      region: "Lagos - Mainland",
      locations: [
        {
          name: "Gbagada Campus",
          address: "Gbagada, Lagos, Nigeria",
          type: "Campus",
        },
        {
          name: "Anthony Campus",
          address: "Anthony, Lagos, Nigeria",
          type: "Campus",
        },
        {
          name: "Yaba Campus",
          address: "Yaba, Lagos, Nigeria",
          type: "Campus",
        },
        {
          name: "Alimosho Campus",
          address: "Alimosho, Lagos, Nigeria",
          type: "Campus",
        },
      ],
    },
    {
      region: "Lagos - Island & Lekki",
      locations: [
        {
          name: "Lekki Campus (Headquarters)",
          address: "Lekki Phase 1, Lagos, Nigeria",
          type: "Headquarters",
        },
        {
          name: "Ajah Campus",
          address: "Ajah, Lagos, Nigeria",
          type: "Campus",
        },
        {
          name: "Ikeja GRA Campus",
          address: "Ikeja GRA, Lagos, Nigeria",
          type: "Campus",
        },
      ],
    },
    {
      region: "Lagos - Surrounding",
      locations: [
        {
          name: "Magodo Campus",
          address: "Magodo, Lagos, Nigeria",
          type: "Campus",
        },
        {
          name: "Ikorodu Campus",
          address: "Ikorodu, Lagos, Nigeria",
          type: "Campus",
        },
      ],
    },
    {
      region: "Nigeria - Other Cities",
      locations: [
        {
          name: "Ibadan Campus",
          address: "Ibadan, Oyo State, Nigeria",
          type: "Campus",
        },
        {
          name: "Abuja Campus",
          address: "Abuja, FCT, Nigeria",
          type: "Campus",
        },
      ],
    },
    {
      region: "International",
      locations: [
        {
          name: "London Campus",
          address: "London, United Kingdom",
          type: "Campus",
        },
        {
          name: "USA Campus",
          address: "United States of America",
          type: "Campus",
        },
      ],
    },
  ];

  const supportContacts = [
    {
      icon: <MailOutlined className="text-3xl" />,
      title: "Email Support",
      details: "support@harvestersng.org",
      description: "For Small Groups CRM technical support and inquiries",
      color: "bg-ds-chart-1/5 dark:bg-blue-900/20 text-ds-chart-1",
    },
    {
      icon: <PhoneOutlined className="text-3xl" />,
      title: "Church Office",
      details: "Available during service hours",
      description: "Visit any of our campus locations for in-person assistance",
      color:
        "bg-ds-status-success/5 dark:bg-green-900/20 text-ds-status-success",
    },
    {
      icon: <GlobalOutlined className="text-3xl" />,
      title: "Online",
      details: "harvestersng.org",
      description:
        "Visit our main website for church information and resources",
      color:
        "bg-purple-50 dark:bg-purple-900/20 text-ds-chart-3",
    },
    {
      icon: <ClockCircleOutlined className="text-3xl" />,
      title: "Service Times",
      details: "Sundays & Midweek",
      description: "Service times vary by campus - check website for details",
      color:
        "bg-ds-chart-4/5 dark:bg-orange-900/20 text-ds-chart-4",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
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
              className="text-ds-status-success font-semibold"
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
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-ds-text-primary mb-6">
            Get in Touch
            <span className="block text-ds-status-success mt-2">
              We&apos;d Love to Hear From You
            </span>
          </h1>
          <p className="text-xl text-ds-text-secondary max-w-3xl mx-auto leading-relaxed">
            Whether you have questions about our Small Groups CRM, need support,
            or want to visit one of our campuses, we&apos;re here to help.
          </p>
        </div>
      </section>

      {/* Support Contacts */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-ds-text-primary mb-12">
            How to Reach Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportContacts.map((contact, index) => (
              <div
                key={index}
                className="bg-ds-surface-elevated rounded-2xl shadow-ds-xl p-6 hover:shadow-ds-xl transition-shadow"
              >
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${contact.color}`}
                >
                  {contact.icon}
                </div>
                <h3 className="text-xl font-bold text-ds-text-primary mb-2">
                  {contact.title}
                </h3>
                <p className="text-ds-status-success font-semibold mb-2">
                  {contact.details}
                </p>
                <p className="text-sm text-ds-text-secondary">
                  {contact.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Campus Locations */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-ds-text-primary mb-4">
              Our Campus Locations
            </h2>
            <p className="text-xl text-ds-text-secondary">
              Visit a campus near you and experience the Harvesters family
            </p>
          </div>

          <div className="space-y-8">
            {campuses.map((region, index) => (
              <div
                key={index}
                className="bg-ds-surface-elevated rounded-2xl shadow-ds-xl p-8"
              >
                <h3 className="text-2xl font-bold text-ds-text-primary mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-ds-status-success/5 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <EnvironmentOutlined className="text-xl text-ds-status-success" />
                  </div>
                  {region.region}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {region.locations.map((location, locIndex) => (
                    <div
                      key={locIndex}
                      className="p-4 rounded-xl bg-ds-surface-sunken hover:bg-ds-status-success/5 dark:hover:bg-green-900/20 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-1 w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full flex-shrink-0"></span>
                        <div>
                          <p className="font-semibold text-ds-text-primary">
                            {location.name}
                          </p>
                          <p className="text-sm text-ds-text-secondary mt-1">
                            {location.address}
                          </p>
                          {location.type === "Headquarters" && (
                            <span className="inline-block mt-2 px-2 py-1 bg-ds-status-success/10 dark:bg-green-900/30 text-ds-status-success text-xs rounded font-semibold">
                              Headquarters
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CRM Support Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl shadow-ds-xl p-8 md:p-12 text-white">
            <h2 className="text-4xl font-bold mb-6">
              Small Groups CRM Support
            </h2>
            <p className="text-lg leading-relaxed mb-6 opacity-95">
              Need help with the Small Groups CRM platform? Our support team is
              ready to assist you with technical issues, feature questions, or
              training resources.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MailOutlined className="text-2xl" />
                <div>
                  <p className="font-semibold">Email Support</p>
                  <a
                    href="mailto:support@harvestersng.org"
                    className="text-green-100 hover:underline"
                  >
                    support@harvestersng.org
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ClockCircleOutlined className="text-2xl" />
                <div>
                  <p className="font-semibold">Response Time</p>
                  <p className="text-green-100">
                    We typically respond within 24-48 hours
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <Link
                href="/login"
                className="inline-block px-8 py-4 bg-white text-ds-status-success rounded-lg hover:bg-ds-surface-sunken transition-colors shadow-lg font-semibold text-lg"
              >
                Login to CRM
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Map Notice */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-ds-chart-1/5 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-8 text-center">
            <GlobalOutlined className="text-5xl text-ds-chart-1 mb-4" />
            <h3 className="text-2xl font-bold text-ds-text-primary mb-4">
              Find Us Online
            </h3>
            <p className="text-ds-text-secondary mb-6">
              For detailed directions, service times, and contact information
              for specific campuses, please visit our main website.
            </p>
            <a
              href="https://harvestersng.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg font-semibold"
            >
              Visit Harvesters Website
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ds-surface-base text-white py-12 px-4">
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
