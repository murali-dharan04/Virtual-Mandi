import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    Mail, Lock, ArrowRight, ArrowLeft,
    CheckCircle2, ShieldCheck, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { sellerApi } from "@/lib/api";
import PageTransition from "@/components/PageTransition";
import OtpInput from "@/components/OtpInput";
import AuthLayout from "@/components/AuthLayout";

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0); // 0: Email, 1: OTP, 2: New Password
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSendResetCode = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        try {
            const res = await sellerApi.forgotPassword(email);
            if (res.success) {
                setStep(1);
            } else {
                setError(res.error || "Failed to send reset code");
            }
        } catch (err) {
            setError("Network error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (otp) => {
        setStep(2);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        const pass = e.target["new-password"].value;
        const confirm = e.target["confirm-password"].value;

        if (pass !== confirm) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);
        setError("");
        try {
            // Mocking success for verification
            setTimeout(() => {
                navigate("/auth/login");
            }, 1500);
        } catch (err) {
            setError("Reset failed");
        }
    };

    const inputClass = "h-14 rounded-2xl border-2 border-slate-100 bg-slate-50/50 focus:border-[#2E7D32] transition-all font-medium text-slate-900 placeholder:text-slate-300";
    const labelClass = "text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1";

    return (
        <PageTransition>
            <AuthLayout
                title="Account Recovery"
                subtitle="We'll help you get back into your account."
            >
                <div className="relative min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {step === 0 && (
                            <motion.div
                                key="step0"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="space-y-6"
                            >
                                <div className="text-center mb-8">
                                    <div className="h-20 w-20 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                        <Mail className="h-10 w-10" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 font-poppins">Forgot Password?</h3>
                                    <p className="text-slate-500 font-medium mt-1">Enter your email to receive a recovery code.</p>
                                </div>

                                <form onSubmit={handleSendResetCode} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className={labelClass}>Email Address</Label>
                                        <Input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="farmer@example.com"
                                            required
                                            className={inputClass}
                                        />
                                    </div>
                                    {error && <p className="text-xs font-bold text-red-500 text-center">{error}</p>}
                                    <div className="flex gap-4">
                                        <Button variant="outline" onClick={() => navigate('/auth/login')} className="h-16 w-20 rounded-2xl border-2"><ArrowLeft /></Button>
                                        <Button type="submit" disabled={isLoading} className="flex-1 h-16 text-lg font-black uppercase rounded-2xl bg-[#2E7D32] hover:bg-[#1B5E20] shadow-xl shadow-green-900/10">
                                            {isLoading ? <RefreshCw className="animate-spin h-6 w-6" /> : "Send Code"}
                                        </Button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="space-y-8"
                            >
                                <div className="text-center">
                                    <div className="h-20 w-20 bg-[#E8F5E9] text-[#2E7D32] rounded-3xl flex items-center justify-center mx-auto mb-4">
                                        <ShieldCheck className="h-10 w-10" />
                                    </div>
                                    <h3 className="text-2xl font-black text-[#2E7D32] font-poppins">Check Your mail</h3>
                                    <p className="text-slate-500 font-medium">We've sent a 6-digit code to <span className="text-slate-900 font-bold">{email}</span></p>
                                </div>

                                <div className="space-y-6">
                                    <OtpInput onComplete={handleVerifyOtp} />
                                    {error && <p className="text-xs font-bold text-red-500 text-center">{error}</p>}
                                    <Button variant="link" onClick={() => setStep(0)} className="w-full text-slate-400 font-bold uppercase tracking-widest text-[10px]">Wrong Email? Try Again</Button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="space-y-6"
                            >
                                <div className="text-center mb-8">
                                    <div className="h-20 w-20 bg-[#FFF3E0] text-[#FF9800] rounded-3xl flex items-center justify-center mx-auto mb-4">
                                        <Lock className="h-10 w-10" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 font-poppins">Secure Account</h3>
                                    <p className="text-slate-500 font-medium mt-1">Create a strong new password for your account.</p>
                                </div>

                                <form onSubmit={handleResetPassword} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className={labelClass}>New Password</Label>
                                            <Input id="new-password" type="password" placeholder="••••••••" required className={inputClass} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className={labelClass}>Confirm New Password</Label>
                                            <Input id="confirm-password" type="password" placeholder="••••••••" required className={inputClass} />
                                        </div>
                                    </div>
                                    {error && <p className="text-xs font-bold text-red-500 text-center">{error}</p>}
                                    <Button type="submit" disabled={isLoading} className="w-full h-16 text-lg font-black uppercase rounded-2xl bg-[#2E7D32] hover:bg-[#1B5E20] shadow-xl shadow-green-900/10">
                                        {isLoading ? <RefreshCw className="animate-spin h-6 w-6" /> : "Reset & Sign In"}
                                    </Button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </AuthLayout>
        </PageTransition>
    );
};

export default ForgotPassword;
