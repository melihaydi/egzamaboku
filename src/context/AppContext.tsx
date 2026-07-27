import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  CVAnalysis, 
  EnvironmentalData, 
  FamilyProfile, 
  FoodLogItem, 
  HealingScoreData, 
  ProductScanResult, 
  RoutineTask, 
  SymptomCorrelation,
  AuditLogEntry
} from '../types';
import { 
  initialCVHistory, 
  initialEnvironmental, 
  initialFoodLogs, 
  initialHealingScore, 
  initialProfiles, 
  initialRoutines, 
  initialScannedProducts,
  initialCorrelations,
  initialAuditLogs
} from '../mock/mockData';

interface AppContextType {
  // Tema & Erişilebilirlik
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
  highContrast: boolean;
  setHighContrast: (v: boolean) => void;
  fontSize: 'normal' | 'large' | 'xlarge';
  setFontSize: (s: 'normal' | 'large' | 'xlarge') => void;
  
  // Profil Yönetimi
  activeProfile: FamilyProfile;
  setActiveProfile: (p: FamilyProfile) => void;
  profiles: FamilyProfile[];
  
  // Veri Durumları
  cvHistory: CVAnalysis[];
  addCVAnalysis: (analysis: CVAnalysis) => void;
  
  healingScore: HealingScoreData;
  updateHabitScore: (factorKey: keyof HealingScoreData['habitFactors'], change: number) => void;
  
  environmental: EnvironmentalData;
  scannedProducts: ProductScanResult[];
  addScannedProduct: (prod: ProductScanResult) => void;
  
  foodLogs: FoodLogItem[];
  addFoodLog: (item: FoodLogItem) => void;
  correlations: SymptomCorrelation[];
  
  routines: RoutineTask[];
  toggleRoutineTask: (id: string) => void;
  addRoutineTask: (task: RoutineTask) => void;
  
  // Acil Durum Modal
  emergencyModalOpen: boolean;
  setEmergencyModalOpen: (v: boolean) => void;
  
  // Sesli Asistan
  voiceAssistantOpen: boolean;
  setVoiceAssistantOpen: (v: boolean) => void;
  
  // Doktor Portalı Mode
  doctorPortalMode: boolean;
  setDoctorPortalMode: (v: boolean) => void;
  doctorAccessCode: string;
  setDoctorAccessCode: (c: string) => void;
  
  // Sağlık Eşleşmesi & Akıllı Saat
  healthSyncActive: boolean;
  setHealthSyncActive: (v: boolean) => void;
  wearableWidgetOpen: boolean;
  setWearableWidgetOpen: (v: boolean) => void;
  
  // Loglar
  auditLogs: AuditLogEntry[];
  addAuditLog: (action: string, details: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  
  const [profiles] = useState<FamilyProfile[]>(initialProfiles);
  const [activeProfile, setActiveProfile] = useState<FamilyProfile>(initialProfiles[0]);
  
  const [cvHistory, setCvHistory] = useState<CVAnalysis[]>(initialCVHistory);
  const [healingScore, setHealingScore] = useState<HealingScoreData>(initialHealingScore);
  const [environmental] = useState<EnvironmentalData>(initialEnvironmental);
  const [scannedProducts, setScannedProducts] = useState<ProductScanResult[]>(initialScannedProducts);
  const [foodLogs, setFoodLogs] = useState<FoodLogItem[]>(initialFoodLogs);
  const [correlations] = useState<SymptomCorrelation[]>(initialCorrelations);
  const [routines, setRoutines] = useState<RoutineTask[]>(initialRoutines);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(initialAuditLogs);
  
  const [emergencyModalOpen, setEmergencyModalOpen] = useState<boolean>(false);
  const [voiceAssistantOpen, setVoiceAssistantOpen] = useState<boolean>(false);
  const [doctorPortalMode, setDoctorPortalMode] = useState<boolean>(false);
  const [doctorAccessCode, setDoctorAccessCode] = useState<string>('');
  const [healthSyncActive, setHealthSyncActive] = useState<boolean>(true);
  const [wearableWidgetOpen, setWearableWidgetOpen] = useState<boolean>(false);

  const addCVAnalysis = (analysis: CVAnalysis) => {
    setCvHistory(prev => [analysis, ...prev]);
    setHealingScore(prev => {
      const newScore = Math.min(100, Math.max(0, prev.currentScore + 2));
      return {
        ...prev,
        currentScore: newScore,
        weeklyTrend: [...prev.weeklyTrend.slice(1), newScore]
      };
    });
    addAuditLog('Görsel Yapay Zeka Taraması', `${analysis.location} bölgesi için fotoğraf analizi tamamlandı (%${analysis.confidenceScore} doğruluk).`);
  };

  const updateHabitScore = (factorKey: keyof HealingScoreData['habitFactors'], change: number) => {
    setHealingScore(prev => {
      const currentFactor = prev.habitFactors[factorKey];
      const updatedFactorScore = Math.min(100, Math.max(0, currentFactor.score + change));
      const factorDelta = (updatedFactorScore - currentFactor.score) * (currentFactor.weight / 100);
      const newCurrentScore = Math.round(Math.min(100, Math.max(0, prev.currentScore + factorDelta)));
      
      return {
        ...prev,
        currentScore: newCurrentScore,
        habitFactors: {
          ...prev.habitFactors,
          [factorKey]: {
            ...currentFactor,
            score: updatedFactorScore
          }
        }
      };
    });
  };

  const addScannedProduct = (prod: ProductScanResult) => {
    setScannedProducts(prev => [prod, ...prev]);
    addAuditLog('İçerik OCR Taraması', `${prod.brand} - ${prod.productName} ürünü incelendi. Uyum Skoru: %${prod.compatibilityScore}.`);
  };

  const addFoodLog = (item: FoodLogItem) => {
    setFoodLogs(prev => [item, ...prev]);
    addAuditLog('Beslenme Kaydı', `${item.name} (${item.category}) günlüğe eklendi. Histamin Seviyesi: ${item.histamineLevel}.`);
  };

  const toggleRoutineTask = (id: string) => {
    setRoutines(prev => prev.map(task => {
      if (task.id === id) {
        const nextCompleted = !task.completed;
        if (nextCompleted && task.category === 'Nemlendirici') {
          updateHabitScore('moisturizerConsistency', 5);
        } else if (nextCompleted && task.category === 'İlaç / Krem') {
          updateHabitScore('medicationAdherence', 5);
        }
        return { ...task, completed: nextCompleted };
      }
      return task;
    }));
  };

  const addRoutineTask = (task: RoutineTask) => {
    setRoutines(prev => [...prev, task]);
  };

  const addAuditLog = (action: string, details: string) => {
    const newEntry: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('tr-TR'),
      action,
      details,
      ipAddress: '127.0.0.1 (Şifreli Oturum)'
    };
    setAuditLogs(prev => [newEntry, ...prev]);
  };

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  return (
    <AppContext.Provider value={{
      theme,
      setTheme,
      highContrast,
      setHighContrast,
      fontSize,
      setFontSize,
      activeProfile,
      setActiveProfile,
      profiles,
      cvHistory,
      addCVAnalysis,
      healingScore,
      updateHabitScore,
      environmental,
      scannedProducts,
      addScannedProduct,
      foodLogs,
      addFoodLog,
      correlations,
      routines,
      toggleRoutineTask,
      addRoutineTask,
      emergencyModalOpen,
      setEmergencyModalOpen,
      voiceAssistantOpen,
      setVoiceAssistantOpen,
      doctorPortalMode,
      setDoctorPortalMode,
      doctorAccessCode,
      setDoctorAccessCode,
      healthSyncActive,
      setHealthSyncActive,
      wearableWidgetOpen,
      setWearableWidgetOpen,
      auditLogs,
      addAuditLog
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
