import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
    Cloud, CloudRain, Sun, Wind, Droplets, MapPin, Thermometer,
    Eye, Gauge, Leaf, ShoppingBag, AlertTriangle, CheckCircle,
    Wheat, RefreshCw, ChevronRight, ArrowUp, ArrowDown, Minus,
    Sprout, Scissors, Compass, Moon, SunMedium, CloudSun, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sellerApi as api } from "@/lib/api";

// ─── Helpers ────────────────────────────────────────────────────────────────
const getSeasonInfo = () => {
    const month = new Date().getMonth() + 1; // 1-12
    if (month >= 3 && month <= 6) return { name: "Summer / Zaid", key: "summer" };
    if (month >= 7 && month <= 10) return { name: "Kharif / Monsoon", key: "kharif" };
    return { name: "Rabi / Winter", key: "rabi" };
};

const SEASON_CROPS = {
    summer: { seed: ["Moong", "Urad", "Watermelon", "Cucumber"], harvest: ["Wheat (late)", "Mustard"] },
    kharif: { seed: ["Paddy", "Maize", "Soybean", "Groundnut"], harvest: ["Moong", "Urad"] },
    rabi: { seed: ["Wheat", "Mustard", "Chickpea", "Pea"], harvest: ["Paddy", "Maize", "Soybean"] },
};

const WEATHER_ICONS = {
    "01": Sun, "02": CloudSun, "03": Cloud, "04": Cloud,
    "09": CloudRain, "10": CloudRain, "11": AlertTriangle,
    "13": Wind, "50": Wind,
};

const getWeatherIcon = (iconCode) => {
    if (!iconCode) return Sun;
    const key = iconCode.slice(0, 2);
    return WEATHER_ICONS[key] || Cloud;
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const windDirection = (deg) => {
    if (deg === undefined || deg === null) return "N";
    const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return dirs[Math.round(deg / 45) % 8];
};

const uvColor = (uv) => {
    if (uv < 3) return "bg-green-500";
    if (uv < 6) return "bg-yellow-500";
    if (uv < 8) return "bg-orange-500";
    return "bg-red-500";
};

const uvLabel = (uv) => {
    if (uv < 3) return "Low";
    if (uv < 6) return "Moderate";
    if (uv < 8) return "High";
    return "Very High";
};

// ─── Farming Advisory Generator ──────────────────────────────────────────────
const buildAdvisories = (weatherData, season) => {
    const advisories = [];
    if (!weatherData) return advisories;

    const { current } = weatherData;
    if (!current) return advisories;

    const desc = (current.description || "").toLowerCase();
    const temp = current.temp || 25;
    const humidity = current.humidity || 50;
    const rain1h = current.rain_1h || 0;

    // Rain warning
    if (desc.includes("rain") || desc.includes("storm") || rain1h > 0) {
        advisories.push({
            icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50 border-amber-200",
            title: "Rain Alert: Secure Produce",
            desc: "Expected rain. Move harvested grains to safe storage. Avoid applying pesticides today."
        });
    }

    // Sell timing (Intelligence)
    if (temp > 32 && !desc.includes("rain")) {
        advisories.push({
            icon: ShoppingBag, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200",
            title: "Optimal Market Listing",
            desc: "Clear hot weather! Best time to list perishables (tomatoes, greens) to ensure freshness for buyers."
        });
    } else if (desc.includes("clear") || desc.includes("sun")) {
        advisories.push({
            icon: ShoppingBag, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200",
            title: "Post-Harvest Drying",
            desc: "Ideal sun for drying turmeric, chillies, or grains. Higher dryness fetch 15% better prices."
        });
    }

    // Harvest timing
    if (temp >= 18 && temp <= 33 && !desc.includes("rain") && humidity < 75) {
        advisories.push({
            icon: Scissors, color: "text-blue-700", bg: "bg-blue-50 border-blue-200",
            title: "Harvest Time Alert",
            desc: `Perfect window for ${season.key === "kharif" ? "Rice/Maize" : "Wheat/Mustard"} harvest in the next 48 hours.`
        });
    }

    // High temp risk
    if (temp > 38) {
        advisories.push({
            icon: AlertTriangle, color: "text-red-700", bg: "bg-red-50 border-red-200",
            title: "Extreme Heat Management",
            desc: "Heavy evaporation. Irrigate late evening. Provide shade to young nursery saplings."
        });
    }

    if (advisories.length === 0) {
        advisories.push({
            icon: CheckCircle, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200",
            title: "Favourable for Farming",
            desc: "Stable weather. Ideal for general field maintenance, fertilizing, and inspecting crop health."
        });
    }

    return advisories;
};

// ─── Component ───────────────────────────────────────────────────────────────
const WeatherWidget = ({ defaultCity = "Delhi", mode = "full" }) => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchCity, setSearchCity] = useState("");
    const [isDetecting, setIsDetecting] = useState(false);
    const [location, setLocation] = useState(() => {
        try {
            const saved = localStorage.getItem("weatherLocation");
            return saved ? JSON.parse(saved) : { city: defaultCity, lat: null, lon: null };
        } catch { return { city: defaultCity, lat: null, lon: null }; }
    });

    const season = getSeasonInfo();
    const advisories = buildAdvisories(weather, season);

    useEffect(() => {
        if (!localStorage.getItem("weatherLocation_manual") && mode === "full") {
            detectLocation();
        }
    }, [mode]);

    useEffect(() => {
        fetchWeather();
        const interval = setInterval(fetchWeather, 900000);
        return () => clearInterval(interval);
    }, [location]);

    const fetchWeather = async () => {
        setLoading(true); setError(null);
        try {
            const cityName = location.city || defaultCity;
            const params = location.lat && location.lon
                ? `lat=${location.lat}&lon=${location.lon}`
                : `city=${cityName}`;
            const data = await api.getWeather(params);
            if (data && data.current) {
                setWeather(data);
            } else {
                throw new Error("Invalid data");
            }
        } catch (err) {
            setError("Unable to sync weather");
        } finally {
            setLoading(false);
        }
    };

    const detectLocation = () => {
        if ("geolocation" in navigator) {
            setIsDetecting(true);

            // Set a failsafe timeout just in case it hangs
            const fallbackTimeout = setTimeout(() => {
                setIsDetecting(false);
                setLocation({ city: defaultCity, lat: null, lon: null });
            }, 5000);

            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    clearTimeout(fallbackTimeout);
                    setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude, city: null });
                    setIsDetecting(false);
                },
                () => {
                    clearTimeout(fallbackTimeout);
                    setLocation({ city: defaultCity, lat: null, lon: null });
                    setIsDetecting(false);
                },
                { timeout: 4500 }
            );
        } else {
            setLocation({ city: defaultCity, lat: null, lon: null });
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchCity.trim()) return;
        setLocation({ city: searchCity.trim(), lat: null, lon: null });
        localStorage.setItem("weatherLocation_manual", "true");
        setSearchCity("");
    };

    const current = weather?.current;
    const forecast = weather?.forecast || [];
    const IconCmp = current ? getWeatherIcon(current.icon) : Cloud;

    if (loading && !weather) return (
        <div className="h-48 w-full bg-slate-50/50 rounded-3xl flex items-center justify-center border border-slate-100 italic text-slate-400">
            Fetching farming insights...
        </div>
    );

    if (mode === "summary") {
        return (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 border border-white/20 shadow-sm shrink-0 text-white">
                <div className="p-3 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full shadow-inner">
                    <Sun className="h-6 w-6 text-white" />
                </div>
                <div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold tracking-tighter">{Math.round(current?.temp || 0)}°C</span>
                        <span className="text-emerald-50 capitalize font-medium text-sm">{current?.description || "Partly Cloudy"}</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-100/80 text-sm mt-1 font-medium">
                        <MapPin className="h-4 w-4" />
                        <span>{current?.city_name || location.city || "Area near " + (location.lat ? `${location.lat.toFixed(2)}, ${location.lon.toFixed(2)}` : "")}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5 w-full max-w-5xl mx-auto">
            {/* ── MSN STYLE DASHBOARD ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[400px]">

                {/* LEFT: Main Temp & Location */}
                <div className="lg:col-span-4 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-50" />

                    <div>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex flex-col">
                                <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                                    {current?.city_name || (location.city ? location.city : "Region Weather")}
                                    <MapPin className="h-4 w-4 text-sky-500" />
                                </h1>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {season.name}
                                </p>
                            </div>
                            <button onClick={detectLocation} className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-sky-50 hover:text-sky-600 transition-all">
                                <RefreshCw className={`h-4 w-4 ${isDetecting ? "animate-spin" : ""}`} />
                            </button>
                        </div>

                        <div className="flex items-center gap-6 mb-8">
                            <div className="h-20 w-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-lg shadow-orange-100">
                                <IconCmp className="h-12 w-12 text-white" />
                            </div>
                            <div>
                                <div className="flex items-start">
                                    <span className="text-7xl font-black text-slate-800 tracking-tighter leading-none">{Math.round(current?.temp || 0)}</span>
                                    <span className="text-3xl font-black text-slate-300 mt-1 ml-1">°C</span>
                                </div>
                                <p className="text-lg font-black text-emerald-600 capitalize">{current?.description || "Clear Sky"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hi/Lo Today</span>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-black text-red-500 flex items-center gap-1 font-mono"><ArrowUp className="h-3 w-3" />{current?.temp_max ? Math.round(current.temp_max) : Math.round((current?.temp || 25) + 2)}°</span>
                                <span className="text-sm font-black text-blue-500 flex items-center gap-1 font-mono"><ArrowDown className="h-3 w-3" />{current?.temp_min ? Math.round(current.temp_min) : Math.round((current?.temp || 25) - 3)}°</span>
                            </div>
                        </div>

                        <form onSubmit={handleSearch} className="relative">
                            <input
                                value={searchCity}
                                onChange={e => setSearchCity(e.target.value)}
                                placeholder="Change Location..."
                                className="w-full h-12 bg-slate-50 rounded-2xl px-5 text-sm font-bold border-2 border-transparent focus:border-sky-200 outline-none transition-all pr-12"
                            />
                            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600">
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </form>
                    </div>
                </div>

                {/* RIGHT: Grid of MSN Metrics */}
                <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-5">

                    {/* VISIBILITY */}
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
                        <div className="flex items-center gap-2 mb-4">
                            <Eye className="h-4 w-4 text-blue-500" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visibility</span>
                        </div>
                        <p className="text-3xl font-black text-slate-800 mb-1">{Math.round((current?.visibility || 10000) / 1000)} <span className="text-[10px] font-bold text-slate-300">km</span></p>
                        <div className="flex gap-1 mt-auto">
                            {[1, 2, 3, 4, 5].map(i => <div key={i} className={`h-1 flex-1 rounded-full ${i <= 4 ? "bg-emerald-500" : "bg-slate-100"}`} />)}
                        </div>
                    </div>

                    {/* PRESSURE */}
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 mb-4">
                            <Gauge className="h-4 w-4 text-violet-500" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pressure</span>
                        </div>
                        <p className="text-3xl font-black text-slate-800 mb-2">{current?.pressure || "1012"} <span className="text-[10px] font-bold text-slate-300">mb</span></p>
                        <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="absolute top-0 left-[60%] h-full w-2 bg-violet-400 rounded-full shadow-lg" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 mt-2">STABLE / HIGH</p>
                    </div>

                    {/* AQI (Mocked as it's common in MSN) */}
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="h-4 w-4 text-teal-500" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Air Quality</span>
                        </div>
                        <p className="text-3xl font-black text-slate-800 mb-1">54 <span className="text-[10px] font-bold text-slate-300">Moderate</span></p>
                        <div className="h-2 w-full bg-gradient-to-r from-green-500 via-yellow-400 to-red-500 rounded-full" />
                    </div>

                    {/* WIND */}
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
                        <div className="flex items-center gap-2 mb-4">
                            <Wind className="h-4 w-4 text-sky-500" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Wind Speed</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Compass className="h-8 w-8 text-slate-200" />
                            <div>
                                <p className="text-3xl font-black text-slate-800 leading-none">{current?.wind_speed || "12"}</p>
                                <span className="text-[10px] font-black text-slate-400">km/h ({windDirection(current?.wind_deg)})</span>
                            </div>
                        </div>
                    </div>

                    {/* HUMIDITY */}
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
                        <div className="flex items-center gap-2 mb-4">
                            <Droplets className="h-4 w-4 text-sky-600" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Humidity</span>
                        </div>
                        <p className="text-3xl font-black text-slate-800 mb-1">{current?.humidity || "40"}%</p>
                        <div className="flex flex-col gap-1 mt-auto font-mono text-[8px] font-bold text-slate-300">
                            <div className="flex justify-between items-center bg-sky-50 px-2 py-0.5 rounded text-sky-700"><span>DEW POINT</span><span>20°</span></div>
                        </div>
                    </div>

                    {/* UV INDEX */}
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
                        <div className="flex items-center gap-2 mb-4">
                            <SunMedium className="h-4 w-4 text-amber-500" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">UV Index</span>
                        </div>
                        <p className="text-3xl font-black text-slate-800 mb-1">{current?.uvi || "3"}</p>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full w-fit ${uvColor(current?.uvi || 0)} text-white`}>
                            {uvLabel(current?.uvi || 0).toUpperCase()}
                        </span>
                    </div>

                </div>
            </div>

            {/* ── SECOND ROW: FARMING ALERTS ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* ADVANCED HARVEST & SELL INTELLIGENCE */}
                <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <ShoppingBag className="h-32 w-32" />
                    </div>

                    <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2 text-emerald-200">
                        <Leaf className="h-4 w-4" /> Market & Harvest Intelligence
                    </h3>

                    <div className="space-y-4 relative z-10">
                        {advisories.map((adv, idx) => (
                            <div key={idx} className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/10 flex gap-4">
                                <div className="h-10 w-10 shrink-0 bg-white rounded-2xl flex items-center justify-center">
                                    <adv.icon className={`h-5 w-5 ${adv.color.replace('text-', 'text-emerald-')}`} />
                                </div>
                                <div>
                                    <p className="font-black text-sm uppercase tracking-wider">{adv.title}</p>
                                    <p className="text-white/80 text-xs font-medium mt-1 leading-relaxed">{adv.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FORECAST & SEASONS */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2 text-slate-400">
                        <CloudSun className="h-4 w-4" /> 5-Day Agriculture Forecast
                    </h3>

                    <div className="flex flex-col gap-3">
                        {forecast.slice(0, 5).map((day, idx) => {
                            const date = new Date(day.date);
                            const icon = getWeatherIcon(day.icon);
                            const Icon = icon;
                            return (
                                <div key={idx} className="flex items-center justify-between p-3 px-4 rounded-2xl hover:bg-slate-50 transition-colors">
                                    <span className="w-12 text-xs font-black text-slate-500 uppercase">{idx === 0 ? "Today" : DAY_NAMES[date.getDay()]}</span>
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 bg-sky-50 rounded-xl flex items-center justify-center"><Icon className="h-4 w-4 text-sky-500" /></div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-blue-500/60 leading-none">RAIN</span>
                                            <span className="text-xs font-bold text-blue-500 leading-none">{day.rain_probability ? Math.round(day.rain_probability) : 0}%</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <span className="text-sm font-black text-slate-800">{Math.round(day.temp_max)}°</span>
                                            <span className="text-[10px] font-bold text-slate-300 ml-1">{Math.round(day.temp_min)}°</span>
                                        </div>
                                        <div className="w-20 h-1 bg-slate-100 rounded-full overflow-hidden relative">
                                            <div className="absolute top-0 h-full bg-emerald-400 rounded-full" style={{ left: '30%', width: '40%' }} />
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default WeatherWidget;
