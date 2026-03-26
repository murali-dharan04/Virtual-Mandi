import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    MapPin, CheckCircle, Check, IndianRupee, ShoppingCart, PackageOpen,
    Plus, Leaf, Truck, TrendingUp, ChevronRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { sellerApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import PageTransition from "@/components/PageTransition";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

const MOCK_CHART_DATA = [
    { name: 'Mon', value: 4200 },
    { name: 'Tue', value: 3800 },
    { name: 'Wed', value: 5100 },
    { name: 'Thu', value: 2900 },
    { name: 'Fri', value: 4600 },
    { name: 'Sat', value: 5800 },
    { name: 'Sun', value: 3900 },
];

const Dashboard = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [stats, setStats] = useState({ activeListings: 0, totalOrders: 0, revenue: 0, pendingOrders: 0 });
    const [recentOrders, setRecentOrders] = useState([]);
    const [marketPrices, setMarketPrices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const sellerUser = (() => { try { return JSON.parse(localStorage.getItem("sellerUser") || "{}"); } catch { return {}; } })();
    const sellerName = sellerUser?.name?.split(" ")[0] || "Farmer";
    const sellerLocation = sellerUser?.location || "Delhi";

    useEffect(() => {
        const load = async () => {
            try {
                const [statsData, ordersData, marketData] = await Promise.all([
                    sellerApi.getDashboardStats(),
                    sellerApi.getOrders(),
                    sellerApi.getMarketPrices("dl")
                ]);
                
                if (statsData && !statsData.error && !statsData.msg) {
                    setStats({
                        activeListings: statsData.activeListings || 0,
                        totalOrders: statsData.totalOrders || 0,
                        revenue: statsData.revenue || 0,
                        pendingOrders: statsData.pendingOrders || 0
                    });
                } else if (statsData?.msg === "Token has expired") {
                    localStorage.removeItem("sellerToken");
                    localStorage.removeItem("sellerUser");
                    navigate("/login");
                }
                
                if (Array.isArray(ordersData)) {
                    setRecentOrders(ordersData.filter(o => o.status === 'Pending').slice(0, 5));
                }
                if (marketData && marketData.data && Array.isArray(marketData.data)) {
                    setMarketPrices(marketData.data.slice(0, 3));
                }
            } catch (e) { console.error(e); }
            finally { setIsLoading(false); }
        };
        load();
        const interval = setInterval(load, 30000);
        return () => clearInterval(interval);
    }, [navigate]);

    return (
        <PageTransition>
            <div className="max-w-5xl mx-auto space-y-6 pb-24 px-4 bg-[#f8f9fa] min-h-screen">
                
                {/* 1. HERO SECTION */}
                <div className="bg-gradient-to-r from-[#1b5e3a] to-[#268051] rounded-[2rem] p-6 md:p-8 text-white relative shadow-xl mt-4">
                    <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 backdrop-blur-sm border border-white/10">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#fde047] shadow-[0_0_8px_#fde047]"></span>
                        GOOD MORNING ☀️
                    </div>
                    
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-serif leading-tight">
                                Welcome back,<br />
                                <span className="font-extrabold tracking-tight">{sellerName}</span>
                            </h1>
                            <div className="flex items-center gap-3 mt-6">
                                <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border border-white/5">
                                    <MapPin className="h-3 w-3 text-white/70" /> {sellerLocation}
                                </div>
                                <div className="flex items-center gap-1.5 bg-[#166534] px-3 py-1.5 rounded-full text-xs font-semibold shadow-inner border border-[#14532d]">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400 border border-emerald-200"></span> Verified Seller
                                </div>
                            </div>
                        </div>
                        
                        <div className="relative shrink-0">
                            <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl md:text-4xl font-serif font-bold backdrop-blur-md shadow-inner">
                                {sellerName[0]}
                            </div>
                            <div className="absolute -bottom-2 -right-2 h-6 w-6 bg-emerald-500 rounded-full border-[3px] border-[#227448] flex items-center justify-center shadow-lg">
                                <Check className="h-3 w-3 text-white" strokeWidth={3} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. OVERLAPPING METRIC CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 -mt-10 px-2 relative z-10">
                    <Card className="rounded-[1.5rem] border-0 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-5 flex flex-col justify-between h-full bg-white rounded-[1.5rem]">
                            <div className="flex justify-between items-start mb-2">
                                <div className="h-10 w-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                                    <IndianRupee className="h-5 w-5" />
                                </div>
                                <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-md tracking-wider flex items-center gap-1">
                                    ↑ +8%
                                </span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Revenue</p>
                                <h3 className="text-3xl font-black text-slate-800 tracking-tight">₹{(stats?.revenue || 0).toLocaleString()}</h3>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">+8% THIS WEEK</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[1.5rem] border-0 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-5 flex flex-col justify-between h-full bg-white rounded-[1.5rem]">
                            <div className="flex justify-between items-start mb-2">
                                <div className="h-10 w-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
                                    <ShoppingCart className="h-5 w-5" />
                                </div>
                                <span className="px-2 py-1 bg-slate-50 text-slate-500 text-[10px] font-black uppercase rounded-md tracking-wider">
                                    • AWAITING
                                </span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending Orders</p>
                                <h3 className="text-3xl font-black text-slate-800 tracking-tight">{recentOrders?.length || 0}</h3>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">AWAITING ACTION</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[1.5rem] border-0 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-5 flex flex-col justify-between h-full bg-white rounded-[1.5rem]">
                            <div className="flex justify-between items-start mb-2">
                                <div className="h-10 w-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
                                    <PackageOpen className="h-5 w-5" />
                                </div>
                                <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-md tracking-wider flex items-center gap-1">
                                    ↑ ITEMS
                                </span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Listings</p>
                                <h3 className="text-3xl font-black text-slate-800 tracking-tight">{stats?.activeListings || 0}</h3>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">ITEMS AVAILABLE</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 3. QUICK MANAGEMENT */}
                <div className="pt-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Quick Management</p>
                    <div className="grid grid-cols-3 gap-4">
                        <button onClick={() => navigate("/listings/new")} className="bg-white rounded-[2rem] p-6 text-center shadow-sm hover:shadow-md transition-all group flex flex-col items-center justify-center border border-slate-50">
                            <div className="h-14 w-14 rounded-2xl bg-[#10b981] text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-200">
                                <Plus className="h-6 w-6" strokeWidth={3} />
                            </div>
                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Add Produce</h4>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">New Produce</p>
                        </button>

                        <button onClick={() => navigate("/dashboard/disease-lab")} className="bg-white rounded-[2rem] p-6 text-center shadow-sm hover:shadow-md transition-all group flex flex-col items-center justify-center border border-slate-50">
                            <div className="h-14 w-14 rounded-2xl bg-[#34d399] text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-100">
                                <Leaf className="h-6 w-6" strokeWidth={2.5} />
                            </div>
                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Disease Lab</h4>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">AI Diagnostic</p>
                        </button>

                        <button onClick={() => navigate("/dashboard/logistics")} className="bg-white rounded-[2rem] p-6 text-center shadow-sm hover:shadow-md transition-all group flex flex-col items-center justify-center border border-slate-50">
                            <div className="h-14 w-14 rounded-2xl bg-[#60a5fa] text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-blue-100">
                                <Truck className="h-6 w-6" strokeWidth={2.5} />
                            </div>
                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Logistics</h4>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Find Transport</p>
                        </button>
                    </div>
                </div>

                {/* 4. SALES REVENUE CHART */}
                <Card className="rounded-[2rem] border-0 shadow-sm bg-white overflow-hidden">
                    <CardContent className="p-6 md:p-8">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">This Week</p>
                                <h3 className="text-xl font-serif font-black text-slate-800">Sales Revenue</h3>
                            </div>
                            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-black uppercase rounded-lg tracking-wider space-x-1">
                                <span>↑</span><span>8.2%</span>
                            </span>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={MOCK_CHART_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} />
                                    <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Bar dataKey="value" fill="#10b981" radius={[6, 6, 6, 6]} barSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* 5. RECENT ORDERS FULL WIDTH */}
                <Card className="rounded-[2rem] border-0 shadow-sm bg-white overflow-hidden">
                    <div className="p-6 md:p-8 flex items-center justify-between border-b border-slate-50">
                        <h3 className="text-lg font-serif font-black text-slate-800">Recent Orders</h3>
                        <button onClick={() => navigate('/orders')} className="text-[11px] font-bold text-slate-500 hover:text-emerald-600 flex items-center gap-1 group">
                            View All <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                    <div>
                        {recentOrders.length > 0 ? (
                            recentOrders.map((order, i) => (
                                <div key={i} className="flex items-center justify-between p-6 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => navigate(`/seller/orders/${order.id || order._id}`)}>
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-emerald-100/50 flex items-center justify-center text-emerald-600 font-bold text-lg">
                                            {(order.crop_name || order.cropName || 'O')[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-slate-800 capitalize">{order.crop_name || order.cropName}</h4>
                                            <p className="text-[11px] font-bold text-slate-400 mt-0.5">{order.buyer_name || order.buyerName || 'Buyer'} · {order.quantity} {order.unit || 'kg'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-1.5">
                                        <p className="text-base font-black text-slate-800">₹{order.total_price || order.totalPrice}</p>
                                        <span className="px-2.5 py-1 bg-rose-50 text-rose-500 text-[9px] font-black uppercase rounded text-center tracking-wider">
                                            {order.status || 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                                No recent orders
                            </div>
                        )}
                    </div>
                </Card>

                {/* 6. BOTTOM GRID: MARKET & ADVISORIES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Market Snapshot */}
                    <Card className="rounded-[2rem] border-0 shadow-sm bg-white overflow-hidden">
                        <div className="p-6 flex items-center justify-between border-b border-slate-50">
                            <h3 className="text-lg font-serif font-black text-slate-800">Market Snapshot</h3>
                            <button onClick={() => navigate('/dashboard/trends')} className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 group">
                                Full View <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {(marketPrices.length > 0 ? marketPrices : [
                                { crop: 'Tomato', price: 48, trend: '+4%', market: 'Azadpur, Delhi' },
                                { crop: 'Potato', price: 15, trend: 'Stable', market: 'Azadpur, Delhi' },
                                { crop: 'Onion', price: 32, trend: '+2%', market: 'Azadpur, Delhi' }
                            ]).map((m, i) => (
                                <div key={i} className="flex justify-between items-center group cursor-pointer">
                                    <div>
                                        <h4 className="text-sm font-black text-slate-800 capitalize mb-1">{m.crop}</h4>
                                        <p className="text-[10px] font-bold text-slate-400">{m.market || sellerLocation}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-end gap-1 mb-1 justify-end">
                                            <p className="text-sm font-black text-slate-800 leading-none">₹{m.price}</p>
                                            <span className="text-[9px] font-bold text-slate-400 leading-none">/kg</span>
                                        </div>
                                        <p className={`text-[10px] font-black ${m.trend === 'Stable' ? 'text-slate-400' : m.trend?.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>{m.trend}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Smart Advisories */}
                    <Card className="rounded-[2rem] border-0 shadow-sm bg-white flex flex-col">
                        <div className="p-6 border-b border-slate-50">
                            <h3 className="text-lg font-serif font-black text-slate-800">Smart Advisories</h3>
                        </div>
                        <div className="p-6 flex-1 flex flex-col justify-between hidden md:flex">
                            <div className="bg-[#f8fafc] rounded-2xl p-4 flex gap-4 items-start border border-slate-100">
                                <div className="h-8 w-8 rounded-xl bg-emerald-100/50 flex items-center justify-center shrink-0">
                                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-slate-800 mb-1">Price Alert</h4>
                                    <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                                        Tomato prices are up +4% in Azadpur. Sell now!
                                    </p>
                                </div>
                            </div>
                            <Button 
                                variant="outline" 
                                className="w-full mt-6 h-12 rounded-xl border-dashed border-2 border-slate-200 text-slate-500 font-bold text-xs"
                                onClick={() => navigate('/dashboard/weather')}
                            >
                                View Weather Insights
                            </Button>
                        </div>
                    </Card>
                </div>

            </div>
        </PageTransition>
    );
};

export default Dashboard;

