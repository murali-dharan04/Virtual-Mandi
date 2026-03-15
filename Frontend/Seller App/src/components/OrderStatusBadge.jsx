import { Badge } from "@/components/ui/badge";

const statusConfig = {
    pending: { label: "Pending", variant: "outline" },
    created: { label: "New", variant: "outline" },
    accepted: { label: "Accepted", variant: "secondary" },
    paid: { label: "Paid", variant: "default" },
    in_transit: { label: "In Transit", variant: "secondary" },
    completed: { label: "Completed", variant: "default" },
    cancelled: { label: "Cancelled", variant: "destructive" },
    rejected: { label: "Rejected", variant: "destructive" },
};

export function OrderStatusBadge({ status }) {
    const normalizedStatus = status?.toLowerCase();
    const config = statusConfig[normalizedStatus] || { label: status, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
}
