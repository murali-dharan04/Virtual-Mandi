import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
    Plus, Search, Edit2, Trash2, Package, MapPin, 
    IndianRupee, Boxes, Filter, MoreVertical, X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { sellerApi } from "@/lib/api";
import PageTransition from "@/components/PageTransition";

const Listings = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [search, setSearch] = useState("");
    const [listings, setListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // all, active, sold

    const fetchListings = async () => {
        try {
            const data = await sellerApi.getListings();
            if (Array.isArray(data)) {
                setListings(data.map(l => ({
                    id: l.id || l._id,
                    cropName: l.name || l.crop_name || l.cropName || "Unnamed",
                    quantity: l.quantity || 0,
                    unit: l.unit || "kg",
                    pricePerUnit: l.price || l.price_per_unit || l.pricePerUnit || 0,
                    status: l.status || "active",
                    imageUrl: l.imageUrl || null,
                    location: l.location || "N/A"
                })));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, []);

    const handleDelete = async (id) => {
        try {
            await sellerApi.deleteListing(id);
            toast({ title: "Listing Deleted" });
            setListings(prev => prev.filter(l => l.id !== id));
        } catch (err) {
            toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
        }
    };

    const filtered = listings.filter(l => {
        const matchesSearch = l.cropName.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === "all" || l.status === filter;
        return matchesSearch && matchesFilter;
    });

    const stats = {
        total: listings.length,
        active: listings.filter(l => l.status === "active").length,
        value: listings.reduce((sum, l) => sum + (l.quantity * l.pricePerUnit), 0)
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Loading Crops...</p>
            </div>
        );
    }

    return (
        <PageTransition>
            <div className="max-w-2xl mx-auto pb-24">
                {/* Compact Top Bar */}
                <div className="flex items-center justify-between mb-6 px-2">
                    <div>
                        <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight leading-none">Your Crops</h1>
                        <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Manage Inventory</p>
                    </div>
                    <Button 
                        onClick={() => navigate("/listings/new")}
                        className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-500/20"
                    >
                        <Plus className="h-4 w-4 mr-2 stroke-[3]" /> Add Crop
                    </Button>
                </div>

                {/* Inline Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6 px-2">
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total</p>
                        <p className="text-sm font-black text-slate-900 dark:text-white">{stats.total}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Live</p>
                        <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{stats.active}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Value</p>
                        <p className="text-sm font-black text-slate-900 dark:text-white">₹{(stats.value / 1000).toFixed(1)}k</p>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="flex gap-2 mb-6 px-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder="Search crop..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-10 pl-9 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-[11px] font-bold"
                        />
                    </div>
                    <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-24 h-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="all" className="text-[10px] font-bold uppercase tracking-widest">All</SelectItem>
                            <SelectItem value="active" className="text-[10px] font-bold uppercase tracking-widest">Live</SelectItem>
                            <SelectItem value="sold" className="text-[10px] font-bold uppercase tracking-widest">Sold</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* High-Density Grid */}
                <div className="grid grid-cols-2 gap-3 px-2">
                    <AnimatePresence>
                        {filtered.map((crop) => (
                            <motion.div 
                                key={crop.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                                onClick={() => navigate(`/listings/edit/${crop.id}`)}
                            >
                                <div className="relative h-28 bg-slate-50 dark:bg-slate-800">
                                    {crop.imageUrl ? (
                                        <img src={crop.imageUrl} className="w-full h-full object-cover" alt={crop.cropName} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package className="h-8 w-8 text-slate-200" />
                                        </div>
                                    )}
                                    <div className={`absolute top-2 right-2 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${crop.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'}`}>
                                        {crop.status}
                                    </div>
                                </div>
                                <div className="p-3">
                                    <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase truncate mb-1">{crop.cropName}</h3>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[9px] font-bold text-slate-400 leading-tight">{crop.quantity} {crop.unit}</p>
                                            <p className="text-[10px] font-black text-slate-900 dark:text-white">₹{crop.pricePerUnit}/{crop.unit}</p>
                                        </div>
                                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-7 w-7 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600"
                                                onClick={() => navigate(`/listings/edit/${crop.id}`)}
                                            >
                                                <Edit2 className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-7 w-7 rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-500"
                                                onClick={() => handleDelete(crop.id)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-20 px-6">
                        <div className="h-16 w-16 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-800 text-slate-300">
                            <Boxes className="h-8 w-8" />
                        </div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No crops found</p>
                    </div>
                )}
            </div>
        </PageTransition>
    );
};

export default Listings;
