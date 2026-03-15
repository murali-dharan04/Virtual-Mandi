import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    ListPlus,
    Package,
    ShoppingCart,
    LogOut,
    Wheat,
    Menu,
    X,
    Headset,
    CloudSun,
    TrendingUp,
    Leaf,
    Truck,
    Shield,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { sellerApi } from "@/lib/api";
import NotificationCenter from "@/components/NotificationCenter";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";

const navItems = (t) => [
    { title: t("nav.dashboard"), url: "/dashboard", icon: LayoutDashboard },
    { title: t("nav.listings"), url: "/listings", icon: Package },
    { title: t("nav.add_listing"), url: "/listings/new", icon: ListPlus },
    { title: t("nav.orders"), url: "/orders", icon: ShoppingCart },
    { title: t("nav.weather", "Weather Insights"), url: "/dashboard/weather", icon: CloudSun },
    { title: t("nav.market_trends", "Market Trends"), url: "/dashboard/trends", icon: TrendingUp },
    { title: "Disease Lab", url: "/dashboard/disease-lab", icon: Leaf },
    { title: "Logistics", url: "/dashboard/logistics", icon: Truck },
    { title: "Admin Insights", url: "/admin", icon: Shield },
    { title: "Support", url: "/support", icon: Headset },
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
    const initials = sellerName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);

    return (
        <div className="flex min-h-screen w-full bg-background">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-foreground/30 backdrop-blur-sm md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-sidebar text-sidebar-foreground transition-all duration-500 md:static md:translate-x-0 ${sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
                    }`}
            >
                <div className="absolute inset-0 z-0 bg-gradient-to-b from-sidebar-accent/10 to-sidebar/20 pointer-events-none" />

                {/* Logo */}
                <div className="relative z-10 flex flex-col gap-4 border-b border-sidebar-border px-6 py-8">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-gold shadow-lg shadow-gold/20 transform rotate-3 hover:rotate-0 transition-transform">
                            <Wheat className="h-6 w-6 text-sidebar-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black font-display tracking-tight text-sidebar-foreground uppercase">Virtual Mandi</h1>
                            <p className="text-[10px] font-black uppercase tracking-widest text-sidebar-primary/80">{t("nav.farmer_dashboard")}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="relative z-10 flex-1 space-y-1 px-4 py-8">
                    {navItems(t).map((item, i) => {
                        const isActive = location.pathname === item.url;
                        const isOrders = item.url === "/orders";
                        return (
                            <motion.div
                                key={item.url}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.06 + 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <NavLink
                                    to={item.url}
                                    end
                                    className={`relative flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-bold transition-colors duration-200 ${isActive
                                        ? "text-white"
                                        : "text-sidebar-foreground/60 hover:bg-white/5 hover:text-sidebar-foreground"
                                        }`}
                                    activeClassName=""
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="sidebarActive"
                                            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-sidebar-accent to-sidebar-accent/50"
                                            style={{
                                                boxShadow: "0 0 20px rgba(255,140,0,0.25), 0 0 0 1px rgba(255,140,0,0.2)"
                                            }}
                                            transition={{ type: "spring", stiffness: 500, damping: 40 }}
                                        />
                                    )}
                                    <div className="relative z-10 flex items-center gap-3">
                                        <item.icon className={`h-5 w-5 transition-colors ${isActive ? "text-yellow-300" : "text-sidebar-foreground/40"
                                            }`} />
                                        <span>{item.title}</span>
                                    </div>
                                    {isOrders && pendingOrders > 0 && (
                                        <span className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-black text-white shadow-lg animate-pulse">
                                            {pendingOrders}
                                        </span>
                                    )}
                                </NavLink>
                            </motion.div>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="relative z-10 border-t border-sidebar-border p-6 space-y-4">
                    <LanguageSwitcher />
                    <button
                        onClick={() => {
                            localStorage.removeItem("sellerToken");
                            localStorage.removeItem("sellerUser");
                            navigate("/");
                        }}
                        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-destructive/80 transition-all hover:bg-destructive/10 hover:text-destructive"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>{t("nav.logout")}</span>
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Top bar */}
                <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b bg-background/60 backdrop-blur-2xl px-6 md:px-10">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="rounded-lg p-2 text-foreground hover:bg-muted md:hidden"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <div className="flex-1">
                        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest md:hidden">Virtual Mandi</h2>
                    </div>
                    <div className="flex items-center gap-6">
                        <ThemeToggle />
                        <div className="h-8 w-px bg-border/60"></div>
                        <NotificationCenter />
                        <div className="flex items-center gap-3 border-l border-border pl-6">
                            <div className="h-10 w-10 rounded-2xl gradient-hero flex items-center justify-center text-xs font-black text-white shadow-lg border-2 border-white/20">
                                {initials}
                            </div>
                            <div className="hidden md:block">
                                <p className="text-sm font-black text-foreground leading-none">{sellerName}</p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1 tracking-tighter">Verified Farmer</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 md:p-6">{children}</main>
            </div>
        </div>
    );
}
