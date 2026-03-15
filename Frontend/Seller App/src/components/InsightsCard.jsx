import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export const InsightsCard = ({ title, description, icon: Icon = Sparkles, variant = "primary", delay = 0 }) => {
    const variants = {
        primary: "bg-blue-50/50 border-blue-100/50",
        success: "bg-emerald-50/50 border-emerald-100/50",
        accent: "bg-amber-50/50 border-amber-100/50",
        warning: "bg-red-50/50 border-red-100/50",
    };

    const accentBg = {
        primary: "bg-blue-500/10",
        success: "bg-emerald-500/10",
        accent: "bg-amber-500/10",
        warning: "bg-red-500/10",
    };

    const iconColors = {
        primary: "text-blue-600",
        success: "text-emerald-600",
        accent: "text-amber-600",
        warning: "text-red-600",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.8, ease: "easeOut" }}
            whileHover={{ y: -5, scale: 1.01 }}
            className={`group relative overflow-hidden rounded-[2rem] border p-6 shadow-sm backdrop-blur-md transition-all hover:shadow-2xl hover:bg-white bg-white/80 ${variants[variant] || variants.primary}`}
        >
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10 flex items-start gap-5">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:rotate-6 ${accentBg[variant] || accentBg.primary} ${iconColors[variant] || iconColors.primary}`}>
                    <Icon className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                    <h4 className="text-lg font-black tracking-tight text-slate-900 leading-tight">
                        {title}
                    </h4>
                    <p className="text-sm font-medium text-slate-500 leading-relaxed group-hover:text-slate-700 transition-colors">
                        {description}
                    </p>
                </div>
            </div>

            {/* Subtle decorative pattern or icon */}
            <div className={`absolute -bottom-8 -right-8 h-32 w-32 opacity-[0.03] transition-transform group-hover:scale-110 group-hover:rotate-12 ${iconColors[variant] || iconColors.primary}`}>
                <Icon className="h-full w-full" />
            </div>
        </motion.div>
    );
};
