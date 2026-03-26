import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    User, Mail, Phone, MapPin, Lock,
    ArrowRight, ArrowLeft, CheckCircle2,
    RefreshCw, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue
} from "@/components/ui/select";
import { sellerApi } from "@/lib/api";
import PageTransition from "@/components/PageTransition";
import OtpInput from "@/components/OtpInput";
import AuthLayout from "@/components/AuthLayout";

import { statesData } from "@/data/statesData";

const Register = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: "", email: "", mobile: "", whatsapp: "",
        state: "", district: "", password: "", confirmPassword: "",
        category: "vegetables", language: "english",
        whatsappSameAsMobile: false
    });

    const [location, setLocation] = useState({ lat: null, lng: null });

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => console.log("Location access denied")
            );
        }
    }, []);

    const handleChange = (field, value) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };
            if (field === 'mobile' && prev.whatsappSameAsMobile) {
                newData.whatsapp = value;
            }
            if (field === 'whatsappSameAsMobile') {
                newData.whatsapp = value ? prev.mobile : "";
            }
            // Reset district when state changes
            if (field === 'state') {
                newData.district = "";
            }
            return newData;
        });
    };

    const handleRegister = async () => {
        if (!formData.password || !formData.confirmPassword) {
            setError("Both password fields are required");
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setIsLoading(true);
        setError("");
        try {
            const res = await sellerApi.register(
                formData.name,
                formData.email,
                formData.password,
                location.lat ? `${location.lat},${location.lng}` : null,
                formData
            );
            if (res.access_token) {
                // Success: Redirect to Dashboard directly
                navigate("/dashboard");
            } else if (res.message || res.user_id) {
                // Fallback if token not returned for some reason
                navigate("/auth/login");
            } else {
                setError(res.error || "Registration failed");
            }
        } catch (err) {
            setError("Network error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (otp) => {
        setIsLoading(true);
        setError("");
        try {
            // Placeholder for OTP verification logic
            console.log("Verifying OTP:", otp);
            navigate("/dashboard");
        } catch (err) {
            setError("Invalid OTP");
        } finally {
            setIsLoading(false);
        }
    };



    const inputClass = "h-14 rounded-2xl border-2 border-slate-100 bg-slate-50/50 focus:border-[#2E7D32] transition-all font-medium text-slate-900 placeholder:text-slate-300";
    const labelClass = "text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1";
    const buttonClass = "w-full h-16 text-lg font-black uppercase rounded-2xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white shadow-lg hover:shadow-[#2E7D32]/20 active:translate-y-0.5 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed";

    const StepIndicator = () => (
        <div className="flex items-center justify-between mb-8 px-2">
            {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center flex-1 last:flex-none">
                    <div className={`h-10 w-10 rounded-2xl flex items-center justify-center text-sm font-black transition-all ${step === i ? 'bg-[#2E7D32] text-white shadow-lg' :
                        step > i ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-slate-100 text-slate-400'
                        }`}>
                        {step > i ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                    </div>
                    {i < 2 && (
                        <div className={`h-1 flex-1 mx-2 rounded-full transition-all ${step > i ? 'bg-[#2E7D32]' : 'bg-slate-100'
                            }`} />
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <PageTransition>
            <AuthLayout
                title="Create Account"
                subtitle="Join Bharat's biggest digital Mandi."
            >
                {step < 3 && <StepIndicator />}

                <div className="relative min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {step === 0 && (
                            <motion.div
                                key="step0"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-5"
                            >
                                <div className="space-y-2">
                                    <Label className={labelClass}>Full Name</Label>
                                    <Input value={formData.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Farmer Ram" className={inputClass} />
                                </div>
                                <div className="space-y-2">
                                    <Label className={labelClass}>Mobile Number</Label>
                                    <Input 
                                        type="tel"
                                        value={formData.mobile} 
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            handleChange('mobile', val);
                                        }} 
                                        placeholder="9876543210" 
                                        className={inputClass} 
                                    />
                                </div>
                                <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-2xl border-2 border-slate-100 transition-all hover:bg-slate-100/50">
                                    <Checkbox
                                        id="whatsapp-sync"
                                        checked={formData.whatsappSameAsMobile}
                                        onCheckedChange={(val) => handleChange('whatsappSameAsMobile', val)}
                                        className="h-6 w-6 border-2 border-slate-200 data-[state=checked]:bg-[#2E7D32] data-[state=checked]:border-[#2E7D32] transition-all"
                                    />
                                    <label htmlFor="whatsapp-sync" className="text-sm font-black text-slate-500 cursor-pointer select-none leading-tight">
                                        WhatsApp Number is same as mobile
                                    </label>
                                </div>
                                {!formData.whatsappSameAsMobile && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-2">
                                        <Label className={labelClass}>WhatsApp Number</Label>
                                        <Input value={formData.whatsapp} onChange={(e) => handleChange('whatsapp', e.target.value)} placeholder="9876543210" className={inputClass} />
                                    </motion.div>
                                )}
                                <Button
                                    onClick={() => {
                                        if (!formData.name || formData.mobile.length !== 10 || (!formData.whatsappSameAsMobile && formData.whatsapp.length !== 10)) {
                                            setError("Please enter a valid 10-digit mobile number");
                                            return;
                                        }
                                        setError("");
                                        setStep(1);
                                    }}
                                    disabled={!formData.name || formData.mobile.length !== 10}
                                    className={buttonClass}
                                >
                                    Continue <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                                {error && step === 0 && <p className="text-xs font-bold text-red-500 text-center mt-2">{error}</p>}
                            </motion.div>
                        )}

                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-5"
                            >
                                <div className="space-y-2">
                                    <Label className={labelClass}>Email *</Label>
                                    <Input type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="ram@example.com" className={inputClass} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className={labelClass}>State *</Label>
                                        <Select onValueChange={(val) => handleChange('state', val)} value={formData.state}>
                                            <SelectTrigger className={inputClass}>
                                                <SelectValue placeholder="Select State" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-3xl border-2 border-slate-100 shadow-xl shadow-slate-200/50 text-slate-900 bg-white z-50 p-2 max-h-64">
                                                {Object.keys(statesData).sort().map(s => <SelectItem key={s} value={s} className="font-semibold cursor-pointer rounded-xl focus:bg-[#E8F5E9] focus:text-[#2E7D32] py-3 transition-colors">{s}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={labelClass}>District *</Label>
                                        <Select onValueChange={(val) => handleChange('district', val)} value={formData.district} disabled={!formData.state}>
                                            <SelectTrigger className={inputClass}>
                                                <SelectValue placeholder={formData.state ? "Select District" : "Wait for State"} />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-3xl border-2 border-slate-100 shadow-xl shadow-slate-200/50 text-slate-900 bg-white z-50 p-2 max-h-64">
                                                {formData.state && statesData[formData.state].sort().map(d => <SelectItem key={d} value={d} className="font-semibold cursor-pointer rounded-xl focus:bg-[#E8F5E9] focus:text-[#2E7D32] py-3 transition-colors">{d}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-4">
                                    <Button variant="outline" onClick={() => setStep(0)} className="h-16 w-20 rounded-2xl border-2 hover:bg-slate-50 transition-colors"><ArrowLeft /></Button>
                                    <Button
                                        onClick={() => {
                                            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                            if (!emailRegex.test(formData.email)) {
                                                setError("Please enter a valid email address");
                                                return;
                                            }
                                            if (!formData.state || !formData.district) {
                                                setError("Please select your state and district");
                                                return;
                                            }
                                            setError("");
                                            setStep(2);
                                        }}
                                        disabled={!formData.email || !formData.state || !formData.district}
                                        className={`flex-1 ${buttonClass}`}
                                    >
                                        Continue
                                    </Button>
                                </div>
                                {error && step === 1 && <p className="text-xs font-bold text-red-500 text-center mt-4">{error}</p>}
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-5"
                            >
                                <div className="space-y-2">
                                    <Label className={labelClass}>Secure Password</Label>
                                    <Input type="password" value={formData.password} onChange={(e) => handleChange('password', e.target.value)} placeholder="••••••••" className={inputClass} />
                                </div>
                                <div className="space-y-2">
                                    <Label className={labelClass}>Confirm Password</Label>
                                    <Input type="password" value={formData.confirmPassword} onChange={(e) => handleChange('confirmPassword', e.target.value)} placeholder="••••••••" className={inputClass} />
                                </div>
                                {error && <p className="text-xs font-bold text-red-500 text-center">{error}</p>}
                                <div className="flex gap-4 mt-6">
                                    <Button variant="outline" onClick={() => { setError(""); setStep(1); }} className="h-16 w-20 rounded-2xl border-2 hover:bg-slate-50 transition-colors"><ArrowLeft /></Button>
                                    <Button
                                        onClick={handleRegister}
                                        disabled={isLoading || !formData.password || formData.password !== formData.confirmPassword}
                                        className={`flex-1 ${buttonClass}`}
                                    >
                                        {isLoading ? <RefreshCw className="animate-spin h-6 w-6" /> : "Complete Register"}
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="otp"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-8"
                            >
                                <div className="text-center">
                                    <div className="h-20 w-20 bg-[#E8F5E9] text-[#2E7D32] rounded-3xl flex items-center justify-center mx-auto mb-4">
                                        <MessageSquare className="h-10 w-10" />
                                    </div>
                                    <h3 className="text-2xl font-black text-[#2E7D32] font-poppins">Verify It's You</h3>
                                    <p className="text-slate-500 font-medium">Enter the 6-digit code sent to your mobile.</p>
                                </div>
                                <OtpInput onComplete={handleVerifyOtp} />
                                {error && <p className="text-xs font-bold text-red-500 text-center">{error}</p>}
                                <Button onClick={() => setStep(0)} variant="link" className="w-full text-slate-400 font-bold uppercase tracking-widest text-[10px]">Change Mobile Number</Button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="mt-10 text-center border-t border-slate-100 pt-8 pb-4">
                        <p className="text-slate-400 text-sm font-medium">Already have an account?</p>
                        <button
                            onClick={() => navigate('/auth/login')}
                            className="text-[#FF9800] font-black uppercase tracking-wider mt-1 hover:underline underline-offset-8 transition-all hover:scale-105 active:scale-95 inline-block"
                        >
                            Sign In Now
                        </button>
                    </div>
                </div>
            </AuthLayout>
        </PageTransition>
    );
};

export default Register;
