import { io } from "socket.io-client";
import { BASE_URL } from "./api";

/**
 * Singleton Socket.IO client for real-time listing updates.
 * Auto-reconnects with exponential backoff.
 */
let socket = null;

export function getSocket() {
    if (!socket) {
        const token = localStorage.getItem("buyerToken");
        socket = io(BASE_URL, {
            auth: { token },
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 10000,
            autoConnect: true,
        });

        socket.on("connect", () => {
            console.log("[Socket.IO] Connected:", socket.id);
        });

        socket.on("disconnect", (reason) => {
            console.log("[Socket.IO] Disconnected:", reason);
        });

        socket.on("connect_error", (err) => {
            console.warn("[Socket.IO] Connection error:", err.message);
        });
    }
    return socket;
}

/**
 * Join a specific room (usually the user's ID)
 */
export function joinRoom(userId) {
    const s = getSocket();
    if (s && userId) {
        console.log("[Socket.IO] Joining room:", userId);
        s.emit("join", { user_id: userId });
    }
}

/**
 * Subscribe to listing events.
 * Returns an unsubscribe function.
 */
export function onListingEvents({ onCreate, onUpdate, onDelete, onViewed }) {
    const s = getSocket();

    const handleCreate = (data) => {
        console.log("[Socket.IO] listing_created", data);
        onCreate?.(data);
    };
    const handleUpdate = (data) => {
        console.log("[Socket.IO] listing_updated", data);
        onUpdate?.(data);
    };
    const handleDelete = (data) => {
        console.log("[Socket.IO] listing_deleted", data);
        onDelete?.(data);
    };
    const handleViewed = (data) => {
        console.log("[Socket.IO] listing_viewed", data);
        onViewed?.(data);
    };

    s.on("listing_created", handleCreate);
    s.on("listing_updated", handleUpdate);
    s.on("listing_deleted", handleDelete);
    s.on("listing_viewed", handleViewed);

    // Return cleanup function
    return () => {
        s.off("listing_created", handleCreate);
        s.off("listing_updated", handleUpdate);
        s.off("listing_deleted", handleDelete);
        s.off("listing_viewed", handleViewed);
    };
}

/**
 * Subscribe to order status updates.
 */
export function onOrderStatusUpdate(callback) {
    const s = getSocket();
    const handler = (data) => {
        console.log("[Socket.IO] order_status_updated", data);
        callback?.(data);
    };
    s.on("order_status_updated", handler);
    return () => s.off("order_status_updated", handler);
}
