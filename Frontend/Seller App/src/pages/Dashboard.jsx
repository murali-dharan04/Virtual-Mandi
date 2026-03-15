import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Sprout, Sun, CloudRain, Cloud, Eye, MapPin, Sparkles, Leaf, Truck,
    IndianRupee, ShoppingCart, Boxes, Plus, ArrowUp, ChevronRight, TrendingUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { sellerApi } from "@/lib/api";
import { useTranslation } from "react-i18next";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PageTransition from "@/components/PageTransition";

const containerVar = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVar = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 14 } } };

const inputClass = "h-14 rounded-2xl border-2 border-slate-100 bg-slate-50/50 focus:border-[#2E7D32] transition-all font-medium text-slate-900";
const labelClass = "text-[10px] font-black uppercase tracking-widest text-slate-400";

const STATES = [
    { code: "dl", label: "Delhi", keywords: ["delhi", "new delhi"] },
    { code: "mh", label: "Maharashtra", keywords: ["maharashtra", "mumbai", "pune", "nashik", "nagpur", "aurangabad"] },
    { code: "tn", label: "Tamil Nadu", keywords: ["tamil", "chennai", "coimbatore", "madurai", "trichy", "salem"] },
    { code: "up", label: "Uttar Pradesh", keywords: ["uttar pradesh", "lucknow", "agra", "varanasi", "kanpur", "meerut"] },
    { code: "pb", label: "Punjab", keywords: ["punjab", "amritsar", "ludhiana", "jalandhar", "patiala"] },
];

const detectStateFromLocation = (locationStr = "") => {
    const lower = locationStr.toLowerCase();
    for (const s of STATES) {
        if (s.keywords.some(k => lower.includes(k))) return s.code;
    }
    return null;
};

const StatCard = ({ icon: Icon, label, value, sub, trend, accent }) => (
    <motion.div variants={itemVar} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
        <Card className="overflow-hidden border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none hover:shadow-2xl hover:shadow-emerald-500/5 transition-all rounded-[2rem] bg-white dark:bg-slate-900 group">
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className={`p-4 rounded-2xl ${accent.replace("bg-", "bg-").replace("500", "50").replace("400", "50").replace("600", "50")} dark:bg-slate-800 transition-colors group-hover:scale-110 duration-500`}>
                        <Icon className={`h-6 w-6 ${accent.replace("bg-", "text-")}`} />
                    </div>
                    {trend && (
                        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : trend === 'down' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'}`}>
                            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '•'} {sub.split(' ')[0]}
                        </div>
                    )}
                </div>
                <p className={labelClass}>{label}</p>
                <div className="flex items-baseline gap-1 mt-1">
                    <p className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{value}</p>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">{sub}</p>
            </CardContent>
        </Card>
    </motion.div>
);

const OrderBadge = ({ status }) => {
    const styles = {
        pending: "bg-amber-100 text-amber-700",
        completed: "bg-emerald-100 text-emerald-700",
        delivered: "bg-teal-100 text-teal-700",
        rejected: "bg-red-100 text-red-600",
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${styles[status?.toLowerCase()] || "bg-slate-100 text-slate-600"}`}>
            {status}
        </span>
    );
};

const SALES_DATA = [
    { day: 'Mon', sales: 4200 }, { day: 'Tue', sales: 3800 }, { day: 'Wed', sales: 5100 },
    { day: 'Thu', sales: 2900 }, { day: 'Fri', sales: 4600 }, { day: 'Sat', sales: 5800 }, { day: 'Sun', sales: 3900 },
];

const Dashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [stats, setStats] = useState({ activeListings: 0, totalOrders: 0, revenue: 0, pendingOrders: 0 });
    const [recentOrders, setRecentOrders] = useState([]);
    const [weather, setWeather] = useState(null);
    const [marketPrices, setMarketPrices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const sellerUser = (() => { try { return JSON.parse(localStorage.getItem("sellerUser") || "{}"); } catch { return {}; } })();
    const sellerName = sellerUser?.name || "Seller";
    const sellerLocation = sellerUser?.location || "Delhi";
    const initials = sellerName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

    const getHour = () => new Date().getHours();
    const greeting = getHour() < 12 ? "Good morning" : getHour() < 17 ? "Good afternoon" : "Good evening";

    useEffect(() => {
        const load = async () => {
            try {
                const [statsData, ordersData] = await Promise.all([
                    sellerApi.getDashboardStats(),
                    sellerApi.getOrders()
                ]);
                if (statsData) setStats(statsData);
                if (Array.isArray(ordersData)) {
                    setRecentOrders(ordersData.map(o => ({
                        id: o._id, cropName: o.crop_name, buyerName: o.buyer_name,
                        quantity: o.quantity, unit: o.unit || "kg",
                        totalPrice: o.total_price || 0, status: o.status
                    })));
                }
            } catch (e) { console.error(e); }
            finally { setIsLoading(false); }
        };

        const loadWeather = async () => {
            try {
                const doFetch = async (param) => {
                    const d = await sellerApi.getWeather(param);
                    // New API returns flat: { temperature, description, location, ... }
                    if (d?.temperature !== undefined) setWeather(d);
                };
                if ("geolocation" in navigator) {
                    const fallback = setTimeout(() => doFetch(`city=${sellerLocation}`), 4000);
                    navigator.geolocation.getCurrentPosition(
                        (pos) => { clearTimeout(fallback); doFetch(`lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`); },
                        () => { clearTimeout(fallback); doFetch(`city=${sellerLocation}`); },
                        { timeout: 3500 }
                    );
                } else {
                    doFetch(`city=${sellerLocation}`);
                }
            } catch (e) { console.error(e); }
        };

        const loadMarket = async () => {
            try {
                const stateCode = detectStateFromLocation(sellerLocation) || "dl";
                const res = await sellerApi.getMarketPrices(stateCode);
                if (res?.data) setMarketPrices(res.data.slice(0, 3));
            } catch (e) { console.error(e); }
        };

        load();
        loadWeather();
        loadMarket();
        const t = setInterval(() => { load(); loadMarket(); }, 30000);
        return () => clearInterval(t);
    }, [sellerLocation]);

    const fmt = (v) => (v || 0).toLocaleString("en-IN");

    const WeatherIcon = (weather?.weatherCondition || weather?.description || "").toLowerCase().includes("rain") ||
        (weather?.weatherCondition || weather?.description || "").toLowerCase().includes("drizzle") ? CloudRain
        : (weather?.weatherCondition || weather?.description || "").toLowerCase().includes("cloud") ? Cloud : Sun;

    if (isLoading) return (
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
            <div className="relative h-12 w-12">
                <div className="absolute inset-0 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
                <Sprout className="absolute inset-0 m-auto h-5 w-5 text-emerald-600" />
            </div>
            <p className="text-slate-400 font-bold text-sm">Loading dashboard…</p>
        </div>
    );

    return (
        <PageTransition>
            <motion.div variants={containerVar} initial="hidden" animate="show"
                className="pb-24 px-4 md:px-6 max-w-4xl mx-auto space-y-6">

                {/* ── HERO ── */}
                <motion.div variants={itemVar}
                    className="group relative rounded-[2.5rem] bg-gradient-to-br from-[#1a4d1a] via-[#2E7D32] to-emerald-800 p-8 text-white shadow-2xl shadow-emerald-900/20 overflow-hidden"
                >
                    {/* Animated background elements */}
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl animate-pulse" />
                    <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-teal-400/10 blur-2xl animate-pulse animation-delay-2000" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 mb-4 backdrop-blur-md">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-100">{greeting} 👋</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 leading-tight">
                                Welcome back,<br />
                                <span className="bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">{sellerName}</span>
                            </h1>
                            <div className="flex items-center gap-4 mt-4">
                                <div className="flex items-center gap-1.5 text-emerald-100/70 text-xs font-bold bg-black/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
                                    <MapPin className="h-3.5 w-3.5" /> {sellerLocation}
                                </div>
                                <div className="flex items-center gap-1.5 text-emerald-100/70 text-xs font-bold bg-black/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
                                    <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                                    Verified Seller
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-[2rem] backdrop-blur-xl">
                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center font-black text-2xl shadow-inner border border-white/20 relative group-hover:scale-105 transition-transform">
                                {initials}
                                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-[#1a4d1a] z-10 flex items-center justify-center">
                                    <Sparkles className="h-2.5 w-2.5 text-white fill-current" />
                                </div>
                            </div>
                            {weather && (
                                <div className="pr-2">
                                    <div className="flex items-center gap-2">
                                        <WeatherIcon className="h-6 w-6 text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.4)]" />
                                        <span className="text-2xl font-black">{weather.temperature}°C</span>
                                    </div>
                                    <p className="text-[10px] text-emerald-200 font-black uppercase tracking-widest mt-0.5">
                                        {weather.weatherCondition || weather.description}
                                    </p>
                                    <p className="text-[10px] text-emerald-300/60 font-bold mt-0.5">{weather.location}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* ── STATS ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard icon={IndianRupee} label="Total Revenue" value={`₹${fmt(stats.revenue)}`} sub="+8% this week" trend="up" accent="bg-emerald-500" />
                    <StatCard icon={ShoppingCart} label="Pending Orders" value={`${stats.pendingOrders}`} sub="Awaiting action" trend="neutral" accent="bg-amber-400" />
                    <StatCard icon={Boxes} label="Active Listings" value={`${stats.activeListings}`} sub="Items available" trend="up" accent="bg-sky-500" />
                </div>

                {/* ── QUICK ACTIONS ── */}
                <motion.div variants={itemVar}>
                    <p className={`${labelClass} mb-4 ml-2`}>Quick Management</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: t("dashboard.actions.add") || "Add Listing", sub: "New produce", icon: Plus, path: "/listings/new", color: "from-emerald-500 to-emerald-600 shadow-emerald-200" },
                            { label: "Disease Lab", sub: "AI Diagnostic", icon: Leaf, path: "/dashboard/disease-lab", color: "from-green-400 to-teal-500 shadow-teal-200" },
                            { label: "Logistics", sub: "Find Transport", icon: Truck, path: "/dashboard/logistics", color: "from-blue-500 to-indigo-600 shadow-blue-200" },
                        ].map(({ label, sub, icon: Icon, path, color }) => (
                            <motion.button key={label} whileHover={{ y: -8, scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={() => navigate(path)}
                                className="group relative flex flex-col items-center gap-3 p-6 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none hover:shadow-2xl transition-all text-center">
                                <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-lg transition-transform group-hover:rotate-12`}>
                                    <Icon className="h-7 w-7" />
                                </div>
                                <div>
                                    <span className="block text-slate-800 dark:text-white font-black text-sm uppercase tracking-tight">{label}</span>
                                    <span className="block text-slate-400 text-[10px] font-bold uppercase mt-1 tracking-widest">{sub}</span>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* ── MAIN GRID ── */}
                <div className="grid gap-5 md:grid-cols-2">

                    {/* Sales Chart */}
                    <motion.div variants={itemVar} className="md:col-span-2">
                        <Card className="rounded-3xl border-0 shadow-sm bg-white overflow-hidden">
                            <CardHeader className="px-6 pt-6 pb-0 flex flex-row items-center justify-between">
                                <div>
                                    <p className={labelClass}>This Week</p>
                                    <CardTitle className="text-xl font-black text-slate-800 dark:text-white mt-1">Sales Revenue</CardTitle>
                                </div>
                                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 font-black text-xs px-3 py-1.5 rounded-xl">
                                    <ArrowUp className="h-3 w-3" /> 8.2%
                                </div>
                            </CardHeader>
                            <CardContent className="pt-3 px-2 pb-4">
                                <div className="h-[200px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={SALES_DATA} margin={{ top: 5, right: 12, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 700 }} dy={8} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#CBD5E1', fontSize: 10 }} />
                                            <Tooltip
                                                cursor={{ fill: '#F8FAFC', radius: 8 }}
                                                contentStyle={{ borderRadius: '14px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 12 }}
                                            />
                                            <Bar dataKey="sales" fill="#10B981" radius={[8, 8, 0, 0]} maxBarSize={42} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Recent Orders */}
                    <motion.div variants={itemVar} className="md:col-span-2">
                        <Card className="rounded-3xl border-0 shadow-sm bg-white overflow-hidden">
                            <CardHeader className="px-6 py-4 border-b border-slate-50 flex flex-row items-center justify-between">
                                <CardTitle className="text-lg font-black text-slate-800 dark:text-white">Recent Orders</CardTitle>
                                <Button variant="ghost" size="sm" className="text-[#2E7D32] font-bold hover:bg-[#E8F5E9] rounded-xl text-xs gap-1 px-3"
                                    onClick={() => navigate('/orders')}>
                                    View All <ChevronRight className="h-3.5 w-3.5" />
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                {recentOrders.length === 0 ? (
                                    <div className="py-14 text-center">
                                        <ShoppingCart className="h-9 w-9 mx-auto text-slate-200 mb-3" />
                                        <p className="text-slate-400 font-semibold text-sm">No orders yet</p>
                                        <p className="text-slate-300 text-xs mt-1">Orders will show up here once buyers place them.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-50 dark:divide-slate-800">
                                        {recentOrders.slice(0, 5).map(order => (
                                            <motion.div key={order.id}
                                                whileHover={{ backgroundColor: "rgba(16, 185, 129, 0.05)" }}
                                                className="flex items-center justify-between px-6 py-4 transition-colors cursor-pointer"
                                                onClick={() => navigate('/orders')}>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center font-black text-emerald-700 text-base shadow-sm">
                                                        {(order.cropName || "?").charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                         <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{order.cropName}</p>
                                                        <p className="text-slate-400 text-xs font-medium">{order.buyerName} · {order.quantity} {order.unit}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right flex flex-col items-end gap-1">
                                                     <p className="font-black text-slate-800 dark:text-white">₹{fmt(order.totalPrice)}</p>
                                                    <OrderBadge status={order.status} />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Market Snapshot */}
                    <motion.div variants={itemVar}>
                        <Card className="rounded-3xl border-0 shadow-sm bg-white overflow-hidden h-full">
                            <CardHeader className="px-6 py-4 border-b border-slate-50 flex flex-row items-center justify-between">
                                <CardTitle className="text-lg font-black text-slate-800 dark:text-white">Market Snapshot</CardTitle>
                                <Button variant="ghost" size="sm" className="text-[#2E7D32] font-bold hover:bg-[#E8F5E9] rounded-xl text-xs gap-1 px-3"
                                    onClick={() => navigate('/dashboard/trends')}>
                                    Full View <ChevronRight className="h-3.5 w-3.5" />
                                </Button>
                            </CardHeader>
                            <CardContent className="px-4 py-3 space-y-2">
                                {marketPrices.length > 0 ? (
                                    marketPrices.map((m, i) => (
                                         <div key={i} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <div>
                                                <p className="font-bold text-slate-700 text-sm">{m.crop}</p>
                                                <p className="text-slate-400 text-[10px] font-medium">{m.market}</p>
                                            </div>
                                            <div className="text-right">
                                                 <p className="font-black text-slate-800 dark:text-white">₹{m.price}<span className="text-slate-400 text-[10px] font-normal">/{m.unit}</span></p>
                                                <p className={`text-[10px] font-bold ${m.trend?.startsWith('+') ? 'text-emerald-500' : m.trend?.startsWith('-') ? 'text-red-500' : 'text-slate-400'}`}>
                                                    {m.trend || "Stable"}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-8 text-center">
                                        <p className="text-slate-400 text-xs font-medium">Fetching market rates…</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Smart Advisories */}
                    <motion.div variants={itemVar}>
                        <Card className="rounded-3xl border-0 shadow-sm bg-white overflow-hidden h-full">
                            <CardHeader className="px-6 py-4 border-b border-slate-50">
                                <CardTitle className="text-lg font-black text-slate-800 dark:text-white">Smart Advisories</CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 py-3 space-y-3">
                                {(() => {
                                    const advisories = [];
                                    const hotCrop = marketPrices.find(p => p.trend?.startsWith("+"));
                                    if (hotCrop) {
                                        advisories.push({
                                            icon: TrendingUp,
                                            color: "text-emerald-600 bg-emerald-50",
                                            title: "Price Alert",
                                            body: `${hotCrop.crop} prices are up ${hotCrop.trend} in ${hotCrop.market.split(',')[0]}. Sell now!`,
                                        });
                                    }
                                    const lowCrop = marketPrices.find(p => p.trend?.startsWith("-"));
                                    if (lowCrop) {
                                        advisories.push({
                                            icon: Eye,
                                            color: "text-sky-600 bg-sky-50",
                                            title: "Market Watch",
                                            body: `${lowCrop.crop} arrivals are increasing. Prices might dip further.`
                                        });
                                    }
                                    if (advisories.length === 0) {
                                        advisories.push({
                                            icon: Sprout,
                                            color: "text-emerald-600 bg-emerald-50",
                                            title: "Plan Ahead",
                                            body: "Maintain your quality grades to get the best prices in coming weeks."
                                        });
                                    }
                                    return advisories.map((adv, i) => (
                                         <div key={i} className="flex gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                                            <div className={`p-2.5 rounded-xl ${adv.color} shrink-0`}>
                                                <adv.icon className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-700 text-sm">{adv.title}</p>
                                                <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{adv.body}</p>
                                            </div>
                                        </div>
                                    ));
                                })()}
                                <Button variant="outline" size="sm"
                                    className="w-full rounded-2xl text-xs font-bold border-dashed"
                                    onClick={() => navigate('/dashboard/weather')}>
                                    View Weather Insights
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>

                </div>
            </motion.div>
        </PageTransition>
    );
};

export default Dashboard;
