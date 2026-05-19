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
        let activeSocket = null;
        let lastToken = null;

        const checkToken = () => {
            const token = localStorage.getItem("sellerToken");
            const userStr = localStorage.getItem("sellerUser");

            if (token !== lastToken) {
                lastToken = token;
                
                // Disconnect old socket if it exists
                if (activeSocket) {
                    console.log("🔌 Disconnecting old socket due to token change");
                    activeSocket.disconnect();
                    activeSocket = null;
                    setSocket(null);
                }

                if (token && userStr) {
                    try {
                        const user = JSON.parse(userStr);
                        const userId = user.id || user._id;

                        console.log("🔌 Establishing new socket connection to", BASE_URL);
                        const newSocket = io(BASE_URL, {
                            auth: { token },
                            transports: ["polling", "websocket"]
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
                            // Emit custom events for components to refresh data instantly
                            window.dispatchEvent(new CustomEvent("refresh_orders", { detail: data }));
                            window.dispatchEvent(new CustomEvent("refresh_stats"));
                        });

                        newSocket.on("listing_viewed", (data) => {
                            window.dispatchEvent(new CustomEvent("update_views", { detail: data }));
                        });

                        newSocket.on("disconnect", () => {
                            console.log("❌ Socket Disconnected");
                        });

                        activeSocket = newSocket;
                        setSocket(newSocket);
                    } catch (e) {
                        console.error("Socket connection failed:", e);
                    }
                }
            }
        };

        checkToken();
        const interval = setInterval(checkToken, 1000);

        return () => {
            clearInterval(interval);
            if (activeSocket) {
                activeSocket.disconnect();
            }
        };
    }, []); // Only run once on mount, logic handles re-auth internally if needed

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
