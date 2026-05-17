import { useGoogleLogin } from "@react-oauth/google";
import { BASE_URL } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

/**
 * GoogleLoginButton – Seller App (Farmer role)
 * Premium custom-designed button using useGoogleLogin hook for full style control.
 * Matches the green/golden wheat field theme of the Seller console.
 */
const GoogleLoginButton = ({ onError }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [hovered, setHovered] = useState(false);

    const handleSuccess = async (tokenResponse) => {
        setLoading(true);
        try {
            // Fetch user info using the access token
            const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
            });
            const userInfo = await userInfoRes.json();

            // Send to backend
            const res = await fetch(`${BASE_URL}/api/auth/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    access_token: tokenResponse.access_token,
                    email: userInfo.email,
                    name: userInfo.name,
                    picture: userInfo.picture,
                    role: "farmer",
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                onError?.(data.error || "Google authentication failed.");
                return;
            }

            // Store session – same keys used by the existing Seller App
            localStorage.setItem("sellerToken", data.access_token);
            localStorage.setItem("sellerRole", data.role || "farmer");
            if (data.user) {
                localStorage.setItem("sellerUser", JSON.stringify(data.user));
            }
            navigate("/dashboard");
        } catch {
            onError?.("Network error during Google login. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const login = useGoogleLogin({
        onSuccess: handleSuccess,
        onError: () => onError?.("Google sign-in was cancelled or blocked. Please try again."),
    });

    return (
        <button
            type="button"
            onClick={() => login()}
            disabled={loading}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="w-full relative group overflow-hidden"
            style={{ outline: "none", border: "none", background: "transparent" }}
        >
            <div
                className="w-full h-[50px] rounded-xl flex items-center justify-center gap-3 font-black text-sm tracking-wide transition-all duration-300 relative overflow-hidden"
                style={{
                    background: hovered
                        ? "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,253,244,1) 100%)"
                        : "linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(236,253,245,0.9) 100%)",
                    boxShadow: hovered
                        ? "0 8px 32px rgba(34,197,94,0.2), 0 2px 8px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.9)"
                        : "0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)",
                    border: hovered ? "1.5px solid rgba(34,197,94,0.35)" : "1.5px solid rgba(255,255,255,0.6)",
                    transform: hovered ? "translateY(-1px)" : "translateY(0)",
                    backdropFilter: "blur(12px)",
                }}
            >
                {/* Shimmer overlay on hover */}
                <div
                    className="absolute inset-0 pointer-events-none transition-opacity duration-500"
                    style={{
                        opacity: hovered ? 1 : 0,
                        background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.5) 50%, transparent 60%)",
                        transform: hovered ? "translateX(100%)" : "translateX(-100%)",
                        transition: "transform 0.6s ease, opacity 0.3s ease",
                    }}
                />

                {loading ? (
                    <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#22c55e" strokeWidth="3" />
                            <path className="opacity-75" fill="#22c55e" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        <span style={{ color: "#166534", fontWeight: 700 }}>Connecting to Google…</span>
                    </>
                ) : (
                    <>
                        {/* Google G Logo */}
                        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>

                        <span
                            style={{
                                color: "#3c4043",
                                fontWeight: 700,
                                fontSize: "13.5px",
                                letterSpacing: "0.02em",
                                fontFamily: "'Roboto', sans-serif",
                            }}
                        >
                            Continue with Google
                        </span>

                        {/* Animated arrow */}
                        <svg
                            width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                            style={{
                                transform: hovered ? "translateX(3px)" : "translateX(0)",
                                opacity: hovered ? 1 : 0.4,
                                transition: "transform 0.25s ease, opacity 0.25s ease",
                            }}
                        >
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </>
                )}
            </div>
        </button>
    );
};

export default GoogleLoginButton;
