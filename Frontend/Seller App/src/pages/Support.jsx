import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MessageSquare, Send, Headset } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";

const Support = () => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            toast({
                title: "Support Request Sent",
                description: "We will get back to you within 24 hours.",
            });
            e.target.reset();
        }, 1500);
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 max-w-5xl mx-auto pb-24 px-4 pt-4">
            <div className="text-center space-y-3 mb-12">
                <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic leading-none">Support Center</h1>
                <p className="text-slate-500 font-bold text-lg">We're here to help you grow and succeed.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Contact Options */}
                <div className="space-y-6">
                    <Card className="border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xl font-black uppercase italic flex items-center gap-3">
                                <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600">
                                    <Headset className="h-6 w-6" />
                                </div>
                                Get in Touch
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            {[
                                { icon: Phone, label: "Call Us", val: "+91 98765 43210", sub: "Mon-Sat • 9 AM - 6 PM", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10", action: "Call" },
                                { icon: Mail, label: "Email Us", val: "support@virtualmandi.com", sub: "Response within 24h", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-500/10", action: "Email" },
                                { icon: MessageSquare, label: "WhatsApp", val: "Instant Chat", sub: "Available 24/7", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10", action: "Chat" }
                            ].map((item, i) => (
                                <motion.div key={i} whileHover={{ x: 8 }} className="group flex items-center gap-5 p-5 rounded-[2rem] border-2 border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/50 cursor-pointer transition-all hover:border-emerald-500/30 hover:bg-white dark:hover:bg-slate-800 shadow-sm">
                                    <div className={`h-14 w-14 rounded-2xl ${item.bg} flex items-center justify-center ${item.color} shrink-0 shadow-inner group-hover:scale-110 transition-transform`}>
                                        <item.icon className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{item.label}</p>
                                        <p className="text-lg font-black text-slate-900 dark:text-white leading-none mb-1">{item.val}</p>
                                        <p className="text-[11px] text-slate-500 font-bold">{item.sub}</p>
                                    </div>
                                    <Button variant="ghost" className="rounded-xl font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                        {item.action}
                                    </Button>
                                </motion.div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Contact Form */}
                <Card className="border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-xl font-black uppercase italic">Submit a Ticket</CardTitle>
                        <p className="text-slate-500 text-sm font-bold">Describe your issue and we'll get back to you soon.</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Issue Type</label>
                                <select className="flex h-14 w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 px-4 font-bold text-sm focus:border-emerald-500 outline-none transition-all cursor-pointer appearance-none">
                                    <option>Payment Issue</option>
                                    <option>Product Listing</option>
                                    <option>Order Dispute</option>
                                    <option>Account Help</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Subject</label>
                                <Input className="h-14 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 px-4 font-bold focus:border-emerald-500" placeholder="e.g. Can't see my listing" required />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Detail Message</label>
                                <Textarea
                                    placeholder="Explain your problem in detail..."
                                    className="min-h-[160px] rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 px-4 py-4 font-bold focus:border-emerald-500"
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full h-16 rounded-2xl font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-500 shadow-xl shadow-emerald-600/20 active:scale-[0.98] transition-all" disabled={isSubmitting}>
                                {isSubmitting ? <RefreshCw className="h-5 w-5 animate-spin" /> : (
                                    <>
                                        Submit Ticket <Send className="ml-3 h-5 w-5" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </motion.div>
    );
};

export default Support;
