import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ShoppingCart, Package, Receipt, LogOut, Menu, X, Leaf, Zap } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

import NotificationCenter from "./NotificationCenter";


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
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm transition-all duration-300">
            <div className="container relative z-10 flex h-20 items-center justify-between">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-green-600 shadow-lg shadow-green-500/30 transition-transform group-hover:scale-105">
                        <Leaf className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black tracking-tight text-foreground leading-none">
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
                    <NotificationCenter />

                    <div className="flex items-center gap-3 pl-2">
                        <div className="relative" ref={profileRef}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary border border-border/50 shadow-inner text-sm font-black text-foreground transition-transform hover:scale-105 active:scale-95"
                                >
                                {user?.name?.charAt(0).toUpperCase()}
                            </button>

                            <AnimatePresence>
                                {isProfileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-3 w-72 overflow-hidden rounded-3xl border border-border bg-card shadow-2xl z-50 p-0"
                                    >
                                        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-xl font-black">
                                                    {user?.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-lg font-black tracking-tight leading-none">{user?.name}</span>
                                                    <span className="text-xs font-medium text-emerald-100/80 mt-1">Verified Buyer</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-5 space-y-4">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Address</p>
                                                <p className="text-sm font-bold text-foreground break-all">{user?.email}</p>
                                            </div>
                                            <div className="h-px bg-border/60" />
                                            <button
                                                onClick={handleLogout}
                                                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black uppercase tracking-wider text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
                                            >
                                                <LogOut className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                                                Log Out
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
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
                        className="overflow-hidden border-t border-border bg-background/95 backdrop-blur-xl md:hidden"
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
