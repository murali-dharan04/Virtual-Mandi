import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export function StatCard({ title, value, icon: Icon, description, className }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            whileHover={{ y: -5, scale: 1.02 }}
        >
            <Card className={`group relative overflow-hidden rounded-[2rem] border-slate-100 bg-white p-7 shadow-[0_10px_40px_rgba(0,0,0,0.04)] transition-all hover:shadow-2xl hover:border-blue-100 ${className ?? ""}`}>
                {/* Glossy Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10 flex items-center gap-6">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-transform group-hover:rotate-6 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                        <Icon className="h-8 w-8" />
                    </div>
                    <div className="min-w-0 space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-blue-500 transition-colors">
                            {title}
                        </p>
                        <p className="text-3xl font-black tracking-tighter text-slate-950 font-display">
                            {value}
                        </p>
                        {description && (
                            <p className="text-xs font-medium text-slate-500 line-clamp-1">
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Decorative background element */}
                <div className="absolute -bottom-8 -right-8 h-24 w-24 opacity-5 group-hover:scale-125 transition-transform text-blue-600">
                    <Icon className="h-full w-full" />
                </div>
            </Card>
        </motion.div>
    );
}
