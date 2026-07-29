// İçgörüler Motoru
// Burada hiçbir tahmin/uydurma yapılmaz: yalnızca kullanıcının kendi geçmiş verisi
// (belirti kayıtları, tetikleyici günlüğü, öğün reaksiyonları, fotoğraf analizi,
// gerçek zamanla biriken hava/AQI/polen geçmişi) üzerinde basit istatistiksel
// karşılaştırmalar yapılır. Yeterli örneklem yoksa insight ÜRETİLMEZ.

import type { SymptomEntry, TriggerEntry, Meal, CVAnalysis, EnvironmentalSnapshot } from '../types';

export interface Insight {
  id: string;
  title: string;
  detail: string;
  sampleSize: number;
}

const MIN_GROUP_SIZE = 3;
const MIN_DIFFERENCE = 1.0; // 0-10 skalada anlamlı sayılacak minimum fark

function average(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function symptomAverage(entries: SymptomEntry[], key: keyof Pick<SymptomEntry, 'itching' | 'pain' | 'burning' | 'dryness' | 'cracking' | 'bleeding' | 'sleepImpact'>): number {
  return average(entries.map(e => e[key]));
}

export function buildInsights(params: {
  symptomEntries: SymptomEntry[];
  triggerEntries: TriggerEntry[];
  meals: Meal[];
  cvHistory: CVAnalysis[];
  environmentalHistory: EnvironmentalSnapshot[];
}): Insight[] {
  const { symptomEntries, triggerEntries, meals, cvHistory, environmentalHistory } = params;
  const insights: Insight[] = [];

  // 1) Nem oranı düşükken kaşıntı puanı karşılaştırması (belirti günü + çevre günü eşleşen tarihler)
  const envByDate = new Map(environmentalHistory.map(e => [e.dateISO, e]));
  const matchedSymptomDays = symptomEntries
    .map(s => ({ symptom: s, env: envByDate.get(s.dateISO) }))
    .filter((x): x is { symptom: SymptomEntry; env: EnvironmentalSnapshot } => !!x.env);

  const lowHumidityDays = matchedSymptomDays.filter(x => x.env.humidity < 40);
  const normalHumidityDays = matchedSymptomDays.filter(x => x.env.humidity >= 40);
  if (lowHumidityDays.length >= MIN_GROUP_SIZE && normalHumidityDays.length >= MIN_GROUP_SIZE) {
    const lowAvg = average(lowHumidityDays.map(x => x.symptom.itching));
    const normalAvg = average(normalHumidityDays.map(x => x.symptom.itching));
    if (Math.abs(lowAvg - normalAvg) >= MIN_DIFFERENCE) {
      const worse = lowAvg > normalAvg;
      insights.push({
        id: 'humidity-itching',
        title: worse ? 'Düşük nem günlerinde kaşıntın daha yüksek' : 'Düşük nemde kaşıntın daha düşük çıkıyor',
        detail: `Nemin %40'ın altında olduğu ${lowHumidityDays.length} günde ortalama kaşıntı puanın ${lowAvg.toFixed(1)}/10; nemin normal olduğu ${normalHumidityDays.length} günde ${normalAvg.toFixed(1)}/10.`,
        sampleSize: lowHumidityDays.length + normalHumidityDays.length
      });
    }
  }

  // 2) Yüksek AQI günlerinde kaşıntı
  const highAqiDays = matchedSymptomDays.filter(x => x.env.aqiOverall > 40);
  const lowAqiDays = matchedSymptomDays.filter(x => x.env.aqiOverall <= 40);
  if (highAqiDays.length >= MIN_GROUP_SIZE && lowAqiDays.length >= MIN_GROUP_SIZE) {
    const highAvg = average(highAqiDays.map(x => x.symptom.itching));
    const lowAvg = average(lowAqiDays.map(x => x.symptom.itching));
    if (Math.abs(highAvg - lowAvg) >= MIN_DIFFERENCE) {
      insights.push({
        id: 'aqi-itching',
        title: highAvg > lowAvg ? 'Hava kirliliği yüksekken kaşıntın artıyor' : 'Hava kirliliği ile kaşıntı arasında ters bir örüntü var',
        detail: `AQI'nin 40'ın üzerinde olduğu ${highAqiDays.length} günde ortalama kaşıntı ${highAvg.toFixed(1)}/10; AQI düşükken (${lowAqiDays.length} gün) ${lowAvg.toFixed(1)}/10.`,
        sampleSize: highAqiDays.length + lowAqiDays.length
      });
    }
  }

  // 3) Polen yoğunluğu vs kaşıntı
  const highPollenDays = matchedSymptomDays.filter(x => x.env.pollenTotal > 10);
  const lowPollenDays = matchedSymptomDays.filter(x => x.env.pollenTotal <= 10);
  if (highPollenDays.length >= MIN_GROUP_SIZE && lowPollenDays.length >= MIN_GROUP_SIZE) {
    const highAvg = average(highPollenDays.map(x => x.symptom.itching));
    const lowAvg = average(lowPollenDays.map(x => x.symptom.itching));
    if (Math.abs(highAvg - lowAvg) >= MIN_DIFFERENCE) {
      insights.push({
        id: 'pollen-itching',
        title: highAvg > lowAvg ? 'Polen yoğunken kaşıntın artıyor' : 'Yüksek polen günlerinde kaşıntın daha düşük',
        detail: `Polen yoğunluğunun yüksek olduğu ${highPollenDays.length} günde ortalama kaşıntı ${highAvg.toFixed(1)}/10; düşük olduğu ${lowPollenDays.length} günde ${lowAvg.toFixed(1)}/10.`,
        sampleSize: highPollenDays.length + lowPollenDays.length
      });
    }
  }

  // 4) Uyku etkisi yüksekken ertesi gün genel belirti şiddeti
  const highSleepImpact = symptomEntries.filter(s => s.sleepImpact >= 5);
  const lowSleepImpact = symptomEntries.filter(s => s.sleepImpact < 5);
  if (highSleepImpact.length >= MIN_GROUP_SIZE && lowSleepImpact.length >= MIN_GROUP_SIZE) {
    const highAvg = symptomAverage(highSleepImpact, 'itching');
    const lowAvg = symptomAverage(lowSleepImpact, 'itching');
    if (Math.abs(highAvg - lowAvg) >= MIN_DIFFERENCE) {
      insights.push({
        id: 'sleep-itching',
        title: 'Uykusu bozulan günlerde kaşıntı puanın daha yüksek',
        detail: `Uykuya etkisini 5/10 ve üzeri puanladığın ${highSleepImpact.length} günde ortalama kaşıntı ${highAvg.toFixed(1)}/10; daha az etkilendiğin ${lowSleepImpact.length} günde ${lowAvg.toFixed(1)}/10.`,
        sampleSize: highSleepImpact.length + lowSleepImpact.length
      });
    }
  }

  // 5) Tekrarlayan tetikleyiciler (kendi kayıtların arasında)
  const triggerCounts = new Map<string, number>();
  triggerEntries.forEach(t => {
    const key = t.name.trim().toLowerCase();
    triggerCounts.set(key, (triggerCounts.get(key) || 0) + 1);
  });
  const recurringTriggers = [...triggerCounts.entries()].filter(([, count]) => count >= 2).sort((a, b) => b[1] - a[1]);
  if (recurringTriggers.length > 0) {
    const [name, count] = recurringTriggers[0];
    insights.push({
      id: 'recurring-trigger',
      title: `"${name}" tekrar eden bir tetikleyici olarak kayıtlı`,
      detail: `Tetikleyici günlüğünde bu kaydı ${count} kez ekledin. Bu bir tıbbi tanı değildir; yalnızca kendi girdiğin verilerin bir özetidir.`,
      sampleSize: count
    });
  }

  // 6) Öğün reaksiyonları
  const mealsWithReaction = meals.filter(m => (m.reactionSeverity || 0) > 0);
  if (meals.length >= MIN_GROUP_SIZE && mealsWithReaction.length > 0) {
    const ratio = Math.round((mealsWithReaction.length / meals.length) * 100);
    if (ratio >= 20) {
      insights.push({
        id: 'meal-reactions',
        title: 'Loglanan öğünlerin bir kısmında reaksiyon bildirdin',
        detail: `Kaydettiğin ${meals.length} öğünün ${mealsWithReaction.length} tanesinde (%${ratio}) bir reaksiyon şiddeti girdin. Hangi besinlerin ortak olduğuna Beslenme Asistanı sekmesinden bakabilirsin.`,
        sampleSize: meals.length
      });
    }
  }

  // 7) Fotoğraf analizinde kızarıklık trendi (ilk vs son 3 tarama)
  if (cvHistory.length >= 4) {
    const sorted = [...cvHistory].sort((a, b) => new Date(a.timestamp.replace(',', '')).getTime() - new Date(b.timestamp.replace(',', '')).getTime());
    const firstHalf = sorted.slice(0, Math.ceil(sorted.length / 2));
    const secondHalf = sorted.slice(Math.ceil(sorted.length / 2));
    const firstAvg = average(firstHalf.map(c => c.redness));
    const secondAvg = average(secondHalf.map(c => c.redness));
    if (Math.abs(firstAvg - secondAvg) >= 5) {
      insights.push({
        id: 'cv-redness-trend',
        title: secondAvg < firstAvg ? 'Fotoğraflarda kızarıklık zamanla azalıyor' : 'Fotoğraflarda kızarıklık zamanla artıyor',
        detail: `İlk taramaların ortalama kızarıklığı %${firstAvg.toFixed(0)} iken, son taramalarda %${secondAvg.toFixed(0)}.`,
        sampleSize: sorted.length
      });
    }
  }

  // 8) Haftanın günü örüntüsü
  if (symptomEntries.length >= 7) {
    const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const byDay: Record<number, number[]> = {};
    symptomEntries.forEach(s => {
      const day = new Date(s.dateISO).getDay();
      if (!byDay[day]) byDay[day] = [];
      byDay[day].push(s.itching);
    });
    const dayAverages = Object.entries(byDay)
      .filter(([, vals]) => vals.length >= 2)
      .map(([day, vals]) => ({ day: Number(day), avg: average(vals), count: vals.length }));
    if (dayAverages.length >= 3) {
      const sortedDays = [...dayAverages].sort((a, b) => b.avg - a.avg);
      const worst = sortedDays[0];
      const best = sortedDays[sortedDays.length - 1];
      if (worst.avg - best.avg >= MIN_DIFFERENCE) {
        insights.push({
          id: 'weekday-pattern',
          title: `${dayNames[worst.day]} günleri kaşıntın daha yüksek çıkıyor`,
          detail: `${dayNames[worst.day]} günlerinde (${worst.count} kayıt) ortalama kaşıntı ${worst.avg.toFixed(1)}/10; ${dayNames[best.day]} günlerinde (${best.count} kayıt) ${best.avg.toFixed(1)}/10.`,
          sampleSize: worst.count + best.count
        });
      }
    }
  }

  return insights;
}

export function dataReadiness(params: {
  symptomEntries: SymptomEntry[];
  environmentalHistory: EnvironmentalSnapshot[];
  triggerEntries: TriggerEntry[];
  meals: Meal[];
  cvHistory: CVAnalysis[];
}) {
  return {
    symptomDays: params.symptomEntries.length,
    environmentalDays: params.environmentalHistory.length,
    triggerLogs: params.triggerEntries.length,
    mealLogs: params.meals.length,
    photoScans: params.cvHistory.length
  };
}
