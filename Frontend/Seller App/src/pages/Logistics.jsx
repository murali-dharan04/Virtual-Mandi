import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Truck, MapPin, Navigation, Phone, Gauge, 
    CreditCard, ChevronRight, Search, Filter 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sellerApi } from "@/lib/api";
import PageTransition from "@/components/PageTransition";

const Logistics = () => {
    const [vehicles, setVehicles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchLogistics = async () => {
            try {
                const data = await sellerApi.getNearbyLogistics();
                setVehicles(data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLogistics();
    }, []);

    const filtered = vehicles.filter(v => 
        (v.type || "").toLowerCase().includes(search.toLowerCase()) ||
        (v.driver || "").toLowerCase().includes(search.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Scanning Mandi Logistics...</p>
            </div>
        );
    }

    return (
        <PageTransition>
            <div className="max-w-2xl mx-auto pb-24 px-2">
                {/* Compact Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight leading-none">Logistics</h1>
                        <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Nearby Transport</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{vehicles.length} ACTIVE DRIVERS</span>
                    </div>
                </div>

                {/* Location Detection */}
                <div className="bg-slate-900 rounded-2xl p-4 mb-6 shadow-lg border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Navigation className="h-12 w-12 text-white" />
                    </div>
                    <div className="relative z-10 flex flex-col gap-1">
                        <span className="text-[8px] font-black text-blue-400 uppercase tracking-[0.2em]">Pickup Location</span>
                        <p className="text-xs font-bold text-white uppercase italic">Salem District Mandi Compound</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Search vehicle or driver..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-11 pl-11 pr-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm text-[11px] font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    />
                </div>

                {/* Vehicle Grid */}
                <div className="space-y-3">
                    <AnimatePresence>
                        {filtered.map((v, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: i * 0.05 }}
                                className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer overflow-hidden"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                            <Truck className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase leading-none mb-1">{v.type}</h3>
                                            <div className="flex items-center gap-1.5">
                                                <Phone className="h-2.5 w-2.5 text-slate-400" />
                                                <p className="text-[9px] font-bold text-slate-500">{v.driver}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-2 py-0 text-[8px] font-black tracking-widest uppercase">Available</Badge>
                                </div>

                                <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-50 dark:border-slate-800/50">
                                    <div className="text-center">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Capacity</p>
                                        <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase leading-none">{v.capacity}</p>
                                    </div>
                                    <div className="text-center border-x border-slate-100 dark:border-slate-800 px-2">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Distance</p>
                                        <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase leading-none">{v.distance}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Rate/km</p>
                                        <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 leading-none">₹{v.cost_est}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="h-3 w-3 text-slate-400" />
                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">ONDC Verified Payout</span>
                                    </div>
                                    <Button className="h-8 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-all">
                                        Book Now
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-20">
                        <div className="h-16 w-16 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-800 text-slate-300">
                            <Truck className="h-8 w-8" />
                        </div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No nearby vehicles found</p>
                        <Button 
                            variant="link" 
                            className="text-[10px] font-black uppercase tracking-widest text-blue-600 mt-2"
                        >
                            Broadcast Load Requirement
                        </Button>
                    </div>
                )}
            </div>
        </PageTransition>
    );
};

export default Logistics;
