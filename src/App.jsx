import { useState } from 'react';
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
  
  const [config, setConfig] = useState(() => {
    const localMapbox = typeof window !== 'undefined' ? localStorage.getItem('mapbox_access_token') : null;
    const localGemini = typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') : null;
    const mapboxToken = localMapbox || import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';
    const geminiKey = localGemini || import.meta.env.GEMINI_API_KEY || '';
    return { mapboxToken, geminiKey };
  });

  const [activeZone, setActiveZone] = useState(() => {
    const cityData = CITIES['delhi'];
    return cityData ? cityData.zones[0] : null;
  });

  const [settingsOpen, setSettingsOpen] = useState(false);

  // Wrapper function to change city and active zone together, avoiding useEffect cascading renders
  const handleSelectCity = (cityKey) => {
    setActiveCity(cityKey);
    const cityData = CITIES[cityKey];
    if (cityData && cityData.zones && cityData.zones.length > 0) {
      setActiveZone(cityData.zones[0]);
    }
  };

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
            setActiveCity={handleSelectCity}
            activeZone={activeZone}
            setActiveZone={setActiveZone}
          />
        );
      case 'simulator':
        return (
          <InterventionSimulator
            key={activeZone?.id || 'none'}
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
      {settingsOpen && (
        <SettingsModal
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          onSave={handleSaveConfig}
          config={config}
        />
      )}
    </div>
  );
}
