import { useState } from 'react';
import { X, Key, MapPin, Eye, EyeOff, Save, CheckCircle, Info } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, onSave, config }) {
  const [mapboxToken, setMapboxToken] = useState(config.mapboxToken || '');
  const [geminiKey, setGeminiKey] = useState(config.geminiKey || '');
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showMapboxToken, setShowMapboxToken] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSave({ mapboxToken, geminiKey });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md glass-card rounded-2xl border border-brand-border overflow-hidden animate-slide-up shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-border px-6 py-4 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-brand-highlight" />
            <h2 className="text-lg font-semibold text-slate-100">API Configurations</h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-200 transition-colors p-1 hover:bg-slate-800 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Informational Alert */}
          <div className="flex gap-3 bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-xl p-3.5 text-xs">
            <Info className="h-5 w-5 flex-shrink-0 text-blue-400" />
            <p>
              By default, ThermoSense AI uses system-level keys. You can override them below. Keys are stored <strong>locally in your browser</strong> and are never sent to external servers other than Mapbox and Gemini.
            </p>
          </div>

          {/* Mapbox Token */}
          <div className="space-y-2">
            <label className="flex items-center justify-between text-sm font-medium text-slate-300">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-emerald-400" />
                Mapbox Access Token
              </span>
              {!config.mapboxToken && !mapboxToken && (
                <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full font-normal">
                  Required for Maps
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type={showMapboxToken ? "text" : "password"}
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
                placeholder="pk.eyJ1Ijoi..."
                className="w-full bg-slate-950/60 border border-brand-border rounded-xl py-2.5 pl-3.5 pr-10 text-sm text-slate-200 focus:outline-none focus:border-brand-highlight transition-colors placeholder:text-slate-600 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowMapboxToken(!showMapboxToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5"
              >
                {showMapboxToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Used to render maps client-side. Get one for free at <a href="https://mapbox.com" target="_blank" rel="noreferrer" className="text-brand-highlight hover:underline">mapbox.com</a>.
            </p>
          </div>

          {/* Gemini Key */}
          <div className="space-y-2">
            <label className="flex items-center justify-between text-sm font-medium text-slate-300">
              <span className="flex items-center gap-1.5">
                <Key className="h-4 w-4 text-red-400" />
                Google Gemini API Key
              </span>
            </label>
            <div className="relative">
              <input
                type={showGeminiKey ? "text" : "password"}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-slate-950/60 border border-brand-border rounded-xl py-2.5 pl-3.5 pr-10 text-sm text-slate-200 focus:outline-none focus:border-brand-highlight transition-colors placeholder:text-slate-600 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowGeminiKey(!showGeminiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5"
              >
                {showGeminiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Used to query Gemini 1.5 Pro. If blank, server-side API proxy key will be used. Get one at <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="text-brand-highlight hover:underline">AI Studio</a>.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-3 border-t border-brand-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-brand-border rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveSuccess}
              className="flex-1 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl text-sm font-medium text-white hover:from-sky-400 hover:to-blue-500 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-sky-500/10"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle className="h-4 w-4 text-emerald-300 animate-pulse" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Keys
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
