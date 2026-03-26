import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Receipt, Wallet, Search, Filter, ArrowUpRight, 
    TrendingUp, Calendar, Package, IndianRupee, Download 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { sellerApi } from "@/lib/api";
import PageTransition from "@/components/PageTransition";

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [timeframe, setTimeframe] = useState("all");

    const fetchTransactions = async () => {
        try {
            const data = await sellerApi.getTransactions();
            if (Array.isArray(data)) {
                setTransactions(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const filtered = transactions.filter(t => 
        (t.cropName || "").toLowerCase().includes(search.toLowerCase()) ||
        (t.id || "").toLowerCase().includes(search.toLowerCase())
    );

    const stats = {
        revenue: transactions.reduce((sum, t) => sum + (t.totalPrice || 0), 0),
        count: transactions.length,
        quantity: transactions.reduce((sum, t) => sum + (t.quantity || 0), 0)
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Syncing Data...</p>
            </div>
        );
    }

    return (
        <PageTransition>
            <div className="max-w-2xl mx-auto pb-24">
                {/* Compact Top Bar */}
                <div className="flex items-center justify-between mb-6 px-2">
                    <div>
                        <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight leading-none">Earnings</h1>
                        <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Payout History</p>
                    </div>
                    <div className="flex gap-1">
                        {['all', 'monthly', 'yearly'].map((f) => (
                            <button 
                                key={f}
                                onClick={() => setTimeframe(f)}
                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${timeframe === f ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main KPI Card */}
                <div className="bg-slate-900 dark:bg-emerald-950 rounded-[2rem] p-6 mb-6 relative overflow-hidden shadow-xl border border-white/5">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Wallet className="h-24 w-24 text-white" />
                    </div>
                    <div className="relative z-10 text-center">
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Lifetime Revenue</p>
                        <h2 className="text-4xl font-black text-white italic tracking-tighter">₹{stats.revenue.toLocaleString()}</h2>
                        <div className="flex items-center justify-center gap-1 mt-4">
                            <TrendingUp className="h-3 w-3 text-emerald-400" />
                            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">+12.5% vs Last Period</span>
                        </div>
                    </div>
                </div>

                {/* Inline Stats */}
                <div className="grid grid-cols-2 gap-3 mb-6 px-2">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center">
                            <Package className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Sold Qty</p>
                            <p className="text-sm font-black text-slate-900 dark:text-white">{stats.quantity.toLocaleString()} kg</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-sky-50 dark:bg-sky-950/20 flex items-center justify-center">
                            <Receipt className="h-5 w-5 text-sky-500" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Sales</p>
                            <p className="text-sm font-black text-slate-900 dark:text-white">{stats.count}</p>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative mb-6 px-2">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                        placeholder="Search by crop..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-11 pl-11 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-[11px] font-bold"
                    />
                </div>

                {/* Transaction List */}
                <div className="space-y-3 px-2">
                    <AnimatePresence>
                        {filtered.map((tx, i) => (
                            <motion.div 
                                key={tx.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm hover:shadow-md transition-all active:scale-[0.99] group overflow-hidden relative"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                                            <ArrowUpRight className="h-4.5 w-4.5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase leading-none">{tx.cropName}</h3>
                                            <p className="text-[9px] font-bold text-slate-400 mt-1">#{tx.id.slice(-6).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-slate-900 dark:text-white leading-none mb-1">₹{tx.totalPrice.toLocaleString()}</p>
                                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${tx.paymentStatus.toLowerCase() === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {tx.paymentStatus}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50 dark:border-slate-800/50">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3 text-slate-400" />
                                            <span className="text-[9px] font-bold text-slate-500">{new Date(tx.placedAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <IndianRupee className="h-3 w-3 text-slate-400" />
                                            <span className="text-[9px] font-bold text-slate-500">{tx.quantity} {tx.unit}</span>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Download className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-20 px-6">
                        <div className="h-16 w-16 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-800 text-slate-300">
                            <Receipt className="h-8 w-8" />
                        </div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No transactions found</p>
                    </div>
                )}
            </div>
        </PageTransition>
    );
};

export default Transactions;
