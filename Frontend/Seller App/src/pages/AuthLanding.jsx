import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { Button } from "@/components/ui/button";
import PageTransition from "@/components/PageTransition";
import AuthLayout from "@/components/AuthLayout";

const AuthLanding = () => {
    const navigate = useNavigate();

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <PageTransition>
            <AuthLayout
                title="Welcome to Virtual Mandi"
                subtitle="Buy and sell farm products easily."
            >
                <motion.div
                    initial="hidden"
                    animate="show"
                    variants={{
                        show: {
                            transition: {
                                staggerChildren: 0.1
                            }
                        }
                    }}
                    className="space-y-6"
                >
                    <div className="mb-10 lg:text-left text-center">
                        <motion.h2 variants={itemVariants} className="text-3xl font-black text-[#2E7D32] font-poppins tracking-tight">
                            Get Started
                        </motion.h2>
                        <motion.p variants={itemVariants} className="text-slate-500 font-medium mt-1">
                            Choose an option to continue to your dashboard.
                        </motion.p>
                    </div>

                    <motion.div variants={itemVariants}>
                        <Button
                            onClick={() => navigate('/auth/login')}
                            className="w-full h-18 text-lg font-black uppercase rounded-2xl bg-[#2E7D32] hover:bg-[#1B5E20] shadow-xl shadow-green-900/20 group transition-all duration-300"
                        >
                            <LogIn className="mr-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                            Sign In
                            <ArrowRight className="ml-auto h-5 w-5 opacity-50" />
                        </Button>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <Button
                            onClick={() => navigate('/auth/register')}
                            variant="outline"
                            className="w-full h-18 text-lg font-black uppercase rounded-2xl border-2 border-slate-200 bg-white hover:bg-[#F7F9F5] hover:border-[#A5D6A7] text-slate-700 group transition-all duration-300"
                        >
                            <UserPlus className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform text-[#FF9800]" />
                            Create New Account
                            <ArrowRight className="ml-auto h-5 w-5 opacity-50" />
                        </Button>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="mt-12 text-center"
                    >
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Official Partner for Digital Agriculture
                        </p>
                    </motion.div>
                </motion.div>
            </AuthLayout>
        </PageTransition>
    );
};

export default AuthLanding;
