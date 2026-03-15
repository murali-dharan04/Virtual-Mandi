import React, { useState, useEffect, useCallback } from "react";
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ArrowLeft, TrendingUp, MapPin, IndianRupee,
    ArrowUp, ArrowDown, Minus, Zap, RefreshCw, Navigation
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { sellerApi } from "@/lib/api";
import { motion } from "framer-motion";

/* ── State mapping (Indian states → code) ──────────────────────────── */
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

/* ── helpers ─────────────────────────────────────────────────────────── */
const labelClass = "text-[10px] font-black uppercase tracking-widest text-slate-400";

const containerVar = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVar = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 110 } } };

const TrendBadge = ({ trend }) => {
    const isUp = trend?.startsWith("+");
    const isDown = trend?.startsWith("-");
    const isStable = trend === "Stable";
    return (
        <span className={`inline-flex items-center gap-0.5 text-[10px] font-black px-2 py-0.5 rounded-full ${isUp ? "bg-emerald-100 text-emerald-700" : isDown ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-500"
            }`}>
            {isUp && <ArrowUp className="h-2.5 w-2.5" />}
            {isDown && <ArrowDown className="h-2.5 w-2.5" />}
            {isStable && <Minus className="h-2.5 w-2.5" />}
            {trend}
        </span>
    );
};

/* ── Main Component ──────────────────────────────────────────────────── */
const MarketTrends = () => {
    const navigate = useNavigate();

    const [prices, setPrices] = useState([]);
    const [selectedState, setSelectedState] = useState("dl");
    const [isLoading, setIsLoading] = useState(true);
    const [isGeoLocating, setIsGeoLocating] = useState(true);
    const [detectedLocation, setDetectedLocation] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    /* ── Reverse-geocode (OpenStreetMap Nominatim — free, no key) ── */
    const reverseGeocode = useCallback(async (lat, lon) => {
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`;
            const res = await fetch(url, { headers: { "User-Agent": "VirtualMandiApp/1.0" } });
            if (!res.ok) return null;
            const data = await res.json();
            const addr = data.address || {};
            // Build a location string to match against STATES
            const parts = [addr.state, addr.city, addr.state_district, addr.county].filter(Boolean);
            return { label: addr.city || addr.county || addr.state || "Your Location", parts };
        } catch {
            return null;
        }
    }, []);

    /* ── Auto-detect location on mount ── */
    useEffect(() => {
        const sellerUser = (() => { try { return JSON.parse(localStorage.getItem("sellerUser") || "{}"); } catch { return {}; } })();
        const profileLocation = sellerUser?.location || sellerUser?.district || "";

        // First: try profile location
        const profileState = detectStateFromLocation(profileLocation);

        const runGeo = () => {
            if (!("geolocation" in navigator)) {
                if (profileState) setSelectedState(profileState);
                setIsGeoLocating(false);
                return;
            }

            const fallback = setTimeout(() => {
                if (profileState) setSelectedState(profileState);
                setDetectedLocation(profileLocation || "Profile Location");
                setIsGeoLocating(false);
            }, 5000);

            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    clearTimeout(fallback);
                    const { latitude, longitude } = pos.coords;
                    const geo = await reverseGeocode(latitude, longitude);
                    if (geo) {
                        const fullStr = geo.parts.join(" ");
                        const stateCode = detectStateFromLocation(fullStr);
                        if (stateCode) setSelectedState(stateCode);
                        else if (profileState) setSelectedState(profileState);
                        setDetectedLocation(geo.label);
                    } else if (profileState) {
                        setSelectedState(profileState);
                        setDetectedLocation(profileLocation);
                    }
                    setIsGeoLocating(false);
                },
                () => {
                    clearTimeout(fallback);
                    if (profileState) setSelectedState(profileState);
                    setDetectedLocation(profileLocation || "Profile Location");
                    setIsGeoLocating(false);
                },
                { timeout: 4500, enableHighAccuracy: true }
            );
        };

        runGeo();
    }, [reverseGeocode]);

    /* ── Fetch prices whenever state changes ── */
    const fetchPrices = useCallback(async (state) => {
        setIsLoading(true);
        try {
            const res = await sellerApi.getMarketPrices(state);
            if (res?.data) {
                setPrices(res.data);
                setLastUpdated(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
            }
        } catch (err) {
            console.error("Failed to fetch market prices:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isGeoLocating) fetchPrices(selectedState);
    }, [selectedState, isGeoLocating, fetchPrices]);

    const avgPrice = prices.length ? Math.round(prices.reduce((s, p) => s + p.price, 0) / prices.length) : 0;
    const highestItem = prices.reduce((max, p) => p.price > (max?.price || 0) ? p : max, null);
    const stateLabel = STATES.find(s => s.code === selectedState)?.label;

    return (
        <PageTransition>
            <motion.div variants={containerVar} initial="hidden" animate="show"
                className="pb-24 px-4 md:px-6 max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <motion.div variants={itemVar} className="flex items-center gap-4">
                    <Button variant="ghost" size="icon"
                        className="h-11 w-11 rounded-2xl border border-slate-100 shadow-sm"
                        onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-5 w-5 text-slate-700" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Market Intelligence</h1>
                        <p className="text-slate-400 dark:text-slate-500 text-sm font-medium mt-0.5 flex items-center gap-1.5">
                            {isGeoLocating ? (
                                <>
                                    <Navigation className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
                                    Detecting your location…
                                </>
                            ) : (
                                <>
                                    <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                                    {detectedLocation || stateLabel} · Updated {lastUpdated || "—"}
                                </>
                            )}
                        </p>
                    </div>
                    <Button variant="ghost" size="icon"
                        className="h-11 w-11 rounded-2xl border border-slate-100"
                        onClick={() => fetchPrices(selectedState)}>
                        <RefreshCw className={`h-4 w-4 text-slate-500 ${isLoading ? "animate-spin" : ""}`} />
                    </Button>
                </motion.div>

                {/* Live Location Badge */}
                {!isGeoLocating && detectedLocation && (
                    <motion.div variants={itemVar}
                        className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3">
                        <Navigation className="h-4 w-4 text-emerald-600 shrink-0" />
                        <div>
                            <p className="text-emerald-700 font-bold text-sm">
                                Live location detected — <span className="font-black">{detectedLocation}</span>
                            </p>
                            <p className="text-emerald-500 text-xs font-medium">
                                Showing mandi rates for <strong>{stateLabel}</strong>.
                                Switch below to view other states.
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* State Filter Tabs */}
                <motion.div variants={itemVar} className="flex gap-2 overflow-x-auto pb-1">
                    {STATES.map(s => (
                        <button key={s.code}
                            onClick={() => setSelectedState(s.code)}
                            className={`shrink-0 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${selectedState === s.code
                                    ? "bg-[#2E7D32] text-white shadow-lg shadow-emerald-900/10"
                                    : "bg-white text-slate-500 border border-slate-100 hover:border-[#2E7D32]/30"
                                }`}>
                            {s.code === selectedState && !isGeoLocating && detectedLocation ? "📍 " : ""}{s.label}
                        </button>
                    ))}
                </motion.div>

                {/* Summary Cards */}
                {!isLoading && prices.length > 0 && (
                    <motion.div variants={itemVar} className="grid grid-cols-2 gap-4">
                        <div className="group relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#2E7D32] via-[#388E3C] to-emerald-600 p-6 text-white shadow-xl shadow-emerald-900/10">
                            <div className="absolute -right-6 -top-6 rotate-12 opacity-10 transition-transform group-hover:rotate-0 duration-700">
                                <TrendingUp className="h-32 w-32" />
                            </div>
                            <div className="relative z-10">
                                <p className="text-emerald-100/70 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Market Average</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black">₹{avgPrice}</span>
                                    <span className="text-sm font-bold opacity-60">/kg</span>
                                </div>
                                <div className="mt-4 flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-3 py-1.5 w-fit border border-white/10">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-wider">{stateLabel} Live</span>
                                </div>
                            </div>
                        </div>

                        <div className="group relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-900 p-6 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none transition-all hover:shadow-2xl">
                            <div className="absolute -right-4 -bottom-4 opacity-5 transition-transform group-hover:scale-110 duration-700">
                                <IndianRupee className="h-28 w-28 text-slate-900 dark:text-white" />
                            </div>
                            <div className="relative z-10">
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Highest Value</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-slate-800 dark:text-white">₹{highestItem?.price}</span>
                                    <span className="text-xs font-bold text-slate-400">/{highestItem?.unit}</span>
                                </div>
                                <p className="mt-3 text-sm font-black text-emerald-600 truncate uppercase tracking-tight">{highestItem?.crop}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Trending Hot 🔥</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Price Table */}
                <motion.div variants={itemVar}>
                    <Card className="border-0 shadow-sm rounded-3xl bg-white overflow-hidden">
                        <CardHeader className="px-6 py-4 border-b border-slate-50 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-[#2E7D32]" />
                                <CardTitle className="text-lg font-black text-slate-800 dark:text-slate-100">
                                    Live Mandi Rates — {stateLabel}
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4">
                            {isLoading || isGeoLocating ? (
                                <div className="space-y-3 animate-pulse">
                                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-slate-50 rounded-2xl" />)}
                                </div>
                            ) : prices.length === 0 ? (
                                <div className="py-12 text-center">
                                    <IndianRupee className="h-8 w-8 mx-auto text-slate-200 mb-3" />
                                    <p className="text-slate-400 font-semibold">No data available</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {prices.map((item, idx) => (
                                        <motion.div key={idx}
                                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.04 }}
                                            className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-[#E8F5E9] transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <div className="h-11 w-11 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center font-black text-slate-600 dark:text-slate-300 text-lg shadow-sm border border-slate-100 dark:border-slate-700 group-hover:border-[#2E7D32]/20 shrink-0">
                                                    {item.crop.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 dark:text-slate-100">{item.crop}</p>
                                                    <div className="flex flex-wrap gap-x-2 gap-y-1 items-center">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.market}</p>
                                                        {item.variety && <span className="text-[9px] font-black bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded uppercase">{item.variety}</span>}
                                                        {item.date && <span className="text-[9px] font-medium text-slate-400">· {item.date}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1 shrink-0">
                                                <div className="text-right">
                                                    <p className="text-xl font-black text-[#2E7D32]">
                                                        ₹{item.price}<span className="text-xs text-slate-400 font-normal">/{item.unit}</span>
                                                    </p>
                                                    {item.min_price && item.max_price && (
                                                        <p className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded mt-0.5">
                                                            Range: ₹{item.min_price} – ₹{item.max_price}
                                                        </p>
                                                    )}
                                                </div>
                                                <TrendBadge trend={item.trend} />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* AI Strategy Panel */}
                <motion.div variants={itemVar}
                    className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-7 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 opacity-10"><Zap className="h-28 w-28" /></div>
                    <div className="relative z-10">
                        <p className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.2em] mb-2">AI Sell Strategy</p>
                        {(() => {
                            const strategy = (() => {
                                if (!prices.length) return {
                                    title: "Analyzing Market Data...",
                                    body: "Fetching latest trends to personalize your sell strategy.",
                                    recommendation: "Stay tuned for live insights."
                                };
                                const hotCrop = prices.find(p => p.trend?.startsWith("+"));
                                const downCrop = prices.find(p => p.trend?.startsWith("-"));

                                if (hotCrop) {
                                    return {
                                        title: `${hotCrop.crop} demand is surging`,
                                        body: `Prices for ${hotCrop.crop} in ${hotCrop.market} are up by ${hotCrop.trend}. Nearby mandis are showing similar patterns.`,
                                        recommendation: `Consider listing your ${hotCrop.crop} stock now to capitalize on the price spike.`
                                    };
                                } else if (downCrop) {
                                    return {
                                        title: `${downCrop.crop} supply increase`,
                                        body: `Prices for ${downCrop.crop} are cooling down slightly. This might be due to high arrivals from nearby regions.`,
                                        recommendation: `If possible, hold your ${downCrop.crop} stock for a few days until arrivals stabilize.`
                                    };
                                }
                                return {
                                    title: "Market is Stable",
                                    body: "Current prices are steady across most crops in your region.",
                                    recommendation: "Good time to list standard quality produce for consistent buyers."
                                };
                            })();
                            return (
                                <div className="flex items-start gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                                        <TrendingUp className="h-6 w-6 text-indigo-200" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg mb-2 leading-tight">
                                            {strategy.title}
                                        </p>
                                        <p className="text-indigo-100 text-sm mb-4 leading-relaxed opacity-80">
                                            {strategy.body}
                                        </p>
                                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                                            <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-1.5 opacity-70">AI Recommendation</p>
                                            <p className="font-bold text-sm leading-snug">{strategy.recommendation}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </motion.div>

            </motion.div>
        </PageTransition>
    );
};

export default MarketTrends;
