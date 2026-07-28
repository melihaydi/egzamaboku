import React, { useState, Suspense, lazy } from 'react';
import { AppProvider } from './context/AppContext';
import { useApp } from './context/useApp';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import type { ActiveTab } from './components/layout/Sidebar';
import { VoiceAssistantModal } from './components/voice/VoiceAssistantModal';
import { WearableWidget } from './components/wearable/WearableWidget';

const FlareScoreCard = lazy(() => import('./components/flare/FlareScoreCard').then(m => ({ default: m.FlareScoreCard })));
const ComputerVisionEngine = lazy(() => import('./components/cv/ComputerVisionEngine').then(m => ({ default: m.ComputerVisionEngine })));
const TreatmentHistory = lazy(() => import('./components/treatment/TreatmentHistory').then(m => ({ default: m.TreatmentHistory })));
const WeatherIntelligence = lazy(() => import('./components/environmental/WeatherIntelligence').then(m => ({ default: m.WeatherIntelligence })));
const IngredientScanner = lazy(() => import('./components/scanner/IngredientScanner').then(m => ({ default: m.IngredientScanner })));
const FoodIntelligence = lazy(() => import('./components/food/FoodIntelligence').then(m => ({ default: m.FoodIntelligence })));
const RoutineBuilder = lazy(() => import('./components/routine/RoutineBuilder').then(m => ({ default: m.RoutineBuilder })));
const HealthJournal = lazy(() => import('./components/journal/HealthJournal').then(m => ({ default: m.HealthJournal })));
const CalendarTimeline = lazy(() => import('./components/calendar/CalendarTimeline').then(m => ({ default: m.CalendarTimeline })));
const AIChatAssistant = lazy(() => import('./components/chat/AIChatAssistant').then(m => ({ default: m.AIChatAssistant })));
const PrivacySettings = lazy(() => import('./components/security/PrivacySettings').then(m => ({ default: m.PrivacySettings })));

const TabFallback: React.FC = () => (
  <div className="flex items-center justify-center py-24">
    <div className="w-8 h-8 border-2 border-neutral-700 border-t-neutral-300 rounded-full animate-spin" />
  </div>
);

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { highContrast, fontSize } = useApp();

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'large': return 'text-[17px]';
      case 'xlarge': return 'text-[19px]';
      default: return 'text-[15px]';
    }
  };

  return (
    <div className={`min-h-screen bg-neutral-950 text-neutral-100 font-sans ${highContrast ? 'contrast-125 brightness-110' : ''} ${getFontSizeClass()}`}>
      <Header onOpenMobileNav={() => setMobileNavOpen(true)} />

      <div className="flex flex-col md:flex-row min-h-[calc(100vh-65px)]">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobileOpen={mobileNavOpen}
          onCloseMobile={() => setMobileNavOpen(false)}
        />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full space-y-6 [padding-bottom:calc(env(safe-area-inset-bottom)+1rem)]">
          <Suspense fallback={<TabFallback />}>
            {activeTab === 'overview' && <FlareScoreCard />}
            {activeTab === 'cv' && <ComputerVisionEngine />}
            {activeTab === 'calendar' && <CalendarTimeline />}
            {activeTab === 'treatment' && <TreatmentHistory />}
            {activeTab === 'chat' && <AIChatAssistant />}
            {activeTab === 'environmental' && <WeatherIntelligence />}
            {activeTab === 'scanner' && <IngredientScanner />}
            {activeTab === 'food' && <FoodIntelligence />}
            {activeTab === 'routine' && <RoutineBuilder />}
            {activeTab === 'journal' && <HealthJournal />}
            {activeTab === 'security' && <PrivacySettings />}
          </Suspense>
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
