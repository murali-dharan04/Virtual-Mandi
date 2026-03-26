import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, Leaf, AlertCircle, CheckCircle2, Info, ArrowRight, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { sellerApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import PageTransition from "@/components/PageTransition";

const DiseaseLab = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [progress, setProgress] = useState(0);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setResult(null);
        }
    };

    const runAnalysis = async () => {
        if (!image) {
            toast({ title: "No Image", description: "Please upload a leaf image first.", variant: "destructive" });
            return;
        }

        setIsAnalyzing(true);
        setResult(null);
        setProgress(0);

        const timer = setInterval(() => {
            setProgress(prev => (prev >= 95 ? prev : prev + 5));
        }, 150);

        try {
            const res = await sellerApi.detectDisease(image);
            clearInterval(timer);
            setProgress(100);
            
            setTimeout(() => {
                setResult(res);
                setIsAnalyzing(false);
            }, 500);
        } catch (error) {
            clearInterval(timer);
            setIsAnalyzing(false);
            toast({ 
                title: "Analysis Failed", 
                description: "AI engine is busy. Please try again.", 
                variant: "destructive" 
            });
        }
    };

    return (
        <PageTransition>
            <div className="max-w-xl mx-auto pb-24 px-2">
                {/* Compact Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-9 w-9 rounded-xl border border-slate-100">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase italic leading-none">Disease Lab</h1>
                            <p className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-widest flex items-center gap-1">
                                <Badge className="bg-emerald-500/10 text-emerald-600 border-none p-0 px-1 text-[8px] font-black">AI POWERED</Badge>
                                PLant Pathology
                            </p>
                        </div>
                    </div>
                </div>

                {/* Upload Section (Always Visible or Collapsible) */}
                <Card className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-4 mb-6 shadow-sm">
                    <div className={`relative aspect-video flex flex-col items-center justify-center rounded-xl transition-all duration-500 overflow-hidden ${preview ? "border-0" : "border-2 border-dashed border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50"}`}>
                        {preview ? (
                            <>
                                <img src={preview} alt="Specimen" className="h-full w-full object-cover" />
                                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera className="h-6 w-6 text-white" />
                                    <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                                </label>
                            </>
                        ) : (
                            <label className="cursor-pointer flex flex-col items-center text-center p-6">
                                <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-3">
                                    <Upload className="h-5 w-5 text-emerald-600" />
                                </div>
                                <p className="text-xs font-black text-slate-900 dark:text-white uppercase italic">Upload Leaf Specimen</p>
                                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">DRAG OR TAP TO CAPTURE</p>
                                <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                            </label>
                        )}
                    </div>

                    <Button 
                        className="w-full h-12 rounded-xl mt-4 bg-slate-900 hover:bg-black text-white dark:bg-slate-100 dark:text-slate-900 font-black uppercase tracking-widest text-[10px] shadow-lg disabled:opacity-50 active:scale-95 transition-all"
                        onClick={runAnalysis}
                        disabled={!image || isAnalyzing}
                    >
                        {isAnalyzing ? (
                            <div className="flex items-center gap-2">
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                ANALYZING {progress}%
                            </div>
                        ) : (
                            "START AI DIAGNOSTICS"
                        )}
                    </Button>
                </Card>

                {/* Results / Insight Card */}
                <AnimatePresence mode="wait">
                    {result ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            <Card className="rounded-[2rem] border-emerald-100 bg-emerald-50/30 dark:bg-emerald-500/5 dark:border-emerald-900/30 p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-5">
                                    <Leaf className="h-20 w-20 text-emerald-600" />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <Badge className="bg-emerald-600 text-white border-none px-2 py-0 text-[8px] font-black uppercase">DIAGNOSIS FOUND</Badge>
                                        <span className="text-[10px] font-black text-emerald-600 uppercase italic">{result.confidence}% CONFIDENCE</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic leading-none mb-4">{result.disease}</h3>
                                    
                                    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-emerald-100 dark:border-emerald-900/30">
                                        <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3" /> Recommended Treatment</p>
                                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed">{result.treatment}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mt-4">
                                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-black uppercase tracking-widest h-9 shadow-md">
                                            BUY PESTICIDES
                                        </Button>
                                        <Button variant="outline" size="sm" className="border-emerald-200 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest h-9">
                                            FULL REPORT
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ) : !isAnalyzing && (
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-dashed border-slate-100 dark:border-slate-800 p-8 text-center group">
                            <Info className="h-10 w-10 text-slate-200 dark:text-slate-800 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest italic">Waiting for analysis...</p>
                        </div>
                    )}
                </AnimatePresence>

                {/* Bottom Tip */}
                <div className="mt-8 flex items-start gap-3 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                    <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">PRO TIP</p>
                        <p className="text-[9px] font-bold text-slate-500 leading-normal uppercase">Catch diseases early to save up to 40% yield. Ensure good lighting for scan.</p>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default DiseaseLab;
