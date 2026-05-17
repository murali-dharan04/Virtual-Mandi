import React from 'react';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AuthLayout = ({ children, title, subtitle, showBackButton = true }) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen font-poppins relative flex flex-col overflow-hidden">
            {/* Full Top — Stunning Colorful Farm Market Background */}
            <div 
                className="absolute top-0 left-0 w-full h-[44vh] bg-cover bg-center"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542838132-92c53300491e?q=90&w=1974&auto=format&fit=crop')" }}
            >
                {/* Warm layered overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#3b1c08]/30 via-[#78350f]/10 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#3b1c08]/30 via-transparent to-transparent" />
            </div>

            {/* Back Button */}
            {showBackButton && (
                <button 
                    onClick={() => navigate(-1)}
                    className="absolute top-10 left-6 z-20 h-11 w-11 rounded-full bg-white/15 backdrop-blur-xl border border-white/25 flex items-center justify-center text-white hover:bg-white/30 active:scale-95 transition-all shadow-lg"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6"/>
                    </svg>
                </button>
            )}

            {/* Curved White Bottom Sheet */}
            <div className="flex-1 mt-[35vh] relative z-10 w-full max-w-md mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-white min-h-[68vh] rounded-t-[3.5rem] px-8 pt-10 pb-10 shadow-[0_-20px_60px_rgba(0,0,0,0.12)] relative"
                >
                    {/* Floating Produce Accent leaves */}
                    <div className="absolute -top-14 right-8 rotate-[-25deg] drop-shadow-2xl">
                        <Leaf className="h-20 w-20 text-[#d97706]" fill="#d97706" strokeWidth={0.5} />
                    </div>
                    <div className="absolute -top-8 right-16 rotate-[15deg] drop-shadow-lg opacity-60">
                        <Leaf className="h-10 w-10 text-[#f59e0b]" fill="#f59e0b" strokeWidth={0.5} />
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-[#92400e] tracking-tight">{title}</h2>
                        <p className="text-[#b45309]/70 text-sm mt-2 font-medium">{subtitle}</p>
                    </div>

                    {children}
                </motion.div>
            </div>
        </div>
    );
};

export default AuthLayout;
