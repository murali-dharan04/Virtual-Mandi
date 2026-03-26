import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, Package, User, MapPin, Calendar, CheckCircle2, XCircle, Clock, CreditCard, Truck, CheckCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { sellerApi } from "@/lib/api";
import PageTransition from "@/components/PageTransition";

const steps = ["pending", "accepted", "paid", "in_transit", "completed"];
const stepIcons = [Clock, CheckCircle, CreditCard, Truck, CheckCircle2];
const stepLabels = ["Placed", "Accepted", "Paid", "Transit", "Done"];

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const currentStepIndex = order ? steps.indexOf(order.status) : 0;

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const data = await sellerApi.getOrderById(id);
                if (data && !data.error) {
                    setOrder({
                        id: data._id,
                        cropName: data.crop_name,
                        buyerName: data.buyer_name,
                        location: data.buyer_location,
                        quantity: data.quantity,
                        unit: data.unit || "kg",
                        totalPrice: data.total_price,
                        status: data.status,
                        createdAt: data.created_at
                    });
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    const handleUpdateStatus = async (status) => {
        try {
            const res = await sellerApi.updateOrderStatus(id, status);
            if (res.message) {
                toast({ title: `Order ${status === "accepted" ? "Accepted" : "Rejected"}`, description: `Order ${id} is now ${status}.` });
                setOrder(prev => ({ ...prev, status }));
            }
        } catch (err) {
            toast({ title: "Error", description: "Status update failed", variant: "destructive" });
        }
    };

    if (isLoading) return <div className="p-8 text-center text-xs font-black uppercase text-slate-400">Loading Order Details...</div>;
    if (!order) return <div className="p-8 text-center"><p className="text-slate-400 font-bold mb-4">Order not found</p><Button onClick={() => navigate("/orders")}>Back</Button></div>;

    return (
        <PageTransition>
            <div className="max-w-xl mx-auto pb-24 px-2">
                {/* Compact Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => navigate("/orders")} className="h-9 w-9 rounded-xl border border-slate-100">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase italic leading-none">Order Details</h1>
                            <p className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-widest">#{order.id.slice(-6).toUpperCase()} · {order.createdAt}</p>
                        </div>
                    </div>
                    <OrderStatusBadge status={order.status} />
                </div>

                {/* Compact Tracker */}
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-4 mb-6 shadow-sm">
                    <div className="flex items-center justify-between px-2">
                        {steps.map((step, i) => {
                            const Icon = stepIcons[i];
                            const isActive = i <= currentStepIndex;
                            return (
                                <div key={step} className="flex flex-col items-center gap-1 flex-1 relative">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${isActive ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/10" : "bg-slate-50 text-slate-300 dark:bg-slate-800/50"}`}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <span className={`text-[8px] font-black uppercase tracking-tight ${isActive ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>{stepLabels[i]}</span>
                                    {i < steps.length - 1 && (
                                        <div className={`absolute left-1/2 top-4 w-full h-[1px] -z-10 ${i < currentStepIndex ? "bg-emerald-600" : "bg-slate-100 dark:bg-slate-800"}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Grid Details */}
                <div className="grid grid-cols-1 gap-4 mb-6">
                    <Card className="rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
                        <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-1.5"><Package className="h-3 w-3" /> Produce Information</p>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-slate-400 uppercase">Crop Name</span><span className="text-[11px] font-black text-slate-900 dark:text-white uppercase">{order.cropName}</span></div>
                            <Separator className="opacity-50" />
                            <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-slate-400 uppercase">Total Weight</span><span className="text-[11px] font-black text-slate-900 dark:text-white uppercase">{order.quantity} {order.unit}</span></div>
                            <Separator className="opacity-50" />
                            <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-slate-400 uppercase">Total Payout</span><span className="text-lg font-black text-emerald-600 italic">₹{order.totalPrice.toLocaleString("en-IN")}</span></div>
                        </div>
                    </Card>

                    <Card className="rounded-[1.5rem] bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5"><User className="h-3 w-3" /> Buyer Information</p>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-slate-400 uppercase">Full Name</span><span className="text-[11px] font-black text-slate-900 dark:text-white uppercase">{order.buyerName}</span></div>
                            <Separator className="opacity-50" />
                            <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-slate-400 uppercase">Delivery Location</span><span className="text-[11px] font-black text-slate-900 dark:text-white uppercase flex items-center gap-1"><MapPin className="h-2.5 w-2.5 text-slate-400" />{order.location}</span></div>
                        </div>
                    </Card>
                </div>

                {/* Actions */}
                {order.status === "pending" && (
                    <div className="grid grid-cols-2 gap-3">
                        <Button onClick={() => handleUpdateStatus("accepted")} className="h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[10px] shadow-lg active:scale-95 transition-all">
                            <CheckCircle2 className="mr-2 h-4 w-4" /> ACCEPT ORDER
                        </Button>
                        <Button onClick={() => handleUpdateStatus("rejected")} variant="destructive" className="h-14 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg active:scale-95 transition-all">
                            <XCircle className="mr-2 h-4 w-4" /> REJECT ORDER
                        </Button>
                    </div>
                )}
            </div>
        </PageTransition>
    );
};

export default OrderDetails;
