import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Sliders, Thermometer, ShieldCheck, TreePine, Sparkles, Building, Paintbrush, HelpCircle, Loader2 } from 'lucide-react';
import { callGemini, buildTextPromptPayload } from '../utils/gemini';

export default function InterventionSimulator({ activeZone, config }) {
  const [coolRoofs, setCoolRoofs] = useState(0); // 0 to 100 %
  const [forestry, setForestry] = useState(0);   // 0 to 100 %
  const [pavements, setPavements] = useState(0); // 0 to 100 %
  
  const [simResults, setSimResults] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState('');

  // Reset simulator values when the active zone changes
  useEffect(() => {
    setCoolRoofs(0);
    setForestry(0);
    setPavements(0);
    setAiAnalysis('');
    setAiError('');
  }, [activeZone]);

  // Run scientific microclimatic adjustment simulation
  useEffect(() => {
    if (!activeZone) return;

    const originalTemp = activeZone.temperature;
    const builtRatio = activeZone.metrics.builtRatio / 100; // fraction
    
    // Ambient temperature reductions based on thermodynamic microclimate models:
    // 1. Cool Roofs: Max 1.8°C reduction (if 100% roofs are white-painted in a highly built zone)
    const coolRoofReduction = (coolRoofs / 100) * builtRatio * 1.8;
    
    // 2. Urban Forestry: Max 3.2°C reduction (canopy shade and transpiration cooling)
    const forestryReduction = (forestry / 100) * 3.2;
    
    // 3. Reflective Pavement: Max 1.2°C reduction in pavement radiation
    const pavementReduction = (pavements / 100) * builtRatio * 1.2;

    const totalReduction = Number((coolRoofReduction + forestryReduction + pavementReduction).toFixed(2));
    const simulatedTemp = Number((originalTemp - totalReduction).toFixed(2));
    const simulatedAnomaly = Number((activeZone.tempAnomaly - totalReduction).toFixed(2));

    // Calculate new risk score
    // Risk is proportional to anomaly, builtRatio, and inversely proportional to greenSpaceAccess / vegetation
    const originalRisk = activeZone.riskScore;
    const riskReductionRatio = (totalReduction / (activeZone.tempAnomaly + 2)) * 0.8; // scaling
    const simulatedRisk = Math.max(10, Math.round(originalRisk * (1 - riskReductionRatio)));

    setSimResults({
      originalTemp,
      simulatedTemp,
      reduction: totalReduction,
      originalRisk,
      simulatedRisk,
      originalAnomaly: activeZone.tempAnomaly,
      simulatedAnomaly,
      originalVegetation: activeZone.metrics.vegetationCover,
      simulatedVegetation: Math.min(100, activeZone.metrics.vegetationCover + Math.round(forestry * 0.4))
    });

  }, [coolRoofs, forestry, pavements, activeZone]);

  // Ask Gemini to evaluate the specific intervention combination
  const handleRequestAiValidation = async () => {
    if (!activeZone || !simResults) return;
    setLoadingAi(true);
    setAiError('');
    setAiAnalysis('');

    const promptText = `You are a microclimate scientist and thermodynamic urban planner.
Analyze the following heat mitigation simulation for:
- City/Zone: ${activeZone.name} (Type: ${activeZone.type})
- Baseline Temperature: ${activeZone.temperature}°C (Anomaly: +${activeZone.tempAnomaly}°C)
- Baseline Risk Index: ${activeZone.riskScore}/100

Interventions Applied:
1. Cool Roofs (High Albedo Paint): ${coolRoofs}% coverage of available roof space.
2. Urban Forestry (Canopy planting): ${forestry}% targeted street/park canopy increase.
3. Cool/Reflective Pavements: ${pavements}% replacement of asphalt.

Simulation Results Calculated by Physics Engine:
- Simulated Temperature: ${simResults.simulatedTemp}°C (Reduction of -${simResults.reduction}°C)
- Simulated Risk Index drops to: ${simResults.simulatedRisk}/100
- Canopy Cover increases to: ${simResults.simulatedVegetation}%

In exactly 3 bullet points, provide a professional, highly technical critique of this intervention plan. Discuss the thermodynamic synergy, potential limitations (e.g., humidity feedbacks, water availability for trees in Indian summers), and a cost-benefit rating (High/Medium/Low). Keep the response concise, authoritative, and under 120 words total. Do not use markdown headers, just return the 3 bullet points.`;

    try {
      const payload = buildTextPromptPayload(promptText);
      const text = await callGemini(payload, config);
      setAiAnalysis(text);
    } catch (err) {
      console.error('Error fetching simulator critique:', err);
      setAiError(err.message || 'Failed to connect to Gemini. Verify API configuration.');
    } finally {
      setLoadingAi(false);
    }
  };

  if (!activeZone) {
    return (
      <div className="flex items-center justify-center h-96 text-slate-500 text-xs bg-slate-900/10 border border-brand-border rounded-2xl p-6 text-center">
        Please select a city zone on the Dashboard map before using the simulator.
      </div>
    );
  }

  // Data for Recharts comparison
  const chartData = [
    {
      name: 'Temperature (°C)',
      Baseline: activeZone.temperature,
      Simulated: simResults?.simulatedTemp || activeZone.temperature,
    },
    {
      name: 'Heat Risk Score (0-100)',
      Baseline: activeZone.riskScore,
      Simulated: simResults?.simulatedRisk || activeZone.riskScore,
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-80px)] overflow-hidden">
      
      {/* Left Column: Sliders and Controls */}
      <div className="glass-card rounded-2xl border border-brand-border p-6 flex flex-col justify-between space-y-6 h-full overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-brand-border/40">
            <Sliders className="h-5 w-5 text-brand-highlight" />
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Intervention Controls</h2>
              <p className="text-[10px] text-slate-500">Apply mitigation measures to {activeZone.name}</p>
            </div>
          </div>

          {/* Slider 1: Cool Roofs */}
          <div className="space-y-2 bg-slate-950/30 p-4 rounded-xl border border-brand-border/40">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Paintbrush className="h-4 w-4 text-sky-400" />
                Cool Roofs (Albedo Painting)
              </span>
              <span className="font-mono text-brand-highlight">{coolRoofs}%</span>
            </div>
            <p className="text-[10px] text-slate-500">
              Coating buildings with high-reflectance paints to deflect incident solar radiation.
            </p>
            <input
              type="range"
              min="0"
              max="100"
              value={coolRoofs}
              onChange={(e) => setCoolRoofs(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Slider 2: Urban Forestry */}
          <div className="space-y-2 bg-slate-950/30 p-4 rounded-xl border border-brand-border/40">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-slate-300">
                <TreePine className="h-4 w-4 text-emerald-400" />
                Urban Forestry (Tree Canopy)
              </span>
              <span className="font-mono text-emerald-400">{forestry}%</span>
            </div>
            <p className="text-[10px] text-slate-500">
              Planting broadleaf native trees on streets and open spaces to maximize transpiration and shading.
            </p>
            <input
              type="range"
              min="0"
              max="100"
              value={forestry}
              onChange={(e) => setForestry(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Slider 3: Reflective Pavements */}
          <div className="space-y-2 bg-slate-950/30 p-4 rounded-xl border border-brand-border/40">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Building className="h-4 w-4 text-amber-400" />
                Reflective Pavements
              </span>
              <span className="font-mono text-amber-500">{pavements}%</span>
            </div>
            <p className="text-[10px] text-slate-500">
              Upgrading asphalt parking lots and roadways with light-colored permeable paving.
            </p>
            <input
              type="range"
              min="0"
              max="100"
              value={pavements}
              onChange={(e) => setPavements(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Reset button */}
        <button
          onClick={() => {
            setCoolRoofs(0);
            setForestry(0);
            setPavements(0);
            setAiAnalysis('');
          }}
          className="w-full py-2 bg-slate-800 text-[11px] font-bold text-slate-400 hover:bg-slate-700 hover:text-slate-200 rounded-xl border border-brand-border transition-colors"
        >
          Reset Simulation Variables
        </button>
      </div>

      {/* Middle Column: Visual Charts & Analytics */}
      <div className="glass-card rounded-2xl border border-brand-border p-6 flex flex-col justify-between space-y-6 h-full">
        <div>
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Thermometer className="h-5 w-5 text-orange-400" />
            Thermodynamic Impact Projection
          </h2>
          <p className="text-[10px] text-slate-500">Comparison of pre- and post-intervention attributes</p>
        </div>

        {/* Charts */}
        <div className="flex-1 min-h-[220px] w-full">
          {simResults && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 15, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: 'rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#f8fafc'
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '10px', pt: 10 }} />
                <Bar dataKey="Baseline" fill="#e11d48" radius={[4, 4, 0, 0]} maxBarSize={50} />
                <Bar dataKey="Simulated" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Numeric Delta Indicators */}
        {simResults && (
          <div className="grid grid-cols-2 gap-3.5 pt-4 border-t border-brand-border/40">
            <div className="bg-slate-950/40 p-3 rounded-xl border border-brand-border">
              <span className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Temperature Drop</span>
              <span className="text-lg font-black text-emerald-400 font-mono">
                -{simResults.reduction}°C
              </span>
            </div>
            <div className="bg-slate-950/40 p-3 rounded-xl border border-brand-border">
              <span className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Risk Score Reduction</span>
              <span className="text-lg font-black text-emerald-400 font-mono">
                -{simResults.originalRisk - simResults.simulatedRisk} points
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: AI Validation */}
      <div className="glass-card rounded-2xl border border-brand-border p-6 flex flex-col justify-between space-y-4 h-full overflow-y-auto">
        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-2 pb-3 border-b border-brand-border/40">
            <Sparkles className="h-5 w-5 text-amber-400 animate-pulse-radar" />
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">AI Microclimate Validation</h2>
              <p className="text-[10px] text-slate-500">Gemini 1.5 Pro scenario evaluation</p>
            </div>
          </div>

          {/* AI Content output or empty state */}
          <div className="min-h-[200px] bg-slate-950/60 border border-brand-border rounded-2xl p-4 text-xs leading-relaxed text-slate-300 overflow-y-auto max-h-[300px]">
            {loadingAi ? (
              <div className="flex flex-col items-center justify-center h-40 space-y-3">
                <Loader2 className="h-6 w-6 text-brand-highlight animate-spin" />
                <span className="text-[10px] text-slate-500">Formulating thermodynamic model critique...</span>
              </div>
            ) : aiError ? (
              <div className="text-red-400/90 text-center py-10">
                <ShieldCheck className="h-8 w-8 text-red-500/20 mx-auto mb-2" />
                <p>{aiError}</p>
                <p className="text-[10px] text-slate-500 mt-2">Check console for debug logs.</p>
              </div>
            ) : aiAnalysis ? (
              <div className="space-y-3 font-sans">
                {/* Parse the bullet points from Gemini and render them cleanly */}
                <ul className="list-disc pl-4 space-y-2.5 text-slate-300">
                  {aiAnalysis.split('\n').filter(line => line.trim()).map((line, idx) => (
                    <li key={idx} className="marker:text-brand-highlight">{line.replace(/^-\s*/, '').replace(/^\*\s*/, '')}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center text-slate-500">
                <HelpCircle className="h-8 w-8 text-slate-700 mb-2" />
                <p>Modify the intervention levels on the left and click below to run an AI scientific validation on your proposed microclimate plan.</p>
              </div>
            )}
          </div>
        </div>

        {/* Trigger Button */}
        <button
          onClick={handleRequestAiValidation}
          disabled={loadingAi || (coolRoofs === 0 && forestry === 0 && pavements === 0)}
          className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl text-xs font-bold text-white hover:from-amber-400 hover:to-orange-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/10"
        >
          {loadingAi ? 'Requesting AI Validation...' : 'Validate Simulation with Gemini'}
        </button>
      </div>

    </div>
  );
}
