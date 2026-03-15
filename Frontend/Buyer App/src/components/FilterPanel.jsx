import { X, MapPin, CheckSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const categories = ["All", "Vegetables", "Fruits", "Grains", "Spices", "Pulses"];
const grades = ["All", "A", "B", "C"];
const sortOptions = [
    { value: "price-asc", label: "Lowest Price" },
    { value: "price-desc", label: "Highest Price" },
    { value: "distance", label: "Nearest" },
    { value: "quality", label: "Highest Quality" },
];

const DISTRICTS = [
    "All Districts",
    "Nashik", "Pune", "Nagpur", "Amravati",
    "Ludhiana", "Amritsar", "Patiala", "Jalandhar",
    "Karnal", "Hisar", "Rohtak", "Ambala",
    "Azadpur (Delhi)", "Shahadra",
    "Coimbatore", "Salem", "Madurai", "Trichy",
    "Hyderabad", "Warangal", "Vijayawada",
    "Hubli", "Belgaum", "Mysuru",
    "Jaipur", "Jodhpur", "Udaipur",
    "Indore", "Bhopal", "Gwalior",
    "Patna", "Muzaffarpur", "Gaya",
    "Lucknow", "Varanasi", "Agra", "Kanpur",
];

const availability = ["All", "In Stock", "Pre-order"];

const FilterSection = ({ title, children }) => (
    <div>
        <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{title}</p>
        {children}
    </div>
);

const ChipButton = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all duration-200 ${active
            ? "bg-emerald-600 text-white shadow-sm"
            : "bg-secondary text-secondary-foreground hover:bg-emerald-50 hover:text-emerald-700"
            }`}
    >
        {children}
    </button>
);

const FilterPanel = ({ open, onClose, filters, onFilterChange }) => {
    const update = (key, value) => onFilterChange({ ...filters, [key]: value });

    const activeCount = [
        filters.category !== "All",
        filters.qualityGrade !== "All",
        filters.district && filters.district !== "All Districts",
        filters.availability && filters.availability !== "All",
        filters.maxPrice < 10000,
    ].filter(Boolean).length;

    const clearAll = () => onFilterChange({
        category: "All",
        qualityGrade: "All",
        sortBy: "price-asc",
        maxPrice: 10000,
        district: "All Districts",
        availability: "All",
    });

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm md:hidden"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed right-0 top-0 z-50 h-full w-80 overflow-y-auto border-l border-border bg-card shadow-2xl md:static md:z-auto md:h-auto md:w-64 md:rounded-2xl md:border md:shadow-card"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-card z-10 flex items-center justify-between px-5 py-4 border-b border-border">
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-black text-foreground">Filters</h3>
                                {activeCount > 0 && (
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white">
                                        {activeCount}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                {activeCount > 0 && (
                                    <button onClick={clearAll} className="text-xs font-bold text-emerald-600 hover:underline">
                                        Clear all
                                    </button>
                                )}
                                <button onClick={onClose} className="md:hidden p-1 rounded-lg hover:bg-secondary">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6 p-5">
                            {/* Category */}
                            <FilterSection title="Category">
                                <div className="flex flex-wrap gap-2">
                                    {categories.map((cat) => (
                                        <ChipButton key={cat} active={filters.category === cat} onClick={() => update("category", cat)}>
                                            {cat}
                                        </ChipButton>
                                    ))}
                                </div>
                            </FilterSection>

                            {/* Quality Grade */}
                            <FilterSection title="Quality Grade">
                                <div className="flex flex-wrap gap-2">
                                    {grades.map((g) => (
                                        <ChipButton key={g} active={filters.qualityGrade === g} onClick={() => update("qualityGrade", g)}>
                                            {g === "All" ? "All Grades" : `Grade ${g}`}
                                        </ChipButton>
                                    ))}
                                </div>
                            </FilterSection>

                            {/* District */}
                            <FilterSection title="District">
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-500 pointer-events-none" />
                                    <select
                                        value={filters.district || "All Districts"}
                                        onChange={(e) => update("district", e.target.value)}
                                        className="w-full appearance-none rounded-xl border border-border bg-background pl-8 pr-4 py-2.5 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    >
                                        {DISTRICTS.map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                            </FilterSection>

                            {/* Availability */}
                            <FilterSection title="Availability">
                                <div className="flex flex-wrap gap-2">
                                    {availability.map((av) => (
                                        <ChipButton key={av} active={(filters.availability || "All") === av} onClick={() => update("availability", av)}>
                                            {av}
                                        </ChipButton>
                                    ))}
                                </div>
                            </FilterSection>

                            {/* Sort By */}
                            <FilterSection title="Sort By">
                                <div className="flex flex-col gap-1">
                                    {sortOptions.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => update("sortBy", opt.value)}
                                            className={`rounded-xl px-3 py-2.5 text-left text-xs font-bold transition-colors ${filters.sortBy === opt.value
                                                ? "bg-emerald-50 text-emerald-700"
                                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </FilterSection>

                            {/* Max Price */}
                            <FilterSection title={`Max Price: ₹${filters.maxPrice.toLocaleString()}`}>
                                <input
                                    type="range"
                                    min={10}
                                    max={10000}
                                    step={50}
                                    value={filters.maxPrice}
                                    onChange={(e) => update("maxPrice", Number(e.target.value))}
                                    className="w-full accent-emerald-600 cursor-pointer"
                                />
                                <div className="flex justify-between text-[10px] text-muted-foreground font-bold mt-1">
                                    <span>₹10</span><span>₹10,000</span>
                                </div>
                            </FilterSection>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default FilterPanel;
