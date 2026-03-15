import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, Leaf, AlertCircle, CheckCircle2, Info, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { sellerApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const DiseaseLab = () => {
    const { toast } = useToast();
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

        // Simulation for premium feel
        const timer = setInterval(() => {
            setProgress(prev => (prev >= 90 ? prev : prev + 10));
        }, 300);

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
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 pb-12"
        >
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-slate-950 to-emerald-950 p-12 shadow-2xl border border-white/5">
                <div className="absolute top-0 right-0 h-64 w-64 bg-emerald-500/10 blur-[100px] animate-pulse-soft" />
                <div className="relative z-10 max-w-2xl">
                    <Badge className="mb-4 bg-emerald-500/20 text-emerald-400 border-none px-4 py-1.5 backdrop-blur-xl">AI Plant Pathology</Badge>
                    <h1 className="text-5xl font-black text-white tracking-tighter italic leading-none mb-4">Disease Lab</h1>
                    <p className="text-slate-400 text-lg font-medium leading-relaxed">
                        Identify crop diseases instantly using advanced computer vision. 
                        Protect your harvest with AI-driven treatment insights.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Upload Section */}
                <div className="lg:col-span-5 space-y-6">
                    <Card className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
                        <CardContent className="p-8">
                            <div className="relative aspect-square rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center overflow-hidden group hover:border-emerald-500/50 transition-all duration-500">
                                {preview ? (
                                    <>
                                        <img src={preview} alt="Preview" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <label className="cursor-pointer bg-white text-slate-900 px-6 py-3 rounded-2xl font-bold shadow-xl flex items-center gap-2">
                                                <Camera className="h-5 w-5" /> Change Photo
                                                <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                                            </label>
                                        </div>
                                    </>
                                ) : (
                                    <label className="cursor-pointer flex flex-col items-center text-center p-8 w-full h-full justify-center">
                                        <div className="h-20 w-20 rounded-3xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                            <Upload className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <p className="text-xl font-bold text-slate-900 dark:text-white">Upload Infected Leaf</p>
                                        <p className="text-slate-400 text-sm mt-2 max-w-[200px]">Drag and drop or click to capture from field</p>
                                        <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                                    </label>
                                )}
                            </div>

                            <Button 
                                className="w-full h-16 rounded-2xl mt-8 bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-xs shadow-xl disabled:opacity-50"
                                onClick={runAnalysis}
                                disabled={!image || isAnalyzing}
                            >
                                {isAnalyzing ? (
                                    <div className="flex items-center gap-3">
                                        <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        Analyzing Specimens...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Leaf className="h-5 w-5" /> Start AI Diagnostics
                                    </div>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2rem] bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-900/5 border-emerald-100 dark:border-emerald-800/50 overflow-hidden">
                         <CardContent className="p-6 flex gap-4 items-start">
                             <div className="h-10 w-10 rounded-xl bg-white dark:bg-emerald-800 flex items-center justify-center shadow-sm shrink-0">
                                 <Info className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                             </div>
                             <div>
                                <p className="font-bold text-emerald-900 dark:text-emerald-400">Pro Tip</p>
                                <p className="text-sm text-emerald-700/80 dark:text-emerald-500/80 leading-relaxed">
                                    For best results, ensure the leaf is well-lit and centered against a neutral background. Catch diseases early to save up to 40% of yield loss.
                                </p>
                             </div>
                         </CardContent>
                    </Card>
                </div>

                {/* Results Section */}
                <div className="lg:col-span-7">
                    <AnimatePresence mode="wait">
                        {isAnalyzing ? (
                            <motion.div 
                                key="analyzing"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="h-full flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl"
                            >
                                <div className="relative h-48 w-48 mb-8">
                                    <div className="absolute inset-0 border-[3px] border-emerald-500/20 rounded-full" />
                                    <motion.div 
                                        className="absolute inset-0 border-[3px] border-emerald-500 border-t-transparent rounded-full"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-4xl font-black text-slate-900 dark:text-white uppercase italic">{progress}%</span>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Deep Scanning Specimen</h3>
                                <p className="text-slate-400 max-w-xs font-medium">Cross-referencing leaf patterns with 50,000+ pathological signatures...</p>
                            </motion.div>
                        ) : result ? (
                            <motion.div 
                                key="result"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <Card className="rounded-[3rem] border-slate-100 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-2xl">
                                    <div className="bg-emerald-500 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                                        <div className="flex items-center gap-6">
                                            <div className="h-20 w-20 rounded-3xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                                                <AlertCircle className="h-10 w-10 text-white" />
                                            </div>
                                            <div className="text-white">
                                                <p className="text-emerald-100 font-bold uppercase tracking-widest text-xs mb-1">Diagnosis Found</p>
                                                <h3 className="text-3xl font-black italic leading-none">{result.disease}</h3>
                                            </div>
                                        </div>
                                        <div className="bg-white/10 px-6 py-4 rounded-3xl backdrop-blur-md text-center border border-white/10">
                                            <p className="text-emerald-50 font-bold text-xs uppercase mb-1">Confidence</p>
                                            <p className="text-3xl font-black text-white leading-none">{result.confidence}%</p>
                                        </div>
                                    </div>
                                    
                                    <CardContent className="p-10 space-y-8">
                                        <div>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                                </div>
                                                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Recommended Treatment</h4>
                                            </div>
                                            <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 font-medium">
                                                {result.treatment}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Button variant="outline" className="h-16 rounded-[1.5rem] border-slate-100 dark:border-slate-800 font-black uppercase tracking-widest text-[10px] group">
                                                Get Detailed Report <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                            <Button className="h-16 rounded-[1.5rem] bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[10px]">
                                                Purchase Pesticides
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-slate-50 dark:bg-slate-900/20 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 group transition-all duration-500">
                                <Leaf className="h-24 w-24 text-slate-200 dark:text-slate-800 mb-6 group-hover:scale-110 transition-transform duration-700" />
                                <h3 className="text-2xl font-black text-slate-400 dark:text-slate-700 italic">No Analysis Yet</h3>
                                <p className="text-slate-400 dark:text-slate-700 text-sm mt-2 max-w-[240px] font-medium leading-relaxed">
                                    Capture or upload a picture of an infected leaf to generate a custom diagnosis report.
                                </p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default DiseaseLab;
