import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Truck, MapPin, Navigation, Phone, Gauge, CreditCard, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sellerApi } from "@/lib/api";

const Logistics = () => {
    const [vehicles, setVehicles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLogistics = async () => {
            try {
                const data = await sellerApi.getNearbyLogistics();
                setVehicles(data);
            } catch (err) {
                console.error("Failed to fetch logistics:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLogistics();
    }, []);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="relative overflow-hidden rounded-[3rem] bg-slate-950 p-12 shadow-2xl border border-white/5">
                <div className="absolute -bottom-20 -left-20 h-64 w-64 bg-blue-500/10 blur-[100px] animate-pulse-soft" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <Badge className="mb-4 bg-blue-500/20 text-blue-400 border-none px-4 py-1.5 backdrop-blur-xl">Smart Matching</Badge>
                        <h1 className="text-5xl font-black text-white tracking-tighter italic leading-none mb-4">Logistics Core</h1>
                        <p className="text-slate-400 text-lg font-medium max-w-xl">
                            Real-time transport matching for your harvest. Find verified drivers nearby and optimize your supply chain.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-xl">
                            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-2">Nearby Drivers</p>
                            <p className="text-3xl font-black text-white italic leading-none">12</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                        <div className="flex flex-col items-center gap-4">
                            <div className="h-10 w-10 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Scanning ONDC Logistics Mesh...</p>
                        </div>
                    </div>
                ) : (
                    vehicles.map((v, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all group overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="flex flex-col md:flex-row">
                                        <div className="p-8 flex-1 space-y-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-5">
                                                    <div className="h-16 w-16 rounded-[1.5rem] bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                                                        <Truck className="h-8 w-8 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-2xl font-black italic text-slate-900 dark:text-white leading-none mb-1">{v.type}</h3>
                                                        <p className="text-slate-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                                                            <Phone className="h-3 w-3" /> Driver: {v.driver}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge className="bg-emerald-500/10 text-emerald-600 border-none px-4 py-1 font-black">Available Now</Badge>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                                <div className="space-y-1">
                                                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5"><Gauge className="h-3 w-3" /> Capacity</p>
                                                    <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{v.capacity}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5"><Navigation className="h-3 w-3" /> Distance</p>
                                                    <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{v.distance}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5"><CreditCard className="h-3 w-3" /> Est. Cost</p>
                                                    <p className="text-lg font-black text-blue-600 leading-none">₹{v.cost_est}</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 md:w-48 flex items-center justify-center border-l border-slate-100 dark:border-slate-800">
                                            <Button className="w-full md:w-auto h-16 w-16 rounded-[1.5rem] bg-white dark:bg-slate-900 hover:bg-slate-900 hover:text-white text-slate-900 dark:text-white font-black shadow-sm group transition-all">
                                                <ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>
            
            <div className="bg-slate-950 p-10 rounded-[3rem] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex flex-col gap-4">
                    <p className="text-white text-2xl font-black italic">Ready to move your produce?</p>
                    <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-blue-500" />
                        <p className="text-slate-400 font-medium">Pickup location detected: <span className="text-white">Salem District Mandi Compound</span></p>
                    </div>
                </div>
                <Button className="h-16 px-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest shadow-xl shadow-blue-900/20">
                    Post Bulk Load Requirement
                </Button>
            </div>
        </motion.div>
    );
};

export default Logistics;
