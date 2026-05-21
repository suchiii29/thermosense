import React, { useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label, Cell } from 'recharts';
import { ShieldAlert, Info, Scale, Users, TrendingUp, Sparkles, MapPin } from 'lucide-react';
import CITIES from '../data/cities';

export default function EquityOverlay({ activeCity, activeZone, setActiveZone }) {
  const cityData = CITIES[activeCity];
  const zones = cityData.zones;

  // Calculate Vulnerability Score for each zone
  // Scale of 0 to 100 based on density, low income, and lack of green space
  const calculateVulnerability = (zone) => {
    // 1. Normalize density (max out around 50,000 people/km2)
    const densityVal = Math.min(100, (zone.metrics.populationDensity / 50000) * 100);
    
    // 2. Income weight (lower income = higher vulnerability)
    let incomeVal = 20; // high income
    if (zone.metrics.incomeLevel === 'low') incomeVal = 100;
    if (zone.metrics.incomeLevel === 'medium') incomeVal = 60;

    // 3. Lack of green access
    const lackOfGreen = 100 - zone.metrics.greenSpaceAccess;

    // Weighted average: 40% income, 40% density, 20% lack of green space
    const score = Math.round(incomeVal * 0.4 + densityVal * 0.4 + lackOfGreen * 0.2);
    return score;
  };

  const scatterData = zones.map(z => ({
    id: z.id,
    name: z.name,
    x: z.riskScore, // Heat Risk Score
    y: calculateVulnerability(z), // Vulnerability Score
    tempAnomaly: z.tempAnomaly,
    populationDensity: z.metrics.populationDensity,
    incomeLevel: z.metrics.incomeLevel
  }));

  const handleScatterClick = (node) => {
    if (!node || !node.payload) return;
    const found = zones.find(z => z.id === node.payload.id);
    if (found) setActiveZone(found);
  };

  // Identify environmental justice hotspot (High Risk & High Vulnerability)
  const hotspots = scatterData.filter(d => d.x >= 70 && d.y >= 60);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-80px)] overflow-hidden">
      
      {/* Left Column (7): Scatter Plot showing correlation */}
      <div className="lg:col-span-7 glass-card rounded-2xl border border-brand-border p-6 flex flex-col justify-between h-full overflow-hidden">
        <div>
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Scale className="h-5 w-5 text-brand-highlight" />
            Environmental Justice Correlation Plot
          </h2>
          <p className="text-[10px] text-slate-500">Comparing Thermal Exposure (Heat Risk) vs Socioeconomic Vulnerability</p>
        </div>

        {/* Scatter Chart */}
        <div className="flex-1 min-h-[260px] w-full mt-4">
          <ResponsiveContainer width="100%" height="95%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Heat Risk" 
                domain={[0, 100]}
                tick={{ fill: '#64748b', fontSize: 9 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              >
                <Label value="Heat Risk Index (Exposure)" offset={-10} position="insideBottom" fill="#64748b" style={{ fontSize: '10px', fontWeight: 'bold' }} />
              </XAxis>
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Vulnerability" 
                domain={[0, 100]}
                tick={{ fill: '#64748b', fontSize: 9 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              >
                <Label value="Socioeconomic Vulnerability Index" angle={-90} offset={-5} position="insideLeft" fill="#64748b" style={{ fontSize: '10px', fontWeight: 'bold' }} />
              </YAxis>
              <Tooltip 
                cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.1)' }}
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderColor: 'rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  fontSize: '11px',
                  color: '#f8fafc'
                }}
                formatter={(value, name) => [value, name]}
              />
              <Scatter data={scatterData} onClick={handleScatterClick}>
                {scatterData.map((entry, index) => {
                  const isHotspot = entry.x >= 70 && entry.y >= 60;
                  const isSelected = activeZone?.id === entry.id;
                  
                  let fill = '#38bdf8'; // standard blue
                  if (isHotspot) fill = '#ef4444'; // critical red
                  if (isSelected) fill = '#f59e0b'; // orange highlight

                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={fill} 
                      r={isSelected ? 10 : isHotspot ? 8 : 6}
                      stroke={isSelected ? '#ffffff' : 'transparent'}
                      strokeWidth={2}
                      className="cursor-pointer transition-all duration-300"
                    />
                  );
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Quadrant Legend Info */}
        <div className="grid grid-cols-2 gap-3.5 bg-slate-950/40 p-3 rounded-xl border border-brand-border/60 text-[10px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
            <span><strong>Top-Right (EJ Hotspot):</strong> High thermal risk &amp; high vulnerability. Priority action zone.</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
            <span><strong>Other Zones:</strong> Moderate/Low threat levels or high community coping capacity.</span>
          </div>
        </div>
      </div>

      {/* Right Column (5): Vulnerability details card */}
      <div className="lg:col-span-5 flex flex-col justify-between h-full overflow-y-auto space-y-4 pr-1">
        {activeZone ? (
          <>
            {/* Zone Social profile */}
            <div className="glass-card rounded-2xl border border-brand-border p-5 space-y-4">
              <div className="border-b border-brand-border/40 pb-3">
                <span className="text-[9px] font-bold text-orange-400 uppercase tracking-widest bg-orange-500/10 px-2 py-0.5 rounded">
                  Equity Analysis
                </span>
                <h3 className="text-sm font-bold text-slate-100 mt-2">{activeZone.name}</h3>
              </div>

              {/* Multi metrics breakdown */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Total Vulnerability Index</span>
                  <span className="text-sm font-black text-slate-200 font-mono">
                    {calculateVulnerability(activeZone)}/100
                  </span>
                </div>

                {/* Population density */}
                <div className="flex items-center justify-between bg-slate-950/40 p-3 rounded-xl border border-brand-border">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-400" />
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Pop. Density</span>
                      <span className="text-xs font-bold text-slate-300 font-mono">
                        {activeZone.metrics.populationDensity.toLocaleString()} / km²
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-1 rounded-lg border border-brand-border">
                    {activeZone.metrics.populationDensity > 35000 ? 'Ultra-Dense' : activeZone.metrics.populationDensity > 15000 ? 'High' : 'Moderate'}
                  </span>
                </div>

                {/* Average Income */}
                <div className="flex items-center justify-between bg-slate-950/40 p-3 rounded-xl border border-brand-border">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-slate-400" />
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Average Income</span>
                      <span className="text-xs font-bold text-slate-300 capitalize">
                        {activeZone.metrics.incomeLevel} Income
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-1 rounded-lg border border-brand-border">
                    {activeZone.metrics.incomeLevel === 'low' ? 'Severe Coping Gap' : activeZone.metrics.incomeLevel === 'medium' ? 'Moderate Coping' : 'High Coping'}
                  </span>
                </div>
              </div>
            </div>

            {/* EJ Hotspots Summary List */}
            <div className="glass-card rounded-2xl border border-brand-border p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-red-500 animate-pulse-radar" />
                  Identified EJ Hotspots in {cityData.name}
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Critical intersection zones requiring priority urban cooling funding</p>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto max-h-[160px]">
                {hotspots.length > 0 ? (
                  hotspots.map((h, i) => (
                    <div 
                      key={i} 
                      onClick={() => handleScatterClick({ payload: h })}
                      className="p-3 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/30 rounded-xl cursor-pointer transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-red-400" />
                        <span className="text-xs font-bold text-slate-200">{h.name}</span>
                      </div>
                      <span className="text-[10px] text-red-400 font-semibold font-mono">
                        Risk: {h.x} | Vuln: {h.y}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    No critical Environmental Justice Hotspots found in this city.
                  </div>
                )}
              </div>

              <div className="bg-slate-950/40 p-3 rounded-xl border border-brand-border/60 flex items-start gap-2">
                <Info className="h-4 w-4 text-brand-highlight flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Low-income neighborhoods suffer more from heat stress due to tin roofs, lack of air conditioning, and fewer parks. High-density zones block breeze circulation, compounding the heating anomaly.
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-xs glass-card rounded-2xl border border-brand-border p-6 text-center">
            Click a zone on the scatter plot to load its equity metrics.
          </div>
        )}
      </div>

    </div>
  );
}
