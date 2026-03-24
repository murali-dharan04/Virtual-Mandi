import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, MapPin, RefreshCw, Leaf, CloudSun, Sprout,
  Wind, Droplets, Sun, TrendingUp, CheckCircle, AlertTriangle,
  Search,
} from "lucide-react";
import { sellerApi, BASE_URL } from "@/lib/api";

/* ── Season helper ─────────────────────────────────────── */
const getSeasonKey = () => {
  const m = new Date().getMonth() + 1;
  if (m >= 3 && m <= 6) return "summer";
  if (m >= 7 && m <= 10) return "kharif";
  return "rabi";
};

const SEASON = {
  summer: { label: "Summer / Zaid", color: "from-amber-400 to-orange-500", crops: ["Moong", "Urad", "Watermelon", "Cucumber", "Zucchini"] },
  kharif: { label: "Kharif / Monsoon", color: "from-emerald-400 to-teal-600", crops: ["Paddy", "Maize", "Soybean", "Groundnut", "Cotton"] },
  rabi:   { label: "Rabi / Winter",   color: "from-sky-400 to-blue-600",   crops: ["Wheat", "Mustard", "Chickpea", "Pea", "Barley"] },
};

const AGRI_TIPS = [
  { icon: Leaf,      title: "Drip Irrigation",    tip: "Saves 40% water vs flood irrigation and improves yield by 15%.",        color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
  { icon: Sprout,    title: "Soil pH Check",       tip: "Most crops thrive at pH 6–7. Test soil before sowing.",                 color: "text-lime-700",   bg: "bg-lime-50 border-lime-200" },
  { icon: Wind,      title: "Wind Breaks",         tip: "Bamboo rows reduce wind damage and retain soil moisture.",              color: "text-sky-600",    bg: "bg-sky-50 border-sky-200" },
  { icon: TrendingUp,title: "Market Timing",       tip: "Stagger harvest by 1–2 weeks to avoid price dips from oversupply.",    color: "text-violet-600", bg: "bg-violet-50 border-violet-200" },
  { icon: Droplets,  title: "Pest Scouting",       tip: "Scout fields twice a week to catch 90% of pest outbreaks early.",      color: "text-blue-600",   bg: "bg-blue-50 border-blue-200" },
  { icon: Sun,       title: "Post-Harvest Drying", tip: "Sun-dry grains to <12% moisture for safe storage and 15% better price.",color: "text-amber-600",  bg: "bg-amber-50 border-amber-200" },
];

const HARVEST_CHECKLIST = [
  { label: "Check grain moisture content (target: <12% for storage)", ok: true },
  { label: "Inspect field for pest and disease damage",                ok: true },
  { label: "Arrange transport and storage containers in advance",      ok: false },
  { label: "Monitor weather forecast for rain-free harvest window",    ok: true },
  { label: "Update listing price based on mandi rate trends",          ok: false },
  { label: "Contact local buyers / commission agents",                 ok: false },
];

const CROPS = ["", "Tomato", "Onion", "Potato", "Banana", "Rice"];

const containerVar = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const itemVar = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 110 } } };

/* ── Main Component ──────────────────────────────── */
const WeatherInsights = () => {
  const navigate = useNavigate();
  const saved = localStorage.getItem("sellerUser");
  const sellerUser = saved ? JSON.parse(saved) : null;
  const sellerLocation = sellerUser?.location || sellerUser?.district || "Delhi";

  const [weatherData, setWeatherData]   = useState(null);
  const [locationName, setLocationName] = useState(sellerLocation);
  const [isLoading, setIsLoading]       = useState(true);
  const [geoError, setGeoError]         = useState(null);
  const [geoDenied, setGeoDenied]       = useState(false);
  const [selectedCrop, setSelectedCrop] = useState("");
  const [citySearch, setCitySearch]     = useState("");

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
      } else if (data?.error) {
        setGeoError(data.error);
        setWeatherData(null);
      }
    } catch (e) {
      setGeoError("Failed to load weather.");
      setWeatherData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const isWithinIndia = (lat, lon) => {
    return lat >= 6 && lat <= 38 && lon >= 68 && lon <= 98;
  };

  const detectAndLoad = () => {
    setIsLoading(true);
    setGeoError(null);
    setGeoDenied(false);

    if (!("geolocation" in navigator)) {
      setGeoDenied(true);
      fetchWeather(`city=${sellerLocation}`);
      return;
    }

    const fallbackTimer = setTimeout(() => {
      setGeoDenied(true);
      fetchWeather(`city=${sellerLocation}`);
    }, 5000);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(fallbackTimer);
        setGeoDenied(false);
        const { latitude, longitude } = pos.coords;
        if (!isWithinIndia(latitude, longitude)) {
          fetchWeather(`city=${sellerLocation}`);
        } else {
          fetchWeather(`lat=${latitude}&lon=${longitude}`);
        }
      },
      () => {
        clearTimeout(fallbackTimer);
        setGeoDenied(true);
        fetchWeather(`city=${sellerLocation}`);
      },
      { timeout: 4500, enableHighAccuracy: true }
    );
  };

  const handleCitySearch = (e) => {
    e.preventDefault();
    const city = citySearch.trim();
    if (!city) return;
    setLocationName(city);
    setCitySearch("");
    setGeoDenied(false);
    fetchWeather(`city=${city}`);
  };

  useEffect(() => { detectAndLoad(); }, []);
  // Re-fetch when crop changes
  useEffect(() => {
    if (locationName) fetchWeather(`city=${locationName}`);
  }, [selectedCrop]);

  const season = SEASON[getSeasonKey()];

  return (
    <PageTransition>
      <motion.div variants={containerVar} initial="hidden" animate="show"
        className="pb-24 px-4 md:px-6 max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <motion.div variants={itemVar} className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}
            className="h-11 w-11 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Weather Intelligence
            </h1>
            <p className="text-slate-400 text-sm font-medium mt-0.5 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-emerald-500" />
              {locationName}
            </p>
          </div>
          <Button variant="ghost" size="icon"
            className="h-11 w-11 rounded-2xl border border-slate-100 dark:border-slate-800"
            onClick={detectAndLoad}>
            <RefreshCw className={`h-4 w-4 text-slate-500 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </motion.div>

        {/* Crop Selector */}
        <motion.div variants={itemVar}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your Crop:</span>
            {CROPS.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCrop(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCrop === c
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {c || "General"}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Geo Denied Banner + Manual Search */}
        {geoDenied && (
          <motion.div variants={itemVar}
            className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 flex-1">
              <MapPin className="h-4 w-4 text-amber-500 shrink-0" />
              <p className="text-amber-700 text-sm font-semibold">
                Location access denied — showing weather for <strong>{locationName}</strong>.
              </p>
            </div>
            <form onSubmit={handleCitySearch} className="flex items-center gap-2 w-full sm:w-auto">
              <input
                value={citySearch}
                onChange={e => setCitySearch(e.target.value)}
                placeholder="Enter your city…"
                className="h-9 flex-1 sm:w-44 rounded-xl border border-amber-200 bg-white px-3 text-sm font-semibold outline-none focus:border-amber-400 transition-all"
              />
              <button type="submit"
                className="h-9 px-3 rounded-xl bg-amber-500 text-white font-bold text-xs flex items-center gap-1 hover:bg-amber-600 transition-colors">
                <Search className="h-3.5 w-3.5" /> Search
              </button>
            </form>
          </motion.div>
        )}

        {/* Live Weather Card */}
        <motion.div variants={itemVar}>
          {geoError && !isLoading && (
            <div className="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
              <p className="text-amber-700 text-sm font-semibold">{geoError}</p>
            </div>
          )}
          <WeatherInsightCard data={weatherData} isLoading={isLoading} crop={selectedCrop} />
        </motion.div>

        {/* Season Banner */}
        <motion.div variants={itemVar}
          className={`rounded-3xl bg-gradient-to-br ${season.color} p-7 text-white shadow-xl relative overflow-hidden`}>
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <CloudSun className="h-28 w-28" />
          </div>
          <div className="relative z-10">
            <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Current Season</p>
            <h2 className="text-2xl font-black mb-4">{season.label}</h2>
            <p className="text-white/70 text-xs font-bold uppercase mb-2">Recommended Crops to Sow</p>
            <div className="flex flex-wrap gap-2">
              {season.crops.map(crop => (
                <span key={crop} className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold border border-white/20">
                  {crop}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Agri Tips */}
        <motion.div variants={itemVar}>
          <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Leaf className="h-5 w-5 text-emerald-500" />
            Agricultural Best Practices
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {AGRI_TIPS.map((tip, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`p-5 rounded-2xl border ${tip.bg} flex gap-4`}>
                <div className="h-10 w-10 rounded-xl bg-white/70 flex items-center justify-center shrink-0 border border-black/5">
                  <tip.icon className={`h-5 w-5 ${tip.color}`} />
                </div>
                <div>
                  <p className={`text-sm font-black ${tip.color} mb-1`}>{tip.title}</p>
                  <p className="text-slate-600 text-xs leading-relaxed">{tip.tip}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Harvest Checklist */}
        <motion.div variants={itemVar}>
          <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            Pre-Harvest Readiness Checklist
          </h2>
          <Card className="rounded-3xl border-0 shadow-sm bg-white dark:bg-slate-900">
            <CardContent className="p-6 space-y-3">
              {HARVEST_CHECKLIST.map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-1">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${item.ok ? "bg-emerald-100" : "bg-slate-100"}`}>
                    {item.ok
                      ? <CheckCircle className="h-4 w-4 text-emerald-600" />
                      : <AlertTriangle className="h-4 w-4 text-slate-400" />}
                  </div>
                  <p className={`text-sm font-semibold ${item.ok ? "text-slate-700" : "text-slate-400"}`}>{item.label}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

      </motion.div>
    </PageTransition>
  );
};

export default WeatherInsights;
