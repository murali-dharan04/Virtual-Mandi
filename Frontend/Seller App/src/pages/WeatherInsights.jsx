import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, MapPin, RefreshCw, Leaf, CloudSun, Sprout,
  Wind, Droplets, Sun, TrendingUp, CheckCircle, AlertTriangle,
  Search, Info
} from "lucide-react";
import { sellerApi, BASE_URL } from "@/lib/api";
import PageTransition from "@/components/PageTransition";
import WeatherInsightCard from "@/components/WeatherInsightCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const getSeasonKey = () => {
  const m = new Date().getMonth() + 1;
  if (m >= 3 && m <= 6) return "summer";
  if (m >= 7 && m <= 10) return "kharif";
  return "rabi";
};

const SEASON = {
  summer: { label: "Summer / Zaid", color: "from-amber-500 to-orange-600", crops: ["Moong", "Urad", "Watermelon"] },
  kharif: { label: "Kharif / Monsoon", color: "from-emerald-600 to-teal-700", crops: ["Paddy", "Maize", "Soybean"] },
  rabi:   { label: "Rabi / Winter",   color: "from-indigo-600 to-blue-700",   crops: ["Wheat", "Mustard", "Chickpea"] },
};

const AGRI_TIPS = [
  { icon: Droplets, title: "Drip Irrigation", tip: "Saves 40% water vs flood irrigation." },
  { icon: Sprout, title: "Soil pH 6-7", tip: "Most crops thrive at this range." },
  { icon: TrendingUp, title: "Market Timing", tip: "Stagger harvest to avoid price dips." },
];

const CROPS = ["", "Tomato", "Onion", "Potato", "Rice"];

const WeatherInsights = () => {
  const navigate = useNavigate();
  const saved = localStorage.getItem("sellerUser");
  const sellerUser = saved ? JSON.parse(saved) : null;
  const sellerLocation = sellerUser?.location || sellerUser?.district || "Delhi";

  const [weatherData, setWeatherData]   = useState(null);
  const [locationName, setLocationName] = useState(sellerLocation);
  const [isLoading, setIsLoading]       = useState(true);
  const [geoError, setGeoError]         = useState(null);
  const [selectedCrop, setSelectedCrop] = useState("");

  const fetchWeather = async (params) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("sellerToken");
      const res = await fetch(`${BASE_URL}/api/weather/current?${params}${selectedCrop ? `&crop=${selectedCrop}` : ""}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data?.location) {
        setWeatherData(data);
        setLocationName(data.location);
      }
    } catch (e) {
      console.error(e);
      setGeoError("Weather offline");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(`city=${sellerLocation}`);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        fetchWeather(`lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
      }, null, { timeout: 5000 });
    }
  }, []);

  useEffect(() => {
    if (locationName) fetchWeather(`city=${locationName}`);
  }, [selectedCrop]);

  const season = SEASON[getSeasonKey()];

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto pb-24 px-2">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-9 w-9 rounded-xl border border-slate-100">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase italic leading-none">Agri Intelligence</h1>
              <p className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-widest flex items-center gap-1">
                <MapPin className="h-2 w-2 text-emerald-500" /> {locationName || "Detecting..."}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => fetchWeather(`city=${locationName}`)} className="h-9 w-9 rounded-xl border border-slate-100">
            <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Crop Chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-4 scrollbar-hide">
          {CROPS.map(c => (
            <button 
              key={c}
              onClick={() => setSelectedCrop(c)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border ${
                selectedCrop === c 
                ? "bg-emerald-600 text-white border-emerald-600 shadow-md" 
                : "bg-white dark:bg-slate-900 text-slate-500 border-slate-100 dark:border-slate-800"
              }`}
            >
              {c || "General"}
            </button>
          ))}
        </div>

        {/* Main Weather Card (High Density) */}
        <div className="mb-6">
          <WeatherInsightCard data={weatherData} isLoading={isLoading} crop={selectedCrop} />
        </div>

        {/* Season & Sowing */}
        <div className={`rounded-[1.5rem] bg-gradient-to-br ${season.color} p-5 text-white shadow-lg relative overflow-hidden mb-6`}>
          <div className="absolute top-0 right-0 p-4 opacity-10"><CloudSun className="h-16 w-16" /></div>
          <p className="text-[8px] font-black uppercase tracking-[0.2em] mb-1 opacity-70">Current Season</p>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black italic uppercase">{season.label}</h2>
            <div className="flex gap-1">
                {season.crops.map(c => <Badge key={c} className="bg-white/20 border-none text-[8px] font-black uppercase">{c}</Badge>)}
            </div>
          </div>
        </div>

        {/* Agri Tips (Compact List) */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Farmer Advisory</h3>
          <div className="grid grid-cols-1 gap-2">
            {AGRI_TIPS.map((tip, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-50 dark:border-slate-800 shadow-sm">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <tip.icon className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase leading-none mb-1">{tip.title}</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase leading-none">{tip.tip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pro Insight Card */}
        <div className="mt-8 bg-indigo-600 rounded-2xl p-4 text-white shadow-md flex items-start gap-3 group">
            <Info className="h-4 w-4 text-indigo-300 mt-0.5 shrink-0" />
            <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-indigo-200 mb-1">AI INSIGHT</p>
                <p className="text-[11px] font-black leading-relaxed">Ensure moisture is below 12% before mandi arrival to secure a premium price.</p>
            </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default WeatherInsights;
