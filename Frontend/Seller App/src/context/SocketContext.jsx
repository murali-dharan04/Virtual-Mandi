import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { BASE_URL } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { toast } = useToast();

    useEffect(() => {
        const userStr = localStorage.getItem("sellerUser");
        const token = localStorage.getItem("sellerToken");
        
        if (!token || !userStr) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
            return;
        }

        const user = JSON.parse(userStr);
        const userId = user.id || user._id;

        // Use the same BASE_URL as API requests
        const newSocket = io(BASE_URL, {
            auth: { token },
            transports: ["websocket"]
        });

        newSocket.on("connect", () => {
            console.log("✅ Socket Connected to", BASE_URL);
            newSocket.emit("join", { user_id: userId });
        });

        newSocket.on("new_order", (data) => {
            console.log("🚜 New Order Received:", data);
            toast({
                title: "NEW ORDER RECEIVED! 🚜",
                description: `You have a new order for ${data.crop_name}. Check your orders page.`,
                className: "bg-emerald-600 text-white font-black rounded-[2rem] border-none shadow-2xl p-8",
            });
            // Emit a custom event for components to refresh data
            window.dispatchEvent(new CustomEvent("refresh_orders", { detail: data }));
            window.dispatchEvent(new CustomEvent("refresh_stats"));
        });

        newSocket.on("listing_viewed", (data) => {
            // Optional: Live view count update logic
            window.dispatchEvent(new CustomEvent("update_views", { detail: data }));
        });

        newSocket.on("disconnect", () => {
            console.log("❌ Socket Disconnected");
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []); // Only run once on mount, logic handles re-auth internally if needed

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
