import { useState, useEffect } from "react";
import { Bell, BellDot, X } from "lucide-react";
import { sellerApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();

    const fetchNotifications = async () => {
        try {
            const data = await sellerApi.getNotifications();
            if (Array.isArray(data) && data.length > 0) {
                const newOnes = data.filter(n => !notifications.find(existing => existing.id === n.id));
                newOnes.forEach(n => {
                    toast({
                        title: n.title,
                        description: n.message,
                    });
                });
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

        const handleRefresh = () => fetchNotifications();
        window.addEventListener('refreshNotifications', handleRefresh);

        return () => window.removeEventListener('refreshNotifications', handleRefresh);
    }, []);

    const handleMarkAsRead = async () => {
        try {
            await sellerApi.markNotificationsAsRead();
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
                className="relative rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
                {notifications.length > 0 ? (
                    <BellDot className="h-5 w-5 text-primary" />
                ) : (
                    <Bell className="h-5 w-5" />
                )}
                {notifications.length > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm">
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
                        className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-card shadow-lg z-50 text-left"
                    >
                        <div className="flex items-center justify-between border-b border-border p-4 bg-muted/30">
                            <h3 className="font-semibold text-sm">Notifications</h3>
                            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto outline-none">
                            {notifications.length === 0 ? (
                                <div className="py-8 text-center text-xs text-muted-foreground uppercase tracking-wider">
                                    No new alerts
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {notifications.map((n) => (
                                        <div key={n.id} className="p-4 text-sm hover:bg-muted/50 transition-colors">
                                            <p className="font-semibold text-foreground">{n.title}</p>
                                            <p className="mt-1 text-xs text-muted-foreground leading-normal">{n.message}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {notifications.length > 0 && (
                            <div className="border-t border-border p-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full text-[10px] uppercase font-bold tracking-widest text-muted-foreground hover:text-primary"
                                    onClick={handleMarkAsRead}
                                >
                                    Clear All
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
