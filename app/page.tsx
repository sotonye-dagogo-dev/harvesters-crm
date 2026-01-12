import Link from "next/link";
import { HomeOutlined, InfoCircleOutlined } from "@ant-design/icons";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-church-primary/5 via-white to-church-accent/5 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="container mx-auto px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12 sm:mb-16 lg:mb-24">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-church-primary dark:text-green-400 mb-4 sm:mb-6 leading-tight">
              Church Fellowship CRM
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-8 sm:mb-10 max-w-3xl mx-auto px-4 leading-relaxed">
              Manage church subgroups, track member engagement, and support
              pastoral care through structured insights and informed
              decision-making.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
              <Link href="/register" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="large"
                  icon={<HomeOutlined />}
                  className="w-full sm:w-auto min-w-[200px]"
                >
                  Get Started
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="large"
                  className="w-full sm:w-auto min-w-[200px]"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12 sm:mb-16 lg:mb-20">
            <Card className="text-center p-6 sm:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <div className="w-16 h-16 bg-church-primary/10 dark:bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <HomeOutlined className="text-church-primary dark:text-green-400 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                Group Management
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Create and manage fellowship groups with ease. Track attendance
                and engagement.
              </p>
            </Card>

            <Card className="text-center p-6 sm:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <div className="w-16 h-16 bg-church-accent/10 dark:bg-yellow-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <InfoCircleOutlined className="text-church-accent dark:text-yellow-400 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                Member Analytics
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Get insights into member participation and identify
                opportunities for growth.
              </p>
            </Card>

            <Card className="text-center p-6 sm:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 md:col-span-2 lg:col-span-1 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <div className="w-16 h-16 bg-church-secondary/10 dark:bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <HomeOutlined className="text-church-secondary dark:text-blue-400 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                Pastoral Care
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Log interactions and follow-ups to support your congregation
                effectively.
              </p>
            </Card>
          </div>

          {/* Call to Action */}
          <Card className="bg-gradient-to-r from-church-primary to-church-primary/90 text-white p-8 sm:p-10 lg:p-12 shadow-xl">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
                Ready to Get Started?
              </h2>
              <p className="mb-8 opacity-95 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                Join thousands of churches already using our platform to
                strengthen their communities.
              </p>
              <Link href="/register" className="inline-block">
                <Button
                  variant="secondary"
                  size="large"
                  className="px-8 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Create Your Account
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
