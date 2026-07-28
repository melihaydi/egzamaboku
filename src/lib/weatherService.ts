import type { EnvironmentalData } from '../types';

// Bahçelievler, İstanbul
export const DEFAULT_LOCATION = { name: 'Bahçelievler, İstanbul', latitude: 41.0011, longitude: 28.8474 };

function getAqiCategory(aqi: number): EnvironmentalData['aqi']['category'] {
  if (aqi <= 20) return 'İyi';
  if (aqi <= 40) return 'Orta';
  if (aqi <= 60) return 'Hassas Gruplar İçin Riskli';
  if (aqi <= 80) return 'Sağlıksız';
  return 'Çok Sağlıksız';
}

const DAY_LABELS = ['Bugün', 'Yarın', '3. Gün'];

// "YYYY-MM-DD" biçimindeki bir tarihe, saat dilimi belirsizliğine yol açmadan (yalnızca
// takvim aritmetiği olarak) gün ekler. new Date(isoString) KULLANMAZ; tarayıcının yerel
// saat dilimi varsayımı yüzünden yanlış gün/saat seçilmesine (ve dolayısıyla API'den doğru
// geldiği halde ekranda yanlış hava durumu değerleri gösterilmesine) neden olabilirdi.
function addDaysToDateString(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const utcMs = Date.UTC(y, m - 1, d) + days * 86400000;
  const dt = new Date(utcMs);
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`;
}

// Belirli bir takvim gününe ait saatlik veriden temsili bir saat (öğlen 14:00, yoksa o günün
// ilk bulunan saati) seçer. Tamamen dize (string) karşılaştırmasıyla çalışır.
function findHourIndexForDate(times: string[], dateStr: string): number {
  const exact = times.findIndex(t => t.startsWith(dateStr) && t.slice(11, 13) === '14');
  if (exact !== -1) return exact;
  return times.findIndex(t => t.startsWith(dateStr));
}

export async function fetchEnvironmentalData(
  location: { latitude: number; longitude: number; name: string } = DEFAULT_LOCATION
): Promise<EnvironmentalData> {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,uv_index,wind_speed_10m,surface_pressure,precipitation_probability&hourly=temperature_2m,relative_humidity_2m,uv_index,surface_pressure&forecast_days=4&timezone=auto`;
  const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${location.latitude}&longitude=${location.longitude}&current=pm10,pm2_5,european_aqi,birch_pollen,grass_pollen,ragweed_pollen&hourly=pm10,pm2_5,european_aqi&forecast_days=4&timezone=auto`;

  const [weatherRes, airRes] = await Promise.all([
    fetch(weatherUrl),
    fetch(airUrl)
  ]);

  if (!weatherRes.ok || !airRes.ok) {
    throw new Error('Hava durumu / hava kalitesi verisi alınamadı');
  }

  const weather = await weatherRes.json();
  const air = await airRes.json();

  // "current" alanı, konumun kendi saat dilimine göre sunucu tarafında doğru hesaplanır;
  // tarayıcının saat dilimiyle karşılaştırma yapılmadığı için her zaman doğrudur.
  const temperature = weather.current.temperature_2m;
  const humidity = weather.current.relative_humidity_2m;
  const uvIndex = weather.current.uv_index;
  const windSpeed = weather.current.wind_speed_10m;
  const pressure = weather.current.surface_pressure;
  const precipitationProbability = weather.current.precipitation_probability;
  const todayDateStr: string = weather.current.time.slice(0, 10);

  const pm25 = air.current.pm2_5;
  const pm10 = air.current.pm10;
  const aqiOverall = air.current.european_aqi;
  const birch = air.current.birch_pollen || 0;
  const grass = air.current.grass_pollen || 0;
  const ragweed = air.current.ragweed_pollen || 0;
  const pollenTotal = birch + grass + ragweed;
  const pollenRisk: EnvironmentalData['pollen']['overallRisk'] =
    pollenTotal > 40 ? 'Çok Yüksek' : pollenTotal > 20 ? 'Yüksek' : pollenTotal > 5 ? 'Orta' : 'Düşük';

  const weatherTimes: string[] = weather.hourly.time;
  const airTimes: string[] = air.hourly.time;

  const forecast: EnvironmentalData['forecast'] = [];
  for (let d = 0; d < 3; d++) {
    const targetDate = addDaysToDateString(todayDateStr, d);
    const wIdx = findHourIndexForDate(weatherTimes, targetDate);
    const aIdx = findHourIndexForDate(airTimes, targetDate);

    forecast.push({
      day: DAY_LABELS[d],
      dateISO: targetDate,
      temp: wIdx !== -1 ? weather.hourly.temperature_2m[wIdx] : temperature,
      humidity: wIdx !== -1 ? weather.hourly.relative_humidity_2m[wIdx] : humidity,
      uvIndex: wIdx !== -1 ? weather.hourly.uv_index[wIdx] : uvIndex,
      aqi: aIdx !== -1 ? air.hourly.european_aqi[aIdx] : aqiOverall,
      pressure: wIdx !== -1 ? weather.hourly.surface_pressure[wIdx] : pressure
    });
  }

  return {
    city: location.name,
    latitude: location.latitude,
    longitude: location.longitude,
    temperature,
    humidity,
    uvIndex,
    windSpeed,
    pressure,
    precipitationProbability,
    aqi: { overall: aqiOverall, category: getAqiCategory(aqiOverall), pm25, pm10 },
    pollen: { tree: birch, grass, weed: ragweed, overallRisk: pollenRisk },
    moldDataAvailable: false,
    forecast,
    dataSource: 'canlı-api',
    fetchedAt: new Date().toLocaleString('tr-TR')
  };
}
