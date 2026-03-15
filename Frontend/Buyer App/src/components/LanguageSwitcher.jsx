import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LanguageSwitcher = ({ isDark = false }) => {
    const { i18n } = useTranslation();

    const languages = [
        { code: "en", label: "English" },
        { code: "hi", label: "हिंदी" },
        { code: "ta", label: "தமிழ்" },
    ];

    const currentLanguage = languages.find((l) => l.code === i18n.language) || languages[0];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isDark ? "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                <Languages className="h-4 w-4" />
                <span className="hidden sm:inline">{currentLanguage.label}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        className={`cursor-pointer ${i18n.language === lang.code ? "bg-primary/10 font-bold" : ""}`}
                        onClick={() => i18n.changeLanguage(lang.code)}
                    >
                        {lang.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default LanguageSwitcher;
