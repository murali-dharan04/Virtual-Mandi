import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Leaf, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) { setError("All fields are required"); return; }
        setLoading(true);
        setError("");
        try {
            await login(email, password);
            navigate("/");
        } catch {
            setError("Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageTransition>
            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-md"
                >
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-hero shadow-elevated">
                            <Leaf className="h-8 w-8 text-primary-foreground" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-foreground">
                            Virtual<span className="text-accent">Mandi</span>
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">Your digital marketplace for fresh produce</p>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
                        <h2 className="mb-6 text-xl font-bold text-foreground">Welcome back</h2>

                        {error && (
                            <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email address"
                                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPw ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        className="w-full rounded-xl border border-border bg-background px-4 py-3 pr-12 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                                        {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl gradient-hero py-3.5 text-base font-bold text-primary-foreground shadow-card transition-all hover:opacity-90 disabled:opacity-50"
                            >
                                {loading ? "Signing in..." : "Sign In"}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-sm text-muted-foreground">
                            New to Virtual Mandi?{" "}
                            <Link to="/register" className="font-semibold text-accent hover:underline">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </PageTransition>
    );
};

export default Login;
