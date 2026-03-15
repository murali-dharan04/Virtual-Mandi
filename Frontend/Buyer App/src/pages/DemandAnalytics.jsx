import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, Map as MapIcon, TrendingUp, Info, Zap, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";

const DemandAnalytics = () => {
    const [demandData, setDemandData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDistrict, setSelectedDistrict] = useState(null);

    useEffect(() => {
        const fetchDemand = async () => {
            try {
                const data = await api.getDemandHeatmap();
                setDemandData(data);
                if (data.length > 0) setSelectedDistrict(data[0]);
            } catch (err) {
                console.error("Failed to fetch demand:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDemand();
    }, []);

    // Custom SVG Heatmap representing a abstract map region (e.g. Tamil Nadu / India)
    const MapVisualization = () => (
        <div className="relative w-full aspect-[4/3] bg-slate-900 rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-emerald-500/10 opacity-50" />
            
            <svg viewBox="0 0 400 300" className="w-full h-full p-12">
                <defs>
                    <radialGradient id="heatGradient">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                    </radialGradient>
                </defs>
                
                {/* Simplified Abstract Region Path */}
                <path 
                    d="M150 50 L250 50 L300 150 L250 250 L150 250 L100 150 Z" 
                    fill="none" 
                    stroke="rgba(255,255,255,0.1)" 
                    strokeWidth="2" 
                    className="animate-pulse-soft"
                />

                {demandData.map((d, i) => {
                    const x = 100 + (i * 35) % 200;
                    const y = 80 + (i * 25) % 150;
                    const radius = 20 + d.score * 40;
                    
                    return (
                        <g key={i} className="cursor-pointer" onClick={() => setSelectedDistrict(d)}>
                            <circle 
                                cx={x} cy={y} r={radius} 
                                fill="url(#heatGradient)" 
                                className="animate-pulse"
                                style={{ animationDuration: `${2 + i % 3}s` }}
                            />
                            <motion.circle 
                                initial={{ r: 0 }}
                                animate={{ r: 4 }}
                                cx={x} cy={y} 
                                fill={d.score > 0.8 ? "#ef4444" : "#fbbf24"} 
                            />
                            {selectedDistrict?.district === d.district && (
                                <circle cx={x} cy={y} r={radius + 5} fill="none" stroke="white" strokeWidth="1" strokeDasharray="4 4" className="animate-spin-slow" />
                            )}
                        </g>
                    );
                })}
            </svg>

            {/* Map Overlay info */}
            <div className="absolute bottom-10 left-10 p-6 bg-black/40 backdrop-blur-3xl rounded-[2rem] border border-white/10 max-w-xs">
                <p className="text-emerald-400 font-bold uppercase tracking-widest text-[10px] mb-2 flex items-center gap-2">
                    <Zap className="h-3 w-3" /> Live Demand Signals
                </p>
                <h4 className="text-white font-black italic text-xl leading-none">{selectedDistrict?.district || "Global"} Market</h4>
                <div className="mt-4 flex items-center gap-4">
                    <div>
                        <p className="text-slate-500 font-bold text-[10px] uppercase">Intensity</p>
                        <p className="text-white font-black">{Math.round((selectedDistrict?.score || 0) * 100)}%</p>
                    </div>
                    <div className="h-8 w-px bg-white/10" />
                    <div>
                        <p className="text-slate-500 font-bold text-[10px] uppercase">Trend</p>
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-none px-2 py-0 text-[10px]">+14%</Badge>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-20 max-w-7xl mx-auto px-6 pt-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                         <div className="h-12 w-12 rounded-2xl bg-slate-950 flex items-center justify-center border border-white/10 shadow-xl">
                            <TrendingUp className="h-6 w-6 text-emerald-500" />
                         </div>
                         <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic">Demand Intelligence</h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md">
                        AI-powered market sentiment analysis and real-time demand mapping across the ONDC network.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Badge variant="outline" className="h-10 rounded-xl px-4 border-slate-200 dark:border-slate-800 text-slate-500 flex gap-2">
                        <Globe className="h-4 w-4" /> Pan-India Data
                    </Badge>
                    <Badge className="h-10 rounded-xl px-4 bg-slate-900 text-white border-none flex gap-2">
                        <Zap className="h-4 w-4" /> Refreshing Every 5s
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left - Map View */}
                <div className="lg:col-span-8">
                    <MapVisualization />
                </div>

                {/* Right - Stats & Insights */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
                        <CardContent className="p-8">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white italic mb-6 flex items-center gap-3">
                                <BarChart3 className="h-5 w-5 text-emerald-500" /> High Demand Clusters
                            </h3>
                            <div className="space-y-4">
                                {demandData.slice(0, 5).map((d, i) => (
                                    <div key={i} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">{d.district}</p>
                                            <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">{d.level} Velocity</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-black text-slate-900 dark:text-white italic">{Math.round(d.score * 100)}</p>
                                            <div className="h-1 w-12 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${d.score * 100}%` }}
                                                    className="h-full bg-emerald-500" 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-blue-700 border-none shadow-2xl overflow-hidden relative">
                         <div className="absolute top-0 right-0 h-32 w-32 bg-white/10 blur-[50px]" />
                         <CardContent className="p-8 relative z-10">
                            <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6">
                                <Info className="h-6 w-6 text-white" />
                            </div>
                            <h4 className="text-2xl font-black text-white italic mb-4 leading-none text-balance">Supply Prediction Engine</h4>
                            <p className="text-blue-100/80 font-medium text-sm leading-relaxed mb-6">
                                Based on search volume, we expect a <span className="text-white font-black underline decoration-indigo-400">12% price hike</span> in Tomato markets over the next 48 hours.
                            </p>
                            <Button className="w-full h-14 rounded-2xl bg-white text-indigo-700 font-black uppercase tracking-widest text-[10px] hover:bg-blue-50">
                                View Strategy
                            </Button>
                         </CardContent>
                    </Card>
                </div>
            </div>
        </motion.div>
    );
};

export default DemandAnalytics;
