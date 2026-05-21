// Dashboard.jsx - Leaflet implementation
import React, { useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MapPin, Info, Thermometer, ShieldAlert, Layers, Wind, Eye, Sparkles } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import CITIES from '../data/cities';

const handleSliderChange = (key, value) => {
  switch (key) {
    case 'coolRoofs':
      setCoolRoofs(value);
      break;
    case 'forestry':
      setForestry(value);
      break;
    case 'pavements':
      setPavements(value);
      break;
    default:
      break;
  }
};

export default function Dashboard({ activeCity, setActiveCity, activeZone, setActiveZone, config, onOpenSettings }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const forecastDataRef = useRef([]);
  const [forecastData, setForecastData] = React.useState([]);
  const [viewMode, setViewMode] = React.useState('temperature'); // currently unused but kept for future features

  const cityData = CITIES[activeCity];
  const zones = cityData.zones;

  // Set default active zone when city changes
  useEffect(() => {
    const defaultZone = zones.find(z => z.id.startsWith(activeCity)) || zones[0];
    setActiveZone(defaultZone);
  }, [activeCity, zones, setActiveZone]);

  // Generate 48‑hour forecast data
  useEffect(() => {
    if (!activeZone) return;
    const baseTemp = activeZone.temperature;
    const now = new Date();
    const data = [];
    for (let i = 0; i < 48; i++) {
      const hourDate = new Date(now.getTime() + i * 60 * 60 * 1000);
      const hour = hourDate.getHours();
      const diurnalOffset = Math.sin((hour - 9) * Math.PI / 12) * 4.5;
      const temp = Number((baseTemp + diurnalOffset).toFixed(1));
      const humidityFactor = activeZone.type === 'Informal Settlement' ? 1.25 : 1.1;
      const apparentTemp = Number((temp + (humidityFactor * (temp - 30) * 0.15)).toFixed(1));
      const timeStr = hourDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
      const dayStr = i < 24 ? 'Today' : 'Tomorrow';
      data.push({ time: `${dayStr} ${timeStr}`, temp, apparent: apparentTemp, dangerThreshold: 40 });
    }
    setForecastData(data);
  }, [activeZone]);

  // Utility to get zone fill color based on anomaly or heat index
  const getZoneColor = (zone) => {
    const val = zone.tempAnomaly ?? 0;
    if (val > 40) return 'red';
    if (val > 37) return 'orange';
    return 'blue';
  };

  // Draw simple polygon shapes if provided (runs after map is initialized)
  useEffect(() => {
    if (!mapRef.current) return;
    console.log('Drawing zones', zones.map(z => ({ id: z.id, hasPolygon: !!z.polygon })));
    zones.forEach((z) => {
      if (z.polygon && Array.isArray(z.polygon)) {
        const poly = L.polygon(z.polygon, { color: getZoneColor(z), fillOpacity: 0.4 });
        poly.on('click', () => setActiveZone(z));
        poly.addTo(mapRef.current);
      }
    });
    // No cleanup needed; Leaflet handles layer removal on map destroy
  }, [zones, mapRef.current]);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    const map = L.map(mapContainerRef.current, {
      center: cityData.center,
      zoom: cityData.zoom,
      zoomControl: false,
      attributionControl: false,
      maxZoom: 18,
      minZoom: 5,
      scrollWheelZoom: true,
    });
    mapRef.current = map;

    // OSM tile layer with dark filter to match theme
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Create GeoJSON layer for zones
    const geoJsonLayer = L.geoJSON(
      {
        type: 'FeatureCollection',
        features: zones.map(z => ({
          type: 'Feature',
          geometry: z.geojson.geometry,
          properties: {
            id: z.id,
            name: z.name,
            anomaly: z.tempAnomaly,
            risk: z.riskScore,
            temperature: z.temperature,
          }
        }))
      },
      {
        style: feature => ({
          fillColor: getAnomalyColor(feature.properties.anomaly),
          weight: 1,
          opacity: 0.6,
          color: '#ffffff',
          fillOpacity: 0.4
        }),
        onEachFeature: (feature, layer) => {
          layer.on({
            click: () => {
              const zone = zones.find(z => z.id === feature.properties.id);
              if (zone) setActiveZone(zone);
            },
            mouseover: () => layer.setStyle({ weight: 2, opacity: 0.9 }),
            mouseout: () => layer.setStyle({ weight: 1, opacity: 0.6 })
          });
        }
      }
    ).addTo(map);

    // Fit bounds to city zones
    map.fitBounds(geoJsonLayer.getBounds(), { padding: [20, 20] });

    // Cleanup on unmount
    return () => {
      map.remove();
    };
  }, [activeCity, zones]);

  // Update map when city changes (fly to new center)
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.flyTo(cityData.center, cityData.zoom, { duration: 1.5 });
    }
  }, [activeCity, cityData]);

  // Helper to map anomaly value to a color (used for Leaflet fill)
  const getAnomalyColor = (val) => {
    if (val < 0) return '#0284c7'; // cool blue
    if (val < 3) return '#10b981'; // emerald
    if (val < 5) return '#f59e0b'; // amber
    if (val < 7) return '#f97316'; // orange
    return '#ef4444'; // red hot
  };

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
                  onChange={(e) => handleSliderChange('coolRoofs', Number(e.target.value))}
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

        {/* Leaflet map container */}
        <div className="relative flex-1 rounded-2xl border border-brand-border overflow-hidden bg-slate-950">
          <div ref={mapContainerRef} className="w-full h-full" />
          {/* Thermal legend overlay */}
          <div className="absolute bottom-4 right-4 z-10 p-3 bg-slate-950/80 backdrop-blur-md border border-brand-border rounded-xl shadow-2xl text-[10px] space-y-2">
            <span className="font-semibold text-slate-300 block mb-1">Thermal Anomaly (°C)</span>
            <div className="w-40 h-2 rounded bg-thermal-gradient" />
            <div className="flex justify-between text-slate-500 font-mono">
              <span>Cool (&lt;0)</span>
              <span>Extreme (&gt;7)</span>
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
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                  // Compute totalDelta based on base weights and cap at 4.0
                  const baseWeights = {
                    coolRoofs: 1.1,
                    forestry: 1.8,
                    pavements: 0.7,
                  };
                  const totalDelta = Math.min(4.0,
                    (coolRoofs / 100) * baseWeights.coolRoofs +
                    (forestry / 100) * baseWeights.forestry +
                    (pavements / 100) * baseWeights.pavements
                  );
                  
                  // Simulate temperature and risk
                  const simulatedTemp = Number((activeZone.temperature - totalDelta).toFixed(2));
                  const simulatedRisk = Math.max(0, Math.round(activeZone.riskScore - (totalDelta / 4.0) * activeZone.riskScore));
                  
                  const simResults = {
                    originalTemp: activeZone.temperature,
                    simulatedTemp,
                    reduction: totalDelta,
                    originalRisk: activeZone.riskScore,
                    simulatedRisk,
                    originalAnomaly: activeZone.tempAnomaly,
                    simulatedAnomaly: Number((activeZone.tempAnomaly - totalDelta).toFixed(2)),
                    originalVegetation: activeZone.metrics.vegetationCover,
                    simulatedVegetation: Math.min(100, activeZone.metrics.vegetationCover + Math.round(forestry * 0.4))
                  };
                </h4>
                {/* Albedo */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Surface Albedo (Reflectance)</span>
                    <span className="font-mono text-slate-300">{activeZone.metrics.albedo}</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5">
                    <div className="bg-brand-highlight h-1.5 rounded-full" style={{ width: `${activeZone.metrics.albedo * 100}%` }} />
                  </div>
                </div>
                {/* Vegetation */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Vegetation Canopy Cover</span>
                    <span className="font-mono text-emerald-400">{activeZone.metrics.vegetationCover}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${activeZone.metrics.vegetationCover}%` }} />
                  </div>
                </div>
                {/* Built ratio */}
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

            {/* 48‑hour forecast chart */}
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
            Click a zone on the map or in the fallback grid list to analyze.
          </div>
        )}
      </div>
    </div>
  );
}
