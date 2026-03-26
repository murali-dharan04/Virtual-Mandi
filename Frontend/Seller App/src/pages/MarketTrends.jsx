import React, { useState, useEffect, useCallback } from "react";
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    ArrowLeft, TrendingUp, MapPin, IndianRupee,
    ArrowUp, ArrowDown, Minus, Zap, RefreshCw, Navigation,
    Search, Calendar
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { sellerApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

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

const TrendBadge = ({ trend }) => {
    const isUp = trend?.startsWith("+");
    const isDown = trend?.startsWith("-");
    return (
        <span className={`inline-flex items-center gap-0.5 text-[8px] font-black px-1.5 py-0.5 rounded-md ${
            isUp ? "bg-emerald-100 text-emerald-700" : isDown ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-500"
        }`}>
            {isUp && <ArrowUp className="h-2 w-2" />}
            {isDown && <ArrowDown className="h-2 w-2" />}
            {trend || "Stable"}
        </span>
    );
};

const MarketTrends = () => {
    const navigate = useNavigate();
    const [prices, setPrices] = useState([]);
    const [selectedState, setSelectedState] = useState("dl");
    const [isLoading, setIsLoading] = useState(true);
    const [isGeoLocating, setIsGeoLocating] = useState(true);
    const [detectedLocation, setDetectedLocation] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [search, setSearch] = useState("");

    const reverseGeocode = useCallback(async (lat, lon) => {
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`;
            const res = await fetch(url, { headers: { "User-Agent": "VirtualMandiApp/1.0" } });
            if (!res.ok) return null;
            const data = await res.json();
            const addr = data.address || {};
            const parts = [addr.state, addr.city, addr.state_district, addr.county].filter(Boolean);
            return { label: addr.city || addr.county || addr.state || "Your Location", parts };
        } catch { return null; }
    }, []);

    useEffect(() => {
        const sellerUser = (() => { try { return JSON.parse(localStorage.getItem("sellerUser") || "{}"); } catch { return {}; } })();
        const profileLocation = sellerUser?.location || "";
        const profileState = detectStateFromLocation(profileLocation);

        if (!("geolocation" in navigator)) {
            if (profileState) setSelectedState(profileState);
            setIsGeoLocating(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                const geo = await reverseGeocode(latitude, longitude);
                if (geo) {
                    const stateCode = detectStateFromLocation(geo.parts.join(" "));
                    if (stateCode) setSelectedState(stateCode);
                    setDetectedLocation(geo.label);
                } else if (profileState) setSelectedState(profileState);
                setIsGeoLocating(false);
            },
            () => {
                if (profileState) setSelectedState(profileState);
                setIsGeoLocating(false);
            },
            { timeout: 5000 }
        );
    }, [reverseGeocode]);

    const fetchPrices = useCallback(async (state) => {
        setIsLoading(true);
        try {
            const res = await sellerApi.getMarketPrices(state);
            if (res?.data) {
                setPrices(res.data);
                setLastUpdated(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
            }
        } catch (err) { console.error(err); }
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => {
        if (!isGeoLocating) fetchPrices(selectedState);
    }, [selectedState, isGeoLocating, fetchPrices]);

    const filtered = prices.filter(p => p.crop.toLowerCase().includes(search.toLowerCase()));
    const avgPrice = filtered.length ? Math.round(filtered.reduce((s, p) => s + p.price, 0) / filtered.length) : 0;
    const highestItem = filtered.reduce((max, p) => p.price > (max?.price || 0) ? p : max, null);

    return (
        <PageTransition>
            <div className="max-w-2xl mx-auto pb-24 px-2">
                {/* Compact Top Bar */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-9 w-9 rounded-xl border border-slate-100 dark:border-slate-800">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase italic leading-none">Market Intelligence</h1>
                            <p className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-widest flex items-center gap-1">
                                <MapPin className="h-2 w-2 text-emerald-500" /> {detectedLocation || "Global Mandi"} · {lastUpdated || "--:--"}
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => fetchPrices(selectedState)} className="h-9 w-9 rounded-xl border border-slate-100">
                        <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isLoading ? "animate-spin" : ""}`} />
                    </Button>
                </div>

                {/* State Chips */}
                <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                    {STATES.map(s => (
                        <button 
                            key={s.code}
                            onClick={() => setSelectedState(s.code)}
                            className={`shrink-0 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border ${
                                selectedState === s.code 
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-900/10" 
                                : "bg-white dark:bg-slate-900 text-slate-500 border-slate-100 dark:border-slate-800"
                            }`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>

                {/* KPI Bar */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-emerald-600 rounded-[1.5rem] p-4 text-white shadow-lg relative overflow-hidden">
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">Mandi Average</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black italic">₹{avgPrice}</span>
                            <span className="text-[10px] font-bold opacity-60">/kg</span>
                        </div>
                        <TrendingUp className="absolute -right-4 -bottom-4 h-16 w-16 opacity-10" />
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] p-4 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Highest Bid</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-slate-900 dark:text-white italic">₹{highestItem?.price || 0}</span>
                            <span className="text-[10px] font-bold text-slate-500">/kg</span>
                        </div>
                        <IndianRupee className="absolute -right-4 -bottom-4 h-16 w-16 opacity-5" />
                    </div>
                </div>

                {/* Search & Insight */}
                <div className="space-y-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Filter crops..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm text-[11px] font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                    
                    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-4 text-white shadow-md relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Zap className="h-10 w-10" />
                        </div>
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-indigo-200 mb-1.5">AI Sell Insight</p>
                        <p className="text-[11px] font-bold leading-relaxed">
                            {highestItem ? `${highestItem.crop} demand is peaking in ${highestItem.market}. List soon for 15% better returns.` : "Analyzing mandi flow..."}
                        </p>
                    </div>
                </div>

                {/* Dense Price List */}
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-2 shadow-sm">
                    <div className="space-y-1">
                        {isLoading ? (
                            [1,2,3,4,5].map(i => <div key={i} className="h-14 bg-slate-50 dark:bg-slate-800/50 rounded-xl animate-pulse" />)
                        ) : filtered.map((item, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.03 }}
                                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center font-black text-orange-600 text-sm shadow-sm border border-orange-100 dark:border-orange-500/20">
                                        {item.crop.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase truncate max-w-[120px]">{item.crop}</p>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <MapPin className="h-2 w-2 text-slate-400" />
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">{item.market}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-emerald-600 italic leading-none">₹{item.price}<span className="text-[8px] text-slate-400 font-bold not-italic ml-0.5">/KG</span></p>
                                    <div className="flex items-center justify-end gap-1.5 mt-1.5">
                                        <TrendBadge trend={item.trend} />
                                        <span className="text-[8px] font-bold text-slate-300 uppercase">{item.date?.split("-")[0]}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default MarketTrends;
