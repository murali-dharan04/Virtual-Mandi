export const BASE_URL = "http://localhost:5000";

const getToken = () => localStorage.getItem("buyerToken");

const headers = () => {
    const token = getToken();
    const h = { "Content-Type": "application/json" };
    if (token && token !== "null" && token !== "undefined") {
        h["Authorization"] = `Bearer ${token}`;
    }
    return h;
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
        const res = await fetch(`${BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, role: "buyer" }),
        });
        const data = await res.json();
        if (data.access_token) {
            localStorage.setItem("buyerToken", data.access_token);
        } else {
            console.error(`Login failed: ${data.message || 'Unknown error'}`);
        }
        return data;
    },
    register: async (name, email, password, type) => {
        const res = await fetch(`${BASE_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password, role: "buyer", type }),
        });
        return await res.json();
    },
    getSuggestions: async (query) => {
        const res = await fetch(`${BASE_URL}/api/suggestions?q=${encodeURIComponent(query)}`);
        if (!res.ok) return [];
        return await res.json();
    },
    getMandiPrices: async (commodity) => {
        const res = await fetch(`${BASE_URL}/api/mandi/${encodeURIComponent(commodity)}`);
        if (!res.ok) return { mandi_prices: [] };
        return await res.json();
    },
    getNotifications: async () => {
        const res = await fetch(`${BASE_URL}/api/notifications`, { headers: headers() });
        if (!res.ok) return [];
        return await res.json();
    },
    getOrders: async () => {
        const res = await fetch(`${BASE_URL}/buyer/orders`, { headers: headers() });
        if (!res.ok) return [];
        return await res.json();
    },
    getTransactions: async () => {
        const res = await fetch(`${BASE_URL}/api/transactions`, { headers: headers() });
        if (!res.ok) return [];
        return await res.json();
    },
    markNotificationsAsRead: async () => {
        const res = await fetch(`${BASE_URL}/api/notifications/read`, { method: "PUT", headers: headers() });
        return await res.json();
    },
    deleteNotification: async (notifId) => {
        const res = await fetch(`${BASE_URL}/api/notifications/${notifId}`, { method: "DELETE", headers: headers() });
        return await res.json();
    },
    search: async (itemName = "") => {
        const transactionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
        console.log(`Initiating search: "${itemName}" (ID: ${transactionId})`);

        const payload = {
            context: generateContext("search", transactionId),
            message: { intent: { item: { descriptor: { name: itemName } } } }
        };

        try {
            const h = headers();

            const searchRes = await fetch(`${BASE_URL}/bpp/search`, {
                method: "POST",
                headers: h,
                body: JSON.stringify(payload)
            });

            if (!searchRes.ok) {
                const errData = await searchRes.json().catch(() => ({}));
                console.error(`Search POST failed: ${searchRes.status}`, errData);

                if (searchRes.status === 401) {
                    console.warn("Token expired. Clearing storage and reloading...");
                    localStorage.removeItem("buyerToken");
                    localStorage.removeItem("buyerUser");
                    setTimeout(() => window.location.reload(), 2000);
                }
                return [];
            }

            console.log(`Search initiated for ${transactionId}. Polling...`);

            return new Promise((resolve) => {
                const interval = setInterval(async () => {
                    try {
                        const res = await fetch(`${BASE_URL}/ondc/responses/${transactionId}`);
                        if (!res.ok) return;
                        const messages = await res.json();
                        const onSearch = messages.find(m => m.context?.action === "on_search");

                        if (onSearch) {
                            clearInterval(interval);
                            console.log(`Received results for ${transactionId}`);

                            const providers = onSearch.message?.catalog?.["bpp/providers"] || [];
                            const items = (providers[0]?.items || []).map(i => ({
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

                            resolve(items);
                        }
                    } catch (pollErr) {
                        console.error(`Error during poll: ${pollErr.message}`);
                    }
                }, 1000);

                // Timeout after 10s
                setTimeout(() => {
                    clearInterval(interval);
                    resolve([]);
                }, 10000);
            });
        } catch (fatalErr) {
            console.error(`Fatal search error: ${fatalErr.message}`);
            return [];
        }
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
        await fetch(`${BASE_URL}/bpp/select`, { method: "POST", headers: headers(), body: JSON.stringify(payload) });
        return new Promise(resolve => {
            const interval = setInterval(async () => {
                const res = await fetch(`${BASE_URL}/ondc/responses/${transactionId}`);
                const data = await res.json();
                const found = data.find(m => m.context.action === "on_select");
                if (found) { clearInterval(interval); resolve(found.message.order); }
            }, 1000);
        });
    },
    confirm: async (orderData) => {
        const transactionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
        const payload = {
            context: generateContext("confirm", transactionId),
            message: { order: orderData }
        };
        await fetch(`${BASE_URL}/bpp/confirm`, { method: "POST", headers: headers(), body: JSON.stringify(payload) });
        return new Promise(resolve => {
            const interval = setInterval(async () => {
                const res = await fetch(`${BASE_URL}/ondc/responses/${transactionId}`);
                const data = await res.json();
                const found = data.find(m => m.context.action === "on_confirm");
                if (found) { clearInterval(interval); resolve(found.message.order); }
            }, 1000);
        });
    },
    getListingById: async (id) => {
        const res = await fetch(`${BASE_URL}/api/listing/${id}`, { headers: headers() });
        return await res.json();
    },
    getDistricts: async () => {
        const res = await fetch(`${BASE_URL}/api/districts`);
        if (!res.ok) return ["Nashik", "Pune", "Nagpur", "Ludhiana"];
        return await res.json();
    },
    getDemandHeatmap: async () => {
        const res = await fetch(`${BASE_URL}/api/demand-heatmap`);
        if (!res.ok) return [];
        return await res.json();
    },
    getSellerRating: async (sellerId) => {
        const res = await fetch(`${BASE_URL}/api/seller/${sellerId}/rating`);
        if (!res.ok) return { rating: 4.5, total_orders: 50 };
        return await res.json();
    }
};
