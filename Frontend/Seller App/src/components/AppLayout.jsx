import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    Plus,
    ListPlus,
    Package,
    ShoppingCart,
    LogOut,
    Wheat,
    X,
    Headset,
    CloudSun,
    TrendingUp,
    Leaf,
    Truck,
    Shield,
    Receipt,
    User as UserIcon,
    Settings,
    HelpCircle,
    ChevronDown,
    Menu,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NavLink } from "@/components/NavLink";
import { sellerApi } from "@/lib/api";
import NotificationCenter from "@/components/NotificationCenter";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";

const navGroups = (t) => [
    {
        label: "Main",
        items: [
            { title: t("nav.dashboard"), url: "/dashboard", icon: LayoutDashboard },
            { title: t("nav.listings"), url: "/listings", icon: Package },
            { title: t("nav.add_listing"), url: "/listings/new", icon: ListPlus },
        ]
    },
    {
        label: "Operations",
        items: [
            { title: t("nav.orders"), url: "/orders", icon: ShoppingCart },
            { title: "Transactions", url: "/transactions", icon: Receipt },
        ]
    },
    {
        label: "Insights",
        items: [
            { title: t("nav.weather", "Weather Insights"), url: "/dashboard/weather", icon: CloudSun },
            { title: t("nav.market_trends", "Market Trends"), url: "/dashboard/trends", icon: TrendingUp },
            { title: "Disease Lab", url: "/dashboard/disease-lab", icon: Leaf },
        ]
    },
    {
        label: "System",
        items: [
            { title: "Logistics", url: "/dashboard/logistics", icon: Truck },
            { title: "Admin Insights", url: "/admin", icon: Shield },
            { title: "Support", url: "/support", icon: Headset },
        ]
    }
];

export function AppLayout({ children }) {
    const { t } = useTranslation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem("sellerUser");
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.error("Failed to parse sellerUser:", e);
            return null;
        }
    });
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("sellerToken");
            if (token && !user) {
                try {
                    const profile = await sellerApi.getProfile();
                    if (profile.id) {
                        setUser(profile);
                        localStorage.setItem("sellerUser", JSON.stringify(profile));
                    }
                } catch (err) {
                    console.error("Failed to fetch profile:", err);
                }
            }
        };
        fetchProfile();
    }, [user]);

    const [pendingOrders, setPendingOrders] = useState(0);

    const handleLogout = () => {
        localStorage.removeItem("sellerToken");
        localStorage.removeItem("sellerUser");
        navigate("/");
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const stats = await sellerApi.getDashboardStats();
                if (stats && typeof stats.pendingOrders === "number") {
                    setPendingOrders(stats.pendingOrders);
                }
            } catch (err) {
                console.error("Failed to fetch stats:", err);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 10000);
        return () => clearInterval(interval);
    }, []);

    const sellerName = user?.name || "Seller";
    const sellerEmail = user?.email || "seller@example.com";
    const initials = sellerName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);

    return (
        <div className="flex min-h-screen w-full bg-background transition-colors duration-200 ease-in-out">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-md md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-card/50 backdrop-blur-xl border-r border-border/50 text-foreground transition-all duration-200 ease-in-out md:static md:translate-x-0 ${sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
                    }`}
            >
                {/* Logo */}
                <div className="flex flex-col gap-4 border-b border-border/50 px-6 py-6">
                    <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/dashboard')}>
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 shadow-xl shadow-emerald-600/20 transform group-hover:rotate-6 transition-transform">
                            <Wheat className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tight uppercase">Virtual <span className="text-emerald-600">Mandi</span></h1>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("nav.farmer_dashboard")}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation Scroll Area */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 custom-scrollbar">
                    {navGroups(t).map((group) => (
                        <div key={group.label} className="space-y-4">
                            <p className="px-4 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">{group.label}</p>
                            <div className="space-y-1">
                                {group.items.map((item, i) => {
                                    const isActive = location.pathname === item.url;
                                    const isOrders = item.url === "/orders";
                                    return (
                                        <motion.div
                                            key={item.url}
                                            whileHover={{ x: 4 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                        >
                                            <button
                                                onClick={() => {
                                                    navigate(item.url);
                                                    setSidebarOpen(false);
                                                }}
                                                className={`relative w-full flex items-center justify-between rounded-2xl px-5 py-3 text-base font-bold transition-all duration-200 ease-in-out group ${isActive
                                                    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 shadow-sm border border-emerald-500/10"
                                                    : "text-muted-foreground hover:bg-slate-100/80 dark:hover:bg-slate-800/50 hover:text-foreground dark:hover:text-white"
                                                    }`}
                                            >
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="sidebarActiveLine"
                                                        className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                                    />
                                                )}
                                                <div className="flex items-center gap-4">
                                                    <item.icon className={`h-6 w-6 transition-transform group-hover:scale-110 ${isActive ? "text-emerald-600" : "text-muted-foreground/60"
                                                        }`} />
                                                    <span>{item.title}</span>
                                                </div>
                                                {isOrders && pendingOrders > 0 && (
                                                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-[11px] font-black text-white shadow-lg shadow-emerald-600/20">
                                                        {pendingOrders}
                                                    </span>
                                                )}
                                            </button>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sidebar Footer */}
                <div className="border-t border-border/50 p-6 space-y-4 bg-slate-50/30 dark:bg-slate-900/30">
                    <LanguageSwitcher />
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-base font-black text-rose-500 transition-all hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-transparent hover:border-rose-100 dark:hover:border-rose-500/20"
                    >
                        <LogOut className="h-5 w-5" />
                        <span>{t("nav.logout")}</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col overflow-hidden relative">
                {/* Navbar */}
                <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-border/50 bg-background/60 backdrop-blur-2xl px-6 md:px-10">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="rounded-xl p-2.5 text-foreground hover:bg-muted md:hidden border border-border/50"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    
                    <div className="flex-1 hidden md:block">
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">System Operational</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 md:gap-8">
                        <ThemeToggle />
                        
                        <div className="relative group">
                            <NotificationCenter />
                            {pendingOrders > 0 && (
                                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-background animate-bounce" />
                            )}
                        </div>

                        <button
                            onClick={handleLogout}
                            className="hidden sm:flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 border border-rose-500/10 hover:bg-rose-500 hover:text-white transition-all duration-200 active:scale-90 group/logout"
                            title={t("nav.logout")}
                        >
                            <LogOut className="h-5 w-5" />
                        </button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="flex items-center gap-4 pl-8 border-l border-border/50 group cursor-pointer">
                                    <div className="relative">
                                        <div className="h-11 w-11 rounded-2xl bg-emerald-600/10 dark:bg-emerald-500/10 flex items-center justify-center text-sm font-black text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-500/20 group-hover:scale-110 transition-transform duration-200 ease-in-out">
                                            {initials}
                                        </div>
                                        <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-background shadow-sm" />
                                    </div>
                                    <div className="hidden lg:block text-left">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-black text-foreground leading-none group-hover:text-emerald-600 transition-colors uppercase italic">{sellerName}</p>
                                            <ChevronDown className="h-3 w-3 text-muted-foreground group-hover:text-emerald-600 transition-transform group-hover:translate-y-0.5" />
                                        </div>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase mt-1 tracking-widest opacity-60">{sellerEmail}</p>
                                    </div>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64 rounded-3xl p-2 border border-border shadow-2xl backdrop-blur-xl bg-background/95">
                                <DropdownMenuLabel className="px-4 py-3">
                                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-50 mb-1">Seller Account</p>
                                    <p className="text-sm font-bold text-foreground">{sellerName}</p>
                                    <p className="text-[10px] text-muted-foreground">{sellerEmail}</p>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-border/50" />
                                <DropdownMenuItem onClick={() => navigate('/profile')} className="rounded-2xl px-4 py-3 cursor-pointer focus:bg-emerald-50 dark:focus:bg-emerald-500/10 focus:text-emerald-600">
                                    <UserIcon className="mr-3 h-4 w-4" />
                                    <span className="font-bold">My Profile</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate('/profile')} className="rounded-2xl px-4 py-3 cursor-pointer focus:bg-emerald-50 dark:focus:bg-emerald-500/10 focus:text-emerald-600">
                                    <Settings className="mr-3 h-4 w-4" />
                                    <span className="font-bold">Settings</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate('/support')} className="rounded-2xl px-4 py-3 cursor-pointer focus:bg-emerald-50 dark:focus:bg-emerald-500/10 focus:text-emerald-600">
                                    <HelpCircle className="mr-3 h-4 w-4" />
                                    <span className="font-bold">Help & Support</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-border/50" />
                                <DropdownMenuItem onClick={handleLogout} className="rounded-2xl px-4 py-3 cursor-pointer text-rose-500 focus:bg-rose-50 dark:focus:bg-rose-500/10 focus:text-rose-500">
                                    <LogOut className="mr-3 h-4 w-4" />
                                    <span className="font-black italic uppercase tracking-tighter">Sign Out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Main Viewport */}
                <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-[#020617] p-4 md:p-6 custom-scrollbar relative">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>

                    {/* Floating Action Button (FAB) */}
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.1, y: -4 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate('/listings/new')}
                        className="fixed bottom-8 right-8 z-40 h-16 w-16 md:h-20 md:w-20 rounded-3xl bg-emerald-600 text-white shadow-2xl shadow-emerald-500/40 flex items-center justify-center group border-4 border-white dark:border-slate-800"
                    >
                        <Plus className="h-8 w-8 transition-transform group-hover:rotate-90 duration-500" />
                        <span className="absolute right-full mr-4 px-4 py-2 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none shadow-xl">
                            Add New Product
                        </span>
                    </motion.button>
                </main>
            </div>
        </div>
    );
}
