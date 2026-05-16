import { GoogleLogin } from "@react-oauth/google";
import { BASE_URL } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

/**
 * GoogleLoginButton – Seller App (Farmer role)
 * Uses the @react-oauth/google GoogleLogin component.
 * Sends the ID token to the Flask backend for verification.
 */
const GoogleLoginButton = ({ onError }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSuccess = async (credentialResponse) => {
        if (!credentialResponse.credential) {
            onError?.("Google login failed: no credential received.");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/api/auth/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    credential: credentialResponse.credential,
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

    const handleError = () => {
        onError?.("Google sign-in was cancelled or blocked. Please try again.");
    };

    return (
        <div className="w-full">
            {loading ? (
                <div className="flex items-center justify-center h-12 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-400 text-sm font-semibold">
                    <svg className="animate-spin h-5 w-5 mr-2 text-slate-400" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Verifying with Google…
                </div>
            ) : (
                <div
                    className="overflow-hidden rounded-2xl border-2 border-slate-100 hover:border-slate-200 transition-all"
                    style={{ display: "flex", justifyContent: "center" }}
                >
                    <GoogleLogin
                        onSuccess={handleSuccess}
                        onError={handleError}
                        width="100%"
                        size="large"
                        shape="rectangular"
                        logo_alignment="center"
                        text="signin_with"
                        theme="outline"
                    />
                </div>
            )}
        </div>
    );
};

export default GoogleLoginButton;
