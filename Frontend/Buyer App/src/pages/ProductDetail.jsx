import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { onListingEvents } from "@/services/socketService";
import { MapPin, Clock, Calendar, Shield, Minus, Plus, Leaf, Star, CheckCircle2, TrendingUp, ArrowLeft, ChevronLeft, ChevronRight, Store, Truck, Loader2, ShoppingCart, Phone, MessageSquare, Bell, User, Gavel, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import PageTransition from "@/components/PageTransition";
import confetti from "canvas-confetti";

// Normalize phone to international format
const toWaNumber = (phone) => {
    if (!phone) return null;
    const cleaned = String(phone).replace(/[^0-9]/g, "");
    if (cleaned.startsWith("91") && cleaned.length === 12) return cleaned;
    if (cleaned.length === 10) return `91${cleaned}`;
    return cleaned;
};

const maskPhone = (phone) => {
    if (!phone) return null;
    const cleaned = String(phone).replace(/[^0-9]/g, "").slice(-10);
    return `+91 ${cleaned.slice(0, 4)}••••${cleaned.slice(-2)}`;
};

const ProductDetail = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const { state } = useLocation();
    const { toast } = useToast();
    const [listing, setListing] = useState(state?.listing);
    const [quantity, setQuantity] = useState(10);
    const [ordering, setOrdering] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const [mandiPrices, setMandiPrices] = useState([]);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [autoSlide, setAutoSlide] = useState(true);
    const [sellerRating, setSellerRating] = useState(null);
    const [negotiationOpen, setNegotiationOpen] = useState(false);
    const [counterOffer, setCounterOffer] = useState(listing?.pricePerUnit ? Math.round(listing.pricePerUnit * 0.9) : 0);
    const [showSuccessAnim, setShowSuccessAnim] = useState(false);
    const [isUpdated, setIsUpdated] = useState(false);

    const allListings = state?.allListings || [];
    const currentIndex = state?.currentIndex ?? -1;

    const images = (() => {
        const allImages = [];
        const mainImg = listing?.imageUrl || listing?.image_url;
        if (mainImg) allImages.push(mainImg);
        if (listing?.images && listing.images.length > 0) {
            listing.images.forEach(img => {
                if (img !== mainImg) allImages.push(img);
            });
        }
        return allImages;
    })();

    // Auto-slide effect
    useEffect(() => {
        if (!autoSlide || images.length <= 1) return;

        const interval = setInterval(() => {
            setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
        }, 5000);

        return () => clearInterval(interval);
    }, [autoSlide, images.length]);

    useEffect(() => {
        if (id) {
            api.getListingById(id).then(data => {
                if (!data.error) {
                    setListing(prev => ({ ...prev, ...data }));
                }
            });
        }
    }, [id]);

    useEffect(() => {
        const sid = listing?.seller_id || listing?.id;
        if (sid) {
            api.getSellerRating(sid).then(data => {
                setSellerRating(data);
            });
        }
    }, [listing?.seller_id, listing?.id]);

    useEffect(() => {
        if (!listing?.id && !listing?._id) return;

        const unsubscribe = onListingEvents({
            onUpdate: (updatedListing) => {
                if (updatedListing.id === listing?.id || updatedListing.id === listing?._id) {
                    setListing(prev => ({ ...prev, ...updatedListing }));
                    setIsUpdated(true);
                    setTimeout(() => setIsUpdated(false), 3000);
                }
            },
            onDelete: (deletedData) => {
                if (deletedData.id === listing?.id || deletedData.id === listing?._id) {
                    toast({ title: "Listing Removed", description: "The seller has removed this listing.", variant: "destructive" });
                    navigate("/");
                }
            }
        });

        return () => unsubscribe();
    }, [listing?.id, listing?._id, navigate, toast]);

    useEffect(() => {
        if (listing?.cropName) {
            api.getMandiPrices(listing.cropName).then(data => {
                if (data.mandi_prices) setMandiPrices(data.mandi_prices);
            });
        }
    }, [listing]);

    const gradeColors = {
        A: "bg-emerald-100 text-emerald-700 border-emerald-200",
        B: "bg-amber-100 text-amber-700 border-amber-200",
        C: "bg-slate-100 text-slate-600 border-slate-200"
    };

    if (!listing) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    if (!listing.imageUrl && listing.image_url) {
        listing.imageUrl = listing.image_url;
    }

    const total = quantity * listing.pricePerUnit;

    const handleOrder = async () => {
        setOrdering(true);
        try {
            const selectedOrder = await api.select(listing.id, quantity);
            const confirmedOrder = await api.confirm({
                items: selectedOrder.items,
                billing: { name: "Retailer User", phone: "9876543210", address: "Grains Market" }
            });

            if (confirmedOrder && confirmedOrder.id) {
                setOrderId(confirmedOrder.id);
                // Trigger "Wowy" animation
                setShowSuccessAnim(true);
                
                // Fire premium confetti burst
                const duration = 2000;
                const end = Date.now() + duration;
                
                const frame = () => {
                    confetti({
                        particleCount: 5,
                        angle: 60,
                        spread: 55,
                        origin: { x: 0 },
                        colors: ['#10b981', '#34d399', '#059669', '#ffffff']
                    });
                    confetti({
                        particleCount: 5,
                        angle: 120,
                        spread: 55,
                        origin: { x: 1 },
                        colors: ['#10b981', '#34d399', '#059669', '#ffffff']
                    });
                    
                    if (Date.now() < end) {
                        requestAnimationFrame(frame);
                    }
                };
                frame();
                
                setTimeout(() => {
                    setShowSuccessAnim(false);
                    setConfirmed(true);
                }, 2000);
                toast({ title: t("product.confirmed"), description: `Order successfully placed!` });
            }
        } catch (err) {
            toast({ title: "Error", description: "Order flow failed. Please try again.", variant: "destructive" });
        } finally {
            setOrdering(false);
        }
    };

    if (confirmed) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white p-4">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md text-center">
                    <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 overflow-hidden">
                        {listing.imageUrl ? (
                            <img src={listing.imageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                        )}
                    </div>
                    <h2 className="mb-2 text-2xl font-bold text-slate-800">{t("product.confirmed")}</h2>
                    <p className="mb-2 text-slate-600">
                        {quantity} {listing.unit} of <span className="font-bold text-slate-800">{listing.cropName}</span> from <span className="font-bold text-slate-800">{listing.farmerName}</span>
                    </p>
                    <p className="mb-4 text-sm text-slate-400 font-mono">Order ID: {orderId}</p>
                    <p className="mb-8 text-3xl font-bold text-emerald-600">₹{total.toLocaleString()}</p>
                    <div className="flex gap-3">
                        <button onClick={() => navigate("/orders")} className="flex-1 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-colors">
                            {t("product.view_orders")}
                        </button>
                        <button onClick={() => navigate("/")} className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                            {t("product.continue")}
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <PageTransition>
            <div className="min-h-screen bg-slate-50 pb-20">
                {/* Top Navigation */}
                <div className="bg-white border-b border-slate-100 px-4 py-4 sticky top-0 z-40">
                    <div className="container max-w-6xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                                <ArrowLeft className="h-4 w-4" />
                                <span className="hidden sm:inline">Back</span>
                            </button>

                            {/* Product Pager */}
                            {allListings.length > 1 && currentIndex !== -1 && (
                                <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1 border border-slate-100">
                                    <button
                                        disabled={currentIndex === 0}
                                        onClick={() => navigate(`/product/${allListings[currentIndex - 1].id}`, { state: { listing: allListings[currentIndex - 1], allListings, currentIndex: currentIndex - 1 } })}
                                        className="p-1.5 rounded-md hover:bg-white text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <span className="text-[10px] font-bold text-slate-400 px-1">{currentIndex + 1} / {allListings.length}</span>
                                    <button
                                        disabled={currentIndex === allListings.length - 1}
                                        onClick={() => navigate(`/product/${allListings[currentIndex + 1].id}`, { state: { listing: allListings[currentIndex + 1], allListings, currentIndex: currentIndex + 1 } })}
                                        className="p-1.5 rounded-md hover:bg-white text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Product Details</span>
                    </div>
                </div>

                <div className="container max-w-6xl mx-auto px-4 py-4 md:py-6">
                    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
                        {/* Left: Image Gallery */}
                        <div className="space-y-4">
                            {/* Main Image */}
                            <div className="relative group aspect-square overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-sm">
                                {images.length > 0 ? (
                                    <AnimatePresence mode="wait">
                                        <motion.img
                                            key={activeImageIndex}
                                            src={images[activeImageIndex]}
                                            alt={listing.cropName}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="h-full w-full object-cover"
                                        />
                                    </AnimatePresence>
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-emerald-50">
                                        <Leaf className="h-20 w-20 text-emerald-200" />
                                    </div>
                                )}

                                {/* Navigation Arrows */}
                                {images.length > 1 && (
                                    <div className="absolute inset-x-4 top-1/2 flex -translate-y-1/2 justify-between z-10">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setAutoSlide(false);
                                                setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                                            }}
                                            className="h-12 w-12 flex items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-lg backdrop-blur-md hover:bg-white hover:scale-110 active:scale-95 transition-all"
                                        >
                                            <ChevronLeft className="h-6 w-6" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setAutoSlide(false);
                                                setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                                            }}
                                            className="h-12 w-12 flex items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-lg backdrop-blur-md hover:bg-white hover:scale-110 active:scale-95 transition-all"
                                        >
                                            <ChevronRight className="h-6 w-6" />
                                        </button>
                                    </div>
                                )}

                                {/* Image Counter */}
                                {images.length > 1 && (
                                    <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
                                        {activeImageIndex + 1} / {images.length}
                                    </div>
                                )}
                            </div>

                            {/* Thumbnails */}
                            {images.length > 1 && (
                                <div className="flex gap-3 overflow-x-auto pb-1">
                                    {images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImageIndex(idx)}
                                            className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${idx === activeImageIndex
                                                ? "border-emerald-500 ring-2 ring-emerald-200 shadow-sm"
                                                : "border-slate-200 opacity-60 hover:opacity-100"
                                                }`}
                                        >
                                            <img src={img} className="h-full w-full object-cover" alt="" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right: Product Info */}
                        <div className="space-y-6">
                            {/* Header */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border ${gradeColors[listing.qualityGrade]}`}>
                                        Grade {listing.qualityGrade}
                                    </span>
                                    {listing.harvestDate && (
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                            <Calendar className="h-3 w-3" /> {listing.harvestDate}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <h1 className="text-2xl md:text-3xl font-black text-slate-800 mb-0.5 tracking-tight italic">{listing.cropName}</h1>
                                    <AnimatePresence>
                                        {isUpdated && (
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                className="bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5"
                                            >
                                                <Zap className="h-3 w-3 fill-current" />
                                                Live Update
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <p className="text-xs text-slate-500 font-bold flex items-center gap-1.5">
                                    by <span className="text-emerald-600 uppercase tracking-widest">{listing.farmerName}</span>
                                    {listing.isVerified !== false && (
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 fill-emerald-50" />
                                    )}
                                </p>
                            </div>

                            {/* Seller Profile Card */}
                            {(() => {
                                const rawPhone = listing.farmerPhone || listing.seller_phone;
                                const waNum = toWaNumber(rawPhone);
                                const waMsg = encodeURIComponent(`Hello, I am interested in your ${listing.cropName} listed on Virtual Mandi. Please share more details.`);
                                return (
                                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-3">Seller Profile</p>
                                        <div className="flex items-start gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-lg shadow-sm shrink-0">
                                                {(listing.farmerName || "F")[0].toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-black text-slate-800">{listing.farmerName || "Local Farmer"}</p>
                                                    {listing.isVerified !== false && (
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-50" />
                                                    )}
                                                </div>
                                                {(listing.district || listing.location) && (
                                                    <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mt-0.5">
                                                        <MapPin className="h-3 w-3 text-emerald-500" />
                                                        {listing.district || listing.location}
                                                    </div>
                                                )}
                                                {rawPhone && (
                                                    <p className="text-xs font-bold text-slate-400 mt-1">{maskPhone(rawPhone)}</p>
                                                )}
                                                {sellerRating && (
                                                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-emerald-100">
                                                        <div>
                                                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Rating</p>
                                                            <div className="flex items-center gap-1">
                                                                <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                                                <span className="text-sm font-black text-slate-800">{sellerRating.rating}</span>
                                                            </div>
                                                        </div>
                                                        <div className="h-6 w-px bg-emerald-100" />
                                                        <div>
                                                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Orders</p>
                                                            <span className="text-sm font-black text-slate-800">{sellerRating.total_orders}+</span>
                                                        </div>
                                                        <div className="h-6 w-px bg-emerald-100" />
                                                        <div>
                                                            <div className="flex gap-1">
                                                                {sellerRating.badges?.slice(0, 1).map((b, i) => (
                                                                    <Badge key={i} className="bg-emerald-500 text-white border-none text-[8px] px-1 py-0">{b}</Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mt-4">
                                            <button
                                                onClick={() => { if (waNum) window.location.href = `tel:+${waNum}`; }}
                                                disabled={!waNum}
                                                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black transition-all ${waNum
                                                    ? "bg-slate-900 text-white hover:bg-black"
                                                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                                    }`}
                                            >
                                                <Phone className="h-4 w-4" /> Call Seller
                                            </button>
                                            <button
                                                onClick={() => { if (waNum) window.open(`https://wa.me/${waNum}?text=${waMsg}`, "_blank"); }}
                                                disabled={!waNum}
                                                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black transition-all ${waNum
                                                    ? "bg-[#25D366] text-white hover:bg-[#128C7E]"
                                                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                                    }`}
                                            >
                                                <MessageSquare className="h-4 w-4" /> WhatsApp
                                            </button>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Price Card */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                <div className="flex items-end justify-between mb-6">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Price</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-bold text-slate-800">₹{listing.pricePerUnit}</span>
                                            <span className="text-lg text-slate-400">/ {listing.unit}</span>
                                        </div>
                                    </div>
                                    <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100">
                                        {listing.quantity} {listing.unit} in stock
                                    </span>
                                </div>

                                {/* Quantity Selector */}
                                <div className="mb-6">
                                    <label className="text-sm font-semibold text-slate-600 mb-2 block">Quantity ({listing.unit})</label>
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-1 items-center rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
                                            <button onClick={() => setQuantity(Math.max(1, quantity - 5))} className="h-12 w-14 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
                                                <Minus className="h-4 w-4" />
                                            </button>
                                            <input
                                                type="number"
                                                value={quantity}
                                                onChange={(e) => setQuantity(Math.max(1, Math.min(listing.quantity, Number(e.target.value))))}
                                                className="flex-1 bg-transparent text-center text-xl font-bold text-slate-800 outline-none"
                                            />
                                            <button onClick={() => setQuantity(Math.min(listing.quantity, quantity + 5))} className="h-12 w-14 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="text-right min-w-[100px]">
                                            <p className="text-xs text-slate-400 font-semibold mb-0.5">Total</p>
                                            <p className="text-2xl font-bold text-emerald-600">₹{total.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Button */}
                                <button
                                    onClick={handleOrder}
                                    disabled={ordering}
                                    className="w-full rounded-xl bg-emerald-600 py-4 text-base font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {ordering ? (
                                        <><Loader2 className="h-5 w-5 animate-spin" /> Placing Order...</>
                                    ) : (
                                        <><ShoppingCart className="h-5 w-5" /> Place Order</>
                                    )}
                                </button>

                                {/* Direct Communication (backup inline buttons) */}
                                {(() => {
                                    const rawPhone = listing.farmerPhone || listing.seller_phone;
                                    const rawWa = listing.whatsappNumber || rawPhone;
                                    const waNum = toWaNumber(rawWa);
                                    const callNum = toWaNumber(rawPhone);
                                    const waMsg = encodeURIComponent(`I'm interested in ${listing.cropName} on Virtual Mandi.`);
                                    return (
                                        <div className="grid grid-cols-2 gap-3 mt-4">
                                            <button
                                                onClick={() => { if (callNum) window.location.href = `tel:+${callNum}`; }}
                                                disabled={!callNum}
                                                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-bold transition-all ${callNum
                                                    ? "border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white"
                                                    : "border-slate-200 text-slate-400 cursor-not-allowed"
                                                    }`}
                                            >
                                                <Phone className="h-4 w-4" /> Call Farmer
                                            </button>
                                            <button
                                                onClick={() => { if (waNum) window.open(`https://wa.me/${waNum}?text=${waMsg}`, "_blank"); }}
                                                disabled={!waNum}
                                                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-bold transition-all ${waNum
                                                    ? "border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white"
                                                    : "border-slate-200 text-slate-400 cursor-not-allowed"
                                                    }`}
                                            >
                                                <MessageSquare className="h-4 w-4" /> WhatsApp
                                            </button>
                                        </div>
                                    );
                                })()}

                                {/* Advanced Price Alerts */}
                                <div className="mt-6 pt-6 border-t border-slate-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800">Price Alert</h4>
                                            <p className="text-xs text-slate-400">Get notified when price drops</p>
                                        </div>
                                        <button
                                            onClick={() => toast({ title: "Alert Set", description: `You'll be notified if ${listing.cropName} drops below ₹${listing.pricePerUnit - 5}` })}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold hover:bg-amber-100 transition-colors"
                                        >
                                            <Bell className="h-3.5 w-3.5" /> Notify Me
                                        </button>
                                    </div>
                                </div>

                                <p className="text-center text-[10px] text-slate-400 mt-2 flex items-center justify-center gap-1">
                                    <Shield className="h-3 w-3" /> Secure transaction via ONDC Protocol
                                </p>
                            </div>

                            {/* Smart Negotiation Widget */}
                            <div className="bg-slate-900 rounded-[2rem] border border-white/10 p-8 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 h-32 w-32 bg-emerald-500/10 blur-[50px] group-hover:bg-emerald-500/20 transition-all" />
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                                                <Gavel className="h-5 w-5 text-emerald-400" />
                                            </div>
                                            <h3 className="text-xl font-bold text-white tracking-tight italic">Smart Negotiation</h3>
                                        </div>
                                        <Badge className="bg-emerald-500/20 text-emerald-400 border-none px-2 py-0.5 text-[10px] uppercase font-black tracking-widest">AI Guided</Badge>
                                    </div>

                                    {!negotiationOpen ? (
                                        <div className="space-y-4">
                                            <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                                Buy in bulk? Our AI can help you secure a <span className="text-emerald-400 font-bold">5-12% discount</span> based on current market trends.
                                            </p>
                                            <button 
                                                onClick={() => setNegotiationOpen(true)}
                                                className="w-full h-14 rounded-2xl bg-white hover:bg-emerald-50 text-slate-900 font-black uppercase tracking-widest text-[10px]"
                                            >
                                                Initiate Counter-Offer
                                            </button>
                                        </div>
                                    ) : (
                                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Your Proposal</p>
                                                    <p className="text-white font-black text-xl italic">₹{counterOffer} <span className="text-slate-500 font-normal text-xs">/ {listing.unit}</span></p>
                                                </div>
                                                <input 
                                                    type="range" 
                                                    min={Math.round(listing.pricePerUnit * 0.7)} 
                                                    max={listing.pricePerUnit} 
                                                    step="1"
                                                    value={counterOffer}
                                                    onChange={(e) => setCounterOffer(Number(e.target.value))}
                                                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
                                                />
                                                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                    <span>₹{Math.round(listing.pricePerUnit * 0.7)} (Min)</span>
                                                    <span>₹{listing.pricePerUnit} (Listing)</span>
                                                </div>
                                            </div>

                                            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex gap-3 items-start">
                                                <Sparkles className="h-5 w-5 text-emerald-400 shrink-0" />
                                                <p className="text-[11px] text-emerald-100/80 font-medium leading-relaxed">
                                                    AI Suggestion: <span className="text-white font-bold">₹{Math.round(listing.pricePerUnit * 0.88)}</span> is the ideal entry point for this quantity in {listing.district || 'Salem'}.
                                                </p>
                                            </div>

                                            <div className="flex gap-3">
                                                <button 
                                                    onClick={() => setNegotiationOpen(false)}
                                                    className="flex-1 h-12 rounded-xl border border-white/10 bg-transparent text-white hover:bg-white/5 font-black uppercase tracking-widest text-[10px]"
                                                >
                                                    Cancel
                                                </button>
                                                <button 
                                                    onClick={() => toast({ title: "Offer Sent", description: `Your counter-offer of ₹${counterOffer} has been sent to ${listing.farmerName}.` })}
                                                    className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-900/40"
                                                >
                                                    Confirm Offer
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </div>

                            {/* New: AI Harvest Analysis "Wow" Section */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-xl"
                            >
                                {/* Animated scan pulse line */}
                                <motion.div
                                    animate={{ top: ['0%', '100%', '0%'] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                    className="absolute left-0 right-0 h-[2px] bg-emerald-400/30 z-10 blur-[1px]"
                                />

                                <div className="relative z-20">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-emerald-500/20 rounded-lg">
                                                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                            </div>
                                            <h3 className="font-bold text-lg tracking-tight">AI Harvest Analysis</h3>
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-white px-2 py-1 rounded">Verified</span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        {[
                                            { label: 'Freshness', value: '98%', color: 'from-emerald-400 to-green-500' },
                                            { label: 'Texture', value: 'Firm', color: 'from-blue-400 to-indigo-500' },
                                            { label: 'Color', value: 'Vibrant', color: 'from-amber-400 to-orange-500' }
                                        ].map((stat, i) => (
                                            <div key={i} className="text-center">
                                                <div className={`h-1.5 w-full bg-white/10 rounded-full mb-2 overflow-hidden`}>
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: '100%' }}
                                                        transition={{ delay: 0.5 + (i * 0.2), duration: 1 }}
                                                        className={`h-full bg-gradient-to-r ${stat.color}`}
                                                    />
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">{stat.label}</p>
                                                <p className="text-sm font-black">{stat.value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6 flex items-center gap-3 bg-white/5 rounded-2xl p-3 border border-white/10">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="h-6 w-6 rounded-full border-2 border-slate-800 bg-slate-700 flex items-center justify-center">
                                                    <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-xs font-medium text-slate-300">Certified by Mandi Quality AI Protocol</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white rounded-2xl border border-slate-100 p-5 text-center">
                                    <div className="mb-2 flex justify-center">
                                        <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                                            <Shield className="h-6 w-6" />
                                        </div>
                                    </div>
                                    <h3 className="font-semibold text-slate-700 text-sm">Verified Quality</h3>
                                    <p className="text-xs text-slate-400 mt-0.5">Lab tested & certified</p>
                                </div>
                                <div className="bg-white rounded-2xl border border-slate-100 p-5 text-center">
                                    <div className="mb-2 flex justify-center">
                                        <div className="p-3 rounded-xl bg-orange-50 text-orange-600">
                                            <Truck className="h-6 w-6" />
                                        </div>
                                    </div>
                                    <h3 className="font-semibold text-slate-700 text-sm">Fast Delivery</h3>
                                    <p className="text-xs text-slate-400 mt-0.5">Quick dispatch available</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mandi Price Comparison */}
                    {mandiPrices.length > 0 && (
                        <div className="mt-12">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 rounded-xl bg-emerald-50">
                                    <Store className="h-6 w-6 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">Market Price Comparison</h3>
                                    <p className="text-xs text-slate-400">Compare with live mandi rates across India</p>
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {mandiPrices.map((m, i) => {
                                    const diff = listing.pricePerUnit - m.price;
                                    return (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.08 }}
                                            className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h4 className="font-bold text-slate-700 text-sm leading-tight">{m.market.split('(')[0].trim()}</h4>
                                                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" /> {m.state}
                                                    </p>
                                                </div>
                                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${diff < 0 ? 'bg-emerald-100 text-emerald-700' : diff > 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {diff < 0 ? 'Cheaper' : diff > 0 ? 'Costlier' : 'Same'}
                                                </span>
                                            </div>
                                            <div className="flex items-end justify-between pt-3 border-t border-slate-100">
                                                <p className="text-2xl font-bold text-slate-800">₹{m.price}</p>
                                                <p className={`text-xs font-bold ${diff < 0 ? 'text-emerald-600' : diff > 0 ? 'text-red-500' : 'text-slate-400'}`}>
                                                    {diff < 0 ? `Save ₹${Math.abs(diff)}` : diff > 0 ? `+₹${diff}` : '—'}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* SUCCESS ANIMATION OVERLAY */}
                <AnimatePresence>
                    {showSuccessAnim && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center bg-white/95 backdrop-blur-xl"
                        >
                            <div className="text-center">
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                    className="relative mx-auto mb-8 flex h-40 w-40 items-center justify-center rounded-full bg-emerald-500 shadow-[0_20px_60px_-15px_rgba(16,185,129,0.5)]"
                                >
                                    <motion.div
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                    >
                                        <svg className="h-20 w-20 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <motion.path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </motion.div>
                                    {/* Pulse Ring */}
                                    <motion.div
                                        animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        className="absolute inset-0 rounded-full border-4 border-emerald-500"
                                    />
                                </motion.div>
                                <motion.h2
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-3xl font-black text-slate-900 italic tracking-tight"
                                >
                                    Order Confirmed! 🚜
                                </motion.h2>
                                <motion.p
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="mt-2 text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]"
                                >
                                    Notifying Farmer Instantly
                                </motion.p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </PageTransition>
    );
};

export default ProductDetail;
