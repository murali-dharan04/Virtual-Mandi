import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    Eye, EyeOff, ArrowRight, Phone, MessageSquare,
    CheckCircle2, RefreshCw, ArrowLeft, Mail, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sellerApi } from "@/lib/api";
import PageTransition from "@/components/PageTransition";
import AuthLayout from "@/components/AuthLayout";

const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError("All fields are mandatory");
            return;
        }
        setIsLoading(true);
        setError("");
        try {
            const res = await sellerApi.login(email, password);
            if (res.access_token) {
                localStorage.setItem("sellerRole", res.role || "farmer");
                localStorage.setItem("sellerToken", res.access_token);
                localStorage.setItem("sellerUser", JSON.stringify(res.user));
                navigate("/dashboard");
            } else {
                setError(res.error || "Login failed");
            }
        } catch (err) {
            setError("Network error. Please check your connection.");
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "h-14 rounded-2xl border-2 border-slate-100 bg-slate-50/50 focus:border-[#2E7D32] transition-all font-medium text-slate-900 placeholder:text-slate-300";
    const labelClass = "text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1";

    return (
        <PageTransition>
            <AuthLayout
                title="Connect to Mandi"
                subtitle="Sign in with your email and password."
            >
                <div className="relative">
                    <form
                        onSubmit={handleEmailLogin}
                        className="space-y-6"
                    >
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className={labelClass}>Email Address</Label>
                                <Input
                                    id="login-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="farmer@example.com"
                                    required
                                    className={inputClass}
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center pr-1">
                                    <Label className={labelClass}>Password</Label>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/auth/forgot-password')}
                                        className="text-[10px] font-black uppercase text-slate-400 hover:text-[#2E7D32] transition-colors"
                                    >
                                        Forgot?
                                    </button>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="login-password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className={`${inputClass} pr-12`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                            {error && <p className="text-xs font-bold text-red-500 ml-1 text-center">{error}</p>}
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading || !email || !password}
                            className={`w-full h-16 text-lg font-black uppercase rounded-2xl bg-[#2E7D32] hover:bg-[#1B5E20] shadow-xl transition-all duration-300 ${(!email || !password) ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
                        >
                            {isLoading ? <RefreshCw className="animate-spin h-6 w-6" /> : "Sign In"}
                        </Button>
                    </form>

                    <div className="mt-10 text-center border-t border-slate-100 pt-8">
                        <p className="text-slate-400 text-sm font-medium">New to Virtual Mandi?</p>
                        <button
                            onClick={() => navigate('/auth/register')}
                            className="text-[#FF9800] font-black uppercase tracking-wider mt-1 hover:underline underline-offset-8 transition-all hover:scale-105 active:scale-95 inline-block"
                        >
                            Create Account Now
                        </button>
                    </div>
                </div>
            </AuthLayout>
        </PageTransition>
    );
};

export default Login;
