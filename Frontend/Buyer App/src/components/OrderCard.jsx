import { Link } from "react-router-dom";
import { Package, ChevronRight } from "lucide-react";

const statusStyles = {
    pending: "bg-warning/15 text-warning",
    accepted: "bg-primary/15 text-primary",
    completed: "bg-success/15 text-success",
    cancelled: "bg-destructive/15 text-destructive",
    rejected: "bg-destructive/15 text-destructive",
};

const OrderCard = ({ order }) => {
    return (
        <Link to={`/orders/${order.id}`} className="group block">
            <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card transition-all hover:shadow-elevated">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Package className="h-6 w-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                        <h4 className="font-bold text-foreground">{order.cropName}</h4>
                        <span className={`rounded-lg px-2.5 py-0.5 text-xs font-bold capitalize ${statusStyles[(order.status || "").toLowerCase()] || "bg-muted text-muted-foreground"}`}>
                            {order.status || "Unknown"}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {order.quantity} {order.unit} · {order.farmerName}
                    </p>
                    <div className="mt-1 flex items-center justify-between">
                        <span className="text-sm font-bold text-price">₹{order.totalPrice.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground">{order.id}</span>
                    </div>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </div>
        </Link>
    );
};

export default OrderCard;
