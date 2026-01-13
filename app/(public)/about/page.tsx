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
      color: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
    },
    {
      icon: <GlobalOutlined className="text-4xl" />,
      title: "Influence Culture",
      description:
        "We pioneer thriving churches in key global cities that shape culture and bring lasting impact to communities.",
      color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    },
    {
      icon: <TeamOutlined className="text-4xl" />,
      title: "Bring Hope & Change",
      description:
        "We are committed to changing lives by providing hope, support, and transformation through small group communities.",
      color:
        "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    },
    {
      icon: <RiseOutlined className="text-4xl" />,
      title: "Develop Devoted Followers",
      description:
        "We lead people to become fully devoted followers of Christ through intentional discipleship and pastoral care.",
      color:
        "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
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
              className="text-green-600 dark:text-green-400 font-semibold"
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
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            About Harvesters International
            <span className="block text-green-600 dark:text-green-400 mt-2">
              Christian Centre
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Changing lives by pioneering thriving churches in key global cities
            that bring hope, connect people with God, influence culture, and
            lead people to become fully devoted followers of Christ.
          </p>
        </div>
      </section>

      {/* History Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 md:p-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Our Story
            </h2>
            <div className="space-y-6 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>
                Founded on <strong>December 13th, 2003</strong> by{" "}
                <strong>Pastor Bolaji Idowu</strong>, Harvesters International
                Christian Centre began with a handful of devoted believers and a
                powerful vision to change lives through the gospel.
              </p>
              <p>
                From its humble beginnings, Harvesters has experienced
                exponential growth, now serving over{" "}
                <strong className="text-green-600 dark:text-green-400">
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
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow"
              >
                <div
                  className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 ${value.color}`}
                >
                  {value.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
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
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Global Presence
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Serving communities across three continents
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {locations.map((location, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                    <EnvironmentOutlined className="text-2xl text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {location.country}
                  </h3>
                </div>
                <ul className="space-y-2">
                  {location.cities.map((city, cityIndex) => (
                    <li
                      key={cityIndex}
                      className="text-gray-600 dark:text-gray-300 flex items-center gap-2"
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

      {/* Small Groups CRM Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl shadow-2xl p-8 md:p-12 text-white">
            <h2 className="text-4xl font-bold mb-6">
              Small Groups: The Heart of Our Community
            </h2>
            <p className="text-lg leading-relaxed mb-6 opacity-95">
              At Harvesters, we believe that life transformation happens best in
              the context of small group communities. Our Small Groups CRM
              platform empowers leaders to effectively manage fellowships, track
              engagement, and provide exceptional pastoral care.
            </p>
            <p className="text-lg leading-relaxed opacity-95">
              Through intentional discipleship, consistent follow-up, and
              data-driven insights, we ensure that every member is known,
              connected, and growing in their faith journey.
            </p>
            <div className="mt-8">
              <Link
                href="/register"
                className="inline-block px-8 py-4 bg-white text-green-600 rounded-lg hover:bg-gray-100 transition-colors shadow-lg font-semibold text-lg"
              >
                Join a Small Group Today
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
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
