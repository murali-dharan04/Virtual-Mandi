import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { onListingEvents } from "@/services/socketService";
import SearchBar from "@/components/SearchBar";
import ListingCard from "@/components/ListingCard";
import FilterPanel from "@/components/FilterPanel";
import { SlidersHorizontal, Leaf, Loader2, ShoppingBasket, Search, Zap, TrendingUp, Map, Star, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import PageTransition from "@/components/PageTransition";

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.08 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 18 } }
};

const Home = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [listings, setListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [filters, setFilters] = useState({
        category: "All",
        qualityGrade: searchParams.get("filter") === "organic" ? "A" : "All",
        sortBy: searchParams.get("sort") === "price_asc" ? "price-asc" :
            searchParams.get("sort") === "price_desc" ? "price-desc" : "price-asc",
        maxPrice: parseInt(searchParams.get("maxPrice")) || 10000,
        state: "All States",
        district: "All Districts",
    });

    useEffect(() => {
        const urlSearch = searchParams.get("search");
        if (urlSearch && urlSearch !== search) {
            setSearch(urlSearch);
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchListings = async () => {
            setIsLoading(true);
            try {
                const results = await api.search(search);
                setListings(results);
            } catch (err) {
                console.error("Failed to fetch listings", err);
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(fetchListings, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Setup Socket.IO real-time listeners
    useEffect(() => {
        const unsubscribe = onListingEvents({
            onCreate: (newListing) => {
                setListings(prev => {
                    // Prevent duplicates
                    if (prev.some(l => l.id === newListing.id)) return prev;
                    return [newListing, ...prev];
                });
            },
            onUpdate: (updatedListing) => {
                setListings(prev => prev.map(l => l.id === updatedListing.id ? { ...l, ...updatedListing } : l));
            },
            onDelete: ({ id }) => {
                setListings(prev => prev.filter(l => l.id !== id));
            }
        });

        return () => unsubscribe();
    }, []);

    const filtered = useMemo(() => {
        let items = [...listings].filter((l) => {
            if (filters.category !== "All" && l.category !== filters.category) return false;
            if (filters.qualityGrade !== "All" && l.qualityGrade !== filters.qualityGrade) return false;
            if (filters.state !== "All States" && l.state !== filters.state) return false;
            if (filters.district !== "All Districts" && l.location !== filters.district) return false;
            if (l.pricePerUnit > filters.maxPrice) return false;
            return true;
        });

        switch (filters.sortBy) {
            case "price-asc": items.sort((a, b) => a.pricePerUnit - b.pricePerUnit); break;
            case "price-desc": items.sort((a, b) => b.pricePerUnit - a.pricePerUnit); break;
            case "newest": items.sort((a, b) => b.id.toString().localeCompare(a.id.toString())); break;
            case "distance": items.sort((a, b) => a.distance - b.distance); break;
            case "quality": items.sort((a, b) => a.qualityGrade.localeCompare(b.qualityGrade)); break;
        }
        return items;
    }, [search, filters, listings]);

    // Quick category chips
    const categories = ["All", "Grains", "Vegetables", "Fruits"];

    return (
        <PageTransition>
            <div className="min-h-screen bg-background">
                {/* Compact Hero Section */}
                <div className="relative overflow-hidden bg-emerald-700 px-4 py-8 md:py-10">
                    {/* Subtle gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-700 to-teal-800" />
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" />
                    <div className="absolute -bottom-12 -left-12 w-80 h-80 bg-teal-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse animation-delay-2000" />

                    <div className="container relative z-10 max-w-4xl mx-auto text-center">
                        <motion.div variants={containerVariants} initial="hidden" animate="show">
                            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 mb-3 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80">
                                <ShoppingBasket className="h-4 w-4" />
                                <span className="text-xs font-semibold uppercase tracking-wider">Virtual Mandi</span>
                            </motion.div>

                            <motion.h1 variants={itemVariants} className="mb-2 text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
                                Buy Fresh Produce <br />
                                <span className="bg-gradient-to-r from-emerald-200 to-teal-100 bg-clip-text text-transparent">Directly from Farmers</span>
                            </motion.h1>

                            <motion.p variants={itemVariants} className="mb-5 max-w-xl mx-auto text-base md:text-lg text-emerald-50/70 font-medium leading-relaxed">
                                Search for grains, vegetables, fruits – all at fair prices, fresh from farms near you.
                            </motion.p>

                            {/* Search Bar */}
                            <motion.div variants={itemVariants} className="mx-auto max-w-2xl">
                                <div className="flex items-center gap-2 bg-white rounded-2xl shadow-xl p-2 relative">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                        <SearchBar
                                            value={search}
                                            onChange={setSearch}
                                            className="w-full h-14 bg-transparent border-none text-slate-800 placeholder-slate-400 focus:ring-0 text-lg font-medium pl-12 pr-4"
                                        />
                                    </div>
                                </div>
                            </motion.div>

                            {/* Intelligence Shortcuts Removed */}
                        </motion.div>
                    </div>
                </div>

                {/* Category Quick Chips & Mandi news */}
                <div className="container max-w-6xl mx-auto px-4 py-1.5">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            {categories.map((cat) => (
                                <motion.button
                                    key={cat}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setFilters(f => ({ ...f, category: cat }))}
                                    className={`whitespace-nowrap px-5 py-2 rounded-full text-xs font-bold border transition-all shadow-sm ${filters.category === cat
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-200'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700 hover:shadow-md'
                                        }`}
                                >
                                    {cat}
                                </motion.button>
                            ))}
                        </div>

                        {/* Mandi News Ticker */}
                        <div className="hidden lg:flex items-center gap-3 bg-amber-50/50 border border-amber-100/50 rounded-xl px-4 py-1.5 min-w-[300px]">
                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span className="text-[9px] font-black uppercase text-amber-600 tracking-wider">Live News</span>
                            <p className="text-[11px] font-bold text-amber-900/80 line-clamp-1">Onion prices expected to drop by 10% next week in Nasik Mandi.</p>
                        </div>
                    </div>
                </div>

                <div className="container max-w-6xl mx-auto px-4 pt-2 pb-4">
                    <div className="flex gap-6">
                        {/* Filter sidebar - desktop */}
                        <div className="hidden md:block">
                            <FilterPanel open={filtersOpen || true} onClose={() => setFiltersOpen(false)} filters={filters} onFilterChange={setFilters} />
                        </div>
                        {/* Filter mobile */}
                        <div className="md:hidden">
                            <FilterPanel open={filtersOpen} onClose={() => setFiltersOpen(false)} filters={filters} onFilterChange={setFilters} />
                        </div>

                        {/* Listings */}
                        <div className="flex-1">
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-bold text-foreground">{filtered.length}</span> {t("common.listings_found")}
                                </p>
                            </div>
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <Loader2 className="mb-4 h-12 w-12 animate-spin text-emerald-500" />
                                    <h3 className="text-lg font-semibold text-slate-700">{t("common.loading")}</h3>
                                    <p className="text-sm text-slate-500 mt-1">Searching farms near you...</p>
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <Leaf className="mb-4 h-14 w-14 text-slate-300" />
                                    <h3 className="text-lg font-semibold text-slate-700">{t("common.no_results")}</h3>
                                    <p className="text-sm text-slate-500 mt-1">{t("common.no_results_sub")}</p>
                                </div>
                            ) : (
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="show"
                                    className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
                                >
                                    {filtered.map((listing, i) => (
                                        <ListingCard key={listing.id} listing={listing} index={i} allListings={filtered} />
                                    ))}
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default Home;
