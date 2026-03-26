import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
    User, Mail, Phone, MapPin, Shield, Bell, 
    ArrowLeft, Camera, Edit2, CheckCircle2,
    Calendar, Package, ShoppingCart, IndianRupee, LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sellerApi } from "@/lib/api";
import PageTransition from "@/components/PageTransition";

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem("sellerUser");
            return saved ? JSON.parse(saved) : null;
        } catch { return null; }
    });
    const [stats, setStats] = useState({ activeListings: 0, totalOrders: 0, revenue: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const s = await sellerApi.getDashboardStats();
                if (s) setStats(s);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("sellerToken");
        localStorage.removeItem("sellerUser");
        navigate("/login");
    };

    const initials = user?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "S";

    return (
        <PageTransition>
            <div className="max-w-2xl mx-auto pb-24 px-2">
                {/* Compact Top Bar */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => navigate(-1)} 
                            className="h-9 w-9 rounded-xl border border-slate-100 dark:border-slate-800"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase italic leading-none">Settings</h1>
                            <p className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Account Profile</p>
                        </div>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleLogout}
                        className="h-9 px-3 rounded-xl border border-rose-100 text-rose-500 text-[10px] font-black uppercase tracking-widest"
                    >
                        <LogOut className="h-3.5 w-3.5 mr-2" /> Logout
                    </Button>
                </div>

                {/* Profile Overview Card */}
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6 mb-6 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5">
                        <User className="h-24 w-24" />
                    </div>
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="relative">
                            <div className="h-20 w-20 rounded-[1.5rem] bg-emerald-600 flex items-center justify-center text-2xl font-black text-white shadow-xl">
                                {initials}
                            </div>
                            <button className="absolute -bottom-1 -right-1 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-100 dark:border-slate-700">
                                <Camera className="h-3 w-3 text-slate-600" />
                            </button>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic leading-none">{user?.name}</h2>
                            <div className="flex items-center gap-1.5 mt-2">
                                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Verified Merchant</span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 mt-1">{user?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Grid Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                        { label: "Earnings", val: `₹${(stats.revenue || 0).toLocaleString()}`, color: "text-emerald-500" },
                        { label: "Listings", val: stats.activeListings, color: "text-blue-500" },
                        { label: "Orders", val: stats.totalOrders, color: "text-orange-500" }
                    ].map((s, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-center shadow-sm">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{s.label}</p>
                            <p className={`text-xs font-black ${s.color} uppercase`}>{s.val}</p>
                        </div>
                    ))}
                </div>

                {/* Form Fields */}
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6 space-y-5 shadow-sm">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Business Name</Label>
                            <div className="relative">
                                <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                                <Input value={user?.name} className="h-11 pl-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Phone Number</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                                <Input value="+91 98765 43210" className="h-11 pl-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Location / Mandi</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                                <Input value={user?.location || "Delhi, India"} className="h-11 pl-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs" />
                            </div>
                        </div>
                    </div>

                    <Button className="w-full h-12 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-gray-900 font-black uppercase tracking-widest text-[10px] shadow-lg active:scale-95 transition-all">
                        Update Account Security
                    </Button>
                </div>
            </div>
        </PageTransition>
    );
};

export default Profile;
