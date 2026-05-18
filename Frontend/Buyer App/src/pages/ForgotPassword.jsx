import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Leaf, ShoppingBag, ArrowRight, ArrowLeft, ShieldCheck, User } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useAnimationFrame } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import OtpInput from "@/components/OtpInput";
import { toast } from "sonner";

// Clean, snappy animations
const fadeReveal = {
    hidden: { opacity: 0, filter: "blur(10px)", y: 10 },
    show: { opacity: 1, filter: "blur(0px)", y: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

const slideUpSnappy = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }
};

// Fluid Physics Particles Component
const FluidParticles = ({ mouseX, mouseY }) => {
    const numParticles = 30;
    const particles = useRef(
        Array.from({ length: numParticles }).map(() => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 1,
            vy: (Math.random() - 0.5) * 1 - 0.5, 
            size: Math.random() * 6 + 2,
        }))
    );
    const elementsRef = useRef([]);

    useAnimationFrame(() => {
        const mx = mouseX.get();
        const my = mouseY.get();
        const repelRadius = 150;
        const repelForce = 5;

        particles.current.forEach((p, i) => {
            const dx = p.x - mx;
            const dy = p.y - my;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < repelRadius && dist > 0) {
                const force = (repelRadius - dist) / repelRadius;
                p.vx += (dx / dist) * force * repelForce;
                p.vy += (dy / dist) * force * repelForce;
            }

            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.92;
            p.vy *= 0.92;
            p.x += Math.sin(Date.now() / 2000 + p.size) * 0.5;
            p.y -= 0.5; 

            if (p.x < 0) p.x = window.innerWidth;
            if (p.x > window.innerWidth) p.x = 0;
            if (p.y < 0) p.y = window.innerHeight;
            if (p.y > window.innerHeight) p.y = 0;

            if (elementsRef.current[i]) {
                elementsRef.current[i].style.transform = `translate(${p.x}px, ${p.y}px)`;
            }
        });
    });

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {particles.current.map((p, i) => (
                <div
                    key={i}
                    ref={el => elementsRef.current[i] = el}
                    className="absolute rounded-full bg-white/40 mix-blend-screen blur-[2px]"
                    style={{
                        width: p.size + "px",
                        height: p.size + "px",
                        transform: `translate(${p.x}px, ${p.y}px)`,
                    }}
                />
            ))}
        </div>
    );
};

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0); 
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [weatherCond, setWeatherCond] = useState("clear"); 

    const globalMouseX = useMotionValue(-1000);
    const globalMouseY = useMotionValue(-1000);
    const spotlightX = useTransform(globalMouseX, x => `${x}px`);
    const spotlightY = useTransform(globalMouseY, y => `${y}px`);

    // Weather Sync API
    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const res = await fetch("https://wttr.in/?format=j1");
                const data = await res.json();
                const desc = data.current_condition[0].weatherDesc[0].value.toLowerCase();
                if (desc.includes("rain") || desc.includes("shower") || desc.includes("drizzle")) {
                    setWeatherCond("rain");
                } else {
                    setWeatherCond("clear");
                }
            } catch (err) {
                setWeatherCond("clear");
            }
        };
        fetchWeather();
        setMounted(true);
    }, []);

    // 3D Tilt Logic
    const cardRef = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
    const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);
    const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
    const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);

    const handleCardMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
    };
    const handleCardMouseLeave = () => { x.set(0); y.set(0); };

    // Magnetic Button Logic
    const btnRef = useRef(null);
    const btnX = useMotionValue(0);
    const btnY = useMotionValue(0);
    const btnXSpring = useSpring(btnX, { stiffness: 150, damping: 15 });
    const btnYSpring = useSpring(btnY, { stiffness: 150, damping: 15 });

    const handleBtnMouseMove = (e) => {
        if (!btnRef.current) return;
        const rect = btnRef.current.getBoundingClientRect();
        btnX.set((e.clientX - rect.left - rect.width / 2) * 0.3);
        btnY.set((e.clientY - rect.top - rect.height / 2) * 0.3);
    };
    const handleBtnMouseLeave = () => { btnX.set(0); btnY.set(0); };

    // Spotlight Global Hover
    const handleGlobalMouseMove = (e) => {
        globalMouseX.set(e.clientX);
        globalMouseY.set(e.clientY);
    };

    const currentMonth = new Date().getMonth();
    const isAutumnOrWinter = currentMonth >= 8 || currentMonth <= 1;
    const themeGradient = isAutumnOrWinter 
        ? "from-[#451a03]/90 via-[#78350f]/60" 
        : "from-[#064e3b]/90 via-[#0f766e]/60";

    const handleSendResetCode = async (e) => {
        e.preventDefault();
        if (!email) { toast.error("Email is required"); return; }
        setIsLoading(true);
        // Mocking API call for Buyer App
        setTimeout(() => {
            toast.success("Recovery code sent!");
            setStep(1);
            setIsLoading(false);
        }, 1500);
    };

    const handleVerifyOtp = async (otp) => {
        toast.success("Code verified securely");
        setStep(2);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        const pass = e.target["new-password"].value;
        const confirm = e.target["confirm-password"].value;

        if (pass !== confirm) {
            toast.error("Passwords do not match");
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            toast.success("Password reset successfully! Redirecting...");
            navigate("/login");
        }, 1500);
    };

    const inputContainerClass = "flex items-center w-full h-[54px] rounded-xl bg-white/60 backdrop-blur-md px-4 transition-all duration-300 focus-within:bg-white focus-within:shadow-[0_4px_25px_rgba(245,158,11,0.25)] border border-white/50 focus-within:border-[#f59e0b]/60 group relative overflow-hidden";
    const inputClass = "flex-1 bg-transparent border-none text-[#78350f] placeholder:text-[#b45309]/50 font-semibold outline-none ml-3 text-sm z-10";
    const iconClass = "h-5 w-5 text-[#b45309]/50 group-focus-within:text-[#d97706] group-focus-within:scale-110 transition-all duration-300 z-10";

    if (!mounted) return null;

    return (
        <PageTransition>
            <style>{`
                @keyframes gradientFlow {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-gradient-text {
                    background-size: 200% auto;
                    animation: gradientFlow 4s ease infinite;
                }
                .ripple {
                    position: absolute;
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s linear;
                    background-color: rgba(255, 255, 255, 0.4);
                }
                @keyframes ripple { to { transform: scale(4); opacity: 0; } }
                .rain-overlay {
                    background-image: url('data:image/svg+xml;utf8,<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><line x1="10" y1="0" x2="10" y2="10" stroke="rgba(255,255,255,0.4)" stroke-width="1" stroke-linecap="round" /></svg>');
                    background-size: 30px 40px;
                    animation: rain 0.8s linear infinite;
                }
                @keyframes rain { 0% { background-position: 0% 0%; } 100% { background-position: 20% 100%; } }
            `}</style>

            <div 
                className="min-h-screen lg:h-screen font-poppins relative flex flex-col lg:flex-row overflow-hidden bg-[#1a0f08] selection:bg-[#f59e0b]/30"
                onMouseMove={handleGlobalMouseMove}
            >
                {/* Slow-Motion 4K Video Background */}
                <div className="absolute inset-0 z-0 bg-black">
                    <video 
                        autoPlay loop muted playsInline 
                        className="w-full h-full object-cover opacity-80 mix-blend-screen"
                        poster="https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=2070&auto=format&fit=crop"
                    >
                        <source src="https://assets.mixkit.co/videos/preview/mixkit-water-falling-on-fresh-vegetables-4187-large.mp4" type="video/mp4" />
                    </video>
                    
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1c0d03]/95 via-[#451a03]/80 to-transparent mix-blend-multiply" />
                    <div className={`absolute inset-0 bg-gradient-to-b lg:bg-gradient-to-r ${themeGradient} to-transparent transition-colors duration-1000`} />
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
                    
                    {weatherCond === "rain" && <div className="absolute inset-0 rain-overlay opacity-30 z-10 pointer-events-none" />}
                </div>
                
                <FluidParticles mouseX={globalMouseX} mouseY={globalMouseY} />

                {/* Spotlight Global Hover Effect */}
                <motion.div 
                    className="absolute inset-0 pointer-events-none z-30 opacity-50"
                    style={{
                        background: `radial-gradient(circle 600px at var(--x) var(--y), rgba(255,255,255,0.1), transparent 80%)`,
                        "--x": spotlightX,
                        "--y": spotlightY
                    }}
                />

                {/* Left Side: Branding */}
                <motion.div 
                    variants={fadeReveal} initial="hidden" animate="show"
                    className="relative z-10 w-full lg:w-[55%] flex flex-col justify-center px-6 pt-8 pb-4 lg:px-24 lg:py-16 h-auto lg:h-full shrink-0"
                >
                    <div className="flex items-center gap-3 mb-6 lg:mb-10 w-max">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-gradient-to-br from-[#10b981] to-[#047857] shadow-[0_4px_20px_rgba(16,185,129,0.4)] border border-white/20">
                            <Leaf className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="text-2xl lg:text-3xl font-black tracking-tight text-white leading-none drop-shadow-md">
                                Virtual<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#34d399] via-[#10b981] to-[#059669] animate-gradient-text">Mandi</span>
                            </span>
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-lg border border-white/10 rounded-full px-4 py-2 mb-4 w-max cursor-pointer hover:bg-white/20 transition-colors" onClick={() => navigate('/login')}>
                        <ArrowLeft className="h-3.5 w-3.5 text-[#fcd34d]" />
                        <span className="text-white/90 text-[10px] lg:text-xs font-black uppercase tracking-[0.2em]">Back to Login</span>
                    </div>
                    
                    <h1 className="text-[32px] sm:text-4xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight drop-shadow-xl max-w-[600px] mt-4">
                        Secure your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fcd34d] via-[#f59e0b] to-[#fbbf24] animate-gradient-text">account.</span>
                    </h1>
                    
                    <p className="mt-4 lg:mt-6 text-white/80 font-medium text-sm lg:text-base max-w-md leading-relaxed drop-shadow-md border-l-2 border-[#f59e0b] pl-4">
                        We'll help you get back into your account quickly so you can continue shopping fresh produce.
                    </p>
                </motion.div>

                {/* Right Side: 3D Tilt Card */}
                <div className="relative z-20 w-full lg:w-[45%] flex items-center justify-center px-4 pb-8 lg:p-12 h-auto lg:h-full flex-1 perspective-[1500px]">
                    <motion.div 
                        variants={slideUpSnappy} initial="hidden" animate="show"
                        ref={cardRef} onMouseMove={handleCardMouseMove} onMouseLeave={handleCardMouseLeave}
                        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                        className="w-full max-w-[420px] relative"
                    >
                        <div className="w-full bg-white/80 backdrop-blur-3xl rounded-[2rem] p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-white/40 overflow-hidden">
                            <motion.div 
                                className="absolute inset-0 pointer-events-none mix-blend-overlay z-20 opacity-50"
                                style={{ background: `radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(255,255,255,0.9) 0%, transparent 70%)`, WebkitMaskImage: "linear-gradient(white, black)" }}
                                animate={{ "--x": glareX.get(), "--y": glareY.get() }}
                            />

                            <AnimatePresence mode="wait">
                                {step === 0 && (
                                    <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="relative z-10">
                                        <div className="text-center mb-8">
                                            <div className="h-14 w-14 bg-[#fef3c7] text-[#b45309] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner border border-[#fde68a]">
                                                <Mail className="h-7 w-7" />
                                            </div>
                                            <h2 className="text-3xl font-black text-[#451a03] tracking-tight">Recover</h2>
                                            <p className="text-[#92400e] text-sm mt-2 font-semibold">Enter your email to receive a code</p>
                                        </div>

                                        <form onSubmit={handleSendResetCode} className="space-y-6">
                                            <div className={inputContainerClass}>
                                                <User className={iconClass} />
                                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="buyer@example.com" required className={inputClass} />
                                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-[#fcd34d] to-[#f59e0b] group-focus-within:w-full transition-all duration-500 ease-out" />
                                            </div>

                                            <div className="pt-2 perspective-[500px]">
                                                <motion.button
                                                    ref={btnRef} onMouseMove={handleBtnMouseMove} onMouseLeave={handleBtnMouseLeave} style={{ x: btnXSpring, y: btnYSpring }} whileTap={{ scale: 0.95 }}
                                                    type="submit" disabled={isLoading || !email}
                                                    onClick={(e) => {
                                                        const btn = e.currentTarget;
                                                        const circle = document.createElement("span");
                                                        const d = Math.max(btn.clientWidth, btn.clientHeight);
                                                        circle.style.width = circle.style.height = `${d}px`;
                                                        circle.style.left = `${e.clientX - btn.getBoundingClientRect().left - d/2}px`;
                                                        circle.style.top = `${e.clientY - btn.getBoundingClientRect().top - d/2}px`;
                                                        circle.classList.add("ripple");
                                                        if (btn.getElementsByClassName("ripple")[0]) btn.getElementsByClassName("ripple")[0].remove();
                                                        btn.appendChild(circle);
                                                    }}
                                                    className={`w-full h-[52px] rounded-xl bg-gradient-to-r from-[#d97706] to-[#b45309] text-white font-black text-base tracking-wide shadow-[0_8px_20px_rgba(217,119,6,0.4)] flex items-center justify-center overflow-hidden relative ${(!email) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                                                >
                                                    <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                                    <span className="relative z-10 flex items-center gap-2 pointer-events-none">
                                                        {isLoading ? <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <>Send Code <ArrowRight className="h-4 w-4" /></>}
                                                    </span>
                                                </motion.button>
                                            </div>
                                        </form>
                                    </motion.div>
                                )}

                                {step === 1 && (
                                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="relative z-10">
                                        <div className="text-center mb-8">
                                            <div className="h-14 w-14 bg-[#dcfce7] text-[#166534] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner border border-[#bbf7d0]">
                                                <ShieldCheck className="h-7 w-7" />
                                            </div>
                                            <h2 className="text-3xl font-black text-[#451a03] tracking-tight">Verify</h2>
                                            <p className="text-[#92400e] text-xs mt-2 font-semibold">Enter the 6-digit code sent to <br/><span className="text-[#451a03]">{email}</span></p>
                                        </div>
                                        <div className="space-y-6">
                                            <OtpInput onComplete={handleVerifyOtp} />
                                            <p className="text-center text-[11px] font-bold text-[#92400e]/70 pt-2 cursor-pointer hover:text-[#d97706]" onClick={() => setStep(0)}>
                                                Wrong Email? Try Again
                                            </p>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="relative z-10">
                                        <div className="text-center mb-8">
                                            <div className="h-14 w-14 bg-[#fef08a] text-[#a16207] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner border border-[#fde047]">
                                                <Lock className="h-7 w-7" />
                                            </div>
                                            <h2 className="text-3xl font-black text-[#451a03] tracking-tight">Secure</h2>
                                            <p className="text-[#92400e] text-sm mt-2 font-semibold">Create a strong new password</p>
                                        </div>
                                        <form onSubmit={handleResetPassword} className="space-y-4">
                                            <div className={inputContainerClass}>
                                                <Lock className={iconClass} />
                                                <input id="new-password" type="password" placeholder="New Password" required className={inputClass} />
                                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-[#fcd34d] to-[#f59e0b] group-focus-within:w-full transition-all duration-500 ease-out" />
                                            </div>
                                            <div className={inputContainerClass}>
                                                <Lock className={iconClass} />
                                                <input id="confirm-password" type="password" placeholder="Confirm Password" required className={inputClass} />
                                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-[#fcd34d] to-[#f59e0b] group-focus-within:w-full transition-all duration-500 ease-out" />
                                            </div>
                                            <div className="pt-4 perspective-[500px]">
                                                <motion.button
                                                    ref={btnRef} onMouseMove={handleBtnMouseMove} onMouseLeave={handleBtnMouseLeave} style={{ x: btnXSpring, y: btnYSpring }} whileTap={{ scale: 0.95 }}
                                                    type="submit" disabled={isLoading}
                                                    className="w-full h-[52px] rounded-xl bg-gradient-to-r from-[#d97706] to-[#b45309] text-white font-black text-base tracking-wide shadow-[0_8px_20px_rgba(217,119,6,0.4)] flex items-center justify-center relative overflow-hidden"
                                                >
                                                    <span className="relative z-10 flex items-center gap-2 pointer-events-none">
                                                        {isLoading ? <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <>Reset Password <ArrowRight className="h-4 w-4" /></>}
                                                    </span>
                                                </motion.button>
                                            </div>
                                        </form>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </div>
        </PageTransition>
    );
};

export default ForgotPassword;
