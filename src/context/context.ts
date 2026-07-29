import { createContext } from 'react';
import type {
  CVAnalysis,
  EnvironmentalData,
  EnvironmentalSnapshot,
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
  CalendarEvent,
  JournalEntry
} from '../types';

export interface AppContextType {
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
  updateActiveProfile: (updates: Partial<FamilyProfile>) => void;
  profiles: FamilyProfile[];

  // Görsel Analiz (yalnızca fotoğraftan ölçülen veriler)
  cvHistory: CVAnalysis[];
  addCVAnalysis: (analysis: CVAnalysis) => void;

  // Kullanıcının kendi bildirdiği belirti şiddetleri (0-10 sliderlar)
  symptomEntries: SymptomEntry[];
  addSymptomEntry: (entry: Omit<SymptomEntry, 'id' | 'timestamp'>) => void;
  updateSymptomEntry: (id: string, updates: Partial<SymptomEntry>) => void;
  removeSymptomEntry: (id: string) => void;

  // Tedavi Geçmişi
  treatmentHistory: TreatmentEntry[];
  addTreatmentEntry: (entry: TreatmentEntry) => void;
  updateTreatmentEntry: (id: string, updates: Partial<TreatmentEntry>) => void;
  removeTreatmentEntry: (id: string) => void;

  // Çevresel Veri (canlı hava/AQI/polen — tahmin yok, yalnızca ölçüm)
  environmental: EnvironmentalData;
  environmentalLoading: boolean;
  refreshEnvironmental: () => void;
  environmentalHistory: EnvironmentalSnapshot[];

  // Ürün Tarayıcı
  scannedProducts: ProductScanResult[];
  addScannedProduct: (prod: ProductScanResult) => void;

  // Kullanıcının kendi tetikleyici günlüğü
  triggerEntries: TriggerEntry[];
  addTriggerEntry: (entry: Omit<TriggerEntry, 'id'>) => void;
  removeTriggerEntry: (id: string) => void;

  // Beslenme: kullanıcının kendi besin/öğün/tarif kayıtları
  foodItems: FoodItem[];
  addFoodItem: (item: Omit<FoodItem, 'id' | 'timesLogged' | 'lastLoggedISO'>) => void;
  updateFoodItem: (id: string, updates: Partial<FoodItem>) => void;
  removeFoodItem: (id: string) => void;
  meals: Meal[];
  addMeal: (meal: Omit<Meal, 'id'>) => void;
  removeMeal: (id: string) => void;
  recipes: Recipe[];
  addRecipe: (recipe: Omit<Recipe, 'id'>) => void;
  removeRecipe: (id: string) => void;

  // Bakım Rutini
  routines: RoutineTask[];
  toggleRoutineTask: (id: string) => void;
  addRoutineTask: (task: Omit<RoutineTask, 'id' | 'order' | 'completed'>) => void;
  removeRoutineTask: (id: string) => void;
  updateRoutineTask: (id: string, updates: Partial<RoutineTask>) => void;
  reorderRoutineTasks: (timeOfDay: RoutineTask['timeOfDay'], orderedIds: string[]) => void;

  // Takvim & Zaman Çizelgesi
  calendarEvents: CalendarEvent[];
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  removeCalendarEvent: (id: string) => void;
  duplicateCalendarEvent: (id: string, newDateISO: string) => void;

  // Sağlık Günlüğü (Klinik Bilgi Merkezi)
  journalEntries: JournalEntry[];
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => void;
  removeJournalEntry: (id: string) => void;

  // Sesli Asistan
  voiceAssistantOpen: boolean;
  setVoiceAssistantOpen: (v: boolean) => void;

  // Loglar
  auditLogs: AuditLogEntry[];
  addAuditLog: (action: string, details: string) => void;

  // Sohbet Asistanı
  chatMessages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  clearChatMessages: () => void;

  // Veri Yönetimi
  clearAllData: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
