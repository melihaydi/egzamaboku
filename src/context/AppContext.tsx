import React, { useState, useEffect } from 'react';
import type {
  CVAnalysis,
  EnvironmentalData,
  FamilyProfile,
  FoodLogItem,
  HealingScoreData,
  ProductScanResult,
  RoutineTask,
  SymptomCorrelation,
  AuditLogEntry,
  TreatmentEntry,
  ChatMessage
} from '../types';
import { AppContext } from './context';
import {
  initialCVHistory,
  initialEnvironmental,
  initialFoodLogs,
  initialHealingScore,
  initialProfiles,
  initialRoutines,
  initialScannedProducts,
  initialCorrelations,
  initialAuditLogs,
  initialTreatmentHistory,
  initialChatMessages
} from '../mock/mockData';

// Yerel Depolama (localStorage) Kalıcılık Katmanı
// Sayfa yenilendiğinde veya tarayıcı kapatılıp açıldığında kaydedilen veriler kaybolmasın diye eklendi.
const STORAGE_PREFIX = 'dermiq:';

function loadPersisted<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function usePersistedState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => loadPersisted(key, initial));

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(state));
    } catch {
      // localStorage kotası dolu ya da erişilemez durumda: veri kaybı yaşanmaması için sessizce yoksay
    }
  }, [key, state]);

  return [state, setState] as const;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = usePersistedState<'dark' | 'light'>('theme', 'dark');
  const [highContrast, setHighContrast] = usePersistedState<boolean>('highContrast', false);
  const [fontSize, setFontSize] = usePersistedState<'normal' | 'large' | 'xlarge'>('fontSize', 'normal');

  const [profiles] = useState<FamilyProfile[]>(initialProfiles);
  const [activeProfile, setActiveProfile] = usePersistedState<FamilyProfile>('activeProfile', initialProfiles[0]);

  const [cvHistory, setCvHistory] = usePersistedState<CVAnalysis[]>('cvHistory', initialCVHistory);
  const [treatmentHistory, setTreatmentHistory] = usePersistedState<TreatmentEntry[]>('treatmentHistory', initialTreatmentHistory);
  const [healingScore, setHealingScore] = usePersistedState<HealingScoreData>('healingScore', initialHealingScore);
  const [environmental] = useState<EnvironmentalData>(initialEnvironmental);
  const [scannedProducts, setScannedProducts] = usePersistedState<ProductScanResult[]>('scannedProducts', initialScannedProducts);
  const [foodLogs, setFoodLogs] = usePersistedState<FoodLogItem[]>('foodLogs', initialFoodLogs);
  const [correlations] = useState<SymptomCorrelation[]>(initialCorrelations);
  const [routines, setRoutines] = usePersistedState<RoutineTask[]>('routines', initialRoutines);
  const [auditLogs, setAuditLogs] = usePersistedState<AuditLogEntry[]>('auditLogs', initialAuditLogs);
  const [chatMessages, setChatMessages] = usePersistedState<ChatMessage[]>('chatMessages', initialChatMessages);

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

  const updateActiveProfile = (updates: Partial<FamilyProfile>) => {
    setActiveProfile(prev => ({ ...prev, ...updates }));
  };

  const addTreatmentEntry = (entry: TreatmentEntry) => {
    setTreatmentHistory(prev => [entry, ...prev]);
    addAuditLog('Tedavi Geçmişi Güncellemesi', `${entry.medicationName} tedavi kaydı eklendi (${entry.status}).`);
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

  const addChatMessage = (message: ChatMessage) => {
    setChatMessages(prev => [...prev, message]);
  };

  const clearChatMessages = () => {
    setChatMessages(initialChatMessages);
  };

  const clearAllData = () => {
    const dataKeys = ['activeProfile', 'cvHistory', 'treatmentHistory', 'healingScore', 'scannedProducts', 'foodLogs', 'routines', 'auditLogs', 'chatMessages'];
    dataKeys.forEach(key => {
      try {
        localStorage.removeItem(STORAGE_PREFIX + key);
      } catch {
        // localStorage'a erişilemiyorsa sessizce devam et
      }
    });

    setActiveProfile(initialProfiles[0]);
    setCvHistory(initialCVHistory);
    setTreatmentHistory(initialTreatmentHistory);
    setHealingScore(initialHealingScore);
    setScannedProducts(initialScannedProducts);
    setFoodLogs(initialFoodLogs);
    setRoutines(initialRoutines);
    setChatMessages(initialChatMessages);
    setAuditLogs([{
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('tr-TR'),
      action: 'Yerel Veri Sıfırlama',
      details: 'Kullanıcı talebiyle tüm yerel oturum verileri fabrika ayarlarına sıfırlandı.',
      ipAddress: '127.0.0.1 (Şifreli Oturum)'
    }]);
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
      updateActiveProfile,
      profiles,
      cvHistory,
      addCVAnalysis,
      treatmentHistory,
      addTreatmentEntry,
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
      addAuditLog,
      chatMessages,
      addChatMessage,
      clearChatMessages,
      clearAllData
    }}>
      {children}
    </AppContext.Provider>
  );
};
