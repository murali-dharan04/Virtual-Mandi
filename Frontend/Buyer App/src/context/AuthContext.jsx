import React, { createContext, useContext, useState, useEffect } from "react";
import { api, BASE_URL } from "@/services/api";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem("buyerUser");
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.error("Failed to parse buyerUser:", e);
            return null;
        }
    });

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("buyerToken");
            if (token && !user) {
                try {
                    const res = await fetch(`${BASE_URL}/profile`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    if (res.status === 401) {
                        console.warn("Token expired during session restoration");
                        localStorage.removeItem("buyerToken");
                        localStorage.removeItem("buyerUser");
                        return;
                    }
                    const data = await res.json();
                    if (data.id) {
                        const userData = { ...data, token };
                        setUser(userData);
                        localStorage.setItem("buyerUser", JSON.stringify(userData));
                    }
                } catch (err) {
                    console.error("Failed to restore buyer session:", err);
                }
            }
        };
        fetchProfile();
    }, [user]);

    const login = async (email, password) => {
        try {
            const data = await api.login(email, password);
            if (data.access_token && data.user) {
                const userData = { ...data.user, token: data.access_token };
                setUser(userData);
                localStorage.setItem("buyerUser", JSON.stringify(userData));
                localStorage.setItem("buyerToken", data.access_token);
                return true;
            }
            throw new Error(data.error || "Login failed");
        } catch (err) {
            console.error("Login context error:", err);
            throw err;
        }
    };

    const register = async (name, email, password, type) => {
        try {
            // Role 'buyer' is handled by the api service
            const data = await api.register(name, email, password, type);
            if (data.user_id) {
                return true;
            }
            throw new Error(data.error || "Registration failed");
        } catch (err) {
            console.error("Register context error:", err);
            throw err;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("buyerUser");
        localStorage.removeItem("buyerToken");
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};
