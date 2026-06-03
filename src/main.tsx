import React, { useContext } from "react";
import { motion } from "motion/react";
import { Sun, Moon } from "lucide-react";
import { ThemeContext } from "../../contexts/AppContext";

export function ThemeToggle() {
  const context = useContext(ThemeContext);
  if (!context) return null;
  const { isDark, toggleTheme } = context;

  return (
    <button 
      onClick={toggleTheme}
      className="relative flex items-center w-14 h-7 p-1 rounded-full bg-neutral-200 dark:bg-neutral-800 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-inner group overflow-hidden"
      aria-label="Toggle dark mode"
    >
      <motion.div 
        className="w-5 h-5 bg-white dark:bg-blue-500 rounded-full flex items-center justify-center shadow-md border border-neutral-100 dark:border-blue-400 z-10"
        animate={{ x: isDark ? 28 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {isDark ? (
          <Moon className="w-3 h-3 text-white" />
        ) : (
          <Sun className="w-3 h-3 text-amber-500" />
        )}
      </motion.div>
      <span className="absolute left-1.5 opacity-40 dark:opacity-0 transition-opacity">
        <Sun className="w-3.5 h-3.5 text-amber-500" />
      </span>
      <span className="absolute right-1.5 opacity-0 dark:opacity-40 transition-opacity">
        <Moon className="w-3.5 h-3.5 text-blue-400" />
      </span>
    </button>
  );
}
