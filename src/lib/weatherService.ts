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

export async function fetchEnvironmentalData(
  location: { latitude: number; longitude: number; name: string } = DEFAULT_LOCATION
): Promise<EnvironmentalData> {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&hourly=temperature_2m,relative_humidity_2m,uv_index,wind_speed_10m,precipitation_probability,surface_pressure&forecast_days=4&timezone=auto`;
  const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${location.latitude}&longitude=${location.longitude}&hourly=pm10,pm2_5,european_aqi,birch_pollen,grass_pollen,ragweed_pollen&forecast_days=4&timezone=auto`;

  const [weatherRes, airRes] = await Promise.all([
    fetch(weatherUrl),
    fetch(airUrl)
  ]);

  if (!weatherRes.ok || !airRes.ok) {
    throw new Error('Hava durumu / hava kalitesi verisi alınamadı');
  }

  const weather = await weatherRes.json();
  const air = await airRes.json();

  const times: string[] = weather.hourly.time;
  const now = new Date();
  let idx = times.findIndex(t => new Date(t) >= now);
  if (idx === -1) idx = 0;

  const temperature = weather.hourly.temperature_2m[idx];
  const humidity = weather.hourly.relative_humidity_2m[idx];
  const uvIndex = weather.hourly.uv_index[idx];
  const windSpeed = weather.hourly.wind_speed_10m[idx];
  const pressure = weather.hourly.surface_pressure[idx];
  const precipitationProbability = weather.hourly.precipitation_probability[idx];

  const airLen = air.hourly.european_aqi.length;
  const airIdx = Math.min(idx, airLen - 1);
  const pm25 = air.hourly.pm2_5[airIdx];
  const pm10 = air.hourly.pm10[airIdx];
  const aqiOverall = air.hourly.european_aqi[airIdx];
  const birch = air.hourly.birch_pollen[airIdx] || 0;
  const grass = air.hourly.grass_pollen[airIdx] || 0;
  const ragweed = air.hourly.ragweed_pollen[airIdx] || 0;
  const pollenTotal = birch + grass + ragweed;
  const pollenRisk: EnvironmentalData['pollen']['overallRisk'] =
    pollenTotal > 40 ? 'Çok Yüksek' : pollenTotal > 20 ? 'Yüksek' : pollenTotal > 5 ? 'Orta' : 'Düşük';

  const forecast: EnvironmentalData['forecast'] = [];
  for (let d = 0; d < 3; d++) {
    const sampleIdx = Math.min(idx + 24 * d, times.length - 1);
    const airSampleIdx = Math.min(sampleIdx, airLen - 1);

    forecast.push({
      day: DAY_LABELS[d],
      dateISO: times[sampleIdx].slice(0, 10),
      temp: weather.hourly.temperature_2m[sampleIdx],
      humidity: weather.hourly.relative_humidity_2m[sampleIdx],
      uvIndex: weather.hourly.uv_index[sampleIdx],
      aqi: air.hourly.european_aqi[airSampleIdx],
      pressure: weather.hourly.surface_pressure[sampleIdx]
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
