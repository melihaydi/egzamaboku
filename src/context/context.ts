import { createContext } from 'react';
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

  // Veri Durumları
  cvHistory: CVAnalysis[];
  addCVAnalysis: (analysis: CVAnalysis) => void;

  treatmentHistory: TreatmentEntry[];
  addTreatmentEntry: (entry: TreatmentEntry) => void;

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

  // AI Sohbet Asistanı
  chatMessages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  clearChatMessages: () => void;

  // Veri Yönetimi
  clearAllData: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
