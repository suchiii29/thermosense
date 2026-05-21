// Dashboard.jsx – Uses LeafletMap component (no inline Leaflet code)
import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Info, Thermometer, Layers, Wind } from 'lucide-react';
import { CITIES } from '../data/cities';
import LeafletMap from './LeafletMap';

// cities.js stores center as [lng, lat] (GeoJSON order).
// Leaflet needs [lat, lng]. This helper swaps the pair.
const toLeafletCenter = (center) => [center[1], center[0]];

export default function Dashboard({ activeCity, onCityChange, activeZone, setActiveZone }) {
  const cityData = CITIES[activeCity];
  const zones = cityData.zones;

  // Compute Leaflet-order center once per city
  const leafletCenter = useMemo(() => toLeafletCenter(cityData.center), [cityData.center]);

  // 48-hour forecast from activeZone
  const forecastData = useMemo(() => {
    if (!activeZone) return [];
    const baseTemp = activeZone.temperature;
    const now = new Date();
    const data = [];
    for (let i = 0; i < 48; i++) {
      const hourDate = new Date(now.getTime() + i * 3600000);
      const hour = hourDate.getHours();
      const diurnalOffset = Math.sin((hour - 9) * Math.PI / 12) * 4.5;
      const temp = Number((baseTemp + diurnalOffset).toFixed(1));
      const humidityFactor = activeZone.type === 'Informal Settlement' ? 1.25 : 1.1;
      const apparentTemp = Number((temp + (humidityFactor * (temp - 30) * 0.15)).toFixed(1));
      const timeStr = hourDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
      const dayStr = i < 24 ? 'Today' : 'Tomorrow';
      data.push({ time: `${dayStr} ${timeStr}`, temp, apparent: apparentTemp, dangerThreshold: 40 });
    }
    return data;
  }, [activeZone]);

  const getRiskBadge = (score) => {
    if (score < 30) return <span className="px-2 py-0.5 text-[10px] rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">Low Risk</span>;
    if (score < 60) return <span className="px-2 py-0.5 text-[10px] rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">Moderate</span>;
    if (score < 85) return <span className="px-2 py-0.5 text-[10px] rounded bg-orange-500/10 border border-orange-500/20 text-orange-400">High Risk</span>;
    return <span className="px-2 py-0.5 text-[10px] rounded bg-red-500/15 border border-red-500/25 text-red-400 animate-pulse">Critical</span>;
  };

  const getAnomalyTextColor = (val) => {
    if (val < 0) return 'text-sky-400';
    if (val < 3) return 'text-emerald-400';
    if (val < 5) return 'text-amber-400';
    if (val < 7) return 'text-orange-500';
    return 'text-red-500 font-extrabold';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-80px)] overflow-hidden">
      {/* Left side – City selector & Map */}
      <div className="lg:col-span-2 flex flex-col space-y-4 h-full">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-2xl border border-brand-border">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Select City:</span>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(CITIES).map(cKey => (
                <button
                  key={cKey}
                  onClick={() => onCityChange(cKey)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${activeCity === cKey ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md shadow-orange-500/10' : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-slate-100'}`}
                >
                  {CITIES[cKey].name}
                </button>
              ))}
            </div>
          </div>
          <div className="text-[11px] text-slate-400 italic hidden md:block">
            {cityData.description.substring(0, 85)}...
          </div>
        </div>

        {/* Leaflet map – NO key prop, never remounts */}
        <div className="relative flex-1 rounded-2xl border border-brand-border overflow-hidden bg-slate-950">
          <LeafletMap
            cityCenter={leafletCenter}
            cityZoom={cityData.zoom}
            zones={zones}
            selectedZone={activeZone}
            onZoneSelect={setActiveZone}
          />
          {/* Thermal legend overlay */}
          <div className="absolute bottom-4 right-4 z-10 p-3 bg-slate-950/80 backdrop-blur-md border border-brand-border rounded-xl shadow-2xl text-[10px] space-y-2">
            <span className="font-semibold text-slate-300 block mb-1">Temperature (°C)</span>
            <div className="space-y-1">
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm inline-block bg-[#7c3aed]" /><span className="text-slate-400">&gt;43°C — Extreme</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm inline-block bg-[#ef4444]" /><span className="text-slate-400">&gt;40°C — High</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm inline-block bg-[#f59e0b]" /><span className="text-slate-400">&gt;37°C — Moderate</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm inline-block bg-[#3b82f6]" /><span className="text-slate-400">&lt;37°C — Normal</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side – Zone details and forecast */}
      <div className="h-full flex flex-col space-y-4 overflow-y-auto pr-1">
        {activeZone ? (
          <>
            <div className="glass-card rounded-2xl border border-brand-border p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-brand-highlight tracking-widest uppercase bg-brand-highlight/10 px-2.5 py-0.5 rounded-full">{activeZone.type}</span>
                  <h2 className="text-base font-bold text-slate-100 mt-2 leading-snug">{activeZone.name}</h2>
                </div>
                {getRiskBadge(activeZone.riskScore)}
              </div>

              {/* Thermal metrics */}
              <div className="grid grid-cols-2 gap-3.5 pt-2">
                <div className="bg-slate-950/40 p-3 rounded-xl border border-brand-border">
                  <div className="flex items-center text-slate-500 gap-1 mb-1">
                    <Thermometer className="h-3.5 w-3.5" />
                    <span className="text-[10px] uppercase font-semibold">Zone Temp</span>
                  </div>
                  <span className="text-xl font-black text-slate-200 font-mono">{activeZone.temperature}°C</span>
                </div>
                <div className="bg-slate-950/40 p-3 rounded-xl border border-brand-border">
                  <div className="flex items-center text-slate-500 gap-1 mb-1">
                    <Layers className="h-3.5 w-3.5" />
                    <span className="text-[10px] uppercase font-semibold">Anomaly</span>
                  </div>
                  <span className={`text-xl font-black font-mono ${getAnomalyTextColor(activeZone.tempAnomaly)}`}>+{activeZone.tempAnomaly}°C</span>
                </div>
              </div>

              {/* Surface attributes */}
              <div className="space-y-2.5 pt-2 border-t border-brand-border/40">
                <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">Surface Characteristics</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Surface Albedo (Reflectance)</span>
                    <span className="font-mono text-slate-300">{activeZone.metrics.albedo}</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5">
                    <div className="bg-brand-highlight h-1.5 rounded-full" style={{ width: `${activeZone.metrics.albedo * 100}%` }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Vegetation Canopy Cover</span>
                    <span className="font-mono text-emerald-400">{activeZone.metrics.vegetationCover}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${activeZone.metrics.vegetationCover}%` }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Paved / Built‑up Ratio</span>
                    <span className="font-mono text-red-400">{activeZone.metrics.builtRatio}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5">
                    <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${activeZone.metrics.builtRatio}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* 48-hour forecast chart */}
            <div className="glass-card rounded-2xl border border-brand-border p-5 flex-1 flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Wind className="h-4 w-4 text-orange-400" />
                    48‑Hour Microclimate Risk Forecast
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Simulated diurnal temperature &amp; heat index cycle</p>
                </div>
              </div>
              <div className="flex-1 min-h-[160px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecastData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorApparent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 8 }} interval={8} axisLine={false} tickLine={false} />
                    <YAxis domain={['auto', 'auto']} tick={{ fill: '#64748b', fontSize: 8 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '10px', color: '#f8fafc' }} />
                    <Area type="monotone" dataKey="apparent" name="Heat Index (Humid)" stroke="#f97316" strokeWidth={1.5} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorApparent)" />
                    <Area type="monotone" dataKey="temp" name="Ambient Temp" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorTemp)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-slate-950/40 p-3 rounded-xl border border-brand-border/60 flex items-start gap-2">
                <Info className="h-4 w-4 text-brand-highlight flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Peak heat occurs around 15:00. The dashed line shows the <strong className="text-orange-400">Heat Index</strong>, representing the higher felt temperature due to humidity and pavement heat radiation.
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-xs glass-card rounded-2xl border border-brand-border p-6 text-center">
            Click a zone on the map to analyze.
          </div>
        )}
      </div>
    </div>
  );
}
