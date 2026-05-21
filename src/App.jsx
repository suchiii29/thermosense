import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import InterventionSimulator from './components/InterventionSimulator';
import SatelliteAnalyzer from './components/SatelliteAnalyzer';
import EquityOverlay from './components/EquityOverlay';
import PolicyBriefGenerator from './components/PolicyBriefGenerator';
import SettingsModal from './components/SettingsModal';
import CITIES from './data/cities';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeCity, setActiveCity] = useState('delhi');
  const [activeZone, setActiveZone] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [config, setConfig] = useState({
    mapboxToken: '',
    geminiKey: ''
  });

  // Load custom configurations from localStorage on mount
  useEffect(() => {
    const localMapbox = localStorage.getItem('mapbox_access_token');
    const localGemini = localStorage.getItem('gemini_api_key');
    
    // Set fallback to env variable if exists
    const mapboxToken = localMapbox || import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';
    const geminiKey = localGemini || import.meta.env.GEMINI_API_KEY || '';

    setConfig({ mapboxToken, geminiKey });
  }, []);

  // Set default active zone when city changes
  useEffect(() => {
    const cityData = CITIES[activeCity];
    const defaultZone = cityData.zones[0];
    setActiveZone(defaultZone);
  }, [activeCity]);

  // Handle configuration saves
  const handleSaveConfig = ({ mapboxToken, geminiKey }) => {
    localStorage.setItem('mapbox_access_token', mapboxToken);
    localStorage.setItem('gemini_api_key', geminiKey);
    setConfig({ mapboxToken, geminiKey });
  };

  // Render current active tab view
  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            activeCity={activeCity}
            setActiveCity={setActiveCity}
            activeZone={activeZone}
            setActiveZone={setActiveZone}
            config={config}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        );
      case 'simulator':
        return (
          <InterventionSimulator
            activeZone={activeZone}
            config={config}
          />
        );
      case 'satellite':
        return (
          <SatelliteAnalyzer
            config={config}
          />
        );
      case 'equity':
        return (
          <EquityOverlay
            activeCity={activeCity}
            activeZone={activeZone}
            setActiveZone={setActiveZone}
          />
        );
      case 'policy':
        return (
          <PolicyBriefGenerator
            activeCity={activeCity}
            activeZone={activeZone}
            config={config}
          />
        );
      default:
        return (
          <div className="text-center py-20 text-slate-500">
            View not found.
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col font-sans select-none">
      {/* Premium Header/Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setSettingsOpen(true)}
        config={config}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 overflow-hidden">
        <div className="h-full animate-fade-in">
          {renderView()}
        </div>
      </main>

      {/* Settings Configuration Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSave={handleSaveConfig}
        config={config}
      />
    </div>
  );
}
