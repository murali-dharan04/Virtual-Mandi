import { Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const ThemeToggle = () => {
    const [isDark, setIsDark] = useState(() => {
        return document.documentElement.classList.contains("dark") ||
            localStorage.getItem("theme") === "dark";
    });

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [isDark]);

    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsDark(!isDark)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/50 border border-border/50 text-foreground transition-colors hover:bg-secondary"
            aria-label="Toggle Theme"
        >
            <motion.div
                initial={false}
                animate={{ rotate: isDark ? 180 : 0, scale: isDark ? 0 : 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                className="absolute"
            >
                <Sun className="h-5 w-5 text-amber-500" />
            </motion.div>
            <motion.div
                initial={false}
                animate={{ rotate: isDark ? 0 : -180, scale: isDark ? 1 : 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                className="absolute"
            >
                <Moon className="h-5 w-5 text-emerald-400" />
            </motion.div>
        </motion.button>
    );
};

export default ThemeToggle;
