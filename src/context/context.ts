import { createContext } from 'react';
import type {
  CVAnalysis,
  EnvironmentalData,
  FamilyProfile,
  FoodLogItem,
  FlareScoreData,
  ProductScanResult,
  RoutineTask,
  SymptomCorrelation,
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

  // Görsel Analiz
  cvHistory: CVAnalysis[];
  addCVAnalysis: (analysis: CVAnalysis) => void;

  // Tedavi Geçmişi
  treatmentHistory: TreatmentEntry[];
  addTreatmentEntry: (entry: TreatmentEntry) => void;

  // Alevlenme Şiddeti Skoru
  flareScore: FlareScoreData;
  updateFlareFactor: (factorKey: keyof FlareScoreData['factors'], change: number) => void;

  // Çevresel Veri (canlı hava/AQI/polen)
  environmental: EnvironmentalData;
  environmentalLoading: boolean;
  refreshEnvironmental: () => void;

  // Ürün Tarayıcı
  scannedProducts: ProductScanResult[];
  addScannedProduct: (prod: ProductScanResult) => void;

  // Beslenme
  foodLogs: FoodLogItem[];
  addFoodLog: (item: FoodLogItem) => void;
  correlations: SymptomCorrelation[];

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
  removeCalendarEvent: (id: string) => void;

  // Sağlık Günlüğü (Klinik Bilgi Merkezi)
  journalEntries: JournalEntry[];
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => void;
  removeJournalEntry: (id: string) => void;

  // Sesli Asistan
  voiceAssistantOpen: boolean;
  setVoiceAssistantOpen: (v: boolean) => void;

  // Sağlık Eşleşmesi & Akıllı Saat
  healthSyncActive: boolean;
  setHealthSyncActive: (v: boolean) => void;
  wearableWidgetOpen: boolean;
  setWearableWidgetOpen: (v: boolean) => void;

  // Loglar
  auditLogs: AuditLogEntry[];
  addAuditLog: (action: string, details: string) => void;

  // AI Sohbet Asistanı
  chatMessages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  clearChatMessages: () => void;

  // Veri Yönetimi
  clearAllData: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
