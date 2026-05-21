import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { FileText, Download, Sparkles, Loader2, Info, AlertTriangle, ShieldCheck, CheckSquare } from 'lucide-react';
import { callGemini, buildTextPromptPayload } from '../utils/gemini';
import CITIES from '../data/cities';

export default function PolicyBriefGenerator({ activeCity, activeZone, config }) {
  const [briefText, setBriefText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const cityData = CITIES[activeCity];

  const triggerGeminiPolicyDraft = async () => {
    if (!activeZone) return;
    setIsGenerating(true);
    setError('');
    setBriefText('');

    const promptText = `You are a climate policy advisor and senior urban planner specializing in Indian municipal administrations (e.g., municipal corporations like MCD, BMC, BBMP).
Formulate a highly structured, authoritative executive Policy Brief for:
- City: ${cityData.name}
- Focus Zone: ${activeZone.name} (Type: ${activeZone.type})
- Microclimate State: Ambient Temperature of ${activeZone.temperature}°C, Thermal Anomaly of +${activeZone.tempAnomaly}°C, Heat Risk Index of ${activeZone.riskScore}/100.
- Socioeconomic State: Population density of ${activeZone.metrics.populationDensity} people/km², average income class is ${activeZone.metrics.incomeLevel}, lack of green space access.

The Policy Brief must include:
1. Executive Summary: Highlighting the immediate hazard and environmental justice implications.
2. Diagnostic Findings: Linking surface materials (Albedo: ${activeZone.metrics.albedo}, Vegetation: ${activeZone.metrics.vegetationCover}%, Built Ratio: ${activeZone.metrics.builtRatio}%) to thermodynamic heat trapping.
3. Policy Prescriptions: List 3 concrete cooling mandates tailored to this microclimate (e.g., Cool Roof bylaws, urban forestry corridors, reflective pavements). Citing relevant Indian policies like the India Cooling Action Plan (ICAP) or local Heat Action Plans.
4. Actionable Timeline: Phase 1 (0-6 months), Phase 2 (6-12 months).

Write in a formal municipal memo format, using clear headings. Keep the brief to approximately 400-500 words, rich in specific details, and avoiding generic placeholders.`;

    try {
      const payload = buildTextPromptPayload(promptText);
      const generatedBrief = await callGemini(payload, config);
      setBriefText(generatedBrief);
    } catch (err) {
      console.error('Error generating policy brief:', err);
      setError(err.message || 'Failed to generate policy brief. Please verify API configuration.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Professional PDF Export using jsPDF with proper page breaks and wrapping
  const handleExportPDF = () => {
    if (!briefText) return;

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Page dimensions
      const pageHeight = doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;

      let yPos = 20;

      // Draw Top Decorative Banner (ThermoSense Brand Colors)
      doc.setFillColor(15, 23, 42); // slate-900 / dark brand
      doc.rect(0, 0, pageWidth, 40, 'F');

      doc.setFillColor(239, 68, 68); // Red Accent line
      doc.rect(0, 39, pageWidth, 1, 'F');

      // Title Block
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text("ThermoSense AI — Policy Brief", margin, 20);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(200, 200, 200);
      doc.text(`MUNICIPAL INTELLIGENCE MEMORANDUM | ${cityData.name.toUpperCase()}`, margin, 27);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, margin, 32);

      // Body text starts below banner
      yPos = 55;
      doc.setTextColor(51, 65, 85); // slate-700 for body text

      // Split brief text into lines by newline, then split each line to fit page width
      const rawLines = briefText.split('\n');
      
      rawLines.forEach((rawLine) => {
        const line = rawLine.trim();
        if (!line) {
          yPos += 5; // space for double newline
          return;
        }

        // Detect Headers (starts with # or number)
        const isHeader = line.startsWith('#') || line.match(/^[0-9]+\.\s/);
        
        if (isHeader) {
          const cleanHeader = line.replace(/^[#\s]+/, '');
          
          // Check for page overflow before writing header
          if (yPos + 15 > pageHeight - margin) {
            doc.addPage();
            yPos = 25;
          }

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.setTextColor(15, 23, 42); // slate-900 for headers
          yPos += 4;
          doc.text(cleanHeader, margin, yPos);
          yPos += 7;
          
          // Reset styling for body
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.setTextColor(51, 65, 85);
        } else {
          // Normal paragraph text
          // Bullet point detection
          const isBullet = line.startsWith('*') || line.startsWith('-');
          const cleanText = isBullet ? `•  ${line.substring(1).trim()}` : line;

          const textLines = doc.splitTextToSize(cleanText, contentWidth);

          textLines.forEach((textLine) => {
            // Check for page overflow
            if (yPos + 8 > pageHeight - margin) {
              doc.addPage();
              yPos = 25;
            }

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text(textLine, margin, yPos);
            yPos += 5.5;
          });
        }
      });

      // Save PDF
      const formattedFileName = `thermosense_brief_${activeCity}_${activeZone.id.replace(/-/g, '_')}.pdf`;
      doc.save(formattedFileName);

    } catch (err) {
      console.error('PDF export failed:', err);
      setError('PDF generation failed. Review console logs.');
    }
  };

  const handleCopyText = () => {
    if (!briefText) return;
    navigator.clipboard.writeText(briefText);
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

          {/* Selected Zone Briefing */}
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
            <p>
              Gemini synthesizes the spatial parameters (albedo, concrete ratio, canopy) and social parameters (income, population density) to output a customized briefing memo targeting:
            </p>
            <ul className="list-disc pl-4 mt-2 space-y-1">
              <li>Immediate cooling recommendations</li>
              <li>Microclimate heat action bylaws</li>
              <li>Environmental equity redistribution plans</li>
            </ul>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={triggerGeminiPolicyDraft}
          disabled={isGenerating}
          className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl text-xs font-bold text-white hover:from-sky-400 hover:to-blue-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-1.5 shadow-lg shadow-sky-500/10"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              AI Formulating Brief...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Formulate Policy Brief
            </>
          )}
        </button>
      </div>

      {/* Right Column (8): Document Preview Screen */}
      <div className="lg:col-span-8 glass-card rounded-2xl border border-brand-border flex flex-col justify-between h-full overflow-hidden">
        
        {/* Document Header */}
        <div className="flex items-center justify-between border-b border-brand-border px-6 py-4 bg-slate-900/40">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Briefing Document Preview</span>
          {briefText && (
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
                Export styled PDF
              </button>
            </div>
          )}
        </div>

        {/* Document Body */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-950/60 font-sans">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-300 rounded-2xl text-xs flex gap-2 mb-4">
              <AlertTriangle className="h-4.5 w-4.5 text-red-400 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {isGenerating ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-3">
              <Loader2 className="h-8 w-8 text-brand-highlight animate-spin" />
              <span className="text-xs text-slate-500 animate-pulse">Querying Gemini policy synthesis...</span>
            </div>
          ) : briefText ? (
            <div className="max-w-2xl mx-auto space-y-4 text-xs leading-relaxed text-slate-300 font-sans select-text whitespace-pre-wrap">
              {/* Output markdown text cleanly with spacing */}
              {briefText}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center text-slate-500">
              <FileText className="h-12 w-12 text-slate-800 mb-2 animate-pulse-slow" />
              <p className="max-w-md text-xs">No Policy Brief Formulated Yet. Click "Formulate Policy Brief" on the left panel to use Gemini 1.5 Pro to synthesize cooling mandates.</p>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="border-t border-brand-border px-6 py-3.5 bg-slate-900/20 text-[10px] text-slate-500 flex items-center gap-2">
          <Info className="h-4 w-4 text-brand-highlight flex-shrink-0" />
          <span>The generated directives are custom computed in real-time. Exported PDFs follow executive layout margins, including branding headers and pagination checks.</span>
        </div>
      </div>

    </div>
  );
}
