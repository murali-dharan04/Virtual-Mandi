import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Trash2, Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { sellerApi } from "@/lib/api";

const EditListing = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

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
    const [imagePreview, setImagePreview] = useState("");

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
                        qualityGrade: data.qualityGrade || "A",
                        harvestDate: data.harvestDate || "",
                        location: data.location || "",
                        imageUrl: data.imageUrl || "",
                        images: data.images || [],
                    });
                } else {
                    toast({ title: "Error", description: data.error || "Failed to load listing", variant: "destructive" });
                    navigate("/listings");
                }
            } catch (err) {
                console.error("Failed to fetch listing:", err);
                toast({ title: "Error", description: "Failed to load listing", variant: "destructive" });
                navigate("/listings");
            } finally {
                setIsLoading(false);
            }
        };
        fetchListing();
    }, [id, navigate, toast]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await sellerApi.updateListing(id, form);
            if (res.message) {
                toast({
                    title: t("listings.form.edit_title"),
                    description: "Produce details have been saved successfully.",
                });
                navigate("/listings");
            } else {
                toast({
                    title: "Error",
                    description: res.error || "Failed to update listing",
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
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this listing? This action cannot be undone.")) return;

        try {
            const res = await sellerApi.deleteListing(id);
            if (res.message) {
                toast({ title: t("listings.delete"), description: "The listing has been removed." });
                navigate("/listings");
            } else {
                toast({ title: "Error", description: res.error || "Failed to delete listing", variant: "destructive" });
            }
        } catch (err) {
            toast({ title: "Error", description: "Failed to delete listing", variant: "destructive" });
        }
    };

    const handleImageChange = async (e) => {
        const files = Array.from(e.target.files || []);

        // Check if adding these files would exceed the limit
        if (form.images.length + files.length > 10) {
            toast({
                title: "Upload Limit Exceeded",
                description: `Maximum 10 photos allowed. You can add ${10 - form.images.length} more photo(s).`,
                variant: "destructive",
            });
            return;
        }

        for (const file of files) {
            // Show preview immediately
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);

            setIsUploadingImage(true);
            setUploadProgress(0);
            try {
                const result = await sellerApi.uploadImage(file, (percent) => {
                    setUploadProgress(percent);
                });
                if (result.success && result.image_url) {
                    setForm(prev => {
                        const newImages = [...prev.images, result.image_url];
                        const newMainImage = prev.imageUrl ? prev.imageUrl : result.image_url;
                        return { ...prev, images: newImages, imageUrl: newMainImage };
                    });

                    toast({
                        title: "Image Uploaded",
                        description: `Photo uploaded successfully!`,
                    });
                } else {
                    toast({
                        title: "Upload Failed",
                        description: result.error || "Could not upload image",
                        variant: "destructive",
                    });
                }
            } catch (err) {
                console.error("Upload error:", err);
                // Auto-retry once after a short delay
                try {
                    await new Promise(r => setTimeout(r, 2000));
                    const retryResult = await sellerApi.uploadImage(file);
                    if (retryResult.success && retryResult.image_url) {
                        setForm(prev => {
                            const newImages = [...prev.images, retryResult.image_url];
                            const newMainImage = prev.imageUrl ? prev.imageUrl : retryResult.image_url;
                            return { ...prev, images: newImages, imageUrl: newMainImage };
                        });
                        toast({ title: "Image Uploaded", description: "Photo uploaded on retry!" });
                    } else {
                        throw new Error(retryResult.error || "Retry failed");
                    }
                } catch (retryErr) {
                    toast({
                        title: "Upload Error",
                        description: "Could not upload image. Please check that the backend server is running and try again.",
                        variant: "destructive",
                    });
                }
            } finally {
                setIsUploadingImage(false);
                setUploadProgress(0);
            }
        }
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

    const update = (field, value) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    if (isLoading) {
        return <div className="flex items-center justify-center py-20 font-display text-muted-foreground italic">Loading listing details...</div>;
    }

    return (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/listings")}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold font-display text-primary">{t("listings.form.edit_title")}</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">{t("listings.subtitle")}</p>
                    </div>
                </div>
                <Button variant="destructive" size="sm" onClick={handleDelete} className="shadow-sm">
                    <Trash2 className="h-4 w-4 mr-2" /> {t("listings.delete")}
                </Button>
            </div>

            <Card className="shadow-card overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-primary/50 to-primary animate-pulse" />
                <CardHeader>
                    <CardTitle className="font-display text-lg">{form.cropName || t("listings.form.edit_title")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Photo Section */}
                        <div className="space-y-3">
                            <Label className="text-base font-bold">{t("listings.form.photo")}</Label>
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                {/* Primary Photo Preview */}
                                <div className="relative group overflow-hidden rounded-xl border-2 border-dashed border-primary/20 bg-muted/30 aspect-video sm:w-48 flex items-center justify-center transition-all hover:border-primary/50">
                                    {isUploadingImage ? (
                                        <div className="flex flex-col items-center gap-3 p-4 w-full">
                                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                            <div className="w-full">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-semibold text-primary">Uploading...</span>
                                                    <span className="text-xs font-bold text-primary">{uploadProgress}%</span>
                                                </div>
                                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                                    <motion.div
                                                        className="h-full bg-primary rounded-full"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${uploadProgress}%` }}
                                                        transition={{ duration: 0.3 }}
                                                    />
                                                </div>
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
                                            disabled={form.images.length >= 10 || isUploadingImage}
                                            className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                        />
                                    )}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium text-foreground">
                                        {t("listings.form.photo")} {isUploadingImage && <span className="text-primary italic animate-pulse">(Uploading...)</span>}
                                    </p>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {t("listings.form.upload_tip")} (Max 10 images)
                                    </p>
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

                            {/* Photo Gallery */}
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
                        <div className="space-y-2">
                            <Label htmlFor="cropName">{t("listings.form.crop_name")}</Label>
                            <Input
                                id="cropName"
                                placeholder="e.g. Basmati Rice"
                                value={form.cropName}
                                onChange={(e) => update("cropName", e.target.value)}
                                required
                                className="hover:border-primary/50 transition-colors"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>{t("listings.form.category")}</Label>
                            <Select value={form.category} onValueChange={(v) => update("category", v)}>
                                <SelectTrigger className="hover:border-primary/50 transition-colors"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Grains">Grains</SelectItem>
                                    <SelectItem value="Vegetables">Vegetables</SelectItem>
                                    <SelectItem value="Fruits">Fruits</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="quantity">{t("listings.form.quantity")}</Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    value={form.quantity}
                                    onChange={(e) => update("quantity", e.target.value)}
                                    required
                                    min="1"
                                    className="hover:border-primary/50 transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{t("listings.form.unit")}</Label>
                                <Select value={form.unit} onValueChange={(v) => update("unit", v)}>
                                    <SelectTrigger className="hover:border-primary/50 transition-colors"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="kg">Kilograms (kg)</SelectItem>
                                        <SelectItem value="quintal">Quintal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">{t("listings.form.price_per_unit")}</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₹</span>
                                    <Input
                                        id="price"
                                        type="number"
                                        value={form.pricePerUnit}
                                        onChange={(e) => update("pricePerUnit", e.target.value)}
                                        required
                                        min="1"
                                        className="pl-7 hover:border-primary/50 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>{t("listings.form.quality")}</Label>
                                <Select value={form.qualityGrade} onValueChange={(v) => update("qualityGrade", v)}>
                                    <SelectTrigger className="hover:border-primary/50 transition-colors"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="A">Grade A – Premium</SelectItem>
                                        <SelectItem value="B">Grade B – Standard</SelectItem>
                                        <SelectItem value="C">Grade C – Economy</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="harvestDate">Harvest Date</Label>
                                <Input
                                    id="harvestDate"
                                    type="date"
                                    value={form.harvestDate}
                                    onChange={(e) => update("harvestDate", e.target.value)}
                                    required
                                    className="hover:border-primary/50 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">{t("listings.location")}</Label>
                            <Input
                                id="location"
                                value={form.location}
                                onChange={(e) => update("location", e.target.value)}
                                required
                                className="hover:border-primary/50 transition-colors"
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" className="gradient-hero flex-1 h-12 text-base font-bold text-primary-foreground shadow-card hover:scale-[1.01] transform transition-all active:scale-95" disabled={isSaving}>
                                <Save className="mr-2 h-4 w-4" /> {isSaving ? "Saving..." : t("listings.form.submit")}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => navigate("/listings")} className="h-12 px-8">
                                {t("listings.form.cancel")}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default EditListing;
