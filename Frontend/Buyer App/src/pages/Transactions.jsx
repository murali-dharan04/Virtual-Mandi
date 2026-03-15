import { mockOrders } from "@/data/mockData";
import { Receipt, Download } from "lucide-react";
import { motion } from "framer-motion";

const statusColors = {
    paid: "text-success",
    pending: "text-warning",
    refunded: "text-destructive",
};

const Transactions = () => {
    return (
        <div className="min-h-screen bg-background">
            <div className="container py-6">
                <h1 className="mb-6 text-2xl font-extrabold text-foreground">Transaction History</h1>

                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
                    {/* Desktop table header */}
                    <div className="hidden border-b border-border bg-secondary/50 px-6 py-3 md:grid md:grid-cols-5 md:gap-4">
                        <span className="text-xs font-semibold uppercase text-muted-foreground">Order ID</span>
                        <span className="text-xs font-semibold uppercase text-muted-foreground">Item</span>
                        <span className="text-xs font-semibold uppercase text-muted-foreground">Amount</span>
                        <span className="text-xs font-semibold uppercase text-muted-foreground">Status</span>
                        <span className="text-xs font-semibold uppercase text-muted-foreground">Date</span>
                    </div>

                    {mockOrders.map((order, i) => (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="border-b border-border px-6 py-4 last:border-0 hover:bg-secondary/30 transition-colors"
                        >
                            {/* Mobile */}
                            <div className="flex items-center justify-between md:hidden">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                        <Receipt className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-foreground">{order.cropName}</p>
                                        <p className="text-xs text-muted-foreground">{order.id} · {new Date(order.placedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-price">₹{order.totalPrice.toLocaleString()}</p>
                                    <p className={`text-xs font-bold capitalize ${statusColors[order.paymentStatus]}`}>{order.paymentStatus}</p>
                                </div>
                            </div>

                            {/* Desktop */}
                            <div className="hidden md:grid md:grid-cols-5 md:items-center md:gap-4">
                                <span className="text-sm font-medium text-foreground">{order.id}</span>
                                <span className="text-sm text-foreground">{order.cropName} ({order.quantity} {order.unit})</span>
                                <span className="text-sm font-bold text-price">₹{order.totalPrice.toLocaleString()}</span>
                                <span className={`text-sm font-bold capitalize ${statusColors[order.paymentStatus]}`}>{order.paymentStatus}</span>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">{new Date(order.placedAt).toLocaleDateString()}</span>
                                    <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground" title="Download Invoice">
                                        <Download className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Transactions;
