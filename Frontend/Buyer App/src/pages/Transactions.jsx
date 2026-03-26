import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { Receipt, Download, Loader2, Package } from "lucide-react";
import { motion } from "framer-motion";

const statusColors = {
    paid: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10",
    pending: "text-amber-500 bg-amber-50 dark:bg-amber-500/10",
    refunded: "text-rose-500 bg-rose-50 dark:bg-rose-500/10",
};

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const data = await api.getTransactions();
                if (Array.isArray(data)) {
                    setTransactions(data);
                }
            } catch (err) {
                console.error("Failed to fetch transactions:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="container py-10 px-4 md:px-6 max-w-6xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-4xl font-black text-foreground tracking-tighter italic">Transaction History</h1>
                    <p className="text-muted-foreground mt-2 font-medium">View and download your purchase receipts</p>
                </div>

                <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-xl shadow-slate-200/40 dark:shadow-none transition-all duration-300">
                    {/* Desktop table header */}
                    <div className="hidden border-b border-border bg-slate-50/50 dark:bg-slate-800/50 px-8 py-5 md:grid md:grid-cols-5 md:gap-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Order ID</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Item</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amount</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Date</span>
                    </div>

                    <div className="divide-y divide-border">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                                <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing with ledger...</p>
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-32 space-y-4 text-center">
                                <div className="h-20 w-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-2">
                                    <Package className="h-10 w-10 text-muted-foreground/20" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground">No transactions found</h3>
                                <p className="text-sm text-muted-foreground max-w-[250px]">Your purchase history will appear here once you place an order.</p>
                            </div>
                        ) : (
                            transactions.map((order, i) => (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="px-8 py-6 hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-all group"
                                >
                                    {/* Mobile */}
                                    <div className="flex items-center justify-between md:hidden">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 group-hover:scale-110 transition-transform">
                                                <Receipt className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-black text-foreground">{order.cropName}</p>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">#{order.id.slice(-6).toUpperCase()} · {new Date(order.placedAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-price text-lg">₹{order.totalPrice.toLocaleString()}</p>
                                            <span className={`inline-block px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest mt-1 ${statusColors[order.paymentStatus.toLowerCase()] || "bg-slate-50 text-slate-400"}`}>
                                                {order.paymentStatus}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Desktop */}
                                    <div className="hidden md:grid md:grid-cols-5 md:items-center md:gap-4">
                                        <span className="text-xs font-mono font-bold text-muted-foreground group-hover:text-foreground transition-colors">#{order.id.slice(-6).toUpperCase()}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="h-2 w-2 rounded-full bg-primary/40 group-hover:scale-150 transition-transform" />
                                            <span className="text-sm font-bold text-foreground">{order.cropName} ({order.quantity} {order.unit})</span>
                                        </div>
                                        <span className="text-sm font-black text-price">₹{order.totalPrice.toLocaleString()}</span>
                                        <div>
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${statusColors[order.paymentStatus.toLowerCase()] || "bg-slate-50 text-slate-400"}`}>
                                                {order.paymentStatus}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-end gap-4 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                                            <span className="text-[10px] font-bold text-muted-foreground">{new Date(order.placedAt).toLocaleDateString()}</span>
                                            <button className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/20 transition-all" title="Download Invoice">
                                                <Download className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Transactions;
