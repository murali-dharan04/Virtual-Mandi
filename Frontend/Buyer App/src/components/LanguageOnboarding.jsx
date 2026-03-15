import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Leaf, Globe2 } from "lucide-react";

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background p-6 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-accent/5 blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-full max-w-lg text-center"
            >
                <div className="mb-8 flex flex-col items-center">
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-elevated">
                        <Leaf className="h-10 w-10" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                        Virtual Mandi
                    </h1>
                    <div className="mt-3 flex items-center gap-2 text-muted-foreground">
                        <Globe2 className="h-4 w-4" />
                        <p className="text-sm font-medium">Select your preferred language</p>
                    </div>
                </div>

                <div className="grid gap-4">
                    {languages.map((lang, idx) => (
                        <motion.button
                            key={lang.code}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * idx }}
                            onClick={() => handleSelect(lang.code)}
                            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 text-left transition-all hover:border-transparent hover:shadow-elevated"
                        >
                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity bg-gradient-to-r ${lang.color}`} />
                            <div className="relative flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                                        {lang.label}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">{lang.sub}</p>
                                </div>
                                <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${lang.color} opacity-40 group-hover:opacity-100 transition-opacity`} />
                            </div>
                        </motion.button>
                    ))}
                </div>

                <p className="mt-10 text-xs text-muted-foreground">
                    You can always change this later in settings.
                </p>
            </motion.div>
        </div>
    );
};

export default LanguageOnboarding;
