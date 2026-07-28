import React, { useState, useEffect, useCallback } from 'react';
import type {
  CVAnalysis,
  FamilyProfile,
  FoodItem,
  Meal,
  Recipe,
  SymptomEntry,
  TriggerEntry,
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
  initialSymptomEntries,
  initialProfiles,
  initialRoutines,
  initialScannedProducts,
  initialTriggerEntries,
  initialFoodItems,
  initialMeals,
  initialRecipes,
  initialAuditLogs,
  initialTreatmentHistory,
  initialChatMessages,
  initialEnvironmental,
  initialCalendarEvents,
  initialJournalEntries
} from '../mock/mockData';

// Yerel Depolama (localStorage) Kalıcılık Katmanı
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
  const [symptomEntries, setSymptomEntries] = usePersistedState<SymptomEntry[]>('symptomEntries', initialSymptomEntries);
  const [treatmentHistory, setTreatmentHistory] = usePersistedState<TreatmentEntry[]>('treatmentHistory', initialTreatmentHistory);
  const [environmental, setEnvironmental] = usePersistedState<EnvironmentalData>('environmental', initialEnvironmental);
  const [environmentalLoading, setEnvironmentalLoading] = useState<boolean>(false);
  const [scannedProducts, setScannedProducts] = usePersistedState<ProductScanResult[]>('scannedProducts', initialScannedProducts);
  const [triggerEntries, setTriggerEntries] = usePersistedState<TriggerEntry[]>('triggerEntries', initialTriggerEntries);
  const [foodItems, setFoodItems] = usePersistedState<FoodItem[]>('foodItems', initialFoodItems);
  const [meals, setMeals] = usePersistedState<Meal[]>('meals', initialMeals);
  const [recipes, setRecipes] = usePersistedState<Recipe[]>('recipes', initialRecipes);
  const [routines, setRoutines] = usePersistedState<RoutineTask[]>('routines', initialRoutines);
  const [calendarEvents, setCalendarEvents] = usePersistedState<CalendarEvent[]>('calendarEvents', initialCalendarEvents);
  const [journalEntries, setJournalEntries] = usePersistedState<JournalEntry[]>('journalEntries', initialJournalEntries);
  const [auditLogs, setAuditLogs] = usePersistedState<AuditLogEntry[]>('auditLogs', initialAuditLogs);
  const [chatMessages, setChatMessages] = usePersistedState<ChatMessage[]>('chatMessages', initialChatMessages);

  const [voiceAssistantOpen, setVoiceAssistantOpen] = useState<boolean>(false);
  const [healthSyncActive, setHealthSyncActive] = useState<boolean>(true);

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
    addCalendarEvent({ dateISO: new Date().toISOString().slice(0, 10), type: 'photo', title: `${analysis.location} fotoğraf taraması`, description: `Etkilenen alan: ${analysis.surfaceAreaCm2} cm²` });
    addAuditLog('Görsel Analiz', `${analysis.location} bölgesi için fotoğraf analizi tamamlandı (%${analysis.confidenceScore} güven).`);
  };

  const addSymptomEntry = (entry: Omit<SymptomEntry, 'id' | 'timestamp'>) => {
    const newEntry: SymptomEntry = { ...entry, id: `sym-${Date.now()}`, timestamp: new Date().toLocaleString('tr-TR') };
    setSymptomEntries(prev => [newEntry, ...prev]);
    addAuditLog('Belirti Kaydı', `Kullanıcı belirti şiddetlerini kaydetti (kaşıntı: ${entry.itching}/10).`);
  };

  const updateSymptomEntry = (id: string, updates: Partial<SymptomEntry>) => {
    setSymptomEntries(prev => prev.map(e => (e.id === id ? { ...e, ...updates } : e)));
  };

  const removeSymptomEntry = (id: string) => {
    setSymptomEntries(prev => prev.filter(e => e.id !== id));
  };

  const updateActiveProfile = (updates: Partial<FamilyProfile>) => {
    setActiveProfile(prev => ({ ...prev, ...updates }));
  };

  const addTreatmentEntry = (entry: TreatmentEntry) => {
    setTreatmentHistory(prev => [entry, ...prev]);
    addCalendarEvent({ dateISO: new Date().toISOString().slice(0, 10), type: 'medication', title: `${entry.medicationName} başlandı`, description: entry.drugClass });
    addAuditLog('Tedavi Geçmişi Güncellemesi', `${entry.medicationName} tedavi kaydı eklendi (${entry.status}).`);
  };

  const updateTreatmentEntry = (id: string, updates: Partial<TreatmentEntry>) => {
    setTreatmentHistory(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
  };

  const removeTreatmentEntry = (id: string) => {
    setTreatmentHistory(prev => prev.filter(t => t.id !== id));
  };

  const addScannedProduct = (prod: ProductScanResult) => {
    setScannedProducts(prev => [prod, ...prev]);
    addAuditLog('İçerik OCR Taraması', `${prod.brand} - ${prod.productName} ürünü incelendi. Uyum Skoru: %${prod.compatibilityScore}.`);
  };

  const addTriggerEntry = (entry: Omit<TriggerEntry, 'id'>) => {
    setTriggerEntries(prev => [{ ...entry, id: `trig-${Date.now()}` }, ...prev]);
  };

  const removeTriggerEntry = (id: string) => {
    setTriggerEntries(prev => prev.filter(e => e.id !== id));
  };

  const addFoodItem = (item: Omit<FoodItem, 'id' | 'timesLogged' | 'lastLoggedISO'>) => {
    setFoodItems(prev => [{ ...item, id: `food-${Date.now()}`, timesLogged: 1, lastLoggedISO: new Date().toISOString().slice(0, 10) }, ...prev]);
  };

  const updateFoodItem = (id: string, updates: Partial<FoodItem>) => {
    setFoodItems(prev => prev.map(f => (f.id === id ? { ...f, ...updates } : f)));
  };

  const removeFoodItem = (id: string) => {
    setFoodItems(prev => prev.filter(f => f.id !== id));
  };

  const addMeal = (meal: Omit<Meal, 'id'>) => {
    setMeals(prev => [{ ...meal, id: `meal-${Date.now()}` }, ...prev]);
    meal.foodNames.forEach(name => {
      setFoodItems(prev => {
        const existing = prev.find(f => f.name.toLowerCase() === name.toLowerCase());
        if (existing) {
          return prev.map(f => (f.id === existing.id ? { ...f, timesLogged: f.timesLogged + 1, lastLoggedISO: meal.dateISO } : f));
        }
        return [{ id: `food-${Date.now()}-${name}`, name, rating: 'Güvenli', timesLogged: 1, lastLoggedISO: meal.dateISO }, ...prev];
      });
    });
  };

  const removeMeal = (id: string) => {
    setMeals(prev => prev.filter(m => m.id !== id));
  };

  const addRecipe = (recipe: Omit<Recipe, 'id'>) => {
    setRecipes(prev => [{ ...recipe, id: `recipe-${Date.now()}` }, ...prev]);
  };

  const removeRecipe = (id: string) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
  };

  const toggleRoutineTask = (id: string) => {
    setRoutines(prev => prev.map(task => (task.id === id ? { ...task, completed: !task.completed } : task)));
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

  const updateCalendarEvent = (id: string, updates: Partial<CalendarEvent>) => {
    setCalendarEvents(prev => prev.map(e => (e.id === id ? { ...e, ...updates } : e)));
  };

  const removeCalendarEvent = (id: string) => {
    setCalendarEvents(prev => prev.filter(e => e.id !== id));
  };

  const duplicateCalendarEvent = (id: string, newDateISO: string) => {
    setCalendarEvents(prev => {
      const source = prev.find(e => e.id === id);
      if (!source) return prev;
      return [{ ...source, id: `cal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, dateISO: newDateISO }, ...prev];
    });
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
    const dataKeys = ['activeProfile', 'cvHistory', 'symptomEntries', 'treatmentHistory', 'scannedProducts', 'triggerEntries', 'foodItems', 'meals', 'recipes', 'routines', 'calendarEvents', 'journalEntries', 'auditLogs', 'chatMessages'];
    dataKeys.forEach(key => {
      try {
        localStorage.removeItem(STORAGE_PREFIX + key);
      } catch {
        // localStorage'a erişilemiyorsa sessizce devam et
      }
    });

    setActiveProfile(initialProfiles[0]);
    setCvHistory(initialCVHistory);
    setSymptomEntries(initialSymptomEntries);
    setTreatmentHistory(initialTreatmentHistory);
    setScannedProducts(initialScannedProducts);
    setTriggerEntries(initialTriggerEntries);
    setFoodItems(initialFoodItems);
    setMeals(initialMeals);
    setRecipes(initialRecipes);
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
      symptomEntries,
      addSymptomEntry,
      updateSymptomEntry,
      removeSymptomEntry,
      treatmentHistory,
      addTreatmentEntry,
      updateTreatmentEntry,
      removeTreatmentEntry,
      environmental,
      environmentalLoading,
      refreshEnvironmental,
      scannedProducts,
      addScannedProduct,
      triggerEntries,
      addTriggerEntry,
      removeTriggerEntry,
      foodItems,
      addFoodItem,
      updateFoodItem,
      removeFoodItem,
      meals,
      addMeal,
      removeMeal,
      recipes,
      addRecipe,
      removeRecipe,
      routines,
      toggleRoutineTask,
      addRoutineTask,
      removeRoutineTask,
      updateRoutineTask,
      reorderRoutineTasks,
      calendarEvents,
      addCalendarEvent,
      updateCalendarEvent,
      removeCalendarEvent,
      duplicateCalendarEvent,
      journalEntries,
      addJournalEntry,
      updateJournalEntry,
      removeJournalEntry,
      voiceAssistantOpen,
      setVoiceAssistantOpen,
      healthSyncActive,
      setHealthSyncActive,
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
