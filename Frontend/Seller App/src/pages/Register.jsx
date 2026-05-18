import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, User, Mail, Lock, Leaf, Tractor, Phone, MapPin, Compass, ArrowRight, ArrowLeft, ChevronDown } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useAnimationFrame } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import { sellerApi } from "@/lib/api";
import { toast } from "sonner";
import { indiaStatesDistricts } from "@/data/indiaStatesDistricts";

const fadeReveal = {
    hidden: { opacity: 0, filter: "blur(10px)", y: 10 },
    show: { opacity: 1, filter: "blur(0px)", y: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

const slideUpSnappy = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }
};

// Fluid Particles Component (Warm pollen particles for Seller)
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
    const elementsRef = useRef([]);

    useAnimationFrame(() => {
        const mx = mouseX.get();
        const my = mouseY.get();
        const repelRadius = 160;
        const repelForce = 6;

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
            p.y -= 0.6;

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
                    className="absolute rounded-full bg-[#fbbf24]/50 mix-blend-screen blur-[3px]"
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

const CustomDropdown = ({ value, onChange, options, placeholder, icon: Icon, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const inputContainerClass = "flex items-center w-full h-[50px] rounded-xl bg-white/60 backdrop-blur-md px-4 transition-all duration-300 border border-white/50 group relative overflow-hidden";
    
    return (
        <div className="relative w-full" ref={dropdownRef}>
            <div 
                className={`${inputContainerClass} ${isOpen ? 'bg-white shadow-[0_4px_25px_rgba(74,222,128,0.25)] border-[#4ade80]/60' : 'hover:bg-white/80'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <Icon className={`h-5 w-5 ${isOpen ? 'text-[#15803d] scale-110' : 'text-[#166534]/50'} transition-all duration-300 z-10`} />
                <span className={`flex-1 ml-3 text-sm z-10 font-semibold truncate ${value ? 'text-[#14532d]' : 'text-[#166534]/50'}`}>
                    {value || placeholder}
                </span>
                <ChevronDown className={`absolute right-4 h-4 w-4 text-[#166534]/50 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} pointer-events-none z-10`} />
            </div>
            
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-green-100 overflow-hidden z-[100] max-h-[220px] overflow-y-auto"
                    >
                        {options.map((opt) => (
                            <div
                                key={opt}
                                className={`px-4 py-2.5 text-sm font-semibold cursor-pointer hover:bg-green-50 transition-colors ${value === opt ? 'bg-green-100 text-green-800' : 'text-[#14532d]'}`}
                                onClick={() => {
                                    onChange(opt);
                                    setIsOpen(false);
                                }}
                            >
                                {opt}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Register = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0); 

    // Form inputs
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [location, setLocation] = useState("");
    const [mobile, setMobile] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [state, setState] = useState("");
    const [district, setDistrict] = useState("");
    
    const availableDistricts = state ? indiaStatesDistricts[state] || [] : [];

    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [weatherCond, setWeatherCond] = useState("clear");

    const globalMouseX = useMotionValue(-1000);
    const globalMouseY = useMotionValue(-1000);
    const spotlightX = useTransform(globalMouseX, x => `${x}px`);
    const spotlightY = useTransform(globalMouseY, y => `${y}px`);

    useEffect(() => {
        setMounted(true);
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

    // 3D Tilt Logic
    const cardRef = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
    const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"]);
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

    const handleNextStep = (e) => {
        e.preventDefault();
        if (!name || !email || !password || !mobile) {
            toast.error("All fields are required");
            return;
        }
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        if (!/^[6-9]\d{9}$/.test(mobile)) {
            toast.error("Enter a valid 10-digit Indian mobile number");
            return;
        }
        setStep(1);
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        if (!location || !mobile || !district || !state) {
            toast.error("Please fill in all regional/profile fields");
            return;
        }

        setLoading(true);
        try {
            const res = await sellerApi.register(name, email, password, location, {
                mobile,
                whatsapp: whatsapp || mobile,
                district,
                state,
                lat: 19.9975, // default Nashik fallback region coordinates
                lon: 73.7898
            });

            if (res.access_token || res.user) {
                toast.success("Grower account created successfully!");
                navigate("/dashboard");
            } else {
                toast.error(res.error || "Failed to create account. Please try again.");
            }
        } catch (err) {
            toast.error("Failed to connect to backend server.");
        } finally {
            setLoading(false);
        }
    };

    const inputContainerClass = "flex items-center w-full h-[50px] rounded-xl bg-white/60 backdrop-blur-md px-4 transition-all duration-300 focus-within:bg-white focus-within:shadow-[0_4px_25px_rgba(74,222,128,0.25)] border border-white/50 focus-within:border-[#4ade80]/60 group relative overflow-hidden";
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

                {/* Spotlight Global Hover Effect */}
                <motion.div 
                    className="absolute inset-0 pointer-events-none z-30 opacity-60"
                    style={{
                        background: `radial-gradient(circle 500px at var(--x) var(--y), rgba(251,191,36,0.15), transparent 80%)`,
                        "--x": spotlightX,
                        "--y": spotlightY
                    }}
                />

                {/* Left Side: Branding */}
                <motion.div 
                    variants={fadeReveal} initial="hidden" animate="show"
                    className="relative z-10 w-full lg:w-[50%] flex flex-col justify-center px-6 pt-8 pb-4 lg:px-20 lg:py-16 h-auto lg:h-full shrink-0"
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

                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-lg border border-white/10 rounded-full px-4 py-2 mb-4 w-max">
                        <Leaf className="h-3.5 w-3.5 text-[#86efac]" />
                        <span className="text-white/90 text-[10px] lg:text-xs font-black uppercase tracking-[0.2em]">Seller Console Registration</span>
                    </div>
                    
                    <h1 className="text-[32px] sm:text-4xl lg:text-5xl font-black text-white leading-[1.1] tracking-tight drop-shadow-xl max-w-[500px]">
                        Grow your business, directly from your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#86efac] via-[#4ade80] to-[#22c55e] animate-gradient-text">farm.</span>
                    </h1>
                    
                    <p className="mt-4 lg:mt-6 text-white/80 font-medium text-sm lg:text-base max-w-md leading-relaxed drop-shadow-md border-l-2 border-[#4ade80] pl-4">
                        Join our network of 10,000+ local producers. Receive priority pricing alerts, list your produce in 3 clicks, and get instant digital wallet payouts.
                    </p>
                </motion.div>

                {/* Right Side: 3D Tilt Card */}
                <div className="relative z-20 w-full lg:w-[50%] flex items-center justify-center px-4 pb-8 lg:p-12 h-auto lg:h-full flex-1 perspective-[1500px] overflow-y-auto">
                    <motion.div 
                        variants={slideUpSnappy} initial="hidden" animate="show"
                        ref={cardRef} onMouseMove={handleCardMouseMove} onMouseLeave={handleCardMouseLeave}
                        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                        className="w-full max-w-[440px] relative my-auto py-6"
                    >
                        <div className="w-full bg-white/80 backdrop-blur-3xl rounded-[2rem] p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-white/40 overflow-hidden">
                            <motion.div 
                                className="absolute inset-0 pointer-events-none mix-blend-overlay z-20 opacity-50"
                                style={{ background: `radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(255,255,255,0.9) 0%, transparent 70%)`, WebkitMaskImage: "linear-gradient(white, black)" }}
                                animate={{ "--x": glareX.get(), "--y": glareY.get() }}
                            />

                            <div className="text-center mb-6 relative z-10">
                                <h2 className="text-3xl font-black text-[#14532d] tracking-tight">Register</h2>
                                <p className="text-[#166534] text-xs mt-1.5 font-semibold">Join Virtual Mandi as a verified grower</p>
                            </div>

                            {/* Required legend */}
                            <div className="flex items-center justify-end gap-1.5 mb-3 relative z-10">
                                <span className="inline-flex items-center gap-1 bg-red-50 border border-red-200 rounded-full px-2.5 py-1">
                                    <span className="text-red-500 font-black text-sm leading-none">✱</span>
                                    <span className="text-[10px] font-extrabold text-red-500 uppercase tracking-wide">Required</span>
                                </span>
                            </div>

                            <AnimatePresence mode="wait">
                                {step === 0 ? (
                                    <motion.form 
                                        key="step0" onSubmit={handleNextStep}
                                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                        className="space-y-3 relative z-10"
                                    >
                                        <div className="space-y-1">
                                            <label className="flex items-center gap-1.5 text-[12.5px] font-extrabold text-[#14532d] ml-1">
                                                Full Name
                                                <span className="text-red-500 text-[18px] font-black leading-none relative -top-0.5">*</span>
                                            </label>
                                            <div className={inputContainerClass}>
                                                <User className={iconClass} />
                                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" required className={inputClass} />
                                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-[#86efac] to-[#22c55e] group-focus-within:w-full transition-all duration-500 ease-out" />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="flex items-center gap-1.5 text-[12.5px] font-extrabold text-[#14532d] ml-1">
                                                Email Address
                                                <span className="text-red-500 text-[18px] font-black leading-none relative -top-0.5">*</span>
                                            </label>
                                            <div className={inputContainerClass}>
                                                <Mail className={iconClass} />
                                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="farmer@harvest.com" required className={inputClass} />
                                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-[#86efac] to-[#22c55e] group-focus-within:w-full transition-all duration-500 ease-out" />
                                            </div>
                                        </div>

                                        {/* Mobile Number Field */}
                                        <div className="space-y-1">
                                            <label className="flex items-center gap-1.5 text-[12.5px] font-extrabold text-[#14532d] ml-1">
                                                Mobile Number
                                                <span className="text-red-500 text-[18px] font-black leading-none relative -top-0.5">*</span>
                                            </label>
                                            <div className={inputContainerClass}>
                                                <Phone className={iconClass} />
                                                <span className="text-[#166534]/60 font-bold text-sm z-10 mr-1 select-none">+91</span>
                                                <input
                                                    type="tel"
                                                    value={mobile}
                                                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                                    placeholder="Mobile Number"
                                                    required
                                                    maxLength={10}
                                                    className={inputClass}
                                                />
                                                {mobile.length === 10 && /^[6-9]\d{9}$/.test(mobile) && (
                                                    <svg className="h-4 w-4 text-[#16a34a] shrink-0 z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                                                )}
                                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-[#86efac] to-[#22c55e] group-focus-within:w-full transition-all duration-500 ease-out" />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="flex items-center gap-1.5 text-[12.5px] font-extrabold text-[#14532d] ml-1">
                                                Password
                                                <span className="text-red-500 text-[18px] font-black leading-none relative -top-0.5">*</span>
                                            </label>
                                            <div className={inputContainerClass}>
                                                <Lock className={iconClass} />
                                                <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 6 chars)" required className={inputClass} />
                                                <button type="button" onClick={() => setShowPw(!showPw)} className="ml-2 text-[#166534]/50 hover:text-[#15803d] shrink-0 transition-colors z-10">
                                                    {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                </button>
                                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-[#86efac] to-[#22c55e] group-focus-within:w-full transition-all duration-500 ease-out" />
                                            </div>
                                        </div>

                                        <div className="pt-1 perspective-[500px]">
                                            <motion.button
                                                ref={btnRef} onMouseMove={handleBtnMouseMove} onMouseLeave={handleBtnMouseLeave} style={{ x: btnXSpring, y: btnYSpring }} whileTap={{ scale: 0.95 }}
                                                type="submit" disabled={!name || !email || !password || !mobile}
                                                className={`w-full h-[52px] rounded-xl bg-gradient-to-r from-[#16a34a] to-[#15803d] text-white font-black text-base tracking-wide shadow-[0_8px_20px_rgba(22,163,74,0.4)] flex items-center justify-center overflow-hidden relative ${(!name || !email || !password || !mobile) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                                            >
                                                <span className="relative z-10 flex items-center gap-2 pointer-events-none">
                                                    Continue <ArrowRight className="h-4 w-4" />
                                                </span>
                                            </motion.button>
                                        </div>

                                        <p className="text-center text-[11px] font-bold text-[#166534]/70 pt-1">
                                            Already have an account? <Link to="/auth/login" className="font-black text-[#15803d] hover:text-[#14532d] hover:underline underline-offset-4">Sign in</Link>
                                        </p>
                                    </motion.form>
                                ) : (
                                    <motion.form 
                                        key="step1" onSubmit={handleRegisterSubmit}
                                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                        className="space-y-3 relative z-10"
                                    >
                                        <div className="space-y-1">
                                            <label className="flex items-center gap-1.5 text-[12.5px] font-extrabold text-[#14532d] ml-1">
                                                Farm Address
                                                <span className="text-red-500 text-[18px] font-black leading-none relative -top-0.5">*</span>
                                            </label>
                                            <div className={inputContainerClass}>
                                                <MapPin className={iconClass} />
                                                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Full Farm Address / Location" required className={inputClass} />
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <div className="space-y-1 w-1/2">
                                                <label className="flex items-center gap-1.5 text-[12.5px] font-extrabold text-[#14532d] ml-1">
                                                    State
                                                    <span className="text-red-500 text-[18px] font-black leading-none relative -top-0.5">*</span>
                                                </label>
                                                <CustomDropdown
                                                    value={state}
                                                    onChange={(val) => { setState(val); setDistrict(""); }}
                                                    options={Object.keys(indiaStatesDistricts)}
                                                    placeholder="Select State"
                                                    icon={Compass}
                                                />
                                            </div>
                                            <div className="space-y-1 w-1/2">
                                                <label className="flex items-center gap-1.5 text-[12.5px] font-extrabold text-[#14532d] ml-1">
                                                    District
                                                    <span className="text-red-500 text-[18px] font-black leading-none relative -top-0.5">*</span>
                                                </label>
                                                <CustomDropdown
                                                    value={district}
                                                    onChange={(val) => setDistrict(val)}
                                                    options={availableDistricts}
                                                    placeholder="Select District"
                                                    icon={MapPin}
                                                    disabled={!state}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="flex items-center gap-1.5 text-[12.5px] font-extrabold text-[#14532d] ml-1">
                                                Mobile
                                                <span className="inline-flex items-center gap-1 bg-green-100 border border-green-300 rounded-full px-2 py-0.5">
                                                    <span className="text-[9px] font-extrabold text-green-600 uppercase tracking-wide">✓ Verified</span>
                                                </span>
                                            </label>
                                            <div className={inputContainerClass}>
                                                <Phone className={iconClass} />
                                                <span className="text-[#166534]/60 font-bold text-sm z-10 mr-1 select-none">+91</span>
                                                <input type="tel" value={mobile} readOnly placeholder="Mobile Number" className={`${inputClass} opacity-70 cursor-default`} />
                                                <svg className="h-4 w-4 text-[#16a34a] shrink-0 z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="flex items-center gap-1.5 text-[12.5px] font-extrabold text-[#14532d] ml-1">
                                                WhatsApp
                                                <span className="text-[10px] font-semibold text-[#166534]/40">(optional)</span>
                                            </label>
                                            <div className={inputContainerClass}>
                                                <Phone className={iconClass} />
                                                <input type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="WhatsApp Number (Optional)" className={inputClass} />
                                            </div>
                                        </div>

                                        <div className="flex gap-2 pt-1 perspective-[500px]">
                                            <button
                                                type="button" onClick={() => setStep(0)}
                                                className="w-1/3 h-[52px] rounded-xl bg-white/50 text-[#166534] font-black border border-white/60 hover:bg-white transition-all flex items-center justify-center gap-1.5"
                                            >
                                                <ArrowLeft className="h-4 w-4" /> Back
                                            </button>
                                            <motion.button
                                                ref={btnRef} onMouseMove={handleBtnMouseMove} onMouseLeave={handleBtnMouseLeave} style={{ x: btnXSpring, y: btnYSpring }} whileTap={{ scale: 0.95 }}
                                                type="submit" disabled={loading || !location || !mobile || !district || !state}
                                                className={`w-2/3 h-[52px] rounded-xl bg-gradient-to-r from-[#16a34a] to-[#15803d] text-white font-black text-base tracking-wide shadow-[0_8px_20px_rgba(22,163,74,0.4)] flex items-center justify-center overflow-hidden relative ${(!location || !mobile || !district || !state) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                                            >
                                                <span className="relative z-10 flex items-center gap-2 pointer-events-none">
                                                    {loading ? <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <>Register <ArrowRight className="h-4 w-4" /></>}
                                                </span>
                                            </motion.button>
                                        </div>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </div>
        </PageTransition>
    );
};

export default Register;
