import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import OrderCard from "@/components/OrderCard";
import { ArrowLeft, Package, CheckCircle, Clock, XCircle, Loader2, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const Orders = () => {
    const { t } = useTranslation();
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const data = await api.getOrders();
            if (Array.isArray(data)) {
                setOrders(data);
            }
        } catch (err) {
            console.error("Failed to fetch orders:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        // Poll every 5 seconds for status updates
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, []);

    const statusSteps = [
        { key: "pending", label: "Order Received", icon: Clock, desc: "Awaiting farmer confirmation" },
        { key: "accepted", label: "Harvested & Packed", icon: Package, desc: "Crops sorted and quality checked" },
        { key: "shipped", label: "In Transit", icon: Truck, desc: "Out for delivery to your location" },
        { key: "completed", label: "Delivered", icon: CheckCircle, desc: "Enjoy your fresh produce!" },
    ];

    // Detail view based on fetching real order from the list
    if (orderId) {
        if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

        const order = orders.find((o) => o.id === orderId);
        if (!order) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">{t("orders.order_not_found")}</div>;

        const stepIndex = order.status === "cancelled" ? -1 : statusSteps.findIndex((s) => s.key === (order.status || "").toLowerCase()); // Backend sends "Accepted", frontend expects "accepted"

        // Cancel logic can be added later if backend supports it
        const handleCancel = () => {
            toast({ title: "Info", description: "Cancellation not yet supported." });
        };

        return (
            <div className="min-h-screen bg-background">
                <div className="container py-6">
                    <button onClick={() => navigate("/orders")} className="mb-6 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" /> {t("orders.back")}
                    </button>

                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-6 shadow-card">
                        <div className="mb-6 flex items-start justify-between">
                            <div>
                                <h2 className="text-xl font-extrabold text-foreground">{order.cropName}</h2>
                                <p className="text-sm text-muted-foreground">{order.farmerName} · {order.order_id || order.id}</p>
                            </div>
                            <span className={`rounded-lg px-3 py-1 text-sm font-bold capitalize ${order.status === "completed" ? "bg-success/15 text-success" :
                                order.status === "cancelled" || order.status === "rejected" || order.status === "Rejected" ? "bg-destructive/15 text-destructive" :
                                    order.status === "Accepted" || order.status === "accepted" ? "bg-primary/15 text-primary" :
                                        "bg-warning/15 text-warning"
                                }`}>
                                {order.status}
                            </span>
                        </div>

                        {order.status !== "cancelled" && order.status !== "rejected" && (
                            <div className="mb-10 px-4">
                                <h3 className="text-sm font-bold text-slate-800 mb-8 uppercase tracking-widest flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    Harvest Journey
                                </h3>
                                <div className="space-y-0">
                                    {statusSteps.map((step, i) => {
                                        const active = i <= stepIndex;
                                        const isCurrent = i === stepIndex;
                                        const Icon = step.icon;
                                        return (
                                            <div key={step.key} className="relative flex gap-6 pb-12 last:pb-0">
                                                {/* Vertical line animation */}
                                                {i < statusSteps.length - 1 && (
                                                    <div className="absolute left-[19px] top-[40px] bottom-0 w-[2px] bg-slate-100">
                                                        <motion.div
                                                            initial={{ height: 0 }}
                                                            animate={{ height: active ? '100%' : 0 }}
                                                            className="w-full bg-emerald-500"
                                                        />
                                                    </div>
                                                )}

                                                <motion.div
                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    className={`relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500 ${active
                                                            ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200"
                                                            : "bg-white border-slate-200 text-slate-300"
                                                        }`}
                                                >
                                                    <Icon className="h-5 w-5" />
                                                </motion.div>

                                                <div className="pt-0.5">
                                                    <h4 className={`text-sm font-black ${active ? "text-slate-800" : "text-slate-400"}`}>
                                                        {step.label}
                                                    </h4>
                                                    <p className="text-xs text-slate-400 font-medium mt-1">
                                                        {step.desc}
                                                    </p>
                                                </div>

                                                {isCurrent && (
                                                    <div className="absolute right-0 top-1 text-[10px] font-black uppercase tracking-tighter bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md border border-emerald-100 italic">
                                                        Current
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {(order.status === "cancelled" || order.status === "rejected") && (
                            <div className="mb-6 flex items-center gap-3 rounded-xl bg-destructive/10 p-4">
                                <XCircle className="h-6 w-6 text-destructive" />
                                <p className="text-sm text-destructive">
                                    {order.status === "rejected"
                                        ? "This order was rejected by the farmer."
                                        : t("orders.cancelled_msg")}
                                </p>
                            </div>
                        )}

                        <div className="space-y-3">
                            <div className="flex justify-between rounded-lg bg-background p-3">
                                <span className="text-sm text-muted-foreground">{t("orders.quantity")}</span>
                                <span className="text-sm font-bold text-foreground">{order.quantity} {order.unit}</span>
                            </div>
                            <div className="flex justify-between rounded-lg bg-background p-3">
                                <span className="text-sm text-muted-foreground">{t("orders.total")}</span>
                                <span className="text-sm font-bold text-price">₹{order.totalPrice.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between rounded-lg bg-background p-3">
                                <span className="text-sm text-muted-foreground">{t("orders.payment")}</span>
                                <span className="text-sm font-bold capitalize text-success">
                                    Paid
                                </span>
                            </div>
                            <div className="flex justify-between rounded-lg bg-background p-3">
                                <span className="text-sm text-muted-foreground">{t("orders.placed")}</span>
                                <span className="text-sm font-medium text-foreground">{new Date(order.placedAt).toLocaleString()}</span>
                            </div>
                        </div>

                    </motion.div>
                </div>
            </div>
        );
    }

    // List view
    return (
        <div className="min-h-screen bg-background">
            <div className="container py-6">
                <h1 className="mb-6 text-2xl font-extrabold text-foreground">{t("orders.title")}</h1>
                {isLoading ? (
                    <div className="flex flex-col items-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground">Loading your orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center py-20 text-center">
                        <Package className="mb-4 h-16 w-16 text-muted-foreground/30" />
                        <h3 className="text-lg font-bold text-foreground">{t("orders.no_orders")}</h3>
                        <p className="text-sm text-muted-foreground">{t("orders.no_orders_sub")}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {orders.map((order) => (
                            <OrderCard key={order.id} order={order} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
