import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import type { ActiveTab } from './components/layout/Sidebar';
import { EmergencyBanner } from './components/layout/EmergencyBanner';
import { HealingScoreCard } from './components/score/HealingScoreCard';
import { ComputerVisionEngine } from './components/cv/ComputerVisionEngine';
import { TreatmentHistory } from './components/treatment/TreatmentHistory';
import { WeatherIntelligence } from './components/environmental/WeatherIntelligence';
import { IngredientScanner } from './components/scanner/IngredientScanner';
import { FoodIntelligence } from './components/food/FoodIntelligence';
import { RoutineBuilder } from './components/routine/RoutineBuilder';
import { DermatologyKB } from './components/knowledge/DermatologyKB';
import { DoctorVisitPrep } from './components/doctor/DoctorVisitPrep';
import { PrivacySettings } from './components/security/PrivacySettings';
import { VoiceAssistantModal } from './components/voice/VoiceAssistantModal';
import { WearableWidget } from './components/wearable/WearableWidget';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const { highContrast, fontSize } = useApp();

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'large': return 'text-[17px]';
      case 'xlarge': return 'text-[19px]';
      default: return 'text-[15px]';
    }
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 font-sans ${highContrast ? 'contrast-125 brightness-110' : ''} ${getFontSizeClass()}`}>
      <EmergencyBanner />
      <Header />

      <div className="flex flex-col md:flex-row min-h-[calc(100vh-65px)]">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {activeTab === 'overview' && <HealingScoreCard />}
          {activeTab === 'cv' && <ComputerVisionEngine />}
          {activeTab === 'treatment' && <TreatmentHistory />}
          {activeTab === 'environmental' && <WeatherIntelligence />}
          {activeTab === 'scanner' && <IngredientScanner />}
          {activeTab === 'food' && <FoodIntelligence />}
          {activeTab === 'routine' && <RoutineBuilder />}
          {activeTab === 'knowledge' && <DermatologyKB />}
          {activeTab === 'doctor' && <DoctorVisitPrep />}
          {activeTab === 'security' && <PrivacySettings />}
        </main>
      </div>

      <VoiceAssistantModal />
      <WearableWidget />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
