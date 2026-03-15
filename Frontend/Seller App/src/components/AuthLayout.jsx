import React from 'react';
import { motion } from 'framer-motion';
import { Wheat } from 'lucide-react';

const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen bg-[#F7F9F5] flex flex-col lg:flex-row overflow-hidden font-roboto">
            {/* Left Section (Desktop Graphic / Mobile Header) */}
            <div className="lg:w-1/2 relative bg-[#2E7D32] lg:flex flex-col items-center justify-center p-8 lg:p-12 overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute inset-0 z-0 overflow-hidden opacity-20 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white rounded-full blur-[100px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#FF9800] rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 w-full max-w-lg text-center lg:text-left">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex h-16 lg:h-24 w-16 lg:w-24 items-center justify-center rounded-3xl bg-white shadow-2xl mb-6"
                    >
                        <Wheat className="h-8 lg:h-12 w-8 lg:h-12 text-[#2E7D32]" />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl lg:text-6xl font-black text-white font-poppins tracking-tighter mb-4"
                    >
                        Virtual <span className="text-[#A5D6A7]">Mandi</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-white/80 text-lg lg:text-xl font-medium max-w-md hidden lg:block"
                    >
                        Buy and sell farm products easily with Bharat's smartest digital marketplace.
                    </motion.p>
                </div>

                {/* Hero Illustration (Desktop Only) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ delay: 0.6, type: "spring", damping: 15 }}
                    className="mt-12 w-full max-w-md relative z-10 hidden lg:block"
                >
                    <img
                        src="/assets/auth_hero.png"
                        alt="Virtual Mandi Hero"
                        className="w-full h-auto drop-shadow-2xl rounded-[3rem]"
                    />
                </motion.div>
            </div>

            {/* Right Section (Forms) */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative">
                <div className="w-full max-w-md">
                    <div className="lg:hidden text-center mb-8">
                        <h2 className="text-3xl font-black text-[#2E7D32] font-poppins tracking-tight">{title}</h2>
                        <p className="text-slate-500 font-medium mt-1">{subtitle}</p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
