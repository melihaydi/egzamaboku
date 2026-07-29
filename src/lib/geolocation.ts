// Kullanıcının gerçek cihaz konumunu (tarayıcı Geolocation API) ve bu koordinatlara karşılık
// gelen okunabilir yer adını (BigDataCloud'un ücretsiz, anahtarsız reverse-geocoding API'si)
// alır. İzin verilmezse, reddedilirse veya API desteklenmiyorsa null döner; çağıran taraf
// sabit bir varsayılan konuma düşer — hava/AQI/polen verisi asla rastgele bir yerle uydurulmaz.

export interface DeviceLocation {
  latitude: number;
  longitude: number;
  name: string;
}

const GEOLOCATION_TIMEOUT_MS = 8000;

function getCoords(): Promise<GeolocationCoordinates | null> {
  return new Promise(resolve => {
    if (!('geolocation' in navigator)) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve(pos.coords),
      () => resolve(null),
      { timeout: GEOLOCATION_TIMEOUT_MS, maximumAge: 10 * 60 * 1000 }
    );
  });
}

async function reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GEOLOCATION_TIMEOUT_MS);
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=tr`,
      { signal: controller.signal }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const parts = [data.locality, data.city || data.principalSubdivision].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getDeviceLocation(): Promise<DeviceLocation | null> {
  const coords = await getCoords();
  if (!coords) return null;

  const name = await reverseGeocode(coords.latitude, coords.longitude);
  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    name: name || `${coords.latitude.toFixed(2)}, ${coords.longitude.toFixed(2)}`
  };
}
