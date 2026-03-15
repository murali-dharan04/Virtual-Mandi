const BASE_URL = "https://virtual-mandi.onrender.com";

const getToken = () => localStorage.getItem("sellerToken");

/**
 * Common headers for authenticated requests
 */
const headers = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
});

export const sellerApi = {
    // Authenticate a farmer and store the token
    login: async (email, password) => {
        console.log("DEBUG: Seller Login Attempt", { email });
        const res = await fetch(`${BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, role: "farmer" }),
        });
        const data = await res.json();
        console.log("DEBUG: Seller Login Response", data);
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
        const res = await fetch(`${BASE_URL}/profile`, { headers: headers() });
        return await res.json();
    },
    // Register a new farmer account
    register: async (name, email, password, location, extraData = {}) => {
        console.log("DEBUG: Seller Register Attempt", { name, email });
        const res = await fetch(`${BASE_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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
        const data = await res.json();
        console.log("DEBUG: Seller Register Response", data);
        return data;
    },
    // Forgot Password flow
    forgotPassword: async (email) => {
        console.log("DEBUG: Forgot Password Attempt", { email });
        const res = await fetch(`${BASE_URL}/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
        return await res.json();
    },
    // Send OTP via SMS or WhatsApp
    sendOtp: async (phone, method = "whatsapp") => {
        console.log("DEBUG: Send OTP Attempt", { phone, method });
        const res = await fetch(`${BASE_URL}/send-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone, method }),
        });
        return await res.json();
    },
    // Verify OTP
    verifyOtp: async (phone, otp) => {
        console.log("DEBUG: Verify OTP Attempt", { phone, otp });
        const res = await fetch(`${BASE_URL}/verify-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone, otp }),
        });
        const data = await res.json();
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
     * Maps frontend camelCase fields to backend snake_case or expected keys
     */
    createListing: async (listingData) => {
        const res = await fetch(`${BASE_URL}/seller/listing`, {
            method: "POST",
            headers: headers(),
            body: JSON.stringify({
                crop_name: listingData.cropName,
                category: listingData.category,
                quantity: listingData.quantity,
                price_per_unit: listingData.pricePerUnit,
                location: listingData.location,
                harvest_date: listingData.harvestDate,
                quality_grade: listingData.qualityGrade,
                unit: listingData.unit,
                image_url: listingData.imageUrl,  // Add image URL
                images: listingData.images || [] // Add multiple images array
            }),
        });
        return await res.json();
    },
    getOrders: async () => {
        const res = await fetch(`${BASE_URL}/seller/orders`, { headers: headers() });
        return await res.json();
    },
    getListings: async () => {
        const res = await fetch(`${BASE_URL}/seller/listings`, { headers: headers() });
        return await res.json();
    },
    getDashboardStats: async () => {
        const res = await fetch(`${BASE_URL}/seller/dashboard-stats`, { headers: headers() });
        return await res.json();
    },
    getOrderById: async (id) => {
        const res = await fetch(`${BASE_URL}/seller/order/${id}`, { headers: headers() });
        return await res.json();
    },
    updateOrderStatus: async (id, status) => {
        const res = await fetch(`${BASE_URL}/seller/order/${id}/update`, {
            method: "PUT",
            headers: headers(),
            body: JSON.stringify({ status }),
        });
        return await res.json();
    },
    getListingById: async (id) => {
        const res = await fetch(`${BASE_URL}/seller/listing/${id}`, { headers: headers() });
        return await res.json();
    },
    updateListing: async (id, listingData) => {
        const res = await fetch(`${BASE_URL}/seller/listing/${id}`, {
            method: "PUT",
            headers: headers(),
            body: JSON.stringify(listingData),
        });
        return await res.json();
    },
    deleteListing: async (id) => {
        const res = await fetch(`${BASE_URL}/seller/listing/${id}`, {
            method: "DELETE",
            headers: headers(),
        });
        return await res.json();
    },
    getNotifications: async () => {
        const res = await fetch(`${BASE_URL}/api/notifications`, { headers: headers() });
        if (!res.ok) return [];
        return await res.json();
    },
    markNotificationsAsRead: async () => {
        const res = await fetch(`${BASE_URL}/api/notifications/read`, { method: "PUT", headers: headers() });
        return await res.json();
    },
    // Upload image to Cloudinary with progress tracking
    uploadImage: async (file, onProgress) => {
        const formData = new FormData();
        formData.append("image", file);

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", `${BASE_URL}/seller/upload-image`);
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
                    resolve({ success: false, error: `Upload failed: Server error (${xhr.status})` });
                }
            };

            xhr.onerror = () => {
                reject(new Error("Network error during upload"));
            };

            xhr.send(formData);
        });
    },
    // Get weather data + smart farming advice (new advisory endpoint)
    getWeather: async (params) => {
        const res = await fetch(`${BASE_URL}/api/weather/current?${params}`, { headers: headers() });
        return await res.json();
    },
    // Get farming advice for a specific crop + location
    getWeatherAdvice: async (city, crop = "") => {
        const res = await fetch(`${BASE_URL}/api/weather/advice?city=${city}&crop=${crop}`, { headers: headers() });
        return await res.json();
    },
    // Get active weather alerts
    getWeatherAlerts: async (city) => {
        const res = await fetch(`${BASE_URL}/api/weather/alerts?city=${city}`, { headers: headers() });
        return await res.json();
    },
    // Get live simulated market prices for a state (e.g. 'tn')
    getMarketPrices: async (state = 'tn') => {
        const res = await fetch(`${BASE_URL}/api/market-prices?state=${state}`, { headers: headers() });
        return await res.json();
    },
    // AI Image Analysis
    analyzeImage: async (imageUrl, originalFilename = "") => {
        const res = await fetch(`${BASE_URL}/api/analyze-image`, {
            method: "POST",
            headers: headers(),
            body: JSON.stringify({ image_url: imageUrl, original_filename: originalFilename }),
        });
        return await res.json();
    },
    // New PRD Features
    detectDisease: async (file) => {
        const formData = new FormData();
        formData.append("image", file);
        const res = await fetch(`${BASE_URL}/api/detect-disease`, {
            method: "POST",
            headers: { Authorization: `Bearer ${getToken()}` },
            body: formData,
        });
        return await res.json();
    },
    getNearbyLogistics: async (lat, lon) => {
        const res = await fetch(`${BASE_URL}/api/logistics/nearby?lat=${lat || ""}&lon=${lon || ""}`, {
            headers: headers(),
        });
        return await res.json();
    },
    getSellerRating: async (sellerId) => {
        const res = await fetch(`${BASE_URL}/api/seller/${sellerId}/rating`, {
            headers: headers(),
        });
        return await res.json();
    },
};
