import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  EnvironmentalSnapshot,
  CalendarEvent,
  JournalEntry
} from '../types';
import { AppContext } from './context';
import { fetchEnvironmentalData } from '../lib/weatherService';
import { getDeviceLocation } from '../lib/geolocation';
import { generateSalt, hashPin } from '../lib/pinLock';
import { translate, type Language, type TranslationKey } from '../lib/i18n';
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
const PROFILE_DATA_KEYS = ['cvHistory', 'symptomEntries', 'treatmentHistory', 'scannedProducts', 'triggerEntries', 'foodItems', 'meals', 'recipes', 'routines', 'calendarEvents', 'journalEntries', 'chatMessages', 'auditLogs'];

function loadPersisted<T>(storageKey: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + storageKey);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

// namespace verilirse (aktif profil id'si), state o profile özel bir anahtarda saklanır ve
// profil değiştiğinde otomatik olarak o profilin kendi verisiyle yeniden yüklenir.
function usePersistedState<T>(key: string, initial: T, namespace?: string) {
  const storageKey = namespace ? `${namespace}:${key}` : key;
  const [state, setState] = useState<T>(() => loadPersisted(storageKey, initial));
  const prevStorageKeyRef = useRef(storageKey);

  useEffect(() => {
    if (prevStorageKeyRef.current !== storageKey) {
      prevStorageKeyRef.current = storageKey;
      setState(loadPersisted(storageKey, initial));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PREFIX + storageKey, JSON.stringify(state));
    } catch {
      // localStorage kotası dolu ya da erişilemez durumda: veri kaybı yaşanmaması için sessizce yoksay
    }
  }, [storageKey, state]);

  return [state, setState] as const;
}

// Çoklu profil özelliğinden önce tüm veriler isimsiz (profilsiz) anahtarlarda tutuluyordu.
// Bu, mevcut kullanıcının gerçek verisini kaybetmeden yeni "profile özel anahtar" düzenine
// bir kereliğine taşır; zaten migrate edilmişse hiçbir şey yapmaz.
function migrateLegacyProfileData(defaultProfileId: string) {
  try {
    let targetProfileId = defaultProfileId;

    if (localStorage.getItem(STORAGE_PREFIX + 'profiles') === null) {
      const legacyActiveProfileRaw = localStorage.getItem(STORAGE_PREFIX + 'activeProfile');
      if (legacyActiveProfileRaw) {
        const legacyProfile = JSON.parse(legacyActiveProfileRaw);
        targetProfileId = legacyProfile.id || targetProfileId;
        localStorage.setItem(STORAGE_PREFIX + 'profiles', JSON.stringify([legacyProfile]));
        localStorage.setItem(STORAGE_PREFIX + 'activeProfileId', JSON.stringify(targetProfileId));
      }
    } else {
      const activeIdRaw = localStorage.getItem(STORAGE_PREFIX + 'activeProfileId');
      if (activeIdRaw) {
        try { targetProfileId = JSON.parse(activeIdRaw); } catch { /* yoksay */ }
      }
    }

    PROFILE_DATA_KEYS.forEach(key => {
      const newKey = `${STORAGE_PREFIX}${targetProfileId}:${key}`;
      const legacyKey = STORAGE_PREFIX + key;
      if (localStorage.getItem(newKey) === null) {
        const legacyValue = localStorage.getItem(legacyKey);
        if (legacyValue !== null) localStorage.setItem(newKey, legacyValue);
      }
    });
  } catch {
    // localStorage'a erişilemiyorsa sessizce geç; varsayılan seed veriler kullanılır
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  migrateLegacyProfileData(initialProfiles[0].id);

  const [theme, setTheme] = usePersistedState<'dark' | 'light'>('theme', 'dark');
  const [highContrast, setHighContrast] = usePersistedState<boolean>('highContrast', false);
  const [fontSize, setFontSize] = usePersistedState<'normal' | 'large' | 'xlarge'>('fontSize', 'normal');
  const [language, setLanguage] = usePersistedState<Language>('language', 'tr');
  const t = useCallback((key: TranslationKey) => translate(language, key), [language]);

  // Profiller ve aktif profil cihaz genelinde ortak (isimsiz) anahtarlarda tutulur;
  // her profile özel sağlık verisi ise aşağıda profil id'siyle adlandırılmış anahtarlarda tutulur.
  const [profiles, setProfiles] = usePersistedState<FamilyProfile[]>('profiles', initialProfiles);
  const [activeProfileId, setActiveProfileId] = usePersistedState<string>('activeProfileId', initialProfiles[0].id);
  const activeProfile = profiles.find(p => p.id === activeProfileId) ?? profiles[0] ?? initialProfiles[0];
  const isDefaultProfile = activeProfileId === initialProfiles[0].id;

  const [cvHistory, setCvHistory] = usePersistedState<CVAnalysis[]>('cvHistory', isDefaultProfile ? initialCVHistory : [], activeProfileId);
  const [symptomEntries, setSymptomEntries] = usePersistedState<SymptomEntry[]>('symptomEntries', isDefaultProfile ? initialSymptomEntries : [], activeProfileId);
  const [treatmentHistory, setTreatmentHistory] = usePersistedState<TreatmentEntry[]>('treatmentHistory', isDefaultProfile ? initialTreatmentHistory : [], activeProfileId);
  const [environmental, setEnvironmental] = usePersistedState<EnvironmentalData>('environmental', initialEnvironmental);
  const [environmentalLoading, setEnvironmentalLoading] = useState<boolean>(false);
  const [environmentalHistory, setEnvironmentalHistory] = usePersistedState<EnvironmentalSnapshot[]>('environmentalHistory', []);
  const [scannedProducts, setScannedProducts] = usePersistedState<ProductScanResult[]>('scannedProducts', isDefaultProfile ? initialScannedProducts : [], activeProfileId);
  const [triggerEntries, setTriggerEntries] = usePersistedState<TriggerEntry[]>('triggerEntries', isDefaultProfile ? initialTriggerEntries : [], activeProfileId);
  const [foodItems, setFoodItems] = usePersistedState<FoodItem[]>('foodItems', isDefaultProfile ? initialFoodItems : [], activeProfileId);
  const [meals, setMeals] = usePersistedState<Meal[]>('meals', isDefaultProfile ? initialMeals : [], activeProfileId);
  const [recipes, setRecipes] = usePersistedState<Recipe[]>('recipes', isDefaultProfile ? initialRecipes : [], activeProfileId);
  const [routines, setRoutines] = usePersistedState<RoutineTask[]>('routines', isDefaultProfile ? initialRoutines : [], activeProfileId);
  const [calendarEvents, setCalendarEvents] = usePersistedState<CalendarEvent[]>('calendarEvents', isDefaultProfile ? initialCalendarEvents : [], activeProfileId);
  const [journalEntries, setJournalEntries] = usePersistedState<JournalEntry[]>('journalEntries', isDefaultProfile ? initialJournalEntries : [], activeProfileId);
  const [auditLogs, setAuditLogs] = usePersistedState<AuditLogEntry[]>('auditLogs', isDefaultProfile ? initialAuditLogs : [], activeProfileId);
  const [chatMessages, setChatMessages] = usePersistedState<ChatMessage[]>('chatMessages', isDefaultProfile ? initialChatMessages : [], activeProfileId);

  const [voiceAssistantOpen, setVoiceAssistantOpen] = useState<boolean>(false);
  const [pinLock, setPinLock] = usePersistedState<{ hash: string; salt: string } | null>('pinLock', null);

  const addAuditLog = useCallback((action: string, details: string) => {
    const newEntry: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('tr-TR'),
      action,
      details
    };
    setAuditLogs(prev => [newEntry, ...prev]);
  }, [setAuditLogs]);

  const refreshEnvironmental = useCallback(() => {
    setEnvironmentalLoading(true);
    // Önce cihazın gerçek konumunu almayı dener (kullanıcıdan izin ister); reddedilir veya
    // desteklenmezse sabit varsayılan konuma (fetchEnvironmentalData'nın kendi öntanımlısı) düşülür.
    getDeviceLocation()
      .then(loc => fetchEnvironmentalData(loc ? { latitude: loc.latitude, longitude: loc.longitude, name: loc.name } : undefined))
      .then(data => {
        setEnvironmental(data);
        addAuditLog('Çevresel Veri Güncellemesi', `${data.city} için canlı hava/AQI/polen verisi alındı.`);

        // Bugünün gerçek ölçümünü geçmişe ekle/güncelle (İçgörüler sekmesi için).
        // Yalnızca canlı veri başarıyla geldiğinde kaydedilir; yedek veri asla geçmişe yazılmaz.
        const todayISO = new Date().toISOString().slice(0, 10);
        const snapshot: EnvironmentalSnapshot = {
          dateISO: todayISO,
          temperature: data.temperature,
          humidity: data.humidity,
          uvIndex: data.uvIndex,
          aqiOverall: data.aqi.overall,
          pollenTotal: data.pollen.tree + data.pollen.grass + data.pollen.weed
        };
        setEnvironmentalHistory(prev => {
          const withoutToday = prev.filter(s => s.dateISO !== todayISO);
          return [...withoutToday, snapshot].slice(-180);
        });
      })
      .catch(() => {
        setEnvironmental(prev => ({ ...prev, dataSource: 'yedek-veri' as const, fetchedAt: new Date().toLocaleString('tr-TR') }));
      })
      .finally(() => setEnvironmentalLoading(false));
  }, [setEnvironmental, setEnvironmentalHistory, addAuditLog]);

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
    setProfiles(prev => prev.map(p => (p.id === activeProfileId ? { ...p, ...updates } : p)));
  };

  const switchProfile = (id: string) => {
    if (profiles.some(p => p.id === id)) {
      setActiveProfileId(id);
    }
  };

  const addProfile = (profile: Omit<FamilyProfile, 'id'>): FamilyProfile => {
    const newProfile: FamilyProfile = { ...profile, id: `p-${Date.now()}` };
    setProfiles(prev => [...prev, newProfile]);
    setActiveProfileId(newProfile.id);
    addAuditLog('Yeni Profil', `${newProfile.name} adlı yeni bir aile profili oluşturuldu.`);
    return newProfile;
  };

  const removeProfile = (id: string) => {
    if (profiles.length <= 1) return;
    const removed = profiles.find(p => p.id === id);
    const fallback = profiles.find(p => p.id !== id);
    setProfiles(prev => prev.filter(p => p.id !== id));
    if (activeProfileId === id && fallback) {
      setActiveProfileId(fallback.id);
    }
    PROFILE_DATA_KEYS.forEach(key => {
      try {
        localStorage.removeItem(`${STORAGE_PREFIX}${id}:${key}`);
      } catch {
        // localStorage'a erişilemiyorsa sessizce devam et
      }
    });
    if (removed) addAuditLog('Profil Silindi', `${removed.name} adlı profil ve buna bağlı yerel veriler kaldırıldı.`);
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

  const setPinCode = async (pin: string) => {
    const salt = generateSalt();
    const hash = await hashPin(pin, salt);
    setPinLock({ hash, salt });
    addAuditLog('Uygulama Kilidi', 'PIN kodu oluşturuldu/güncellendi.');
  };

  const clearPinCode = () => {
    setPinLock(null);
    addAuditLog('Uygulama Kilidi', 'PIN kodu kaldırıldı.');
  };

  const verifyPinCode = async (pin: string) => {
    if (!pinLock) return true;
    const attemptHash = await hashPin(pin, pinLock.salt);
    return attemptHash === pinLock.hash;
  };

  // Yalnızca AKTİF profilin sağlık verilerini sıfırlar; diğer aile profilleri etkilenmez.
  const clearAllData = () => {
    PROFILE_DATA_KEYS.forEach(key => {
      try {
        localStorage.removeItem(`${STORAGE_PREFIX}${activeProfileId}:${key}`);
      } catch {
        // localStorage'a erişilemiyorsa sessizce devam et
      }
    });

    setCvHistory(isDefaultProfile ? initialCVHistory : []);
    setSymptomEntries(isDefaultProfile ? initialSymptomEntries : []);
    setTreatmentHistory(isDefaultProfile ? initialTreatmentHistory : []);
    setScannedProducts(isDefaultProfile ? initialScannedProducts : []);
    setTriggerEntries(isDefaultProfile ? initialTriggerEntries : []);
    setFoodItems(isDefaultProfile ? initialFoodItems : []);
    setMeals(isDefaultProfile ? initialMeals : []);
    setRecipes(isDefaultProfile ? initialRecipes : []);
    setRoutines(isDefaultProfile ? initialRoutines : []);
    setCalendarEvents(isDefaultProfile ? initialCalendarEvents : []);
    setJournalEntries(isDefaultProfile ? initialJournalEntries : []);
    setChatMessages(isDefaultProfile ? initialChatMessages : []);
    setAuditLogs(isDefaultProfile ? initialAuditLogs : []);
    addAuditLog('Yerel Veri Sıfırlama', `${activeProfile.name} profiline ait yerel veriler fabrika ayarlarına sıfırlandı.`);
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
      language,
      setLanguage,
      t,
      activeProfile,
      profiles,
      switchProfile,
      addProfile,
      removeProfile,
      updateActiveProfile,
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
      environmentalHistory,
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
      pinLockEnabled: pinLock !== null,
      setPinCode,
      clearPinCode,
      verifyPinCode,
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
