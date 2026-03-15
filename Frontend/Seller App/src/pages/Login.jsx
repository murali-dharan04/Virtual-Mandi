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
import OtpInput from "@/components/OtpInput";
import AuthLayout from "@/components/AuthLayout";

const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // OTP State
    const [otpPhone, setOtpPhone] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        const email = e.target["login-email"].value;
        const password = e.target["login-password"].value;
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

    const handleSendOtp = async (method) => {
        const cleanedPhone = otpPhone.replace(/\s/g, "");
        if (cleanedPhone.length < 10) {
            setError("Enter a valid mobile number");
            return;
        }
        setError("");
        setIsLoading(true);
        try {
            const res = await sellerApi.sendOtp(otpPhone, method);
            if (res.success) {
                setOtpSent(true);
                setResendTimer(30);
            } else {
                setError(res.error || "Failed to send OTP");
            }
        } catch (err) {
            setError("Network error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (value) => {
        setIsLoading(true);
        setError("");
        try {
            const res = await sellerApi.verifyOtp(otpPhone, value);
            if (res.success) {
                localStorage.setItem("sellerToken", res.access_token);
                localStorage.setItem("sellerUser", JSON.stringify(res.user));
                navigate("/dashboard");
            } else {
                setError(res.error || "Invalid OTP");
            }
        } catch (err) {
            setError("Verification failed");
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
                subtitle="Use your preferred method to sign in."
            >
                <div className="relative">
                    <Tabs defaultValue="mobile" className="w-full">
                        <TabsList className="grid grid-cols-3 mb-8 h-12 bg-slate-100/50 p-1 rounded-2xl border border-slate-200/50">
                            <TabsTrigger value="mobile" className="rounded-xl text-[9px] font-black uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:text-[#2E7D32] data-[state=active]:shadow-sm">
                                <Phone className="mr-1.5 h-3 w-3" />
                                SMS
                            </TabsTrigger>
                            <TabsTrigger value="whatsapp" className="rounded-xl text-[9px] font-black uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:text-[#2E7D32] data-[state=active]:shadow-sm">
                                <MessageSquare className="mr-1.5 h-3 w-3" />
                                WhatsApp
                            </TabsTrigger>
                            <TabsTrigger value="email" className="rounded-xl text-[9px] font-black uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:text-[#2E7D32] data-[state=active]:shadow-sm">
                                <Mail className="mr-1.5 h-3 w-3" />
                                Email
                            </TabsTrigger>
                        </TabsList>

                        <AnimatePresence mode="wait">
                            {['mobile', 'whatsapp'].map(tab => (
                                <TabsContent key={tab} value={tab} className="mt-0">
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-6"
                                    >
                                        {!otpSent ? (
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <Label className={labelClass}>{tab === 'mobile' ? 'Mobile' : 'WhatsApp'} Number</Label>
                                                    <div className="relative">
                                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">+91</div>
                                                        <Input
                                                            value={otpPhone}
                                                            onChange={(e) => setOtpPhone(e.target.value)}
                                                            placeholder="9876543210"
                                                            className={`${inputClass} pl-12`}
                                                        />
                                                    </div>
                                                    {error && <p className="text-xs font-bold text-red-500 ml-1">{error}</p>}
                                                </div>
                                                <Button
                                                    onClick={() => handleSendOtp(tab === 'whatsapp' ? 'whatsapp' : 'sms')}
                                                    disabled={isLoading}
                                                    className="w-full h-16 text-lg font-black uppercase rounded-2xl bg-[#2E7D32] hover:bg-[#1B5E20] shadow-xl shadow-green-900/10"
                                                >
                                                    {isLoading ? <RefreshCw className="animate-spin h-6 w-6" /> : `Send OTP via ${tab === 'whatsapp' ? 'WhatsApp' : 'SMS'}`}
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                <div className="bg-[#E8F5E9] p-4 rounded-2xl border border-[#A5D6A7]/50 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-[#2E7D32] tracking-widest">Verify code sent to</p>
                                                        <p className="font-bold text-[#1B5E20]">+91 {otpPhone}</p>
                                                    </div>
                                                    <button onClick={() => setOtpSent(false)} className="h-8 w-8 bg-white rounded-full flex items-center justify-center shadow-sm text-[#2E7D32] hover:scale-110 transition-transform">
                                                        <RefreshCw className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <div className="space-y-4 text-center">
                                                    <Label className={labelClass}>Enter 6-Digit Code</Label>
                                                    <OtpInput onComplete={handleVerifyOtp} />
                                                    {error && <p className="text-xs font-bold text-red-500">{error}</p>}
                                                </div>
                                                <div className="text-center">
                                                    {resendTimer > 0 ? (
                                                        <p className="text-xs font-bold text-slate-400">Resend code in {resendTimer}s</p>
                                                    ) : (
                                                        <button onClick={() => handleSendOtp(tab === 'whatsapp' ? 'whatsapp' : 'sms')} className="text-xs font-black uppercase text-[#2E7D32] hover:underline underline-offset-4">Resend OTP Now</button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                </TabsContent>
                            ))}

                            <TabsContent value="email" className="mt-0">
                                <motion.form
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onSubmit={handleEmailLogin}
                                    className="space-y-6"
                                >
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className={labelClass}>Email Address</Label>
                                            <Input
                                                id="login-email"
                                                type="email"
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
                                        disabled={isLoading}
                                        className="w-full h-16 text-lg font-black uppercase rounded-2xl bg-[#2E7D32] hover:bg-[#1B5E20] shadow-xl shadow-green-900/10"
                                    >
                                        {isLoading ? <RefreshCw className="animate-spin h-6 w-6" /> : "Sign In"}
                                    </Button>
                                </motion.form>
                            </TabsContent>
                        </AnimatePresence>
                    </Tabs>

                    <div className="mt-10 text-center border-t border-slate-100 pt-8">
                        <p className="text-slate-400 text-sm font-medium">New to Virtual Mandi?</p>
                        <button
                            onClick={() => navigate('/auth/register')}
                            className="text-[#FF9800] font-black uppercase tracking-wider mt-1 hover:underline underline-offset-8"
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
