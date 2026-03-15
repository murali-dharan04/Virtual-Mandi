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
        <div className="space-y-6 max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-2 mb-8"
            >
                <h1 className="text-3xl font-extrabold tracking-tight">Help & Support</h1>
                <p className="text-muted-foreground">We are here to help you grow your business.</p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Contact Options */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="h-full shadow-card border-0 bg-gradient-to-br from-white to-secondary/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Headset className="h-6 w-6 text-primary" />
                                Get in Touch
                            </CardTitle>
                            <CardDescription>
                                Choose a channel to reach our support team.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            {/* Phone */}
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white shadow-sm border border-border/40 hover:shadow-md transition-all">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <Phone className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Call Us</p>
                                    <p className="text-lg font-black text-foreground">+91 98765 43210</p>
                                    <p className="text-[10px] text-muted-foreground font-medium">Mon-Sat • 9 AM - 6 PM</p>
                                </div>
                                <Button size="sm" variant="secondary" className="font-bold">Call</Button>
                            </div>

                            {/* Email */}
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white shadow-sm border border-border/40 hover:shadow-md transition-all">
                                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Us</p>
                                    <p className="text-lg font-black text-foreground">support@virtualmandi.com</p>
                                    <p className="text-[10px] text-muted-foreground font-medium">Response within 24h</p>
                                </div>
                                <Button size="sm" variant="outline" className="font-bold">Email</Button>
                            </div>

                            {/* WhatsApp */}
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#25D366]/10 shadow-sm border border-[#25D366]/20 hover:shadow-md transition-all">
                                <div className="h-12 w-12 rounded-full bg-[#25D366] flex items-center justify-center text-white">
                                    <MessageSquare className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">WhatsApp</p>
                                    <p className="text-lg font-black text-foreground">Chat Support</p>
                                    <p className="text-[10px] text-muted-foreground font-medium">Instant replies</p>
                                </div>
                                <Button size="sm" className="bg-[#25D366] hover:bg-[#128C7E] text-white font-bold border-0">Chat</Button>
                            </div>

                        </CardContent>
                    </Card>
                </motion.div>

                {/* Contact Form */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="shadow-card border-0 h-full">
                        <CardHeader>
                            <CardTitle>Send us a message</CardTitle>
                            <CardDescription>
                                Fill out the form below and we'll respond as soon as possible.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold ml-1">Issue Type</label>
                                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                        <option>Select an issue...</option>
                                        <option>Payment Issue</option>
                                        <option>Product Listing</option>
                                        <option>Order Dispute</option>
                                        <option>Account Help</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold ml-1">Subject</label>
                                    <Input placeholder="Brief summary of issue" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold ml-1">Message</label>
                                    <Textarea
                                        placeholder="Describe your issue in detail..."
                                        className="min-h-[150px]"
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full font-bold" disabled={isSubmitting}>
                                    {isSubmitting ? "Sending..." : (
                                        <>
                                            Submit Ticket <Send className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default Support;
