import { describe, it, expect } from 'vitest';
import { buildInsights, dataReadiness } from './insightsEngine';
import type { SymptomEntry, TriggerEntry, Meal, CVAnalysis, EnvironmentalSnapshot } from '../types';

function symptom(overrides: Partial<SymptomEntry> & { dateISO: string }): SymptomEntry {
  return {
    id: `s-${overrides.dateISO}`,
    timestamp: overrides.dateISO,
    itching: 0,
    pain: 0,
    burning: 0,
    dryness: 0,
    cracking: 0,
    bleeding: 0,
    sleepImpact: 0,
    ...overrides
  };
}

function env(overrides: Partial<EnvironmentalSnapshot> & { dateISO: string }): EnvironmentalSnapshot {
  return {
    temperature: 20,
    humidity: 50,
    uvIndex: 3,
    aqiOverall: 20,
    pollenTotal: 5,
    ...overrides
  };
}

function cvAnalysis(overrides: Partial<CVAnalysis> & { id: string; timestamp: string; redness: number }): CVAnalysis {
  return {
    photoUrl: '',
    location: 'Sol Kol',
    scaling: 0,
    swelling: 0,
    crusting: 0,
    oozing: 0,
    pigmentation: 0,
    surfaceAreaCm2: 0,
    confidenceScore: 90,
    infectionRisk: 'Düşük',
    affectedRegions: [],
    reasoning: [],
    notes: '',
    analysisMethod: 'canlı-piksel-analizi',
    ...overrides
  };
}

const emptyParams = {
  symptomEntries: [] as SymptomEntry[],
  triggerEntries: [] as TriggerEntry[],
  meals: [] as Meal[],
  cvHistory: [] as CVAnalysis[],
  environmentalHistory: [] as EnvironmentalSnapshot[]
};

describe('buildInsights', () => {
  it('returns no insights when there is not enough data', () => {
    expect(buildInsights(emptyParams)).toEqual([]);
  });

  it('flags higher itching on low-humidity days once the sample size is met', () => {
    const environmentalHistory: EnvironmentalSnapshot[] = [
      env({ dateISO: '2026-01-01', humidity: 30 }),
      env({ dateISO: '2026-01-02', humidity: 25 }),
      env({ dateISO: '2026-01-03', humidity: 35 }),
      env({ dateISO: '2026-01-04', humidity: 60 }),
      env({ dateISO: '2026-01-05', humidity: 55 }),
      env({ dateISO: '2026-01-06', humidity: 65 })
    ];
    const symptomEntries: SymptomEntry[] = [
      symptom({ dateISO: '2026-01-01', itching: 8 }),
      symptom({ dateISO: '2026-01-02', itching: 9 }),
      symptom({ dateISO: '2026-01-03', itching: 7 }),
      symptom({ dateISO: '2026-01-04', itching: 2 }),
      symptom({ dateISO: '2026-01-05', itching: 3 }),
      symptom({ dateISO: '2026-01-06', itching: 1 })
    ];

    const insights = buildInsights({ ...emptyParams, symptomEntries, environmentalHistory });
    const humidityInsight = insights.find(i => i.id === 'humidity-itching');
    expect(humidityInsight).toBeDefined();
    expect(humidityInsight?.title).toBe('Düşük nem günlerinde kaşıntın daha yüksek');
    expect(humidityInsight?.sampleSize).toBe(6);
  });

  it('does not flag humidity when the difference is below the significance threshold', () => {
    const environmentalHistory: EnvironmentalSnapshot[] = [
      env({ dateISO: '2026-01-01', humidity: 30 }),
      env({ dateISO: '2026-01-02', humidity: 25 }),
      env({ dateISO: '2026-01-03', humidity: 35 }),
      env({ dateISO: '2026-01-04', humidity: 60 }),
      env({ dateISO: '2026-01-05', humidity: 55 }),
      env({ dateISO: '2026-01-06', humidity: 65 })
    ];
    const symptomEntries: SymptomEntry[] = environmentalHistory.map(e => symptom({ dateISO: e.dateISO, itching: 5 }));

    const insights = buildInsights({ ...emptyParams, symptomEntries, environmentalHistory });
    expect(insights.find(i => i.id === 'humidity-itching')).toBeUndefined();
  });

  it('surfaces a recurring trigger once it appears at least twice', () => {
    const triggerEntries: TriggerEntry[] = [
      { id: 't1', name: 'Yün Kazak', category: 'Ürün', dateISO: '2026-01-01', severity: 6, reasonNote: 'kaşıntı arttı' },
      { id: 't2', name: 'yün kazak', category: 'Ürün', dateISO: '2026-01-10', severity: 7, reasonNote: 'tekrar oldu' }
    ];
    const insights = buildInsights({ ...emptyParams, triggerEntries });
    const triggerInsight = insights.find(i => i.id === 'recurring-trigger');
    expect(triggerInsight).toBeDefined();
    expect(triggerInsight?.sampleSize).toBe(2);
  });

  it('flags meal reactions once at least 20% of logged meals have a reaction', () => {
    const meals: Meal[] = [
      { id: 'm1', name: 'Kahvaltı', dateISO: '2026-01-01', foodNames: ['Yumurta'], reactionSeverity: 6 },
      { id: 'm2', name: 'Öğle', dateISO: '2026-01-02', foodNames: ['Tavuk'] },
      { id: 'm3', name: 'Akşam', dateISO: '2026-01-03', foodNames: ['Balık'] }
    ];
    const insights = buildInsights({ ...emptyParams, meals });
    const mealInsight = insights.find(i => i.id === 'meal-reactions');
    expect(mealInsight).toBeDefined();
  });

  it('detects a redness trend across photo analyses', () => {
    const cvHistory: CVAnalysis[] = [
      cvAnalysis({ id: 'c1', timestamp: '2026-01-01, 10:00', redness: 80 }),
      cvAnalysis({ id: 'c2', timestamp: '2026-01-05, 10:00', redness: 75 }),
      cvAnalysis({ id: 'c3', timestamp: '2026-01-10, 10:00', redness: 20 }),
      cvAnalysis({ id: 'c4', timestamp: '2026-01-15, 10:00', redness: 15 })
    ];
    const insights = buildInsights({ ...emptyParams, cvHistory });
    const trendInsight = insights.find(i => i.id === 'cv-redness-trend');
    expect(trendInsight).toBeDefined();
    expect(trendInsight?.title).toBe('Fotoğraflarda kızarıklık zamanla azalıyor');
  });
});

describe('dataReadiness', () => {
  it('reports the raw counts of each data source', () => {
    const readiness = dataReadiness({
      symptomEntries: [symptom({ dateISO: '2026-01-01' })],
      environmentalHistory: [],
      triggerEntries: [],
      meals: [],
      cvHistory: []
    });
    expect(readiness).toEqual({
      symptomDays: 1,
      environmentalDays: 0,
      triggerLogs: 0,
      mealLogs: 0,
      photoScans: 0
    });
  });
});
