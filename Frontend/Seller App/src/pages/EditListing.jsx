import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { 
    ArrowLeft, Plus, Loader2, MapPin, 
    Leaf, TrendingUp, Sparkles, X, Check, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
    AlertDialog, AlertDialogAction, AlertDialogCancel, 
    AlertDialogContent, AlertDialogDescription, 
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { sellerApi } from "@/lib/api";
import PageTransition from "@/components/PageTransition";

const EditListing = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [form, setForm] = useState({
        cropName: "",
        category: "Grains",
        quantity: "",
        unit: "kg",
        pricePerUnit: "",
        location: "",
        harvestDate: "",
        qualityGrade: "Grade A - Premium",
        images: [],
    });

    const [isUploadingImage, setIsUploadingImage] = useState(false);

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const data = await sellerApi.getListingById(id);
                if (data && !data.error) {
                    setForm({
                        cropName: data.cropName || "",
                        category: data.category || "Grains",
                        quantity: data.quantity || "",
                        unit: data.unit || "kg",
                        pricePerUnit: data.pricePerUnit || "",
                        qualityGrade: data.qualityGrade || "Grade A - Premium",
                        harvestDate: data.harvestDate ? data.harvestDate.split('T')[0] : "",
                        location: data.location || "",
                        images: data.images || [],
                    });
                } else {
                    toast({ title: "Error", description: "Failed to load listing", variant: "destructive" });
                    navigate("/listings");
                }
            } catch (err) {
                toast({ title: "Error", description: "Listing not found", variant: "destructive" });
                navigate("/listings");
            } finally {
                setIsLoading(false);
            }
        };
        fetchListing();
    }, [id, navigate, toast]);

    const handleImageChange = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        if (form.images.length + files.length > 10) {
            toast({ title: "Limit Reached", description: "Max 10 photos allowed.", variant: "destructive" });
            return;
        }

        setIsUploadingImage(true);
        for (let i = 0; i < files.length; i++) {
            try {
                const res = await sellerApi.uploadImage(files[i]);
                if (res.success && res.image_url) {
                    setForm(prev => ({ ...prev, images: [...prev.images, res.image_url] }));
                } else {
                    toast({ title: "Upload Failed", description: res.error || "Failed to upload image", variant: "destructive" });
                }
            } catch (err) { 
                console.error(err); 
                toast({ title: "Upload Error", description: "Network error during upload.", variant: "destructive" });
            }
        }
        setIsUploadingImage(false);
    };

    const removeImage = (idx) => {
        setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
    };

    const handleSubmit = async () => {
        if (!form.cropName || !form.quantity || !form.pricePerUnit || !form.location) {
            toast({ title: "Missing Info", description: "Please fill all required fields.", variant: "destructive" });
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        if (form.harvestDate > today) {
            toast({ title: "Invalid Date", description: "Future harvest date is not allowed", variant: "destructive" });
            return;
        }

        setIsSaving(true);
        try {
            await sellerApi.updateListing(id, {
                ...form,
                imageUrl: form.images[0] || "/placeholder.svg"
            });
            toast({ title: "Changes Saved!", description: "Your listing has been updated." });
            navigate("/listings");
        } catch (err) {
            toast({ title: "Error", description: "Failed to save changes.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await sellerApi.deleteListing(id);
            toast({ title: "Listing Deleted" });
            navigate("/listings");
        } catch (err) {
            toast({ title: "Error", description: "Failed to delete listing", variant: "destructive" });
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Fetching Details...</p>
            </div>
        );
    }

    return (
        <PageTransition>
            <div className="max-w-4xl mx-auto pb-24 px-4 bg-[#f8f9fa] min-h-screen pt-4">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate(-1)} 
                            className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors shrink-0"
                        >
                            <ArrowLeft className="h-5 w-5 text-slate-600" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-serif font-black text-[#1b4332] tracking-tight leading-none">Edit Listing</h1>
                            <p className="text-xs font-medium text-slate-500 mt-1">Update the details of your crop listing below.</p>
                        </div>
                    </div>
                    
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setShowDeleteDialog(true)} 
                        className="h-10 w-10 rounded-full text-rose-500 hover:bg-rose-50 hover:text-rose-600 bg-white border border-rose-100 shadow-sm"
                    >
                        <Trash2 className="h-5 w-5" />
                    </Button>
                </div>

                {/* Form Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative"
                >
                    {/* Top Green Accent Bar */}
                    <div className="h-4 w-full bg-[#268051]"></div>

                    <div className="p-6 md:p-10 space-y-12">
                        
                        {/* 1. PRODUCT PHOTO */}
                        <div className="space-y-4">
                            <Label className="uppercase text-[10px] font-black tracking-widest text-slate-500">
                                Product Photo <span className="text-rose-500">*</span>
                            </Label>
                            
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                {/* Upload Box */}
                                <div className="shrink-0 relative">
                                    <input 
                                        type="file" 
                                        multiple 
                                        accept="image/*" 
                                        onChange={handleImageChange} 
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                        disabled={isUploadingImage || form.images.length >= 10}
                                    />
                                    <div className={`h-32 w-48 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-colors ${
                                        form.images.length >= 10 ? 'border-slate-200 bg-slate-50' : 'border-slate-300 hover:border-[#268051] hover:bg-emerald-50/50 cursor-pointer'
                                    }`}>
                                        {isUploadingImage ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="h-6 w-6 animate-spin text-[#268051]" />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scanning...</span>
                                            </div>
                                        ) : (
                                            <>
                                                <Plus className="h-8 w-8 text-slate-400 mb-2" strokeWidth={1.5} />
                                                <span className="text-xs font-bold text-slate-500">Product Photo</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                
                                {/* AI Smart-Scan Details */}
                                <div className="pt-2">
                                    <h4 className="text-sm font-black text-slate-800 mb-2 flex items-center gap-2">
                                        AI Smart-Scan
                                    </h4>
                                    <p className="text-xs font-medium text-slate-500 leading-relaxed max-w-sm">
                                        Upload a clear photo. Our AI will analyze color, texture, and moisture to suggest the optimal Grade and Price.
                                    </p>
                                </div>
                            </div>

                            {/* Uploaded Images Preview */}
                            {form.images.length > 0 && (
                                <div className="flex flex-wrap gap-3 mt-4">
                                    {form.images.map((img, idx) => (
                                        <div key={idx} className="relative h-16 w-16 rounded-xl overflow-hidden border border-slate-200 group">
                                            <img src={img} alt={`Preview ${idx + 1}`} className="h-full w-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button onClick={() => removeImage(idx)} className="h-6 w-6 bg-white/20 hover:bg-rose-500 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors">
                                                    <X className="h-3 w-3 text-white" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Status Pill */}
                            <div className="bg-[#f8f9fa] rounded-xl px-5 py-3 flex items-center justify-between mt-2 max-w-2xl">
                                <span className="text-sm font-black text-slate-700">Photos uploaded: {form.images.length}/10</span>
                                <span className="text-xs font-semibold text-slate-400">{10 - form.images.length} more available</span>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-slate-100 max-w-2xl"></div>

                        {/* 2. CROP INFORMATION */}
                        <div className="space-y-6 max-w-2xl">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#268051]">
                                    <Leaf className="h-5 w-5" />
                                </div>
                                <h3 className="text-sm font-serif font-black text-[#1b4332] uppercase tracking-widest">Crop Information</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="uppercase text-[10px] font-black tracking-widest text-slate-500">
                                        Crop Name <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input 
                                        placeholder="e.g. Basmati Rice, Tomatoes" 
                                        value={form.cropName} 
                                        onChange={e => setForm({...form, cropName: e.target.value})}
                                        className="h-12 rounded-xl bg-[#f8f9fa] border-slate-200 focus:bg-white focus:border-[#268051] text-sm font-semibold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="uppercase text-[10px] font-black tracking-widest text-slate-500">
                                        Category <span className="text-rose-500">*</span>
                                    </Label>
                                    <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                                        <SelectTrigger className="h-12 rounded-xl bg-[#f8f9fa] border-slate-200 focus:bg-white focus:border-[#268051] text-sm font-semibold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="Vegetables">Vegetables</SelectItem>
                                            <SelectItem value="Fruits">Fruits</SelectItem>
                                            <SelectItem value="Grains">Grains</SelectItem>
                                            <SelectItem value="Spices">Spices</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-slate-100 max-w-2xl"></div>

                        {/* 3. INVENTORY & PRICING */}
                        <div className="space-y-6 max-w-2xl">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
                                    <TrendingUp className="h-5 w-5" />
                                </div>
                                <h3 className="text-sm font-serif font-black text-[#1b4332] uppercase tracking-widest">Inventory & Pricing</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label className="uppercase text-[10px] font-black tracking-widest text-slate-500">
                                        Quantity <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input 
                                        type="number" 
                                        placeholder="500" 
                                        value={form.quantity} 
                                        onChange={e => setForm({...form, quantity: e.target.value})}
                                        className="h-12 rounded-xl bg-[#f8f9fa] border-slate-200 focus:bg-white focus:border-[#268051] text-sm font-semibold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="uppercase text-[10px] font-black tracking-widest text-slate-500">
                                        Unit (e.g. kg) <span className="text-rose-500">*</span>
                                    </Label>
                                    <Select value={form.unit} onValueChange={v => setForm({...form, unit: v})}>
                                        <SelectTrigger className="h-12 rounded-xl bg-[#f8f9fa] border-slate-200 focus:bg-white focus:border-[#268051] text-sm font-semibold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="kg">Kilograms (kg)</SelectItem>
                                            <SelectItem value="ton">Tons</SelectItem>
                                            <SelectItem value="quintal">Quintal</SelectItem>
                                            <SelectItem value="boxes">Boxes</SelectItem>
                                            <SelectItem value="units">Pieces</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="uppercase text-[10px] font-black tracking-widest text-slate-500">
                                        Price Per Unit <span className="text-rose-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                        <Input 
                                            type="number" 
                                            placeholder="65" 
                                            value={form.pricePerUnit} 
                                            onChange={e => setForm({...form, pricePerUnit: e.target.value})}
                                            className="h-12 pl-8 rounded-xl bg-[#f8f9fa] border-slate-200 focus:bg-white focus:border-[#268051] text-sm font-semibold"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-slate-100 max-w-2xl"></div>

                        {/* 4. QUALITY & ORIGIN */}
                        <div className="space-y-6 max-w-2xl">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                                <h3 className="text-sm font-serif font-black text-[#1b4332] uppercase tracking-widest">Quality & Origin</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="uppercase text-[10px] font-black tracking-widest text-slate-500">
                                        Quality Grade <span className="text-rose-500">*</span>
                                    </Label>
                                    <Select value={form.qualityGrade} onValueChange={v => setForm({...form, qualityGrade: v})}>
                                        <SelectTrigger className="h-12 rounded-xl bg-[#f8f9fa] border-slate-200 focus:bg-white focus:border-[#268051] text-sm font-semibold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="Grade A - Premium">Grade A – Premium</SelectItem>
                                            <SelectItem value="Grade B - Standard">Grade B – Standard</SelectItem>
                                            <SelectItem value="Grade C - Processing">Grade C – Processing</SelectItem>
                                            <SelectItem value="Organic">Organic Certified</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="uppercase text-[10px] font-black tracking-widest text-slate-500">
                                        Harvest Date <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input 
                                        type="date" 
                                        max={new Date().toISOString().split('T')[0]}
                                        value={form.harvestDate} 
                                        onChange={e => setForm({...form, harvestDate: e.target.value})}
                                        className="h-12 rounded-xl bg-[#f8f9fa] border-slate-200 focus:bg-white focus:border-[#268051] text-sm font-semibold"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                <Label className="uppercase text-[10px] font-black tracking-widest text-slate-500">
                                    Location <span className="text-rose-500">*</span>
                                </Label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <Input 
                                        placeholder="e.g. Karnal, Haryana" 
                                        value={form.location} 
                                        onChange={e => setForm({...form, location: e.target.value})}
                                        className="h-12 pl-12 rounded-xl bg-[#f8f9fa] border-slate-200 focus:bg-white focus:border-[#268051] text-sm font-semibold"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="flex items-center gap-4 pt-4 max-w-2xl">
                            <Button 
                                onClick={handleSubmit} 
                                disabled={isSaving}
                                className="flex-1 h-14 bg-[#268051] hover:bg-[#1b5e3a] text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20"
                            >
                                {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Check className="h-5 w-5 mr-2" />}
                                Save Changes
                            </Button>
                            <Button 
                                onClick={() => navigate(-1)}
                                variant="outline"
                                className="px-8 h-14 bg-[#f8f9fa] hover:bg-slate-100 border-slate-200 text-slate-600 rounded-2xl text-sm font-bold shadow-sm"
                            >
                                Cancel
                            </Button>
                        </div>

                    </div>
                </motion.div>

                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogContent className="rounded-3xl border-slate-100 p-6">
                        <AlertDialogHeader>
                            <div className="h-12 w-12 rounded-full bg-rose-50 flex items-center justify-center mb-4 mx-auto">
                                <Trash2 className="h-6 w-6 text-rose-500" />
                            </div>
                            <AlertDialogTitle className="text-center font-serif text-2xl font-black">Delete Listing?</AlertDialogTitle>
                            <AlertDialogDescription className="text-center text-slate-500 font-medium pb-4">
                                This action cannot be undone. This will permanently remove your crop listing from the marketplace.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-2">
                            <AlertDialogCancel className="h-12 rounded-xl border-slate-200 text-slate-600 font-bold uppercase tracking-widest text-[10px]">Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="h-12 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold uppercase tracking-widest text-[10px]">
                                Yes, delete listing
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

            </div>
        </PageTransition>
    );
};

export default EditListing;
