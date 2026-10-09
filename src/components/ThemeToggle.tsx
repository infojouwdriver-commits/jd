
"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

interface ThemeToggleProps {
  variant?: "default" | "driver";
}

export function ThemeToggle({ variant = "default" }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={
          variant === "driver"
            ? "w-9 h-9 rounded-xl flex items-center justify-center"
            : "w-9 h-9 rounded-lg flex items-center justify-center"
        }
        style={
          variant === "driver"
            ? { background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.15)" }
            : {}
        }
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  const cycleTheme = () => {
    if (theme === "system") {
      setTheme(isDark ? "light" : "dark");
    } else if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("system");
    }
  };

  if (variant === "driver") {
    return (
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={cycleTheme}
        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all relative overflow-hidden"
        style={{
          background: "rgba(212,175,55,0.08)",
          border: "1px solid rgba(212,175,55,0.15)",
        }}
        title={theme === "system" ? "System" : isDark ? "Dark" : "Light"}
      >
        <motion.div
          key={theme}
          initial={{ scale: 0, rotate: -90, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0, rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {theme === "system" ? (
            <Monitor className="w-4 h-4" style={{ color: "rgba(212,175,55,0.8)" }} />
          ) : isDark ? (
            <Moon className="w-4 h-4" style={{ color: "rgba(212,175,55,0.8)" }} />
          ) : (
            <Sun className="w-4 h-4" style={{ color: "rgba(212,175,55,0.8)" }} />
          )}
        </motion.div>
      </motion.button>
    );
  }

  return (
    <button
      onClick={cycleTheme}
      className="w-9 h-9 rounded-lg flex items-center justify-center border border-border hover:bg-accent transition-colors relative overflow-hidden"
      title={theme === "system" ? "System theme" : isDark ? "Dark mode" : "Light mode"}
    >
      <motion.div
        key={theme}
        initial={{ scale: 0, rotate: -90, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        exit={{ scale: 0, rotate: 90, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {theme === "system" ? (
          <Monitor className="w-4 h-4 text-foreground/70" />
        ) : isDark ? (
          <Moon className="w-4 h-4 text-foreground/70" />
        ) : (
          <Sun className="w-4 h-4 text-foreground/70" />
        )}
      </motion.div>
    </button>
  );
}
