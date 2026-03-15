import React from "react";
import { motion } from "framer-motion";
import {
  Thermometer, Droplets, Wind, CloudRain,
  AlertTriangle, CheckCircle2, Leaf, MapPin,
} from "lucide-react";

const ALERT_ICONS = {
  "High Temperature Alert": { icon: Thermometer, color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-200" },
  "Heavy Rain Alert":        { icon: CloudRain,   color: "text-blue-500",   bg: "bg-blue-50",   border: "border-blue-200" },
  "Cold Wave Alert":         { icon: Thermometer, color: "text-sky-500",    bg: "bg-sky-50",    border: "border-sky-200" },
  "Storm Alert":             { icon: Wind,        color: "text-purple-500", bg: "bg-purple-50", border: "border-purple-200" },
};

function AlertBadge({ label }) {
  const cfg = ALERT_ICONS[label] || { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50", border: "border-red-200" };
  const Icon = cfg.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border ${cfg.bg} ${cfg.border}`}
    >
      <Icon className={`h-4 w-4 ${cfg.color} shrink-0`} />
      <span className={`text-xs font-bold ${cfg.color}`}>⚠ {label}</span>
    </motion.div>
  );
}

function MetricPill({ icon: Icon, label, value, color }) {
  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      className="flex flex-col gap-1 items-center bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-sm border border-slate-100/60 min-w-[72px]"
    >
      <Icon className={`h-5 w-5 ${color}`} />
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="text-sm font-black text-slate-800">{value}</p>
    </motion.div>
  );
}

/**
 * WeatherInsightCard - Apple-level minimal weather card backed by real advisory data.
 *
 * Props:
 *  - data: object from /api/weather/current { location, temperature, humidity, rain, windSpeed, weatherCondition, farmingAdvice, alerts }
 *  - isLoading: bool
 *  - crop: optional string – displayed as crop context context tag
 */
function WeatherInsightCard({ data, isLoading, crop }) {
  if (isLoading) {
    return (
      <div className="rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/40 p-8 flex flex-col items-center gap-4 min-h-[240px] justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
        <p className="text-slate-400 font-bold text-sm">Fetching live weather intelligence…</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-[2.5rem] bg-slate-50 border border-slate-200 shadow-sm p-8 flex flex-col items-center gap-3 min-h-[200px] justify-center">
        <AlertTriangle className="h-8 w-8 text-amber-400" />
        <p className="text-slate-500 font-semibold text-sm">Weather data unavailable</p>
        <p className="text-slate-400 text-xs">Check your connection or location settings</p>
      </div>
    );
  }

  const { location, temperature, humidity, rain, windSpeed, weatherCondition, farmingAdvice, alerts = [] } = data;
  const hasAlerts = alerts.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden"
    >
      {/* Header gradient */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-800 p-7 text-white relative overflow-hidden">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute -left-4 bottom-0 h-24 w-24 rounded-full bg-emerald-500/10" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <MapPin className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-300 text-sm font-bold tracking-wide">{location}</span>
              {crop && (
                <span className="ml-2 px-2 py-0.5 bg-white/15 rounded-full text-[9px] font-black uppercase tracking-widest text-emerald-200 border border-white/20">
                  {crop}
                </span>
              )}
            </div>
            <div className="flex items-end gap-2">
              <span className="text-7xl font-black leading-none">{temperature}°</span>
              <span className="text-2xl font-bold text-emerald-200 mb-1">C</span>
            </div>
            <p className="text-emerald-100 font-semibold capitalize mt-2">{weatherCondition}</p>
          </div>

          {/* Metric pills */}
          <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
            <MetricPill icon={Droplets}   label="Humidity" value={`${humidity}%`}     color="text-blue-400" />
            <MetricPill icon={Wind}       label="Wind"     value={`${windSpeed} km/h`} color="text-teal-400" />
            <MetricPill icon={CloudRain}  label="Rain"     value={`${rain} mm`}        color="text-sky-400" />
          </div>
        </div>
      </div>

      {/* Alerts row */}
      {hasAlerts && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="px-6 pt-4 flex flex-wrap gap-2"
        >
          {alerts.map((a, i) => <AlertBadge key={i} label={a} />)}
        </motion.div>
      )}

      {/* Farming Advice */}
      <div className="p-6">
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
          <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm border border-emerald-100">
            {hasAlerts
              ? <AlertTriangle className="h-5 w-5 text-amber-500" />
              : <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            }
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1 flex items-center gap-1">
              <Leaf className="h-3 w-3" /> Farming Advice
            </p>
            <p className="text-slate-700 text-sm font-semibold leading-relaxed">{farmingAdvice}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default WeatherInsightCard;
