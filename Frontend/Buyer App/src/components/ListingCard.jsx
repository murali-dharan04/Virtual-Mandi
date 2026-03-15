import { MapPin, Clock, Leaf, Phone, MessageSquare, Eye, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// Helper to normalize phone to international format
const toWaNumber = (phone) => {
    if (!phone) return null;
    const cleaned = String(phone).replace(/[^0-9]/g, "");
    if (cleaned.startsWith("91") && cleaned.length === 12) return cleaned;
    if (cleaned.length === 10) return `91${cleaned}`;
    return cleaned;
};

const gradeColors = {
    A: "bg-emerald-100 text-emerald-700",
    B: "bg-amber-100 text-amber-700",
    C: "bg-slate-100 text-slate-600",
};

const ListingCard = ({ listing, index, allListings }) => {
    const imageUrl = listing.imageUrl || listing.image_url;

    // Simulated urgency data
    const views = listing.views || Math.floor(Math.random() * 500) + 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            whileHover={{ y: -6, scale: 1.02 }}
        >
            <div className="group block overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
                <Link to={`/product/${listing.id}`} state={{ listing, allListings, currentIndex: index }}>
                    {/* Compact Image */}
                    <div className="relative h-40 w-full bg-slate-100 overflow-hidden">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={listing.cropName}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100">
                                <Leaf className="h-12 w-12 text-emerald-200" />
                            </div>
                        )}

                        {/* Grade Badge */}
                        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[11px] font-bold z-10 ${gradeColors[listing.qualityGrade]}`}>
                            Grade {listing.qualityGrade}
                        </span>

                        {/* View Count Urgency */}
                        <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1.5 z-10">
                            <Eye className="h-3 w-3 text-white" />
                            <span className="text-[10px] font-bold text-white leading-none">{views}</span>
                        </div>

                        {/* Price Badge */}
                        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-sm z-10 border border-white/20">
                            <span className="text-lg font-bold text-slate-800">₹{listing.pricePerUnit}</span>
                            <span className="text-xs text-slate-500 ml-0.5">/{listing.unit}</span>
                        </div>
                    </div>
                </Link>

                {/* Info Section - Compact */}
                <div className="p-4">
                    <Link to={`/product/${listing.id}`} state={{ listing, allListings, currentIndex: index }}>
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <h3 className="text-base font-bold text-slate-800 leading-tight group-hover:text-emerald-700 transition-colors">
                                    {listing.cropName}
                                </h3>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <p className="text-xs text-slate-500">{listing.farmerName}</p>
                                    {listing.isVerified !== false && (
                                        <CheckCircle2 className="h-3 w-3 text-emerald-500 fill-emerald-50" />
                                    )}
                                </div>
                                {listing.district && (
                                    <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-400 font-medium">
                                        <MapPin className="h-2.5 w-2.5 text-emerald-500" />
                                        {listing.district}
                                    </div>
                                )}
                            </div>
                            <span className="text-xs font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md whitespace-nowrap">
                                {listing.quantity} {listing.unit}
                            </span>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500 mb-4">
                            <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                                <MapPin className="h-3 w-3 text-emerald-600" /> {listing.distance || 2.5} km
                            </span>
                            <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                                <Clock className="h-3 w-3 text-amber-600" /> {listing.deliveryEstimate || "Express Ready"}
                            </span>
                        </div>
                    </Link>

                    {/* Action Buttons: Dynamic Call & WhatsApp */}
                    {(() => {
                        const rawPhone = listing.farmerPhone || listing.seller_phone;
                        const waNum = toWaNumber(rawPhone);
                        const hasPhone = !!rawPhone;
                        const waMsg = encodeURIComponent(`Hello, I am interested in your ${listing.cropName} (₹${listing.pricePerUnit}/${listing.unit}) listed on Virtual Mandi.`);
                        return (
                            <div className="flex gap-2">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (hasPhone) window.location.href = `tel:+${waNum}`;
                                    }}
                                    disabled={!hasPhone}
                                    title={hasPhone ? `Call ${listing.farmerName}` : "Phone not available"}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[11px] font-bold transition-colors ${hasPhone
                                            ? "bg-slate-900 text-white hover:bg-black"
                                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                        }`}
                                >
                                    <Phone className="h-3.5 w-3.5" /> Call
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (waNum) window.open(`https://wa.me/${waNum}?text=${waMsg}`, "_blank");
                                    }}
                                    disabled={!waNum}
                                    title={waNum ? `WhatsApp ${listing.farmerName}` : "WhatsApp not available"}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[11px] font-bold transition-colors ${waNum
                                            ? "bg-[#25D366] text-white hover:bg-[#128C7E]"
                                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                        }`}
                                >
                                    <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
                                </button>
                            </div>
                        );
                    })()}
                </div>
            </div>
        </motion.div>
    );
};

export default ListingCard;
