import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Leaf } from "lucide-react";
import { motion } from "framer-motion";

import PageTransition from "@/components/PageTransition";

const Register = () => {
    const [name, setName] = useState(() => sessionStorage.getItem("reg_name") || "");
    const [email, setEmail] = useState(() => sessionStorage.getItem("reg_email") || "");
    const [password, setPassword] = useState("");
    const [type, setType] = useState(() => sessionStorage.getItem("reg_type") || "retailer");
    const [error, setError] = useState("");
    const [optimisticSuccess, setOptimisticSuccess] = useState(false);
    const { register, login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        sessionStorage.setItem("reg_name", name);
        sessionStorage.setItem("reg_email", email);
        sessionStorage.setItem("reg_type", type);
    }, [name, email, type]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !email || !password) { setError("All fields are required"); return; }
        setOptimisticSuccess(true);
        setError("");

        setTimeout(async () => {
            try {
                await register(name, email, password, type);
                if (login) {
                    await login(email, password);
                }
                sessionStorage.removeItem("reg_name");
                sessionStorage.removeItem("reg_email");
                sessionStorage.removeItem("reg_type");
                navigate("/");
            } catch (err) {
                setOptimisticSuccess(false);
                const errorMsg = err.response?.data?.error || err.message || "Registration failed";
                setError(errorMsg);
            }
        }, 0);
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
                            <button type="submit" disabled={optimisticSuccess}
                                className={`w-full rounded-xl py-3.5 text-base font-bold text-primary-foreground shadow-card transition-all disabled:opacity-90 disabled:cursor-wait ${optimisticSuccess ? "bg-emerald-600" : "gradient-hero hover:opacity-90"}`}>
                                {optimisticSuccess ? "Account Created! Redirecting..." : "Create Account"}
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
