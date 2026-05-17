import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, User, Lock, Leaf, Tractor, Banknote, Users, ArrowRight } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useAnimationFrame } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import { sellerApi } from "@/lib/api";
import { toast } from "sonner";

const fadeReveal = {
    hidden: { opacity: 0, filter: "blur(10px)", y: 10 },
    show: { opacity: 1, filter: "blur(0px)", y: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

const slideUpSnappy = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }
};

const socialProofs = [
    { text: "Reach 10,000+ Direct Buyers", icon: <Users className="h-4 w-4 text-[#4ade80]" /> },
    { text: "0% Commission on First 10 Sales", icon: <Banknote className="h-4 w-4 text-[#fbbf24]" /> },
    { text: "Seamless Logistics & Transport", icon: <Tractor className="h-4 w-4 text-[#60a5fa]" /> }
];

// Fluid Physics Particles Component (Warm Golden)
const FluidParticles = ({ mouseX, mouseY }) => {
    const numParticles = 30;
    const particles = useRef(
        Array.from({ length: numParticles }).map(() => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 1,
            vy: (Math.random() - 0.5) * 1 - 0.5,
            size: Math.random() * 8 + 3,
        }))
    );

    const [renders, setRenders] = useState(0);

    useAnimationFrame(() => {
        const mx = mouseX.get();
        const my = mouseY.get();
        const repelRadius = 160;
        const repelForce = 6;

        particles.current.forEach(p => {
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
            p.y -= 0.6; // slightly faster drift for pollen

            if (p.x < 0) p.x = window.innerWidth;
            if (p.x > window.innerWidth) p.x = 0;
            if (p.y < 0) p.y = window.innerHeight;
            if (p.y > window.innerHeight) p.y = 0;
        });
        setRenders(r => r + 1);
    });

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {particles.current.map((p, i) => (
                <div
                    key={i}
                    className="absolute rounded-full bg-[#fbbf24]/50 mix-blend-screen blur-[3px] transition-transform duration-0"
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

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [proofIndex, setProofIndex] = useState(0);
    const [weatherCond, setWeatherCond] = useState("clear"); 
    const navigate = useNavigate();

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
    }, []);

    // Dynamic Typing Placeholder
    const placeholders = ["ramesh@punjab.farm", "kisan@agro.in", "grower@harvest.com"];
    const [placeholderText, setPlaceholderText] = useState("");
    const [phIndex, setPhIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        setMounted(true);
        const proofTimer = setInterval(() => setProofIndex((prev) => (prev + 1) % socialProofs.length), 4000);
        return () => clearInterval(proofTimer);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        const currentWord = placeholders[phIndex];
        let timeout;
        if (isDeleting) {
            timeout = setTimeout(() => {
                setPlaceholderText(currentWord.substring(0, placeholderText.length - 1));
                if (placeholderText.length === 0) {
                    setIsDeleting(false);
                    setPhIndex((prev) => (prev + 1) % placeholders.length);
                }
            }, 50);
        } else {
            timeout = setTimeout(() => {
                setPlaceholderText(currentWord.substring(0, placeholderText.length + 1));
                if (placeholderText.length === currentWord.length) {
                    setTimeout(() => setIsDeleting(true), 2500);
                }
            }, 80);
        }
        return () => clearTimeout(timeout);
    }, [placeholderText, isDeleting, phIndex, mounted]);

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
        ? "from-[#1a3622]/95 via-[#2b5936]/70"
        : "from-[#0f3b21]/95 via-[#1b5e33]/70";

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) { toast.error("All fields are required"); return; }
        setLoading(true);
        try {
            const res = await sellerApi.login(email, password);
            if (res.access_token || res.user) {
                toast.success("Welcome back, Farmer!");
                navigate("/dashboard");
            } else {
                toast.error(res.error || "Invalid credentials. Please try again.");
            }
        } catch (err) {
            toast.error("Failed to connect. Please check your internet.");
        } finally {
            setLoading(false);
        }
    };

    const inputContainerClass = "flex items-center w-full h-[54px] rounded-xl bg-white/60 backdrop-blur-md px-4 transition-all duration-300 focus-within:bg-white focus-within:shadow-[0_4px_25px_rgba(74,222,128,0.25)] border border-white/50 focus-within:border-[#4ade80]/60 group relative overflow-hidden";
    const inputClass = "flex-1 bg-transparent border-none text-[#14532d] placeholder:text-[#166534]/50 font-semibold outline-none ml-3 text-sm z-10";
    const iconClass = "h-5 w-5 text-[#166534]/50 group-focus-within:text-[#15803d] group-focus-within:scale-110 transition-all duration-300 z-10";

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
                
                /* Weather Overlay Animations */
                .rain-overlay {
                    background-image: url('data:image/svg+xml;utf8,<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><line x1="10" y1="0" x2="10" y2="10" stroke="rgba(255,255,255,0.4)" stroke-width="1" stroke-linecap="round" /></svg>');
                    background-size: 30px 40px;
                    animation: rain 0.8s linear infinite;
                }
                @keyframes rain { 0% { background-position: 0% 0%; } 100% { background-position: 20% 100%; } }
            `}</style>

            <div 
                className="min-h-screen lg:h-screen font-poppins relative flex flex-col lg:flex-row overflow-hidden bg-[#0d1c13] selection:bg-[#4ade80]/30"
                onMouseMove={handleGlobalMouseMove}
            >
                {/* Slow-Motion 4K Video Background */}
                <div className="absolute inset-0 z-0 bg-black">
                    <video 
                        autoPlay loop muted playsInline 
                        className="w-full h-full object-cover opacity-80 mix-blend-screen"
                        poster="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2064&auto=format&fit=crop"
                    >
                        <source src="https://assets.mixkit.co/videos/preview/mixkit-wheat-field-illuminated-by-the-sun-4131-large.mp4" type="video/mp4" />
                    </video>
                    
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0a1710]/95 via-[#14532d]/80 to-transparent mix-blend-multiply" />
                    <div className={`absolute inset-0 bg-gradient-to-b lg:bg-gradient-to-r ${themeGradient} to-transparent transition-colors duration-1000`} />
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
                    
                    {weatherCond === "rain" && <div className="absolute inset-0 rain-overlay opacity-30 z-10 pointer-events-none" />}
                </div>
                
                <FluidParticles mouseX={globalMouseX} mouseY={globalMouseY} />

                {/* Spotlight Global Hover Effect (Lantern Mode) */}
                <motion.div 
                    className="absolute inset-0 pointer-events-none z-30 opacity-60"
                    style={{
                        background: `radial-gradient(circle 500px at var(--x) var(--y), rgba(251,191,36,0.15), transparent 80%)`, // Golden lantern glow
                        "--x": spotlightX,
                        "--y": spotlightY
                    }}
                />

                {/* Left Side: Welcome Branding */}
                <motion.div 
                    variants={fadeReveal} initial="hidden" animate="show"
                    className="relative z-10 w-full lg:w-[55%] flex flex-col justify-center px-6 pt-8 pb-4 lg:px-24 lg:py-16 h-auto lg:h-full shrink-0"
                >
                    <div className="flex items-center gap-3 mb-6 lg:mb-10 w-max">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-gradient-to-br from-[#4ade80] to-[#15803d] shadow-[0_4px_20px_rgba(74,222,128,0.4)] border border-white/20">
                            <Tractor className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="text-2xl lg:text-3xl font-black tracking-tight text-white leading-none drop-shadow-md">
                                Virtual<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#86efac] via-[#4ade80] to-[#22c55e] animate-gradient-text">Mandi</span>
                            </span>
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-lg border border-white/10 rounded-full px-4 py-2 mb-4 lg:mb-8 w-max">
                        <Leaf className="h-3.5 w-3.5 text-[#86efac]" />
                        <span className="text-white/90 text-[10px] lg:text-xs font-black uppercase tracking-[0.2em]">Seller Console</span>
                    </div>
                    
                    <h1 className="text-[32px] sm:text-4xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight drop-shadow-xl max-w-[600px]">
                        The best platform for your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#86efac] via-[#4ade80] to-[#22c55e] animate-gradient-text">farm.</span>
                    </h1>
                    
                    <p className="mt-4 lg:mt-6 text-white/80 font-medium text-sm lg:text-base max-w-md leading-relaxed drop-shadow-md border-l-2 border-[#4ade80] pl-4">
                        Sell your organic produce directly to thousands of consumers. Get better prices, instant payouts, and full control.
                    </p>

                    <div className="hidden lg:block mt-12 h-[40px] relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={proofIndex}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.5 }}
                                className="absolute flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-5 py-3 w-max shadow-lg"
                            >
                                <div className="bg-white/10 p-1.5 rounded-md">
                                    {socialProofs[proofIndex].icon}
                                </div>
                                <span className="text-white/90 font-bold tracking-wide text-sm">
                                    {socialProofs[proofIndex].text}
                                </span>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Right Side: 3D Tilt Login Card */}
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

                            <div className="text-center mb-6 relative z-10">
                                <h2 className="text-3xl font-black text-[#14532d] tracking-tight">Welcome Back</h2>
                                <p className="text-[#166534] text-sm mt-2 font-semibold">Securely access your farmer console</p>
                            </div>

                            {/* Required legend */}
                            <div className="flex items-center justify-end gap-1.5 mb-2 relative z-10">
                                <span className="inline-flex items-center gap-1 bg-red-50 border border-red-200 rounded-full px-2.5 py-1">
                                    <span className="text-red-500 font-black text-sm leading-none">✱</span>
                                    <span className="text-[10px] font-extrabold text-red-500 uppercase tracking-wide">Required</span>
                                </span>
                            </div>

                            <form onSubmit={handleEmailLogin} className="space-y-4 relative z-10">
                                <div className="space-y-1">
                                    <label className="flex items-center gap-1.5 text-[12.5px] font-extrabold text-[#14532d] ml-1">
                                        Email Address <span className="text-red-500 text-[18px] font-black leading-none relative -top-0.5">*</span>
                                    </label>
                                    <div className={inputContainerClass}>
                                        <User className={iconClass} />
                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={placeholderText} required className={inputClass} />
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-[#86efac] to-[#22c55e] group-focus-within:w-full transition-all duration-500 ease-out" />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="flex items-center gap-1.5 text-[12.5px] font-extrabold text-[#14532d] ml-1">
                                        Password <span className="text-red-500 text-[18px] font-black leading-none relative -top-0.5">*</span>
                                    </label>
                                    <div className={inputContainerClass}>
                                        <Lock className={iconClass} />
                                        <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className={inputClass} />
                                        <button type="button" onClick={() => setShowPw(!showPw)} className="ml-2 text-[#166534]/50 hover:text-[#15803d] shrink-0 transition-colors z-10">
                                            {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-[#86efac] to-[#22c55e] group-focus-within:w-full transition-all duration-500 ease-out" />
                                    </div>
                                </div>

                                <div className="flex justify-between items-center px-1 pt-1 pb-2">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <div className="relative flex items-center justify-center">
                                            <input type="checkbox" className="peer w-4 h-4 appearance-none rounded border-2 border-[#166534]/30 checked:border-[#15803d] checked:bg-[#15803d] transition-all cursor-pointer bg-white" />
                                            <svg className="absolute w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        </div>
                                        <span className="text-[11px] font-bold text-[#166534]/80 group-hover:text-[#14532d] transition-colors">Remember Me</span>
                                    </label>
                                    <button type="button" onClick={() => navigate('/auth/forgot-password')} className="text-[11px] font-black text-[#15803d] hover:text-[#14532d] hover:underline underline-offset-4 transition-all">
                                        Forgot Password?
                                    </button>
                                </div>

                                <div className="pt-1 perspective-[500px]">
                                    <motion.button
                                        ref={btnRef} onMouseMove={handleBtnMouseMove} onMouseLeave={handleBtnMouseLeave} style={{ x: btnXSpring, y: btnYSpring }} whileTap={{ scale: 0.95 }}
                                        type="submit" disabled={loading || !email || !password}
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
                                        className={`w-full h-[52px] rounded-xl bg-gradient-to-r from-[#16a34a] to-[#15803d] text-white font-black text-base tracking-wide shadow-[0_8px_20px_rgba(22,163,74,0.4)] flex items-center justify-center overflow-hidden relative ${(!email || !password) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                        <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                        <span className="relative z-10 flex items-center gap-2 pointer-events-none">
                                            {loading ? <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <>Sign In <ArrowRight className="h-4 w-4" /></>}
                                        </span>
                                    </motion.button>
                                </div>

                                <div className="flex items-center justify-center gap-3 mt-5 relative z-10">
                                    <div className="h-[1px] bg-gradient-to-r from-transparent via-[#15803d]/20 to-transparent w-full" />
                                    <span className="text-[9px] uppercase font-black tracking-widest text-[#15803d]/50 whitespace-nowrap">Or connect with</span>
                                    <div className="h-[1px] bg-gradient-to-r from-transparent via-[#15803d]/20 to-transparent w-full" />
                                </div>
                                <div className="flex justify-center pt-1 pb-1 relative z-10">
                                    <div className="w-full hover:opacity-90 transition-opacity"><GoogleLoginButton onError={(msg) => toast.error(msg)} /></div>
                                </div>
                                <p className="text-center text-[11px] font-bold text-[#166534]/70 pt-3 relative z-10">
                                    New to Virtual Mandi? <Link to="/auth/register" className="font-black text-[#15803d] hover:text-[#14532d] hover:underline underline-offset-4">Create an account</Link>
                                </p>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </div>
        </PageTransition>
    );
};

export default Login;
