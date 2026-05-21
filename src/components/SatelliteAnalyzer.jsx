import { useState } from 'react';
import piexif from 'piexifjs';
import { Upload, FileImage, Sparkles, Loader2, RefreshCw, AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import { callGemini, buildMultimodalPayload } from '../utils/gemini';

export default function SatelliteAnalyzer({ config }) {
  const [imagePreview, setImagePreview] = useState(null); // base64 DataURL
  const [imageMime, setImageMime] = useState('');
  const [imageRawBase64, setImageRawBase64] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [exifStripped, setExifStripped] = useState(false);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  // Strip EXIF and set up image base64
  const processImage = (file, dataUrl) => {
    let finalDataUrl = dataUrl;
    let stripped = false;

    // piexifjs only supports JPEG/JPG files
    if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
      try {
        finalDataUrl = piexif.remove(dataUrl);
        stripped = true;
        console.log("EXIF metadata successfully stripped client-side using piexifjs.");
      } catch (err) {
        console.warn("Failed to strip EXIF (file might not have EXIF headers):", err);
      }
    }

    // Extract raw base64 data for Gemini API
    const base64Parts = finalDataUrl.split(',');
    const rawBase64 = base64Parts[1];
    const mimeType = base64Parts[0].split(';')[0].split(':')[1];

    setImagePreview(finalDataUrl);
    setImageMime(mimeType);
    setImageRawBase64(rawBase64);
    setFileName(file.name);
    setFileSize((file.size / 1024).toFixed(1) + ' KB');
    setExifStripped(stripped);
    setAnalysis(null);
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, or WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      processImage(file, event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Load the built-in thermal satellite sample image
  const handleLoadSample = async () => {
    setIsAnalyzing(false);
    setError('');
    try {
      const response = await fetch('/thermal_sample.png');
      const blob = await response.blob();
      const file = new File([blob], "thermal_sample.png", { type: "image/png" });
      
      const reader = new FileReader();
      reader.onload = (event) => {
        processImage(file, event.target.result);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Failed to load sample image:', err);
      setError('Failed to load the sample image. Please try uploading your own image.');
    }
  };

  const triggerGeminiAnalysis = async () => {
    if (!imageRawBase64 || !imageMime) return;
    setIsAnalyzing(true);
    setError('');
    setAnalysis(null);

    const promptText = `You are an AI Urban Heat Island Satellite Imagery Analyst.
Analyze the provided satellite/thermal image of an urban block.
You MUST output your response in JSON format ONLY, conforming strictly to the following JSON schema:
{
  "albedoIndex": 0.0 to 1.0 (number representing average estimated surface reflectance),
  "vegetationCover": 0 to 100 (number, percentage of visible canopy/parks),
  "concreteRatio": 0 to 100 (number, percentage of paved/roof surfaces),
  "heatRiskRating": "Low" | "Moderate" | "High" | "Extreme",
  "thermalAnomaliesDetected": ["Anomaly 1", "Anomaly 2", ...],
  "recommendedInterventions": ["Intervention 1", "Intervention 2", ...],
  "scientificCritique": "A professional scientific summary of the surface materials, solar heat absorption zones, and wind blockage/shading characteristics shown in this image (under 100 words)."
}

Do not include any backticks or markdown formatting around the JSON. Return only the raw JSON.`;

    try {
      const payload = buildMultimodalPayload(promptText, imageRawBase64, imageMime);
      
      // Use low temperature to ensure strict JSON structure
      const responseText = await callGemini(payload, config, { temperature: 0.1 });
      
      // Clean up markdown block styling if returned
      let cleanedText = responseText.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.substring(7, cleanedText.length - 3).trim();
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.substring(3, cleanedText.length - 3).trim();
      }

      const parsedAnalysis = JSON.parse(cleanedText);
      setAnalysis(parsedAnalysis);
    } catch (err) {
      console.error('Gemini image analysis error:', err);
      setError(err.message || 'Failed to analyze satellite imagery. Check API credentials or connection.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low': return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10';
      case 'moderate': return 'text-amber-400 border-amber-500/20 bg-amber-500/10';
      case 'high': return 'text-orange-400 border-orange-500/20 bg-orange-500/10';
      case 'extreme': return 'text-red-400 border-red-500/20 bg-red-500/15 animate-pulse';
      default: return 'text-slate-400 border-slate-500/20 bg-slate-500/10';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-80px)] overflow-hidden">
      
      {/* Left Columns (5): Upload Panel & Image Preview */}
      <div className="lg:col-span-5 flex flex-col justify-between glass-card rounded-2xl border border-brand-border p-6 h-full overflow-y-auto">
        <div className="space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-brand-border/40">
            <Upload className="h-5 w-5 text-brand-highlight" />
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Imagery Upload</h2>
              <p className="text-[10px] text-slate-500">Strip metadata and upload satellite captures</p>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div className="relative border-2 border-dashed border-brand-border hover:border-brand-highlight/40 rounded-2xl p-6 transition-all bg-slate-950/20 group">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="flex flex-col items-center justify-center text-center space-y-2">
              <FileImage className="h-10 w-10 text-slate-600 group-hover:text-brand-highlight/70 transition-colors" />
              <span className="text-xs font-bold text-slate-300">Drag &amp; Drop Image Here</span>
              <span className="text-[10px] text-slate-500">Supports PNG, JPEG, or WEBP up to 5MB</span>
              <span className="text-[10px] text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-brand-border mt-2">
                Browse Files
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Or Select Sample:</span>
            <button
              onClick={handleLoadSample}
              className="flex items-center gap-1 text-[10px] font-bold text-brand-highlight hover:underline"
            >
              <RefreshCw className="h-3 w-3" />
              Load Thermal block sample
            </button>
          </div>

          {/* Image preview box */}
          {imagePreview ? (
            <div className="space-y-3 bg-slate-950/40 p-3.5 rounded-2xl border border-brand-border">
              <div className="relative aspect-video rounded-xl overflow-hidden border border-brand-border bg-black flex items-center justify-center">
                <img 
                  src={imagePreview} 
                  alt="Satellite Upload" 
                  className="max-h-full max-w-full object-contain"
                />
                
                {/* Privacy Badge */}
                {exifStripped && (
                  <div className="absolute top-2 left-2 px-2.5 py-1 bg-emerald-500/90 text-white rounded-lg flex items-center gap-1 shadow-lg text-[9px] font-semibold">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    EXIF Cleaned
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span className="truncate max-w-[150px]">{fileName}</span>
                <span>{fileSize}</span>
              </div>
            </div>
          ) : (
            <div className="aspect-video rounded-2xl border border-brand-border/40 bg-slate-950/20 flex flex-col items-center justify-center text-slate-600 text-xs">
              No Image Loaded
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={triggerGeminiAnalysis}
          disabled={!imageRawBase64 || isAnalyzing}
          className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl text-xs font-bold text-white hover:from-sky-400 hover:to-blue-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-1.5 shadow-lg shadow-sky-500/10"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              AI Analyzing Surface...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Analyze Imagery with Gemini
            </>
          )}
        </button>
      </div>

      {/* Right Columns (7): Analysis Results & Recommendations */}
      <div className="lg:col-span-7 glass-card rounded-2xl border border-brand-border p-6 flex flex-col justify-between h-full overflow-y-auto">
        <div className="space-y-5 flex-1">
          <div className="flex items-center gap-2 pb-3 border-b border-brand-border/40">
            <Sparkles className="h-5 w-5 text-brand-highlight" />
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Surface Classification Analysis</h2>
              <p className="text-[10px] text-slate-500">AI-inferred albedo, vegetation levels, and heat risks</p>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-300 rounded-2xl text-xs flex gap-2">
              <AlertTriangle className="h-4.5 w-4.5 text-red-400 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-3">
              <Loader2 className="h-8 w-8 text-brand-highlight animate-spin" />
              <span className="text-xs text-slate-500 animate-pulse">Running computer vision segmentation...</span>
            </div>
          ) : analysis ? (
            <div className="space-y-5 animate-fade-in">
              {/* Risk Badge and Metrics row */}
              <div className="flex items-center justify-between bg-slate-950/40 p-4 rounded-2xl border border-brand-border">
                <span className="text-xs font-bold text-slate-300">Classified Heat Risk:</span>
                <span className={`px-3 py-1 rounded-xl text-xs font-black border uppercase ${getRiskColor(analysis.heatRiskRating)}`}>
                  {analysis.heatRiskRating} RISK
                </span>
              </div>

              {/* Progress bars for indexes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Albedo */}
                <div className="bg-slate-950/30 p-3.5 rounded-xl border border-brand-border/40 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Estimated Albedo</span>
                  <div className="text-base font-black text-brand-highlight font-mono">
                    {analysis.albedoIndex}
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5">
                    <div 
                      className="bg-brand-highlight h-1.5 rounded-full" 
                      style={{ width: `${analysis.albedoIndex * 100}%` }}
                    />
                  </div>
                </div>

                {/* Vegetation Cover */}
                <div className="bg-slate-950/30 p-3.5 rounded-xl border border-brand-border/40 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Canopy Ratio</span>
                  <div className="text-base font-black text-emerald-400 font-mono">
                    {analysis.vegetationCover}%
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5">
                    <div 
                      className="bg-emerald-500 h-1.5 rounded-full" 
                      style={{ width: `${analysis.vegetationCover}%` }}
                    />
                  </div>
                </div>

                {/* Concrete Ratio */}
                <div className="bg-slate-950/30 p-3.5 rounded-xl border border-brand-border/40 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Concrete / Paved</span>
                  <div className="text-base font-black text-red-400 font-mono">
                    {analysis.concreteRatio}%
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5">
                    <div 
                      className="bg-red-500 h-1.5 rounded-full" 
                      style={{ width: `${analysis.concreteRatio}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Scientific Critique block */}
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Thermodynamic Analysis</h4>
                <div className="bg-slate-950/40 p-4 rounded-xl border border-brand-border text-xs leading-relaxed text-slate-300">
                  {analysis.scientificCritique}
                </div>
              </div>

              {/* Anomalies Detected & Recommended Interventions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Anomalies Detected</span>
                  <ul className="space-y-1.5">
                    {analysis.thermalAnomaliesDetected?.map((anom, i) => (
                      <li key={i} className="text-xs text-slate-300 bg-red-950/10 border border-red-500/10 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                        {anom}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recommended Cooling</span>
                  <ul className="space-y-1.5">
                    {analysis.recommendedInterventions?.map((rec, i) => (
                      <li key={i} className="text-xs text-slate-300 bg-emerald-950/10 border border-emerald-500/10 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center text-slate-500">
              <Info className="h-10 w-10 text-slate-700 mb-2" />
              <p>Load the thermal block sample or upload your own satellite capture, and run the AI analysis to view classification outputs.</p>
            </div>
          )}
        </div>

        <div className="bg-slate-950/40 p-3.5 rounded-2xl border border-brand-border/60 flex items-start gap-2 text-[10px] text-slate-500 leading-relaxed">
          <Info className="h-4 w-4 text-brand-highlight flex-shrink-0 mt-0.5" />
          <p>
            The analyzer parses image matrices to estimate the relative albedo index (0 = zero reflection, 1 = total reflection) and surface thermal signatures. 
            <strong> Privacy First:</strong> All JPEG EXIF coordinates and device details are scrubbed in your browser using <code>piexifjs</code> before transmission.
          </p>
        </div>
      </div>

    </div>
  );
}
