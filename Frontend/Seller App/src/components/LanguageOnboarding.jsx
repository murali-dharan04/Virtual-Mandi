import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { LayoutDashboard, Globe2 } from "lucide-react";

const LanguageOnboarding = ({ onComplete }) => {
    const { i18n } = useTranslation();

    const languages = [
        { code: "en", label: "English", sub: "Continue in English", color: "from-blue-500 to-indigo-600" },
        { code: "hi", label: "हिंदी", sub: "हिंदी में जारी रखें", color: "from-orange-500 to-red-600" },
        { code: "ta", label: "தமிழ்", sub: "தமிழில் தொடரவும்", color: "from-emerald-500 to-teal-600" },
    ];

    const handleSelect = (code) => {
        i18n.changeLanguage(code);
        localStorage.setItem("onboarding_complete", "true");
        onComplete();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#080a08] p-6 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl opacity-30" />
                <div className="absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-accent/10 blur-3xl opacity-30" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-lg text-center"
            >
                <div className="mb-10 flex flex-col items-center">
                    <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-[0_0_40px_rgba(30,150,50,0.3)]">
                        <LayoutDashboard className="h-12 w-12" />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                        Virtual Mandi
                    </h1>
                    <p className="mt-2 text-primary uppercase tracking-widest text-xs font-bold">Farmer Console</p>
                    <div className="mt-6 flex items-center gap-2 text-zinc-400">
                        <Globe2 className="h-4 w-4" />
                        <p className="text-sm font-medium">Select your preferred language</p>
                    </div>
                </div>

                <div className="grid gap-4">
                    {languages.map((lang, idx) => (
                        <motion.button
                            key={lang.code}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * idx }}
                            onClick={() => handleSelect(lang.code)}
                            className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-[#121512] p-6 text-left transition-all hover:border-primary/50 hover:bg-[#181c18]"
                        >
                            <div className="relative flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-white group-hover:text-primary transition-colors">
                                        {lang.label}
                                    </h3>
                                    <p className="text-sm text-zinc-500">{lang.sub}</p>
                                </div>
                                <div className={`h-12 w-12 flex items-center justify-center rounded-xl bg-gradient-to-br ${lang.color} opacity-20 group-hover:opacity-100 transition-all transform group-hover:scale-110`}>
                                    <Globe2 className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>

                <p className="mt-12 text-xs text-zinc-500">
                    Set your language once, trade freely in your own tongue.
                </p>
            </motion.div>
        </div>
    );
};

export default LanguageOnboarding;
