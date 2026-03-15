import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Package,
    User,
    MapPin,
    Calendar,
    CheckCircle2,
    XCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { sellerApi } from "@/lib/api";

const steps = ["pending", "accepted", "paid", "in_transit", "completed"];
const stepLabels = ["Order Placed", "Accepted", "Payment Done", "In Transit", "Delivered"];

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const currentStep = order ? steps.indexOf(order.status) : 0;

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
                console.error("Failed to fetch order details:", err);
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
                toast({ title: `Order ${status === "accepted" ? "Accepted" : "Rejected"}`, description: `Order ${id} has been ${status}.` });
                setOrder(prev => ({ ...prev, status }));
            }
        } catch (err) {
            toast({ title: "Error", description: "Failed to update order status", variant: "destructive" });
        }
    };

    const formatCurrency = (val) => {
        try {
            return (val || 0).toLocaleString("en-IN");
        } catch (e) {
            return "0";
        }
    };

    if (isLoading) {
        return <div className="flex items-center justify-center py-20">Loading order details...</div>;
    }

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <p className="text-muted-foreground">Order not found.</p>
                <Button onClick={() => navigate("/orders")} className="mt-4" variant="outline">
                    Back to Orders
                </Button>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-6">
            <div className="flex flex-wrap items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => navigate("/orders")} className="shrink-0">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold font-display truncate">Order {order.id}</h1>
                    <p className="text-muted-foreground text-sm">{order.createdAt}</p>
                </div>
                <OrderStatusBadge status={order.status} />
            </div>

            {/* Progress tracker */}
            {order.status !== "cancelled" && (
                <Card className="shadow-card">
                    <CardContent className="py-6">
                        <div className="flex items-center justify-between">
                            {steps.map((step, i) => (
                                <div key={step} className="flex flex-1 items-center">
                                    <div className="flex flex-col items-center gap-1.5">
                                        <div
                                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${i <= currentStep
                                                ? "gradient-hero text-primary-foreground"
                                                : "bg-muted text-muted-foreground"
                                                }`}
                                        >
                                            {i + 1}
                                        </div>
                                        <span className="text-[10px] sm:text-xs text-center text-muted-foreground leading-tight">
                                            {stepLabels[i]}
                                        </span>
                                    </div>
                                    {i < steps.length - 1 && (
                                        <div
                                            className={`mx-1 h-0.5 flex-1 rounded transition-colors ${i < currentStep ? "bg-primary" : "bg-muted"
                                                }`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Details */}
            <div className="grid gap-6 sm:grid-cols-2">
                <Card className="shadow-card">
                    <CardHeader>
                        <CardTitle className="text-base font-display flex items-center gap-2">
                            <Package className="h-4 w-4 text-primary" /> Produce Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">Crop</span><span className="font-medium">{order.cropName}</span></div>
                        <Separator />
                        <div className="flex justify-between"><span className="text-muted-foreground">Quantity</span><span className="font-medium">{order.quantity} {order.unit}</span></div>
                        <Separator />
                        <div className="flex justify-between"><span className="text-muted-foreground">Total Amount</span><span className="font-bold text-primary">₹{formatCurrency(order.totalPrice)}</span></div>
                    </CardContent>
                </Card>

                <Card className="shadow-card">
                    <CardHeader>
                        <CardTitle className="text-base font-display flex items-center gap-2">
                            <User className="h-4 w-4 text-primary" /> Buyer Info
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium">{order.buyerName}</span></div>
                        <Separator />
                        <div className="flex justify-between items-center"><span className="text-muted-foreground">Location</span><span className="font-medium flex items-center gap-1"><MapPin className="h-3 w-3" />{order.location}</span></div>
                        <Separator />
                        <div className="flex justify-between items-center"><span className="text-muted-foreground">Order Date</span><span className="font-medium flex items-center gap-1"><Calendar className="h-3 w-3" />{order.createdAt}</span></div>
                    </CardContent>
                </Card>
            </div>

            {/* Actions */}
            {order.status === "pending" && (
                <Card className="shadow-card border-accent/30">
                    <CardContent className="flex gap-3 py-4">
                        <Button onClick={() => handleUpdateStatus("accepted")} className="flex-1 gradient-hero">
                            <CheckCircle2 className="mr-2 h-4 w-4" /> Accept Order
                        </Button>
                        <Button onClick={() => handleUpdateStatus("rejected")} variant="destructive" className="flex-1">
                            <XCircle className="mr-2 h-4 w-4" /> Reject Order
                        </Button>
                    </CardContent>
                </Card>
            )}
        </motion.div>
    );
};

export default OrderDetails;
