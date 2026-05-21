import React, { useState } from 'react';
import { Thermometer, Settings, Menu, X, ShieldAlert, Cpu } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenSettings, config }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Heat Map & Risk' },
    { id: 'simulator', label: 'Cooling Simulator' },
    { id: 'satellite', label: 'Satellite Analyzer' },
    { id: 'equity', label: 'Equity Overlay' },
    { id: 'policy', label: 'Policy Brief Generator' }
  ];

  const hasMapbox = !!config.mapboxToken;
  const hasGemini = !!(config.geminiKey || true); // Default is true because server side key is expected

  return (
    <nav className="sticky top-0 z-40 bg-[#0d1423]/80 backdrop-blur-md border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-tr from-orange-500 to-red-600 rounded-xl shadow-lg shadow-red-500/20 animate-pulse-slow">
              <Thermometer className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-slate-100 via-sky-200 to-brand-highlight bg-clip-text text-transparent">
                ThermoSense AI
              </span>
              <span className="hidden sm:block text-[9px] text-slate-500 tracking-wider uppercase font-medium">
                Urban Heat Island Intelligence
              </span>
            </div>
          </div>

          {/* Desktop Tabs */}
          <div className="hidden lg:flex items-center space-x-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-slate-800/80 text-brand-highlight border border-brand-highlight/25 shadow-inner'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border border-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Action buttons (Settings & Mobile Menu toggle) */}
          <div className="flex items-center gap-2">
            {/* API Key Status Indicator */}
            <button
              onClick={onOpenSettings}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-medium transition-all ${
                hasMapbox 
                  ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400 hover:bg-emerald-950/40' 
                  : 'bg-amber-950/20 border-amber-500/20 text-amber-400 hover:bg-amber-950/40'
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              <span className="hidden md:inline">{hasMapbox ? 'Mapbox Connected' : 'Mapbox Missing'}</span>
              <Settings className="h-3.5 w-3.5 ml-0.5 animate-spin-slow" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-xl"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-brand-border bg-[#0d1423] px-4 pt-2 pb-4 space-y-1 shadow-2xl animate-fade-in">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-800 text-brand-highlight border border-brand-highlight/20 shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
}
