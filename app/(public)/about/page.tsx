import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import {
  HeartOutlined,
  GlobalOutlined,
  TeamOutlined,
  RiseOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

export const metadata: Metadata = {
  title: "About Us | Harvesters International Christian Centre",
  description:
    "Learn about Harvesters International Christian Centre - Founded in 2003 by Pastor Bolaji Idowu, now serving 70,000+ worshippers across Nigeria, UK, and USA.",
  keywords:
    "Harvesters Church, Pastor Bolaji Idowu, HICC About, Lagos church history, Harvesters vision",
};

export default function AboutPage() {
  const values = [
    {
      icon: <HeartOutlined className="text-4xl" />,
      title: "Connect People with God",
      description:
        "We exist to create meaningful encounters where lives are transformed through genuine relationship with God.",
      color: "bg-ds-status-error/5 dark:bg-red-900/20 text-ds-status-error",
    },
    {
      icon: <GlobalOutlined className="text-4xl" />,
      title: "Influence Culture",
      description:
        "We pioneer thriving churches in key global cities that shape culture and bring lasting impact to communities.",
      color: "bg-ds-chart-1/5 dark:bg-blue-900/20 text-ds-chart-1",
    },
    {
      icon: <TeamOutlined className="text-4xl" />,
      title: "Bring Hope & Change",
      description:
        "We are committed to changing lives by providing hope, support, and transformation through church communities.",
      color:
        "bg-ds-status-success/5 dark:bg-green-900/20 text-ds-status-success",
    },
    {
      icon: <RiseOutlined className="text-4xl" />,
      title: "Develop Devoted Followers",
      description:
        "We lead people to become fully devoted followers of Christ through intentional discipleship and pastoral care.",
      color: "bg-purple-50 dark:bg-purple-900/20 text-ds-chart-3",
    },
  ];

  const locations = [
    {
      country: "Nigeria",
      cities: [
        "Lekki",
        "Gbagada",
        "Anthony",
        "Magodo",
        "Ikeja GRA",
        "Ajah",
        "Ikorodu",
        "Ibadan",
        "Abuja",
        "Yaba",
        "Alimosho",
      ],
    },
    { country: "United Kingdom", cities: ["London"] },
    { country: "United States", cities: ["USA"] },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
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
              className="text-ds-status-success font-semibold"
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
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-ds-text-primary mb-6">
            About Harvesters International
            <span className="block text-ds-status-success mt-2">
              Christian Centre
            </span>
          </h1>
          <p className="text-xl text-ds-text-secondary max-w-3xl mx-auto leading-relaxed">
            Changing lives by pioneering thriving churches in key global cities
            that bring hope, connect people with God, influence culture, and
            lead people to become fully devoted followers of Christ.
          </p>
        </div>
      </section>

      {/* History Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-ds-surface-elevated rounded-3xl shadow-ds-xl p-8 md:p-12">
            <h2 className="text-4xl font-bold text-ds-text-primary mb-6">
              Our Story
            </h2>
            <div className="space-y-6 text-lg text-ds-text-secondary leading-relaxed">
              <p>
                Founded on <strong>December 13th, 2003</strong> by{" "}
                <strong>Pastor Bolaji Idowu</strong>, Harvesters International
                Christian Centre began with a handful of devoted believers and a
                powerful vision to change lives through the gospel.
              </p>
              <p>
                From its humble beginnings, Harvesters has experienced
                exponential growth, now serving over{" "}
                <strong className="text-ds-status-success">
                  70,000+ worshippers
                </strong>{" "}
                across multiple locations in Nigeria, the United Kingdom, and
                the United States of America.
              </p>
              <p>
                What started as one congregation in Lagos has become a thriving
                multi-campus church with a global reach. Each campus maintains
                the core DNA of Harvesters while serving their local communities
                with excellence and love.
              </p>
              <p>
                Our growth is not measured only in numbers, but in the countless
                lives transformed, families restored, and communities impacted
                by the love of Christ. Every testimony of healing, breakthrough,
                and salvation fuels our passion to continue pioneering thriving
                churches.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-ds-text-primary mb-12">
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-ds-surface-elevated rounded-2xl shadow-ds-xl p-8 hover:shadow-ds-xl transition-shadow"
              >
                <div
                  className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 ${value.color}`}
                >
                  {value.icon}
                </div>
                <h3 className="text-2xl font-bold text-ds-text-primary mb-3">
                  {value.title}
                </h3>
                <p className="text-ds-text-secondary leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Locations Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-ds-text-primary mb-4">
              Our Global Presence
            </h2>
            <p className="text-xl text-ds-text-secondary">
              Serving communities across three continents
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {locations.map((location, index) => (
              <div
                key={index}
                className="bg-ds-surface-elevated rounded-2xl shadow-ds-xl p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-ds-status-success/5 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                    <EnvironmentOutlined className="text-2xl text-ds-status-success" />
                  </div>
                  <h3 className="text-2xl font-bold text-ds-text-primary">
                    {location.country}
                  </h3>
                </div>
                <ul className="space-y-2">
                  {location.cities.map((city, cityIndex) => (
                    <li
                      key={cityIndex}
                      className="text-ds-text-secondary flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 bg-green-600 dark:bg-green-400 rounded-full"></span>
                      {city}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Church CRM Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl shadow-ds-xl p-8 md:p-12 text-white">
            <h2 className="text-4xl font-bold mb-6">
              Community Groups: The Heart of Our Church
            </h2>
            <p className="text-lg leading-relaxed mb-6 opacity-95">
              At Harvesters, we believe that life transformation happens best in
              the context of community groups. Our Church CRM platform empowers
              leaders to effectively manage fellowships, track engagement, and
              provide exceptional pastoral care.
            </p>
            <p className="text-lg leading-relaxed opacity-95">
              Through intentional discipleship, consistent follow-up, and
              data-driven insights, we ensure that every member is known,
              connected, and growing in their faith journey.
            </p>
            <div className="mt-8">
              <Link
                href="/register"
                className="inline-block px-8 py-4 bg-white text-ds-status-success rounded-lg hover:bg-ds-surface-sunken transition-colors shadow-lg font-semibold text-lg"
              >
                Join Harvesters Today
              </Link>
            </div>
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
