import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Sparkles, RefreshCw, Loader2, X, Leaf, TrendingUp, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { sellerApi } from "@/lib/api";

const CreateListing = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [form, setForm] = useState({
        cropName: "",
        category: "Grains",
        quantity: "",
        unit: "kg",
        pricePerUnit: "",
        qualityGrade: "A",
        harvestDate: "",
        location: "",
        imageUrl: "",
        images: [],
    });

    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadCurrent, setUploadCurrent] = useState(0);
    const [uploadTotal, setUploadTotal] = useState(0);
    const [imagePreview, setImagePreview] = useState("");

    const handleImageChange = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        // Check if adding these files would exceed the limit
        if (form.images.length + files.length > 10) {
            toast({
                title: "Upload Limit Exceeded",
                description: `Maximum 10 photos allowed. You can add ${10 - form.images.length} more photo(s).`,
                variant: "destructive",
            });
            return;
        }

        // Start batch upload
        setIsUploadingImage(true);
        setUploadTotal(files.length);
        setUploadCurrent(0);
        setUploadProgress(0);

        let completedCount = 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            setUploadCurrent(i + 1);

            try {
                const result = await sellerApi.uploadImage(file, (percent) => {
                    // Overall progress: completed files + current file's fraction
                    const overallPercent = Math.round(((completedCount * 100) + percent) / files.length);
                    setUploadProgress(overallPercent);
                });

                if (result.success && result.image_url) {
                    completedCount++;
                    setForm(prev => {
                        const newImages = [...prev.images, result.image_url];
                        const newMainImage = prev.imageUrl ? prev.imageUrl : result.image_url;
                        return { ...prev, images: newImages, imageUrl: newMainImage };
                    });

                    // Only run AI Analysis if it's the very first image being set as main
                    if (i === 0) {
                        setForm(prev => {
                            if (prev.imageUrl === result.image_url && prev.images.length === 1) {
                                handleAIAnalysis(result.image_url, file.name);
                            }
                            return prev;
                        });
                    }
                } else {
                    toast({
                        title: "Upload Failed",
                        description: result.error || `Photo ${i + 1} failed to upload`,
                        variant: "destructive",
                    });
                }
            } catch (err) {
                console.error("Upload error:", err);
                // Auto-retry once
                try {
                    await new Promise(r => setTimeout(r, 2000));
                    const retryResult = await sellerApi.uploadImage(file);
                    if (retryResult.success && retryResult.image_url) {
                        completedCount++;
                        setForm(prev => {
                            const newImages = [...prev.images, retryResult.image_url];
                            const newMainImage = prev.imageUrl ? prev.imageUrl : retryResult.image_url;
                            return { ...prev, images: newImages, imageUrl: newMainImage };
                        });
                    } else {
                        throw new Error(retryResult.error || "Retry failed");
                    }
                } catch (retryErr) {
                    toast({
                        title: "Upload Error",
                        description: `Photo ${i + 1} failed. Check backend connection.`,
                        variant: "destructive",
                    });
                }
            }
        }

        // All done
        setUploadProgress(100);
        if (completedCount > 0) {
            toast({
                title: "All Photos Uploaded",
                description: `${completedCount} of ${files.length} photo(s) uploaded successfully!`,
            });
        }

        // Brief pause to show 100% then clear
        await new Promise(r => setTimeout(r, 800));
        setIsUploadingImage(false);
        setUploadProgress(0);
        setUploadCurrent(0);
        setUploadTotal(0);
    };

    const removeImage = (index) => {
        const newImages = form.images.filter((_, i) => i !== index);
        update("images", newImages);

        // If we removed the primary image, set a new one
        if (form.imageUrl === form.images[index] && newImages.length > 0) {
            update("imageUrl", newImages[0]);
        } else if (newImages.length === 0) {
            update("imageUrl", "");
        }
    };

    const handleAIAnalysis = async (imageUrl, originalFilename = "") => {
        setIsAnalyzing(true);
        setAnalysisResult(null);
        try {
            const data = await sellerApi.analyzeImage(imageUrl, originalFilename);
            if (data.detected_item) {
                setAnalysisResult({
                    grade: "A", // Backend doesn't return grade yet, keep mock A
                    confidence: data.confidence,
                    method: data.ai_method,
                    quality: data.quality_info,
                    indicators: [
                        { label: "Detected", status: data.detected_item },
                        { label: "Market Price", status: `₹${data.market_price}` },
                        { label: "Suggested", status: `₹${data.suggested_price}` }
                    ]
                });

                // Auto-fill form
                setForm(prev => ({
                    ...prev,
                    cropName: data.detected_item,
                    category: data.category,
                    pricePerUnit: data.suggested_price.toString(),
                    unit: data.unit || prev.unit,
                    qualityGrade: "A"
                }));

                toast({
                    title: "AI Analysis Complete",
                    description: `${data.detected_item} recognized. Form auto-filled.`,
                });
            }
        } catch (err) {
            console.error("AI Analysis failed:", err);
            toast({
                title: "AI Error",
                description: "Failed to analyze image. Please fill manually.",
                variant: "destructive"
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await sellerApi.createListing(form);
            if (res.listing_id) {
                toast({
                    title: t("listings.form.new_title"),
                    description: `${form.cropName} has been listed successfully.`
                });
                window.dispatchEvent(new Event('refreshNotifications'));
                navigate("/listings");
            } else {
                toast({
                    title: "Error",
                    description: res.error || "Failed to create listing",
                    variant: "destructive",
                });
            }
        } catch (err) {
            toast({
                title: "Network Error",
                description: "Could not reach the server",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const inputClass = "h-14 rounded-2xl border-2 border-slate-100 bg-slate-50/50 focus:border-[#2E7D32] focus:bg-white transition-all font-medium text-slate-900 placeholder:text-slate-300 shadow-sm";
    const labelClass = "text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 mb-2 block";

    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto pb-16 px-4 md:px-0 space-y-6">

            {/* Header */}
            <div className="flex items-center gap-4 pt-2">
                <Button variant="ghost" size="icon"
                    className="h-11 w-11 rounded-2xl border border-slate-100 shadow-sm"
                    onClick={() => navigate('/listings')}>
                    <ArrowLeft className="h-5 w-5 text-slate-700" />
                </Button>
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">{t('listings.form.new_title')}</h1>
                    <p className="text-slate-400 text-sm font-medium mt-0.5">Fill in the details below to publish your crop.</p>
                </div>
            </div>

            {/* Main Form Card */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-[#2E7D32] via-emerald-400 to-[#2E7D32] animate-gradient-x" />
                <div className="p-8 md:p-10">
                    <form onSubmit={handleSubmit} className="space-y-10">
                        {/* Photo Section */}
                        <div className="space-y-3">
                            <Label className={labelClass}>
                                {t('listings.form.photo')} <span className="text-red-400">*</span>
                            </Label>
                            <div className="flex flex-col gap-4">
                                {/* Primary Photo Preview */}
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                    <div className="relative group overflow-hidden rounded-xl border-2 border-dashed border-primary/20 bg-muted/30 aspect-video sm:w-48 flex items-center justify-center transition-all hover:border-primary/50">
                                        {isUploadingImage ? (
                                            <div className="flex flex-col items-center gap-3 p-4 w-full">
                                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                                <div className="w-full">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs font-semibold text-primary">
                                                            {uploadProgress === 100 ? 'Complete!' : uploadTotal > 1 ? `Uploading ${uploadCurrent} of ${uploadTotal}...` : 'Uploading...'}
                                                        </span>
                                                        <span className="text-xs font-bold text-primary">{uploadProgress}%</span>
                                                    </div>
                                                    <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                                                        <motion.div
                                                            className={`h-full rounded-full ${uploadProgress === 100 ? 'bg-green-500' : 'bg-primary'}`}
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${uploadProgress}%` }}
                                                            transition={{ duration: 0.3 }}
                                                        />
                                                    </div>
                                                    {uploadTotal > 1 && (
                                                        <p className="text-[10px] text-muted-foreground mt-1 text-center">{uploadTotal} photos selected</p>
                                                    )}
                                                </div>
                                            </div>
                                        ) : form.imageUrl ? (
                                            <img src={form.imageUrl} alt="Preview" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                                                <div className="p-3 rounded-full bg-primary/10">
                                                    <Plus className="h-6 w-6" />
                                                </div>
                                                <span className="text-xs font-medium">{t("listings.form.photo")}</span>
                                            </div>
                                        )}
                                        {!isUploadingImage && (
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                multiple
                                                disabled={form.images.length >= 10}
                                                className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <p className="text-sm font-bold text-foreground">AI Smart-Scan {isAnalyzing && " (Scanning...)"}</p>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Upload a clear photo. Our AI will analyze color, texture, and moisture to suggest the optimal Grade and Price.
                                        </p>

                                        <AnimatePresence>
                                            {isAnalyzing && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0 }}
                                                    className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl p-3 mt-1"
                                                >
                                                    <div className="h-6 w-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin shrink-0" />
                                                    <div>
                                                        <p className="text-primary font-bold text-xs">Agri-Vision™ AI Scanning...</p>
                                                        <p className="text-muted-foreground text-[10px]">Analyzing color, texture &amp; moisture</p>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {analysisResult && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    className={`rounded-2xl border p-4 mt-2 ${analysisResult.confidence >= 80 ? 'bg-emerald-50/80 border-emerald-200' :
                                                        analysisResult.confidence >= 60 ? 'bg-primary/5 border-primary/20' :
                                                            'bg-orange-50 border-orange-200'
                                                        }`}
                                                >
                                                    {/* Header row */}
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${analysisResult.confidence >= 80 ? 'text-emerald-600' :
                                                            analysisResult.confidence >= 60 ? 'text-primary' :
                                                                'text-orange-600'
                                                            }`}>
                                                            <Sparkles className="h-3 w-3" />
                                                            {analysisResult.method === 'Simulation' ? 'Smart Scan (Simulation)' : `Smart Scan • ${analysisResult.method}`}
                                                        </span>
                                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${analysisResult.confidence >= 80 ? 'bg-emerald-600 text-white' :
                                                            analysisResult.confidence >= 60 ? 'bg-primary text-white' :
                                                                'bg-orange-500 text-white'
                                                            }`}>
                                                            {analysisResult.confidence}%
                                                        </span>
                                                    </div>

                                                    {/* Detected item bar */}
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-lg text-white shadow-sm shrink-0 ${analysisResult.confidence >= 80 ? 'bg-emerald-500' :
                                                            analysisResult.confidence >= 60 ? 'bg-primary' :
                                                                'bg-orange-500'
                                                            }`}>
                                                            {analysisResult.indicators[0].status === 'Unidentified Item' ? '?' : analysisResult.grade}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-slate-800 truncate">
                                                                {analysisResult.indicators[0].status === 'Unidentified Item'
                                                                    ? 'No Match Found — Please fill manually'
                                                                    : `${analysisResult.indicators[0].status} Identified`}
                                                            </p>
                                                            <div className="h-1.5 w-full bg-black/5 rounded-full mt-1.5 overflow-hidden">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${analysisResult.confidence}%` }}
                                                                    transition={{ duration: 0.6, ease: 'easeOut' }}
                                                                    className={`h-full rounded-full ${analysisResult.confidence >= 80 ? 'bg-emerald-500' :
                                                                        analysisResult.confidence >= 60 ? 'bg-primary' :
                                                                            'bg-orange-500'
                                                                        }`}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Price indicators */}
                                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                                        <div className="text-center bg-white/60 rounded-xl p-2 border border-black/5">
                                                            <p className="text-[8px] font-black uppercase text-slate-400 mb-0.5">Market Price</p>
                                                            <p className="text-sm font-black text-slate-700">{analysisResult.indicators[1].status}</p>
                                                        </div>
                                                        <div className="text-center bg-emerald-100/60 rounded-xl p-2 border border-emerald-200/40">
                                                            <p className="text-[8px] font-black uppercase text-emerald-500 mb-0.5">Suggested</p>
                                                            <p className="text-sm font-black text-emerald-700">{analysisResult.indicators[2].status}</p>
                                                        </div>
                                                    </div>

                                                    {/* Quality grid */}
                                                    {analysisResult.quality && (
                                                        <div className="grid grid-cols-4 gap-1.5 pt-3 border-t border-black/5">
                                                            {Object.entries(analysisResult.quality).map(([key, val]) => (
                                                                <div key={key} className="text-center">
                                                                    <p className="text-[7px] font-black text-slate-400 uppercase mb-0.5">{key}</p>
                                                                    <p className="text-[10px] font-black text-primary">{val}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Simulation notice */}
                                                    {analysisResult.method === 'Simulation' && analysisResult.indicators[0].status !== 'Unidentified Item' && (
                                                        <p className="text-[9px] text-slate-400 mt-2 italic">
                                                            💡 Using smart filename detection. Add HF_API_TOKEN in .env for real AI vision.
                                                        </p>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Photo Count + Add More Button */}
                                <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                                    <span className="text-sm font-semibold text-foreground">
                                        Photos uploaded: <span className="text-primary">{form.images.length}</span>/10
                                    </span>
                                    {form.images.length > 0 && form.images.length < 10 && (
                                        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold cursor-pointer hover:bg-primary/90 transition-colors shadow-sm">
                                            <Plus className="h-3.5 w-3.5" />
                                            Add More Photos
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                multiple
                                                className="hidden"
                                                disabled={isUploadingImage}
                                            />
                                        </label>
                                    )}
                                    {form.images.length === 0 && form.images.length < 10 && (
                                        <span className="text-xs text-muted-foreground">
                                            {10 - form.images.length} more available
                                        </span>
                                    )}
                                </div>

                                {/* Photo Gallery — only shows fully uploaded images */}
                                {form.images.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                        {form.images.map((image, index) => (
                                            <motion.div
                                                key={index}
                                                layout
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className={`relative group rounded-lg overflow-hidden border-2 aspect-square cursor-pointer transition-all ${form.imageUrl === image
                                                    ? "border-primary ring-2 ring-primary/20 shadow-md"
                                                    : "border-transparent hover:border-primary/50"
                                                    }`}
                                                onClick={() => update("imageUrl", image)}
                                            >
                                                <img src={image} alt={`Photo ${index + 1}`} className="h-full w-full object-cover" />

                                                {/* Remove Button */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                                                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>

                                                {/* Primary Indicator */}
                                                {form.imageUrl === image && (
                                                    <div className="absolute bottom-0 inset-x-0 bg-primary/90 text-primary-foreground text-[10px] font-bold text-center py-1 uppercase tracking-wider backdrop-blur-sm">
                                                        Main Photo
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Crop Information Section */}
                        <div className="space-y-6 pt-6 border-t border-slate-50">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 rounded-xl bg-emerald-50 text-[#2E7D32]">
                                    <Leaf className="h-4 w-4" />
                                </div>
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Crop Information</h3>
                            </div>
                            
                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className={labelClass}>{t('listings.form.crop_name')} <span className="text-red-400">*</span></Label>
                                    <Input id="cropName" placeholder="e.g. Basmati Rice, Tomatoes"
                                        value={form.cropName} onChange={(e) => update('cropName', e.target.value)}
                                        required className={inputClass} />
                                </div>
                                <div className="space-y-2">
                                    <Label className={labelClass}>{t('listings.form.category')} <span className="text-red-400">*</span></Label>
                                    <Select value={form.category} onValueChange={(v) => update('category', v)}>
                                        <SelectTrigger className={`${inputClass} px-4`}><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Grains">Grains</SelectItem>
                                            <SelectItem value="Vegetables">Vegetables</SelectItem>
                                            <SelectItem value="Fruits">Fruits</SelectItem>
                                            <SelectItem value="Cooked Food">Cooked Food</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Inventory & Pricing Section */}
                        <div className="space-y-6 pt-6 border-t border-slate-50">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
                                    <TrendingUp className="h-4 w-4" />
                                </div>
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Inventory & Pricing</h3>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="space-y-2">
                                    <Label className={labelClass}>{t('listings.form.quantity')} <span className="text-red-400">*</span></Label>
                                    <Input id="quantity" type="number" placeholder="500"
                                        value={form.quantity} onChange={(e) => update('quantity', e.target.value)}
                                        required min="1" className={inputClass} />
                                </div>
                                <div className="space-y-2">
                                    <Label className={labelClass}>{t('listings.form.unit')} <span className="text-red-400">*</span></Label>
                                    <Select value={form.unit} onValueChange={(v) => update('unit', v)}>
                                        <SelectTrigger className={`${inputClass} px-4`}><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="kg">Kilograms (kg)</SelectItem>
                                            <SelectItem value="quintal">Quintal</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className={labelClass}>{t('listings.form.price_per_unit')} <span className="text-red-400">*</span></Label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                                        <Input id="price" type="number" placeholder="65"
                                            value={form.pricePerUnit} onChange={(e) => update('pricePerUnit', e.target.value)}
                                            required min="1" className={`${inputClass} pl-8`} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quality & Origin Section */}
                        <div className="space-y-6 pt-6 border-t border-slate-50">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                                    <Sparkles className="h-4 w-4" />
                                </div>
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Quality & Origin</h3>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className={labelClass}>{t('listings.form.quality')} <span className="text-red-400">*</span></Label>
                                    <Select value={form.qualityGrade} onValueChange={(v) => update('qualityGrade', v)}>
                                        <SelectTrigger className={`${inputClass} px-4`}><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="A">Grade A – Premium</SelectItem>
                                            <SelectItem value="B">Grade B – Standard</SelectItem>
                                            <SelectItem value="C">Grade C – Economy</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className={labelClass}>Harvest Date <span className="text-red-400">*</span></Label>
                                    <Input id="harvestDate" type="date"
                                        value={form.harvestDate} onChange={(e) => update('harvestDate', e.target.value)}
                                        required className={inputClass} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className={labelClass}>{t('listings.location')} <span className="text-red-400">*</span></Label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <Input id="location" placeholder="e.g. Karnal, Haryana"
                                        value={form.location} onChange={(e) => update('location', e.target.value)}
                                        required className={`${inputClass} pl-12`} />
                                </div>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex gap-3 pt-6 border-t border-slate-50">
                            <Button type="submit" disabled={isLoading}
                                className="flex-1 h-16 text-lg font-black uppercase rounded-2xl bg-[#2E7D32] hover:bg-[#1B5E20] shadow-xl shadow-green-900/10 text-white transition-all transform active:scale-[0.98]">
                                {isLoading ? <RefreshCw className="animate-spin h-5 w-5" /> : t('listings.form.submit')}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => navigate('/listings')}
                                className="h-16 px-8 rounded-2xl font-bold border-2 border-slate-100 hover:bg-slate-50 text-slate-600">
                                {t('listings.form.cancel')}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </motion.div>
    );
};

export default CreateListing;
