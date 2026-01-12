"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { Button } from "antd";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Prevent hydration mismatch - using setTimeout to avoid cascading renders
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <Button
        type="default"
        icon={<SunOutlined className="text-lg" />}
        className="flex items-center justify-center h-10 w-10 rounded-full shadow-md hover:shadow-lg transition-all duration-300"
        aria-label="Toggle theme"
      />
    );
  }

  return (
    <Button
      type="default"
      icon={
        theme === "dark" ? (
          <SunOutlined className="text-lg text-yellow-500" />
        ) : (
          <MoonOutlined className="text-lg text-blue-600" />
        )
      }
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex items-center justify-center h-10 w-10 rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 bg-white dark:bg-slate-800"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    />
  );
}
