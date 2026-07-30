// Netlify Function: Gemini API'ye sunucu tarafında (güvenli) istek atar.
// API anahtarı yalnızca Netlify'ın ortam değişkenlerinde (GEMINI_API_KEY) tutulur;
// tarayıcıya asla gönderilmez. İstemci yalnızca kullanıcının mesajını buraya POST eder.
//
// Artık uygulamanın TEK sohbet motoru burasıdır: yerel anahtar kelime bilgi bankası
// devre dışı bırakıldı, selamlama/teşekkür dışındaki her mesaj doğrudan buraya gelir.

const MODEL = 'gemini-flash-latest'; // Bu anahtarda 'gemini-2.5-flash' yeni kullanıcılara kapalı (404); Google'ın güncel flash modeline yönlendiren stabil takma ad kullanılıyor.
const TIMEOUT_MS = 15000;
const MAX_OUTPUT_TOKENS = 1024; // Daha hızlı yanıt için sınırlı tutulur; sistem talimatı kısa/öz yanıt istiyor.

const SYSTEM_INSTRUCTION = `Sen DermIQ uygulamasının egzama/dermatoloji odaklı sohbet asistanısın.
Egzama, cilt bakımı, tetikleyiciler, tedaviler (Dupixent, Cibinqo, Siklosporin, Prednizon,
topikal steroidler, kalsinörin inhibitörleri vb.), laboratuvar sonuçları, cilt bariyeri ve genel
dermatoloji konularında Türkçe yanıt ver. Yanıtların KISA VE ÖZ olsun: gereksiz giriş/tekrar
cümleleri kullanma, doğrudan konuya gir; genellikle 2-6 cümle yeterlidir, yalnızca gerçekten
karmaşık bir konu (ör. bir ilacın tüm yan etkileri) daha uzun bir yanıt gerektirir.
"Bilmiyorum", "bu konuda bilgim yok" veya benzeri bir ifadeyle ASLA yanıt verme; kapsamındaki
her soru için elindeki en iyi, en güncel bilgiyle yardımcı ol. Kesin tıbbi tanı koyma; ciddi veya
hızla kötüleşen belirtilerde bir hekime başvurulmasını öner ama bunu her cevabın sonuna
tekrarlayan bir şablon haline getirme. Egzama/dermatoloji dışı bir konu sorulursa, nazikçe
yalnızca bu konularda yardımcı olabildiğini belirt.`;

// Fonksiyon "sıcak" kaldığı sürece (aynı çalışma zamanı örneği) IP başına basit bir istek
// sayacı tutar. Bu KESİN bir hız sınırlama değildir (soğuk başlangıçlarda veya birden fazla
// örnekte sıfırlanır) ama URL'yi bulup betikle art arda istek atan sıradan bir kötüye kullanımı
// engellemeye yeter. Gerçek/dağıtık bir hız sınırlama için Netlify Blobs veya harici bir servis
// gerekir; bu uygulamanın ölçeği için bu basit önlem yeterli kabul edildi.
const RATE_LIMIT_WINDOW_MS = 60000;
const RATE_LIMIT_MAX_REQUESTS = 12;
const requestLog = new Map();

function isRateLimited(clientId) {
  const now = Date.now();
  const entry = requestLog.get(clientId);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    requestLog.set(clientId, { windowStart: now, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX_REQUESTS;
}

function isAllowedOrigin(event) {
  const origin = event.headers?.origin || event.headers?.Origin;
  // Origin başlığı yoksa (bazı tarayıcı/istemci senaryolarında aynı-kaynaklı istekler bunu
  // göndermeyebilir) isteği reddetmiyoruz; yalnızca AÇIKÇA farklı bir siteden geldiği
  // belliyse (Origin mevcut ama bilinen alan adlarıyla eşleşmiyorsa) reddediyoruz.
  if (!origin) return true;
  return origin.includes('netlify.app') || origin.includes('localhost') || origin.includes('127.0.0.1');
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Yalnızca POST istekleri kabul edilir.' }) };
  }

  if (!isAllowedOrigin(event)) {
    return { statusCode: 403, body: JSON.stringify({ error: 'Bu kaynaktan isteğe izin verilmiyor.' }) };
  }

  const clientId = event.headers?.['x-nf-client-connection-ip'] || event.headers?.['client-ip'] || 'unknown';
  if (isRateLimited(clientId)) {
    return { statusCode: 429, body: JSON.stringify({ error: 'Çok fazla istek gönderildi. Lütfen biraz sonra tekrar deneyin.' }) };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Sunucu yapılandırması eksik: GEMINI_API_KEY tanımlı değil.' }) };
  }

  let message;
  try {
    const parsed = JSON.parse(event.body || '{}');
    message = parsed.message;
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Geçersiz istek gövdesi.' }) };
  }

  if (!message || typeof message !== 'string' || message.trim().length === 0 || message.length > 2000) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Geçersiz mesaj.' }) };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents: [{ parts: [{ text: message }] }],
        generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS, temperature: 0.4 }
      }),
      signal: controller.signal
    });

    if (!res.ok) {
      return { statusCode: 502, body: JSON.stringify({ error: `Gemini API hatası (${res.status}).` }) };
    }

    const data = await res.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const text = parts.filter((p) => !p.thought && p.text).map((p) => p.text).join('').trim();

    if (!text) {
      return { statusCode: 502, body: JSON.stringify({ error: 'Gemini yanıt üretemedi.' }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    };
  } catch {
    return { statusCode: 504, body: JSON.stringify({ error: 'İstek zaman aşımına uğradı.' }) };
  } finally {
    clearTimeout(timeoutId);
  }
}
