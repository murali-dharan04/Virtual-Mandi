import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff, User, Lock, Leaf, ShoppingBag, ArrowRight, ShieldCheck, Truck, Users } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useAnimationFrame } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import GoogleLoginButton from "@/components/GoogleLoginButton";
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

const socialProofs = [
    { text: "100% Organic Certified", icon: <ShieldCheck className="h-4 w-4 text-[#10b981]" /> },
    { text: "Sourced from 500+ Local Farmers", icon: <Users className="h-4 w-4 text-[#f59e0b]" /> },
    { text: "Fresh Delivery in 24 Hours", icon: <Truck className="h-4 w-4 text-[#3b82f6]" /> }
];

// Fluid Physics Particles Component
const FluidParticles = ({ mouseX, mouseY }) => {
    const numParticles = 30;
    // Generate initial random states
    const particles = useRef(
        Array.from({ length: numParticles }).map(() => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 1,
            vy: (Math.random() - 0.5) * 1 - 0.5, // Slight upward drift
            size: Math.random() * 6 + 2,
            baseX: Math.random() * window.innerWidth,
            baseY: Math.random() * window.innerHeight,
        }))
    );
    const elementsRef = useRef([]);

    useAnimationFrame(() => {
        const mx = mouseX.get();
        const my = mouseY.get();
        const repelRadius = 150;
        const repelForce = 5;

        particles.current.forEach((p, i) => {
            // Repulsion logic
            const dx = p.x - mx;
            const dy = p.y - my;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < repelRadius && dist > 0) {
                const force = (repelRadius - dist) / repelRadius;
                p.vx += (dx / dist) * force * repelForce;
                p.vy += (dy / dist) * force * repelForce;
            }

            // Apply velocity
            p.x += p.vx;
            p.y += p.vy;

            // Friction/damping
            p.vx *= 0.92;
            p.vy *= 0.92;

            // Base drift (wind/ambient)
            p.x += Math.sin(Date.now() / 2000 + p.size) * 0.5;
            p.y -= 0.5; // Float up

            // Screen wrap
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

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [proofIndex, setProofIndex] = useState(0);
    const [weatherCond, setWeatherCond] = useState("clear"); // "rain" or "clear"
    const { login } = useAuth();
    const navigate = useNavigate();

    const globalMouseX = useMotionValue(-1000);
    const globalMouseY = useMotionValue(-1000);
    const spotlightX = useTransform(globalMouseX, x => `${x}px`);
    const spotlightY = useTransform(globalMouseY, y => `${y}px`);

    // Weather Sync API
    useEffect(() => {
        const fetchWeather = async () => {
            try {
                // Using wttr.in for simple IP-based weather JSON without keys
                const res = await fetch("https://wttr.in/?format=j1");
                const data = await res.json();
                const desc = data.current_condition[0].weatherDesc[0].value.toLowerCase();
                if (desc.includes("rain") || desc.includes("shower") || desc.includes("drizzle")) {
                    setWeatherCond("rain");
                } else {
                    setWeatherCond("clear");
                }
            } catch (err) {
                console.log("Weather fetch failed, falling back to clear");
                setWeatherCond("clear");
            }
        };
        fetchWeather();
    }, []);

    // Dynamic Typing Placeholder
    const placeholders = ["buyer@example.com", "chef@restaurant.com", "family@home.com"];
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
        ? "from-[#451a03]/90 via-[#78350f]/60" 
        : "from-[#064e3b]/90 via-[#0f766e]/60";

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) { toast.error("All fields are required"); return; }
        setLoading(true);
        try {
            await login(email, password);
            toast.success("Welcome back to Virtual Mandi!");
            navigate("/"); 
        } catch {
            toast.error("Invalid credentials. Please try again.");
        } finally {
            setLoading(false);
        }
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
                
                /* Weather Overlay Animations */
                .rain-overlay {
                    background-image: url('data:image/svg+xml;utf8,<svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><line x1="10" y1="5" x2="5" y2="25" stroke="rgba(255,255,255,0.35)" stroke-width="1.5" stroke-linecap="round" /><line x1="45" y1="20" x2="40" y2="40" stroke="rgba(255,255,255,0.35)" stroke-width="1.5" stroke-linecap="round" /><line x1="25" y1="50" x2="20" y2="70" stroke="rgba(255,255,255,0.35)" stroke-width="1.5" stroke-linecap="round" /><line x1="65" y1="45" x2="60" y2="65" stroke="rgba(255,255,255,0.35)" stroke-width="1.5" stroke-linecap="round" /></svg>');
                    background-size: 80px 80px;
                    animation: rain 0.6s linear infinite;
                }
                @keyframes rain {
                    0% { background-position: 0px 0px; }
                    100% { background-position: -40px 80px; }
                }
            `}</style>

            <div 
                className="min-h-screen lg:h-screen font-poppins relative flex flex-col lg:flex-row overflow-hidden bg-[#1a0f08] selection:bg-[#f59e0b]/30"
                onMouseMove={handleGlobalMouseMove}
            >
                {/* Slow-Motion 4K Video Background */}
                <div className="absolute inset-0 z-0 bg-black">
                    <video 
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                        className="w-full h-full object-cover opacity-80 mix-blend-screen"
                        poster="https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=2070&auto=format&fit=crop"
                    >
                        <source src="https://assets.mixkit.co/videos/preview/mixkit-water-falling-on-fresh-vegetables-4187-large.mp4" type="video/mp4" />
                    </video>
                    
                    {/* Gradients to blend video perfectly */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1c0d03]/95 via-[#451a03]/80 to-transparent mix-blend-multiply" />
                    <div className={`absolute inset-0 bg-gradient-to-b lg:bg-gradient-to-r ${themeGradient} to-transparent transition-colors duration-1000`} />
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
                    
                    {/* Weather Sync CSS Overlay */}
                    {weatherCond === "rain" && (
                        <div className="absolute inset-0 rain-overlay opacity-30 z-10 pointer-events-none" />
                    )}
                </div>
                
                {/* Fluid Physics Particles */}
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

                {/* Left Side: Welcome Branding */}
                <motion.div 
                    variants={fadeReveal}
                    initial="hidden"
                    animate="show"
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

                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-lg border border-white/10 rounded-full px-4 py-2 mb-4 lg:mb-8 w-max">
                        <ShoppingBag className="h-3.5 w-3.5 text-[#fcd34d]" />
                        <span className="text-white/90 text-[10px] lg:text-xs font-black uppercase tracking-[0.2em]">Farm Fresh Produce</span>
                    </div>
                    
                    <h1 className="text-[32px] sm:text-4xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight drop-shadow-xl max-w-[600px]">
                        Fresh harvest, delivered right to your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fcd34d] via-[#f59e0b] to-[#fbbf24] animate-gradient-text">door.</span>
                    </h1>
                    
                    <p className="mt-4 lg:mt-6 text-white/80 font-medium text-sm lg:text-base max-w-md leading-relaxed drop-shadow-md border-l-2 border-[#f59e0b] pl-4">
                        Skip the middleman. Buy organic vegetables and fruits directly from Indian farmers at fair prices.
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
                        variants={slideUpSnappy}
                        initial="hidden"
                        animate="show"
                        ref={cardRef}
                        onMouseMove={handleCardMouseMove}
                        onMouseLeave={handleCardMouseLeave}
                        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                        className="w-full max-w-[420px] relative"
                    >
                        <div className="w-full bg-white/80 backdrop-blur-3xl rounded-[2rem] p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-white/40 overflow-hidden">
                            <motion.div 
                                className="absolute inset-0 pointer-events-none mix-blend-overlay z-20 opacity-50"
                                style={{
                                    background: `radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(255,255,255,0.9) 0%, transparent 70%)`,
                                    WebkitMaskImage: "linear-gradient(white, black)"
                                }}
                                animate={{ "--x": glareX.get(), "--y": glareY.get() }}
                            />

                            <div className="text-center mb-6 relative z-10">
                                <h2 className="text-3xl font-black text-[#451a03] tracking-tight">Welcome Back</h2>
                                <p className="text-[#92400e] text-sm mt-2 font-semibold">Login to your account to shop</p>
                            </div>

                            {/* Required legend */}
                            <div className="flex items-center justify-end gap-1.5 mb-2 relative z-10">
                                <span className="inline-flex items-center gap-1 bg-red-50 border border-red-200 rounded-full px-2.5 py-1">
                                    <span className="text-red-500 font-black text-sm leading-none">✱</span>
                                    <span className="text-[10px] font-extrabold text-red-500 uppercase tracking-wide">Required</span>
                                </span>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                                <div className="space-y-1">
                                    <label className="flex items-center gap-1.5 text-[12.5px] font-extrabold text-[#451a03] ml-1">
                                        Email Address <span className="text-red-500 text-[18px] font-black leading-none relative -top-0.5">*</span>
                                    </label>
                                    <div className={inputContainerClass}>
                                        <User className={iconClass} />
                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={placeholderText} required className={inputClass} />
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-[#fcd34d] to-[#f59e0b] group-focus-within:w-full transition-all duration-500 ease-out" />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="flex items-center gap-1.5 text-[12.5px] font-extrabold text-[#451a03] ml-1">
                                        Password <span className="text-red-500 text-[18px] font-black leading-none relative -top-0.5">*</span>
                                    </label>
                                    <div className={inputContainerClass}>
                                        <Lock className={iconClass} />
                                        <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className={inputClass} />
                                        <button type="button" onClick={() => setShowPw(!showPw)} className="ml-2 text-[#b45309]/50 hover:text-[#d97706] shrink-0 transition-colors z-10">
                                            {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-[#fcd34d] to-[#f59e0b] group-focus-within:w-full transition-all duration-500 ease-out" />
                                    </div>
                                </div>

                                <div className="flex justify-between items-center px-1 pt-1 pb-2">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <div className="relative flex items-center justify-center">
                                            <input type="checkbox" className="peer w-4 h-4 appearance-none rounded border-2 border-[#b45309]/30 checked:border-[#d97706] checked:bg-[#d97706] transition-all cursor-pointer bg-white" />
                                            <svg className="absolute w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        </div>
                                        <span className="text-[11px] font-bold text-[#b45309]/80 group-hover:text-[#92400e] transition-colors">Remember Me</span>
                                    </label>
                                    <Link to="/forgot-password" className="text-[11px] font-black text-[#d97706] hover:text-[#92400e] hover:underline underline-offset-4 transition-all">
                                        Forgot Password?
                                    </Link>
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
                                        className={`w-full h-[52px] rounded-xl bg-gradient-to-r from-[#d97706] to-[#b45309] text-white font-black text-base tracking-wide shadow-[0_8px_20px_rgba(217,119,6,0.4)] flex items-center justify-center overflow-hidden relative ${(!email || !password) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                        <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                        <span className="relative z-10 flex items-center gap-2 pointer-events-none">
                                            {loading ? <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <>Sign In <ArrowRight className="h-4 w-4" /></>}
                                        </span>
                                    </motion.button>
                                </div>

                                <p className="text-center text-[11px] font-bold text-[#b45309]/70 pt-3">
                                    New to Virtual Mandi? <Link to="/register" className="font-black text-[#d97706] hover:text-[#92400e] hover:underline underline-offset-4">Create an account</Link>
                                </p>

                                <div className="flex items-center justify-center gap-3 mt-5 relative z-10">
                                    <div className="h-[1px] bg-gradient-to-r from-transparent via-[#b45309]/20 to-transparent w-full" />
                                    <span className="text-[9px] uppercase font-black tracking-widest text-[#b45309]/50 whitespace-nowrap">Or connect with</span>
                                    <div className="h-[1px] bg-gradient-to-r from-transparent via-[#b45309]/20 to-transparent w-full" />
                                </div>
                                <div className="flex justify-center pt-1 pb-1 relative z-10">
                                    <div className="w-full hover:opacity-90 transition-opacity"><GoogleLoginButton onError={(msg) => toast.error(msg)} /></div>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </div>
        </PageTransition>
    );
};

export default Login;
