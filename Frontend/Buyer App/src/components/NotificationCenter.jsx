import { useState, useEffect } from "react";
import { Bell, BellDot, X } from "lucide-react";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();

    const fetchNotifications = async () => {
        try {
            const data = await api.getNotifications();
            if (Array.isArray(data) && data.length > 0) {
                // Get already toasted notification IDs from localStorage
                const toastedIds = JSON.parse(localStorage.getItem("toasted_notifications") || "[]");

                // Finalize the list of new ones that haven't been toasted yet
                const newToToast = data.filter(n => !toastedIds.includes(n.id));

                if (newToToast.length > 0) {
                    newToToast.forEach(n => {
                        toast({
                            title: n.title,
                            description: n.message,
                        });
                        toastedIds.push(n.id);
                    });

                    // Keep only last 50 IDs to prevent storage bloat
                    const updatedToastedIds = toastedIds.slice(-50);
                    localStorage.setItem("toasted_notifications", JSON.stringify(updatedToastedIds));
                }

                setNotifications(data);
            } else if (Array.isArray(data) && data.length === 0) {
                setNotifications([]);
            }
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async () => {
        try {
            await api.markNotificationsAsRead();
            setNotifications([]);
            setIsOpen(false);
        } catch (err) {
            console.error("Failed to mark notifications as read", err);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative rounded-full p-2 text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-colors"
            >
                {notifications.length > 0 ? (
                    <BellDot className="h-6 w-6 text-orange-400" />
                ) : (
                    <Bell className="h-6 w-6" />
                )}
                {notifications.length > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                        {notifications.length}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-xl z-50"
                    >
                        <div className="flex items-center justify-between border-b border-border p-4">
                            <h3 className="font-bold">Notifications</h3>
                            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto outline-none">
                            {notifications.length === 0 ? (
                                <div className="py-10 text-center text-sm text-muted-foreground">
                                    No new notifications
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {notifications.map((n) => (
                                        <div key={n.id} className="p-4 text-sm hover:bg-muted/50 transition-colors">
                                            <p className="font-bold text-foreground">{n.title}</p>
                                            <p className="mt-1 text-muted-foreground leading-relaxed">{n.message}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {notifications.length > 0 && (
                            <div className="border-t border-border p-3">
                                <Button
                                    variant="ghost"
                                    className="w-full text-xs font-semibold"
                                    onClick={handleMarkAsRead}
                                >
                                    Mark all as read
                                </Button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationCenter;
