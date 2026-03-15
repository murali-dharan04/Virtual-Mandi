import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ShoppingCart, Package, Receipt, LogOut, Menu, X, Leaf, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import NotificationCenter from "./NotificationCenter";
import VoiceSearch from "./VoiceSearch";

import { api } from "@/services/api";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
    const { t } = useTranslation();
    const { user, isAuthenticated, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeOrdersCount, setActiveOrdersCount] = useState(0);

    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchOrders = async () => {
            try {
                const orders = await api.getOrders();
                if (Array.isArray(orders)) {
                    // Count active orders (pending, accepted, shipped)
                    const count = orders.filter(o =>
                        o && o.status && ["pending", "accepted", "shipped"].includes((o.status || "").toLowerCase())
                    ).length;
                    setActiveOrdersCount(count);
                }
            } catch (err) {
                console.error("Failed to fetch orders for badge:", err);
            }
        };

        fetchOrders();
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, [isAuthenticated]);

    const links = [
        { to: "/", label: t("nav.browse"), icon: ShoppingCart },
        { to: "/intelligence", label: "Intelligence", icon: Zap },
        { to: "/orders", label: t("nav.orders"), icon: Package },
        { to: "/transactions", label: t("nav.transactions"), icon: Receipt },
    ];

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    if (!isAuthenticated) return null;

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 shadow-sm transition-all duration-300">
            <div className="container relative z-10 flex h-20 items-center justify-between">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-green-600 shadow-lg shadow-green-500/30 transition-transform group-hover:scale-105">
                        <Leaf className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black tracking-tight text-gray-900 leading-none">
                            Virtual<span className="text-primary">Mandi</span>
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Farm to Table</span>
                    </div>
                </Link>

                {/* Desktop */}
                <div className="hidden items-center gap-1 md:flex bg-secondary/50 p-1.5 rounded-2xl border border-secondary">
                    {links.map(({ to, label, icon: Icon }) => (
                        <Link
                            key={to}
                            to={to}
                            className={`relative flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-colors duration-200 ${isActive(to)
                                ? "text-primary"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {isActive(to) && (
                                <motion.div
                                    layoutId="navPill"
                                    className="absolute inset-0 rounded-xl bg-white shadow-sm ring-1 ring-black/5"
                                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                <Icon className={`h-4 w-4 ${isActive(to) ? "stroke-[2.5px]" : ""}`} />
                                {label}
                            </span>
                            {to === "/orders" && activeOrdersCount > 0 && (
                                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md ring-2 ring-white z-20">
                                    {activeOrdersCount}
                                </span>
                            )}
                        </Link>
                    ))}
                </div>

                <div className="hidden items-center gap-5 md:flex">
                    <ThemeToggle />
                    <div className="h-8 w-px bg-border/60"></div>
                    <LanguageSwitcher />
                    <div className="h-8 w-px bg-border/60"></div>
                    <VoiceSearch />
                    <div className="h-8 w-px bg-border/60"></div>
                    <NotificationCenter />

                    <div className="flex items-center gap-3 pl-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border border-white shadow-inner text-sm font-black text-gray-700">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <button
                            onClick={handleLogout}
                            className="group flex items-center gap-2 rounded-full border border-border bg-transparent pr-4 pl-2 py-1.5 text-sm font-medium transition-all hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                        >
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary group-hover:bg-red-100 transition-colors">
                                <LogOut className="h-4 w-4 text-muted-foreground group-hover:text-red-600" />
                            </div>
                            <span>{t("nav.logout")}</span>
                        </button>
                    </div>
                </div>

                {/* Mobile toggle */}
                <button className="md:hidden rounded-xl bg-secondary p-2 text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
                    {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-border bg-white/95 backdrop-blur-xl md:hidden"
                    >
                        <div className="container flex flex-col gap-2 py-4">
                            {links.map(({ to, label, icon: Icon }, i) => (
                                <motion.div
                                    key={to}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.07, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                                >
                                    <Link
                                        to={to}
                                        onClick={() => setMobileOpen(false)}
                                        className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-colors ${isActive(to)
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-secondary"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className="h-5 w-5" />
                                            {label}
                                        </div>
                                        {to === "/orders" && activeOrdersCount > 0 && (
                                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-sm">
                                                {activeOrdersCount}
                                            </span>
                                        )}
                                    </Link>
                                </motion.div>
                            ))}
                            <button
                                onClick={handleLogout}
                                className="mt-2 flex items-center gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600"
                            >
                                <LogOut className="h-5 w-5" />
                                {t("nav.logout")}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
