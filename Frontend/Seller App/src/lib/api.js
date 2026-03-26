export const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

const getToken = () => localStorage.getItem("sellerToken");

/**
 * Common headers for authenticated requests
 */
const getHeaders = (isMultipart = false) => {
    const h = isMultipart ? {} : { "Content-Type": "application/json" };
    const token = getToken();
    if (token) {
        h["Authorization"] = `Bearer ${token}`;
    }
    return h;
};

/**
 * Robust request helper with descriptive error handling
 */
const request = async (endpoint, options = {}) => {
    const url = `${BASE_URL}${endpoint}`;
    console.log(`DEBUG: API Request to ${url}`, options.body ? JSON.parse(options.body) : "");
    
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...getHeaders(options.body instanceof FormData),
                ...options.headers
            }
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            const errorMsg = data.error || data.message || `API Error (${response.status})`;
            if (response.status === 401) return { ...data, error: "Invalid credentials or session expired" };
            if (response.status === 404) return { ...data, error: "Requested resource not found" };
            return { ...data, error: errorMsg };
        }

        return data;
    } catch (error) {
        console.error("DEBUG: API Connection Error", error);
        return { error: "Server not reachable. Please check your internet or try again later." };
    }
};

export const sellerApi = {
    // Authenticate a farmer and store the token
    login: async (email, password) => {
        const data = await request("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password, role: "farmer" }),
        });
        if (data.access_token) {
            localStorage.setItem("sellerToken", data.access_token);
            if (data.user) {
                localStorage.setItem("sellerUser", JSON.stringify(data.user));
            }
        }
        return data;
    },

    // Fetch the logged-in user's profile
    getProfile: async () => {
        return await request("/api/auth/profile");
    },

    // Register a new farmer account
    register: async (name, email, password, location, extraData = {}) => {
        const data = await request("/api/auth/register", {
            method: "POST",
            body: JSON.stringify({
                name,
                email,
                password,
                location,
                role: "farmer",
                phone: extraData.mobile,
                whatsapp_number: extraData.whatsapp,
                district: extraData.district,
                state: extraData.state,
                lat: extraData.lat,
                lon: extraData.lon
            }),
        });
        if (data.access_token) {
            localStorage.setItem("sellerToken", data.access_token);
            if (data.user) {
                localStorage.setItem("sellerUser", JSON.stringify(data.user));
            }
        }
        return data;
    },

    // Forgot Password flow
    forgotPassword: async (email) => {
        return await request("/api/auth/forgot-password", {
            method: "POST",
            body: JSON.stringify({ email }),
        });
    },

    // Send OTP via SMS or WhatsApp
    sendOtp: async (phone, method = "whatsapp") => {
        return await request("/api/auth/send-otp", {
            method: "POST",
            body: JSON.stringify({ phone, method }),
        });
    },

    // Verify OTP
    verifyOtp: async (phone, otp) => {
        const data = await request("/api/auth/verify-otp", {
            method: "POST",
            body: JSON.stringify({ phone, otp }),
        });
        if (data.access_token) {
            localStorage.setItem("sellerToken", data.access_token);
            if (data.user) {
                localStorage.setItem("sellerUser", JSON.stringify(data.user));
            }
        }
        return data;
    },

    /**
     * Create a new produce listing
     */
    createListing: async (listingData) => {
        return await request("/api/seller/listing", {
            method: "POST",
            body: JSON.stringify({
                crop_name: listingData.cropName,
                category: listingData.category,
                quantity: listingData.quantity,
                price_per_unit: listingData.pricePerUnit,
                location: listingData.location,
                harvest_date: listingData.harvestDate,
                quality_grade: listingData.qualityGrade,
                unit: listingData.unit,
                image_url: listingData.imageUrl,
                images: listingData.images || []
            }),
        });
    },

    getOrders: async () => {
        return await request("/api/seller/orders");
    },

    getListings: async () => {
        return await request("/api/seller/listings");
    },

    getDashboardStats: async () => {
        return await request("/api/seller/dashboard-stats");
    },

    getRevenueChart: async () => {
        return await request("/api/seller/revenue-chart");
    },

    getTransactions: async () => {
        return await request("/api/transactions");
    },

    getOrderById: async (id) => {
        return await request(`/api/seller/order/${id}`);
    },

    updateOrderStatus: async (id, status) => {
        return await request(`/api/seller/order/${id}/update`, {
            method: "PUT",
            body: JSON.stringify({ status }),
        });
    },

    getListingById: async (id) => {
        return await request(`/api/seller/listing/${id}`);
    },

    updateListing: async (id, listingData) => {
        return await request(`/api/seller/listing/${id}`, {
            method: "PUT",
            body: JSON.stringify(listingData),
        });
    },

    deleteListing: async (id) => {
        return await request(`/api/seller/listing/${id}`, {
            method: "DELETE"
        });
    },

    getNotifications: async () => {
        const data = await request("/api/notifications");
        return data.error ? [] : data;
    },

    markNotificationsAsRead: async () => {
        return await request("/api/notifications/read", { method: "PUT" });
    },

    // Upload image to Cloudinary
    uploadImage: async (file, onProgress) => {
        const formData = new FormData();
        formData.append("image", file);

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", `${BASE_URL}/api/seller/upload-image`);
            xhr.setRequestHeader("Authorization", `Bearer ${getToken()}`);

            xhr.upload.addEventListener("progress", (e) => {
                if (e.lengthComputable && onProgress) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    onProgress(percent);
                }
            });

            xhr.onload = () => {
                try {
                    const data = JSON.parse(xhr.responseText);
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(data);
                    } else {
                        resolve({ success: false, error: data.error || `Upload failed (${xhr.status})` });
                    }
                } catch (e) {
                    resolve({ success: false, error: "Server error during upload" });
                }
            };

            xhr.onerror = () => {
                resolve({ success: false, error: "Server not reachable during upload" });
            };

            xhr.send(formData);
        });
    },

    getWeather: async (params) => {
        return await request(`/api/weather/current?${params}`);
    },

    getWeatherAdvice: async (city, crop = "") => {
        return await request(`/api/weather/advice?city=${city}&crop=${crop}`);
    },

    getWeatherAlerts: async (city) => {
        return await request(`/api/weather/alerts?city=${city}`);
    },

    getMarketPrices: async (state = 'tn') => {
        return await request(`/api/market-prices?state=${state}`);
    },

    detectDisease: async (file) => {
        const formData = new FormData();
        formData.append("image", file);
        return await request("/api/detect-disease", {
            method: "POST",
            body: formData,
        });
    },

    getNearbyLogistics: async (lat, lon) => {
        return await request(`/api/logistics/nearby?lat=${lat || ""}&lon=${lon || ""}`);
    },

    getSellerRating: async (sellerId) => {
        return await request(`/api/seller/${sellerId}/rating`);
    },
};
