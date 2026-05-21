import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { FileText, Download, Sparkles, Loader2, Info, AlertTriangle, CheckSquare } from 'lucide-react';
import { CITIES } from '../data/cities';

export default function PolicyBriefGenerator({ activeCity, activeZone, config }) {
  const [sections, setSections] = useState([]); // split on ### markers
  const [briefRaw, setBriefRaw] = useState('');  // full raw string for PDF
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const cityData = CITIES[activeCity];

  const triggerGeminiPolicyDraft = async () => {
    if (!activeZone) return;
    setIsGenerating(true);
    setError('');
    setSections([]);
    setBriefRaw('');

    const promptText = `You are a climate policy advisor and senior urban planner specializing in Indian municipal administrations (e.g., MCD, BMC, BBMP).

Formulate a structured executive Policy Brief for:
- City: ${cityData.name}
- Focus Zone: ${activeZone.name} (Type: ${activeZone.type})
- Microclimate State: Ambient Temperature ${activeZone.temperature}°C, Thermal Anomaly +${activeZone.tempAnomaly}°C, Heat Risk Index ${activeZone.riskScore}/100
- Socioeconomic State: Population density ${activeZone.metrics.populationDensity} people/km², income class: ${activeZone.metrics.incomeLevel}, limited green space access

Use EXACTLY this section structure with ### as section markers:

### Executive Summary
[2-3 sentences on the immediate hazard and environmental justice implications]

### Diagnostic Findings
[Link surface materials (Albedo: ${activeZone.metrics.albedo}, Vegetation: ${activeZone.metrics.vegetationCover}%, Built Ratio: ${activeZone.metrics.builtRatio}%) to thermodynamic heat trapping]

### Policy Prescriptions
[3 concrete cooling mandates tailored to this microclimate, citing India Cooling Action Plan or local Heat Action Plans]

### Actionable Timeline
[Phase 1 (0-6 months) and Phase 2 (6-12 months) actions]

Write formally, approximately 400-500 words total. Use ### as the section delimiter. Do not use any other markdown formatting.`;

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (config?.geminiKey?.trim()) {
        headers['x-gemini-api-key'] = config.geminiKey.trim();
      }

      const response = await fetch('/api/policy-brief', {
        method: 'POST',
        headers,
        body: JSON.stringify({ prompt: promptText }),
      });

      // Handle non-OK responses gracefully
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();

      // Use response.brief directly — it is plain text, do NOT JSON.parse it
      const briefText = data.brief || '';
      setBriefRaw(briefText);

      // Split on ### markers to render sections
      const rawSections = briefText.split('###').map(s => s.trim()).filter(Boolean);
      setSections(rawSections);
    } catch (err) {
      console.error('Error generating policy brief:', err);
      setError(err.message || 'Failed to generate policy brief. Please verify API configuration.');
    } finally {
      setIsGenerating(false);
    }
  };

  // PDF Export
  const handleExportPDF = () => {
    if (!briefRaw) return;
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageHeight = doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;
      let yPos = 20;

      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageWidth, 40, 'F');
      doc.setFillColor(239, 68, 68);
      doc.rect(0, 39, pageWidth, 1, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('ThermoSense AI — Policy Brief', margin, 20);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(200, 200, 200);
      doc.text(`MUNICIPAL INTELLIGENCE MEMORANDUM | ${cityData.name.toUpperCase()}`, margin, 27);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, margin, 32);

      yPos = 55;
      doc.setTextColor(51, 65, 85);

      const rawLines = briefRaw.split('\n');
      rawLines.forEach((rawLine) => {
        const line = rawLine.trim();
        if (!line) { yPos += 5; return; }
        const isHeader = line.startsWith('#') || line.match(/^[0-9]+\.\s/);
        if (isHeader) {
          const cleanHeader = line.replace(/^[#\s]+/, '');
          if (yPos + 15 > pageHeight - margin) { doc.addPage(); yPos = 25; }
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.setTextColor(15, 23, 42);
          yPos += 4;
          doc.text(cleanHeader, margin, yPos);
          yPos += 7;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.setTextColor(51, 65, 85);
        } else {
          const isBullet = line.startsWith('*') || line.startsWith('-');
          const cleanText = isBullet ? `•  ${line.substring(1).trim()}` : line;
          const textLines = doc.splitTextToSize(cleanText, contentWidth);
          textLines.forEach((textLine) => {
            if (yPos + 8 > pageHeight - margin) { doc.addPage(); yPos = 25; }
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text(textLine, margin, yPos);
            yPos += 5.5;
          });
        }
      });

      doc.save(`thermosense_brief_${activeCity}_${activeZone.id.replace(/-/g, '_')}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
      setError('PDF generation failed. Review console logs.');
    }
  };

  const handleCopyText = () => {
    if (!briefRaw) return;
    navigator.clipboard.writeText(briefRaw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!activeZone) {
    return (
      <div className="flex items-center justify-center h-96 text-slate-500 text-xs bg-slate-900/10 border border-brand-border rounded-2xl p-6 text-center">
        Please select a city zone on the Dashboard map before generating a policy brief.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-80px)] overflow-hidden">

      {/* Left Column (4): Formulate Panel */}
      <div className="lg:col-span-4 flex flex-col justify-between glass-card rounded-2xl border border-brand-border p-6 h-full overflow-y-auto">
        <div className="space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-brand-border/40">
            <FileText className="h-5 w-5 text-brand-highlight" />
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Policy Engine</h2>
              <p className="text-[10px] text-slate-500">Draft actionable directives for city municipal councils</p>
            </div>
          </div>

          <div className="bg-slate-950/40 p-4 rounded-xl border border-brand-border space-y-3">
            <span className="text-[10px] font-bold text-brand-highlight tracking-widest uppercase bg-brand-highlight/10 px-2 py-0.5 rounded">
              Current Target Profile
            </span>
            <div className="text-xs space-y-1 text-slate-300">
              <p><strong>City:</strong> {cityData.name}</p>
              <p><strong>Zone:</strong> {activeZone.name}</p>
              <p><strong>UHI Risk Level:</strong> {activeZone.riskScore}/100</p>
              <p><strong>Socio-vulnerability:</strong> Density ({activeZone.metrics.populationDensity.toLocaleString()}/km²), {activeZone.metrics.incomeLevel} income level.</p>
            </div>
          </div>

          <div className="bg-slate-950/20 p-4 rounded-xl border border-brand-border/40 text-[10px] text-slate-400 leading-relaxed">
            <p>Gemini synthesizes spatial parameters (albedo, concrete ratio, canopy) and social parameters (income, density) to output a customized briefing memo targeting:</p>
            <ul className="list-disc pl-4 mt-2 space-y-1">
              <li>Immediate cooling recommendations</li>
              <li>Microclimate heat action bylaws</li>
              <li>Environmental equity redistribution plans</li>
            </ul>
          </div>
        </div>

        <button
          onClick={triggerGeminiPolicyDraft}
          disabled={isGenerating}
          className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl text-xs font-bold text-white hover:from-sky-400 hover:to-blue-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-1.5 shadow-lg shadow-sky-500/10"
        >
          {isGenerating ? (
            <><Loader2 className="h-4 w-4 animate-spin" />AI Formulating Brief...</>
          ) : (
            <><Sparkles className="h-4 w-4" />Formulate Policy Brief</>
          )}
        </button>
      </div>

      {/* Right Column (8): Document Preview */}
      <div className="lg:col-span-8 glass-card rounded-2xl border border-brand-border flex flex-col justify-between h-full overflow-hidden">
        <div className="flex items-center justify-between border-b border-brand-border px-6 py-4 bg-slate-900/40">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Briefing Document Preview</span>
          {briefRaw && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyText}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg border border-brand-border transition-all flex items-center gap-1"
              >
                {copied ? <CheckSquare className="h-3 w-3 text-emerald-400" /> : <FileText className="h-3 w-3" />}
                {copied ? 'Copied' : 'Copy Text'}
              </button>
              <button
                onClick={handleExportPDF}
                className="px-3 py-1.5 bg-brand-highlight text-slate-950 text-[10px] font-bold rounded-lg hover:bg-sky-300 active:scale-[0.98] transition-all flex items-center gap-1 shadow-md shadow-brand-highlight/10"
              >
                <Download className="h-3 w-3" />
                Export PDF
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 p-6 overflow-y-auto bg-slate-950/60 font-sans">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-300 rounded-2xl text-xs flex gap-2 mb-4">
              <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {isGenerating ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-3">
              <Loader2 className="h-8 w-8 text-brand-highlight animate-spin" />
              <span className="text-xs text-slate-500 animate-pulse">Querying Gemini policy synthesis...</span>
            </div>
          ) : sections.length > 0 ? (
            <div className="max-w-2xl mx-auto space-y-6 select-text">
              {/* Split on ### and render each section */}
              {sections.map((section, i) => {
                const lines = section.split('\n').filter(Boolean);
                const title = lines[0];
                const body = lines.slice(1).join('\n').trim();
                return (
                  <div key={i} className="space-y-2">
                    <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest border-b border-amber-500/20 pb-1">
                      {title}
                    </h3>
                    <p className="text-xs leading-relaxed text-slate-300 whitespace-pre-wrap">{body}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center text-slate-500">
              <FileText className="h-12 w-12 text-slate-800 mb-2 animate-pulse-slow" />
              <p className="max-w-md text-xs">
                No Policy Brief formulated yet. Click &quot;Formulate Policy Brief&quot; to use Gemini to synthesize cooling mandates.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-brand-border px-6 py-3.5 bg-slate-900/20 text-[10px] text-slate-500 flex items-center gap-2">
          <Info className="h-4 w-4 text-brand-highlight flex-shrink-0" />
          <span>Directives are generated in real-time by Gemini. Exported PDFs include branding headers and pagination.</span>
        </div>
      </div>

    </div>
  );
}
