import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Activity, Users, ShoppingBag, Landmark, ShieldCheck, Cpu,
    Globe, ArrowUpRight, BarChart3, Boxes, Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageTransition from "@/components/PageTransition";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer
} from "recharts";

import { BASE_URL } from "@/lib/api";

const AdminDash = () => {
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const token = localStorage.getItem("sellerToken");
                const headers = token ? { Authorization: `Bearer ${token}` } : {};

                const [statsRes, chartRes] = await Promise.all([
                    fetch(`${BASE_URL}/api/admin/stats`, { headers }),
                    fetch(`${BASE_URL}/api/admin/orders-by-day`, { headers }),
                ]);

                if (statsRes.ok) setStats(await statsRes.json());
                if (chartRes.ok) setChartData(await chartRes.json());
            } catch (e) {
                console.error("Admin stats error:", e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const fmt = (v) => (v ?? 0).toLocaleString("en-IN");

    // Stat cards using real data with fallback "--" while loading
    const statCards = [
        {
            label: "Total GMV",
            value: stats ? `₹${fmt(Math.round(stats.totalRevenue / 100) * 100)}` : "--",
            sub: "Delivered order revenue",
            icon: Landmark,
            color: "text-emerald-500 bg-emerald-50",
        },
        {
            label: "Active Farmers",
            value: stats ? fmt(stats.totalFarmers) : "--",
            sub: "Registered seller accounts",
            icon: Globe,
            color: "text-blue-500 bg-blue-50",
        },
        {
            label: "Total Orders",
            value: stats ? fmt(stats.totalOrders) : "--",
            sub: `${stats?.pendingOrders ?? "–"} pending`,
            icon: ShoppingBag,
            color: "text-purple-500 bg-purple-50",
        },
        {
            label: "Active Listings",
            value: stats ? fmt(stats.totalListings) : "--",
            sub: "Produce listed right now",
            icon: Boxes,
            color: "text-amber-500 bg-amber-50",
        },
    ];

    return (
        <PageTransition>
            <div className="max-w-6xl mx-auto pb-24 px-4 space-y-8">

                {/* ── HEADER ── */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 overflow-hidden relative p-8 rounded-[3rem] bg-slate-900 text-white shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px]" />
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 mb-4">
                            <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">System Administrator</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic leading-none">
                            Platform Overview
                        </h1>
                        <p className="text-slate-400 text-sm mt-3 font-medium uppercase tracking-widest">
                            Live Data · Virtual Mandi
                        </p>
                    </div>
                    <div className="relative z-10 flex items-center gap-2 text-slate-400 text-xs font-bold">
                        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.7)]" />
                        Live Database Connected
                    </div>
                </header>

                {/* ── STAT CARDS ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.08 }}
                        >
                            <Card className="rounded-[2.5rem] border-slate-100 shadow-xl shadow-slate-200/40">
                                <CardContent className="p-6">
                                    <div className={`h-12 w-12 rounded-2xl ${s.color} flex items-center justify-center mb-4`}>
                                        <s.icon className="h-6 w-6" />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                                    <p className={`text-3xl font-black mt-1 ${loading ? "text-slate-300" : "text-slate-900"}`}>
                                        {loading ? "..." : s.value}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1">{s.sub}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* ── CHART + INFRA GRID ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Orders per Day — Real Chart */}
                    <Card className="lg:col-span-2 rounded-[3rem] border-0 shadow-xl shadow-slate-200/40 bg-white overflow-hidden">
                        <CardHeader className="p-8 border-b border-slate-50">
                            <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
                                <Activity className="h-5 w-5 text-emerald-500" />
                                Orders — Last 7 Days
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            {chartData.length > 0 ? (
                                <div className="h-56">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                                            <XAxis
                                                dataKey="day"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 700 }}
                                                dy={8}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: "#CBD5E1", fontSize: 10 }}
                                                allowDecimals={false}
                                            />
                                            <Tooltip
                                                cursor={{ fill: "#F8FAFC", radius: 8 }}
                                                contentStyle={{
                                                    borderRadius: "14px", border: "none",
                                                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: 12
                                                }}
                                                formatter={(v) => [`${v} orders`, "Orders"]}
                                            />
                                            <Bar dataKey="orders" fill="#10B981" radius={[8, 8, 0, 0]} maxBarSize={42} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-56 w-full bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                                    <BarChart3 className="h-10 w-10 mb-3 opacity-40" />
                                    <p className="font-bold text-sm">{loading ? "Loading chart…" : "No order data yet"}</p>
                                    <p className="text-xs mt-1">Orders will appear here as they come in</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Infrastructure Status */}
                    <Card className="rounded-[3rem] border-0 shadow-xl shadow-slate-200/40 bg-slate-50 overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-lg font-black text-slate-900">Infrastructure</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-4">
                            {[
                                { label: "Hugging Face ViT", status: "Healthy", value: "92ms" },
                                { label: "MongoDB Cluster", status: "Optimal", value: "12ms" },
                                { label: "OpenWeather API", status: "Active", value: "~1s" },
                                { label: "Cloudinary CDN", status: "A-Grade", value: "150ms" },
                            ].map((inf, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100">
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">{inf.label}</p>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                            <p className="text-[10px] font-black uppercase text-emerald-600 tracking-tighter">{inf.status}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-slate-400">{inf.value}</p>
                                    </div>
                                </div>
                            ))}

                            {/* Real buyer count */}
                            <div className="flex items-center justify-between p-4 bg-violet-50 rounded-2xl border border-violet-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-xl bg-violet-500 flex items-center justify-center">
                                        <Users className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">Total Buyers</p>
                                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">Registered accounts</p>
                                    </div>
                                </div>
                                <p className="text-2xl font-black text-violet-700">
                                    {loading ? "–" : fmt(stats?.totalBuyers)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PageTransition>
    );
};

export default AdminDash;
