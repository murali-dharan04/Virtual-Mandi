import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
    CheckCircle2, XCircle, ChevronRight, ShoppingCart, 
    User, Package, IndianRupee, Calendar, Clock, Filter 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { sellerApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import PageTransition from "@/components/PageTransition";

const Orders = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    const fetchOrders = async () => {
        try {
            const data = await sellerApi.getOrders();
            if (Array.isArray(data)) {
                setOrders(data.map(o => ({
                    id: o._id,
                    cropName: o.crop_name,
                    buyerName: o.buyer_name,
                    quantity: o.quantity,
                    unit: o.unit || "kg",
                    totalPrice: o.total_price,
                    status: o.status,
                    createdAt: o.created_at
                })));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleUpdateStatus = async (e, orderId, status) => {
        e.stopPropagation();
        try {
            const res = await sellerApi.updateOrderStatus(orderId, status);
            if (res.message) {
                toast({ title: `Order ${status === "accepted" ? "Accepted" : "Rejected"}` });
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
            }
        } catch (err) {
            toast({ title: "Error", variant: "destructive" });
        }
    };

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === "pending" || o.status === "Pending").length,
        revenue: orders.filter(o => o.status === "accepted" || o.status === "Completed").reduce((sum, o) => sum + o.totalPrice, 0)
    };

    const filtered = orders.filter(o => {
        if (filter === "all") return true;
        if (filter === "pending") return o.status === "pending" || o.status === "Pending";
        if (filter === "completed") return o.status === "accepted" || o.status === "Completed";
        return true;
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Syncing Orders...</p>
            </div>
        );
    }

    return (
        <PageTransition>
            <div className="max-w-2xl mx-auto pb-24">
                {/* Compact Header */}
                <div className="flex items-center justify-between mb-6 px-2">
                    <div>
                        <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight leading-none">Orders</h1>
                        <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Incoming Requests</p>
                    </div>
                    <div className="flex gap-1">
                        {['all', 'pending', 'completed'].map((f) => (
                            <button 
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Inline Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6 px-2">
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total</p>
                        <p className="text-sm font-black text-slate-900 dark:text-white">{stats.total}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">New</p>
                        <p className="text-sm font-black text-rose-500">{stats.pending}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Sales</p>
                        <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">₹{(stats.revenue / 1000).toFixed(1)}k</p>
                    </div>
                </div>

                {/* Orders Grid */}
                <div className="space-y-3 px-2">
                    <AnimatePresence>
                        {filtered.map((order) => (
                            <motion.div 
                                key={order.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"
                                onClick={() => navigate(`/orders/${order.id}`)}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                            <User className="h-4 w-4 text-slate-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase leading-none">{order.buyerName}</p>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Buyer</p>
                                        </div>
                                    </div>
                                    <OrderStatusBadge status={order.status} className="text-[8px] px-2 py-0.5" />
                                </div>

                                <div className="flex items-center justify-between py-3 border-y border-slate-50 dark:border-slate-800/50">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center border border-emerald-100 dark:border-emerald-800/50">
                                            <Package className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase leading-none mb-1">{order.cropName}</h3>
                                            <p className="text-[10px] font-bold text-slate-500">{order.quantity} {order.unit}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[14px] font-black text-slate-900 dark:text-white leading-none mb-1">₹{order.totalPrice.toLocaleString()}</p>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest italic">Total Amount</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3 text-slate-400" />
                                            <span className="text-[9px] font-bold text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3 text-slate-400" />
                                            <span className="text-[9px] font-bold text-slate-500">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>

                                    {(order.status === "pending" || order.status === "Pending") && (
                                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                            <Button 
                                                size="sm" 
                                                className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-[9px] font-black uppercase tracking-widest shadow-md"
                                                onClick={(e) => handleUpdateStatus(e, order.id, "accepted")}
                                            >
                                                Accept
                                            </Button>
                                            <Button 
                                                variant="outline"
                                                size="sm" 
                                                className="h-8 px-3 rounded-lg border-rose-100 text-rose-500 hover:bg-rose-50 text-[9px] font-black uppercase tracking-widest"
                                                onClick={(e) => handleUpdateStatus(e, order.id, "rejected")}
                                            >
                                                Reject
                                            </Button>
                                        </div>
                                    )}
                                    {(order.status !== "pending" && order.status !== "Pending") && (
                                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-20 px-6">
                        <div className="h-16 w-16 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-800 text-slate-300">
                            <ShoppingCart className="h-8 w-8" />
                        </div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No orders found</p>
                    </div>
                )}
            </div>
        </PageTransition>
    );
};

export default Orders;
