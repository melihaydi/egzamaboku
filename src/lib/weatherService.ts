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

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

interface RiskInputs {
  humidity: number;
  uvIndex: number;
  aqi: number;
  pollen: number;
  windSpeed: number;
  precipitationProbability: number;
}

function computeFlareRisk({ humidity, uvIndex, aqi, pollen, windSpeed, precipitationProbability }: RiskInputs): { risk: number; driver: string } {
  let risk = 8;
  const drivers: Array<[number, string]> = [];

  if (humidity < 40) {
    const c = (40 - humidity) * 1.1;
    risk += c;
    drivers.push([c, 'Düşük Nem & Cilt Nem Kaybı']);
  }
  if (aqi > 40) {
    const c = (aqi - 40) * 0.55;
    risk += c;
    drivers.push([c, 'Yüksek Hava Kirliliği']);
  }
  if (pollen > 8) {
    const c = Math.min(28, pollen * 0.7);
    risk += c;
    drivers.push([c, 'Yüksek Polen Yoğunluğu']);
  }
  if (uvIndex > 7) {
    const c = (uvIndex - 7) * 3.2;
    risk += c;
    drivers.push([c, 'Yüksek UV İndeksi']);
  }
  if (windSpeed > 25) {
    const c = (windSpeed - 25) * 0.4;
    risk += c;
    drivers.push([c, 'Kuvvetli Rüzgar & Cilt Kuruması']);
  }
  if (precipitationProbability > 60 && humidity > 75) {
    const c = 6;
    risk += c;
    drivers.push([c, 'Yüksek Nem & Yağış']);
  }

  drivers.sort((a, b) => b[0] - a[0]);
  const primaryDriver = drivers.length > 0 ? drivers[0][1] : 'Dengeli Çevresel Koşullar';

  return { risk: Math.round(clamp(risk, 5, 95)), driver: primaryDriver };
}

const DAY_LABELS = ['Bugün', 'Yarın', '3. Gün'];

export async function fetchEnvironmentalData(
  location: { latitude: number; longitude: number; name: string } = DEFAULT_LOCATION
): Promise<EnvironmentalData> {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&hourly=temperature_2m,relative_humidity_2m,uv_index,wind_speed_10m,precipitation_probability&forecast_days=4&timezone=auto`;
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

  const forecast72h: EnvironmentalData['forecast72h'] = [];
  for (let d = 0; d < 3; d++) {
    const sampleIdx = Math.min(idx + 24 * d, times.length - 1);
    const airSampleIdx = Math.min(sampleIdx, airLen - 1);
    const temp = weather.hourly.temperature_2m[sampleIdx];
    const hum = weather.hourly.relative_humidity_2m[sampleIdx];
    const uv = weather.hourly.uv_index[sampleIdx];
    const wind = weather.hourly.wind_speed_10m[sampleIdx];
    const precip = weather.hourly.precipitation_probability[sampleIdx];
    const aqiVal = air.hourly.european_aqi[airSampleIdx];
    const pollenVal = (air.hourly.birch_pollen[airSampleIdx] || 0) + (air.hourly.grass_pollen[airSampleIdx] || 0) + (air.hourly.ragweed_pollen[airSampleIdx] || 0);

    const { risk, driver } = computeFlareRisk({ humidity: hum, uvIndex: uv, aqi: aqiVal, pollen: pollenVal, windSpeed: wind, precipitationProbability: precip });

    forecast72h.push({
      day: DAY_LABELS[d],
      dateISO: times[sampleIdx].slice(0, 10),
      temp,
      humidity: hum,
      uvIndex: uv,
      aqi: aqiVal,
      flareRisk: risk,
      primaryDriver: driver
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
    precipitationProbability,
    aqi: { overall: aqiOverall, category: getAqiCategory(aqiOverall), pm25, pm10 },
    pollen: { tree: birch, grass, weed: ragweed, overallRisk: pollenRisk },
    forecast72h,
    dataSource: 'canlı-api',
    fetchedAt: new Date().toLocaleString('tr-TR')
  };
}
