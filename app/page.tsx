import Link from "next/link";
import {
  TeamOutlined,
  BarChartOutlined,
  HeartOutlined,
  CheckCircleOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="container mx-auto px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-20 sm:mb-24 lg:mb-32">
            <div className="inline-block mb-6 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full">
              <span className="text-sm font-medium text-green-800 dark:text-green-300">
                Empowering Church Communities
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 leading-tight tracking-tight">
              Church Fellowship{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400">
                CRM
              </span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-10 sm:mb-12 max-w-4xl mx-auto px-4 leading-relaxed font-light">
              Manage church subgroups, track member engagement, and support
              pastoral care through structured insights and informed
              decision-making.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center items-center px-4 max-w-md mx-auto sm:max-w-none">
              <Link href="/register" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="large"
                  icon={<RocketOutlined />}
                  className="w-full sm:w-auto px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Get Started Free
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="large"
                  className="w-full sm:w-auto px-8 py-6 text-lg font-semibold border-2 hover:bg-gray-50 dark:hover:bg-slate-800"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 mb-20 sm:mb-24 lg:mb-32">
            <Card className="text-center p-8 sm:p-10 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 group">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <TeamOutlined className="text-green-600 dark:text-green-400 text-4xl" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Group Management
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-base">
                Create and manage fellowship groups with ease. Track attendance,
                schedule meetings, and monitor engagement seamlessly.
              </p>
            </Card>

            <Card className="text-center p-8 sm:p-10 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <BarChartOutlined className="text-blue-600 dark:text-blue-400 text-4xl" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Member Analytics
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-base">
                Get powerful insights into member participation patterns and
                identify opportunities for meaningful growth.
              </p>
            </Card>

            <Card className="text-center p-8 sm:p-10 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 sm:col-span-2 lg:col-span-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 group">
              <div className="w-20 h-20 bg-gradient-to-br from-rose-100 to-rose-200 dark:from-rose-900/30 dark:to-rose-800/30 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <HeartOutlined className="text-rose-600 dark:text-rose-400 text-4xl" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Pastoral Care
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-base">
                Log interactions and follow-ups to support your congregation
                effectively with organized pastoral outreach.
              </p>
            </Card>
          </div>

          {/* Benefits Section */}
          <div className="bg-gradient-to-br from-gray-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-3xl p-10 sm:p-12 lg:p-16 mb-20 sm:mb-24 border border-gray-200 dark:border-slate-700">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-gray-900 dark:text-white mb-12 sm:mb-16">
              Everything You Need
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <CheckCircleOutlined className="text-green-600 dark:text-green-400 text-2xl" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Real-time Tracking
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Monitor attendance and engagement metrics in real-time with
                    intuitive dashboards.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <CheckCircleOutlined className="text-green-600 dark:text-green-400 text-2xl" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Mobile Friendly
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Access your church data anywhere, anytime from any device
                    with responsive design.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <CheckCircleOutlined className="text-green-600 dark:text-green-400 text-2xl" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Secure & Private
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Your data is protected with enterprise-grade security and
                    privacy controls.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <CheckCircleOutlined className="text-green-600 dark:text-green-400 text-2xl" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Easy to Use
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Intuitive interface designed for church leaders of all tech
                    skill levels.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <Card className="bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 dark:from-green-700 dark:via-green-800 dark:to-emerald-800 text-white p-10 sm:p-12 lg:p-16 shadow-2xl rounded-3xl border-0 overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzAtMS4xLS45LTItMi0ycy0yIC45LTIgMiAuOSAyIDIgMiAyLS45IDItMnptMCA0MGMwLTEuMS0uOS0yLTItMnMtMiAuOS0yIDIgLjkgMiAyIDIgMi0uOSAyLTJ6TTIyIDE0YzAtMS4xLS45LTItMi0ycy0yIC45LTIgMiAuOSAyIDIgMiAyLS45IDItMnptMCA0MGMwLTEuMS0uOS0yLTItMnMtMiAuOS0yIDIgLjkgMiAyIDIgMi0uOSAyLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10"></div>
            <div className="text-center relative z-10">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5 sm:mb-6">
                Ready to Transform Your Church?
              </h2>
              <p className="mb-10 sm:mb-12 text-green-50 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
                Join churches worldwide using our platform to strengthen their
                communities and deepen member connections.
              </p>
              <Link href="/register" className="inline-block">
                <Button
                  variant="secondary"
                  size="large"
                  className="px-10 py-6 text-lg font-bold shadow-2xl hover:shadow-3xl transition-all bg-white text-green-700 hover:bg-green-50 border-0"
                >
                  Create Your Free Account
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            © {new Date().getFullYear()} Church Fellowship CRM. Built with ❤️
            for churches worldwide.
          </p>
        </div>
      </footer>
    </main>
  );
}
