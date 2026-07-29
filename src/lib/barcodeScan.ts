// Barkod tarama yardımcıları:
// 1) Tarayıcının yerleşik BarcodeDetector API'si ile kamera görüntüsünden gerçek zamanlı
//    barkod okuma (Chrome/Edge/Android destekler; desteklenmeyen tarayıcılarda elle giriş kullanılır).
// 2) Open Food Facts / Open Beauty Facts üzerinden barkod numarasıyla gerçek ürün/içerik
//    bilgisi arama — anahtar gerektirmeyen ücretsiz API'ler.

export interface BarcodeProductInfo {
  productName: string;
  brand: string;
  ingredientsText: string;
}

interface DetectedBarcode {
  rawValue: string;
}

interface BarcodeDetectorLike {
  detect(source: CanvasImageSource): Promise<DetectedBarcode[]>;
}

declare global {
  interface Window {
    BarcodeDetector?: new (options: { formats: string[] }) => BarcodeDetectorLike;
  }
}

export function isBarcodeDetectionSupported(): boolean {
  return typeof window !== 'undefined' && 'BarcodeDetector' in window;
}

export function createBarcodeDetector(): BarcodeDetectorLike | null {
  if (!isBarcodeDetectionSupported() || !window.BarcodeDetector) return null;
  return new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'] });
}

const LOOKUP_TIMEOUT_MS = 8000;

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function lookupInDatabase(baseUrl: string, barcode: string): Promise<BarcodeProductInfo | null> {
  try {
    const res = await fetchWithTimeout(`${baseUrl}/api/v2/product/${encodeURIComponent(barcode)}.json`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 1 || !data.product) return null;
    const product = data.product;
    const ingredientsText: string = product.ingredients_text_tr || product.ingredients_text || product.ingredients_text_en || '';
    if (!ingredientsText.trim()) return null;
    return {
      productName: product.product_name || product.product_name_tr || product.product_name_en || 'Bilinmeyen Ürün',
      brand: product.brands || 'Bilinmeyen Marka',
      ingredientsText
    };
  } catch {
    return null;
  }
}

export async function lookupBarcodeProduct(barcode: string): Promise<BarcodeProductInfo | null> {
  const beauty = await lookupInDatabase('https://world.openbeautyfacts.org', barcode);
  if (beauty) return beauty;
  return lookupInDatabase('https://world.openfoodfacts.org', barcode);
}
