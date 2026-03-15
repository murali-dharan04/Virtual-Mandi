import { motion } from "framer-motion";
import { Plus, Search, Edit, Trash2, Package, TrendingUp, Leaf, MapPin, Sparkles, Calendar, ListPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { sellerApi } from "@/lib/api";
import { useTranslation } from "react-i18next";

const Listings = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [search, setSearch] = useState("");
    const [listings, setListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sortBy, setSortBy] = useState("newest"); // newest, price-asc, price-desc, qty-desc

    const statusVariant = {
        active: "default",
        sold: "secondary",
        expired: "outline",
    };

    const fetchListings = async () => {
        try {
            const data = await sellerApi.getListings();
            if (Array.isArray(data)) {
                const formatted = data.map(l => ({
                    id: l.id || l._id,
                    cropName: l.name || l.crop_name || l.cropName || "Unnamed Crop",
                    quantity: l.quantity || 0,
                    unit: l.unit || "kg",
                    pricePerUnit: l.price_per_unit || l.pricePerUnit || 0,
                    qualityGrade: l.quality_grade || l.qualityGrade || "N/A",
                    location: l.location || "Unknown",
                    status: l.status || "active",
                    imageUrl: l.imageUrl || l.image_url || null,
                    createdAt: l.createdAt || l.created_at || new Date().toISOString()
                }));
                setListings(formatted);
            }
        } catch (err) {
            console.error("Failed to fetch listings:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
        const interval = setInterval(fetchListings, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this listing?")) return;

        try {
            const res = await sellerApi.deleteListing(id);
            if (res.message) {
                toast({ title: t("listings.delete"), description: "The item has been removed." });
                setListings(prev => prev.filter(l => l.id !== id));
            } else {
                toast({ title: "Error", description: res.error || "Failed to delete item", variant: "destructive" });
            }
        } catch (err) {
            toast({ title: "Error", description: "Failed to delete item", variant: "destructive" });
        }
    };

    const sortedListings = [...listings].sort((a, b) => {
        if (sortBy === "price-asc") return a.pricePerUnit - b.pricePerUnit;
        if (sortBy === "price-desc") return b.pricePerUnit - a.pricePerUnit;
        if (sortBy === "qty-desc") return b.quantity - a.quantity;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const filtered = sortedListings.filter((l) =>
        (l.cropName || "").toLowerCase().includes(search.toLowerCase())
    );

    // Stats
    const totalInventoryValue = listings.reduce((acc, curr) => acc + (curr.pricePerUnit * curr.quantity), 0);
    const activeCrops = new Set(listings.map(l => l.cropName)).size;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-10">
            {/* Immersive Header Section */}
            <div className="relative overflow-hidden rounded-[3.5rem] bg-slate-950 p-8 md:p-12 shadow-[0_32px_96px_-12px_rgba(0,0,0,0.3)] border border-white/10">
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center opacity-30 scale-105 transition-transform duration-[10s] hover:scale-100"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?q=80&w=2000&auto=format&fit=crop')" }}
                />
                <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#2E7D32]/60 via-slate-950/90 to-slate-950" />
                
                {/* Decorative Elements */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />

                <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-[0.2em] backdrop-blur-md border border-emerald-500/20">
                                <Sparkles className="h-3 w-3" />
                                ONDC Certified Seller
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight italic flex items-center gap-4">
                                {t("listings.title")}
                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse hidden md:block" />
                            </h1>
                        </div>
                        <p className="text-slate-400 text-lg font-medium max-w-xl leading-relaxed">
                            Monitor and manage your harvest. Our AI optimization helps you reach <span className="text-white font-bold">12k+ active buyers</span> in real-time.
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-6 pt-2">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                                    <TrendingUp className="h-6 w-6 text-orange-400" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Inventory Value</p>
                                    <p className="text-2xl font-black text-white">₹{(totalInventoryValue / 1000).toFixed(1)}k <span className="text-[10px] text-slate-500 font-bold ml-1">Total est.</span></p>
                                </div>
                            </div>
                            <div className="h-10 w-px bg-white/10 hidden md:block" />
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                                    <Package className="h-6 w-6 text-emerald-400" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Active Listings</p>
                                    <p className="text-2xl font-black text-white">{activeCrops} <span className="text-[10px] text-slate-500 font-bold ml-1">Commodities</span></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <motion.button
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate("/listings/new")}
                            className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white h-16 px-10 rounded-[1.5rem] text-sm font-black uppercase tracking-widest shadow-[0_20px_40px_-8px_rgba(46,125,50,0.5)] transition-all flex items-center justify-center gap-3 active:shadow-none"
                        >
                            <Plus className="h-5 w-5 stroke-[3]" /> {t("listings.add")}
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <Input
                        placeholder={t("listings.search")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-12 h-14 rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm focus:ring-emerald-500/20 text-lg font-medium text-slate-900 dark:text-slate-100"
                    />
                </div>
                
                <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2 shrink-0">Sort By:</p>
                    {[
                        { id: "newest", label: "Newest" },
                        { id: "price-asc", label: "Lowest Price" },
                        { id: "price-desc", label: "Highest Price" },
                        { id: "qty-desc", label: "Highest Stock" },
                    ].map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => setSortBy(opt.id)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
                                sortBy === opt.id 
                                ? "bg-slate-900 text-white" 
                                : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700 hover:border-slate-200"
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((listing, index) => (
                    <motion.div
                        key={listing.id}
                        layout
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -8 }}
                        className="group h-full"
                    >
                        <Card className="h-full flex flex-col overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2.5rem] relative">
                            {/* Value Overlap Badge */}
                            <div className="absolute top-4 left-4 z-20">
                                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-sm border border-slate-50 dark:border-white/5 flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-orange-500" />
                                    <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest">₹{(listing.pricePerUnit * listing.quantity).toLocaleString()} Val</span>
                                </div>
                            </div>

                            {/* Image Section */}
                            <div className="relative h-56 bg-slate-50 overflow-hidden">
                                {listing.imageUrl ? (
                                    <img src={listing.imageUrl} alt={listing.cropName} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-emerald-50/50 to-emerald-100/50">
                                        <Leaf className="h-16 w-16 text-emerald-200" />
                                    </div>
                                )}
                                
                                <div className="absolute top-4 right-4 z-20">
                                    <Badge variant={statusVariant[listing.status]} className="capitalize font-black px-4 py-1.5 rounded-xl border-0 shadow-lg shadow-black/10 text-[10px] tracking-widest uppercase">
                                        {listing.status}
                                    </Badge>
                                </div>

                                {/* Location Overlay */}
                                <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center gap-2 bg-slate-900/40 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-white/10 shadow-xl">
                                    <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-[0.1em] truncate">{listing.location}</span>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-60" />
                            </div>

                            <CardContent className="p-8 flex-1 flex flex-col">
                                <div className="mb-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 line-clamp-1 italic tracking-tight">{listing.cropName}</h3>
                                        <div className="h-8 w-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-xs border border-emerald-100 dark:border-emerald-800/50 shadow-sm shrink-0">
                                            {listing.qualityGrade}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="h-1 w-8 bg-emerald-500 rounded-full" />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verified Commodity</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="bg-slate-50/80 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors group-hover:bg-emerald-50/30 group-hover:border-emerald-100/50">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 leading-none">Stock Weight</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xl font-black text-slate-900 dark:text-slate-100">{listing.quantity}</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase">{listing.unit}</span>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50/80 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors group-hover:bg-emerald-50/30 group-hover:border-emerald-100/50">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 leading-none">Rate Price</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xl font-black text-slate-900 dark:text-slate-100">₹{listing.pricePerUnit}</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase">/{listing.unit}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-auto">
                                    <Button
                                        variant="outline"
                                        className="flex-1 h-14 rounded-2xl border-slate-100 dark:border-slate-800 shadow-sm font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-200 transition-all hover:translate-y-[-2px] active:translate-y-0"
                                        onClick={() => navigate(`/listings/edit/${listing.id}`)}
                                    >
                                        <Edit className="h-3.5 w-3.5 mr-2 stroke-[3]" /> {t("listings.edit")}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-14 w-14 rounded-2xl border-orange-50 dark:border-orange-500/20 text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-orange-500 transition-all hover:translate-y-[-2px] active:translate-y-0 shadow-sm"
                                        onClick={(e) => handleDelete(e, listing.id)}
                                    >
                                        <Trash2 className="h-4 w-4 stroke-[3]" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {isLoading && (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mb-4" />
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest animate-pulse">Syncing Inventory...</p>
                </div>
            )}

            {!isLoading && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                    <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm">
                        <Package className="h-8 w-8 text-slate-200" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2 italic">No Listings Found</h3>
                    <p className="text-slate-400 text-sm font-medium mb-8 text-center max-w-xs">
                        {search ? "No matches found for your search." : "Ready to start selling? Create your first ONDC listing."}
                    </p>
                    {!search && (
                        <Button onClick={() => navigate("/listings/new")} className="h-14 px-8 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-widest shadow-lg">
                            Get Started
                        </Button>
                    )}
                </div>
            )}
        </motion.div>
    );
};

export default Listings;
