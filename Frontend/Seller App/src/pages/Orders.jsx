import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { CheckCircle2, XCircle } from "lucide-react";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { sellerApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Orders = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

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
            console.error("Failed to fetch orders:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    const handleUpdateStatus = async (e, orderId, status) => {
        e.stopPropagation(); // Prevent navigation to details
        try {
            const res = await sellerApi.updateOrderStatus(orderId, status);
            if (res.message) {
                toast({
                    title: `Order ${status === "accepted" ? "Accepted" : "Rejected"}`,
                    description: `Order has been ${status}.`
                });
                // Update local state
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
            }
        } catch (err) {
            toast({ title: "Error", description: "Failed to update order status", variant: "destructive" });
        }
    };

    if (isLoading) {
        return <div className="flex items-center justify-center py-20">Loading orders...</div>;
    }

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 bg-slate-50 dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 px-6 text-center">
                <div className="h-20 w-20 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center mb-6 shadow-sm">
                    <CheckCircle2 className="h-8 w-8 text-slate-200 dark:text-slate-700" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 italic">Zero Orders Yet</h3>
                <p className="text-slate-400 text-sm font-medium mb-8 max-w-xs mx-auto">
                    Your incoming harvest orders will appear here. List more produce to increase your visibility!
                </p>
                <Button 
                    onClick={() => navigate("/listings/new")} 
                    className="h-14 px-10 rounded-2xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-black uppercase tracking-widest shadow-lg shadow-emerald-900/10"
                >
                    Create New Listing
                </Button>
            </div>
        );
    }

    const formatCurrency = (val) => {
        try {
            return (val || 0).toLocaleString("en-IN");
        } catch (e) {
            return "0";
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-10 shadow-2xl border border-white/5 mb-8">
                <div className="absolute -top-10 -right-10 h-40 w-40 bg-blue-500/10 blur-[80px] animate-pulse-soft" />
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-white tracking-tighter italic">Incoming Orders</h1>
                    <p className="text-slate-400 text-sm mt-2 font-medium tracking-wide uppercase">Track and manage your ONDC network transactions</p>
                </div>
            </div>

            {/* Mobile card layout */}
            <div className="space-y-3 md:hidden">
                {orders.map((order) => (
                    <Card
                        key={order.id}
                        className="shadow-[0_15px_35px_rgba(0,0,0,0.03)] cursor-pointer hover:shadow-[0_25px_50px_rgba(0,0,0,0.06)] transition-all duration-500 border-slate-100 rounded-[2rem] overflow-hidden group"
                        onClick={() => navigate(`/orders/${order.id}`)}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold">{order.cropName}</p>
                                    <p className="text-sm text-muted-foreground">{order.buyerName}</p>
                                </div>
                                <OrderStatusBadge status={order.status} />
                            </div>
                            <div className="mt-3 flex items-center justify-between text-sm">
                                <div className="flex gap-4">
                                    <div>
                                        <p className="text-muted-foreground text-xs">Qty</p>
                                        <p className="font-medium">{order.quantity} {order.unit}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs">Total</p>
                                        <p className="font-bold text-primary">₹{formatCurrency(order.totalPrice)}</p>
                                    </div>
                                </div>
                            </div>
                            {order.status === "Pending" && (
                                <div className="mt-4 flex gap-2">
                                    <Button
                                        size="sm"
                                        className="flex-1 h-9 gradient-hero"
                                        onClick={(e) => handleUpdateStatus(e, order.id, "accepted")}
                                    >
                                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Accept
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 h-9 text-destructive border-destructive/20 hover:bg-destructive/5"
                                        onClick={(e) => handleUpdateStatus(e, order.id, "rejected")}
                                    >
                                        <XCircle className="mr-1.5 h-3.5 w-3.5" /> Reject
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Desktop table layout */}
            <div className="hidden md:block rounded-[2rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] overflow-hidden bg-white">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead>Order ID</TableHead>
                            <TableHead>Crop</TableHead>
                            <TableHead>Buyer</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow
                                key={order.id}
                                className="hover:bg-muted/30 cursor-pointer transition-colors"
                                onClick={() => navigate(`/orders/${order.id}`)}
                            >
                                <TableCell className="font-mono text-sm">{order.id}</TableCell>
                                <TableCell className="font-medium">{order.cropName}</TableCell>
                                <TableCell className="text-muted-foreground">{order.buyerName}</TableCell>
                                <TableCell>{order.quantity} {order.unit}</TableCell>
                                <TableCell className="font-semibold">₹{formatCurrency(order.totalPrice)}</TableCell>
                                <TableCell><OrderStatusBadge status={order.status} /></TableCell>
                                <TableCell className="text-right">
                                    {order.status === "Pending" ? (
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 py-0 px-2 text-xs border-primary/20 hover:bg-primary/5 text-primary"
                                                onClick={(e) => handleUpdateStatus(e, order.id, "accepted")}
                                            >
                                                Accept
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 py-0 px-2 text-xs border-destructive/20 hover:bg-destructive/5 text-destructive"
                                                onClick={(e) => handleUpdateStatus(e, order.id, "rejected")}
                                            >
                                                Reject
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 text-xs text-muted-foreground"
                                        >
                                            View
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </motion.div>
    );
};

export default Orders;
