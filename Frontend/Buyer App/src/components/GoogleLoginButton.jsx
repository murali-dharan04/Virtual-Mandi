import { GoogleLogin } from "@react-oauth/google";
import { BASE_URL } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

/**
 * GoogleLoginButton – Buyer App
 * Sends the Google ID token to the Flask backend,
 * then updates AuthContext with the returned JWT.
 */
const GoogleLoginButton = ({ onError }) => {
    const navigate = useNavigate();
    const { googleLogin } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleSuccess = async (credentialResponse) => {
        if (!credentialResponse.credential) {
            onError?.("Google login failed: no credential received.");
            return;
        }
        setLoading(true);
        try {
            await googleLogin(credentialResponse.credential);
            navigate("/");
        } catch (err) {
            onError?.(err.message || "Google authentication failed.");
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
                <div className="flex items-center justify-center h-12 rounded-xl border border-border bg-card text-muted-foreground text-sm font-medium">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Verifying with Google…
                </div>
            ) : (
                <div
                    className="overflow-hidden rounded-xl border border-border hover:border-primary/40 transition-all"
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
