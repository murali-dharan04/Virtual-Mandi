import { Search, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { api } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";

const SearchBar = ({ value, onChange, placeholder = "Search crops, vegetables, fruits..." }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!value || value.length < 1) {
                setSuggestions([]);
                return;
            }

            setIsLoading(true);
            try {
                const data = await api.getSuggestions(value);
                setSuggestions(data);
                setIsOpen(data.length > 0);
            } catch (err) {
                console.error("Suggestion fetch error", err);
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timer);
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (suggestion) => {
        onChange(suggestion);
        setIsOpen(false);
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => value.length > 0 && suggestions.length > 0 && setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full rounded-xl border border-border bg-card py-3.5 pl-12 pr-12 text-base text-foreground shadow-card placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
                {isLoading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-border bg-card shadow-lg"
                    >
                        <div className="py-2">
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSelect(s)}
                                    className="flex w-full items-center px-4 py-2 text-left text-sm hover:bg-muted transition-colors"
                                >
                                    <Search className="mr-3 h-3.5 w-3.5 text-muted-foreground" />
                                    <span>{s}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SearchBar;
