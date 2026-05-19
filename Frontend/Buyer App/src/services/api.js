export const BASE_URL = import.meta.env.VITE_API_URL || "https://virtual-mandi.onrender.com";

// Keepalive: ping the backend every 9 minutes to prevent Render free-tier cold-starts
(function startKeepalive() {
    const ping = () => fetch(`${BASE_URL}/api/ping`).catch(() => {});
    ping(); // ping immediately on app load
    setInterval(ping, 9 * 60 * 1000); // then every 9 minutes
})();

const getToken = () => localStorage.getItem("buyerToken");

const getHeaders = () => {
    const token = getToken();
    const h = { "Content-Type": "application/json" };
    if (token && token !== "null" && token !== "undefined") {
        h["Authorization"] = `Bearer ${token}`;
    }
    return h;
};

/**
 * Robust request helper with descriptive error handling
 */
const request = async (endpoint, options = {}) => {
    const url = `${BASE_URL}${endpoint}`;
    
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...getHeaders(),
                ...options.headers
            }
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            const errorMsg = data.error || data.message || `API Error (${response.status})`;
            if (response.status === 401) {
                console.warn("Session expired. Clearing token...");
                localStorage.removeItem("buyerToken");
                localStorage.removeItem("buyerUser");
            }
            return { ...data, error: errorMsg };
        }

        return data;
    } catch (error) {
        console.error("DEBUG: API Connection Error", error);
        return { error: "Server not reachable. Please check your internet or try again later." };
    }
};

const generateContext = (action, transactionId = null) => ({
    domain: "nic2004:52110",
    action,
    transaction_id: transactionId || (Math.random().toString(36).substring(2) + Date.now().toString(36)),
    message_id: (Math.random().toString(36).substring(2) + Date.now().toString(36)),
    timestamp: new Date().toISOString(),
});

export const api = {
    login: async (email, password) => {
        const data = await request("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password, role: "buyer" }),
        });
        if (data.access_token) {
            localStorage.setItem("buyerToken", data.access_token);
        }
        return data;
    },
    register: async (name, email, password, type) => {
        return await request("/api/auth/register", {
            method: "POST",
            body: JSON.stringify({ name, email, password, role: "buyer", type }),
        });
    },
    getSuggestions: async (query) => {
        const data = await request(`/api/suggestions?q=${encodeURIComponent(query)}`);
        return data.error ? [] : data;
    },
    getMandiPrices: async (commodity) => {
        const data = await request(`/api/mandi/${encodeURIComponent(commodity)}`);
        return data.error ? { mandi_prices: [] } : data;
    },
    getNotifications: async () => {
        const data = await request("/api/notifications");
        return data.error ? [] : data;
    },
    getOrders: async () => {
        const data = await request("/api/buyer/orders");
        return data.error ? [] : data;
    },
    getTransactions: async () => {
        const data = await request("/api/transactions");
        return data.error ? [] : data;
    },
    markNotificationsAsRead: async () => {
        return await request("/api/notifications/read", { method: "PUT" });
    },
    deleteNotification: async (notifId) => {
        return await request(`/api/notifications/${notifId}`, { method: "DELETE" });
    },
    search: async (itemName = "") => {
        const transactionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
        console.log(`Initiating search: "${itemName}" (ID: ${transactionId})`);

        const payload = {
            context: generateContext("search", transactionId),
            message: { intent: { item: { descriptor: { name: itemName } } } }
        };

        const searchRes = await request("/api/bpp/search", {
            method: "POST",
            body: JSON.stringify(payload)
        });

        if (searchRes.error || !searchRes.catalog) return [];

        const providers = searchRes.catalog["bpp/providers"] || [];
        return (providers[0]?.items || []).map(i => ({
            id: i.id || Math.random().toString(),
            cropName: i.descriptor?.name || "Unknown Crop",
            pricePerUnit: parseFloat(i.price?.value || 0) || 0,
            quantity: Number(i.quantity?.available?.count || 0) || 0,
            category: i.category || "Other",
            farmerName: i.farmer_name || "Local Farmer",
            farmerPhone: i.farmer_phone || "",
            whatsappNumber: i.whatsapp_number || "",
            unit: i.unit || "kg",
            distance: i.distance || 2.5,
            deliveryEstimate: i.delivery_estimate || "Tomorrow",
            location: i.location || "Local",
            qualityGrade: i.quality_grade || "A",
            imageUrl: i.image_url || "/placeholder.svg"
        }));
    },
    select: async (itemId, quantity = 1) => {
        const transactionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
        const payload = {
            context: generateContext("select", transactionId),
            message: {
                order: {
                    items: [{
                        id: itemId,
                        quantity: { count: quantity }
                    }]
                }
            }
        };
        const selectRes = await request("/api/bpp/select", { method: "POST", body: JSON.stringify(payload) });
        if (selectRes.error) return null;
        return selectRes.order || null;
    },
    confirm: async (orderData) => {
        const transactionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
        const payload = {
            context: generateContext("confirm", transactionId),
            message: { order: orderData }
        };
        const confirmRes = await request("/api/bpp/confirm", { method: "POST", body: JSON.stringify(payload) });
        if (confirmRes.error) return null;
        return confirmRes.order || null;
    },
    getListingById: async (id) => {
        return await request(`/api/listing/${id}`);
    },
    getDistricts: async () => {
        const data = await request("/api/districts");
        return data.error ? ["Nashik", "Pune", "Nagpur", "Ludhiana"] : data;
    },
    getDemandHeatmap: async () => {
        const data = await request("/api/demand-heatmap");
        return data.error ? [] : data;
    },
    getSellerRating: async (sellerId) => {
        const data = await request(`/api/seller/${sellerId}/rating`);
        return data.error ? { rating: 4.5, total_orders: 50 } : data;
    }
};
