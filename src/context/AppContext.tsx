import React, { useState, useEffect, useCallback } from 'react';
import type {
  CVAnalysis,
  FamilyProfile,
  FoodLogItem,
  FlareScoreData,
  ProductScanResult,
  RoutineTask,
  AuditLogEntry,
  TreatmentEntry,
  ChatMessage,
  EnvironmentalData,
  CalendarEvent,
  JournalEntry
} from '../types';
import { AppContext } from './context';
import { fetchEnvironmentalData } from '../lib/weatherService';
import {
  initialCVHistory,
  initialFoodLogs,
  initialFlareScore,
  initialProfiles,
  initialRoutines,
  initialScannedProducts,
  initialCorrelations,
  initialAuditLogs,
  initialTreatmentHistory,
  initialChatMessages,
  initialEnvironmental,
  initialCalendarEvents,
  initialJournalEntries
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
  const [flareScore, setFlareScore] = usePersistedState<FlareScoreData>('flareScore', initialFlareScore);
  const [environmental, setEnvironmental] = usePersistedState<EnvironmentalData>('environmental', initialEnvironmental);
  const [environmentalLoading, setEnvironmentalLoading] = useState<boolean>(false);
  const [scannedProducts, setScannedProducts] = usePersistedState<ProductScanResult[]>('scannedProducts', initialScannedProducts);
  const [foodLogs, setFoodLogs] = usePersistedState<FoodLogItem[]>('foodLogs', initialFoodLogs);
  const [correlations] = useState(initialCorrelations);
  const [routines, setRoutines] = usePersistedState<RoutineTask[]>('routines', initialRoutines);
  const [calendarEvents, setCalendarEvents] = usePersistedState<CalendarEvent[]>('calendarEvents', initialCalendarEvents);
  const [journalEntries, setJournalEntries] = usePersistedState<JournalEntry[]>('journalEntries', initialJournalEntries);
  const [auditLogs, setAuditLogs] = usePersistedState<AuditLogEntry[]>('auditLogs', initialAuditLogs);
  const [chatMessages, setChatMessages] = usePersistedState<ChatMessage[]>('chatMessages', initialChatMessages);

  const [voiceAssistantOpen, setVoiceAssistantOpen] = useState<boolean>(false);
  const [healthSyncActive, setHealthSyncActive] = useState<boolean>(true);
  const [wearableWidgetOpen, setWearableWidgetOpen] = useState<boolean>(false);

  const addAuditLog = useCallback((action: string, details: string) => {
    const newEntry: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('tr-TR'),
      action,
      details,
      ipAddress: '127.0.0.1 (Şifreli Oturum)'
    };
    setAuditLogs(prev => [newEntry, ...prev]);
  }, [setAuditLogs]);

  const refreshEnvironmental = useCallback(() => {
    setEnvironmentalLoading(true);
    fetchEnvironmentalData()
      .then(data => {
        setEnvironmental(data);
        addAuditLog('Çevresel Veri Güncellemesi', `${data.city} için canlı hava/AQI/polen verisi alındı.`);
      })
      .catch(() => {
        setEnvironmental(prev => ({ ...prev, dataSource: 'yedek-veri' as const, fetchedAt: new Date().toLocaleString('tr-TR') }));
      })
      .finally(() => setEnvironmentalLoading(false));
  }, [setEnvironmental, addAuditLog]);

  useEffect(() => {
    refreshEnvironmental();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addCVAnalysis = (analysis: CVAnalysis) => {
    setCvHistory(prev => [analysis, ...prev]);
    addCalendarEvent({ dateISO: new Date().toISOString().slice(0, 10), type: 'photo', title: `${analysis.location} fotoğraf taraması`, description: `SCORAD ${analysis.scoradIndex}` });
    addAuditLog('Görsel Yapay Zeka Taraması', `${analysis.location} bölgesi için fotoğraf analizi tamamlandı (%${analysis.confidenceScore} güven).`);
  };

  const updateActiveProfile = (updates: Partial<FamilyProfile>) => {
    setActiveProfile(prev => ({ ...prev, ...updates }));
  };

  const addTreatmentEntry = (entry: TreatmentEntry) => {
    setTreatmentHistory(prev => [entry, ...prev]);
    addCalendarEvent({ dateISO: new Date().toISOString().slice(0, 10), type: 'medication', title: `${entry.medicationName} başlandı`, description: entry.drugClass });
    addAuditLog('Tedavi Geçmişi Güncellemesi', `${entry.medicationName} tedavi kaydı eklendi (${entry.status}).`);
  };

  const updateFlareFactor = (factorKey: keyof FlareScoreData['factors'], change: number) => {
    setFlareScore(prev => {
      const currentFactor = prev.factors[factorKey];
      const updatedFactorScore = Math.min(100, Math.max(0, currentFactor.score + change));
      const factorDelta = (updatedFactorScore - currentFactor.score) * (currentFactor.weight / 100);
      const newCurrentScore = Math.round(Math.min(100, Math.max(0, prev.currentScore + factorDelta)));
      const severityLevel: FlareScoreData['severityLevel'] =
        newCurrentScore > 75 ? 'Çok Şiddetli' : newCurrentScore > 50 ? 'Şiddetli' : newCurrentScore > 25 ? 'Orta' : 'Hafif';

      return {
        ...prev,
        currentScore: newCurrentScore,
        severityLevel,
        factors: {
          ...prev.factors,
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
          updateFlareFactor('dryness', -4);
        } else if (nextCompleted && task.category === 'İlaç / Krem') {
          updateFlareFactor('medicationAdherence', -4);
        }
        return { ...task, completed: nextCompleted };
      }
      return task;
    }));
  };

  const addRoutineTask = (task: Omit<RoutineTask, 'id' | 'order' | 'completed'>) => {
    setRoutines(prev => {
      const siblingOrders = prev.filter(t => t.timeOfDay === task.timeOfDay).map(t => t.order);
      const nextOrder = siblingOrders.length > 0 ? Math.max(...siblingOrders) + 1 : 0;
      return [...prev, { ...task, id: `r-${Date.now()}`, order: nextOrder, completed: false }];
    });
  };

  const removeRoutineTask = (id: string) => {
    setRoutines(prev => prev.filter(t => t.id !== id));
  };

  const updateRoutineTask = (id: string, updates: Partial<RoutineTask>) => {
    setRoutines(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
  };

  const reorderRoutineTasks = (timeOfDay: RoutineTask['timeOfDay'], orderedIds: string[]) => {
    setRoutines(prev => prev.map(t => {
      if (t.timeOfDay !== timeOfDay) return t;
      const idx = orderedIds.indexOf(t.id);
      return idx === -1 ? t : { ...t, order: idx };
    }));
  };

  const addCalendarEvent = (event: Omit<CalendarEvent, 'id'>) => {
    setCalendarEvents(prev => [{ ...event, id: `cal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }, ...prev]);
  };

  const removeCalendarEvent = (id: string) => {
    setCalendarEvents(prev => prev.filter(e => e.id !== id));
  };

  const addJournalEntry = (entry: Omit<JournalEntry, 'id'>) => {
    setJournalEntries(prev => [{ ...entry, id: `j-${Date.now()}` }, ...prev]);
  };

  const updateJournalEntry = (id: string, updates: Partial<JournalEntry>) => {
    setJournalEntries(prev => prev.map(e => (e.id === id ? { ...e, ...updates } : e)));
  };

  const removeJournalEntry = (id: string) => {
    setJournalEntries(prev => prev.filter(e => e.id !== id));
  };

  const addChatMessage = (message: ChatMessage) => {
    setChatMessages(prev => [...prev, message]);
  };

  const clearChatMessages = () => {
    setChatMessages(initialChatMessages);
  };

  const clearAllData = () => {
    const dataKeys = ['activeProfile', 'cvHistory', 'treatmentHistory', 'flareScore', 'scannedProducts', 'foodLogs', 'routines', 'calendarEvents', 'journalEntries', 'auditLogs', 'chatMessages'];
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
    setFlareScore(initialFlareScore);
    setScannedProducts(initialScannedProducts);
    setFoodLogs(initialFoodLogs);
    setRoutines(initialRoutines);
    setCalendarEvents(initialCalendarEvents);
    setJournalEntries(initialJournalEntries);
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
      flareScore,
      updateFlareFactor,
      environmental,
      environmentalLoading,
      refreshEnvironmental,
      scannedProducts,
      addScannedProduct,
      foodLogs,
      addFoodLog,
      correlations,
      routines,
      toggleRoutineTask,
      addRoutineTask,
      removeRoutineTask,
      updateRoutineTask,
      reorderRoutineTasks,
      calendarEvents,
      addCalendarEvent,
      removeCalendarEvent,
      journalEntries,
      addJournalEntry,
      updateJournalEntry,
      removeJournalEntry,
      voiceAssistantOpen,
      setVoiceAssistantOpen,
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
