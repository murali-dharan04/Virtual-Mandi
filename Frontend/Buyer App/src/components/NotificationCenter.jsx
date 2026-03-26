import { useState, useEffect } from "react";
import { Bell, BellDot, X, Trash2 } from "lucide-react";
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
            await fetchNotifications();
        } catch (err) {
            console.error("Failed to mark notifications as read", err);
        }
    };

    const handleDeleteNotification = async (id) => {
        try {
            await api.deleteNotification(id);
            await fetchNotifications();
        } catch (err) {
            console.error("Failed to delete notification", err);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative rounded-full p-2 text-foreground/70 hover:bg-muted/50 hover:text-foreground transition-all duration-200"
            >
                {notifications.length > 0 ? (
                    <BellDot className="h-6 w-6 text-amber-500 animate-pulse-soft" />
                ) : (
                    <Bell className="h-6 w-6" />
                )}
                {notifications.length > 0 && (
                    <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-black text-white shadow-sm ring-2 ring-background">
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
                                        <div 
                                            key={n.id} 
                                            className={`group relative p-4 transition-colors hover:bg-muted/30 ${!n.read ? 'bg-orange-50/30' : 'opacity-60'}`}
                                        >
                                            <div className="pr-8">
                                                <p className={`text-sm font-bold ${!n.read ? 'text-foreground' : 'text-muted-foreground'}`}>{n.title}</p>
                                                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{n.message}</p>
                                                <p className="mt-2 text-[10px] font-medium text-muted-foreground/60 uppercase">
                                                    {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            <button 
                                                onClick={() => handleDeleteNotification(n.id)}
                                                className="absolute right-3 top-4 opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
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
