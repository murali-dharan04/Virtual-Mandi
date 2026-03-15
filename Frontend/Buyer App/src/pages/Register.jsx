import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Leaf } from "lucide-react";
import { motion } from "framer-motion";

import PageTransition from "@/components/PageTransition";

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [type, setType] = useState("retailer");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { register, login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !email || !password) { setError("All fields are required"); return; }
        setLoading(true);
        setError("");
        try {
            await register(name, email, password, type);
            // Auto-login after successful registration
            if (login) {
                await login(email, password);
            }
            navigate("/");
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.message || "Registration failed";
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const buyerTypes = [
        { value: "retailer", label: "Retailer" },
        { value: "wholesaler", label: "Wholesaler" },
        { value: "trader", label: "Trader" },
    ];

    return (
        <PageTransition>
            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-hero shadow-elevated">
                            <Leaf className="h-8 w-8 text-primary-foreground" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-foreground">
                            Virtual<span className="text-accent">Mandi</span>
                        </h1>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
                        <h2 className="mb-6 text-xl font-bold text-foreground">Create Account</h2>

                        {error && <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">Full Name</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name"
                                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">Email Address</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email"
                                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password"
                                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">Buyer Type</label>
                                <div className="flex gap-2">
                                    {buyerTypes.map((bt) => (
                                        <button key={bt.value} type="button" onClick={() => setType(bt.value)}
                                            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors ${type === bt.value ? "bg-primary text-primary-foreground" : "border border-border bg-background text-muted-foreground hover:bg-secondary"
                                                }`}
                                        >
                                            {bt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" disabled={loading}
                                className="w-full rounded-xl gradient-hero py-3.5 text-base font-bold text-primary-foreground shadow-card transition-all hover:opacity-90 disabled:opacity-50">
                                {loading ? "Creating..." : "Create Account"}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link to="/login" className="font-semibold text-accent hover:underline">Sign In</Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </PageTransition>
    );
};

export default Register;
