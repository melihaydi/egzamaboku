// Netlify Function: Gemini API'ye sunucu tarafında (güvenli) istek atar.
// API anahtarı yalnızca Netlify'ın ortam değişkenlerinde (GEMINI_API_KEY) tutulur;
// tarayıcıya asla gönderilmez. İstemci yalnızca kullanıcının mesajını buraya POST eder.

const MODEL = 'gemini-flash-latest'; // Bu anahtarda 'gemini-2.5-flash' yeni kullanıcılara kapalı (404); Google'ın güncel flash modeline yönlendiren stabil takma ad kullanılıyor.
const TIMEOUT_MS = 15000;

const SYSTEM_INSTRUCTION = `Sen DermIQ uygulamasının egzama/dermatoloji odaklı sohbet asistanısın.
Yalnızca egzama, cilt bakımı, tetikleyiciler, tedaviler (Dupixent, Cibinqo, Siklosporin, Prednizon,
topikal steroidler, kalsinörin inhibitörleri vb.), laboratuvar sonuçları, cilt bariyeri ve genel
dermatoloji konularında Türkçe, kısa ve anlaşılır yanıtlar ver. Kesin tıbbi tanı koyma; ciddi veya
hızla kötüleşen belirtilerde daima bir hekime başvurulmasını öner. Egzama/dermatoloji dışı bir konu
sorulursa, nazikçe yalnızca bu konularda yardımcı olabildiğini belirt.`;

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Yalnızca POST istekleri kabul edilir.' }) };
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
        generationConfig: { maxOutputTokens: 2048, temperature: 0.4 }
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
